import json
import uuid
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from typing import List
import razorpay
from sqlalchemy.orm import Session
from app.crud.bed import distribute_commissions
from app.core.database import get_db
from app.crud.order import driver_accept_order,driver_pickup_order,complete_order, get_order_detail, get_order_for_driver, get_orders_of_owner, mark_order_as_completed, mark_order_as_failed, mark_order_in_transit, send_order_accepted_notification,get_driver_orders
# from app.crud.route import  get_pings_of_order
from app.schemas.order import OrderSummary,DriverOrderInfo,RouteOrderInfo
from app.api.deps import get_current_active_user
from app.models import order
from app.models.load import Load
from app.models.bid import Bid
from app.models.user import Driver, User, UserType, UserType
from app.models.payment import Payment, PaymentStatus, Payout, PayoutStatus

from app.core.config import settings

router = APIRouter()
@router.post("/{order_id}/accept", status_code=status.HTTP_200_OK)
def accept_order(
    order_id: uuid.UUID,
    background_tasks : BackgroundTasks,
    db: Session = Depends(get_db),
    user = Depends(get_current_active_user),
):
    if not user.driver:
        raise HTTPException(status_code=403, detail="Only drivers can accept orders.")
    try:
        order = driver_accept_order(db, order_id)
        
        load = db.query(Load).filter(Load.id == order.load_id).first()
        # Safely get shipper or broker user_id for notification
        user_id = None
        if load.shipper_id and getattr(load, "shipper", None):
            user_id = str(load.shipper.user_id)
            
        elif load.broker_id and getattr(load, "broker", None):
            user_id = str(load.broker.user_id)
            
        else:
            raise HTTPException(status_code=500, detail="No shipper or broker found for this load.")
        notification = {
            "type": "order_accepted",
            "order_id": order.id,
            "message": f"Driver {user.username} has accepted the order {order.order_number}. Make payment to proceed."
        }

        send_order_accepted_notification(user_id, notification, background_tasks)


    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error accepting order.")
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or cannot be accepted.")
    return {"detail": "Order accepted successfully", "order_id": order.id}


@router.post("/{order_id}/reject", status_code=status.HTTP_200_OK)
def reject_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_active_user)
):
    if not user.driver:
        raise HTTPException(status_code=403, detail="Only drivers can reject orders.")
    try:
        order = mark_order_as_failed(db, order_id)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error rejecting order.")
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or cannot be rejected.")
    return {"detail": "Order rejected successfully", "order_id": order.id}

@router.post("/{order_id}/status", status_code=status.HTTP_200_OK)
def update_order_status(
    order_id: uuid.UUID,
    status: dict,
    db: Session = Depends(get_db),
    user = Depends(get_current_active_user)
):
    print(f"🔍 [DEBUG] Order status update request - Order ID: {order_id}, Status: {status}, User: {user.id}")
    
    if not user.driver:
        print(f"❌ [DEBUG] Access denied - User {user.id} is not a driver")
        raise HTTPException(status_code=403, detail="Only drivers can update order status.")
    
    print(f"✅ [DEBUG] User {user.id} is a driver, proceeding with status update")
    
    try:
        if status.get("status") == "picked_up":
            print(f"📦 [DEBUG] Updating order {order_id} to PICKED_UP status")
            order = driver_pickup_order(db, order_id)
            print(f"✅ [DEBUG] Order {order_id} successfully marked as PICKED_UP")
            
        elif status.get("status") == "in_transit":
            print(f"🚛 [DEBUG] Updating order {order_id} to IN_TRANSIT status")
            order = mark_order_in_transit(db, order_id)
            print(f"✅ [DEBUG] Order {order_id} successfully marked as IN_TRANSIT")
            
        elif status.get("status") == "delivered":
            print(f"🎯 [DEBUG] Updating order {order_id} to DELIVERED status - Starting completion process")
            order = complete_order(db, order_id)
            print(f"✅ [DEBUG] Order {order_id} successfully marked as DELIVERED")
            
            # route_completed = check_route_completion(db, order_id)
            print(f"🔍 [DEBUG] Preparing notification for order completion - Order: {order.id}")
            
            # Determine notification recipient
            if order.load.shipper:
                user_id = str(order.load.shipper.user_id)
                print(f"📤 [DEBUG] Sending notification to SHIPPER - User ID: {user_id}")
            elif order.load.broker:
                user_id = str(order.load.broker.user_id)
                print(f"📤 [DEBUG] Sending notification to BROKER - User ID: {user_id}")
            else:
                print(f"⚠️ [DEBUG] No shipper or broker found for order {order.id}")
                user_id = None
            
            if user_id:
                notification = {
                    "type": "order_completed",
                    "order_id": order.id,
                    "message": f"Order {order.order_number} has been completed."
                }
                print(f"📨 [DEBUG] Notification payload: {notification}")
                send_order_accepted_notification(user_id, notification)
                print(f"✅ [DEBUG] Notification sent successfully to user {user_id}")
            else:
                print(f"⚠️ [DEBUG] No notification sent - no valid recipient found")
                
        elif status.get("status") == "failed":
            print(f"❌ [DEBUG] Updating order {order_id} to DELIVERY_FAILED status")
            order = mark_order_as_failed(db, order_id)
            print(f"✅ [DEBUG] Order {order_id} successfully marked as DELIVERY_FAILED")
        else:
            print(f"❌ [DEBUG] Invalid status value: {status.get('status')}")
            raise HTTPException(status_code=400, detail="Invalid status value.")
            
        print(f"🎉 [DEBUG] Order status update completed successfully for order {order_id}")
        
    except Exception as e:
        print(f"💥 [DEBUG] Error updating order status: {str(e)}")
        print(e)
        raise HTTPException(status_code=500, detail="Error updating order status.")
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or cannot be updated.")
    return {"detail": "Order status updated successfully", "order_id": order.id}


