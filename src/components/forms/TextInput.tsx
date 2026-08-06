import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, success, leftIcon, rightIcon, className = '', disabled, readOnly, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={Boolean(error)}
          className={`w-full h-[46px] sm:h-[48px] px-3.5 bg-white border rounded-[12px] text-sm font-normal text-[#0F172A] transition-all duration-150 focus:outline-none ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon || error || success ? 'pr-10' : ''} ${
            error
              ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
              : success
              ? 'border-emerald-500 bg-emerald-50/20 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
              : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100'
          } ${disabled ? 'bg-[#F8FAFC] text-[#64748B] cursor-not-allowed border-[#E2E8F0]' : ''} ${
            readOnly ? 'bg-[#F8FAFC] text-[#0F172A] cursor-default' : ''
          } ${className}`}
          {...props}
        />

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
          {error && <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />}
          {success && !error && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />}
          {rightIcon && !error && !success && rightIcon}
        </div>
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
