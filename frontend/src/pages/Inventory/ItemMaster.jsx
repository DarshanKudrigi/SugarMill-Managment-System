import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import StatusChip from '../../components/StatusChip';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { mockItems } from '../../utils/mockData';
import { formatNumber } from '../../utils/formatters';

const schema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  min_stock: z.coerce.number().min(0, 'Must be ≥ 0'),
});

const CATEGORIES = [
  { value: 'Chemicals', label: 'Chemicals' },
  { value: 'Spare Parts', label: 'Spare Parts' },
  { value: 'Finished Goods', label: 'Finished Goods' },
  { value: 'Raw Material', label: 'Raw Material' },
  { value: 'Consumables', label: 'Consumables' },
];

const UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'ltr', label: 'ltr' },
  { value: 'pcs', label: 'pcs' },
  { value: 'MT', label: 'MT' },
  { value: 'quintal', label: 'quintal' },
  { value: 'set', label: 'set' },
];

export default function ItemMaster() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await api.get('/inventory/');
      const data = res.data.map((i) => ({
        ...i,
        sku: i.item_code || i.sku,
        unit: i.unit_of_measure || i.unit,
        min_stock: Number(i.minimum_stock_level ?? i.min_stock ?? 0),
        current_stock: Number(i.current_stock ?? 0),
      }));
      setItems(data);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using fallback:', err);
      setItems(mockItems);
      return mockItems;
    }
  };

  const { loading } = useFetch(fetchItems);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditItem(null);
    reset({
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      name: '',
      category: '',
      unit: '',
      min_stock: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    reset({
      sku: item.sku,
      name: item.name,
      category: item.category,
      unit: item.unit,
      min_stock: item.min_stock,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editItem) {
        const payload = {
          item_code: data.sku,
          name: data.name,
          category: data.category,
          unit_of_measure: data.unit,
          minimum_stock_level: Number(data.min_stock),
        };
        const res = await api.put(`/inventory/${editItem.id}`, payload);
        const updated = {
          ...res.data,
          sku: res.data.item_code,
          unit: res.data.unit_of_measure,
          min_stock: Number(res.data.minimum_stock_level),
          current_stock: Number(res.data.current_stock ?? editItem.current_stock ?? 0),
        };
        setItems((prev) => prev.map((i) => (i.id === editItem.id ? updated : i)));
      } else {
        const payload = {
          item_code: data.sku,
          name: data.name,
          category: data.category,
          unit_of_measure: data.unit,
          current_stock: 0,
          minimum_stock_level: Number(data.min_stock),
          unit_price: 100,
          is_active: true,
        };
        const res = await api.post('/inventory/', payload);
        const created = {
          ...res.data,
          sku: res.data.item_code,
          unit: res.data.unit_of_measure,
          min_stock: Number(res.data.minimum_stock_level),
          current_stock: Number(res.data.current_stock ?? 0),
        };
        setItems((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving item:', err);
      alert(err.response?.data?.detail || err.message || 'Error saving inventory item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await api.delete(`/inventory/${deleteItem.id}`);
      setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      setDeleteItem(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      alert(err.response?.data?.detail || err.message || 'Error deleting inventory item');
    } finally {
      setDeleting(false);
    }
  };

  const getStockStatus = (item) => {
    if (item.current_stock === 0) return 'Out of Stock';
    if (item.current_stock <= item.min_stock) return 'Low Stock';
    return 'In Stock';
  };

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {r.sku}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Item Name',
      render: (r) => <span className="font-medium text-slate-800">{r.name}</span>,
    },
    { key: 'category', label: 'Category' },
    {
      key: 'current_stock',
      label: 'Current Stock',
      render: (r) => `${formatNumber(r.current_stock)} ${r.unit}`,
    },
    {
      key: 'min_stock',
      label: 'Min Stock',
      render: (r) => `${formatNumber(r.min_stock)} ${r.unit}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusChip status={getStockStatus(r)} />,
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
            onClick={() => setDeleteItem(r)}
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
        <h2 className="text-base font-semibold text-slate-800">Item Master</h2>
        <p className="text-sm text-slate-500">
          Catalog of chemicals, spare parts, finished goods, and consumables
        </p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="name"
        loading={loading}
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus size={14} /> Add Item
          </Button>
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Item' : 'Add Item'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="SKU / Item Code"
            placeholder="e.g. CH-005"
            error={errors.sku?.message}
            required
            {...register('sku')}
          />
          <Input
            label="Item Name"
            placeholder="e.g. Caustic Soda"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Select
            label="Category"
            options={CATEGORIES}
            placeholder="Select category"
            error={errors.category?.message}
            required
            {...register('category')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Unit of Measure"
              options={UNITS}
              placeholder="Unit"
              error={errors.unit?.message}
              required
              {...register('unit')}
            />
            <Input
              label="Min Stock Level"
              type="number"
              placeholder="0"
              error={errors.min_stock?.message}
              required
              {...register('min_stock')}
            />
          </div>
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
              {editItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Remove Item"
        message={`Remove "${deleteItem?.name}" from the inventory master?`}
        confirmLabel="Remove"
        loading={deleting}
      />
    </div>
  );
}
