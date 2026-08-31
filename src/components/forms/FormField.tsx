import React from 'react';
import { FormError } from './FormError';
import { FieldHelperText } from './FieldHelperText';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
  counterText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  htmlFor,
  className = '',
  children,
  counterText,
}) => {
  return (
    <div className={`space-y-1 font-sans text-left ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
          <label htmlFor={htmlFor} className="flex items-center gap-1 cursor-pointer">
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {counterText && <span className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8]">{counterText}</span>}
        </div>
      )}
      {children}
      <FormError message={error} />
      {!error && <FieldHelperText>{helperText}</FieldHelperText>}
    </div>
  );
};
