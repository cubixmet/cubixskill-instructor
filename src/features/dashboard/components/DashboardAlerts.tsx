import React from 'react';
import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';
import type { DashboardAlertItem } from '../types/dashboard.types';

interface DashboardAlertsProps {
  alerts: DashboardAlertItem[];
  onDismiss?: (id: string) => void;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((al) => {
        const isCritical = al.severity === 'critical';
        const isWarning = al.severity === 'warning';

        return (
          <div
            key={al.id}
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
              isCritical
                ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
                : isWarning
                ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCritical ? (
                <ShieldAlert className="w-5 h-5 shrink-0 text-[#DC2626]" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-[#F59E0B]" />
              ) : (
                <Info className="w-5 h-5 shrink-0 text-[#2563EB]" />
              )}

              <div className="space-y-1">
                <h4 className="text-xs font-black">{al.title}</h4>
                <p className="text-xs opacity-90">{al.description}</p>
                {al.primaryAction && (
                  <a
                    href={al.primaryAction.href}
                    className="inline-block mt-1 text-xs font-bold underline hover:opacity-80"
                  >
                    {al.primaryAction.label} &rarr;
                  </a>
                )}
              </div>
            </div>

            {onDismiss && (
              <button
                onClick={() => onDismiss(al.id)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 opacity-70" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
