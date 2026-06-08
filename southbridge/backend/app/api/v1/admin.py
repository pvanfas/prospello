from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, select, and_, or_
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User, UserType, Driver, Shipper, Broker, VerificationStatus
from app.models.load import Load
from app.models.bid import Bid
from app.models.order import Order
from app.models.payment import Payment
from app.models.service import ServiceCategory, ServiceProvider, ServiceProviderCategory, ServiceBooking, ServiceReview
from app.api.deps import get_current_user
from app.schemas.admin import (
    AdminUserCreate, AdminUserUpdate, AdminUserResponse, AdminUserDetailResponse,
    AdminLoadCreate, AdminLoadUpdate, AdminLoadResponse, AdminLoadDetailResponse,
    AdminBidCreate, AdminBidUpdate, AdminBidResponse,
    AdminOrderCreate, AdminOrderUpdate, AdminOrderResponse, AdminOrderDetailResponse,
    AdminPaymentCreate, AdminPaymentUpdate, AdminPaymentResponse, AdminPaymentDetailResponse,
    AdminPayoutCreate, AdminPayoutUpdate, AdminPayoutResponse, AdminPayoutDetailResponse,
    AdminStatsResponse, AdminBrokerCreate, AdminBrokerUpdate, AdminBrokerResponse, AdminBrokerDetailResponse,
    AdminShipperCreate, AdminShipperUpdate, AdminShipperResponse, AdminShipperDetailResponse,
    AdminDriverCreate, AdminDriverUpdate, AdminDriverResponse, AdminDriverDetailResponse
)
from app.crud.user import create_user, get_user, update_user, delete_user, get_brokers, get_broker, create_broker, update_broker, deactivate_broker, delete_broker, get_broker_stats, get_shippers, get_shipper, create_shipper, update_shipper, deactivate_shipper, delete_shipper, get_shipper_stats, get_drivers, get_driver, create_driver, update_driver, deactivate_driver, delete_driver, get_driver_stats, verify_driver, reject_driver, verify_broker, reject_broker, verify_shipper, reject_shipper
from app.crud.load import create_load, get_load, update_load, delete_load, get_loads_admin, get_load_admin, create_load_admin, update_load_admin, delete_load_admin, get_load_stats_admin
from app.crud.bid import create_bid, get_bids_for_load
from app.crud.order import create_order, get_orders_of_owner, get_driver_orders, get_orders_admin, get_order_admin, get_order_stats_admin
from app.crud.payment import create_payment, get_payment, update_payment_status, get_payments_admin, get_payment_admin, create_payment_admin, update_payment_admin, delete_payment_admin, get_payment_stats_admin, get_payouts_admin, get_payout_admin, create_payout_admin, update_payout_admin, delete_payout_admin, get_payout_stats_admin

admin_router = APIRouter(prefix="/admin", tags=["admin"])

def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role - uses regular authentication but checks for admin role"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@admin_router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Get dashboard statistics for admin panel"""
    from app.models.user import Broker, Shipper, Driver
    from app.models.load import Load, LoadStatus
    from app.models.order import Order, OrderStatus
    from app.models.bid import Bid, BidStatus
    
    # Get total counts
    total_brokers = db.query(Broker).count()
    total_shippers = db.query(Shipper).count()
    total_drivers = db.query(Driver).count()
    total_loads = db.query(Load).count()
    
    # Get active loads (posted, bidding, assigned, in_transit)
    active_loads = db.query(Load).filter(
        Load.status.in_([LoadStatus.POSTED, LoadStatus.BIDDING, LoadStatus.ASSIGNED, LoadStatus.IN_TRANSIT])
    ).count()
    
    # Get completed loads (delivered)
    completed_loads = db.query(Load).filter(Load.status == LoadStatus.DELIVERED).count()
    
    # Get total orders
    total_orders = db.query(Order).count()
    
    # Get completed orders
    completed_orders = db.query(Order).filter(Order.status == OrderStatus.DELIVERED).count()
    
    # Get total bids
    total_bids = db.query(Bid).count()
    
    # Get pending bids
    pending_bids = db.query(Bid).filter(Bid.status == BidStatus.PENDING).count()
    
    return {
        "total_brokers": total_brokers + total_shippers,
        # "total_shippers": total_shippers,
        "total_drivers": total_drivers,
        "total_loads": total_loads,
        "active_loads": active_loads,
        "completed_loads": completed_loads,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "total_bids": total_bids,
        "pending_bids": pending_bids
    }

