import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from sugarmill_erp.core.database import get_db
from sugarmill_erp.crud.farmer import farmer_crud
from sugarmill_erp.schemas.farmer import FarmerCreate, FarmerResponse, FarmerUpdate

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.post("/", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
async def create_farmer(
    farmer_in: FarmerCreate,
    db: AsyncSession = Depends(get_db),
) -> FarmerResponse:
    existing = await farmer_crud.get_by_code(db, code=farmer_in.farmer_code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Farmer with code '{farmer_in.farmer_code}' already exists.",
        )
    farmer = await farmer_crud.create(db, obj_in=farmer_in)
    return farmer


@router.get("/", response_model=list[FarmerResponse])
async def get_all_farmers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max number of records to return"),
    db: AsyncSession = Depends(get_db),
) -> list[FarmerResponse]:
    farmers = await farmer_crud.get_multi(db, skip=skip, limit=limit)
    return farmers


@router.get("/{farmer_id}", response_model=FarmerResponse)
async def get_farmer_by_id(
    farmer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> FarmerResponse:
    farmer = await farmer_crud.get(db, id=farmer_id)
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farmer with ID '{farmer_id}' not found.",
        )
    return farmer


@router.put("/{farmer_id}", response_model=FarmerResponse)
async def update_farmer(
    farmer_id: uuid.UUID,
    farmer_in: FarmerUpdate,
    db: AsyncSession = Depends(get_db),
) -> FarmerResponse:
    farmer = await farmer_crud.get(db, id=farmer_id)
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farmer with ID '{farmer_id}' not found.",
        )
    if farmer_in.farmer_code and farmer_in.farmer_code != farmer.farmer_code:
        existing = await farmer_crud.get_by_code(db, code=farmer_in.farmer_code)
        if existing and existing.id != farmer_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Farmer with code '{farmer_in.farmer_code}' already exists.",
            )
    updated_farmer = await farmer_crud.update(db, db_obj=farmer, obj_in=farmer_in)
    return updated_farmer


@router.delete("/{farmer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farmer(
    farmer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Response:
    farmer = await farmer_crud.get(db, id=farmer_id)
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farmer with ID '{farmer_id}' not found.",
        )
    await farmer_crud.remove(db, id=farmer_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

