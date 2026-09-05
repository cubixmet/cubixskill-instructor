import React from 'react';
import { ArrowLeft, BookOpen, Folder, BarChart2, Clock, Edit3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { CourseThumbnailImage } from '../../../components/courses/CourseThumbnailImage';
import { useAuthStore } from '../../../store/auth.store';
import type { CourseDetail } from '../types/course.types';
import { useCurriculumStore } from '../store/curriculum.store';

interface SharedCourseHeaderProps {
  course: CourseDetail;
}

export const SharedCourseHeader: React.FC<SharedCourseHeaderProps> = ({ course }) => {
  const navigate = useNavigate();
  const { can } = useAuthStore();

  // Single source of truth subscription for Module count and Duration calculation
  const allModules = useCurriculumStore((state) => state.modules);
  const allLessons = useCurriculumStore((state) => state.lessons);

  const realModules = allModules.filter((m) => m.courseUuid === course.id);
  const moduleUuids = realModules.map((m) => m.uuid);
  const realLessons = allLessons.filter((l) => moduleUuids.includes(l.moduleUuid));

  const realModuleCount = realModules.length;
  const realTotalDuration = realLessons.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

  const formatDuration = (mins: number) => {
    if (!mins || mins <= 0) return course.duration_minutes ? `${course.duration_minutes} mins` : '—';
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return hrs > 0 ? `${hrs}h ${rem}m` : `${rem} mins`;
  };

  const formattedPrice = course.is_free
    ? 'FREE'
    : course.price
    ? `${course.currency || 'USD'} ${course.price}`
    : 'Not configured';

  return (
    <div className="space-y-3 font-sans text-left">
      {/* Desktop Breadcrumb & Action Bar */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 dark:text-[#94A3B8]">
          <Link to="/courses" className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors">
            Courses
          </Link>
          <span className="text-slate-400 dark:text-slate-500">›</span>
          <span className="text-slate-900 dark:text-[#CBD5E1] font-semibold truncate max-w-sm">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {can('courses.edit') && (
            <Link to={`/courses/${course.id}/edit`}>
              <Button
                size="sm"
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                className="h-9 px-3 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                Edit Course
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Header Title & Status */}
      <div className="sm:hidden flex items-start justify-between gap-2 border-b border-slate-200 dark:border-[#334155] pb-2.5">
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="p-1 -ml-1 text-slate-900 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg flex items-center gap-1.5 cursor-pointer min-w-0 flex-1 text-left"
        >
          <ArrowLeft className="w-5 h-5 shrink-0 text-slate-700 dark:text-[#94A3B8]" />
          <span className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] leading-tight line-clamp-2 break-words">
            {course.title}
          </span>
        </button>

        <Badge
          variant={course.status === 'PUBLISHED' ? 'success' : 'secondary'}
          size="sm"
          dot
          className="shrink-0 mt-0.5 font-medium"
        >
          {course.status || 'DRAFT'}
        </Badge>
      </div>

      {/* Reusable Course Banner Card */}
      <Card
        padding="sm"
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-3 sm:p-4 rounded-2xl shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-[#263244] shrink-0">
              <CourseThumbnailImage
                src={course.thumbnail || course.thumbnail_url}
                alt={course.title}
                iconClassName="w-6 h-6"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 dark:text-[#F8FAFC] leading-snug line-clamp-2 break-words">
                {course.title}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] font-medium flex-wrap leading-none">
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-[#94A3B8]">
                  <Folder className="w-3.5 h-3.5 text-blue-600 dark:text-[#60A5FA] shrink-0" />
                  <span className="text-slate-700 dark:text-[#CBD5E1]">
                    {course.category?.name || 'Not configured'}
                  </span>
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-[#94A3B8]">
                  <BarChart2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-slate-700 dark:text-[#CBD5E1]">{course.level || '—'}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-[#94A3B8]">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-slate-700 dark:text-[#CBD5E1]">
                    {formatDuration(realTotalDuration)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-3 sm:gap-5 text-center sm:text-right pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-[#334155] shrink-0">
            <div>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] block">
                {realModuleCount}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-normal">Modules</span>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] block">
                {formattedPrice}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-normal">Price</span>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 block">
                {course.status || 'DRAFT'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-normal">Status</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
