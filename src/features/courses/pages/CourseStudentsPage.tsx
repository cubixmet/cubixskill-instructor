import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Search,
  Check,
  Eye,
  Award,
  BarChart3,
  UserCheck,
  UserPlus,
  Download,
  X,
  Calendar,
  UserX,
  SlidersHorizontal,
  MoreVertical,
  Mail,
  RefreshCw,
  AlertTriangle,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { exportToCsv, slugify, type CsvColumn } from '../../../utils/export-csv';
import { studentsService } from '../../../services/students.service';
import { coursesService } from '../../../services/courses.service';
import { courseFeaturesService } from '../../../services/courseFeatures.service';
import { authService } from '../../../services/auth.service';

interface StudentRecord {
  id: string;
  uuid: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  expiryDate: string;
  progressPercent: number;
  status: 'Active' | 'Pending' | 'Completed' | 'Expired' | 'Suspended';
  lessonsCompleted: number;
  totalLessons: number;
  quizzesTaken: number;
  assignmentsSubmitted: number;
  certificatesIssued: number;
  creditsUsed: number;
  lastActive: string;
}

export const CourseStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const courseUuid = params.courseId || params.courseUuid;

  const [studentList, setStudentList] = useState<StudentRecord[]>([]);
  const [courseTitle, setCourseTitle] = useState<string>('Course Enrolled Students');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search, Filter & View Mode state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [progressFilter, setProgressFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [selectedStudentUuids, setSelectedStudentUuids] = useState<string[]>([]);
  void setSelectedStudentUuids;
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeMenuStudentUuid, setActiveMenuStudentUuid] = useState<string | null>(null);

  // Send Email Modal State
  const [emailTarget, setEmailTarget] = useState<StudentRecord | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);
  const [extendAccessTarget, setExtendAccessTarget] = useState<StudentRecord | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('2027-12-31');
  const [removeTarget, setRemoveTarget] = useState<StudentRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [studentReportsEnabled, setStudentReportsEnabled] = useState<boolean>(true);

  const fetchCourseStudents = useCallback(async () => {
    if (!courseUuid || courseUuid === 'undefined') return;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const [data, courseData, featuresData] = await Promise.all([
        studentsService.listCourseEnrollments(courseUuid),
        coursesService.getCourse(courseUuid).catch(() => null),
        courseFeaturesService.list(courseUuid).catch(() => []),
      ]);

      if (courseData && courseData.title) {
        setCourseTitle(courseData.title);
      }

      const lockingReportFeature = featuresData.find((f: any) => f.code === 'LESSON_LOCKING_REPORT');
      const isFeatureEnabled = lockingReportFeature ? lockingReportFeature.effective_enabled : false;
      setStudentReportsEnabled(isFeatureEnabled);

      const mapped: StudentRecord[] = data.map((item: any, idx: number) => {
        const studentObj = item.student || {};
        const profileObj = studentObj.student_profile || {};
        const fullName = studentObj.full_name || profileObj.display_name || studentObj.email?.split('@')[0] || `Student #${idx + 1}`;
        const email = studentObj.email || profileObj.user?.email || '';
        const phone = studentObj.phone || profileObj.user?.phone || '—';

        let st: StudentRecord['status'] = 'Active';
        if (item.status === 'EXPIRED') st = 'Expired';
        else if (item.status === 'SUSPENDED') st = 'Suspended';
        else if (item.status === 'COMPLETED') st = 'Completed';
        else if (item.status === 'PENDING') st = 'Pending';

        const completed = item.completed_lessons ?? item.completed_lessons_count ?? 0;
        const total = item.total_lessons ?? item.total_lessons_count ?? 0;
        const rawPct = item.progress_percentage ?? item.progress_percent ?? (total > 0 ? (completed / total) * 100 : 0);
        const progressPercent = Math.min(100, Math.max(0, Math.round(Number(rawPct) || 0)));

        return {
          id: String(item.id || idx + 1),
          uuid: String(item.id || studentObj.id || idx + 1),
          studentId: String(profileObj.id || studentObj.id || item.id),
          name: fullName,
          email,
          phone,
          enrollmentDate: item.enrolled_at ? new Date(item.enrolled_at).toISOString().split('T')[0] : (item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '—'),
          expiryDate: item.access_expires_at ? new Date(item.access_expires_at).toISOString().split('T')[0] : 'Lifetime Access',
          progressPercent,
          status: st,
          lessonsCompleted: completed,
          totalLessons: total,
          quizzesTaken: 0,
          assignmentsSubmitted: 0,
          certificatesIssued: 0,
          creditsUsed: 0,
          lastActive: item.last_accessed_at ? new Date(item.last_accessed_at).toLocaleDateString() : 'Recently',
        };
      });

      setStudentList(mapped);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err?.message || 'Failed to load course students from server.');
    } finally {
      setIsLoading(false);
    }
  }, [courseUuid]);

  useEffect(() => {
    fetchCourseStudents();
  }, [fetchCourseStudents]);

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTarget || !emailSubject.trim() || !emailMessage.trim()) return;

    setIsSendingEmail(true);
    setEmailError(null);

    try {
      await studentsService.sendStudentEmail(emailTarget.studentId, {
        subject: emailSubject.trim(),
        message: emailMessage.trim(),
      });

      setEmailTarget(null);
      setEmailSubject('');
      setEmailMessage('');
      showToast(`Email sent successfully to ${emailTarget.email}.`);
    } catch (err: any) {
      setEmailError(err?.response?.data?.error?.message || err?.message || 'Failed to deliver email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return studentList
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()) ||
          s.phone.includes(search);

        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

        let matchesProgress = true;
        if (progressFilter === '0-25') matchesProgress = s.progressPercent <= 25;
        if (progressFilter === '26-50') matchesProgress = s.progressPercent >= 26 && s.progressPercent <= 50;
        if (progressFilter === '51-75') matchesProgress = s.progressPercent >= 51 && s.progressPercent <= 75;
        if (progressFilter === '76-100') matchesProgress = s.progressPercent >= 76;

        return matchesSearch && matchesStatus && matchesProgress;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'highest-progress') return b.progressPercent - a.progressPercent;
        if (sortBy === 'lowest-progress') return a.progressPercent - b.progressPercent;
        if (sortBy === 'most-credits') return b.creditsUsed - a.creditsUsed;
        return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
      });
  }, [studentList, search, statusFilter, progressFilter, sortBy]);

  // Statistics Summary Counts
  const totalEnrolled = studentList.length;
  const activeCount = studentList.filter((s) => s.status === 'Active').length;
  const completedCount = studentList.filter((s) => s.status === 'Completed').length;
  const avgProgress = Math.round(studentList.reduce((acc, curr) => acc + curr.progressPercent, 0) / (totalEnrolled || 1));

  const handleViewStudent = (studentUuid: string) => {
    if (!courseUuid || !studentUuid) return;
    navigate(`/courses/${courseUuid}/students/${studentUuid}/overview`);
  };

  const handleConfirmExtendAccess = () => {
    if (!extendAccessTarget) return;
    setStudentList((prev) =>
      prev.map((s) => (s.uuid === extendAccessTarget.uuid ? { ...s, expiryDate: newExpiryDate, status: 'Active' } : s))
    );
    setExtendAccessTarget(null);
    showToast(`Access extended for ${extendAccessTarget.name} until ${newExpiryDate}.`);
  };

  const handleConfirmRemoveStudent = () => {
    if (!removeTarget) return;
    setStudentList((prev) => prev.filter((s) => s.uuid !== removeTarget.uuid));
    setRemoveTarget(null);
    showToast(`${removeTarget.name} removed from course.`);
  };

  const handleExportCSV = () => {
    const targetList =
      selectedStudentUuids.length > 0
        ? filteredStudents.filter((s) => selectedStudentUuids.includes(s.uuid))
        : filteredStudents;

    if (targetList.length === 0) {
      showToast('No students are available to export.');
      return;
    }

    const exportTitle = courseTitle || 'Course Students';
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `cubixskill-course-students-${slugify(exportTitle)}-${dateStr}.csv`;

    const columns: CsvColumn<StudentRecord>[] = [
      { header: 'Student Name', value: (row) => row.name },
      { header: 'Email', value: (row) => row.email },
      { header: 'Country Code', value: () => '+91' },
      { header: 'Phone Number', value: (row) => row.phone },
      { header: 'Enrollment Status', value: (row) => row.status },
      { header: 'Enrollment Date', value: (row) => row.enrollmentDate },
      { header: 'Access Start Date', value: (row) => row.enrollmentDate },
      { header: 'Access Expiry Date', value: (row) => row.expiryDate },
      { header: 'Learning Progress', value: (row) => `${row.progressPercent}%` },
      { header: 'Completed Lessons', value: (row) => row.lessonsCompleted },
      { header: 'Total Lessons', value: (row) => row.totalLessons },
      { header: 'Last Activity', value: (row) => row.lastActive },
      { header: 'Course Name', value: () => exportTitle },
    ];

    try {
      exportToCsv(filename, targetList, columns);
      showToast(`CSV exported successfully (${targetList.length} ${targetList.length === 1 ? 'student' : 'students'}).`);
    } catch (_) {
      showToast('CSV export failed. Please try again.');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Expired':
        return 'warning';
      case 'Suspended':
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-[1600px] mx-auto text-left font-sans py-4 px-2 sm:px-0">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 dark:border-rose-900/50 space-y-4 max-w-lg mx-auto mt-8 font-sans">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">Unable to Load Course Students</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">{errorMessage || "Failed to communicate with Django REST API."}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCourseStudents} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry Request
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-28 md:pb-12 max-w-[1600px] mx-auto px-2 sm:px-4 md:px-0 w-full min-w-0 max-w-full box-border">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] dark:bg-[#1E293B] text-white dark:text-[#F8FAFC] text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 dark:border-[#334155]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-[16px] border border-slate-200 dark:border-[#263244] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Link
            to={courseUuid ? `/courses/${courseUuid}/curriculum` : '/courses'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {courseTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal mt-0.5">
              Manage and view all enrolled students.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCSV}
              className="border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#172033] text-xs font-medium h-9 px-3"
            >
              {selectedStudentUuids.length > 0
                ? `Export (${selectedStudentUuids.length})`
                : 'Export CSV'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Users className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/courses/${courseUuid}/students/bulk-upload`)}
              className="border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-[#60A5FA] bg-white dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-[#172033] text-xs font-medium h-9 px-3 hidden sm:inline-flex"
            >
              Bulk Enroll
            </Button>
            <Button
              size="sm"
              leftIcon={<UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />}
              onClick={() => navigate(`/courses/${courseUuid}/students/enroll`)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium h-9 px-3.5 flex-1 sm:flex-initial shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
            >
              Enroll Student
            </Button>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY STATS */}
      <div className={`grid grid-cols-2 ${studentReportsEnabled ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-2.5 sm:gap-3.5 w-full min-w-0`}>
        {/* Card 1: Total Students */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#111827] rounded-[14px] border border-slate-200 dark:border-[#263244] space-y-1.5 shadow-2xs min-w-0">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/40 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
              +{totalEnrolled} active
            </span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#94A3B8] block font-medium">Total Students</span>
            <strong className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">{totalEnrolled}</strong>
          </div>
        </div>

        {/* Card 2: Active Students */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#111827] rounded-[14px] border border-slate-200 dark:border-[#263244] space-y-1.5 shadow-2xs min-w-0">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-[#94A3B8]">
              {totalEnrolled ? Math.round((activeCount / totalEnrolled) * 100) : 0}% active
            </span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#94A3B8] block font-medium">Active Students</span>
            <strong className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{activeCount}</strong>
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#111827] rounded-[14px] border border-slate-200 dark:border-[#263244] space-y-1.5 shadow-2xs min-w-0">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-[#94A3B8]">
              {totalEnrolled ? Math.round((completedCount / totalEnrolled) * 100) : 0}% done
            </span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#94A3B8] block font-medium">Completed</span>
            <strong className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">{completedCount}</strong>
          </div>
        </div>

        {/* Card 4: Average Progress (Only if studentReportsEnabled) */}
        {studentReportsEnabled && (
          <div className="p-3 sm:p-4 bg-white dark:bg-[#111827] rounded-[14px] border border-slate-200 dark:border-[#263244] space-y-1.5 shadow-2xs min-w-0">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/40 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-[#94A3B8]">Overall</span>
            </div>
            <div>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#94A3B8] block font-medium">Avg. Progress</span>
              <strong className="text-lg sm:text-2xl font-bold text-[#2563EB] dark:text-[#60A5FA] tracking-tight">{avgProgress}%</strong>
            </div>
          </div>
        )}
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-[#111827] p-3 sm:p-4 rounded-[16px] border border-slate-200 dark:border-[#263244] shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80 min-w-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748B] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full h-10 pl-10 pr-10 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-medium text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] min-w-0"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:text-[#64748B] dark:hover:text-[#F8FAFC] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl font-medium text-slate-900 dark:text-[#F8FAFC] text-xs focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
              </select>

              {studentReportsEnabled && (
                <select
                  value={progressFilter}
                  onChange={(e) => setProgressFilter(e.target.value)}
                  className="h-10 px-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl font-medium text-slate-900 dark:text-[#F8FAFC] text-xs focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="All">All Progress</option>
                  <option value="0-25">0 – 25%</option>
                  <option value="26-50">26 – 50%</option>
                  <option value="51-75">51 – 75%</option>
                  <option value="76-100">76 – 100%</option>
                </select>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl font-medium text-slate-900 dark:text-[#F8FAFC] text-xs focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="recent">Recently Enrolled</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                {studentReportsEnabled && <option value="highest-progress">Highest Progress</option>}
                {studentReportsEnabled && <option value="lowest-progress">Lowest Progress</option>}
              </select>
            </div>

            {/* Mobile Filter Button */}
            <div className="flex md:hidden shrink-0">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => setIsMobileFilterOpen(true)}
                className="h-10 text-xs px-3 border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-slate-700 dark:text-[#F8FAFC] font-semibold"
              >
                Filter
              </Button>
            </div>
          </div>

          {/* ACTIVE FILTER CHIPS */}
          {(statusFilter !== 'All' || progressFilter !== 'All' || search) && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-[#263244] overflow-x-auto no-scrollbar text-xs">
              <span className="text-slate-500 dark:text-[#94A3B8] text-[11px] font-medium shrink-0">Active Filters:</span>

              {statusFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-800 rounded-full flex items-center gap-1 font-medium text-[11px] shrink-0">
                  Status: {statusFilter}
                  <button type="button" onClick={() => setStatusFilter('All')} className="hover:text-rose-600 dark:hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {progressFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-800 rounded-full flex items-center gap-1 font-medium text-[11px] shrink-0">
                  Progress: {progressFilter}%
                  <button type="button" onClick={() => setProgressFilter('All')} className="hover:text-rose-600 dark:hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {search && (
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-800 rounded-full flex items-center gap-1 font-medium text-[11px] shrink-0">
                  Search: "{search}"
                  <button type="button" onClick={() => setSearch('')} className="hover:text-rose-600 dark:hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setProgressFilter('All');
                  setSearch('');
                }}
                className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] underline cursor-pointer shrink-0 ml-1"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. STUDENT CONTENT: TABLE (DESKTOP) + CARDS (MOBILE) */}
      {filteredStudents.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-3">
          <Users className="w-10 h-10 text-slate-400 dark:text-[#64748B] mx-auto" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">No students enrolled</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">Students enrolled in this course will appear here.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setProgressFilter('All');
            }}
            className="text-xs font-medium border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#172033] border-b border-slate-200 dark:border-[#263244] text-slate-500 dark:text-[#94A3B8] font-medium">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Enrolled On</th>
                    {studentReportsEnabled && <th className="py-3 px-4">Progress</th>}
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#263244]">
                  {filteredStudents.map((student, idx) => (
                    <tr
                      key={student.uuid}
                      onClick={() => handleViewStudent(student.uuid)}
                      className="hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-bold text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <strong className="font-semibold text-slate-900 dark:text-[#F8FAFC] truncate block min-w-0">
                            {student.name}
                          </strong>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-[#94A3B8] font-normal truncate">
                        {student.email}
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-[#CBD5E1]">
                        {student.enrollmentDate}
                      </td>

                      {studentReportsEnabled && (
                        <td className="py-3 px-4 w-44">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-500 dark:text-[#94A3B8] font-normal">
                                {student.lessonsCompleted}/{student.totalLessons}
                              </span>
                              <strong className="text-[#2563EB] dark:text-[#60A5FA] font-medium">
                                {student.progressPercent}%
                              </strong>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-[#334155] h-1.5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${student.progressPercent}%` }}
                                className={`h-full rounded-full ${
                                  student.progressPercent === 100 ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-[#3B82F6]'
                                }`}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(student.status)} size="sm" dot>
                          {student.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveMenuStudentUuid(activeMenuStudentUuid === student.uuid ? null : student.uuid)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuStudentUuid === student.uuid && (
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl z-30 py-1 font-sans text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuStudentUuid(null);
                                  handleViewStudent(student.uuid);
                                }}
                                className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8]" /> View Overview
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuStudentUuid(null);
                                  setEmailTarget(student);
                                  setEmailSubject(`Course Update: Announcement for ${student.name}`);
                                  setEmailMessage('');
                                  setEmailError(null);
                                }}
                                className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> Send Email
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuStudentUuid(null);
                                  setExtendAccessTarget(student);
                                }}
                                className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                              >
                                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Extend Access
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuStudentUuid(null);
                                  setRemoveTarget(student);
                                }}
                                className="w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-[#F87171] hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-[#263244] mt-1 pt-2"
                              >
                                <UserX className="w-3.5 h-3.5" /> Remove Student
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS VIEW (Clean 320px–430px Responsive Grid Card) */}
          <div className="grid gap-2.5 md:hidden w-full min-w-0">
            {filteredStudents.map((student) => (
              <div
                key={student.uuid}
                onClick={() => handleViewStudent(student.uuid)}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-3 rounded-[14px] space-y-2.5 shadow-2xs cursor-pointer w-full min-w-0 max-w-full box-border"
              >
                {/* Header: Avatar, Name/Email, Status & Menu */}
                <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-2.5 min-w-0 w-full">
                  {/* Avatar Initials Tile */}
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/50 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                    {student.name.charAt(0)}
                  </div>

                  {/* Name and Email */}
                  <div className="min-w-0 flex-1">
                    <strong className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block truncate leading-tight">
                      {student.name}
                    </strong>
                    <span className="text-[11px] font-normal text-slate-500 dark:text-[#94A3B8] block truncate leading-tight mt-0.5">
                      {student.email}
                    </span>
                  </div>

                  {/* Status & Menu */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Badge variant={getStatusVariant(student.status)} size="sm" dot className="shrink-0">
                      {student.status}
                    </Badge>
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setActiveMenuStudentUuid(activeMenuStudentUuid === student.uuid ? null : student.uuid)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] rounded-lg transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuStudentUuid === student.uuid && (
                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl z-30 py-1 font-sans text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuStudentUuid(null);
                              handleViewStudent(student.uuid);
                            }}
                            className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8]" /> View Overview
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuStudentUuid(null);
                              setEmailTarget(student);
                              setEmailSubject(`Course Update: Announcement for ${student.name}`);
                              setEmailMessage('');
                              setEmailError(null);
                            }}
                            className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> Send Email
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuStudentUuid(null);
                              setExtendAccessTarget(student);
                            }}
                            className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Extend Access
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuStudentUuid(null);
                              setRemoveTarget(student);
                            }}
                            className="w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-[#F87171] hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-[#263244] mt-1 pt-2"
                          >
                            <UserX className="w-3.5 h-3.5" /> Remove Student
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                {studentReportsEnabled && (
                  <div className="space-y-1 pt-1 w-full min-w-0">
                    <div className="w-full bg-slate-100 dark:bg-[#334155] h-1.5 rounded-full overflow-hidden flex items-center">
                      <div
                        style={{ width: `${student.progressPercent}%` }}
                        className={`h-full rounded-full ${
                          student.progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#3B82F6]'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 dark:text-[#94A3B8]">
                        {student.lessonsCompleted}/{student.totalLessons} lessons
                      </span>
                      <strong className="text-[#2563EB] dark:text-[#60A5FA] font-bold">{student.progressPercent}%</strong>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* MOBILE FILTER MODAL */}
      <Modal isOpen={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} title="Filter & Sort Students">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">Enrollment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl font-medium text-slate-900 dark:text-[#F8FAFC] text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">Progress Range</label>
            <select
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl font-medium text-slate-900 dark:text-[#F8FAFC] text-xs"
            >
              <option value="All">All Progress</option>
              <option value="0-25">0 – 25%</option>
              <option value="26-50">26 – 50%</option>
              <option value="51-75">51 – 75%</option>
              <option value="76-100">76 – 100%</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl font-medium text-slate-900 dark:text-[#F8FAFC] text-xs"
            >
              <option value="recent">Recently Enrolled</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="highest-progress">Highest Progress</option>
              <option value="lowest-progress">Lowest Progress</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#263244]">
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('All');
                setProgressFilter('All');
                setSortBy('recent');
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setIsMobileFilterOpen(false)} className="bg-[#2563EB] text-white font-medium">
              Apply
            </Button>
          </div>
        </div>
      </Modal>

      {/* EXTEND ACCESS MODAL */}
      <Modal isOpen={Boolean(extendAccessTarget)} onClose={() => setExtendAccessTarget(null)} title={`Extend Access: ${extendAccessTarget?.name}`}>
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">Current Expiry Date</label>
            <Input value={extendAccessTarget?.expiryDate || ''} readOnly className="bg-slate-100 dark:bg-[#0F172A] text-slate-500 dark:text-[#94A3B8] h-9 text-xs" />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">New Expiry Date *</label>
            <Input type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} className="h-9 text-xs" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#263244]">
            <Button variant="outline" onClick={() => setExtendAccessTarget(null)}>Cancel</Button>
            <Button onClick={handleConfirmExtendAccess} className="bg-[#2563EB] text-white font-medium">Save Expiry Date</Button>
          </div>
        </div>
      </Modal>

      {/* SEND EMAIL MODAL */}
      <Modal isOpen={Boolean(emailTarget)} onClose={() => !isSendingEmail && setEmailTarget(null)} title={`Send Email: ${emailTarget?.name}`}>
        <form onSubmit={handleSendEmailSubmit} className="space-y-4 text-xs font-sans text-left">
          {emailError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-900 dark:text-rose-300 font-medium text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{emailError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">Recipient Email</label>
            <Input value={emailTarget?.email || ''} readOnly className="bg-slate-100 dark:bg-[#0F172A] text-slate-500 dark:text-[#94A3B8] h-9 text-xs" />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">Subject *</label>
            <Input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">Message *</label>
            <textarea
              rows={4}
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Write your email content..."
              className="w-full p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#263244]">
            <Button variant="outline" type="button" onClick={() => setEmailTarget(null)} disabled={isSendingEmail}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSendingEmail || !emailSubject.trim() || !emailMessage.trim()}
              isLoading={isSendingEmail}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium"
            >
              Send Email
            </Button>
          </div>
        </form>
      </Modal>

      {/* REMOVE FROM COURSE CONFIRMATION MODAL */}
      <Modal isOpen={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)} title="Remove Student from Course">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-900 dark:text-rose-300 font-medium text-xs">
            ⚠️ Are you sure you want to remove <strong>{removeTarget?.name}</strong> from this course? This action removes enrollment access.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#263244]">
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button onClick={handleConfirmRemoveStudent} className="bg-rose-600 hover:bg-rose-700 text-white font-medium">
              Remove Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
