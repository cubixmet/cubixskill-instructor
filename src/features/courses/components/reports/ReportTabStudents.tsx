import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';

export interface ReportTabStudentsProps {
  students: any[];
}

export const ReportTabStudents: React.FC<ReportTabStudentsProps> = ({ students }) => {
  const [search, setSearch] = useState('');

  const filtered = (students || []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans text-xs text-left">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search student by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => alert('Exported student roster report.')}
          className="h-9 font-bold text-blue-600"
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Export Student Data
        </Button>
      </div>

      {/* Roster Grid / Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
        {filtered.map((st, idx) => (
          <div key={st.id || idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <img
                src={st.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                alt={st.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  {st.name}
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-200">
                    Active Student
                  </span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium block">{st.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-right">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Progress</span>
                <span className="font-extrabold text-blue-600 text-xs">68% Syllabus</span>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Quiz Avg</span>
                <span className="font-extrabold text-slate-900 text-xs">88 / 100</span>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Attendance</span>
                <span className="font-extrabold text-emerald-600 text-xs">92% Joined</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="h-8 text-[11px] font-bold text-slate-700"
              >
                View Analytics
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
