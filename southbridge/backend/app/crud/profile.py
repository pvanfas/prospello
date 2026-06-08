from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.user import User, Driver, Shipper, Broker
from uuid import UUID

# ===== DRIVER CRUD =====

def get_driver_by_id(db: Session, driver_id: int) -> Optional[Driver]:
    """Get driver by ID"""
    return db.query(Driver).filter(Driver.id == driver_id).first()

def get_driver_by_user_id(db: Session, user_id: UUID) -> Optional[Driver]:
    """Get driver by user ID"""
    return db.query(Driver).filter(Driver.user_id == user_id).first()

def get_driver_by_license(db: Session, license_number: str) -> Optional[Driver]:
    """Get driver by license number"""
    return db.query(Driver).filter(Driver.license_number == license_number).first()

def get_all_drivers(db: Session, skip: int = 0, limit: int = 100) -> List[Driver]:
    """Get all drivers with pagination"""
    return db.query(Driver).offset(skip).limit(limit).all()

def create_driver(db: Session, user_id: UUID, license_number: str, vehicle_type: str) -> Driver:
    """Create new driver profile"""
    driver = Driver(
        user_id=user_id,
        license_number=license_number,
        vehicle_type=vehicle_type
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

def update_driver(db: Session, driver_id: int, update_data: dict) -> Optional[Driver]:
    """Update driver profile"""
    driver = get_driver_by_id(db, driver_id)
    if driver:
        for field, value in update_data.items():
            if hasattr(driver, field) and value is not None:
                setattr(driver, field, value)
        db.commit()
        db.refresh(driver)
    return driver

def delete_driver(db: Session, driver_id: int) -> bool:
    """Delete driver profile"""
    driver = get_driver_by_id(db, driver_id)
    if driver:
        db.delete(driver)
        db.commit()
        return True
    return False

# ===== SHIPPER CRUD =====

def get_shipper_by_id(db: Session, shipper_id: int) -> Optional[Shipper]:
    """Get shipper by ID"""
    return db.query(Shipper).filter(Shipper.id == shipper_id).first()

def get_shipper_by_user_id(db: Session, user_id: UUID) -> Optional[Shipper]:
    """Get shipper by user ID"""
    return db.query(Shipper).filter(Shipper.user_id == user_id).first()

def get_shippers_by_company(db: Session, company_name: str) -> List[Shipper]:
    """Get shippers by company name"""
    return db.query(Shipper).filter(
        Shipper.company_name.ilike(f"%{company_name}%")
    ).all()

def get_all_shippers(db: Session, skip: int = 0, limit: int = 100) -> List[Shipper]:
    """Get all shippers with pagination"""
    return db.query(Shipper).offset(skip).limit(limit).all()

def create_shipper(db: Session, user_id: UUID, company_name: str) -> Shipper:
    """Create new shipper profile"""
    shipper = Shipper(
        user_id=user_id,
        company_name=company_name
    )
    db.add(shipper)
    db.commit()
    db.refresh(shipper)
    return shipper

def update_shipper(db: Session, shipper_id: int, update_data: dict) -> Optional[Shipper]:
    """Update shipper profile"""
    shipper = get_shipper_by_id(db, shipper_id)
    if shipper:
        for field, value in update_data.items():
            if hasattr(shipper, field) and value is not None:
                setattr(shipper, field, value)
        db.commit()
        db.refresh(shipper)
    return shipper

def delete_shipper(db: Session, shipper_id: int) -> bool:
    """Delete shipper profile"""
    shipper = get_shipper_by_id(db, shipper_id)
    if shipper:
        db.delete(shipper)
        db.commit()
        return True
    return False

# ===== BROKER CRUD =====

def get_broker_by_id(db: Session, broker_id: int) -> Optional[Broker]:
    """Get broker by ID"""
    return db.query(Broker).filter(Broker.id == broker_id).first()

def get_broker_by_user_id(db: Session, user_id: UUID) -> Optional[Broker]:
    """Get broker by user ID"""
    return db.query(Broker).filter(Broker.user_id == user_id).first()

def get_broker_by_gst(db: Session, gst_number: str) -> Optional[Broker]:
    """Get broker by GST number"""
    return db.query(Broker).filter(Broker.gst_number == gst_number).first()

def get_broker_by_pan(db: Session, pan_number: str) -> Optional[Broker]:
    """Get broker by PAN number"""
    return db.query(Broker).filter(Broker.pan_number == pan_number).first()

def get_brokers_by_agency(db: Session, agency_name: str) -> List[Broker]:
    """Get brokers by agency name"""
    return db.query(Broker).filter(
        Broker.agency_name.ilike(f"%{agency_name}%")
    ).all()

def get_all_brokers(db: Session, skip: int = 0, limit: int = 100) -> List[Broker]:
    """Get all brokers with pagination"""
    return db.query(Broker).offset(skip).limit(limit).all()

def create_broker(db: Session, user_id: UUID, agency_name: str = None, 
                 gst_number: str = None, pan_number: str = None) -> Broker:
    """Create new broker profile"""
    broker = Broker(
        user_id=user_id,
        agency_name=agency_name,
        gst_number=gst_number,
        pan_number=pan_number
    )
    db.add(broker)
    db.commit()
    db.refresh(broker)
    return broker

def update_broker(db: Session, broker_id: int, update_data: dict) -> Optional[Broker]:
    """Update broker profile"""
    broker = get_broker_by_id(db, broker_id)
    if broker:
        for field, value in update_data.items():
            if hasattr(broker, field) and value is not None:
                setattr(broker, field, value)
        db.commit()
        db.refresh(broker)
    return broker

def delete_broker(db: Session, broker_id: int) -> bool:
    """Delete broker profile"""
    broker = get_broker_by_id(db, broker_id)
    if broker:
        db.delete(broker)
        db.commit()
        return True
    return False


def check_profile_completion(user: User) -> dict:
    """Check if user has completed their role-specific profile"""
    from app.models.user import UserType
    
    profile_complete = False
    profile_data = None
    
    if user.role == UserType.DRIVER:
        profile_complete = user.driver is not None
        profile_data = user.driver
    elif user.role == UserType.SHIPPER:
        profile_complete = user.shipper is not None
        profile_data = user.shipper
    elif user.role == UserType.BROKER:
        profile_complete = user.broker is not None
        profile_data = user.broker
    elif user.role == UserType.SERVICE_PROVIDER:
        profile_complete = user.service_provider is not None
        profile_data = user.service_provider
    elif user.role == UserType.ADMIN:
         # Admins don't need additional profiles
        profile_complete = True 
    
    return {
        "user_role": user.role,
        "profile_complete": profile_complete,
        "profile_data": profile_data
    }

def get_users_missing_profiles(db: Session, user_type: str = None) -> List[User]:
    """Get users who haven't completed their role-specific profiles"""
    from app.models.user import UserType
    
    query = db.query(User)
    
    if user_type:
        query = query.filter(User.role == user_type)
    
    users = query.all()
    missing_profiles = []

# ===== SERVICE PROVIDER CRUD =====

def get_service_provider_by_id(db: Session, provider_id: int):
    """Get service provider by ID"""
    from app.models.service import ServiceProvider
    return db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()

def get_service_provider_by_user_id(db: Session, user_id: UUID):
    """Get service provider by user ID"""
    from app.models.service import ServiceProvider
    return db.query(ServiceProvider).filter(ServiceProvider.user_id == user_id).first()

def create_service_provider(db: Session, user_id: UUID, provider_data: dict):
    """Create new service provider profile"""
    from app.models.service import ServiceProvider
    from app.models.user import VerificationStatus
    import json
    
    # Handle Google Places data
    address_components = provider_data.get('address_components')
    if address_components and isinstance(address_components, dict):
        address_components = json.dumps(address_components)
    
    provider = ServiceProvider(
        user_id=user_id,
        business_name=provider_data.get('business_name'),
        business_type=provider_data.get('business_type'),
        business_phone=provider_data.get('business_phone'),
        license_number=provider_data.get('license_number'),
        gst_number=provider_data.get('gst_number'),
        shop_location_latitude=provider_data.get('shop_location_latitude'),
        shop_location_longitude=provider_data.get('shop_location_longitude'),
        shop_location_address=provider_data.get('shop_location_address') or provider_data.get('formatted_address'),
        max_service_radius=provider_data.get('max_service_radius', 50),
        base_price=provider_data.get('base_price'),
        emergency_surcharge=provider_data.get('emergency_surcharge', 0),
        verification_status=VerificationStatus.PENDING
    )
    
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider

def update_service_provider(db: Session, provider_id: int, update_data: dict):
    """Update service provider profile"""
    from app.models.service import ServiceProvider
    
    provider = get_service_provider_by_id(db, provider_id)
    if provider:
        for field, value in update_data.items():
            if hasattr(provider, field) and value is not None:
                setattr(provider, field, value)
        db.commit()
        db.refresh(provider)
    return provider

def update_service_provider_location(db: Session, provider_id: int, latitude: float, longitude: float, city: str = None, state: str = None):
    """Update service provider current location"""
    from app.models.service import ServiceProvider
    from datetime import datetime
    
    provider = get_service_provider_by_id(db, provider_id)
    if provider:
        provider.shop_location_latitude = latitude
        provider.shop_location_longitude = longitude
        if city:
            provider.shop_location_address = f"{city}, {state}" if state else city
        db.commit()
        db.refresh(provider)
    return provider

def get_service_provider_profile(db: Session, user_id: UUID):
    """Get comprehensive service provider profile combining User and ServiceProvider data"""
    from app.models.service import ServiceProvider
    from app.models.user import User
    
    # Get user with service provider relationship
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    service_provider = get_service_provider_by_user_id(db, user_id)
    if not service_provider:
        return None
    
    # Check profile completion
    missing_fields = []
    if not service_provider.business_name:
        missing_fields.append("business_name")
    if not service_provider.shop_location_latitude or not service_provider.shop_location_longitude:
        missing_fields.append("location")
    if not service_provider.business_phone:
        missing_fields.append("business_phone")
    if not service_provider.license_number:
        missing_fields.append("license_number")
    
    profile_complete = len(missing_fields) == 0
    
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "phone_number": user.phone_number,
        "refercode": user.refercode,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "service_provider": service_provider,
        "current_latitude": service_provider.shop_location_latitude,
        "current_longitude": service_provider.shop_location_longitude,
        "current_city": None,  # Could be extracted from address
        "current_state": None,  # Could be extracted from address
        "last_location_update": service_provider.updated_at,
        "profile_complete": profile_complete,
        "missing_fields": missing_fields
    }

