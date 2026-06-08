# app/schemas/profile.py - Enhanced driver schemas
from pydantic import BaseModel, field_validator as validator
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from app.models.user import DriverStatus, VerificationStatus
import re

# Certificate schema for embedding in profile responses
class CertificateInfo(BaseModel):
    """Minimal certificate info for profile responses"""
    id: int
    certificate_type: str
    certificate: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ===== ENHANCED DRIVER SCHEMAS =====

class DriverBase(BaseModel):
    license_number: str
    vehicle_type: str
    max_weight_capacity: Decimal
    vehicle_registration: Optional[str] = None
    insurance_number: Optional[str] = None

class DriverCreate(DriverBase):
    """Schema for creating driver profile with capacity info"""
    max_volume_capacity: Optional[Decimal] = None
    preferred_routes: Optional[str] = None
    upi_id: Optional[str] = None   # e.g., 9876543210@upi
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder_name: Optional[str] = None
    vehicle_image : Optional[str] = None  # Base64 encoded image
    
    @validator('license_number')
    def validate_license_number(cls, v):
        if not v or len(v.strip()) < 5:
            raise ValueError('License number must be at least 5 characters long')
        return v.strip().upper()
    
    @validator('vehicle_type')
    def validate_vehicle_type(cls, v):
        valid_types = [
            'truck', 'trailer', 'container', 'flatbed', 'tanker', 
            'refrigerated', 'van', 'pickup', 'auto_rickshaw', 'tempo', 'other'
        ]
        if v.lower() not in valid_types:
            raise ValueError(f'Vehicle type must be one of: {", ".join(valid_types)}')
        return v.lower()
    
    @validator('max_weight_capacity')
    def validate_capacity(cls, v):
        if v <= 0:
            raise ValueError('Weight capacity must be greater than 0')
        if v > 50000:  # 50 tons max
            raise ValueError('Weight capacity cannot exceed 50,000 kg')
        return v
    
    @validator('vehicle_registration')
    def validate_registration(cls, v):
        if v:
            # Indian vehicle registration pattern: XX00XX0000 or XX-00-XX-0000
            pattern = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$'
            v_clean = v.replace('-', '').replace(' ', '').upper()
            if not re.match(pattern, v_clean):
                raise ValueError('Invalid vehicle registration format')
            return v_clean
        return v

class DriverUpdate(BaseModel):
    """Schema for updating driver profile"""
    license_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    max_weight_capacity: Optional[Decimal] = None
    max_volume_capacity: Optional[Decimal] = None
    vehicle_registration: Optional[str] = None
    insurance_number: Optional[str] = None
    preferred_routes: Optional[str] = None
    
    # Payment fields
    payment_method: Optional[str] = None  # Frontend sends this but we ignore it
    upi_id: Optional[str] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder_name: Optional[str] = None
    
    @validator('license_number')
    def validate_license_number(cls, v):
        if v and len(v.strip()) < 5:
            raise ValueError('License number must be at least 5 characters long')
        return v.strip().upper() if v else v
    
    @validator('vehicle_type')
    def validate_vehicle_type(cls, v):
        if v:
            valid_types = [
                'truck', 'trailer', 'container', 'flatbed', 'tanker', 
                'refrigerated', 'van', 'pickup', 'auto_rickshaw', 'tempo', 'other'
            ]
            if v.lower() not in valid_types:
                raise ValueError(f'Vehicle type must be one of: {", ".join(valid_types)}')
            return v.lower()
        return v
    
    @validator('max_weight_capacity')
    def validate_capacity(cls, v):
        if v is not None:
            if v <= 0:
                raise ValueError('Weight capacity must be greater than 0')
            if v > 50000:
                raise ValueError('Weight capacity cannot exceed 50,000 kg')
        return v
    
    @validator('vehicle_registration')
    def validate_registration(cls, v):
        if v:
            # Indian vehicle registration pattern: XX00XX0000 or XX-00-XX-0000
            pattern = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$'
            v_clean = v.replace('-', '').replace(' ', '').upper()
            if not re.match(pattern, v_clean):
                raise ValueError('Invalid vehicle registration format')
            return v_clean
        return v
    
    @validator('ifsc_code')
    def validate_ifsc_code(cls, v):
        if v:
            # IFSC code pattern: 4 letters, 0, 6 alphanumeric
            pattern = r'^[A-Z]{4}0[A-Z0-9]{6}$'
            v_clean = v.strip().upper()
            if not re.match(pattern, v_clean):
                raise ValueError('Invalid IFSC code format')
            return v_clean
        return v

