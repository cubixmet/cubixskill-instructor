import { createPortal } from 'react-dom';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';

import {
  ArrowLeft,
  UserPlus,
  Check,
  Search,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Upload,
  X,
  Mail,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { studentsService } from '../../../services/students.service';
import { coursesService } from '../../../services/courses.service';
import { enrollmentService } from '../../../services/enrollment.service';
import { courseRoutes } from '../../../utils/courseRoutes.utils';

export interface StudentListItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  isEnrolled: boolean;
}

interface RealCourse {
  id: string;
  title: string;
  slug?: string;
}

// Vibrant avatar background colors matching modern SaaS designs
const AVATAR_COLORS = [
  'bg-blue-600 text-white',
  'bg-teal-500 text-white',
  'bg-purple-600 text-white',
  'bg-[#3B82F6] text-white',
  'bg-amber-500 text-white',
  'bg-indigo-600 text-white',
  'bg-emerald-500 text-white',
  'bg-rose-500 text-white',
  'bg-cyan-600 text-white',
  'bg-pink-600 text-white',
];

const getAvatarColorClass = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const EnrollStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ courseId?: string; courseUuid?: string; studentUuid?: string }>();
  const activeCourseUuid = params.courseId || params.courseUuid || '';
  const routeStudentUuid = params.studentUuid;

  const [searchParams] = useSearchParams();
  const queryStudentUuid = searchParams.get('studentUuid');

  const studentUuid = routeStudentUuid || queryStudentUuid || undefined;

  // Real API State
  const [course, setCourse] = useState<RealCourse | null>(null);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab mode: 'search' | 'create' | 'email'
  const [tabMode, setTabMode] = useState<'search' | 'create' | 'email'>('search');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'enrolled'>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    studentUuid ? [studentUuid] : []
  );

  // New Student / Invite Fields State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [inviteEmailInput, setInviteEmailInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const backLink = activeCourseUuid ? courseRoutes.students(activeCourseUuid) : '/courses';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Reset page to 1 whenever search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Load Real Data from Backend
  const loadData = useCallback(async () => {
    if (!activeCourseUuid || activeCourseUuid === 'undefined') {
      setIsError(true);
      setErrorMessage('Course ID is missing from the URL.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      // Concurrently fetch course info, existing enrollments, and all academy students
      const [courseData, enrollments, rawStudents] = await Promise.all([
        coursesService.getCourse(activeCourseUuid),
        studentsService.listCourseEnrollments(activeCourseUuid),
        studentsService.listStudents(),
      ]);

      setCourse({
        id: courseData.id,
        title: courseData.title,
        slug: courseData.slug,
      });

      const enrolledSet = new Set<string>();
      enrollments.forEach((e: any) => {
        const sId = e.student?.user?.id || e.student?.user_id || e.student?.id || e.student_id;
        if (sId) enrolledSet.add(String(sId));
        if (e.student?.id) enrolledSet.add(String(e.student.id));
        if (e.student?.user?.id) enrolledSet.add(String(e.student.user.id));
      });
      setEnrolledStudentIds(enrolledSet);

      const studentArray = Array.isArray(rawStudents)
        ? rawStudents
        : (rawStudents as any).results || [];

      const mappedStudents: StudentListItem[] = studentArray.map((s: any) => {
        const profileId = String(s.id);
        const realUserId = String(s.user?.id || s.user_id || s.user?.uuid || s.id);
        const fullName = s.display_name || s.user?.full_name || s.name || s.email?.split('@')[0] || 'Student';
        const email = s.user?.email || s.email || '';
        const phone = s.user?.phone || s.phone || '—';
        const isEnrolled = enrolledSet.has(profileId) || enrolledSet.has(realUserId);

        return {
          id: profileId,
          userId: realUserId,
          fullName,
          email,
          phone,
          status: s.status || 'Active',
          isEnrolled: Boolean(isEnrolled),
        };
      });

      setStudents(mappedStudents);
    } catch (err: any) {
      setIsError(true);
      const status = err?.response?.status;
      const apiMsg = err?.response?.data?.error?.message || err?.response?.data?.detail || err?.message;

      if (status === 404) {
        setErrorMessage('The requested course could not be found.');
      } else if (status === 403) {
        setErrorMessage('You do not have permission to view or manage this course.');
      } else {
        setErrorMessage(apiMsg || 'Failed to load course and student data. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeCourseUuid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Target single student if studentUuid param is provided
  const singleStudent = useMemo(() => {
    if (!studentUuid) return null;
    return students.find((s) => s.id === studentUuid || s.userId === studentUuid) || null;
  }, [students, studentUuid]);

  // Single student submission handler
  const handleSingleStudentEnroll = async () => {
    if (isSubmitting || !activeCourseUuid || !singleStudent?.userId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await enrollmentService.create({
        student_id: singleStudent.userId,
        course_id: activeCourseUuid,
        access_type: 'FULL',
        source: 'MANUAL',
        is_lifetime: true,
      });

      showToast(`${singleStudent.fullName} enrolled in ${course?.title || 'Course'} successfully.`);
      await loadData();
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(backLink);
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      const apiErr = err?.response?.data?.error?.message || err?.response?.data?.detail;
      setErrorMsg(apiErr || 'This student is already enrolled or enrollment failed.');
    }
  };

  // Filtered students list across all criteria
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery);

      if (!matchesSearch) return false;

      if (statusFilter === 'available') return !s.isEnrolled;
      if (statusFilter === 'enrolled') return s.isEnrolled;
      return true;
    });
  }, [students, searchQuery, statusFilter]);

  // Total pages calculation
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // Paginated students for current view
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Current page available (non-enrolled) students
  const currentPageAvailableStudents = useMemo(
    () => paginatedStudents.filter((s) => !s.isEnrolled),
    [paginatedStudents]
  );

  const isAllCurrentPageAvailableSelected =
    currentPageAvailableStudents.length > 0 &&
    currentPageAvailableStudents.every((s) => selectedStudentIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllCurrentPageAvailableSelected) {
      const availableIds = currentPageAvailableStudents.map((s) => s.id);
      setSelectedStudentIds((prev) => prev.filter((id) => !availableIds.includes(id)));
    } else {
      const availableIds = currentPageAvailableStudents.map((s) => s.id);
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...availableIds])));
    }
  };

  const handleToggleStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    if (student?.isEnrolled) return;
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedStudentDetails = useMemo(() => {
    return students.filter((s) => selectedStudentIds.includes(s.id));
  }, [students, selectedStudentIds]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  // Main Submit Handler for Multi-Student Enrollment, New Student Creation, or Email Invite
  const handleConfirmEnrollment = async () => {
    if (isSubmitting || !activeCourseUuid) return;

    setErrorMsg(null);
    setEmailFieldError(null);

    if (tabMode === 'search') {
      if (selectedStudentIds.length === 0) {
        setErrorMsg('Please select at least one student to enroll.');
        return;
      }

      setIsSubmitting(true);
      try {
        const selectedStudentsList = students.filter((s) => selectedStudentIds.includes(s.id));

        for (const selectedStudent of selectedStudentsList) {
          if (!selectedStudent.userId) continue;
          await enrollmentService.create({
            student_id: selectedStudent.userId,
            course_id: activeCourseUuid,
            access_type: 'FULL',
            source: 'MANUAL',
            is_lifetime: true,
          });
        }

        showToast(`${selectedStudentsList.length} ${selectedStudentsList.length === 1 ? 'student' : 'students'} enrolled successfully.`);
        setSelectedStudentIds([]);
        await loadData();
        setTimeout(() => {
          setIsSubmitting(false);
          navigate(backLink);
        }, 500);
      } catch (err: any) {
        setIsSubmitting(false);
        const apiErr = err?.response?.data?.error?.message || err?.response?.data?.detail;
        setErrorMsg(apiErr || 'Failed to complete student enrollment. Please try again.');
      }
    } else if (tabMode === 'create') {
      // Create new student flow
      if (!newStudentName.trim()) {
        setErrorMsg('Full Name is required.');
        return;
      }
      const trimmedEmail = newStudentEmail.trim().toLowerCase();
      if (!trimmedEmail) {
        setEmailFieldError('Email address is required.');
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailFieldError('Please enter a valid email address.');
        setErrorMsg('Please enter a valid email address.');
        return;
      }

      const existingStudent = students.find((s) => s.email.toLowerCase() === trimmedEmail);
      if (existingStudent) {
        setEmailFieldError('A student with this email already exists.');
        setErrorMsg('A student with this email already exists.');
        return;
      }

      setIsSubmitting(true);
      try {
        const createResponse = await studentsService.createStudent({
          full_name: newStudentName.trim(),
          email: trimmedEmail,
          phone: newStudentPhone.trim(),
        });

        const createdStudentData: any =
          (createResponse as any)?.data?.data ??
          (createResponse as any)?.data ??
          createResponse;

        const realUserId =
          createdStudentData?.user?.id ||
          createdStudentData?.user_id ||
          createdStudentData?.id;

        if (!realUserId) {
          setErrorMsg('Failed to create student account.');
          setIsSubmitting(false);
          return;
        }

        await enrollmentService.create({
          student_id: String(realUserId),
          course_id: activeCourseUuid,
          access_type: 'FULL',
          source: 'MANUAL',
          is_lifetime: true,
        });

        showToast(`Student created and enrolled successfully.`);
        await loadData();
        setIsSubmitting(false);
        navigate(backLink);
      } catch (err: any) {
        setIsSubmitting(false);
        const apiErr = err?.response?.data?.error?.message || err?.response?.data?.detail;
        setErrorMsg(apiErr || 'Failed to create and enroll new student.');
      }
    } else if (tabMode === 'email') {
      // Invite by email flow
      const trimmedEmail = inviteEmailInput.trim().toLowerCase();
      if (!trimmedEmail) {
        setEmailFieldError('Email address is required.');
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailFieldError('Please enter a valid email address.');
        setErrorMsg('Please enter a valid email address.');
        return;
      }

      setIsSubmitting(true);
      try {
        // Find existing student or create a placeholder student account to enroll
        let existingStudent = students.find((s) => s.email.toLowerCase() === trimmedEmail);
        let targetUserId = existingStudent?.userId;

        if (!targetUserId) {
          const createResponse = await studentsService.createStudent({
            full_name: trimmedEmail.split('@')[0],
            email: trimmedEmail,
            phone: '',
          });

          const createdData: any =
            (createResponse as any)?.data?.data ??
            (createResponse as any)?.data ??
            createResponse;

          targetUserId = createdData?.user?.id || createdData?.user_id || createdData?.id;
        }

        if (targetUserId) {
          await enrollmentService.create({
            student_id: String(targetUserId),
            course_id: activeCourseUuid,
            access_type: 'FULL',
            source: 'MANUAL',
            is_lifetime: true,
          });
        }

        showToast(`Invitation sent and student enrolled.`);
        setInviteEmailInput('');
        await loadData();
        setIsSubmitting(false);
        navigate(backLink);
      } catch (err: any) {
        setIsSubmitting(false);
        const apiErr = err?.response?.data?.error?.message || err?.response?.data?.detail;
        setErrorMsg(apiErr || 'Failed to send invitation.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-4 font-sans">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#0B132B] rounded-2xl border border-rose-200 dark:border-rose-900/50 space-y-4 max-w-lg mx-auto mt-8 font-sans">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">Unable to Load Enrollment Page</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">{errorMessage || "Course or student data could not be retrieved."}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry Request
        </Button>
      </div>
    );
  }

  const startRange = filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRange = Math.min(currentPage * pageSize, filteredStudents.length);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 md:px-0 py-3 sm:py-6 space-y-3.5 sm:space-y-6 text-left font-sans pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-12 min-w-0 max-w-full box-border">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] dark:bg-[#1E293B] text-white dark:text-[#F8FAFC] text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 dark:border-[#334155]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="bg-white dark:bg-transparent p-1 sm:p-0 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <Link
            to={backLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
          </Link>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1C2640] border border-slate-200 dark:border-[#2A3859] flex items-center justify-center text-slate-600 dark:text-[#94A3B8]">
            <User className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Enroll Students
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal mt-0.5">
            Add existing students to this course.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. ENROLLMENT MODES TABS (3 EQUAL-WIDTH TABS MATCHING REFERENCE IMAGE) */}
      {!singleStudent && (
        <div className="bg-slate-100 dark:bg-[#0B1329] p-1 rounded-2xl border border-slate-200 dark:border-[#1E2B4B] shadow-2xs">
          <div className="grid grid-cols-3 gap-1 w-full min-w-0">
            <button
              type="button"
              onClick={() => setTabMode('search')}
              className={`h-[52px] min-w-0 px-1 text-[11px] sm:text-xs font-semibold rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                tabMode === 'search'
                  ? 'bg-[#2563EB] text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200/50 dark:hover:bg-[#162244]'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="truncate">Search Students</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/courses/${activeCourseUuid}/students/bulk-upload`)}
              className="h-[52px] min-w-0 px-1 text-[11px] sm:text-xs font-semibold rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200/50 dark:hover:bg-[#162244]"
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span className="truncate">Bulk Enroll</span>
            </button>
            <button
              type="button"
              onClick={() => setTabMode('email')}
              className={`h-[52px] min-w-0 px-1 text-[11px] sm:text-xs font-semibold rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                tabMode === 'email'
                  ? 'bg-[#2563EB] text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200/50 dark:hover:bg-[#162244]'
              }`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">Invite by Email</span>
            </button>
          </div>
        </div>
      )}

      {/* SINGLE STUDENT SPECIFIC ENROLLMENT */}
      {singleStudent ? (
        <Card className="bg-white dark:bg-[#0E1733] p-4 sm:p-6 border border-slate-200 dark:border-[#1E2B4B] rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColorClass(singleStudent.fullName)}`}>
              {getInitials(singleStudent.fullName)}
            </div>
            <div>
              <strong className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] block">{singleStudent.fullName}</strong>
              <span className="text-xs text-slate-500 dark:text-[#94A3B8] block">{singleStudent.email}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-[#1E2B4B] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Target Course: <strong>{course?.title}</strong></span>
            {singleStudent.isEnrolled ? (
              <Badge variant="secondary" size="sm">Already Enrolled</Badge>
            ) : (
              <Button onClick={handleSingleStudentEnroll} isLoading={isSubmitting} className="bg-[#2563EB] text-white text-xs font-semibold">
                Enroll Student
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* MAIN TWO-COLUMN RESPONSIVE LAYOUT (Desktop >= 1024px) */
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-4 sm:gap-6 items-start w-full min-w-0">
          {/* LEFT COLUMN: SEARCH & STUDENT LIST / FORMS */}
          <div className="space-y-3.5 min-w-0 w-full">
            {tabMode === 'search' ? (
              <div className="space-y-3.5 bg-transparent p-0">
                {/* SEARCH BAR & FILTER BUTTON ROW */}
                <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2 items-center w-full min-w-0">
                  <div className="relative min-w-0">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748B] pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search students by name or email..."
                      className="w-full h-12 pl-10 pr-9 bg-white dark:bg-[#0B1329] border border-slate-200 dark:border-[#1E2B4B] rounded-2xl text-xs font-medium text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] min-w-0"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:text-[#64748B] dark:hover:text-[#F8FAFC] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    aria-label="Filter"
                    className="h-12 w-12 flex items-center justify-center border border-slate-200 dark:border-[#1E2B4B] bg-white dark:bg-[#0B1329] hover:bg-slate-100 dark:hover:bg-[#162244] text-slate-700 dark:text-[#F8FAFC] rounded-2xl transition-all cursor-pointer shrink-0"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* RESULT COUNT + SELECT ALL ROW */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 px-1">
                  <span className="text-slate-600 dark:text-[#94A3B8] font-medium text-[11px] sm:text-xs">
                    Showing {startRange}–{endRange} of {filteredStudents.length} students
                  </span>

                  {currentPageAvailableStudents.length > 0 && (
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-[#CBD5E1] select-none">
                      <input
                        type="checkbox"
                        checked={isAllCurrentPageAvailableSelected}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 text-[#2563EB] bg-white dark:bg-[#0B1329] rounded border-slate-300 dark:border-[#2A3859] focus:ring-blue-500 cursor-pointer"
                      />
                      Select all on this page
                    </label>
                  )}
                </div>

                {/* STUDENT LIST: DESKTOP TABLE & MOBILE COMPACT CARDS */}
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#0E1733] border border-slate-200 dark:border-[#1E2B4B] rounded-2xl space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">No students found</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Try adjusting your search or filter criteria.</p>
                  </div>
                ) : (
                  <>
                    {/* DESKTOP TABLE (HIDDEN ON MOBILE) */}
                    <div className="hidden md:block border border-slate-200 dark:border-[#1E2B4B] rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-[#0B1329] border-b border-slate-200 dark:border-[#1E2B4B] text-slate-500 dark:text-[#94A3B8] font-medium">
                            <th className="py-3 px-3 w-10 text-center">Select</th>
                            <th className="py-3 px-3 w-10">#</th>
                            <th className="py-3 px-4">Student</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#1E2B4B]">
                          {paginatedStudents.map((student, idx) => {
                            const enrolled = student.isEnrolled;
                            const isSelected = selectedStudentIds.includes(student.id);

                            return (
                              <tr
                                key={student.id}
                                onClick={() => handleToggleStudent(student.id)}
                                className={`transition-colors cursor-pointer ${
                                  enrolled
                                    ? 'bg-slate-50/70 dark:bg-[#0B1329]/50 opacity-60 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-blue-50/80 dark:bg-[rgba(37,99,235,0.12)]'
                                    : 'hover:bg-slate-50 dark:hover:bg-[#162244]'
                                }`}
                              >
                                <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={enrolled}
                                    onChange={() => handleToggleStudent(student.id)}
                                    aria-label={`Select ${student.fullName}`}
                                    className="w-4 h-4 text-[#2563EB] bg-white dark:bg-[#0B1329] rounded border-slate-300 dark:border-[#2A3859] focus:ring-blue-500 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-3 text-slate-400 font-medium">
                                  {(currentPage - 1) * pageSize + idx + 1}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColorClass(student.fullName)}`}>
                                      {getInitials(student.fullName)}
                                    </div>
                                    <strong className="font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                                      {student.fullName}
                                    </strong>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-slate-600 dark:text-[#94A3B8] font-normal truncate">
                                  {student.email}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    enrolled
                                      ? 'bg-slate-200/60 dark:bg-[#18233C] text-slate-600 dark:text-[#7A8EA8]'
                                      : 'bg-emerald-500/15 text-emerald-600 dark:text-[#34D399]'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${enrolled ? 'bg-slate-400' : 'bg-emerald-400'}`}></span>
                                    {enrolled ? 'Enrolled' : 'Available'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE COMPACT CARDS GRID */}
                    <div className="grid gap-2.5 md:hidden w-full min-w-0">
                      {paginatedStudents.map((student) => {
                        const enrolled = student.isEnrolled;
                        const isSelected = selectedStudentIds.includes(student.id);

                        return (
                          <div
                            key={student.id}
                            onClick={() => handleToggleStudent(student.id)}
                            className={`p-3 rounded-2xl border transition-all space-y-2 w-full min-w-0 box-border ${
                              enrolled
                                ? 'bg-white dark:bg-[#0D152C] border-slate-200 dark:border-[#1A2645] opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-50/90 dark:bg-[#12224A] border-[#3B82F6] shadow-2xs cursor-pointer'
                                : 'bg-white dark:bg-[#0D152C] border-slate-200 dark:border-[#1A2645] hover:bg-slate-50 dark:hover:bg-[#142040] cursor-pointer'
                            }`}
                          >
                            {/* TOP ROW: [Checkbox] [Avatar] ... [StatusBadge] */}
                            <div className="grid grid-cols-[28px_44px_minmax(0,1fr)] items-center gap-2.5 w-full min-w-0">
                              {/* 1. Checkbox */}
                              <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={enrolled}
                                  onChange={() => handleToggleStudent(student.id)}
                                  aria-label={`Select ${student.fullName}`}
                                  className="w-4 h-4 text-[#2563EB] bg-white dark:bg-[#0B1329] rounded border-slate-300 dark:border-[#2A3859] focus:ring-blue-500 cursor-pointer"
                                />
                              </div>

                              {/* 2. Vibrant Initials Avatar */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${getAvatarColorClass(student.fullName)}`}>
                                {getInitials(student.fullName)}
                              </div>

                              {/* 3. Status Badge (Right Aligned) */}
                              <div className="justify-self-end">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                  enrolled
                                    ? 'bg-slate-200/60 dark:bg-[#192745] text-slate-600 dark:text-[#8899B0]'
                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-[#34D399]'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${enrolled ? 'bg-slate-400 dark:bg-[#64748B]' : 'bg-emerald-400'}`}></span>
                                  {enrolled ? 'Enrolled' : 'Available'}
                                </span>
                              </div>
                            </div>

                            {/* BOTTOM CONTENT: Full-width Student Name & Email */}
                            <div className="w-full min-w-0 space-y-0.5 pt-0.5">
                              <strong className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block w-full whitespace-normal leading-snug overflow-wrap-break-word">
                                {student.fullName}
                              </strong>
                              <span className="text-[11px] font-normal text-slate-500 dark:text-[#8899B0] block w-full truncate leading-tight">
                                {student.email}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* COMPACT PAGINATION (EXACT MATCH TO REFERENCE SCREENSHOT) */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 pt-4 pb-2">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-[#1E2B4B] bg-white dark:bg-[#0B1329] hover:bg-slate-100 dark:hover:bg-[#162244] text-slate-700 dark:text-[#F8FAFC] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-semibold text-slate-700 dark:text-[#F8FAFC]">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-[#1E2B4B] bg-white dark:bg-[#0B1329] hover:bg-slate-100 dark:hover:bg-[#162244] text-slate-700 dark:text-[#F8FAFC] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : tabMode === 'create' ? (
              /* CREATE NEW STUDENT FORM */
              <Card className="space-y-4 bg-white dark:bg-[#0E1733] border border-slate-200 dark:border-[#1E2B4B] rounded-2xl p-4 sm:p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Create New Student Profile</h3>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">Full Name *</label>
                  <Input
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="h-10 text-xs font-medium bg-slate-50 dark:bg-[#0B1329] border border-slate-200 dark:border-[#1E2B4B] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">Email Address *</label>
                    <Input
                      type="email"
                      value={newStudentEmail}
                      onChange={(e) => {
                        setNewStudentEmail(e.target.value);
                        if (emailFieldError) setEmailFieldError(null);
                      }}
                      placeholder="student@example.com"
                      className={`h-10 text-xs font-medium bg-slate-50 dark:bg-[#0B1329] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] ${
                        emailFieldError ? 'border-rose-500' : 'border-slate-200 dark:border-[#1E2B4B]'
                      }`}
                    />
                    {emailFieldError && (
                      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1">
                        {emailFieldError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">Phone Number</label>
                    <Input
                      value={newStudentPhone}
                      onChange={(e) => setNewStudentPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-10 text-xs font-medium bg-slate-50 dark:bg-[#0B1329] border border-slate-200 dark:border-[#1E2B4B] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleConfirmEnrollment}
                    disabled={isSubmitting || !newStudentName.trim() || !newStudentEmail.trim()}
                    isLoading={isSubmitting}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs h-10 shadow-2xs cursor-pointer"
                  >
                    Create & Enroll Student
                  </Button>
                </div>
              </Card>
            ) : (
              /* INVITE BY EMAIL FORM */
              <Card className="space-y-4 bg-white dark:bg-[#0E1733] border border-slate-200 dark:border-[#1E2B4B] rounded-2xl p-4 sm:p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Invite Student by Email</h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Send a course enrollment link directly to the student's email address.
                </p>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">Student Email *</label>
                  <Input
                    type="email"
                    value={inviteEmailInput}
                    onChange={(e) => {
                      setInviteEmailInput(e.target.value);
                      if (emailFieldError) setEmailFieldError(null);
                    }}
                    placeholder="student@example.com"
                    className="h-10 text-xs font-medium bg-slate-50 dark:bg-[#0B1329] border border-slate-200 dark:border-[#1E2B4B] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
                  />
                  {emailFieldError && (
                    <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1">
                      {emailFieldError}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleConfirmEnrollment}
                    disabled={isSubmitting || !inviteEmailInput.trim()}
                    isLoading={isSubmitting}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs h-10 shadow-2xs cursor-pointer"
                  >
                    Send Invite & Enroll
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: DESKTOP ENROLLMENT SUMMARY SIDEBAR (HIDDEN ON MOBILE) */}
          <div className="hidden md:block space-y-4 lg:sticky lg:top-6">
            <Card className="bg-white dark:bg-[#0E1733] border border-slate-200 dark:border-[#1E2B4B] p-5 rounded-2xl shadow-2xs space-y-4 text-left">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Enrollment Summary</h2>

              <div className="p-3 bg-slate-50 dark:bg-[#0B1329] border border-slate-200 dark:border-[#1E2B4B] rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Target Course:</span>
                <strong className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] block">{course?.title}</strong>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-[#94A3B8]">Selection Count:</span>
                  <strong className="font-bold text-[#2563EB] dark:text-[#60A5FA]">
                    {tabMode === 'search' ? `${selectedStudentIds.length} Students` : '1 Student'}
                  </strong>
                </div>

                {tabMode === 'search' && selectedStudentDetails.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#1E2B4B]">
                    {selectedStudentDetails.map((student) => (
                      <div key={student.id} className="flex items-center justify-between text-[11px] text-slate-700 dark:text-[#CBD5E1]">
                        <span className="truncate pr-2">{student.fullName}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleStudent(student.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={handleConfirmEnrollment}
                disabled={isSubmitting || (tabMode === 'search' && selectedStudentIds.length === 0)}
                isLoading={isSubmitting}
                leftIcon={<UserPlus className="w-4 h-4" />}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs h-10 shadow-2xs cursor-pointer"
              >
                {isSubmitting
                  ? 'Enrolling...'
                  : tabMode === 'search'
                  ? `Enroll ${selectedStudentIds.length} Selected ${selectedStudentIds.length === 1 ? 'Student' : 'Students'}`
                  : 'Complete Enrollment'}
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* MOBILE STICKY ENROLLMENT ACTION BAR (STRICTLY ABOVE BOTTOM NAVIGATION BAR MATCHING SCREENSHOT) */}
      {!singleStudent && tabMode === 'search' && createPortal(
        <div className="md:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 p-3 bg-[#091024]/95 backdrop-blur-md border-t border-[#192748] shadow-2xl">
          <div className="max-w-[500px] mx-auto flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {selectedStudentIds.length} students selected
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmEnrollment}
              disabled={isSubmitting || selectedStudentIds.length === 0}
              className={`w-full min-[360px]:w-auto h-11 px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                selectedStudentIds.length > 0
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md'
                  : 'bg-[#182544] text-[#4A5D7C] cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Enrolling...' : 'Enroll Selected Students'}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* MOBILE FILTER MODAL */}
      <Modal isOpen={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} title="Filter Students">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">Enrollment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'enrolled')}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-[#0B1329] border border-slate-200 dark:border-[#1E2B4B] rounded-xl font-medium text-slate-900 dark:text-[#F8FAFC] text-xs"
            >
              <option value="all">All Students</option>
              <option value="available">Available for Enrollment</option>
              <option value="enrolled">Already Enrolled</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1E2B4B]">
            <Button variant="outline" onClick={() => setStatusFilter('all')}>
              Reset Filter
            </Button>
            <Button onClick={() => setIsMobileFilterOpen(false)} className="bg-[#2563EB] text-white font-medium">
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

