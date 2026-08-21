import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  Play,
  Film,
  Users,
  Edit2,
  Trash2,
  Radio,
  MoreVertical,
  XCircle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
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
  onStart,
  onEnd,
  onCancel,
  onDelete,
  onJoin,
  onOpenAttendance,
  onOpenRecording,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmModal, setConfirmModal] = useState<'cancel' | 'delete' | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartClick = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      await onStart(session.id);
    } finally {
      setIsStarting(false);
    }
  };

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
        <Badge variant="error" size="sm" className="font-extrabold animate-pulse flex items-center gap-1 text-[10px]">
          <Radio className="w-3 h-3 shrink-0" /> LIVE NOW
        </Badge>
      );
    }
    if (status === 'upcoming') {
      return <Badge variant="warning" size="sm" className="font-extrabold text-[10px]">Upcoming</Badge>;
    }
    if (status === 'completed') {
      return <Badge variant="success" size="sm" className="font-extrabold text-[10px]">Completed</Badge>;
    }
    return <Badge variant="neutral" size="sm" className="font-semibold text-[10px]">Cancelled</Badge>;
  };

  const records = session.attendanceRecords || [];
  const joinedCount = records.filter((r) => r.status === 'joined').length;

  return (
    <>
      <Card
        padding="none"
        className={`bg-white dark:bg-[#111827] border transition-all shadow-2xs font-sans text-xs text-left p-3.5 sm:p-4 space-y-3 w-full max-w-full min-w-0 ${
          session.status === 'live'
            ? 'border-rose-400 dark:border-rose-500/50 ring-2 ring-rose-500/20 bg-rose-50/10 dark:bg-rose-950/10'
            : 'border-[#E2E8F0] dark:border-[#263244] hover:bg-slate-50/50 dark:hover:bg-[#172033] hover:border-blue-300 dark:hover:border-[rgba(59,130,246,0.30)]'
        }`}
      >
        {/* Header Badges & 3-Dot Options Menu */}
        <div className="flex items-start justify-between gap-2 w-full min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
            {getStatusBadge(session.status)}
            <span className="bg-slate-100 dark:bg-[#0F172A] text-slate-800 dark:text-[#60A5FA] font-extrabold px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-[#334155]">
              {session.platform}
            </span>
            {session.courseTitle && (
              <span className="bg-blue-50 dark:bg-[#0F172A] text-[#2563EB] dark:text-[#60A5FA] font-bold px-2 py-0.5 rounded text-[10px] truncate max-w-[180px] border border-blue-100 dark:border-[#334155]">
                {session.courseTitle}
              </span>
            )}
            <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold text-[11px] truncate">
              Host: {session.hostName}
            </span>
          </div>

          {/* 3-DOT MENU BUTTON */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-xl cursor-pointer transition-colors"
              aria-label="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl py-1 text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(session);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-[#172033] dark:hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
                  <span>Edit Session</span>
                </button>

                {session.status === 'upcoming' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setConfirmModal('cancel');
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-[#172033] flex items-center gap-2 text-amber-600 dark:text-amber-400 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Session</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setConfirmModal('delete');
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-[#172033] flex items-center gap-2 text-rose-600 dark:text-[#F87171] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Session</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FULL TITLE - NO TRUNCATION */}
        <h3 className="text-xs sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug tracking-tight break-words whitespace-normal">
          {session.title}
        </h3>

        {session.description && (
          <p className="text-[#64748B] dark:text-[#94A3B8] text-xs line-clamp-2 leading-relaxed break-words">
            {session.description}
          </p>
        )}

        {/* DATE, TIME & DURATION */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] pt-1 border-t border-slate-100 dark:border-[#263244]">
          <div className="flex items-center gap-1 text-[#0F172A] dark:text-[#CBD5E1] font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
            <span>{session.scheduledDate}</span>
          </div>
          <div className="flex items-center gap-1 text-[#0F172A] dark:text-[#CBD5E1] font-bold">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{session.scheduledTime} ({session.durationMinutes} min)</span>
          </div>
        </div>

        {/* PRIMARY & SECONDARY ACTIONS ROW */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#263244] w-full min-w-0">
          {session.status === 'live' ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <button
                type="button"
                onClick={handleJoinMeeting}
                className="h-10 sm:h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer w-full sm:w-auto flex-1 text-center"
              >
                <ExternalLink className="w-4 h-4 shrink-0" /> Join Live Classroom
              </button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEnd(session.id)}
                className="h-10 sm:h-9 font-bold text-xs w-full sm:w-auto bg-white dark:bg-[#172033] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B]"
              >
                End Session
              </Button>
            </div>
          ) : session.status === 'upcoming' ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <Button
                size="sm"
                disabled={isStarting}
                onClick={handleStartClick}
                className="h-10 sm:h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs px-4 w-full sm:w-auto flex-1 shadow-[0_4px_12px_rgba(37,99,235,0.12)] cursor-pointer"
                leftIcon={<Play className="w-4 h-4 fill-current shrink-0" />}
              >
                {isStarting ? 'Starting...' : 'Start Class'}
              </Button>
              <button
                type="button"
                onClick={handleJoinMeeting}
                className="h-10 sm:h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] font-bold hover:bg-slate-50 dark:hover:bg-[#1E293B] hover:border-blue-400 dark:hover:border-[#3B82F6] flex items-center justify-center gap-1 transition-colors cursor-pointer text-xs w-full sm:w-auto"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" /> Provider Link
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 w-full">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenAttendance?.(session)}
                className="h-9 text-xs font-bold bg-white dark:bg-[#172033] border border-[#CBD5E1] dark:border-[#334155] text-[#2563EB] dark:text-[#60A5FA] hover:bg-slate-50 dark:hover:bg-[#1E293B] hover:border-blue-400 dark:hover:border-[#3B82F6] flex-1 sm:flex-initial"
                leftIcon={<Users className="w-3.5 h-3.5" />}
              >
                Attendance ({joinedCount})
              </Button>
              {session.isRecorded && session.recordingUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenRecording?.(session)}
                  className="h-9 text-xs font-bold bg-white dark:bg-[#172033] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B] hover:border-blue-400 dark:hover:border-[#3B82F6] flex-1 sm:flex-initial"
                  leftIcon={<Film className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                >
                  Recording
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* CONFIRMATION DIALOG FOR CANCEL / DELETE */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 max-w-sm w-full space-y-4 shadow-2xl border border-[#E2E8F0] dark:border-[#263244] text-left font-sans">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {confirmModal === 'cancel' ? 'Cancel Live Session?' : 'Delete Live Session?'}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
              {confirmModal === 'cancel'
                ? `Are you sure you want to cancel "${session.title}"? Students will be notified.`
                : `Are you sure you want to permanently delete "${session.title}"? This cannot be undone.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModal(null)}
                className="text-xs font-semibold h-9 px-3 bg-white dark:bg-[#172033] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1]"
              >
                Keep Session
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (confirmModal === 'cancel') onCancel(session.id);
                  else onDelete(session.id);
                  setConfirmModal(null);
                }}
                className={`text-xs font-bold h-9 px-4 text-white ${
                  confirmModal === 'cancel' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#DC2626] hover:bg-rose-700'
                }`}
              >
                {confirmModal === 'cancel' ? 'Yes, Cancel' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
