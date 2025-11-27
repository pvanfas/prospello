from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from uuid import UUID
from app.models.user import UserType
from app.models.load import LoadStatus
from app.models.bid import BidStatus
from app.models.order import OrderStatus
from app.models.payment import PaymentStatus

# ===== BASE SCHEMAS =====
class AdminUserBase(BaseModel):
    username: str
    email: str
    phone_number: str
    role: UserType
    is_active: bool = True

class AdminUserCreate(AdminUserBase):
    password: str
    
    # Driver specific fields
    driver_license: Optional[str] = None
    vehicle_type: Optional[str] = None
    
    # Shipper specific fields
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None

class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[UserType] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    
    # Driver specific fields
    driver_license: Optional[str] = None
    vehicle_type: Optional[str] = None
    
    # Shipper specific fields
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    
    # Broker specific fields
    agency_name: Optional[str] = None

class AdminUserResponse(AdminUserBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Driver specific fields
    driver_license: Optional[str] = None
    vehicle_type: Optional[str] = None
    
    # Shipper specific fields
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    
    # Broker specific fields
    agency_name: Optional[str] = None

    class Config:
        from_attributes = True

# ===== LOAD SCHEMAS =====
class AdminLoadBase(BaseModel):
    origin: str
    destination: str
    goods_type: str
    weight: float
    dimensions: Optional[str] = None
    special_instructions: Optional[str] = None
    status: LoadStatus = LoadStatus.POSTED

class AdminLoadCreate(AdminLoadBase):
    shipper_id: int

class AdminLoadUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    goods_type: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    special_instructions: Optional[str] = None
    status: Optional[LoadStatus] = None

class AdminLoadResponse(AdminLoadBase):
    id: str
    shipper_id: Optional[int] = None
    broker_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    image: Optional[str] = None
    image_path: Optional[str] = None
    
    # Additional load fields
    category: Optional[str] = None
    bid_count: Optional[int] = 0
    lowest_bid: Optional[float] = None
    verified: Optional[bool] = False
    
    # Related data
    shipper_name: Optional[str] = None
    shipper_phone: Optional[str] = None
    broker_name: Optional[str] = None
    broker_phone: Optional[str] = None
    creator_type: Optional[str] = None  # "Shipper" or "Broker"
    creator_name: Optional[str] = None
    creator_phone: Optional[str] = None
    total_bids: Optional[int] = 0
    accepted_bid_id: Optional[str] = None

    class Config:
        from_attributes = True

# ===== BID SCHEMAS =====
class AdminBidBase(BaseModel):
    amount: float
    notes: Optional[str] = None
    status: BidStatus = BidStatus.PENDING

class AdminBidCreate(AdminBidBase):
    load_id: int
    driver_id: int

class AdminBidUpdate(BaseModel):
    amount: Optional[float] = None
    notes: Optional[str] = None
    status: Optional[BidStatus] = None

class AdminBidResponse(AdminBidBase):
    id: int
    load_id: int
    driver_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Related data
    load_title: Optional[str] = None
    driver_name: Optional[str] = None

    class Config:
        from_attributes = True

# ===== ORDER SCHEMAS =====
class AdminOrderBase(BaseModel):
    status: OrderStatus
    total_amount: float
    pickup_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None

class AdminOrderCreate(AdminOrderBase):
    load_id: int
    driver_id: int
    shipper_id: int

class AdminOrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    total_amount: Optional[float] = None
    pickup_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None

class AdminOrderResponse(AdminOrderBase):
    id: int
    order_number: Optional[str] = None
    load_id: UUID
    driver_id: Optional[int] = None
    shipper_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    # Related data
    load_title: Optional[str] = None
    driver_name: Optional[str] = None
    shipper_name: Optional[str] = None
    driver_phone: Optional[str] = None

    class Config:
        from_attributes = True

# ===== PAYMENT SCHEMAS =====
class AdminPaymentBase(BaseModel):
    amount: float
    payment_method: str
    status: PaymentStatus
    transaction_id: Optional[str] = None

class AdminPaymentCreate(AdminPaymentBase):
    order_id: UUID

class AdminPaymentUpdate(BaseModel):
    amount: Optional[float] = None
    payment_method: Optional[str] = None
    status: Optional[PaymentStatus] = None
    transaction_id: Optional[str] = None

class AdminPaymentResponse(AdminPaymentBase):
    id: int
    order_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Related data
    order_status: Optional[str] = None
    customer_name: Optional[str] = None

    class Config:
        from_attributes = True

# ===== DASHBOARD SCHEMAS =====
class AdminStatsResponse(BaseModel):
    total_users: int
    total_drivers: int
    total_shippers: int
    total_brokers: int
    total_loads: int
    total_bids: int
    total_orders: int
    total_payments: int
    
    # Additional stats
    active_loads: int
    pending_bids: int
    completed_orders: int
    total_revenue: float

# ===== SHIPPER SCHEMAS =====
class AdminShipperBase(BaseModel):
    company_name: str
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None

class AdminShipperCreate(AdminShipperBase):
    """Schema for creating shipper via admin"""
    username: str
    email: str
    phone_number: str
    password: str

class AdminShipperUpdate(BaseModel):
    """Schema for updating shipper via admin"""
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None

class AdminShipperResponse(AdminShipperBase):
    """Schema for shipper response in admin panel"""
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # User details
    username: str
    email: str
    phone_number: str
    is_active: bool
    status: str
    
    # Related counts
    total_loads: Optional[int] = 0
    total_orders: Optional[int] = 0
    
    class Config:
        from_attributes = True

class AdminShipperDetailResponse(AdminShipperResponse):
    """Detailed shipper response with additional information"""
    # User creation date
    user_created_at: datetime
    
    # Recent activity
    last_login: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    
    # Load statistics
    active_loads: Optional[int] = 0
    completed_loads: Optional[int] = 0
    total_revenue: Optional[float] = 0.0

# ===== DRIVER SCHEMAS =====
class AdminDriverBase(BaseModel):
    license_number: str
    vehicle_type: str
    max_weight_capacity: float
    vehicle_registration: Optional[str] = None
    insurance_number: Optional[str] = None
    upi_id: Optional[str] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder_name: Optional[str] = None

class AdminDriverCreate(AdminDriverBase):
    """Schema for creating driver via admin"""
    username: str
    email: str
    phone_number: str
    password: str
    max_volume_capacity: Optional[float] = None
    preferred_routes: Optional[str] = None
    vehicle_image: Optional[str] = None  # Base64 encoded image

class AdminDriverUpdate(BaseModel):
    """Schema for updating driver via admin"""
    license_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    max_weight_capacity: Optional[float] = None
    max_volume_capacity: Optional[float] = None
    vehicle_registration: Optional[str] = None
    insurance_number: Optional[str] = None
    preferred_routes: Optional[str] = None
    upi_id: Optional[str] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None

class AdminDriverResponse(AdminDriverBase):
    """Schema for driver response in admin panel"""
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # User details
    username: str
    email: str
    phone_number: str
    is_active: bool
    
    # Driver specific fields
    current_load_weight: float
    available_capacity: float
    max_volume_capacity: Optional[float]
    current_latitude: Optional[float]
    current_longitude: Optional[float]
    current_city: Optional[str]
    current_state: Optional[str]
    last_location_update: Optional[datetime]
    status: str
    verification_status: str
    vehicle_image_url: Optional[str]
    rating: float
    total_trips: int
    preferred_routes: Optional[str]
    available_until: Optional[datetime]
    
    # Related counts
    total_bids: Optional[int] = 0
    total_orders: Optional[int] = 0
    
    class Config:
        from_attributes = True

class AdminDriverDetailResponse(AdminDriverResponse):
    """Detailed driver response with additional information"""
    # User creation date
    user_created_at: datetime
    
    # Recent activity
    last_login: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    
    # Performance statistics
    active_orders: Optional[int] = 0
    completed_orders: Optional[int] = 0
    total_earnings: Optional[float] = 0.0
    average_rating: Optional[float] = 0.0

# ===== LOAD SCHEMAS =====
class AdminLoadBase(BaseModel):
    origin: str
    destination: str
    goods_type: str
    weight: float
    dimensions: Optional[str] = None
    special_instructions: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    source_type: Optional[str] = "text"
    source_content: Optional[str] = None
    category: Optional[str] = "general"
    verified: Optional[bool] = False

class AdminLoadCreate(AdminLoadBase):
    """Schema for creating load via admin"""
    shipper_id: Optional[int] = None
    broker_id: Optional[int] = None
    status: Optional[str] = "posted"

class AdminLoadUpdate(BaseModel):
    """Schema for updating load via admin"""
    origin: Optional[str] = None
    destination: Optional[str] = None
    goods_type: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    special_instructions: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    source_type: Optional[str] = None
    source_content: Optional[str] = None
    category: Optional[str] = None
    verified: Optional[bool] = None
    status: Optional[str] = None
    shipper_id: Optional[int] = None
    broker_id: Optional[int] = None
    assigned_driver_id: Optional[int] = None

class AdminLoadResponse(AdminLoadBase):
    """Schema for load response in admin panel"""
    id: str
    shipper_id: Optional[int] = None
    broker_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Load creator details
    shipper_name: Optional[str] = None
    broker_name: Optional[str] = None
    creator_verified: Optional[bool] = False  # Whether shipper/broker is verified
    
    # Load status and bidding
    status: str
    bid_count: int
    lowest_bid: Optional[float] = None
    accepted_bid_id: Optional[str] = None
    assigned_driver_id: Optional[int] = None
    
    # Related counts
    total_bids: Optional[int] = 0
    total_orders: Optional[int] = 0
    
    class Config:
        from_attributes = True

class AdminLoadDetailResponse(AdminLoadResponse):
    """Detailed load response with additional information"""
    # Load creator details
    shipper_company: Optional[str] = None
    broker_agency: Optional[str] = None
    
    # Driver details if assigned
    assigned_driver_name: Optional[str] = None
    assigned_driver_phone: Optional[str] = None
    
    # Bidding statistics
    active_bids: Optional[int] = 0
    completed_orders: Optional[int] = 0
    total_revenue: Optional[float] = 0.0
    
    # Timestamps
    bidding_started_at: Optional[datetime] = None
    bidding_ended_at: Optional[datetime] = None
    delivery_expected_at: Optional[datetime] = None

# ===== PAYMENT SCHEMAS =====
class AdminPaymentBase(BaseModel):
    amount: float
    currency: str = "INR"
    status: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

class AdminPaymentCreate(AdminPaymentBase):
    """Schema for creating payment via admin"""
    order_id: UUID
    authorized_at: Optional[datetime] = None
    captured_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None

class AdminPaymentUpdate(BaseModel):
    """Schema for updating payment via admin"""
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    authorized_at: Optional[datetime] = None
    captured_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None

class AdminPaymentResponse(AdminPaymentBase):
    """Schema for payment response in admin panel"""
    id: int
    uuid: str
    order_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    authorized_at: Optional[datetime] = None
    captured_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    
    # Order details
    order_details: Optional[dict] = None
    
    class Config:
        from_attributes = True

class AdminPaymentDetailResponse(AdminPaymentResponse):
    """Detailed payment response with additional information"""
    # Order information
    order_origin: Optional[str] = None
    order_destination: Optional[str] = None
    order_goods_type: Optional[str] = None
    
    # Driver information
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    
    # Shipper information
    shipper_name: Optional[str] = None
    shipper_phone: Optional[str] = None
    
    # Payment statistics
    total_payouts: Optional[int] = 0
    successful_payouts: Optional[int] = 0
    failed_payouts: Optional[int] = 0
    total_payout_amount: Optional[float] = 0.0

# ===== PAYOUT SCHEMAS =====
class AdminPayoutBase(BaseModel):
    amount: float
    currency: str = "INR"
    mode: str
    status: str
    razorpay_payout_id: Optional[str] = None

class AdminPayoutCreate(AdminPayoutBase):
    """Schema for creating payout via admin"""
    payment_id: int
    driver_id: int
    failure_reason: Optional[str] = None

class AdminPayoutUpdate(BaseModel):
    """Schema for updating payout via admin"""
    amount: Optional[float] = None
    currency: Optional[str] = None
    mode: Optional[str] = None
    status: Optional[str] = None
    razorpay_payout_id: Optional[str] = None
    failure_reason: Optional[str] = None

class AdminPayoutResponse(AdminPayoutBase):
    """Schema for payout response in admin panel"""
    id: int
    uuid: str
    payment_id: int
    driver_id: int
    created_at: datetime
    processed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    
    # Driver details
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    
    # Payment details
    payment_amount: Optional[float] = None
    payment_status: Optional[str] = None
    
    class Config:
        from_attributes = True

class AdminPayoutDetailResponse(AdminPayoutResponse):
    """Detailed payout response with additional information"""
    # Driver information
    driver_license: Optional[str] = None
    driver_vehicle_type: Optional[str] = None
    
    # Order information
    order_origin: Optional[str] = None
    order_destination: Optional[str] = None
    order_goods_type: Optional[str] = None
    
    # Shipper information
    shipper_name: Optional[str] = None
    shipper_company: Optional[str] = None

# ===== BROKER SCHEMAS =====
class AdminBrokerBase(BaseModel):
    agency_name: str
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None

class AdminBrokerCreate(AdminBrokerBase):
    """Schema for creating broker via admin"""
    username: str
    email: str
    phone_number: str
    password: str

class AdminBrokerUpdate(BaseModel):
    """Schema for updating broker via admin"""
    agency_name: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None

class AdminBrokerResponse(AdminBrokerBase):
    """Schema for broker response in admin panel"""
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # User details
    username: str
    email: str
    phone_number: str
    is_active: bool
    status: str
    
    # Related counts
    total_loads: Optional[int] = 0
    total_orders: Optional[int] = 0
    
    class Config:
        from_attributes = True

class AdminBrokerDetailResponse(AdminBrokerResponse):
    """Detailed broker response with additional information"""
    # User creation date
    user_created_at: datetime
    
    # Recent activity
    last_login: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    
    # Load statistics
    active_loads: Optional[int] = 0
    completed_loads: Optional[int] = 0
    total_revenue: Optional[float] = 0.0

# ===== DETAILED RESPONSE SCHEMAS =====
class AdminUserDetailResponse(AdminUserResponse):
    # Related counts
    total_loads: Optional[int] = 0
    total_bids: Optional[int] = 0
    total_orders: Optional[int] = 0

class AdminLoadDetailResponse(AdminLoadResponse):
    # Shipper details
    shipper_name: Optional[str] = None
    shipper_company: Optional[str] = None
    shipper_phone: Optional[str] = None
    
    # Bids details
    bids: List[AdminBidResponse] = []
    accepted_bid: Optional[AdminBidResponse] = None
    
    # Order details
    order: Optional[AdminOrderResponse] = None

class AdminOrderDetailResponse(AdminOrderResponse):
    # Load details
    load_title: Optional[str] = None
    load_description: Optional[str] = None
    load_weight: Optional[float] = None
    load_price: Optional[float] = None
    
    # Driver details
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    driver_vehicle: Optional[str] = None
    
    # Shipper details
    shipper_name: Optional[str] = None
    shipper_company: Optional[str] = None
    shipper_phone: Optional[str] = None
    
    # Payment details
    payments: List[AdminPaymentResponse] = []
    total_paid: Optional[float] = 0.0
    pending_amount: Optional[float] = 0.0
