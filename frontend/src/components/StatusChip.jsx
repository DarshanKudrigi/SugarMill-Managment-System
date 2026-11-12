const variants = {
  // Invoice statuses
  Paid:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  Pending:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  Partial:  'bg-blue-100 text-blue-700 border-blue-200',
  Overdue:  'bg-red-100 text-red-700 border-red-200',
  // Employee statuses
  Active:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  // Stock statuses
  'Low Stock': 'bg-orange-100 text-orange-700 border-orange-200',
  Adjusted: 'bg-slate-100 text-slate-600 border-slate-200',
  // Attendance
  Present:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  Absent:   'bg-red-100 text-red-700 border-red-200',
  Overtime: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function StatusChip({ status }) {
  const cls = variants[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status}
    </span>
  );
}