class DriverResponse(DriverBase):
    """Schema for driver profile response with enhanced info"""
    id: int
    user_id: UUID
    refercode: Optional[str] = None
    
    # User information
    username: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    
    # Capacity and Load Info
    current_load_weight: Decimal
    available_capacity: Decimal
    max_volume_capacity: Optional[Decimal]
    
    # Location
    current_latitude: Optional[float]
    current_longitude: Optional[float]
    current_city: Optional[str]
    current_state: Optional[str]
    last_location_update: Optional[datetime]
    
    # Status and Verification
    status: DriverStatus
    verification_status: VerificationStatus
    
    # Performance
    rating: float
    total_trips: int
    
    # Preferences
    preferred_routes: Optional[str]
    available_until: Optional[datetime]
    vehicle_image_url: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    
    # Payment information
    upi_id: Optional[str]
    bank_account_number: Optional[str]
    ifsc_code: Optional[str]
    account_holder_name: Optional[str]
    
    class Config:
        from_attributes = True

# ===== SHIPPER SCHEMAS (Updated) =====

class ShipperBase(BaseModel):
    company_name: str
    

class ShipperCreate(ShipperBase):
    """Schema for creating shipper profile"""
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    
    @validator('company_name')
    def validate_company_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Company name must be at least 2 characters long')
        return v.strip()
    
    @validator('gst_number')
    def validate_gst_number(cls, v):
        if v:
            # GST format: 15 characters, alphanumeric
            gst_pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$'
            v = v.strip().upper()
            if not re.match(gst_pattern, v):
                raise ValueError('Invalid GST number format')
        return v
    
    @validator('pan_number')
    def validate_pan_number(cls, v):
        if v:
            # PAN format: 10 characters, ABCDE1234F
            pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]$'
            v = v.strip().upper()
            if not re.match(pan_pattern, v):
                raise ValueError('Invalid PAN number format')
        return v

class ShipperUpdate(BaseModel):
    """Schema for updating shipper profile"""
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    
    @validator('company_name')
    def validate_company_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Company name must be at least 2 characters long')
        return v.strip() if v else v
    
    @validator('gst_number')
    def validate_gst_number(cls, v):
        if v:
            gst_pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$'
            v = v.strip().upper()
            if not re.match(gst_pattern, v):
                raise ValueError('Invalid GST number format')
        return v
    
    @validator('pan_number')
    def validate_pan_number(cls, v):
        if v:
            pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]$'
            v = v.strip().upper()
            if not re.match(pan_pattern, v):
                raise ValueError('Invalid PAN number format')
        return v

class ShipperResponse(ShipperBase):
    """Schema for shipper profile response"""
    id: int
    user_id: UUID
    gst_number: Optional[str]
    pan_number: Optional[str]
    status: VerificationStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ShipperResponseWithCertificates(ShipperBase):
    """Schema for shipper profile response with certificates"""
    id: int
    user_id: UUID
    gst_number: Optional[str]
    pan_number: Optional[str]
    status: VerificationStatus
    created_at: datetime
    updated_at: datetime
    certificates: List[CertificateInfo] = []
    
    class Config:
        from_attributes = True

# ===== BROKER SCHEMAS (Updated) =====

