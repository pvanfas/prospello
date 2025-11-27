# app/crud/load.py - Updated create_load function
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

import re
import json
from typing import Dict, Any, Optional, List
from deep_translator import GoogleTranslator
from sqlalchemy import or_

from app.models.bid import Bid
from app.models.load import LoadSource, LoadStatus, Load, GoodsCategory
from app.models.user import User, UserType, Driver
from app.schemas.load import Load as LoadSchema, LoadDetails
from app.services.langchain import full_chain




def create_load(db: Session, user: User, load_data: dict, type = "text") -> Load:
    """
    Create a new load from text, voice, or image input.
    """
    # Debug: Print load_data
    print(f"🔍 DEBUG: create_load - type: {type}")
    print(f"🔍 DEBUG: create_load - load_data: {load_data}")
    try:
        vehicle_types_debug = (
            load_data.get('vehicle_types') if isinstance(load_data, dict) else getattr(load_data, 'vehicle_types', None)
        )
    except Exception:
        vehicle_types_debug = None
    print(f"🔍 DEBUG: create_load - vehicle_types: {vehicle_types_debug}")
    
    if type == "text":
        load = Load(
            id=str(uuid.uuid4()),
            shipper_id=load_data.get("shipper_id"),
            broker_id=load_data.get("broker_id"),
            origin=load_data.get("origin"),
            destination=load_data.get("destination"),
            goods_type=load_data.get("goods_type", "general"),
            weight=load_data.get("weight", 0),
            dimensions=load_data.get("dimensions"),
            special_instructions=load_data.get("special_instructions") or load_data.get("instructions"),
            category=load_data.get("category"),
            status=LoadStatus.POSTED,
            origin_place=load_data.get("origin_place"),
            destination_place=load_data.get("destination_place"),
            # New fields
            source_type=load_data.get("source_type", LoadSource.TEXT),
            source_content=load_data.get("source_content"),
            vehicle_types=load_data.get("vehicle_types", ["any"]),
            
            image=load_data.get("image"),
            image_path=load_data.get("image_path"),
        )
        
        # Debug: Print what's being saved
        print(f"🔍 DEBUG: Text load - vehicle_types being saved: {load_data.get('vehicle_types', ['any'])}")
    elif type in ["voice", "image"]:
        load = Load(
            id=str(uuid.uuid4()),
            shipper_id=load_data.shipper_id,
            broker_id=load_data.broker_id,
            origin=load_data.origin,
            destination=load_data.destination,
            goods_type=load_data.goods_type or "general",
            weight=load_data.weight or 0,
            dimensions=load_data.dimensions,
            special_instructions=load_data.special_instructions or "",
            category=load_data.category,
            status=LoadStatus.POSTED,
            # load
            # New fields
            source_type=load_data.source_type or LoadSource.VOICE,
            source_content=load_data.source_content,
            vehicle_types=getattr(load_data, 'vehicle_types', ["any"])
        )

    db.add(load)
    db.commit()
    db.refresh(load)
    return load

def get_load(db: Session, load_id: str) -> Optional[Load]:
    """Get a load by ID"""
    return db.query(Load).filter(Load.id == load_id).first()

def get_loads_by_user(db: Session, user: User, skip: int = 0, limit: int = 20) -> List[Load]:
    """Get all loads created by a specific user"""
    from sqlalchemy.orm import joinedload
    from app.models.user import Shipper, Broker
    query = db.query(Load).options(
        joinedload(Load.shipper).joinedload(Shipper.user),
        joinedload(Load.broker).joinedload(Broker.user)
    ).filter(Load.status.in_([LoadStatus.POSTED, LoadStatus.BIDDING]))
    
    if user.role == UserType.SHIPPER and user.shipper:
        query = query.filter(Load.shipper_id == user.shipper.id)
    elif user.role == UserType.BROKER and user.broker:
        query = query.filter(Load.broker_id == user.broker.id)
    else:
        return []  # Return empty list if user can't create loads
    
    return query.order_by(Load.created_at.desc()).offset(skip).limit(limit).all()

