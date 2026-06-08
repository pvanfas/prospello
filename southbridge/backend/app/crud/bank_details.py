from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.models.user import UserBankDetails
from app.schemas.bank_details import BankDetailsCreate, BankDetailsUpdate
import uuid

def create_bank_details(db: Session, bank_details: BankDetailsCreate, user_id: uuid.UUID) -> UserBankDetails:
    """Create a new bank details record"""
    db_bank = UserBankDetails(
        user_id=user_id,
        account_holder_name=bank_details.account_holder_name,
        bank_name=bank_details.bank_name,
        account_number=bank_details.account_number,
        ifsc_code=bank_details.ifsc_code,
        default=False  # Will be set to True if it's the first bank
    )
    
    # Set is_verified to False by default (will be added to model later)
    if hasattr(db_bank, 'is_verified'):
        db_bank.is_verified = False
    
    # If this is the first bank for the user, make it default
    existing_banks = db.query(UserBankDetails).filter(UserBankDetails.user_id == user_id).count()
    if existing_banks == 0:
        db_bank.default = True
    
    db.add(db_bank)
    db.commit()
    db.refresh(db_bank)
    return db_bank

def get_bank_details(db: Session, bank_id: int, user_id: uuid.UUID) -> Optional[UserBankDetails]:
    """Get a specific bank details record by ID"""
    return db.query(UserBankDetails).filter(
        and_(UserBankDetails.id == bank_id, UserBankDetails.user_id == user_id)
    ).first()

def get_user_bank_details(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[UserBankDetails]:
    """Get all bank details for a user"""
    return db.query(UserBankDetails).filter(
        UserBankDetails.user_id == user_id
    ).offset(skip).limit(limit).all()

def get_default_bank_details(db: Session, user_id: uuid.UUID) -> Optional[UserBankDetails]:
    """Get the default bank details for a user"""
    return db.query(UserBankDetails).filter(
        and_(UserBankDetails.user_id == user_id, UserBankDetails.default == True)
    ).first()

def update_bank_details(db: Session, bank_id: int, user_id: uuid.UUID, bank_details: BankDetailsUpdate) -> Optional[UserBankDetails]:
    """Update bank details"""
    db_bank = get_bank_details(db, bank_id, user_id)
    if not db_bank:
        return None
    
    update_data = bank_details.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_bank, field, value)
    
    db.commit()
    db.refresh(db_bank)
    return db_bank

def delete_bank_details(db: Session, bank_id: int, user_id: uuid.UUID) -> bool:
    """Delete bank details"""
    db_bank = get_bank_details(db, bank_id, user_id)
    if not db_bank:
        return False
    
    # If deleting the default bank, set another bank as default
    if db_bank.default:
        other_banks = db.query(UserBankDetails).filter(
            and_(UserBankDetails.user_id == user_id, UserBankDetails.id != bank_id)
        ).first()
        if other_banks:
            other_banks.default = True
            db.commit()
    
    db.delete(db_bank)
    db.commit()
    return True

def set_default_bank_details(db: Session, bank_id: int, user_id: uuid.UUID) -> Optional[UserBankDetails]:
    """Set a bank details as default"""
    # First, unset all other default banks for this user
    db.query(UserBankDetails).filter(
        and_(UserBankDetails.user_id == user_id, UserBankDetails.default == True)
    ).update({"default": False})
    
    # Set the specified bank as default
    db_bank = get_bank_details(db, bank_id, user_id)
    if db_bank:
        db_bank.default = True
        db.commit()
        db.refresh(db_bank)
    
    return db_bank

def get_bank_details_count(db: Session, user_id: uuid.UUID) -> int:
    """Get the count of bank details for a user"""
    return db.query(UserBankDetails).filter(UserBankDetails.user_id == user_id).count()