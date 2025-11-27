from pydantic import BaseModel, Field, model_validator
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from app.models.load import LoadSource, LoadStatus, GoodsCategory
from uuid import UUID


class LoadBase(BaseModel):
    origin: str
    destination: str
    origin_place: Optional[str] = None
    destination_place: Optional[str] = None
    goods_type: str
    weight: Decimal
    dimensions: Optional[str] = None
    special_instructions: Optional[str] = None
    vehicle_types: Optional[List[str]] = ["any"]  # Array of vehicle types
    source_type: Optional[LoadSource] = LoadSource.TEXT
    source_content: Optional[str] = None


class LoadCreate(LoadBase):
    """Schema for creating a new load"""
    image_base64: Optional[str] = None  # For base64 encoded image
    image_filename: Optional[str] = None 
    category: Optional[GoodsCategory] = None


class LoadUpdate(BaseModel):
    """Schema for updating an existing load"""

    origin: Optional[str] = None
    destination: Optional[str] = None
    goods_type: Optional[str] = None
    weight: Optional[Decimal] = None
    dimensions: Optional[str] = None
    special_instructions: Optional[str] = None
    vehicle_types: Optional[List[str]] = None
    category: Optional[GoodsCategory] = None


class Load(LoadBase):
    """Schema for load response"""

    id: UUID
    shipper_id: Optional[int] = None
    broker_id: Optional[int] = None
    category: GoodsCategory
    status: LoadStatus
    verified: bool
    vehicle_types: Optional[List[str]] = ["any"]
    created_at: datetime
    updated_at: datetime
    image_url : Optional[str] = None
    image : Optional[str] = None  # Base64 or URL, depending on use case
    created_by: Optional[str] = None
    
    # Optional nested relationships
    bid_count: Optional[int] = None
    lowest_bid: Optional[Decimal] = None

    class Config:
        from_attributes = True


class LoadWithBids(Load):
    """Load schema with bid information"""

    bids: Optional[list] = None
    accepted_bid_id: Optional[str] = None
    assigned_driver_id: Optional[int] = None


# Voice/Image input schemas
class VoiceLoadRequest(BaseModel):
    """Schema for voice-to-load conversion"""

    text: str  # Transcribed text from voice
    language: Optional[str] = "auto"  # Source language


class ImageLoadRequest(BaseModel):
    """Schema for image-to-load conversion"""

    image_url: Optional[str] = None
    image_base64: Optional[str] = None


# Response schemas
class LoadCreationResponse(BaseModel):
    """Response after load creation"""

    load: Load
    message: str = "Load created successfully"
    extracted_from: Optional[str] = None  # "voice", "text", "image"


class VoiceLoadRequest(BaseModel):
    """Schema for voice-to-load conversion"""

    text: str
    language: Optional[str] = "auto"  # Source language


class LoadSchema(BaseModel):
    id: str
    origin: str
    destination: str
    goods_type: str
    weight: float
    dimensions: Optional[str]
    special_instructions: Optional[str]
    vehicle_types: Optional[List[str]] = ["any"]  # Array of Only vehicle types
    category: GoodsCategory
    status: LoadStatus
    verified: bool
    created_at: datetime
    updated_at: datetime
    bid_count: Optional[int] = None
    creator_verified: Optional[bool] = False  # Whether shipper/broker is verified
    image_url: Optional[str] = None  # Add image_url field
    time_posted: Optional[str] = None  # Add time_posted field

    class Config:
        from_attributes = True


class LoadResponse(BaseModel):
    loads: List[LoadSchema]


class ImageLoadRequest(BaseModel):
    """Schema for image-to-load conversion"""

    image_url: Optional[str] = None
    image_base64: Optional[str] = None

    @model_validator(mode="before")
    def check_one(cls, values):
        """Ensure at least one input method is provided"""
        if not values.get("image_url") and not values.get("image_base64"):
            raise ValueError("Either 'image_url' or 'image_base64' must be provided")
        return values


class LoadCreationResponse(BaseModel):
    """Response after load creation"""

    load: Load
    message: str = "Load created successfully"
    extracted_from: Optional[str] = None  # "text", "voice", "image"


class LoadDetails(BaseModel):
    goods_type: str
    weight: Optional[float]
    origin: str
    destination: str
    special_instructions: Optional[str]
    dimensions: Optional[str]
    vehicle_types: Optional[List[str]] = ["any"]  # Add vehicle types field
    source_type: Optional[LoadSource] = None
    source_content: Optional[str] = None
    category: GoodsCategory
    shipper_id: Optional[int] = None
    broker_id: Optional[int] = None
    
class NearbyLoadResponse(BaseModel):
    id: UUID
    origin: str
    destination: str
    goods_type: str
    weight: float
    dimensions: Optional[str]
    special_instructions: Optional[str]
    category: Optional[GoodsCategory]
    status: Optional[LoadStatus] = Field(..., alias="status", description="Load status in lowercase")
    verified: Optional[bool]
    created_at: datetime
    updated_at: datetime

    class Config:
        validate_by_name = True
        json_encoders = {
            LoadStatus: lambda v: v.value.lower() if isinstance(v, LoadStatus) else v,
        }

    
class DeleteMultipleLoadsRequest(BaseModel):
    load_ids: List[str]