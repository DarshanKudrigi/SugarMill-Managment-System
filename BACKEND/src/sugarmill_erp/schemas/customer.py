import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class CustomerBase(BaseModel):
    customer_code: str = Field(..., min_length=1, max_length=50, description="Unique code for customer")
    name: str = Field(..., min_length=1, max_length=255, description="Customer company or individual name")
    contact_person: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=500)
    gst_number: str | None = Field(default=None, max_length=50)
    credit_limit: Decimal = Field(default=Decimal("0.00"), ge=0)
    is_active: bool = True
    tenant_id: uuid.UUID | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    customer_code: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    gst_number: str | None = None
    credit_limit: Decimal | None = Field(default=None, ge=0)
    is_active: bool | None = None
    tenant_id: uuid.UUID | None = None


class CustomerResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_code: str
    name: str
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    gst_number: str | None = None
    credit_limit: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

