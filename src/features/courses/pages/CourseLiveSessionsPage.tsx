import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Video,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Download,
  BarChart3,
  List,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

// Store & Components
import { useLiveSessionStore, type LiveSessionItem } from '../../live-sessions/store/liveSession.store';
import { useCourseFeaturesStore, DEFAULT_COURSE_FEATURES } from '../store/courseFeatures.store';
import { FeatureDisabledBanner } from '../../discussions/components/FeatureDisabledBanner';

import { LiveSessionSummaryCards } from '../../live-sessions/components/LiveSessionSummaryCards';
import { LiveSessionCard } from '../../live-sessions/components/LiveSessionCard';
import { LiveSessionCalendarView } from '../../live-sessions/components/LiveSessionCalendarView';
import { LiveSessionAttendanceModal } from '../../live-sessions/components/LiveSessionAttendanceModal';
import { LiveSessionRecordingModal } from '../../live-sessions/components/LiveSessionRecordingModal';
import { LiveSessionAnalyticsModal } from '../../live-sessions/components/LiveSessionAnalyticsModal';

export const CourseLiveSessionsPage: React.FC = () => {
  const params = useParams<{ courseUuid?: string; '*': string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const courseUuid = params.courseUuid || '550e8400-e29b-41d4-a716-446655440000';

  // Subpath parsing
  const subPath = (params['*'] || '').replace(/^\/+/, '');
  const pathSegments = subPath.split('/').filter(Boolean);

  const targetSessionUuid = pathSegments[0] && !['new', 'create'].includes(pathSegments[0]) ? pathSegments[0] : null;
  const isAttendanceRoute = location.pathname.endsWith('/attendance');
  const isRecordingRoute = location.pathname.endsWith('/recording');

  // Feature Flags Check
  const getCourseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures);
  const courseFeatures = getCourseFeatures ? getCourseFeatures(courseUuid) : (useCourseFeaturesStore.getState().featuresByCourse[courseUuid] || DEFAULT_COURSE_FEATURES);

  // Live Sessions Store State
  const sessions = useLiveSessionStore((state) => state.sessions);
  const cancelLiveSession = useLiveSessionStore((state) => state.cancelLiveSession);
  const startLiveSession = useLiveSessionStore((state) => state.startLiveSession);
  const endLiveSession = useLiveSessionStore((state) => state.endLiveSession);
  const uploadRecording = useLiveSessionStore((state) => state.uploadRecording);
  const deleteLiveSession = useLiveSessionStore((state) => state.deleteLiveSession);

  // Filter States
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States for Attendance / Recording / Analytics
  const [activeAttendanceSession, setActiveAttendanceSession] = useState<LiveSessionItem | null>(null);
  const [activeRecordingSession, setActiveRecordingSession] = useState<LiveSessionItem | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Handle route subpaths — setState deferred to avoid synchronous cascade
  useEffect(() => {
    const timer = setTimeout(() => {
      if (targetSessionUuid) {
        const found = sessions.find((s) => s.id === targetSessionUuid);
        if (found) {
          if (isAttendanceRoute) setActiveAttendanceSession(found);
          else if (isRecordingRoute) setActiveRecordingSession(found);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname, targetSessionUuid, isAttendanceRoute, isRecordingRoute, sessions]);

  const courseSessions = useMemo(() => {
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
    alert(`Exported master attendance report for course "${courseUuid}" (CSV format).`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-36 md:pb-12">
      {/* 1. COMPACT PAGE HEADER */}
      <Card padding="sm" className="bg-white border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                Live Sessions
              </h1>
              <Badge variant="info" size="sm" className="font-bold shrink-0">
                {total} Total
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
              Manage scheduled live classes for this course.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAllAttendance}
              className="h-9 text-xs font-semibold text-slate-700"
              leftIcon={<Download className="w-4 h-4 text-blue-600" />}
            >
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyticsOpen(true)}
              className="h-9 text-xs font-semibold text-slate-700"
              leftIcon={<BarChart3 className="w-4 h-4 text-indigo-600" />}
            >
              Analytics
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/courses/${courseUuid}/live-sessions/new`)}
              className="h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-4"
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
          courseUuid={courseUuid}
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
              <h2 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                Live Now ({liveNowSessions.length})
              </h2>

              <div className="space-y-3">
                {liveNowSessions.map((session) => (
                  <LiveSessionCard
                    key={session.id}
                    session={session}
                    onEdit={(s) => navigate(`/courses/${courseUuid}/live-sessions/${s.id}/edit`)}
                    onStart={startLiveSession}
                    onEnd={endLiveSession}
                    onCancel={cancelLiveSession}
                    onDelete={deleteLiveSession}
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
          <div className="space-y-3 bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-2xs font-sans text-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search live sessions by title, platform, agenda..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                  className="h-9 text-xs font-medium"
                />
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
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
                      ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </button>
              </div>
            </div>

            {/* STATUS FILTER CHIPS */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === chip.id
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  onEdit={(s) => navigate(`/courses/${courseUuid}/live-sessions/${s.id}/edit`)}
                  onStart={startLiveSession}
                  onEnd={endLiveSession}
                  onCancel={cancelLiveSession}
                  onDelete={deleteLiveSession}
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
