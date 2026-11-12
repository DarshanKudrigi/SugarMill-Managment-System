# Sugar Mill ERP - Backend CRUD Service

Asynchronous FastAPI backend providing RESTful CRUD operations for the Sugar Mill ERP core domain modules:
1. **Customers**
2. **Farmers**
3. **Inventory Items**
4. **Employees**
5. **Invoices**
6. **Raw Material Receipts**

---

## Technology Stack

- **Language:** Python (3.14+)
- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0 (Asynchronous with `asyncpg`)
- **Database:** PostgreSQL / Neon DB
- **Data Validation & Settings:** Pydantic v2 & Pydantic-Settings
- **Database Migrations:** Alembic (Async migration runner)
- **ASGI Server:** Uvicorn

---

## Project Structure

```
Sugarmill_ERP/
├── alembic/                      # Alembic migration environment and versions
│   ├── versions/
│   │   └── 80ce349a7f64_initial_schema.py
│   └── env.py
├── src/
│   └── sugarmill_erp/
│       ├── api/                  # API Routers
│       │   └── v1/
│       │       ├── customers.py
│       │       ├── employees.py
│       │       ├── farmers.py
│       │       ├── inventory.py
│       │       ├── invoices.py
│       │       ├── raw_material_receipts.py
│       │       └── router.py
│       ├── core/                 # Core config, DB session, exception handlers
│       │   ├── config.py
│       │   ├── database.py
│       │   └── exceptions.py
│       ├── crud/                 # Async CRUD operations
│       │   ├── base.py
│       │   ├── customer.py
│       │   ├── employee.py
│       │   ├── farmer.py
│       │   ├── inventory.py
│       │   ├── invoice.py
│       │   └── raw_material_receipt.py
│       ├── models/               # SQLAlchemy 2.0 ORM Models
│       │   ├── base.py
│       │   ├── customer.py
│       │   ├── employee.py
│       │   ├── farmer.py
│       │   ├── inventory.py
│       │   ├── invoice.py
│       │   └── raw_material_receipt.py
│       ├── schemas/              # Pydantic Schemas (Create, Update, Response)
│       │   ├── customer.py
│       │   ├── employee.py
│       │   ├── farmer.py
│       │   ├── inventory.py
│       │   ├── invoice.py
│       │   └── raw_material_receipt.py
│       ├── __init__.py
│       └── main.py               # FastAPI application entry point
├── tests/
│   └── test_crud.py              # Comprehensive async test suite
├── .env.example                  # Template environment variables
├── .env                          # Local database configuration
├── alembic.ini                   # Alembic configuration
└── pyproject.toml                # Project metadata & dependencies
```

---

## Setup & Running

### 1. Configure Database Connection

Create or edit `.env` (refer to `.env.example`):
```env
DATABASE_URL=postgresql+asyncpg://<username>:<password>@<host>:<port>/<database_name>
```

### 2. Apply Database Migrations

```bash
uv run alembic upgrade head
```

### 3. Run FastAPI Server

```bash
uv run uvicorn sugarmill_erp.main:app --reload --port 8000
```

### 4. Interactive API Documentation

Once the server is running, open:
- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **OpenAPI Schema:** [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

## Executing Tests

Run the test suite covering all 6 CRUD modules, duplicate validations, foreign key RESTRICT checks, and pagination:

```bash
uv run python tests/test_crud.py
```

---

## API Endpoints Summary

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Customers** | `POST` | `/api/v1/customers/` | Create a customer |
| | `GET` | `/api/v1/customers/` | List customers (supports `skip`, `limit`) |
| | `GET` | `/api/v1/customers/{customer_id}` | Retrieve customer by UUID |
| | `PUT` | `/api/v1/customers/{customer_id}` | Update customer by UUID |
| | `DELETE` | `/api/v1/customers/{customer_id}` | Delete customer (blocked if invoices exist) |
| **Farmers** | `POST` | `/api/v1/farmers/` | Create a farmer |
| | `GET` | `/api/v1/farmers/` | List farmers (supports `skip`, `limit`) |
| | `GET` | `/api/v1/farmers/{farmer_id}` | Retrieve farmer by UUID |
| | `PUT` | `/api/v1/farmers/{farmer_id}` | Update farmer by UUID |
| | `DELETE` | `/api/v1/farmers/{farmer_id}` | Delete farmer (blocked if receipts exist) |
| **Inventory** | `POST` | `/api/v1/inventory/` | Create an inventory item |
| | `GET` | `/api/v1/inventory/` | List inventory items (supports `skip`, `limit`) |
| | `GET` | `/api/v1/inventory/{item_id}` | Retrieve inventory item by UUID |
| | `PUT` | `/api/v1/inventory/{item_id}` | Update inventory item by UUID |
| | `DELETE` | `/api/v1/inventory/{item_id}` | Delete inventory item by UUID |
| **Employees** | `POST` | `/api/v1/employees/` | Create an employee |
| | `GET` | `/api/v1/employees/` | List employees (supports `skip`, `limit`) |
| | `GET` | `/api/v1/employees/{employee_id}` | Retrieve employee by UUID |
| | `PUT` | `/api/v1/employees/{employee_id}` | Update employee by UUID |
| | `DELETE` | `/api/v1/employees/{employee_id}` | Delete employee (blocked if receipts exist) |
| **Invoices** | `POST` | `/api/v1/invoices/` | Create invoice for customer |
| | `GET` | `/api/v1/invoices/` | List invoices (supports `skip`, `limit`) |
| | `GET` | `/api/v1/invoices/{invoice_id}` | Retrieve invoice by UUID |
| | `PUT` | `/api/v1/invoices/{invoice_id}` | Update invoice by UUID |
| | `DELETE` | `/api/v1/invoices/{invoice_id}` | Delete invoice by UUID |
| **Raw Material Receipts** | `POST` | `/api/v1/raw-material-receipts/` | Record weighbridge cane receipt |
| | `GET` | `/api/v1/raw-material-receipts/` | List receipts (supports `skip`, `limit`) |
| | `GET` | `/api/v1/raw-material-receipts/{receipt_id}` | Retrieve receipt by UUID |
| | `PUT` | `/api/v1/raw-material-receipts/{receipt_id}` | Update receipt by UUID |
| | `DELETE` | `/api/v1/raw-material-receipts/{receipt_id}` | Delete receipt by UUID |

