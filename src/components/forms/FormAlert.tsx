import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export interface FormAlertProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const FormAlert: React.FC<FormAlertProps> = ({
  variant = 'info',
  title,
  description,
  action,
  className = '',
}) => {
  const styles = {
    info: {
      container: 'bg-blue-50/80 border-blue-200 text-[#0F172A]',
      icon: <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />,
      titleColor: 'text-[#2563EB]',
    },
    warning: {
      container: 'bg-amber-50/80 border-amber-200 text-[#0F172A]',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
      titleColor: 'text-amber-700',
    },
    error: {
      container: 'bg-rose-50/80 border-rose-200 text-[#0F172A]',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
      titleColor: 'text-rose-700',
    },
    success: {
      container: 'bg-emerald-50/80 border-emerald-200 text-[#0F172A]',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
      titleColor: 'text-emerald-700',
    },
  }[variant];

  return (
    <div className={`p-4 rounded-[14px] border flex items-start justify-between gap-3 text-xs font-sans ${styles.container} ${className}`}>
      <div className="flex items-start gap-2.5">
        {styles.icon}
        <div className="space-y-0.5 text-left">
          {title && <strong className={`font-semibold text-xs block ${styles.titleColor}`}>{title}</strong>}
          <div className="text-[12px] text-[#0F172A] font-normal leading-relaxed">{description}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