def get_available_loads(db: Session, skip: int = 0, limit: int = 20, category: Optional[GoodsCategory] = None, driver_vehicle_type: Optional[str] = None) -> List[Load]:
    """Get available loads for drivers to bid on, filtered by driver's vehicle type"""
    from sqlalchemy.orm import joinedload
    from app.models.user import Shipper, Broker
    from sqlalchemy import cast, String
    query = db.query(Load).options(
        joinedload(Load.shipper).joinedload(Shipper.user),
        joinedload(Load.broker).joinedload(Broker.user)
    ).filter(
        Load.status.in_([LoadStatus.POSTED, LoadStatus.BIDDING])
    )
    
    if category:
        query = query.filter(Load.category == category)
    
    # Filter by vehicle type: show loads that match driver's vehicle type OR loads with vehicle_types containing 'any'
    if driver_vehicle_type:
        # Using PostgreSQL JSON operators to check if array contains the value
        # vehicle_types @> '["driver_type"]' OR vehicle_types @> '["any"]' OR vehicle_types IS NULL
        query = query.filter(
            or_(
                Load.vehicle_types.contains([driver_vehicle_type]),
                Load.vehicle_types.contains(["any"]),
                Load.vehicle_types.is_(None)
            )
        )
    
    return query.order_by(Load.created_at.desc()).offset(skip).limit(limit).all()

def update_load_status(db: Session, load_id: str, status: LoadStatus) -> Optional[Load]:
    """Update load status"""
    load = db.query(Load).filter(Load.id == load_id).first()
    if load:
        load.status = status
        db.commit()
        db.refresh(load)
    return load

def update_load(db: Session, load_id: str, user: User, update_data: dict) -> Optional[Load]:
    """Update a load (only by owner and only if status allows)"""
    load = get_load(db, load_id)
    if not load:
        return None
    
    # Check ownership
    is_owner = (
        (user.role == UserType.SHIPPER and user.shipper and load.shipper_id == user.shipper.id) or
        (user.role == UserType.BROKER and user.broker and load.broker_id == user.broker.id)
    )
    
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own loads"
        )
    
    # Only allow updates if load is still in POSTED status
    if load.status not in [LoadStatus.POSTED, LoadStatus.BIDDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update load that is already assigned or completed"
        )
    load.status = LoadStatus.POSTED # Move to POSTED on any update
    load.accepted_bid_id = None
    load.assigned_driver_id = None
    load.bid_count = 0
    load.lowest_bid = None
    
    origin_changed = "origin" in update_data and update_data["origin"] != load.origin
    destination_changed = "destination" in update_data and update_data["destination"] != load.destination
    # Update fields
    for field, value in update_data.items():
        if hasattr(load, field) and value is not None:
            setattr(load, field, value)


    from app.models.load import geocode_address
    if origin_changed:
        geo = geocode_address(load.origin)
        if geo:
            load.origin_lat = geo["lat"]
            load.origin_lng = geo["lng"]
    if destination_changed:
        geo = geocode_address(load.destination)
        if geo:
            load.destination_lat = geo["lat"]
            load.destination_lng = geo["lng"]
            
    # Bids will be automatically deleted due to cascade relationship
    
    
    # Re-categorize if goods_type changed
    if "goods_type" in update_data:
        load.category = categorize_goods(load.goods_type)
    
    db.commit()
    db.refresh(load)
    return load

def delete_load(db: Session, load_id: str, user: User, hard_delete: bool = False) -> bool:
    """Delete a load (only by owner and only if no bids)"""
    try:
        load = get_load(db, load_id)
        if not load:
            return False
        
        # Check ownership
        is_owner = (
            (user.role == UserType.SHIPPER and user.shipper and load.shipper_id == user.shipper.id) or
            (user.role == UserType.BROKER and user.broker and load.broker_id == user.broker.id)
        )
        
        if not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own loads"
            )
        
        # # Only allow deletion if no bids exist or load is still POSTED
        # if load.status != LoadStatus.POSTED:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Cannot delete load that has bids or is assigned"
        #     )
        
        db.delete(load)
        db.commit()
        return True
    except Exception as e:
        print(f"Failed to delete load: {e}")
        return False

def categorize_goods(goods_type: str) -> GoodsCategory:
    """Simple heuristic categorization, can later be AI-powered."""
    goods_type_lower = goods_type.lower()

    if any(word in goods_type_lower for word in ["rice", "wheat", "fruit", "milk", "vegetable", "onion", "potato", "fish", "meat"]):
        return GoodsCategory.PERISHABLE
    elif any(word in goods_type_lower for word in ["cement", "steel", "machinery", "pipe", "beam", "construction"]):
        return GoodsCategory.OVERSIZE
    elif any(word in goods_type_lower for word in ["electronics", "gold", "diamond", "jewelry", "medicine", "pharmaceutical"]):
        return GoodsCategory.HIGH_VALUE
    else:
        return GoodsCategory.GENERAL

