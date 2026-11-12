import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.core.database import get_db
from sugarmill_erp.crud.employee import employee_crud
from sugarmill_erp.schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_in: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
) -> EmployeeResponse:
    existing_code = await employee_crud.get_by_code(db, code=employee_in.employee_code)
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with code '{employee_in.employee_code}' already exists.",
        )
    if employee_in.email:
        existing_email = await employee_crud.get_by_email(db, email=employee_in.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee with email '{employee_in.email}' already exists.",
            )
    employee = await employee_crud.create(db, obj_in=employee_in)
    return employee


@router.get("/", response_model=list[EmployeeResponse])
async def get_all_employees(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max number of records to return"),
    db: AsyncSession = Depends(get_db),
) -> list[EmployeeResponse]:
    employees = await employee_crud.get_multi(db, skip=skip, limit=limit)
    return employees


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee_by_id(
    employee_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> EmployeeResponse:
    employee = await employee_crud.get(db, id=employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found.",
        )
    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: uuid.UUID,
    employee_in: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
) -> EmployeeResponse:
    employee = await employee_crud.get(db, id=employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found.",
        )
    if employee_in.employee_code and employee_in.employee_code != employee.employee_code:
        existing = await employee_crud.get_by_code(db, code=employee_in.employee_code)
        if existing and existing.id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee with code '{employee_in.employee_code}' already exists.",
            )
    if employee_in.email and employee_in.email != employee.email:
        existing = await employee_crud.get_by_email(db, email=employee_in.email)
        if existing and existing.id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee with email '{employee_in.email}' already exists.",
            )
    updated_employee = await employee_crud.update(db, db_obj=employee, obj_in=employee_in)
    return updated_employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Response:
    employee = await employee_crud.get(db, id=employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found.",
        )
    await employee_crud.remove(db, id=employee_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

