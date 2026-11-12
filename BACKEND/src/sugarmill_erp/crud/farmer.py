from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.crud.base import CRUDBase
from sugarmill_erp.models.farmer import Farmer
from sugarmill_erp.schemas.farmer import FarmerCreate, FarmerUpdate


class CRUDFarmer(CRUDBase[Farmer, FarmerCreate, FarmerUpdate]):
    async def get_by_code(self, db: AsyncSession, *, code: str) -> Farmer | None:
        statement = select(Farmer).where(Farmer.farmer_code == code)
        result = await db.execute(statement)
        return result.scalar_one_or_none()


farmer_crud = CRUDFarmer(Farmer)

