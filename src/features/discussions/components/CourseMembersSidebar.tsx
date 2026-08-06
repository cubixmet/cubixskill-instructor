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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4 font-sans text-xs text-left shadow-xs h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600 shrink-0" />
          <h3 className="font-extrabold text-slate-900 text-sm">Course Members</h3>
        </div>
        <span className="bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
          {members.length} Total
        </span>
      </div>

      <Input
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
      />

      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {/* Instructors */}
        {instructors.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" /> Instructor ({instructors.length})
            </div>
            {instructors.map((m) => (
              <div key={m.uuid} className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-2 truncate">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover border border-blue-200" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-bold text-slate-900 text-xs block truncate">{m.name}</span>
                    <span className="text-[10px] text-blue-600 font-medium">{m.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAs */}
        {tas.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-indigo-600" /> Teaching Assistants ({tas.length})
            </div>
            {tas.map((m) => (
              <div key={m.uuid} className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/40 border border-indigo-100">
                <div className="flex items-center gap-2 truncate">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-bold text-slate-900 text-xs block truncate">{m.name}</span>
                    <span className="text-[10px] text-indigo-600 font-medium">TA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Students */}
        {students.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-slate-500" /> Enrolled Students ({students.length})
            </div>
            {students.map((m) => (
              <div key={m.uuid} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/60">
                <div className="flex items-center gap-2 truncate">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-bold text-slate-800 text-xs truncate">{m.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
