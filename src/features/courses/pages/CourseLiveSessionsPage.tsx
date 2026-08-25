import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Video,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Download,
  BarChart3,
  List,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

// Store & Services
import { useLiveSessionStore, type LiveSessionItem } from '../../live-sessions/store/liveSession.store';
import { liveSessionsService } from '../../../services/liveSessions.service';
import { coursesService, type CourseDetail } from '../../../services/courses.service';
import { useCourseFeaturesStore, DEFAULT_COURSE_FEATURES } from '../store/courseFeatures.store';
import { FeatureDisabledBanner } from '../../discussions/components/FeatureDisabledBanner';

import { LiveSessionSummaryCards } from '../../live-sessions/components/LiveSessionSummaryCards';
import { LiveSessionCard } from '../../live-sessions/components/LiveSessionCard';
import { LiveSessionCalendarView } from '../../live-sessions/components/LiveSessionCalendarView';
import { LiveSessionAttendanceModal } from '../../live-sessions/components/LiveSessionAttendanceModal';
import { LiveSessionRecordingModal } from '../../live-sessions/components/LiveSessionRecordingModal';
import { LiveSessionAnalyticsModal } from '../../live-sessions/components/LiveSessionAnalyticsModal';

export const CourseLiveSessionsPage: React.FC = () => {
  const params = useParams<{ courseId?: string; courseUuid?: string; '*': string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const courseUuid = params.courseId || params.courseUuid;

  // Subpath parsing
  const subPath = (params['*'] || '').replace(/^\/+/, '');
  const pathSegments = subPath.split('/').filter(Boolean);

  const targetSessionUuid = pathSegments[0] && !['new', 'create'].includes(pathSegments[0]) ? pathSegments[0] : null;
  const isAttendanceRoute = location.pathname.endsWith('/attendance');
  const isRecordingRoute = location.pathname.endsWith('/recording');

  // Course & Session Loading State
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Live Sessions Store State & Actions
  const sessions = useLiveSessionStore((state) => state.sessions);
  const fetchCourseLiveSessions = useLiveSessionStore((state) => state.fetchCourseLiveSessions);
  const startLiveSessionApi = useLiveSessionStore((state) => state.startLiveSessionApi);
  const endLiveSessionApi = useLiveSessionStore((state) => state.endLiveSessionApi);
  const cancelLiveSessionApi = useLiveSessionStore((state) => state.cancelLiveSessionApi);
  const deleteLiveSessionApi = useLiveSessionStore((state) => state.deleteLiveSessionApi);
  const uploadRecording = useLiveSessionStore((state) => state.uploadRecording);

  // Feature Flags Check
  const getCourseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures);
  const courseFeatures = courseUuid
    ? getCourseFeatures ? getCourseFeatures(courseUuid) : (useCourseFeaturesStore.getState().featuresByCourse[courseUuid] || DEFAULT_COURSE_FEATURES)
    : DEFAULT_COURSE_FEATURES;

  // Filter States
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States for Attendance / Recording / Analytics
  const [activeAttendanceSession, setActiveAttendanceSession] = useState<LiveSessionItem | null>(null);
  const [activeRecordingSession, setActiveRecordingSession] = useState<LiveSessionItem | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Load Real Course & Live Sessions Data
  const loadData = useCallback(async () => {
    if (!courseUuid) {
      setCourseError('No Course ID provided.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setCourseError(null);

    try {
      // 1. Fetch real course details
      const courseData = await coursesService.getCourse(courseUuid);
      setCourse(courseData);

      // 2. Fetch real course live sessions
      await fetchCourseLiveSessions(courseUuid);
    } catch (err: any) {
      console.error('Failed to load live sessions or course detail:', err);
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to load course live sessions.';
      setCourseError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [courseUuid, fetchCourseLiveSessions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle route subpaths
  useEffect(() => {
    if (targetSessionUuid) {
      const found = sessions.find((s) => s.id === targetSessionUuid);
      if (found) {
        if (isAttendanceRoute) setActiveAttendanceSession(found);
        else if (isRecordingRoute) setActiveRecordingSession(found);
      }
    }
  }, [targetSessionUuid, isAttendanceRoute, isRecordingRoute, sessions]);

  // Handlers for session actions
  const handleStart = async (id: string) => {
    try {
      await startLiveSessionApi(id);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to start session.');
    }
  };

  const handleEnd = async (id: string) => {
    try {
      await endLiveSessionApi(id);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to end session.');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelLiveSessionApi(id);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to cancel session.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLiveSessionApi(id);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to delete session.');
    }
  };

  const handleJoin = async (session: LiveSessionItem) => {
    try {
      const joinInfo = await liveSessionsService.join(session.id);
      const targetUrl = joinInfo.meeting_url || session.meetingUrl;
      if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('No valid meeting URL provided by server for this session.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Unable to join session.';
      alert(msg);
    }
  };

  const courseSessions = useMemo(() => {
    if (!courseUuid) return [];
    return sessions.filter((s) => s.courseUuid === courseUuid);
  }, [sessions, courseUuid]);

  const liveNowSessions = useMemo(() => {
    return courseSessions.filter((s) => s.status === 'live');
  }, [courseSessions]);

  const filteredSessions = useMemo(() => {
    let list = [...courseSessions];

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

    return list.sort((a, b) => {
      if (a.status === 'live') return -1;
      if (b.status === 'live') return 1;
      return new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime() - new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime();
    });
  }, [courseSessions, search, statusFilter]);

  // Metrics
  const total = courseSessions.length;
  const liveNow = courseSessions.filter((s) => s.status === 'live').length;
  const upcoming = courseSessions.filter((s) => s.status === 'upcoming').length;
  const completed = courseSessions.filter((s) => s.status === 'completed').length;
  const cancelled = courseSessions.filter((s) => s.status === 'cancelled').length;
  const recorded = courseSessions.filter((s) => s.isRecorded && s.recordingUrl).length;

  const avgAttendanceRate =
    completed > 0
      ? Math.round(
          courseSessions
            .filter((s) => s.status === 'completed')
            .reduce((sum, s) => {
              const records = s.attendanceRecords || [];
              const joined = records.filter((r) => r.status === 'joined').length;
              const tot = records.length || 1;
              return sum + (joined / tot) * 100;
            }, 0) / completed
        )
      : 0;

  const handleExportAllAttendance = () => {
    alert(`Exported master attendance report for course "${course?.title || courseUuid}" (CSV format).`);
  };

  if (courseError) {
    return (
      <div className="w-full space-y-4 font-sans text-left p-6">
        <Card className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 p-6 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">Unable to Load Course Live Sessions</h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mt-1">{courseError}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6 text-left font-sans pb-36 md:pb-12">
      {/* 1. COMPACT PAGE HEADER */}
      <Card padding="sm" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Live Sessions
              </h1>
              <Badge variant="info" size="sm" className="font-bold shrink-0 dark:bg-[rgba(59,130,246,0.12)] dark:text-[#60A5FA] dark:border-[rgba(59,130,246,0.25)]">
                {total} Total
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] font-normal truncate">
              {course ? `Manage scheduled live classes for ${course.title}` : 'Manage scheduled live classes for this course.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAllAttendance}
              className="h-9 text-xs font-semibold bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC]"
              leftIcon={<Download className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />}
            >
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyticsOpen(true)}
              className="h-9 text-xs font-semibold bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC]"
              leftIcon={<BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            >
              Analytics
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/courses/${courseUuid}/live-sessions/new`)}
              className="h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-4 shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
            >
              Schedule Session
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. FEATURE TOGGLE CHECK */}
      {!courseFeatures.liveSessions && !courseFeatures.liveClasses ? (
        <FeatureDisabledBanner
          featureTitle="Live Sessions"
          description="Live Interactive Sessions are currently disabled for this course in Course Features settings."
          courseUuid={courseUuid || ''}
        />
      ) : (
        <>
          {/* 3. TELEMETRY SUMMARY CARDS */}
          <LiveSessionSummaryCards
            total={total}
            liveNow={liveNow}
            upcoming={upcoming}
            completed={completed}
            cancelled={cancelled}
            recorded={recorded}
            avgAttendanceRate={avgAttendanceRate}
          />

          {/* PROMINENT LIVE NOW SECTION */}
          {liveNowSessions.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-500 animate-pulse" />
                Live Now ({liveNowSessions.length})
              </h2>

              <div className="space-y-3">
                {liveNowSessions.map((session) => (
                  <LiveSessionCard
                    key={session.id}
                    session={session}
                    onEdit={(s) => navigate(`/courses/${courseUuid}/live-sessions/${s.id}/edit`)}
                    onStart={handleStart}
                    onEnd={handleEnd}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    onJoin={handleJoin}
                    onOpenAttendance={(s) => {
                      setActiveAttendanceSession(s);
                      navigate(`/courses/${courseUuid}/live-sessions/${s.id}/attendance`);
                    }}
                    onOpenRecording={(s) => {
                      setActiveRecordingSession(s);
                      navigate(`/courses/${courseUuid}/live-sessions/${s.id}/recording`);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 4. SEARCH, STATUS FILTER CHIPS & VIEW MODE SWITCH */}
          <div className="space-y-3 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-3.5 rounded-2xl shadow-2xs font-sans text-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search live sessions by title, platform, agenda..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
                  className="h-9 text-xs font-medium bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B]"
                />
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl border border-slate-200 dark:border-[#334155] shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-extrabold'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-extrabold'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </button>
              </div>
            </div>

            {/* STATUS FILTER CHIPS */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pt-1 border-t border-slate-100 dark:border-[#263244]">
              {[
                { id: 'all', label: `All (${total})` },
                { id: 'upcoming', label: `Upcoming (${upcoming})` },
                { id: 'live', label: `Live Now (${liveNow})` },
                { id: 'completed', label: `Completed (${completed})` },
                { id: 'cancelled', label: `Cancelled (${cancelled})` },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStatusFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === chip.id
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. VIEW CONTENT */}
          {viewMode === 'calendar' ? (
            <LiveSessionCalendarView
              sessions={courseSessions}
              onSelectSession={(s) => navigate(`/courses/${courseUuid}/live-sessions/${s.id}/edit`)}
              onCreateNewDate={(_) => navigate(`/courses/${courseUuid}/live-sessions/new`)}
            />
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
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
                  onEdit={(s) => navigate(`/courses/${courseUuid}/live-sessions/${s.id}/edit`)}
                  onStart={handleStart}
                  onEnd={handleEnd}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  onJoin={handleJoin}
                  onOpenAttendance={(s) => {
                    setActiveAttendanceSession(s);
                    navigate(`/courses/${courseUuid}/live-sessions/${s.id}/attendance`);
                  }}
                  onOpenRecording={(s) => {
                    setActiveRecordingSession(s);
                    navigate(`/courses/${courseUuid}/live-sessions/${s.id}/recording`);
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Video}
              title="No Live Sessions Found"
              description="Schedule your first live Zoom, Google Meet, or Microsoft Teams session to interact directly with your students."
              actionLabel="Schedule Session"
              onAction={() => navigate(`/courses/${courseUuid}/live-sessions/new`)}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          )}
        </>
      )}

      {/* MODALS */}
      <LiveSessionAttendanceModal
        isOpen={!!activeAttendanceSession}
        onClose={() => {
          setActiveAttendanceSession(null);
          navigate(`/courses/${courseUuid}/live-sessions`);
        }}
        session={activeAttendanceSession}
      />

      <LiveSessionRecordingModal
        isOpen={!!activeRecordingSession}
        onClose={() => {
          setActiveRecordingSession(null);
          navigate(`/courses/${courseUuid}/live-sessions`);
        }}
        session={activeRecordingSession}
        onSaveRecording={uploadRecording}
      />

      <LiveSessionAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        sessions={courseSessions}
      />
    </div>
  );
};
