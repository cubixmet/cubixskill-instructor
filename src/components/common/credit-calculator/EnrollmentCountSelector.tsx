import React from 'react';
import { Users } from 'lucide-react';

interface EnrollmentCountSelectorProps {
  studentCount: number;
  onStudentCountChange: (count: number) => void;
}

export const EnrollmentCountSelector: React.FC<EnrollmentCountSelectorProps> = ({
  studentCount,
  onStudentCountChange,
}) => {
  const presetCounts = [10, 25, 50, 100, 250, 500];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      onStudentCountChange(1);
    } else {
      onStudentCountChange(Math.max(1, Math.min(10000, val)));
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 text-left">
      {/* Title & Numeric Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Target Student Enrollment
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Specify how many students are expected to enroll.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <input
              type="number"
              min={1}
              max={10000}
              value={studentCount}
              onChange={handleInputChange}
              className="w-24 h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-sm text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
            />
          </div>
          <span className="text-xs font-bold text-slate-600">students</span>
        </div>
      </div>

      {/* Range Slider */}
      <div className="space-y-1.5 pt-1">
        <input
          type="range"
          min={1}
          max={1000}
          step={1}
          value={Math.min(1000, studentCount)}
          onChange={(e) => onStudentCountChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span>1 student</span>
          <span>250</span>
          <span>500</span>
          <span>750</span>
          <span>1,000+ students</span>
        </div>
      </div>

      {/* Quick Select Presets */}
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Quick Select:
        </span>
        {presetCounts.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onStudentCountChange(count)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              studentCount === count
                ? 'bg-blue-600 text-white shadow-xs scale-105'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
};
