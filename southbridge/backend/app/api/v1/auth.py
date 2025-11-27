"""
Authentication routes - similar to DRF's authentication views.
Handles signup, login, token refresh, and logout.
"""
from datetime import datetime, timedelta, timezone
from random import randint
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.crud.user import (
    create_signup_otp,
    create_user,
    create_user_with_profile,
    get_user_by_username_or_email_or_phone,
    get_user_by_username,
    get_user_by_number,
    verify_signup_otp,
)
from app.crud.auth import (
    create_refresh_token as store_refresh_token,
    is_token_valid,
    delete_refresh_token,
    delete_user_refresh_tokens,
    verify_otp,
)
from app.schemas.user import OtpResponse, UserCreate, UserCreateWithProfile, SignUpResponse, User as UserSchema
from app.schemas.auth import (
    TokenPair,
    LoginRequest,
    RefreshRequest,
    MessageResponse,
    OTPRequest,
    SendOtpRequest

)
from app.api.deps import get_current_user
from app.models.user import Otp, User
from app.services.twilio import send_otp

router = APIRouter()


@router.post("/send-otp/",status_code=status.HTTP_200_OK)
def send_signup_otp(user_data :SendOtpRequest,db :Session = Depends(get_db)):
    """Send otp for a phone number"""
    phone_number = user_data.phone_number
    user = get_user_by_number(db, phone_number)
    if user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User already exists"
        )
        
    otp = randint(100000, 999999)
    otp_expiration = datetime.now(timezone.utc) + timedelta(minutes=5)
    try:
        
        otp_entry = create_signup_otp(db, phone_number, str(otp), otp_expiration)
    except Exception as e:
        print(e)
        print("failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create OTP"
        )
    try:
        send_otp(phone_number, otp)
        return {"message": "OTP sent successfully"}
    except ValueError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )


@router.post("/signup/", response_model=SignUpResponse, status_code=status.HTTP_201_CREATED)
def signup_with_otp(user_data: dict, db: Session = Depends(get_db)):
    """
    User registration endpoint with profile creation in single request.
    """
    if not verify_signup_otp(db, user_data.get('phone_number'), user_data.get('otp')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP"
        )

    # Create new user with profile
    user = create_user_with_profile(db, user_data)
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return SignUpResponse(user=user, access_token=access_token, refresh_token=refresh_token)


@router.post("/send-login-otp/")
def send_login_otp(request: SendOtpRequest, db: Session = Depends(get_db)):
    """Send OTP for user login"""
    phone_number = request.phone_number
    user = get_user_by_number(db, phone_number)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    otp = randint(100000, 999999)
    otp_expiration = datetime.now(timezone.utc) + timedelta(minutes=5)
    try:
        user.otp = str(otp)
        user.otp_expiration = otp_expiration
        db.commit()
        
        otp_entry = create_signup_otp(db, phone_number, str(otp), otp_expiration)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create OTP"
        )
    try:
        send_otp(phone_number, otp)
        return {"message": "OTP sent successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )


@router.post("/login/otp/", response_model=SignUpResponse)
def login_with_otp(otp_data: OTPRequest, db: Session = Depends(get_db)):
    """
    User login endpoint using OTP.
    """
    user = get_user_by_number(db, otp_data.phone_number)
    if not user or not verify_otp(db, otp_data.phone_number, otp_data.otp):
        print("Invalid OTP")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP"
        )

    if not user.is_active:
        print("User account is inactive")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is inactive"
        )

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Store refresh token in database
    store_refresh_token(db, refresh_token, str(user.id))

    return SignUpResponse(user=user, access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenPair)
def refresh_token(refresh_data: RefreshRequest, db: Session = Depends(get_db)):
    """
    Token refresh endpoint.
    Similar to SimpleJWT's TokenRefreshView.
    Generates new access token using valid refresh token.
    """
    # Verify refresh token format
    payload = verify_token(refresh_data.refresh_token, "refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    # Check if refresh token exists in database (not revoked)
    if not is_token_valid(db, refresh_data.refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or expired",
        )

    # Get user ID from token
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )

    # Create new token pair
    access_token = create_access_token(data={"sub": user_id})
    new_refresh_token = create_refresh_token(data={"sub": user_id})

    # Store new refresh token (this will automatically clean up old tokens for the user)
    store_refresh_token(db, new_refresh_token, str(user_id))

    return TokenPair(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout", response_model=MessageResponse)
def logout(refresh_data: RefreshRequest, db: Session = Depends(get_db)):
    """
    Logout endpoint.
    Similar to SimpleJWT's logout by blacklisting the refresh token.
    Revokes refresh token by removing it from database.
    """
    # Delete/revoke the refresh token
    success = delete_refresh_token(db, refresh_data.refresh_token)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid refresh token"
        )

    return MessageResponse(message="Successfully logged out")


@router.post("/logout-all", response_model=MessageResponse)
def logout_all_devices(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Logout from all devices.
    Revokes all refresh tokens for the current user.
    """
    deleted_count = delete_user_refresh_tokens(db, current_user.id)

    return MessageResponse(
        message=f"Successfully logged out from {deleted_count} devices"
    )



