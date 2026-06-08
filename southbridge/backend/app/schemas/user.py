from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum
from uuid import UUID
from .auth import TokenPair

class UserType(str, Enum):
    SHIPPER = "shipper"
    DRIVER = "driver"
    BROKER = "broker"
    SERVICE_PROVIDER = "service_provider"
    ADMIN = "admin"

class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: Optional[str]
    username: str
    phone_number: str

class UserCreate(UserBase):
    """Schema for user registration - similar to DRF's create serializer"""
    role: UserType
    refercode : Optional[str]
    # password: str
    otp : str

class UserCreateWithProfile(UserBase):
    """Schema for user registration with profile data in single request"""
    role: UserType
    refercode : Optional[str]
    otp : str
    # Profile data based on role
    profileData: Optional[dict] = None

class UserUpdate(BaseModel):
    """Schema for user updates"""
    email: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    """
    Schema for user response - similar to DRF's read serializer.
    This is what gets returned in API responses.
    """
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    role : UserType
    refercode: Optional[str] = None
    
    class Config:
        from_attributes = True

class SignUpResponse(BaseModel):
    user: User
    access_token: str
    refresh_token: str

class OtpResponse(BaseModel):
    otp : str