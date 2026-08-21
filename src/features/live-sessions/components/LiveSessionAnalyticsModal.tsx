import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { LiveSessionItem } from '../store/liveSession.store';

export interface LiveSessionAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: LiveSessionItem[];
}

export const LiveSessionAnalyticsModal: React.FC<LiveSessionAnalyticsModalProps> = ({
  isOpen,
  onClose,
  sessions,
}) => {
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalCompleted = completedSessions.length;

  const avgAttendance =
    totalCompleted > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => {
            const records = s.attendanceRecords || [];
            const joined = records.filter((r) => r.status === 'joined').length;
            const total = records.length || 1;
            return sum + (joined / total) * 100;
          }, 0) / totalCompleted
        )
      : 0;

  const totalMinutesTaught = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Virtual Classroom Telemetry & Analytics"
      subtitle="Comprehensive view of student attendance, session completion, and teaching hours."
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-blue-50 dark:bg-[#0F172A] border border-blue-200 dark:border-[#334155] rounded-xl space-y-1">
            <div className="flex items-center justify-between text-blue-700 dark:text-[#60A5FA] font-bold">
              <span>Avg Student Attendance</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-blue-950 dark:text-[#F8FAFC]">{avgAttendance}%</h3>
            <p className="text-[10px] text-blue-800 dark:text-[#94A3B8] font-medium">Joined vs registered conversion</p>
          </div>

          <div className="p-3.5 bg-indigo-50 dark:bg-[#0F172A] border border-indigo-200 dark:border-[#334155] rounded-xl space-y-1">
            <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 font-bold">
              <span>Live Hours Taught</span>
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-indigo-950 dark:text-[#F8FAFC]">{(totalMinutesTaught / 60).toFixed(1)} Hours</h3>
            <p className="text-[10px] text-indigo-800 dark:text-[#94A3B8] font-medium">Across all completed webinars</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
          <Button variant="outline" onClick={onClose} className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1]">
            Close Analytics
          </Button>
        </div>
      </div>
    </Modal>
  );
};
