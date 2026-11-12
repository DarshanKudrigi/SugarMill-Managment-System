import { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';

const ROLES = [
  { id: 1, name: 'Admin', description: 'Full access to all modules' },
  { id: 2, name: 'Manager', description: 'Access to operations; no settings' },
  { id: 3, name: 'Accountant', description: 'Sales, Invoicing, and Reports only' },
  { id: 4, name: 'Operator', description: 'Production and Attendance only' },
];

const MODULES = ['Dashboard', 'Inventory', 'Farmers', 'Sales', 'Labour', 'Settings'];

const DEFAULT_PERMISSIONS = {
  Admin:      { Dashboard: true,  Inventory: true,  Farmers: true,  Sales: true,  Labour: true,  Settings: true  },
  Manager:    { Dashboard: true,  Inventory: true,  Farmers: true,  Sales: true,  Labour: true,  Settings: false },
  Accountant: { Dashboard: true,  Inventory: false, Farmers: false, Sales: true,  Labour: false, Settings: false },
  Operator:   { Dashboard: true,  Inventory: true,  Farmers: true,  Sales: false, Labour: true,  Settings: false },
};

export default function UserRoles() {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  const toggle = (role, module) => {
    if (role === 'Admin') return; // Admin always has full access
    setPermissions((prev) => ({
      ...prev,
      [role]: { ...prev[role], [module]: !prev[role][module] },
    }));
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">User Roles & Permissions</h2>
        <p className="text-sm text-slate-500">Configure what each role can access</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Module</th>
                {ROLES.map((role) => (
                  <th key={role.id} className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[120px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <Shield size={12} className="text-emerald-500" />
                        {role.name}
                      </div>
                      <span className="text-xs text-slate-400 font-normal normal-case">{role.description}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MODULES.map((module) => (
                <tr key={module} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-700">{module}</td>
                  {ROLES.map((role) => {
                    const allowed = permissions[role.name]?.[module];
                    return (
                      <td key={role.id} className="px-5 py-3 text-center">
                        <button
                          onClick={() => toggle(role.name, module)}
                          disabled={role.name === 'Admin'}
                          aria-label={`${allowed ? 'Revoke' : 'Grant'} ${module} access for ${role.name}`}
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all
                            ${allowed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white border-slate-300 text-slate-300 hover:border-slate-400'
                            }
                            ${role.name === 'Admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:scale-110'}
                          `}
                        >
                          {allowed ? <Check size={14} /> : <X size={14} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">Admin role always has full access and cannot be modified.</p>
        </div>
      </div>
    </div>
  );
}
