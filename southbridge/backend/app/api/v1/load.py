from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_current_user
from app.core.database import get_db
import base64
from pathlib import Path
import os
import uuid
from app.services.s3_bucket import upload_image_to_s3
from app.services.image_saving import save_image_to_media
from app.utils.image_url import build_image_url
from app.models.user import User, UserType, VerificationStatus
from app.models.load import GoodsCategory, LoadSource
from app.crud.load import (
    extract_load_details,
    create_load,
    get_loads_by_user,
    get_available_loads,
    get_nearby_loads,
    update_load,
    delete_load,
)
from app.schemas.load import (
    DeleteMultipleLoadsRequest,
    ImageLoadRequest,
    LoadCreate,
    Load as LoadSchema,
    LoadCreationResponse,
    LoadUpdate,
    VoiceLoadRequest,
)
from app.services.ocr import ocr_from_image
from app.core.config import settings

router = APIRouter()
DEBUG = settings.DEBUG

@router.post("/voice/", response_model=LoadSchema)
def create_load_from_voice(
    data: VoiceLoadRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create load from voice input (transcribed text)"""
    try:
        # Extract load details using AI
        extracted_data = extract_load_details(data.text)
        print(extracted_data)
        # Add source info
        
        extracted_data.source_type = LoadSource.VOICE
        extracted_data.source_content = data.text
        extracted_data.shipper_id = user.shipper.id if user.role == UserType.SHIPPER and user.shipper else None
        extracted_data.broker_id = user.broker.id if user.role == UserType.BROKER and user.broker else None
        # Create the load
        load = create_load(db, user, extracted_data,type="voice")
        return load
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create load from voice: {str(e)}",
        )


@router.post("/text/", response_model=LoadSchema)
def create_load_from_text(
    data: LoadCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create load from structured text input"""
    try:
        # load_dict = data.model_dump()
        extra = {}
        if user.role == UserType.SHIPPER:
            # Add shipper_id for shipper
            if hasattr(user, "shipper") and user.shipper:
                extra["shipper_id"] = user.shipper.id
        elif user.role == UserType.BROKER:
            # Add broker_id for broker
            if hasattr(user, "broker") and user.broker:
                extra["broker_id"] = user.broker.id
                
        image_path = None
        image_base64 = None
        
        
        if data.image_base64:
            try:
                print(f"DEBUG mode: {DEBUG}")
                if DEBUG == True:
                    image_path = save_image_to_media(data.image_base64, folder="loads")
                else:
                    image_path = upload_image_to_s3(data.image_base64, folder="loads")
                    print(f"S3 upload result: {image_path}")
                
                image_base64 = data.image_base64  # Store original base64 if needed
                
            except Exception as img_error:
                print(f"Error processing image: {img_error}")
                # Continue without image if processing fails
                pass

        load_data = {
            **data.model_dump(exclude={"image_base64", "image_filename"}),
            **extra,
            "source_type": LoadSource.TEXT,
            "source_content": str(data.model_dump()),
            "image": image_base64,
            "image_path": image_path,
        }

        load = create_load(db, user, load_data)
        return load
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create load from text: {str(e)}",
        )


@router.get("/my-loads/", response_model=List[LoadSchema])
def get_my_loads(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
):
    """Get all loads created by the current user (Shipper/Broker only)"""
    if user.role not in [UserType.SHIPPER, UserType.BROKER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shippers and brokers can view their loads",
        )

    try:
        loads = get_loads_by_user(db, user, skip=skip, limit=limit)
        result = []
        for load in loads:
            data = load.__dict__.copy()
            print(f"Load image_path: {load.image_path}")
            print(f"DEBUG mode: {DEBUG}")
            if DEBUG:
                data["image_url"] = build_image_url(load.image_path)
                print(f"Local image_url: {data['image_url']}")
            else:
                data["image_url"] = load.image_path
                print(f"S3 image_url: {data['image_url']}")
            data["image"] = None   # hide base64
            
            # Get creator details and verification status
            creator_name = "Unknown"
            creator_verified = False
            if load.shipper and load.shipper.user:
                creator_name = load.shipper.user.username
                creator_verified = load.shipper.status == VerificationStatus.VERIFIED or str(load.shipper.status) == "verified"
            elif load.broker and load.broker.user:
                creator_name = load.broker.user.username
                creator_verified = load.broker.status == VerificationStatus.VERIFIED or str(load.broker.status) == "verified"
            
            data["creator_verified"] = creator_verified
            data["created_by"] = creator_name
            
            # print(data)
            result.append(data)
        # print(f"Result: {result}")
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch loads: {str(e)}",
        )


@router.get("/available/", response_model=List[LoadSchema])
def get_available_loads_endpoint(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    category: Optional[GoodsCategory] = Query(
        None, description="Filter by goods category"
    ),
):
    """Get available loads for bidding (Driver access)"""
    if user.role != UserType.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can view available loads",
        )

    try:
        # Get driver's vehicle type for filtering
        driver_vehicle_type = None
        if user.driver:
            driver_vehicle_type = user.driver.vehicle_type
        
        loads = get_available_loads(db, skip=skip, limit=limit, category=category, driver_vehicle_type=driver_vehicle_type)
        result = []
        for load in loads:
            data = load.__dict__.copy()
            
            # Get creator details and verification status
            creator_name = "Unknown"
            creator_verified = False
            if load.shipper and load.shipper.user:
                creator_name = load.shipper.user.username
                creator_verified = load.shipper.status == VerificationStatus.VERIFIED or str(load.shipper.status) == "verified"
                # print(f"Shipper {creator_name} status: {load.shipper.status}, verified: {creator_verified}")
            elif load.broker and load.broker.user:
                creator_name = load.broker.user.username
                creator_verified = load.broker.status == VerificationStatus.VERIFIED or str(load.broker.status) == "verified"
                # print(f"Broker {creator_name} status: {load.broker.status}, verified: {creator_verified}")
            
            data["creator_verified"] = creator_verified
            data["created_by"] = creator_name
            # print(f"Data: {data}")
            result.append(data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch available loads: {str(e)}",
        )


