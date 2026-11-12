from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.crud.base import CRUDBase
from sugarmill_erp.models.invoice import Invoice
from sugarmill_erp.schemas.invoice import InvoiceCreate, InvoiceUpdate


class CRUDInvoice(CRUDBase[Invoice, InvoiceCreate, InvoiceUpdate]):
    async def get_by_number(self, db: AsyncSession, *, number: str) -> Invoice | None:
        statement = select(Invoice).where(Invoice.invoice_number == number)
        result = await db.execute(statement)
        return result.scalar_one_or_none()


invoice_crud = CRUDInvoice(Invoice)

