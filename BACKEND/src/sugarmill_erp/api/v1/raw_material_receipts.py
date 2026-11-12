import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.core.database import get_db
from sugarmill_erp.crud.employee import employee_crud
from sugarmill_erp.crud.farmer import farmer_crud
from sugarmill_erp.crud.raw_material_receipt import raw_material_receipt_crud
from sugarmill_erp.schemas.raw_material_receipt import (
    RawMaterialReceiptCreate,
    RawMaterialReceiptResponse,
    RawMaterialReceiptUpdate,
)

router = APIRouter(prefix="/raw-material-receipts", tags=["Raw Material Receipts"])


@router.post("/", response_model=RawMaterialReceiptResponse, status_code=status.HTTP_201_CREATED)
async def create_receipt(
    receipt_in: RawMaterialReceiptCreate,
    db: AsyncSession = Depends(get_db),
) -> RawMaterialReceiptResponse:
    existing = await raw_material_receipt_crud.get_by_number(db, number=receipt_in.receipt_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Receipt with number '{receipt_in.receipt_number}' already exists.",
        )
    farmer = await farmer_crud.get(db, id=receipt_in.farmer_id)
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Referenced farmer with ID '{receipt_in.farmer_id}' does not exist.",
        )
    if receipt_in.weighed_by_id:
        employee = await employee_crud.get(db, id=receipt_in.weighed_by_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Referenced employee with ID '{receipt_in.weighed_by_id}' does not exist.",
            )
    receipt = await raw_material_receipt_crud.create(db, obj_in=receipt_in)
    return receipt


@router.get("/", response_model=list[RawMaterialReceiptResponse])
async def get_all_receipts(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max number of records to return"),
    db: AsyncSession = Depends(get_db),
) -> list[RawMaterialReceiptResponse]:
    receipts = await raw_material_receipt_crud.get_multi(db, skip=skip, limit=limit)
    return receipts


@router.get("/{receipt_id}", response_model=RawMaterialReceiptResponse)
async def get_receipt_by_id(
    receipt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> RawMaterialReceiptResponse:
    receipt = await raw_material_receipt_crud.get(db, id=receipt_id)
    if not receipt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receipt with ID '{receipt_id}' not found.",
        )
    return receipt


@router.put("/{receipt_id}", response_model=RawMaterialReceiptResponse)
async def update_receipt(
    receipt_id: uuid.UUID,
    receipt_in: RawMaterialReceiptUpdate,
    db: AsyncSession = Depends(get_db),
) -> RawMaterialReceiptResponse:
    receipt = await raw_material_receipt_crud.get(db, id=receipt_id)
    if not receipt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receipt with ID '{receipt_id}' not found.",
        )
    if receipt_in.receipt_number and receipt_in.receipt_number != receipt.receipt_number:
        existing = await raw_material_receipt_crud.get_by_number(db, number=receipt_in.receipt_number)
        if existing and existing.id != receipt_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Receipt with number '{receipt_in.receipt_number}' already exists.",
            )
    if receipt_in.farmer_id and receipt_in.farmer_id != receipt.farmer_id:
        farmer = await farmer_crud.get(db, id=receipt_in.farmer_id)
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Referenced farmer with ID '{receipt_in.farmer_id}' does not exist.",
            )
    if receipt_in.weighed_by_id and receipt_in.weighed_by_id != receipt.weighed_by_id:
        employee = await employee_crud.get(db, id=receipt_in.weighed_by_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Referenced employee with ID '{receipt_in.weighed_by_id}' does not exist.",
            )
    updated_receipt = await raw_material_receipt_crud.update(db, db_obj=receipt, obj_in=receipt_in)
    return updated_receipt


@router.delete("/{receipt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_receipt(
    receipt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Response:
    receipt = await raw_material_receipt_crud.get(db, id=receipt_id)
    if not receipt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receipt with ID '{receipt_id}' not found.",
        )
    await raw_material_receipt_crud.remove(db, id=receipt_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

