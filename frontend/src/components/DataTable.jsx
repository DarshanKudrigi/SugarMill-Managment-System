import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

const PAGE_SIZES = [10, 25, 50];

/**
 * Reusable data table with search, pagination, and horizontal scroll on mobile.
 *
 * @param {string[]}  columns   — Array of { key, label, render?, className? }
 * @param {object[]}  data      — Raw data array
 * @param {string}    searchKey — Key to filter on (optional)
 * @param {Function}  rowClassName — (row) => string for conditional row styles
 */
export default function DataTable({
  columns,
  data = [],
  searchKey,
  rowClassName,
  loading = false,
  emptyMessage = 'No records found.',
  actions,         // slot: rendered at top-right of the table header
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const debouncedQuery = useDebounce(query);

  const filtered = searchKey
    ? data.filter((row) =>
        String(row[searchKey] ?? '').toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : data;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        {searchKey ? (
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search…"
              className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        ) : <div />}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${col.className ?? ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading…
                  </div>
                </td>
              </tr>
            ) : slice.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              slice.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  className={`hover:bg-slate-50 transition-colors ${rowClassName ? rowClassName(row) : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 whitespace-nowrap ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border border-slate-300 rounded px-2 py-1 focus:outline-none"
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <span>{filtered.length === 0 ? '0' : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)}`} of {filtered.length}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2">Page {safePage} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
