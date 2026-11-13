import asyncio
import sys
import uuid
from decimal import Decimal
from httpx import ASGITransport, AsyncClient

from sugarmill_erp.main import app


async def run_tests() -> None:
    run_id = uuid.uuid4().hex[:8].upper()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("\n=== Testing Root and Health Endpoints ===")
        res = await client.get("/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        print(" [PASS] GET / -> 200 OK")

        res = await client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        assert res.json()["database"] == "connected"
        print(" [PASS] GET /health -> 200 OK (database connected)")

        # ---------------------------------------------------------
        # 1. CUSTOMERS CRUD
        # ---------------------------------------------------------
        print("\n=== Testing 1. Customers CRUD ===")
        cust_payload = {
            "customer_code": f"CUST-{run_id}",
            "name": "Shree Ganesh Sugar Traders",
            "contact_person": "Ramesh Patil",
            "email": "ramesh@ganeshsugar.com",
            "phone": "+91 9876543210",
            "address": "Market Yard, Pune, Maharashtra",
            "gst_number": "27AAACG0000A1Z5",
            "credit_limit": "500000.00",
            "is_active": True,
        }
        # Create
        res = await client.post("/api/v1/customers/", json=cust_payload)
        assert res.status_code == 201, f"Customer create failed: {res.text}"
        cust_data = res.json()
        cust_id = cust_data["id"]
        assert cust_data["customer_code"] == f"CUST-{run_id}"
        assert cust_data["name"] == "Shree Ganesh Sugar Traders"
        print(f" [PASS] POST /api/v1/customers/ -> 201 Created (ID: {cust_id})")

        # Duplicate create -> 409
        res = await client.post("/api/v1/customers/", json=cust_payload)
        assert res.status_code == 409, f"Customer duplicate should return 409: {res.status_code}"
        print(" [PASS] POST /api/v1/customers/ (duplicate code) -> 409 Conflict")

        # Invalid payload -> 422
        res = await client.post("/api/v1/customers/", json={"email": "invalid"})
        assert res.status_code == 422, f"Customer invalid payload should return 422: {res.status_code}"
        print(" [PASS] POST /api/v1/customers/ (invalid payload) -> 422 Unprocessable Entity")

        # Get all
        res = await client.get("/api/v1/customers/?skip=0&limit=10")
        assert res.status_code == 200
        assert len(res.json()) >= 1
        print(f" [PASS] GET /api/v1/customers/ -> 200 OK (returned {len(res.json())} items)")

        # Get by ID
        res = await client.get(f"/api/v1/customers/{cust_id}")
        assert res.status_code == 200
        assert res.json()["id"] == cust_id
        print(f" [PASS] GET /api/v1/customers/{cust_id} -> 200 OK")

        # Get non-existent ID -> 404
        fake_id = str(uuid.uuid4())
        res = await client.get(f"/api/v1/customers/{fake_id}")
        assert res.status_code == 404
        print(" [PASS] GET /api/v1/customers/{non-existent-id} -> 404 Not Found")

        # Update
        update_payload = {"contact_person": "Suresh Patil", "credit_limit": "750000.00"}
        res = await client.put(f"/api/v1/customers/{cust_id}", json=update_payload)
        assert res.status_code == 200
        assert res.json()["contact_person"] == "Suresh Patil"
        assert Decimal(res.json()["credit_limit"]) == Decimal("750000.00")
        print(f" [PASS] PUT /api/v1/customers/{cust_id} -> 200 OK")

        # ---------------------------------------------------------
        # 2. FARMERS CRUD
        # ---------------------------------------------------------
        print("\n=== Testing 2. Farmers CRUD ===")
        farmer_payload = {
            "farmer_code": f"FARM-{run_id}",
            "name": "Balu Vithoba Shinde",
            "father_name": "Vithoba Shinde",
            "phone": "+91 9922110033",
            "village": "Sangamner",
            "taluka": "Sangamner",
            "district": "Ahmednagar",
            "state": "Maharashtra",
            "bank_account_number": "123456789012",
            "bank_ifsc_code": "SBIN0001234",
            "total_acreage": "15.50",
            "is_active": True,
        }
        res = await client.post("/api/v1/farmers/", json=farmer_payload)
        assert res.status_code == 201, f"Farmer create failed: {res.text}"
        farmer_data = res.json()
        farmer_id = farmer_data["id"]
        print(f" [PASS] POST /api/v1/farmers/ -> 201 Created (ID: {farmer_id})")

        # Duplicate
        res = await client.post("/api/v1/farmers/", json=farmer_payload)
        assert res.status_code == 409
        print(" [PASS] POST /api/v1/farmers/ (duplicate code) -> 409 Conflict")

        # Get all
        res = await client.get("/api/v1/farmers/")
        assert res.status_code == 200
        assert len(res.json()) >= 1
        print(f" [PASS] GET /api/v1/farmers/ -> 200 OK")

        # Get by ID
        res = await client.get(f"/api/v1/farmers/{farmer_id}")
        assert res.status_code == 200
        assert res.json()["name"] == "Balu Vithoba Shinde"
        print(f" [PASS] GET /api/v1/farmers/{farmer_id} -> 200 OK")

        # Update
        res = await client.put(f"/api/v1/farmers/{farmer_id}", json={"total_acreage": "18.00"})
        assert res.status_code == 200
        assert Decimal(res.json()["total_acreage"]) == Decimal("18.00")
        print(f" [PASS] PUT /api/v1/farmers/{farmer_id} -> 200 OK")

        # ---------------------------------------------------------
        # 3. INVENTORY ITEMS CRUD
        # ---------------------------------------------------------
        print("\n=== Testing 3. Inventory Items CRUD ===")
        item_payload = {
            "item_code": f"ITEM-{run_id}",
            "name": "Refined Sugar Grade M-30",
            "category": "Finished Goods",
            "unit_of_measure": "Quintals",
            "current_stock": "5000.00",
            "minimum_stock_level": "500.00",
            "unit_price": "3650.00",
            "description": "Standard plantation white crystal sugar M-30 grade",
            "is_active": True,
        }
        res = await client.post("/api/v1/inventory/", json=item_payload)
        assert res.status_code == 201, f"Inventory create failed: {res.text}"
        item_data = res.json()
        item_id = item_data["id"]
        print(f" [PASS] POST /api/v1/inventory/ -> 201 Created (ID: {item_id})")

        # Duplicate
        res = await client.post("/api/v1/inventory/", json=item_payload)
        assert res.status_code == 409
        print(" [PASS] POST /api/v1/inventory/ (duplicate code) -> 409 Conflict")

        # Get all
        res = await client.get("/api/v1/inventory/")
        assert res.status_code == 200
        print(f" [PASS] GET /api/v1/inventory/ -> 200 OK")

        # Get by ID
        res = await client.get(f"/api/v1/inventory/{item_id}")
        assert res.status_code == 200
        print(f" [PASS] GET /api/v1/inventory/{item_id} -> 200 OK")

        # Update
        res = await client.put(f"/api/v1/inventory/{item_id}", json={"unit_price": "3700.00"})
        assert res.status_code == 200
        assert Decimal(res.json()["unit_price"]) == Decimal("3700.00")
        print(f" [PASS] PUT /api/v1/inventory/{item_id} -> 200 OK")

        # Delete
        res = await client.delete(f"/api/v1/inventory/{item_id}")
        assert res.status_code == 204
        print(f" [PASS] DELETE /api/v1/inventory/{item_id} -> 204 No Content")

        # Verify deleted
        res = await client.get(f"/api/v1/inventory/{item_id}")
        assert res.status_code == 404
        print(f" [PASS] GET /api/v1/inventory/{item_id} (after delete) -> 404 Not Found")

        # ---------------------------------------------------------
        # 4. EMPLOYEES CRUD
        # ---------------------------------------------------------
        print("\n=== Testing 4. Employees CRUD ===")
        emp_payload = {
            "employee_code": f"EMP-{run_id}",
            "first_name": "Anil",
            "last_name": "Kadam",
            "email": "anil.kadam@sugarmill.internal",
            "phone": "+91 9123456789",
            "department": "Weighbridge Operations",
            "designation": "Chief Weighbridge Officer",
            "hire_date": "2024-01-15",
            "salary": "45000.00",
            "is_active": True,
        }
        res = await client.post("/api/v1/employees/", json=emp_payload)
        assert res.status_code == 201, f"Employee create failed: {res.text}"
        emp_data = res.json()
        emp_id = emp_data["id"]
        print(f" [PASS] POST /api/v1/employees/ -> 201 Created (ID: {emp_id})")

        # Duplicate employee_code -> 409
        res = await client.post("/api/v1/employees/", json=emp_payload)
        assert res.status_code == 409
        print(" [PASS] POST /api/v1/employees/ (duplicate code) -> 409 Conflict")

        # Get all
        res = await client.get("/api/v1/employees/")
        assert res.status_code == 200
        print(f" [PASS] GET /api/v1/employees/ -> 200 OK")

        # Get by ID
        res = await client.get(f"/api/v1/employees/{emp_id}")
        assert res.status_code == 200
        assert res.json()["first_name"] == "Anil"
        print(f" [PASS] GET /api/v1/employees/{emp_id} -> 200 OK")

        # Update
        res = await client.put(f"/api/v1/employees/{emp_id}", json={"salary": "50000.00"})
        assert res.status_code == 200
        assert Decimal(res.json()["salary"]) == Decimal("50000.00")
        print(f" [PASS] PUT /api/v1/employees/{emp_id} -> 200 OK")

        # ---------------------------------------------------------
        # 5. INVOICES CRUD & FOREIGN KEY CONSTRAINTS
        # ---------------------------------------------------------
        print("\n=== Testing 5. Invoices CRUD & Foreign Key Integrity ===")
        # Invalid customer_id -> 400
        invalid_inv_payload = {
            "invoice_number": f"INV-{run_id}",
            "customer_id": str(uuid.uuid4()),
            "invoice_date": "2026-11-12",
            "total_amount": "182500.00",
            "tax_amount": "9125.00",
            "net_amount": "191625.00",
            "status": "Issued",
        }
        res = await client.post("/api/v1/invoices/", json=invalid_inv_payload)
        assert res.status_code == 400, f"Expected 400 for invalid customer: {res.status_code}"
        print(" [PASS] POST /api/v1/invoices/ (invalid customer_id) -> 400 Bad Request")

        # Valid create
        valid_inv_payload = {
            "invoice_number": "INV-2026-0001",
            "customer_id": cust_id,
            "invoice_date": "2026-11-12",
            "due_date": "2026-11-26",
            "total_amount": "182500.00",
            "tax_amount": "9125.00",
            "net_amount": "191625.00",
            "status": "Issued",
            "notes": "50 Quintals Sugar Grade M-30",
        }
        res = await client.post("/api/v1/invoices/", json=valid_inv_payload)
        assert res.status_code == 201, f"Invoice create failed: {res.text}"
        inv_data = res.json()
        inv_id = inv_data["id"]
        print(f" [PASS] POST /api/v1/invoices/ -> 201 Created (ID: {inv_id})")

        # Duplicate invoice number
        res = await client.post("/api/v1/invoices/", json=valid_inv_payload)
        assert res.status_code == 409
        print(" [PASS] POST /api/v1/invoices/ (duplicate number) -> 409 Conflict")

        # Get all
        res = await client.get("/api/v1/invoices/")
        assert res.status_code == 200
        print(" [PASS] GET /api/v1/invoices/ -> 200 OK")

        # Get by ID
        res = await client.get(f"/api/v1/invoices/{inv_id}")
        assert res.status_code == 200
        assert res.json()["invoice_number"] == "INV-2026-0001"
        print(f" [PASS] GET /api/v1/invoices/{inv_id} -> 200 OK")

        # Update
        res = await client.put(f"/api/v1/invoices/{inv_id}", json={"status": "Paid"})
        assert res.status_code == 200
        assert res.json()["status"] == "Paid"
        print(f" [PASS] PUT /api/v1/invoices/{inv_id} -> 200 OK")

        # Try to delete referenced Customer -> Must fail with 409 Conflict!
        res = await client.delete(f"/api/v1/customers/{cust_id}")
        assert res.status_code == 409, f"Deleting referenced customer should return 409, got {res.status_code}"
        print(f" [PASS] DELETE /api/v1/customers/{cust_id} (referenced by invoice) -> 409 Conflict (Blocked by FK constraint)")

        # Delete invoice
        res = await client.delete(f"/api/v1/invoices/{inv_id}")
        assert res.status_code == 204
        print(f" [PASS] DELETE /api/v1/invoices/{inv_id} -> 204 No Content")

        # Now delete customer succeeds
        res = await client.delete(f"/api/v1/customers/{cust_id}")
        assert res.status_code == 204
        print(f" [PASS] DELETE /api/v1/customers/{cust_id} (unreferenced) -> 204 No Content")

        # ---------------------------------------------------------
        # 6. RAW MATERIAL RECEIPTS CRUD & FOREIGN KEY INTEGRITY
        # ---------------------------------------------------------
        print("\n=== Testing 6. Raw Material Receipts CRUD & Foreign Key Integrity ===")
        # Invalid farmer_id -> 400
        invalid_receipt_payload = {
            "receipt_number": f"RMR-{run_id}",
            "farmer_id": str(uuid.uuid4()),
            "weighed_by_id": emp_id,
            "vehicle_number": "MH-12-AB-1234",
            "gross_weight": "125.50",
            "tare_weight": "25.50",
            "net_weight": "100.00",
            "cane_variety": "Co 86032",
        }
        res = await client.post("/api/v1/raw-material-receipts/", json=invalid_receipt_payload)
        assert res.status_code == 400
        print(" [PASS] POST /api/v1/raw-material-receipts/ (invalid farmer_id) -> 400 Bad Request")

        # Valid create
        valid_receipt_payload = {
            "receipt_number": "RMR-2026-0001",
            "farmer_id": farmer_id,
            "weighed_by_id": emp_id,
            "vehicle_number": "MH-12-AB-1234",
            "gross_weight": "125.50",
            "tare_weight": "25.50",
            "net_weight": "100.00",
            "cane_variety": "Co 86032",
            "status": "Completed",
            "remarks": "Clean mature cane delivered",
        }
        res = await client.post("/api/v1/raw-material-receipts/", json=valid_receipt_payload)
        assert res.status_code == 201, f"Receipt create failed: {res.text}"
        receipt_data = res.json()
        receipt_id = receipt_data["id"]
        print(f" [PASS] POST /api/v1/raw-material-receipts/ -> 201 Created (ID: {receipt_id})")

        # Duplicate receipt number
        res = await client.post("/api/v1/raw-material-receipts/", json=valid_receipt_payload)
        assert res.status_code == 409
        print(" [PASS] POST /api/v1/raw-material-receipts/ (duplicate number) -> 409 Conflict")

        # Get all
        res = await client.get("/api/v1/raw-material-receipts/")
        assert res.status_code == 200
        print(" [PASS] GET /api/v1/raw-material-receipts/ -> 200 OK")

        # Get by ID
        res = await client.get(f"/api/v1/raw-material-receipts/{receipt_id}")
        assert res.status_code == 200
        assert res.json()["receipt_number"] == "RMR-2026-0001"
        print(f" [PASS] GET /api/v1/raw-material-receipts/{receipt_id} -> 200 OK")

        # Update
        res = await client.put(f"/api/v1/raw-material-receipts/{receipt_id}", json={"remarks": "Checked and approved"})
        assert res.status_code == 200
        assert res.json()["remarks"] == "Checked and approved"
        print(f" [PASS] PUT /api/v1/raw-material-receipts/{receipt_id} -> 200 OK")

        # Try to delete referenced Farmer -> Must fail with 409 Conflict!
        res = await client.delete(f"/api/v1/farmers/{farmer_id}")
        assert res.status_code == 409
        print(f" [PASS] DELETE /api/v1/farmers/{farmer_id} (referenced by receipt) -> 409 Conflict (Blocked by FK constraint)")

        # Try to delete referenced Employee -> Must fail with 409 Conflict!
        res = await client.delete(f"/api/v1/employees/{emp_id}")
        assert res.status_code == 409
        print(f" [PASS] DELETE /api/v1/employees/{emp_id} (referenced by receipt) -> 409 Conflict (Blocked by FK constraint)")

        # Delete receipt
        res = await client.delete(f"/api/v1/raw-material-receipts/{receipt_id}")
        assert res.status_code == 204
        print(f" [PASS] DELETE /api/v1/raw-material-receipts/{receipt_id} -> 204 No Content")

        # Now deleting farmer succeeds
        res = await client.delete(f"/api/v1/farmers/{farmer_id}")
        assert res.status_code == 204
        print(f" [PASS] DELETE /api/v1/farmers/{farmer_id} (unreferenced) -> 204 No Content")

        # Now deleting employee succeeds
        res = await client.delete(f"/api/v1/employees/{emp_id}")
        assert res.status_code == 204
        print(f" [PASS] DELETE /api/v1/employees/{emp_id} (unreferenced) -> 204 No Content")

        print("\n==================================================")
        print("  ALL CRUD AND CONSTRAINT VERIFICATION TESTS PASSED! ")
        print("==================================================\n")


if __name__ == "__main__":
    asyncio.run(run_tests())

