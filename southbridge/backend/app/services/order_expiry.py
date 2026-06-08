# app/services/order_expiry.py
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from uuid import UUID
from app.services.scheduler import scheduler
from app.core.database import SessionLocal
from app.models.order import Order, OrderStatus  # adjust import to match your actual file
from app.models.bid import Bid, BidStatus        # same here
from app.models.load import Load, LoadStatus
import logging

logger = logging.getLogger(__name__)

def _job_id(order_id: UUID) -> str:
    return f"expire_order_{order_id}"

def schedule_order_expiry(order_id: UUID, minutes: int):
    run_time = datetime.now(ZoneInfo("Asia/Kolkata")) + timedelta(minutes=minutes)
    scheduler.add_job(
        expire_order_job,
        "date",
        run_date=run_time,
        args=[order_id],
        id=_job_id(order_id),
        replace_existing=True,
    )
    logger.info(f"Scheduled expiry for order {order_id} at {run_time}")

def cancel_order_expiry(order_id: UUID):
    try:
        scheduler.remove_job(_job_id(order_id))
        logger.info(f"Cancelled expiry for order {order_id}")
    except Exception:
        logger.debug(f"No expiry job found for order {order_id}")

def expire_order_job(order_id: UUID):
    db: Session = SessionLocal()
    try:
        order = db.query(Order).get(order_id)
        if not order or order.status != OrderStatus.BID_ACCEPTED:
            return

        # revert bid
        bid = db.query(Bid).get(order.bid_id)
        if bid:
            bid.status = BidStatus.PENDING

        # revert load
        load = db.query(Load).get(order.load_id)
        if load:
            load.status = LoadStatus.BIDDING
            load.accepted_bid_id = None

        # delete order
        db.delete(order)
        db.commit()
        logger.info(f"Order {order_id} expired and reverted")
    except Exception as e:
        logger.error(f"Error expiring order {order_id}: {e}")
        db.rollback()
    finally:
        db.close()
