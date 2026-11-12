import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sugarmill_erp.core.database import Base
from sugarmill_erp.models.base import TenantMixin, TimeStampedMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from sugarmill_erp.models.employee import Employee
    from sugarmill_erp.models.farmer import Farmer


class RawMaterialReceipt(Base, UUIDPrimaryKeyMixin, TenantMixin, TimeStampedMixin):
    __tablename__ = "raw_material_receipts"

    receipt_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("farmers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    weighed_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    receipt_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    vehicle_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    gross_weight: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    tare_weight: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    net_weight: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    cane_variety: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Completed", nullable=False)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="raw_material_receipts")
    weighed_by: Mapped["Employee | None"] = relationship("Employee", back_populates="raw_material_receipts")

