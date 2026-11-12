from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.crud.base import CRUDBase
from sugarmill_erp.models.raw_material_receipt import RawMaterialReceipt
from sugarmill_erp.schemas.raw_material_receipt import (
    RawMaterialReceiptCreate,
    RawMaterialReceiptUpdate,
)


class CRUDRawMaterialReceipt(
    CRUDBase[RawMaterialReceipt, RawMaterialReceiptCreate, RawMaterialReceiptUpdate]
):
    async def get_by_number(self, db: AsyncSession, *, number: str) -> RawMaterialReceipt | None:
        statement = select(RawMaterialReceipt).where(RawMaterialReceipt.receipt_number == number)
        result = await db.execute(statement)
        return result.scalar_one_or_none()


raw_material_receipt_crud = CRUDRawMaterialReceipt(RawMaterialReceipt)

