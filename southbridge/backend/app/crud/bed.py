from datetime import datetime
from zoneinfo import ZoneInfo
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Optional, Tuple
from decimal import Decimal
from uuid import UUID
import random
import string
from app.schemas.bed import UserBankDetails
from app.models.bid import Bid
from app.models.order import Order
from app.models.user import Driver, User, UserBankDetails as UserBankDetailsModel
from app.models.BED import (
    BEDCommissionRule,
    BEDReferral,
    BEDWallet,
    BEDWalletTransaction,
    BEDWalletTransactionType,
    BEDWalletTransactionReason,
)

def generate_unique_referral_code(db: Session, length: int = 8) -> str:
    """Generate a unique referral code for a user."""
    while True:
        # Generate a random code with letters and numbers
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        
        # Check if this code already exists
        existing_user = db.query(User).filter(User.refercode == code).first()
        if not existing_user:
            return code
import requests


def get_user_by_referecode(db: Session, referral_code: str) -> bool:
    """
    Validate a referral code."""
    user = db.query(User).filter(User.refercode == referral_code).first()
    if user:
        return user
    return None



def initialize_bed_wallet(
    db: Session,
    user_id: UUID,
    referrer_id: Optional[UUID] = None
) -> BEDWallet:
    """
    Initialize BED wallet for new user.
    
    Creates:
    1. BEDWallet with zero balance
    2. Initial transaction record
    3. BEDReferral record (if referrer exists)
    
    Args:
        db: Database session
        user_id: User ID to create wallet for
        referrer_id: Optional referrer's user ID
    
    Returns:
        BEDWallet object
    """
    
    # Check if wallet already exists
    existing_wallet = db.query(BEDWallet).filter(
        BEDWallet.user_id == user_id
    ).first()
    
    if existing_wallet:
        return existing_wallet
    
    try:
        # Create wallet
        wallet = BEDWallet(
            user_id=user_id,
            balance=Decimal("0.00"),
            total_earned=Decimal("0.00"),
            total_withdrawn=Decimal("0.00"),
            is_locked=False,
            created_at=datetime.now(ZoneInfo("Asia/Kolkata")),
            updated_at=datetime.now(ZoneInfo("Asia/Kolkata")),
        )
        db.add(wallet)
        db.flush()
        
        print(f"✓ BED wallet created for user {user_id}")
        
        # Create initial transaction record
        init_transaction = BEDWalletTransaction(
            wallet_id=wallet.id,
            user_id=user_id,
            amount=Decimal("0.00"),
            type=BEDWalletTransactionType.CREDIT,
            reason=BEDWalletTransactionReason.ADJUSTMENT,
            description="Wallet initialized on user registration",
            created_at=datetime.now(ZoneInfo("Asia/Kolkata")),
        )
        db.add(init_transaction)
        db.flush()
        
        print(f"✓ Initial transaction record created")
        
        # Create referral record if referrer exists
        if referrer_id:
            referral = BEDReferral(
                referrer_id=referrer_id,
                referred_id=user_id,
                referral_level=1,
                created_at=datetime.now(ZoneInfo("Asia/Kolkata")),
            )
            db.add(referral)
            db.flush()
            
            print(f"✓ BED referral record created: {referrer_id} → {user_id}")
        
        return wallet
        
    except Exception as e:
        print(f"❌ Error initializing BED wallet: {e}")
        raise
    
def create_refferal(db: Session, user_id: UUID, referrer_id: UUID):
    """
    Create a referral record for multi-level referrals (up to 5 levels).
    """
    for i in range(1, 6):
        referral = BEDReferral(
            referrer_id=referrer_id,
            referred_id=user_id,
            referral_level=i,
            created_at=datetime.now(ZoneInfo("Asia/Kolkata")),
        )
        db.add(referral)
        db.flush()
        print(f"✓ BED referral record created: {referrer_id} → {user_id} at level {i}")
        
        # Find who referred the current referrer (to go up the chain)
        their_referer = db.query(BEDReferral).filter(
            BEDReferral.referred_id == referrer_id,
            BEDReferral.referral_level == 1
        ).first()
        
        if their_referer is None:
            break
            
        referrer_id = their_referer.referrer_id
   

