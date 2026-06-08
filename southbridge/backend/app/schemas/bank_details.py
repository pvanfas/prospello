from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class BankDetailsBase(BaseModel):
    account_holder_name: str = Field(..., min_length=2, max_length=255)
    bank_name: str = Field(..., min_length=2, max_length=255)
    account_number: str = Field(..., min_length=9, max_length=18)
    ifsc_code: str = Field(..., min_length=11, max_length=11)

    @validator('account_number')
    def validate_account_number(cls, v):
        if not v.isdigit():
            raise ValueError('Account number must contain only digits')
        return v

    @validator('ifsc_code')
    def validate_ifsc_code(cls, v):
        v = v.upper()
        if len(v) != 11:
            raise ValueError('IFSC code must be 11 characters long')
        if not v[:4].isalpha():
            raise ValueError('IFSC code must start with 4 letters')
        if v[4] != '0':
            raise ValueError('IFSC code 5th character must be 0')
        if not v[5:].isalnum():
            raise ValueError('IFSC code last 6 characters must be alphanumeric')
        return v

class BankDetailsCreate(BankDetailsBase):
    pass

class BankDetailsUpdate(BaseModel):
    account_holder_name: Optional[str] = Field(None, min_length=2, max_length=255)
    bank_name: Optional[str] = Field(None, min_length=2, max_length=255)
    account_number: Optional[str] = Field(None, min_length=9, max_length=18)
    ifsc_code: Optional[str] = Field(None, min_length=11, max_length=11)
    default: Optional[bool] = None

    @validator('account_number')
    def validate_account_number(cls, v):
        if v is not None and not v.isdigit():
            raise ValueError('Account number must contain only digits')
        return v

    @validator('ifsc_code')
    def validate_ifsc_code(cls, v):
        if v is not None:
            v = v.upper()
            if len(v) != 11:
                raise ValueError('IFSC code must be 11 characters long')
            if not v[:4].isalpha():
                raise ValueError('IFSC code must start with 4 letters')
            if v[4] != '0':
                raise ValueError('IFSC code 5th character must be 0')
            if not v[5:].isalnum():
                raise ValueError('IFSC code last 6 characters must be alphanumeric')
        return v

class BankDetailsResponse(BankDetailsBase):
    id: int
    user_id: UUID
    default: bool
    is_verified: bool = False  # Default value - will be False until database migration
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BankDetailsListResponse(BaseModel):
    banks: List[BankDetailsResponse]
    total: int
    page: int
    limit: int

class WithdrawRequest(BaseModel):
    bank_id: int
    amount: float = Field(..., gt=0, description="Withdrawal amount must be greater than 0")
    reason: Optional[str] = Field(None, max_length=500)

class WithdrawResponse(BaseModel):
    id: int
    bank_id: int
    amount: float
    status: str
    transaction_id: str
    created_at: datetime

    class Config:
        from_attributes = True