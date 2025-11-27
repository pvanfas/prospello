from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User, UserType, Driver
from app.schemas.location import (
    LocationUpdate,
    DriverLocationResponse,
    RoutePolylineUpdate,
    DriverRouteTrackingResponse,
    TrackOrderRequest,
    TrackOrderResponse,
    LiveLocationUpdateEvent
)
from app.crud import location as location_crud
from app.services.websocket_manager import manager
import json
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/driver/location", response_model=DriverLocationResponse, status_code=status.HTTP_201_CREATED)
async def update_driver_location(
    location_data: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update driver's current location (Driver only)
    
    This endpoint:
    - Stores the location update in the database
    - Updates the driver's current location
    - Broadcasts location to connected clients via WebSocket
    """
    # Verify user is a driver
    if current_user.role != UserType.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can update location"
        )
    
    # Get driver profile
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found"
        )
    
    # Create location update
    location = location_crud.create_location_update(db, driver.id, location_data)
    
    # Broadcast to WebSocket clients if driver is on a route
    if location_data.driver_route_id:
        try:
            # Get order IDs for this route
            order_ids = location_crud.get_orders_for_route(db, location_data.driver_route_id)
            
            # Prepare location data for WebSocket
            location_event = {
                "event_type": "location_update",
                "driver_id": driver.id,
                "driver_route_id": str(location_data.driver_route_id),
                "order_ids": order_ids,
                "location": {
                    "latitude": location_data.latitude,
                    "longitude": location_data.longitude,
                    "accuracy": location_data.accuracy,
                    "speed": location_data.speed,
                    "heading": location_data.heading,
                    "timestamp": location.timestamp.isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Broadcast to all connected clients (shippers/brokers tracking this route)
            await manager.send_location_update_to_order_trackers(
                str(location_data.driver_route_id),
                location_event["location"],
                order_ids
            )
            
            logger.info(f"Broadcasted location update for driver {driver.id} on route {location_data.driver_route_id}")
        except Exception as e:
            logger.error(f"Failed to broadcast location update: {e}")
    
    return location


@router.get("/driver/location/history", response_model=List[DriverLocationResponse])
def get_driver_location_history(
    hours: int = 24,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get driver's location history (Driver only)
    """
    if current_user.role != UserType.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can access location history"
        )
    
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found"
        )
    
    locations = location_crud.get_driver_location_history(db, driver.id, hours, limit)
    return locations


@router.post("/driver/route/tracking", response_model=DriverRouteTrackingResponse)
async def update_route_tracking(
    tracking_data: RoutePolylineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update route tracking information including polyline and progress (Driver only)
    
    This endpoint:
    - Updates route polyline (current, traversed, remaining)
    - Updates distance covered and progress percentage
    - Updates ETA
    """
    if current_user.role != UserType.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can update route tracking"
        )
    
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found"
        )
    
    # Create or update tracking
    tracking = location_crud.create_or_update_route_tracking(db, tracking_data)
    
    # Broadcast tracking update via WebSocket
    try:
        order_ids = location_crud.get_orders_for_route(db, tracking_data.driver_route_id)
        
        tracking_event = {
            "event_type": "route_tracking_update",
            "driver_id": driver.id,
            "driver_route_id": str(tracking_data.driver_route_id),
            "order_ids": order_ids,
            "tracking": {
                "progress_percentage": tracking.progress_percentage,
                "distance_covered_km": tracking.distance_covered_km,
                "total_distance_km": tracking.total_distance_km,
                "estimated_arrival_time": tracking.estimated_arrival_time.isoformat() if tracking.estimated_arrival_time else None,
                "current_polyline": tracking.current_polyline,
                "traversed_polyline": tracking.traversed_polyline,
                "remaining_polyline": tracking.remaining_polyline
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await manager.broadcast_to_all(json.dumps(tracking_event))
        logger.info(f"Broadcasted route tracking update for route {tracking_data.driver_route_id}")
    except Exception as e:
        logger.error(f"Failed to broadcast tracking update: {e}")
    
    return tracking


@router.get("/route/{driver_route_id}/tracking", response_model=DriverRouteTrackingResponse)
def get_route_tracking_info(
    driver_route_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get route tracking information
    
    Available to: Driver (own routes), Shipper/Broker (their orders)
    """
    tracking = location_crud.get_route_tracking(db, driver_route_id)
    
    if not tracking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route tracking not found"
        )
    
    return tracking


@router.post("/order/track", response_model=TrackOrderResponse)
def track_order(
    request: TrackOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Track an order - get driver location, route, and ETA
    
    Available to: Shipper/Broker who created the order
    """
    # Verify user is shipper or broker
    if current_user.role not in [UserType.SHIPPER, UserType.BROKER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shippers and brokers can track orders"
        )
    
    # Get tracking info
    logger.info(f"🔍 Tracking order ID: {request.order_id}")
    tracking_info = location_crud.get_order_tracking_info(db, request.order_id)
    
    if not tracking_info:
        logger.error(f"❌ No tracking info found for order {request.order_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    logger.info(f"✅ Tracking info found: {tracking_info}")
    
    order = tracking_info["order"]
    load = tracking_info["load"]
    driver = tracking_info["driver"]
    driver_route = tracking_info["driver_route"]
    driver_route_tracking = tracking_info["driver_route_tracking"]
    driver_location = tracking_info["driver_location"]
    
    # Verify access - check if this user created the load
    if current_user.role == UserType.SHIPPER:
        from app.models.user import Shipper
        shipper = db.query(Shipper).filter(Shipper.user_id == current_user.id).first()
        if not shipper or load.shipper_id != shipper.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only track your own orders"
            )
    elif current_user.role == UserType.BROKER:
        from app.models.user import Broker
        broker = db.query(Broker).filter(Broker.user_id == current_user.id).first()
        if not broker or load.broker_id != broker.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only track your own orders"
            )
    
    # Build response
    response = TrackOrderResponse(
        order_id=order.id,
        order_number=order.order_number,
        order_status=order.status.value,
        load_id=load.id,
        origin=load.origin,
        destination=load.destination,
        origin_lat=load.origin_lat,
        origin_lng=load.origin_lng,
        destination_lat=load.destination_lat,
        destination_lng=load.destination_lng,
        driver_id=driver.id if driver else None,
        driver_name=driver.user.username if driver else None,
        driver_phone=driver.user.phone_number if driver else None,
        driver_vehicle_number=driver.vehicle_registration if driver else None,
        current_location=driver_location,
        route_tracking=driver_route_tracking,
        driver_route_id=driver_route.id if driver_route else None,
        driver_route_polyline=driver_route.overview_polyline if driver_route else None,
        estimated_arrival=driver_route_tracking.estimated_arrival_time if driver_route_tracking else None
    )
    
    return response


@router.get("/order/{order_id}/track", response_model=TrackOrderResponse)
def track_order_by_id(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Track an order by ID - get driver location, route, and ETA
    
    Available to: Shipper/Broker who created the order
    """
    request = TrackOrderRequest(order_id=order_id)
    return track_order(request, current_user, db)


@router.websocket("/ws/location/{user_id}")
async def websocket_location_endpoint(
    websocket: WebSocket,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time location updates
    
    Clients connect with their user_id and receive:
    - Driver location updates for orders they're tracking
    - Route progress updates
    - ETA updates
    """
    await manager.connect(user_id, websocket)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            
            # Handle ping/pong to keep connection alive
            if data == "ping":
                await websocket.send_text("pong")
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        logger.info(f"WebSocket disconnected for user {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id)

