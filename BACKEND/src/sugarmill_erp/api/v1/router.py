from fastapi import APIRouter

from sugarmill_erp.api.v1.customers import router as customers_router
from sugarmill_erp.api.v1.employees import router as employees_router
from sugarmill_erp.api.v1.farmers import router as farmers_router
from sugarmill_erp.api.v1.inventory import router as inventory_router
from sugarmill_erp.api.v1.invoices import router as invoices_router
from sugarmill_erp.api.v1.raw_material_receipts import router as raw_material_receipts_router

api_router = APIRouter()

api_router.include_router(customers_router)
api_router.include_router(farmers_router)
api_router.include_router(inventory_router)
api_router.include_router(employees_router)
api_router.include_router(invoices_router)
api_router.include_router(raw_material_receipts_router)

