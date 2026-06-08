from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.location import DriverLocation, DriverRouteTracking
from app.models.route import DriverRoute, DriverRouteOrder
from app.models.order import Order
from app.models.load import Load
from app.models.bid import Bid
from app.models.user import Driver
from app.schemas.location import LocationUpdate, RoutePolylineUpdate
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


def create_location_update(
    db: Session,
    driver_id: int,
    location_data: LocationUpdate
) -> DriverLocation:
    """Create a new location update for a driver"""
    
    # Create location record
    location = DriverLocation(
        driver_id=driver_id,
        driver_route_id=location_data.driver_route_id,
        latitude=location_data.latitude,
        longitude=location_data.longitude,
        accuracy=location_data.accuracy,
        altitude=location_data.altitude,
        speed=location_data.speed,
        heading=location_data.heading,
        timestamp=datetime.utcnow()
    )
    
    db.add(location)
    
    # Update driver's current location in driver table
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if driver:
        driver.current_latitude = location_data.latitude
        driver.current_longitude = location_data.longitude
        driver.last_location_update = datetime.utcnow()
    
    db.commit()
    db.refresh(location)
    
    return location


def get_driver_latest_location(db: Session, driver_id: int) -> Optional[DriverLocation]:
    """Get the most recent location for a driver"""
    return db.query(DriverLocation)\
        .filter(DriverLocation.driver_id == driver_id)\
        .order_by(desc(DriverLocation.timestamp))\
        .first()


def get_driver_location_history(
    db: Session,
    driver_id: int,
    hours: int = 24,
    limit: int = 100
) -> List[DriverLocation]:
    """Get location history for a driver"""
    since = datetime.utcnow() - timedelta(hours=hours)
    
    return db.query(DriverLocation)\
        .filter(
            DriverLocation.driver_id == driver_id,
            DriverLocation.timestamp >= since
        )\
        .order_by(desc(DriverLocation.timestamp))\
        .limit(limit)\
        .all()


def create_or_update_route_tracking(
    db: Session,
    tracking_data: RoutePolylineUpdate
) -> DriverRouteTracking:
    """Create or update route tracking information"""
    
    # Check if tracking already exists
    tracking = db.query(DriverRouteTracking)\
        .filter(DriverRouteTracking.driver_route_id == tracking_data.driver_route_id)\
        .first()
    
    if tracking:
        # Update existing tracking
        if tracking_data.current_polyline is not None:
            tracking.current_polyline = tracking_data.current_polyline
        if tracking_data.traversed_polyline is not None:
            tracking.traversed_polyline = tracking_data.traversed_polyline
        if tracking_data.remaining_polyline is not None:
            tracking.remaining_polyline = tracking_data.remaining_polyline
        if tracking_data.distance_covered_km is not None:
            tracking.distance_covered_km = tracking_data.distance_covered_km
        if tracking_data.total_distance_km is not None:
            tracking.total_distance_km = tracking_data.total_distance_km
        if tracking_data.progress_percentage is not None:
            tracking.progress_percentage = tracking_data.progress_percentage
        if tracking_data.estimated_arrival_time is not None:
            tracking.estimated_arrival_time = tracking_data.estimated_arrival_time
            tracking.last_updated_eta = datetime.utcnow()
        
        tracking.updated_at = datetime.utcnow()
    else:
        # Create new tracking
        tracking = DriverRouteTracking(
            driver_route_id=tracking_data.driver_route_id,
            current_polyline=tracking_data.current_polyline,
            traversed_polyline=tracking_data.traversed_polyline,
            remaining_polyline=tracking_data.remaining_polyline,
            distance_covered_km=tracking_data.distance_covered_km or 0.0,
            total_distance_km=tracking_data.total_distance_km,
            progress_percentage=tracking_data.progress_percentage or 0.0,
            estimated_arrival_time=tracking_data.estimated_arrival_time,
            last_updated_eta=datetime.utcnow() if tracking_data.estimated_arrival_time else None,
            is_active="active"
        )
        db.add(tracking)
    
    db.commit()
    db.refresh(tracking)
    
    return tracking


def get_route_tracking(db: Session, driver_route_id: UUID) -> Optional[DriverRouteTracking]:
    """Get tracking information for a specific route"""
    return db.query(DriverRouteTracking)\
        .filter(DriverRouteTracking.driver_route_id == driver_route_id)\
        .first()


