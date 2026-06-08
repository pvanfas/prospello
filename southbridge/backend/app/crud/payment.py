from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional
from uuid import UUID
from app.models.payment import Payment, Payout, PaymentStatus, PayoutStatus
from app.schemas.payment import PaymentCreate
from app.models.order import Order
from app.models.load import Load
from app.models.bid import Bid
from app.models.user import User, UserType, Driver, Shipper, Broker


def create_payment(db: Session, payment: PaymentCreate):
    db_payment = Payment(**payment.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_payment(db: Session, payment_id: int):
    return db.query(Payment).filter(Payment.id == payment_id).first()

def update_payment_status(db: Session, payment_id: int, status: str):
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if db_payment:
        db_payment.status = status
        db.commit()
        db.refresh(db_payment)
    return db_payment

# ===== ADMIN PAYMENT CRUD OPERATIONS =====

def get_payments_admin(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    status: Optional[str] = None,
    currency: Optional[str] = None,
    order_id: Optional[UUID] = None
) -> List[Payment]:
    """Get all payments with optional filtering and pagination for admin"""
    query = db.query(Payment).options(
        joinedload(Payment.order).joinedload(Order.load),
        joinedload(Payment.order).joinedload(Order.bid)
    )
    
    if search:
        search_filter = or_(
            Payment.razorpay_order_id.ilike(f"%{search}%"),
            Payment.razorpay_payment_id.ilike(f"%{search}%"),
            Payment.uuid.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if status:
        query = query.filter(Payment.status == status)
    
    if currency:
        query = query.filter(Payment.currency == currency)
    
    if order_id:
        query = query.filter(Payment.order_id == order_id)
    
    return query.order_by(desc(Payment.created_at)).offset(skip).limit(limit).all()

def get_payment_admin(db: Session, payment_id: int) -> Optional[Payment]:
    """Get payment by ID for admin with all relationships"""
    return db.query(Payment).options(
        joinedload(Payment.order).joinedload(Order.load),
        joinedload(Payment.order).joinedload(Order.bid).joinedload(Bid.driver).joinedload(Driver.user)
    ).filter(Payment.id == payment_id).first()

def create_payment_admin(db: Session, payment_data: dict) -> Payment:
    """Create a new payment via admin panel"""
    payment = Payment(
        order_id=payment_data.get("order_id"),
        amount=int(payment_data.get("amount", 0) * 100),  # Convert to paise
        currency=payment_data.get("currency", "INR"),
        status=PaymentStatus(payment_data.get("status", "created")),
        razorpay_order_id=payment_data.get("razorpay_order_id"),
        razorpay_payment_id=payment_data.get("razorpay_payment_id"),
        razorpay_signature=payment_data.get("razorpay_signature"),
        authorized_at=payment_data.get("authorized_at"),
        captured_at=payment_data.get("captured_at"),
        refunded_at=payment_data.get("refunded_at")
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

def update_payment_admin(db: Session, payment_id: int, payment_update: dict) -> Optional[Payment]:
    """Update payment information via admin panel"""
    payment = get_payment_admin(db, payment_id)
    if not payment:
        return None
    
    # Update payment fields
    for field, value in payment_update.items():
        if value is not None:
            if field == "amount":
                setattr(payment, field, int(value * 100))  # Convert to paise
            elif field == "status":
                setattr(payment, field, PaymentStatus(value))
            elif field in ["authorized_at", "captured_at", "refunded_at"]:
                setattr(payment, field, value)
            else:
                setattr(payment, field, value)
    
    db.commit()
    db.refresh(payment)
    return payment

def delete_payment_admin(db: Session, payment_id: int) -> bool:
    """Delete payment via admin panel"""
    payment = get_payment_admin(db, payment_id)
    if payment:
        db.delete(payment)
        db.commit()
        return True
    return False

def get_payment_stats_admin(db: Session, payment_id: int) -> dict:
    """Get statistics for a specific payment"""
    payment = get_payment_admin(db, payment_id)
    if not payment:
        return {}
    
    # Count payouts for this payment
    total_payouts = db.query(Payout).filter(Payout.payment_id == payment_id).count()
    
    # Count successful payouts
    successful_payouts = db.query(Payout).filter(
        Payout.payment_id == payment_id,
        Payout.status == PayoutStatus.SUCCESS
    ).count()
    
    # Count failed payouts
    failed_payouts = db.query(Payout).filter(
        Payout.payment_id == payment_id,
        Payout.status == PayoutStatus.FAILED
    ).count()
    
    # Calculate total payout amount
    total_payout_amount = db.query(func.sum(Payout.amount)).filter(
        Payout.payment_id == payment_id,
        Payout.status == PayoutStatus.SUCCESS
    ).scalar() or 0
    
    return {
        'total_payouts': total_payouts,
        'successful_payouts': successful_payouts,
        'failed_payouts': failed_payouts,
        'total_payout_amount': float(total_payout_amount / 100)  # Convert from paise to rupees
    }

# ===== ADMIN PAYOUT CRUD OPERATIONS =====

def get_payouts_admin(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    status: Optional[str] = None,
    mode: Optional[str] = None,
    driver_id: Optional[int] = None,
    payment_id: Optional[int] = None
) -> List[Payout]:
    """Get all payouts with optional filtering and pagination for admin"""
    query = db.query(Payout).options(
        joinedload(Payout.driver).joinedload(Driver.user),
        joinedload(Payout.payment)
    )
    
    if search:
        search_filter = or_(
            Payout.razorpay_payout_id.ilike(f"%{search}%"),
            Payout.uuid.ilike(f"%{search}%"),
            User.username.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%")
        )
        query = query.join(Driver).join(User).filter(search_filter)
    
    if status:
        query = query.filter(Payout.status == status)
    
    if mode:
        query = query.filter(Payout.mode == mode)
    
    if driver_id:
        query = query.filter(Payout.driver_id == driver_id)
    
    if payment_id:
        query = query.filter(Payout.payment_id == payment_id)
    
    return query.order_by(desc(Payout.created_at)).offset(skip).limit(limit).all()

def get_payout_admin(db: Session, payout_id: int) -> Optional[Payout]:
    """Get payout by ID for admin with all relationships"""
    return db.query(Payout).options(
        joinedload(Payout.driver).joinedload(Driver.user),
        joinedload(Payout.payment).joinedload(Payment.order).joinedload(Order.load)
    ).filter(Payout.id == payout_id).first()

def create_payout_admin(db: Session, payout_data: dict) -> Payout:
    """Create a new payout via admin panel"""
    payout = Payout(
        payment_id=payout_data.get("payment_id"),
        driver_id=payout_data.get("driver_id"),
        amount=int(payout_data.get("amount", 0) * 100),  # Convert to paise
        currency=payout_data.get("currency", "INR"),
        mode=payout_data.get("mode"),
        status=PayoutStatus(payout_data.get("status", "initiated")),
        razorpay_payout_id=payout_data.get("razorpay_payout_id"),
        failure_reason=payout_data.get("failure_reason")
    )
    db.add(payout)
    db.commit()
    db.refresh(payout)
    return payout

def update_payout_admin(db: Session, payout_id: int, payout_update: dict) -> Optional[Payout]:
    """Update payout information via admin panel"""
    payout = get_payout_admin(db, payout_id)
    if not payout:
        return None
    
    # Update payout fields
    for field, value in payout_update.items():
        if value is not None:
            if field == "amount":
                setattr(payout, field, int(value * 100))  # Convert to paise
            elif field == "status":
                setattr(payout, field, PayoutStatus(value))
            elif field == "processed_at" and value:
                setattr(payout, field, value)
            else:
                setattr(payout, field, value)
    
    db.commit()
    db.refresh(payout)
    return payout

def delete_payout_admin(db: Session, payout_id: int) -> bool:
    """Delete payout via admin panel"""
    payout = get_payout_admin(db, payout_id)
    if payout:
        db.delete(payout)
        db.commit()
        return True
    return False

def get_payout_stats_admin(db: Session, payout_id: int) -> dict:
    """Get statistics for a specific payout"""
    payout = get_payout_admin(db, payout_id)
    if not payout:
        return {}
    
    # Get driver statistics
    driver_total_payouts = db.query(Payout).filter(
        Payout.driver_id == payout.driver_id
    ).count()
    
    driver_successful_payouts = db.query(Payout).filter(
        Payout.driver_id == payout.driver_id,
        Payout.status == PayoutStatus.SUCCESS
    ).count()
    
    driver_total_amount = db.query(func.sum(Payout.amount)).filter(
        Payout.driver_id == payout.driver_id,
        Payout.status == PayoutStatus.SUCCESS
    ).scalar() or 0
    
    return {
        'driver_total_payouts': driver_total_payouts,
        'driver_successful_payouts': driver_successful_payouts,
        'driver_total_amount': float(driver_total_amount / 100)  # Convert from paise to rupees
    }