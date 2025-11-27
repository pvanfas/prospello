from sqlalchemy import Column, DateTime, ForeignKey, DECIMAL, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from enum import Enum
import uuid
from app.core.database import Base

from datetime import datetime
from zoneinfo import ZoneInfo


class BidStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class Bid(Base):
    __tablename__ = "bids"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)

    load_id = Column(UUID(as_uuid=True), ForeignKey("loads.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)

    amount = Column(DECIMAL, nullable=False)
    status = Column(
        SQLEnum(BidStatus, name="bid_status", native_enum=False),
        default=BidStatus.PENDING,
        nullable=False,
    )

    from zoneinfo import ZoneInfo
    from datetime import datetime

    created_at = Column(
        DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")),
        onupdate=lambda: datetime.now(ZoneInfo("Asia/Kolkata")),
        nullable=False,
    )

    # Relationships
    load = relationship("Load", back_populates="bids", foreign_keys=[load_id])
    driver = relationship("Driver", back_populates="bids")
    orders = relationship("Order", back_populates="bid", cascade="all, delete-orphan")
