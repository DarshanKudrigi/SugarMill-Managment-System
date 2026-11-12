import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class RawMaterialReceiptBase(BaseModel):
    receipt_number: str = Field(..., min_length=1, max_length=50, description="Unique receipt/ticket number")
    farmer_id: uuid.UUID = Field(..., description="ID of the farmer delivering raw material")
    weighed_by_id: uuid.UUID | None = Field(default=None, description="Employee ID who recorded the weighment")
    receipt_date: datetime | None = None
    vehicle_number: str | None = Field(default=None, max_length=50)
    gross_weight: Decimal = Field(..., ge=0, description="Gross weighbridge weight")
    tare_weight: Decimal = Field(..., ge=0, description="Empty vehicle tare weight")
    net_weight: Decimal = Field(..., ge=0, description="Net weight of delivered cane")
    cane_variety: str | None = Field(default=None, max_length=100)
    status: str = Field(default="Completed", max_length=50)
    remarks: str | None = None
    tenant_id: uuid.UUID | None = None


class RawMaterialReceiptCreate(RawMaterialReceiptBase):
    pass


class RawMaterialReceiptUpdate(BaseModel):
    receipt_number: str | None = Field(default=None, min_length=1, max_length=50)
    farmer_id: uuid.UUID | None = None
    weighed_by_id: uuid.UUID | None = None
    receipt_date: datetime | None = None
    vehicle_number: str | None = None
    gross_weight: Decimal | None = Field(default=None, ge=0)
    tare_weight: Decimal | None = Field(default=None, ge=0)
    net_weight: Decimal | None = Field(default=None, ge=0)
    cane_variety: str | None = None
    status: str | None = Field(default=None, max_length=50)
    remarks: str | None = None
    tenant_id: uuid.UUID | None = None


class RawMaterialReceiptResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    receipt_number: str
    farmer_id: uuid.UUID
    weighed_by_id: uuid.UUID | None = None
    receipt_date: datetime
    vehicle_number: str | None = None
    gross_weight: Decimal
    tare_weight: Decimal
    net_weight: Decimal
    cane_variety: str | None = None
    status: str
    remarks: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

