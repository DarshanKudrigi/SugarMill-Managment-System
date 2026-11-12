import asyncio
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sugarmill_erp.core.config import settings
from sugarmill_erp.models.farmer import Farmer
from sugarmill_erp.models.customer import Customer
from sugarmill_erp.models.inventory import InventoryItem
from sugarmill_erp.models.employee import Employee
from sugarmill_erp.models.invoice import Invoice
from sugarmill_erp.models.raw_material_receipt import RawMaterialReceipt
from sqlalchemy import select


async def seed():
    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        # Check if already seeded
        res = await session.execute(select(Farmer))
        if res.scalars().first():
            print("Database already contains data, skipping seed.")
            await engine.dispose()
            return

        print("Seeding initial data...")
        tenant_id = uuid.uuid4()

        # Farmers
        farmers = [
            Farmer(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                farmer_code="FAR-001",
                name="Bharat Singh",
                phone="9876543210",
                village="Rampur",
                taluka="Rampur",
                district="Sitapur",
                state="Uttar Pradesh",
                total_acreage=Decimal("25.50"),
                is_active=True,
            ),
            Farmer(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                farmer_code="FAR-002",
                name="Sukhdev Patel",
                phone="9812345678",
                village="Sitapur",
                taluka="Maholi",
                district="Sitapur",
                state="Uttar Pradesh",
                total_acreage=Decimal("40.00"),
                is_active=True,
            ),
            Farmer(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                farmer_code="FAR-003",
                name="Rajan Yadav",
                phone="9898989898",
                village="Lucknow",
                taluka="Bakshi Ka Talab",
                district="Lucknow",
                state="Uttar Pradesh",
                total_acreage=Decimal("18.25"),
                is_active=True,
            ),
            Farmer(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                farmer_code="FAR-004",
                name="Madan Lal",
                phone="9765432109",
                village="Barabanki",
                taluka="Fatehpur",
                district="Barabanki",
                state="Uttar Pradesh",
                total_acreage=Decimal("35.00"),
                is_active=True,
            ),
            Farmer(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                farmer_code="FAR-005",
                name="Vinod Kumar",
                phone="9654321098",
                village="Hardoi",
                taluka="Sandila",
                district="Hardoi",
                state="Uttar Pradesh",
                total_acreage=Decimal("22.00"),
                is_active=True,
            ),
        ]
        session.add_all(farmers)

        # Customers
        customers = [
            Customer(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                customer_code="CUST-001",
                name="Ramesh Traders",
                contact_person="Ramesh Gupta",
                email="ramesh@traders.com",
                phone="9876501234",
                address="Kanpur, Uttar Pradesh",
                gst_number="09AAAAA0000A1Z5",
                credit_limit=Decimal("500000.00"),
                is_active=True,
            ),
            Customer(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                customer_code="CUST-002",
                name="Suresh Wholesale",
                contact_person="Suresh Sharma",
                email="suresh@wholesale.com",
                phone="9765012345",
                address="Lucknow, Uttar Pradesh",
                gst_number="09BBBBB1111B1Z6",
                credit_limit=Decimal("1000000.00"),
                is_active=True,
            ),
            Customer(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                customer_code="CUST-003",
                name="Dinesh Sweets",
                contact_person="Dinesh Agarwal",
                email="dinesh@sweets.com",
                phone="9654023456",
                address="Agra, Uttar Pradesh",
                gst_number="09CCCCC2222C1Z7",
                credit_limit=Decimal("300000.00"),
                is_active=True,
            ),
            Customer(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                customer_code="CUST-004",
                name="Priya Distributors",
                contact_person="Priya Verma",
                email="priya@distributors.com",
                phone="9543034567",
                address="Varanasi, Uttar Pradesh",
                gst_number="09DDDDD3333D1Z8",
                credit_limit=Decimal("750000.00"),
                is_active=True,
            ),
        ]
        session.add_all(customers)

        # Inventory Items
        items = [
            InventoryItem(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                item_code="CH-001",
                name="Sulfur Powder",
                category="Chemicals",
                unit_of_measure="kg",
                current_stock=Decimal("12.00"),
                minimum_stock_level=Decimal("50.00"),
                unit_price=Decimal("45.00"),
                description="Refining chemical",
                is_active=True,
            ),
            InventoryItem(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                item_code="SP-002",
                name="Filter Press Cloth",
                category="Spare Parts",
                unit_of_measure="pcs",
                current_stock=Decimal("3.00"),
                minimum_stock_level=Decimal("10.00"),
                unit_price=Decimal("1200.00"),
                description="Filtration cloth",
                is_active=True,
            ),
            InventoryItem(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                item_code="CH-003",
                name="Lime Stone",
                category="Chemicals",
                unit_of_measure="kg",
                current_stock=Decimal("180.00"),
                minimum_stock_level=Decimal("500.00"),
                unit_price=Decimal("8.50"),
                description="Juice clarification agent",
                is_active=True,
            ),
            InventoryItem(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                item_code="FG-001",
                name="Raw Sugar (M-30)",
                category="Finished Goods",
                unit_of_measure="quintal",
                current_stock=Decimal("850.00"),
                minimum_stock_level=Decimal("100.00"),
                unit_price=Decimal("3800.00"),
                description="Grade M-30 crystal sugar",
                is_active=True,
            ),
            InventoryItem(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                item_code="FG-002",
                name="Molasses",
                category="Finished Goods",
                unit_of_measure="MT",
                current_stock=Decimal("65.00"),
                minimum_stock_level=Decimal("20.00"),
                unit_price=Decimal("6500.00"),
                description="By-product molasses",
                is_active=True,
            ),
            InventoryItem(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                item_code="CH-004",
                name="Phosphoric Acid",
                category="Chemicals",
                unit_of_measure="ltr",
                current_stock=Decimal("240.00"),
                minimum_stock_level=Decimal("100.00"),
                unit_price=Decimal("95.00"),
                description="Clarification catalyst",
                is_active=True,
            ),
            InventoryItem(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                item_code="SP-003",
                name="V-Belt Set",
                category="Spare Parts",
                unit_of_measure="set",
                current_stock=Decimal("8.00"),
                minimum_stock_level=Decimal("5.00"),
                unit_price=Decimal("2400.00"),
                description="Cane crusher drive belts",
                is_active=True,
            ),
        ]
        session.add_all(items)

        # Employees
        employees = [
            Employee(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                employee_code="EMP-001",
                first_name="Ravi",
                last_name="Kumar",
                email="ravi.kumar@sugarmill.com",
                phone="9811122233",
                department="Production",
                designation="Operator",
                hire_date=date(2023, 1, 15),
                salary=Decimal("28000.00"),
                is_active=True,
            ),
            Employee(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                employee_code="EMP-002",
                first_name="Sunil",
                last_name="Sharma",
                email="sunil.sharma@sugarmill.com",
                phone="9822233344",
                department="Maintenance",
                designation="Technician",
                hire_date=date(2022, 6, 1),
                salary=Decimal("32000.00"),
                is_active=True,
            ),
            Employee(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                employee_code="EMP-003",
                first_name="Anita",
                last_name="Verma",
                email="anita.verma@sugarmill.com",
                phone="9833344455",
                department="Accounts",
                designation="Accountant",
                hire_date=date(2021, 3, 10),
                salary=Decimal("45000.00"),
                is_active=True,
            ),
            Employee(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                employee_code="EMP-004",
                first_name="Rajesh",
                last_name="Patel",
                email="rajesh.patel@sugarmill.com",
                phone="9844455566",
                department="Production",
                designation="Shift Supervisor",
                hire_date=date(2020, 11, 20),
                salary=Decimal("50000.00"),
                is_active=True,
            ),
            Employee(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                employee_code="EMP-005",
                first_name="Amit",
                last_name="Singh",
                email="amit.singh@sugarmill.com",
                phone="9855566677",
                department="Logistics",
                designation="Weighbridge Officer",
                hire_date=date(2023, 8, 5),
                salary=Decimal("30000.00"),
                is_active=True,
            ),
        ]
        session.add_all(employees)
        await session.flush()

        # Invoices
        invoices = [
            Invoice(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                invoice_number="INV-2026-0115",
                customer_id=customers[0].id,
                invoice_date=date(2026, 11, 12),
                due_date=date(2026, 11, 26),
                total_amount=Decimal("58000.00"),
                tax_amount=Decimal("2900.00"),
                net_amount=Decimal("60900.00"),
                status="Paid",
                notes="Delivered to Kanpur depot",
            ),
            Invoice(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                invoice_number="INV-2026-0114",
                customer_id=customers[2].id,
                invoice_date=date(2026, 11, 10),
                due_date=date(2026, 11, 24),
                total_amount=Decimal("21500.00"),
                tax_amount=Decimal("1075.00"),
                net_amount=Decimal("22575.00"),
                status="Partial",
                notes="Sugar supplies",
            ),
            Invoice(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                invoice_number="INV-2026-0101",
                customer_id=customers[0].id,
                invoice_date=date(2026, 10, 18),
                due_date=date(2026, 11, 1),
                total_amount=Decimal("45000.00"),
                tax_amount=Decimal("2250.00"),
                net_amount=Decimal("47250.00"),
                status="Overdue",
                notes="Pending follow up",
            ),
            Invoice(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                invoice_number="INV-2026-0094",
                customer_id=customers[1].id,
                invoice_date=date(2026, 10, 12),
                due_date=date(2026, 10, 26),
                total_amount=Decimal("92000.00"),
                tax_amount=Decimal("4600.00"),
                net_amount=Decimal("96600.00"),
                status="Overdue",
                notes="Bulk molasses order",
            ),
        ]
        session.add_all(invoices)

        # Raw Material Receipts
        receipts = [
            RawMaterialReceipt(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                receipt_number="RMR-2026-0045",
                farmer_id=farmers[0].id,
                weighed_by_id=employees[4].id,
                receipt_date=datetime.now(timezone.utc),
                vehicle_number="UP-32-AB-1234",
                gross_weight=Decimal("185.00"),
                tare_weight=Decimal("35.00"),
                net_weight=Decimal("150.00"),
                cane_variety="Co 0238",
                status="Completed",
                remarks="High sugar recovery batch",
            ),
            RawMaterialReceipt(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                receipt_number="RMR-2026-0046",
                farmer_id=farmers[1].id,
                weighed_by_id=employees[4].id,
                receipt_date=datetime.now(timezone.utc),
                vehicle_number="UP-32-CD-5678",
                gross_weight=Decimal("245.00"),
                tare_weight=Decimal("45.00"),
                net_weight=Decimal("200.00"),
                cane_variety="Co 0118",
                status="Completed",
                remarks="Fresh harvest",
            ),
        ]
        session.add_all(receipts)

        await session.commit()
        print("Initial database seed completed successfully!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())

