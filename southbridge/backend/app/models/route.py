from app.core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class BaseModel(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())




# -------------------- V2 Simplified Driver Route Model --------------------
class DriverRoute(Base):
    __tablename__ = "driver_routes"

    id = Column(UUID, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    status = Column(String, index=True, default="active")  # active, completed, cancelled
    # basic info
    name = Column(String, index=True)
    description = Column(String, nullable=True)

    # ownership
    driver = Column(Integer, ForeignKey("drivers.id"), nullable=False)

    # origin (driver current location when created)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)

    # destinations stored as JSON string: [{"order_id": UUID, "lat": float, "lng": float}]
    destinations_json = Column(String, nullable=False)

    # computed route details
    overview_polyline = Column(String, nullable=True)
    eta_minutes = Column(Integer, nullable=True)
    status = Column(String, index=True, default="active")
    
    #ai powered route details
    
    #relationships
    driver_rel = relationship("Driver", back_populates="driver_routes")
    driver_route_orders = relationship("DriverRouteOrder", back_populates="driver_route", cascade="all, delete-orphan")
    location_updates = relationship("DriverLocation", back_populates="driver_route", cascade="all, delete-orphan")
    tracking = relationship("DriverRouteTracking", back_populates="driver_route", uselist=False, cascade="all, delete-orphan")
    
class DriverRouteOrder(Base):
    __tablename__ = "driver_route_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    driver_route_id = Column(UUID, ForeignKey("driver_routes.id"))
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    created_at = Column(DateTime, server_default=func.now())
    
    #relationships
    driver_route = relationship("DriverRoute", back_populates="driver_route_orders")
    order = relationship("Order", back_populates="driver_route_orders")
