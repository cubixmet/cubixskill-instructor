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
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { studentsService } from '../../../services/students.service';
import { coursesService } from '../../../services/courses.service';
import { enrollmentService } from '../../../services/enrollment.service';

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

  // Step state: 'select' | 'review'
  const [step, setStep] = useState<'select' | 'review'>('select');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'enrolled'>('all');

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
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const backLink = courseUuid
    ? `/courses/${courseUuid}/students`
    : studentUuid
      ? `/students/${studentUuid}`
      : '/students';

  // Load Real Data from Backend
  const loadData = useCallback(async () => {
    if (!courseUuid || courseUuid === 'undefined') {
      setIsError(true);
      setErrorMessage('Course is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      // Execute requests concurrently
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

  // Target single student if studentUuid is passed
  const singleStudent = useMemo(() => {
    if (!studentUuid) return null;
    return students.find((s) => s.id === studentUuid || s.userId === studentUuid) || null;
  }, [students, studentUuid]);

  // Single student submission handler
  const handleSingleStudentEnroll = async () => {
    if (isSubmitting) return;

    if (!courseUuid) {
      setErrorMsg('Course is missing.');
      return;
    }

    const realStudentUserId = singleStudent?.userId;
    if (!realStudentUserId) {
      setErrorMsg('A valid student account is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await enrollmentService.create({
        student_id: realStudentUserId,
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
      const apiCode = err?.response?.data?.error?.code || err?.response?.data?.code;
      const apiErr = err?.response?.data?.error?.message || err?.response?.data?.detail;

      if (apiCode === 'COURSE_NOT_FOUND') {
        setErrorMsg('The selected course could not be found.');
      } else if (apiCode === 'USER_NOT_FOUND') {
        setErrorMsg('The selected student account could not be found.');
      } else {
        setErrorMsg(apiErr || 'This student is already enrolled or enrollment failed.');
      }
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

  const handleRemoveFromReview = (id: string) => {
    setSelectedStudentIds((prev) => prev.filter((item) => item !== id));
  };

  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);

  const handleProceedToReview = () => {
    setEmailFieldError(null);
    setErrorMsg(null);

    if (mode === 'existing') {
      if (selectedStudentIds.length === 0) {
        setErrorMsg('Please select at least one student to enroll.');
        return;
      }
    } else {
      if (!newStudentName.trim()) {
        setErrorMsg('Full Name is required.');
        return;
      }
      const trimmedEmail = newStudentEmail.trim().toLowerCase();
      if (!trimmedEmail) {
        setEmailFieldError('Email address is required.');
        setErrorMsg('Please correct the highlighted fields.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailFieldError('Please enter a valid email address.');
        setErrorMsg('Please correct the highlighted fields.');
        return;
      }

      // Check if email already belongs to existing student
      const existingStudent = students.find((s) => s.email.toLowerCase() === trimmedEmail);
      if (existingStudent) {
        setEmailFieldError('A student with this email already exists.');
        setErrorMsg('A student with this email already exists.');
        return;
      }
    }
    setStep('review');
  };

  const handleConfirmEnrollment = async () => {
    if (isSubmitting) return;

    if (!courseUuid) {
      setErrorMsg('Course is missing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setEmailFieldError(null);

    try {
      if (mode === 'existing') {
        const selectedStudentsList = students.filter((s) => selectedStudentIds.includes(s.id));

        for (const selectedStudent of selectedStudentsList) {
          const realStudentUserId = selectedStudent.userId;
          if (!realStudentUserId) {
            setErrorMsg('A valid student account is required.');
            setIsSubmitting(false);
            return;
          }

          await enrollmentService.create({
            student_id: realStudentUserId,
            course_id: courseUuid,
            access_type: 'FULL',
            source: 'MANUAL',
            is_lifetime: true,
          });
        }
        showToast(`${selectedStudentsList.length} ${selectedStudentsList.length === 1 ? 'student' : 'students'} enrolled successfully.`);
      } else {
        const trimmedEmail = newStudentEmail.trim().toLowerCase();
        // 1. Create real Student profile & User account in backend
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
          setErrorMsg('A valid student account is required.');
          setIsSubmitting(false);
          return;
        }

        // 2. Create real course enrollment for the newly created student
        await enrollmentService.create({
          student_id: String(realUserId),
          course_id: courseUuid,
          access_type: 'FULL',
          source: 'MANUAL',
          is_lifetime: true,
        });

        showToast(`Student created and enrolled successfully. An activation email has been sent to ${trimmedEmail}.`);
      }

      await loadData();
      setIsSubmitting(false);
      navigate(backLink);
    } catch (err: any) {
      setIsSubmitting(false);
      const apiCode = err?.response?.data?.error?.code || err?.response?.data?.code;
      const apiErr = err?.response?.data?.error?.message || err?.response?.data?.detail;

      if (apiCode === 'COURSE_NOT_FOUND') {
        setErrorMsg('The selected course could not be found.');
      } else if (apiCode === 'USER_NOT_FOUND') {
        setErrorMsg('The selected student account could not be found.');
      } else if (apiCode === 'USER_EXISTS' || (apiErr && apiErr.toLowerCase().includes('email'))) {
        setEmailFieldError('A student with this email already exists.');
        setStep('select');
        setErrorMsg(apiErr || 'A student with this email already exists.');
      } else {
        setErrorMsg(apiErr || 'Failed to complete student creation and enrollment.');
      }
    }
  };

  const selectedStudentDetails = useMemo(() => {
    return students.filter((s) => selectedStudentIds.includes(s.id));
  }, [students, selectedStudentIds]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[900px] mx-auto px-4 py-8 space-y-4 font-sans text-left">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 dark:border-rose-900/50 space-y-4 max-w-lg mx-auto mt-8 font-sans">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">Unable to Load Course Enrollment</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">{errorMessage || "Course or student data could not be retrieved."}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-[900px] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 text-left font-sans pb-36 md:pb-12"
    >
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. COMPACT PAGE HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-[#334155] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (step === 'review') setStep('select');
              else navigate(backLink);
            }}
            className="p-1.5 -ml-1 text-slate-600 dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-xl cursor-pointer transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {singleStudent ? 'Enroll in Course' : step === 'select' ? 'Enroll Students' : 'Review Enrollment'}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal mt-0.5 truncate">
              {singleStudent
                ? `Select a course to enroll ${singleStudent.name}`
                : step === 'select'
                  ? 'Select students to enroll in this course.'
                  : `Enrolling into ${course?.title || 'Course'}`}
            </p>
          </div>
        </div>

        <Link to={backLink} className="shrink-0">
          <Button variant="outline" size="sm" className="text-xs font-medium h-8 px-3 border-slate-300 dark:border-[#334155] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] dark:hover:border-[#475569] dark:hover:text-[#F8FAFC]">
            Cancel
          </Button>
        </Link>
      </div>
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* SINGLE STUDENT ENROLLMENT FLOW */}
      <div>
        {singleStudent ? (
          <div className="space-y-4">
            {/* STUDENT IDENTITY BANNER */}
            <div className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-[16px] shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.12)] border border-[#DBEAFE] dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-bold text-sm shrink-0">
                  {singleStudent.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">{singleStudent.fullName}</strong>
                    <Badge variant={singleStudent.status === 'Active' ? 'success' : 'secondary'} size="sm">
                      {singleStudent.status}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-[#94A3B8] block truncate">
                    {singleStudent.email}
                  </span>
                </div>
              </div>
            </div>

            {/* COURSE BANNER */}
            <div className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">Target Course</h3>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <strong className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] block leading-snug break-words">
                      {course?.title || 'Course'}
                    </strong>
                  </div>
                </div>

                {singleStudent.isEnrolled ? (
                  <Badge variant="secondary" size="sm">
                    Already Enrolled
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    disabled={isSubmitting}
                    onClick={handleSingleStudentEnroll}
                    className="text-xs font-medium h-8 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer shadow-2xs"
                  >
                    {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {step === 'select' && (
              <div className="space-y-4">
                {/* MODE TOGGLE */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMode('existing')}
                    className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${mode === 'existing'
                      ? 'bg-white dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-[#3B82F6] shadow-2xs'
                      : 'text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200/60 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC]'
                      }`}
                  >
                    Select Existing Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('new')}
                    className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${mode === 'new'
                      ? 'bg-white dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-[#3B82F6] shadow-2xs'
                      : 'text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200/60 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC]'
                      }`}
                  >
                    + Create New Student
                  </button>
                </div>

                {mode === 'existing' ? (
                  <div className="space-y-3.5">
                    {/* SEARCH BAR */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8]" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search students by name, email, or phone..."
                        className="pl-10 h-10 text-xs font-medium bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:border-[#3B82F6]"
                      />
                    </div>

                    {/* STATUS FILTERS & SELECTION TOOLBAR */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'available', label: 'Available' },
                          { id: 'enrolled', label: 'Already Enrolled' },
                        ].map((filter) => (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() => setStatusFilter(filter.id as 'all' | 'available' | 'enrolled')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${statusFilter === filter.id
                              ? 'bg-[#2563EB] text-white border border-[#2563EB] shadow-2xs'
                              : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] border border-slate-200 dark:border-[#334155]'
                              }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {availableFilteredStudents.length > 0 && (
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
                          >
                            {isAllAvailableSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        )}
                        {selectedStudentIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedStudentIds([])}
                            className="text-xs font-medium text-slate-500 dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* STUDENT LIST CARDS */}
                    {filteredStudents.length === 0 ? (
                      <Card className="bg-white dark:bg-[#111827] p-8 text-center border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs space-y-2">
                        <p className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                          {searchQuery ? 'No students match your search.' : 'No students available for enrollment.'}
                        </p>
                        {searchQuery && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchQuery('')}
                            className="text-xs font-semibold h-8 px-3 border-slate-200 dark:border-[#334155] dark:text-[#CBD5E1]"
                          >
                            Clear Search
                          </Button>
                        )}
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {filteredStudents.map((student) => {
                          const enrolled = student.isEnrolled;
                          const isSelected = selectedStudentIds.includes(student.id);

                          return (
                            <div
                              key={student.id}
                              onClick={() => handleToggleStudent(student.id)}
                              className={`p-3 rounded-2xl border transition-all ${enrolled
                                ? 'bg-slate-50 dark:bg-[#111827] border-slate-200 dark:border-[#263244] opacity-75 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.10)] border-[#3B82F6] shadow-2xs cursor-pointer'
                                  : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] hover:border-blue-300 dark:hover:border-blue-500/30 cursor-pointer'
                                }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Checkbox */}
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={enrolled}
                                    onChange={() => { }}
                                    aria-label={`Select ${student.name}`}
                                    className="w-4 h-4 text-[#2563EB] bg-white dark:bg-[#0F172A] rounded border-slate-300 dark:border-[#64748B] focus:ring-blue-500 cursor-pointer shrink-0"
                                  />

                                  {/* Avatar Initials */}
                                  <div className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.12)] border border-[#DBEAFE] dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-bold text-xs shrink-0">
                                    {student.fullName.charAt(0)}
                                  </div>

                                  {/* Student Details */}
                                  <div className="min-w-0">
                                    <strong className="text-xs font-medium text-slate-900 dark:text-[#F8FAFC] block truncate">{student.fullName}</strong>
                                    <span className="text-[11px] font-normal text-slate-500 dark:text-[#94A3B8] block truncate">{student.email}</span>
                                  </div>
                                </div>

                                {/* Availability Badge */}
                                <Badge variant={enrolled ? 'secondary' : 'success'} size="sm" className="shrink-0">
                                  {enrolled ? 'Already Enrolled' : 'Available'}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* NEW STUDENT FORM */
                  <Card className="space-y-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl p-4 sm:p-6 shadow-2xs">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">Full Name *</label>
                      <Input
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="h-10 text-xs font-medium bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
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
                          className={`h-10 text-xs font-medium bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] ${
                            emailFieldError
                              ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                              : 'border-slate-200 dark:border-[#334155]'
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
                          className="h-10 text-xs font-medium bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">Access Expiry Date</label>
                      <Input
                        type="date"
                        value={accessExpiryDate}
                        onChange={(e) => setAccessExpiryDate(e.target.value)}
                        className="h-10 text-xs font-medium bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC]"
                      />
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* STEP 2: REVIEW STEP */}
            {step === 'review' && (
              <Card className="space-y-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl p-4 sm:p-6 shadow-2xs">
                <div className="border-b border-slate-200 dark:border-[#263244] pb-3 space-y-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Review Enrollment Summary</h2>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal">
                    Target Course: <strong className="text-slate-900 dark:text-[#F8FAFC]">{course?.title}</strong>
                  </p>
                </div>

                {mode === 'existing' ? (
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] block">
                      Selected Students ({selectedStudentDetails.length})
                    </span>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {selectedStudentDetails.map((student) => (
                        <div
                          key={student.id}
                          className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.12)] border border-[#DBEAFE] dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-bold text-xs shrink-0">
                              {student.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <strong className="text-xs font-medium text-slate-900 dark:text-[#F8FAFC] block truncate">{student.fullName}</strong>
                              <span className="text-[11px] font-normal text-slate-500 dark:text-[#94A3B8] block truncate">{student.email}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveFromReview(student.id)}
                            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl space-y-1.5">
                    <strong className="text-xs font-medium text-slate-900 dark:text-[#F8FAFC] block">{newStudentName}</strong>
                    <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">{newStudentEmail}</span>
                    {newStudentPhone && <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">{newStudentPhone}</span>}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>

      {/* CONTAINER-AWARE STICKY ACTION BAR */}
      {(step === 'review' || (step === 'select' && (mode === 'new' || selectedStudentIds.length > 0))) && (
        <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-2 z-20 w-full bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-slate-200 dark:border-[#263244] p-3 sm:p-3.5 shadow-lg rounded-2xl transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {step === 'select' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  {mode === 'existing'
                    ? `${selectedStudentIds.length} ${selectedStudentIds.length === 1 ? 'student selected' : 'students selected'}`
                    : 'New Student Profile'}
                </span>
              </div>

              <Button
                type="button"
                onClick={handleProceedToReview}
                disabled={mode === 'existing' && selectedStudentIds.length === 0}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs h-10 px-5 w-full sm:w-auto cursor-pointer shadow-2xs"
              >
                Review Enrollment →
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('select')}
                  className="text-xs font-semibold h-10 px-3.5 border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-slate-700 dark:text-[#CBD5E1] cursor-pointer"
                >
                  ← Back to Selection
                </Button>
                <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] sm:hidden">
                  {selectedStudentIds.length} Selected
                </span>
              </div>

              <Button
                type="button"
                onClick={handleConfirmEnrollment}
                disabled={isSubmitting}
                leftIcon={<UserPlus className="w-4 h-4" />}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs h-10 px-5 w-full sm:w-auto cursor-pointer shadow-2xs"
              >
                {isSubmitting
                  ? 'Enrolling Students...'
                  : mode === 'existing'
                    ? `Enroll ${selectedStudentIds.length} ${selectedStudentIds.length === 1 ? 'Student' : 'Students'}`
                    : 'Enroll New Student'}
              </Button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};
