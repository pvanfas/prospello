import logging
from typing import List, Dict, Tuple
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User

logger = logging.getLogger(__name__)


def _fetch_and_validate_orders(db: Session, order_ids: List[UUID]) -> Tuple[List[Dict], List[object]]:
    """
    Fetch orders and validate they are eligible for routing.
    Returns a tuple of (destinations, orders) where destinations is a list of dicts
    with keys order_id, lat, lng, address.
    """
    logger.info("[_fetch_and_validate_orders] started for order_ids: %s", order_ids)
    from app.models.order import Order
    from app.models.load import Load

    orders = (
        db.query(Order)
        .join(Load, Order.load_id == Load.id)
        .filter(Order.id.in_(order_ids))
        .all()
    )
    logger.debug("[_fetch_and_validate_orders] raw SQL result: %s rows", len(orders))

    if not orders:
        logger.error("[_fetch_and_validate_orders] no orders found")
        raise HTTPException(
            status_code=404,
            detail=(
                "No valid orders found. Only orders with 'picked_up' status can be added to routes."
            ),
        )

    if len(orders) != len(order_ids):
        found_ids = [order.id for order in orders]
        missing_ids = [oid for oid in order_ids if oid not in found_ids]
        logger.warning(
            "[_fetch_and_validate_orders] missing orders – found: %s  missing: %s",
            found_ids,
            missing_ids,
        )
        raise HTTPException(
            status_code=400,
            detail=(
                "Some orders are invalid or not picked up yet. Only orders with 'picked_up' "
                f"status can be added to routes. Invalid order IDs: {missing_ids}"
            ),
        )

    # Check if any orders are already assigned to routes
    from app.models.route import DriverRouteOrder

    existing_route_orders = (
        db.query(DriverRouteOrder).filter(DriverRouteOrder.order_id.in_(order_ids)).all()
    )
    logger.info(
        "[_fetch_and_validate_orders] already routed orders: %s",
        [ro.order_id for ro in existing_route_orders],
    )

    if existing_route_orders:
        assigned_order_ids = [ro.order_id for ro in existing_route_orders]
        logger.error("[_fetch_and_validate_orders] duplicate route assignment: %s", assigned_order_ids)
        raise HTTPException(
            status_code=400, detail=f"Orders already assigned to routes: {assigned_order_ids}"
        )

    # Build destinations list with coordinates
    destinations: List[Dict] = []
    for order in orders:
        # Coordinate presence validation
        if not order.load.destination_lat or not order.load.destination_lng:
            logger.error(
                "[_fetch_and_validate_orders] order %s missing coordinates (lat=%s  lng=%s)",
                order.order_number,
                order.load.destination_lat,
                order.load.destination_lng,
            )
            raise HTTPException(
                status_code=400,
                detail=f"Order {order.order_number} missing destination coordinates",
            )

        destinations.append(
            {
                "order_id": order.id,
                "lat": order.load.destination_lat,
                "lng": order.load.destination_lng,
                "address": order.load.destination_place,
            }
        )

    logger.info("[_fetch_and_validate_orders] returning %s destinations", len(destinations))
    return destinations, orders


def _optimize_destinations(start_lat: float, start_lng: float, destinations: List[Dict]) -> List[Dict]:
    logger.info("[_optimize_destinations] called with %s destinations", len(destinations))
    from app.crud.route import optimize_route_order
    result = optimize_route_order(start_lat, start_lng, destinations)
    logger.debug("[_optimize_destinations] internal optimizer returned: %s", result)
    return result


def _get_maps_polyline_and_eta(origin: Tuple[float, float], optimized_destinations: List[Dict]) -> Dict:
    """Call Google Directions via route_ai and return dict with polyline, eta, waypoint_order."""
    logger.info("[_get_maps_polyline_and_eta] origin=%s  destinations=%s", origin, len(optimized_destinations))
    from app.services.route_ai import predict_best_path

    destination_coords = [(dest["lat"], dest["lng"]) for dest in optimized_destinations]

    try:
        google_route_data = predict_best_path(
            origin=origin,
            destinations=destination_coords,
            season="current",
            notes=f"Route for {len(optimized_destinations)} deliveries",
        )
        logger.debug("[_get_maps_polyline_and_eta] Google response: %s", google_route_data)
    except Exception as exc:
        logger.exception("[_get_maps_polyline_and_eta] Google Directions failed")
        raise

    # Reorder destinations based on Google's optimization if available
    waypoint_order = google_route_data.get("waypoint_order")
    if waypoint_order and len(waypoint_order) == len(optimized_destinations):
        logger.info("[_get_maps_polyline_and_eta] applying Google waypoint_order: %s", waypoint_order)
        optimized_destinations = [optimized_destinations[i] for i in waypoint_order]

    return {
        "destinations": optimized_destinations,
        "polyline": google_route_data.get("polyline"),
        "eta_minutes": google_route_data.get("eta_minutes"),
    }


