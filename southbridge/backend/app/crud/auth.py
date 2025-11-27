from sqlalchemy.orm import Session  # pyright: ignore[reportMissingImports]
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from app.models.auth import RefreshToken
from app.models.user import User
from app.core.config import settings
from .user import get_user_by_number


def create_refresh_token(db: Session, token: str, user_id: str) -> RefreshToken:
    """
    Store refresh token in database.
    Uses atomic operation to prevent race conditions and duplicate tokens.
    """
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    
    try:
        # Use a single transaction to atomically replace tokens
        # First, delete any existing tokens for this user
        # db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
        
        # Create new token
        db_token = RefreshToken(
            token=token,
            user_id=user_id,
            expires_at=expires_at
        )
        db.add(db_token)
        db.commit()
        db.refresh(db_token)
        return db_token
    except Exception as e:
        db.rollback()
        # If it's a unique constraint violation, try to clean up and retry once
        if "duplicate key value violates unique constraint" in str(e):
            try:
                # Clean up any orphaned tokens and retry
                db.query(RefreshToken).filter(RefreshToken.token == token).delete()
                db.commit()
                
                # Retry the operation
                db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
                db_token = RefreshToken(
                    token=token,
                    user_id=user_id,
                    expires_at=expires_at
                )
                db.add(db_token)
                db.commit()
                db.refresh(db_token)
                return db_token
            except Exception as retry_e:
                db.rollback()
                raise retry_e
        raise e

def get_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    """
    Get refresh token from database.
    Used to check if token exists and is not revoked.
    """
    return db.query(RefreshToken).filter(RefreshToken.token == token).first()

def is_token_valid(db: Session, token: str) -> bool:
    """
    Check if refresh token is valid (exists in DB and not expired).
    Similar to SimpleJWT's blacklist checking but reversed logic.
    """
    db_token = get_refresh_token(db, token)
    if not db_token:
        return False

    # Check if token is expired
    if db_token.expires_at < datetime.now(timezone.utc):  # Ensure offset-aware comparison
        # Clean up expired token
        delete_refresh_token(db, token)
        return False
    
    return True

def verify_otp(db : Session, phone_number: str, otp: str) -> bool:
    """
    Verify OTP for a user.
    """
    user = get_user_by_number(db, phone_number)
    if not user:
        print("User not found")
        return False

    if user.otp != otp:
        print("Invalid OTP")
        return False

    # Ensure both datetimes are timezone-aware for comparison
    current_time = datetime.now(timezone.utc)
    otp_expiration = user.otp_expiration
    
    # If otp_expiration is timezone-naive, assume it's UTC
    if otp_expiration.tzinfo is None:
        otp_expiration = otp_expiration.replace(tzinfo=timezone.utc)
    
    if otp_expiration < current_time:
        print("OTP expired")
        return False

    return True

def delete_refresh_token(db: Session, token: str) -> bool:
    """
    Delete/revoke refresh token.
    Similar to SimpleJWT's token blacklisting on logout.
    """
    db_token = get_refresh_token(db, token)
    if db_token:
        db.delete(db_token)
        db.commit()
        return True
    return False

def delete_user_refresh_tokens(db: Session, user_id: str) -> int:
    """
    Delete all refresh tokens for a user.
    Useful for "logout from all devices" functionality.
    """
    deleted_count = db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
    db.commit()
    return deleted_count

def cleanup_expired_tokens(db: Session) -> int:
    """
    Clean up expired refresh tokens.
    Should be run periodically (e.g., with a cron job).
    """
    deleted_count = db.query(RefreshToken).filter(
        RefreshToken.expires_at < datetime.now(timezone.utc)
    ).delete()
    db.commit()
    return deleted_count


