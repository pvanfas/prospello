from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Enum,UUID,DateTime
from sqlalchemy.orm import relationship
from uuid import uuid4
from datetime import datetime
from app.core.database import Base
from zoneinfo import ZoneInfo
from enum import Enum as PyEnum  


class OrderStatus(PyEnum):
    BID_ACCEPTED = "bid_accepted"
    DRIVER_ACCEPTED = "driver_accepted"
    DRIVER_REJECTED = "driver_rejected"
    PENDING = "pending"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELED = "canceled"
    COMPLETED = "completed" 
    DELIVERY_FAILED = "delivery_failed"


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID, primary_key=True, default=uuid4, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), onupdate=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    order_number = Column(String, unique=True, index=True)

    load_id = Column(UUID, ForeignKey("loads.id"), nullable=False)
    bid_id = Column(UUID, ForeignKey("bids.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.BID_ACCEPTED, nullable=False)
    payout_done = Column(Boolean, default=False, nullable=False)
    
    bid_accepted_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    driver_accepted_at = Column(DateTime, nullable=True)
    driver_rejected_at = Column(DateTime, nullable=True)
    picked_up_at = Column(DateTime, nullable=True)
    in_transit_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    delivery_failed_at = Column(DateTime, nullable=True)
    
    #relationship
    load = relationship("Load", back_populates="orders")
    bid = relationship("Bid", back_populates="orders")
    driver_route_orders = relationship("DriverRouteOrder", back_populates="order", cascade="all, delete-orphan")

    def generate_order_number(self):
        """
        Generate human-readable order number like:
        ORD-2025-0001 (using IST year and UUID suffix)
        """
        ist = ZoneInfo("Asia/Kolkata")
        year = datetime.now(ist).year
        # Use first 4 characters of UUID for uniqueness
        uuid_suffix = str(self.id).replace('-', '')[:4].upper()
        return f"ORD-{year}-{uuid_suffix}"
    
    #relationships
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
