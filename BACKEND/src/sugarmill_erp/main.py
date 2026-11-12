from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
import uvicorn
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from sugarmill_erp.api.v1.router import api_router
from sugarmill_erp.core.config import settings
from sugarmill_erp.core.database import engine
from sugarmill_erp.core.exceptions import integrity_error_handler


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup: ensure database connection is reachable
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    yield
    # Shutdown: clean up engine pool
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend CRUD API for Sugar Mill ERP - Customers, Farmers, Inventory, Employees, Invoices, and Raw Material Receipts.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Exception handlers
app.add_exception_handler(IntegrityError, integrity_error_handler)

# CORS Middleware - allow all acceptance
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
async def root() -> dict[str, str]:
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
async def health_check() -> dict[str, str]:
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    return {"status": "healthy", "database": "connected"}


def main() -> None:
    uvicorn.run("sugarmill_erp.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()