# def extract_load_details(raw_text: str) -> dict:
#     """
#     Converts raw text (from voice/image/native language) into load data dict.
#     """

#     # Step 1: Translate text → English
#     translator = Translator()
#     try:
#         translated_text = translator.translate(raw_text, src="auto", dest="en").text
#     except Exception as e:
#         print(f"Translation failed: {e}")
#         translated_text = raw_text  # Fallback to original text

#     # Step 2: AI extraction
#     prompt = f"""
#     You are an AI that extracts logistics shipment details from natural language.
#     From the following text, identify:

#     - goods_type (e.g., rice, wheat, cement, steel, electronics, etc.)
#     - weight (in kg/tons if mentioned)
#     - origin city/state/location
#     - destination city/state/location
#     - special_instructions (any special handling requirements)
#     - dimensions (if mentioned)

#     Text: "{translated_text}"

#     Respond strictly in JSON format:
#     {{
#       "goods_type": "...",
#       "weight": number_or_null,
#       "origin": "...",
#       "destination": "...",
#       "special_instructions": "...",
#       "dimensions": "..."
#     }}
#     """

#     try:
#         response = openai.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0
#         )
        
#         # Parse JSON safely
#         import json
#         parsed = json.loads(response.choices[0].message.content)
        
#     except Exception as e:
#         # Log the error and return default values
#         print(f"OpenAI API call failed: {e}")
#         parsed = {
#             "goods_type": "general",
#             "weight": None,
#             "origin": "unknown",
#             "destination": "unknown",
#             "special_instructions": None,
#             "dimensions": None
#         }

#     # Clean up and return the data
#     return {
#         "goods_type": parsed.get("goods_type") or "general",
#         "weight": parsed.get("weight") or 0,
#         "origin": parsed.get("origin") or "unknown",
#         "destination": parsed.get("destination") or "unknown",
#         "special_instructions": parsed.get("special_instructions"),
#         "dimensions": parsed.get("dimensions")
#     }
    
def extract_load_details(raw_text: str) -> LoadDetails:
    try:
        # Invoke the chain with the input text
        result = full_chain.invoke({"text": raw_text})
        
        # Parse the JSON response
        data = json.loads(result.content)
        
        # Create LoadDetails object
        load = LoadDetails(**data)
        return load
        
    except Exception as e:
        print(f"Failed to extract load details: {e}")
        # Return default values on error
        return LoadDetails(
            goods_type="unknown",
            weight=None,
            origin="unknown",
            destination="unknown",
            special_instructions=None,
            dimensions=None
        )



from sqlalchemy.sql import text

EARTH_RADIUS_KM = 6371.0

