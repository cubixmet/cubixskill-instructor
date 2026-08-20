import React from "react";
import { Users, GraduationCap, ChevronRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import type { BackendCourseAnalytics } from "../types/analytics.types";

interface CoursePerformanceProps {
  courses: BackendCourseAnalytics[];
}

export const CoursePerformance: React.FC<CoursePerformanceProps> = ({ courses }) => {
  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-5 shadow-2xs text-left transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Course Performance
          </h3>
          <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            Detailed metrics breakdown across active courses
          </p>
        </div>
        <Link
          to="/courses"
          className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] hover:text-[#1D4ED8] dark:hover:text-[#93C5FD] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>View All Courses</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="py-10 text-center space-y-2 bg-slate-50/50 dark:bg-[#172033]/50 rounded-xl border border-slate-100 dark:border-[#263244]">
          <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No course performance data available yet.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Create and publish courses to start tracking analytics.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table Layout (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#263244] text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider bg-[#F8FAFC] dark:bg-[#172033]">
                  <th className="py-3 px-3 rounded-l-xl">Course Name</th>
                  <th className="py-3 px-3">Enrollments</th>
                  <th className="py-3 px-3">Active</th>
                  <th className="py-3 px-3">Completed</th>
                  <th className="py-3 px-3">Completion Rate</th>
                  <th className="py-3 px-3 text-right rounded-r-xl">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#263244] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                {courses.map((c) => (
                  <tr key={c.course_id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#172033] transition-colors group">
                    <td className="py-3.5 px-3 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-[#172033] text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-[#263244] flex items-center justify-center font-bold text-xs shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
                            {c.course_title}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <Users className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
                        <span>{c.total_enrollments.toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-[#CBD5E1]">
                      {c.active_students.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 text-[#059669] dark:text-emerald-400 font-semibold">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{c.completed_students.toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="w-28 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>{c.completion_rate}</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] dark:bg-[#263244] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#2563EB] dark:bg-[#3B82F6] h-full rounded-full"
                            style={{ width: `${parseFloat(c.completion_rate) || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-extrabold text-[#16A34A] dark:text-emerald-400">
                      {Number(c.revenue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (< 768px) */}
          <div className="md:hidden space-y-3">
            {courses.map((c) => (
              <div
                key={c.course_id}
                className="p-4 bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] rounded-xl space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#111827] text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-[#263244] flex items-center justify-center font-bold text-xs shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] line-clamp-2">
                      {c.course_title}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244] text-center text-xs">
                  <div>
                    <p className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8]">Enrollments</p>
                    <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{c.total_enrollments}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8]">Revenue</p>
                    <p className="font-bold text-[#16A34A] dark:text-emerald-400">{c.revenue}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8]">Completion</p>
                    <p className="font-bold text-[#2563EB] dark:text-[#60A5FA]">{c.completion_rate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

