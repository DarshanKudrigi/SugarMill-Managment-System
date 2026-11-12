import uuid
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class EmployeeBase(BaseModel):
    employee_code: str = Field(..., min_length=1, max_length=50, description="Unique code for employee")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    department: str = Field(..., min_length=1, max_length=100)
    designation: str = Field(..., min_length=1, max_length=100)
    hire_date: date | None = None
    salary: Decimal = Field(default=Decimal("0.00"), ge=0)
    is_active: bool = True
    tenant_id: uuid.UUID | None = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    employee_code: str | None = Field(default=None, min_length=1, max_length=50)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = None
    department: str | None = Field(default=None, min_length=1, max_length=100)
    designation: str | None = Field(default=None, min_length=1, max_length=100)
    hire_date: date | None = None
    salary: Decimal | None = Field(default=None, ge=0)
    is_active: bool | None = None
    tenant_id: uuid.UUID | None = None


class EmployeeResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    employee_code: str
    first_name: str
    last_name: str
    email: str | None = None
    phone: str | None = None
    department: str
    designation: str
    hire_date: date | None = None
    salary: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

