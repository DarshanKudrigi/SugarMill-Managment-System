/**
 * Format a number as Indian Rupee currency
 * e.g. 125000 → ₹1,25,000
 */
export const formatCurrency = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format an ISO date string to a readable format
 * e.g. "2026-11-12" → "12 Nov 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

/**
 * Format a number with commas (Indian system)
 */
export const formatNumber = (num) => {
  if (num == null) return '—';
  return new Intl.NumberFormat('en-IN').format(num);
};
