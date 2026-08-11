import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  UserPlus,
  Check,
  Search,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useStudentStore } from '../store/student.store';
import { useCourseStore } from '../../courses/store/course.store';

export const EnrollStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, studentUuid: routeStudentUuid } = useParams<{ courseUuid?: string; studentUuid?: string }>();
  const [searchParams] = useSearchParams();
  const queryStudentUuid = searchParams.get('studentUuid');

  const studentUuid = routeStudentUuid || queryStudentUuid || undefined;

  const students = useStudentStore((state) => state.students);
  const addStudent = useStudentStore((state) => state.addStudent);
  const enrollStudentInCourse = useStudentStore((state) => state.enrollStudentInCourse);
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);
  const courses = useMemo(() => Object.values(coursesByUuid), [coursesByUuid]);

  // Target single student if studentUuid is passed
  const singleStudent = useMemo(() => {
    if (!studentUuid) return null;
    return students.find((s) => s.uuid === studentUuid) || {
      uuid: studentUuid,
      name: 'Aarav Patel',
      email: 'aarav.patel@gmail.com',
      status: 'Active' as const,
      enrolledCourses: [],
    };
  }, [students, studentUuid]);

  // Step state: 'select' | 'review'
  const [step, setStep] = useState<'select' | 'review'>('select');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');

  const defaultCourseUuid = courseUuid || courses[0]?.uuid || '550e8400-e29b-41d4-a716-446655440000';
  const [selectedCourseUuid, setSelectedCourseUuid] = useState<string>(defaultCourseUuid);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'enrolled'>('all');

  // Multi-selection state
  const [selectedStudentUuids, setSelectedStudentUuids] = useState<string[]>(
    studentUuid ? [studentUuid] : []
  );

  // New Student Fields State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [accessExpiryDate, setAccessExpiryDate] = useState('2027-12-31');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const targetCourse = useMemo(
    () => courses.find((c) => c.uuid === selectedCourseUuid) || courses[0],
    [courses, selectedCourseUuid]
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const backLink = studentUuid
    ? `/students/${studentUuid}`
    : courseUuid
    ? `/courses/${courseUuid}/students`
    : '/students';

  // Helper to check if a student is already enrolled in selected course
  const isAlreadyEnrolled = useCallback(
    (stUuid: string, crsUuid: string = selectedCourseUuid) => {
      const student = students.find((s) => s.uuid === stUuid);
      if (!student || !student.enrolledCourses) return false;
      return student.enrolledCourses.some((c) => c.courseUuid === crsUuid);
    },
    [students, selectedCourseUuid]
  );

  // Filtered courses for single student view
  const filteredCourses = useMemo(() => {
    return courses.filter((c) =>
      c.title.toLowerCase().includes(courseSearchQuery.toLowerCase())
    );
  }, [courses, courseSearchQuery]);

  // Single student submission handler
  const handleSingleStudentEnroll = (courseToEnrollUuid: string) => {
    if (!singleStudent) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const chosenCourse = courses.find((c) => c.uuid === courseToEnrollUuid) || targetCourse;
    const courseTitle = chosenCourse ? chosenCourse.title : 'Course';

    try {
      enrollStudentInCourse(singleStudent.uuid, courseToEnrollUuid, courseTitle, 0);
      showToast(`${singleStudent.name} enrolled in ${courseTitle} successfully.`);
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(backLink);
      }, 500);
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Unable to enroll student. Please try again.');
    }
  };

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.uuid && s.uuid.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const enrolled = isAlreadyEnrolled(s.uuid);
      if (statusFilter === 'available') return !enrolled;
      if (statusFilter === 'enrolled') return enrolled;
      return true;
    });
  }, [students, searchQuery, statusFilter, isAlreadyEnrolled]);

  // Available students in current filtered view
  const availableFilteredStudents = useMemo(
    () => filteredStudents.filter((s) => !isAlreadyEnrolled(s.uuid)),
    [filteredStudents, isAlreadyEnrolled]
  );

  const isAllAvailableSelected =
    availableFilteredStudents.length > 0 &&
    availableFilteredStudents.every((s) => selectedStudentUuids.includes(s.uuid));

  const handleToggleSelectAll = () => {
    if (isAllAvailableSelected) {
      const availableUuids = availableFilteredStudents.map((s) => s.uuid);
      setSelectedStudentUuids((prev) => prev.filter((id) => !availableUuids.includes(id)));
    } else {
      const availableUuids = availableFilteredStudents.map((s) => s.uuid);
      setSelectedStudentUuids((prev) => Array.from(new Set([...prev, ...availableUuids])));
    }
  };

  const handleToggleStudent = (uuid: string) => {
    if (isAlreadyEnrolled(uuid)) return;
    setSelectedStudentUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    );
  };

  const handleRemoveFromReview = (uuid: string) => {
    setSelectedStudentUuids((prev) => prev.filter((id) => id !== uuid));
  };

  const handleProceedToReview = () => {
    if (mode === 'existing') {
      if (selectedStudentUuids.length === 0) {
        setErrorMsg('Please select at least one student to enroll.');
        return;
      }
    } else {
      if (!newStudentName.trim() || !newStudentEmail.trim()) {
        setErrorMsg('Student name and email are required.');
        return;
      }
    }
    setErrorMsg(null);
    setStep('review');
  };

  const handleConfirmEnrollment = () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      const courseTitle = targetCourse ? targetCourse.title : 'Fullstack Masterclass';

      if (mode === 'existing') {
        let enrolledCount = 0;
        selectedStudentUuids.forEach((uuid) => {
          if (!isAlreadyEnrolled(uuid)) {
            enrollStudentInCourse(uuid, selectedCourseUuid, courseTitle, 0);
            enrolledCount++;
          }
        });
        showToast(`${enrolledCount} ${enrolledCount === 1 ? 'student' : 'students'} enrolled successfully.`);
      } else {
        addStudent({
          name: newStudentName,
          email: newStudentEmail,
          phone: newStudentPhone,
          status: 'Active',
          enrollmentDate: new Date().toISOString().split('T')[0],
          coursesEnrolledCount: 1,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newStudentName)}`,
          enrolledCourses: [
            {
              courseUuid: selectedCourseUuid,
              courseTitle,
              enrolledAt: new Date().toISOString(),
              progressPercent: 0,
              status: 'Active',
            },
          ],
        });
        showToast(`Student ${newStudentName} created and enrolled successfully.`);
      }

      setIsSubmitting(false);
      navigate(backLink);
    }, 1000);
  };

  const selectedStudentDetails = useMemo(() => {
    return students.filter((s) => selectedStudentUuids.includes(s.uuid));
  }, [students, selectedStudentUuids]);

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
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (step === 'review') setStep('select');
              else navigate(backLink);
            }}
            className="p-1.5 -ml-1 text-[#0F172A] hover:bg-slate-100 rounded-xl cursor-pointer transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-[#0F172A] tracking-tight">
              {singleStudent ? 'Enroll in Course' : step === 'select' ? 'Enroll Students' : 'Review Enrollment'}
            </h1>
            <p className="text-[11px] text-[#64748B] font-medium mt-0.5 truncate">
              {singleStudent
                ? `Select a course to enroll ${singleStudent.name}`
                : step === 'select'
                ? 'Select students to enroll in this course.'
                : `Enrolling into ${targetCourse?.title || 'Course'}`}
            </p>
          </div>
        </div>

        <Link to={backLink} className="shrink-0">
          <Button variant="outline" size="sm" className="text-xs font-semibold h-8 px-3">
            Cancel
          </Button>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* SINGLE STUDENT ENROLLMENT FLOW */}
      {singleStudent ? (
        <div className="space-y-4">
          {/* STUDENT IDENTITY BANNER */}
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {singleStudent.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <strong className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">{singleStudent.name}</strong>
                  <Badge variant={singleStudent.status === 'Active' ? 'success' : 'secondary'} size="sm">
                    {singleStudent.status}
                  </Badge>
                </div>
                <span className="text-[11px] font-medium text-[#64748B] block truncate">
                  Student ID: STU-1024 • {singleStudent.email}
                </span>
              </div>
            </div>
          </div>

          {/* COURSE SEARCH & AVAILABLE COURSES LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-[#0F172A]">Available Courses ({filteredCourses.length})</h3>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <Input
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
                placeholder="Search courses by title..."
                className="pl-10 h-10 text-xs font-medium bg-white"
              />
            </div>

            {filteredCourses.length === 0 ? (
              <Card padding="md" className="bg-white p-6 text-center border border-[#E2E8F0] rounded-2xl text-xs text-[#64748B]">
                No courses match your search.
              </Card>
            ) : (
              <div className="space-y-2.5">
                {filteredCourses.map((crs) => {
                  const enrolled = isAlreadyEnrolled(singleStudent.uuid, crs.uuid);
                  const isSelected = selectedCourseUuid === crs.uuid;

                  return (
                    <div
                      key={crs.uuid}
                      onClick={() => {
                        if (!enrolled) setSelectedCourseUuid(crs.uuid);
                      }}
                      className={`p-4 rounded-2xl border transition-all ${
                        enrolled
                          ? 'bg-slate-50 border-slate-200 opacity-75 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-50/80 border-[#2563EB] shadow-2xs cursor-pointer'
                          : 'bg-white border-[#E2E8F0] hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            enrolled ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-[#2563EB]'
                          }`}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <strong className="text-xs sm:text-sm font-bold text-[#0F172A] block leading-snug break-words">
                              {crs.title}
                            </strong>
                            <span className="text-[11px] text-[#64748B] block">
                              17 Credits • Certificate Included
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {enrolled ? (
                            <Badge variant="secondary" size="sm">
                              Already Enrolled
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              disabled={isSubmitting}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSingleStudentEnroll(crs.uuid);
                              }}
                              className={`text-xs font-semibold h-8 px-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#2563EB] hover:bg-blue-700 text-white'
                                  : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50'
                              }`}
                            >
                              {isSubmitting && isSelected ? 'Enrolling...' : 'Enroll Student'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* COURSE CONTEXT BADGE */}
      {step === 'select' && (
        <div className="space-y-4">
          {/* MODE TOGGLE */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'existing' ? 'bg-white text-[#2563EB] shadow-2xs' : 'text-[#64748B]'
              }`}
            >
              Select Existing Students
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'new' ? 'bg-white text-[#2563EB] shadow-2xs' : 'text-[#64748B]'
              }`}
            >
              + Create New Student
            </button>
          </div>

          {mode === 'existing' ? (
            <div className="space-y-3.5">
              {/* SEARCH BAR */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name, email, or ID..."
                  className="pl-10 h-10 text-xs font-medium bg-white"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        statusFilter === filter.id
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'bg-white text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
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
                      className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      {isAllAvailableSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                  {selectedStudentUuids.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStudentUuids([])}
                      className="text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* STUDENT LIST CARDS */}
              {filteredStudents.length === 0 ? (
                <Card className="bg-white p-8 text-center border border-[#E2E8F0] rounded-2xl shadow-2xs space-y-2">
                  <p className="text-xs font-semibold text-[#64748B]">
                    {searchQuery ? 'No students match your search.' : 'No students found.'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-semibold h-8 px-3"
                    >
                      Clear Search
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => {
                    const enrolled = isAlreadyEnrolled(student.uuid);
                    const isSelected = selectedStudentUuids.includes(student.uuid);

                    return (
                      <div
                        key={student.uuid}
                        onClick={() => handleToggleStudent(student.uuid)}
                        className={`p-3 rounded-2xl border transition-all ${
                          enrolled
                            ? 'bg-slate-50 border-slate-200 opacity-75 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-50/80 border-[#2563EB] shadow-2xs cursor-pointer'
                            : 'bg-white border-[#E2E8F0] hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={enrolled}
                              onChange={() => {}}
                              aria-label={`Select ${student.name}`}
                              className="w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                            />

                            {/* Avatar Initials */}
                            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {student.name.charAt(0)}
                            </div>

                            {/* Student Details */}
                            <div className="min-w-0">
                              <strong className="text-xs font-bold text-[#0F172A] block truncate">{student.name}</strong>
                              <span className="text-[11px] font-medium text-[#64748B] block truncate">{student.email}</span>
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
            <Card className="space-y-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-2xs">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Full Name *</label>
                <Input
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="h-10 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">Email Address *</label>
                  <Input
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">Phone Number</label>
                  <Input
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-10 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Access Expiry Date</label>
                <Input
                  type="date"
                  value={accessExpiryDate}
                  onChange={(e) => setAccessExpiryDate(e.target.value)}
                  className="h-10 text-xs font-medium"
                />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* STEP 2: REVIEW STEP */}
      {step === 'review' && (
        <Card className="space-y-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="border-b border-[#E2E8F0] pb-3 space-y-1">
            <h2 className="text-sm font-bold text-[#0F172A]">Review Enrollment Summary</h2>
            <p className="text-[11px] text-[#64748B] font-medium">
              Target Course: <strong>{targetCourse?.title}</strong>
            </p>
          </div>

          {mode === 'existing' ? (
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#0F172A] block">
                Selected Students ({selectedStudentDetails.length})
              </span>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {selectedStudentDetails.map((student) => (
                  <div
                    key={student.uuid}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-bold text-[#0F172A] block truncate">{student.name}</strong>
                        <span className="text-[11px] font-medium text-[#64748B] block truncate">{student.email}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromReview(student.uuid)}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <strong className="text-xs font-bold text-[#0F172A] block">{newStudentName}</strong>
              <span className="text-[11px] text-[#64748B] block">{newStudentEmail}</span>
              {newStudentPhone && <span className="text-[11px] text-[#64748B] block">{newStudentPhone}</span>}
            </div>
          )}
        </Card>
      )}
        </>
      )}

      {/* CONTAINER-AWARE STICKY ACTION BAR */}
      {(step === 'review' || (step === 'select' && (mode === 'new' || selectedStudentUuids.length > 0))) && (
        <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-2 z-20 w-full bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-3 sm:p-3.5 shadow-lg rounded-2xl transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {step === 'select' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <span className="text-xs sm:text-sm font-bold text-[#0F172A]">
                  {mode === 'existing'
                    ? `${selectedStudentUuids.length} ${selectedStudentUuids.length === 1 ? 'student selected' : 'students selected'}`
                    : 'New Student Profile'}
                </span>
              </div>

              <Button
                type="button"
                onClick={handleProceedToReview}
                disabled={mode === 'existing' && selectedStudentUuids.length === 0}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs h-10 px-5 w-full sm:w-auto cursor-pointer shadow-2xs"
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
                  className="text-xs font-semibold h-10 px-3.5 border-[#E2E8F0] cursor-pointer"
                >
                  ← Back to Selection
                </Button>
                <span className="text-xs font-bold text-[#64748B] sm:hidden">
                  {selectedStudentUuids.length} Selected
                </span>
              </div>

              <Button
                type="button"
                onClick={handleConfirmEnrollment}
                disabled={isSubmitting}
                leftIcon={<UserPlus className="w-4 h-4" />}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs h-10 px-5 w-full sm:w-auto cursor-pointer shadow-2xs"
              >
                {isSubmitting
                  ? 'Enrolling Students...'
                  : mode === 'existing'
                  ? `Enroll ${selectedStudentUuids.length} ${selectedStudentUuids.length === 1 ? 'Student' : 'Students'}`
                  : 'Enroll New Student'}
              </Button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};
