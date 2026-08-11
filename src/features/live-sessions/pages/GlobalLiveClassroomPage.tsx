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
  const addLiveSession = useLiveSessionStore((state) => state.addLiveSession);
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

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

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
  const total = sessions.length;
  const liveNow = sessions.filter((s) => s.status === 'live').length;
  const upcoming = sessions.filter((s) => s.status === 'upcoming').length;
  const completed = sessions.filter((s) => s.status === 'completed').length;
  const cancelled = sessions.filter((s) => s.status === 'cancelled').length;
  const recorded = sessions.filter((s) => s.isRecorded && s.recordingUrl).length;

  const avgAttendanceRate =
    completed > 0
      ? Math.round(
          sessions
            .filter((s) => s.status === 'completed')
            .reduce((sum, s) => {
              const records = s.attendanceRecords || [];
              const joined = records.filter((r) => r.status === 'joined').length;
              const tot = records.length || 1;
              return sum + (joined / tot) * 100;
            }, 0) / completed
        )
      : 0;

  // IF ACTIVE CLASSROOM VIEW IS ACTIVE -> RENDER DEDICATED CLASSROOM VIEW
  if (activeLiveSession) {
    return (
      <DedicatedLiveClassroomView
        session={activeLiveSession}
        onLeaveClassroom={() => navigate('/live-classroom')}
      />
    );
  }

  const handleSaveForm = (data: Partial<LiveSessionItem>) => {
    if (editingSession) {
      updateLiveSession(editingSession.id, data);
    } else {
      addLiveSession(data as Parameters<typeof addLiveSession>[0]);
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
      {/* 1. HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Live Virtual Classroom</h1>
              <Badge variant="info" size="sm" className="font-bold shrink-0">
                {total} Live Sessions
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Conduct live classes in CubixSkill virtual classroom, integrate Zoom/Meet, track attendance, and record sessions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyticsOpen(true)}
              className="h-[38px] min-h-[38px] text-[11.5px] sm:text-xs font-semibold text-slate-700 rounded-xl w-full sm:w-auto px-2.5 sm:px-3.5 inline-flex items-center justify-center gap-1.5"
              leftIcon={<BarChart3 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
            >
              Analytics
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/live-classroom/new')}
              className="h-[38px] min-h-[38px] bg-[#2563EB] text-white font-semibold text-[11.5px] sm:text-xs px-2.5 sm:px-4 rounded-xl hover:bg-blue-700 w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
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

      {/* 3. MOBILE FILTER & SEARCH CONTROLS */}
      <div className="space-y-3 font-sans text-xs w-full max-w-full min-w-0">
        {/* Mobile Filter Bar (< md) */}
        <div className="md:hidden space-y-3 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs w-full min-w-0">
          {/* Search */}
          <Input
            placeholder="Search live classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs w-full"
          />

          {/* Quick Pill Status Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 w-full">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                statusFilter === 'live'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                statusFilter === 'upcoming'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Upcoming
            </button>

            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs shrink-0 transition-colors ml-auto cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Desktop Filter Bar (>= md) */}
        <div className="hidden md:block space-y-3">
          <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="font-extrabold text-slate-900">Filter by Course:</span>
            </div>

            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Academy Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs">
            <div className="flex flex-1 items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search live sessions by title, platform..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs"
              >
                <option value="all">All Providers</option>
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Jitsi">Jitsi</option>
                <option value="Custom">CubixSkill Live</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live Now</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List Feed</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
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
            <Card key={i} padding="md" className="space-y-3 bg-white border border-slate-200">
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
        <Card padding="lg" className="bg-white border border-slate-200 text-center py-12 space-y-4 font-sans">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Video className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-extrabold text-slate-900">No Live Classes Scheduled</h3>
            <p className="text-xs text-slate-500 font-medium">
              Schedule your first live Zoom, Google Meet, or Microsoft Teams session to interact directly with your course students.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingSession(null);
              setIsModalOpen(true);
            }}
            className="bg-[#2563EB] text-white font-extrabold text-xs px-5"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Schedule Live Session
          </Button>
        </Card>
      )}

      {/* MOBILE FILTER BOTTOM SHEET */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden bg-slate-900/50 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setIsFilterSheetOpen(false)} />
          <div className="relative bg-white rounded-t-2xl p-4 space-y-4 max-h-[85vh] overflow-y-auto z-10 shadow-2xl animate-in slide-in-from-bottom duration-200 text-left font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Filter Live Classes</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Course</label>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Academy Courses ({courses.length})</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Provider Platform */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Provider Platform</label>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Providers</option>
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Jitsi">Jitsi</option>
                <option value="Custom">CubixSkill Live</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live Now</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  resetFilters();
                  setIsFilterSheetOpen(false);
                }}
                className="flex-1 h-10 text-xs font-bold text-slate-700"
              >
                Reset
              </Button>
              <Button
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-1 h-10 text-xs font-bold bg-[#2563EB] text-white"
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
