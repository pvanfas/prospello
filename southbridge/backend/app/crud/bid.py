from datetime import datetime, timedelta
import json
import uuid
from zoneinfo import ZoneInfo
from fastapi import HTTPException, BackgroundTasks
from requests import Session
from app.crud.load import get_lowest_bid
from app.models.bid import Bid, BidStatus
from app.models.load import Load, LoadStatus
from app.models.user import Driver
from sqlalchemy import DECIMAL
from app.crud.order import create_order
import asyncio
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.schemas import order
from app.services.order_expiry import schedule_order_expiry
from app.services.websocket_manager import manager
from app.utils.image_url import url_for_driver_vehicle
import logging

logger = logging.getLogger(__name__)


def create_bid(db: Session, load_id: str, driver_id: int, bid_amount: float):
    # Fetch the load from the database
    load = db.query(Load).filter(Load.id == load_id).with_for_update().first()
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")

    # Create the bid
    bid = Bid(load_id=load_id, driver_id=driver_id, amount=bid_amount)

    # Update the load's lowest bid and bid count
    print(
        f"Current lowest bid: {load.lowest_bid}, New bid amount: {bid_amount}, Current bid count: {load.bid_count}-----------------"
    )
    if (
        load.lowest_bid is None
        or bid_amount < load.lowest_bid
        or load.lowest_bid == 0.0
        or load.bid_count == 0
    ):
        print("inside if")
        load.lowest_bid = bid_amount
    load.bid_count += 1

    # Add and commit the bid and load
    db.add(bid)
    db.add(load)  # Ensure load is added to the session
    db.commit()
    db.refresh(load)
    db.refresh(bid)

    return bid


def get_bids_for_load(db: Session, load_id: uuid.UUID):
    from app.models.user import User, Driver

    # Join Bid -> Driver -> User to get driver_name efficiently
    query = (
        db.query(
            Bid,
            User.username.label("driver_name"),
            Driver.vehicle_image_url.label("vehicle_image"),
        )
        .join(Driver, Bid.driver_id == Driver.id)
        .join(User, Driver.user_id == User.id)
        .filter(Bid.load_id == load_id)
    )
    results = []
    for bid, driver_name, vehicle_image in query.all():
        bid_dict = bid.__dict__.copy()
        bid_dict["driver_name"] = driver_name
        bid_dict["vehicle_image"] = url_for_driver_vehicle(vehicle_image)
        print(f"Bid fetched: {bid_dict}")
        results.append(bid_dict)
    return results


def accept_bid(
    db: Session,
    bid_id: uuid.UUID,
    expire_time_minutes: int,
    background_tasks: BackgroundTasks = None,
):
    """Accept a bid and notify the driver via WebSocket"""
    import traceback

    logger.info(f"Starting accept_bid for bid_id={bid_id}")
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    logger.info(f"Fetched bid: {bid}")
    if not bid:
        logger.error(f"Bid not found: {bid_id}")
        raise HTTPException(status_code=404, detail="Bid not found")

    load = db.query(Load).filter(Load.id == bid.load_id).first()
    logger.info(f"Fetched load: {load}")
    if not load:
        logger.error(f"Load not found for bid: {bid_id}, load_id: {bid.load_id}")
        raise HTTPException(status_code=404, detail="Load not found")

    if load.accepted_bid_id is not None:
        logger.error(f"A bid has already been accepted for load: {load.id}")
        raise HTTPException(
            status_code=400, detail="A bid has already been accepted for this load"
        )

    try:
        logger.info(f"Updating load.accepted_bid_id and statuses")
        load.accepted_bid_id = bid.id
        load.status = LoadStatus.ASSIGNED
        bid.status = BidStatus.ACCEPTED
        logger.info(f"Database updated, creating order")
        expiry_time = datetime.now(ZoneInfo("Asia/Kolkata")) + timedelta(
            minutes=expire_time_minutes + 5
        )
        order = create_order(db, load_id=load.id, bid_id=bid.id, expires_at=expiry_time)
        logger.info(f"Order created: {order}")

        driver = db.query(Driver).filter(Driver.id == bid.driver_id).first()
        logger.info(f"Fetched driver: {driver}")
        if not driver:
            logger.error(
                f"Driver not found for bid: {bid_id}, driver_id: {bid.driver_id}"
            )
            raise HTTPException(status_code=404, detail="Driver not found")

        user_id = str(driver.user_id)
        notification_message = {
            "type": "bid_accepted",
            "load_id": str(load.id),
            "bid_id": str(bid.id),
            "order_id": str(order.id) if hasattr(order, "id") else None,
            "order_number": getattr(order, "order_number", None),
            "message": f"Your bid of {bid.amount} has been accepted for load {load.id}. Order {getattr(order, 'order_number', None)} created.",
        }
        logger.info(f"Prepared notification message: {notification_message}")
        print(
            f"Scheduling order expiry for order {order.id} in {expire_time_minutes} minutes"
        )
        schedule_order_expiry(order.id, minutes=expire_time_minutes)
        if background_tasks is not None:
            background_tasks.add_task(
                run_async_notification, user_id, notification_message
            )
            schedule_order_expiry(order.id, expire_time_minutes * 60)
            logger.info(f"Notification task added to background tasks.")
        else:
            # fallback for direct call (e.g. in tests)
            import asyncio

            try:
                loop = asyncio.get_running_loop()
                loop.create_task(
                    send_bid_accepted_notification(user_id, notification_message)
                )
            except RuntimeError:
                asyncio.run(
                    send_bid_accepted_notification(user_id, notification_message)
                )
            logger.info(f"Notification sent directly (no background_tasks)")

        logger.info(
            f"Bid {bid.id} accepted for load {load.id}, order {getattr(order, 'order_number', None)} created"
        )

    except Exception as e:
        logger.error(f"Error accepting bid {bid_id}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error accepting bid: {e}")

    return bid


