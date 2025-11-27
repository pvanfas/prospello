"""
FastAPI application entry point.
Similar to Django's wsgi.py but also includes URL configuration.
"""
from datetime import datetime
from zoneinfo import ZoneInfo
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.models.order import Order, OrderStatus
from app.services.scheduler import scheduler
from app.services.order_expiry import schedule_order_expiry  # make sure file is named `order_expiry.py`
from .core.config import settings
from .api.v1.api import api_router
from .core.database import SessionLocal, engine, Base

# Import models so SQLAlchemy knows them
from .models.bid import Bid
from .models.load import Load
from .models.user import User

# ---- Setup ---- #
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description="Logistic"
)

# ---- Middleware ---- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ---- Routers ---- #
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    """Root endpoint"""
    return {"message": "Prospello"}

# ---- Lifecycle Events ---- #
@app.on_event("startup")
def startup_event():
    scheduler.start()

    db = SessionLocal()
    now = datetime.now(ZoneInfo("Asia/Kolkata"))
    try:
        pending_orders = db.query(Order).filter(Order.status == OrderStatus.BID_ACCEPTED).all()
        for order in pending_orders:
            if order.expires_at:
                # Ensure order.expires_at is timezone-aware
                if order.expires_at.tzinfo is None:
                    order.expires_at = order.expires_at.replace(tzinfo=ZoneInfo("Asia/Kolkata"))
                if order.expires_at > now:
                    minutes_left = int((order.expires_at - now).total_seconds() / 60)
                    if minutes_left > 0:
                        schedule_order_expiry(order.id, minutes_left)
    finally:
        db.close()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown(wait=False)
