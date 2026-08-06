import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Award,
  CircleHelp,
  ClipboardCheck,
  BarChart3,
  Clock,
  Zap,
  Edit3,
  Check,
  CreditCard,
  FileText,
  Activity,
  Mail,
  Phone,
  Settings,
  Calendar,
  UserX,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { useStudentStore } from '../store/student.store';
import { useCourseFeaturesStore } from '../../courses/store/courseFeatures.store';
import { useCourseStore } from '../../courses/store/course.store';
import { EnrollStudentModal } from '../components/EnrollStudentModal';

type StudentTabId =
  | 'overview'
  | 'progress'
  | 'lessons'
  | 'assignments'
  | 'quizzes'
  | 'certificates'
  | 'activity'
  | 'reports'
  | 'credits'
  | 'notes'
  | 'settings';

export const StudentSinglePage: React.FC = () => {
  const navigate = useNavigate();
  const { studentUuid, courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{
    studentUuid?: string;
    courseUuid?: string;
  }>();

  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);
  const course = coursesByUuid[courseUuid] || {
    uuid: courseUuid,
    title: 'Fullstack React 19 & TypeScript Masterclass',
  };

  const student = useStudentStore((state) => state.students.find((s) => s.uuid === studentUuid)) || {
    uuid: studentUuid || '550e8400-e29b-41d4-a716-446655440101',
    name: 'Aarav Patel',
    email: 'aarav.patel@gmail.com',
    phone: '+91 98765 43210',
    country: 'India',
    status: 'Active' as const,
    batch: 'Batch 2026-A',
    enrollmentDate: '2026-08-01T10:00:00Z',
    lastActivity: '10 mins ago',
    creditsConsumed: 17,
    notes: 'High engagement in React 19 RSC modules. Consistently submits assignments on time.',
    enrolledCourses: [
      {
        courseUuid: courseUuid,
        courseTitle: course.title,
        enrolledAt: '2026-08-01T10:00:00Z',
        progressPercent: 85,
        lessonsCompleted: 18,
        totalLessons: 24,
        quizzesPassed: 4,
        assignmentsSubmitted: 2,
        certificatesEarned: 1,
        creditsConsumed: 17,
      },
    ],
    activityLogs: [
      { id: '1', timestamp: '2026-08-05T10:30:00Z', action: 'Completed Lesson', details: 'React 19 Architecture Overview' },
      { id: '2', timestamp: '2026-08-04T15:20:00Z', action: 'Passed Quiz', details: 'Server Components Quiz (Grade: 90%)' },
      { id: '3', timestamp: '2026-08-03T11:00:00Z', action: 'Submitted Assignment', details: 'Build Custom Store Middleware' },
    ],
  };

  const courseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures(courseUuid));
  const toggleStudentStatus = useStudentStore((state) => state.toggleStudentStatus);

  const [activeTab, setActiveTab] = useState<StudentTabId>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Action Modals State
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState('2027-08-01');
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState(student.notes || '');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmExtend = () => {
    setIsExtendModalOpen(false);
    showToast(`Access extended for ${student.name} until ${newExpiryDate}.`);
  };

  const handleConfirmRemove = () => {
    setIsRemoveModalOpen(false);
    showToast(`${student.name} removed from course.`);
    navigate(`/courses/${courseUuid}/students`);
  };

  const handleSaveNote = () => {
    showToast('Instructor note saved successfully.');
  };

  const tabs: { id: StudentTabId; label: string; icon: React.ElementType; count?: string | number; featureKey?: keyof typeof courseFeatures }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'progress', label: 'Learning Progress', icon: BarChart3 },
    { id: 'lessons', label: 'Lessons', icon: BookOpen, count: '18/24' },
    { id: 'assignments', label: 'Assignments', icon: ClipboardCheck, count: 2, featureKey: 'assignments' },
    { id: 'quizzes', label: 'Quizzes', icon: CircleHelp, count: 4, featureKey: 'quizzes' },
    { id: 'certificates', label: 'Certificates', icon: Award, count: 1, featureKey: 'courseCertificates' },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'reports', label: 'Reports', icon: BarChart3, featureKey: 'studentReports' },
    { id: 'credits', label: 'Credits Used', icon: CreditCard },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'settings', label: 'Enrollment Settings', icon: Settings },
  ];

  const visibleTabs = tabs.filter((t) => !t.featureKey || Boolean(courseFeatures[t.featureKey]));

  return (
    <div className="space-y-6 text-left font-sans pb-[calc(88px+env(safe-area-inset-bottom))] max-w-[1600px] mx-auto">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. BREADCRUMB NAVIGATION */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
        <Link to="/courses" className="hover:text-[#0F172A] transition-colors">Courses</Link>
        <span>›</span>
        <Link to={`/courses/${courseUuid}/overview`} className="hover:text-[#0F172A] transition-colors">{course.title}</Link>
        <span>›</span>
        <Link to={`/courses/${courseUuid}/students`} className="hover:text-[#0F172A] transition-colors">Students</Link>
        <span>›</span>
        <span className="text-[#0F172A] font-semibold">{student.name}</span>
      </div>

      {/* 2. HEADER CARD */}
      <div className="bg-white p-5 sm:p-6 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate(`/courses/${courseUuid}/students`)}
              className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0 mt-1"
              title="Back to Course Students"
            >
              <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white font-bold text-lg flex items-center justify-center shrink-0">
                {student.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">{student.name}</h1>
                  <Badge variant={student.status === 'Active' ? 'success' : 'secondary'} size="sm" dot>
                    {student.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#64748B] font-medium flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {student.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {student.phone}</span>
                  <span>•</span>
                  <span>Enrolled: Aug 1, 2026</span>
                  <span>•</span>
                  <span>Access until: Aug 1, 2027</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => setIsExtendModalOpen(true)}
              className="border-[#E2E8F0] text-xs font-semibold text-[#0F172A]"
            >
              Extend Access
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => toggleStudentStatus(student.uuid)}
              className="border-[#E2E8F0] text-xs font-semibold text-[#0F172A]"
            >
              {student.status === 'Active' ? 'Suspend' : 'Reactivate'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => navigate(`/students/${student.uuid}/edit`)}
              className="border-[#E2E8F0] text-xs font-semibold text-[#0F172A]"
            >
              Edit Student
            </Button>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<UserX className="w-4 h-4 text-rose-600" />}
              onClick={() => setIsRemoveModalOpen(true)}
              className="text-rose-600 hover:bg-rose-50 text-xs font-semibold"
            >
              Remove from Course
            </Button>
          </div>
        </div>
      </div>

      {/* 3. 10 SUMMARY STAT CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <BarChart3 className="w-4 h-4 text-[#2563EB] mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Overall Progress</span>
          <strong className="text-sm font-bold text-[#2563EB]">85%</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <BookOpen className="w-4 h-4 text-emerald-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Completed</span>
          <strong className="text-sm font-bold text-[#0F172A]">18 Lessons</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <BookOpen className="w-4 h-4 text-[#64748B] mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Total Lessons</span>
          <strong className="text-sm font-bold text-[#0F172A]">24 Lessons</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <ClipboardCheck className="w-4 h-4 text-purple-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Assignments</span>
          <strong className="text-sm font-bold text-[#0F172A]">2 Submitted</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <ClipboardCheck className="w-4 h-4 text-amber-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Pending</span>
          <strong className="text-sm font-bold text-amber-600">1 Pending</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <CircleHelp className="w-4 h-4 text-sky-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Quizzes</span>
          <strong className="text-sm font-bold text-[#0F172A]">4 Passed</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <Zap className="w-4 h-4 text-amber-500 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Avg Quiz Score</span>
          <strong className="text-sm font-bold text-[#0F172A]">92%</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <Award className="w-4 h-4 text-emerald-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Certificates</span>
          <strong className="text-sm font-bold text-emerald-600">1 Issued</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <Clock className="w-4 h-4 text-[#2563EB] mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Learning Time</span>
          <strong className="text-sm font-bold text-[#0F172A]">14.5 Hours</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <CreditCard className="w-4 h-4 text-[#2563EB] mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Credits Used</span>
          <strong className="text-sm font-bold text-[#2563EB]">17 Credits</strong>
        </div>
      </div>

      {/* 4. DESKTOP TABS NAVIGATION */}
      <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#E2E8F0]">
        {visibleTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0F172A]'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MOBILE ACCORDION SECTION SELECTOR */}
      <div className="md:hidden space-y-2">
        <label className="block text-xs font-semibold text-[#0F172A]">Student View Section</label>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as StudentTabId)}
          className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
        >
          {visibleTabs.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* 5. TAB SECTION CONTENTS */}

      {/* OVERVIEW SECTION */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4">
            <h3 className="text-sm font-semibold text-[#0F172A]">Course Progress Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#0F172A]">
                <span>Overall Completion</span>
                <span className="text-[#2563EB]">85% Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB]" style={{ width: '85%' }} />
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0F172A]">Instructor Notes</h3>
              <Button size="sm" variant="outline" onClick={handleSaveNote} className="h-8 text-xs font-semibold">
                Save Notes
              </Button>
            </div>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              rows={3}
              placeholder="Add internal notes about student progress, assignment feedback, etc..."
              className="w-full p-3 border border-[#E2E8F0] rounded-xl text-xs font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB] resize-none"
            />
          </Card>
        </div>
      )}

      {/* LEARNING PROGRESS SECTION */}
      {activeTab === 'progress' && (
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">Detailed Learning Telemetry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B]">Last Completed Lesson</span>
              <strong className="text-xs font-semibold text-[#0F172A] block pt-1">React 19 Server Actions</strong>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B]">Current Lesson</span>
              <strong className="text-xs font-semibold text-[#2563EB] block pt-1">Optimistic UI Updates</strong>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B]">Completion Forecast</span>
              <strong className="text-xs font-semibold text-emerald-600 block pt-1">Aug 12, 2026</strong>
            </div>
          </div>
        </Card>
      )}

      {/* LESSONS SECTION */}
      {activeTab === 'lessons' && (
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">Course Lessons Status (18/24)</h3>
          <div className="space-y-2 text-xs">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">✓</span>
                  <div>
                    <strong className="font-semibold text-[#0F172A]">Lesson {i}: React 19 Core Fundamentals</strong>
                    <span className="text-[11px] text-[#64748B] block">Video Lesson • 15 mins • Completed Aug {i}, 2026</span>
                  </div>
                </div>
                <Badge variant="success" size="sm">Completed</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ASSIGNMENTS SECTION */}
      {activeTab === 'assignments' && (
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">Submitted Assignments</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
              <div>
                <strong className="font-semibold text-[#0F172A] block">Build Custom Store Middleware</strong>
                <span className="text-[11px] text-[#64748B]">Submitted Aug 3, 2026 • Marks: 95/100</span>
              </div>
              <Badge variant="success" size="sm">Reviewed & Passed</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* QUIZZES SECTION */}
      {activeTab === 'quizzes' && (
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">Quiz Attempts</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
              <div>
                <strong className="font-semibold text-[#0F172A] block">Server Components Quiz</strong>
                <span className="text-[11px] text-[#64748B]">Passed Aug 4, 2026 • Score: 90%</span>
              </div>
              <Badge variant="success" size="sm">Passed</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* CERTIFICATES SECTION */}
      {activeTab === 'certificates' && (
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">Issued Certificates</h3>
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-[#2563EB]" />
              <div>
                <strong className="font-semibold text-[#0F172A] block">Certificate of Excellence — React 19 Masterclass</strong>
                <span className="text-[11px] text-[#64748B]">Issued Aug 5, 2026 • ID: CERT-89412</span>
              </div>
            </div>
            <Button size="sm" className="bg-[#2563EB] text-white text-xs">Download PDF</Button>
          </div>
        </Card>
      )}

      {/* ACTIVITY TIMELINE SECTION */}
      {activeTab === 'activity' && (
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">Chronological Activity Timeline</h3>
          <div className="space-y-3 text-xs">
            {student.activityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                <div>
                  <strong className="font-semibold text-[#0F172A] block">{log.action}</strong>
                  <span className="text-[11px] text-[#64748B]">{log.details}</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CREDITS USED SECTION */}
      {activeTab === 'credits' && (
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">Student Credit Transactions</h3>
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between text-xs">
            <div>
              <strong className="font-semibold text-[#0F172A] block">Course Enrollment Allocation</strong>
              <span className="text-[11px] text-[#64748B]">10 Base + 7 Feature Add-ons</span>
            </div>
            <strong className="text-[#2563EB] font-bold">17 Credits Deducted</strong>
          </div>
        </Card>
      )}

      {/* ENROLLMENT SETTINGS SECTION */}
      {activeTab === 'settings' && (
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">Enrollment Settings & Access Control</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div>
                <strong className="font-semibold text-[#0F172A] block">Access Expiry Date</strong>
                <span className="text-[11px] text-[#64748B]">Current: Aug 1, 2027</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsExtendModalOpen(true)}>Extend Access</Button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div>
                <strong className="font-semibold text-[#0F172A] block">Enrollment Status</strong>
                <span className="text-[11px] text-[#64748B]">Status: {student.status}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => toggleStudentStatus(student.uuid)}>
                {student.status === 'Active' ? 'Suspend' : 'Reactivate'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* EXTEND ACCESS MODAL */}
      <Modal isOpen={isExtendModalOpen} onClose={() => setIsExtendModalOpen(false)} title={`Extend Access: ${student.name}`}>
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="space-y-1">
            <label className="block font-semibold text-[#0F172A]">New Access Expiry Date</label>
            <Input type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} className="h-9 text-xs" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setIsExtendModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmExtend} className="bg-[#2563EB] text-white font-semibold">Save Expiry Date</Button>
          </div>
        </div>
      </Modal>

      {/* REMOVE FROM COURSE MODAL */}
      <Modal isOpen={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)} title="Remove Student from Course">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-medium text-xs">
            ⚠️ Are you sure you want to remove <strong>{student.name}</strong> from this course? This removes enrollment access only.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setIsRemoveModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmRemove} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Remove Student
            </Button>
          </div>
        </div>
      </Modal>

      {/* ENROLL MODAL */}
      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        defaultCourseUuid={courseUuid}
        onSuccess={() => showToast('Student enrolled successfully.')}
      />
    </div>
  );
};
