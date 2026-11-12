import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import StatusChip from '../../components/StatusChip';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { mockFarmers } from '../../utils/mockData';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  village: z.string().min(1, 'Village is required'),
  contact: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit number'),
});

export default function FarmerDirectory() {
  const [farmers, setFarmers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editFarmer, setEditFarmer] = useState(null);
  const [deleteFarmer, setDeleteFarmer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFarmers = async () => {
    try {
      const res = await api.get('/farmers/');
      const data = res.data.map((f) => ({
        ...f,
        contact: f.phone || f.contact || '—',
        pending_balance: f.pending_balance ?? 0,
        total_supplied: Number(f.total_acreage ?? f.total_supplied ?? 0),
      }));
      setFarmers(data);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using fallback:', err);
      setFarmers(mockFarmers);
      return mockFarmers;
    }
  };

  const { loading } = useFetch(fetchFarmers);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditFarmer(null);
    reset({ name: '', village: '', contact: '' });
    setModalOpen(true);
  };

  const openEdit = (farmer) => {
    setEditFarmer(farmer);
    reset({
      name: farmer.name,
      village: farmer.village,
      contact: farmer.contact,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editFarmer) {
        const payload = {
          name: data.name,
          village: data.village,
          phone: data.contact,
        };
        const res = await api.put(`/farmers/${editFarmer.id}`, payload);
        const updated = {
          ...res.data,
          contact: res.data.phone || data.contact,
          pending_balance: editFarmer.pending_balance ?? 0,
          total_supplied: Number(res.data.total_acreage ?? editFarmer.total_supplied ?? 0),
        };
        setFarmers((prev) => prev.map((f) => (f.id === editFarmer.id ? updated : f)));
      } else {
        const payload = {
          farmer_code: `FAR-${Date.now().toString().slice(-4)}`,
          name: data.name,
          village: data.village,
          phone: data.contact,
          total_acreage: 0,
          is_active: true,
        };
        const res = await api.post('/farmers/', payload);
        const created = {
          ...res.data,
          contact: res.data.phone || data.contact,
          pending_balance: 0,
          total_supplied: Number(res.data.total_acreage ?? 0),
        };
        setFarmers((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving farmer:', err);
      alert(err.response?.data?.detail || err.message || 'Error saving farmer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteFarmer) return;
    setDeleting(true);
    try {
      await api.delete(`/farmers/${deleteFarmer.id}`);
      setFarmers((prev) => prev.filter((f) => f.id !== deleteFarmer.id));
      setDeleteFarmer(null);
    } catch (err) {
      console.error('Error deleting farmer:', err);
      alert(err.response?.data?.detail || err.message || 'Error deleting farmer');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Farmer Name',
      render: (r) => <span className="font-medium text-slate-800">{r.name}</span>,
    },
    { key: 'village', label: 'Village' },
    { key: 'contact', label: 'Contact' },
    {
      key: 'total_supplied',
      label: 'Acreage / Supply',
      render: (r) => `${formatNumber(r.total_supplied)} qtl`,
    },
    {
      key: 'pending_balance',
      label: 'Pending Balance',
      render: (r) => (
        <span
          className={
            r.pending_balance > 0
              ? 'text-orange-600 font-semibold'
              : 'text-emerald-600 font-medium'
          }
        >
          {formatCurrency(r.pending_balance)}
        </span>
      ),
    },
    {
      key: 'bal_status',
      label: 'Status',
      render: (r) => (
        <StatusChip status={r.pending_balance > 0 ? 'Pending' : 'Paid'} />
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(r)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            aria-label="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteFarmer(r)}
            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Farmer Directory</h2>
        <p className="text-sm text-slate-500">View and manage all registered farmers</p>
      </div>

      <DataTable
        columns={columns}
        data={farmers}
        searchKey="name"
        loading={loading}
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus size={14} /> Add Farmer
          </Button>
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editFarmer ? 'Edit Farmer' : 'Add Farmer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Bharat Singh"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Input
            label="Village / Town"
            placeholder="e.g. Rampur"
            error={errors.village?.message}
            required
            {...register('village')}
          />
          <Input
            label="Contact Number"
            type="tel"
            placeholder="10-digit mobile"
            error={errors.contact?.message}
            required
            {...register('contact')}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={saving}>
              {editFarmer ? 'Save Changes' : 'Add Farmer'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteFarmer)}
        onClose={() => setDeleteFarmer(null)}
        onConfirm={handleDelete}
        title="Remove Farmer"
        message={`Remove "${deleteFarmer?.name}" from the directory? This cannot be undone.`}
        confirmLabel="Remove"
        loading={deleting}
      />
    </div>
  );
}
