from pydantic import BaseModel, Field
from typing import Any, List, Optional, Union
from datetime import datetime
import uuid
from decimal import Decimal
from app.models.bid import BidStatus

class BidSchema(BaseModel):
    id: uuid.UUID
    load_id: uuid.UUID
    driver_id: int
    amount: float
    status: BidStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CreateBidsSchema(BaseModel):
    load_id: str
    amount: float

class BidResponse(BaseModel):
    bids: List[BidSchema]
    
class LoadBidResponse(BidSchema):
        driver_name: str
        vehicle_image: Optional[str] = None
        
    
class AcceptBidRequest(BaseModel):
    expire_time: Optional[int] 
    
class DeleteBidRequest(BaseModel):
    bid_id: Any

class DriverBidsResponse(BaseModel):
    id: uuid.UUID
    amount: Union[float, Decimal]
    status: BidStatus
    created_at: datetime
    origin: str
    destination: str
    goods_type: str
    weight: Union[str, Decimal]
    load_id: uuid.UUID
    # pickup_date: Optional[datetime] = None
    # delivery_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True