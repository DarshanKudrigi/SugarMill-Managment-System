import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.core.database import get_db
from sugarmill_erp.crud.customer import customer_crud
from sugarmill_erp.crud.invoice import invoice_crud
from sugarmill_erp.schemas.invoice import InvoiceCreate, InvoiceResponse, InvoiceUpdate

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_in: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
) -> InvoiceResponse:
    existing = await invoice_crud.get_by_number(db, number=invoice_in.invoice_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Invoice with number '{invoice_in.invoice_number}' already exists.",
        )
    customer = await customer_crud.get(db, id=invoice_in.customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Referenced customer with ID '{invoice_in.customer_id}' does not exist.",
        )
    invoice = await invoice_crud.create(db, obj_in=invoice_in)
    return invoice


@router.get("/", response_model=list[InvoiceResponse])
async def get_all_invoices(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max number of records to return"),
    db: AsyncSession = Depends(get_db),
) -> list[InvoiceResponse]:
    invoices = await invoice_crud.get_multi(db, skip=skip, limit=limit)
    return invoices


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice_by_id(
    invoice_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> InvoiceResponse:
    invoice = await invoice_crud.get(db, id=invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID '{invoice_id}' not found.",
        )
    return invoice


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: uuid.UUID,
    invoice_in: InvoiceUpdate,
    db: AsyncSession = Depends(get_db),
) -> InvoiceResponse:
    invoice = await invoice_crud.get(db, id=invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID '{invoice_id}' not found.",
        )
    if invoice_in.invoice_number and invoice_in.invoice_number != invoice.invoice_number:
        existing = await invoice_crud.get_by_number(db, number=invoice_in.invoice_number)
        if existing and existing.id != invoice_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Invoice with number '{invoice_in.invoice_number}' already exists.",
            )
    if invoice_in.customer_id and invoice_in.customer_id != invoice.customer_id:
        customer = await customer_crud.get(db, id=invoice_in.customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Referenced customer with ID '{invoice_in.customer_id}' does not exist.",
            )
    updated_invoice = await invoice_crud.update(db, db_obj=invoice, obj_in=invoice_in)
    return updated_invoice


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Response:
    invoice = await invoice_crud.get(db, id=invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID '{invoice_id}' not found.",
        )
    await invoice_crud.remove(db, id=invoice_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

