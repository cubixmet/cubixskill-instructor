import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Award,
  CircleHelp,
  ClipboardCheck,
  BarChart3,
  Edit3,
  Check,
  CreditCard,
  FileText,
  Activity,
  Mail,
  Phone,
  Calendar,
  UserX,
  RefreshCw,
  MoreVertical,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { studentsService, type StudentData } from '../../../services/students.service';
import { useStudentStore } from '../store/student.store';
import { EnrollStudentModal } from '../components/EnrollStudentModal';

type StudentTabId =
  | 'overview'
  | 'courses'
  | 'progress'
  | 'lessons'
  | 'assignments'
  | 'quizzes'
  | 'certificates'
  | 'activity'
  | 'notes';

export const StudentSinglePage: React.FC = () => {
  const navigate = useNavigate();
  const toggleStudentStatus = useStudentStore((state) => state.toggleStudentStatus);
  const { studentId, studentUuid, courseUuid } = useParams<{ studentId?: string; studentUuid?: string; courseUuid?: string }>();
  const id = studentId || studentUuid || '';

  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [activeTab, setActiveTab] = useState<StudentTabId>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    Promise.all([
      studentsService.getStudent(id),
      studentsService.listStudentEnrollments(id).catch(() => []),
    ])
      .then(([sData, enrData]) => {
        if (!isMounted) return;
        setStudentData(sData);
        setEnrollments(enrData);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsError(true);
        setErrorMessage(err?.message || 'Failed to load student details');
        setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };



  const name = studentData?.display_name || studentData?.full_name || studentData?.user?.full_name || 'Student Profile';
  const email = studentData?.email || studentData?.user?.email || '';
  const phone = studentData?.phone || studentData?.user?.phone || '';
  const status = studentData?.status === 'ACTIVE' ? 'Active' : 'Inactive';

  const student = {
    uuid: id,
    name,
    email,
    phone,
    country: 'India',
    status,
    batch: 'Batch 2026-A',
    enrollmentDate: studentData?.joined_at || new Date().toISOString(),
    lastActivity: 'Active',
    creditsConsumed: 0,
    notes: studentData?.bio || '',
    enrolledCourses: enrollments.map((e) => ({
      courseUuid: e.course?.id || e.course || '',
      courseTitle: e.course?.title || 'Enrolled Course',
      enrolledAt: e.enrolled_at || '',
      progressPercent: Number(e.progress_percent || 0),
      lessonsCompleted: 0,
      totalLessons: 0,
      quizzesPassed: 0,
      assignmentsSubmitted: 0,
      certificatesEarned: 0,
      creditsConsumed: 0,
    })),
    activityLogs: [],
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Action Modals State
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState('2027-08-01');
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState(student.notes || '');

  const handleConfirmExtend = () => {
    setIsExtendModalOpen(false);
    showToast(`Access extended for ${student.name} until ${newExpiryDate}.`);
  };

  const handleConfirmRemove = () => {
    setIsRemoveModalOpen(false);
    showToast(`${student.name} removed from course.`);
    navigate(`/students`);
  };

  const handleSaveNote = () => {
    showToast('Instructor note saved successfully.');
  };

  const tabs: { id: StudentTabId; label: string; icon: React.ElementType; count?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'courses', label: 'Courses', icon: BookOpen, count: student.enrolledCourses?.length || 1 },
    { id: 'progress', label: 'Learning Progress', icon: BarChart3 },
    { id: 'lessons', label: 'Lessons', icon: BookOpen, count: '18/24' },
    { id: 'assignments', label: 'Assignments', icon: ClipboardCheck, count: 2 },
    { id: 'quizzes', label: 'Quizzes', icon: CircleHelp, count: 4 },
    { id: 'certificates', label: 'Certificates', icon: Award, count: 1 },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  const visibleTabs = tabs;

  // Initials generator
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-36 sm:pb-12 max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-2 text-xs font-semibold text-slate-600">Loading student profile...</span>
        </div>
      )}

      {/* Error Banner */}
      {isError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <span>{errorMessage || 'Failed to load student details.'}</span>
          <button type="button" onClick={() => setIsError(false)} className="text-rose-500 hover:text-rose-700 font-bold">Dismiss</button>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Students</span>
        </button>
        <span className="text-xs font-bold text-[#0F172A] tracking-tight">Student Details</span>
      </div>

      {/* 2. HEADER PROFILE CARD */}
      <div className="bg-white p-4 sm:p-6 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2563EB] text-white font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">
              {(student as { avatarUrl?: string }).avatarUrl ? (
                <img src={(student as { avatarUrl?: string }).avatarUrl} alt={student.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(student.name)
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-2xl font-bold text-[#0F172A] tracking-tight leading-snug break-words">
                  {student.name}
                </h1>
                <Badge variant={student.status === 'Active' ? 'success' : 'secondary'} size="sm" dot>
                  {student.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium flex-wrap">
                <span className="font-semibold text-[#0F172A]">Student ID: STU-1024</span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate"><Mail className="w-3.5 h-3.5 shrink-0" /> {student.email}</span>
                {student.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 shrink-0" /> {student.phone}</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 shrink-0" /> Enrolled: Aug 1, 2026</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
            <Button
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate(`/students/${student.uuid}/enroll`)}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold h-9 cursor-pointer"
            >
              Enroll in Course
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => navigate(`/students/${student.uuid}/edit`)}
              className="border-[#E2E8F0] text-xs font-semibold text-[#0F172A] h-9 cursor-pointer"
            >
              Edit Student
            </Button>

            {/* 3-Dot Options */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer h-9 w-9 flex items-center justify-center"
                title="More Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 text-xs text-[#0F172A] space-y-0.5 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsExtendModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Extend Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      toggleStudentStatus(student.uuid);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{student.status === 'Active' ? 'Suspend Student' : 'Reactivate Student'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsRemoveModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Remove from Course</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUMMARY STAT CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <BarChart3 className="w-4 h-4 text-[#2563EB] mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Overall Progress</span>
          <strong className="text-sm font-bold text-[#2563EB]">85%</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <BookOpen className="w-4 h-4 text-emerald-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Completed Lessons</span>
          <strong className="text-sm font-bold text-[#0F172A]">18/24</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <CircleHelp className="w-4 h-4 text-sky-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Quizzes Passed</span>
          <strong className="text-sm font-bold text-[#0F172A]">4 Passed</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <Award className="w-4 h-4 text-emerald-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Certificates</span>
          <strong className="text-sm font-bold text-emerald-600">1 Issued</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5 col-span-2 sm:col-span-1">
          <CreditCard className="w-4 h-4 text-[#2563EB] mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Credits Used</span>
          <strong className="text-sm font-bold text-[#2563EB]">17 Credits</strong>
        </div>
      </div>

      {/* 4. SCROLLABLE TABS NAVIGATION BAR (MOBILE & DESKTOP) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#E2E8F0]">
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
                  ? 'bg-[#2563EB] text-white shadow-2xs font-bold'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
              <span className="whitespace-nowrap">{t.label}</span>
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

      {/* 5. TAB SECTION CONTENTS */}

      {/* OVERVIEW SECTION */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <Card padding="md" className="bg-white border border-[#E2E8F0] p-4 sm:p-5 rounded-[16px] space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Course Progress Overview</h3>
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

          <Card padding="md" className="bg-white border border-[#E2E8F0] p-4 sm:p-5 rounded-[16px] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A]">Instructor Notes</h3>
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

      {/* COURSES ENROLLMENTS SECTION */}
      {activeTab === 'courses' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#0F172A]">Enrolled Courses ({student.enrolledCourses?.length || 0})</h3>
          {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {student.enrolledCourses.map((c, i) => (
                <Card key={i} padding="md" className="bg-white border border-[#E2E8F0] p-4 rounded-[16px] space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-bold text-[#0F172A] text-xs sm:text-sm leading-snug break-words">
                        {c.courseTitle}
                      </h4>
                      <span className="text-[11px] text-[#64748B] block">
                        Enrolled: {new Date(c.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={c.progressPercent === 100 ? 'success' : 'primary'} size="sm">
                      {c.progressPercent === 100 ? 'Completed' : 'Active'}
                    </Badge>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[#0F172A]">
                      <span>Progress</span>
                      <span className="text-[#2563EB]">{c.progressPercent}% Complete</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#2563EB]'}`}
                        style={{ width: `${c.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                    <span className="text-[11px] text-[#64748B]">
                      {c.lessonsCompleted}/{c.totalLessons} Lessons
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/courses/${c.courseUuid}/students/${student.uuid}`)}
                      className="h-8 text-xs font-semibold text-[#2563EB] border-[#2563EB]/30 hover:bg-blue-50"
                    >
                      View Course Progress
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="md" className="bg-white border border-[#E2E8F0] p-6 text-center text-xs text-[#64748B]">
              No active course enrollments found for this student.
            </Card>
          )}
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
      {(activeTab as string) === 'credits' && (
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
      {(activeTab as string) === 'settings' && (
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
