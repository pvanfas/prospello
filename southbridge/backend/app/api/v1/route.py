from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.route import (
    create_driver_route, 
    get_driver_routes, 
    get_driver_route, 
    update_driver_route_status,
    get_route_orders,
    delete_driver_route,
    _format_routes_grouped
)
from app.models.user import User, DriverStatus
from app.schemas.route import DriverRouteCreate, CreateRouteFromCurrentRequest
from app.crud.order import get_orders_for_showing_route as get_orders_for_showing
from typing import List
import logging
import math
from app.models.route import DriverRouteOrder
from app.models.order import Order
from app.models.load import Load

logger = logging.getLogger(__name__)
router = APIRouter()




@router.post("/create-from-current/")
def create_route_from_current_location(
    request_data: CreateRouteFromCurrentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Create a new route from driver's current location with optimized shortest path
    """
    try:
        from app.services.route_builder import build_route_from_current_location

        return build_route_from_current_location(
            db,
            user,
            current_lat=request_data.current_lat,
            current_lng=request_data.current_lng,
            order_ids=request_data.order_ids,
            name=request_data.name,
            description=request_data.description,
        )
    except HTTPException as e:
        # Allow intended HTTP errors (e.g., 400/403) to pass through
        raise e
    except Exception as e:
        logger.error(f"Error creating route from current location: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating route: {str(e)}")




@router.get("/")
def get_my_routes(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Get all routes for the current driver, grouped by status with orders summarized.
    """
    try:
        if not user.driver:
            raise HTTPException(status_code=403, detail="Only drivers can view routes")

        routes = get_driver_routes(db, user.driver.id)
        
        return _format_routes_grouped(db, routes)
    except Exception as e:
        logger.error(f"Error getting driver routes: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting routes: {str(e)}")



@router.get("/{route_id}")
def get_route_details(route_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Get details of a specific route
    """
    try:
        if not user.driver:
            raise HTTPException(status_code=403, detail="Only drivers can view routes")

        route = get_driver_route(db, route_id, user.driver.id)
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        orders = get_orders_for_showing(db, route_id)
        if not orders:
            raise HTTPException(status_code=404, detail="No orders found for this route")

        # Parse destinations JSON if available
        route_data = {
            "id": route.id,
            "name": route.name,
            "description": route.description,
            "status": route.status,
            "created_at": route.created_at,
            "updated_at": route.updated_at,
            "origin": {
                "lat": route.origin_lat,
                "lng": route.origin_lng
            },
            "eta_minutes": route.eta_minutes,
            "overview_polyline": route.overview_polyline,
            "has_polyline": bool(route.overview_polyline),
            "orders" : orders
        }
        
        # Parse destinations if available
        if route.destinations_json:
            import json
            try:
                destinations = json.loads(route.destinations_json)
                route_data["destinations"] = destinations
                route_data["destination_count"] = len(destinations)
            except json.JSONDecodeError:
                route_data["destinations"] = []
                route_data["destination_count"] = 0
        
        return {"route": route_data}
    except Exception as e:
        logger.error(f"Error getting route details: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting route: {str(e)}")


@router.get("/{route_id}/track/")
def get_route_tracking(route_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Get route tracking information including location history and current path
    """
    try:
        from app.crud.location import get_driver_location_history
        from app.models.location import DriverLocation
        from sqlalchemy import desc
        
        if not user.driver:
            raise HTTPException(status_code=403, detail="Only drivers can view route tracking")

        route = get_driver_route(db, route_id, user.driver.id)
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        
        # Get location history for this route (last 24 hours)
        pings = db.query(DriverLocation)\
            .filter(
                DriverLocation.driver_id == user.driver.id,
                DriverLocation.driver_route_id == route_id
            )\
            .order_by(desc(DriverLocation.timestamp))\
            .limit(500)\
            .all()
        
        # Format pings
        ping_data = [
            {
                "latitude": ping.latitude,
                "longitude": ping.longitude,
                "accuracy": ping.accuracy,
                "speed": ping.speed,
                "heading": ping.heading,
                "timestamp": ping.timestamp.isoformat()
            }
            for ping in pings
        ]
        
        return {
            "route_id": route_id,
            "pings": ping_data,
            "total_pings": len(ping_data)
        }
    except Exception as e:
        logger.error(f"Error getting route tracking: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting tracking: {str(e)}")




