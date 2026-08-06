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
  onOpenAttendance,
  onOpenRecording,
}) => {
  const getStatusBadge = (status: string) => {
    if (status === 'live') {
      return (
        <Badge variant="error" size="sm" className="font-black animate-pulse flex items-center gap-1">
          <Radio className="w-3 h-3" /> LIVE NOW
        </Badge>
      );
    }
    if (status === 'upcoming') {
      return <Badge variant="warning" size="sm" className="font-extrabold">Upcoming</Badge>;
    }
    if (status === 'completed') {
      return <Badge variant="success" size="sm" className="font-extrabold">Completed</Badge>;
    }
    return <Badge variant="neutral" size="sm" className="font-semibold">Cancelled</Badge>;
  };

  const records = session.attendanceRecords || [];
  const joinedCount = records.filter((r) => r.status === 'joined').length;

  return (
    <Card
      padding="md"
      className={`bg-white border transition-all shadow-2xs font-sans text-xs text-left space-y-3 ${
        session.status === 'live'
          ? 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/10'
          : 'border-slate-200/90 hover:border-blue-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(session.status)}
            <span className="bg-slate-100 text-slate-800 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
              {session.platform}
            </span>
            <span className="text-slate-400 font-semibold text-[11px]">
              Host: {session.hostName}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
            {session.title}
          </h3>

          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
            {session.description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {session.status === 'live' ? (
            <>
              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Join Live Room
              </a>
              <Button size="sm" variant="outline" onClick={() => onEnd(session.id)} className="h-9 font-bold">
                End Meeting
              </Button>
            </>
          ) : session.status === 'upcoming' ? (
            <>
              <Button
                size="sm"
                onClick={() => onStart(session.id)}
                className="h-9 bg-blue-600 text-white font-extrabold px-4 hover:bg-blue-700"
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                Start Now
              </Button>
              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="h-9 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Meeting Link
              </a>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenAttendance?.(session)}
                className="h-9 text-xs font-bold text-blue-600"
                leftIcon={<Users className="w-3.5 h-3.5" />}
              >
                Attendance ({joinedCount})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenRecording?.(session)}
                className="h-9 text-xs font-bold text-slate-700"
                leftIcon={<Film className="w-3.5 h-3.5 text-indigo-600" />}
              >
                Recording
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Timing Details Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-800 font-bold">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{session.scheduledDate}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-800 font-bold">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{session.scheduledTime} ({session.durationMinutes} mins)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAttendance?.(session)}
            className="text-blue-600 font-bold text-[11px] p-1 cursor-pointer flex items-center gap-1 hover:underline"
          >
            <Users className="w-3.5 h-3.5" /> {joinedCount} Attended
          </button>

          <button
            type="button"
            onClick={() => onEdit(session)}
            className="text-slate-500 hover:text-slate-900 font-bold text-[11px] p-1 cursor-pointer flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>

          {session.status === 'upcoming' && (
            <button
              type="button"
              onClick={() => onCancel(session.id)}
              className="text-amber-600 hover:text-amber-800 font-bold text-[11px] p-1 cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(session.id)}
            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};
