from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.models.BED import BEDWallet
from app.schemas.bed import WithdrawRequest
from app.models.user import UserBankDetails
from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.crud.bed import (
    distribute_commissions,
    get_wallet_history,
    get_referal_tree,
    initialize_bed_wallet,
    send_amount,
    generate_unique_referral_code,
)

router = APIRouter()


@router.get("/wallet")
def get_wallet(db: Session = Depends(get_db), user=Depends(get_current_active_user)):
    """
    Get current user's wallet with balance
    """
    wallet = db.query(BEDWallet).filter(BEDWallet.user_id == user.id).first()
    if not wallet:
        initialize_bed_wallet(db, user.id)
        wallet = db.query(BEDWallet).filter(BEDWallet.user_id == user.id).first()
    return {
        "balance": wallet.balance,
        "total_earned": wallet.total_earned,
        "total_withdrawn": wallet.total_withdrawn,
    }


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user),
    page: int = Query(1, ge=1, description="Page number (>=1)"),
    limit: int = Query(10, ge=1, le=100, description="Items per page (1–100)"),
):
    """get wallet history"""

    skip = (page - 1) * limit
    history = get_wallet_history(db, user.id, page, limit)

    return history


# @router.get("/commission")
# def get_commission(
#     db: Session = Depends(get_db), user=Depends(get_current_active_user)
# ):
#     """get commission history"""
    


@router.get("/referal-tree")
def get_referal_tree_endpoint(
    db: Session = Depends(get_db), user=Depends(get_current_active_user)
):
    """get referal tree of user the user as root"""
    referal_tree = get_referal_tree(db, user.id)
    return referal_tree


@router.get("/commission-rules")
def get_commission_rules(
    db: Session = Depends(get_db), user=Depends(get_current_active_user)
):
    """Get commission rules for all levels"""
    from app.models.BED import BEDCommissionRule
    
    rules = db.query(BEDCommissionRule).filter(
        BEDCommissionRule.is_active == True
    ).order_by(BEDCommissionRule.referral_level).all()
    
    commission_rules = []
    for rule in rules:
        commission_rules.append({
            "level": rule.referral_level,
            "percentage": rule.commission_percentage,
            "description": f"Level {rule.referral_level} referrals"
        })
    
    return {
        "commission_rules": commission_rules,
        "total_levels": len(commission_rules)
    }



@router.post("/withdraw")
def withdraw(
    withdraw_data: WithdrawRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user),
):
    """withdraw money from wallet"""
    account  = db.query(UserBankDetails).filter(UserBankDetails.id == withdraw_data.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.user_id != user.id:
        raise HTTPException(status_code=403, detail="Account not found")
    if account.default:
        raise HTTPException(status_code=400, detail="Default account cannot be used for withdrawal")
    if account.balance < withdraw_data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    try:
        amount = withdraw_data.amount
        sended = send_amount(amount, account, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Amount sent successfully"}

@router.post("/generate-referral-code")
def generate_referral_code(db: Session = Depends(get_db), user=Depends(get_current_active_user)):
    """Generate a referral code for the current user if they don't have one"""
    try:
        # Check if user already has a referral code
        if user.refercode:
            return {"message": "User already has a referral code", "refercode": user.refercode}
        
        # Generate a new referral code
        referral_code = generate_unique_referral_code(db)
        
        # Update user with the new referral code
        user.refercode = referral_code
        db.commit()
        db.refresh(user)
        
        return {"message": "Referral code generated successfully", "refercode": referral_code}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

   