@router.put("/{load_id}/", response_model=LoadSchema)
def update_load_endpoint(
    load_id: str,
    update_data: LoadUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a load (Owner only, before assignment)"""
    try:
        updated_load = update_load(
            db, load_id, user, update_data.dict(exclude_unset=True)
        )
        if not updated_load:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Load not found"
            )
        return updated_load
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update load: {str(e)}",
        )


@router.delete("/{load_id}/")
def delete_load_endpoint(
    load_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Delete a load (Owner only, if no bids)"""
    try:
        success = delete_load(db, load_id, user)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Load not found"
            )
        return {"message": "Load deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete load: {str(e)}",
        )


@router.post("/image/"             )
def create_load_from_image(
    req: ImageLoadRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        # 1. OCR: Convert image to raw text
        raw_text = ocr_from_image(req.image_url, req.image_base64)
        if not raw_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No readable text found in image",
            )
            
        # 2. Extract load details using AI
        extracted_data = extract_load_details(raw_text)
        
        extracted_data.source_type = LoadSource.IMAGE
        extracted_data.source_content = raw_text
        extracted_data.shipper_id = user.shipper.id if user.role == UserType.SHIPPER and user.shipper else None
        extracted_data.broker_id = user.broker.id if user.role == UserType.BROKER and user.broker else None
        
        load = create_load(db, user, extracted_data,type="image")
        return load

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create load from image: {str(e)}",
        )


@router.get("/nearby")
def get_nearby_loads_api(
    lat: float = Query(None, description="Driver's latitude (for normal mode)"),
    lng: float = Query(None, description="Driver's longitude (for normal mode)"),
    driver_origin_lat: float = Query(None, description="Driver's origin latitude (for reverse loading)"),
    driver_origin_lng: float = Query(None, description="Driver's origin longitude (for reverse loading)"),
    driver_dest_lat: float = Query(None, description="Driver's destination latitude (for reverse loading)"),
    driver_dest_lng: float = Query(None, description="Driver's destination longitude (for reverse loading)"),
    radius: float = Query(20.0, description="Search radius in km"),
    reverse: bool = Query(False, description="Reverse loading mode - find loads along driver's route"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    driver_id = user.driver.id if user.role == UserType.DRIVER and user.driver else None
    if not driver_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can access nearby loads",
        )
    
    # Route matching mode - find loads along driver's route
    if reverse:
        if not all([driver_origin_lat, driver_origin_lng, driver_dest_lat, driver_dest_lng]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver origin and destination coordinates required for reverse loading"
            )
        loads = get_nearby_loads(
            db, 
            driver_origin_lat=driver_origin_lat,
            driver_origin_lng=driver_origin_lng,
            driver_dest_lat=driver_dest_lat,
            driver_dest_lng=driver_dest_lng,
            radius=radius,
            driver_id=driver_id,
            reverse=True
        )
    else:
        # Normal mode - find loads near driver's current location
        if lat is None or lng is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Latitude and longitude required for normal mode"
            )
        loads = get_nearby_loads(
            db,
            lat=lat,
            lng=lng,
            radius=radius,
            driver_id=driver_id,
            reverse=False
        )
    
    if not loads:
        raise HTTPException(status_code=404, detail="No nearby loads found")
    
    # Process loads to add creator verification status
    result = []
    for load in loads:
        # Add creator verification status
        creator_verified = False
        if load.get('creator_status'):
            creator_verified = str(load['creator_status']) == "VERIFIED"
        
        load['creator_verified'] = creator_verified
        load['created_by'] = load.get('creator_name', 'Unknown')
        
        # Clean up temporary fields
        load.pop('creator_status', None)
        load.pop('shipper_id', None)
        load.pop('broker_id', None)
        
        result.append(load)
    
    return result


@router.patch("/{load_id}/", response_model=LoadSchema)
def edit_load_details(
    load_id: str,
    update_data: LoadUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Edit specific details of a load (Owner only, before assignment)"""
    try:
        updated_load = update_load(
            db, load_id, user, update_data.model_dump(exclude_unset=True)
        )
        if not updated_load:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Load not found"
            )
        return updated_load
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to edit load details: {str(e)}",
        )


@router.delete("/{load_id}/delete/")
def hard_delete_load(   
    load_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if user.role not in [UserType.SHIPPER, UserType.BROKER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shippers and brokers can hard delete loads",
        )
    try:
        success = delete_load(db, load_id, user, hard_delete=True)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Load not found"
            )
        return {"message": "Load hard deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to hard delete load: {str(e)}",
        )
    
@router.post("/delete/loads/")
def delete_multiple_loads(data: DeleteMultipleLoadsRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"Deleting multiple loads: {data.load_ids}")
    if user.role not in [UserType.SHIPPER, UserType.BROKER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shippers and brokers can delete multiple loads",
        )
    try:
        print(f"Deleting multiple loads: {data.load_ids}")
        for load_id in data.load_ids:
            success = delete_load(db, load_id, user)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Load not found"
                )
        return {"message": "Loads deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete multiple loads: {str(e)}",
        )