class BrokerBase(BaseModel):
    agency_name: str
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None

class BrokerCreate(BrokerBase):
    """Schema for creating broker profile"""
    
    
    @validator('agency_name')
    def validate_agency_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Agency name must be at least 2 characters long')
        return v.strip() if v else v
    
    @validator('gst_number')
    def validate_gst_number(cls, v):
        if v:
            # GST format: 15 characters, alphanumeric
            gst_pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$'
            v = v.strip().upper()
            if not re.match(gst_pattern, v):
                raise ValueError('Invalid GST number format')
        return v
    
    @validator('pan_number')
    def validate_pan_number(cls, v):
        if v:
            # PAN format: 10 characters, ABCDE1234F
            pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]$'
            v = v.strip().upper()
            if not re.match(pan_pattern, v):
                raise ValueError('Invalid PAN number format')
        return v

class BrokerUpdate(BaseModel):
    """Schema for updating broker profile"""
    agency_name: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    
    @validator('agency_name')
    def validate_agency_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Agency name must be at least 2 characters long')
        return v.strip() if v else v
    
    @validator('gst_number')
    def validate_gst_number(cls, v):
        if v:
            gst_pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$'
            v = v.strip().upper()
            if not re.match(gst_pattern, v):
                raise ValueError('Invalid GST number format')
        return v
    
    @validator('pan_number')
    def validate_pan_number(cls, v):
        if v:
            pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]$'
            v = v.strip().upper()
            if not re.match(pan_pattern, v):
                raise ValueError('Invalid PAN number format')
        return v

class BrokerResponse(BrokerBase):
    """Schema for broker profile response"""
    id: int
    user_id: UUID
    status: VerificationStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BrokerResponseWithCertificates(BrokerBase):
    """Schema for broker profile response with certificates"""
    id: int
    user_id: UUID
    status: VerificationStatus
    created_at: datetime
    updated_at: datetime
    certificates: List[CertificateInfo] = []
    
    class Config:
        from_attributes = True

# ===== SERVICE PROVIDER SCHEMAS =====

class ServiceProviderBase(BaseModel):
    business_name: str
    business_type: Optional[str] = None
    business_phone: Optional[str] = None
    license_number: Optional[str] = None
    gst_number: Optional[str] = None

class ServiceProviderCreate(ServiceProviderBase):
    """Schema for creating service provider profile"""
    shop_location_latitude: Optional[float] = None
    shop_location_longitude: Optional[float] = None
    shop_location_address: Optional[str] = None
    max_service_radius: int = 50
    base_price: Optional[Decimal] = None
    emergency_surcharge: Decimal = 0
    
    # Google Places integration fields
    place_id: Optional[str] = None  # Google Places ID
    formatted_address: Optional[str] = None  # Full formatted address from Google
    address_components: Optional[dict] = None  # Detailed address components
    google_place_name: Optional[str] = None  # Place name from Google
    
    @validator('business_name')
    def validate_business_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Business name must be at least 2 characters long')
        return v.strip()
    
    @validator('business_phone')
    def validate_business_phone(cls, v):
        if v:
            # Indian phone number pattern
            phone_pattern = r'^[6-9]\d{9}$'
            v_clean = v.replace('+91', '').replace(' ', '').replace('-', '')
            if not re.match(phone_pattern, v_clean):
                raise ValueError('Invalid Indian phone number format')
            return v_clean
        return v
    
    @validator('gst_number')
    def validate_gst_number(cls, v):
        if v:
            gst_pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$'
            v = v.strip().upper()
            if not re.match(gst_pattern, v):
                raise ValueError('Invalid GST number format')
        return v