def get_nearby_loads(
    db: Session, 
    lat: float = None, 
    lng: float = None, 
    driver_origin_lat: float = None,
    driver_origin_lng: float = None,
    driver_dest_lat: float = None,
    driver_dest_lng: float = None,
    radius: float = 20.0, 
    driver_id: int = None, 
    reverse: bool = False
):
    """
    Fetch nearby loads using Haversine formula in PostgreSQL.
    
    If reverse=False (default): Returns loads whose origin is within the given radius of driver's location
    If reverse=True: Returns loads along the driver's route (route matching)
        - Finds loads where both the load's origin is near driver's route start
        - AND the load's destination is along or near driver's intended destination
    
    Also filters by driver's available capacity.
    """
    # Get driver's available capacity
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        return []
    
    available_capacity = driver.available_capacity
    
    if reverse:
        # Route matching mode: Find loads along driver's route
        print(f"Route Matching Mode:")
        print(f"  Driver Route: ({driver_origin_lat}, {driver_origin_lng}) → ({driver_dest_lat}, {driver_dest_lng})")
        print(f"  Radius: {radius} km, Capacity: {available_capacity} kg")
        
        # Algorithm: Find loads where:
        # 1. Load's origin is within radius of driver's origin (can pick up along the way)
        # 2. Load's destination is within radius of driver's destination (delivers near where driver is going)
        # 3. The load's route is in the same general direction (not backtracking)
        
        query = text(f"""
            SELECT *
            FROM (
                SELECT 
                    l.id, l.origin, l.destination, l.goods_type, l.weight, l.dimensions, l.special_instructions,
                    l.origin_lat, l.origin_lng, l.destination_lat, l.destination_lng,
                    l.created_at, l.updated_at, l.category, l.verified, l.status, l.bid_count, l.lowest_bid, 
                    l.origin_place, l.destination_place,
                    l.shipper_id, l.broker_id,
                    COALESCE(s.status, b.status) as creator_status,
                    COALESCE(u.username, ub.username) as creator_name,
                    -- Distance from driver's origin to load's origin
                    (
                        {EARTH_RADIUS_KM} * 2 * atan2(
                            sqrt(
                                power(sin(radians(l.origin_lat - :driver_origin_lat) / 2), 2) +
                                cos(radians(:driver_origin_lat)) * cos(radians(l.origin_lat)) *
                                power(sin(radians(l.origin_lng - :driver_origin_lng) / 2), 2)
                            ),
                            sqrt(
                                1 - (
                                    power(sin(radians(l.origin_lat - :driver_origin_lat) / 2), 2) +
                                    cos(radians(:driver_origin_lat)) * cos(radians(l.origin_lat)) *
                                    power(sin(radians(l.origin_lng - :driver_origin_lng) / 2), 2)
                                )
                            )
                        )
                    ) AS origin_distance,
                    -- Distance from load's destination to driver's destination
                    (
                        {EARTH_RADIUS_KM} * 2 * atan2(
                            sqrt(
                                power(sin(radians(l.destination_lat - :driver_dest_lat) / 2), 2) +
                                cos(radians(:driver_dest_lat)) * cos(radians(l.destination_lat)) *
                                power(sin(radians(l.destination_lng - :driver_dest_lng) / 2), 2)
                            ),
                            sqrt(
                                1 - (
                                    power(sin(radians(l.destination_lat - :driver_dest_lat) / 2), 2) +
                                    cos(radians(:driver_dest_lat)) * cos(radians(l.destination_lat)) *
                                    power(sin(radians(l.destination_lng - :driver_dest_lng) / 2), 2)
                                )
                            )
                        )
                    ) AS destination_distance,
                    -- Combined route deviation score (lower is better)
                    (
                        {EARTH_RADIUS_KM} * 2 * atan2(
                            sqrt(
                                power(sin(radians(l.origin_lat - :driver_origin_lat) / 2), 2) +
                                cos(radians(:driver_origin_lat)) * cos(radians(l.origin_lat)) *
                                power(sin(radians(l.origin_lng - :driver_origin_lng) / 2), 2)
                            ),
                            sqrt(
                                1 - (
                                    power(sin(radians(l.origin_lat - :driver_origin_lat) / 2), 2) +
                                    cos(radians(:driver_origin_lat)) * cos(radians(l.origin_lat)) *
                                    power(sin(radians(l.origin_lng - :driver_origin_lng) / 2), 2)
                                )
                            )
                        ) +
                        {EARTH_RADIUS_KM} * 2 * atan2(
                            sqrt(
                                power(sin(radians(l.destination_lat - :driver_dest_lat) / 2), 2) +
                                cos(radians(:driver_dest_lat)) * cos(radians(l.destination_lat)) *
                                power(sin(radians(l.destination_lng - :driver_dest_lng) / 2), 2)
                            ),
                            sqrt(
                                1 - (
                                    power(sin(radians(l.destination_lat - :driver_dest_lat) / 2), 2) +
                                    cos(radians(:driver_dest_lat)) * cos(radians(l.destination_lat)) *
                                    power(sin(radians(l.destination_lng - :driver_dest_lng) / 2), 2)
                                )
                            )
                        )
                    ) AS route_deviation,
                    -- Load's actual distance (from origin to destination)
                    (
                        {EARTH_RADIUS_KM} * 2 * atan2(
                            sqrt(
                                power(sin(radians(l.destination_lat - l.origin_lat) / 2), 2) +
                                cos(radians(l.origin_lat)) * cos(radians(l.destination_lat)) *
                                power(sin(radians(l.destination_lng - l.origin_lng) / 2), 2)
                            ),
                            sqrt(
                                1 - (
                                    power(sin(radians(l.destination_lat - l.origin_lat) / 2), 2) +
                                    cos(radians(l.origin_lat)) * cos(radians(l.destination_lat)) *
                                    power(sin(radians(l.destination_lng - l.origin_lng) / 2), 2)
                                )
                            )
                        )
                    ) AS distance
                FROM loads l
                LEFT JOIN shippers s ON l.shipper_id = s.id
                LEFT JOIN brokers b ON l.broker_id = b.id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN users ub ON b.user_id = ub.id
                WHERE l.origin_lat IS NOT NULL 
                  AND l.origin_lng IS NOT NULL
                  AND l.destination_lat IS NOT NULL
                  AND l.destination_lng IS NOT NULL
                  AND l.status IN ('POSTED', 'BIDDING')
                  AND l.weight <= :available_capacity
                  AND (
                    (l.vehicle_types::jsonb @> CAST(:driver_vehicle_type_json AS jsonb)) OR 
                    (l.vehicle_types::jsonb @> '["any"]'::jsonb) OR 
                    l.vehicle_types IS NULL
                  )
            ) sub
            WHERE origin_distance <= :radius 
              AND destination_distance <= :radius
            ORDER BY route_deviation ASC
            LIMIT 50
        """)
        
        import json
        driver_vehicle_type_json = json.dumps([driver.vehicle_type or "any"])
        
        result = db.execute(query, {
            "driver_origin_lat": driver_origin_lat,
            "driver_origin_lng": driver_origin_lng,
            "driver_dest_lat": driver_dest_lat,
            "driver_dest_lng": driver_dest_lng,
            "radius": radius,
            "available_capacity": available_capacity,
            "driver_vehicle_type_json": driver_vehicle_type_json
        }).fetchall()
        
        print(f"Found {len(result)} loads along driver's route")
        return [dict(row._mapping) for row in result]
        
    else:
        # Normal mode: Find loads near driver's current location
        print(f"Normal Mode: Finding loads near ({lat}, {lng}), radius: {radius} km")
        
        query = text(f"""
            SELECT *
            FROM (
                SELECT 
                    l.id, l.origin, l.destination, l.goods_type, l.weight, l.dimensions, l.special_instructions,
                    l.origin_lat, l.origin_lng, l.destination_lat, l.destination_lng,
                    l.created_at, l.updated_at, l.category, l.verified, l.status, l.bid_count, l.lowest_bid, 
                    l.origin_place, l.destination_place,
                    l.shipper_id, l.broker_id,
                    COALESCE(s.status, b.status) as creator_status,
                    COALESCE(u.username, ub.username) as creator_name,
                    (
                        {EARTH_RADIUS_KM} * 2 * atan2(
                            sqrt(
                                power(sin(radians(l.origin_lat - :lat) / 2), 2) +
                                cos(radians(:lat)) * cos(radians(l.origin_lat)) *
                                power(sin(radians(l.origin_lng - :lng) / 2), 2)
                            ),
                            sqrt(
                                1 - (
                                    power(sin(radians(l.origin_lat - :lat) / 2), 2) +
                                    cos(radians(:lat)) * cos(radians(l.origin_lat)) *
                                    power(sin(radians(l.origin_lng - :lng) / 2), 2)
                                )
                            )
                        )
                    ) AS distance
                FROM loads l
                LEFT JOIN shippers s ON l.shipper_id = s.id
                LEFT JOIN brokers b ON l.broker_id = b.id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN users ub ON b.user_id = ub.id
                WHERE l.origin_lat IS NOT NULL AND l.origin_lng IS NOT NULL
                  AND l.status IN ('POSTED', 'BIDDING')
                  AND l.weight <= :available_capacity
                  AND (
                    (l.vehicle_types::jsonb @> CAST(:driver_vehicle_type_json AS jsonb)) OR 
                    (l.vehicle_types::jsonb @> '["any"]'::jsonb) OR 
                    l.vehicle_types IS NULL
                  )
            ) sub
            WHERE distance <= :radius
            ORDER BY distance ASC
        """)

        import json
        driver_vehicle_type_json = json.dumps([driver.vehicle_type or "any"])
        
        result = db.execute(query, {
            "lat": lat, 
            "lng": lng, 
            "radius": radius, 
            "available_capacity": available_capacity,
            "driver_vehicle_type_json": driver_vehicle_type_json
        }).fetchall()
        
        print(f"Found {len(result)} loads near driver's location")
        return [dict(row._mapping) for row in result]

