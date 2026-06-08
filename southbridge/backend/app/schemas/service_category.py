from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ServiceCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Service category name")
    slug: Optional[str] = Field(None, min_length=1, max_length=50, description="URL-friendly slug for the category (auto-generated if not provided)")
    description: Optional[str] = Field(None, max_length=500, description="Service category description")
    icon_url: Optional[str] = Field(None, description="URL to category icon")
    is_emergency: bool = Field(False, description="Whether this is an emergency service")
    is_active: bool = Field(True, description="Whether the category is active")

class ServiceCategoryCreate(ServiceCategoryBase):
    pass

class ServiceCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    icon_url: Optional[str] = None
    is_emergency: Optional[bool] = None
    is_active: Optional[bool] = None

class ServiceCategoryResponse(ServiceCategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ServiceCategoryListResponse(BaseModel):
    categories: list[ServiceCategoryResponse]
    total: int
    page: int
    limit: int

