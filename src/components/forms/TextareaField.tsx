import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ error, className = '', disabled, readOnly, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={Boolean(error)}
          className={`w-full p-3.5 bg-white border rounded-[12px] text-sm font-normal text-[#0F172A] transition-all duration-150 focus:outline-none resize-none ${
            error
              ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
              : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100'
          } ${disabled ? 'bg-[#F8FAFC] text-[#64748B] cursor-not-allowed border-[#E2E8F0]' : ''} ${className}`}
          {...props}
        />
        {error && <AlertCircle className="w-4.5 h-4.5 text-rose-500 absolute right-3.5 top-3.5 pointer-events-none" />}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';
