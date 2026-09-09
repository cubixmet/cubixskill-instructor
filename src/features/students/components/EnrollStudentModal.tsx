import React, { useState } from 'react';
import {
  Search,
  UserCheck,
  UserPlus,
  Check,
  CreditCard,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/forms/FormField';
import { TextInput } from '../../../components/forms/TextInput';
import { EmailInput } from '../../../components/forms/EmailInput';
import { PhoneInput } from '../../../components/forms/PhoneInput';
import { SearchableSelect } from '../../../components/forms/SearchableSelect';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useStudentStore } from '../store/student.store';
import { useCreditSummary } from '../../../hooks/useCreditSummary';
import { courseFeaturesService } from '../../../services/courseFeatures.service';
import type { StudentDetail } from '../types/student.types';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseUuid?: string;
  defaultCourseTitle?: string;
  onSuccess?: () => void;
}

const COUNTRIES = [
  { value: 'India', label: 'India', flag: '🇮🇳' },
  { value: 'United States', label: 'United States', flag: '🇺🇸' },
  { value: 'United Kingdom', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
  { value: 'UAE', label: 'United Arab Emirates', flag: '🇦🇪' },
  { value: 'Singapore', label: 'Singapore', flag: '🇸🇬' },
];

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  isOpen,
  onClose,
  defaultCourseUuid = '',
  defaultCourseTitle = 'Fullstack React 19 & TypeScript Masterclass',
  onSuccess,
}) => {
  const students = useStudentStore((state) => state.students);
  const addStudent = useStudentStore((state) => state.addStudent);
  const enrollStudentInCourse = useStudentStore((state) => state.enrollStudentInCourse);

  const [enrollMethod, setEnrollMethod] = useState<'existing' | 'new'>('existing');

  // Course state
  const [selectedCourseUuid] = useState(defaultCourseUuid);
  const [selectedCourseTitle] = useState(defaultCourseTitle);

  // Existing Student Selection state
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentUuid, setSelectedStudentUuid] = useState<string | null>(null);

  // New Student Form state & validation errors
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [newCountry, setNewCountry] = useState('India');
  const [newNotes] = useState('');

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Real Backend Credit Pricing state
  const [pricingInfo, setPricingInfo] = useState<{
    total_per_student_credits: number;
    per_student_features: Array<{ name: string; credit_rate: number }>;
  }>({ total_per_student_credits: 0, per_student_features: [] });
  const [isPricingLoading, setIsPricingLoading] = useState<boolean>(true);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const { applyCreditDebitResult } = useCreditSummary();

  React.useEffect(() => {
    if (!isOpen) return;
    setIsPricingLoading(true);
    courseFeaturesService
      .getPerStudentPricing(selectedCourseUuid)
      .then((res: any) => {
        setPricingInfo(res);
      })
      .finally(() => {
        setIsPricingLoading(false);
      });
  }, [isOpen, selectedCourseUuid]);

  if (!isOpen) return null;

  // Selected Student
  const selectedStudent = students.find((s) => s.uuid === selectedStudentUuid);

  // Duplicate Check for Existing Student
  const isAlreadyEnrolled = Boolean(
    selectedStudent?.enrolledCourses?.some((c) => c.courseUuid === selectedCourseUuid)
  );

  // Duplicate Detection for New Student Form
  const existingDuplicateByEmailOrPhone = students.find(
    (s) =>
      (newEmail && s.email.toLowerCase() === newEmail.trim().toLowerCase()) ||
      (newPhone && s.phone && s.phone.trim() === newPhone.trim())
  );

  // Field validation messages
  const nameError = nameTouched && !newName.trim() ? 'Full name is required (min 2 characters).' : undefined;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
  const emailError = emailTouched
    ? !newEmail.trim()
      ? 'Email address is required.'
      : !isEmailValid
      ? 'Enter a valid email address.'
      : undefined
    : undefined;

  // Filter existing students list
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.phone && s.phone.includes(studentSearch))
  );

  // Real Credit calculation
  const creditsRequired = pricingInfo.total_per_student_credits;

  const isFormValid =
    enrollMethod === 'existing'
      ? Boolean(selectedStudentUuid) && !isAlreadyEnrolled
      : Boolean(newName.trim()) && isEmailValid && !existingDuplicateByEmailOrPhone;

  const getDisabledReason = () => {
    if (enrollMethod === 'existing') {
      if (!selectedStudentUuid) return 'Select an existing student to continue.';
      if (isAlreadyEnrolled) return 'This student is already enrolled in this course.';
    } else {
      if (!newName.trim()) return 'Complete all required fields to continue.';
      if (!newEmail.trim() || !isEmailValid) return 'Enter a valid email address.';
      if (existingDuplicateByEmailOrPhone) return 'Resolve the existing student match before continuing.';
    }
    return '';
  };

  const handleSelectExistingStudent = (student: StudentDetail) => {
    setSelectedStudentUuid(student.uuid);
  };

  const handleStartEnrollmentProcess = () => {
    setNameTouched(true);
    setEmailTouched(true);
    if (!isFormValid) return;
    setIsConfirmModalOpen(true);
  };



  const handleExecuteEnrollment = () => {
    let studentToEnrollUuid = selectedStudentUuid;

    if (enrollMethod === 'new') {
      const created = addStudent({
        name: newName,
        email: newEmail,
        phone: `${countryCode} ${newPhone}`,
        countryCode: countryCode,
        country: newCountry,
        status: 'Active',
        notes: newNotes,
      });
      studentToEnrollUuid = created.uuid;
    }

    if (studentToEnrollUuid) {
      enrollStudentInCourse(
        studentToEnrollUuid,
        selectedCourseUuid,
        selectedCourseTitle,
        creditsRequired
      );
      if (creditsRequired > 0) {
        applyCreditDebitResult({ optimisticDebit: creditsRequired });
      }
    }

    setIsConfirmModalOpen(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Enroll Student to Course"
        subtitle="Select an existing student or create a new student and review the enrollment cost."
        maxWidth="lg"
      >
        <div className="space-y-5 text-left font-sans text-xs">
          {/* 1. ENROLLMENT METHOD SELECTOR CARDS */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--text-primary)] dark:text-[#F8FAFC]">
              How would you like to enroll a student?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Select Existing Student */}
              <button
                type="button"
                onClick={() => setEnrollMethod('existing')}
                className={`min-h-[76px] p-4 rounded-[14px] border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  enrollMethod === 'existing'
                    ? 'bg-[color-mix(in_srgb,var(--brand-primary)_10%,var(--surface-secondary))] dark:bg-[color-mix(in_srgb,var(--brand-primary)_15%,#172033)] border-[var(--brand-primary)] shadow-2xs'
                    : 'bg-[var(--surface-secondary)] dark:bg-[#172033] border-[var(--border)] dark:border-[#263244] hover:bg-[var(--surface-hover)] dark:hover:bg-[#1E293B] hover:border-[var(--brand-primary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      enrollMethod === 'existing'
                        ? 'bg-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)] text-[var(--brand-primary)]'
                        : 'bg-[var(--surface-elevated)] dark:bg-[#1E293B] text-[var(--text-muted)] dark:text-[#94A3B8]'
                    }`}
                  >
                    <UserCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <strong className="text-xs font-semibold text-[var(--text-primary)] dark:text-[#F8FAFC] block leading-tight">
                      Select Existing Student
                    </strong>
                    <span className="text-[11px] text-[var(--text-muted)] dark:text-[#94A3B8]">
                      Enroll student already registered
                    </span>
                  </div>
                </div>

                {enrollMethod === 'existing' && (
                  <div className="w-5 h-5 rounded-full bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Card 2: Create New Student */}
              <button
                type="button"
                onClick={() => setEnrollMethod('new')}
                className={`min-h-[76px] p-4 rounded-[14px] border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  enrollMethod === 'new'
                    ? 'bg-[color-mix(in_srgb,var(--brand-primary)_10%,var(--surface-secondary))] dark:bg-[color-mix(in_srgb,var(--brand-primary)_15%,#172033)] border-[var(--brand-primary)] shadow-2xs'
                    : 'bg-[var(--surface-secondary)] dark:bg-[#172033] border-[var(--border)] dark:border-[#263244] hover:bg-[var(--surface-hover)] dark:hover:bg-[#1E293B] hover:border-[var(--brand-primary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      enrollMethod === 'new'
                        ? 'bg-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)] text-[var(--brand-primary)]'
                        : 'bg-[var(--surface-elevated)] dark:bg-[#1E293B] text-[var(--text-muted)] dark:text-[#94A3B8]'
                    }`}
                  >
                    <UserPlus className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <strong className="text-xs font-semibold text-[var(--text-primary)] dark:text-[#F8FAFC] block leading-tight">
                      Create New Student
                    </strong>
                    <span className="text-[11px] text-[var(--text-muted)] dark:text-[#94A3B8]">
                      Register and enroll new student
                    </span>
                  </div>
                </div>

                {enrollMethod === 'new' && (
                  <div className="w-5 h-5 rounded-full bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* 2. MODE CONTENT */}
          {enrollMethod === 'existing' ? (
            <div className="space-y-3">
              <FormField label="Search Existing Student" helperText="Search by student name, email, or phone number.">
                <TextInput
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  leftIcon={<Search className="w-4 h-4 text-[var(--text-muted)] dark:text-[#94A3B8]" />}
                />
              </FormField>

              {/* Searchable Students List */}
              <div className="max-h-[280px] overflow-y-auto space-y-2 border border-[var(--border)] dark:border-[#263244] rounded-[14px] p-2 bg-[var(--surface-secondary)] dark:bg-[#172033] no-scrollbar">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-6 space-y-1">
                    <p className="text-[var(--text-primary)] dark:text-[#F8FAFC] text-xs font-semibold">No students found</p>
                    <p className="text-[var(--text-muted)] dark:text-[#94A3B8] text-[11px]">Try a different name, email, or phone number.</p>
                  </div>
                ) : (
                  filteredStudents.map((student) => {
                    const isSelected = selectedStudentUuid === student.uuid;
                    const enrolledCount = student.enrolledCourses?.length || 0;

                    return (
                      <div
                        key={student.uuid}
                        onClick={() => handleSelectExistingStudent(student)}
                        className={`p-3.5 rounded-[12px] border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[color-mix(in_srgb,var(--brand-primary)_8%,var(--surface))] dark:bg-[color-mix(in_srgb,var(--brand-primary)_12%,#111827)] border-[var(--brand-primary)] shadow-2xs'
                            : 'bg-[var(--surface)] dark:bg-[#111827] border-[var(--border)] dark:border-[#263244] hover:bg-[var(--surface-hover)] dark:hover:bg-[#1E293B] hover:border-[var(--brand-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[color-mix(in_srgb,var(--brand-primary)_14%,var(--surface-secondary))] dark:bg-[color-mix(in_srgb,var(--brand-primary)_20%,#172033)] text-[var(--brand-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <strong className="text-xs font-medium text-[var(--text-primary)] dark:text-[#F8FAFC] block truncate">
                              {student.name}
                            </strong>
                            <span className="text-[12px] text-[var(--text-muted)] dark:text-[#94A3B8] font-normal block truncate overflow-wrap-anywhere">
                              {student.email} • {student.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2.5 py-1 rounded-lg border text-[11px] font-medium bg-[var(--surface-secondary)] dark:bg-[#172033] border-[var(--border)] dark:border-[#263244] text-[var(--text-secondary)] dark:text-[#CBD5E1]">
                            {enrolledCount} {enrolledCount === 1 ? 'Course' : 'Courses'}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Already Enrolled Alert */}
              {isAlreadyEnrolled && (
                <FormAlert
                  variant="warning"
                  title="Already Enrolled"
                  description="This student is already enrolled in this course."
                />
              )}
            </div>
          ) : (
            /* CREATE NEW STUDENT FORM */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name" required error={nameError}>
                  <TextInput
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => setNameTouched(true)}
                    placeholder="e.g. Aarav Patel"
                    autoComplete="name"
                    error={Boolean(nameError)}
                  />
                </FormField>

                <FormField label="Email Address" required error={emailError}>
                  <EmailInput
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="student@example.com"
                    error={Boolean(emailError)}
                  />
                </FormField>

                <FormField label="Phone Number" helperText="Digits only. Country code stored separately.">
                  <PhoneInput
                    value={newPhone}
                    onChange={(val) => setNewPhone(val)}
                    countryCode={countryCode}
                    onCountryCodeChange={(code) => setCountryCode(code)}
                  />
                </FormField>

                <FormField label="Country">
                  <SearchableSelect
                    options={COUNTRIES}
                    value={newCountry}
                    onChange={(val) => setNewCountry(val)}
                  />
                </FormField>
              </div>

              {/* CLEAN STRUCTURED EXISTING STUDENT MATCH PANEL */}
              {existingDuplicateByEmailOrPhone && (
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-[14px] space-y-3">
                  <div className="space-y-0.5">
                    <strong className="text-xs font-semibold text-amber-900 dark:text-amber-300 block flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      Existing student found
                    </strong>
                    <span className="text-[11px] text-amber-800 dark:text-amber-400 block">
                      A student already uses the entered email or phone number.
                    </span>
                  </div>

                  {/* Compact Student Card */}
                  <div className="p-3.5 bg-[var(--surface)] dark:bg-[#111827] border border-[var(--border)] dark:border-[#263244] rounded-[12px] flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[color-mix(in_srgb,var(--brand-primary)_14%,var(--surface-secondary))] dark:bg-[color-mix(in_srgb,var(--brand-primary)_20%,#172033)] text-[var(--brand-primary)] flex items-center justify-center font-bold text-sm shrink-0">
                        {existingDuplicateByEmailOrPhone.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-semibold text-[var(--text-primary)] dark:text-[#F8FAFC] block truncate">
                          {existingDuplicateByEmailOrPhone.name}
                        </strong>
                        <span className="text-[11px] text-[var(--text-muted)] dark:text-[#94A3B8] block truncate">
                          {existingDuplicateByEmailOrPhone.email}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] dark:text-[#94A3B8] block">
                          {existingDuplicateByEmailOrPhone.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="secondary" size="sm">
                        {existingDuplicateByEmailOrPhone.enrolledCourses?.length || 1} Course
                      </Badge>
                      <Badge variant="success" size="sm" dot>Active</Badge>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEnrollMethod('existing');
                      setSelectedStudentUuid(existingDuplicateByEmailOrPhone.uuid);
                    }}
                    className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] text-xs font-semibold h-10 rounded-[12px] cursor-pointer transition-colors"
                  >
                    Select Existing Student
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. ENROLLMENT COST BREAKDOWN CARD */}
          <div className="p-4 bg-[var(--surface-secondary)] dark:bg-[#172033] border border-[var(--border)] dark:border-[#263244] rounded-[14px] space-y-2">
            <div className="flex items-center justify-between font-semibold text-xs text-[var(--text-primary)] dark:text-[#F8FAFC]">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[var(--brand-primary)]" /> Credit Usage
              </span>
              <strong className="text-[var(--brand-primary)]">
                {isPricingLoading ? 'Loading...' : `${creditsRequired} Credits / Student`}
              </strong>
            </div>

            {pricingInfo.per_student_features.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  {showBreakdown ? 'Hide Breakdown' : 'Show Feature Breakdown'}
                </button>

                {showBreakdown && (
                  <div className="mt-2 space-y-1.5 pt-2 border-t border-[var(--border)] dark:border-[#263244] text-[11px]">
                    {pricingInfo.per_student_features.map((f, idx) => (
                      <div key={idx} className="flex justify-between text-[var(--text-muted)] dark:text-[#94A3B8]">
                        <span>{f.name}</span>
                        <span className="font-semibold text-[var(--text-primary)] dark:text-[#F8FAFC]">{f.credit_rate} Credits</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 border-t border-[var(--border)] dark:border-[#263244] font-bold text-[var(--text-primary)] dark:text-[#F8FAFC]">
                      <span>Total</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{creditsRequired} Credits / Student</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS & EXPLANATION */}
          <div className="space-y-2 pt-3 border-t border-[var(--border)] dark:border-[#263244]">
            {!isFormValid && (
              <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg text-right flex items-center justify-end gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{getDisabledReason()}</span>
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-12 sm:h-10 px-4 text-xs font-semibold w-full sm:w-auto bg-[var(--surface-secondary)] dark:bg-[#172033] border border-[var(--border)] dark:border-[#263244] text-[var(--text-secondary)] dark:text-[#CBD5E1] hover:bg-[var(--surface-hover)] dark:hover:bg-[#1E293B] hover:text-[var(--text-primary)] dark:hover:text-white rounded-[12px] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartEnrollmentProcess}
                disabled={!isFormValid}
                className="h-12 sm:h-10 min-w-[170px] px-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-semibold text-xs w-full sm:w-auto rounded-[12px] cursor-pointer transition-colors disabled:bg-[var(--surface-secondary)] dark:disabled:bg-[#172033] disabled:border disabled:border-[var(--border)] dark:disabled:border-[#263244] disabled:text-[var(--text-muted)] dark:disabled:text-[#94A3B8] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Continue to Enrollment
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* CONFIRMATION DIALOG */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Course Enrollment">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="p-3.5 bg-[var(--surface-secondary)] dark:bg-[#172033] border border-[var(--border)] dark:border-[#263244] rounded-[12px] space-y-1">
            <strong className="text-xs font-bold text-[var(--text-primary)] dark:text-[#F8FAFC] block">
              Student: {enrollMethod === 'existing' ? selectedStudent?.name : newName}
            </strong>
            <span className="text-[11px] text-[var(--text-muted)] dark:text-[#94A3B8] block">Course: {selectedCourseTitle}</span>
          </div>

          <div className="p-3.5 bg-[var(--surface-secondary)] dark:bg-[#172033] border border-[var(--border)] dark:border-[#263244] rounded-[12px] space-y-1 text-[11px]">
            <div className="flex justify-between text-[var(--text-muted)] dark:text-[#94A3B8]">
              <span>Credits to Deduct:</span>
              <strong className="text-[var(--brand-primary)] font-bold">{creditsRequired} Credits</strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)] dark:border-[#263244]">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              className="h-10 px-4 text-xs font-semibold bg-[var(--surface-secondary)] dark:bg-[#172033] border border-[var(--border)] dark:border-[#263244] text-[var(--text-secondary)] dark:text-[#CBD5E1] hover:bg-[var(--surface-hover)] dark:hover:bg-[#1E293B] rounded-[12px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteEnrollment}
              className="h-10 px-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-foreground)] font-semibold text-xs rounded-[12px] cursor-pointer"
            >
              Confirm Enrollment
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
