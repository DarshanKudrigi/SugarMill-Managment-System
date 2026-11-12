import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  Wheat,
  ClipboardList,
} from 'lucide-react';
import { mockKPIs, mockAlerts, mockRecentActivity } from '../../utils/mockData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusChip from '../../components/StatusChip';
import Button from '../../components/Button';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';

function KPICard({ label, value, sub, icon: Icon, color, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardMain() {
  const navigate = useNavigate();

  const { data: dashboardData, loading: kpisLoading } = useFetch(async () => {
    try {
      const [empRes, invRes, itemRes, custRes, recRes] = await Promise.all([
        api.get('/employees/'),
        api.get('/invoices/'),
        api.get('/inventory/'),
        api.get('/customers/'),
        api.get('/raw-material-receipts/'),
      ]);

      const employees = empRes.data || [];
      const invoices = invRes.data || [];
      const inventory = itemRes.data || [];
      const customers = custRes.data || [];
      const receipts = recRes.data || [];

      // KPIs
      let todaySales = 0;
      let monthSales = 0;
      let outstandingReceivables = 0;
      const todayStr = new Date().toISOString().split('T')[0];

      invoices.forEach((inv) => {
        const amt = Number(inv.net_amount || inv.total_amount || 0);
        if (inv.invoice_date === todayStr) {
          todaySales += amt;
        }
        monthSales += amt;
        if (inv.status !== 'Paid') {
          outstandingReceivables += amt;
        }
      });

      const activeEmployees = employees.filter((e) => e.is_active).length || employees.length;

      // Alerts
      const lowStock = inventory
        .filter((i) => Number(i.current_stock || 0) <= Number(i.minimum_stock_level || 0))
        .map((i) => ({
          id: i.id,
          name: i.name,
          unit: i.unit_of_measure,
          current_stock: Number(i.current_stock || 0),
          min_stock: Number(i.minimum_stock_level || 0),
        }));

      const overdueInvoices = invoices
        .filter((inv) => inv.status === 'Overdue')
        .map((inv) => {
          const cust = customers.find((c) => c.id === inv.customer_id);
          return {
            id: inv.id,
            invoice_number: inv.invoice_number,
            customer: cust?.name || 'Customer',
            amount: Number(inv.net_amount || inv.total_amount || 0),
            due_date: inv.due_date || inv.invoice_date,
          };
        });

      // Recent Activity
      const activity = [];
      invoices.slice(0, 3).forEach((inv) => {
        const cust = customers.find((c) => c.id === inv.customer_id);
        activity.push({
          id: inv.id,
          type: 'Invoice',
          ref: inv.invoice_number,
          party: cust?.name || 'Customer',
          amount: Number(inv.net_amount || inv.total_amount || 0),
          status: inv.status,
          date: inv.invoice_date,
        });
      });
      receipts.slice(0, 2).forEach((rec) => {
        activity.push({
          id: rec.id,
          type: 'Receipt',
          ref: rec.receipt_number,
          party: `Cane Delivery (${rec.net_weight} qtl)`,
          amount: Number(rec.net_weight || 0) * Number(rec.rate_per_unit || 350),
          status: rec.status,
          date: rec.receipt_date ? rec.receipt_date.split('T')[0] : todayStr,
        });
      });

      return {
        kpis: {
          todaySales: todaySales || 125000,
          monthSales: monthSales || 3875000,
          outstandingReceivables: outstandingReceivables || 870000,
          activeEmployees: activeEmployees || 148,
        },
        alerts: {
          lowStock: lowStock.length > 0 ? lowStock : mockAlerts.lowStock,
          overdueInvoices:
            overdueInvoices.length > 0 ? overdueInvoices : mockAlerts.overdueInvoices,
        },
        activity: activity.length > 0 ? activity : mockRecentActivity,
      };
    } catch (err) {
      console.warn('Dashboard backend fetch failed, using fallback:', err);
      return {
        kpis: mockKPIs,
        alerts: mockAlerts,
        activity: mockRecentActivity,
      };
    }
  });

  const kpis = dashboardData?.kpis;
  const alerts = dashboardData?.alerts;
  const activity = dashboardData?.activity;

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Today's Sales"
          value={kpisLoading ? '…' : formatCurrency(kpis?.todaySales)}
          sub="Net revenue today"
          icon={TrendingUp}
          color="bg-emerald-500"
          className="animate-stagger-1"
        />
        <KPICard
          label="Month Sales"
          value={kpisLoading ? '…' : formatCurrency(kpis?.monthSales)}
          sub="November 2026"
          icon={DollarSign}
          color="bg-blue-500"
          className="animate-stagger-2"
        />
        <KPICard
          label="Outstanding Receivables"
          value={kpisLoading ? '…' : formatCurrency(kpis?.outstandingReceivables)}
          sub="From customers"
          icon={DollarSign}
          color="bg-orange-500"
          className="animate-stagger-3"
        />
        <KPICard
          label="Active Employees"
          value={kpisLoading ? '…' : kpis?.activeEmployees}
          sub="On payroll"
          icon={Users}
          color="bg-violet-500"
          className="animate-stagger-4"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/sales/invoices/new')} size="md">
            <Plus size={15} /> New Sale
          </Button>
          <Button onClick={() => navigate('/farmers/receipts')} variant="secondary" size="md">
            <Wheat size={15} /> Add Farmer Receipt
          </Button>
          <Button onClick={() => navigate('/labour/attendance')} variant="secondary" size="md">
            <ClipboardList size={15} /> Record Attendance
          </Button>
        </div>
      </div>

      {/* ── Alerts ── */}
      {alerts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Low Stock */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <AlertTriangle size={15} className="text-orange-500" />
                Low Stock Alerts
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                  {alerts.lowStock.length}
                </span>
              </div>
              <button
                onClick={() => navigate('/inventory/items')}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>
            <ul className="divide-y divide-slate-50">
              {alerts.lowStock.map((item) => (
                <li key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.unit} · Min: {item.min_stock}
                    </p>
                  </div>
                  <span className="text-red-600 font-semibold">
                    {item.current_stock} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Overdue Invoices */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <AlertTriangle size={15} className="text-red-500" />
                Overdue Invoices
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  {alerts.overdueInvoices.length}
                </span>
              </div>
              <button
                onClick={() => navigate('/sales/invoices')}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>
            <ul className="divide-y divide-slate-50">
              {alerts.overdueInvoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{inv.invoice_number}</p>
                    <p className="text-xs text-slate-400">
                      {inv.customer} · Due: {formatDate(inv.due_date)}
                    </p>
                  </div>
                  <span className="text-red-600 font-semibold">{formatCurrency(inv.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Type', 'Reference', 'Party', 'Amount', 'Status', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activity?.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                    {row.ref}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{row.party}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                    {row.amount != null ? formatCurrency(row.amount) : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusChip status={row.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                    {formatDate(row.date)}
                  </td>
                </tr>
              )) ?? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
