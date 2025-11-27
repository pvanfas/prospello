from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from decimal import Decimal
from typing import Any, Optional

class OrderSummary(BaseModel):
    id: UUID
    order_number: str
    amount: Decimal
    driver_name: str
    created_at: datetime
    status: str
    origin: str
    destination: str
    origin_place: Optional[str] = None
    destination_place: Optional[str] = None
    goods_type: str
    weight: float
    driver_phone: str

    class Config:
        from_attributes = True


class DriverOrderInfo(BaseModel):
    id: UUID
    load_origin: str
    load_destination: str
    load_origin_place: Optional[str] = None
    load_destination_place: Optional[str] = None
    load_origin_lat: Optional[float] = None
    load_origin_long: Optional[float] = None
    load_weight: float
    bid_price: float
    status: str
    load_owner_phone: str
    load_owner_name: str
    created_at: datetime
    order_number: str
    expires_at: Optional[datetime]
    bid_accepted_at: Optional[datetime]

    class Config:
        from_attributes = True
        
    
class RouteOrderInfo(BaseModel):
    id: UUID
    order_number: str   
    origin: str  # For frontend compatibility
    destination: str  # For frontend compatibility
    load_origin: str
    load_destination: str
    load_weight: float
    bid_price: float
    
    class Config:
        from_attributes = True
    
    
    
            