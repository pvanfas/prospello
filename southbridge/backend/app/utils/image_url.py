# app/utils/image_url.py
from app.core.config import settings
import os


def build_image_url(image_path: str) -> str | None:
    """Convert local image_path to public URL with forward slashes"""
    if not image_path:
        return None
    filename = os.path.basename(image_path)  # safe way
    return f"{settings.BACKEND_URL}/uploads/loads/{filename}"


def url_for_driver_vehicle(image_path: str) -> str | None:
    """Convert local image_path to public URL with forward slashes"""
    if not image_path:
        return None
    filename = os.path.basename(image_path)  # safe way
    return f"{settings.BACKEND_URL}/uploads/vehicle_images/{filename}"