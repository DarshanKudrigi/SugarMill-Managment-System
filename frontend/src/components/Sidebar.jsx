import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, Wheat, HardHat,
  Settings, ChevronRight, X, Leaf,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Dashboard',  to: '/dashboard',          icon: LayoutDashboard },
  { label: 'Inventory',  to: '/inventory',           icon: Package,
    children: [
      { label: 'Item Master',       to: '/inventory/items' },
      { label: 'Stock Adjustments', to: '/inventory/adjustments' },
    ]
  },
  { label: 'Farmers',    to: '/farmers',             icon: Wheat,
    children: [
      { label: 'Farmer Directory',  to: '/farmers/directory' },
      { label: 'Raw Material Receipts', to: '/farmers/receipts' },
    ]
  },
  { label: 'Sales',      to: '/sales',               icon: Users,
    children: [
      { label: 'Customers',    to: '/sales/customers' },
      { label: 'Invoices',     to: '/sales/invoices' },
      { label: 'Create Invoice', to: '/sales/invoices/new' },
    ]
  },
  { label: 'Labour',     to: '/labour',              icon: HardHat,
    children: [
      { label: 'Employees',   to: '/labour/employees' },
      { label: 'Attendance',  to: '/labour/attendance' },
    ]
  },
  { label: 'Settings',   to: '/settings',            icon: Settings,
    children: [
      { label: 'General',    to: '/settings/general' },
      { label: 'User Roles', to: '/settings/roles' },
    ]
  },
];

function NavGroup({ item, collapsed, onClose, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname.startsWith(item.to);
  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setOpen(true);
    }
  }, [isActive]);

  if (item.children) {
    const handleGroupClick = () => {
      if (collapsed) {
        navigate(item.children[0].to);
      } else {
        setOpen((prev) => !prev);
      }
    };

    return (
      <div>
        <button
          type="button"
          onClick={handleGroupClick}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors text-left
            ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
        >
          <item.icon size={18} className="shrink-0" />
          {!collapsed && <span className="flex-1">{item.label}</span>}
          {!collapsed && (
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
            />
          )}
        </button>
        {!collapsed && (
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
              open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="ml-7 mt-1 flex flex-col gap-0.5">
                {item.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    onClick={() => {
                      if (isMobile && onClose) onClose();
                    }}
                    className={({ isActive: ia }) =>
                      `px-3 py-1.5 rounded-lg text-sm transition-colors duration-150
                      ${ia ? 'bg-emerald-100 text-emerald-700 font-medium' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      onClick={() => {
        if (isMobile && onClose) onClose();
      }}
      className={({ isActive: ia }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${ia ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`
      }
    >
      <item.icon size={18} className="shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onClose, isMobile }) {
  const { user } = useAuth();

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300
        ${collapsed && !isMobile ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white shrink-0">
          <Leaf size={16} />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Sugar Mill ERP</p>
            <p className="text-xs text-slate-400 truncate">{user?.tenant ?? 'Sunrise Mills'}</p>
          </div>
        )}
        {isMobile && (
          <button onClick={onClose} className="p-1 ml-auto text-slate-400 hover:text-slate-600" aria-label="Close sidebar">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavGroup
            key={item.to}
            item={item}
            collapsed={collapsed && !isMobile}
            onClose={onClose}
            isMobile={isMobile}
          />
        ))}
      </nav>

      {/* User chip */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
              {user?.name?.[0] ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
