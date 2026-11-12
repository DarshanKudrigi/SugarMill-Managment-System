from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.crud.base import CRUDBase
from sugarmill_erp.models.customer import Customer
from sugarmill_erp.schemas.customer import CustomerCreate, CustomerUpdate


class CRUDCustomer(CRUDBase[Customer, CustomerCreate, CustomerUpdate]):
    async def get_by_code(self, db: AsyncSession, *, code: str) -> Customer | None:
        statement = select(Customer).where(Customer.customer_code == code)
        result = await db.execute(statement)
        return result.scalar_one_or_none()


customer_crud = CRUDCustomer(Customer)

