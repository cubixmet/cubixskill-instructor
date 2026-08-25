import React, { useState } from 'react';
import { Users, Search, ShieldCheck, GraduationCap, UserCheck } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import type { CourseMember } from '../store/discussion.store';

export interface CourseMembersSidebarProps {
  members: CourseMember[];
}

export const CourseMembersSidebar: React.FC<CourseMembersSidebarProps> = ({ members }) => {
  const [search, setSearch] = useState('');

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const instructors = filtered.filter((m) => m.role === 'instructor');
  const tas = filtered.filter((m) => m.role === 'ta');
  const students = filtered.filter((m) => m.role === 'student');

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-4 space-y-4 font-sans text-xs text-left shadow-xs h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
          <h3 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-sm">Course Members</h3>
        </div>
        <span className="bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] font-semibold px-2 py-0.5 rounded-full text-[10px]">
          {members.length} Total
        </span>
      </div>

      <Input
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />}
      />

      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {/* Instructors */}
        {instructors.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#2563EB] dark:text-[#60A5FA]" /> Instructor ({instructors.length})
            </div>
            {instructors.map((m) => (
              <div key={m.uuid} className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 dark:bg-[rgba(37,99,235,0.10)] border border-blue-100 dark:border-[rgba(59,130,246,0.20)]">
                <div className="flex items-center gap-2 truncate">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover border border-blue-200 dark:border-[#334155]" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.12)] border border-[#DBEAFE] dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] font-medium text-xs flex items-center justify-center">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs block truncate">{m.name}</span>
                    <span className="text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-normal">{m.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAs */}
        {tas.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Teaching Assistants ({tas.length})
            </div>
            {tas.map((m) => (
              <div key={m.uuid} className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center gap-2 truncate">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155]" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium text-xs flex items-center justify-center">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs block truncate">{m.name}</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">TA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Students */}
        {students.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-[#64748B] dark:text-[#94A3B8]" /> Enrolled Students ({students.length})
            </div>
            {students.map((m) => (
              <div key={m.uuid} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100/80 dark:hover:bg-[#172033] transition-colors border border-slate-200/60 dark:border-[#263244]">
                <div className="flex items-center gap-2 truncate">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155]" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] font-medium text-[10px] flex items-center justify-center">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs truncate">{m.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
