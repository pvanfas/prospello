from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import app
from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.payment import Payment, PaymentStatus
from app.models.order import Order
from app.core.config import settings
import razorpay
from app.schemas.payment import PaymentCreateRequest,PaymentCaptureRequest, PaymentCreateResponse, PaymentVerifyRequest
from app.models.order  import OrderStatus

key =  settings.RAZORPAY_KEY_ID
secret = settings.RAZORPAY_KEY_SECRET

key_x = settings.RAZORPAYX_KEY_ID or ""
secret_x = settings.RAZORPAYX_KEY_SECRET or ""  


rzp = razorpay.Client(auth=(key, secret))
rzp_x = razorpay.Client(auth=(key_x, secret_x))


router = APIRouter()



@router.post("/create-order", response_model=PaymentCreateResponse)
def create_order(req: PaymentCreateRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == req.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    amount_paise = int(round(req.amount * 100))
    try:
        rzp_order = rzp.order.create({
            "amount": float(order.bid.amount) * 100,
            "currency": "INR",
            "payment_capture": 0,  # manual capture
            "receipt": f"order_{order.order_number}"
        })
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=f"Razorpay order create failed: {str(e)}")

    payment = Payment(
        order_id=order.id,
        razorpay_order_id=rzp_order["id"],
        amount=amount_paise,
        currency=rzp_order.get("currency", "INR"),
        status=PaymentStatus.CREATED
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {"payment_id": payment.id, "razorpay_order_id": payment.razorpay_order_id, "amount": payment.amount, "currency": payment.currency}

    

@router.post("/verify")
def verify_payment(payment_data : PaymentVerifyRequest, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_data.payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    params_dict = {
        "razorpay_order_id": payment_data.razorpay_order_id,
        "razorpay_payment_id": payment_data.razorpay_payment_id,
        "razorpay_signature": payment_data.razorpay_signature
    }

    try:
        rzp.utility.verify_payment_signature(params_dict)
    except razorpay.errors.SignatureVerificationError:
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(status_code=400, detail="Signature verification failed")

    # Update Payment record
    payment.razorpay_payment_id = payment_data.razorpay_payment_id
    payment.razorpay_signature = payment_data.razorpay_signature
    payment.status = PaymentStatus.AUTHORIZED
    payment.authorized_at = datetime.now()
    payment.order.status = OrderStatus.PENDING
    db.commit()
    return {"status": "authorized"}


@router.post("/capture")
def capture_payment(order_data : PaymentCaptureRequest, db: Session = Depends(get_db)):
    """
    Capture the latest AUTHORIZED payment for a given order_id.
    """
    print(order_data)
    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order_data.order_id)
        .order_by(Payment.id.desc())
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="No authorized payment found for this order")

    # If you want to remove Razorpay logic, comment out the next line
    # rzp_client.payment.capture(payment.razorpay_payment_id, payment.amount)
    order = db.query(Order).filter(Order.id == order_data.order_id).first()
    order.status = OrderStatus.COMPLETED
    db.add(order)
    payment.status = PaymentStatus.CAPTURED
    payment.captured_at = datetime.now()
    db.commit()

    return {"status": "captured", "payment_id": payment.id}