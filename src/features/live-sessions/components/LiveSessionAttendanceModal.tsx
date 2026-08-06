import React, { useState } from 'react';
import { Users, CheckCircle2, XCircle, Clock, Download, Search } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { LiveSessionItem, AttendanceRecord } from '../store/liveSession.store';

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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-blue-700 uppercase">Attendance Rate</span>
            <h4 className="text-xl font-black text-blue-950">{attendanceRate}%</h4>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Joined Students</span>
            <h4 className="text-xl font-black text-emerald-950">{joinedCount} Students</h4>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Absent Students</span>
            <h4 className="text-xl font-black text-slate-900">{absentCount} Students</h4>
          </div>
        </div>

        {/* Filter & Export Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white font-bold text-xs"
            >
              <option value="all">All Students ({records.length})</option>
              <option value="joined">Joined Only</option>
              <option value="absent">Absent Only</option>
            </select>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="h-9 text-xs font-bold text-blue-600"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Attendance Roster Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((rec) => (
              <div key={rec.studentUuid} className="p-3 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rec.studentAvatar ? (
                    <img
                      src={rec.studentAvatar}
                      alt={rec.studentName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {rec.studentName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">{rec.studentName}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">{rec.studentEmail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  {rec.status === 'joined' ? (
                    <div>
                      <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded border border-emerald-200">
                        Joined ({rec.durationMinutes} mins)
                      </span>
                      <span className="text-[9px] text-slate-400 block font-medium mt-0.5">
                        In: {rec.joinTime} • Out: {rec.leaveTime}
                      </span>
                    </div>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded">
                      Absent
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 font-bold">No matching student attendance records.</div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Close Roster
          </Button>
        </div>
      </div>
    </Modal>
  );
};
