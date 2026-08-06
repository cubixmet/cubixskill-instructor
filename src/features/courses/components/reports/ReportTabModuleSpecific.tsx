import React from 'react';
import { Card } from '../../../../components/ui/Card';

export interface ReportTabModuleSpecificProps {
  tab: string;
  metrics: any;
  courseAnnouncements: any[];
  courseLiveSessions: any[];
}

export const ReportTabModuleSpecific: React.FC<ReportTabModuleSpecificProps> = ({
  tab,
  metrics,
  courseAnnouncements: _courseAnnouncements,
  courseLiveSessions: _courseLiveSessions,
}) => {
  if (tab === 'assignments') {
    return (
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="grid grid-cols-4 gap-3">
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Submissions</span>
            <h4 className="text-xl font-black text-slate-900">{metrics.submittedAssignments}</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Approved</span>
            <h4 className="text-xl font-black text-emerald-600">84 Submissions</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Review</span>
            <h4 className="text-xl font-black text-amber-600">12 Pending</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Score</span>
            <h4 className="text-xl font-black text-blue-600">88.5 / 100</h4>
          </Card>
        </div>
      </div>
    );
  }

  if (tab === 'quizzes') {
    return (
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="grid grid-cols-4 gap-3">
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Attempts</span>
            <h4 className="text-xl font-black text-slate-900">{metrics.totalQuizAttempts} Attempts</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pass Rate</span>
            <h4 className="text-xl font-black text-emerald-600">92.4%</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Score</span>
            <h4 className="text-xl font-black text-blue-600">86 / 100</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Highest Score</span>
            <h4 className="text-xl font-black text-purple-600">100 / 100</h4>
          </Card>
        </div>
      </div>
    );
  }

  if (tab === 'certificates') {
    return (
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="grid grid-cols-3 gap-3">
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Eligible Students</span>
            <h4 className="text-xl font-black text-slate-900">45 Eligible</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Issued Credentials</span>
            <h4 className="text-xl font-black text-emerald-600">{metrics.totalCertificates} Issued</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Records</span>
            <h4 className="text-xl font-black text-blue-600">100% Verified</h4>
          </Card>
        </div>
      </div>
    );
  }

  if (tab === 'live-sessions') {
    return (
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="grid grid-cols-4 gap-3">
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sessions Conducted</span>
            <h4 className="text-xl font-black text-slate-900">{metrics.totalLiveSessions} Webinars</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Attendance</span>
            <h4 className="text-xl font-black text-emerald-600">{metrics.avgAttendanceRate}%</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Recording Views</span>
            <h4 className="text-xl font-black text-blue-600">312 Plays</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Join Time</span>
            <h4 className="text-xl font-black text-indigo-600">2 Mins Early</h4>
          </Card>
        </div>
      </div>
    );
  }

  if (tab === 'announcements') {
    return (
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="grid grid-cols-3 gap-3">
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Announcements Dispatched</span>
            <h4 className="text-xl font-black text-slate-900">{metrics.totalAnnouncements} Published</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Student Read Rate</span>
            <h4 className="text-xl font-black text-emerald-600">{metrics.avgReadRate}%</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Attachment Downloads</span>
            <h4 className="text-xl font-black text-blue-600">184 Downloads</h4>
          </Card>
        </div>
      </div>
    );
  }

  if (tab === 'revenue') {
    return (
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="grid grid-cols-3 gap-3">
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Sales Revenue</span>
            <h4 className="text-xl font-black text-emerald-600">${metrics.totalRevenue.toLocaleString()}</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Course Enrollments</span>
            <h4 className="text-xl font-black text-slate-900">{metrics.totalStudents} Enrollments</h4>
          </Card>
          <Card padding="sm" className="bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Refunds Issued</span>
            <h4 className="text-xl font-black text-rose-600">$0.00 (0%)</h4>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card padding="md" className="bg-white border border-slate-200 text-center py-10">
      <h3 className="font-extrabold text-slate-900 text-sm capitalize">{tab} Analytics Stream</h3>
      <p className="text-xs text-slate-500 mt-1">Telemetry stream synchronized with course store.</p>
    </Card>
  );
};
