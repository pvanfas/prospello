from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class LocationUpdate(BaseModel):
    """Schema for driver to send location update"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    accuracy: Optional[float] = Field(None, description="GPS accuracy in meters")
    altitude: Optional[float] = None
    speed: Optional[float] = Field(None, description="Speed in km/h")
    heading: Optional[float] = Field(None, ge=0, le=360, description="Direction in degrees")
    driver_route_id: Optional[UUID] = Field(None, description="Active route ID if driver is on a route")
    

class DriverLocationResponse(BaseModel):
    """Response schema for driver location"""
    id: UUID
    driver_id: int
    driver_route_id: Optional[UUID]
    latitude: float
    longitude: float
    accuracy: Optional[float]
    altitude: Optional[float]
    speed: Optional[float]
    heading: Optional[float]
    timestamp: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class RoutePolylineUpdate(BaseModel):
    """Schema for updating route polyline and tracking"""
    driver_route_id: UUID
    current_polyline: Optional[str] = Field(None, description="Encoded polyline for entire route")
    traversed_polyline: Optional[str] = Field(None, description="Polyline for covered path")
    remaining_polyline: Optional[str] = Field(None, description="Polyline for remaining path")
    distance_covered_km: Optional[float] = None
    total_distance_km: Optional[float] = None
    progress_percentage: Optional[float] = Field(None, ge=0, le=100)
    estimated_arrival_time: Optional[datetime] = None


class DriverRouteTrackingResponse(BaseModel):
    """Response schema for route tracking"""
    id: UUID
    driver_route_id: UUID
    current_polyline: Optional[str]
    traversed_polyline: Optional[str]
    remaining_polyline: Optional[str]
    distance_covered_km: float
    total_distance_km: Optional[float]
    progress_percentage: float
    estimated_arrival_time: Optional[datetime]
    last_updated_eta: Optional[datetime]
    is_active: str
    started_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class TrackOrderRequest(BaseModel):
    """Request to track an order"""
    order_id: UUID


class TrackOrderResponse(BaseModel):
    """Response for order tracking with driver location and route"""
    order_id: UUID
    order_number: str
    order_status: str
    
    # Load details
    load_id: UUID
    origin: str
    destination: str
    origin_lat: Optional[float]
    origin_lng: Optional[float]
    destination_lat: Optional[float]
    destination_lng: Optional[float]
    
    # Driver details
    driver_id: Optional[int]
    driver_name: Optional[str]
    driver_phone: Optional[str]
    driver_vehicle_number: Optional[str]
    
    # Current location
    current_location: Optional[DriverLocationResponse]
    
    # Route tracking
    route_tracking: Optional[DriverRouteTrackingResponse]
    
    # Driver route details
    driver_route_id: Optional[UUID]
    driver_route_polyline: Optional[str]
    
    # ETA
    estimated_arrival: Optional[datetime]
    

class LiveLocationUpdateEvent(BaseModel):
    """WebSocket event for live location updates"""
    event_type: str = "location_update"
    driver_id: int
    driver_route_id: Optional[UUID]
    order_ids: List[UUID] = []
    location: dict
    timestamp: datetime
    
    class Config:
        from_attributes = True

