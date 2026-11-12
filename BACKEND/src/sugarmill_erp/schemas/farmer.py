import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class FarmerBase(BaseModel):
    farmer_code: str = Field(..., min_length=1, max_length=50, description="Unique code for farmer")
    name: str = Field(..., min_length=1, max_length=255, description="Farmer full name")
    father_name: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    village: str | None = Field(default=None, max_length=255)
    taluka: str | None = Field(default=None, max_length=255)
    district: str | None = Field(default=None, max_length=255)
    state: str | None = Field(default=None, max_length=100)
    bank_account_number: str | None = Field(default=None, max_length=50)
    bank_ifsc_code: str | None = Field(default=None, max_length=50)
    total_acreage: Decimal = Field(default=Decimal("0.00"), ge=0)
    is_active: bool = True
    tenant_id: uuid.UUID | None = None


class FarmerCreate(FarmerBase):
    pass


class FarmerUpdate(BaseModel):
    farmer_code: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    father_name: str | None = None
    phone: str | None = None
    village: str | None = None
    taluka: str | None = None
    district: str | None = None
    state: str | None = None
    bank_account_number: str | None = None
    bank_ifsc_code: str | None = None
    total_acreage: Decimal | None = Field(default=None, ge=0)
    is_active: bool | None = None
    tenant_id: uuid.UUID | None = None


class FarmerResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    farmer_code: str
    name: str
    father_name: str | None = None
    phone: str | None = None
    village: str | None = None
    taluka: str | None = None
    district: str | None = None
    state: str | None = None
    bank_account_number: str | None = None
    bank_ifsc_code: str | None = None
    total_acreage: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

