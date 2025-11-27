from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserType
from app.crud.profile import (
    get_service_provider_profile,
    create_service_provider,
    update_service_provider,
    update_service_provider_location,
    get_service_provider_by_user_id,
    get_all_service_providers,
    update_location_from_google_place,
    update_location_from_map,
    get_location_info
)
from app.schemas.profile import (
    ServiceProviderCreate,
    ServiceProviderUpdate,
    ServiceProviderProfileResponse,
    ServiceProviderResponse,
    LocationUpdateRequest,
    GooglePlaceRequest,
    MapLocationRequest,
    LocationResponse
)

router = APIRouter()

@router.get("/profile", response_model=ServiceProviderProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current service provider's comprehensive profile"""
    if current_user.role != UserType.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access this endpoint"
        )
    
    profile = get_service_provider_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider profile not found. Please complete your profile first."
        )
    
    return profile

@router.get("/profile/complete/")
def get_service_provider_profile_complete(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete service provider profile with all fields including wallet data"""
    if current_user.role != UserType.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access this endpoint"
        )
    
    # Get service provider profile
    profile = get_service_provider_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider profile not found. Please complete your profile first."
        )
    
    # Get wallet data (if wallet system exists)
    wallet = None
    try:
        from app.models.payment import Wallet
        wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    except:
        pass  # Wallet system might not be implemented yet
    
    # Get service provider categories
    service_categories = []
    try:
        from app.models.service import ServiceProviderCategory, ServiceCategory
        provider_categories = db.query(ServiceProviderCategory).filter(
            ServiceProviderCategory.service_provider_id == profile['service_provider'].id
        ).all()
        
        for pc in provider_categories:
            category = db.query(ServiceCategory).filter(ServiceCategory.id == pc.category_id).first()
            if category:
                service_categories.append({
                    'id': category.id,
                    'name': category.name,
                    'slug': category.slug,
                    'description': category.description,
                    'icon_url': category.icon_url,
                    'is_emergency': category.is_emergency,
                    'current_status': pc.current_status,
                    'price_from': float(pc.price_from) if pc.price_from else None,
                    'price_to': float(pc.price_to) if pc.price_to else None,
                    'emergency_available': pc.emergency_available
                })
    except Exception as e:
        print(f"Error fetching service categories: {e}")
    
    # Get certificates
    certificates = []
    try:
        from app.models.user import Certificate
        certificates = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
        certificates = [
            {
                'id': cert.id,
                'certificate_type': cert.certificate_type,
                'certificate': cert.certificate,
                'created_at': cert.created_at
            }
            for cert in certificates
        ]
    except Exception as e:
        print(f"Error fetching certificates: {e}")
    
    # Build comprehensive response
    service_provider_data = {
        'id': profile['service_provider'].id,
        'user_id': profile['service_provider'].user_id,
        'business_name': profile['service_provider'].business_name,
        'business_type': profile['service_provider'].business_type,
        'business_phone': profile['service_provider'].business_phone,
        'license_number': profile['service_provider'].license_number,
        'gst_number': profile['service_provider'].gst_number,
        'verification_status': profile['service_provider'].verification_status,
        'shop_location_latitude': profile['service_provider'].shop_location_latitude,
        'shop_location_longitude': profile['service_provider'].shop_location_longitude,
        'shop_location_address': profile['service_provider'].shop_location_address,
        'max_service_radius': profile['service_provider'].max_service_radius,
        'rating': profile['service_provider'].rating,
        'total_services': profile['service_provider'].total_services,
        'completion_rate': profile['service_provider'].completion_rate,
        'response_time_avg': profile['service_provider'].response_time_avg,
        'base_price': float(profile['service_provider'].base_price) if profile['service_provider'].base_price else None,
        'emergency_surcharge': float(profile['service_provider'].emergency_surcharge) if profile['service_provider'].emergency_surcharge else 0,
        'created_at': profile['service_provider'].created_at,
        'updated_at': profile['service_provider'].updated_at,
        
        # User information
        'username': profile['username'],
        'email': profile['email'],
        'phone_number': profile['phone_number'],
        'refercode': profile['refercode'],
        'is_active': profile['is_active'],
        
        # Location information
        'current_latitude': profile['current_latitude'],
        'current_longitude': profile['current_longitude'],
        'current_city': profile['current_city'],
        'current_state': profile['current_state'],
        'last_location_update': profile['last_location_update'],
        
        # Profile completion
        'profile_complete': profile['profile_complete'],
        'missing_fields': profile['missing_fields'],
        
        # Additional data
        'service_categories': service_categories,
        'certificates': certificates,
        'wallet': {
            'balance': float(wallet.balance) if wallet else 0.0,
            'total_earned': float(wallet.total_earned) if wallet else 0.0,
            'total_withdrawn': float(wallet.total_withdrawn) if wallet else 0.0,
        } if wallet else {
            'balance': 0.0,
            'total_earned': 0.0,
            'total_withdrawn': 0.0,
        }
    }
    
    return service_provider_data

@router.post("/profile", response_model=ServiceProviderResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_data: ServiceProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create service provider profile"""
    if current_user.role != UserType.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can create profiles"
        )
    
    # Check if profile already exists
    existing_profile = get_service_provider_by_user_id(db, current_user.id)
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service provider profile already exists. Use PUT to update."
        )
    
    # Create profile
    provider_data = profile_data.dict()
    provider = create_service_provider(db, current_user.id, provider_data)
    
    return provider

