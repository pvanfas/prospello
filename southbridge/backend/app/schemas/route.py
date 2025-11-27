from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID


class DestinationPoint(BaseModel):
    """Represents a destination point in a route"""
    order_id: UUID
    lat: float
    lng: float
    address: Optional[str] = None


class DriverRouteBase(BaseModel):
    name: str
    description: Optional[str] = None
    origin_lat: float
    origin_lng: float
    destinations: List[DestinationPoint]


class DriverRouteCreate(DriverRouteBase):
    overview_polyline: Optional[str] = None
    eta_minutes: Optional[int] = None


class DriverRouteResponse(DriverRouteBase):
    id: UUID
    status: str
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


class DriverRouteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    overview_polyline: Optional[str] = None
    eta_minutes: Optional[int] = None


class CreateRouteFromCurrentRequest(BaseModel):
    """Request schema for creating route from current location"""
    current_lat: float
    current_lng: float
    order_ids: List[UUID]
    name: str
    description: Optional[str] = None