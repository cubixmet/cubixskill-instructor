import React, { useState, useMemo } from 'react';
import {
  UsersRound,
  Plus,
  Trash2,
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  Check,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/forms/FormField';
import { TextInput } from '../../../components/forms/TextInput';
import { EmailInput } from '../../../components/forms/EmailInput';
import { PhoneInput } from '../../../components/forms/PhoneInput';
import { TextareaField } from '../../../components/forms/TextareaField';
import { FormAlert } from '../../../components/forms/FormAlert';
import { useStudentStore } from '../store/student.store';

export interface BulkAddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export type BulkAddMethod = 'manual' | 'paste' | 'csv';

export interface ManualStudentRow {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  country: string;
  status: 'Active' | 'Pending';
}



export const BulkAddStudentsModal: React.FC<BulkAddStudentsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const students = useStudentStore((state) => state.students);
  const addStudent = useStudentStore((state) => state.addStudent);

  const [step, setStep] = useState<'method' | 'review' | 'result'>('method');
  const [method, setMethod] = useState<BulkAddMethod>('manual');

  // Method 1: Manual Rows
  const [manualRows, setManualRows] = useState<ManualStudentRow[]>([
    { id: '1', name: '', email: '', countryCode: '+91', phone: '', country: 'India', status: 'Active' },
    { id: '2', name: '', email: '', countryCode: '+91', phone: '', country: 'India', status: 'Active' },
  ]);

  // Method 2: Paste Text
  const [pastedData, setPastedData] = useState('');

  // Method 3: CSV Mock File
  const [fileName, setFileName] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState<{ createdCount: number; skippedCount: number } | null>(null);

  // Derived Valid Records for Review Step
  const parsedRecords = useMemo(() => {
    const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    let list: { name: string; email: string; phone: string; country: string }[] = [];

    if (method === 'manual') {
      list = manualRows
        .filter((r) => r.name.trim() || r.email.trim())
        .map((r) => ({
          name: r.name.trim(),
          email: r.email.trim(),
          phone: `${r.countryCode} ${r.phone.trim()}`,
          country: r.country,
        }));
    } else if (method === 'paste') {
      const lines = pastedData
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      lines.forEach((line) => {
        const parts = line.split(/[,;\t]+/).map((p) => p.trim());
        if (parts.length >= 2) {
          list.push({ name: parts[0], email: parts[1], phone: parts[2] || '+91 98000 00000', country: 'India' });
        } else if (parts.length === 1 && isEmailValid(parts[0])) {
          list.push({ name: parts[0].split('@')[0], email: parts[0], phone: '+91 98000 00000', country: 'India' });
        }
      });
    } else if (method === 'csv' && fileName) {
      list = [
        { name: 'Kavya Sharma', email: 'kavya.s@example.com', phone: '+91 98222 11100', country: 'India' },
        { name: 'Rohan Mehta', email: 'rohan.m@example.com', phone: '+91 97111 44455', country: 'India' },
        { name: 'Aarav Patel', email: 'aarav.patel@gmail.com', phone: '+91 98765 43210', country: 'India' },
      ];
    }

    return list.map((item) => {
      const isValidEmail = isEmailValid(item.email);
      const isExisting = students.some((s) => s.email.toLowerCase() === item.email.toLowerCase());

      return {
        ...item,
        status: !isValidEmail ? 'invalid' : isExisting ? 'existing' : 'valid_new',
      };
    });
  }, [method, manualRows, pastedData, fileName, students]);

  const validNewRecords = parsedRecords.filter((r) => r.status === 'valid_new');
  const existingRecords = parsedRecords.filter((r) => r.status === 'existing');

  if (!isOpen) return null;

  const handleAddManualRow = () => {
    setManualRows((prev) => [
      ...prev,
      { id: String(Date.now()), name: '', email: '', countryCode: '+91', phone: '', country: 'India', status: 'Active' },
    ]);
  };

  const handleRemoveManualRow = (id: string) => {
    if (manualRows.length === 1) return;
    setManualRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateManualRow = (id: string, field: keyof ManualStudentRow, val: string) => {
    setManualRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const handleConfirmCreateStudents = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      let createdCount = 0;

      validNewRecords.forEach((record) => {
        addStudent({
          name: record.name || record.email.split('@')[0],
          email: record.email,
          phone: record.phone,
          countryCode: '+91',
          country: record.country || 'India',
          status: 'Active',
          notes: 'Added via Bulk Student Creator.',
        });
        createdCount++;
      });

      setResultSummary({
        createdCount,
        skippedCount: existingRecords.length,
      });

      setIsSubmitting(false);
      setStep('result');
      if (onSuccess) onSuccess();
    }, 500);
  };

  const handleDownloadSampleTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,full_name,email,phone,country\nKavya Sharma,kavya@example.com,+91 9822211100,India\nRohan Mehta,rohan@example.com,+91 9711144455,India';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_global_students_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'result' ? 'Bulk Student Creation Completed' : 'Bulk Add Students'}
      subtitle="Register multiple students at once without course enrollment or credit deduction."
      maxWidth="xl"
    >
      <div className="space-y-5 text-left font-sans text-xs">
        {step === 'method' && (
          <>
            {/* 1. METHOD SELECTOR CARDS */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#0F172A]">Choose Bulk Creation Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('manual')}
                  className={`p-3.5 rounded-[14px] border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    method === 'manual' ? 'bg-blue-50/70 border-[#2563EB] shadow-2xs' : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <UsersRound className={`w-5 h-5 shrink-0 ${method === 'manual' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                  <div>
                    <strong className="text-xs font-semibold text-[#0F172A] block leading-tight">Enter Manually</strong>
                    <span className="text-[10px] text-[#64748B]">Fill multi-row student form</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('paste')}
                  className={`p-3.5 rounded-[14px] border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    method === 'paste' ? 'bg-blue-50/70 border-[#2563EB] shadow-2xs' : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <FileText className={`w-5 h-5 shrink-0 ${method === 'paste' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                  <div>
                    <strong className="text-xs font-semibold text-[#0F172A] block leading-tight">Paste Data</strong>
                    <span className="text-[10px] text-[#64748B]">Paste comma/tab separated list</span>
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
                    <strong className="text-xs font-semibold text-[#0F172A] block leading-tight">Upload CSV/Excel</strong>
                    <span className="text-[10px] text-[#64748B]">Import spreadsheet rows</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. METHOD METHOD-SPECIFIC UI */}

            {/* MANUAL ROWS FORM */}
            {method === 'manual' && (
              <div className="space-y-3">
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                  {manualRows.map((row, index) => (
                    <div key={row.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase">Student #{index + 1}</span>
                        {manualRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveManualRow(row.id)}
                            className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Full Name" required>
                          <TextInput
                            value={row.name}
                            onChange={(e) => handleUpdateManualRow(row.id, 'name', e.target.value)}
                            placeholder="e.g. Kavya Sharma"
                          />
                        </FormField>

                        <FormField label="Email Address" required>
                          <EmailInput
                            value={row.email}
                            onChange={(e) => handleUpdateManualRow(row.id, 'email', e.target.value)}
                            placeholder="kavya@example.com"
                          />
                        </FormField>

                        <FormField label="Phone Number">
                          <PhoneInput
                            value={row.phone}
                            onChange={(val) => handleUpdateManualRow(row.id, 'phone', val)}
                            countryCode={row.countryCode}
                            onCountryCodeChange={(code) => handleUpdateManualRow(row.id, 'countryCode', code)}
                          />
                        </FormField>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                  onClick={handleAddManualRow}
                  className="w-full border-[#2563EB] text-[#2563EB] text-xs font-semibold h-10 rounded-xl"
                >
                  Add Another Student Row
                </Button>
              </div>
            )}

            {/* PASTE DATA TEXTAREA */}
            {method === 'paste' && (
              <div className="space-y-3">
                <FormField label="Paste Student Data" helperText="Format: Name, Email, Phone (or one email per line)">
                  <TextareaField
                    value={pastedData}
                    onChange={(e) => setPastedData(e.target.value)}
                    rows={6}
                    placeholder="Kavya Sharma, kavya@example.com, +91 9822211100&#10;Rohan Mehta, rohan@example.com, +91 9711144455"
                  />
                </FormField>
              </div>
            )}

            {/* CSV UPLOAD */}
            {method === 'csv' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#0F172A]">Upload CSV / Excel Spreadsheet</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={handleDownloadSampleTemplate}
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
                    onClick={() => setFileName('global_students_list.csv')}
                    className="h-9 text-xs font-semibold bg-white"
                  >
                    {fileName ? 'Replace File' : 'Choose File'}
                  </Button>
                </div>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <Button variant="outline" onClick={onClose} className="h-10 text-xs font-semibold">
                Cancel
              </Button>
              <Button
                onClick={() => setStep('review')}
                disabled={validNewRecords.length === 0}
                className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs"
              >
                Review & Confirm ({validNewRecords.length})
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: REVIEW */}
        {step === 'review' && (
          <div className="space-y-4">
            <FormAlert
              variant="info"
              title="Bulk Student Review"
              description={`Reviewing ${parsedRecords.length} records. ${validNewRecords.length} new students will be added.`}
            />

            <div className="max-h-60 overflow-y-auto border border-[#E2E8F0] rounded-[14px] p-2 bg-[#F8FAFC] space-y-2 no-scrollbar">
              {parsedRecords.map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <strong className="text-xs font-semibold text-[#0F172A] block">{item.name}</strong>
                      <span className="text-[11px] text-[#64748B]">{item.email} • {item.phone}</span>
                    </div>
                  </div>

                  {item.status === 'valid_new' && <Badge variant="success" size="sm">Valid New</Badge>}
                  {item.status === 'existing' && <Badge variant="secondary" size="sm">Existing (Skipped)</Badge>}
                  {item.status === 'invalid' && <Badge variant="warning" size="sm">Invalid Email</Badge>}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <Button variant="outline" onClick={() => setStep('method')} className="h-10 text-xs font-semibold">
                Back
              </Button>
              <Button
                onClick={handleConfirmCreateStudents}
                disabled={isSubmitting || validNewRecords.length === 0}
                className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs"
              >
                {isSubmitting ? 'Creating Students...' : `Create ${validNewRecords.length} Students`}
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
              <h3 className="text-base font-bold text-[#0F172A]">Bulk Student Creation Completed</h3>
              <p className="text-xs text-[#64748B]">New student records have been created in the global roster.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
              <div>
                <span className="text-[11px] text-[#64748B] block">Students Created</span>
                <strong className="text-base font-bold text-emerald-600">{resultSummary.createdCount}</strong>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] block">Existing Skipped</span>
                <strong className="text-base font-bold text-[#64748B]">{resultSummary.skippedCount}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-center">
              <Button onClick={onClose} className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs px-8">
                Close & View Roster
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
