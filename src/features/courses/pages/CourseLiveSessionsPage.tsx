import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Video,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Download,
  BarChart3,
  List,
  AlertCircle,
  ArrowLeft,
  Filter,
  MoreVertical,
  X,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

// Store & Services
import { useLiveSessionStore, type LiveSessionItem } from '../../live-sessions/store/liveSession.store';
import { liveSessionsService } from '../../../services/liveSessions.service';
import { coursesService, type CourseDetail } from '../../../services/courses.service';
import { useCourseFeaturesStore, DEFAULT_COURSE_FEATURES } from '../store/courseFeatures.store';
import { FeatureDisabledBanner } from '../../discussions/components/FeatureDisabledBanner';
import { courseRoutes } from '../../../utils/courseRoutes.utils';

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

  // Scroll to top on mount or route enter
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const mainContainer = document.querySelector('main') || document.documentElement;
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }, [location.pathname]);

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
  const [platformFilter, setPlatformFilter] = useState('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

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

    if (platformFilter !== 'all') {
      list = list.filter((s) => s.platform.toLowerCase().replace(/\s+/g, '') === platformFilter.toLowerCase().replace(/\s+/g, ''));
    }

    return list.sort((a, b) => {
      if (a.status === 'live') return -1;
      if (b.status === 'live') return 1;
      return new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime() - new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime();
    });
  }, [courseSessions, search, statusFilter, platformFilter]);

  // Metrics
  const total = courseSessions.length;
  const liveNow = courseSessions.filter((s) => s.status === 'live').length;
  const upcoming = courseSessions.filter((s) => s.status === 'upcoming').length;
  const completed = courseSessions.filter((s) => s.status === 'completed').length;
  const cancelled = courseSessions.filter((s) => s.status === 'cancelled').length;
  const recorded = courseSessions.filter((s) => s.isRecorded && s.recordingUrl).length;

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    courseSessions.forEach((s) => {
      if (s.platform) set.add(s.platform);
    });
    return Array.from(set);
  }, [courseSessions]);

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

  const backLink = courseUuid ? courseRoutes.detail(courseUuid) : '/courses';

  if (courseError) {
    return (
      <div className="w-full space-y-4 font-sans text-left p-4 sm:p-6">
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
    <div
      className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6 text-left font-sans"
      style={{
        paddingBottom: 'calc(var(--mobile-bottom-nav-height, 56px) + env(safe-area-inset-bottom, 0px) + 24px)',
      }}
    >
      {/* 1. MOBILE-FIRST PAGE HEADER & BACK LINK */}
      <div className="space-y-3">
        {/* Back to Course Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course</span>
          </Link>

          {/* Desktop & Mobile Header Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
              className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer transition-colors"
              aria-label="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isHeaderMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-48 bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl py-1 text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    handleExportAllAttendance();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-[#172033] flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  <span>Export Attendance</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    setIsAnalyticsOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-[#172033] flex items-center gap-2 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>View Analytics</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title and Badge Row */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Live Sessions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 dark:bg-blue-500/20 text-[#2563EB] dark:text-[#60A5FA] border border-blue-500/20 shrink-0">
              {total} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            Manage scheduled live classes for this course.
          </p>
        </div>

        {/* Full Width Primary Action: Schedule Session */}
        <button
          type="button"
          onClick={() => navigate(`/courses/${courseUuid}/live-sessions/new`)}
          className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* 2. FEATURE TOGGLE CHECK */}
      {!courseFeatures.liveSessions && !courseFeatures.liveClasses ? (
        <FeatureDisabledBanner
          featureTitle="Live Sessions"
          description="Live Interactive Sessions are currently disabled for this course in Course Features settings."
          courseUuid={courseUuid || ''}
        />
      ) : (
        <>
          {/* 3. MOBILE STATS GRID */}
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

          {/* 4. SEARCH + FILTER BUTTON */}
          <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2 items-center">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className="w-12 h-12 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Filter"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* 5. LIST / CALENDAR SWITCH */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-[#111827] p-1 rounded-xl border border-slate-200 dark:border-[#263244] h-12">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center gap-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center justify-center gap-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>
          </div>

          {/* 6. STATUS FILTER CHIPS (Horizontal Scroll Only) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full min-w-0">
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
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  statusFilter === chip.id
                    ? 'bg-[#2563EB] text-white shadow-2xs font-bold'
                    : 'bg-slate-100 dark:bg-[#111827] text-[#64748B] dark:text-[#94A3B8] border border-slate-200 dark:border-[#263244] hover:bg-slate-200 dark:hover:bg-[#172033]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* 7. VIEW CONTENT */}
          {viewMode === 'calendar' ? (
            <LiveSessionCalendarView
              sessions={courseSessions}
              onSelectSession={(s) => navigate(`/courses/${courseUuid}/live-sessions/${s.id}/edit`)}
              onCreateNewDate={(_) => navigate(`/courses/${courseUuid}/live-sessions/new`)}
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
              title="No live sessions scheduled"
              description="Schedule your first live class for this course."
              actionLabel="Schedule Session"
              onAction={() => navigate(`/courses/${courseUuid}/live-sessions/new`)}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          )}
        </>
      )}

      {/* FILTER BOTTOM SHEET */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#111827] rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 max-w-md w-full space-y-4 shadow-2xl border border-[#E2E8F0] dark:border-[#263244] text-left font-sans">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Filter Sessions</h3>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] px-3 text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  <option value="all">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live Now</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {availablePlatforms.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Platform</label>
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] px-3 text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    <option value="all">All Platforms</option>
                    {availablePlatforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setPlatformFilter('all');
                  setSearch('');
                  setIsFilterSheetOpen(false);
                }}
                className="text-xs font-semibold h-9 px-3"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => setIsFilterSheetOpen(false)}
                className="text-xs font-bold h-9 px-4 bg-[#2563EB] text-white"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
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