class ServiceProviderUpdate(BaseModel):
    """Schema for updating service provider profile"""
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_phone: Optional[str] = None
    license_number: Optional[str] = None
    gst_number: Optional[str] = None
    shop_location_latitude: Optional[float] = None
    shop_location_longitude: Optional[float] = None
    shop_location_address: Optional[str] = None
    max_service_radius: Optional[int] = None
    base_price: Optional[Decimal] = None
    emergency_surcharge: Optional[Decimal] = None
    
    # Google Places integration fields
    place_id: Optional[str] = None
    formatted_address: Optional[str] = None
    address_components: Optional[dict] = None
    google_place_name: Optional[str] = None
    
    @validator('business_name')
    def validate_business_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Business name must be at least 2 characters long')
        return v.strip() if v else v
    
    @validator('business_phone')
    def validate_business_phone(cls, v):
        if v:
            phone_pattern = r'^[6-9]\d{9}$'
            v_clean = v.replace('+91', '').replace(' ', '').replace('-', '')
            if not re.match(phone_pattern, v_clean):
                raise ValueError('Invalid Indian phone number format')
            return v_clean
        return v
    
    @validator('gst_number')
    def validate_gst_number(cls, v):
        if v:
            gst_pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$'
            v = v.strip().upper()
            if not re.match(gst_pattern, v):
                raise ValueError('Invalid GST number format')
        return v

class ServiceProviderResponse(ServiceProviderBase):
    """Schema for service provider profile response with comprehensive data"""
    id: int
    user_id: UUID
    
    # User information
    username: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    refercode: Optional[str] = None
    
    # Business details
    business_type: Optional[str] = None
    business_phone: Optional[str] = None
    license_number: Optional[str] = None
    gst_number: Optional[str] = None
    
    # Location information
    shop_location_latitude: Optional[float] = None
    shop_location_longitude: Optional[float] = None
    shop_location_address: Optional[str] = None
    max_service_radius: int = 50
    
    # Performance metrics
    rating: float = 0.0
    total_services: int = 0
    completion_rate: float = 0.0
    response_time_avg: Optional[int] = None
    
    # Financial
    base_price: Optional[Decimal] = None
    emergency_surcharge: Decimal = 0
    
    # Status
    verification_status: VerificationStatus
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ServiceProviderProfileResponse(BaseModel):
    """Comprehensive service provider profile combining User and ServiceProvider data"""
    # User information
    user_id: UUID
    username: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    refercode: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    
    # Service provider information
    service_provider: ServiceProviderResponse
    
    # Current location (if available)
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    current_city: Optional[str] = None
    current_state: Optional[str] = None
    last_location_update: Optional[datetime] = None
    
    # Profile completion status
    profile_complete: bool
    missing_fields: List[str] = []
    
    class Config:
        from_attributes = True

class LocationUpdateRequest(BaseModel):
    """Schema for updating service provider location"""
    latitude: float
    longitude: float
    city: Optional[str] = None
    state: Optional[str] = None
    
    @validator('latitude')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v
    
    @validator('longitude')
    def validate_longitude(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v

class GooglePlaceRequest(BaseModel):
    """Schema for Google Places autocomplete selection"""
    place_id: str
    formatted_address: str
    latitude: float
    longitude: float
    place_name: Optional[str] = None
    address_components: Optional[dict] = None
    
    @validator('place_id')
    def validate_place_id(cls, v):
        if not v or len(v.strip()) < 5:
            raise ValueError('Place ID must be at least 5 characters long')
        return v.strip()
    
    @validator('latitude')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v
    
    @validator('longitude')
    def validate_longitude(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v

class MapLocationRequest(BaseModel):
    """Schema for map-based location selection"""
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    
    @validator('latitude')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v
    
    @validator('longitude')
    def validate_longitude(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v

class LocationResponse(BaseModel):
    """Schema for location response"""
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    place_id: Optional[str] = None
    formatted_address: Optional[str] = None
    last_updated: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ===== COMBINED SCHEMAS =====

class ProfileStatusResponse(BaseModel):
    """Schema for profile completion status"""
    user_role: str
    profile_complete: bool
    profile_data: Optional[dict] = None