def complete_route_tracking(db: Session, driver_route_id: UUID) -> Optional[DriverRouteTracking]:
    """Mark route tracking as completed"""
    tracking = db.query(DriverRouteTracking)\
        .filter(DriverRouteTracking.driver_route_id == driver_route_id)\
        .first()
    
    if tracking:
        tracking.is_active = "completed"
        tracking.completed_at = datetime.utcnow()
        tracking.progress_percentage = 100.0
        db.commit()
        db.refresh(tracking)
    
    return tracking


def get_order_tracking_info(db: Session, order_id: UUID) -> Optional[dict]:
    """Get comprehensive tracking information for an order"""
    
    logger.info(f"🔍 Getting tracking info for order {order_id}")
    
    # Get order with related data
    order = db.query(Order)\
        .filter(Order.id == order_id)\
        .first()
    
    if not order:
        logger.error(f"❌ Order {order_id} not found")
        return None
    
    logger.info(f"✅ Order found: {order.order_number}, status: {order.status}")
    
    # Get load details
    load = db.query(Load).filter(Load.id == order.load_id).first()
    if not load:
        logger.error(f"❌ Load not found for order {order_id}")
        return None
    
    logger.info(f"✅ Load found: {load.origin} → {load.destination}")
    
    # Get bid to find driver
    bid = db.query(Bid).filter(Bid.id == order.bid_id).first()
    if not bid:
        logger.error(f"❌ Bid not found for order {order_id}")
        return None
    
    logger.info(f"✅ Bid found: {bid.id}, driver_id: {bid.driver_id}")
    
    driver = db.query(Driver).filter(Driver.id == bid.driver_id).first()
    if not driver:
        logger.error(f"❌ Driver not found for bid {bid.id}")
        return None
    
    logger.info(f"✅ Driver found: {driver.id}, user: {driver.user.username}")
    
    # Get driver route if exists
    driver_route = None
    driver_route_tracking = None
    driver_location = None
    
    # Find active route for this order
    driver_route_order = db.query(DriverRouteOrder)\
        .filter(DriverRouteOrder.order_id == order_id)\
        .first()
    
    if driver_route_order:
        logger.info(f"✅ DriverRouteOrder found: route_id = {driver_route_order.driver_route_id}")
        
        driver_route = db.query(DriverRoute)\
            .filter(DriverRoute.id == driver_route_order.driver_route_id)\
            .first()
        
        if driver_route:
            logger.info(f"✅ DriverRoute found: {driver_route.name}, status: {driver_route.status}")
            
            # Get tracking info
            driver_route_tracking = db.query(DriverRouteTracking)\
                .filter(DriverRouteTracking.driver_route_id == driver_route.id)\
                .first()
            
            if driver_route_tracking:
                logger.info(f"✅ DriverRouteTracking found: progress = {driver_route_tracking.progress_percentage}%")
            else:
                logger.warn(f"⚠️ No DriverRouteTracking found for route {driver_route.id}")
        else:
            logger.error(f"❌ DriverRoute not found for route_id {driver_route_order.driver_route_id}")
    else:
        logger.warn(f"⚠️ No DriverRouteOrder found for order {order_id} - order not assigned to route")
    
    # Get latest driver location
    driver_location = get_driver_latest_location(db, driver.id)
    if driver_location:
        logger.info(f"✅ Driver location found: lat={driver_location.latitude}, lng={driver_location.longitude}")
    else:
        logger.warn(f"⚠️ No driver location found for driver {driver.id}")
    
    result = {
        "order": order,
        "load": load,
        "driver": driver,
        "driver_route": driver_route,
        "driver_route_tracking": driver_route_tracking,
        "driver_location": driver_location
    }
    
    logger.info(f"📋 Final tracking info: order={bool(result['order'])}, load={bool(result['load'])}, driver={bool(result['driver'])}, route={bool(result['driver_route'])}, tracking={bool(result['driver_route_tracking'])}, location={bool(result['driver_location'])}")
    
    return result


def get_orders_for_route(db: Session, driver_route_id: UUID) -> List[UUID]:
    """Get all order IDs associated with a driver route"""
    driver_route_orders = db.query(DriverRouteOrder)\
        .filter(DriverRouteOrder.driver_route_id == driver_route_id)\
        .all()
    
    return [dro.order_id for dro in driver_route_orders]


def cleanup_old_locations(db: Session, days: int = 7) -> int:
    """Remove location records older than specified days"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    deleted_count = db.query(DriverLocation)\
        .filter(DriverLocation.timestamp < cutoff_date)\
        .delete()
    
    db.commit()
    
    logger.info(f"Cleaned up {deleted_count} old location records")
    return deleted_count

