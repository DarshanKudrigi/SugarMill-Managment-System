import { useState } from 'react';
import { CheckCircle, Calendar } from 'lucide-react';
import Button from '../../components/Button';
import useFetch from '../../hooks/useFetch';
import { mockAttendance, mockDelay } from '../../utils/mockData';

const STATUS_OPTIONS = ['Present', 'Absent', 'Overtime'];

const STATUS_COLORS = {
  Present:  'bg-emerald-500',
  Absent:   'bg-red-500',
  Overtime: 'bg-purple-500',
};

const STATUS_RING = {
  Present:  'ring-emerald-400',
  Absent:   'ring-red-400',
  Overtime: 'ring-purple-400',
};

export default function AttendanceEntry() {
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { loading } = useFetch(async () => {
    await mockDelay(400);
    setRecords(mockAttendance);
    return mockAttendance;
  });

  const setStatus = (empId, status) => {
    setRecords((prev) =>
      prev.map((r) => r.emp_id === empId ? { ...r, status } : r)
    );
  };

  const markAll = (status) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSubmit = async () => {
    setSaving(true);
    await mockDelay(800);
    console.log('Attendance submitted:', { date, records });
    setSaving(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const summary = records.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
    {}
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-slate-800">Attendance Entry</h2>
        <p className="text-sm text-slate-500">Mark attendance for all employees in one shot</p>
      </div>

      {submitted && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle size={16} /> Attendance saved for {date}.
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Calendar size={16} className="text-slate-400 shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => markAll('Present')}>All Present</Button>
          <Button size="sm" variant="secondary" onClick={() => markAll('Absent')}>All Absent</Button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((s) => (
          <div key={s} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s]}`} />
            <span className="text-slate-600">{s}:</span>
            <span className="font-bold text-slate-800">{summary[s] ?? 0}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading employees…</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Emp ID', 'Name', 'Department', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r) => (
                  <tr key={r.emp_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{r.emp_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{r.name}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.department}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(r.emp_id, s)}
                            aria-label={`Mark ${r.name} as ${s}`}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-all
                              ${r.status === s
                                ? `${STATUS_COLORS[s]} text-white border-transparent ring-2 ring-offset-1 ${STATUS_RING[s]}`
                                : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
                              }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} loading={saving} disabled={records.length === 0}>
          <CheckCircle size={15} /> Submit Attendance
        </Button>
      </div>
    </div>
  );
}
