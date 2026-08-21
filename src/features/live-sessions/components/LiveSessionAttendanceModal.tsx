import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { LiveSessionItem } from '../store/liveSession.store';

export interface LiveSessionAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: LiveSessionItem | null;
}

export const LiveSessionAttendanceModal: React.FC<LiveSessionAttendanceModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!session) return null;

  const records = session.attendanceRecords || [];
  const joinedCount = records.filter((r) => r.status === 'joined').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalCount = records.length || 1;
  const attendanceRate = Math.round((joinedCount / totalCount) * 100);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    alert(`Exported attendance roster for "${session.title}" (CSV format).`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Attendance Roster - ${session.title}`}
      subtitle={`${joinedCount} Joined • ${absentCount} Absent • ${attendanceRate}% Attendance Rate`}
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans text-xs text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-[#0F172A] border border-blue-200 dark:border-[#334155] rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-blue-700 dark:text-[#60A5FA] uppercase">Attendance Rate</span>
            <h4 className="text-xl font-black text-blue-950 dark:text-[#F8FAFC]">{attendanceRate}%</h4>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)] rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-[#6EE7B7] uppercase">Joined Students</span>
            <h4 className="text-xl font-black text-emerald-950 dark:text-[#F8FAFC]">{joinedCount} Students</h4>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase">Absent Students</span>
            <h4 className="text-xl font-black text-slate-900 dark:text-[#F8FAFC]">{absentCount} Students</h4>
          </div>
        </div>

        {/* Filter & Export Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />}
              className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]"
            >
              <option value="all" className="bg-white dark:bg-[#111827]">All Students ({records.length})</option>
              <option value="joined" className="bg-white dark:bg-[#111827]">Joined Only</option>
              <option value="absent" className="bg-white dark:bg-[#111827]">Absent Only</option>
            </select>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="h-9 text-xs font-bold bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#2563EB] dark:text-[#60A5FA]"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Attendance Roster Table */}
        <div className="border border-[#E2E8F0] dark:border-[#263244] rounded-xl overflow-hidden divide-y divide-[#E2E8F0] dark:divide-[#263244]">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((rec) => (
              <div key={rec.studentUuid} className="p-3 bg-white dark:bg-[#111827] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rec.studentAvatar ? (
                    <img
                      src={rec.studentAvatar}
                      alt={rec.studentName}
                      className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center">
                      {rec.studentName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-[#0F172A] dark:text-[#F8FAFC] text-xs">{rec.studentName}</h4>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium">{rec.studentEmail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  {rec.status === 'joined' ? (
                    <div>
                      <span className="bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-700 dark:text-[#6EE7B7] font-extrabold text-[10px] px-2 py-0.5 rounded border border-emerald-200 dark:border-[rgba(52,211,153,0.22)]">
                        Joined ({rec.durationMinutes} mins)
                      </span>
                      <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8] block font-medium mt-0.5">
                        In: {rec.joinTime} • Out: {rec.leaveTime}
                      </span>
                    </div>
                  ) : (
                    <span className="bg-slate-100 dark:bg-[#0F172A] text-slate-500 dark:text-[#94A3B8] font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-[#334155]">
                      Absent
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-[#64748B] dark:text-[#94A3B8] font-bold">No matching student attendance records.</div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
          <Button variant="outline" onClick={onClose} className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1]">
            Close Roster
          </Button>
        </div>
      </div>
    </Modal>
  );
};
