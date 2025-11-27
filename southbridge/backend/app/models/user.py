import random
import string
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float,DECIMAL,ForeignKey, func,Enum as SQLEnum
from sqlalchemy import event
from sqlalchemy.orm import relationship, object_session

from app.core.database import Base
from enum import Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from zoneinfo import ZoneInfo
import uuid

from sqlalchemy.event import listen
from sqlalchemy import update

class UserType(str, Enum):
    SHIPPER = "shipper"
    DRIVER = "driver"
    BROKER = "broker"
    SERVICE_PROVIDER = "service_provider"
    ADMIN = "admin"
    
class DriverStatus(str, Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"
    ON_TRIP = "on_trip"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    username = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), onupdate=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    otp = Column(String, nullable=True)
    otp_expiration = Column(DateTime, nullable=True)
    role = Column(
        SQLEnum(UserType, name="user_roles", native_enum=False), 
        default=UserType.SHIPPER,
        nullable=False
    )
    refercode = Column(String, nullable=True)
    refered_by = Column(UUID, ForeignKey("users.id"), nullable=True)


    # Relationships
    # refercode = relationship
    service_provider = relationship("ServiceProvider", back_populates="user", uselist=False)
    driver = relationship("Driver", back_populates="user", uselist=False)
    shipper = relationship("Shipper", back_populates="user", uselist=False)
    refresh_tokens = relationship("RefreshToken", back_populates="user")
    broker = relationship("Broker", back_populates="user", uselist=False)
    bank_details = relationship("UserBankDetails", back_populates="user", uselist=False)
    # wallet = relationship("Wallet", back_populates="user", uselist=False)
    certificates = relationship("Certificate", back_populates="user")
    
    # Service marketplace relationships
    service_bookings = relationship("ServiceBooking", back_populates="user")
    service_reviews = relationship("ServiceReview", back_populates="user")
    

class Driver(Base):
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), onupdate=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID, ForeignKey("users.id"), unique=True)
    
    # Basic Info
    license_number = Column(String, unique=True)
    vehicle_type = Column(String)
    
    # Load Capacity & Limits
    max_weight_capacity = Column(DECIMAL, nullable=False, default=1000)  # kg
    current_load_weight = Column(DECIMAL, default=0)  # Current load weight
    max_volume_capacity = Column(DECIMAL, nullable=True)  # cubic meters
    
    # Location Tracking
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    current_city = Column(String, nullable=True)
    current_state = Column(String, nullable=True)
    last_location_update = Column(DateTime, nullable=True)
    

    # Status & Verification
    status = Column(
        SQLEnum(DriverStatus, name="driver_status", native_enum=False),
        default=DriverStatus.OFFLINE,
        nullable=False
    )
    verification_status = Column(
        SQLEnum(VerificationStatus, name="verification_status", native_enum=False),
        default=VerificationStatus.PENDING,
        nullable=False
    )
    vehicle_image_url = Column(String, nullable=True)  # URL to vehicle image
    
    # Additional verification fields
    vehicle_registration = Column(String, nullable=True)
    insurance_number = Column(String, nullable=True)
    rating = Column(Float, default=0.0)  # Average rating
    total_trips = Column(Integer, default=0)
    
    # Availability preferences
    preferred_routes = Column(String, nullable=True)  
    available_until = Column(DateTime, nullable=True)  
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    #payment 
    # upi_id = Column(String, nullable=True)   # e.g., 9876543210@upi
    # bank_account_number = Column(String, nullable=True)
    # ifsc_code = Column(String, nullable=True)
    # account_holder_name = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="driver")
    bids = relationship("Bid", back_populates="driver")
    driver_routes = relationship("DriverRoute", back_populates="driver_rel", cascade="all, delete-orphan")
    locations = relationship("DriverLocation", back_populates="driver", cascade="all, delete-orphan")
    # payments = relationship("Payment", back_populates="driver")

    @property
    def available_capacity(self):
        """Calculate remaining weight capacity"""
        return self.max_weight_capacity - self.current_load_weight
    
    @property
    def is_available_for_load(self):
        """Check if driver is available for new loads"""
        return (
            self.status == DriverStatus.AVAILABLE and
            self.verification_status == VerificationStatus.VERIFIED and
            self.current_load_weight < self.max_weight_capacity
        )

def generate_unique_refercode(session, length=8):
    """Generate a unique alphanumeric referral code."""
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=length))
        exists = session.query(User).filter_by(refercode=code).first()
        if not exists:
            return code

@event.listens_for(User, "after_insert")
def create_refercode(mapper, connection, target):
    from sqlalchemy.orm import Session
    session = Session(bind=connection)
    code = generate_unique_refercode(session)
    session.close()

    # Use raw connection to update the row
    connection.execute(
        update(User.__table__).
        where(User.__table__.c.id == target.id).
        values(refercode=code)
    )
        
        
class Shipper(Base):
    __tablename__ = "shippers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID, ForeignKey("users.id"), unique=True)
    company_name = Column(String)
    gst_number = Column(String, nullable=True)   
    pan_number = Column(String, nullable=True)  
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    status = Column(SQLEnum(VerificationStatus, name="verification_status", native_enum=False),
        default=VerificationStatus.PENDING,
        nullable=False
    )
    # Relationships
    user = relationship("User", back_populates="shipper")
    loads = relationship("Load", back_populates="shipper")
    # payments = relationship("Payment", back_populates="shipper")


class Broker(Base):
    __tablename__ = "brokers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)

    # Basic Info
    agency_name = Column(String, nullable=True)   
    gst_number = Column(String, nullable=True)   
    pan_number = Column(String, nullable=True)  
    status = Column(SQLEnum(VerificationStatus, name="verification_status", native_enum=False),
        default=VerificationStatus.PENDING,
        nullable=False
    )

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="broker")
    loads = relationship("Load", back_populates="broker")
    # payments = relationship("Payment", back_populates="broker")
    
    

class Otp(Base):
    __tablename__ = "otps"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True)
    otp_code = Column(String, nullable=False)
    expiration_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    

class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    certificate_type = Column(String, nullable=False)
    certificate = Column(String, nullable=False)  # Fixed typo: cerificate -> certificate
    created_at = Column(DateTime, server_default=func.now())
    
    #relationships
    user = relationship("User", back_populates="certificates")
    
    
class UserBankDetails(Base):
    __tablename__ = "user_bank_details"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    account_number = Column(String, nullable=False)
    account_holder_name = Column(String, nullable=False)
    bank_name = Column(String, nullable=False)
    ifsc_code = Column(String, nullable=False)
    default = Column(Boolean, default=False)
    # is_verified = Column(Boolean, default=False)  # Temporarily commented out until database migration
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="bank_details")