
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, DECIMAL, ForeignKey, func, Enum as SQLEnum, Index, UniqueConstraint
from sqlalchemy.orm import relationship, Session
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from zoneinfo import ZoneInfo
from enum import Enum
from decimal import Decimal
from typing import List, Optional, Dict
import uuid

from app.core.database import Base



class BEDWalletTransactionType(str, Enum):
    """Transaction type enum"""
    CREDIT = "credit"
    DEBIT = "debit"


class BEDWalletTransactionReason(str, Enum):
    """Reason for wallet transaction"""
    COMMISSION = "commission"
    WITHDRAWAL = "withdrawal"
    REFUND = "refund"
    ADJUSTMENT = "adjustment"
    REVERSAL = "reversal"



class BEDCommissionRule(Base):
    """
    Defines commission percentages per referral level.
    Example: Level 1 → 5%, Level 2 → 3%, etc.
    """
    __tablename__ = "bed_commission_rules"
    __table_args__ = (
        UniqueConstraint("referral_level", name="uq_referral_level"),
    )

    id = Column(Integer, primary_key=True, index=True)
    referral_level = Column(Integer, nullable=False, index=True)  # 1 to 5
    commission_percentage = Column(Float, nullable=False)  # e.g., 5.0 for 5%
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), onupdate=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)

    def __repr__(self):
        return f"<BEDCommissionRule(level={self.referral_level}, percentage={self.commission_percentage}%)>"


class BEDReferral(Base):
    """
    Audit table for referral genealogy.
    Tracks the complete referral chain for compliance and analytics.
    """
    __tablename__ = "bed_referrals"
    __table_args__ = (
        Index("idx_referrer_id", "referrer_id"),
        Index("idx_referred_id", "referred_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)
    referred_id = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)
    referral_level = Column(Integer, nullable=False)  # 1 to 5
    referral_code = Column(String, nullable=True)  # Code used for referral
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    
    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_id], backref="referring_users")
    referred = relationship("User", foreign_keys=[referred_id], backref="referred_by_users")

    def __repr__(self):
        return f"<BEDReferral(referrer={self.referrer_id}, referred={self.referred_id}, level={self.referral_level})>"


class BEDWallet(Base):
    """
    User wallet for storing BED commission earnings.
    Balance is in the app's primary currency (e.g., INR).
    """
    __tablename__ = "bed_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    balance = Column(DECIMAL(15, 2), default=Decimal("0.00"), nullable=False)  # Current balance
    total_earned = Column(DECIMAL(15, 2), default=Decimal("0.00"), nullable=False)  # Total earned
    total_withdrawn = Column(DECIMAL(15, 2), default=Decimal("0.00"), nullable=False)  # Total withdrawn
    is_locked = Column(Boolean, default=False)  # Lock for suspicious activity
    locked_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), onupdate=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)

    # Relationships
    user = relationship("User", backref="bed_wallet")
    transactions = relationship("BEDWalletTransaction", back_populates="wallet", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<BEDWallet(user_id={self.user_id}, balance={self.balance})>"


class BEDWalletTransaction(Base):
    """
    Log of all wallet transactions.
    Immutable audit trail for all credits/debits.
    """
    __tablename__ = "bed_wallet_transactions"
    __table_args__ = (
        Index("idx_user_id", "user_id"),
        Index("idx_order_id", "order_id"),
        Index("idx_created_at", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("bed_wallets.id"), nullable=False, index=True)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(DECIMAL(15, 2), nullable=False)  # Amount credited/debited
    type = Column(
        SQLEnum(BEDWalletTransactionType, name="bed_transaction_type", native_enum=False),
        nullable=False
    )
    reason = Column(
        SQLEnum(BEDWalletTransactionReason, name="bed_transaction_reason", native_enum=False),
        nullable=False
    )
    order_id = Column(UUID, nullable=True)  # Related order if applicable
    referral_level = Column(Integer, nullable=True)  # Commission level
    description = Column(String, nullable=True)  # Additional details
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")), nullable=False)

    # Relationships
    wallet = relationship("BEDWallet", back_populates="transactions")

    def __repr__(self):
        return f"<BEDWalletTransaction(user={self.user_id}, amount={self.amount}, type={self.type})>"
