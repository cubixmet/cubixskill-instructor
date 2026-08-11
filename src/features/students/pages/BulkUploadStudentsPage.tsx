import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Users,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useStudentStore } from '../store/student.store';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';

export interface ParsedCsvRow {
  rowNumber: number;
  name: string;
  email: string;
  phone: string;
  status: 'valid' | 'invalid' | 'duplicate';
  errorMessage?: string;
}

export const BulkUploadStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid } = useParams<{ courseUuid?: string }>();

  const students = useStudentStore((state) => state.students);
  const addStudent = useStudentStore((state) => state.addStudent);
  const enrollStudentInCourse = useStudentStore((state) => state.enrollStudentInCourse);

  // Stepper State: 1 Template, 2 Upload, 3 Review, 4 Import
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'valid' | 'invalid' | 'duplicate'>('all');

  // Mock Parsed Rows
  const [parsedRows] = useState<ParsedCsvRow[]>([
    { rowNumber: 1, name: 'Sam Wilson', email: 'sam.wilson@example.com', phone: '+91 98111 22233', status: 'valid' },
    { rowNumber: 2, name: 'Aarav Patel', email: 'aarav.patel@gmail.com', phone: '+91 98765 43210', status: 'valid' },
    { rowNumber: 3, name: 'Dev Kumar', email: 'dev.k@example.com', phone: '+91 97222 33344', status: 'valid' },
    { rowNumber: 4, name: 'Neha Sharma', email: 'neha.s@domain.com', phone: '+91 99888 77665', status: 'valid' },
    { rowNumber: 5, name: 'Bad Format', email: 'invalid-email-format', phone: '123', status: 'invalid', errorMessage: 'Email is required and must be valid' },
    { rowNumber: 6, name: 'Priya Roy', email: 'priya.roy@tech.io', phone: '+91 91234 56789', status: 'duplicate', errorMessage: 'Duplicate student — skipped to prevent double enrollment' },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Valid / Invalid / Duplicate counts
  const validRows = useMemo(() => parsedRows.filter((r) => r.status === 'valid'), [parsedRows]);
  const invalidRows = useMemo(() => parsedRows.filter((r) => r.status === 'invalid'), [parsedRows]);
  const duplicateRows = useMemo(() => parsedRows.filter((r) => r.status === 'duplicate'), [parsedRows]);

  // Filtered Review List
  const filteredReviewRows = useMemo(() => {
    if (reviewFilter === 'valid') return validRows;
    if (reviewFilter === 'invalid') return invalidRows;
    if (reviewFilter === 'duplicate') return duplicateRows;
    return parsedRows;
  }, [parsedRows, validRows, invalidRows, duplicateRows, reviewFilter]);

  const backLink = courseUuid ? `/courses/${courseUuid}/students` : '/students';

  const handleDownloadTemplate = () => {
    const templateData = [
      { name: 'Rahul Kumar', email: 'rahul@example.com', phone: '+91 9876543210', studentId: 'STD-101' },
      { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 9876543211', studentId: 'STD-102' },
    ];
    const columns: CsvColumn<(typeof templateData)[0]>[] = [
      { header: 'Name', value: (r) => r.name },
      { header: 'Email', value: (r) => r.email },
      { header: 'Phone', value: (r) => r.phone },
      { header: 'Student ID', value: (r) => r.studentId },
    ];
    exportToCsv('cubixskill_students_upload_template.csv', templateData, columns);
    showToast('CSV template downloaded.');
    setCurrentStep(2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith('.csv') && !selected.name.endsWith('.xlsx')) {
        showToast('Unsupported file format. Please upload a .csv or .xlsx file.');
        return;
      }

      setFile(selected);
      setIsValidating(true);
      setTimeout(() => {
        setIsValidating(false);
        setCurrentStep(3);
        showToast('File validated successfully.');
      }, 1000);
    }
  };

  const handleConfirmImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      validRows.forEach((row) => {
        const existing = students.find((s) => s.email.toLowerCase() === row.email.toLowerCase());
        const studentUuid = existing ? existing.uuid : `std-${Date.now()}-${Math.random()}`;

        if (!existing) {
          addStudent({
            name: row.name,
            email: row.email,
            phone: row.phone,
            status: 'Active',
            enrollmentDate: new Date().toISOString().split('T')[0],
            coursesEnrolledCount: courseUuid ? 1 : 0,
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.name)}`,
            enrolledCourses: courseUuid
              ? [{ courseUuid, courseTitle: 'Fullstack Masterclass', enrolledAt: new Date().toISOString(), progressPercent: 0, status: 'Active' }]
              : [],
          });
        } else if (courseUuid) {
          enrollStudentInCourse(studentUuid, courseUuid, 'Fullstack Masterclass', 0);
        }
      });

      setIsImporting(false);
      showToast('Students imported successfully.');
      navigate(backLink);
    }, 1200);
  };

  const handleStepBack = () => {
    if (currentStep === 1) navigate(backLink);
    else if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  };

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
            onClick={handleStepBack}
            className="p-1.5 -ml-1 text-[#0F172A] hover:bg-slate-100 rounded-xl cursor-pointer transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-[#0F172A] tracking-tight">
              Bulk Upload Students
            </h1>
            <p className="text-[11px] text-[#64748B] font-medium mt-0.5 truncate">
              Upload multiple students to this course.
            </p>
          </div>
        </div>

        <Link to={backLink} className="shrink-0">
          <Button variant="outline" size="sm" className="text-xs font-semibold h-8 px-3">
            Cancel
          </Button>
        </Link>
      </div>

      {/* 2. COMPACT 4-STEP WIZARD BAR */}
      <div className="bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="grid grid-cols-4 gap-1 text-center">
          {[
            { num: 1, label: 'Template' },
            { num: 2, label: 'Upload' },
            { num: 3, label: 'Review' },
            { num: 4, label: 'Import' },
          ].map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;

            return (
              <div key={s.num} className="space-y-0.5">
                <div
                  className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`text-[10px] sm:text-xs block font-bold truncate ${
                    isActive ? 'text-[#2563EB]' : isDone ? 'text-emerald-700' : 'text-[#64748B]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: DOWNLOAD TEMPLATE */}
      {currentStep === 1 && (
        <Card className="space-y-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-xl shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-[#0F172A]">Download CSV/XLSX Template</h2>
              <p className="text-[11px] text-[#64748B] font-medium leading-normal">
                Required columns: <strong>Name</strong>, <strong>Email</strong>, <strong>Phone</strong>, <strong>Student ID</strong>.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <Button
              onClick={handleDownloadTemplate}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs h-10 px-4 w-full sm:w-auto"
            >
              Download Template
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="text-xs font-semibold h-10 px-4 w-full sm:w-auto"
            >
              Next: Upload File →
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: UPLOAD FILE */}
      {currentStep === 2 && (
        <Card className="space-y-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-xs sm:text-sm font-bold text-[#0F172A]">Upload File</h2>
            <p className="text-[11px] text-[#64748B] font-medium">Accepted formats: .csv, .xlsx (max 10MB)</p>
          </div>

          {file ? (
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileSpreadsheet className="w-5 h-5 text-[#2563EB] shrink-0" />
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#0F172A] block truncate">{file.name}</strong>
                  <span className="text-[10px] text-[#64748B] block">{Math.round(file.size / 1024)} KB</span>
                </div>
              </div>
              <label className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer shrink-0">
                Replace
                <input type="file" accept=".csv,.xlsx" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#2563EB]/40 bg-blue-50/20 hover:bg-blue-50/50 p-6 rounded-2xl text-center block cursor-pointer transition-colors space-y-2">
              <input type="file" accept=".csv,.xlsx" onChange={handleFileSelect} className="hidden" />
              <Upload className="w-7 h-7 text-[#2563EB] mx-auto" />
              <div className="space-y-0.5">
                <strong className="text-xs font-bold text-[#0F172A] block">Choose File</strong>
                <span className="text-[11px] text-[#64748B] block">Tap to select CSV or XLSX file</span>
              </div>
            </label>
          )}

          {isValidating && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
              <RefreshCw className="w-4 h-4 text-[#2563EB] animate-spin shrink-0" />
              <span>Validating file structure...</span>
            </div>
          )}
        </Card>
      )}

      {/* STEP 3 & STEP 4: REVIEW & IMPORT */}
      {currentStep >= 3 && (
        <div className="space-y-4">
          {/* COUNTS SUMMARY GRID */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5 shadow-2xs">
              <span className="text-[10px] text-[#64748B] block font-medium">Total Rows</span>
              <strong className="text-xs sm:text-sm font-bold text-[#0F172A]">{parsedRows.length}</strong>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5 shadow-2xs">
              <span className="text-[10px] text-[#64748B] block font-medium">Valid</span>
              <strong className="text-xs sm:text-sm font-bold text-emerald-600">{validRows.length}</strong>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5 shadow-2xs">
              <span className="text-[10px] text-[#64748B] block font-medium">Errors</span>
              <strong className="text-xs sm:text-sm font-bold text-rose-600">{invalidRows.length}</strong>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5 shadow-2xs">
              <span className="text-[10px] text-[#64748B] block font-medium">Duplicates</span>
              <strong className="text-xs sm:text-sm font-bold text-slate-700">{duplicateRows.length}</strong>
            </div>
          </div>

          {/* FILTER REVIEW TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: `All (${parsedRows.length})` },
              { id: 'valid', label: `Valid (${validRows.length})` },
              { id: 'invalid', label: `Errors (${invalidRows.length})` },
              { id: 'duplicate', label: `Duplicates (${duplicateRows.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReviewFilter(tab.id as 'all' | 'valid' | 'invalid' | 'duplicate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  reviewFilter === tab.id
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-white text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ROW REVIEW CARDS (MOBILE-FIRST) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-3.5 space-y-2.5">
            <h3 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Student Review ({filteredReviewRows.length})
            </h3>

            {/* MOBILE CARDS VIEW (<768px) */}
            <div className="md:hidden space-y-2">
              {filteredReviewRows.map((row) => (
                <div
                  key={row.rowNumber}
                  className={`p-3 rounded-xl border space-y-1 text-left ${
                    row.status === 'valid'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : row.status === 'invalid'
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold text-[#64748B]">Row #{row.rowNumber}</span>
                    <Badge
                      variant={row.status === 'valid' ? 'success' : row.status === 'invalid' ? 'warning' : 'secondary'}
                      size="sm"
                    >
                      {row.status}
                    </Badge>
                  </div>

                  <strong className="text-xs font-bold text-[#0F172A] block">{row.name}</strong>
                  <span className="text-[11px] font-medium text-[#64748B] block truncate">{row.email}</span>

                  {row.errorMessage && (
                    <div className="flex items-start gap-1 text-[11px] font-semibold text-rose-700 pt-1 border-t border-rose-100 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{row.errorMessage}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (>=768px) */}
            <div className="hidden md:block overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-medium text-[#0F172A]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase font-bold">
                    <th className="py-2.5 px-3">Row #</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviewRows.map((row) => (
                    <tr key={row.rowNumber} className="border-b border-[#E2E8F0] hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-[#64748B]">#{row.rowNumber}</td>
                      <td className="py-2.5 px-3 font-bold text-[#0F172A]">{row.name}</td>
                      <td className="py-2.5 px-3 text-[#64748B]">{row.email}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={row.status === 'valid' ? 'success' : row.status === 'invalid' ? 'warning' : 'secondary'}
                          size="sm"
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs font-medium text-rose-600">
                        {row.errorMessage || 'Ready for import'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTAINER-AWARE STICKY ACTION BAR */}
      {currentStep >= 3 && (
        <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-2 z-20 w-full bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-3 sm:p-3.5 shadow-lg rounded-2xl transition-all flex items-center justify-between gap-2.5">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(2)}
            className="text-xs font-semibold h-10 px-3.5 border-[#E2E8F0] cursor-pointer"
          >
            ← Back
          </Button>

          <Button
            onClick={handleConfirmImport}
            disabled={isImporting || validRows.length === 0}
            leftIcon={isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs h-10 px-5 flex-1 sm:flex-initial cursor-pointer shadow-2xs"
          >
            {isImporting ? 'Importing Students...' : `Import ${validRows.length} Students`}
          </Button>
        </div>
      )}
    </motion.div>
  );
};
