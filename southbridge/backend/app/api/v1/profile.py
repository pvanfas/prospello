from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User, UserType, Driver, Shipper, Broker, Certificate, VerificationStatus
from app.schemas.profile import (
    DriverCreate, DriverUpdate, DriverResponse,
    ShipperCreate, ShipperUpdate, ShipperResponse, ShipperResponseWithCertificates,
    BrokerCreate, BrokerUpdate, BrokerResponse, BrokerResponseWithCertificates
)
from app.schemas.certificate import CertificateCreate, CertificateResponse, CertificateListResponse
from app.services.s3_bucket import upload_image_to_s3
from app.services.image_saving import save_image_to_media
from app.core.config import settings

router = APIRouter()
DEBUG = settings.DEBUG

# ===== DRIVER PROFILE ROUTES =====

@router.post("/driver/", status_code=status.HTTP_201_CREATED)
def create_driver_profile(
    driver_data: DriverCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create driver profile for current user"""
    
    # Check if user is a driver
    if user.role != UserType.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with driver role can create driver profiles"
        )
    
    # Check if driver profile already exists
    if user.driver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver profile already exists"
        )
    
    # Check if license number is already taken
    existing_driver = db.query(Driver).filter(
        Driver.license_number == driver_data.license_number
    ).first()
    if existing_driver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="License number already registered"
        )
    
    # Ensure only one payment method is provided and at least one is present
    has_upi = bool(driver_data.upi_id)
    has_bank = all([
        driver_data.bank_account_number,
        driver_data.ifsc_code,
        driver_data.account_holder_name
    ])
    if has_upi and has_bank:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either UPI ID or bank details, not both."
        )
    if not has_upi and not has_bank:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one payment method (UPI ID or all bank details) must be provided."
        )
    vehicle_image_url = None
    if driver_data.vehicle_image:
        if DEBUG:
            vehicle_image_url = save_image_to_media(driver_data.vehicle_image, folder="vehicle_images")
        else:
            vehicle_image_url = upload_image_to_s3(driver_data.vehicle_image, folder="vehicle_images")
        driver_data.vehicle_image = None  # Clear base64 data after upload
    # Create driver profile
    try:
        print("Creating driver profile...", vehicle_image_url)
        driver = Driver(
            user_id=user.id,
            license_number=driver_data.license_number,
            vehicle_type=driver_data.vehicle_type,
            vehicle_image_url=vehicle_image_url,
        )
        if has_upi:
            driver.upi_id = driver_data.upi_id
        else:
            driver.bank_account_number = driver_data.bank_account_number
            driver.ifsc_code = driver_data.ifsc_code
            driver.account_holder_name = driver_data.account_holder_name

        db.add(driver)
        db.commit()
        db.refresh(driver)

        return driver
        # return True
    except Exception as e:
        db.rollback()
        print(f"Error creating driver profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the driver profile."
        ) 

@router.get("/driver/", response_model=DriverResponse)
def get_driver_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's driver profile"""
    
    if user.role != UserType.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can access driver profiles"
        )
    
    if not user.driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found. Please create your profile first."
        )
    
    # Create a response object with all necessary data
    driver_data = {
        **user.driver.__dict__,
        'user_id': user.id,
        'refercode': user.refercode,
        'available_capacity': user.driver.available_capacity,
        # Add user information for frontend
        'username': user.username,
        'email': user.email,
        'phone_number': user.phone_number
    }
    
    return DriverResponse(**driver_data)

@router.get("/driver/complete/")
def get_driver_profile_complete(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's complete driver profile with wallet information"""
    
    if user.role != UserType.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can access driver profiles"
        )
    
    if not user.driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found. Please create your profile first."
        )
    
    # Get wallet information
    from app.models.BED import BEDWallet
    wallet = db.query(BEDWallet).filter(BEDWallet.user_id == user.id).first()
    
    # Create comprehensive response
    driver_data = {
        **user.driver.__dict__,
        'user_id': user.id,
        'refercode': user.refercode,
        'available_capacity': user.driver.available_capacity,
        'username': user.username,
        'email': user.email,
        'phone_number': user.phone_number,
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
    
    return driver_data

@router.put("/driver/", response_model=DriverResponse)
def update_driver_profile(
    driver_data: DriverUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's driver profile"""
    
    if user.role != UserType.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can update driver profiles"
        )
    
    if not user.driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found. Please create your profile first."
        )
    
    # Check license number uniqueness if being updated
    if driver_data.license_number:
        existing_driver = db.query(Driver).filter(
            Driver.license_number == driver_data.license_number,
            Driver.id != user.driver.id
        ).first()
        if existing_driver:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="License number already registered"
            )
    
    # Validate payment method consistency
    update_data = driver_data.dict(exclude_unset=True)
    has_upi = bool(update_data.get('upi_id'))
    has_bank = all([
        update_data.get('bank_account_number'),
        update_data.get('ifsc_code'),
        update_data.get('account_holder_name')
    ])
    
    # If both UPI and bank details are being set, reject
    if has_upi and has_bank:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either UPI ID or bank details, not both."
        )
    
    # If switching payment methods, clear the other method's fields
    if has_upi:
        # Clear bank details when setting UPI
        user.driver.bank_account_number = None
        user.driver.ifsc_code = None
        user.driver.account_holder_name = None
    elif has_bank:
        # Clear UPI when setting bank details
        user.driver.upi_id = None
    
    # Update fields (ignore payment_method as it's not a database field)
    for field, value in update_data.items():
        if field != 'payment_method':  # Skip payment_method as it's not in the database
            setattr(user.driver, field, value)
    
    db.commit()
    db.refresh(user.driver)
    
    return user.driver

