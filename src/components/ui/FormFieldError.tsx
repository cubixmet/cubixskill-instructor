import React from "react";
import { AlertCircle } from "lucide-react";

export interface FormFieldErrorProps {
  id?: string;
  error?: string;
  className?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ id, error, className = "" }) => {
  if (!error) return null;

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={`text-[12px] font-medium text-rose-600 flex items-center gap-1 mt-1 ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{error}</span>
    </p>
  );
};
