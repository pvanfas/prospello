from sqlalchemy.sql import func
from sqlalchemy import Column, Float, String, DateTime, ForeignKey, Boolean, Enum as SQLEnum, DECIMAL, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from enum import Enum
import uuid
from app.core.database import Base

from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy import event

from app.services.get_geocode import geocode_address

# Enum for load status
class LoadStatus(str, Enum):
    POSTED = "posted"
    BIDDING = "bidding"
    ASSIGNED = "assigned"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


# Enum for goods category
class GoodsCategory(str, Enum):
    PERISHABLE = "perishable"
    NON_PERISHABLE = "non_perishable"
    HIGH_VALUE = "high_value"
    OVERSIZE = "oversize"
    GENERAL = "general"

# Enum for load source
class LoadSource(str, Enum):
    TEXT = "text"
    VOICE = "voice"
    IMAGE = "image"
    
# class VehicleType(str, Enum):


class Load(Base):
    from zoneinfo import ZoneInfo
    from datetime import datetime
    __tablename__ = "loads"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    
    image = Column(String, nullable=True) 
    image_path = Column(String, nullable=True)
    # Who created this load
    shipper_id = Column(Integer, ForeignKey("shippers.id"), nullable=True)
    broker_id = Column(Integer, ForeignKey("brokers.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), onupdate=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)

    # Load details
    origin_place = Column(String, nullable=True)
    origin = Column(String, nullable=False)
    destination_place = Column(String, nullable=True)
    destination = Column(String, nullable=False)
    goods_type = Column(String, nullable=False) 
    weight = Column(DECIMAL, nullable=False)     
    dimensions = Column(String, nullable=True)  
    special_instructions = Column(Text, nullable=True)
    vehicle_types = Column(JSON, nullable=True, default=["any"])  # Array of vehicle types
    
    
    # Location details
    origin_lat = Column(Float, nullable=True)
    origin_lng = Column(Float, nullable=True)


    destination_lat = Column(Float, nullable=True)
    destination_lng = Column(Float, nullable=True)
  
    
    # Source info
    source_type = Column(SQLEnum(LoadSource, name="load_source", native_enum=False), nullable=False, default=LoadSource.TEXT)
    source_content = Column(Text, nullable=True)  # Can store raw text or base64/image URL

    #after accepting assigning driver
    accepted_bid_id = Column(UUID(as_uuid=True), ForeignKey("bids.id"), nullable=True)
    assigned_driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    
    #bidding info
    bid_count = Column(Integer, default=0)
    lowest_bid = Column(Float, nullable=True)

    # Auto categorization
    category = Column(
        SQLEnum(GoodsCategory, name="goods_category", native_enum=False),
        default=GoodsCategory.GENERAL
    )

    # Status
    status = Column(
        SQLEnum(LoadStatus, name="load_status", native_enum=False),
        default=LoadStatus.POSTED,
        nullable=False
    )

    verified = Column(Boolean, default=False)  # Verified loads badge (mainly for broker loads)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    shipper = relationship("Shipper", back_populates="loads")
    broker = relationship("Broker", back_populates="loads")
    bids = relationship(
        "Bid",
        back_populates="load",
        foreign_keys="Bid.load_id",
        cascade="all, delete-orphan"
    )
    accepted_bid = relationship("Bid", foreign_keys=[accepted_bid_id], uselist=False)
    assigned_driver = relationship("Driver", foreign_keys=[assigned_driver_id], uselist=False)
    orders = relationship("Order", back_populates="load", cascade="all, delete-orphan")
    # payments = relationship("Payment", back_populates="load")


@event.listens_for(Load, "before_insert")
def receive_before_insert(mapper, connection, target):
    if target.origin:
        geo = geocode_address(target.origin)
        if geo:
            target.origin_lat = geo["lat"]
            target.origin_lng = geo["lng"]

    if target.destination:
        geo = geocode_address(target.destination)
        if geo:
            target.destination_lat = geo["lat"]
            target.destination_lng = geo["lng"]
