"""
User CRUD operations - similar to Django ORM querysets.
"""
from datetime import datetime
import re
from sqlite3 import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.crud.bed import create_refferal
from app.crud.bed import get_user_by_referecode, initialize_bed_wallet, generate_unique_referral_code
from app.models.user import Otp, User, Broker, Shipper, Driver, UserType
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.admin import AdminBrokerCreate, AdminBrokerUpdate, AdminShipperCreate, AdminShipperUpdate, AdminDriverCreate, AdminDriverUpdate
from app.core.security import hash_password
from sqlalchemy import func, and_
from typing import List
from app.models.user import VerificationStatus

def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID - similar to User.objects.get(id=user_id)"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_number(db: Session, phone_number: str) -> Optional[User]:
    """Get user by phone number - similar to User.objects.get(phone_number=phone_number)"""
    return db.query(User).filter(User.phone_number == phone_number).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username - similar to User.objects.get(username=username)"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_username_or_email_or_phone(db: Session, username: str) -> Optional[User]:
    """Get user by username or email or phone for login"""
    return db.query(User).filter(
        or_(User.username == username, User.email == username, User.phone_number == username)
    ).first()

def create_user(db: Session, user: UserCreate) -> User:
    """
    Create new user - similar to User.objects.create_user()
    """
    
    try:
        referenced_by = get_user_by_referecode(db,user.refercode)
        reference_id = referenced_by.id if referenced_by else None
        print(f"Referrer ID: {reference_id}")
        # Generate a unique referral code for the new user
        referral_code = generate_unique_referral_code(db)
        
        db_user = User(
            email=user.email,
            username=user.username,
            phone_number=user.phone_number,
            role=user.role,
            refercode=referral_code,
            refered_by = reference_id,
        
        )
        
        db.add(db_user)
        db.flush()
        
        #create wallet
        print(f"✓ User created: {db_user.username} ({db_user.id})")
        
        wallet = initialize_bed_wallet(
                db=db,
                user_id=db_user.id,
                referrer_id=reference_id
            )
        
        print(f"✅ User and BED wallet created successfully\n")
        
        
        if reference_id:
            create_refferal(db, db_user.id, reference_id)
        db.commit()
        db.refresh(db_user)
        return db_user
        
    except IntegrityError as e:
        db.rollback()
        print(f"❌ Database integrity error: {e}")
        
        if "email" in str(e).lower():
            raise ValueError("Email already exists")
        elif "phone" in str(e).lower():
            raise ValueError("Phone number already exists")
        elif "username" in str(e).lower():
            raise ValueError("Username already taken")
        else:
            raise ValueError("User creation failed")
    
    except ValueError:
        db.rollback()
        raise
    
    except Exception as e:
        db.rollback()
        print(f"❌ Unexpected error in create_user_with_bed: {e}")
        raise ValueError(f"Error creating user: {str(e)}")