def get_all_service_providers(db: Session, skip: int = 0, limit: int = 100):
    """Get all service providers with pagination"""
    from app.models.service import ServiceProvider
    return db.query(ServiceProvider).offset(skip).limit(limit).all()

def delete_service_provider(db: Session, provider_id: int) -> bool:
    """Delete service provider profile"""
    from app.models.service import ServiceProvider
    
    provider = get_service_provider_by_id(db, provider_id)
    if provider:
        db.delete(provider)
        db.commit()
        return True
    return False

def update_location_from_google_place(db: Session, provider_id: int, place_data: dict):
    """Update service provider location from Google Places selection"""
    from app.models.service import ServiceProvider
    import json
    
    provider = get_service_provider_by_id(db, provider_id)
    if provider:
        provider.shop_location_latitude = place_data.get('latitude')
        provider.shop_location_longitude = place_data.get('longitude')
        provider.shop_location_address = place_data.get('formatted_address')
        
        # Store additional Google Places data if needed
        # You might want to add these fields to the ServiceProvider model
        # provider.place_id = place_data.get('place_id')
        # provider.google_place_name = place_data.get('place_name')
        
        db.commit()
        db.refresh(provider)
    return provider

def update_location_from_map(db: Session, provider_id: int, map_data: dict):
    """Update service provider location from map selection"""
    from app.models.service import ServiceProvider
    
    provider = get_service_provider_by_id(db, provider_id)
    if provider:
        provider.shop_location_latitude = map_data.get('latitude')
        provider.shop_location_longitude = map_data.get('longitude')
        
        # Build address from components
        address_parts = []
        if map_data.get('address'):
            address_parts.append(map_data['address'])
        if map_data.get('city'):
            address_parts.append(map_data['city'])
        if map_data.get('state'):
            address_parts.append(map_data['state'])
        if map_data.get('country'):
            address_parts.append(map_data['country'])
        
        if address_parts:
            provider.shop_location_address = ', '.join(address_parts)
        
        db.commit()
        db.refresh(provider)
    return provider

def get_location_info(db: Session, provider_id: int):
    """Get service provider location information"""
    from app.models.service import ServiceProvider
    
    provider = get_service_provider_by_id(db, provider_id)
    if not provider:
        return None
    
    return {
        "latitude": provider.shop_location_latitude,
        "longitude": provider.shop_location_longitude,
        "address": provider.shop_location_address,
        "last_updated": provider.updated_at
    }