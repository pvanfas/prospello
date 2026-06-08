from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.service import ServiceCategory
from app.schemas.service_category import ServiceCategoryCreate, ServiceCategoryUpdate, ServiceCategoryResponse
from app.api.deps import get_current_active_user
from app.models.user import User, UserType
import re
import unicodedata

router = APIRouter()

def generate_slug(text: str) -> str:
    """
    Generate a URL-friendly slug from text.
    Converts to lowercase, removes special characters, and replaces spaces with hyphens.
    """
    # Convert to lowercase and normalize unicode characters
    text = unicodedata.normalize('NFKD', text.lower())
    
    # Remove all non-alphanumeric characters except spaces and hyphens
    text = re.sub(r'[^\w\s-]', '', text)
    
    # Replace spaces and multiple hyphens with single hyphen
    text = re.sub(r'[\s-]+', '-', text)
    
    # Remove leading/trailing hyphens
    text = text.strip('-')
    
    return text

@router.get("/", response_model=List[ServiceCategoryResponse])
def get_service_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all service categories"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access service categories"
        )
    
    categories = db.query(ServiceCategory).offset(skip).limit(limit).all()
    return categories

@router.get("/public", response_model=List[ServiceCategoryResponse])
def get_public_service_categories(
    db: Session = Depends(get_db)
):
    """Get all active service categories (public endpoint for signup)"""
    categories = db.query(ServiceCategory).filter(ServiceCategory.is_active == True).all()
    return categories

@router.get("/{category_id}", response_model=ServiceCategoryResponse)
def get_service_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific service category by ID"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access service categories"
        )
    
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service category not found"
        )
    return category

@router.post("/", response_model=ServiceCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_service_category(
    category_data: ServiceCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new service category"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create service categories"
        )
    
    # Check if category with same name already exists
    existing_category = db.query(ServiceCategory).filter(
        ServiceCategory.name == category_data.name
    ).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service category with this name already exists"
        )
    
    # Generate slug automatically from name if not provided
    if not category_data.slug:
        slug = generate_slug(category_data.name)
    else:
        slug = category_data.slug
    
    # Check if slug already exists
    existing_slug = db.query(ServiceCategory).filter(
        ServiceCategory.slug == slug
    ).first()
    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service category with this slug already exists"
        )
    
    category = ServiceCategory(
        name=category_data.name,
        slug=slug,
        description=category_data.description,
        icon_url=category_data.icon_url,
        is_emergency=category_data.is_emergency,
        is_active=category_data.is_active
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{category_id}", response_model=ServiceCategoryResponse)
def update_service_category(
    category_id: int,
    category_data: ServiceCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a service category"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update service categories"
        )
    
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service category not found"
        )
    
    # Check if name is being changed and if new name already exists
    if category_data.name and category_data.name != category.name:
        existing_category = db.query(ServiceCategory).filter(
            ServiceCategory.name == category_data.name,
            ServiceCategory.id != category_id
        ).first()
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service category with this name already exists"
            )
    
    # Check if slug is being changed and if new slug already exists
    if category_data.slug and category_data.slug != category.slug:
        existing_slug = db.query(ServiceCategory).filter(
            ServiceCategory.slug == category_data.slug,
            ServiceCategory.id != category_id
        ).first()
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service category with this slug already exists"
            )
    
    # Update fields
    update_data = category_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a service category"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete service categories"
        )
    
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service category not found"
        )
    
    # Check if category is being used by any service providers
    from app.models.service import ServiceProviderCategory
    providers_using_category = db.query(ServiceProviderCategory).filter(
        ServiceProviderCategory.category_id == category_id
    ).count()
    
    if providers_using_category > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category. It is being used by {providers_using_category} service providers"
        )
    
    db.delete(category)
    db.commit()
    return None

@router.patch("/{category_id}/toggle-status", response_model=ServiceCategoryResponse)
def toggle_category_status(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Toggle service category active status"""
    if current_user.role != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can toggle category status"
        )
    
    category = db.query(ServiceCategory).filter(ServiceCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service category not found"
        )
    
    category.is_active = not category.is_active
    db.commit()
    db.refresh(category)
    return category