def get_referral_chain(db: Session, user_id: UUID, max_levels: int = 5) -> Tuple[Dict,int]:
    """referal chain for a user and the level of the user"""    
    referral_chain = {}
    current_user = db.query(User).filter(User.id == user_id).first()
    if current_user:
        
        for level in range(1, max_levels+1):
            referrer = db.query(User).filter(User.id == current_user.refered_by).first()
            if referrer:
                referral_chain[level] = referrer
                current_user = referrer
            else:
                break
    return (referral_chain,level+1)

def get_commission_percentage(db: Session,levels: int) -> Dict:
    """get commission percentage for each level from database rules"""
    commission_percentage = {}
    
    for level in range(1, levels+1):
        rule = db.query(BEDCommissionRule).filter(
            BEDCommissionRule.referral_level == level,
            BEDCommissionRule.is_active == True
        ).first()
        
        if rule:
            commission_percentage[level] = rule.commission_percentage
        else:
            commission_percentage[level] = 0.0  # Default to 0% if no rule found
    return commission_percentage
       
def distribute_commissions(db: Session, order_id: UUID):
    """
    Distribute commission to the user and their referrer.
    """
    print(f"🔍 [DEBUG] Starting commission distribution for order {order_id}")
    
    try:
        # Get order details
        # Get order details
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
            
        if order.payout_done:
            print(f"⚠️ [DEBUG] Order {order_id} already processed for BED payout - skipping")
            return True
            
        # Get bid and order amount
        # Get bid details
        bid = db.query(Bid).filter(Bid.id == order.bid_id).first()
        if not bid:
            raise HTTPException(status_code=404, detail="Bid not found")
            
        order_amount = Decimal(str(bid.amount))
        
        # Get driver details
        # Get driver details
        driver = db.query(Driver).filter(Driver.id == bid.driver_id).first()
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
            
        
        # Get referral chain
        # Get referral chain
        referral_chain, levels = get_referral_chain(db, driver.user_id)
        
        # Get commission percentages from database rules
        # Get commission percentages
        commission_percentage = get_commission_percentage(db, levels)
        
        # Distribute commissions to referrers using cascading system with database rules
        total_commission_distributed = Decimal("0")
        previous_level_commission = Decimal("0")  # Track previous level's commission for cascading
        
        for level in range(1, levels):
            if level in referral_chain and level in commission_percentage:
                user = referral_chain[level]
                percentage = commission_percentage[level]
                
                # Calculate commission based on cascading system using database rules
                if level == 1:
                    # First level gets percentage of full order amount (from database rule)
                    commission_amount = order_amount * Decimal(str(percentage / 100))
                    previous_level_commission = commission_amount  # Store for next level
                else:
                    # Subsequent levels get percentage of previous level's commission (from database rule)
                    commission_amount = previous_level_commission * Decimal(str(percentage / 100))
                    previous_level_commission = commission_amount  # Update for next level
                
                # Update user's BED wallet
                wallet = db.query(BEDWallet).filter(BEDWallet.user_id == user.id).first()
                if wallet:
                    wallet.balance += commission_amount
                    wallet.total_earned += commission_amount
                    
                    # Create transaction record
                    transaction = BEDWalletTransaction(
                        wallet_id=wallet.id,
                        user_id=user.id,
                        amount=commission_amount,
                        type=BEDWalletTransactionType.CREDIT,
                        reason=BEDWalletTransactionReason.COMMISSION,
                        order_id=order.id,
                        referral_level=level,
                        description=f"Cascading commission from order {order.id} (Level {level}: {percentage}% from database rule)"
                    )
                    db.add(transaction)
                    total_commission_distributed += commission_amount
                else:
                    print(f"⚠️ [DEBUG] No BED wallet found for user {user.id} at level {level}")
        
        # Calculate total commission to be deducted from driver's payout
        # Calculate driver's final amount (bid amount - commission distributed)
        driver_final_amount = order_amount - total_commission_distributed
        
        driver_wallet = db.query(BEDWallet).filter(BEDWallet.user_id == driver.user_id).first()
        if driver_wallet:
            # Add the driver's final amount (bid amount - commission) to BED wallet
            driver_wallet.balance += driver_final_amount
            driver_wallet.total_earned += driver_final_amount
            
            db.commit()
            db.refresh(driver_wallet)
            
            # Create transaction record for the driver's final amount
            transaction = BEDWalletTransaction(
                wallet_id=driver_wallet.id,
                user_id=driver.user_id,
                amount=driver_final_amount,
                type=BEDWalletTransactionType.CREDIT,
                reason=BEDWalletTransactionReason.COMMISSION,
                order_id=order.id,
                referral_level=0,  # Driver is level 0
                description=f"Driver payment for order {order.id} (₹{float(driver_final_amount):.2f} after commission deduction)"
            )
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
        else:
            print(f"⚠️ [DEBUG] No BED wallet found for driver {driver.id}")
        
        # Mark order as processed
        order.payout_done = True
        db.commit()
        
        print(f"✅ [DEBUG] Commission distribution completed for order {order_id}")
        return True
        
    except Exception as e:
        print(f"💥 [DEBUG] Commission distribution failed for order {order_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Commission distribution failed: {str(e)}")


