import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Layers,
  Clock,
  CheckCircle2,
  FileCheck,
  Zap,
  TrendingUp,
  Award,
  Video,
  HelpCircle,
  Shield,
  Lock,
  Plus,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useCurriculumStore } from '../store/curriculum.store';
import { useCourseStore } from '../store/course.store';

export const CourseOverviewPage: React.FC = () => {
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();

  // Stable Store Subscriptions
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);
  const allModules = useCurriculumStore((state) => state.modules);
  const allLessons = useCurriculumStore((state) => state.lessons);

  const course = coursesByUuid[courseUuid] || {
    uuid: courseUuid,
    title: 'Fullstack React 19 & TypeScript Masterclass',
    subtitle: 'Build enterprise Next.js applications with Zustand, React Query & Tailwind v4.',
    category: 'Web Development',
    level: 'Advanced Level',
    language: 'English',
    status: 'published',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
    updatedAt: '2026-08-05T08:00:00Z',
    enrolledStudentsCount: 420,
    rating: 4.9,
    totalRevenue: 1259580,
    creditsPerStudent: 17,
    isFree: false,
    price: 3499,
  };

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
  const totalDuration = courseLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const publishedCount = courseLessons.filter((l) => l.status === 'published').length;

  return (
    <div className="space-y-6 text-left font-sans">
      {/* 6-CARD SUMMARY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card padding="sm" className="space-y-1 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-lg font-black text-slate-900 block">{course.enrolledStudentsCount}</span>
          <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +24 this week
          </span>
        </Card>

        <Card padding="sm" className="space-y-1 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Lessons</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-lg font-black text-slate-900 block">{totalLessons} Lessons</span>
          <span className="text-[10px] text-slate-500 font-semibold">{modules.length} Modules</span>
        </Card>

        <Card padding="sm" className="space-y-1 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Duration</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-lg font-black text-slate-900 block">{totalDuration} Mins</span>
          <span className="text-[10px] text-blue-600 font-extrabold">Active Content</span>
        </Card>

        <Card padding="sm" className="space-y-1 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Published Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-lg font-black text-emerald-600 block">{publishedCount} Pub</span>
          <span className="text-[10px] text-slate-500 font-semibold">{totalLessons - publishedCount} Draft</span>
        </Card>

        <Card padding="sm" className="space-y-1 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Pending Reviews</span>
            <FileCheck className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-lg font-black text-slate-900 block">3 Submissions</span>
          <span className="text-[10px] text-sky-600 font-extrabold">Needs grading</span>
        </Card>

        <Card padding="sm" className="space-y-1 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Credits / Student</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-lg font-black text-indigo-700 block">{course.creditsPerStudent} Credits</span>
          <span className="text-[10px] text-slate-500 font-semibold">Media usage</span>
        </Card>
      </div>

      {/* THREE COLUMN DETAILS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card padding="md" className="space-y-3 bg-white border border-slate-200/80">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Learning Progress
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Not Started</span>
              <strong className="text-slate-900">120 Students (8.4%)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">In Progress</span>
              <strong className="text-blue-700">980 Students (69.0%)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Completed</span>
              <strong className="text-emerald-700">320 Students (22.5%)</strong>
            </div>
          </div>
        </Card>

        <Card padding="md" className="space-y-3 bg-white border border-slate-200/80">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Selected Course Features
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            <span className="p-2 bg-slate-50 rounded-xl border flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-blue-600" /> Video Stream
            </span>
            <span className="p-2 bg-slate-50 rounded-xl border flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Quizzes
            </span>
            <span className="p-2 bg-slate-50 rounded-xl border flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-purple-600" /> Assignments
            </span>
            <span className="p-2 bg-slate-50 rounded-xl border flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> Certificates
            </span>
          </div>
        </Card>

        <Card padding="md" className="space-y-3 bg-white border border-slate-200/80">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Learning Rules
          </h3>
          <div className="space-y-2 text-xs font-semibold text-slate-600">
            <p className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Sequential module progression
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Video watch percentage (80%)
            </p>
            <p className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" /> Quiz pass threshold (75%)
            </p>
          </div>
        </Card>
      </div>

      {/* QUICK ACTIONS ROW */}
      <Card padding="md" className="space-y-3 bg-white border border-slate-200/80">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to={`/courses/${courseUuid}/curriculum`}>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}>
              Add Module
            </Button>
          </Link>
          <Link to={`/courses/${courseUuid}/students`}>
            <Button size="sm" variant="outline" leftIcon={<Users className="w-4 h-4" />}>
              Enroll Student
            </Button>
          </Link>
          <Link to={`/courses/${courseUuid}/assignments`}>
            <Button size="sm" variant="outline" leftIcon={<FileCheck className="w-4 h-4" />}>
              Create Assignment
            </Button>
          </Link>
          <Link to={`/courses/${courseUuid}/quizzes`}>
            <Button size="sm" variant="outline" leftIcon={<HelpCircle className="w-4 h-4" />}>
              Create Quiz
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
