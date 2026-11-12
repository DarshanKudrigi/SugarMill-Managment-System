from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.crud.base import CRUDBase
from sugarmill_erp.models.employee import Employee
from sugarmill_erp.schemas.employee import EmployeeCreate, EmployeeUpdate


class CRUDEmployee(CRUDBase[Employee, EmployeeCreate, EmployeeUpdate]):
    async def get_by_code(self, db: AsyncSession, *, code: str) -> Employee | None:
        statement = select(Employee).where(Employee.employee_code == code)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Employee | None:
        statement = select(Employee).where(Employee.email == email)
        result = await db.execute(statement)
        return result.scalar_one_or_none()


employee_crud = CRUDEmployee(Employee)

