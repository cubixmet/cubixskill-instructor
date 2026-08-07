import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  CircleHelp,
  Award,
  MessageSquare,
  BarChart3,
  Settings,
  ArrowLeft,
  Edit3,
  Trash2,
  Copy,
  Check,
  Eye,
  MoreVertical,
  Clock,
  Zap,
  Video,
  Share2,
  CheckCircle2,
  Info,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useParams, Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { CourseRating } from '../components/curriculum/CourseRating';
import { useCourseStore } from '../store/course.store';
import { useCurriculumStore } from '../store/curriculum.store';
import { useCourseFeaturesStore } from '../store/courseFeatures.store';

export type CourseTabId =
  | 'overview'
  | 'curriculum'
  | 'students'
  | 'assignments'
  | 'quizzes'
  | 'certificates'
  | 'discussions'
  | 'announcements'
  | 'reports'
  | 'settings';

interface TabItemConfig {
  id: CourseTabId;
  label: string;
  icon: React.ElementType;
  count?: string | number;
}

export const CourseSingleViewLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();

  // State
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Direct Primitive Store Subscriptions
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);
  const updateCourse = useCourseStore((state) => state.updateCourse);
  const deleteCourse = useCourseStore((state) => state.deleteCourse);
  const allModules = useCurriculumStore((state) => state.modules);
  const allLessons = useCurriculumStore((state) => state.lessons);

  // Course Details
  const course = useMemo(() => {
    return coursesByUuid[courseUuid] || {
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
    };
  }, [coursesByUuid, courseUuid]);

  // Derived Curriculum Selectors
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
  const currentTab = (pathParts[pathParts.length - 1] as CourseTabId) || 'overview';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleTogglePublish = () => {
    const nextStatus = course.status === 'published' ? 'draft' : 'published';
    updateCourse(course.uuid, { status: nextStatus });
    showToast(`Course status updated to ${nextStatus.toUpperCase()}`);
    setIsMoreMenuOpen(false);
  };

  const handleConfirmDelete = () => {
    deleteCourse(course.uuid);
    setIsDeleteModalOpen(false);
    showToast('Course deleted successfully.');
    navigate('/courses');
  };

  // Feature Switches
  const features = useCourseFeaturesStore((state) => state.getCourseFeatures(courseUuid));

  const allTabs: TabItemConfig[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen, count: totalLessons },
    { id: 'students', label: 'Students', icon: Users, count: course.enrolledStudentsCount || 420 },
    { id: 'assignments', label: 'Assignments', icon: ClipboardCheck, count: 3 },
    { id: 'quizzes', label: 'Quizzes', icon: CircleHelp, count: 5 },
    { id: 'certificates', label: 'Certificates', icon: Award, count: 32 },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare, count: 18 },
    { id: 'live-sessions', label: 'Live Sessions', icon: Video, count: 1 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'features', label: 'Features', icon: SlidersHorizontal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const tabs = allTabs.filter((t) => {
    if (t.id === 'assignments' && !features.assignments) return false;
    if (t.id === 'quizzes' && !features.quizzes) return false;
    if (t.id === 'certificates' && !features.courseCertificates) return false;
    if (t.id === 'discussions' && !features.courseDiscussion && !features.courseChat) return false;
    if (t.id === 'reports' && !features.studentReports && !features.courseReports) return false;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-5 text-left font-sans pb-[calc(96px+env(safe-area-inset-bottom))] no-scrollbar"
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. BREADCRUMB HEADER (DESKTOP) & MOBILE TOP HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="hidden sm:flex items-center gap-2 text-[12px] font-medium text-[#64748B]">
          <Link to="/courses" className="hover:text-[#0F172A] transition-colors">
            Courses
          </Link>
          <span>›</span>
          <span className="text-[#0F172A] font-semibold">{course.title}</span>
        </div>

        <div className="sm:hidden flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="p-2 -ml-2 rounded-xl text-[#0F172A] hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[16px] font-semibold">Course Details</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-2 rounded-xl text-[#0F172A] hover:bg-slate-100 cursor-pointer"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. COURSE HEADER CARD */}
      <Card padding="md" className="bg-white border border-[#E2E8F0] p-4 sm:p-6 rounded-[16px] shadow-xs">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4 w-full">
            <div className="flex items-start gap-3 sm:gap-4 w-full">
              <div className="w-16 h-16 sm:w-40 sm:h-32 rounded-[14px] sm:rounded-[16px] bg-[#0B1329] border border-[#1E293B] overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[16px] sm:text-[24px] font-semibold text-[#0F172A] tracking-tight leading-snug line-clamp-2">
                    {course.title}
                  </h1>
                </div>
                <div>
                  <Badge variant={course.status === 'published' ? 'success' : 'secondary'} size="sm" dot>
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="w-full space-y-2">
              <p className="text-[13px] font-normal text-[#64748B] max-w-3xl leading-relaxed hidden sm:block">
                {course.shortDescription}
              </p>

              <div className="flex flex-row items-center gap-1.5 sm:gap-3 text-[11px] sm:text-[12px] font-medium text-[#64748B] flex-wrap pt-0.5 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                  📁 {course.category}
                </span>
                {course.subcategory && (
                  <span className="inline-flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                    🏷️ {course.subcategory}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                  📊 {course.level}
                </span>
                <span className="inline-flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                  🌐 {course.language}
                </span>
              </div>

              <div className="text-[11px] text-[#64748B] pt-0.5 hidden sm:block">
                Last updated 2 days ago • Created on 10 Jan 2024
              </div>

              <button
                type="button"
                onClick={() => setShowMobileDetails(!showMobileDetails)}
                className="sm:hidden text-[11px] font-semibold text-[#2563EB] flex items-center gap-1 pt-1 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showMobileDetails ? 'Hide Details' : 'Show Details'}</span>
              </button>

              {showMobileDetails && (
                <p className="sm:hidden text-[12px] text-[#64748B] pt-2 border-t border-[#E2E8F0] leading-relaxed">
                  {course.shortDescription}
                </p>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 shrink-0 justify-end">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye className="w-4 h-4 text-[#64748B]" />}
              onClick={() => showToast('Course preview opened.')}
              className="h-10 px-4 bg-white border-[#E2E8F0] text-[#0F172A] text-[13px] font-semibold inline-flex flex-row items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Preview Course
            </Button>

            <Link to={`/courses/${courseUuid}/edit`} className="shrink-0">
              <Button
                size="sm"
                leftIcon={<Edit3 className="w-4 h-4" />}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold h-10 px-4 rounded-xl shadow-xs inline-flex flex-row items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer text-[13px]"
              >
                Edit Course
              </Button>
            </Link>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="w-10 h-10 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#64748B] flex items-center justify-center cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-xl border border-[#E2E8F0] shadow-xl py-1.5 z-30 text-xs font-medium text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      showToast('Course duplicated successfully.');
                    }}
                    className="w-full px-3.5 py-2 hover:bg-slate-50 text-[#0F172A] flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#64748B]" /> Duplicate Course
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      handleTogglePublish();
                    }}
                    className="w-full px-3.5 py-2 hover:bg-slate-50 text-[#0F172A] flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    {course.status === 'published' ? 'Unpublish Course' : 'Publish Course'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      showToast('Course link copied to clipboard.');
                    }}
                    className="w-full px-3.5 py-2 hover:bg-slate-50 text-[#0F172A] flex items-center gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#64748B]" /> Copy Course Link
                  </button>
                  <div className="border-t border-[#E2E8F0] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete Course
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 3. COURSE SUMMARY STRIP */}
      <Card padding="md" className="bg-white border border-[#E2E8F0] p-4 rounded-[16px] shadow-xs">
        <div className="hidden lg:grid grid-cols-6 divide-x divide-[#E2E8F0] text-center">
          <div className="px-3 space-y-0.5">
            <span className="text-[22px] font-bold text-[#0F172A] block">{course.enrolledStudentsCount || 420}</span>
            <span className="text-[12px] font-medium text-[#64748B] flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#64748B]" /> Students
            </span>
          </div>

          <div className="px-3 space-y-0.5">
            <span className="text-[22px] font-bold text-[#0F172A] block">{modules.length || 12}</span>
            <span className="text-[12px] font-medium text-[#64748B] flex items-center justify-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#64748B]" /> Modules
            </span>
          </div>

          <div className="px-3 space-y-0.5">
            <span className="text-[22px] font-bold text-[#0F172A] block">{totalLessons || 36}</span>
            <span className="text-[12px] font-medium text-[#64748B] flex items-center justify-center gap-1">
              <Video className="w-3.5 h-3.5 text-[#64748B]" /> Lessons
            </span>
          </div>

          <div className="px-3 space-y-0.5">
            <span className="text-[22px] font-bold text-[#0F172A] block">{durationFormatted}</span>
            <span className="text-[12px] font-medium text-[#64748B] flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#64748B]" /> Duration
            </span>
          </div>

          <div className="px-3 space-y-0.5 flex flex-col items-center justify-center">
            <CourseRating rating={course.rating || 4.8} reviewCount={(course as { reviewCount?: number }).reviewCount || 128} />
            <span className="text-[11px] text-[#64748B] font-medium block pt-0.5">Course Rating</span>
          </div>

          <div className="px-3 space-y-0.5">
            <span className="text-[22px] font-bold text-[#0F172A] block">{course.creditsPerStudent || 17}</span>
            <span className="text-[12px] font-medium text-[#64748B] flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#2563EB]" /> Credits / Student
            </span>
          </div>
        </div>

        <div className="lg:hidden space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center border-b border-[#E2E8F0] pb-3">
            <div>
              <span className="text-[18px] font-bold text-[#0F172A] block">{course.enrolledStudentsCount || 420}</span>
              <span className="text-[10px] font-medium text-[#64748B]">Students</span>
            </div>
            <div>
              <span className="text-[18px] font-bold text-[#0F172A] block">{modules.length || 12}</span>
              <span className="text-[10px] font-medium text-[#64748B]">Modules</span>
            </div>
            <div>
              <span className="text-[18px] font-bold text-[#0F172A] block">{totalLessons || 36}</span>
              <span className="text-[10px] font-medium text-[#64748B]">Lessons</span>
            </div>
            <div>
              <span className="text-[18px] font-bold text-[#0F172A] block">{durationFormatted}</span>
              <span className="text-[10px] font-medium text-[#64748B]">Duration</span>
            </div>
          </div>

          <div className="flex items-center justify-around text-center pt-1">
            <CourseRating rating={course.rating || 4.8} reviewCount={(course as { reviewCount?: number }).reviewCount || 128} />
            <div className="text-left">
              <strong className="text-[16px] font-bold text-[#0F172A] block">{course.creditsPerStudent || 17} Credits</strong>
              <span className="text-[10px] text-[#64748B] font-medium">Per Student</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. PREMIUM ENTERPRISE SAAS TAB NAVIGATION CARD (DESKTOP / TABLET >=768px) */}
      <div className="hidden md:block sticky top-0 z-20">
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-2 h-[60px] flex items-center shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <NavLink
                  key={tab.id}
                  to={`/courses/${courseUuid}/${tab.id}`}
                  className="relative shrink-0 flex-1 min-w-fit"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className={`relative z-10 h-10 px-3.5 rounded-[12px] flex items-center justify-center gap-2 text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive
                        ? 'text-white font-semibold'
                        : 'text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF]'
                      }`}
                  >
                    {/* Active Sliding Pill Background */}
                    {isActive && (
                      <div className="absolute inset-0 bg-[#2563EB] rounded-[12px] shadow-md shadow-[#2563EB]/25 z-[-1]" />
                    )}

                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                    <span>{tab.label}</span>

                    {/* Optional Count Badge */}
                    {tab.count !== undefined && (
                      <span
                        className={`h-[20px] px-2 rounded-full text-[11px] font-semibold flex items-center justify-center transition-colors ${isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-[#EFF6FF] text-[#2563EB]'
                          }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </motion.div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MOBILE ACCORDION TABS (<768px - SINGLE EXPAND, ROTATING CHEVRON) */}
      <div className="md:hidden space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isExpanded = currentTab === tab.id;
          return (
            <Card key={tab.id} padding="none" className="bg-white border border-[#E2E8F0] rounded-[14px] overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => {
                  if (!isExpanded) {
                    navigate(`/courses/${courseUuid}/${tab.id}`);
                  }
                }}
                className={`w-full p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isExpanded ? 'bg-blue-50/70 text-[#2563EB] font-semibold' : 'text-[#0F172A] font-semibold hover:bg-slate-50'
                }`}
              >
                <span className="text-[13px] flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isExpanded ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="h-[18px] px-2 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'}`} />
              </button>
            </Card>
          );
        })}
      </div>

      {/* 5. ACTIVE TAB OUTLET CONTAINER */}
      <div className="min-h-[500px]">
        <Outlet />
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Course?">
        <div className="space-y-4 text-[13px] text-left">
          <p className="text-[#64748B]">
            Are you sure you want to delete <strong className="text-[#0F172A]">{course.title}</strong>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