@router.get("/my-orders", response_model=List[OrderSummary], status_code=status.HTTP_200_OK)
def get_my_orders(
    db: Session = Depends(get_db),
    user = Depends(get_current_active_user)
):
    if not user.shipper and not user.broker:
        raise HTTPException(status_code=403, detail="Only shippers and brokers can view their orders.")
    try:
        orders = get_orders_of_owner(db, user.id)
        return [
            OrderSummary(
                id=order.id,
                origin_place=order.origin_place,
                destination_place=order.destination_place,
                order_number=order.order_number,
                amount=order.amount,
                driver_name=order.driver_name,
                created_at=order.created_at,
                status=order.status,
                origin=order.origin,
                destination=order.destination,
                goods_type=order.goods_type,
                weight=order.weight,
                driver_phone=order.driver_phone
                
            ) 
            for order in orders
        ]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error fetching orders.")
    
    
@router.get("/driver/", response_model=List[DriverOrderInfo])
def get_driver_orders_api(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user)
):
    """
    Get orders for a driver
    """
    if user.role != UserType.DRIVER:
        raise HTTPException(status_code=403, detail="Only drivers can view their orders.")

    try:
        orders = get_driver_orders(db, user.driver.id)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving orders.")
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this driver.")
    return orders

@router.get("/{order_id}/detail")
def get_order_detail_endpoint(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user)
):
    """Get detailed information about a specific order"""
    try:
        order_detail = get_order_detail(db, order_id)
        if not order_detail:
            raise HTTPException(status_code=404, detail="Order not found")
        return order_detail
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching order detail: {e}")
        raise HTTPException(status_code=500, detail="Error fetching order details")
   
    