@admin_router.get("/loads/stats")
def get_load_stats(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Get load statistics by status for admin panel"""
    from app.models.load import Load, LoadStatus
    
    # Get counts by status
    total_loads = db.query(Load).count()
    posted_loads = db.query(Load).filter(Load.status == LoadStatus.POSTED).count()
    bidding_loads = db.query(Load).filter(Load.status == LoadStatus.BIDDING).count()
    assigned_loads = db.query(Load).filter(Load.status == LoadStatus.ASSIGNED).count()
    in_transit_loads = db.query(Load).filter(Load.status == LoadStatus.IN_TRANSIT).count()
    delivered_loads = db.query(Load).filter(Load.status == LoadStatus.DELIVERED).count()
    cancelled_loads = db.query(Load).filter(Load.status == LoadStatus.CANCELLED).count()
    
    return {
        "total": total_loads,
        "posted": posted_loads,
        "bidding": bidding_loads,
        "assigned": assigned_loads,
        "in_transit": in_transit_loads,
        "delivered": delivered_loads,
        "cancelled": cancelled_loads
    }

@admin_router.get("/drivers", response_model=List[AdminDriverResponse])
def get_drivers_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by license number, vehicle type, email, username, or phone"),
    status: Optional[str] = Query(None, description="Filter by status: active, inactive"),
    verification_status: Optional[str] = Query(None, description="Filter by verification status: pending, verified, rejected")
):
    """Get all drivers with optional search and filtering"""
    drivers = get_drivers(db, skip=skip, limit=limit, search=search, status=status, verification_status=verification_status)
    
    # Convert to response format
    driver_responses = []
    for driver in drivers:
        # Get statistics for each driver
        stats = get_driver_stats(db, driver.id)
        
        driver_response = AdminDriverResponse(
            id=driver.id,
            user_id=str(driver.user_id),
            license_number=driver.license_number,
            vehicle_type=driver.vehicle_type,
            max_weight_capacity=float(driver.max_weight_capacity),
            vehicle_registration=driver.vehicle_registration,
            insurance_number=driver.insurance_number,
            upi_id=driver.upi_id,
            bank_account_number=driver.bank_account_number,
            ifsc_code=driver.ifsc_code,
            account_holder_name=driver.account_holder_name,
            created_at=driver.created_at,
            updated_at=driver.updated_at,
            username=driver.user.username,
            email=driver.user.email,
            phone_number=driver.user.phone_number,
            is_active=driver.user.is_active,
            current_load_weight=float(driver.current_load_weight),
            available_capacity=float(driver.available_capacity),
            max_volume_capacity=float(driver.max_volume_capacity) if driver.max_volume_capacity else None,
            current_latitude=driver.current_latitude,
            current_longitude=driver.current_longitude,
            current_city=driver.current_city,
            current_state=driver.current_state,
            last_location_update=driver.last_location_update,
            status=driver.status.value,
            verification_status=driver.verification_status.value,
            vehicle_image_url=driver.vehicle_image_url,
            rating=driver.rating,
            total_trips=driver.total_trips,
            preferred_routes=driver.preferred_routes,
            available_until=driver.available_until,
            total_bids=stats.get('total_bids', 0),
            total_orders=stats.get('total_orders', 0)
        )
        driver_responses.append(driver_response)
    
    return driver_responses

@admin_router.get("/drivers/{driver_id}", response_model=AdminDriverDetailResponse)
def get_driver_detail(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed driver information"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Get driver statistics
    stats = get_driver_stats(db, driver_id)
    
    return AdminDriverDetailResponse(
        id=driver.id,
        user_id=str(driver.user_id),
        license_number=driver.license_number,
        vehicle_type=driver.vehicle_type,
        max_weight_capacity=float(driver.max_weight_capacity),
        vehicle_registration=driver.vehicle_registration,
        insurance_number=driver.insurance_number,
        upi_id=driver.upi_id,
        bank_account_number=driver.bank_account_number,
        ifsc_code=driver.ifsc_code,
        account_holder_name=driver.account_holder_name,
        created_at=driver.created_at,
        updated_at=driver.updated_at,
        username=driver.user.username,
        email=driver.user.email,
        phone_number=driver.user.phone_number,
        is_active=driver.user.is_active,
        current_load_weight=float(driver.current_load_weight),
        available_capacity=float(driver.available_capacity),
        max_volume_capacity=float(driver.max_volume_capacity) if driver.max_volume_capacity else None,
        current_latitude=driver.current_latitude,
        current_longitude=driver.current_longitude,
        current_city=driver.current_city,
        current_state=driver.current_state,
        last_location_update=driver.last_location_update,
        status=driver.status.value,
        verification_status=driver.verification_status.value,
        vehicle_image_url=driver.vehicle_image_url,
        rating=driver.rating,
        total_trips=driver.total_trips,
        preferred_routes=driver.preferred_routes,
        available_until=driver.available_until,
        total_bids=stats.get('total_bids', 0),
        total_orders=stats.get('total_orders', 0),
        user_created_at=driver.user.created_at,
        last_login=None,  # Not tracked in current model
        last_activity=None,  # Not tracked in current model
        active_orders=stats.get('active_orders', 0),
        completed_orders=stats.get('completed_orders', 0),
        total_earnings=0.0,  # Not tracked in current model
        average_rating=driver.rating
    )

@admin_router.post("/drivers", response_model=AdminDriverResponse, status_code=201)
def create_driver_admin(
    driver_data: AdminDriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new driver via admin panel"""
    try:
        new_driver = create_driver(db, driver_data)
        return AdminDriverResponse(
            id=new_driver.id,
            user_id=str(new_driver.user_id),
            license_number=new_driver.license_number,
            vehicle_type=new_driver.vehicle_type,
            max_weight_capacity=float(new_driver.max_weight_capacity),
            vehicle_registration=new_driver.vehicle_registration,
            insurance_number=new_driver.insurance_number,
            upi_id=new_driver.upi_id,
            bank_account_number=new_driver.bank_account_number,
            ifsc_code=new_driver.ifsc_code,
            account_holder_name=new_driver.account_holder_name,
            created_at=new_driver.created_at,
            updated_at=new_driver.updated_at,
            username=new_driver.user.username,
            email=new_driver.user.email,
            phone_number=new_driver.user.phone_number,
            is_active=new_driver.user.is_active,
            current_load_weight=float(new_driver.current_load_weight),
            available_capacity=float(new_driver.available_capacity),
            max_volume_capacity=float(new_driver.max_volume_capacity) if new_driver.max_volume_capacity else None,
            current_latitude=new_driver.current_latitude,
            current_longitude=new_driver.current_longitude,
            current_city=new_driver.current_city,
            current_state=new_driver.current_state,
            last_location_update=new_driver.last_location_update,
            status=new_driver.status.value,
            verification_status=new_driver.verification_status.value,
            vehicle_image_url=new_driver.vehicle_image_url,
            rating=new_driver.rating,
            total_trips=new_driver.total_trips,
            preferred_routes=new_driver.preferred_routes,
            available_until=new_driver.available_until,
            total_bids=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create driver: {str(e)}")

@admin_router.put("/drivers/{driver_id}", response_model=AdminDriverResponse)
def update_driver_admin(
    driver_id: int,
    driver_update: AdminDriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update driver information via admin panel"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Check for email conflicts if email is being updated
    if driver_update.email and driver_update.email != driver.user.email:
        existing_user = db.query(User).filter(User.email == driver_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for username conflicts if username is being updated
    if driver_update.username and driver_update.username != driver.user.username:
        existing_username = db.query(User).filter(User.username == driver_update.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check for phone conflicts if phone is being updated
    if driver_update.phone_number and driver_update.phone_number != driver.user.phone_number:
        existing_phone = db.query(User).filter(User.phone_number == driver_update.phone_number).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    
    try:
        updated_driver = update_driver(db, driver_id, driver_update)
        return AdminDriverResponse(
            id=updated_driver.id,
            user_id=str(updated_driver.user_id),
            license_number=updated_driver.license_number,
            vehicle_type=updated_driver.vehicle_type,
            max_weight_capacity=float(updated_driver.max_weight_capacity),
            vehicle_registration=updated_driver.vehicle_registration,
            insurance_number=updated_driver.insurance_number,
            upi_id=updated_driver.upi_id,
            bank_account_number=updated_driver.bank_account_number,
            ifsc_code=updated_driver.ifsc_code,
            account_holder_name=updated_driver.account_holder_name,
            created_at=updated_driver.created_at,
            updated_at=updated_driver.updated_at,
            username=updated_driver.user.username,
            email=updated_driver.user.email,
            phone_number=updated_driver.user.phone_number,
            is_active=updated_driver.user.is_active,
            current_load_weight=float(updated_driver.current_load_weight),
            available_capacity=float(updated_driver.available_capacity),
            max_volume_capacity=float(updated_driver.max_volume_capacity) if updated_driver.max_volume_capacity else None,
            current_latitude=updated_driver.current_latitude,
            current_longitude=updated_driver.current_longitude,
            current_city=updated_driver.current_city,
            current_state=updated_driver.current_state,
            last_location_update=updated_driver.last_location_update,
            status=updated_driver.status.value,
            verification_status=updated_driver.verification_status.value,
            vehicle_image_url=updated_driver.vehicle_image_url,
            rating=updated_driver.rating,
            total_trips=updated_driver.total_trips,
            preferred_routes=updated_driver.preferred_routes,
            available_until=updated_driver.available_until,
            total_bids=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update driver: {str(e)}")

@admin_router.delete("/drivers/{driver_id}")
def deactivate_driver_admin(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Deactivate driver (soft delete)"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    success = deactivate_driver(db, driver_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to deactivate driver")
    
    return {"message": "Driver deactivated successfully"}

@admin_router.delete("/drivers/{driver_id}/permanent")
def delete_driver_admin(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Permanently delete driver and associated user"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    success = delete_driver(db, driver_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete driver")
    
    return {"message": "Driver deleted permanently"}

@admin_router.post("/drivers/{driver_id}/verify")
def verify_driver_admin(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Verify a driver by setting verification_status to VERIFIED"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    success = verify_driver(db, driver_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to verify driver")
    
    return {"message": "Driver verified successfully", "verification_status": "verified"}

@admin_router.post("/drivers/{driver_id}/reject")
def reject_driver_admin(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Reject a driver by setting verification_status to REJECTED"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    success = reject_driver(db, driver_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to reject driver")
    
    return {"message": "Driver rejected successfully", "verification_status": "rejected"}

@admin_router.get("/shippers", response_model=List[AdminShipperResponse])
def get_shippers_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by company name, email, username, or phone"),
    status: Optional[str] = Query(None, description="Filter by status: active, inactive")
):
    """Get all shippers with optional search and filtering"""
    shippers = get_shippers(db, skip=skip, limit=limit, search=search, status=status)
    
    # Convert to response format
    shipper_responses = []
    for shipper in shippers:
        # Get statistics for each shipper
        stats = get_shipper_stats(db, shipper.id)
        
        shipper_response = AdminShipperResponse(
            id=shipper.id,
            user_id=str(shipper.user_id),
            company_name=shipper.company_name,
            gst_number=shipper.gst_number,
            pan_number=shipper.pan_number,
            created_at=shipper.created_at,
            updated_at=shipper.updated_at,
            username=shipper.user.username,
            email=shipper.user.email,
            phone_number=shipper.user.phone_number,
            is_active=shipper.user.is_active,
            status=shipper.status.value,
            total_loads=stats.get('total_loads', 0),
            total_orders=stats.get('total_orders', 0)
        )
        shipper_responses.append(shipper_response)
    
    return shipper_responses

@admin_router.get("/shippers/{shipper_id}", response_model=AdminShipperDetailResponse)
def get_shipper_detail(
    shipper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed shipper information"""
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        raise HTTPException(status_code=404, detail="Shipper not found")
    
    # Get shipper statistics
    stats = get_shipper_stats(db, shipper_id)
    
    return AdminShipperDetailResponse(
        id=shipper.id,
        user_id=str(shipper.user_id),
        company_name=shipper.company_name,
        gst_number=shipper.gst_number,
        pan_number=shipper.pan_number,
        created_at=shipper.created_at,
        updated_at=shipper.updated_at,
        username=shipper.user.username,
        email=shipper.user.email,
        phone_number=shipper.user.phone_number,
        is_active=shipper.user.is_active,
        status=shipper.status.value,
        total_loads=stats.get('total_loads', 0),
        total_orders=stats.get('total_orders', 0),
        user_created_at=shipper.user.created_at,
        last_login=None,  # Not tracked in current model
        last_activity=None,  # Not tracked in current model
        active_loads=stats.get('active_loads', 0),
        completed_loads=stats.get('total_loads', 0) - stats.get('active_loads', 0),
        total_revenue=0.0  # Not tracked in current model
    )

@admin_router.post("/shippers", response_model=AdminShipperResponse, status_code=201)
def create_shipper_admin(
    shipper_data: AdminShipperCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new shipper via admin panel"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == shipper_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == shipper_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if phone number already exists
    existing_phone = db.query(User).filter(User.phone_number == shipper_data.phone_number).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    try:
        shipper = create_shipper(db, shipper_data)
        return AdminShipperResponse(
            id=shipper.id,
            user_id=str(shipper.user_id),
            company_name=shipper.company_name,
            gst_number=shipper.gst_number,
            pan_number=shipper.pan_number,
            created_at=shipper.created_at,
            updated_at=shipper.updated_at,
            username=shipper.user.username,
            email=shipper.user.email,
            phone_number=shipper.user.phone_number,
            is_active=shipper.user.is_active,
            status=shipper.status.value,
            total_loads=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create shipper: {str(e)}")

@admin_router.put("/shippers/{shipper_id}", response_model=AdminShipperResponse)
def update_shipper_admin(
    shipper_id: int,
    shipper_update: AdminShipperUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update shipper information via admin panel"""
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        raise HTTPException(status_code=404, detail="Shipper not found")
    
    # Check for email conflicts if email is being updated
    if shipper_update.email and shipper_update.email != shipper.user.email:
        existing_user = db.query(User).filter(User.email == shipper_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for username conflicts if username is being updated
    if shipper_update.username and shipper_update.username != shipper.user.username:
        existing_username = db.query(User).filter(User.username == shipper_update.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check for phone conflicts if phone is being updated
    if shipper_update.phone_number and shipper_update.phone_number != shipper.user.phone_number:
        existing_phone = db.query(User).filter(User.phone_number == shipper_update.phone_number).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    
    try:
        updated_shipper = update_shipper(db, shipper_id, shipper_update)
        return AdminShipperResponse(
            id=updated_shipper.id,
            user_id=str(updated_shipper.user_id),
            company_name=updated_shipper.company_name,
            gst_number=updated_shipper.gst_number,
            pan_number=updated_shipper.pan_number,
            created_at=updated_shipper.created_at,
            updated_at=updated_shipper.updated_at,
            username=updated_shipper.user.username,
            email=updated_shipper.user.email,
            phone_number=updated_shipper.user.phone_number,
            is_active=updated_shipper.user.is_active,
            status=updated_shipper.status.value,
            total_loads=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update shipper: {str(e)}")

@admin_router.delete("/shippers/{shipper_id}")
def deactivate_shipper_admin(
    shipper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Deactivate shipper (soft delete)"""
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        raise HTTPException(status_code=404, detail="Shipper not found")
    
    success = deactivate_shipper(db, shipper_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to deactivate shipper")
    
    return {"message": "Shipper deactivated successfully"}

@admin_router.delete("/shippers/{shipper_id}/permanent")
def delete_shipper_admin(
    shipper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Permanently delete shipper and associated user"""
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        raise HTTPException(status_code=404, detail="Shipper not found")
    
    success = delete_shipper(db, shipper_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete shipper")
    
    return {"message": "Shipper deleted permanently"}

# ===== DRIVER ENDPOINTS =====

@admin_router.get("/drivers", response_model=List[AdminDriverResponse])
def get_drivers_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by license number, vehicle type, email, username, or phone"),
    status: Optional[str] = Query(None, description="Filter by status: active, inactive"),
    verification_status: Optional[str] = Query(None, description="Filter by verification status: pending, verified, rejected")
):
    """Get all drivers with optional search and filtering"""
    drivers = get_drivers(db, skip=skip, limit=limit, search=search, status=status, verification_status=verification_status)
    
    # Convert to response format
    driver_responses = []
    for driver in drivers:
        # Get statistics for each driver
        stats = get_driver_stats(db, driver.id)
        
        driver_response = AdminDriverResponse(
            id=driver.id,
            user_id=str(driver.user_id),
            license_number=driver.license_number,
            vehicle_type=driver.vehicle_type,
            max_weight_capacity=float(driver.max_weight_capacity),
            vehicle_registration=driver.vehicle_registration,
            insurance_number=driver.insurance_number,
            upi_id=driver.upi_id,
            bank_account_number=driver.bank_account_number,
            ifsc_code=driver.ifsc_code,
            account_holder_name=driver.account_holder_name,
            created_at=driver.created_at,
            updated_at=driver.updated_at,
            username=driver.user.username,
            email=driver.user.email,
            phone_number=driver.user.phone_number,
            is_active=driver.user.is_active,
            current_load_weight=float(driver.current_load_weight),
            available_capacity=float(driver.available_capacity),
            max_volume_capacity=float(driver.max_volume_capacity) if driver.max_volume_capacity else None,
            current_latitude=driver.current_latitude,
            current_longitude=driver.current_longitude,
            current_city=driver.current_city,
            current_state=driver.current_state,
            last_location_update=driver.last_location_update,
            status=driver.status.value,
            verification_status=driver.verification_status.value,
            vehicle_image_url=driver.vehicle_image_url,
            rating=driver.rating,
            total_trips=driver.total_trips,
            preferred_routes=driver.preferred_routes,
            available_until=driver.available_until,
            total_bids=stats.get('total_bids', 0),
            total_orders=stats.get('total_orders', 0)
        )
        driver_responses.append(driver_response)
    
    return driver_responses

@admin_router.get("/drivers/{driver_id}", response_model=AdminDriverDetailResponse)
def get_driver_detail(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed driver information"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Get driver statistics
    stats = get_driver_stats(db, driver_id)
    
    return AdminDriverDetailResponse(
        id=driver.id,
        user_id=str(driver.user_id),
        license_number=driver.license_number,
        vehicle_type=driver.vehicle_type,
        max_weight_capacity=float(driver.max_weight_capacity),
        vehicle_registration=driver.vehicle_registration,
        insurance_number=driver.insurance_number,
        upi_id=driver.upi_id,
        bank_account_number=driver.bank_account_number,
        ifsc_code=driver.ifsc_code,
        account_holder_name=driver.account_holder_name,
        created_at=driver.created_at,
        updated_at=driver.updated_at,
        username=driver.user.username,
        email=driver.user.email,
        phone_number=driver.user.phone_number,
        is_active=driver.user.is_active,
        current_load_weight=float(driver.current_load_weight),
        available_capacity=float(driver.available_capacity),
        max_volume_capacity=float(driver.max_volume_capacity) if driver.max_volume_capacity else None,
        current_latitude=driver.current_latitude,
        current_longitude=driver.current_longitude,
        current_city=driver.current_city,
        current_state=driver.current_state,
        last_location_update=driver.last_location_update,
        status=driver.status.value,
        verification_status=driver.verification_status.value,
        vehicle_image_url=driver.vehicle_image_url,
        rating=driver.rating,
        total_trips=driver.total_trips,
        preferred_routes=driver.preferred_routes,
        available_until=driver.available_until,
        total_bids=stats.get('total_bids', 0),
        total_orders=stats.get('total_orders', 0),
        user_created_at=driver.user.created_at,
        last_login=None,  # Not tracked in current model
        last_activity=None,  # Not tracked in current model
        active_orders=stats.get('active_orders', 0),
        completed_orders=stats.get('completed_orders', 0),
        total_earnings=0.0,  # Not tracked in current model
        average_rating=driver.rating
    )

@admin_router.post("/drivers", response_model=AdminDriverResponse, status_code=201)
def create_driver_admin(
    driver_data: AdminDriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new driver via admin panel"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == driver_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == driver_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if phone number already exists
    existing_phone = db.query(User).filter(User.phone_number == driver_data.phone_number).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Check if license number already exists
    existing_license = db.query(Driver).filter(Driver.license_number == driver_data.license_number).first()
    if existing_license:
        raise HTTPException(status_code=400, detail="License number already registered")
    
    try:
        driver = create_driver(db, driver_data)
        return AdminDriverResponse(
            id=driver.id,
            user_id=str(driver.user_id),
            license_number=driver.license_number,
            vehicle_type=driver.vehicle_type,
            max_weight_capacity=float(driver.max_weight_capacity),
            vehicle_registration=driver.vehicle_registration,
            insurance_number=driver.insurance_number,
            upi_id=driver.upi_id,
            bank_account_number=driver.bank_account_number,
            ifsc_code=driver.ifsc_code,
            account_holder_name=driver.account_holder_name,
            created_at=driver.created_at,
            updated_at=driver.updated_at,
            username=driver.user.username,
            email=driver.user.email,
            phone_number=driver.user.phone_number,
            is_active=driver.user.is_active,
            current_load_weight=float(driver.current_load_weight),
            available_capacity=float(driver.available_capacity),
            max_volume_capacity=float(driver.max_volume_capacity) if driver.max_volume_capacity else None,
            current_latitude=driver.current_latitude,
            current_longitude=driver.current_longitude,
            current_city=driver.current_city,
            current_state=driver.current_state,
            last_location_update=driver.last_location_update,
            status=driver.status.value,
            verification_status=driver.verification_status.value,
            vehicle_image_url=driver.vehicle_image_url,
            rating=driver.rating,
            total_trips=driver.total_trips,
            preferred_routes=driver.preferred_routes,
            available_until=driver.available_until,
            total_bids=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create driver: {str(e)}")

@admin_router.put("/drivers/{driver_id}", response_model=AdminDriverResponse)
def update_driver_admin(
    driver_id: int,
    driver_update: AdminDriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update driver information via admin panel"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Check for email conflicts if email is being updated
    if driver_update.email and driver_update.email != driver.user.email:
        existing_user = db.query(User).filter(User.email == driver_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for username conflicts if username is being updated
    if driver_update.username and driver_update.username != driver.user.username:
        existing_username = db.query(User).filter(User.username == driver_update.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check for phone conflicts if phone is being updated
    if driver_update.phone_number and driver_update.phone_number != driver.user.phone_number:
        existing_phone = db.query(User).filter(User.phone_number == driver_update.phone_number).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Check for license conflicts if license is being updated
    if driver_update.license_number and driver_update.license_number != driver.license_number:
        existing_license = db.query(Driver).filter(Driver.license_number == driver_update.license_number).first()
        if existing_license:
            raise HTTPException(status_code=400, detail="License number already registered")
    
    try:
        updated_driver = update_driver(db, driver_id, driver_update)
        return AdminDriverResponse(
            id=updated_driver.id,
            user_id=str(updated_driver.user_id),
            license_number=updated_driver.license_number,
            vehicle_type=updated_driver.vehicle_type,
            max_weight_capacity=float(updated_driver.max_weight_capacity),
            vehicle_registration=updated_driver.vehicle_registration,
            insurance_number=updated_driver.insurance_number,
            upi_id=updated_driver.upi_id,
            bank_account_number=updated_driver.bank_account_number,
            ifsc_code=updated_driver.ifsc_code,
            account_holder_name=updated_driver.account_holder_name,
            created_at=updated_driver.created_at,
            updated_at=updated_driver.updated_at,
            username=updated_driver.user.username,
            email=updated_driver.user.email,
            phone_number=updated_driver.user.phone_number,
            is_active=updated_driver.user.is_active,
            current_load_weight=float(updated_driver.current_load_weight),
            available_capacity=float(updated_driver.available_capacity),
            max_volume_capacity=float(updated_driver.max_volume_capacity) if updated_driver.max_volume_capacity else None,
            current_latitude=updated_driver.current_latitude,
            current_longitude=updated_driver.current_longitude,
            current_city=updated_driver.current_city,
            current_state=updated_driver.current_state,
            last_location_update=updated_driver.last_location_update,
            status=updated_driver.status.value,
            verification_status=updated_driver.verification_status.value,
            vehicle_image_url=updated_driver.vehicle_image_url,
            rating=updated_driver.rating,
            total_trips=updated_driver.total_trips,
            preferred_routes=updated_driver.preferred_routes,
            available_until=updated_driver.available_until,
            total_bids=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update driver: {str(e)}")

@admin_router.delete("/drivers/{driver_id}")
def deactivate_driver_admin(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Deactivate driver (soft delete)"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    success = deactivate_driver(db, driver_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to deactivate driver")
    
    return {"message": "Driver deactivated successfully"}

@admin_router.delete("/drivers/{driver_id}/permanent")
def delete_driver_admin(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Permanently delete driver and associated user"""
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    success = delete_driver(db, driver_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete driver")
    
    return {"message": "Driver deleted permanently"}

# ===== LOAD ENDPOINTS =====

@admin_router.get("/loads", response_model=List[AdminLoadResponse])
def get_loads_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by origin, destination, goods type, or instructions"),
    status: Optional[str] = Query(None, description="Filter by status: posted, bidding, assigned, in_transit, delivered, cancelled"),
    category: Optional[str] = Query(None, description="Filter by category: perishable, non_perishable, high_value, oversize, general"),
    shipper_id: Optional[int] = Query(None, description="Filter by shipper ID"),
    broker_id: Optional[int] = Query(None, description="Filter by broker ID")
):
    """Get all loads with optional search and filtering"""
    loads = get_loads_admin(db, skip=skip, limit=limit, search=search, status=status, category=category, shipper_id=shipper_id, broker_id=broker_id)
    
    # Convert to response format
    load_responses = []
    for load in loads:
        # Get statistics for each load
        stats = get_load_stats_admin(db, str(load.id))
        
        # Get creator names and verification status
        shipper_name = None
        broker_name = None
        creator_verified = False
        if load.shipper:
            shipper_name = load.shipper.user.username
            creator_verified = load.shipper.status == VerificationStatus.VERIFIED
        if load.broker:
            broker_name = load.broker.user.username
            creator_verified = load.broker.status == VerificationStatus.VERIFIED
        
        load_response = AdminLoadResponse(
            id=str(load.id),
            shipper_id=load.shipper_id,
            broker_id=load.broker_id,
            origin=load.origin,
            destination=load.destination,
            goods_type=load.goods_type,
            weight=float(load.weight),
            dimensions=load.dimensions,
            special_instructions=load.special_instructions,
            origin_lat=load.origin_lat,
            origin_lng=load.origin_lng,
            destination_lat=load.destination_lat,
            destination_lng=load.destination_lng,
            source_type=load.source_type.value,
            source_content=load.source_content,
            category=load.category.value,
            verified=load.verified,
            created_at=load.created_at,
            updated_at=load.updated_at,
            shipper_name=shipper_name,
            broker_name=broker_name,
            creator_verified=creator_verified,
            status=load.status.value,
            bid_count=load.bid_count,
            lowest_bid=float(load.lowest_bid) if load.lowest_bid else None,
            accepted_bid_id=str(load.accepted_bid_id) if load.accepted_bid_id else None,
            assigned_driver_id=load.assigned_driver_id,
            total_bids=stats.get('total_bids', 0),
            total_orders=stats.get('total_orders', 0)
        )
        load_responses.append(load_response)
    
    return load_responses

@admin_router.get("/loads/{load_id}", response_model=AdminLoadDetailResponse)
def get_load_detail(
    load_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed load information"""
    load = get_load_admin(db, load_id)
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")
    
    # Get load statistics
    stats = get_load_stats_admin(db, load_id)
    
    # Get creator details
    shipper_name = None
    shipper_company = None
    broker_name = None
    broker_agency = None
    if load.shipper:
        shipper_name = load.shipper.user.username
        shipper_company = load.shipper.company_name
    if load.broker:
        broker_name = load.broker.user.username
        broker_agency = load.broker.agency_name
    
    # Get assigned driver details
    assigned_driver_name = None
    assigned_driver_phone = None
    if load.assigned_driver:
        assigned_driver_name = load.assigned_driver.user.username
        assigned_driver_phone = load.assigned_driver.user.phone_number
    
    return AdminLoadDetailResponse(
        id=str(load.id),
        shipper_id=load.shipper_id,
        broker_id=load.broker_id,
        origin=load.origin,
        destination=load.destination,
        goods_type=load.goods_type,
        weight=float(load.weight),
        dimensions=load.dimensions,
        special_instructions=load.special_instructions,
        origin_lat=load.origin_lat,
        origin_lng=load.origin_lng,
        destination_lat=load.destination_lat,
        destination_lng=load.destination_lng,
        source_type=load.source_type.value,
        source_content=load.source_content,
        category=load.category.value,
        verified=load.verified,
        created_at=load.created_at,
        updated_at=load.updated_at,
        shipper_name=shipper_name,
        broker_name=broker_name,
        shipper_company=shipper_company,
        broker_agency=broker_agency,
        status=load.status.value,
        bid_count=load.bid_count,
        lowest_bid=float(load.lowest_bid) if load.lowest_bid else None,
        accepted_bid_id=str(load.accepted_bid_id) if load.accepted_bid_id else None,
        assigned_driver_id=load.assigned_driver_id,
        assigned_driver_name=assigned_driver_name,
        assigned_driver_phone=assigned_driver_phone,
        total_bids=stats.get('total_bids', 0),
        total_orders=stats.get('total_orders', 0),
        active_bids=stats.get('active_bids', 0),
        completed_orders=stats.get('completed_orders', 0),
        total_revenue=0.0,  # Not tracked in current model
        bidding_started_at=None,  # Not tracked in current model
        bidding_ended_at=None,  # Not tracked in current model
        delivery_expected_at=None  # Not tracked in current model
    )

@admin_router.post("/loads", response_model=AdminLoadResponse, status_code=201)
def create_load_admin(
    load_data: AdminLoadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new load via admin panel"""
    try:
        load = create_load_admin(db, load_data.model_dump())
        
        # Get creator names
        shipper_name = None
        broker_name = None
        if load.shipper:
            shipper_name = load.shipper.user.username
        if load.broker:
            broker_name = load.broker.user.username
        
        return AdminLoadResponse(
            id=str(load.id),
            shipper_id=load.shipper_id,
            broker_id=load.broker_id,
            origin=load.origin,
            destination=load.destination,
            goods_type=load.goods_type,
            weight=float(load.weight),
            dimensions=load.dimensions,
            special_instructions=load.special_instructions,
            origin_lat=load.origin_lat,
            origin_lng=load.origin_lng,
            destination_lat=load.destination_lat,
            destination_lng=load.destination_lng,
            source_type=load.source_type.value,
            source_content=load.source_content,
            category=load.category.value,
            verified=load.verified,
            created_at=load.created_at,
            updated_at=load.updated_at,
            shipper_name=shipper_name,
            broker_name=broker_name,
            status=load.status.value,
            bid_count=load.bid_count,
            lowest_bid=float(load.lowest_bid) if load.lowest_bid else None,
            accepted_bid_id=str(load.accepted_bid_id) if load.accepted_bid_id else None,
            assigned_driver_id=load.assigned_driver_id,
            total_bids=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create load: {str(e)}")

@admin_router.put("/loads/{load_id}", response_model=AdminLoadResponse)
def update_load_admin(
    load_id: str,
    load_update: AdminLoadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update load information via admin panel"""
    load = get_load_admin(db, load_id)
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")
    
    try:
        updated_load = update_load_admin(db, load_id, load_update.model_dump(exclude_unset=True))
        
        # Get creator names
        shipper_name = None
        broker_name = None
        if updated_load.shipper:
            shipper_name = updated_load.shipper.user.username
        if updated_load.broker:
            broker_name = updated_load.broker.user.username
        
        return AdminLoadResponse(
            id=str(updated_load.id),
            shipper_id=updated_load.shipper_id,
            broker_id=updated_load.broker_id,
            origin=updated_load.origin,
            destination=updated_load.destination,
            goods_type=updated_load.goods_type,
            weight=float(updated_load.weight),
            dimensions=updated_load.dimensions,
            special_instructions=updated_load.special_instructions,
            origin_lat=updated_load.origin_lat,
            origin_lng=updated_load.origin_lng,
            destination_lat=updated_load.destination_lat,
            destination_lng=updated_load.destination_lng,
            source_type=updated_load.source_type.value,
            source_content=updated_load.source_content,
            category=updated_load.category.value,
            verified=updated_load.verified,
            created_at=updated_load.created_at,
            updated_at=updated_load.updated_at,
            shipper_name=shipper_name,
            broker_name=broker_name,
            status=updated_load.status.value,
            bid_count=updated_load.bid_count,
            lowest_bid=float(updated_load.lowest_bid) if updated_load.lowest_bid else None,
            accepted_bid_id=str(updated_load.accepted_bid_id) if updated_load.accepted_bid_id else None,
            assigned_driver_id=updated_load.assigned_driver_id,
            total_bids=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update load: {str(e)}")

@admin_router.delete("/loads/{load_id}")
def delete_load_admin(
    load_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete load via admin panel"""
    load = get_load_admin(db, load_id)
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")
    
    success = delete_load_admin(db, load_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete load")
    
    return {"message": "Load deleted successfully"}

# ===== PAYMENT ENDPOINTS =====

@admin_router.get("/payments", response_model=List[AdminPaymentResponse])
def get_payments_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by Razorpay order ID, payment ID, or UUID"),
    status: Optional[str] = Query(None, description="Filter by status: created, authorized, captured, failed, refunded"),
    currency: Optional[str] = Query(None, description="Filter by currency"),
    order_id: Optional[UUID] = Query(None, description="Filter by order ID")
):
    """Get all payments with optional search and filtering"""
    payments = get_payments_admin(db, skip=skip, limit=limit, search=search, status=status, currency=currency, order_id=order_id)
    
    # Convert to response format
    payment_responses = []
    for payment in payments:
        # Get statistics for each payment
        stats = get_payment_stats_admin(db, payment.id)
        
        payment_response = AdminPaymentResponse(
            id=payment.id,
            uuid=payment.uuid,
            order_id=payment.order_id,
            amount=float(payment.amount / 100),  # Convert from paise to rupees
            currency=payment.currency,
            status=payment.status.value,
            razorpay_order_id=payment.razorpay_order_id,
            razorpay_payment_id=payment.razorpay_payment_id,
            razorpay_signature=payment.razorpay_signature,
            created_at=payment.created_at,
            updated_at=payment.updated_at,
            authorized_at=payment.authorized_at,
            captured_at=payment.captured_at,
            refunded_at=payment.refunded_at,
            order_details={
                'id': payment.order.id if payment.order else None,
                'status': payment.order.status.value if payment.order else None
            } if payment.order else None,
            total_payouts=stats.get('total_payouts', 0),
            successful_payouts=stats.get('successful_payouts', 0),
            failed_payouts=stats.get('failed_payouts', 0),
            total_payout_amount=stats.get('total_payout_amount', 0.0)
        )
        payment_responses.append(payment_response)
    
    return payment_responses

@admin_router.get("/payments/{payment_id}", response_model=AdminPaymentDetailResponse)
def get_payment_detail(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed payment information"""
    payment = get_payment_admin(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Get payment statistics
    stats = get_payment_stats_admin(db, payment_id)
    
    # Get order details
    order_origin = None
    order_destination = None
    order_goods_type = None
    if payment.order and payment.order.load:
        order_origin = payment.order.load.origin
        order_destination = payment.order.load.destination
        order_goods_type = payment.order.load.goods_type
    
    # Get driver details
    driver_name = None
    driver_phone = None
    if payment.order and payment.order.bid and payment.order.bid.driver:
        driver_name = payment.order.bid.driver.user.username
        driver_phone = payment.order.bid.driver.user.phone_number
    
    # Get shipper details
    shipper_name = None
    shipper_phone = None
    if payment.order and payment.order.load and payment.order.load.shipper:
        shipper_name = payment.order.load.shipper.user.username
        shipper_phone = payment.order.load.shipper.user.phone_number
    
    return AdminPaymentDetailResponse(
        id=payment.id,
        uuid=payment.uuid,
        order_id=payment.order_id,
        amount=float(payment.amount / 100),  # Convert from paise to rupees
        currency=payment.currency,
        status=payment.status.value,
        razorpay_order_id=payment.razorpay_order_id,
        razorpay_payment_id=payment.razorpay_payment_id,
        razorpay_signature=payment.razorpay_signature,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
        authorized_at=payment.authorized_at,
        captured_at=payment.captured_at,
        refunded_at=payment.refunded_at,
        order_details={
            'id': payment.order.id if payment.order else None,
            'status': payment.order.status.value if payment.order else None
        } if payment.order else None,
        order_origin=order_origin,
        order_destination=order_destination,
        order_goods_type=order_goods_type,
        driver_name=driver_name,
        driver_phone=driver_phone,
        shipper_name=shipper_name,
        shipper_phone=shipper_phone,
        total_payouts=stats.get('total_payouts', 0),
        successful_payouts=stats.get('successful_payouts', 0),
        failed_payouts=stats.get('failed_payouts', 0),
        total_payout_amount=stats.get('total_payout_amount', 0.0)
    )

@admin_router.post("/payments", response_model=AdminPaymentResponse, status_code=201)
def create_payment_admin(
    payment_data: AdminPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new payment via admin panel"""
    try:
        payment = create_payment_admin(db, payment_data.model_dump())
        
        return AdminPaymentResponse(
            id=payment.id,
            uuid=payment.uuid,
            order_id=payment.order_id,
            amount=float(payment.amount / 100),  # Convert from paise to rupees
            currency=payment.currency,
            status=payment.status.value,
            razorpay_order_id=payment.razorpay_order_id,
            razorpay_payment_id=payment.razorpay_payment_id,
            razorpay_signature=payment.razorpay_signature,
            created_at=payment.created_at,
            updated_at=payment.updated_at,
            authorized_at=payment.authorized_at,
            captured_at=payment.captured_at,
            refunded_at=payment.refunded_at,
            order_details=None,
            total_payouts=0,
            successful_payouts=0,
            failed_payouts=0,
            total_payout_amount=0.0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create payment: {str(e)}")

@admin_router.put("/payments/{payment_id}", response_model=AdminPaymentResponse)
def update_payment_admin(
    payment_id: int,
    payment_update: AdminPaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update payment information via admin panel"""
    payment = get_payment_admin(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    try:
        updated_payment = update_payment_admin(db, payment_id, payment_update.model_dump(exclude_unset=True))
        
        return AdminPaymentResponse(
            id=updated_payment.id,
            uuid=updated_payment.uuid,
            order_id=updated_payment.order_id,
            amount=float(updated_payment.amount / 100),  # Convert from paise to rupees
            currency=updated_payment.currency,
            status=updated_payment.status.value,
            razorpay_order_id=updated_payment.razorpay_order_id,
            razorpay_payment_id=updated_payment.razorpay_payment_id,
            razorpay_signature=updated_payment.razorpay_signature,
            created_at=updated_payment.created_at,
            updated_at=updated_payment.updated_at,
            authorized_at=updated_payment.authorized_at,
            captured_at=updated_payment.captured_at,
            refunded_at=updated_payment.refunded_at,
            order_details=None,
            total_payouts=0,
            successful_payouts=0,
            failed_payouts=0,
            total_payout_amount=0.0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update payment: {str(e)}")

@admin_router.delete("/payments/{payment_id}")
def delete_payment_admin(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete payment via admin panel"""
    payment = get_payment_admin(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    success = delete_payment_admin(db, payment_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete payment")
    
    return {"message": "Payment deleted successfully"}

# ===== PAYOUT ENDPOINTS =====

@admin_router.get("/payouts", response_model=List[AdminPayoutResponse])
def get_payouts_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by Razorpay payout ID, UUID, driver name, or email"),
    status: Optional[str] = Query(None, description="Filter by status: initiated, processing, success, failed"),
    mode: Optional[str] = Query(None, description="Filter by mode: UPI, IMPS, NEFT"),
    driver_id: Optional[int] = Query(None, description="Filter by driver ID"),
    payment_id: Optional[int] = Query(None, description="Filter by payment ID")
):
    """Get all payouts with optional search and filtering"""
    payouts = get_payouts_admin(db, skip=skip, limit=limit, search=search, status=status, mode=mode, driver_id=driver_id, payment_id=payment_id)
    
    # Convert to response format
    payout_responses = []
    for payout in payouts:
        payout_response = AdminPayoutResponse(
            id=payout.id,
            uuid=payout.uuid,
            payment_id=payout.payment_id,
            driver_id=payout.driver_id,
            amount=float(payout.amount / 100),  # Convert from paise to rupees
            currency=payout.currency,
            mode=payout.mode,
            status=payout.status.value,
            razorpay_payout_id=payout.razorpay_payout_id,
            created_at=payout.created_at,
            processed_at=payout.processed_at,
            failure_reason=payout.failure_reason,
            driver_name=payout.driver.user.username if payout.driver and payout.driver.user else None,
            driver_phone=payout.driver.user.phone_number if payout.driver and payout.driver.user else None,
            payment_amount=float(payout.payment.amount / 100) if payout.payment else None,
            payment_status=payout.payment.status.value if payout.payment else None
        )
        payout_responses.append(payout_response)
    
    return payout_responses

@admin_router.get("/payouts/{payout_id}", response_model=AdminPayoutDetailResponse)
def get_payout_detail(
    payout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed payout information"""
    payout = get_payout_admin(db, payout_id)
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    
    # Get order details
    order_origin = None
    order_destination = None
    order_goods_type = None
    if payout.payment and payout.payment.order and payout.payment.order.load:
        order_origin = payout.payment.order.load.origin
        order_destination = payout.payment.order.load.destination
        order_goods_type = payout.payment.order.load.goods_type
    
    # Get shipper details
    shipper_name = None
    shipper_company = None
    if payout.payment and payout.payment.order and payout.payment.order.load and payout.payment.order.load.shipper:
        shipper_name = payout.payment.order.load.shipper.user.username
        shipper_company = payout.payment.order.load.shipper.company_name
    
    return AdminPayoutDetailResponse(
        id=payout.id,
        uuid=payout.uuid,
        payment_id=payout.payment_id,
        driver_id=payout.driver_id,
        amount=float(payout.amount / 100),  # Convert from paise to rupees
        currency=payout.currency,
        mode=payout.mode,
        status=payout.status.value,
        razorpay_payout_id=payout.razorpay_payout_id,
        created_at=payout.created_at,
        processed_at=payout.processed_at,
        failure_reason=payout.failure_reason,
        driver_name=payout.driver.user.username if payout.driver and payout.driver.user else None,
        driver_phone=payout.driver.user.phone_number if payout.driver and payout.driver.user else None,
        payment_amount=float(payout.payment.amount / 100) if payout.payment else None,
        payment_status=payout.payment.status.value if payout.payment else None,
        driver_license=payout.driver.license_number if payout.driver else None,
        driver_vehicle_type=payout.driver.vehicle_type if payout.driver else None,
        order_origin=order_origin,
        order_destination=order_destination,
        order_goods_type=order_goods_type,
        shipper_name=shipper_name,
        shipper_company=shipper_company
    )

@admin_router.post("/payouts", response_model=AdminPayoutResponse, status_code=201)
def create_payout_admin(
    payout_data: AdminPayoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new payout via admin panel"""
    try:
        payout = create_payout_admin(db, payout_data.model_dump())
        
        return AdminPayoutResponse(
            id=payout.id,
            uuid=payout.uuid,
            payment_id=payout.payment_id,
            driver_id=payout.driver_id,
            amount=float(payout.amount / 100),  # Convert from paise to rupees
            currency=payout.currency,
            mode=payout.mode,
            status=payout.status.value,
            razorpay_payout_id=payout.razorpay_payout_id,
            created_at=payout.created_at,
            processed_at=payout.processed_at,
            failure_reason=payout.failure_reason,
            driver_name=None,
            driver_phone=None,
            payment_amount=None,
            payment_status=None
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create payout: {str(e)}")

@admin_router.put("/payouts/{payout_id}", response_model=AdminPayoutResponse)
def update_payout_admin(
    payout_id: int,
    payout_update: AdminPayoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update payout information via admin panel"""
    payout = get_payout_admin(db, payout_id)
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    
    try:
        updated_payout = update_payout_admin(db, payout_id, payout_update.model_dump(exclude_unset=True))
        
        return AdminPayoutResponse(
            id=updated_payout.id,
            uuid=updated_payout.uuid,
            payment_id=updated_payout.payment_id,
            driver_id=updated_payout.driver_id,
            amount=float(updated_payout.amount / 100),  # Convert from paise to rupees
            currency=updated_payout.currency,
            mode=updated_payout.mode,
            status=updated_payout.status.value,
            razorpay_payout_id=updated_payout.razorpay_payout_id,
            created_at=updated_payout.created_at,
            processed_at=updated_payout.processed_at,
            failure_reason=updated_payout.failure_reason,
            driver_name=None,
            driver_phone=None,
            payment_amount=None,
            payment_status=None
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update payout: {str(e)}")

@admin_router.delete("/payouts/{payout_id}")
def delete_payout_admin(
    payout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete payout via admin panel"""
    payout = get_payout_admin(db, payout_id)
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    
    success = delete_payout_admin(db, payout_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete payout")
    
    return {"message": "Payout deleted successfully"}

@admin_router.get("/brokers", response_model=List[AdminBrokerResponse])
def get_brokers_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by agency name, email, username, or phone"),
    status: Optional[str] = Query(None, description="Filter by status: active, inactive")
):
    """Get all brokers with optional search and filtering"""
    brokers = get_brokers(db, skip=skip, limit=limit, search=search, status=status)
    
    # Convert to response format
    broker_responses = []
    for broker in brokers:
        # Get statistics for each broker
        stats = get_broker_stats(db, broker.id)
        
        broker_response = AdminBrokerResponse(
            id=broker.id,
            user_id=str(broker.user_id),
            agency_name=broker.agency_name,
            gst_number=broker.gst_number,
            pan_number=broker.pan_number,
            created_at=broker.created_at,
            updated_at=broker.updated_at,
            username=broker.user.username,
            email=broker.user.email,
            phone_number=broker.user.phone_number,
            is_active=broker.user.is_active,
            status=broker.status.value,
            total_loads=stats.get('total_loads', 0),
            total_orders=stats.get('total_orders', 0)
        )
        broker_responses.append(broker_response)
    
    return broker_responses

@admin_router.get("/brokers/{broker_id}", response_model=AdminBrokerDetailResponse)
def get_broker_detail(
    broker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed broker information"""
    broker = get_broker(db, broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    
    # Get broker statistics
    stats = get_broker_stats(db, broker_id)
    
    return AdminBrokerDetailResponse(
        id=broker.id,
        user_id=str(broker.user_id),
        agency_name=broker.agency_name,
        gst_number=broker.gst_number,
        pan_number=broker.pan_number,
        created_at=broker.created_at,
        updated_at=broker.updated_at,
        username=broker.user.username,
        email=broker.user.email,
        phone_number=broker.user.phone_number,
        is_active=broker.user.is_active,
        status=broker.status.value,
        total_loads=stats.get('total_loads', 0),
        total_orders=stats.get('total_orders', 0),
        user_created_at=broker.user.created_at,
        last_login=None,  # Not tracked in current model
        last_activity=None,  # Not tracked in current model
        active_loads=stats.get('active_loads', 0),
        completed_loads=stats.get('total_loads', 0) - stats.get('active_loads', 0),
        total_revenue=0.0  # Not tracked in current model
    )

@admin_router.post("/brokers", response_model=AdminBrokerResponse, status_code=201)
def create_broker_admin(
    broker_data: AdminBrokerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new broker via admin panel"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == broker_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == broker_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if phone number already exists
    existing_phone = db.query(User).filter(User.phone_number == broker_data.phone_number).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    try:
        broker = create_broker(db, broker_data)
        return AdminBrokerResponse(
            id=broker.id,
            user_id=str(broker.user_id),
            agency_name=broker.agency_name,
            gst_number=broker.gst_number,
            pan_number=broker.pan_number,
            created_at=broker.created_at,
            updated_at=broker.updated_at,
            username=broker.user.username,
            email=broker.user.email,
            phone_number=broker.user.phone_number,
            is_active=broker.user.is_active,
            status=broker.status.value,
            total_loads=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create broker: {str(e)}")

@admin_router.put("/brokers/{broker_id}", response_model=AdminBrokerResponse)
def update_broker_admin(
    broker_id: int,
    broker_update: AdminBrokerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update broker information via admin panel"""
    broker = get_broker(db, broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    
    # Check for email conflicts if email is being updated
    if broker_update.email and broker_update.email != broker.user.email:
        existing_user = db.query(User).filter(User.email == broker_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for username conflicts if username is being updated
    if broker_update.username and broker_update.username != broker.user.username:
        existing_username = db.query(User).filter(User.username == broker_update.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check for phone conflicts if phone is being updated
    if broker_update.phone_number and broker_update.phone_number != broker.user.phone_number:
        existing_phone = db.query(User).filter(User.phone_number == broker_update.phone_number).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    
    try:
        updated_broker = update_broker(db, broker_id, broker_update)
        return AdminBrokerResponse(
            id=updated_broker.id,
            user_id=str(updated_broker.user_id),
            agency_name=updated_broker.agency_name,
            gst_number=updated_broker.gst_number,
            pan_number=updated_broker.pan_number,
            created_at=updated_broker.created_at,
            updated_at=updated_broker.updated_at,
            username=updated_broker.user.username,
            email=updated_broker.user.email,
            phone_number=updated_broker.user.phone_number,
            is_active=updated_broker.user.is_active,
            status=updated_broker.status.value,
            total_loads=0,
            total_orders=0
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update broker: {str(e)}")

@admin_router.post("/brokers/{broker_id}/verify")
def verify_broker_admin(
    broker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Verify a broker by setting status to VERIFIED"""
    broker = get_broker(db, broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    success = verify_broker(db, broker_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to verify broker")
    return {"message": "Broker verified successfully", "status": "verified"}

@admin_router.post("/brokers/{broker_id}/reject")
def reject_broker_admin(
    broker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Reject a broker by setting status to REJECTED"""
    broker = get_broker(db, broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    success = reject_broker(db, broker_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to reject broker")
    return {"message": "Broker rejected successfully", "status": "rejected"}

@admin_router.post("/shippers/{shipper_id}/verify")
def verify_shipper_admin(
    shipper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Verify a shipper by setting status to VERIFIED"""
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        raise HTTPException(status_code=404, detail="Shipper not found")
    success = verify_shipper(db, shipper_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to verify shipper")
    return {"message": "Shipper verified successfully", "status": "verified"}

@admin_router.post("/shippers/{shipper_id}/reject")
def reject_shipper_admin(
    shipper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Reject a shipper by setting status to REJECTED"""
    try:
        shipper = get_shipper(db, shipper_id)
        if not shipper:
            raise HTTPException(status_code=404, detail="Shipper not found")
        success = reject_shipper(db, shipper_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to reject shipper")
        return {"message": "Shipper rejected successfully", "status": "rejected"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update broker: {str(e)}")

@admin_router.delete("/brokers/{broker_id}")
def deactivate_broker_admin(
    broker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Deactivate broker (soft delete)"""
    broker = get_broker(db, broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    
    success = deactivate_broker(db, broker_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to deactivate broker")
    
    return {"message": "Broker deactivated successfully"}

@admin_router.delete("/brokers/{broker_id}/permanent")
def delete_broker_admin(
    broker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Permanently delete broker and associated user"""
    broker = get_broker(db, broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    
    success = delete_broker(db, broker_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete broker")
    
    return {"message": "Broker deleted permanently"}

# ===== ORDER ADMIN ENDPOINTS =====

@admin_router.get("/orders", response_model=List[AdminOrderResponse])
def get_orders_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by order number, origin, destination, or goods type"),
    status: Optional[str] = Query(None, description="Filter by order status"),
    driver_id: Optional[int] = Query(None, description="Filter by driver ID"),
    shipper_id: Optional[int] = Query(None, description="Filter by shipper ID"),
    broker_id: Optional[int] = Query(None, description="Filter by broker ID")
):
    """Get all orders with optional search and filtering"""
    orders = get_orders_admin(
        db, 
        skip=skip, 
        limit=limit, 
        search=search, 
        status=status,
        driver_id=driver_id,
        shipper_id=shipper_id,
        broker_id=broker_id
    )
    
    # Convert to response format
    order_responses = []
    
    for order in orders:
        print(order)
        # Get statistics for each order
        stats = get_order_stats_admin(db, order.id)
    
        # Get related data
        load = db.query(Load).filter(Load.id == order.load_id).first()
        bid = db.query(Bid).filter(Bid.id == order.bid_id).first()
        
        # Get driver name
        driver_name = None
        if bid and bid.driver:
            driver_name = bid.driver.user.username
        
        # Get shipper name
        shipper_name = None
        if load:
            shipper_name = load.shipper.user.username if load.shipper else load.broker.user.username
        
        order_response = AdminOrderResponse(
            id=order.id,
            # order_number=order.order_number,
            load_id=order.load_id,
            driver_id=stats.get('driver_id'),
            shipper_id=stats.get('shipper_id'),
            status=order.status,
            total_amount=stats.get('amount', 0.0),
            pickup_date=order.picked_up_at,
            delivery_date=order.delivered_at,
            created_at=order.created_at,
            updated_at=order.updated_at,
            expires_at=order.expires_at,
            load_title=f"{load.origin} to {load.destination}" if load else None,
            driver_name=driver_name,
            shipper_name=shipper_name,
            driver_phone=bid.driver.user.phone_number if bid.driver else None,
            order_number=order.order_number
        )
        order_responses.append(order_response)
    
    return order_responses

@admin_router.get("/orders/{order_id}", response_model=AdminOrderDetailResponse)
def get_order_detail(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed order information"""
    order = get_order_admin(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get order statistics
    stats = get_order_stats_admin(db, order_id)
    
    # Get related data
    load = db.query(Load).filter(Load.id == order.load_id).first()
    bid = db.query(Bid).filter(Bid.id == order.bid_id).first()
    
    # Get driver details
    driver_name = None
    driver_phone = None
    driver_vehicle = None
    if bid and bid.driver:
        driver_name = bid.driver.user.username
        driver_phone = bid.driver.user.phone_number
        driver_vehicle = bid.driver.vehicle_type
    
    # Get shipper details
    shipper_name = None
    shipper_company = None
    shipper_phone = None
    if load and load.shipper:
        shipper_name = load.shipper.user.username
        shipper_company = load.shipper.company_name
        shipper_phone = load.shipper.user.phone_number
    
    return AdminOrderDetailResponse(
        id=order.id,
        load_id=order.load_id,
        driver_id=stats.get('driver_id'),
        shipper_id=stats.get('shipper_id'),
        status=order.status,
        total_amount=stats.get('amount', 0.0),
        pickup_date=order.picked_up_at,
        delivery_date=order.delivered_at,
        created_at=order.created_at,
        updated_at=order.updated_at,
        expires_at=order.expires_at,
        load_title=f"{load.origin} to {load.destination}" if load else None,
        load_description=load.special_instructions if load else None,
        load_weight=stats.get('weight', 0.0),
        load_price=stats.get('amount', 0.0),
        driver_name=driver_name,
        driver_phone=driver_phone,
        driver_vehicle=driver_vehicle,
        shipper_name=shipper_name,
        shipper_company=shipper_company,
        shipper_phone=shipper_phone,
        order_number=order.order_number
    )
    

@admin_router.post("/brokers/{broker_id}/verify")
def verify_broker_admin(
    broker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Verify a broker by setting status to VERIFIED"""
    broker = get_broker(db, broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    success = verify_broker(db, broker_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to verify broker")
    return {"message": "Broker verified successfully", "status": "verified"}

@admin_router.post("/shipper/{shipper_id}/verify")
def verify_shipper_admin(
    shipper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Verify a shipper by setting status to VERIFIED"""
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        raise HTTPException(status_code=404, detail="Shipper not found")
    success = verify_shipper(db, shipper_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to verify shipper")
    return {"message": "Shipper verified successfully", "status": "verified"}