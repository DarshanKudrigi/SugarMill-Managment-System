import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/Button';

const schema = z.object({
  email:    z.string().trim().email('Enter a valid email'),
  password: z.string().trim().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    setServerError('');
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-modal">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 px-8 py-6 text-white text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Leaf size={28} />
              </div>
            </div>
            <h1 className="text-xl font-bold">Sugar Mill ERP</h1>
            <p className="text-emerald-100 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            {serverError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {serverError}
              </div>
            )}

            {/* Demo credentials hint */}
            <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
              <strong>Demo credentials:</strong> admin@sugarmill.com / password
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@sugarmill.com"
                  {...register('email')}
                  className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition
                    ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`block w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400
                      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition
                      ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
                Sign In
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          © 2026 Sugar Mill ERP. Multi-tenant SaaS Platform.
        </p>
      </div>
    </div>
  );
}
