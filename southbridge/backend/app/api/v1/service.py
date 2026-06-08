from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.api.deps import get_current_user
from app.core.database import get_db
from fastapi import Query
from typing import List
from app.crud.service import get_all_categories, get_nearby_services, create_service_category, book_service, get_service_provider_categories, update_service_provider_category, add_service_category_to_provider
from app.schemas.service import NearbyServiceResponse, ServiceCategoryResponse, ServiceCategoryCreate, ServiceBookingCreate, ServiceBookingResponse, ServiceProviderCategoryUpdate, ServiceProviderCategoryDetail, ServiceProviderResponse

router = APIRouter()


@router.get("/nearby-services/", response_model=List[NearbyServiceResponse])
def get_nearby_services_endpoint(
    db: Session = Depends(get_db), 
    user: User = Depends(get_current_user),
    lat: float = Query(..., description="Latitude of the user"),
    lng: float = Query(..., description="Longitude of the user"),
    radius: float = Query(default=20.0, description="Radius in kilometers"),
    service_type: str = Query(default="all", description="Service category slug or 'all' for all services"),
    page: int = Query(default=1, description="Page number for pagination"),
    limit: int = Query(default=10, description="Number of services per page"),
):
    """
    Get nearby service providers within the specified radius.
    
    - **lat**: User's latitude
    - **lng**: User's longitude  
    - **radius**: Search radius in kilometers (default: 20km)
    - **service_type**: Service category slug (e.g., 'mechanic', 'towing') or 'all' for all services
    - **page**: Page number for pagination (default: 1)
    - **limit**: Number of services per page (default: 10)
    
    Returns a list of nearby service providers sorted by distance.
    """
    try:
        if not lat or not lng:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Latitude and longitude are required"
            )
        
        services_available = get_nearby_services(db, lat, lng, radius, service_type, page, limit)
        
        # Convert to response format
        response_data = []
        for service in services_available:
            response_data.append(NearbyServiceResponse(
                service_provider=service['service_provider'],
                provider_category=service['provider_category'],
                category=service['category'],
                distance=round(service['distance'], 2)  # Round to 2 decimal places
            ))
        print(response_data)
        
        return response_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching nearby services: {str(e)}"
        )
        
        
