import React from 'react';
import { Clock, Plus, Minus } from 'lucide-react';

interface DurationPickerProps {
  hours: number;
  minutes: number;
  onHoursChange: (h: number) => void;
  onMinutesChange: (m: number) => void;
  label?: string;
}

const DURATION_PRESETS = [
  { label: '1h', h: 1, m: 0 },
  { label: '2h 30m', h: 2, m: 30 },
  { label: '4h 30m', h: 4, m: 30 },
  { label: '8h', h: 8, m: 0 },
  { label: '15h', h: 15, m: 0 },
  { label: '24h', h: 24, m: 0 },
];

export const DurationPicker: React.FC<DurationPickerProps> = ({
  hours = 0,
  minutes = 0,
  onHoursChange,
  onMinutesChange,
  label = 'Estimated Course Duration',
}) => {
  const safeHours = Math.max(0, Number(hours) || 0);
  const safeMinutes = Math.min(59, Math.max(0, Number(minutes) || 0));

  const formatTotalDuration = () => {
    if (safeHours === 0 && safeMinutes === 0) return '0m';
    const parts = [];
    if (safeHours > 0) parts.push(`${safeHours}h`);
    if (safeMinutes > 0) parts.push(`${safeMinutes}m`);
    return parts.join(' ');
  };

  const handleHoursInc = (delta: number) => {
    onHoursChange(Math.max(0, safeHours + delta));
  };

  const handleMinutesInc = (delta: number) => {
    let newMins = safeMinutes + delta;
    if (newMins >= 60) {
      onHoursChange(safeHours + Math.floor(newMins / 60));
      newMins = newMins % 60;
    } else if (newMins < 0) {
      if (safeHours > 0) {
        onHoursChange(safeHours - 1);
        newMins = 60 + newMins;
      } else {
        newMins = 0;
      }
    }
    onMinutesChange(newMins);
  };

  return (
    <div className="space-y-2 text-left font-sans max-w-full">
      {/* Header with compact total badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{label}</span>
        </label>
        <span className="px-2 py-0.5 bg-blue-50 text-[#2563EB] text-[11px] font-bold rounded-lg border border-blue-100 shrink-0">
          Total: {formatTotalDuration()}
        </span>
      </div>

      {/* Compact Hours & Minutes Control Row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Hours Box */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-[#64748B]">Hours</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleHoursInc(-1)}
              disabled={safeHours <= 0}
              className="w-6 h-6 bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-md flex items-center justify-center text-[#0F172A] disabled:opacity-40 cursor-pointer transition-colors"
              title="Decrease Hours"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              min={0}
              value={safeHours}
              onChange={(e) => onHoursChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-10 text-center text-xs font-bold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-md h-6 focus:outline-none focus:border-[#2563EB]"
            />
            <button
              type="button"
              onClick={() => handleHoursInc(1)}
              className="w-6 h-6 bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-md flex items-center justify-center text-[#0F172A] cursor-pointer transition-colors"
              title="Increase Hours"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Minutes Box */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-[#64748B]">Minutes</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleMinutesInc(-5)}
              className="w-6 h-6 bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-md flex items-center justify-center text-[#0F172A] cursor-pointer transition-colors"
              title="Decrease Minutes (-5m)"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              min={0}
              max={59}
              value={safeMinutes}
              onChange={(e) => onMinutesChange(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-10 text-center text-xs font-bold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-md h-6 focus:outline-none focus:border-[#2563EB]"
            />
            <button
              type="button"
              onClick={() => handleMinutesInc(5)}
              className="w-6 h-6 bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-md flex items-center justify-center text-[#0F172A] cursor-pointer transition-colors"
              title="Increase Minutes (+5m)"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Compact Quick Preset Row */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[11px] font-semibold text-[#64748B] shrink-0">Quick:</span>
        <div className="flex items-center gap-1 flex-wrap">
          {DURATION_PRESETS.map((p) => {
            const isSelected = safeHours === p.h && safeMinutes === p.m;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  onHoursChange(p.h);
                  onMinutesChange(p.m);
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
