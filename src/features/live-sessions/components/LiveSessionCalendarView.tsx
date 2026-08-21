import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Video } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { LiveSessionItem } from '../store/liveSession.store';

export interface LiveSessionCalendarViewProps {
  sessions: LiveSessionItem[];
  onSelectSession: (session: LiveSessionItem) => void;
  onCreateNewDate: (dateStr: string) => void;
}

export const LiveSessionCalendarView: React.FC<LiveSessionCalendarViewProps> = ({
  sessions,
  onSelectSession,
  onCreateNewDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(7); // August (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4 font-sans text-left">
      {/* Calendar Month Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
          <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[#64748B] dark:text-[#94A3B8] text-[11px] uppercase">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-xs font-sans">
        {/* Blank offset days */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`offset-${i}`} className="min-h-[80px] bg-slate-50/50 dark:bg-[#0B1120] rounded-xl p-1 border border-transparent" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const daySessions = sessions.filter((s) => s.scheduledDate === formattedDate);

          return (
            <div
              key={formattedDate}
              onClick={() => onCreateNewDate(formattedDate)}
              className="min-h-[85px] p-2 rounded-xl border border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#0F172A] hover:border-blue-300 dark:hover:border-[#3B82F6] transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-xs">{dayNum}</span>
                <Plus className="w-3 h-3 text-slate-300 dark:text-[#64748B] group-hover:text-blue-600 dark:group-hover:text-[#60A5FA] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Day Sessions */}
              <div className="space-y-1 mt-1">
                {daySessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSession(s);
                    }}
                    className={`p-1 rounded text-[10px] font-bold truncate flex items-center gap-1 ${
                      s.status === 'live'
                        ? 'bg-rose-500 text-white'
                        : s.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-[rgba(16,185,129,0.15)] text-emerald-900 dark:text-[#6EE7B7]'
                        : 'bg-blue-100 dark:bg-[rgba(59,130,246,0.15)] text-blue-900 dark:text-[#60A5FA]'
                    }`}
                  >
                    <Video className="w-3 h-3 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
