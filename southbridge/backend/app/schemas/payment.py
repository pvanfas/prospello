from datetime import datetime
import uuid
from uuid import UUID
from pydantic import BaseModel

class PaymentBase(BaseModel):
    load_id: int
    broker_id: int
    driver_id: int
    amount: float

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        

class PaymentCreateRequest(BaseModel):
    order_id: UUID
    amount: float
    

class PaymentCreateResponse(BaseModel):
    payment_id: int
    razorpay_order_id: str
    amount: int
    currency: str
    
    
class PaymentCaptureRequest(BaseModel):
    order_id: UUID
    # razorpay_payment_id: str
    # razorpay_signature: str
    

class PaymentVerifyRequest(BaseModel):
    payment_id: int
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str