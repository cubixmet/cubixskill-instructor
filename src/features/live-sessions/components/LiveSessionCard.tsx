import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Edit2,
  Trash2,
  MoreVertical,
  XCircle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import type { LiveSessionItem } from '../store/liveSession.store';

export interface LiveSessionCardProps {
  session: LiveSessionItem;
  onEdit: (session: LiveSessionItem) => void;
  onStart: (id: string) => void;
  onEnd: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onJoin?: (session: LiveSessionItem) => void;
  onOpenAttendance?: (session: LiveSessionItem) => void;
  onOpenRecording?: (session: LiveSessionItem) => void;
}

export const LiveSessionCard: React.FC<LiveSessionCardProps> = ({
  session,
  onEdit,
  onCancel,
  onDelete,
  onJoin,
  onOpenAttendance,
  onOpenRecording,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleJoinMeeting = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onJoin) {
      onJoin(session);
    } else if (session.meetingUrl) {
      window.open(session.meetingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'live') {
      return (
        <Badge variant="error" size="sm" className="font-bold flex items-center gap-1 text-[11px] bg-rose-500 text-white border-none px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live Now
        </Badge>
      );
    }
    if (status === 'upcoming') {
      return (
        <Badge variant="info" size="sm" className="font-semibold text-[11px] bg-blue-500/10 dark:bg-blue-500/20 text-[#2563EB] dark:text-[#60A5FA] border border-blue-500/20 px-2.5 py-0.5 rounded-full">
          Upcoming
        </Badge>
      );
    }
    if (status === 'completed') {
      return (
        <Badge variant="success" size="sm" className="font-semibold text-[11px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-[#6EE7B7] border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          Completed
        </Badge>
      );
    }
    if (session.isRecorded && session.recordingUrl) {
      return (
        <Badge variant="neutral" size="sm" className="font-semibold text-[11px] bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
          Recorded
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="sm" className="font-semibold text-[11px] bg-slate-500/10 text-slate-500 dark:text-[#94A3B8] border border-slate-500/20 px-2.5 py-0.5 rounded-full">
        Cancelled
      </Badge>
    );
  };

  const records = session.attendanceRecords || [];
  const joinedCount = records.filter((r) => r.status === 'joined').length;
  const maxParticipants = session.maxParticipants || 40;

  return (
    <>
      <Card
        padding="none"
        className={`bg-white dark:bg-[#111827] border transition-all shadow-2xs font-sans text-xs text-left p-3.5 sm:p-4 space-y-3 w-full max-w-full min-w-0 rounded-2xl ${
          session.status === 'live'
            ? 'border-rose-500/50 ring-1 ring-rose-500/30 bg-rose-50/20 dark:bg-rose-950/20'
            : 'border-[#E2E8F0] dark:border-[#263244] hover:bg-slate-50/50 dark:hover:bg-[#172033]/60'
        }`}
      >
        {/* TOP ROW: BADGE + 3-DOT MENU */}
        <div className="flex items-center justify-between gap-2 w-full min-w-0">
          <div className="shrink-0">{getStatusBadge(session.status)}</div>

          {/* 3-DOT MENU BUTTON */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 -mr-2 flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-full cursor-pointer transition-colors"
              aria-label="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl py-1 text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(session);
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-[#172033] dark:hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
                  <span>Edit Session</span>
                </button>

                {session.status === 'upcoming' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onCancel(session.id);
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-[#172033] flex items-center gap-2 text-amber-600 dark:text-amber-400 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Session</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(session.id);
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-[#172033] flex items-center gap-2 text-rose-600 dark:text-[#F87171] cursor-pointer border-t border-slate-100 dark:border-[#263244]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Session</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SESSION TITLE */}
        <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug tracking-tight break-words whitespace-normal">
          {session.title}
        </h3>

        {/* METADATA ROW: PLATFORM & DATE/TIME */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
          <div className="flex items-center gap-1.5 font-medium text-[#334155] dark:text-[#CBD5E1]">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span>{session.platform}</span>
          </div>

          <span className="text-slate-300 dark:text-[#334155]">•</span>

          <div className="flex items-center gap-1 text-[#475569] dark:text-[#94A3B8]">
            <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
            <span>{session.scheduledDate}</span>
            <span>•</span>
            <span>{session.scheduledTime}</span>
          </div>
        </div>

        {/* PARTICIPANTS & ACTION BUTTON ROW */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E2E8F0] dark:border-[#263244] w-full min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium shrink-0">
            <Users className="w-4 h-4 text-slate-400 dark:text-[#64748B] shrink-0" />
            <span>{joinedCount} / {maxParticipants}</span>
          </div>

          {/* ACTION BUTTON */}
          <div className="shrink-0">
            {session.status === 'live' ? (
              <button
                type="button"
                onClick={handleJoinMeeting}
                className="h-[44px] min-h-[44px] px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all cursor-pointer"
              >
                Join
              </button>
            ) : session.status === 'upcoming' ? (
              <button
                type="button"
                onClick={() => onEdit(session)}
                className="h-[44px] min-h-[44px] px-4 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#F8FAFC] font-semibold hover:bg-slate-50 dark:hover:bg-[#1E293B] text-xs transition-colors cursor-pointer"
              >
                View Details
              </button>
            ) : session.isRecorded && session.recordingUrl ? (
              <button
                type="button"
                onClick={() => onOpenRecording?.(session)}
                className="h-[44px] min-h-[44px] px-4 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#F8FAFC] font-semibold hover:bg-slate-50 dark:hover:bg-[#1E293B] text-xs transition-colors cursor-pointer"
              >
                View Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAttendance?.(session)}
                className="h-[44px] min-h-[44px] px-4 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#F8FAFC] font-semibold hover:bg-slate-50 dark:hover:bg-[#1E293B] text-xs transition-colors cursor-pointer"
              >
                Attendance
              </button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};