@router.patch("/driver/", response_model=DriverResponse)
def patch_driver_profile(
    driver_data: DriverUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Partially update current user's driver profile"""
    
    print(f"PATCH request data: {driver_data.dict(exclude_unset=True)}")
    print(f"Driver data type: {type(driver_data)}")
    print(f"Driver data fields: {driver_data.__dict__}")
    
    if user.role != UserType.DRIVER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can update driver profiles"
        )
    
    if not user.driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found. Please create your profile first."
        )
    
    # Check license number uniqueness if being updated
    if driver_data.license_number:
        existing_driver = db.query(Driver).filter(
            Driver.license_number == driver_data.license_number,
            Driver.id != user.driver.id
        ).first()
        if existing_driver:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="License number already registered"
            )
    
    # Validate payment method consistency
    update_data = driver_data.dict(exclude_unset=True)
    has_upi = bool(update_data.get('upi_id'))
    has_bank = all([
        update_data.get('bank_account_number'),
        update_data.get('ifsc_code'),
        update_data.get('account_holder_name')
    ])
    
    # If both UPI and bank details are being set, reject
    if has_upi and has_bank:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either UPI ID or bank details, not both."
        )
    
    # If switching payment methods, clear the other method's fields
    if has_upi:
        # Clear bank details when setting UPI
        user.driver.bank_account_number = None
        user.driver.ifsc_code = None
        user.driver.account_holder_name = None
    elif has_bank:
        # Clear UPI when setting bank details
        user.driver.upi_id = None
    
    # Update fields (ignore payment_method as it's not a database field)
    for field, value in update_data.items():
        if field != 'payment_method':  # Skip payment_method as it's not in the database
            setattr(user.driver, field, value)
    
    db.commit()
    db.refresh(user.driver)
    
    return user.driver

# ===== SHIPPER PROFILE ROUTES =====

@router.post("/shipper/", response_model=ShipperResponse, status_code=status.HTTP_201_CREATED)
def create_shipper_profile(
    shipper_data: ShipperCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create shipper profile for current user"""
    
    # Check if user is a shipper
    if user.role != UserType.SHIPPER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with shipper role can create shipper profiles"
        )
    
    # Check if shipper profile already exists
    if user.shipper:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shipper profile already exists"
        )
    
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

@router.get("/shipper/", response_model=ShipperResponseWithCertificates)
def get_shipper_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's shipper profile with certificates"""
    
    if user.role != UserType.SHIPPER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shippers can access shipper profiles"
        )
    
    if not user.shipper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipper profile not found. Please create your profile first."
        )
    
    # Get shipper with certificates
    shipper = db.query(Shipper).filter(Shipper.id == user.shipper.id).first()
    
    # Get certificates
    certificates = db.query(Certificate).filter(Certificate.user_id == user.id).all()
    
    # Create response with certificates
    response = ShipperResponseWithCertificates(
        id=shipper.id,
        user_id=shipper.user_id,
        company_name=shipper.company_name,
        gst_number=shipper.gst_number,
        pan_number=shipper.pan_number,
        status=shipper.status,
        created_at=shipper.created_at,
        updated_at=shipper.updated_at,
        certificates=certificates
    )
    
    return response

@router.put("/shipper/", response_model=ShipperResponse)
def update_shipper_profile(
    shipper_data: ShipperUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's shipper profile"""
    
    if user.role != UserType.SHIPPER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shippers can update shipper profiles"
        )
    
    if not user.shipper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipper profile not found. Please create your profile first."
        )
    
    # Update fields
    update_data = shipper_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user.shipper, field, value)
    
    db.commit()
    db.refresh(user.shipper)
    
    return user.shipper

# ===== BROKER PROFILE ROUTES =====

