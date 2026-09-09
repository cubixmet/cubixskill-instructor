import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video,
  Plus,
  Search,
  Calendar as CalendarIcon,
  BarChart3,
  List,
  Filter,
  X,
  TrendingUp,
  Clock,
  Link as LinkIcon,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { usePlatformStore } from '../../../store/usePlatformStore';

import { useLiveSessionStore, type LiveSessionItem } from '../store/liveSession.store';
import { liveSessionsService } from '../../../services/liveSessions.service';
import { DedicatedLiveClassroomView } from '../components/DedicatedLiveClassroomView';
import { LiveSessionSummaryCards } from '../components/LiveSessionSummaryCards';
import { LiveSessionCard } from '../components/LiveSessionCard';
import { LiveSessionCalendarView } from '../components/LiveSessionCalendarView';

export const GlobalLiveClassroomPage: React.FC = () => {
  const params = useParams<{ courseUuid?: string; sessionUuid?: string; '*': string }>();
  const navigate = useNavigate();

  const courses = usePlatformStore((state) => state.courses || []);
  const sessions = useLiveSessionStore((state) => state.sessions);
  const cancelLiveSession = useLiveSessionStore((state) => state.cancelLiveSession);
  const startLiveSession = useLiveSessionStore((state) => state.startLiveSession);
  const endLiveSession = useLiveSessionStore((state) => state.endLiveSession);
  const uploadRecording = useLiveSessionStore((state) => state.uploadRecording);
  const deleteLiveSession = useLiveSessionStore((state) => state.deleteLiveSession);

  // Path resolution for active classroom view
  const subPath = (params['*'] || '').replace(/^\/+/, '');
  const activeSessionUuid = params.sessionUuid || (subPath && !subPath.includes('/') ? subPath : null);

  const activeLiveSession = useMemo(() => {
    if (!activeSessionUuid) return null;
    return sessions.find((s) => s.id === activeSessionUuid) || null;
  }, [sessions, activeSessionUuid]);

  // Filter States
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Inline Panel States
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [activeAttendanceSession, setActiveAttendanceSession] = useState<LiveSessionItem | null>(null);
  const [activeRecordingSession, setActiveRecordingSession] = useState<LiveSessionItem | null>(null);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');

  // Recording Form State
  const [recordingUrlInput, setRecordingUrlInput] = useState('');
  const [recordingProviderInput, setRecordingProviderInput] = useState<'YouTube' | 'Vimeo' | 'Google Drive' | 'Direct'>('Direct');

  useEffect(() => {
    if (activeRecordingSession) {
      setRecordingUrlInput(activeRecordingSession.recordingUrl || '');
      setRecordingProviderInput(activeRecordingSession.recordingProvider || 'Direct');
    }
  }, [activeRecordingSession]);

  const fetchCourseLiveSessions = useLiveSessionStore((state) => state.fetchCourseLiveSessions);
  const [summaryData, setSummaryData] = useState<{
    total: number;
    liveNow: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    recorded: number;
    avgAttendanceRate: number;
  } | null>(null);

  // Loading state & backend fetch
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchCourseLiveSessions(selectedCourseFilter !== 'all' ? selectedCourseFilter : undefined)
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedCourseFilter, fetchCourseLiveSessions]);

  useEffect(() => {
    let isMounted = true;
    liveSessionsService
      .summary()
      .then((res) => {
        if (!isMounted) return;
        setSummaryData({
          total: res.total,
          liveNow: res.live_now,
          upcoming: res.upcoming,
          completed: res.completed,
          cancelled: res.cancelled,
          recorded: res.recorded,
          avgAttendanceRate: res.avg_attendance_rate,
        });
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let list = [...sessions];

    if (selectedCourseFilter !== 'all') {
      list = list.filter((s) => s.courseUuid === selectedCourseFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.platform.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }

    if (platformFilter !== 'all') {
      list = list.filter((s) => s.platform === platformFilter);
    }

    return list.sort((a, b) => {
      if (a.status === 'live') return -1;
      if (b.status === 'live') return 1;
      return new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime() - new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime();
    });
  }, [sessions, selectedCourseFilter, search, statusFilter, platformFilter]);

  // Metrics
  const total = summaryData ? summaryData.total : sessions.length;
  const liveNow = summaryData ? summaryData.liveNow : sessions.filter((s) => s.status === 'live').length;
  const upcoming = summaryData ? summaryData.upcoming : sessions.filter((s) => s.status === 'upcoming').length;
  const completed = summaryData ? summaryData.completed : sessions.filter((s) => s.status === 'completed').length;
  const cancelled = summaryData ? summaryData.cancelled : sessions.filter((s) => s.status === 'cancelled').length;
  const recorded = summaryData ? summaryData.recorded : sessions.filter((s) => s.isRecorded && s.recordingUrl).length;
  const avgAttendanceRate = summaryData ? summaryData.avgAttendanceRate : 0;

  // IF ACTIVE CLASSROOM VIEW IS ACTIVE -> RENDER DEDICATED CLASSROOM VIEW
  if (activeLiveSession) {
    return (
      <DedicatedLiveClassroomView
        session={activeLiveSession}
        onLeaveClassroom={() => navigate('/live-classroom')}
      />
    );
  }

  const resetFilters = () => {
    setSelectedCourseFilter('all');
    setSearch('');
    setStatusFilter('all');
    setPlatformFilter('all');
  };

  const handleSaveRecordingForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecordingSession || !recordingUrlInput.trim()) return;
    uploadRecording(activeRecordingSession.id, recordingUrlInput, recordingProviderInput);
    setActiveRecordingSession(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-24 sm:pb-8 px-2.5 sm:px-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden min-w-0">
      {/* 1. PAGE HEADER */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Live Virtual Classroom
              </h1>
              <Badge variant="info" size="sm" className="font-semibold shrink-0 text-[10px] bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA]">
                {total} Live Sessions
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
              Conduct live classes in CubixSkill virtual classroom, integrate Zoom/Meet, track attendance, and record sessions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
              className={`h-[38px] min-h-[38px] text-[11.5px] sm:text-xs font-semibold border-[#E2E8F0] dark:border-[#334155] rounded-xl w-full sm:w-auto px-2.5 sm:px-3.5 inline-flex items-center justify-center gap-1.5 ${
                showAnalyticsPanel
                  ? 'bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] border-blue-200 dark:border-blue-800'
                  : 'text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-[#1E293B]'
              }`}
              leftIcon={<BarChart3 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />}
            >
              {showAnalyticsPanel ? 'Hide Analytics' : 'Analytics'}
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/live-classroom/create')}
              className="h-[38px] min-h-[38px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-[11.5px] sm:text-xs px-2.5 sm:px-4 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.12)] w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
              leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
            >
              Create Class
            </Button>
          </div>
        </div>
      </Card>

      {/* INLINE ANALYTICS PANEL */}
      {showAnalyticsPanel && (
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Virtual Classroom Telemetry & Analytics</h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Comprehensive view of student attendance, session completion, and teaching hours.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAnalyticsPanel(false)}
              className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-blue-50 dark:bg-[#0F172A] border border-blue-200 dark:border-[#334155] rounded-xl space-y-1">
              <div className="flex items-center justify-between text-blue-700 dark:text-[#60A5FA] font-bold text-xs">
                <span>Avg Student Attendance</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-2xl font-black text-blue-950 dark:text-[#F8FAFC]">
                {sessions.filter((s) => s.status === 'completed').length > 0
                  ? Math.round(
                      sessions
                        .filter((s) => s.status === 'completed')
                        .reduce((sum, s) => {
                          const records = s.attendanceRecords || [];
                          const joined = records.filter((r) => r.status === 'joined').length;
                          const t = records.length || 1;
                          return sum + (joined / t) * 100;
                        }, 0) / sessions.filter((s) => s.status === 'completed').length
                    )
                  : 0}%
              </h3>
              <p className="text-[10px] text-blue-800 dark:text-[#94A3B8] font-medium">Joined vs registered conversion</p>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-[#0F172A] border border-indigo-200 dark:border-[#334155] rounded-xl space-y-1">
              <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                <span>Live Hours Taught</span>
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-2xl font-black text-indigo-950 dark:text-[#F8FAFC]">
                {(
                  sessions
                    .filter((s) => s.status === 'completed')
                    .reduce((sum, s) => sum + s.durationMinutes, 0) / 60
                ).toFixed(1)} Hours
              </h3>
              <p className="text-[10px] text-indigo-800 dark:text-[#94A3B8] font-medium">Across all completed webinars</p>
            </div>
          </div>
        </Card>
      )}

      {/* INLINE ATTENDANCE ROSTER PANEL */}
      {activeAttendanceSession && (
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Live Attendance Roster — {activeAttendanceSession.title}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {(activeAttendanceSession.attendanceRecords || []).filter((r) => r.status === 'joined').length} Joined •{' '}
                {(activeAttendanceSession.attendanceRecords || []).filter((r) => r.status === 'absent').length} Absent
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveAttendanceSession(null)}
              className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search student name or email..."
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />}
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={attendanceStatusFilter}
                onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <option value="all">All Students ({(activeAttendanceSession.attendanceRecords || []).length})</option>
                <option value="joined">Joined Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </div>
          </div>

          <div className="border border-[#E2E8F0] dark:border-[#263244] rounded-xl overflow-hidden divide-y divide-[#E2E8F0] dark:divide-[#263244]">
            {(activeAttendanceSession.attendanceRecords || []).filter((r) => {
              const mSearch = r.studentName.toLowerCase().includes(attendanceSearch.toLowerCase()) || r.studentEmail.toLowerCase().includes(attendanceSearch.toLowerCase());
              const mStatus = attendanceStatusFilter === 'all' || r.status === attendanceStatusFilter;
              return mSearch && mStatus;
            }).length > 0 ? (
              (activeAttendanceSession.attendanceRecords || []).filter((r) => {
                const mSearch = r.studentName.toLowerCase().includes(attendanceSearch.toLowerCase()) || r.studentEmail.toLowerCase().includes(attendanceSearch.toLowerCase());
                const mStatus = attendanceStatusFilter === 'all' || r.status === attendanceStatusFilter;
                return mSearch && mStatus;
              }).map((rec) => (
                <div key={rec.studentUuid} className="p-3 bg-white dark:bg-[#111827] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center">
                      {rec.studentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#0F172A] dark:text-[#F8FAFC] text-xs">{rec.studentName}</h4>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium">{rec.studentEmail}</span>
                    </div>
                  </div>

                  <div>
                    {rec.status === 'joined' ? (
                      <span className="bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-700 dark:text-[#6EE7B7] font-extrabold text-[10px] px-2 py-0.5 rounded border border-emerald-200 dark:border-[rgba(52,211,153,0.22)]">
                        Joined ({rec.durationMinutes} mins)
                      </span>
                    ) : (
                      <span className="bg-slate-100 dark:bg-[#0F172A] text-slate-500 dark:text-[#94A3B8] font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-[#334155]">
                        Absent
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#64748B] dark:text-[#94A3B8] font-bold">No student attendance records match search.</div>
            )}
          </div>
        </Card>
      )}

      {/* INLINE RECORDING ATTACHMENT PANEL */}
      {activeRecordingSession && (
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Attach Session Recording — {activeRecordingSession.title}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Attach recording URL for student playback.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveRecordingSession(null)}
              className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveRecordingForm} className="space-y-4 font-sans text-xs text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#CBD5E1] mb-1">Recording Provider</label>
                <select
                  value={recordingProviderInput}
                  onChange={(e) => setRecordingProviderInput(e.target.value as typeof recordingProviderInput)}
                  className="w-full h-9 rounded-lg border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  <option value="Direct">CubixSkill CDN Direct MP4</option>
                  <option value="YouTube">YouTube Unlisted Link</option>
                  <option value="Vimeo">Vimeo Video Link</option>
                  <option value="Google Drive">Google Drive Shared Link</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#CBD5E1] mb-1">Recording URL *</label>
                <Input
                  placeholder="https://cdn.cubixskill.com/recordings/session.mp4"
                  value={recordingUrlInput}
                  onChange={(e) => setRecordingUrlInput(e.target.value)}
                  required
                  leftIcon={<LinkIcon className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
                  className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B]"
                />
              </div>
            </div>

            {activeRecordingSession.recordingUrl && (
              <div className="p-3 bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-950 dark:text-[#6EE7B7]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#34D399] shrink-0" />
                  <span>Active Recording Attached</span>
                </div>
                <a
                  href={activeRecordingSession.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 dark:bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Preview Recording
                </a>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
              <Button variant="outline" type="button" onClick={() => setActiveRecordingSession(null)} className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1]">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-6">
                Save Recording URL
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 2. METRICS CARDS */}
      <LiveSessionSummaryCards
        total={total}
        liveNow={liveNow}
        upcoming={upcoming}
        completed={completed}
        cancelled={cancelled}
        recorded={recorded}
        avgAttendanceRate={avgAttendanceRate}
        onSelectStatusFilter={(st) => setStatusFilter(st)}
        activeStatusFilter={statusFilter}
      />

      {/* 3. FILTERS & SEARCH BAR */}
      <div className="bg-white dark:bg-[#111827] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-3 w-full max-w-full min-w-0">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Input
              placeholder="Search by session title, topic, platform..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
              className="w-full h-10 bg-slate-50 dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] rounded-xl font-normal text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs shrink-0"
            >
              <Filter className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>Filters</span>
            </button>

            <div className="hidden md:flex items-center gap-2 flex-wrap min-w-0">
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer max-w-[200px] truncate"
              >
                <option value="all" className="bg-white dark:bg-[#111827]">All Courses ({courses.length})</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-[#111827]">
                    {c.title}
                  </option>
                ))}
              </select>

              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#111827]">All Providers</option>
                <option value="Zoom" className="bg-white dark:bg-[#111827]">Zoom</option>
                <option value="Google Meet" className="bg-white dark:bg-[#111827]">Google Meet</option>
                <option value="Microsoft Teams" className="bg-white dark:bg-[#111827]">Microsoft Teams</option>
                <option value="Jitsi" className="bg-white dark:bg-[#111827]">Jitsi</option>
                <option value="Custom" className="bg-white dark:bg-[#111827]">CubixSkill Live</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#111827]">All Statuses</option>
                <option value="upcoming" className="bg-white dark:bg-[#111827]">Upcoming</option>
                <option value="live" className="bg-white dark:bg-[#111827]">Live Now</option>
                <option value="completed" className="bg-white dark:bg-[#111827]">Completed</option>
                <option value="cancelled" className="bg-white dark:bg-[#111827]">Cancelled</option>
              </select>

              <div className="flex items-center bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155] shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-bold'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List Feed</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-bold'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Calendar View</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE FILTER SHEET MODAL */}
        {isFilterSheetOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end md:hidden">
            <div className="w-full max-w-xs bg-white dark:bg-[#111827] h-full p-4 space-y-4 overflow-y-auto border-l border-[#E2E8F0] dark:border-[#263244] shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  Filter Live Classes
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] mb-1">Course</label>
                  <select
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                  >
                    <option value="all">All Courses ({courses.length})</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] mb-1">Provider</label>
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                  >
                    <option value="all">All Providers</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Jitsi">Jitsi</option>
                    <option value="Custom">CubixSkill Live</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                  >
                    <option value="all">All Statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] mb-1">View Mode</label>
                  <div className="flex items-center bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-bold'
                          : 'text-[#64748B] dark:text-[#94A3B8]'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>List</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('calendar')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'calendar'
                          ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-bold'
                          : 'text-[#64748B] dark:text-[#94A3B8]'
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Calendar</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#263244] flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="flex-1 h-9 text-xs bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1]"
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex-1 h-9 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. VIEW CONTENT */}
      {viewMode === 'calendar' ? (
        <LiveSessionCalendarView
          sessions={filteredSessions}
          onSelectSession={(s) => navigate(`/live-classroom/${s.id}`)}
          onCreateNewDate={(_) => navigate('/live-classroom/create')}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md" className="space-y-3 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244]">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <LiveSessionCard
              key={session.id}
              session={session}
              onEdit={(s) => navigate(`/live-classroom/create?sessionId=${s.id}`)}
              onStart={(id) => {
                startLiveSession(id);
                navigate(`/live-classroom/${id}`);
              }}
              onEnd={endLiveSession}
              onCancel={cancelLiveSession}
              onDelete={deleteLiveSession}
              onOpenAttendance={(s) => setActiveAttendanceSession(s)}
              onOpenRecording={(s) => setActiveRecordingSession(s)}
            />
          ))}
        </div>
      ) : (
        <Card padding="lg" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] text-center py-12 space-y-4 font-sans">
          <div className="w-14 h-14 bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] rounded-full flex items-center justify-center mx-auto">
            <Video className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No Live Classes Scheduled</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal">
              Schedule your first live Zoom, Google Meet, or Microsoft Teams session to interact directly with your course students.
            </p>
          </div>
          <Button
            onClick={() => navigate('/live-classroom/create')}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs px-5 shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Schedule Live Session
          </Button>
        </Card>
      )}
    </div>
  );
};
