from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    # Database
    database_url: str
    
    # JWT Settings
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 5
    refresh_token_expire_days: int = 7
    
    # App Settings
    project_name: str = "FastAPI"
    version: str = "1.0.0"
    BACKEND_URL: str = "http://localhost:8000"
    
    #Twilio
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_PHONE_NUMBER: str
    
    MEDIA_ROOT: Path = Path("media")
    MEDIA_URL: str = "/media/"
    VEHICLE_IMAGES_DIR: str = "vehicle_images"
    

    #openai
    OPENAI_API_KEY: str

    #google
    GOOGLE_API_KEY: str

    #razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAYX_KEY_ID : Optional[str] = None
    RAZORPAYX_KEY_SECRET : Optional[str] = None
    
    # AWS 
    BUCKET_NAME: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "ap-south-1"
    
    DEBUG: bool
    class Config:
        env_file = ".env"

# Global settings instance
settings = Settings()