@router.post("/broker/", response_model=BrokerResponse, status_code=status.HTTP_201_CREATED)
def create_broker_profile(
    broker_data: BrokerCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create broker profile for current user"""
    
    # Check if user is a broker
    if user.role != UserType.BROKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with broker role can create broker profiles"
        )
    
    # Check if broker profile already exists
    if user.broker:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Broker profile already exists"
        )
    
    # Check GST number uniqueness if provided
    if broker_data.gst_number:
        existing_broker = db.query(Broker).filter(
            Broker.gst_number == broker_data.gst_number
        ).first()
        if existing_broker:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GST number already registered"
            )
    
    # Check PAN number uniqueness if provided
    if broker_data.pan_number:
        existing_broker = db.query(Broker).filter(
            Broker.pan_number == broker_data.pan_number
        ).first()
        if existing_broker:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PAN number already registered"
            )
    
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

@router.get("/broker/", response_model=BrokerResponseWithCertificates)
def get_broker_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's broker profile with certificates"""
    
    if user.role != UserType.BROKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only brokers can access broker profiles"
        )
    
    if not user.broker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker profile not found. Please create your profile first."
        )
    
    # Get broker with certificates
    broker = db.query(Broker).filter(Broker.id == user.broker.id).first()
    
    # Get certificates
    certificates = db.query(Certificate).filter(Certificate.user_id == user.id).all()
    
    # Create response with certificates
    response = BrokerResponseWithCertificates(
        id=broker.id,
        user_id=broker.user_id,
        agency_name=broker.agency_name,
        gst_number=broker.gst_number,
        pan_number=broker.pan_number,
        status=broker.status,
        created_at=broker.created_at,
        updated_at=broker.updated_at,
        certificates=certificates
    )
    
    return response

@router.put("/broker/", response_model=BrokerResponse)
def update_broker_profile(
    broker_data: BrokerUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's broker profile"""
    
    if user.role != UserType.BROKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only brokers can update broker profiles"
        )
    
    if not user.broker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker profile not found. Please create your profile first."
        )
    
    # Check GST number uniqueness if being updated
    if broker_data.gst_number:
        existing_broker = db.query(Broker).filter(
            Broker.gst_number == broker_data.gst_number,
            Broker.id != user.broker.id
        ).first()
        if existing_broker:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GST number already registered"
            )
    
    # Check PAN number uniqueness if being updated
    if broker_data.pan_number:
        existing_broker = db.query(Broker).filter(
            Broker.pan_number == broker_data.pan_number,
            Broker.id != user.broker.id
        ).first()
        if existing_broker:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PAN number already registered"
            )
    
    # Update fields
    update_data = broker_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user.broker, field, value)
    
    db.commit()
    db.refresh(user.broker)
    
    return user.broker

# ===== UTILITY ROUTES =====

@router.get("/profile-status/")
def get_profile_completion_status(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has completed their role-specific profile"""
    
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
    
    return {
        "user_role": user.role,
        "profile_complete": profile_complete,
        "profile_data": profile_data
    }


# ===== CERTIFICATE ROUTES =====

@router.post("/certificate/", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
def upload_certificate(
    certificate_data: CertificateCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a certificate (only for verified brokers/shippers)"""
    
    # Check if user is broker or shipper
    if user.role not in [UserType.BROKER, UserType.SHIPPER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only brokers and shippers can upload certificates"
        )
    
    # Check if profile exists
    profile = None
    if user.role == UserType.SHIPPER:
        if not user.shipper:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shipper profile not found. Please create your profile first."
            )
        profile = user.shipper
    elif user.role == UserType.BROKER:
        if not user.broker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Broker profile not found. Please create your profile first."
            )
        profile = user.broker
    
    # Check if user is verified
    if profile.status != VerificationStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified users can upload certificates. Your verification status is: " + profile.status.value
        )
    
    # Upload certificate file
    try:
        if DEBUG:
            # Local storage
            certificate_url = save_image_to_media(
                certificate_data.certificate,
                f"certificates/{user.id}",
                certificate_data.certificate_type
            )
        else:
            # S3 storage
            certificate_url = upload_image_to_s3(
                certificate_data.certificate,
                f"certificates/{user.id}/{certificate_data.certificate_type}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload certificate: {str(e)}"
        )
    
    # Create certificate record
    certificate = Certificate(
        user_id=user.id,
        certificate_type=certificate_data.certificate_type,
        certificate=certificate_url
    )
    
    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    
    return certificate


@router.get("/certificate/", response_model=CertificateListResponse)
def get_certificates(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all certificates for the current user"""
    
    certificates = db.query(Certificate).filter(Certificate.user_id == user.id).all()
    
    return {
        "certificates": certificates,
        "total": len(certificates)
    }


@router.delete("/certificate/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_certificate(
    certificate_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a certificate"""
    
    certificate = db.query(Certificate).filter(
        Certificate.id == certificate_id,
        Certificate.user_id == user.id
    ).first()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    db.delete(certificate)
    db.commit()
    
    return None