def get_wallet_history(db: Session, user_id: UUID, page: int, limit: int):
    """get wallet history in the order latest to oldest"""
    try:
        skip = (page - 1) * limit
        transactions = db.query(BEDWalletTransaction).filter(
            BEDWalletTransaction.user_id == user_id
        ).order_by(
            BEDWalletTransaction.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        # Format transactions for frontend
        formatted_transactions = []
        for transaction in transactions:
            # Determine transaction type for frontend display
            transaction_type = "commission" if transaction.reason.value == "commission" else transaction.reason.value
            formatted_transactions.append({
                "id": str(transaction.id),
                "type": transaction_type,
                "amount": float(transaction.amount) if transaction.type.value == "credit" else -float(transaction.amount),
                "status": "completed",  # All transactions are completed once created
                "created_at": transaction.created_at.isoformat() if transaction.created_at else None,
                "description": transaction.description or f"{transaction.reason.value.title()} transaction"
            })
        
        return {
            "transactions": formatted_transactions,
            "total": db.query(BEDWalletTransaction).filter(BEDWalletTransaction.user_id == user_id).count(),
            "page": page,
            "limit": limit
        }
    except Exception as e:
        print(f"Error getting wallet history: {e}")
        raise HTTPException(status_code=500, detail=f"Wallet history failed: {str(e)}")
    

def get_commission_history(db: Session, user_id: UUID, page: int, limit: int):
    """get commission history in the order latest to oldest"""
    try:
        skip = (page - 1) * limit
        transactions = db.query(BEDWalletTransaction).filter(
            BEDWalletTransaction.user_id == user_id, 
            BEDWalletTransaction.reason == BEDWalletTransactionReason.COMMISSION
        ).order_by(
            BEDWalletTransaction.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        # Format transactions for frontend
        formatted_transactions = []
        for transaction in transactions:
            formatted_transactions.append({
                "id": str(transaction.id),
                "type": "commission",
                "amount": float(transaction.amount),
                "status": "completed",
                "created_at": transaction.created_at.isoformat() if transaction.created_at else None,
                "description": transaction.description or "Commission transaction"
            })
        
        return {
            "transactions": formatted_transactions,
            "total": db.query(BEDWalletTransaction).filter(
                BEDWalletTransaction.user_id == user_id, 
                BEDWalletTransaction.reason == BEDWalletTransactionReason.COMMISSION
            ).count(),
            "page": page,
            "limit": limit
        }
    except Exception as e:
        print(f"Error getting commission history: {e}")
        raise HTTPException(status_code=500, detail=f"Commission history failed: {str(e)}")


def get_referal_tree(db: Session, user_id: UUID):
    """get referal tree of user the user as root"""
    try:
        # Get only direct referrals (level 1) to avoid duplicates
        # Use proper join and distinct to get unique referrals
        referrals = db.query(BEDReferral, User).join(
            User, BEDReferral.referred_id == User.id
        ).filter(
            BEDReferral.referrer_id == user_id,
            BEDReferral.referral_level == 1  # Only direct referrals
        ).distinct(BEDReferral.referred_id).all()
        
        # Format the data for frontend
        referral_tree = []
        print(f"DEBUG: Found {len(referrals)} referrals for user {user_id}")
        
        for referral, referred_user in referrals:
            print(f"DEBUG: Processing referral {referral.id} for user {referred_user.username}")
            # Calculate total commission earned from this specific referral
            # This includes all levels of commission from this referral's network
            total_commission = db.query(BEDWalletTransaction).filter(
                BEDWalletTransaction.user_id == user_id,
                BEDWalletTransaction.reason == BEDWalletTransactionReason.COMMISSION
            ).with_entities(func.sum(BEDWalletTransaction.amount)).scalar() or 0
            
            # Get the referral's network size (how many people they referred)
            network_size = db.query(BEDReferral).filter(
                BEDReferral.referrer_id == referred_user.id
            ).count()
            
            referral_tree.append({
                "username": referred_user.username,
                "level": 1,  # Direct referral
                "total_commission": float(total_commission),
                "referred_id": str(referred_user.id),
                "network_size": network_size,
                "created_at": referral.created_at.isoformat() if referral.created_at else None
            })
        
        return referral_tree
    except Exception as e:
        print(f"Error getting referal tree: {e}")
        raise HTTPException(status_code=500, detail=f"Referal tree failed: {str(e)}")


def verify_bank_account(account_number: str, ifsc: str):
    url = "https://api.razorpay.com/v1/fund_accounts/validations"
    payload = {"account_number": account_number, "ifsc": ifsc}
    auth = ("rzp_live_XXXX", "your_secret_key")

    response = requests.post(url, json=payload, auth=auth)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=response.json())
    return response.json()


def create_user_bank_details(db: Session, user_id: UUID, bank_details: UserBankDetails):
    """create user bank details"""
    try:
        user_bank_details = UserBankDetailsModel(
            user_id=user_id,
            account_number=bank_details.account_number,
            account_holder_name=bank_details.account_holder_name,
            bank_name=bank_details.bank_name,
            ifsc_code=bank_details.ifsc_code,
            created_at=datetime.now(ZoneInfo("Asia/Kolkata")),
            updated_at=datetime.now(ZoneInfo("Asia/Kolkata")),
        )
        db.add(user_bank_details)
        db.commit()
        db.refresh(user_bank_details)
        return user_bank_details
    except Exception as e:
        print(f"Error creating user bank details: {e}")
        raise HTTPException(status_code=500, detail=f"User bank details creation failed: {str(e)}")
    

def send_amount(amount: float, account: UserBankDetails, db: Session):
    """send amount to bank account"""
    try:
        #razor pay logic skipped need to do later
        history = BEDWalletTransaction(
            wallet_id=account.wallet_id,
            user_id=account.user_id,
            amount=amount,
            type=BEDWalletTransactionType.DEBIT,
            reason=BEDWalletTransactionReason.WITHDRAWAL,
        )
        db.add(history)
        db.commit()
        db.refresh(history)
        #wallet amount change
        wallet = db.query(BEDWallet).filter(BEDWallet.user_id == account.user_id).first()
        if wallet:
            wallet.balance -= amount
            db.commit()
            db.refresh(wallet)
        
        
        return True
    except Exception as e:
        print(f"Error sending amount: {e}")
        raise HTTPException(status_code=500, detail=f"Amount sending failed: {str(e)}")
