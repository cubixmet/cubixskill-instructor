import React from "react";
import { GraduationCap, ChevronRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import type { BackendCourseAnalytics } from "../types/analytics.types";

interface CoursePerformanceProps {
  courses: BackendCourseAnalytics[];
}

export const CoursePerformance: React.FC<CoursePerformanceProps> = ({ courses }) => {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs text-left transition-all h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight truncate">
                Course Performance
              </h3>
              <p className="text-xs font-normal text-[var(--text-secondary)] truncate">
                Top performing courses
              </p>
            </div>
          </div>
          <Link
            to="/courses"
            className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-0.5 shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="py-8 text-center space-y-2 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)]">
            <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
            <p className="text-xs font-semibold text-[var(--text-secondary)]">No course performance data available yet.</p>
            <p className="text-[11px] text-[var(--text-muted)]">Create and publish courses to start tracking analytics.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {courses.map((c, idx) => (
              <div
                key={c.course_id}
                className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 transition-all hover:border-[var(--brand-primary)]/40"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {c.course_title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {c.total_enrollments} students
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-[var(--text-primary)] block">
                    {c.total_enrollments}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {c.completion_rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

