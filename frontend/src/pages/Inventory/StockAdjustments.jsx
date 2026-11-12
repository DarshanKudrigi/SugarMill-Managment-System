import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { mockItems, mockStockAdjustments } from '../../utils/mockData';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import DataTable from '../../components/DataTable';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const schema = z.object({
  item_id: z.string().min(1, 'Please select an item'),
  quantity: z.coerce.number().refine((v) => v !== 0, 'Quantity cannot be zero'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export default function StockAdjustments() {
  const { user } = useAuth();
  const [adjustments, setAdjustments] = useState([]);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      const [itemsRes, adjRes] = await Promise.all([
        api.get('/inventory/'),
        api.get('/inventory/adjustments'),
      ]);

      const formattedItems = itemsRes.data.map((i) => ({
        ...i,
        sku: i.item_code || i.sku,
        unit: i.unit_of_measure || i.unit,
        current_stock: Number(i.current_stock ?? 0),
      }));
      setItems(formattedItems);

      const formattedAdjustments = adjRes.data.map((a) => ({
        id: a.id,
        item: a.item_name || '—',
        quantity: Number(a.quantity),
        reason: a.reason,
        date: a.created_at ? a.created_at.split('T')[0] : '',
        by: a.adjusted_by || 'Admin User',
      }));
      setAdjustments(formattedAdjustments);
    } catch (err) {
      console.warn('Backend unavailable, using fallback:', err);
      setItems(mockItems);
      setAdjustments(mockStockAdjustments);
    }
  };

  const { loading } = useFetch(fetchData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { item_id: '', quantity: '', reason: '' },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    setErrorMsg('');
    setSuccess(false);
    try {
      const payload = {
        item_id: data.item_id,
        quantity: Number(data.quantity),
        reason: data.reason,
        adjusted_by: user?.name || 'Admin User',
      };
      const res = await api.post('/inventory/adjustments', payload);
      const created = res.data;

      setAdjustments((prev) => [
        {
          id: created.id,
          item: created.item_name || '—',
          quantity: Number(created.quantity),
          reason: created.reason,
          date: created.created_at ? created.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          by: created.adjusted_by,
        },
        ...prev,
      ]);

      // Update local item stock count immediately
      setItems((prev) =>
        prev.map((item) =>
          item.id === data.item_id
            ? { ...item, current_stock: Number(item.current_stock) + Number(data.quantity) }
            : item
        )
      );

      setSuccess(true);
      reset({ item_id: '', quantity: '', reason: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error recording adjustment:', err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to record stock adjustment');
    } finally {
      setSaving(false);
    }
  };

  const historyColumns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    {
      key: 'item',
      label: 'Item',
      render: (r) => <span className="font-medium text-slate-700">{r.item}</span>,
    },
    {
      key: 'quantity',
      label: 'Qty Adj.',
      render: (r) => (
        <span className={r.quantity > 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
          {r.quantity > 0 ? `+${r.quantity}` : r.quantity}
        </span>
      ),
    },
    { key: 'reason', label: 'Reason' },
    { key: 'by', label: 'By' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-1">New Stock Adjustment</h2>
        <p className="text-sm text-slate-500 mb-5">
          Use positive values to add stock and negative values to deduct stock.
        </p>

        {success && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            <CheckCircle size={16} /> Adjustment recorded and stock updated in database.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4" noValidate>
          <Select
            label="Select Item"
            options={items.map((i) => ({
              value: i.id,
              label: `${i.sku} — ${i.name} (Stock: ${i.current_stock} ${i.unit})`,
            }))}
            placeholder="Choose an item…"
            error={errors.item_id?.message}
            required
            {...register('item_id')}
          />
          <Input
            label="Quantity (+ or −)"
            type="number"
            step="0.01"
            placeholder="e.g. -20 or +50"
            error={errors.quantity?.message}
            required
            {...register('quantity')}
          />
          <Input
            label="Reason (mandatory)"
            placeholder="e.g. Damaged stock disposal"
            error={errors.reason?.message}
            required
            {...register('reason')}
          />
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" loading={saving}>
              Record Adjustment
            </Button>
          </div>
        </form>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Adjustment History</h2>
        <DataTable columns={historyColumns} data={adjustments} loading={loading} />
      </div>
    </div>
  );
}