# ===== ADMIN LOAD CRUD OPERATIONS =====

def get_loads_admin(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    shipper_id: Optional[int] = None,
    broker_id: Optional[int] = None
) -> List[Load]:
    """Get all loads with optional filtering and pagination for admin"""
    from sqlalchemy.orm import joinedload
    from app.models.user import Shipper, Broker
    query = db.query(Load).options(
        joinedload(Load.shipper).joinedload(Shipper.user),
        joinedload(Load.broker).joinedload(Broker.user)
    )
    
    if search:
        search_filter = or_(
            Load.origin.ilike(f"%{search}%"),
            Load.destination.ilike(f"%{search}%"),
            Load.goods_type.ilike(f"%{search}%"),
            Load.special_instructions.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if status:
        query = query.filter(Load.status == status)
    
    if category:
        query = query.filter(Load.category == category)
    
    if shipper_id:
        query = query.filter(Load.shipper_id == shipper_id)
    
    if broker_id:
        query = query.filter(Load.broker_id == broker_id)
    
    return query.offset(skip).limit(limit).all()

def get_load_admin(db: Session, load_id: str) -> Optional[Load]:
    """Get load by ID for admin"""
    return db.query(Load).filter(Load.id == load_id).first()

def create_load_admin(db: Session, load_data: dict) -> Load:
    """Create a new load via admin panel"""
    load = Load(
        id=str(uuid.uuid4()),
        shipper_id=load_data.get("shipper_id"),
        broker_id=load_data.get("broker_id"),
        origin=load_data.get("origin"),
        destination=load_data.get("destination"),
        goods_type=load_data.get("goods_type"),
        weight=load_data.get("weight"),
        dimensions=load_data.get("dimensions"),
        special_instructions=load_data.get("special_instructions"),
        origin_lat=load_data.get("origin_lat"),
        origin_lng=load_data.get("origin_lng"),
        destination_lat=load_data.get("destination_lat"),
        destination_lng=load_data.get("destination_lng"),
        source_type=LoadSource(load_data.get("source_type", "text")),
        source_content=load_data.get("source_content"),
        category=GoodsCategory(load_data.get("category", "general")),
        status=LoadStatus(load_data.get("status", "posted")),
        verified=load_data.get("verified", False)
    )
    db.add(load)
    db.commit()
    db.refresh(load)
    return load

def update_load_admin(db: Session, load_id: str, load_update: dict) -> Optional[Load]:
    """Update load information via admin panel"""
    load = get_load_admin(db, load_id)
    if not load:
        return None
    
    # Update load fields
    for field, value in load_update.items():
        if value is not None:
            if field == "status":
                setattr(load, field, LoadStatus(value))
            elif field == "category":
                setattr(load, field, GoodsCategory(value))
            elif field == "source_type":
                setattr(load, field, LoadSource(value))
            else:
                setattr(load, field, value)
    
    db.commit()
    db.refresh(load)
    return load

def delete_load_admin(db: Session, load_id: str) -> bool:
    """Delete load via admin panel"""
    load = get_load_admin(db, load_id)
    if load:
        db.delete(load)
        db.commit()
        return True
    return False

def get_load_stats_admin(db: Session, load_id: str) -> dict:
    """Get statistics for a specific load"""
    from app.models.bid import Bid, BidStatus
    from app.models.order import Order, OrderStatus
    
    load = get_load_admin(db, load_id)
    if not load:
        return {}
    
    # Count bids for this load
    total_bids = db.query(Bid).filter(Bid.load_id == load_id).count()
    
    # Count orders from this load
    total_orders = db.query(Order).filter(Order.load_id == load_id).count()
    
    # Count active bids (bids that are not accepted or rejected)
    active_bids = db.query(Bid).filter(
        Bid.load_id == load_id,
        Bid.status == BidStatus.PENDING
    ).count()
    
    # Count completed orders
    completed_orders = db.query(Order).filter(
        Order.load_id == load_id,
        Order.status == OrderStatus.DELIVERED
    ).count()
    
    return {
        'total_bids': total_bids,
        'total_orders': total_orders,
        'active_bids': active_bids,
        'completed_orders': completed_orders
    }
    
def get_lowest_bid(db: Session, load_id: str) -> float:
    """Get the lowest bid for a load"""
    return db.query(Bid).filter(Bid.load_id == load_id).order_by(Bid.amount.asc()).first().amount


