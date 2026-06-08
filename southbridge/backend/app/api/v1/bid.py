from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_active_user
from app.crud.bid import accept_bid, create_bid, get_bids_for_driver, reject_bid, get_bids_for_load as listing_bids, delete_bid
from app.core.database import get_db
from app.models.user import User, UserType
from app.schemas.bid import AcceptBidRequest, BidSchema, DeleteBidRequest, DriverBidsResponse,LoadBidResponse,CreateBidsSchema as Create
import uuid

router = APIRouter()



@router.get("/loads/{load_id}/bids", response_model=list[LoadBidResponse])
def get_bids_for_load(load_id: uuid.UUID, db: Session = Depends(get_db)):
    return listing_bids(db, load_id)


@router.post("/loads/{load_id}/bids", response_model=BidSchema)
def create_bid_for_load(bid: Create, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    if user.role != UserType.DRIVER:
        raise HTTPException(status_code=403, detail="Only drivers can place bids.")

    if not user.driver:
        raise HTTPException(status_code=400, detail="Driver profile not found.")

    driver_id = user.driver.id
    # print(f"called created_bid_for_load with load_id: {bid.load_id}, driver_id: {driver_id}, amount: {bid.amount}--------------------")
    return create_bid(db, load_id=bid.load_id, driver_id=driver_id, bid_amount=bid.amount)


@router.post("/bids/{bid_id}/accept", )
def accept_bid_for_load(bid_id : uuid.UUID,data :AcceptBidRequest, db: Session = Depends(get_db)):
    # print(f" {data.expire_time} minutes")
    # return True
    return accept_bid(db, bid_id=bid_id, expire_time_minutes=data.expire_time)

@router.post("/{bid_id}/reject", )
def reject_bid_for_load(bid_id: uuid.UUID, db: Session = Depends(get_db)):
    return reject_bid(db, bid_id=bid_id)


@router.get("/driver/",response_model=list[DriverBidsResponse])
def get_driver_bids(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    return get_bids_for_driver(db, user.driver.id)

@router.delete("/{bid_id}")
def delete_bid_endpoint(bid_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    if user.role != UserType.DRIVER:
        raise HTTPException(status_code=403, detail="Only drivers can delete their own bids.")
    
    if not user.driver:
        raise HTTPException(status_code=400, detail="Driver profile not found.")
    
    # Check if the bid belongs to the current driver
    from app.models.bid import Bid
    bid = db.query(Bid).filter(Bid.id == bid_id, Bid.driver_id == user.driver.id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found or you don't have permission to delete this bid.")
    
    return delete_bid(db, bid_id=bid_id)

# @router.get("/{bid_id}/driver", response_model=DriverBidsRespo