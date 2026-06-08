from sqlalchemy import BigInteger, Column, String, Integer, DateTime, ForeignKey, Enum, Float, UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum
from sqlalchemy.sql import func
import uuid

class PaymentStatus(str, enum.Enum):
    CREATED = "created"       # Razorpay order created
    AUTHORIZED = "authorized" # money authorized (hold)
    CAPTURED = "captured"     # money captured into merchant account
    FAILED = "failed"         # payment failed
    REFUNDED = "refunded"     # refund issued
    

class PayoutStatus(str, enum.Enum):
    INITIATED = "initiated"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, default=lambda: str(uuid.uuid4()), unique=True, index=True)

    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)  # link to Order
    order = relationship("Order", back_populates="payments")

    razorpay_order_id = Column(String, nullable=True, index=True)
    razorpay_payment_id = Column(String, nullable=True, index=True)
    razorpay_signature = Column(String, nullable=True)

    amount = Column(BigInteger, nullable=False)  # stored in paise
    currency = Column(String, default="INR")

    status = Column(Enum(PaymentStatus), default=PaymentStatus.CREATED)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    authorized_at = Column(DateTime, nullable=True)
    captured_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)

class Payout(Base):
    __tablename__ = "payouts"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, default=lambda: str(uuid.uuid4()), unique=True, index=True)

    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)
    payment = relationship("Payment", backref="payouts")

    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    driver = relationship("Driver")

    amount = Column(BigInteger, nullable=False)  # paise
    currency = Column(String, default="INR")

    mode = Column(String, nullable=False)  # "UPI" or "IMPS"/"NEFT"
    razorpay_payout_id = Column(String, nullable=True, index=True)

    status = Column(Enum(PayoutStatus), default=PayoutStatus.INITIATED, nullable=False)

    created_at = Column(DateTime, default=datetime.now())
    processed_at = Column(DateTime, nullable=True)
    failure_reason = Column(String, nullable=True)

    def save(self, db):
        # Retrieve driver_id through relationships
        driver_id = self.order.bid.driver_id if self.order and self.order.bid else None
        
        # Assign the driver_id to the payout
        self.driver_id = driver_id
        
        # Save the payout
        db.add(self)
        db.commit()
        db.refresh(self)
        
        return self