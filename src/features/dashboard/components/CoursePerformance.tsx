import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  Award,
  Star,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CoursePerformanceItem } from '../types/dashboard.types';

interface CoursePerformanceProps {
  courses: CoursePerformanceItem[];
}

export const CoursePerformance: React.FC<CoursePerformanceProps> = ({ courses }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs text-left transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
            Course Performance
          </h3>
          <p className="text-xs font-medium text-[#64748B]">
            Detailed metrics breakdown across active courses
          </p>
        </div>
        <Link
          to="/courses"
          className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>View All Courses</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Desktop Table Layout (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider bg-[#F8FAFC]">
              <th className="py-3 px-3 rounded-l-xl">Course Name</th>
              <th className="py-3 px-3">Students</th>
              <th className="py-3 px-3">Completion %</th>
              <th className="py-3 px-3">Revenue</th>
              <th className="py-3 px-3">Rating</th>
              <th className="py-3 px-3">Certificates</th>
              <th className="py-3 px-3 text-right rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium text-[#0F172A]">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors group">
                <td className="py-3.5 px-3 font-bold">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150'}
                      alt={c.title}
                      className="w-10 h-10 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
                    />
                    <div className="min-w-0 max-w-xs">
                      <p className="font-bold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
                        {c.title}
                      </p>
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#EFF6FF] text-[#2563EB] mt-0.5">
                        {c.status}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                    <Users className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{c.studentsCount.toLocaleString()}</span>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <div className="w-28 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>{c.completionRate}%</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2563EB] h-full rounded-full"
                        style={{ width: `${c.completionRate}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3 font-extrabold text-[#16A34A]">
                  ${c.revenue.toLocaleString()}
                </td>

                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1 font-bold text-[#D97706]">
                    <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                    <span>{c.rating}</span>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1 text-[#64748B] font-semibold">
                    <Award className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span>{c.certificatesCount}</span>
                  </div>
                </td>

                <td className="py-3.5 px-3 text-right">
                  <Link
                    to={`/courses/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] px-2.5 py-1.5 rounded-lg border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-all"
                  >
                    <span>Analytics</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
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
            key={c.id}
            className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3"
          >
            <div className="flex items-start gap-3">
              <img
                src={c.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150'}
                alt={c.title}
                className="w-12 h-12 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-[#0F172A] line-clamp-2">
                  {c.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#EFF6FF] text-[#2563EB]">
                    {c.status}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#D97706]">
                    <Star className="w-3 h-3 fill-[#D97706]" />
                    <span>{c.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] text-center text-xs">
              <div>
                <p className="text-[10px] font-medium text-[#64748B]">Students</p>
                <p className="font-bold text-[#0F172A]">{c.studentsCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#64748B]">Revenue</p>
                <p className="font-bold text-[#16A34A]">${c.revenue}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#64748B]">Completion</p>
                <p className="font-bold text-[#2563EB]">{c.completionRate}%</p>
              </div>
            </div>

            <Link
              to={`/courses/${c.id}`}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[#2563EB] bg-[#EFF6FF] py-2 rounded-xl border border-[#BFDBFE]"
            >
              <span>View Analytics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
