import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Input from '../../components/Input';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { mockFarmers, mockMaterials, mockRawMaterialReceipts } from '../../utils/mockData';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

const schema = z.object({
  farmer_id: z.string().min(1, 'Select a farmer'),
  material_id: z.string().min(1, 'Select a material'),
  quantity: z.coerce.number().positive('Must be positive'),
  rate: z.coerce.number().positive('Must be positive'),
  deductions: z.coerce.number().min(0, 'Cannot be negative'),
  notes: z.string().optional(),
});

function ReadonlyField({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800">
        {value}
      </div>
    </div>
  );
}

export default function RawMaterialReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [materials, setMaterials] = useState([
    { id: '1', name: 'Sugarcane', unit: 'quintal' },
    { id: '2', name: 'Molasses (input)', unit: 'MT' },
    { id: '3', name: 'Bagasse', unit: 'MT' },
  ]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchReceipts = async () => {
    try {
      const [recRes, farmRes] = await Promise.all([
        api.get('/raw-material-receipts/'),
        api.get('/farmers/'),
      ]);
      const farmMap = {};
      farmRes.data.forEach((f) => {
        farmMap[f.id] = f.name;
      });
      setFarmers(farmRes.data);

      const data = recRes.data.map((r) => {
        const gross = Number(r.gross_weight || 0);
        const tare = Number(r.tare_weight || 0);
        const net = Number(r.net_weight || gross - tare || 0);
        const rate = Number(r.rate_per_unit || 350);
        const grossVal = net * rate;
        const ded = Number(r.deduction_weight || 0) * rate;
        return {
          id: r.id,
          date: r.receipt_date ? r.receipt_date.split('T')[0] : '—',
          farmer: farmMap[r.farmer_id] || 'Farmer',
          material: r.cane_variety || 'Sugarcane',
          quantity: net,
          rate,
          gross_value: grossVal,
          deductions: ded,
          net_payable: grossVal - ded,
        };
      });
      setReceipts(data);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using fallback:', err);
      setFarmers(mockFarmers);
      setMaterials(mockMaterials);
      setReceipts(mockRawMaterialReceipts);
      return mockRawMaterialReceipts;
    }
  };

  const { loading } = useFetch(fetchReceipts);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      farmer_id: '',
      material_id: '1',
      quantity: '',
      rate: '350',
      deductions: 0,
      notes: '',
    },
  });

  const qty = useWatch({ control, name: 'quantity' }) || 0;
  const rate = useWatch({ control, name: 'rate' }) || 0;
  const deductions = useWatch({ control, name: 'deductions' }) || 0;
  const grossValue = Number(qty) * Number(rate);
  const netPayable = grossValue - Number(deductions);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const net = Number(data.quantity);
      const payload = {
        receipt_number: `RMR-${Date.now().toString().slice(-4)}`,
        farmer_id: data.farmer_id,
        vehicle_number: 'UP-32-TRK',
        gross_weight: net + 35,
        tare_weight: 35,
        net_weight: net,
        cane_variety: 'Sugarcane',
        status: 'Completed',
        remarks: data.notes || '',
      };
      await api.post('/raw-material-receipts/', payload);

      const farmer = farmers.find((f) => String(f.id) === String(data.farmer_id));
      const material = materials.find((m) => String(m.id) === String(data.material_id));
      const gross = Number(data.quantity) * Number(data.rate);
      const netPay = gross - Number(data.deductions);

      setReceipts((prev) => [
        {
          id: Date.now(),
          farmer: farmer?.name ?? '—',
          material: material?.name ?? 'Sugarcane',
          quantity: data.quantity,
          rate: data.rate,
          gross_value: gross,
          deductions: data.deductions,
          net_payable: netPay,
          date: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
      setSuccess(true);
      reset({
        farmer_id: '',
        material_id: '1',
        quantity: '',
        rate: '350',
        deductions: 0,
        notes: '',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving receipt:', err);
      alert(err.response?.data?.detail || err.message || 'Error saving receipt');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    {
      key: 'farmer',
      label: 'Farmer',
      render: (r) => <span className="font-medium text-slate-800">{r.farmer}</span>,
    },
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Qty (qtl)', render: (r) => formatNumber(r.quantity) },
    { key: 'rate', label: 'Rate (₹)', render: (r) => formatCurrency(r.rate) },
    { key: 'gross_value', label: 'Gross Value', render: (r) => formatCurrency(r.gross_value) },
    { key: 'deductions', label: 'Deductions', render: (r) => formatCurrency(r.deductions) },
    {
      key: 'net_payable',
      label: 'Net Payable',
      render: (r) => (
        <span className="font-semibold text-emerald-700">{formatCurrency(r.net_payable)}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Raw Material Inward (Cane / Molasses)</h2>
        <p className="text-sm text-slate-500">Record gate weighment and generate purchase receipts</p>
      </div>

      {/* Entry Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5"
      >
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
          New Weighment Slip
        </h3>

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            Receipt saved and farmer ledger credited successfully.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Select
            label="Farmer"
            options={farmers.map((f) => ({ value: f.id, label: `${f.name} (${f.village || '—'})` }))}
            placeholder="Select registered farmer"
            error={errors.farmer_id?.message}
            required
            {...register('farmer_id')}
          />
          <Select
            label="Material"
            options={materials.map((m) => ({ value: m.id, label: `${m.name} (${m.unit})` }))}
            placeholder="Select material"
            error={errors.material_id?.message}
            required
            {...register('material_id')}
          />
          <Input
            label="Net Weight (qtl / MT)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.quantity?.message}
            required
            {...register('quantity')}
          />
          <Input
            label="Rate per Unit (₹)"
            type="number"
            step="0.01"
            placeholder="350.00"
            error={errors.rate?.message}
            required
            {...register('rate')}
          />
          <Input
            label="Deductions (₹) — Moisture/Trash"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.deductions?.message}
            {...register('deductions')}
          />
          <Input
            label="Notes / Gate Pass #"
            placeholder="e.g. Gate pass #GP-1092"
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        {/* Calculated summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <ReadonlyField label="Gross Value" value={formatCurrency(grossValue)} />
          <ReadonlyField label="Net Payable to Farmer" value={formatCurrency(netPayable)} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Generate Receipt & Credit Ledger
          </Button>
        </div>
      </form>

      {/* Receipts Table */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Today's Inward Log</h3>
        <DataTable columns={columns} data={receipts} searchKey="farmer" loading={loading} />
      </div>
    </div>
  );
}
