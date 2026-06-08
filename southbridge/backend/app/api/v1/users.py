"""
User routes - examples of protected endpoints.
Similar to DRF's protected views with IsAuthenticated permission.
"""
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, get_current_active_user
from app.schemas.user import User as UserSchema
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user's profile.
    Protected route example - requires valid access token.
    Similar to DRF view with IsAuthenticated permission.
    """
    print(f"🔍 DEBUG: get_current_user_info - User ID: {current_user.id}")
    print(f"🔍 DEBUG: get_current_user_info - Username: {current_user.username}")
    print(f"🔍 DEBUG: get_current_user_info - Refercode: {current_user.refercode}")
    print(f"🔍 DEBUG: get_current_user_info - Full user object: {current_user}")
    return current_user

@router.get("/profile", response_model=UserSchema)
def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Another protected route example.
    Uses get_current_active_user for additional active user check.
    """
    print(f"🔍 DEBUG: get_user_profile - User ID: {current_user.id}")
    print(f"🔍 DEBUG: get_user_profile - Username: {current_user.username}")
    print(f"🔍 DEBUG: get_user_profile - Refercode: {current_user.refercode}")
    print(f"🔍 DEBUG: get_user_profile - Full user object: {current_user}")
    return current_user
