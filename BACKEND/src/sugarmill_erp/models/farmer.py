from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sugarmill_erp.core.database import Base
from sugarmill_erp.models.base import TenantMixin, TimeStampedMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from sugarmill_erp.models.raw_material_receipt import RawMaterialReceipt


class Farmer(Base, UUIDPrimaryKeyMixin, TenantMixin, TimeStampedMixin):
    __tablename__ = "farmers"

    farmer_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    father_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    village: Mapped[str | None] = mapped_column(String(255), nullable=True)
    taluka: Mapped[str | None] = mapped_column(String(255), nullable=True)
    district: Mapped[str | None] = mapped_column(String(255), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bank_account_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    bank_ifsc_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    total_acreage: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    raw_material_receipts: Mapped[list["RawMaterialReceipt"]] = relationship(
        "RawMaterialReceipt", back_populates="farmer", passive_deletes=True
    )