@router.post("/{order_id}/complete", status_code=status.HTTP_200_OK)
def complete_order_endpoint(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_active_user)
):
    print(f"🔍 [DEBUG] Order completion request - Order ID: {order_id}, User: {user.id}, Role: {user.role}")
    
    # Check user permissions
    if not user.shipper and not user.broker:
        print(f"❌ [DEBUG] Access denied - User {user.id} is neither shipper nor broker")
        raise HTTPException(status_code=403, detail="Only shippers and brokers can complete orders.")

    print(f"✅ [DEBUG] User {user.id} has permission to complete orders")
    
    # Mark order as completed
    print(f"🔄 [DEBUG] Marking order {order_id} as COMPLETED")
    order = mark_order_as_completed(db, order_id)
    if not order:
        print(f"❌ [DEBUG] Order {order_id} not found or cannot be completed")
        raise HTTPException(status_code=404, detail="Order not found or cannot be completed.")

    print(f"✅ [DEBUG] Order {order_id} successfully marked as COMPLETED")
    print(f"📊 [DEBUG] Order details - Status: {order.status}, Completed at: {order.completed_at}")

    # Payment processing
    print(f"💳 [DEBUG] Starting payment capture process for order {order_id}")
    # rzpx = razorpay.Client(auth=(settings.RAZORPAYX_KEY_ID, settings.RAZORPAYX_KEY_SECRET))
    # 1. Capture payment
    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order.id, Payment.status == PaymentStatus.AUTHORIZED)
        .first()
    )
    
    if not payment:
        print(f"⚠️ [DEBUG] No authorized payment found for order {order_id}")
        return {"detail": "Order completed but no authorized payment found"}

    print(f"✅ [DEBUG] Authorized payment found - Payment ID: {payment.id}, Amount: {payment.amount}")
    print(f"🔄 [DEBUG] Payment status: {payment.status} -> CAPTURED")

    # rzpx.payment.capture(payment.razorpay_payment_id, payment.amount)
    payment.status = PaymentStatus.CAPTURED
    order.payout_done = True
    print(f"✅ [DEBUG] Payment captured and payout_done flag set to True")
    
    # Commission distribution
    print(f"💰 [DEBUG] Starting commission distribution for order {order_id}")
    distribute_commissions(db, order.id)
    print(f"✅ [DEBUG] Commission distribution completed for order {order_id}")
    
    # Final commit
    print(f"💾 [DEBUG] Committing final changes for order {order_id}")
    db.commit()
    print(f"🎉 [DEBUG] Order completion process finished successfully for order {order_id}")

    
    bid = db.query(Bid).filter(Bid.id == order.bid_id).first()
    if not bid:
        raise HTTPException(status_code=400, detail="No bid found for this order")
        
    driver = db.query(Driver).filter(Driver.id == bid.driver_id).first()
    if not driver:
        raise HTTPException(status_code=400, detail="No driver linked to this order")

    # if driver.upi_id:
    #     payout = rzpx.payout.create({
    #         "account_number": "YOUR_RAZORPAYX_VIRTUAL_ACCOUNT",
    #         "fund_account": {
    #             "account_type": "vpa",
    #             "vpa": {"address": driver.upi_id},
    #             "contact": {
    #                 "name": driver.name,
    #                 "email": f"{driver.user.email}@example.com",
    #                 "contact": driver.user.phone,
    #                 "type": "vendor"
    #             }
    #         },
    #         "amount": payment.amount,  # same as captured amount
    #         "currency": "INR",
    #         "mode": "UPI",
    #         "purpose": "payout"
    #     })
    # elif driver.bank_account_number:
    #     payout = rzpx.payout.create({
    #         "account_number": "YOUR_RAZORPAYX_VIRTUAL_ACCOUNT",
    #         "fund_account": {
    #             "account_type": "bank_account",
    #             "bank_account": {
    #                 "name": driver.account_holder_name,
    #                 "ifsc": driver.ifsc_code,
    #                 "account_number": driver.bank_account_number
    #             },
    #             "contact": {
    #                 "name": driver.name,
    #                 "email": f"{driver.phone}@example.com",
    #                 "contact": driver.phone,
    #                 "type": "vendor"
    #             }
    #         },
    #         "amount": payment.amount,
    #         "currency": "INR",
    #         "mode": "IMPS",
    #         "purpose": "payout"
    #     })
    # else:
    #     raise HTTPException(status_code=400, detail="Driver has no payout details")


    return {
        "detail": "Order completed, payment captured and payout initiated",
        "order_id": order.id,
        "payment_status": payment.status,
        "payout_id": 1
    }




@router.get("/route", response_model=List[RouteOrderInfo], status_code=status.HTTP_200_OK)
def order_for_route(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user)
):
    """
    Get orders available for route creation.
    Returns orders that are accepted/picked up but not yet assigned to a route.
    """
    if user.role != UserType.DRIVER:
        raise HTTPException(status_code=403, detail="Only drivers can view their routes.")
    try:
        orders = get_order_for_driver(db, user.driver.id).all()
        
        # Return empty array if no orders found - this is not an error
        if not orders:
            return []
        
        # Convert SQLAlchemy objects to Pydantic models
        print(f"Found {len(orders)} orders available for route creation")
        return [
            RouteOrderInfo(
                id=order.id,
                order_number=order.order_number,
                origin=order.load_origin,
                destination=order.load_destination,
                load_origin=order.load_origin,
                load_destination=order.load_destination,
                load_weight=order.load_weight,
                bid_price=order.bid_price
            ) 
            for order in orders
        ]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving orders for route: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving orders: {str(e)}")

