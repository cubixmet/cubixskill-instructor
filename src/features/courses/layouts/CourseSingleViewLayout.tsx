import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Edit3,
  Check,
  Eye,
  Zap,
} from 'lucide-react';
import { useParams, Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useCourseStore } from '../store/course.store';
import { useCurriculumStore } from '../store/curriculum.store';
import { useCourseFeaturesStore } from '../store/courseFeatures.store';
import {
  COURSE_NAV_SECTIONS,
} from '../config/courseNavigation.config';


export const CourseSingleViewLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();

  // State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Refs for Mobile Tab Auto-Scroll
  const mobileTabNavRef = useRef<HTMLDivElement>(null);
  const activeMobileTabRef = useRef<HTMLAnchorElement>(null);

  // Store Subscriptions
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);
  const deleteCourse = useCourseStore((state) => state.deleteCourse);
  const allModules = useCurriculumStore((state) => state.modules);
  const allLessons = useCurriculumStore((state) => state.lessons);

  // Course Details
  const course = useMemo(() => {
    return (
      coursesByUuid[courseUuid] || {
        uuid: courseUuid,
        title: 'React – The Complete Guide 2024',
        shortDescription:
          'Master React from scratch and build production-ready web applications. Learn components, hooks, state management, routing, and more.',
        category: 'Web Development',
        subcategory: 'React',
        level: 'Advanced',
        language: 'English',
        status: 'published',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
        updatedAt: '2026-08-03T10:00:00Z',
        createdAt: '2024-01-10T10:00:00Z',
        enrolledStudentsCount: 420,
        rating: 4.8,
        reviewCount: 128,
        creditsPerStudent: 17,
      }
    );
  }, [coursesByUuid, courseUuid]);

  // Derived Curriculum
  const modules = useMemo(
    () => allModules.filter((m) => m.courseUuid === courseUuid).sort((a, b) => a.sortOrder - b.sortOrder),
    [allModules, courseUuid]
  );

  const moduleUuids = useMemo(() => modules.map((m) => m.uuid), [modules]);

  const courseLessons = useMemo(
    () => allLessons.filter((l) => moduleUuids.includes(l.moduleUuid)),
    [allLessons, moduleUuids]
  );

  const totalLessons = courseLessons.length || 36;
  const totalDurationMinutes = useMemo(
    () => courseLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0),
    [courseLessons]
  );

  const hours = Math.floor(totalDurationMinutes / 60) || 8;
  const mins = totalDurationMinutes % 60 || 45;
  const durationFormatted = `${hours}h ${mins}m`;

  // Detect current active tab from pathname
  const pathParts = location.pathname.split('/');
  const currentRoute = pathParts[pathParts.length - 1] || 'overview';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = () => {
    deleteCourse(course.uuid);
    setIsDeleteModalOpen(false);
    showToast('Course deleted successfully.');
    navigate('/courses');
  };

  // Feature Switches
  const features = useCourseFeaturesStore((state) => state.getCourseFeatures(courseUuid));

  // Dynamically filter sections by enabled feature switches
  const availableSections = useMemo(() => {
    return COURSE_NAV_SECTIONS.filter((sec) => {
      if (!sec.requiredFeature) return true;
      switch (sec.requiredFeature) {
        case 'assignments':
          return features.assignments;
        case 'quizzes':
          return features.quizzes;
        case 'live_classes':
          return features.liveClasses;
        case 'community_chat':
          return features.communityChat || features.oneOnOneChat;
        case 'certificates':
          return features.certificates;
        case 'fee_collection':
          return features.feeCollection;
        case 'progress_controls':
          return features.progressControls;
        default:
          return true;
      }
    });
  }, [features]);

  // Auto-scroll active tab into view on route change
  useEffect(() => {
    if (activeMobileTabRef.current && mobileTabNavRef.current) {
      const container = mobileTabNavRef.current;
      const activeElement = activeMobileTabRef.current;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      // Scroll inside container only if out of bounds
      if (activeRect.left < containerRect.left || activeRect.right > containerRect.right) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentRoute]);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 text-left font-sans pb-[calc(96px+env(safe-area-inset-bottom))] no-scrollbar"
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. COMPACT HEADER BAR */}
      <div className="space-y-3">
        {/* Desktop Breadcrumb & Actions */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#64748B]">
            <Link to="/courses" className="hover:text-[#0F172A] transition-colors">
              Courses
            </Link>
            <span>›</span>
            <span className="text-[#0F172A] font-semibold truncate max-w-sm">{course.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye className="w-3.5 h-3.5 text-[#64748B]" />}
              onClick={() => showToast('Course preview opened.')}
              className="h-9 px-3 text-xs font-semibold"
            >
              Preview
            </Button>
            <Link to={`/courses/${courseUuid}/edit`}>
              <Button size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />} className="h-9 px-3 text-xs font-semibold bg-[#2563EB]">
                Edit Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Header Bar */}
        <div className="sm:hidden flex items-start justify-between gap-2 border-b border-[#E2E8F0] pb-2.5">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="p-1 -ml-1 text-[#0F172A] hover:bg-slate-100 rounded-lg flex items-center gap-1.5 cursor-pointer min-w-0 flex-1 text-left"
          >
            <ArrowLeft className="w-5 h-5 shrink-0 text-[#0F172A]" />
            <span className="text-sm font-medium text-[#0F172A] leading-tight line-clamp-2 break-words">{course.title}</span>
          </button>

          <Badge variant={course.status === 'published' ? 'success' : 'secondary'} size="sm" dot className="shrink-0 mt-0.5 font-medium">
            {course.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>

        {/* Compact Hero Card (Reduced Height) */}
        <Card padding="sm" className="bg-white border border-[#E2E8F0] p-3 sm:p-4 rounded-2xl shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <h1 className="text-xs sm:text-sm md:text-base font-medium text-[#0F172A] leading-snug line-clamp-2 break-words">
                  {course.title}
                </h1>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] font-normal flex-wrap leading-none">
                  <span className="inline-flex items-center gap-1">📁 {course.category}</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1">📊 {course.level}</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="w-full sm:w-auto grid grid-cols-4 sm:flex items-center gap-2 sm:gap-4 text-center sm:text-right pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0] shrink-0">
              <div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A] block">
                  {course.enrolledStudentsCount || 420}
                </span>
                <span className="text-[10px] text-[#64748B] font-normal">Students</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A] block">
                  {totalLessons}
                </span>
                <span className="text-[10px] text-[#64748B] font-normal">Lessons</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A] block">
                  {durationFormatted}
                </span>
                <span className="text-[10px] text-[#64748B] font-normal">Duration</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-[#2563EB] block flex items-center justify-center sm:justify-end gap-0.5">
                  <Zap className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]/20 shrink-0" />
                  <span>{course.creditsPerStudent || 17}</span>
                </span>
                <span className="text-[10px] text-[#64748B] font-normal">Credits/Stud</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. DESKTOP TABS NAVIGATION */}
      <div className="hidden md:block sticky top-0 z-20">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 h-13 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
            {availableSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = currentRoute === sec.route;

              return (
                <NavLink
                  key={sec.id}
                  to={`/courses/${courseUuid}/${sec.route}`}
                  className={`h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  <span>{sec.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MOBILE HORIZONTAL SCROLLING TABS STRIP (<768px) */}
      <div
        ref={mobileTabNavRef}
        className="md:hidden sticky top-0 z-30 bg-white border border-[#E2E8F0] rounded-2xl p-1.5 shadow-2xs overflow-x-auto no-scrollbar touch-pan-x w-full max-w-full min-w-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-center gap-1.5 flex-nowrap w-max px-1">
          {availableSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = currentRoute === sec.route;

            return (
              <NavLink
                key={sec.id}
                ref={isActive ? activeMobileTabRef : undefined}
                to={`/courses/${courseUuid}/${sec.route}`}
                className={`h-10 px-3.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 flex-none ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                <span>{sec.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVE SUB-ROUTE OUTLET */}
      <div className="min-h-[500px]">
        <Outlet />
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Course?">
        <div className="space-y-4 text-xs font-sans text-left">
          <p className="text-[#64748B]">
            Are you sure you want to delete <strong className="text-[#0F172A]">{course.title}</strong>?
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
