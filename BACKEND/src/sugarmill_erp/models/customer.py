from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sugarmill_erp.core.database import Base
from sugarmill_erp.models.base import TenantMixin, TimeStampedMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from sugarmill_erp.models.invoice import Invoice


class Customer(Base, UUIDPrimaryKeyMixin, TenantMixin, TimeStampedMixin):
    __tablename__ = "customers"

    customer_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    gst_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    credit_limit: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    invoices: Mapped[list["Invoice"]] = relationship(
        "Invoice", back_populates="customer", passive_deletes=True
    )
