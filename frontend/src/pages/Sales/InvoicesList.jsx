import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import StatusChip from '../../components/StatusChip';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { mockInvoices } from '../../utils/mockData';
import { formatCurrency, formatDate } from '../../utils/formatters';

const paymentSchema = z.object({
  amount: z.coerce.number().positive('Enter a valid amount'),
  method: z.string().min(1, 'Select payment method'),
  remarks: z.string().optional(),
});

const METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'NEFT', label: 'NEFT / Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Cheque', label: 'Cheque' },
];

export default function InvoicesList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [paymentModal, setPaymentModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchInvoices = async () => {
    try {
      const [invRes, custRes] = await Promise.all([
        api.get('/invoices/'),
        api.get('/customers/'),
      ]);
      const customerMap = {};
      custRes.data.forEach((c) => {
        customerMap[c.id] = c.name;
      });

      const data = invRes.data.map((inv) => {
        const total = Number(inv.net_amount || inv.total_amount || 0);
        const paid = inv.status === 'Paid' ? total : Number(inv.paid_amount ?? 0);
        const remaining = Math.max(0, total - paid);
        return {
          ...inv,
          customer: customerMap[inv.customer_id] || 'Customer',
          date: inv.invoice_date,
          amount: total,
          paid_amount: paid,
          remaining_amount: remaining,
        };
      });
      setInvoices(data);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using fallback:', err);
      const fallback = mockInvoices.map((inv) => ({
        ...inv,
        paid_amount: inv.status === 'Paid' ? inv.amount : 0,
        remaining_amount: inv.status === 'Paid' ? 0 : inv.amount,
      }));
      setInvoices(fallback);
      return fallback;
    }
  };

  const { loading } = useFetch(fetchInvoices);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: '', method: '', remarks: '' },
  });

  const openPayment = (inv) => {
    setPaymentModal(inv);
    reset({ amount: inv.remaining_amount, method: '', remarks: '' });
  };

  const onPayment = async (data) => {
    setSaving(true);
    try {
      const newPaid = Math.min(
        paymentModal.amount,
        (paymentModal.paid_amount || 0) + Number(data.amount)
      );
      const newRemaining = Math.max(0, paymentModal.amount - newPaid);
      const newStatus = newRemaining <= 0 ? 'Paid' : 'Partial';

      await api.put(`/invoices/${paymentModal.id}`, {
        paid_amount: newPaid,
        status: newStatus,
        notes: data.remarks || paymentModal.notes,
      });

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === paymentModal.id
            ? {
                ...inv,
                paid_amount: newPaid,
                remaining_amount: newRemaining,
                status: newStatus,
              }
            : inv
        )
      );
      setPaymentModal(null);
    } catch (err) {
      console.error('Error recording payment:', err);
      alert(err.response?.data?.detail || err.message || 'Error updating payment');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          {r.invoice_number}
        </span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (r) => <span className="font-medium text-slate-800">{r.customer}</span>,
    },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    {
      key: 'amount',
      label: 'Total Amount',
      render: (r) => (
        <span className="font-semibold text-slate-800">{formatCurrency(r.amount)}</span>
      ),
    },
    {
      key: 'remaining_amount',
      label: 'Remaining Amount',
      render: (r) => (
        <span
          className={
            r.remaining_amount > 0
              ? 'font-semibold text-orange-600'
              : 'font-medium text-emerald-600'
          }
        >
          {formatCurrency(r.remaining_amount)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusChip status={r.status} />,
    },
    {
      key: 'actions',
      label: '',
      render: (r) =>
        r.status !== 'Paid' ? (
          <Button
            size="xs"
            variant="outline"
            onClick={() => openPayment(r)}
            className="text-xs gap-1"
          >
            <CreditCard size={12} /> Record Payment
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Sales Invoices</h2>
        <p className="text-sm text-slate-500">
          Billing, tax receipts, and payment settlements
        </p>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchKey="invoice_number"
        loading={loading}
        actions={
          <Button onClick={() => navigate('/sales/invoices/new')} size="sm">
            <Plus size={14} /> New Invoice
          </Button>
        }
      />

      <Modal
        isOpen={Boolean(paymentModal)}
        onClose={() => setPaymentModal(null)}
        title={`Record Payment — ${paymentModal?.invoice_number}`}
      >
        <form onSubmit={handleSubmit(onPayment)} className="flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Total:</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(paymentModal?.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining Amount:</span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(paymentModal?.remaining_amount)}
              </span>
            </div>
          </div>
          <Input
            label="Payment Amount (₹)"
            type="number"
            step="0.01"
            error={errors.amount?.message}
            required
            {...register('amount')}
          />
          <Select
            label="Payment Method"
            options={METHODS}
            placeholder="Select method"
            error={errors.method?.message}
            required
            {...register('method')}
          />
          <Input
            label="Remarks / Reference #"
            placeholder="e.g. UTR #123456"
            error={errors.remarks?.message}
            {...register('remarks')}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setPaymentModal(null)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={saving}>
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
