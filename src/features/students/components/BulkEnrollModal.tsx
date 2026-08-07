import React, { useState, useMemo } from 'react';
import {
  Users,
  Upload,
  FileSpreadsheet,
  Check,
  Search,
  CreditCard,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useStudentStore } from '../store/student.store';
import type { StudentDetail } from '../types/student.types';

export interface BulkEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseUuid: string;
  courseTitle?: string;
  onSuccess?: () => void;
}

export type BulkEnrollMethod = 'existing' | 'csv' | 'paste';

export interface ParsedEmailResult {
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  status: 'valid_existing' | 'valid_new' | 'already_enrolled' | 'invalid' | 'duplicate';
  existingStudent?: StudentDetail;
}

export const BulkEnrollModal: React.FC<BulkEnrollModalProps> = ({
  isOpen,
  onClose,
  courseUuid,
  courseTitle = 'Fullstack React 19 & TypeScript Masterclass',
  onSuccess,
}) => {
  const students = useStudentStore((state) => state.students);
  const addStudent = useStudentStore((state) => state.addStudent);
  const enrollStudentInCourse = useStudentStore((state) => state.enrollStudentInCourse);

  const [step, setStep] = useState<'method' | 'review' | 'result'>('method');
  const [method, setMethod] = useState<BulkEnrollMethod>('existing');

  // Method 1: Existing Students Multi-select State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);

  // Method 2: Paste Emails State
  const [pastedText] = useState('');

  // Method 3: CSV File Mock State
  const [fileName, setFileName] = useState<string | null>(null);

  // Settings
  const [batch] = useState('Batch 2026-A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Processing Result
  const [resultSummary, setResultSummary] = useState<{
    enrolledCount: number;
    skippedCount: number;
    creditsDeducted: number;
  } | null>(null);

  // Filtered Students for Method 1
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.phone && s.phone.includes(studentSearch))
  );

  // Parse Method 2 & Method 3 entries into ParsedEmailResult[]
  const parsedEmailEntries = useMemo<ParsedEmailResult[]>(() => {
    let rawList: { email: string; name?: string; phone?: string }[] = [];

    if (method === 'paste') {
      const tokens = pastedText
        .split(/[\n,;\s]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const uniqueTokens = Array.from(new Set(tokens));
      rawList = uniqueTokens.map((email) => ({ email }));
    } else if (method === 'csv' && fileName) {
      // Mock CSV parsed rows
      rawList = [
        { email: 'sam.wilson@example.com', name: 'Sam Wilson', phone: '+91 98111 22233' },
        { email: 'aarav.patel@gmail.com', name: 'Aarav Patel', phone: '+91 98765 43210' },
        { email: 'invalid-email-format', name: 'Bad Format', phone: '123' },
        { email: 'dev.k@example.com', name: 'Dev Kumar', phone: '+91 97222 33344' },
      ];
    }

    const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    return rawList.map((item) => {
      if (!isEmailValid(item.email)) {
        return { email: item.email, status: 'invalid' };
      }

      const matchStudent = students.find((s) => s.email.toLowerCase() === item.email.toLowerCase());

      if (matchStudent) {
        const isEnrolled = matchStudent.enrolledCourses?.some((c) => c.courseUuid === courseUuid);
        if (isEnrolled) {
          return { email: item.email, name: matchStudent.name, status: 'already_enrolled', existingStudent: matchStudent };
        }
        return { email: item.email, name: matchStudent.name, status: 'valid_existing', existingStudent: matchStudent };
      }

      return { email: item.email, name: item.name || item.email.split('@')[0], status: 'valid_new' };
    });
  }, [method, pastedText, fileName, students, courseUuid]);

  // Derive valid students to enroll
  const validStudentsToEnroll = useMemo(() => {
    if (method === 'existing') {
      return selectedUuids.map((uuid) => students.find((s) => s.uuid === uuid)!).filter(Boolean);
    }
    return parsedEmailEntries.filter((e) => e.status === 'valid_existing' || e.status === 'valid_new');
  }, [method, selectedUuids, students, parsedEmailEntries]);

  // Credit calculation
  const creditsPerStudent = 17;
  const validCount = validStudentsToEnroll.length;
  const totalCreditsRequired = validCount * creditsPerStudent;
  const availableWalletBalance = 12450;
  const remainingWalletBalance = availableWalletBalance - totalCreditsRequired;

  const isCreditSufficient = remainingWalletBalance >= 0;
  const canProceedToReview = validCount > 0 && isCreditSufficient;

  if (!isOpen) return null;

  // Handlers for Method 1
  const handleToggleSelectAll = () => {
    const selectable = filteredStudents.filter(
      (s) => !s.enrolledCourses?.some((c) => c.courseUuid === courseUuid)
    );

    if (selectedUuids.length === selectable.length) {
      setSelectedUuids([]);
    } else {
      setSelectedUuids(selectable.map((s) => s.uuid));
    }
  };

  const handleToggleSelectStudent = (uuid: string) => {
    if (selectedUuids.includes(uuid)) {
      setSelectedUuids(selectedUuids.filter((id) => id !== uuid));
    } else {
      setSelectedUuids([...selectedUuids, uuid]);
    }
  };

  const handleConfirmBulkEnrollment = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      let enrolledCount = 0;

      if (method === 'existing') {
        (validStudentsToEnroll as StudentDetail[]).forEach((student) => {
          enrollStudentInCourse(student.uuid, courseUuid, courseTitle, creditsPerStudent);
          enrolledCount++;
        });
      } else {
        parsedEmailEntries.forEach((entry) => {
          if (entry.status === 'valid_existing' && entry.existingStudent) {
            enrollStudentInCourse(entry.existingStudent.uuid, courseUuid, courseTitle, creditsPerStudent);
            enrolledCount++;
          } else if (entry.status === 'valid_new') {
            const created = addStudent({
              name: entry.name || entry.email.split('@')[0],
              email: entry.email,
              phone: entry.phone || '+91 98000 00000',
              countryCode: '+91',
              country: 'India',
              status: 'Active',
              notes: batch ? `Batch: ${batch}. Registered via Bulk Enrollment.` : 'Registered via Bulk Enrollment.',
            });
            enrollStudentInCourse(created.uuid, courseUuid, courseTitle, creditsPerStudent);
            enrolledCount++;
          }
        });
      }

      setResultSummary({
        enrolledCount,
        skippedCount: method === 'existing' ? 0 : parsedEmailEntries.filter((e) => e.status === 'already_enrolled' || e.status === 'invalid').length,
        creditsDeducted: enrolledCount * creditsPerStudent,
      });

      setIsSubmitting(false);
      setStep('result');
      if (onSuccess) onSuccess();
    }, 600);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,full_name,email,phone,batch\nSam Wilson,sam@example.com,+91 9811122233,Batch 2026-A\nDev Kumar,dev@example.com,+91 9722233344,Batch 2026-A';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_bulk_enrollment_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'result' ? 'Bulk Enrollment Completed' : 'Bulk Enroll Students'}
      subtitle={step === 'result' ? 'Review the summary of enrolled students and deducted credits.' : 'Enroll multiple students at once using existing records, email lists, or CSV uploads.'}
      maxWidth="xl"
    >
      <div className="space-y-5 text-left font-sans text-xs">
        {step === 'method' && (
          <>
            {/* 1. METHOD SELECTOR CARDS */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#0F172A]">Choose Bulk Enrollment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('existing')}
                  className={`p-3.5 rounded-[14px] border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    method === 'existing' ? 'bg-blue-50/70 border-[#2563EB] shadow-2xs' : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <Users className={`w-5 h-5 shrink-0 ${method === 'existing' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                  <div>
                    <strong className="text-xs font-semibold text-[#0F172A] block leading-tight">Select Existing Students</strong>
                    <span className="text-[10px] text-[#64748B]">Multi-select registered students</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('csv')}
                  className={`p-3.5 rounded-[14px] border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    method === 'csv' ? 'bg-blue-50/70 border-[#2563EB] shadow-2xs' : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className={`w-5 h-5 shrink-0 ${method === 'csv' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                  <div>
                    <strong className="text-xs font-semibold text-[#0F172A] block leading-tight">Upload CSV/Excel File</strong>
                    <span className="text-[10px] text-[#64748B]">Import batch file data</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. METHOD METHOD-SPECIFIC UI */}
            {method === 'existing' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search students to enroll..."
                      className="w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={handleToggleSelectAll} className="h-9 text-xs">
                      {selectedUuids.length > 0 ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 border border-[#E2E8F0] rounded-[14px] p-2 bg-[#F8FAFC] no-scrollbar">
                  {filteredStudents.map((student) => {
                    const isEnrolled = student.enrolledCourses?.some((c) => c.courseUuid === courseUuid);
                    const isSelected = selectedUuids.includes(student.uuid);

                    return (
                      <div
                        key={student.uuid}
                        onClick={() => !isEnrolled && handleToggleSelectStudent(student.uuid)}
                        className={`p-3 rounded-[12px] border transition-all flex items-center justify-between gap-3 ${
                          isEnrolled
                            ? 'bg-slate-100 border-[#E2E8F0] opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-white border-[#2563EB] shadow-2xs cursor-pointer ring-2 ring-blue-100'
                            : 'bg-white border-[#E2E8F0] hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            disabled={isEnrolled}
                            checked={isSelected}
                            onChange={() => !isEnrolled && handleToggleSelectStudent(student.uuid)}
                            className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                          />
                          <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <strong className="text-xs font-semibold text-[#0F172A] block truncate">{student.name}</strong>
                            <span className="text-[11px] text-[#64748B] block truncate">{student.email} • {student.phone}</span>
                          </div>
                        </div>

                        {isEnrolled ? (
                          <Badge variant="secondary" size="sm">Already Enrolled</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">{student.status}</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {method === 'csv' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#0F172A]">Upload CSV / Excel File</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={handleDownloadSampleCSV}
                    className="h-8 text-[11px]"
                  >
                    Sample Template
                  </Button>
                </div>

                <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] bg-[#F8FAFC] rounded-[16px] p-6 text-center space-y-2 transition-colors">
                  <Upload className="w-8 h-8 text-[#2563EB] mx-auto" />
                  <div>
                    <strong className="text-xs font-semibold text-[#0F172A] block">
                      {fileName ? fileName : 'Choose CSV or XLSX File'}
                    </strong>
                    <span className="text-[11px] text-[#64748B]">Supported: .csv, .xls, .xlsx</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFileName('batch_students_august.csv')}
                    className="h-9 text-xs font-semibold bg-white"
                  >
                    {fileName ? 'Replace File' : 'Choose File'}
                  </Button>
                </div>
              </div>
            )}

            {/* 3. LIVE CREDIT CALCULATOR & BREAKDOWN */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] space-y-2.5">
              <div className="flex items-center justify-between font-semibold text-xs text-[#0F172A]">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#2563EB]" /> Bulk Credit Calculator
                </span>
                <strong className="text-[#2563EB] text-sm">{totalCreditsRequired.toLocaleString()} Credits</strong>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1 text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] block">Valid Students</span>
                  <strong className="text-[#0F172A] font-bold text-xs">{validCount}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] block">Per Student</span>
                  <strong className="text-[#2563EB] font-bold text-xs">17 Credits</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] block">Available Wallet</span>
                  <strong className="text-[#0F172A] font-bold text-xs">12,450</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] block">Remaining</span>
                  <strong className={remainingWalletBalance >= 0 ? 'text-emerald-600 font-bold text-xs' : 'text-rose-600 font-bold text-xs'}>
                    {remainingWalletBalance.toLocaleString()}
                  </strong>
                </div>
              </div>

              {!isCreditSufficient && (
                <FormAlert
                  variant="error"
                  title="Insufficient Credit Balance"
                  description={`You need ${Math.abs(remainingWalletBalance).toLocaleString()} more credits to complete this enrollment.`}
                />
              )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <Button variant="outline" onClick={onClose} className="h-10 text-xs font-semibold">
                Cancel
              </Button>
              <Button
                onClick={() => setStep('review')}
                disabled={!canProceedToReview}
                className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs"
              >
                Review & Confirm ({validCount})
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: REVIEW */}
        {step === 'review' && (
          <div className="space-y-4">
            <FormAlert
              variant="info"
              title="Bulk Enrollment Summary"
              description={`Reviewing ${validCount} valid student ${validCount === 1 ? 'record' : 'records'} for course enrollment.`}
            />

            <div className="max-h-60 overflow-y-auto border border-[#E2E8F0] rounded-[14px] p-2 bg-[#F8FAFC] space-y-2 no-scrollbar">
              {validStudentsToEnroll.map((item: { name?: string; email: string }, idx) => (
                <div key={idx} className="p-3 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {(item.name || item.email).charAt(0)}
                    </div>
                    <div>
                      <strong className="text-xs font-semibold text-[#0F172A] block">{item.name || item.email}</strong>
                      <span className="text-[11px] text-[#64748B]">{item.email}</span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Ready (17 Credits)</Badge>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs font-semibold">
              <span>Total Credit Deduction:</span>
              <strong className="text-[#2563EB] text-sm">{totalCreditsRequired.toLocaleString()} Credits</strong>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <Button variant="outline" onClick={() => setStep('method')} className="h-10 text-xs font-semibold">
                Back
              </Button>
              <Button
                onClick={handleConfirmBulkEnrollment}
                disabled={isSubmitting}
                className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs"
              >
                {isSubmitting ? 'Enrolling Students...' : `Confirm & Enroll ${validCount} Students`}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 'result' && resultSummary && (
          <div className="space-y-5 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">Bulk Enrollment Successfully Completed</h3>
              <p className="text-xs text-[#64748B]">All selected students have been enrolled in this course.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
              <div>
                <span className="text-[11px] text-[#64748B] block">Enrolled</span>
                <strong className="text-base font-bold text-emerald-600">{resultSummary.enrolledCount}</strong>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block">Skipped</span>
                <strong className="text-base font-bold text-[#64748B]">{resultSummary.skippedCount}</strong>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block">Credits Deducted</span>
                <strong className="text-base font-bold text-[#2563EB]">{resultSummary.creditsDeducted}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-center">
              <Button onClick={onClose} className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs px-8">
                Close & View Students
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
