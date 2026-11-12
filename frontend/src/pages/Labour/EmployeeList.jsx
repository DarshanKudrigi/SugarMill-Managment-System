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
import Select from '../../components/Select';
import StatusChip from '../../components/StatusChip';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { mockEmployees } from '../../utils/mockData';

const schema = z.object({
  emp_id: z.string().min(1, 'Employee ID required'),
  name: z.string().min(2, 'Name required'),
  department: z.string().min(1, 'Department required'),
  designation: z.string().min(1, 'Designation required'),
  status: z.string().min(1),
});

const DEPARTMENTS = [
  'Production',
  'Maintenance',
  'Accounts',
  'HR',
  'Security',
  'Quality',
  'Logistics',
].map((d) => ({ value: d, label: d }));

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [deleteEmp, setDeleteEmp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees/');
      const data = res.data.map((e) => ({
        ...e,
        emp_id: e.employee_code || e.emp_id,
        name: `${e.first_name || ''} ${e.last_name || ''}`.trim() || e.name,
        status: e.is_active ? 'Active' : 'Inactive',
      }));
      setEmployees(data);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using fallback:', err);
      setEmployees(mockEmployees);
      return mockEmployees;
    }
  };

  const { loading } = useFetch(fetchEmployees);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditEmp(null);
    reset({
      emp_id: `EMP-${Date.now().toString().slice(-4)}`,
      name: '',
      department: '',
      designation: '',
      status: 'Active',
    });
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditEmp(emp);
    reset(emp);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const nameParts = data.name.trim().split(' ');
      const first_name = nameParts[0] || 'Employee';
      const last_name = nameParts.slice(1).join(' ') || '.';

      if (editEmp) {
        const payload = {
          employee_code: data.emp_id,
          first_name,
          last_name,
          department: data.department,
          designation: data.designation,
          is_active: data.status === 'Active',
        };
        const res = await api.put(`/employees/${editEmp.id}`, payload);
        const updated = {
          ...res.data,
          emp_id: res.data.employee_code,
          name: `${res.data.first_name} ${res.data.last_name}`.trim(),
          status: res.data.is_active ? 'Active' : 'Inactive',
        };
        setEmployees((prev) => prev.map((e) => (e.id === editEmp.id ? updated : e)));
      } else {
        const payload = {
          employee_code: data.emp_id,
          first_name,
          last_name,
          email: `${data.emp_id.toLowerCase()}@sugarmill.com`,
          department: data.department,
          designation: data.designation,
          salary: 30000,
          is_active: data.status === 'Active',
        };
        const res = await api.post('/employees/', payload);
        const created = {
          ...res.data,
          emp_id: res.data.employee_code,
          name: `${res.data.first_name} ${res.data.last_name}`.trim(),
          status: res.data.is_active ? 'Active' : 'Inactive',
        };
        setEmployees((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving employee:', err);
      alert(err.response?.data?.detail || err.message || 'Error saving employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEmp) return;
    setDeleting(true);
    try {
      await api.delete(`/employees/${deleteEmp.id}`);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteEmp.id));
      setDeleteEmp(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert(err.response?.data?.detail || err.message || 'Error deleting employee');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'emp_id',
      label: 'Emp ID',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {r.emp_id}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Employee Name',
      render: (r) => <span className="font-medium text-slate-800">{r.name}</span>,
    },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusChip status={r.status} />,
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
            onClick={() => setDeleteEmp(r)}
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
        <h2 className="text-base font-semibold text-slate-800">Employee Directory</h2>
        <p className="text-sm text-slate-500">Manage permanent staff, mill workers, and contractors</p>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        searchKey="name"
        loading={loading}
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus size={14} /> Add Employee
          </Button>
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editEmp ? 'Edit Employee' : 'Add Employee'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Employee ID"
            placeholder="e.g. EMP-010"
            error={errors.emp_id?.message}
            required
            {...register('emp_id')}
          />
          <Input
            label="Full Name"
            placeholder="e.g. Ravi Kumar"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Select
            label="Department"
            options={DEPARTMENTS}
            placeholder="Select department"
            error={errors.department?.message}
            required
            {...register('department')}
          />
          <Input
            label="Designation"
            placeholder="e.g. Boiler Operator"
            error={errors.designation?.message}
            required
            {...register('designation')}
          />
          <Select
            label="Status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            error={errors.status?.message}
            required
            {...register('status')}
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
              {editEmp ? 'Save Changes' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteEmp)}
        onClose={() => setDeleteEmp(null)}
        onConfirm={handleDelete}
        title="Remove Employee"
        message={`Remove "${deleteEmp?.name}" from active records?`}
        confirmLabel="Remove"
        loading={deleting}
      />
    </div>
  );
}
