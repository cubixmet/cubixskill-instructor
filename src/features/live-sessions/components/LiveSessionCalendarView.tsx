import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { LiveSessionItem } from '../store/liveSession.store';
import { LiveSessionCard } from './LiveSessionCard';

export interface LiveSessionCalendarViewProps {
  sessions: LiveSessionItem[];
  onSelectSession: (session: LiveSessionItem) => void;
  onCreateNewDate: (dateStr: string) => void;
  onStart?: (id: string) => void;
  onEnd?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onJoin?: (session: LiveSessionItem) => void;
  onOpenAttendance?: (session: LiveSessionItem) => void;
  onOpenRecording?: (session: LiveSessionItem) => void;
}

export const LiveSessionCalendarView: React.FC<LiveSessionCalendarViewProps> = ({
  sessions,
  onSelectSession,
  onCreateNewDate: _,
  onStart = () => {},
  onEnd = () => {},
  onCancel = () => {},
  onDelete = () => {},
  onJoin,
  onOpenAttendance,
  onOpenRecording,
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDayNum, setSelectedDayNum] = useState<number>(today.getDate());

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

  // Selected date ISO string prefix: YYYY-MM-DD
  const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDayNum).padStart(2, '0')}`;

  const selectedDaySessions = sessions.filter((s) => s.scheduledDate === selectedDateStr);

  const formattedSelectedDateDisplay = new Date(currentYear, currentMonth, selectedDayNum).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 font-sans text-left w-full min-w-0">
      {/* CALENDAR CARD */}
      <Card padding="none" className="bg-[#111827] dark:bg-[#111827] border border-[#263244] rounded-2xl p-4 shadow-2xs space-y-4 text-white">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#F8FAFC]">
            {monthNames[currentMonth]} {currentYear}
          </h3>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#172033] hover:text-[#F8FAFC] cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#172033] hover:text-[#F8FAFC] cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[#94A3B8] text-xs">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {/* Offset days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`offset-${i}`} className="h-9 flex items-center justify-center text-transparent" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateIso = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const hasSessions = sessions.some((s) => s.scheduledDate === dateIso);
            const isSelected = selectedDayNum === dayNum;

            return (
              <button
                key={dateIso}
                type="button"
                onClick={() => setSelectedDayNum(dayNum)}
                className={`h-9 rounded-xl flex flex-col items-center justify-center relative font-medium cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'hover:bg-[#172033] text-[#CBD5E1]'
                }`}
              >
                <span>{dayNum}</span>
                {hasSessions && (
                  <span
                    className={`w-1 h-1 rounded-full absolute bottom-1 ${
                      isSelected ? 'bg-white' : 'bg-[#2563EB]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* SELECTED DAY SESSIONS LIST */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Sessions on {formattedSelectedDateDisplay}
        </h3>

        {selectedDaySessions.length > 0 ? (
          <div className="space-y-3">
            {selectedDaySessions.map((session) => (
              <LiveSessionCard
                key={session.id}
                session={session}
                onEdit={onSelectSession}
                onStart={onStart}
                onEnd={onEnd}
                onCancel={onCancel}
                onDelete={onDelete}
                onJoin={onJoin}
                onOpenAttendance={onOpenAttendance}
                onOpenRecording={onOpenRecording}
              />
            ))}
          </div>
        ) : (
          <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] text-center p-6 rounded-2xl">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              No sessions scheduled for this date.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
