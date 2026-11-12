from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    orig_str = str(exc.orig) if hasattr(exc, "orig") and exc.orig else str(exc)
    orig_lower = orig_str.lower()

    # Foreign key violation or referenced relation on DELETE -> Conflict
    if request.method == "DELETE" and (
        "foreign key" in orig_lower
        or "referenced" in orig_lower
        or "is still referenced" in orig_lower
        or "violates not-null constraint" in orig_lower
    ):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "Cannot delete record because it is referenced by other records."},
        )

    # Foreign key violation on INSERT/UPDATE -> Bad Request
    if "foreign key" in orig_lower:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Referenced entity does not exist or invalid foreign key."},
        )

    # Unique constraint violation -> Conflict
    if "unique constraint" in orig_lower or "duplicate key" in orig_lower:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "Record with this unique field already exists."},
        )

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": f"Database integrity error: {orig_str}"},
    )
