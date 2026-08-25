import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video,
  Plus,
  Search,
  Calendar as CalendarIcon,
  BarChart3,
  List,
  BookOpen,
  Filter,
  SlidersHorizontal,
  X,
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
import { CreateLiveSessionModal } from '../components/CreateLiveSessionModal';
import { LiveSessionAttendanceModal } from '../components/LiveSessionAttendanceModal';
import { LiveSessionRecordingModal } from '../components/LiveSessionRecordingModal';
import { LiveSessionAnalyticsModal } from '../components/LiveSessionAnalyticsModal';

export const GlobalLiveClassroomPage: React.FC = () => {
  const params = useParams<{ courseUuid?: string; sessionUuid?: string; '*': string }>();
  const navigate = useNavigate();

  const courses = usePlatformStore((state) => state.courses || []);
  const sessions = useLiveSessionStore((state) => state.sessions);
  const updateLiveSession = useLiveSessionStore((state) => state.updateLiveSession);
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

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSessionItem | null>(null);
  const [activeAttendanceSession, setActiveAttendanceSession] = useState<LiveSessionItem | null>(null);
  const [activeRecordingSession, setActiveRecordingSession] = useState<LiveSessionItem | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

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

  const createLiveSession = useLiveSessionStore((state) => state.createLiveSession);
  const updateLiveSessionApi = useLiveSessionStore((state) => state.updateLiveSessionApi);

  const handleSaveForm = async (data: Partial<LiveSessionItem>) => {
    if (editingSession) {
      const scheduledStart = `${data.scheduledDate || editingSession.scheduledDate}T${data.scheduledTime || editingSession.scheduledTime}:00Z`;
      const endMs = new Date(scheduledStart).getTime() + (data.durationMinutes || editingSession.durationMinutes || 60) * 60 * 1000;
      const scheduledEnd = new Date(endMs).toISOString();

      let mappedProvider: 'GOOGLE_MEET' | 'ZOOM' | 'MICROSOFT_TEAMS' | 'CUSTOM' = 'CUSTOM';
      if (data.platform === 'Zoom') mappedProvider = 'ZOOM';
      else if (data.platform === 'Google Meet') mappedProvider = 'GOOGLE_MEET';
      else if (data.platform === 'Microsoft Teams') mappedProvider = 'MICROSOFT_TEAMS';

      try {
        await updateLiveSessionApi(editingSession.id, {
          title: data.title,
          description: data.description,
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          meeting_url: data.meetingUrl,
          provider: mappedProvider,
          recording_enabled: data.isRecorded,
        });
      } catch (err) {
        updateLiveSession(editingSession.id, data);
      }
    } else {
      const scheduledStart = `${data.scheduledDate || '2026-08-25'}T${data.scheduledTime || '18:00'}:00Z`;
      const endMs = new Date(scheduledStart).getTime() + (data.durationMinutes || 60) * 60 * 1000;
      const scheduledEnd = new Date(endMs).toISOString();

      let mappedProvider: 'GOOGLE_MEET' | 'ZOOM' | 'MICROSOFT_TEAMS' | 'CUSTOM' = 'CUSTOM';
      if (data.platform === 'Zoom') mappedProvider = 'ZOOM';
      else if (data.platform === 'Google Meet') mappedProvider = 'GOOGLE_MEET';
      else if (data.platform === 'Microsoft Teams') mappedProvider = 'MICROSOFT_TEAMS';

      try {
        await createLiveSession({
          course_id: data.courseUuid || null,
          title: data.title || 'Live Virtual Class',
          description: data.description || '',
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          session_mode: data.sessionType === 'cubixskill_live' ? 'NATIVE' : 'EXTERNAL',
          provider: mappedProvider,
          meeting_url: data.meetingUrl || '',
          max_participants: data.maxParticipants || 100,
          recording_enabled: data.isRecorded || false,
          send_email: data.notifyStudents || false,
          status: 'SCHEDULED',
        });
      } catch (err) {
        console.error("Failed to create live session", err);
      }
    }
  };

  const resetFilters = () => {
    setSelectedCourseFilter('all');
    setSearch('');
    setStatusFilter('all');
    setPlatformFilter('all');
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
              onClick={() => setIsAnalyticsOpen(true)}
              className="h-[38px] min-h-[38px] text-[11.5px] sm:text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#172033] border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl w-full sm:w-auto px-2.5 sm:px-3.5 inline-flex items-center justify-center gap-1.5"
              leftIcon={<BarChart3 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />}
            >
              Analytics
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/live-classroom/new')}
              className="h-[38px] min-h-[38px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-[11.5px] sm:text-xs px-2.5 sm:px-4 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.12)] w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
              leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
            >
              Create Class
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. TELEMETRY SUMMARY CARDS */}
      <LiveSessionSummaryCards
        total={total}
        liveNow={liveNow}
        upcoming={upcoming}
        completed={completed}
        cancelled={cancelled}
        recorded={recorded}
        avgAttendanceRate={avgAttendanceRate}
      />

      {/* 3. MOBILE & DESKTOP FILTER CONTROLS */}
      <div className="space-y-3 font-sans text-xs w-full max-w-full min-w-0">
        {/* Mobile Filter Bar (< md) */}
        <div className="md:hidden space-y-3 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-2xl shadow-2xs w-full min-w-0">
          {/* Search */}
          <Input
            placeholder="Search live classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
            className="h-10 text-xs w-full bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B]"
          />

          {/* Quick Status Pills Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 w-full">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                statusFilter === 'live'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]'
              }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]'
              }`}
            >
              Upcoming
            </button>

            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-slate-50 dark:bg-[#172033] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs shrink-0 transition-colors ml-auto cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Desktop Filter Bar (>= md) */}
        <div className="hidden md:block space-y-3">
          <div className="p-3 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Filter by Course:</span>
            </div>

            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#111827]">All Academy Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-[#111827]">
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-2xl shadow-2xs">
            <div className="flex flex-1 items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search live sessions by title, platform..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
                  className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B]"
                />
              </div>

              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs cursor-pointer"
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
                className="h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#111827]">All Statuses</option>
                <option value="upcoming" className="bg-white dark:bg-[#111827]">Upcoming</option>
                <option value="live" className="bg-white dark:bg-[#111827]">Live Now</option>
                <option value="completed" className="bg-white dark:bg-[#111827]">Completed</option>
                <option value="cancelled" className="bg-white dark:bg-[#111827]">Cancelled</option>
              </select>
            </div>

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

      {/* 4. VIEW CONTENT */}
      {viewMode === 'calendar' ? (
        <LiveSessionCalendarView
          sessions={filteredSessions}
          onSelectSession={(s) => navigate(`/live-classroom/${s.id}`)}
          onCreateNewDate={(_) => {
            setEditingSession(null);
            setIsModalOpen(true);
          }}
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
              onEdit={(s) => {
                setEditingSession(s);
                setIsModalOpen(true);
              }}
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
            onClick={() => {
              setEditingSession(null);
              setIsModalOpen(true);
            }}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs px-5 shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Schedule Live Session
          </Button>
        </Card>
      )}

      {/* MOBILE FILTER BOTTOM SHEET */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden bg-[#0F172A]/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setIsFilterSheetOpen(false)} />
          <div className="relative bg-white dark:bg-[#111827] border-t border-[#E2E8F0] dark:border-[#263244] rounded-t-2xl p-4 space-y-4 max-h-[85vh] overflow-y-auto z-10 shadow-2xl animate-in slide-in-from-bottom duration-200 text-left font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#263244]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                <h3 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-sm">Filter Live Classes</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1.5">Course</label>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
              >
                <option value="all" className="bg-white dark:bg-[#111827]">All Academy Courses ({courses.length})</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-[#111827]">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Provider Platform */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1.5">Provider Platform</label>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
              >
                <option value="all" className="bg-white dark:bg-[#111827]">All Providers</option>
                <option value="Zoom" className="bg-white dark:bg-[#111827]">Zoom</option>
                <option value="Google Meet" className="bg-white dark:bg-[#111827]">Google Meet</option>
                <option value="Microsoft Teams" className="bg-white dark:bg-[#111827]">Microsoft Teams</option>
                <option value="Jitsi" className="bg-white dark:bg-[#111827]">Jitsi</option>
                <option value="Custom" className="bg-white dark:bg-[#111827]">CubixSkill Live</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
              >
                <option value="all" className="bg-white dark:bg-[#111827]">All Statuses</option>
                <option value="upcoming" className="bg-white dark:bg-[#111827]">Upcoming</option>
                <option value="live" className="bg-white dark:bg-[#111827]">Live Now</option>
                <option value="completed" className="bg-white dark:bg-[#111827]">Completed</option>
                <option value="cancelled" className="bg-white dark:bg-[#111827]">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
              <Button
                variant="outline"
                onClick={() => {
                  resetFilters();
                  setIsFilterSheetOpen(false);
                }}
                className="flex-1 h-10 text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
              >
                Reset
              </Button>
              <Button
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-1 h-10 text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <CreateLiveSessionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSession(null);
        }}
        onSubmit={handleSaveForm}
        editingSession={editingSession}
      />

      <LiveSessionAttendanceModal
        isOpen={!!activeAttendanceSession}
        onClose={() => setActiveAttendanceSession(null)}
        session={activeAttendanceSession}
      />

      <LiveSessionRecordingModal
        isOpen={!!activeRecordingSession}
        onClose={() => setActiveRecordingSession(null)}
        session={activeRecordingSession}
        onSaveRecording={uploadRecording}
      />

      <LiveSessionAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        sessions={sessions}
      />
    </div>
  );
};
