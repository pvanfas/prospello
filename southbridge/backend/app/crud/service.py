from fastapi import HTTPException
from app.models.service import ServiceBooking, ServiceCategory, ServiceProvider, BookingStatus, ServiceProviderCategory

from uuid import UUID
from sqlalchemy.orm import Session


def book_service(db: Session, service_id: int, user_id: UUID):
    selected_service = db.query(ServiceProviderCategory).filter(ServiceProviderCategory.id == service_id).first()
    if not selected_service:
        raise HTTPException(status_code=404, detail="Service not found")
    pass


def complete_service(db: Session, service_id: int, user_id: UUID):
    pass


def get_selected_service(db: Session, service_id: int):
    return db.query(ServiceProviderCategory).filter(ServiceProviderCategory.id == service_id).first()

def complete_service_booking(db: Session, service_id: int, user_id: UUID):
    pass

def review_service(db: Session, service_id: int, user_id: UUID, rating: int, comment: str):
    pass

def accept_service_booking(db: Session, service_id: int, user_id: UUID):
    pass

def reject_service_booking(db: Session, service_id: int, user_id: UUID):
    pass


def get_nearby_services(db: Session, latitude: float, longitude: float, radius: float, service_type: str, page: int = 1, limit: int = 10):
    """
    Get nearby service providers within the specified radius.
    If service_type is 'all', return all services. Otherwise, filter by service category slug.
    """
    from sqlalchemy import text
    from app.models.service import ServiceProvider, ServiceProviderCategory, ServiceCategory
    
    # Base query to get service providers with their categories
    base_query = db.query(ServiceProvider, ServiceProviderCategory, ServiceCategory).join(
        ServiceProviderCategory, ServiceProvider.id == ServiceProviderCategory.service_provider_id
    ).join(
        ServiceCategory, ServiceProviderCategory.category_id == ServiceCategory.id
    ).filter(
        ServiceProvider.shop_location_latitude.isnot(None),
        ServiceProvider.shop_location_longitude.isnot(None),
        ServiceCategory.is_active == True,
        ServiceProviderCategory.current_status == 'available'
    )
    
    # If service_type is not 'all', filter by category slug
    if service_type != 'all':
        base_query = base_query.filter(ServiceCategory.slug == service_type)
    
    # Execute the query and filter by distance using Python
    # This is more efficient than complex SQL for distance calculations
    results = base_query.all()
    
    nearby_services = []
    for service_provider, provider_category, category in results:
        # Calculate distance using Haversine formula
        distance = calculate_distance(
            latitude, longitude,
            service_provider.shop_location_latitude,
            service_provider.shop_location_longitude
        )
        
        if distance <= radius:
            nearby_services.append({
                'service_provider': service_provider,
                'provider_category': provider_category,
                'category': category,
                'distance': distance
            })
    
    # Sort by distance
    nearby_services.sort(key=lambda x: x['distance'])
    
    # Apply pagination
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_services = nearby_services[start_index:end_index]
    
    return paginated_services


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth (in kilometers)
    using the Haversine formula.
    """
    import math
    
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    return c * r


def get_available_categories(db: Session, latitude: float, longitude: float, radius: float):
    """get available categories within the specified radius"""
    pass

def get_all_categories(db: Session):
    """get all categories"""
    return db.query(ServiceCategory).filter(ServiceCategory.is_active == True).all()


def create_service_category(db: Session, category_data: dict):
    """Create a new service category"""
    # Check if category with same slug already exists
    existing_category = db.query(ServiceCategory).filter(ServiceCategory.slug == category_data['slug']).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    # Create new category
    new_category = ServiceCategory(**category_data)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


def book_service(db: Session, booking_data: dict, user_id: UUID):
    """Book a service"""
    from app.models.service import ServiceBooking, ServiceProviderCategory
    from datetime import datetime
    import uuid
    
    # Validate that the service category exists and is available
    service_category = db.query(ServiceProviderCategory).filter(
        ServiceProviderCategory.id == booking_data['booked_category_id']
    ).first()
    
    if not service_category:
        raise HTTPException(status_code=404, detail="Service category not found")
    
    if service_category.current_status != "available":
        raise HTTPException(status_code=400, detail="Service is not available at the moment")
    
    # Generate unique booking ID
    booking_id = f"SB-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Parse scheduled_at datetime
    scheduled_at = datetime.fromisoformat(booking_data['scheduled_at'].replace('Z', '+00:00'))
    
    # Create booking
    new_booking = ServiceBooking(
        booking_id=booking_id,
        booked_category_id=booking_data['booked_category_id'],
        user_id=user_id,
        provider_id=service_category.service_provider_id,
        service_description=booking_data.get('service_description'),
        vehicle_details=booking_data.get('vehicle_details'),
        service_latitude=booking_data.get('service_latitude'),
        service_longitude=booking_data.get('service_longitude'),
        service_address=booking_data.get('service_address'),
        scheduled_at=scheduled_at,
        is_emergency=booking_data.get('is_emergency', False),
        estimated_cost=booking_data.get('estimated_cost'),
        emergency_surcharge=service_category.service_provider.emergency_surcharge if booking_data.get('is_emergency', False) else 0
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return new_booking


def get_service_provider_categories(db: Session, provider_id: int):
    """Get all service categories for a specific service provider"""
    from app.models.service import ServiceProviderCategory
    
    categories = db.query(ServiceProviderCategory).filter(
        ServiceProviderCategory.service_provider_id == provider_id
    ).all()
    
    return categories


def update_service_provider_category(db: Session, category_id: int, provider_id: int, update_data: dict):
    """Update service provider category details"""
    from app.models.service import ServiceProviderCategory
    
    # Find the category and ensure it belongs to the provider
    category = db.query(ServiceProviderCategory).filter(
        ServiceProviderCategory.id == category_id,
        ServiceProviderCategory.service_provider_id == provider_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Service category not found or not owned by provider")
    
    # Update fields
    for field, value in update_data.items():
        if value is not None:
            setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return category


def add_service_category_to_provider(db: Session, provider_id: int, category_id: int, price_from: float = None, price_to: float = None):
    """Add a new service category to a service provider"""
    from app.models.service import ServiceProviderCategory
    
    # Check if category already exists for this provider
    existing = db.query(ServiceProviderCategory).filter(
        ServiceProviderCategory.service_provider_id == provider_id,
        ServiceProviderCategory.category_id == category_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Service category already added to provider")
    
    # Create new service provider category
    new_provider_category = ServiceProviderCategory(
        service_provider_id=provider_id,
        category_id=category_id,
        price_from=price_from,
        price_to=price_to
    )
    
    db.add(new_provider_category)
    db.commit()
    db.refresh(new_provider_category)
    
    return new_provider_category