from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.crud import bank_details as crud_bank_details
from app.schemas.bank_details import (
    BankDetailsCreate, 
    BankDetailsUpdate, 
    BankDetailsResponse, 
    BankDetailsListResponse,
    WithdrawRequest,
    WithdrawResponse
)

router = APIRouter()

@router.post("/", response_model=BankDetailsResponse)
def create_bank_details(
    bank_details: BankDetailsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new bank details record"""
    try:
        # Check if user already has maximum number of bank accounts (limit to 5)
        existing_count = crud_bank_details.get_bank_details_count(db, current_user.id)
        if existing_count >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum of 5 bank accounts allowed per user"
            )
        
        # Check if account number already exists for this user
        existing_banks = crud_bank_details.get_user_bank_details(db, current_user.id)
        for bank in existing_banks:
            if bank.account_number == bank_details.account_number:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Bank account with this account number already exists"
                )
        
        db_bank = crud_bank_details.create_bank_details(db, bank_details, current_user.id)
        # Add is_verified field (will be False until database migration)
        db_bank.is_verified = False
        return db_bank
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating bank details: {str(e)}"
        )

@router.get("/", response_model=BankDetailsListResponse)
def get_user_bank_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Get all bank details for the current user"""
    try:
        skip = (page - 1) * limit
        banks = crud_bank_details.get_user_bank_details(db, current_user.id, skip, limit)
        total = crud_bank_details.get_bank_details_count(db, current_user.id)
        
        # Add is_verified field to each bank (will be False until database migration)
        for bank in banks:
            bank.is_verified = False
        
        return BankDetailsListResponse(
            banks=banks,
            total=total,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching bank details: {str(e)}"
        )

@router.get("/{bank_id}", response_model=BankDetailsResponse)
def get_bank_details(
    bank_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific bank details record"""
    try:
        bank = crud_bank_details.get_bank_details(db, bank_id, current_user.id)
        if not bank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found"
            )
        
        # Add is_verified field (will be False until database migration)
        bank.is_verified = False
            
        return bank
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching bank details: {str(e)}"
        )

@router.put("/{bank_id}", response_model=BankDetailsResponse)
def update_bank_details(
    bank_id: int,
    bank_details: BankDetailsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update bank details"""
    try:
        # Check if bank exists and belongs to user
        existing_bank = crud_bank_details.get_bank_details(db, bank_id, current_user.id)
        if not existing_bank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found"
            )
        
        # If updating account number, check for duplicates
        if bank_details.account_number:
            existing_banks = crud_bank_details.get_user_bank_details(db, current_user.id)
            for bank in existing_banks:
                if bank.id != bank_id and bank.account_number == bank_details.account_number:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Bank account with this account number already exists"
                    )
        
        updated_bank = crud_bank_details.update_bank_details(db, bank_id, current_user.id, bank_details)
        # Add is_verified field (will be False until database migration)
        updated_bank.is_verified = False
        return updated_bank
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating bank details: {str(e)}"
        )

@router.delete("/{bank_id}")
def delete_bank_details(
    bank_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete bank details"""
    try:
        success = crud_bank_details.delete_bank_details(db, bank_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found"
            )
        return {"message": "Bank details deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting bank details: {str(e)}"
        )

@router.post("/{bank_id}/set-default")
def set_default_bank_details(
    bank_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set a bank details as default"""
    try:
        bank = crud_bank_details.set_default_bank_details(db, bank_id, current_user.id)
        if not bank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found"
            )
        # Add is_verified field (will be False until database migration)
        bank.is_verified = False
        return {"message": "Default bank updated successfully", "bank": bank}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error setting default bank: {str(e)}"
        )

@router.get("/default/bank", response_model=BankDetailsResponse)
def get_default_bank_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the default bank details for the current user"""
    try:
        bank = crud_bank_details.get_default_bank_details(db, current_user.id)
        if not bank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No default bank details found"
            )
        # Add is_verified field (will be False until database migration)
        bank.is_verified = False
        return bank
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching default bank details: {str(e)}"
        )

@router.post("/withdraw", response_model=WithdrawResponse)
def create_withdrawal_request(
    withdraw_request: WithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a withdrawal request"""
    try:
        # Verify bank belongs to user
        bank = crud_bank_details.get_bank_details(db, withdraw_request.bank_id, current_user.id)
        if not bank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found"
            )
        
        # TODO: Implement actual withdrawal logic
        # For now, just return a mock response
        import uuid
        transaction_id = str(uuid.uuid4())
        
        return WithdrawResponse(
            id=1,  # Mock ID
            bank_id=withdraw_request.bank_id,
            amount=withdraw_request.amount,
            status="pending",
            transaction_id=transaction_id,
            created_at=db.query(db.func.now()).scalar()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating withdrawal request: {str(e)}"
        )