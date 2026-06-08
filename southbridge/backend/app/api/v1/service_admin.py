from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User, UserType, VerificationStatus
from app.models.service import ServiceCategory, ServiceProvider, ServiceProviderCategory, ServiceBooking, ServiceReview
from app.api.deps import get_current_user
from app.services.s3_bucket import upload_image_to_s3
from app.services.image_saving import save_image_to_media
from app.core.config import settings

# Create a separate router for service admin endpoints
service_admin_router = APIRouter(prefix="/admin", tags=["service-admin"])

DEBUG = settings.DEBUG

def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Service Category Icon Upload
@service_admin_router.post("/service-categories/upload-icon")
def upload_service_category_icon(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Upload service category icon to S3 bucket"""
    try:
        image_base64 = request.get("image_base64")
        if not image_base64:
            raise HTTPException(status_code=400, detail="No image provided")
        
        # Clean the base64 string if it has data URL prefix
        if image_base64.startswith("data:image/"):
            # Remove the data URL prefix
            image_base64 = image_base64.split(",")[1]
        
        # Upload to S3 or local storage based on DEBUG mode
        if DEBUG:
            icon_url = save_image_to_media(image_base64, folder="service-categories")
        else:
            icon_url = upload_image_to_s3(image_base64, folder="service-categories")
        
        if not icon_url:
            raise HTTPException(status_code=500, detail="Failed to upload image")
        
        return {"icon_url": icon_url}
    except Exception as e:
        print(f"Error uploading service category icon: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload service category icon")

# Service Categories Management
@service_admin_router.get("/service-categories")
def get_service_categories_admin(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_emergency: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all service categories with filtering"""
    query = db.query(ServiceCategory)
    
    if search:
        query = query.filter(
            or_(
                ServiceCategory.name.ilike(f"%{search}%"),
                ServiceCategory.description.ilike(f"%{search}%")
            )
        )
    
    if is_active is not None:
        query = query.filter(ServiceCategory.is_active == is_active)
    
    if is_emergency is not None:
        query = query.filter(ServiceCategory.is_emergency == is_emergency)
    
    categories = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "categories": categories,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

@service_admin_router.get("/service-categories/{category_id}")
def get_service_category_admin(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get a specific service category"""
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Service category not found")
    return category

@service_admin_router.post("/service-categories")
def create_service_category_admin(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new service category"""
    # Extract data from request
    name = request.get("name")
    description = request.get("description")
    icon_url = request.get("icon_url")
    icon_base64 = request.get("icon_base64")
    is_emergency = request.get("is_emergency", False)
    is_active = request.get("is_active", True)
    
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    
    # Check if category with same name already exists
    existing_category = db.query(ServiceCategory).filter(
        ServiceCategory.name == name
    ).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Service category with this name already exists")
    
    # Handle icon upload if base64 image is provided
    final_icon_url = icon_url
    if icon_base64:
        try:
            # Clean the base64 string if it has data URL prefix
            clean_base64 = icon_base64
            if icon_base64.startswith("data:image/"):
                clean_base64 = icon_base64.split(",")[1]
            
            if DEBUG:
                final_icon_url = save_image_to_media(clean_base64, folder="service-categories")
            else:
                final_icon_url = upload_image_to_s3(clean_base64, folder="service-categories")
        except Exception as e:
            print(f"Error uploading icon: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload icon")
    
    category = ServiceCategory(
        name=name,
        description=description,
        icon_url=final_icon_url,
        is_emergency=is_emergency,
        is_active=is_active
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@service_admin_router.put("/service-categories/{category_id}")
def update_service_category_admin(
    category_id: int,
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a service category"""
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Service category not found")
    
    # Extract data from request
    name = request.get("name")
    description = request.get("description")
    icon_url = request.get("icon_url")
    icon_base64 = request.get("icon_base64")
    is_emergency = request.get("is_emergency")
    is_active = request.get("is_active")
    
    # Check if name is being changed and if new name already exists
    if name and name != category.name:
        existing_category = db.query(ServiceCategory).filter(
            ServiceCategory.name == name,
            ServiceCategory.id != category_id
        ).first()
        if existing_category:
            raise HTTPException(status_code=400, detail="Service category with this name already exists")
    
    # Handle icon upload if base64 image is provided
    final_icon_url = icon_url
    if icon_base64:
        try:
            # Clean the base64 string if it has data URL prefix
            clean_base64 = icon_base64
            if icon_base64.startswith("data:image/"):
                clean_base64 = icon_base64.split(",")[1]
            
            if DEBUG:
                final_icon_url = save_image_to_media(clean_base64, folder="service-categories")
            else:
                final_icon_url = upload_image_to_s3(clean_base64, folder="service-categories")
        except Exception as e:
            print(f"Error uploading icon: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload icon")
    
    # Update fields
    if name is not None:
        category.name = name
    if description is not None:
        category.description = description
    if final_icon_url is not None:
        category.icon_url = final_icon_url
    if is_emergency is not None:
        category.is_emergency = is_emergency
    if is_active is not None:
        category.is_active = is_active
    
    db.commit()
    db.refresh(category)
    return category

@service_admin_router.delete("/service-categories/{category_id}")
def delete_service_category_admin(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a service category"""
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Service category not found")
    
    # Check if category is being used by any service providers
    providers_using_category = db.query(ServiceProviderCategory).filter(
        ServiceProviderCategory.category_id == category_id
    ).count()
    
    if providers_using_category > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category. It is being used by {providers_using_category} service providers"
        )
    
    db.delete(category)
    db.commit()
    return {"message": "Service category deleted successfully"}

@service_admin_router.patch("/service-categories/{category_id}/toggle-status")
def toggle_service_category_status_admin(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Toggle service category active status"""
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Service category not found")
    
    category.is_active = not category.is_active
    db.commit()
    db.refresh(category)
    return category

# Service Providers Management
@service_admin_router.get("/service-providers")
def get_service_providers_admin(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    verification_status: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all service providers with filtering"""
    query = db.query(ServiceProvider).join(User)
    
    if search:
        query = query.filter(
            or_(
                ServiceProvider.business_name.ilike(f"%{search}%"),
                User.username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    
    if verification_status:
        query = query.filter(ServiceProvider.verification_status == verification_status)
    
    if category_id:
        query = query.join(ServiceProviderCategory).filter(
            ServiceProviderCategory.category_id == category_id
        )
    
    providers = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "providers": providers,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

@service_admin_router.get("/service-providers/{provider_id}")
def get_service_provider_admin(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get a specific service provider"""
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Service provider not found")
    return provider

@service_admin_router.patch("/service-providers/{provider_id}/verify")
def verify_service_provider_admin(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Verify a service provider"""
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Service provider not found")
    
    provider.verification_status = VerificationStatus.VERIFIED
    db.commit()
    db.refresh(provider)
    return provider

@service_admin_router.patch("/service-providers/{provider_id}/reject")
def reject_service_provider_admin(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Reject a service provider"""
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Service provider not found")
    
    provider.verification_status = VerificationStatus.REJECTED
    db.commit()
    db.refresh(provider)
    return provider

@service_admin_router.delete("/service-providers/{provider_id}")
def delete_service_provider_admin(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a service provider"""
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Service provider not found")
    
    # Check if provider has any bookings
    bookings_count = db.query(ServiceBooking).filter(
        ServiceBooking.provider_id == provider_id
    ).count()
    
    if bookings_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete provider. They have {bookings_count} bookings"
        )
    
    db.delete(provider)
    db.commit()
    return {"message": "Service provider deleted successfully"}

# Service Bookings Management
@service_admin_router.get("/service-bookings")
def get_service_bookings_admin(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    is_emergency: Optional[bool] = None,
    provider_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all service bookings with filtering"""
    query = db.query(ServiceBooking).join(User).join(ServiceProvider)
    
    if search:
        query = query.filter(
            or_(
                ServiceBooking.booking_id.ilike(f"%{search}%"),
                ServiceBooking.service_description.ilike(f"%{search}%"),
                User.username.ilike(f"%{search}%")
            )
        )
    
    if status:
        query = query.filter(ServiceBooking.status == status)
    
    if is_emergency is not None:
        query = query.filter(ServiceBooking.is_emergency == is_emergency)
    
    if provider_id:
        query = query.filter(ServiceBooking.provider_id == provider_id)
    
    bookings = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "bookings": bookings,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

@service_admin_router.get("/service-bookings/{booking_id}")
def get_service_booking_admin(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get a specific service booking"""
    booking = db.query(ServiceBooking).filter(ServiceBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")
    return booking

@service_admin_router.patch("/service-bookings/{booking_id}/status")
def update_service_booking_status_admin(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update service booking status"""
    booking = db.query(ServiceBooking).filter(ServiceBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")
    
    booking.status = status
    
    # Update timestamps based on status
    if status == "in_progress":
        booking.started_at = func.now()
    elif status == "completed":
        booking.completed_at = func.now()
    elif status == "cancelled":
        booking.cancelled_at = func.now()
    
    db.commit()
    db.refresh(booking)
    return booking

@service_admin_router.delete("/service-bookings/{booking_id}")
def delete_service_booking_admin(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a service booking"""
    booking = db.query(ServiceBooking).filter(ServiceBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")
    
    db.delete(booking)
    db.commit()
    return {"message": "Service booking deleted successfully"}

# Service Reviews Management
@service_admin_router.get("/service-reviews")
def get_service_reviews_admin(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    rating: Optional[int] = None,
    provider_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all service reviews with filtering"""
    query = db.query(ServiceReview).join(User).join(ServiceProvider)
    
    if search:
        query = query.filter(
            or_(
                ServiceReview.review.ilike(f"%{search}%"),
                User.username.ilike(f"%{search}%")
            )
        )
    
    if rating:
        query = query.filter(ServiceReview.rating == rating)
    
    if provider_id:
        query = query.filter(ServiceReview.provider_id == provider_id)
    
    reviews = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "reviews": reviews,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

@service_admin_router.delete("/service-reviews/{review_id}")
def delete_service_review_admin(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a service review"""
    review = db.query(ServiceReview).filter(ServiceReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Service review not found")
    
    db.delete(review)
    db.commit()
    return {"message": "Service review deleted successfully"}

# Service Statistics
@service_admin_router.get("/service-stats")
def get_service_stats_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get service marketplace statistics"""
    total_categories = db.query(ServiceCategory).count()
    active_categories = db.query(ServiceCategory).filter(ServiceCategory.is_active == True).count()
    emergency_categories = db.query(ServiceCategory).filter(ServiceCategory.is_emergency == True).count()
    
    total_providers = db.query(ServiceProvider).count()
    verified_providers = db.query(ServiceProvider).filter(ServiceProvider.verification_status == VerificationStatus.VERIFIED).count()
    pending_providers = db.query(ServiceProvider).filter(ServiceProvider.verification_status == VerificationStatus.PENDING).count()
    
    total_bookings = db.query(ServiceBooking).count()
    completed_bookings = db.query(ServiceBooking).filter(ServiceBooking.status == "completed").count()
    emergency_bookings = db.query(ServiceBooking).filter(ServiceBooking.is_emergency == True).count()
    
    total_reviews = db.query(ServiceReview).count()
    avg_rating = db.query(func.avg(ServiceReview.rating)).scalar() or 0
    
    return {
        "categories": {
            "total": total_categories,
            "active": active_categories,
            "emergency": emergency_categories
        },
        "providers": {
            "total": total_providers,
            "verified": verified_providers,
            "pending": pending_providers
        },
        "bookings": {
            "total": total_bookings,
            "completed": completed_bookings,
            "emergency": emergency_bookings
        },
        "reviews": {
            "total": total_reviews,
            "average_rating": round(avg_rating, 2)
        }
    }
