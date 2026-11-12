import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import useAuth from './hooks/useAuth';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Auth/Login';
import DashboardMain from './pages/Dashboard/DashboardMain';
import ItemMaster from './pages/Inventory/ItemMaster';
import StockAdjustments from './pages/Inventory/StockAdjustments';
import FarmerDirectory from './pages/Farmers/FarmerDirectory';
import RawMaterialReceipts from './pages/Farmers/RawMaterialReceipts';
import CustomersList from './pages/Sales/CustomersList';
import InvoicesList from './pages/Sales/InvoicesList';
import CreateInvoice from './pages/Sales/CreateInvoice';
import EmployeeList from './pages/Labour/EmployeeList';
import AttendanceEntry from './pages/Labour/AttendanceEntry';
import GeneralSettings from './pages/Settings/GeneralSettings';
import UserRoles from './pages/Settings/UserRoles';

/** Wraps protected routes — redirects to /login if not authenticated */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardMain />} />

        {/* Inventory */}
        <Route path="inventory">
          <Route index element={<Navigate to="/inventory/items" replace />} />
          <Route path="items" element={<ItemMaster />} />
          <Route path="adjustments" element={<StockAdjustments />} />
        </Route>

        {/* Farmers */}
        <Route path="farmers">
          <Route index element={<Navigate to="/farmers/directory" replace />} />
          <Route path="directory" element={<FarmerDirectory />} />
          <Route path="receipts" element={<RawMaterialReceipts />} />
        </Route>

        {/* Sales */}
        <Route path="sales">
          <Route index element={<Navigate to="/sales/invoices" replace />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="invoices" element={<InvoicesList />} />
          <Route path="invoices/new" element={<CreateInvoice />} />
        </Route>

        {/* Labour */}
        <Route path="labour">
          <Route index element={<Navigate to="/labour/employees" replace />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="attendance" element={<AttendanceEntry />} />
        </Route>

        {/* Settings */}
        <Route path="settings">
          <Route index element={<Navigate to="/settings/general" replace />} />
          <Route path="general" element={<GeneralSettings />} />
          <Route path="roles" element={<UserRoles />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <AppRoutes />
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
