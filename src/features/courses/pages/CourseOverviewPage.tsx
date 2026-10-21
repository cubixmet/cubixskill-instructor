import React, { useEffect, useState } from "react";
import { useOutletContext, Link, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import type { CourseDetail } from "../types/course.types";
import { useCurriculumStore } from "../store/curriculum.store";
import { curriculumService } from "../services/curriculum.service";

import { normalizeCourseId, isValidCourseId } from "../../../utils/courseValidation.utils";

export const CourseOverviewPage: React.FC = () => {
  const { course } = useOutletContext<{ course: CourseDetail }>();
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const activeCourseId = normalizeCourseId(params.courseId || params.courseUuid || course?.id);

  const [isLoadingModules, setIsLoadingModules] = useState(false);

  // Subscribe to real modules and lessons in the centralized store
  const allModules = useCurriculumStore((state) => state.modules);
  const allLessons = useCurriculumStore((state) => state.lessons);

  useEffect(() => {
    if (isValidCourseId(activeCourseId)) {
      setIsLoadingModules(true);
      curriculumService
        .fetchModules(activeCourseId)
        .catch((err) => console.warn("Failed to fetch modules for Course Overview:", err))
        .finally(() => setIsLoadingModules(false));
    }
  }, [activeCourseId]);

  const realModules = allModules
    .filter((m) => m.courseUuid === activeCourseId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const realModuleUuids = realModules.map((m) => m.uuid);
  const realLessons = allLessons.filter((l) => realModuleUuids.includes(l.moduleUuid));

  const totalLessonCount = realLessons.length;
  const totalDurationMinutes = realLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  if (!course) return null;

  // Format Duration string
  const formatDuration = (mins: number) => {
    if (!mins || mins <= 0) return "—";
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remainingMins}m`;
    }
    return `${remainingMins} minutes`;
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Course Administration</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">Manage curriculum, student access, and publish settings</p>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/courses/${course.id}/curriculum`}>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Module / Lesson
            </Button>
          </Link>
          <Link to={`/courses/${course.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-[#111827] border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-[rgba(37,99,235,0.10)] dark:hover:text-[#93C5FD]"
            >
              Course Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">Curriculum Modules</span>
          <p className="text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
            {isLoadingModules ? "..." : realModules.length}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#94A3B8] font-normal">
            {totalLessonCount > 0 ? `${totalLessonCount} total lessons` : "Structured learning units"}
          </p>
        </Card>

        <Card className="p-4 space-y-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">Pricing / Tuition</span>
          <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {course.is_free ? "FREE" : course.price ? `${course.currency || "USD"} ${course.price}` : "Not configured"}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-[#94A3B8] font-normal">Enrollment fee setting</p>
        </Card>

        <Card className="p-4 space-y-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">Publication Status</span>
          <p className="text-2xl font-semibold text-[#2563EB] dark:text-[#3B82F6]">{course.status || "—"}</p>
          <p className="text-[11px] text-slate-400 dark:text-[#94A3B8] font-normal">
            {course.is_published && course.published_at
              ? `Published on ${new Date(course.published_at).toLocaleDateString()}`
              : "Draft / Private"}
          </p>
        </Card>
      </div>

      {/* Course Details Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-100 dark:border-[#263244] pb-2">
              Short Description
            </h3>
            <p className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed font-normal">
              {course.short_description || "Not configured"}
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-100 dark:border-[#263244] pb-2">
              Full Course Description
            </h3>
            <div className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed font-normal whitespace-pre-wrap">
              {course.description || "Not configured"}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 space-y-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider border-b border-slate-100 dark:border-[#263244] pb-2">
              Course Metadata
            </h3>
            <div className="space-y-2 text-xs font-normal">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Category</span>
                <span className="font-semibold text-slate-900 dark:text-[#CBD5E1]">
                  {course.category?.name || "Not configured"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Difficulty Level</span>
                <span className="font-semibold text-slate-900 dark:text-[#CBD5E1]">{course.level || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Language</span>
                <span className="font-semibold text-slate-900 dark:text-[#CBD5E1]">{course.language || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Total Duration</span>
                <span className="font-semibold text-slate-900 dark:text-[#CBD5E1]">
                  {formatDuration(totalDurationMinutes > 0 ? totalDurationMinutes : course.duration_minutes)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#263244]">
                <span className="text-slate-500 dark:text-[#94A3B8]">Certificate Enabled</span>
                <span className="font-semibold text-slate-900 dark:text-[#CBD5E1]">
                  {course.certificate_enabled === true ? "Yes" : course.certificate_enabled === false ? "No" : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-[#94A3B8]">Demo Access</span>
                <span className="font-semibold text-slate-900 dark:text-[#CBD5E1]">
                  {course.demo_enabled
                    ? `Active ${course.demo_duration_days ? `(${course.demo_duration_days} days)` : ""}`
                    : "Disabled"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

