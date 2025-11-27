from pydantic import BaseModel, Field
from typing import Annotated

class WithdrawRequest(BaseModel):
    amount: float
    account_id: int


class BankInput(BaseModel):
    account_number: Annotated[str, Field(pattern=r"^\d{9,18}$")]
    ifsc_code: Annotated[str, Field(pattern=r"^[A-Z]{4}0[A-Z0-9]{6}$")]


class UserBankDetails(BankInput):
    account_holder_name: str
    bank_name: str
