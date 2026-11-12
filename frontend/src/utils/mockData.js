// ─── Mock Data for all modules ─────────────────────────────────────────────
// Swap each array/function out for a real Axios call when backend is ready.

export const mockDelay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

// ── Auth ─────────────────────────────────────────────────────────────────────
export const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@sugarmill.com',
  role: 'admin',
  tenant: 'Sunrise Sugar Mills',
};

// ── Dashboard KPIs ────────────────────────────────────────────────────────────
export const mockKPIs = {
  todaySales: 125000,
  monthSales: 3875000,
  outstandingReceivables: 870000,
  outstandingPayables: 420000,
  activeEmployees: 148,
};

export const mockAlerts = {
  lowStock: [
    { id: 1, name: 'Sulfur Powder', current_stock: 12, min_stock: 50, unit: 'kg' },
    { id: 2, name: 'Filter Press Cloth', current_stock: 3, min_stock: 10, unit: 'pcs' },
    { id: 3, name: 'Lime Stone', current_stock: 180, min_stock: 500, unit: 'kg' },
  ],
  overdueInvoices: [
    { id: 101, invoice_number: 'INV-2026-0101', customer: 'Ramesh Traders', amount: 45000, due_date: '2026-10-20' },
    { id: 102, invoice_number: 'INV-2026-0094', customer: 'Suresh Wholesale', amount: 92000, due_date: '2026-10-15' },
  ],
};

export const mockRecentActivity = [
  { id: 1, type: 'Invoice', ref: 'INV-2026-0115', party: 'Ramesh Traders', amount: 58000, status: 'Paid', date: '2026-11-12' },
  { id: 2, type: 'Payment', ref: 'PMT-2026-0088', party: 'Suresh Wholesale', amount: 30000, status: 'Paid', date: '2026-11-11' },
  { id: 3, type: 'Receipt', ref: 'RMR-2026-0045', party: 'Farmer: Bharat Singh', amount: 72000, status: 'Pending', date: '2026-11-11' },
  { id: 4, type: 'Invoice', ref: 'INV-2026-0114', party: 'Dinesh Sweets', amount: 21500, status: 'Partial', date: '2026-11-10' },
  { id: 5, type: 'Stock', ref: 'ADJ-2026-0012', party: 'Sulfur Powder -20kg', amount: null, status: 'Adjusted', date: '2026-11-10' },
];

// ── Inventory ────────────────────────────────────────────────────────────────
export const mockItems = [
  { id: 1, sku: 'CH-001', name: 'Sulfur Powder', category: 'Chemicals', unit: 'kg', min_stock: 50, current_stock: 12 },
  { id: 2, sku: 'SP-002', name: 'Filter Press Cloth', category: 'Spare Parts', unit: 'pcs', min_stock: 10, current_stock: 3 },
  { id: 3, sku: 'CH-003', name: 'Lime Stone', category: 'Chemicals', unit: 'kg', min_stock: 500, current_stock: 180 },
  { id: 4, sku: 'FG-001', name: 'Raw Sugar (M-30)', category: 'Finished Goods', unit: 'quintal', min_stock: 100, current_stock: 850 },
  { id: 5, sku: 'FG-002', name: 'Molasses', category: 'Finished Goods', unit: 'MT', min_stock: 20, current_stock: 65 },
  { id: 6, sku: 'CH-004', name: 'Phosphoric Acid', category: 'Chemicals', unit: 'ltr', min_stock: 100, current_stock: 240 },
  { id: 7, sku: 'SP-003', name: 'V-Belt Set', category: 'Spare Parts', unit: 'set', min_stock: 5, current_stock: 8 },
];

export const mockStockAdjustments = [
  { id: 1, item: 'Sulfur Powder', quantity: -20, reason: 'Damaged stock disposal', date: '2026-11-10', by: 'Admin User' },
  { id: 2, item: 'Filter Press Cloth', quantity: 5, reason: 'Purchase received', date: '2026-11-08', by: 'Admin User' },
];

