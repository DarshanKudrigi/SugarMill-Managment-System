import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, CheckCircle, ArrowLeft } from 'lucide-react';
import { mockCustomers, mockItems } from '../../utils/mockData';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';

const lineSchema = z.object({
  item_id: z.string().min(1, 'Select item'),
  quantity: z.coerce.number().positive('Must be > 0'),
  rate: z.coerce.number().positive('Must be > 0'),
  tax_pct: z.coerce.number().min(0).max(100),
});

const schema = z.object({
  customer_id: z.string().min(1, 'Select a customer'),
  invoice_date: z.string().min(1, 'Date required'),
  due_date: z.string().min(1, 'Due date required'),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1, 'Add at least one line item'),
});

function LineRow({ index, register, control, errors, items, onRemove, canRemove }) {
  const qty = useWatch({ control, name: `lines.${index}.quantity` }) || 0;
  const rate = useWatch({ control, name: `lines.${index}.rate` }) || 0;
  const taxPct = useWatch({ control, name: `lines.${index}.tax_pct` }) || 0;
  const subtotal = Number(qty) * Number(rate);
  const taxAmt = (subtotal * Number(taxPct)) / 100;
  const lineTotal = subtotal + taxAmt;

  return (
    <tr>
      {/* Item */}
      <td className="px-2 py-2 min-w-[180px]">
        <select
          {...register(`lines.${index}.item_id`)}
          className={`block w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500
            ${errors?.lines?.[index]?.item_id ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
        >
          <option value="">Select item…</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} ({i.unit || i.unit_of_measure})
            </option>
          ))}
        </select>
      </td>
      {/* Qty */}
      <td className="px-2 py-2 w-24">
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          {...register(`lines.${index}.quantity`)}
          className={`block w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500
            ${errors?.lines?.[index]?.quantity ? 'border-red-400' : 'border-slate-300'}`}
        />
      </td>
      {/* Rate */}
      <td className="px-2 py-2 w-28">
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          {...register(`lines.${index}.rate`)}
          className={`block w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500
            ${errors?.lines?.[index]?.rate ? 'border-red-400' : 'border-slate-300'}`}
        />
      </td>
      {/* Tax % */}
      <td className="px-2 py-2 w-20">
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          placeholder="0"
          {...register(`lines.${index}.tax_pct`)}
          className="block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </td>
      {/* Subtotal */}
      <td className="px-2 py-2 w-28 text-right text-sm font-medium text-slate-700 whitespace-nowrap">
        {formatCurrency(subtotal)}
      </td>
      {/* Tax */}
      <td className="px-2 py-2 w-24 text-right text-sm text-slate-500 whitespace-nowrap">
        {formatCurrency(taxAmt)}
      </td>
      {/* Total */}
      <td className="px-2 py-2 w-28 text-right text-sm font-semibold text-emerald-700 whitespace-nowrap">
        {formatCurrency(lineTotal)}
      </td>
      {/* Remove */}
      <td className="px-2 py-2 w-10 text-center">
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
            aria-label="Remove line"
          >
            <Trash2 size={14} />
          </button>
        )}
      </td>
    </tr>
  );
}

function GrandTotal({ control }) {
  const lines = useWatch({ control, name: 'lines' }) || [];
  let subtotal = 0;
  let taxTotal = 0;
  lines.forEach((l) => {
    const sub = Number(l.quantity || 0) * Number(l.rate || 0);
    const tax = (sub * Number(l.tax_pct || 0)) / 100;
    subtotal += sub;
    taxTotal += tax;
  });
  const grand = subtotal + taxTotal;

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
      <div className="flex justify-between text-sm text-slate-600">
        <span>Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>Total Tax</span>
        <span className="font-medium">{formatCurrency(taxTotal)}</span>
      </div>
      <div className="flex justify-between text-base font-bold text-slate-800 border-t border-slate-300 pt-2">
        <span>Grand Total</span>
        <span className="text-emerald-700">{formatCurrency(grand)}</span>
      </div>
    </div>
  );
}

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useFetch(async () => {
    try {
      const [custRes, itemRes] = await Promise.all([
        api.get('/customers/'),
        api.get('/inventory/'),
      ]);
      setCustomers(custRes.data);
      setItems(itemRes.data);
    } catch (err) {
      console.warn('Backend unavailable, using fallback:', err);
      setCustomers(mockCustomers);
      setItems(mockItems);
    }
  });

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: '',
      invoice_date: today,
      due_date: today,
      notes: '',
      lines: [{ item_id: '', quantity: '', rate: '', tax_pct: 5 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      let subtotal = 0;
      let taxTotal = 0;
      data.lines.forEach((l) => {
        const sub = Number(l.quantity || 0) * Number(l.rate || 0);
        const tax = (sub * Number(l.tax_pct || 0)) / 100;
        subtotal += sub;
        taxTotal += tax;
      });

      const payload = {
        invoice_number: `INV-${Date.now().toString().slice(-4)}`,
        customer_id: data.customer_id,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        total_amount: subtotal,
        tax_amount: taxTotal,
        net_amount: subtotal + taxTotal,
        status: 'Draft',
        notes: data.notes || '',
      };

      await api.post('/invoices/', payload);
      setSubmitted(true);
      setTimeout(() => navigate('/sales/invoices'), 1500);
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert(err.response?.data?.detail || err.message || 'Error creating invoice');
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="text-emerald-600" size={32} />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Invoice Created!</h2>
        <p className="text-sm text-slate-500">Redirecting to invoices list…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/sales/invoices')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-base font-semibold text-slate-800">Create New Invoice</h2>
          <p className="text-sm text-slate-500">Fill in the details and add line items</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        {/* Meta fields */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Select
              label="Customer"
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select customer…"
              error={errors.customer_id?.message}
              required
              {...register('customer_id')}
            />
          </div>
          <div>
            <Input
              label="Invoice Date"
              type="date"
              error={errors.invoice_date?.message}
              required
              {...register('invoice_date')}
            />
          </div>
          <div>
            <Input
              label="Due Date"
              type="date"
              error={errors.due_date?.message}
              required
              {...register('due_date')}
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Line Items</h3>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => append({ item_id: '', quantity: '', rate: '', tax_pct: 5 })}
            >
              <Plus size={13} /> Add Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-2 py-2">Item</th>
                  <th className="px-2 py-2">Qty</th>
                  <th className="px-2 py-2">Rate (₹)</th>
                  <th className="px-2 py-2">Tax %</th>
                  <th className="px-2 py-2 text-right">Subtotal</th>
                  <th className="px-2 py-2 text-right">Tax</th>
                  <th className="px-2 py-2 text-right">Total</th>
                  <th className="px-2 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((field, idx) => (
                  <LineRow
                    key={field.id}
                    index={idx}
                    register={register}
                    control={control}
                    errors={errors}
                    items={items}
                    onRemove={() => remove(idx)}
                    canRemove={fields.length > 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {errors.lines?.root && (
            <p className="text-xs text-red-500 px-6 py-2">{errors.lines.root.message}</p>
          )}
        </div>

        {/* Bottom row: Notes + Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Notes / Terms
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="e.g. Payment due within 14 days. 18% p.a. interest after due date."
              className="block w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <GrandTotal control={control} />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/sales/invoices')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Create & Issue Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
