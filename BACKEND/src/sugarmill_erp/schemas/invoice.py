import uuid
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class InvoiceBase(BaseModel):
    invoice_number: str = Field(..., min_length=1, max_length=50, description="Unique invoice number")
    customer_id: uuid.UUID = Field(..., description="ID of the customer being billed")
    invoice_date: date
    due_date: date | None = None
    total_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    tax_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    net_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    paid_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    status: str = Field(default="Draft", max_length=50)
    notes: str | None = None
    tenant_id: uuid.UUID | None = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    invoice_number: str | None = Field(default=None, min_length=1, max_length=50)
    customer_id: uuid.UUID | None = None
    invoice_date: date | None = None
    due_date: date | None = None
    total_amount: Decimal | None = Field(default=None, ge=0)
    tax_amount: Decimal | None = Field(default=None, ge=0)
    net_amount: Decimal | None = Field(default=None, ge=0)
    paid_amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = Field(default=None, max_length=50)
    notes: str | None = None
    tenant_id: uuid.UUID | None = None


class InvoiceResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    invoice_number: str
    customer_id: uuid.UUID
    invoice_date: date
    due_date: date | None = None
    total_amount: Decimal
    tax_amount: Decimal
    net_amount: Decimal
    paid_amount: Decimal
    status: str
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