@router.put("/profile", response_model=ServiceProviderResponse)
def update_profile(
    profile_data: ServiceProviderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update service provider profile"""
    if current_user.role != UserType.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can update profiles"
        )
    
    # Get existing profile
    existing_profile = get_service_provider_by_user_id(db, current_user.id)
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider profile not found. Please create your profile first."
        )
    
    # Update profile
    update_data = profile_data.dict(exclude_unset=True)
    updated_provider = update_service_provider(db, existing_profile.id, update_data)
    
    return updated_provider

@router.put("/location", response_model=ServiceProviderResponse)
def update_location(
    location_data: LocationUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update service provider current location"""
    if current_user.role != UserType.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can update location"
        )
    
    # Get existing profile
    existing_profile = get_service_provider_by_user_id(db, current_user.id)
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider profile not found. Please create your profile first."
        )
    
    # Update location
    updated_provider = update_service_provider_location(
        db, 
        existing_profile.id, 
        location_data.latitude, 
        location_data.longitude,
        location_data.city,
        location_data.state
    )
    
    return updated_provider

@router.get("/profile/status")
def get_profile_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get service provider profile completion status"""
    if current_user.role != UserType.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access this endpoint"
        )
    
    profile = get_service_provider_profile(db, current_user.id)
    if not profile:
        return {
            "profile_exists": False,
            "profile_complete": False,
            "missing_fields": ["business_name", "location", "business_phone", "license_number"]
        }
    
    return {
        "profile_exists": True,
        "profile_complete": profile["profile_complete"],
        "missing_fields": profile["missing_fields"]
    }

@router.get("/all", response_model=List[ServiceProviderResponse])
def get_all_providers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all service providers (admin only)"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this endpoint"
        )
    
    providers = get_all_service_providers(db, skip, limit)
    return providers

@router.put("/location/google-place", response_model=ServiceProviderResponse)
def update_location_from_google_places(
    place_data: GooglePlaceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update service provider location from Google Places autocomplete selection"""
    if current_user.role != UserType.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can update location"
        )
    
    # Get existing profile
    existing_profile = get_service_provider_by_user_id(db, current_user.id)
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider profile not found. Please create your profile first."
        )
    
    # Update location from Google Places data
    place_dict = place_data.dict()
    updated_provider = update_location_from_google_place(db, existing_profile.id, place_dict)
    
    return updated_provider

@router.put("/location/map", response_model=ServiceProviderResponse)
def update_location_from_map(
    map_data: MapLocationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update service provider location from map selection"""
    if current_user.role != UserType.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can update location"
        )
    
    # Get existing profile
    existing_profile = get_service_provider_by_user_id(db, current_user.id)
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider profile not found. Please create your profile first."
        )
    
    # Update location from map data
    map_dict = map_data.dict()
    updated_provider = update_location_from_map(db, existing_profile.id, map_dict)
    
    return updated_provider

@router.get("/location", response_model=LocationResponse)
def get_current_location(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current service provider location"""
    if current_user.role != UserType.SERVICE_PROVIDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only service providers can access this endpoint"
        )
    
    # Get existing profile
    existing_profile = get_service_provider_by_user_id(db, current_user.id)
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider profile not found. Please create your profile first."
        )
    
    # Get location info
    location_info = get_location_info(db, existing_profile.id)
    if not location_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location information not found"
        )
    
    return location_info

@router.get("/{provider_id}", response_model=ServiceProviderResponse)
def get_provider_by_id(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get service provider by ID (admin only)"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this endpoint"
        )
    
    from app.crud.profile import get_service_provider_by_id
    provider = get_service_provider_by_id(db, provider_id)
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service provider not found"
        )
    
    return provider
