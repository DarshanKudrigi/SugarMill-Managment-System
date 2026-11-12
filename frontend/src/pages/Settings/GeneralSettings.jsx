import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useContext } from 'react';
import { TenantContext } from '../../context/TenantContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';

const schema = z.object({
  name:                z.string().min(2, 'Company name required'),
  currency:            z.string().min(1),
  timezone:            z.string().min(1),
  financialYearStart:  z.string().min(1, 'Date required'),
});

const TIMEZONES = [
  { value: 'Asia/Kolkata',   label: 'Asia/Kolkata (IST +5:30)' },
  { value: 'UTC',            label: 'UTC' },
  { value: 'Asia/Dubai',     label: 'Asia/Dubai (GST +4:00)' },
];

export default function GeneralSettings() {
  const { tenant, setTenant } = useContext(TenantContext);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: tenant,
  });

  const onSubmit = async (data) => {
    setTenant((prev) => ({ ...prev, ...data }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">General Settings</h2>
        <p className="text-sm text-slate-500">Configure your company and system preferences</p>
      </div>

      {saved && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle size={16} /> Settings saved.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input label="Company Name" error={errors.name?.message} required {...register('name')} />
          <Select
            label="Currency"
            options={[{ value: 'INR', label: '₹ Indian Rupee (INR)' }, { value: 'USD', label: '$ US Dollar (USD)' }]}
            error={errors.currency?.message}
            required
            {...register('currency')}
          />
          <Select label="Timezone" options={TIMEZONES} error={errors.timezone?.message} required {...register('timezone')} />
          <Input label="Financial Year Start" type="date" error={errors.financialYearStart?.message} required {...register('financialYearStart')} />
          <div className="flex justify-end pt-2">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