def build_route_from_current_location(
    db: Session,
    user: User,
    *,
    current_lat: float,
    current_lng: float,
    order_ids: List[UUID],
    name: str,
    description: str | None = None,
) -> Dict:
    """
    Build and persist a driver route from current location; returns response dict.
    """
    logger.info(
        "[build_route_from_current_location] user=%s  orders=%s  lat=%s  lng=%s",
        user.id,
        order_ids,
        current_lat,
        current_lng,
    )

    if not user.driver:
        logger.error("[build_route_from_current_location] user %s is not a driver", user.id)
        raise HTTPException(status_code=403, detail="Only drivers can create routes")

    try:
        destinations, _orders = _fetch_and_validate_orders(db, order_ids)
    except HTTPException:
        logger.exception("[build_route_from_current_location] validation failed")
        raise

    optimized_destinations = _optimize_destinations(current_lat, current_lng, destinations)

    # Try Google Directions for polyline and ETA, fallback if fails
    try:
        maps_result = _get_maps_polyline_and_eta(
            origin=(current_lat, current_lng), optimized_destinations=optimized_destinations
        )
        optimized_destinations = maps_result["destinations"]
        overview_polyline = maps_result.get("polyline")
        eta_minutes = maps_result.get("eta_minutes")
        logger.info(
            "[build_route_from_current_location] Google success – polyline present=%s  eta=%s",
            bool(overview_polyline),
            eta_minutes,
        )
    except Exception as e:
        logger.warning("[build_route_from_current_location] Google Maps API failed, using fallback: %s", e)
        overview_polyline = None
        eta_minutes = None

    route_data = {
        "name": name,
        "description": description,
        "origin_lat": current_lat,
        "origin_lng": current_lng,
        "destinations": optimized_destinations,
        "overview_polyline": overview_polyline,
        "eta_minutes": eta_minutes,
    }

    from app.crud.route import create_driver_route, calculate_total_route_distance
    from app.models.order import Order, OrderStatus
    from datetime import datetime
    from zoneinfo import ZoneInfo

    route = create_driver_route(db, route_data, user.driver.id)
    logger.info("[build_route_from_current_location] route persisted with id=%s", route.id)

    # Update order status to IN_TRANSIT when route is created
    try:
        order_ids = [dest["order_id"] for dest in optimized_destinations]
        current_time = datetime.now(ZoneInfo("Asia/Kolkata"))
        
        # Update all orders in the route to IN_TRANSIT status
        db.query(Order).filter(
            Order.id.in_(order_ids)
        ).update({
            Order.status: OrderStatus.IN_TRANSIT,
            Order.in_transit_at: current_time,
            Order.updated_at: current_time
        }, synchronize_session=False)
        
        db.commit()
        logger.info("[build_route_from_current_location] updated %s orders to IN_TRANSIT status", len(order_ids))
        
    except Exception as e:
        logger.error("[build_route_from_current_location] failed to update order status: %s", e)
        # Don't fail the entire route creation if status update fails
        db.rollback()

    total_distance = calculate_total_route_distance(
        current_lat, current_lng, optimized_destinations
    )

    response_data = {
        "message": "Route created successfully",
        "route_id": route.id,
        "total_distance_km": round(total_distance, 2),
        "optimized_destinations_count": len(optimized_destinations),
        "has_polyline": bool(overview_polyline),
        "eta_minutes": eta_minutes,
    }

    if overview_polyline:
        response_data["polyline"] = overview_polyline

    logger.info("[build_route_from_current_location] returning: %s", response_data)
    return response_data