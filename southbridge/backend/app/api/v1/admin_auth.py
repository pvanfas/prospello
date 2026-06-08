from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserType
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.crud.user import get_user_by_username_or_email_or_phone
from app.crud.auth import (
    create_refresh_token as store_refresh_token,
    is_token_valid,
    delete_refresh_token,
    delete_user_refresh_tokens,
)
from app.schemas.auth import (
    TokenPair,
    LoginRequest,
    RefreshRequest,
    MessageResponse,
)
from app.schemas.user import SignUpResponse
from app.api.deps import get_current_user

admin_auth_router = APIRouter(tags=["admin-auth"])




# ===== ADMIN AUTH ENDPOINTS =====
@admin_auth_router.post("/login", response_model=SignUpResponse)
def admin_login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Admin login endpoint using same authentication system as regular users"""
    
    # Find user by username, email, or phone
    user = get_user_by_username_or_email_or_phone(db, login_data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is admin
    if user.role != UserType.ADMIN:
        print("not admin ")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is deactivated",
        )
    
    # Create tokens using same system as regular auth
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Store refresh token in database
    store_refresh_token(db, refresh_token, str(user.id))
    print(f"Admin logged in: {user.username}")
    
    return SignUpResponse(user=user, access_token=access_token, refresh_token=refresh_token)

@admin_auth_router.post("/refresh", response_model=TokenPair)
def admin_refresh_token(refresh_data: RefreshRequest, db: Session = Depends(get_db)):
    """
    Admin token refresh endpoint using same system as regular auth.
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

    # Verify the user is still an admin
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # Create new token pair
    access_token = create_access_token(data={"sub": user_id})
    new_refresh_token = create_refresh_token(data={"sub": user_id})

    # Replace old refresh token with new one
    delete_refresh_token(db, refresh_data.refresh_token)
    store_refresh_token(db, new_refresh_token, str(user_id))

    return TokenPair(access_token=access_token, refresh_token=new_refresh_token)


@admin_auth_router.post("/logout", response_model=MessageResponse)
def admin_logout(refresh_data: RefreshRequest, db: Session = Depends(get_db)):
    """
    Admin logout endpoint using same system as regular auth.
    Revokes refresh token by removing it from database.
    """
    # Delete/revoke the refresh token
    success = delete_refresh_token(db, refresh_data.refresh_token)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid refresh token"
        )

    return MessageResponse(message="Successfully logged out")


@admin_auth_router.post("/logout-all", response_model=MessageResponse)
def admin_logout_all_devices(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Admin logout from all devices.
    Revokes all refresh tokens for the current admin user.
    """
    # Verify current user is admin
    if current_user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    deleted_count = delete_user_refresh_tokens(db, current_user.id)

    return MessageResponse(
        message=f"Successfully logged out from {deleted_count} devices"
    )

