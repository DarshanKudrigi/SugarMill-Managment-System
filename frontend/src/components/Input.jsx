import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
