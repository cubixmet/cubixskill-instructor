import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
  id?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, id }) => {
  if (!message) return null;

  return (
    <div id={id} className="flex items-center gap-1.5 text-rose-600 text-[13px] font-medium pt-1 animate-fadeIn">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
