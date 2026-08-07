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

// Store & Components
import { useLiveSessionStore, type LiveSessionItem } from '../../live-sessions/store/liveSession.store';
import { useCourseFeaturesStore, DEFAULT_COURSE_FEATURES } from '../store/courseFeatures.store';
import { FeatureDisabledBanner } from '../../discussions/components/FeatureDisabledBanner';

import { LiveSessionSummaryCards } from '../../live-sessions/components/LiveSessionSummaryCards';
import { LiveSessionCard } from '../../live-sessions/components/LiveSessionCard';
import { LiveSessionCalendarView } from '../../live-sessions/components/LiveSessionCalendarView';
import { CreateLiveSessionModal } from '../../live-sessions/components/CreateLiveSessionModal';
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

  const isCreateRoute = location.pathname.endsWith('/create');
  const targetSessionUuid = !isCreateRoute && pathSegments[0] ? pathSegments[0] : null;
  const isAttendanceRoute = location.pathname.endsWith('/attendance');
  const isRecordingRoute = location.pathname.endsWith('/recording');

  // Feature Flags Check
  const getCourseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures);
  const courseFeatures = getCourseFeatures ? getCourseFeatures(courseUuid) : (useCourseFeaturesStore.getState().featuresByCourse[courseUuid] || DEFAULT_COURSE_FEATURES);

  // Live Sessions Store State
  const sessions = useLiveSessionStore((state) => state.sessions);
  const addLiveSession = useLiveSessionStore((state) => state.addLiveSession);
  const updateLiveSession = useLiveSessionStore((state) => state.updateLiveSession);
  const cancelLiveSession = useLiveSessionStore((state) => state.cancelLiveSession);
  const startLiveSession = useLiveSessionStore((state) => state.startLiveSession);
  const endLiveSession = useLiveSessionStore((state) => state.endLiveSession);
  const uploadRecording = useLiveSessionStore((state) => state.uploadRecording);
  const deleteLiveSession = useLiveSessionStore((state) => state.deleteLiveSession);

  // Filter States
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

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

  // Handle route subpaths — setState deferred to avoid synchronous cascade
  useEffect(() => {
    const apply = () => {
      if (isCreateRoute) {
        setEditingSession(null);
        setIsModalOpen(true);
      } else if (targetSessionUuid) {
        const found = sessions.find((s) => s.id === targetSessionUuid);
        if (found) {
          if (isAttendanceRoute) {
            setActiveAttendanceSession(found);
          } else if (isRecordingRoute) {
            setActiveRecordingSession(found);
          }
        }
      }
    };
    const tid = setTimeout(apply, 0);
    return () => clearTimeout(tid);
  }, [location.pathname, targetSessionUuid, isCreateRoute, isAttendanceRoute, isRecordingRoute, sessions]);

  const courseSessions = useMemo(() => {
    return sessions.filter((s) => s.courseUuid === courseUuid);
  }, [sessions, courseUuid]);

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
      list = list.filter((s) => s.platform === platformFilter);
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

  const handleSaveForm = (data: Omit<LiveSessionItem, 'id' | 'createdAt' | 'updatedAt' | 'attendanceRecords'>) => {
    if (editingSession) {
      updateLiveSession(editingSession.id, data);
    } else {
      addLiveSession({
        ...data,
        courseUuid,
      });
    }
    navigate(`/courses/${courseUuid}/live-sessions`);
  };

  const handleExportAllAttendance = () => {
    alert(`Exported master attendance report for course "${courseUuid}" (CSV format).`);
  };

  return (
    <div className="space-y-6 text-left font-sans pb-16">
      {/* 1. PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Virtual Classroom &amp; Live Sessions</h1>
              <Badge variant="info" size="sm" className="font-bold">
                {total} Total Sessions
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Schedule, conduct, and archive live interactive webinars for this course.
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
              Export Attendance
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
              onClick={() => {
                setEditingSession(null);
                setIsModalOpen(true);
                navigate(`/courses/${courseUuid}/live-sessions/create`);
              }}
              className="h-9 bg-[#2563EB] text-white font-extrabold text-xs px-4 hover:bg-blue-700"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
            >
              Create Live Session
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

          {/* 4. SEARCH, PLATFORM FILTERS & VIEW MODE SWITCH */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs font-sans text-xs">
            <div className="flex flex-1 items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search live sessions by title, platform, agenda..."
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
                <option value="all">All Platforms</option>
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Jitsi">Jitsi</option>
                <option value="Custom">Custom Link</option>
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

            {/* View Mode Switcher ([ List View ] | [ Calendar View ]) */}
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

          {/* 5. VIEW CONTENT */}
          {viewMode === 'calendar' ? (
            <LiveSessionCalendarView
              sessions={courseSessions}
              onSelectSession={(s) => {
                setEditingSession(s);
                setIsModalOpen(true);
              }}
              onCreateNewDate={(_) => {
                setEditingSession(null);
                setIsModalOpen(true);
              }}
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
                  onEdit={(s) => {
                    setEditingSession(s);
                    setIsModalOpen(true);
                  }}
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
            <Card padding="lg" className="bg-white border border-slate-200 text-center py-14 space-y-4 font-sans">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Video className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-slate-900">No Live Sessions Found</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Schedule your first live Zoom, Google Meet, or Microsoft Teams session to interact directly with your course students.
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingSession(null);
                  setIsModalOpen(true);
                }}
                className="bg-[#2563EB] text-white font-extrabold text-xs px-6"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Schedule Live Session
              </Button>
            </Card>
          )}
        </>
      )}

      {/* SHARED MODALS */}
      <CreateLiveSessionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSession(null);
          navigate(`/courses/${courseUuid}/live-sessions`);
        }}
        onSubmit={handleSaveForm}
        editingSession={editingSession}
      />

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
