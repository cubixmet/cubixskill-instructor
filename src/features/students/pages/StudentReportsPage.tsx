import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useStudentStore } from '../store/student.store';

export const StudentReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentUuid } = useParams<{ studentUuid?: string }>();
  const foundStudent = useStudentStore((state) => state.students.find((s) => s.uuid === studentUuid));
  const student = foundStudent || {
    name: 'Aarav Patel',
    email: 'aarav.patel@gmail.com',
    creditsConsumed: 34,
  };
  const progressPercent = foundStudent?.enrolledCourses?.[0]?.progressPercent ?? 85;

  return (
    <div className="space-y-6 text-left font-sans max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/students/${studentUuid}`)}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A]">Student Telemetry & Analytics Report</h1>
            <p className="text-xs text-[#64748B]">Detailed watch metrics, quiz performance, and credit logs for {student.name}.</p>
          </div>
        </div>

        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} className="border-[#E2E8F0] text-xs">
          Export Report PDF
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-4 rounded-[14px] space-y-1">
          <span className="text-[10px] font-semibold text-[#64748B] uppercase">Watch Completion</span>
          <strong className="text-2xl font-bold text-[#2563EB] block">{progressPercent}%</strong>
        </Card>
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-4 rounded-[14px] space-y-1">
          <span className="text-[10px] font-semibold text-[#64748B] uppercase">Quiz Average Score</span>
          <strong className="text-2xl font-bold text-emerald-600 block">92.5%</strong>
        </Card>
        <Card padding="md" className="bg-white border border-[#E2E8F0] p-4 rounded-[14px] space-y-1">
          <span className="text-[10px] font-semibold text-[#64748B] uppercase">Media Credits Consumption</span>
          <strong className="text-2xl font-bold text-[#0F172A] block">{student.creditsConsumed} Credits</strong>
        </Card>
      </div>
    </div>
  );
};
