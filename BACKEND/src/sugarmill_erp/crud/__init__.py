from sugarmill_erp.crud.base import CRUDBase
from sugarmill_erp.crud.customer import customer_crud
from sugarmill_erp.crud.employee import employee_crud
from sugarmill_erp.crud.farmer import farmer_crud
from sugarmill_erp.crud.inventory import inventory_crud
from sugarmill_erp.crud.invoice import invoice_crud
from sugarmill_erp.crud.raw_material_receipt import raw_material_receipt_crud

__all__ = [
    "CRUDBase",
    "customer_crud",
    "farmer_crud",
    "inventory_crud",
    "employee_crud",
    "invoice_crud",
    "raw_material_receipt_crud",
]

