import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class InventoryItemBase(BaseModel):
    item_code: str = Field(..., min_length=1, max_length=50, description="Unique code for inventory item")
    name: str = Field(..., min_length=1, max_length=255, description="Item name")
    category: str = Field(..., min_length=1, max_length=100, description="Category (e.g., Finished Goods, Sugar, Molasses)")
    unit_of_measure: str = Field(..., min_length=1, max_length=50, description="UOM (e.g., MT, Quintals, Bags)")
    current_stock: Decimal = Field(default=Decimal("0.00"), ge=0)
    minimum_stock_level: Decimal = Field(default=Decimal("0.00"), ge=0)
    unit_price: Decimal = Field(default=Decimal("0.00"), ge=0)
    description: str | None = None
    is_active: bool = True
    tenant_id: uuid.UUID | None = None


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    item_code: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    unit_of_measure: str | None = Field(default=None, min_length=1, max_length=50)
    current_stock: Decimal | None = Field(default=None, ge=0)
    minimum_stock_level: Decimal | None = Field(default=None, ge=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    description: str | None = None
    is_active: bool | None = None
    tenant_id: uuid.UUID | None = None


class InventoryItemResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    item_code: str
    name: str
    category: str
    unit_of_measure: str
    current_stock: Decimal
    minimum_stock_level: Decimal
    unit_price: Decimal
    description: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockAdjustmentCreate(BaseModel):
    item_id: uuid.UUID = Field(..., description="ID of the inventory item to adjust")
    quantity: Decimal = Field(..., description="Positive to add stock, negative to deduct")
    reason: str = Field(..., min_length=3, description="Mandatory reason for adjustment")
    adjusted_by: str = Field(default="Admin User", max_length=255)

    @field_validator("quantity")
    @classmethod
    def quantity_nonzero(cls, v: Decimal) -> Decimal:
        if v == 0:
            raise ValueError("Adjustment quantity cannot be zero.")
        return v


class StockAdjustmentResponse(BaseModel):
    id: uuid.UUID
    item_id: uuid.UUID
    item_name: str | None = None
    quantity: Decimal
    reason: str
    adjusted_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


