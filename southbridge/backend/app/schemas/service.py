from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List
from decimal import Decimal


class NearbyServiceRequest(BaseModel):
    latitude: float
    longitude: float
    radius: float = 20.0
    service_type: str = "all"


class ServiceCategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    is_emergency: bool = False
    is_active: bool = True
    
    class Config:
        from_attributes = True


class ServiceCategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    is_emergency: bool = False
    is_active: bool = True


class ServiceBookingCreate(BaseModel):
    booked_category_id: int
    service_description: Optional[str] = None
    vehicle_details: Optional[str] = None
    service_latitude: Optional[float] = None
    service_longitude: Optional[float] = None
    service_address: Optional[str] = None
    scheduled_at: str  # ISO datetime string
    is_emergency: bool = False
    estimated_cost: Optional[Decimal] = None


class ServiceBookingResponse(BaseModel):
    id: int
    booking_id: str
    booked_category_id: int
    user_id: UUID
    provider_id: int
    service_description: Optional[str] = None
    vehicle_details: Optional[str] = None
    service_latitude: Optional[float] = None
    service_longitude: Optional[float] = None
    service_address: Optional[str] = None
    scheduled_at: str
    requested_at: str
    status: str
    is_emergency: bool
    estimated_cost: Optional[Decimal] = None
    final_cost: Optional[Decimal] = None
    emergency_surcharge: Decimal = 0
    
    class Config:
        from_attributes = True


class ServiceProviderCategoryUpdate(BaseModel):
    current_status: Optional[str] = None
    price_from: Optional[Decimal] = None
    price_to: Optional[Decimal] = None
    emergency_available: Optional[bool] = None


class ServiceProviderResponse(BaseModel):
    id: int
    business_name: str
    business_type: Optional[str] = None
    business_phone: Optional[str] = None
    shop_location_latitude: Optional[float] = None
    shop_location_longitude: Optional[float] = None
    shop_location_address: Optional[str] = None
    max_service_radius: int = 50
    rating: float = 0.0
    total_services: int = 0
    completion_rate: float = 0.0
    response_time_avg: Optional[int] = None
    base_price: Optional[Decimal] = None
    emergency_surcharge: Decimal = 0
    
    class Config:
        from_attributes = True


class ServiceProviderCategoryDetail(BaseModel):
    id: int
    service_provider_id: int
    category_id: int
    current_status: str
    price_from: Optional[Decimal] = None
    price_to: Optional[Decimal] = None
    emergency_available: bool
    created_at: str
    category: ServiceCategoryResponse
    service_provider: ServiceProviderResponse
    
    class Config:
        from_attributes = True


class ServiceProviderCategoryResponse(BaseModel):
    id: int
    current_status: str
    price_from: Optional[Decimal] = None
    price_to: Optional[Decimal] = None
    emergency_available: bool = False
    
    class Config:
        from_attributes = True


class NearbyServiceResponse(BaseModel):
    service_provider: ServiceProviderResponse
    provider_category: ServiceProviderCategoryResponse
    category: ServiceCategoryResponse
    distance: float
    
    class Config:
        from_attributes = True