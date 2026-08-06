import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, Award } from 'lucide-react';
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
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-blue-700 font-bold">
              <span>Avg Student Attendance</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-blue-950">{avgAttendance}%</h3>
            <p className="text-[10px] text-blue-800 font-medium">Joined vs registered conversion</p>
          </div>

          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-indigo-700 font-bold">
              <span>Live Hours Taught</span>
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-indigo-950">{(totalMinutesTaught / 60).toFixed(1)} Hours</h3>
            <p className="text-[10px] text-indigo-800 font-medium">Across all completed webinars</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Close Analytics
          </Button>
        </div>
      </div>
    </Modal>
  );
};
