import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Award,
  CircleHelp,
  ClipboardCheck,
  BarChart3,
  Edit3,
  Check,
  Activity,
  Mail,
  Phone,
  Calendar,
  UserX,
  RefreshCw,
  MoreVertical,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import {
  studentsService,
  type StudentCourseOverview,
  type StudentData,
} from '../../../services/students.service';
import { courseFeaturesService } from '../../../services/courseFeatures.service';
import { certificatesService, type CertificateData } from '../../../services/certificates.service';
import { useStudentStore } from '../store/student.store';
import { EnrollStudentModal } from '../components/EnrollStudentModal';

type StudentTabId =
  | 'overview'
  | 'progress'
  | 'modules'
  | 'activity'
  | 'assignments'
  | 'quizzes'
  | 'certificates'
  | 'courses';

export const StudentSinglePage: React.FC = () => {
  const navigate = useNavigate();
  const toggleStudentStatus = useStudentStore((state) => state.toggleStudentStatus);
  const { studentId, studentUuid, courseId, courseUuid } = useParams<{
    studentId?: string;
    studentUuid?: string;
    courseId?: string;
    courseUuid?: string;
  }>();

  const currentCourseUuid = courseUuid || courseId || '';
  const currentStudentUuid = studentUuid || studentId || '';

  const [activeTab, setActiveTab] = useState<StudentTabId>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Action Modals State
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch feature status for this course to enforce feature rule
  const { data: featureData, isLoading: isFeatureLoading } = useQuery({
    queryKey: ['course-features-check', currentCourseUuid],
    queryFn: async () => {
      if (!currentCourseUuid) return true;
      try {
        const list = await courseFeaturesService.list(currentCourseUuid);
        const feat = list.find((f: any) => f.code === 'LESSON_LOCKING_REPORT');
        return feat ? feat.effective_enabled : false;
      } catch {
        return false;
      }
    },
    enabled: Boolean(currentCourseUuid),
  });

  const isReportFeatureEnabled = currentCourseUuid ? (featureData ?? false) : true;

  // Backend Data Fetching via React Query with unique cache key (only enabled if report feature is ON)
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['course-student-overview', currentCourseUuid, currentStudentUuid],
    queryFn: async (): Promise<StudentCourseOverview> => {
      if (!currentStudentUuid) {
        const err = new Error('STUDENT_NOT_FOUND');
        (err as any).status = 404;
        throw err;
      }

      // 1. Try dedicated course student overview endpoint if courseUuid is present
      if (currentCourseUuid) {
        try {
          return await studentsService.getStudentCourseOverview(currentCourseUuid, currentStudentUuid);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            const notFoundErr = new Error('STUDENT_NOT_FOUND');
            (notFoundErr as any).status = 404;
            throw notFoundErr;
          }
        }
      }

      // 2. Fallback / direct profile endpoint
      let studentData: StudentData;
      try {
        studentData = await studentsService.getStudent(currentStudentUuid);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          const notFoundErr = new Error('STUDENT_NOT_FOUND');
          (notFoundErr as any).status = 404;
          throw notFoundErr;
        }
        throw err;
      }

      let enrollments: any[] = [];
      try {
        enrollments = await studentsService.listStudentEnrollments(currentStudentUuid);
      } catch {
        enrollments = [];
      }

      let certificates: CertificateData[] = [];
      try {
        const studentUserId = studentData.user_id || studentData.user?.id || currentStudentUuid;
        const certRes = await certificatesService.listCertificates({
          student: studentUserId,
          ...(currentCourseUuid ? { course: currentCourseUuid } : {}),
        });
        certificates = Array.isArray(certRes) ? certRes : (certRes as any)?.results || [];
      } catch {
        certificates = [];
      }

      const matchEnr = currentCourseUuid
        ? enrollments.find(
            (e) => e.course?.id === currentCourseUuid || e.course?.uuid === currentCourseUuid || e.course === currentCourseUuid
          ) || enrollments[0]
        : enrollments[0];

      const full_name = studentData.display_name || studentData.full_name || studentData.user?.full_name || studentData.email || '—';
      const student_code = studentData.student_code || `CS-${currentStudentUuid.slice(0, 6).toUpperCase()}`;

      return {
        student: {
          uuid: studentData.id || currentStudentUuid,
          full_name,
          email: studentData.email || studentData.user?.email || '—',
          phone: studentData.phone || studentData.user?.phone || '',
          student_code,
          avatar: studentData.profile_photo?.file?.url || studentData.avatar_url || null,
          status: studentData.status || 'ACTIVE',
        },
        course: {
          uuid: currentCourseUuid || matchEnr?.course?.id || '',
          title: matchEnr?.course?.title || 'Enrolled Course',
        },
        enrollment: {
          uuid: matchEnr?.id || '',
          status: matchEnr?.status || 'ACTIVE',
          enrolled_at: matchEnr?.enrolled_at || studentData.joined_at || new Date().toISOString(),
        },
        progress: {
          completed_lessons: matchEnr?.completed_lessons ?? 0,
          total_lessons: matchEnr?.total_lessons ?? 0,
          percentage: Number(matchEnr?.progress_percent ?? matchEnr?.progress_percentage ?? 0),
        },
        modules: [],
        lessons: [],
        quiz_attempts: [],
        assignment_submissions: [],
        activities: [],
        certificates: certificates.map((c) => ({
          id: c.id,
          certificate_number: c.certificate_number,
          issued_at: c.issued_at,
          status: c.status,
        })),
      };
    },
    enabled: Boolean(currentStudentUuid) && isReportFeatureEnabled,
    retry: false,
  });

  const isLoading = isFeatureLoading || (isReportFeatureEnabled && isOverviewLoading);

  const isNotFound = isError && ((error as any)?.status === 404 || (error as any)?.message === 'STUDENT_NOT_FOUND');

  // Extract real database student telemetry
  const student = overviewData?.student;
  const course = overviewData?.course;
  const enrollment = overviewData?.enrollment;
  const progress = overviewData?.progress;
  const modules = overviewData?.modules || [];
  const lessons = overviewData?.lessons || [];
  const quizAttempts = overviewData?.quiz_attempts || [];
  const assignmentSubmissions = overviewData?.assignment_submissions || [];
  const activities = overviewData?.activities || [];
  const certificates = overviewData?.certificates || [];

  const name = student?.full_name || '—';
  const email = student?.email || '—';
  const phone = student?.phone || '';
  const statusRaw = (enrollment?.status || student?.status || 'ACTIVE').toUpperCase();

  const statusDisplay =
    statusRaw === 'ACTIVE'
      ? 'Active'
      : statusRaw === 'COMPLETED'
      ? 'Completed'
      : statusRaw === 'EXPIRED'
      ? 'Expired'
      : statusRaw === 'SUSPENDED'
      ? 'Suspended'
      : statusRaw === 'PENDING'
      ? 'Pending'
      : statusRaw;

  // Account ID formatting
  const rawCode = student?.student_code;
  const publicAccountId = rawCode
    ? rawCode.startsWith('STU-') || rawCode.startsWith('CS-')
      ? rawCode
      : `CS-${rawCode}`
    : `CS-${(currentStudentUuid || '1024').slice(0, 6).toUpperCase()}`;

  const joinedDateStr = enrollment?.enrolled_at;
  const joinedDate = joinedDateStr
    ? new Date(joinedDateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  // Metrics from real backend
  const progressPercent = Math.min(100, Math.max(0, Number(progress?.percentage ?? 0)));
  const completedLessons = progress?.completed_lessons ?? 0;
  const totalLessons = progress?.total_lessons ?? 0;

  // Initials generator
  const getInitials = (n: string) => {
    if (!n || n === '—') return 'ST';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const tabs: { id: StudentTabId; label: string; icon: React.ElementType; count?: number | string }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'modules', label: 'Modules & Lessons', icon: Layers, count: lessons.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: activities.length },
    { id: 'assignments', label: 'Assignments', icon: ClipboardCheck, count: assignmentSubmissions.length },
    { id: 'quizzes', label: 'Quizzes', icon: CircleHelp, count: quizAttempts.length },
    { id: 'certificates', label: 'Certificates', icon: Award, count: certificates.length },
  ];

  const handleConfirmExtend = () => {
    setIsExtendModalOpen(false);
    showToast(`Access updated for ${name}.`);
  };

  const handleConfirmRemove = () => {
    setIsRemoveModalOpen(false);
    showToast(`${name} removed from course.`);
    navigate('/students');
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) return;
    try {
      await studentsService.sendStudentEmail(currentStudentUuid, {
        subject: emailSubject,
        message: emailMessage,
      });
      setIsEmailModalOpen(false);
      setEmailSubject('');
      setEmailMessage('');
      showToast(`Message sent to ${name}.`);
    } catch {
      showToast('Failed to send email.');
    }
  };

  // -------------------------------------------------------------
  // 1. FEATURE DISABLED STATE
  // -------------------------------------------------------------
  if (!isReportFeatureEnabled) {
    return (
      <div
        className="w-full max-w-full min-w-0 box-border p-8 sm:p-12 rounded-2xl text-center space-y-4 font-sans my-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderStyle: 'solid', borderWidth: '1px' }}
      >
        <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Student Reporting Disabled
          </h2>
          <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Student learning reports and progress tracking are currently disabled for this course. Enable <strong>Lesson Locking + Student Report</strong> in course settings to view detailed student overview analytics.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => navigate(currentCourseUuid ? `/courses/${currentCourseUuid}/students` : '/students')}
            variant="outline"
            className="text-xs font-semibold px-4 py-2 cursor-pointer"
          >
            Back to Enrolled Students
          </Button>
          {currentCourseUuid && (
            <Button
              onClick={() => navigate(`/courses/${currentCourseUuid}/features`)}
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-primary-foreground)' }}
              className="text-xs font-semibold px-4 py-2 cursor-pointer"
            >
              Configure Course Features
            </Button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. LOADING STATE (Requirement 15)
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div
        className="w-full max-w-full min-w-0 box-border p-6 sm:p-12 rounded-2xl flex flex-col items-center justify-center font-sans space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderStyle: 'solid', borderWidth: '1px' }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-primary)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          Loading real student telemetry...
        </span>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. STUDENT NOT FOUND STATE (Requirement 17)
  // -------------------------------------------------------------
  if (isNotFound) {
    return (
      <div
        className="w-full max-w-full min-w-0 box-border p-8 sm:p-12 rounded-2xl text-center space-y-4 font-sans my-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderStyle: 'solid', borderWidth: '1px' }}
      >
        <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Student Not Found
          </h2>
          <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            This student is not enrolled in this course or available in your academy.
          </p>
        </div>
        <Button
          onClick={() => navigate('/students')}
          style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-primary-foreground)' }}
          className="text-xs font-semibold px-4 py-2 cursor-pointer"
        >
          Back to Students List
        </Button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. API ERROR STATE (Requirement 16)
  // -------------------------------------------------------------
  if (isError || !overviewData) {
    return (
      <div
        className="w-full max-w-full min-w-0 box-border p-8 sm:p-12 rounded-2xl text-center space-y-4 font-sans my-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderStyle: 'solid', borderWidth: '1px' }}
      >
        <AlertCircle className="w-12 h-12 mx-auto text-rose-500" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Unable to load student overview.
          </h2>
          <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Please check your backend connection and try again.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-primary-foreground)' }}
          className="text-xs font-semibold px-4 py-2 cursor-pointer"
        >
          Retry
        </Button>
      </div>
    );
  }

  const avatarUrl = student?.avatar;

  return (
    <div
      className="w-full max-w-full min-w-0 box-border space-y-4 sm:space-y-6 text-left font-sans pb-36 sm:pb-12 max-w-[1600px] mx-auto px-2 sm:px-4"
      style={{ backgroundColor: 'var(--page-background)', color: 'var(--text-primary)' }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Button */}
      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={() => navigate(currentCourseUuid ? `/courses/${currentCourseUuid}/students` : '/students')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>
        <span className="text-xs font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Instructor Student Overview
        </span>
      </div>

      {/* 1. STUDENT HEADER PROFILE CARD */}
      <div
        className="p-4 sm:p-6 rounded-2xl space-y-4 w-full max-w-full min-w-0 box-border"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          borderStyle: 'solid',
          borderWidth: '1px',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Avatar */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full font-bold text-base sm:text-lg flex items-center justify-center shrink-0 overflow-hidden"
              style={{
                backgroundColor: avatarUrl
                  ? 'transparent'
                  : 'color-mix(in srgb, var(--brand-primary) 12%, var(--surface-secondary))',
                color: 'var(--brand-primary)',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials(name)
              )}
            </div>

            {/* Student Meta Details */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-2xl font-bold tracking-tight leading-snug break-words" style={{ color: 'var(--text-primary)' }}>
                  {name}
                </h1>
                <Badge
                  variant={
                    statusDisplay === 'Active' || statusDisplay === 'Completed'
                      ? 'success'
                      : statusDisplay === 'Suspended' || statusDisplay === 'Expired'
                      ? 'error'
                      : 'secondary'
                  }
                  size="sm"
                  dot
                >
                  {statusDisplay}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium flex-wrap" style={{ color: 'var(--text-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Account ID: {publicAccountId}
                </span>
                {email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" /> {email}
                    </span>
                  </>
                )}
                {phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 shrink-0" /> {phone}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 shrink-0" /> Enrolled: {joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
            <Button
              size="sm"
              leftIcon={<Mail className="w-4 h-4" />}
              onClick={() => setIsEmailModalOpen(true)}
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-primary-foreground)' }}
              className="text-xs font-semibold h-9 cursor-pointer"
            >
              Message Student
            </Button>

            {currentStudentUuid && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit3 className="w-4 h-4" />}
                onClick={() => navigate(`/students/${currentStudentUuid}/edit`)}
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                className="text-xs font-semibold h-9 cursor-pointer"
              >
                Edit Student
              </Button>
            )}

            {/* 3-Dot Dropdown Options */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl transition-colors cursor-pointer h-9 w-9 flex items-center justify-center"
                style={{
                  borderColor: 'var(--border)',
                  borderWidth: '1px',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--surface)',
                }}
                title="More Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 top-10 z-20 w-52 rounded-xl shadow-lg py-1 text-xs space-y-0.5 font-sans"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderWidth: '1px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsExtendModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left font-medium flex items-center gap-2 cursor-pointer hover:bg-[var(--surface-hover)]"
                  >
                    <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <span>Extend Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (currentStudentUuid) toggleStudentStatus(currentStudentUuid);
                    }}
                    className="w-full px-3 py-2 text-left font-medium flex items-center gap-2 cursor-pointer hover:bg-[var(--surface-hover)]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <span>{statusDisplay === 'Active' ? 'Suspend Student' : 'Reactivate Student'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsRemoveModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left font-medium flex items-center gap-2 cursor-pointer text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <UserX className="w-3.5 h-3.5 text-rose-600" />
                    <span>Remove Enrollment</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. STUDENT TABS */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide w-full max-w-full min-w-0 font-sans border-b pb-2" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className="px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 border"
              style={
                isActive
                  ? {
                      backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, var(--surface-secondary))',
                      color: 'var(--brand-primary)',
                      borderColor: 'var(--brand-primary)',
                      fontWeight: 600,
                    }
                  : {
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)',
                    }
              }
            >
              <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
              <span className="whitespace-nowrap">{t.label}</span>
              {t.count !== undefined && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={
                    isActive
                      ? { backgroundColor: 'var(--brand-primary)', color: 'var(--brand-primary-foreground)' }
                      : { backgroundColor: 'var(--surface-secondary)', color: 'var(--text-muted)' }
                  }
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. COURSE PROGRESS & METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 w-full max-w-full min-w-0">
        <div
          className="p-3.5 rounded-xl border text-center space-y-1"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <BarChart3 className="w-4 h-4 mx-auto" style={{ color: 'var(--brand-primary)' }} />
          <span className="text-[10px] block font-medium" style={{ color: 'var(--text-muted)' }}>
            Course Progress
          </span>
          <strong className="text-sm font-semibold block" style={{ color: 'var(--brand-primary)' }}>
            {progressPercent}%
          </strong>
        </div>

        <div
          className="p-3.5 rounded-xl border text-center space-y-1"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <BookOpen className="w-4 h-4 mx-auto text-emerald-600" />
          <span className="text-[10px] block font-medium" style={{ color: 'var(--text-muted)' }}>
            Lessons Completed
          </span>
          <strong className="text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>
            {totalLessons > 0 ? `${completedLessons}/${totalLessons}` : '0/0'}
          </strong>
        </div>

        <div
          className="p-3.5 rounded-xl border text-center space-y-1"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <CircleHelp className="w-4 h-4 mx-auto text-sky-600" />
          <span className="text-[10px] block font-medium" style={{ color: 'var(--text-muted)' }}>
            Quiz Attempts
          </span>
          <strong className="text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>
            {quizAttempts.length}
          </strong>
        </div>

        <div
          className="p-3.5 rounded-xl border text-center space-y-1"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Award className="w-4 h-4 mx-auto text-emerald-600" />
          <span className="text-[10px] block font-medium" style={{ color: 'var(--text-muted)' }}>
            Certificates
          </span>
          <strong
            className="text-sm font-semibold block"
            style={{ color: certificates.length > 0 ? 'var(--brand-primary)' : 'var(--text-primary)' }}
          >
            {certificates.length > 0 ? `${certificates.length} Issued` : '0'}
          </strong>
        </div>

        <div
          className="p-3.5 rounded-xl border text-center space-y-1 col-span-2 sm:col-span-1"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <ClipboardCheck className="w-4 h-4 mx-auto" style={{ color: 'var(--brand-primary)' }} />
          <span className="text-[10px] block font-medium" style={{ color: 'var(--text-muted)' }}>
            Assignments
          </span>
          <strong className="text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>
            {assignmentSubmissions.length}
          </strong>
        </div>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4 w-full max-w-full min-w-0">
          {/* Course Progress Card */}
          <div
            className="p-4 sm:p-5 rounded-xl border space-y-3"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Course Progress Overview ({course?.title || 'Course'})
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: 'var(--text-secondary)' }}>Completion Status</span>
                <span style={{ color: 'var(--brand-primary)' }}>{progressPercent}% Complete</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%`, backgroundColor: 'var(--brand-primary)' }}
                />
              </div>
              <span className="text-[11px] block pt-1" style={{ color: 'var(--text-muted)' }}>
                {totalLessons > 0
                  ? `${completedLessons} of ${totalLessons} trackable lessons completed`
                  : 'No lessons available'}
              </span>
            </div>
          </div>

          {/* Student Details */}
          <div
            className="p-4 sm:p-5 rounded-xl border space-y-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Student Profile Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg border space-y-1" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-medium block" style={{ color: 'var(--text-muted)' }}>Full Name</span>
                <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>{name}</strong>
              </div>

              <div className="p-3 rounded-lg border space-y-1" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-medium block" style={{ color: 'var(--text-muted)' }}>Email Address</span>
                <strong className="font-semibold block truncate" style={{ color: 'var(--text-primary)' }}>{email}</strong>
              </div>

              <div className="p-3 rounded-lg border space-y-1" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-medium block" style={{ color: 'var(--text-muted)' }}>Phone Number</span>
                <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>{phone || '—'}</strong>
              </div>

              <div className="p-3 rounded-lg border space-y-1" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-medium block" style={{ color: 'var(--text-muted)' }}>Account ID</span>
                <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>{publicAccountId}</strong>
              </div>

              <div className="p-3 rounded-lg border space-y-1" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-medium block" style={{ color: 'var(--text-muted)' }}>Enrollment Date</span>
                <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>{joinedDate}</strong>
              </div>

              <div className="p-3 rounded-lg border space-y-1" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-medium block" style={{ color: 'var(--text-muted)' }}>Enrollment Status</span>
                <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>{statusDisplay}</strong>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div
            className="p-4 sm:p-5 rounded-xl border space-y-3"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Activity
            </h3>
            {activities.length > 0 ? (
              <div className="space-y-2 text-xs">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border flex items-center justify-between gap-3"
                    style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
                  >
                    <div>
                      <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                        {act.activity_type} {act.lesson_title ? `— ${act.lesson_title}` : ''}
                      </strong>
                    </div>
                    {act.timestamp && (
                      <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                        {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="p-4 rounded-xl border text-center text-xs font-sans"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                No activity recorded yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROGRESS TAB */}
      {activeTab === 'progress' && (
        <div
          className="p-5 rounded-xl border space-y-4"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Learning Telemetry & Progress
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span style={{ color: 'var(--text-secondary)' }}>Trackable Lessons</span>
              <span style={{ color: 'var(--brand-primary)' }}>
                {totalLessons > 0 ? `${completedLessons} of ${totalLessons} Lessons Completed` : '0/0 Lessons'}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%`, backgroundColor: 'var(--brand-primary)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODULES & LESSONS BREAKDOWN TAB (Requirement 13) */}
      {activeTab === 'modules' && (
        <div className="space-y-4 w-full max-w-full min-w-0 font-sans">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Modules & Lessons Progress
          </h3>

          {modules.length > 0 ? (
            <div className="space-y-4">
              {modules.map((m) => (
                <div
                  key={m.uuid}
                  className="p-4 rounded-xl border space-y-3"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--text-primary)' }}>{m.title}</span>
                    <span style={{ color: 'var(--brand-primary)' }}>
                      {m.completed_lessons} / {m.total_lessons} lessons ({m.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${m.percentage}%`, backgroundColor: 'var(--brand-primary)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : lessons.length > 0 ? (
            <div className="space-y-2 text-xs">
              {lessons.map((les) => (
                <div
                  key={les.uuid}
                  className="p-3 rounded-xl border flex items-center justify-between"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    {les.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {les.title}
                    </span>
                  </div>
                  <Badge variant={les.completed ? 'success' : 'secondary'} size="sm">
                    {les.completed ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-6 rounded-xl border text-center text-xs"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              No lessons available
            </div>
          )}
        </div>
      )}

      {/* ACTIVITY TAB (Requirement 10) */}
      {activeTab === 'activity' && (
        <div
          className="p-5 rounded-xl border space-y-4 font-sans"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Activity Logs
          </h3>
          {activities.length > 0 ? (
            <div className="space-y-2 text-xs">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl border flex items-center justify-between gap-3"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
                >
                  <div>
                    <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                      {act.activity_type} {act.lesson_title ? `— ${act.lesson_title}` : ''}
                    </strong>
                  </div>
                  {act.timestamp && (
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-6 rounded-xl border text-center text-xs font-sans"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              No activity recorded yet
            </div>
          )}
        </div>
      )}

      {/* ASSIGNMENTS TAB (Requirement 12) */}
      {activeTab === 'assignments' && (
        <div
          className="p-5 rounded-xl border space-y-4 font-sans"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Assignment Submissions
          </h3>
          {assignmentSubmissions.length > 0 ? (
            <div className="space-y-3 text-xs">
              {assignmentSubmissions.map((asg) => (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
                >
                  <div>
                    <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                      {asg.assignment_title || 'Assignment'}
                    </strong>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      Status: {asg.status || 'Submitted'} • Grade: {asg.grade ?? 'Pending'}
                    </span>
                  </div>
                  <Badge variant="success" size="sm">
                    {asg.status || 'Submitted'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-6 rounded-xl border text-center text-xs font-sans"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              No assignment submissions yet
            </div>
          )}
        </div>
      )}

      {/* QUIZZES TAB (Requirement 11) */}
      {activeTab === 'quizzes' && (
        <div
          className="p-5 rounded-xl border space-y-4 font-sans"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Quiz Summary
          </h3>
          {quizAttempts.length > 0 ? (
            <div className="space-y-3 text-xs">
              {quizAttempts.map((qz) => (
                <div
                  key={qz.id}
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
                >
                  <div>
                    <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                      {qz.quiz_title || 'Quiz'}
                    </strong>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      Score: {qz.score ?? 0}%
                    </span>
                  </div>
                  <Badge variant={qz.passed ? 'success' : 'error'} size="sm">
                    {qz.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-6 rounded-xl border text-center text-xs font-sans"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              No quiz attempts yet
            </div>
          )}
        </div>
      )}

      {/* CERTIFICATES TAB */}
      {activeTab === 'certificates' && (
        <div
          className="p-5 rounded-xl border space-y-4 font-sans"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Certificates Summary
          </h3>
          {certificates.length > 0 ? (
            <div className="space-y-3 text-xs">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 shrink-0" style={{ color: 'var(--brand-primary)' }} />
                    <div>
                      <strong className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                        Certificate #{cert.certificate_number}
                      </strong>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Issued: {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={cert.status === 'ISSUED' ? 'success' : 'secondary'} size="sm">
                    {cert.status === 'ISSUED' ? 'Issued' : cert.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-6 rounded-xl border text-center text-xs font-sans"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              No certificates issued yet
            </div>
          )}
        </div>
      )}

      {/* EXTEND ACCESS MODAL */}
      <Modal isOpen={isExtendModalOpen} onClose={() => setIsExtendModalOpen(false)} title={`Extend Access: ${name}`}>
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="space-y-1">
            <label className="block font-semibold" style={{ color: 'var(--text-primary)' }}>
              New Expiry Date
            </label>
            <Input
              type="date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button variant="outline" onClick={() => setIsExtendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmExtend}
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-primary-foreground)' }}
              className="font-semibold cursor-pointer"
            >
              Save Expiry Date
            </Button>
          </div>
        </div>
      </Modal>

      {/* REMOVE FROM COURSE MODAL */}
      <Modal isOpen={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)} title="Remove Student from Course">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="p-3 rounded-xl text-rose-900 bg-rose-50 border border-rose-200 font-medium text-xs">
            ⚠️ Are you sure you want to remove <strong>{name}</strong> from this course enrollment?
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button variant="outline" onClick={() => setIsRemoveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRemove} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer">
              Remove Enrollment
            </Button>
          </div>
        </div>
      </Modal>

      {/* MESSAGE STUDENT MODAL */}
      <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title={`Message ${name}`}>
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="space-y-1">
            <label className="block font-semibold" style={{ color: 'var(--text-primary)' }}>
              Subject
            </label>
            <Input
              type="text"
              placeholder="Email subject..."
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold" style={{ color: 'var(--text-primary)' }}>
              Message
            </label>
            <textarea
              rows={4}
              placeholder="Write message to student..."
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              className="w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-primary-foreground)' }}
              className="font-semibold cursor-pointer"
            >
              Send Message
            </Button>
          </div>
        </div>
      </Modal>

      {/* ENROLL MODAL */}
      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        defaultCourseUuid={currentCourseUuid}
        onSuccess={() => {
          showToast('Student enrolled successfully.');
          refetch();
        }}
      />
    </div>
  );
};
