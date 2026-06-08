import razorpay
from fastapi import HTTPException
from app.core.config import settings

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def initiate_payment(amount: float):
    data = {
        "amount": amount * 100,  
        "currency": "INR",
        "receipt": "receipt#123",
        "payment_capture": 1
    }
    try:
        order = client.order.create(data=data)
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def verify_payment(payment_id: str, order_id: str):
    try:
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': 'signature'
        }
        client.utility.verify_payment_signature(params_dict)
        return True
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))