import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Award,
  Video,
  HelpCircle,
  Plus,
  ReceiptIndianRupee,
  Activity,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useCurriculumStore } from '../store/curriculum.store';
import { useCourseFeaturesStore } from '../store/courseFeatures.store';




export const CourseOverviewPage: React.FC = () => {
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();

  // Stable Store Subscriptions
  const allModules = useCurriculumStore((state) => state.modules);
  const allLessons = useCurriculumStore((state) => state.lessons);
  const features = useCourseFeaturesStore((state) => state.getCourseFeatures(courseUuid));


  const modules = useMemo(
    () => allModules.filter((m) => m.courseUuid === courseUuid).sort((a, b) => a.sortOrder - b.sortOrder),
    [allModules, courseUuid]
  );

  const moduleUuids = useMemo(() => modules.map((m) => m.uuid), [modules]);

  const courseLessons = useMemo(
    () => allLessons.filter((l) => moduleUuids.includes(l.moduleUuid)),
    [allLessons, moduleUuids]
  );

  const totalLessons = courseLessons.length;
  const publishedCount = courseLessons.filter((l) => l.status === 'published').length;
  const draftCount = totalLessons - publishedCount;

  return (
    <div className="space-y-4 sm:space-y-5 text-left font-sans">
      {/* 1. COMPACT QUICK MANAGEMENT SHORTCUTS GRID */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-[#0F172A] uppercase tracking-wider">Quick Actions</h3>
        </div>

        {/* Primary Action + 2-Column Mobile Grid */}
        <div className="space-y-2">
          <Link to={`/courses/${courseUuid}/curriculum`} className="block w-full">
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4 stroke-[2] text-white" />}
              className="w-full h-10 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-2xs cursor-pointer flex items-center justify-center gap-2"
            >
              Add Module / Lesson
            </Button>
          </Link>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
            <Link to={`/courses/${courseUuid}/students`} className="block">
              <div className="h-10 px-3 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between text-[#0F172A] transition-colors shadow-2xs">
                <span className="flex items-center gap-2 truncate">
                  <Users className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                  <span>Students</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              </div>
            </Link>

            {features.assignments && (
              <Link to={`/courses/${courseUuid}/assignments`} className="block">
                <div className="h-10 px-3 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between text-[#0F172A] transition-colors shadow-2xs">
                  <span className="flex items-center gap-2 truncate">
                    <FileCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Assignments</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                </div>
              </Link>
            )}

            {features.quizzes && (
              <Link to={`/courses/${courseUuid}/quizzes`} className="block">
                <div className="h-10 px-3 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between text-[#0F172A] transition-colors shadow-2xs">
                  <span className="flex items-center gap-2 truncate">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Quizzes</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                </div>
              </Link>
            )}

            {features.liveClasses && (
              <Link to={`/courses/${courseUuid}/live-sessions`} className="block">
                <div className="h-10 px-3 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between text-[#0F172A] transition-colors shadow-2xs">
                  <span className="flex items-center gap-2 truncate">
                    <Video className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Live Session</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                </div>
              </Link>
            )}

            {features.feeCollection && (
              <Link to={`/courses/${courseUuid}/fee-collection`} className="block">
                <div className="h-10 px-3 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between text-[#0F172A] transition-colors shadow-2xs">
                  <span className="flex items-center gap-2 truncate">
                    <ReceiptIndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Fee Collection</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL METRICS (DIFFERENT FROM HEADER SUMMARY) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Completion Rate */}
        <Card padding="sm" className="space-y-1.5 bg-white border border-[#E2E8F0] shadow-2xs p-3">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase text-[#64748B]">
            <span>Completion Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-base sm:text-lg font-medium text-[#0F172A] block">68.4%</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[68%]" />
          </div>
          <span className="text-[10px] text-[#64748B] font-normal block pt-0.5">Average student progress</span>
        </Card>

        {/* Pending Submissions */}
        <Card padding="sm" className="space-y-1 bg-white border border-[#E2E8F0] shadow-2xs p-3">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase text-[#64748B]">
            <span>Submissions</span>
            <FileCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-base sm:text-lg font-medium text-[#0F172A] block">3 Pending</span>
          <span className="text-[10px] text-amber-600 font-medium block pt-0.5">Requires grading</span>
        </Card>

        {/* Content Status (Clean explicit copy, NO "Pub") */}
        <Card padding="sm" className="space-y-1 bg-white border border-[#E2E8F0] shadow-2xs p-3">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase text-[#64748B]">
            <span>Content Status</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-base sm:text-lg font-medium text-emerald-600 block">{publishedCount} Published</span>
          <span className="text-[10px] text-[#64748B] font-normal block">
            {draftCount === 1 ? '1 Draft' : `${draftCount} Drafts`}
          </span>
        </Card>

        {/* Upcoming Live Session or Discussion Activity */}
        {features.liveClasses ? (
          <Card padding="sm" className="space-y-1 bg-white border border-[#E2E8F0] shadow-2xs p-3">
            <div className="flex items-center justify-between text-[10px] font-medium uppercase text-[#64748B]">
              <span>Next Live Session</span>
              <Video className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-[#0F172A] block truncate">Tomorrow 6:00 PM</span>
            <span className="text-[10px] text-[#2563EB] font-medium block pt-0.5">Q&A & Code Review</span>
          </Card>
        ) : (
          <Card padding="sm" className="space-y-1 bg-white border border-[#E2E8F0] shadow-2xs p-3">
            <div className="flex items-center justify-between text-[10px] font-medium uppercase text-[#64748B]">
              <span>Community</span>
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-base sm:text-lg font-medium text-[#0F172A] block">12 Threads</span>
            <span className="text-[10px] text-emerald-600 font-medium block">4 active discussions</span>
          </Card>
        )}
      </div>

      {/* 3. DETAILS & ACTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Learning Progress Breakdown */}
        <Card padding="md" className="space-y-3 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs">
          <h3 className="text-xs font-medium text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
            Learning Progress
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-[#64748B] font-medium">Not Started</span>
              <strong className="text-[#0F172A]">35 Students (8.3%)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-[#64748B] font-medium">In Progress</span>
              <strong className="text-[#2563EB]">290 Students (69.0%)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-[#64748B] font-medium">Completed</span>
              <strong className="text-emerald-700">95 Students (22.6%)</strong>
            </div>
          </div>
        </Card>

        {/* Enabled Features Summary */}
        <Card padding="md" className="space-y-3 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs">
          <h3 className="text-xs font-medium text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
            Enabled Features
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#0F172A]">
            <span className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#2563EB]" /> Video Streaming
            </span>
            {features.quizzes && (
              <span className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Quizzes
              </span>
            )}
            {features.assignments && (
              <span className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-purple-600" /> Assignments
              </span>
            )}
            {features.certificates && (
              <span className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" /> Certificates
              </span>
            )}
          </div>
        </Card>

        {/* Recent Activity Timeline */}
        <Card padding="md" className="space-y-3 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-2xs">
          <h3 className="text-xs font-medium text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 flex items-center justify-between">
            <span>Recent Activity</span>
            <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
          </h3>
          <div className="space-y-2 text-xs text-[#64748B]">
            <div className="py-1 border-b border-slate-50">
              <strong className="text-[#0F172A] font-medium block">24 new enrollments</strong>
              <span className="text-[10px] font-normal">Today at 09:30 AM</span>
            </div>
            <div className="py-1 border-b border-slate-50">
              <strong className="text-[#0F172A] font-medium block">Module 2 updated</strong>
              <span className="text-[10px] font-normal">Yesterday at 04:15 PM</span>
            </div>
            <div className="py-1">
              <strong className="text-[#0F172A] font-medium block">3 assignment submissions</strong>
              <span className="text-[10px] font-normal">Aug 08, 2026</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
