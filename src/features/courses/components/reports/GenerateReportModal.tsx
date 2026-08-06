import React, { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';

export interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [reportType, setReportType] = useState('full_course_analytics');
  const [dateRange, setDateRange] = useState('30_days');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Generated custom report: ${reportType} (${dateRange}).`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Custom Course Analytics Report"
      subtitle="Select telemetry parameters and dataset range to build report."
      maxWidth="md"
    >
      <form onSubmit={handleGenerate} className="space-y-4 font-sans text-xs text-left">
        <div>
          <label className="block font-bold text-slate-900 mb-1">Report Dataset Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white font-bold text-slate-900"
          >
            <option value="full_course_analytics">Full Course Performance Master Report</option>
            <option value="student_attendance_progress">Student Attendance &amp; Progress Audit</option>
            <option value="quiz_assignment_grades">Quiz &amp; Assignment Grading Breakdown</option>
            <option value="revenue_credits_usage">Revenue &amp; Academy Credits Usage</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-900 mb-1">Timeframe Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white font-bold text-slate-900"
          >
            <option value="7_days">Last 7 Days</option>
            <option value="30_days">Last 30 Days</option>
            <option value="90_days">Last 90 Days</option>
            <option value="all_time">All Time Course History</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#2563EB] text-white font-extrabold px-6">
            Generate &amp; Download Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};
