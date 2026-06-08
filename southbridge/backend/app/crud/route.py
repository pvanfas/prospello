import json
from app.models.load import Load
from app.models.route import DriverRoute, DriverRouteOrder
from sqlalchemy.orm import Session, joinedload
from app.models.order import Order
from app.models.user import Driver
import uuid
import logging
import math
from typing import List

logger = logging.getLogger(__name__)


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the distance between two points using the Haversine formula
    Returns distance in kilometers
    """
    R = 6371  # Earth's radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )

    c = 2 * math.asin(math.sqrt(a))
    distance = R * c

    return distance


def optimize_route_order(
    start_lat: float, start_lng: float, destinations: List[dict]
) -> List[dict]:
    """
    Optimize route order using improved algorithm to minimize total distance
    Uses a combination of nearest neighbor with lookahead for better optimization
    """
    if not destinations:
        return []

    if len(destinations) == 1:
        return destinations

    # For small number of destinations, use brute force to find optimal route
    if len(destinations) <= 6:
        return _find_optimal_route_brute_force(start_lat, start_lng, destinations)

    # For larger numbers, use improved nearest neighbor with lookahead
    return _optimize_route_with_lookahead(start_lat, start_lng, destinations)


def _find_optimal_route_brute_force(
    start_lat: float, start_lng: float, destinations: List[dict]
) -> List[dict]:
    """
    Find the truly optimal route by checking all possible permutations
    Only feasible for small numbers of destinations (≤6)
    """
    from itertools import permutations

    min_distance = float("inf")
    best_route = destinations

    for perm in permutations(destinations):
        total_distance = 0
        current_lat, current_lng = start_lat, start_lng

        for dest in perm:
            distance = calculate_distance(
                current_lat, current_lng, dest["lat"], dest["lng"]
            )
            total_distance += distance
            current_lat, current_lng = dest["lat"], dest["lng"]

        if total_distance < min_distance:
            min_distance = total_distance
            best_route = list(perm)

    return best_route


def _optimize_route_with_lookahead(
    start_lat: float, start_lng: float, destinations: List[dict]
) -> List[dict]:
    """
    Improved nearest neighbor with lookahead to consider next 2-3 destinations
    This provides better optimization than simple nearest neighbor
    """
    optimized = []
    remaining = destinations.copy()
    current_lat, current_lng = start_lat, start_lng

    while remaining:
        if len(remaining) == 1:
            optimized.append(remaining.pop(0))
            break

        # Find the best next destination considering the next 2 destinations
        best_idx = 0
        best_score = float("inf")

        for i, dest in enumerate(remaining):
            # Calculate direct distance to this destination
            direct_distance = calculate_distance(
                current_lat, current_lng, dest["lat"], dest["lng"]
            )

            # Calculate a score that considers the next destination as well
            score = direct_distance

            # Look ahead to next destination for better optimization
            remaining_after = [d for j, d in enumerate(remaining) if j != i]
            if remaining_after:
                # Find nearest destination from current choice
                min_next_distance = float("inf")
                for next_dest in remaining_after:
                    next_distance = calculate_distance(
                        dest["lat"], dest["lng"], next_dest["lat"], next_dest["lng"]
                    )
                    min_next_distance = min(min_next_distance, next_distance)

                # Weight the score to prefer destinations that lead to shorter next hops
                score = direct_distance + (
                    min_next_distance * 0.3
                )  # 30% weight for lookahead

            if score < best_score:
                best_score = score
                best_idx = i

        # Add the best destination to optimized route
        best_dest = remaining.pop(best_idx)
        optimized.append(best_dest)

        # Update current position
        current_lat = best_dest["lat"]
        current_lng = best_dest["lng"]

    return optimized


def create_driver_route(db: Session, route_data, driver_id: int):
    """
    Create a new driver route with the given orders
    """
    try:
        # Create the driver route
        driver_route = DriverRoute(
            id=uuid.uuid4(),
            name=route_data.get("name", f"Route {driver_id}"),
            description=route_data.get("description"),
            driver=driver_id,
            origin_lat=route_data["origin_lat"],
            origin_lng=route_data["origin_lng"],
            destinations_json=json.dumps(route_data["destinations"]),
            overview_polyline=route_data.get("overview_polyline"),
            eta_minutes=route_data.get("eta_minutes"),
        )

        db.add(driver_route)
        db.flush()  # Get the ID

        # Add orders to the route
        for destination in route_data["destinations"]:
            if "order_id" in destination:
                route_order = DriverRouteOrder(
                    driver_route_id=driver_route.id, order_id=destination["order_id"]
                )
                db.add(route_order)

        db.commit()
        db.refresh(driver_route)

        # Calculate and log total route distance
        total_distance = calculate_total_route_distance(
            route_data["origin_lat"],
            route_data["origin_lng"],
            route_data["destinations"],
        )
        logger.info(
            f"Created route {driver_route.id} with total distance: {total_distance:.2f} km"
        )

        return driver_route

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating driver route: {e}")
        raise e


def calculate_total_route_distance(
    start_lat: float, start_lng: float, destinations: List[dict]
) -> float:
    """
    Calculate the total distance of a route
    """
    if not destinations:
        return 0.0

    total_distance = 0.0
    current_lat, current_lng = start_lat, start_lng

    for dest in destinations:
        distance = calculate_distance(
            current_lat, current_lng, dest["lat"], dest["lng"]
        )
        total_distance += distance
        current_lat, current_lng = dest["lat"], dest["lng"]

    return total_distance


def get_driver_routes(db: Session, driver_id: int):
    """
    Get all routes for a driver
    """
    return db.query(DriverRoute).filter(DriverRoute.driver == driver_id).all()


def get_driver_route(db: Session, route_id: str, driver_id: int):
    """
    Get a specific route for a driver
    """
    return (
        db.query(DriverRoute)
        .filter(DriverRoute.id == route_id, DriverRoute.driver == driver_id)
        .first()
    )


def update_driver_route_status(db: Session, route_id: str, status: str):
    """
    Update route status
    """
    route = db.query(DriverRoute).filter(DriverRoute.id == route_id).first()
    if route:
        route.status = status
        db.commit()
        return route
    return None


def get_route_orders(db: Session, route_id: str):
    """
    Get all orders for a specific route with their load and bid details
    """
    from app.models.bid import Bid
    
    return (
        db.query(Order)
        .join(DriverRouteOrder, DriverRouteOrder.order_id == Order.id)
        .options(
            joinedload(Order.load),
            joinedload(Order.bid)
        )
        .filter(DriverRouteOrder.driver_route_id == route_id)
        .all()
    )


def delete_driver_route(db: Session, route_id: str, driver_id: int):
    """
    Delete a driver route and its associated orders
    """
    route = (
        db.query(DriverRoute)
        .filter(DriverRoute.id == route_id, DriverRoute.driver == driver_id)
        .first()
    )

    if route:
        db.delete(route)
        db.commit()
        return True
    return False


def get_order_tracking_info(db: Session, order_id: uuid.UUID):
    """
    Get tracking information for an order including its route
    """
    try:
        # Get the order with its associated route
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return None

        # Find the route that contains this order
        route_order = (
            db.query(DriverRouteOrder)
            .filter(DriverRouteOrder.order_id == order_id)
            .first()
        )

        if not route_order:
            return {
                "order": order,
                "route": None,
                "tracking_info": {
                    "status": "not_in_route",
                    "message": "Order is not assigned to any route",
                },
            }

        route = (
            db.query(DriverRoute)
            .filter(DriverRoute.id == route_order.driver_route_id)
            .first()
        )

        return {
            "order": order,
            "route": route,
            "tracking_info": {
                "status": route.status if route else "unknown",
                "route_name": route.name if route else None,
                "driver_id": route.driver if route else None,
                "origin": (
                    {
                        "lat": route.origin_lat if route else None,
                        "lng": route.origin_lng if route else None,
                    }
                    if route
                    else None
                ),
                "destinations": (
                    json.loads(route.destinations_json)
                    if route and route.destinations_json
                    else []
                ),
            },
        }

    except Exception as e:
        logger.error(f"Error getting order tracking info: {e}")
        return None


def get_pings_of_order(db: Session, order_id: uuid.UUID):
    """
    Get location pings/tracking data for an order
    Note: This is a placeholder function since we don't have location ping tracking yet
    """
    try:
        # For now, return empty list since we don't have location ping tracking implemented
        # This would typically query a LocationPing table to get real-time tracking data
        return []

    except Exception as e:
        logger.error(f"Error getting pings for order: {e}")
        return []


def _format_routes_grouped(db: Session, routes):
    """
    Format routes into grouped structure with orders as requested by the frontend.
    Returns routes grouped by status with lowercase keys for frontend compatibility.
    """
    grouped = {
        "active": [],
        "completed": [],
        "cancelled": [],
    }

    for route in routes:
        # Fetch minimal order info for the route
        order_rows = (
            db.query(
                Order.order_number.label("order_number"),
                Load.origin.label("origin"),
                Load.destination.label("destination"),
            )
            .join(DriverRouteOrder, DriverRouteOrder.order_id == Order.id)
            .join(Load, Order.load_id == Load.id)
            .filter(DriverRouteOrder.driver_route_id == route.id)
            .order_by(Order.id.asc())
            .all()
        )

        orders_list = [
            {
                "order_number": r.order_number,
                "origin": r.origin,
                "destination": r.destination,
            }
            for r in order_rows
        ]

        # Parse destinations from JSON if available
        destinations = []
        destination_count = 0
        if route.destinations_json:
            try:
                destinations = json.loads(route.destinations_json)
                destination_count = len(destinations)
            except:
                pass

        route_dict = {
            "id": str(route.id),
            "name": route.name,
            "description": route.description,
            "status": getattr(route, "status", "active"),
            "origin": {"lat": route.origin_lat, "lng": route.origin_lng},
            "destinations": destinations,
            "destination_count": destination_count,
            "eta_minutes": route.eta_minutes,
            "overview_polyline": route.overview_polyline,
            "has_polyline": bool(route.overview_polyline),
            "orders": orders_list,
            "order_count": len(orders_list),
            "created_at": route.created_at.isoformat() if route.created_at else None,
            "updated_at": route.updated_at.isoformat() if route.updated_at else None,
        }

        status_key = (
            "completed"
            if getattr(route, "status", "").lower() == "completed"
            else (
                "cancelled"
                if getattr(route, "status", "").lower() in ("canceled", "cancelled")
                else "active"
            )
        )

        grouped[status_key].append(route_dict)

    return grouped
