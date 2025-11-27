"""
API router aggregation - similar to Django's URL routing.
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .load import router as load_router
from .profile import router as profile_router
# from .driver import router as driver_router
from .bid import router as bidding_router
from .payment import router as payment_router  
from .ws import router as ws_router 
from .order import router as order_router
from .admin import admin_router
from .admin_auth import admin_auth_router
from .route import router as route_router
from .tracking import router as tracking_router
from .bed import router as bed_router
from .bank_details import router as bank_details_router
from .service_category import router as service_category_router
from .service_admin import service_admin_router
from .service_provider_profile import router as service_provider_profile_router
from .service import router as service_router
api_router = APIRouter()

# Include routers with prefixes
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(load_router, prefix="/load", tags=["load"])
api_router.include_router(profile_router, prefix="/profile", tags=["profile"])
# api_router.include_router(driver_router, prefix="/driver", tags=["driver"])
api_router.include_router(bidding_router, prefix="/bidding", tags=["bidding"])
api_router.include_router(payment_router, prefix="/payment", tags=["payment"])
api_router.include_router(order_router, prefix="/order", tags=["order"])
api_router.include_router(admin_auth_router, prefix="/admin", tags=["admin-auth"])  # Admin auth router
api_router.include_router(admin_router, tags=["admin"])  # Admin router
api_router.include_router(ws_router, tags=["websocket"])  # WebSocket router
api_router.include_router(route_router, prefix="/route", tags=["route"])
api_router.include_router(tracking_router, prefix="/tracking", tags=["tracking"])
api_router.include_router(bed_router, prefix="/bed", tags=["bed"])
api_router.include_router(bank_details_router, prefix="/bank-details", tags=["bank-details"])
api_router.include_router(service_category_router, prefix="/service-categories", tags=["service-categories"])
api_router.include_router(service_admin_router, tags=["service-admin"])
api_router.include_router(service_provider_profile_router, prefix="/service-provider", tags=["service-provider"])
api_router.include_router(service_router, prefix="/service", tags=["service"])
