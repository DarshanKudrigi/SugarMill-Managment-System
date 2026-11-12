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
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { mockCustomers } from '../../utils/mockData';
import { formatCurrency } from '../../utils/formatters';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  contact: z.string().regex(/^\d{10}$/, '10-digit number required'),
  city: z.string().min(1, 'City is required'),
});

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/');
      const data = res.data.map((c) => ({
        ...c,
        contact: c.phone || c.contact || '—',
        city: c.address ? c.address.split(',')[0].trim() : '—',
        outstanding: Number(c.credit_limit ?? c.outstanding ?? 0),
      }));
      setCustomers(data);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using fallback:', err);
      setCustomers(mockCustomers);
      return mockCustomers;
    }
  };

  const { loading } = useFetch(fetchCustomers);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditCustomer(null);
    reset({ name: '', contact: '', city: '' });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditCustomer(c);
    reset({
      name: c.name,
      contact: c.contact,
      city: c.city,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editCustomer) {
        const payload = {
          name: data.name,
          phone: data.contact,
          address: data.city,
        };
        const res = await api.put(`/customers/${editCustomer.id}`, payload);
        const updated = {
          ...res.data,
          contact: res.data.phone || data.contact,
          city: data.city,
          outstanding: Number(res.data.credit_limit ?? editCustomer.outstanding ?? 0),
        };
        setCustomers((prev) => prev.map((c) => (c.id === editCustomer.id ? updated : c)));
      } else {
        const payload = {
          customer_code: `CUST-${Date.now().toString().slice(-4)}`,
          name: data.name,
          phone: data.contact,
          address: data.city,
          credit_limit: 100000,
          is_active: true,
        };
        const res = await api.post('/customers/', payload);
        const created = {
          ...res.data,
          contact: res.data.phone || data.contact,
          city: data.city,
          outstanding: Number(res.data.credit_limit ?? 0),
        };
        setCustomers((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving customer:', err);
      alert(err.response?.data?.detail || err.message || 'Error saving customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCustomer) return;
    setDeleting(true);
    try {
      await api.delete(`/customers/${deleteCustomer.id}`);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteCustomer.id));
      setDeleteCustomer(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert(err.response?.data?.detail || err.message || 'Error deleting customer');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (r) => <span className="font-medium text-slate-800">{r.name}</span>,
    },
    { key: 'contact', label: 'Contact' },
    { key: 'city', label: 'City' },
    {
      key: 'outstanding',
      label: 'Credit Limit / Balance',
      render: (r) => (
        <span
          className={
            r.outstanding > 0
              ? 'text-orange-600 font-semibold'
              : 'text-emerald-600 font-medium'
          }
        >
          {formatCurrency(r.outstanding)}
        </span>
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
            onClick={() => setDeleteCustomer(r)}
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
        <h2 className="text-base font-semibold text-slate-800">Customers & Buyers</h2>
        <p className="text-sm text-slate-500">Manage buyer directory and credit ledger</p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        loading={loading}
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus size={14} /> Add Customer
          </Button>
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Customer / Company Name"
            placeholder="e.g. Ramesh Traders"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Input
            label="Contact Number"
            type="tel"
            placeholder="10-digit mobile"
            error={errors.contact?.message}
            required
            {...register('contact')}
          />
          <Input
            label="City"
            placeholder="e.g. Kanpur"
            error={errors.city?.message}
            required
            {...register('city')}
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
              {editCustomer ? 'Save Changes' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteCustomer)}
        onClose={() => setDeleteCustomer(null)}
        onConfirm={handleDelete}
        title="Remove Customer"
        message={`Remove "${deleteCustomer?.name}"? Outstanding ledger history may be affected.`}
        confirmLabel="Remove"
        loading={deleting}
      />
    </div>
  );
}
