import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  UserPlus,
  Check,
  Search,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Upload,
  UserCheck,
  X,
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

export const EnrollStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, studentUuid: routeStudentUuid } = useParams<{ courseUuid?: string; studentUuid?: string }>();
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

  // Tab mode: 'search' | 'create'
  const [tabMode, setTabMode] = useState<'search' | 'create'>('search');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'enrolled'>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    studentUuid ? [studentUuid] : []
  );

  // New Student Fields State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [accessExpiryDate, setAccessExpiryDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const backLink = courseUuid ? courseRoutes.students(courseUuid) : '/courses';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Load Real Data from Backend
  const loadData = useCallback(async () => {
    if (!courseUuid || courseUuid === 'undefined') {
      setIsError(true);
      setErrorMessage('Course ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      // Concurrently fetch course info, existing enrollments, and all academy students
      const [courseData, enrollments, rawStudents] = await Promise.all([
        coursesService.getCourse(courseUuid),
        studentsService.listCourseEnrollments(courseUuid),
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
      setErrorMessage(err?.response?.data?.error?.message || err?.message || 'Failed to load course and student data.');
    } finally {
      setIsLoading(false);
    }
  }, [courseUuid]);

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
    if (isSubmitting || !courseUuid || !singleStudent?.userId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await enrollmentService.create({
        student_id: singleStudent.userId,
        course_id: courseUuid,
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

  // Filtered students list
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

  const availableFilteredStudents = useMemo(
    () => filteredStudents.filter((s) => !s.isEnrolled),
    [filteredStudents]
  );

  const isAllAvailableSelected =
    availableFilteredStudents.length > 0 &&
    availableFilteredStudents.every((s) => selectedStudentIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllAvailableSelected) {
      const availableIds = availableFilteredStudents.map((s) => s.id);
      setSelectedStudentIds((prev) => prev.filter((id) => !availableIds.includes(id)));
    } else {
      const availableIds = availableFilteredStudents.map((s) => s.id);
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

  // Main Submit Handler for Multi-Student Enrollment or New Student Creation
  const handleConfirmEnrollment = async () => {
    if (isSubmitting || !courseUuid) return;

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
            course_id: courseUuid,
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
    } else {
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
          course_id: courseUuid,
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
    }
  };

  const selectedStudentDetails = useMemo(() => {
    return students.filter((s) => selectedStudentIds.includes(s.id));
  }, [students, selectedStudentIds]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-6 space-y-4 font-sans text-left">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 dark:border-rose-900/50 space-y-4 max-w-lg mx-auto mt-8 font-sans">
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

  return (
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 md:px-0 py-4 sm:py-6 space-y-4 sm:space-y-6 text-left font-sans pb-32 md:pb-12 min-w-0 max-w-full box-border">
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
            to={backLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Enroll Students
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal mt-0.5">
              Add existing students to <strong className="text-slate-700 dark:text-[#CBD5E1] font-semibold">{course?.title || 'this course'}</strong>.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. ENROLLMENT MODES TABS */}
      {!singleStudent && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-2 rounded-xl border border-slate-200 dark:border-[#263244] shadow-2xs">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => setTabMode('search')}
              className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tabMode === 'search'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033]'
              }`}
            >
              Search Students
            </button>
            <button
              type="button"
              onClick={() => setTabMode('create')}
              className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tabMode === 'create'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033]'
              }`}
            >
              + Create New Student
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/courses/${courseUuid}/students/bulk-upload`)}
            className="border-slate-200 dark:border-[#334155] text-[#2563EB] dark:text-[#60A5FA] bg-white dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-[#172033] text-xs font-semibold h-9 px-3"
          >
            Bulk Enroll
          </Button>
        </div>
      )}

      {/* SINGLE STUDENT SPECIFIC ENROLLMENT */}
      {singleStudent ? (
        <Card className="bg-white dark:bg-[#111827] p-4 sm:p-6 border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-bold text-sm">
              {singleStudent.fullName.charAt(0)}
            </div>
            <div>
              <strong className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] block">{singleStudent.fullName}</strong>
              <span className="text-xs text-slate-500 dark:text-[#94A3B8] block">{singleStudent.email}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-[#263244] flex items-center justify-between">
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
          {/* LEFT COLUMN: SEARCH & STUDENT LIST OR CREATE FORM */}
          <div className="space-y-4 min-w-0 w-full">
            {tabMode === 'search' ? (
              <div className="space-y-3.5 bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-[16px] border border-slate-200 dark:border-[#263244] shadow-2xs">
                {/* SEARCH BAR & FILTER BUTTON */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748B] pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search students..."
                      className="w-full h-10 pl-10 pr-10 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-medium text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] min-w-0"
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

                  <div className="flex shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                      onClick={() => setIsMobileFilterOpen(true)}
                      className="h-10 text-xs px-3 border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-slate-700 dark:text-[#F8FAFC] font-semibold"
                      aria-label="Filter"
                    >
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                  </div>
                </div>

                {/* SELECT ALL TOOLBAR & COUNT */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-[#263244]">
                  <span className="text-slate-500 dark:text-[#94A3B8] font-medium text-[11px]">
                    Showing {filteredStudents.length} of {students.length} students
                  </span>

                  {availableFilteredStudents.length > 0 && (
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#2563EB] dark:text-[#60A5FA] select-none">
                      <input
                        type="checkbox"
                        checked={isAllAvailableSelected}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 text-[#2563EB] bg-white dark:bg-[#0F172A] rounded border-slate-300 dark:border-[#64748B] focus:ring-blue-500 cursor-pointer"
                      />
                      Select all on this page
                    </label>
                  )}
                </div>

                {/* STUDENT LIST: DESKTOP TABLE & MOBILE CARDS */}
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">No students found</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Try adjusting your search or filter criteria.</p>
                  </div>
                ) : (
                  <>
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block border border-slate-200 dark:border-[#263244] rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-[#172033] border-b border-slate-200 dark:border-[#263244] text-slate-500 dark:text-[#94A3B8] font-medium">
                            <th className="py-3 px-3 w-10 text-center">Select</th>
                            <th className="py-3 px-3 w-10">#</th>
                            <th className="py-3 px-4">Student</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#263244]">
                          {filteredStudents.map((student, idx) => {
                            const enrolled = student.isEnrolled;
                            const isSelected = selectedStudentIds.includes(student.id);

                            return (
                              <tr
                                key={student.id}
                                onClick={() => handleToggleStudent(student.id)}
                                className={`transition-colors cursor-pointer ${
                                  enrolled
                                    ? 'bg-slate-50/70 dark:bg-[#0F172A]/50 opacity-60 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-blue-50/80 dark:bg-[rgba(37,99,235,0.12)]'
                                    : 'hover:bg-slate-50 dark:hover:bg-[#172033]'
                                }`}
                              >
                                <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={enrolled}
                                    onChange={() => handleToggleStudent(student.id)}
                                    aria-label={`Select ${student.fullName}`}
                                    className="w-4 h-4 text-[#2563EB] bg-white dark:bg-[#0F172A] rounded border-slate-300 dark:border-[#64748B] focus:ring-blue-500 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-3 text-slate-400 font-medium">{idx + 1}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-bold text-xs shrink-0">
                                      {student.fullName.charAt(0)}
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
                                  <Badge variant={enrolled ? 'secondary' : 'success'} size="sm" dot>
                                    {enrolled ? 'Already Enrolled' : 'Available'}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="grid gap-2.5 md:hidden w-full min-w-0">
                      {filteredStudents.map((student) => {
                        const enrolled = student.isEnrolled;
                        const isSelected = selectedStudentIds.includes(student.id);

                        return (
                          <div
                            key={student.id}
                            onClick={() => handleToggleStudent(student.id)}
                            className={`p-3 rounded-xl border transition-all grid grid-cols-[28px_40px_minmax(0,1fr)_auto] items-center gap-2.5 w-full min-w-0 box-border ${
                              enrolled
                                ? 'bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-[#263244] opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-50/90 dark:bg-[rgba(37,99,235,0.14)] border-[#3B82F6] shadow-2xs cursor-pointer'
                                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer'
                            }`}
                          >
                            {/* 1. Checkbox */}
                            <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={enrolled}
                                onChange={() => handleToggleStudent(student.id)}
                                aria-label={`Select ${student.fullName}`}
                                className="w-4 h-4 text-[#2563EB] bg-white dark:bg-[#0F172A] rounded border-slate-300 dark:border-[#64748B] focus:ring-blue-500 cursor-pointer"
                              />
                            </div>

                            {/* 2. Avatar */}
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-extrabold text-xs shrink-0">
                              {student.fullName.charAt(0)}
                            </div>

                            {/* 3. Name & Email */}
                            <div className="min-w-0">
                              <strong className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block truncate leading-tight">
                                {student.fullName}
                              </strong>
                              <span className="text-[11px] font-normal text-slate-500 dark:text-[#94A3B8] block truncate leading-tight mt-0.5">
                                {student.email}
                              </span>
                            </div>

                            {/* 4. Status Badge */}
                            <div className="shrink-0">
                              <Badge variant={enrolled ? 'secondary' : 'success'} size="sm" dot>
                                {enrolled ? 'Enrolled' : 'Available'}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* CREATE NEW STUDENT FORM */
              <Card className="space-y-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl p-4 sm:p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Create New Student Profile</h3>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">Full Name *</label>
                  <Input
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="h-10 text-xs font-medium bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
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
                      className={`h-10 text-xs font-medium bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] ${
                        emailFieldError ? 'border-rose-500' : 'border-slate-200 dark:border-[#334155]'
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
                      className="h-10 text-xs font-medium bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: DESKTOP ENROLLMENT SUMMARY SIDEBAR (HIDDEN ON MOBILE) */}
          <div className="hidden lg:block space-y-4 sticky top-6">
            <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-5 rounded-2xl shadow-2xs space-y-4 text-left">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Enrollment Summary</h2>

              <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Target Course:</span>
                <strong className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] block">{course?.title}</strong>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-[#94A3B8]">Selection Count:</span>
                  <strong className="font-bold text-[#2563EB] dark:text-[#60A5FA]">
                    {tabMode === 'search' ? `${selectedStudentIds.length} Students` : '1 New Student'}
                  </strong>
                </div>

                {tabMode === 'search' && selectedStudentDetails.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#263244]">
                    {selectedStudentDetails.map((student) => (
                      <div key={student.id} className="flex items-center justify-between text-[11px] text-slate-700 dark:text-[#CBD5E1]">
                        <span className="truncate pr-2">{student.fullName}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleStudent(student.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold"
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
                  : 'Create & Enroll Student'}
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* MOBILE STICKY ENROLLMENT ACTION BAR (PLACED STRICTLY ABOVE MOBILE BOTTOM NAV) */}
      {!singleStudent && (
        <div className="lg:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 p-3 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#263244] shadow-lg">
          <div className="max-w-[500px] mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block truncate">
                {tabMode === 'search' ? `${selectedStudentIds.length} students selected` : 'New student profile'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] block truncate">
                Ready for course enrollment
              </span>
            </div>

            <Button
              type="button"
              onClick={handleConfirmEnrollment}
              disabled={isSubmitting || (tabMode === 'search' && selectedStudentIds.length === 0)}
              isLoading={isSubmitting}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs h-9 px-4 shrink-0 shadow-2xs"
            >
              Enroll
            </Button>
          </div>
        </div>
      )}

      {/* MOBILE FILTER MODAL */}
      <Modal isOpen={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} title="Filter Students">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="space-y-1">
            <label className="block font-medium text-slate-900 dark:text-[#F8FAFC]">Enrollment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'enrolled')}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl font-medium text-slate-900 dark:text-[#F8FAFC] text-xs"
            >
              <option value="all">All Students</option>
              <option value="available">Available for Enrollment</option>
              <option value="enrolled">Already Enrolled</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#263244]">
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