def create_user_with_profile(db: Session, user_data: dict) -> User:
    """
    Create new user with profile data in a single transaction
    """
    try:
        referenced_by = get_user_by_referecode(db, user_data.get('refercode'))
        reference_id = referenced_by.id if referenced_by else None
        print(f"Referrer ID: {reference_id}")
        
        # Generate a unique referral code for the new user
        referral_code = generate_unique_referral_code(db)
        
        # Create user
        db_user = User(
            email=user_data.get('email'),
            username=user_data['username'],
            phone_number=user_data['phone_number'],
            role=user_data['role'],
            refercode=referral_code,
            refered_by=reference_id,
        )
        
        db.add(db_user)
        db.flush()
        
        print(f" User created: {db_user.username} ({db_user.id}) with role {user_data['role']}")
        
        # Create wallet
        wallet = initialize_bed_wallet(
            db=db,
            user_id=db_user.id,
            referrer_id=reference_id
        )
        
        # Create profile based on role
        profile_data = user_data.get('profileData', {})
        if user_data['role'] == UserType.DRIVER and profile_data:
            from app.models.user import Driver
            driver = Driver(
                user_id=db_user.id,
                license_number=profile_data.get('license_number'),
                vehicle_type=profile_data.get('vehicle_type'),
                max_weight_capacity=profile_data.get('max_weight_capacity'),
                vehicle_registration=profile_data.get('vehicle_registration'),
            )
            db.add(driver)
            
        elif user_data['role'] == UserType.SHIPPER and profile_data:
            from app.models.user import Shipper
            shipper = Shipper(
                user_id=db_user.id,
                company_name=profile_data.get('company_name'),
            )
            db.add(shipper)
            
        elif user_data['role'] == UserType.BROKER and profile_data:
            from app.models.user import Broker
            broker = Broker(
                user_id=db_user.id,
                company_name=profile_data.get('company_name'),
            )
            db.add(broker)
            
        elif user_data['role'] == UserType.SERVICE_PROVIDER and profile_data:
            from app.models.service import ServiceProvider, ServiceProviderCategory
            service_provider = ServiceProvider(
                user_id=db_user.id,
                business_name=profile_data.get('business_name'),
                business_type=profile_data.get('business_type'),
                license_number=profile_data.get('license_number'),
                shop_location_address=profile_data.get('shop_location_address'),
                shop_location_latitude=profile_data.get('shop_location_latitude'),
                shop_location_longitude=profile_data.get('shop_location_longitude'),
            )
            db.add(service_provider)
            db.flush()  # Flush to get the service_provider ID
            
            # Create service provider categories
            selected_categories = user_data.get('selectedCategories', [])
            for category_id in selected_categories:
                service_provider_category = ServiceProviderCategory(
                    service_provider_id=service_provider.id,
                    category_id=category_id,
                    current_status="available",
                    emergency_available=True  # Default to true for new providers
                )
                db.add(service_provider_category)
        
        if reference_id:
            create_refferal(db, db_user.id, reference_id)
            
        db.commit()
        db.refresh(db_user)
        print(f"✅ User and profile created successfully\n")
        return db_user
        
    except IntegrityError as e:
        db.rollback()
        print(f"❌ Database integrity error: {e}")
        
        if "email" in str(e).lower():
            raise ValueError("Email already exists")
        elif "phone" in str(e).lower():
            raise ValueError("Phone number already exists")
        elif "username" in str(e).lower():
            raise ValueError("Username already taken")
        else:
            raise ValueError("User creation failed")
    
    except ValueError:
        db.rollback()
        raise
    
    except Exception as e:
        db.rollback()
        print(f"Unexpected error in create_user_with_profile: {e}")
        raise ValueError(f"Error creating user: {str(e)}")

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """Update user - similar to Django's user.save()"""
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
      
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    """Delete user - similar to user.delete()"""
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False


def create_signup_otp(db: Session, phone_number: str, otp_code: str, expiration_time: datetime) -> Otp:
    """Create a new OTP record"""
    try:
        otp = Otp(
            phone_number=phone_number,
            otp_code=otp_code,
            expiration_time=expiration_time
        )
        db.add(otp)
        db.commit()
        db.refresh(otp)
        print("OTP created successfully")
        return otp
    except Exception as e:
        print(e)
        db.rollback()
        raise e
    

def verify_signup_otp(db: Session, phone_number: str, otp_code: str) -> bool:
    """Verify the OTP for user signup"""
    otp = db.query(Otp).filter(
        Otp.phone_number == phone_number,
        Otp.otp_code == otp_code,
        Otp.expiration_time > datetime.now()
    ).first()
    return otp is not None

# ===== BROKER CRUD OPERATIONS =====

