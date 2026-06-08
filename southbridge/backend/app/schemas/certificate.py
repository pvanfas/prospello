# app/schemas/certificate.py
from pydantic import BaseModel, field_validator as validator
from datetime import datetime
from typing import Optional
from uuid import UUID

class CertificateBase(BaseModel):
    certificate_type: str
    

class CertificateCreate(CertificateBase):
    """Schema for uploading a certificate"""
    certificate: str  # Base64 encoded certificate image/PDF
    
    @validator('certificate_type')
    def validate_certificate_type(cls, v):
        valid_types = [
            'gst_certificate',
            'pan_card',
            'trade_license',
            'incorporation_certificate',
            'msme_certificate',
            'iso_certificate',
            'other'
        ]
        if v.lower() not in valid_types:
            raise ValueError(f'Certificate type must be one of: {", ".join(valid_types)}')
        return v.lower()
    
    @validator('certificate')
    def validate_certificate(cls, v):
        if not v or len(v) < 100:
            raise ValueError('Certificate data is required and must be valid')
        return v


class CertificateResponse(CertificateBase):
    """Schema for certificate response"""
    id: int
    user_id: UUID
    certificate: str  # URL to the certificate
    created_at: datetime
    
    class Config:
        from_attributes = True


class CertificateListResponse(BaseModel):
    """Schema for listing certificates"""
    certificates: list[CertificateResponse]
    total: int