@router.get("/service-categories/")
def get_service_categories_endpoint(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Get service categories.
    """
    try:
        available_categories = get_all_categories(db)
        return [ServiceCategoryResponse(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            image=category.icon_url,
            is_active=category.is_active
        ) for category in available_categories]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching service categories: {str(e)}"
        )


@router.post("/book-service/", response_model=ServiceBookingResponse)
def book_service_endpoint(
    booking_data: ServiceBookingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Book a service.
    """
    try:
        new_booking = book_service(db, booking_data.dict(), user.id)
        return ServiceBookingResponse(
            id=new_booking.id,
            booking_id=new_booking.booking_id,
            booked_category_id=new_booking.booked_category_id,
            user_id=new_booking.user_id,
            provider_id=new_booking.provider_id,
            service_description=new_booking.service_description,
            vehicle_details=new_booking.vehicle_details,
            service_latitude=new_booking.service_latitude,
            service_longitude=new_booking.service_longitude,
            service_address=new_booking.service_address,
            scheduled_at=new_booking.scheduled_at.isoformat(),
            requested_at=new_booking.requested_at.isoformat(),
            status=new_booking.status,
            is_emergency=new_booking.is_emergency,
            estimated_cost=new_booking.estimated_cost,
            final_cost=new_booking.final_cost,
            emergency_surcharge=new_booking.emergency_surcharge
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error booking service: {str(e)}"
        )


@router.get("/provider/categories/", response_model=List[ServiceProviderCategoryDetail])
def get_provider_categories_endpoint(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Get all service categories for the current service provider.
    """
    try:
        # Get service provider for current user
        from app.models.service import ServiceProvider
        service_provider = db.query(ServiceProvider).filter(ServiceProvider.user_id == user.id).first()
        
        if not service_provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service provider profile not found"
            )
        
        categories = get_service_provider_categories(db, service_provider.id)
        
        # Convert to response format
        response_data = []
        for category in categories:
            response_data.append(ServiceProviderCategoryDetail(
                id=category.id,
                service_provider_id=category.service_provider_id,
                category_id=category.category_id,
                current_status=category.current_status,
                price_from=category.price_from,
                price_to=category.price_to,
                emergency_available=category.emergency_available,
                created_at=category.created_at.isoformat(),
                category=ServiceCategoryResponse(
                    id=category.category.id,
                    name=category.category.name,
                    slug=category.category.slug,
                    description=category.category.description,
                    icon_url=category.category.icon_url,
                    is_emergency=category.category.is_emergency,
                    is_active=category.category.is_active
                ),
                service_provider=ServiceProviderResponse(
                    id=category.service_provider.id,
                    business_name=category.service_provider.business_name,
                    business_type=category.service_provider.business_type,
                    business_phone=category.service_provider.business_phone,
                    shop_location_latitude=category.service_provider.shop_location_latitude,
                    shop_location_longitude=category.service_provider.shop_location_longitude,
                    shop_location_address=category.service_provider.shop_location_address,
                    max_service_radius=category.service_provider.max_service_radius,
                    rating=category.service_provider.rating,
                    total_services=category.service_provider.total_services,
                    completion_rate=category.service_provider.completion_rate,
                    response_time_avg=category.service_provider.response_time_avg,
                    base_price=category.service_provider.base_price,
                    emergency_surcharge=category.service_provider.emergency_surcharge
                )
            ))
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching provider categories: {str(e)}"
        )


@router.put("/provider/categories/{category_id}/", response_model=ServiceProviderCategoryDetail)
def update_provider_category_endpoint(
    category_id: int,
    update_data: ServiceProviderCategoryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Update service provider category details (pricing, status, etc.).
    """
    try:
        # Get service provider for current user
        from app.models.service import ServiceProvider
        service_provider = db.query(ServiceProvider).filter(ServiceProvider.user_id == user.id).first()
        
        if not service_provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service provider profile not found"
            )
        
        updated_category = update_service_provider_category(
            db, category_id, service_provider.id, update_data.dict(exclude_unset=True)
        )
        
        return ServiceProviderCategoryDetail(
            id=updated_category.id,
            service_provider_id=updated_category.service_provider_id,
            category_id=updated_category.category_id,
            current_status=updated_category.current_status,
            price_from=updated_category.price_from,
            price_to=updated_category.price_to,
            emergency_available=updated_category.emergency_available,
            created_at=updated_category.created_at.isoformat(),
            category=ServiceCategoryResponse(
                id=updated_category.category.id,
                name=updated_category.category.name,
                slug=updated_category.category.slug,
                description=updated_category.category.description,
                icon_url=updated_category.category.icon_url,
                is_emergency=updated_category.category.is_emergency,
                is_active=updated_category.category.is_active
            ),
            service_provider=ServiceProviderResponse(
                id=updated_category.service_provider.id,
                business_name=updated_category.service_provider.business_name,
                business_type=updated_category.service_provider.business_type,
                business_phone=updated_category.service_provider.business_phone,
                shop_location_latitude=updated_category.service_provider.shop_location_latitude,
                shop_location_longitude=updated_category.service_provider.shop_location_longitude,
                shop_location_address=updated_category.service_provider.shop_location_address,
                max_service_radius=updated_category.service_provider.max_service_radius,
                rating=updated_category.service_provider.rating,
                total_services=updated_category.service_provider.total_services,
                completion_rate=updated_category.service_provider.completion_rate,
                response_time_avg=updated_category.service_provider.response_time_avg,
                base_price=updated_category.service_provider.base_price,
                emergency_surcharge=updated_category.service_provider.emergency_surcharge
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating provider category: {str(e)}"
        )


@router.post("/provider/categories/add/")
def add_category_to_provider_endpoint(
    category_id: int,
    price_from: float = None,
    price_to: float = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Add a new service category to the current service provider.
    """
    try:
        # Get service provider for current user
        from app.models.service import ServiceProvider
        service_provider = db.query(ServiceProvider).filter(ServiceProvider.user_id == user.id).first()
        
        if not service_provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service provider profile not found"
            )
        
        new_category = add_service_category_to_provider(
            db, service_provider.id, category_id, price_from, price_to
        )
        
        return {
            "message": "Service category added successfully",
            "category_id": new_category.id,
            "provider_id": new_category.service_provider_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding category to provider: {str(e)}"
        )