def get_brokers(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    status: Optional[str] = None
) -> List[Broker]:
    """Get all brokers with optional filtering and pagination"""
    query = db.query(Broker).join(User).filter(User.role == UserType.BROKER)
    
    if search:
        search_filter = or_(
            Broker.agency_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.username.ilike(f"%{search}%"),
            User.phone_number.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if status == "active":
        query = query.filter(User.is_active == True)
    elif status == "inactive":
        query = query.filter(User.is_active == False)
    
    return query.offset(skip).limit(limit).all()

def get_broker(db: Session, broker_id: int) -> Optional[Broker]:
    """Get broker by ID"""
    return db.query(Broker).filter(Broker.id == broker_id).first()

def get_broker_by_user_id(db: Session, user_id: str) -> Optional[Broker]:
    """Get broker by user ID"""
    return db.query(Broker).filter(Broker.user_id == user_id).first()

def create_broker(db: Session, broker_data: AdminBrokerCreate) -> Broker:
    """Create a new broker with user account"""
    # Create user first
    user = User(
        username=broker_data.username,
        email=broker_data.email,
        phone_number=broker_data.phone_number,
        password_hash=hash_password(broker_data.password),
        role=UserType.BROKER,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create broker profile
    broker = Broker(
        user_id=user.id,
        agency_name=broker_data.agency_name,
        gst_number=broker_data.gst_number,
        pan_number=broker_data.pan_number
    )
    db.add(broker)
    db.commit()
    db.refresh(broker)
    return broker

def update_broker(db: Session, broker_id: int, broker_update: AdminBrokerUpdate) -> Optional[Broker]:
    """Update broker information"""
    broker = get_broker(db, broker_id)
    if not broker:
        return None
    
    # Update broker fields
    broker_data = broker_update.model_dump(exclude_unset=True, exclude={'username', 'email', 'phone_number', 'is_active'})
    for field, value in broker_data.items():
        if value is not None:
            setattr(broker, field, value)
    
    # Update user fields if provided
    user = broker.user
    user_data = {
        'username': broker_update.username,
        'email': broker_update.email,
        'phone_number': broker_update.phone_number,
        'is_active': broker_update.is_active
    }
    
    for field, value in user_data.items():
        if value is not None:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(broker)
    return broker

def deactivate_broker(db: Session, broker_id: int) -> bool:
    """Deactivate broker (soft delete by setting is_active=False)"""
    broker = get_broker(db, broker_id)
    if broker:
        broker.user.is_active = False
        db.commit()
        return True
    return False

def delete_broker(db: Session, broker_id: int) -> bool:
    """Permanently delete broker and associated user"""
    broker = get_broker(db, broker_id)
    if broker:
        # Delete the user (this will cascade to broker due to foreign key)
        db.delete(broker.user)
        db.commit()
        return True
    return False

def get_broker_stats(db: Session, broker_id: int) -> dict:
    """Get statistics for a specific broker"""
    from app.models.load import Load, LoadStatus
    from app.models.order import Order
    
    broker = get_broker(db, broker_id)
    if not broker:
        return {}
    
    # Count loads created by this broker
    total_loads = db.query(Load).filter(Load.broker_id == broker_id).count()
    
    # Count orders from broker's loads
    total_orders = db.query(Order).join(Load).filter(Load.broker_id == broker_id).count()
    
    # Count active loads
    active_loads = db.query(Load).filter(
        Load.broker_id == broker_id,
        Load.status.in_([LoadStatus.POSTED, LoadStatus.BIDDING, LoadStatus.ASSIGNED, LoadStatus.IN_TRANSIT])
    ).count()
    
    return {
        'total_loads': total_loads,
        'total_orders': total_orders,
        'active_loads': active_loads
    }

# ===== BROKER VERIFICATION HELPERS =====
def verify_broker(db: Session, broker_id: int) -> bool:
    """Set broker status to VERIFIED"""
    broker = get_broker(db, broker_id)
    if not broker:
        return False
    broker.status = VerificationStatus.VERIFIED
    db.commit()
    db.refresh(broker)
    return True

def reject_broker(db: Session, broker_id: int) -> bool:
    """Set broker status to REJECTED"""
    broker = get_broker(db, broker_id)
    if not broker:
        return False
    broker.status = VerificationStatus.REJECTED
    db.commit()
    db.refresh(broker)
    return True

# ===== SHIPPER CRUD OPERATIONS =====

def get_shippers(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    status: Optional[str] = None
) -> List[Shipper]:
    """Get all shippers with optional filtering and pagination"""
    query = db.query(Shipper).join(User).filter(User.role == UserType.SHIPPER)
    
    if search:
        search_filter = or_(
            Shipper.company_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.username.ilike(f"%{search}%"),
            User.phone_number.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if status == "active":
        query = query.filter(User.is_active == True)
    elif status == "inactive":
        query = query.filter(User.is_active == False)
    
    return query.offset(skip).limit(limit).all()

def get_shipper(db: Session, shipper_id: int) -> Optional[Shipper]:
    """Get shipper by ID"""
    return db.query(Shipper).filter(Shipper.id == shipper_id).first()

def get_shipper_by_user_id(db: Session, user_id: str) -> Optional[Shipper]:
    """Get shipper by user ID"""
    return db.query(Shipper).filter(Shipper.user_id == user_id).first()

def create_shipper(db: Session, shipper_data: AdminShipperCreate) -> Shipper:
    """Create a new shipper with user account"""
    # Create user first
    user = User(
        username=shipper_data.username,
        email=shipper_data.email,
        phone_number=shipper_data.phone_number,
        password_hash=hash_password(shipper_data.password),
        role=UserType.SHIPPER,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create shipper profile
    shipper = Shipper(
        user_id=user.id,
        company_name=shipper_data.company_name,
        gst_number=shipper_data.gst_number,
        pan_number=shipper_data.pan_number
    )
    db.add(shipper)
    db.commit()
    db.refresh(shipper)
    return shipper

def update_shipper(db: Session, shipper_id: int, shipper_update: AdminShipperUpdate) -> Optional[Shipper]:
    """Update shipper information"""
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        return None
    
    # Update shipper fields
    shipper_data = shipper_update.model_dump(exclude_unset=True, exclude={'username', 'email', 'phone_number', 'is_active'})
    for field, value in shipper_data.items():
        if value is not None:
            setattr(shipper, field, value)
    
    # Update user fields if provided
    user = shipper.user
    user_data = {
        'username': shipper_update.username,
        'email': shipper_update.email,
        'phone_number': shipper_update.phone_number,
        'is_active': shipper_update.is_active
    }
    
    for field, value in user_data.items():
        if value is not None:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(shipper)
    return shipper

def deactivate_shipper(db: Session, shipper_id: int) -> bool:
    """Deactivate shipper (soft delete by setting is_active=False)"""
    shipper = get_shipper(db, shipper_id)
    if shipper:
        shipper.user.is_active = False
        db.commit()
        return True
    return False

def delete_shipper(db: Session, shipper_id: int) -> bool:
    """Permanently delete shipper and associated user"""
    shipper = get_shipper(db, shipper_id)
    if shipper:
        # Delete the user (this will cascade to shipper due to foreign key)
        db.delete(shipper.user)
        db.commit()
        return True
    return False

def get_shipper_stats(db: Session, shipper_id: int) -> dict:
    """Get statistics for a specific shipper"""
    from app.models.load import Load, LoadStatus
    from app.models.order import Order
    
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        return {}
    
    # Count loads created by this shipper
    total_loads = db.query(Load).filter(Load.shipper_id == shipper_id).count()
    
    # Count orders from shipper's loads
    total_orders = db.query(Order).join(Load).filter(Load.shipper_id == shipper_id).count()
    
    # Count active loads
    active_loads = db.query(Load).filter(
        Load.shipper_id == shipper_id,
        Load.status.in_([LoadStatus.POSTED, LoadStatus.BIDDING, LoadStatus.ASSIGNED, LoadStatus.IN_TRANSIT])
    ).count()
    
    return {
        'total_loads': total_loads,
        'total_orders': total_orders,
        'active_loads': active_loads
    }

# ===== SHIPPER VERIFICATION HELPERS =====
def verify_shipper(db: Session, shipper_id: int) -> bool:
    """Set shipper status to VERIFIED"""
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        return False
    shipper.status = VerificationStatus.VERIFIED
    db.commit()
    db.refresh(shipper)
    return True

def reject_shipper(db: Session, shipper_id: int) -> bool:
    """Set shipper status to REJECTED"""
    shipper = get_shipper(db, shipper_id)
    if not shipper:
        return False
    shipper.status = VerificationStatus.REJECTED
    db.commit()
    db.refresh(shipper)
    return True


def get_driver_nearby(db: Session, latitude: float, longitude: float, radius: float) -> List[Driver]:
    """Get drivers nearby"""
    return db.query(Driver).filter(Driver.current_latitude.isnot(None), Driver.current_longitude.isnot(None)).filter(
        func.ST_Distance(func.ST_Point(Driver.current_longitude, Driver.current_latitude), func.ST_Point(longitude, latitude)) <= radius
    ).all()

# ===== DRIVER CRUD OPERATIONS =====

def get_drivers(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    status: Optional[str] = None,
    verification_status: Optional[str] = None
) -> List[Driver]:
    """Get all drivers with optional filtering and pagination"""
    query = db.query(Driver).join(User).filter(User.role == UserType.DRIVER)
    
    if search:
        search_filter = or_(
            Driver.license_number.ilike(f"%{search}%"),
            Driver.vehicle_type.ilike(f"%{search}%"),
            Driver.vehicle_registration.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.username.ilike(f"%{search}%"),
            User.phone_number.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if status == "active":
        query = query.filter(User.is_active == True)
    elif status == "inactive":
        query = query.filter(User.is_active == False)
    
    if verification_status:
        query = query.filter(Driver.verification_status == verification_status)
    
    return query.offset(skip).limit(limit).all()

def get_driver(db: Session, driver_id: int) -> Optional[Driver]:
    """Get driver by ID"""
    return db.query(Driver).filter(Driver.id == driver_id).first()

def get_driver_by_user_id(db: Session, user_id: str) -> Optional[Driver]:
    """Get driver by user ID"""
    return db.query(Driver).filter(Driver.user_id == user_id).first()

def create_driver(db: Session, driver_data: AdminDriverCreate) -> Driver:
    """Create a new driver with user account"""
    # Create user first
    user = User(
        username=driver_data.username,
        email=driver_data.email,
        phone_number=driver_data.phone_number,
        password_hash=hash_password(driver_data.password),
        role=UserType.DRIVER,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create driver profile
    driver = Driver(
        user_id=user.id,
        license_number=driver_data.license_number,
        vehicle_type=driver_data.vehicle_type,
        max_weight_capacity=driver_data.max_weight_capacity,
        max_volume_capacity=driver_data.max_volume_capacity,
        vehicle_registration=driver_data.vehicle_registration,
        insurance_number=driver_data.insurance_number,
        preferred_routes=driver_data.preferred_routes,
        upi_id=driver_data.upi_id,
        bank_account_number=driver_data.bank_account_number,
        ifsc_code=driver_data.ifsc_code,
        account_holder_name=driver_data.account_holder_name,
        vehicle_image_url=driver_data.vehicle_image  # Assuming this is already a URL
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

def update_driver(db: Session, driver_id: int, driver_update: AdminDriverUpdate) -> Optional[Driver]:
    """Update driver information"""
    driver = get_driver(db, driver_id)
    if not driver:
        return None
    
    # Update driver fields
    driver_data = driver_update.model_dump(exclude_unset=True, exclude={'username', 'email', 'phone_number', 'is_active'})
    for field, value in driver_data.items():
        if value is not None:
            setattr(driver, field, value)
    
    # Update user fields if provided
    user = driver.user
    user_data = {
        'username': driver_update.username,
        'email': driver_update.email,
        'phone_number': driver_update.phone_number,
        'is_active': driver_update.is_active
    }
    
    for field, value in user_data.items():
        if value is not None:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(driver)
    return driver

def deactivate_driver(db: Session, driver_id: int) -> bool:
    """Deactivate driver (soft delete by setting is_active=False)"""
    driver = get_driver(db, driver_id)
    if driver:
        driver.user.is_active = False
        db.commit()
        return True
    return False

def delete_driver(db: Session, driver_id: int) -> bool:
    """Permanently delete driver and associated user"""
    driver = get_driver(db, driver_id)
    if driver:
        # Delete the user (this will cascade to driver due to foreign key)
        db.delete(driver.user)
        db.commit()
        return True
    return False

def get_driver_stats(db: Session, driver_id: int) -> dict:
    """Get statistics for a specific driver"""
    from app.models.bid import Bid
    from app.models.order import Order, OrderStatus
    
    driver = get_driver(db, driver_id)
    if not driver:
        return {}
    
    # Count bids made by this driver
    total_bids = db.query(Bid).filter(Bid.driver_id == driver_id).count()
    
    # Count orders from driver's bids
    total_orders = db.query(Order).join(Bid).filter(Bid.driver_id == driver_id).count()
    
    # Count active orders (orders that are not completed or cancelled)
    active_orders = db.query(Order).join(Bid).filter(
        Bid.driver_id == driver_id,
        Order.status.in_([OrderStatus.BID_ACCEPTED, OrderStatus.DRIVER_ACCEPTED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT])
    ).count()
    
    # Count completed orders
    completed_orders = db.query(Order).join(Bid).filter(
        Bid.driver_id == driver_id,
        Order.status == OrderStatus.DELIVERED
    ).count()
    
    return {
        'total_bids': total_bids,
        'total_orders': total_orders,
        'active_orders': active_orders,
        'completed_orders': completed_orders
    }

def verify_driver(db: Session, driver_id: int) -> bool:
    """Verify a driver by setting verification_status to VERIFIED"""
    driver = get_driver(db, driver_id)
    if not driver:
        return False
    
    from app.models.user import VerificationStatus
    driver.verification_status = VerificationStatus.VERIFIED
    db.commit()
    db.refresh(driver)
    return True

def reject_driver(db: Session, driver_id: int) -> bool:
    """Reject a driver by setting verification_status to REJECTED"""
    driver = get_driver(db, driver_id)
    if not driver:
        return False
    
    from app.models.user import VerificationStatus
    driver.verification_status = VerificationStatus.REJECTED
    db.commit()
    db.refresh(driver)
    return True


def verify_driver_license(db: Session, driver_id: int) -> bool:
    driver = get_driver(db, driver_id)
    if not driver:
        raise ValueError("Driver not found")
    
    #external api to verify license
    return True

def get_data_from_rc(db: Session, driver_id: int) -> dict:
    driver = get_driver(db, driver_id)
    if not driver:
        raise ValueError("Driver not found")
    
    #external api to get data from rc
    return  {
        "name": driver.name,
        "vehicle_type": driver.vehicle_type,
        "vehicle_number": driver.vehicle_number,
    }
    
    