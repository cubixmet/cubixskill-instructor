import React, { forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: boolean;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ options, error, className = '', disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`w-full h-[46px] sm:h-[48px] pl-3.5 pr-10 bg-white border rounded-[12px] text-sm font-normal text-[#0F172A] appearance-none transition-all duration-150 focus:outline-none cursor-pointer ${
            error
              ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
              : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100'
          } ${disabled ? 'bg-[#F8FAFC] text-[#64748B] cursor-not-allowed border-[#E2E8F0]' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
          {error ? (
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
          )}
        </div>
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
