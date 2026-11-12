import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.core.database import get_db
from sugarmill_erp.crud.customer import customer_crud
from sugarmill_erp.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_in: CustomerCreate,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    existing = await customer_crud.get_by_code(db, code=customer_in.customer_code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Customer with code '{customer_in.customer_code}' already exists.",
        )
    customer = await customer_crud.create(db, obj_in=customer_in)
    return customer


@router.get("/", response_model=list[CustomerResponse])
async def get_all_customers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max number of records to return"),
    db: AsyncSession = Depends(get_db),
) -> list[CustomerResponse]:
    customers = await customer_crud.get_multi(db, skip=skip, limit=limit)
    return customers


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer_by_id(
    customer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    customer = await customer_crud.get(db, id=customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found.",
        )
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: uuid.UUID,
    customer_in: CustomerUpdate,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    customer = await customer_crud.get(db, id=customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found.",
        )
    if customer_in.customer_code and customer_in.customer_code != customer.customer_code:
        existing = await customer_crud.get_by_code(db, code=customer_in.customer_code)
        if existing and existing.id != customer_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Customer with code '{customer_in.customer_code}' already exists.",
            )
    updated_customer = await customer_crud.update(db, db_obj=customer, obj_in=customer_in)
    return updated_customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Response:
    customer = await customer_crud.get(db, id=customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found.",
        )
    await customer_crud.remove(db, id=customer_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

