from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class DriverLocation(Base):
    """Store real-time driver location updates"""
    __tablename__ = "driver_locations"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False, index=True)
    driver_route_id = Column(UUID, ForeignKey("driver_routes.id"), nullable=True, index=True)
    
    # Current location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Additional location metadata
    accuracy = Column(Float, nullable=True)  # GPS accuracy in meters
    altitude = Column(Float, nullable=True)
    speed = Column(Float, nullable=True)  # Speed in km/h
    heading = Column(Float, nullable=True)  # Direction in degrees (0-360)
    
    # Timestamps
    timestamp = Column(DateTime, nullable=False, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    driver = relationship("Driver", back_populates="locations")
    driver_route = relationship("DriverRoute", back_populates="location_updates")


class DriverRouteTracking(Base):
    """Store route progress and polyline for active routes"""
    __tablename__ = "driver_route_tracking"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    driver_route_id = Column(UUID, ForeignKey("driver_routes.id"), nullable=False, unique=True, index=True)
    
    # Current polyline (entire route from driver to all destinations)
    current_polyline = Column(Text, nullable=True)
    
    # Traversed polyline (path already covered by driver)
    traversed_polyline = Column(Text, nullable=True)
    
    # Remaining polyline (path yet to be covered)
    remaining_polyline = Column(Text, nullable=True)
    
    # Route progress
    distance_covered_km = Column(Float, default=0.0)
    total_distance_km = Column(Float, nullable=True)
    progress_percentage = Column(Float, default=0.0)
    
    # ETA
    estimated_arrival_time = Column(DateTime, nullable=True)
    last_updated_eta = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(String, default="active")  # active, paused, completed
    
    # Timestamps
    started_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    driver_route = relationship("DriverRoute", back_populates="tracking")

