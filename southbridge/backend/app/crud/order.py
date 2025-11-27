from datetime import datetime
import logging

from sqlalchemy import UUID
from uuid import UUID as PyUUID
from zoneinfo import ZoneInfo
import uuid
# from app.crud.bid import run_async_notification
from app.models.bid import Bid, BidStatus
from app.models.order import Order, OrderStatus
from sqlalchemy.orm import Session
import json
from app.models.user import Broker, Driver, Shipper, User, DriverStatus
from app.models.load import Load, LoadStatus
from app.models.route import DriverRouteOrder
from app.services.order_expiry import cancel_order_expiry
from app.services.websocket_manager import manager
from fastapi import BackgroundTasks
import logging
import asyncio
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

# from app.utils.notification import send_order_accepted_ws_notification

logger = logging.getLogger(__name__)


def create_order(db: Session, load_id: uuid.UUID, bid_id: uuid.UUID, expires_at: datetime) -> Order:
    order = Order(
        load_id=load_id,
        bid_id=bid_id,
        status=OrderStatus.BID_ACCEPTED,
        expires_at=expires_at,
        bid_accepted_at=datetime.now(),
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    order.order_number = order.generate_order_number()
    db.commit()
    db.refresh(order)

    return order


def driver_accept_order(db: Session, order_id: uuid.UUID) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        order.status = OrderStatus.DRIVER_ACCEPTED
        order.driver_accepted_at = datetime.now(ZoneInfo("Asia/Kolkata"))
        driver = order.bid.driver
        driver.current_load_weight += order.load.weight
        driver.status = DriverStatus.BUSY
        load = order.load
        load.assigned_driver_id = driver.id
        db.commit()
        db.refresh(order)
    cancel_order_expiry(order.id)
    return order


def driver_pickup_order(db: Session, order_id: uuid.UUID) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        order.status = OrderStatus.PICKED_UP
        order.picked_up_at = datetime.now(ZoneInfo("Asia/Kolkata"))
        driver = order.bid.driver
        driver.status = DriverStatus.ON_TRIP
        db.commit()
        db.refresh(order)
    return order


def mark_order_in_transit(db: Session, order_id: uuid.UUID) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        order.status = OrderStatus.IN_TRANSIT
        order.in_transit_at = datetime.now(ZoneInfo("Asia/Kolkata"))
        db.commit()
        db.refresh(order)
    return order


def complete_order(db: Session, order_id: uuid.UUID) -> Order:
    print(f"🔍 [DEBUG] Starting complete_order function for order ID: {order_id}")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        print(f"❌ [DEBUG] Order {order_id} not found in database")
        return None
        
    print(f"✅ [DEBUG] Order {order_id} found - Current status: {order.status}")
    print(f"📊 [DEBUG] Order details - Load ID: {order.load_id}, Bid ID: {order.bid_id}")
    
    # Update order status
    print(f"🔄 [DEBUG] Updating order status from {order.status} to DELIVERED")
    order.status = OrderStatus.DELIVERED
    order.delivered_at = datetime.now(ZoneInfo("Asia/Kolkata"))
    print(f"✅ [DEBUG] Order status updated to DELIVERED at {order.delivered_at}")
    
    # Get driver and load information
    driver = order.bid.driver
    load = order.load
    print(f"👤 [DEBUG] Driver ID: {driver.id}, Current load weight: {driver.current_load_weight}")
    print(f"📦 [DEBUG] Load weight: {load.weight}, Load ID: {load.id}")
    
    # Update driver's current load weight
    old_weight = driver.current_load_weight
    driver.current_load_weight -= load.weight
    print(f"⚖️ [DEBUG] Driver load weight updated: {old_weight} -> {driver.current_load_weight}")
    
    # Update driver status based on remaining load
    old_status = driver.status
    if driver.current_load_weight == 0:
        driver.status = DriverStatus.AVAILABLE
        print(f"🟢 [DEBUG] Driver status changed from {old_status} to AVAILABLE (no more load)")
    else:
        driver.status = DriverStatus.BUSY
        print(f"🟡 [DEBUG] Driver status remains BUSY (still has {driver.current_load_weight} kg load)")
    
    # Clear load assignment
    print(f"🔗 [DEBUG] Clearing load assignment - Load ID: {load.id}")
    load.assigned_driver_id = None
    print(f"✅ [DEBUG] Load {load.id} assignment cleared")
    
    # Update driver trip count
    old_trips = driver.total_trips
    driver.total_trips += 1
    print(f"📈 [DEBUG] Driver trip count updated: {old_trips} -> {driver.total_trips}")
    
    # Commission distribution logic
    print(f"💰 [DEBUG] Starting commission distribution for order {order_id}")
    try:
        from app.crud.bed import distribute_commissions
        distribute_commissions(db, order_id)
        print(f"✅ [DEBUG] Commission distribution completed for order {order_id}")
    except Exception as e:
        print(f"⚠️ [DEBUG] Commission distribution failed for order {order_id}: {str(e)}")
        # Continue with order completion even if commission distribution fails
    
    # Commit changes
    print(f"💾 [DEBUG] Committing database changes for order {order_id}")
    db.commit()
    db.refresh(order)
    print(f"✅ [DEBUG] Database changes committed and order refreshed")
    
    print(f"🎉 [DEBUG] complete_order function completed successfully for order {order_id}")
    return order


def cancel_order(db: Session, order_id: uuid.UUID) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        order.status = OrderStatus.CANCELED
        order.canceled_at = datetime.now(ZoneInfo("Asia/Kolkata"))
        db.commit()
        db.refresh(order)
    return order


def mark_order_as_completed(db: Session, order_id: uuid.UUID) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        order.status = OrderStatus.COMPLETED
        order.completed_at = datetime.now(ZoneInfo("Asia/Kolkata"))
        db.commit()
        db.refresh(order)
    return order


def mark_order_as_delivery_failed(db: Session, order_id: uuid.UUID) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        order.status = OrderStatus.DELIVERY_FAILED
        order.delivery_failed_at = datetime.now(ZoneInfo("Asia/Kolkata"))
        driver = order.bid.driver
        driver.current_load_weight -= order.load.weight
        if driver.current_load_weight == 0:
            driver.status = DriverStatus.AVAILABLE
        else:
            driver.status = DriverStatus.BUSY
        load = order.load
        load.assigned_driver_id = None
        db.commit()
        db.refresh(order)
    return order


def mark_order_as_failed(db: Session, order_id: uuid.UUID) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        order.status = OrderStatus.DELIVERY_FAILED
        order.delivery_failed_at = datetime.now(ZoneInfo("Asia/Kolkata"))
        db.commit()
        db.refresh(order)
    return order


def mark_order_as_rejected(db: Session, order_id: uuid.UUID) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        order.status = OrderStatus.DRIVER_REJECTED
        order.driver_rejected_at = datetime.now(ZoneInfo("Asia/Kolkata"))
        load = order.load
        load.status = LoadStatus.BIDDING
        load.accepted_bid_id = None
        load.assigned_driver_id = None
        load.bid_count -= 1
        load.lowest_bid = (
            None
            if load.bid_count == 0
            else float(
                db.query(Bid)
                .filter(Bid.load_id == load.id, Bid.status == BidStatus.PENDING)
                .order_by(Bid.amount)
                .first()
                .amount
            )
        )
        bid = order.bid
        bid.status = BidStatus.REJECTED
        driver = bid.driver
        driver.current_load_weight -= order.load.weight
        driver.status = DriverStatus.AVAILABLE
        db.commit()
        db.refresh(order)
    return order


async def send_order_accepted_ws_notification(user_id: str, notification: dict):
    print(f"🔍 [DEBUG] Starting WebSocket notification to user {user_id}")
    print(f"📨 [DEBUG] Notification payload: {notification}")
    
    try:
        print(f"🌐 [DEBUG] Attempting to send WebSocket message to user {user_id}")
        success = await manager.send_to_user(user_id, json.dumps(notification))
        
        if success:
            print(f"✅ [DEBUG] WebSocket notification sent successfully to user {user_id}")
            logger.info(f"✅ Order accepted notification sent to user {user_id}")
        else:
            print(f"⚠️ [DEBUG] Failed to send WebSocket notification to user {user_id} - user not connected")
            logger.warning(
                f"⚠️ Failed to send order accepted notification to user {user_id} - user not connected"
            )
            # Optional: Fallback to email, SMS, push, etc.
            
    except Exception as e:
        print(f"💥 [DEBUG] Error sending WebSocket notification to user {user_id}: {str(e)}")
        logger.error(
            f"❌ Error sending order accepted notification to user {user_id}: {e}"
        )


def send_order_accepted_notification(
    user_id: str, notification: dict, background_tasks: BackgroundTasks | None = None
):
    print(f"🔍 [DEBUG] Starting notification dispatch for user {user_id}")
    print(f"📋 [DEBUG] Background tasks available: {background_tasks is not None}")
    
    if background_tasks is not None:
        # Use FastAPI background task
        print(f"🔄 [DEBUG] Scheduling notification as background task for user {user_id}")
        background_tasks.add_task(
            send_order_accepted_ws_notification, user_id, notification
        )
        print(f"✅ [DEBUG] Background task scheduled successfully for user {user_id}")
        logger.info(
            f"📌 Scheduled order accepted notification for user {user_id} in background"
        )
    else:
        print(f"🔄 [DEBUG] No background tasks available, running notification directly")
        try:
            print(f"🔍 [DEBUG] Attempting to get running event loop")
            loop = asyncio.get_running_loop()
            print(f"✅ [DEBUG] Event loop found, creating task")
            loop.create_task(send_order_accepted_ws_notification(user_id, notification))
            print(f"✅ [DEBUG] Task created in running loop for user {user_id}")
            logger.info(
                f"📌 Scheduled order accepted notification for user {user_id} in running loop"
            )
        except RuntimeError:
            print(f"⚠️ [DEBUG] No running loop found, running asyncio.run directly")
            asyncio.run(send_order_accepted_ws_notification(user_id, notification))
            print(f"✅ [DEBUG] Notification executed directly for user {user_id}")
            logger.info(
                f"📌 Ran order accepted notification directly for user {user_id}"
            )
    
    print(f"🎉 [DEBUG] Notification dispatch completed for user {user_id}")


def get_orders_of_owner(db: Session, owner_id: UUID):
    return (
        db.query(
            Order.id,
            Order.order_number,
            Bid.amount,
            User.username.label("driver_name"),
            User.phone_number.label("driver_phone"),
            Order.created_at,
            Order.status,
            Load.origin,
            Load.destination,
            Load.origin_place,
            Load.destination_place,
            Load.goods_type,
            Load.weight,
        )
        .join(Load, Order.load_id == Load.id)
        .join(Bid, Order.bid_id == Bid.id)
        .join(Driver, Bid.driver_id == Driver.id)
        .join(User, Driver.user_id == User.id)
        .filter(
            Order.status.in_(
                [
                    OrderStatus.DRIVER_ACCEPTED,
                    OrderStatus.BID_ACCEPTED,
                    OrderStatus.DELIVERED,
                    OrderStatus.CANCELED,
                    OrderStatus.IN_TRANSIT,
                    OrderStatus.PENDING,
                    OrderStatus.PICKED_UP,
                    OrderStatus.COMPLETED,
                    OrderStatus.DELIVERY_FAILED,
                ]
            ),
            (
                (Load.shipper.has(Shipper.user_id == owner_id))
                | (Load.broker.has(Broker.user_id == owner_id))
            ),
        )
        .all()
    )

def get_driver_orders(db: Session, driver_id: int):
    

    # Build query with joins
    results = (
        db.query(
            Order.id.label("id"),
            Order.order_number.label("order_number"),
            Load.origin.label("load_origin"),
            Load.destination.label("load_destination"),
            Load.origin_place.label("load_origin_place"),
            Load.destination_place.label("load_destination_place"),
            Load.origin_lat.label("load_origin_lat"),
            Load.origin_lng.label("load_origin_long"),
            Load.weight.label("load_weight"),
            Bid.amount.label("bid_price"),
            User.phone_number.label("load_owner_phone"),
            User.username.label("load_owner_name"),
            Order.status.label("status"),
            Order.created_at.label("created_at"),
            Order.expires_at.label("expires_at"),
            Order.bid_accepted_at.label("bid_accepted_at"),
        )
        # Order has bid_id and load_id
        .join(Bid, Order.bid_id == Bid.id)
        .join(Load, Order.load_id == Load.id)
        # Left join shipper and broker (both optional)
        .outerjoin(Shipper, Load.shipper_id == Shipper.id)
        .outerjoin(Broker, Load.broker_id == Broker.id)
        # Join User via either shipper.user_id or broker.user_id
        .outerjoin(User, (Shipper.user_id == User.id) | (Broker.user_id == User.id))
        # Filter for this driver
        .filter(Bid.driver_id == driver_id)
        .order_by(Order.created_at.desc())
        .all()
    )

    # Convert to list of dicts
    return [dict(row._mapping) for row in results]


# ===== ADMIN ORDER CRUD OPERATIONS =====

def get_orders_admin(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    status: Optional[str] = None,
    driver_id: Optional[int] = None,
    shipper_id: Optional[int] = None,
    broker_id: Optional[int] = None
) -> List[Order]:
    """Get all orders with optional filtering and pagination for admin"""
    query = db.query(Order)
    
    if search:
        search_filter = or_(
            Order.order_number.ilike(f"%{search}%"),
            Load.origin.ilike(f"%{search}%"),
            Load.destination.ilike(f"%{search}%"),
            Load.goods_type.ilike(f"%{search}%")
        )
        query = query.join(Load, Order.load_id == Load.id).filter(search_filter)
    
    if status:
        query = query.filter(Order.status == status)
    
    if driver_id:
        query = query.join(Bid, Order.bid_id == Bid.id).filter(Bid.driver_id == driver_id)
    
    if shipper_id:
        query = query.join(Load, Order.load_id == Load.id).filter(Load.shipper_id == shipper_id)
    
    if broker_id:
        query = query.join(Load, Order.load_id == Load.id).filter(Load.broker_id == broker_id)
    
    return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

def get_order_admin(db: Session, order_id: uuid.UUID) -> Optional[Order]:
    """Get order by ID for admin"""
    return db.query(Order).filter(Order.id == order_id).first()

def get_order_stats_admin(db: Session, order_id: uuid.UUID) -> dict:
    """Get statistics for a specific order"""
    order = get_order_admin(db, order_id)
    if not order:
        return {}
    
    # Get related data
    load = db.query(Load).filter(Load.id == order.load_id).first()
    bid = db.query(Bid).filter(Bid.id == order.bid_id).first()
    
    return {
        'load_id': order.load_id,
        'bid_id': order.bid_id,
        'driver_id': bid.driver_id if bid else None,
        'shipper_id': load.shipper_id if load else None,
        'broker_id': load.broker_id if load else None,
        'amount': float(bid.amount) if bid else 0.0,
        'weight': float(load.weight) if load else 0.0
    }



def get_order_for_driver(db: Session, driver_id: int):
    orders = (
        db.query(
            Order.id,
            Order.order_number,
            Load.origin.label("load_origin"),
            Load.destination.label("load_destination"),
            Load.weight.label("load_weight"),
            Bid.amount.label("bid_price"),
        )
        .join(Bid, Order.bid_id == Bid.id)
        .join(Load, Order.load_id == Load.id)
        .outerjoin(DriverRouteOrder, Order.id == DriverRouteOrder.order_id)
        .filter(
            Order.status.in_(
                [OrderStatus.PICKED_UP,]
            ),
            Bid.driver_id == driver_id,
            DriverRouteOrder.order_id.is_(None)  # Only orders without driver routes
        )
        .order_by(Order.created_at.desc())
    )
    return orders

def get_order_detail(db: Session, order_id: uuid.UUID):
    """
    Get detailed information about a specific order including load, bid, and driver details
    """
    order = (
        db.query(Order)
        .options(
            joinedload(Order.load),
            joinedload(Order.bid).joinedload(Bid.driver).joinedload(Driver.user)
        )
        .filter(Order.id == order_id)
        .first()
    )
    
    if not order:
        return None
    
    load = order.load
    bid = order.bid
    driver = bid.driver if bid else None
    driver_user = driver.user if driver else None
    
    # Get shipper or broker info
    owner_name = None
    owner_phone = None
    owner_type = None
    
    if load.shipper_id:
        shipper = db.query(Shipper).filter(Shipper.id == load.shipper_id).first()
        if shipper:
            owner_user = db.query(User).filter(User.id == shipper.user_id).first()
            if owner_user:
                owner_name = owner_user.username
                owner_phone = owner_user.phone_number
                owner_type = "Shipper"
    elif load.broker_id:
        broker = db.query(Broker).filter(Broker.id == load.broker_id).first()
        if broker:
            owner_user = db.query(User).filter(User.id == broker.user_id).first()
            if owner_user:
                owner_name = owner_user.username
                owner_phone = owner_user.phone_number
                owner_type = "Broker"
    
    return {
        "id": order.id,
        "order_number": order.order_number,
        "status": order.status.value,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "bid_accepted_at": order.bid_accepted_at.isoformat() if order.bid_accepted_at else None,
        "driver_accepted_at": order.driver_accepted_at.isoformat() if order.driver_accepted_at else None,
        "picked_up_at": order.picked_up_at.isoformat() if order.picked_up_at else None,
        "in_transit_at": order.in_transit_at.isoformat() if order.in_transit_at else None,
        "delivered_at": order.delivered_at.isoformat() if order.delivered_at else None,
        "completed_at": order.completed_at.isoformat() if order.completed_at else None,
        "expires_at": order.expires_at.isoformat() if order.expires_at else None,
        
        # Load details
        "load": {
            "id": str(load.id),
            "origin": load.origin,
            "destination": load.destination,
            "origin_lat": load.origin_lat,
            "origin_lng": load.origin_lng,
            "destination_lat": load.destination_lat,
            "destination_lng": load.destination_lng,
            "goods_type": load.goods_type,
            "weight": str(load.weight) if load.weight else "N/A",
            "dimensions": load.dimensions,
            "special_instructions": load.special_instructions,
            "category": load.category.value if load.category else None,
            "status": load.status.value if load.status else None,
            "image_url": load.image,
        },
        
        # Bid details
        "bid": {
            "id": str(bid.id) if bid else None,
            "amount": float(bid.amount) if bid and bid.amount else 0,
            "status": bid.status.value if bid and bid.status else None,
            "created_at": bid.created_at.isoformat() if bid and bid.created_at else None,
        },
        
        # Driver details
        "driver": {
            "id": driver.id if driver else None,
            "name": driver_user.username if driver_user else None,
            "phone": driver_user.phone_number if driver_user else None,
            "vehicle_type": driver.vehicle_type if driver else None,
            "vehicle_registration": driver.vehicle_registration if driver else None,
            "max_weight_capacity": str(driver.max_weight_capacity) if driver and driver.max_weight_capacity else None,
            "status": driver.status.value if driver and driver.status else None,
        },
        
        # Owner (Shipper/Broker) details
        "owner": {
            "name": owner_name,
            "phone": owner_phone,
            "type": owner_type,
        }
    }


def get_orders_for_showing_route(db: Session, route_id: uuid.UUID):
    """
    Get all orders linked to a specific driver route (one-to-many relationship).
    Uses a JOIN for efficiency.
    """
    orders = (
        db.query(Order.id,
                 Order.order_number,
             
                 Order.status,
                 Order.created_at,
              
                 Load.origin.label("load_origin"),
                 Load.destination.label("load_destination"),
                 Load.goods_type.label("load_goods_type"),
                 Load.weight.label("load_weight"),
                 Load.origin_lat.label("load_origin_lat"),
                 Load.origin_lng.label("load_origin_lng"),
                 Load.destination_lat.label("load_destination_lat"),
                 Load.destination_lng.label("load_destination_lng"),
                 
              
                 Order.picked_up_at,
                 Bid.amount.label("bid_amount"))
        .join(DriverRouteOrder, DriverRouteOrder.order_id == Order.id)
        .join(Load, Order.load_id == Load.id)
        .join(Bid, Order.bid_id == Bid.id)
        .filter(DriverRouteOrder.driver_route_id == route_id)
        .all()
    )
    
    # Convert Row objects to dictionaries for JSON serialization
    return [
        {
            "id": str(order.id),
            "order_number": order.order_number,
            "status": order.status,
            "load_goods_type": order.load_goods_type,
            "load_weight": order.load_weight,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "load_origin": order.load_origin,
            "load_destination": order.load_destination,
            "load_origin_lat": float(order.load_origin_lat) if order.load_origin_lat else None,
            "load_origin_lng": float(order.load_origin_lng) if order.load_origin_lng else None,
            "load_destination_lat": float(order.load_destination_lat) if order.load_destination_lat else None,
            "load_destination_lng": float(order.load_destination_lng) if order.load_destination_lng else None,
            "picked_up": order.picked_up_at.isoformat() if order.picked_up_at else None,
            
            "bid_price": float(order.bid_amount) if order.bid_amount else None,
        }
        for order in orders
    ]