// ── Farmers ─────────────────────────────────────────────────────────────────
export const mockFarmers = [
  { id: 1, name: 'Bharat Singh', village: 'Rampur', contact: '9876543210', pending_balance: 72000, total_supplied: 450 },
  { id: 2, name: 'Sukhdev Patel', village: 'Sitapur', contact: '9812345678', pending_balance: 0, total_supplied: 1200 },
  { id: 3, name: 'Rajan Yadav', village: 'Lucknow', contact: '9898989898', pending_balance: 34500, total_supplied: 310 },
  { id: 4, name: 'Madan Lal', village: 'Barabanki', contact: '9765432109', pending_balance: 0, total_supplied: 2100 },
  { id: 5, name: 'Vinod Kumar', village: 'Hardoi', contact: '9654321098', pending_balance: 15000, total_supplied: 780 },
];

export const mockMaterials = [
  { id: 1, name: 'Sugarcane', unit: 'quintal' },
  { id: 2, name: 'Molasses (input)', unit: 'MT' },
  { id: 3, name: 'Bagasse', unit: 'MT' },
];

export const mockRawMaterialReceipts = [
  { id: 1, farmer: 'Bharat Singh', material: 'Sugarcane', quantity: 150, rate: 350, gross_value: 52500, deductions: 2500, net_payable: 50000, date: '2026-11-11' },
  { id: 2, farmer: 'Sukhdev Patel', material: 'Sugarcane', quantity: 200, rate: 350, gross_value: 70000, deductions: 3000, net_payable: 67000, date: '2026-11-10' },
];

// ── Customers & Sales ────────────────────────────────────────────────────────
export const mockCustomers = [
  { id: 1, name: 'Ramesh Traders', contact: '9876501234', city: 'Kanpur', outstanding: 45000 },
  { id: 2, name: 'Suresh Wholesale', contact: '9765012345', city: 'Lucknow', outstanding: 92000 },
  { id: 3, name: 'Dinesh Sweets', contact: '9654023456', city: 'Agra', outstanding: 21500 },
  { id: 4, name: 'Priya Distributors', contact: '9543034567', city: 'Varanasi', outstanding: 0 },
];

export const mockInvoices = [
  { id: 101, invoice_number: 'INV-2026-0115', customer: 'Ramesh Traders', date: '2026-11-12', amount: 58000, status: 'Paid' },
  { id: 102, invoice_number: 'INV-2026-0114', customer: 'Dinesh Sweets', date: '2026-11-10', amount: 21500, status: 'Partial' },
  { id: 103, invoice_number: 'INV-2026-0101', customer: 'Ramesh Traders', date: '2026-10-18', amount: 45000, status: 'Overdue' },
  { id: 104, invoice_number: 'INV-2026-0094', customer: 'Suresh Wholesale', date: '2026-10-12', amount: 92000, status: 'Overdue' },
  { id: 105, invoice_number: 'INV-2026-0110', customer: 'Priya Distributors', date: '2026-11-05', amount: 33000, status: 'Paid' },
];

// ── Labour ───────────────────────────────────────────────────────────────────
export const mockEmployees = [
  { id: 1, emp_id: 'EMP-001', name: 'Ravi Kumar', department: 'Production', designation: 'Operator', status: 'Active' },
  { id: 2, emp_id: 'EMP-002', name: 'Sunil Sharma', department: 'Maintenance', designation: 'Technician', status: 'Active' },
  { id: 3, emp_id: 'EMP-003', name: 'Anita Verma', department: 'Accounts', designation: 'Accountant', status: 'Active' },
  { id: 4, emp_id: 'EMP-004', name: 'Mahesh Gupta', department: 'Production', designation: 'Helper', status: 'Active' },
  { id: 5, emp_id: 'EMP-005', name: 'Pooja Singh', department: 'HR', designation: 'HR Executive', status: 'Active' },
  { id: 6, emp_id: 'EMP-006', name: 'Ramesh Yadav', department: 'Security', designation: 'Guard', status: 'Inactive' },
];

export const mockAttendance = [
  { emp_id: 'EMP-001', name: 'Ravi Kumar', department: 'Production', status: 'Present' },
  { emp_id: 'EMP-002', name: 'Sunil Sharma', department: 'Maintenance', status: 'Present' },
  { emp_id: 'EMP-003', name: 'Anita Verma', department: 'Accounts', status: 'Absent' },
  { emp_id: 'EMP-004', name: 'Mahesh Gupta', department: 'Production', status: 'Present' },
  { emp_id: 'EMP-005', name: 'Pooja Singh', department: 'HR', status: 'Overtime' },
];
