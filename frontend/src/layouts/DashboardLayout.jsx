import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const ROUTE_TITLES = {
  '/dashboard':              'Dashboard',
  '/inventory/items':        'Item Master',
  '/inventory/adjustments':  'Stock Adjustments',
  '/farmers/directory':      'Farmer Directory',
  '/farmers/receipts':       'Raw Material Receipts',
  '/sales/customers':        'Customers',
  '/sales/invoices':         'Invoices',
  '/sales/invoices/new':     'Create Invoice',
  '/labour/employees':       'Employee Directory',
  '/labour/attendance':      'Attendance Entry',
  '/settings/general':       'General Settings',
  '/settings/roles':         'User Roles',
};

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const title = ROUTE_TITLES[location.pathname] ?? 'Sugar Mill ERP';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex shrink-0">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden animate-backdrop"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 flex md:hidden animate-drawer">
            <Sidebar isMobile onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuClick={() => {
            if (window.innerWidth < 768) {
              setMobileOpen((v) => !v);
            } else {
              setSidebarCollapsed((v) => !v);
            }
          }}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div key={location.pathname} className="animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
