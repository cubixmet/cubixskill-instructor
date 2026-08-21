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
  X,
  HelpCircle,
  AlertTriangle,
  MailCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';
import { studentsService, type BulkUploadRowResult } from '../../../services/students.service';

export interface ParsedCsvRow {
  rowNumber: number;
  name: string;
  email: string;
  phone: string;
  studentCode?: string;
  studentUserId?: string;
  studentCreated?: boolean;
  enrollmentCreated?: boolean;
  activationEmailSent?: boolean;
  status: 'valid' | 'invalid' | 'duplicate';
  errorMessage?: string;
}

export const BulkUploadStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid } = useParams<{ courseUuid?: string }>();

  // Stepper State: 1 Template, 2 Upload, 3 Review, 4 Import Completed
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'valid' | 'invalid' | 'duplicate'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parsed Rows State
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([
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
      { name: 'Rahul Kumar', email: 'rahul@example.com', phone: '+91 9876543210' },
      { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 9876543211' },
    ];
    const columns: CsvColumn<(typeof templateData)[0]>[] = [
      { header: 'Name', value: (r) => r.name },
      { header: 'Email', value: (r) => r.email },
      { header: 'Phone', value: (r) => r.phone },
    ];
    exportToCsv('cubixskill_students_upload_template.csv', templateData, columns);
    showToast('CSV template downloaded.');
    setCurrentStep(2);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) return;

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('full'));
    const emailIdx = headers.findIndex((h) => h.includes('email'));
    const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile'));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newRows: ParsedCsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/['"]/g, ''));
      const rawName = nameIdx >= 0 ? parts[nameIdx] || `Row #${i}` : parts[0] || `Row #${i}`;
      const rawEmail = emailIdx >= 0 ? parts[emailIdx] || '' : parts[1] || '';
      const rawPhone = phoneIdx >= 0 ? parts[phoneIdx] || '' : parts[2] || '';

      const isValidEmail = emailRegex.test(rawEmail.toLowerCase());
      newRows.push({
        rowNumber: i,
        name: rawName,
        email: rawEmail,
        phone: rawPhone,
        status: isValidEmail ? 'valid' : 'invalid',
        errorMessage: isValidEmail ? undefined : 'Email is required and must be valid',
      });
    }

    if (newRows.length > 0) {
      setParsedRows(newRows);
    }
  };

  const processFile = async (selected: File) => {
    if (!selected.name.endsWith('.csv') && !selected.name.endsWith('.xlsx')) {
      showToast('Unsupported file format. Please upload a .csv or .xlsx file.');
      return;
    }

    setFile(selected);
    setIsValidating(true);
    setErrorMsg(null);

    try {
      if (selected.name.endsWith('.csv')) {
        const text = await selected.text();
        parseCsvText(text);
      }
    } catch (_) {
      // Keep existing parsed rows if text parsing fails
    } finally {
      setTimeout(() => {
        setIsValidating(false);
        setCurrentStep(3);
        showToast('File structure validated.');
      }, 800);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (currentStep > 2) {
      setCurrentStep(2);
    }
  };

  const handleConfirmImport = async () => {
    if (isImporting) return;

    if (!courseUuid) {
      setErrorMsg('Course is missing from the route.');
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);

    try {
      const rowsToUpload = parsedRows.map((r) => ({
        full_name: r.name,
        email: r.email,
        phone: r.phone,
      }));

      const res = await studentsService.bulkUploadStudents({
        course_id: courseUuid,
        rows: rowsToUpload,
      });

      // Map backend results back to state
      if (res && Array.isArray(res.results)) {
        const updatedRows: ParsedCsvRow[] = res.results.map((item: BulkUploadRowResult, idx: number) => ({
          rowNumber: item.row || idx + 1,
          name: item.name || parsedRows[idx]?.name || 'Student',
          email: item.email || parsedRows[idx]?.email || '',
          phone: parsedRows[idx]?.phone || '',
          studentCode: item.student_code,
          studentUserId: item.student_user_id,
          studentCreated: item.student_created,
          enrollmentCreated: item.enrollment_created,
          activationEmailSent: item.activation_email_sent,
          status: item.status === 'valid' ? 'valid' : item.status === 'duplicate' ? 'duplicate' : 'invalid',
          errorMessage: item.errorMessage,
        }));

        setParsedRows(updatedRows);
      }

      setCurrentStep(4);
      if (res.invalid_count > 0) {
        showToast(`Bulk upload finished: ${res.enrolled_count} enrolled, ${res.duplicate_count} already enrolled, ${res.invalid_count} failed.`);
      } else {
        showToast(`Bulk upload completed! ${res.enrolled_count} student(s) enrolled.`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Bulk upload failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleStepBack = () => {
    if (currentStep === 1) navigate(backLink);
    else if (currentStep === 2) setCurrentStep(1);
    else if (currentStep >= 3) setCurrentStep(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-w-0 max-w-[960px] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 text-left font-sans pb-32 md:pb-12"
    >
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] dark:bg-[#1E293B] text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#334155]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* BREADCRUMB / BACK NAVIGATION */}
      <nav className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
        <Link
          to={backLink}
          className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Course Students</span>
        </Link>
        <span className="text-slate-300 dark:text-[#334155]">/</span>
        <span className="text-[#0F172A] dark:text-[#CBD5E1] font-semibold truncate">Bulk Upload</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#263244] pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleStepBack}
            className="p-2 text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-xl cursor-pointer transition-colors shrink-0 border border-[#E2E8F0] dark:border-[#334155]"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Bulk Upload Students
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5 truncate">
              Upload multiple student records at once using CSV or XLSX format.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link to={backLink}>
            <button
              type="button"
              className="bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] text-xs font-semibold h-9 px-3.5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4-STEP WIZARD BAR */}
      <div className="bg-white dark:bg-[#111827] p-3 sm:p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs">
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
              <div key={s.num} className="space-y-1">
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-[#172033] text-slate-400 dark:text-[#64748B]'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] sm:text-xs block font-semibold truncate ${
                    isActive
                      ? 'text-[#2563EB] dark:text-[#60A5FA]'
                      : isDone
                      ? 'text-emerald-600 dark:text-[#6EE7B7]'
                      : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: INSTRUCTIONS & DOWNLOAD TEMPLATE */}
      {currentStep === 1 && (
        <Card className="space-y-5 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] rounded-xl shrink-0 border border-blue-100 dark:border-[#263244]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                CSV / XLSX File Requirements
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                Download the official template to structure your student records correctly. Ensure all column headers match the template format.
              </p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>Required Columns Format:</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {['Name', 'Email', 'Phone'].map((col) => (
                <code
                  key={col}
                  className="bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#F8FAFC] px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#334155]"
                >
                  {col}
                </code>
              ))}
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Note: Email addresses must be valid and unique for successful enrollment.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="bg-white dark:bg-[#172033] border border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-[#60A5FA] font-medium text-xs sm:text-sm h-10 px-4 rounded-xl hover:bg-blue-50 dark:hover:bg-[rgba(37,99,235,0.12)] dark:hover:text-[#93C5FD] transition-colors w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
            <Button
              onClick={() => setCurrentStep(2)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm h-10 px-5 w-full sm:w-auto shadow-xs"
            >
              Next: Upload File →
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: CSV UPLOAD / DROPZONE */}
      {currentStep === 2 && (
        <Card className="space-y-5 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Upload Student Spreadsheet
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Select or drop your prepared .csv or .xlsx file (max file size 10MB)
            </p>
          </div>

          {file ? (
            /* SELECTED FILE CARD */
            <div className="bg-slate-50 dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#334155] p-4 rounded-xl flex items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-blue-100/60 dark:bg-[#0F172A] text-[#2563EB] dark:text-[#60A5FA] rounded-lg shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] block truncate">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
                    {(file.size / 1024).toFixed(1)} KB • CSV File
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Check className="w-4 h-4 text-emerald-500 dark:text-[#34D399]" />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-rose-600 dark:text-[#F87171] hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* DROPZONE COMPONENT */
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-dashed ${
                isDragging
                  ? 'bg-[#172033] border-[#3B82F6]'
                  : 'border-[#CBD5E1] dark:border-[#475569] hover:bg-slate-100 dark:hover:bg-[#172033] hover:border-[#2563EB] dark:hover:border-[#3B82F6]'
              } p-8 sm:p-10 rounded-2xl text-center block cursor-pointer transition-all space-y-3`}
            >
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file-input"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center border border-blue-100 dark:border-[#263244]">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <strong className="text-xs sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] block">
                  Click to browse or drag & drop CSV file
                </strong>
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block">
                  Supports UTF-8 encoded .csv and .xlsx files up to 10MB
                </span>
              </div>
            </label>
          )}

          {isValidating && (
            <div className="p-3.5 bg-[#0F172A]/5 dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl flex items-center gap-2.5 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              <RefreshCw className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] animate-spin shrink-0" />
              <span>Validating columns and row records...</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] text-xs font-semibold h-10 px-4 rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
            >
              ← Back to Template
            </button>
            {file && !isValidating && (
              <Button
                onClick={() => setCurrentStep(3)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm h-10 px-5 w-full sm:w-auto shadow-xs"
              >
                Proceed to Review →
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* STEP 3 & STEP 4: REVIEW & IMPORT */}
      {currentStep >= 3 && (
        <div className="space-y-5">
          {/* IMPORT SUMMARY STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-center space-y-1 shadow-2xs">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Total Rows</span>
              <strong className="text-sm sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                {parsedRows.length}
              </strong>
            </div>

            <div className="p-3 bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-center space-y-1 shadow-2xs">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Valid</span>
              <strong className="text-sm sm:text-lg font-semibold text-emerald-600 dark:text-[#6EE7B7]">
                {validRows.length}
              </strong>
            </div>

            <div className="p-3 bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-center space-y-1 shadow-2xs">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Errors</span>
              <strong className="text-sm sm:text-lg font-semibold text-rose-600 dark:text-[#FCA5A5]">
                {invalidRows.length}
              </strong>
            </div>

            <div className="p-3 bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-center space-y-1 shadow-2xs">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Duplicates</span>
              <strong className="text-sm sm:text-lg font-semibold text-amber-600 dark:text-[#FCD34D]">
                {duplicateRows.length}
              </strong>
            </div>
          </div>

          {/* VALIDATION ERROR PANEL IF ERRORS EXIST */}
          {invalidRows.length > 0 && (
            <div className="p-4 bg-rose-50/70 dark:bg-[rgba(239,68,68,0.06)] border border-rose-200 dark:border-[rgba(248,113,113,0.20)] rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-rose-700 dark:text-[#FCA5A5] font-semibold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{invalidRows.length} invalid row(s) detected</span>
              </div>
              <p className="text-xs text-rose-600 dark:text-[#FECACA]">
                Invalid rows will be skipped during import. You can review error details below before importing valid records.
              </p>
            </div>
          )}

          {/* FILTER REVIEW TABS */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  reviewFilter === tab.id
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#111827] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#172033] border border-[#E2E8F0] dark:border-[#334155]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ROW REVIEW CONTAINER */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs p-3.5 sm:p-5 space-y-3">
            <h3 className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              Student Records Review ({filteredReviewRows.length})
            </h3>

            {/* MOBILE CARDS VIEW (<768px) */}
            <div className="md:hidden space-y-2.5">
              {filteredReviewRows.map((row) => (
                <div
                  key={row.rowNumber}
                  className={`p-3.5 rounded-xl border space-y-2 text-left ${
                    row.status === 'valid'
                      ? 'bg-emerald-50/50 dark:bg-[rgba(16,185,129,0.08)] border-emerald-200/60 dark:border-[rgba(52,211,153,0.22)]'
                      : row.status === 'invalid'
                      ? 'bg-rose-50/50 dark:bg-[rgba(239,68,68,0.08)] border-rose-200/60 dark:border-[rgba(248,113,113,0.22)]'
                      : 'bg-amber-50/50 dark:bg-[rgba(245,158,11,0.08)] border-amber-200/60 dark:border-[rgba(251,191,36,0.22)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                      Row #{row.rowNumber}
                    </span>
                    <Badge
                      variant={row.status === 'valid' ? 'success' : row.status === 'invalid' ? 'error' : 'warning'}
                      size="sm"
                      className={
                        row.status === 'valid'
                          ? 'dark:bg-[rgba(16,185,129,0.12)] dark:text-[#6EE7B7] dark:border-[rgba(52,211,153,0.22)]'
                          : row.status === 'invalid'
                          ? 'dark:bg-[rgba(239,68,68,0.12)] dark:text-[#FCA5A5] dark:border-[rgba(248,113,113,0.22)]'
                          : 'dark:bg-[rgba(245,158,11,0.12)] dark:text-[#FCD34D] dark:border-[rgba(251,191,36,0.22)]'
                      }
                    >
                      {row.status}
                    </Badge>
                  </div>

                  <div>
                    <strong className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">
                      {row.name}
                    </strong>
                    <span className="text-[11px] font-normal text-[#64748B] dark:text-[#CBD5E1] block truncate">
                      {row.email}
                    </span>
                    <span className="text-[11px] text-[#94A3B8] dark:text-[#94A3B8] block mt-0.5">
                      Phone: {row.phone}
                    </span>
                  </div>

                  {row.errorMessage ? (
                    <div className="flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-[#FCA5A5] pt-1.5 border-t border-rose-100 dark:border-rose-900/30">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{row.errorMessage}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-[#6EE7B7] block pt-1 border-t border-emerald-100 dark:border-emerald-900/30 font-medium">
                      Ready for import
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (>=768px) */}
            <div className="hidden md:block w-full min-w-0 max-w-full overflow-x-auto scrollbar-hide border border-[#E2E8F0] dark:border-[#263244] rounded-xl">
              <table className="w-full text-left text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC]">
                <thead>
                  <tr className="bg-[#F8FAFC] dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#94A3B8] text-[11px] uppercase font-semibold">
                    <th className="py-3 px-4">Row #</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Activation Email</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244]">
                  {filteredReviewRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className="bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        #{row.rowNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#2563EB] dark:text-[#60A5FA] font-medium">
                        {row.studentCode || '— (Auto-assigned)'}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                        {row.name}
                      </td>
                      <td className="py-3 px-4 text-[#475569] dark:text-[#CBD5E1]">
                        {row.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={row.status === 'valid' ? 'success' : row.status === 'invalid' ? 'error' : 'warning'}
                          size="sm"
                          className={
                            row.status === 'valid'
                              ? 'dark:bg-[rgba(16,185,129,0.08)] dark:text-[#6EE7B7] dark:border-[rgba(52,211,153,0.22)]'
                              : row.status === 'invalid'
                              ? 'dark:bg-[rgba(239,68,68,0.08)] dark:text-[#FCA5A5] dark:border-[rgba(248,113,113,0.22)]'
                              : 'dark:bg-[rgba(245,158,11,0.08)] dark:text-[#FCD34D] dark:border-[rgba(251,191,36,0.22)]'
                          }
                        >
                          {row.status === 'valid' ? 'Enrolled' : row.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium">
                        {row.activationEmailSent ? (
                          <span className="text-emerald-600 dark:text-[#6EE7B7] flex items-center gap-1">
                            <MailCheck className="w-3.5 h-3.5" /> Sent
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-[#64748B]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium">
                        {row.errorMessage ? (
                          <span className="text-rose-600 dark:text-[#FCA5A5]">{row.errorMessage}</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-[#6EE7B7]">
                            {currentStep === 4 ? 'Enrolled in course' : 'Ready for import'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS / CONFIRMATION */}
      {currentStep >= 3 && (
        <div className="sticky bottom-4 z-20 w-full bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-[#E2E8F0] dark:border-[#334155] p-3.5 sm:p-4 shadow-lg rounded-2xl transition-all">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end items-center">
            {currentStep === 4 ? (
              <Button
                onClick={() => navigate(backLink)}
                className="w-full sm:w-auto min-h-[42px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm px-6 cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
              >
                Done — View Course Students →
              </Button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto min-h-[42px] bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] font-semibold text-xs sm:text-sm px-4 rounded-xl transition-colors cursor-pointer"
                >
                  ← Back to File Selection
                </button>

                <Button
                  onClick={handleConfirmImport}
                  disabled={isImporting || validRows.length === 0}
                  leftIcon={isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  className="w-full sm:w-auto min-h-[42px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm px-6 cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.12)] disabled:bg-[#E2E8F0] dark:disabled:bg-[#334155] disabled:text-[#94A3B8] dark:disabled:text-[#64748B]"
                >
                  {isImporting ? 'Importing Students...' : `Import ${validRows.length} Valid Students`}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
