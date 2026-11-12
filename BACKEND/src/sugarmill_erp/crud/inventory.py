from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.crud.base import CRUDBase
from sugarmill_erp.models.inventory import InventoryItem
from sugarmill_erp.schemas.inventory import InventoryItemCreate, InventoryItemUpdate


class CRUDInventoryItem(CRUDBase[InventoryItem, InventoryItemCreate, InventoryItemUpdate]):
    async def get_by_code(self, db: AsyncSession, *, code: str) -> InventoryItem | None:
        statement = select(InventoryItem).where(InventoryItem.item_code == code)
        result = await db.execute(statement)
        return result.scalar_one_or_none()


inventory_crud = CRUDInventoryItem(InventoryItem)

