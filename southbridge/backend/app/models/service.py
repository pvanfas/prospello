from app.core.database import Base
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime, Float, UUID, DECIMAL, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.user import User, VerificationStatus
from enum import Enum
from sqlalchemy import Enum as SQLEnum
import uuid



class CurrentStatus(str, Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"
    
class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    IN_PROGRESS = "in_progress"
    ON_THE_WAY = "on_the_way"
    ARRIVED = "arrived"

class ServiceCategory(Base):
    __tablename__ = "service_categories"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)  # "Mechanic", "Towing", "Weighbridge"
    slug = Column(String, nullable=True, unique=True)  # "mechanic", "towing", "weighbridge" - auto-generated if not provided
    description = Column(Text, nullable=True)
    icon_url = Column(String, nullable=True)
    is_emergency = Column(Boolean, default=False)  # For SOS services
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    service_provider_categories = relationship("ServiceProviderCategory", back_populates="category")
    

class ServiceProvider(Base):
    __tablename__ = "service_providers"
    __table_args__ = (
        Index('idx_service_provider_user_id', 'user_id'),
        Index('idx_service_provider_verification', 'verification_status'),
        Index('idx_service_provider_location', 'shop_location_latitude', 'shop_location_longitude'),
    )
    
    id = Column(Integer, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"), unique=True, nullable=False)
    business_name = Column(String, nullable=False)
    business_type = Column(String)  # "Individual", "Company", "Franchise"
    business_phone = Column(String)
    license_number = Column(String, unique=True)
    gst_number = Column(String)

    verification_status = Column(SQLEnum(VerificationStatus, name="verification_status", native_enum=False),
        default=VerificationStatus.PENDING,
        nullable=False
    )
    
    # Location information
    shop_location_latitude = Column(Float, nullable=True)
    shop_location_longitude = Column(Float, nullable=True)
    shop_location_address = Column(Text, nullable=True)
    max_service_radius = Column(Integer, default=50)  # km
    
    # Performance metrics
    rating = Column(Float, default=0.0)
    total_services = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)
    response_time_avg = Column(Integer)  # minutes
    
    # Financial
    base_price = Column(DECIMAL(10, 2))
    emergency_surcharge = Column(DECIMAL(10, 2), default=0)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="service_provider")
    service_provider_categories = relationship("ServiceProviderCategory", back_populates="service_provider")
    bookings = relationship("ServiceBooking", back_populates="provider")
    reviews = relationship("ServiceReview", back_populates="provider")
    

class ServiceProviderCategory(Base):
    __tablename__ = "service_provider_categories"
    
    id = Column(Integer, primary_key=True)
    service_provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)
    
    current_status = Column(SQLEnum(CurrentStatus, name="current_status", native_enum=False),
        default=CurrentStatus.AVAILABLE,
        nullable=False
    )
    price_from = Column(DECIMAL(10, 2), nullable=True)
    price_to = Column(DECIMAL(10, 2), nullable=True)
    emergency_available = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    service_provider = relationship("ServiceProvider", back_populates="service_provider_categories")
    category = relationship("ServiceCategory", back_populates="service_provider_categories")
    service_bookings = relationship("ServiceBooking", back_populates="booked_category")
    
    
    
class ServiceBooking(Base):
    __tablename__ = "service_bookings"
    
    id = Column(Integer, primary_key=True)
    booking_id = Column(String, unique=True)  # SB-2024-001
    booked_category_id = Column(Integer, ForeignKey("service_provider_categories.id"), nullable=False)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    
    # Service details
    service_description = Column(Text)
    vehicle_details = Column(String)  # JSON string for now
    
    # Location
    service_latitude = Column(Float)
    service_longitude = Column(Float)
    service_address = Column(Text)
    
    # Timing
    scheduled_at = Column(DateTime, nullable=False)
    requested_at = Column(DateTime, default=func.now())
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Status and priority
    status = Column(SQLEnum(BookingStatus, name="booking_status", native_enum=False), default=BookingStatus.PENDING)
    is_emergency = Column(Boolean, default=False)
    
    # Financial
    estimated_cost = Column(DECIMAL(10, 2))
    final_cost = Column(DECIMAL(10, 2))
    emergency_surcharge = Column(DECIMAL(10, 2), default=0)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    booked_category = relationship("ServiceProviderCategory", back_populates="service_bookings")
    user = relationship("User", back_populates="service_bookings")
    provider = relationship("ServiceProvider", back_populates="bookings")
    service_reviews = relationship("ServiceReview", back_populates="service_booking")
    
    
class ServiceReview(Base):
    __tablename__ = "service_reviews"
    
    id = Column(Integer, primary_key=True)
    service_booking_id = Column(Integer, ForeignKey("service_bookings.id"), nullable=False)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    
    review = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    
    # Detailed ratings
    service_quality = Column(Integer)  # 1-5
    response_time = Column(Integer)     # 1-5
    professionalism = Column(Integer)   # 1-5
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    service_booking = relationship("ServiceBooking", back_populates="service_reviews")
    user = relationship("User", back_populates="service_reviews")
    provider = relationship("ServiceProvider", back_populates="reviews")