async def send_bid_accepted_notification(user_id: str, message: dict):
    """Helper function to send notification to user"""
    try:
        success = await manager.send_to_user(user_id, json.dumps(message))
        if success:
            logger.info(f"Bid acceptance notification sent to user {user_id}")
        else:
            logger.warning(
                f"Failed to send notification to user {user_id} - not connected"
            )
            # Here  implement fallback notification (email, SMS, push notification)
            # await send_fallback_notification(user_id, message) ----->FCM
    except Exception as e:
        logger.error(
            f"Error sending bid acceptance notification to user {user_id}: {e}"
        )


# Helper to run async notification in sync context
def run_async_notification(user_id, message):
    import asyncio

    asyncio.run(send_bid_accepted_notification(user_id, message))


def reject_bid(db: Session, bid_id: uuid.UUID):
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    if bid.status != BidStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending bids can be rejected")

    load = db.query(Load).filter(Load.id == bid.load_id).first()
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")

    load.bid_count -= 1
    if load.bid_count == 0:
        load.lowest_bid = None
    else:
        lowest_bid = (
            db.query(Bid)
            .filter(Bid.load_id == load.id, Bid.status == BidStatus.PENDING)
            .order_by(Bid.amount)
            .first()
        )
        load.lowest_bid = float(lowest_bid.amount) if lowest_bid else None

    bid.status = BidStatus.REJECTED
    db.add(bid)
    db.commit()
    db.refresh(bid)

    return bid


def get_bids_for_driver(db: Session, driver_id: int):
    results = (
        db.query(
            Bid.id,
            Bid.amount,
            Bid.status,
            Bid.created_at,
            Bid.load_id,
            Load.origin.label("origin"),
            Load.destination.label("destination"),
            Load.goods_type.label("goods_type"),
            Load.weight.label("weight"),
            # Load.pickup_date.label("pickup_date"),
            # Load.delivery_date.label("delivery_date"),
        )
        .join(Load, Bid.load_id == Load.id)
        .filter(
            Bid.driver_id == driver_id,
            Bid.status == BidStatus.PENDING,
            Load.status.in_([LoadStatus.POSTED, LoadStatus.BIDDING])
        )
        .order_by(Bid.created_at.desc())
        .all()
    )
    
    # Convert the results to dictionaries and handle Decimal conversion
    bids = []
    for result in results:
        bid_dict = {
            'id': result.id,
            'amount': float(result.amount) if result.amount else 0.0,
            'status': result.status,
            'created_at': result.created_at,
            'load_id': result.load_id,
            'origin': result.origin,
            'destination': result.destination,
            'goods_type': result.goods_type,
            'weight': str(result.weight) if result.weight else "0",
        }
        bids.append(bid_dict)
    
    return bids

def delete_bid(db: Session, bid_id: uuid.UUID):
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    load = db.query(Load).filter(Load.id == bid.load_id).first()
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")
    
    # Update load statistics
    load.bid_count -= 1
    if load.bid_count <= 0:
        load.lowest_bid = None
        load.bid_count = 0
    else:
        # Recalculate lowest bid
        load.lowest_bid = get_lowest_bid(db, load.id)
    
    # Delete the bid
    db.delete(bid)
    db.commit()
    
    return {"message": "Bid deleted successfully", "bid_id": str(bid_id)}
