import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EnrollStudentModal } from '../../students/components/EnrollStudentModal';
import { BulkEnrollModal } from '../../students/components/BulkEnrollModal';
import { exportToCsv, slugify, type CsvColumn } from '../../../utils/export-csv';
import { studentsService } from '../../../services/students.service';

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

  // Modal Action States
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isBulkEnrollOpen, setIsBulkEnrollOpen] = useState(false);
  const [extendAccessTarget, setExtendAccessTarget] = useState<StudentRecord | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('2027-12-31');
  const [removeTarget, setRemoveTarget] = useState<StudentRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCourseStudents = useCallback(async () => {
    if (!courseUuid || courseUuid === 'undefined') return;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const data = await studentsService.listCourseEnrollments(courseUuid);
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

        return {
          id: String(item.id || idx + 1),
          uuid: String(item.id || studentObj.id || idx + 1),
          studentId: String(profileObj.id || studentObj.id || item.id),
          name: fullName,
          email,
          phone,
          enrollmentDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '—',
          expiryDate: item.access_expires_at ? new Date(item.access_expires_at).toISOString().split('T')[0] : 'Lifetime Access',
          progressPercent: typeof item.progress_percent === 'number' ? item.progress_percent : 0,
          status: st,
          lessonsCompleted: item.completed_lessons_count || 0,
          totalLessons: item.total_lessons_count || 0,
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

    const courseTitle = 'Fullstack React 19 & TypeScript Masterclass';
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `cubixskill-course-students-${slugify(courseTitle)}-${dateStr}.csv`;

    const columns: CsvColumn<StudentRecord>[] = [
      { header: 'Student Name', value: (row) => row.name },
      { header: 'Email', value: (row) => row.email },
      { header: 'Country Code', value: () => '+91' },
      { header: 'Phone Number', value: (row) => row.phone },
      { header: 'Enrollment Status', value: (row) => row.status },
      { header: 'Enrollment Date', value: (row) => row.enrollmentDate },
      { header: 'Access Start Date', value: (row) => row.enrollmentDate },
      { header: 'Access Expiry Date', value: (row) => row.expiryDate },
      { header: 'Batch', value: () => 'Batch 2026-A' },
      { header: 'Learning Progress', value: (row) => `${row.progressPercent}%` },
      { header: 'Completed Lessons', value: (row) => row.lessonsCompleted },
      { header: 'Total Lessons', value: (row) => row.totalLessons },
      { header: 'Credits Used', value: (row) => row.creditsUsed },
      { header: 'Last Activity', value: (row) => row.lastActive },
      { header: 'Course Name', value: () => courseTitle },
      { header: 'Course Status', value: () => 'Published' },
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
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-[1600px] mx-auto text-left font-sans py-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
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
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-24 md:pb-12 max-w-[1600px] mx-auto px-1 md:px-0 w-full min-w-0 max-w-full">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] dark:bg-[#1E293B] text-white dark:text-[#F8FAFC] text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 dark:border-[#334155]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-[16px] border border-slate-200 dark:border-[#263244] shadow-2xs space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Students ({totalEnrolled})
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal mt-0.5">
              Students enrolled in this course and learning progress.
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

      {/* 2. SUMMARY STATS (Responsive Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#263244] text-center space-y-1 shadow-2xs">
          <Users className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] mx-auto" />
          <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] block font-medium uppercase tracking-wider">Enrolled</span>
          <strong className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">{totalEnrolled}</strong>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#263244] text-center space-y-1 shadow-2xs">
          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] block font-medium uppercase tracking-wider">Active</span>
          <strong className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">{activeCount}</strong>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#263244] text-center space-y-1 shadow-2xs">
          <Award className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto" />
          <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] block font-medium uppercase tracking-wider">Completed</span>
          <strong className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">{completedCount}</strong>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#263244] text-center space-y-1 shadow-2xs">
          <BarChart3 className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] mx-auto" />
          <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] block font-medium uppercase tracking-wider">Avg. Progress</span>
          <strong className="text-sm sm:text-base font-semibold text-[#2563EB] dark:text-[#60A5FA]">{avgProgress}%</strong>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-[16px] border border-slate-200 dark:border-[#263244] shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full h-10 pl-10 pr-10 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-medium text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
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
            <div className="hidden md:flex items-center gap-2 flex-wrap">
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

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl font-medium text-slate-900 dark:text-[#F8FAFC] text-xs focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="recent">Recently Enrolled</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="highest-progress">Highest Progress</option>
                <option value="lowest-progress">Lowest Progress</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <div className="flex md:hidden items-center justify-between gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => setIsMobileFilterOpen(true)}
                className="h-10 text-xs w-full justify-center border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-slate-700 dark:text-[#F8FAFC]"
              >
                Filters & Sort
              </Button>
            </div>
          </div>

          {/* ACTIVE FILTER CHIPS */}
          {(statusFilter !== 'All' || progressFilter !== 'All' || search) && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-[#263244] overflow-x-auto no-scrollbar text-xs">
              <span className="text-slate-500 dark:text-[#94A3B8] text-[11px] font-medium">Active Filters:</span>

              {statusFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] rounded-full flex items-center gap-1 font-medium text-[11px]">
                  Status: {statusFilter}
                  <button type="button" onClick={() => setStatusFilter('All')} className="hover:text-red-600 dark:hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {progressFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] rounded-full flex items-center gap-1 font-medium text-[11px]">
                  Progress: {progressFilter}%
                  <button type="button" onClick={() => setProgressFilter('All')} className="hover:text-red-600 dark:hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {search && (
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] rounded-full flex items-center gap-1 font-medium text-[11px]">
                  Search: "{search}"
                  <button type="button" onClick={() => setSearch('')} className="hover:text-red-600 dark:hover:text-red-400">
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
                className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] underline cursor-pointer ml-1"
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
          <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">No students found</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">No enrolled students match your search or filter criteria.</p>
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
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Enrolled Date</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#263244]">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.uuid}
                      onClick={() => handleViewStudent(student.uuid)}
                      className="hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-semibold text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <strong className="font-semibold text-slate-900 dark:text-[#F8FAFC] block truncate">
                              {student.name}
                            </strong>
                            <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block truncate">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(student.status)} size="sm" dot>
                          {student.status}
                        </Badge>
                      </td>

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

                      <td className="py-3 px-4 text-slate-700 dark:text-[#CBD5E1]">
                        {student.enrollmentDate}
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-[#94A3B8]">
                        {student.lastActive}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveMenuStudentUuid(activeMenuStudentUuid === student.uuid ? null : student.uuid)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuStudentUuid === student.uuid && (
                            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl shadow-lg z-30 py-1 font-sans text-left">
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

          {/* MOBILE CARDS VIEW */}
          <div className="grid gap-3 md:hidden">
            {filteredStudents.map((student) => (
              <div
                key={student.uuid}
                onClick={() => handleViewStudent(student.uuid)}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-3.5 rounded-xl space-y-3 shadow-2xs cursor-pointer w-full min-w-0 max-w-full"
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-semibold text-xs shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] block truncate">
                        {student.name}
                      </strong>
                      <span className="text-[11px] font-normal text-slate-500 dark:text-[#94A3B8] block truncate">
                        {student.email}
                      </span>
                    </div>
                  </div>

                  <Badge variant={getStatusVariant(student.status)} size="sm" dot className="shrink-0">
                    {student.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 dark:text-[#94A3B8]">Progress</span>
                    <strong className="text-[#2563EB] dark:text-[#60A5FA] font-medium">{student.progressPercent}%</strong>
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

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#94A3B8] pt-2 border-t border-slate-100 dark:border-[#263244]">
                  <span>Joined: <strong className="text-slate-700 dark:text-[#CBD5E1]">{student.enrollmentDate}</strong></span>
                  <span>Active: <strong className="text-slate-700 dark:text-[#CBD5E1]">{student.lastActive}</strong></span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[11px] font-medium text-[#2563EB] dark:text-[#60A5FA]">
                    {student.lessonsCompleted}/{student.totalLessons} Lessons
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="xs"
                      onClick={() => handleViewStudent(student.uuid)}
                      className="bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-100 dark:border-[rgba(59,130,246,0.18)]"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                    <button
                      type="button"
                      onClick={() => setExtendAccessTarget(student)}
                      className="p-1.5 text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F8FAFC]"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoveTarget(student)}
                      className="p-1.5 text-slate-400 dark:text-[#F87171] hover:text-rose-600"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
              Reset Filters
            </Button>
            <Button onClick={() => setIsMobileFilterOpen(false)} className="bg-[#2563EB] text-white font-medium">
              Apply Filters
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

      {/* ENROLL STUDENT MODAL */}
      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        defaultCourseUuid={courseUuid}
        onSuccess={() => showToast('Student enrolled successfully.')}
      />

      {/* BULK ENROLL MODAL */}
      <BulkEnrollModal
        isOpen={isBulkEnrollOpen}
        onClose={() => setIsBulkEnrollOpen(false)}
        courseUuid={courseUuid}
        onSuccess={() => showToast('Bulk enrollment completed successfully.')}
      />
    </div>
  );
};
