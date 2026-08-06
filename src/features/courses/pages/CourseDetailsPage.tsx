import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Layers,
  Video,
  FileText,
  FileCheck,
  HelpCircle,
  Award,
  Users,
  MessageSquare,
  Megaphone,
  BarChart3,
  Settings,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Trash2,
  Share2,
  Copy,
  Check,
  Eye,
  MoreVertical,
  Globe,
  Clock,
  Zap,
  Activity,
  UserPlus,
  X,
  LayoutGrid,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { CourseRating } from '../components/curriculum/CourseRating';
import { CourseCurriculumPage } from './CourseCurriculumPage';
import { CourseStudentsPage } from './CourseStudentsPage';
import { CourseAssignmentsPage } from './CourseAssignmentsPage';
import { CourseQuizzesPage } from './CourseQuizzesPage';
import { CourseCertificatesPage } from './CourseCertificatesPage';
import { CourseDiscussionsPage } from './CourseDiscussionsPage';
import { CourseAnnouncementsPage } from './CourseAnnouncementsPage';
import { CourseReportsPage } from './CourseReportsPage';
import { CourseSettingsPage } from './CourseSettingsPage';
import { useCourseStore } from '../store/course.store';
import { useCurriculumStore } from '../store/curriculum.store';

export type CourseTab =
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

export const CourseDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();

  // State
  const [activeTab, setActiveTab] = useState<CourseTab>('overview');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMoreTabsOpen, setIsMobileMoreTabsOpen] = useState(false);
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
      enrolledStudentsCount: 245,
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

  const totalLessons = courseLessons.length;
  const totalDurationMinutes = useMemo(
    () => courseLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0),
    [courseLessons]
  );

  const hours = Math.floor(totalDurationMinutes / 60) || 8;
  const mins = totalDurationMinutes % 60 || 45;
  const durationFormatted = `${hours}h ${mins}m`;

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

  const tabs: { id: CourseTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'students', label: 'Students' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'discussions', label: 'Discussions' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
  ];

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

      {/* 2. COURSE HEADER CARD (OPTIMIZED FOR MOBILE & DESKTOP) */}
      <Card padding="md" className="bg-white border border-[#E2E8F0] p-4 sm:p-6 rounded-[16px] shadow-xs">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4 w-full">
            {/* Top row on Mobile: Thumbnail + Title & Status */}
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

            {/* Desktop Description + Full Width Metadata Pills Row on Mobile */}
            <div className="w-full space-y-2">
              <p className="text-[13px] font-normal text-[#64748B] max-w-3xl leading-relaxed hidden sm:block">
                {course.shortDescription}
              </p>

              {/* Metadata Pills Row (Horizontal flex wrap on mobile with full width) */}
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

          {/* Desktop Right Header Actions */}
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
            <span className="text-[22px] font-bold text-[#0F172A] block">{course.enrolledStudentsCount || 245}</span>
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
            <CourseRating rating={course.rating || 4.8} reviewCount={course.reviewCount || 128} />
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
              <span className="text-[18px] font-bold text-[#0F172A] block">{course.enrolledStudentsCount || 245}</span>
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
            <CourseRating rating={course.rating || 4.8} reviewCount={course.reviewCount || 128} />
            <div className="text-left">
              <strong className="text-[16px] font-bold text-[#0F172A] block">{course.creditsPerStudent || 17} Credits</strong>
              <span className="text-[10px] text-[#64748B] font-medium">Per Student</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. COURSE NAVIGATION TABS BAR */}
      <div className="border-b border-[#E2E8F0] sticky top-0 bg-white/95 backdrop-blur-md z-20">
        <div className="hidden sm:flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-[13px] font-semibold transition-all border-b-2 shrink-0 cursor-pointer ${isActive
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="sm:hidden flex items-center justify-between pb-1 text-[13px] font-semibold">
          {['overview', 'curriculum', 'students'].map((tId) => {
            const isActive = activeTab === tId;
            return (
              <button
                key={tId}
                type="button"
                onClick={() => setActiveTab(tId as CourseTab)}
                className={`py-2.5 px-3 border-b-2 capitalize transition-colors ${isActive ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#64748B]'
                  }`}
              >
                {tId}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsMobileMoreTabsOpen(true)}
            className="py-2.5 px-3 text-[#64748B] flex items-center gap-1"
          >
            <span>More</span>
            <ChevronRight className="w-3.5 h-3.5 rotate-90" />
          </button>
        </div>
      </div>

      {/* 5. ACTIVE TAB WORKSPACE CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-4 space-y-5">
              <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-[#0F172A]">Course Progress</h3>
                  <select className="h-8 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] font-semibold text-[#0F172A]">
                    <option>Last 7 Months</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>

                <div className="h-44 w-full relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,80 Q 60,70 120,50 T 240,40 T 360,20 L 400,10 L 400,120 L 0,120 Z"
                      fill="url(#blueGradient)"
                    />
                    <path
                      d="M 0,80 Q 60,70 120,50 T 240,40 T 360,20 L 400,10"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3"
                    />
                    {[
                      { x: 0, y: 80 },
                      { x: 60, y: 70 },
                      { x: 120, y: 50 },
                      { x: 180, y: 48 },
                      { x: 240, y: 40 },
                      { x: 300, y: 30 },
                      { x: 360, y: 20 },
                    ].map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                    ))}
                  </svg>
                  <div className="flex justify-between text-[10px] text-[#64748B] font-medium pt-2">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-[15px] font-semibold text-[#0F172A]">Recent Students</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('students')}
                    className="text-[12px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Arjun Nair', email: 'arjun@example.com', progress: 75, status: 'Active' },
                    { name: 'Fathima Rahman', email: 'fathima@example.com', progress: 40, status: 'Active' },
                    { name: 'John Doe', email: 'john@example.com', progress: 100, status: 'Completed' },
                  ].map((st) => (
                    <div key={st.email} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs flex items-center justify-center">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-[13px] font-semibold text-[#0F172A] block">{st.name}</strong>
                          <span className="text-[11px] text-[#64748B] font-normal">{st.email}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <strong className="text-[12px] font-bold text-[#0F172A] block">{st.progress}%</strong>
                        <Badge variant={st.status === 'Completed' ? 'secondary' : 'success'} size="sm">
                          {st.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4 shadow-xs">
                <h3 className="text-[15px] font-semibold text-[#0F172A]">Enrollment Summary</h3>
                <div className="flex items-center justify-between gap-4">
                  <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="3.8"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3.8"
                        strokeDasharray="72, 100"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-[20px] font-bold text-[#0F172A] block leading-none">245</span>
                      <span className="text-[10px] text-[#64748B] font-medium">Students</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[12px] font-medium text-[#0F172A] w-full">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#64748B]">
                        <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Active
                      </span>
                      <strong className="font-semibold">178 (72.7%)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#64748B]">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" /> Completed
                      </span>
                      <strong className="font-semibold">42 (17.1%)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#64748B]">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Inactive
                      </span>
                      <strong className="font-semibold">15 (6.1%)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#64748B]">
                        <span className="w-2 h-2 rounded-full bg-slate-300" /> Refunded
                      </span>
                      <strong className="font-semibold">10 (4.1%)</strong>
                    </div>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-[15px] font-semibold text-[#0F172A]">Recent Activity</h3>
                  <span className="text-[12px] font-semibold text-[#2563EB]">View all</span>
                </div>

                <div className="space-y-3 text-[12px]">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                      <UserPlus className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-full flex justify-between">
                      <div>
                        <strong className="font-semibold text-[#0F172A] block">New student enrolled</strong>
                        <span className="text-[#64748B]">Arjun Nair enrolled in the course</span>
                      </div>
                      <span className="text-[11px] text-[#64748B] shrink-0">2h ago</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-full flex justify-between">
                      <div>
                        <strong className="font-semibold text-[#0F172A] block">Lesson completed</strong>
                        <span className="text-[#64748B]">Fathima Rahman completed 'Components Basics'</span>
                      </div>
                      <span className="text-[11px] text-[#64748B] shrink-0">5h ago</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-full flex justify-between">
                      <div>
                        <strong className="font-semibold text-[#0F172A] block">Assignment submitted</strong>
                        <span className="text-[#64748B]">John Doe submitted assignment 'React Project'</span>
                      </div>
                      <span className="text-[11px] text-[#64748B] shrink-0">1d ago</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-3 space-y-5">
              <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-3 shadow-xs">
                <h3 className="text-[15px] font-semibold text-[#0F172A]">Quick Actions</h3>

                <div className="hidden sm:space-y-1 text-[13px] font-medium text-[#0F172A]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('curriculum')}
                    className="w-full p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Add Module</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('curriculum')}
                    className="w-full p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Add Lesson</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="w-full p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Assignment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('quizzes')}
                    className="w-full p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Quiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Preview opened')}
                    className="w-full p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <span>Preview Course</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('reports')}
                    className="w-full p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <span>View Course Analytics</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePublish}
                    className="w-full p-2 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Publish / Unpublish</span>
                  </button>
                </div>

                <div className="sm:hidden grid grid-cols-4 gap-2 text-center text-[10px] font-medium text-[#0F172A]">
                  <button type="button" onClick={() => setActiveTab('curriculum')} className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Module</span>
                  </button>

                  <button type="button" onClick={() => setActiveTab('curriculum')} className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Lesson</span>
                  </button>

                  <button type="button" onClick={() => setActiveTab('assignments')} className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Assignment</span>
                  </button>

                  <button type="button" onClick={() => setActiveTab('quizzes')} className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Quiz</span>
                  </button>

                  <button type="button" onClick={() => showToast('Preview opened')} className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <span>Preview Course</span>
                  </button>

                  <button type="button" onClick={() => setActiveTab('reports')} className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <span>Analytics</span>
                  </button>

                  <button type="button" onClick={handleTogglePublish} className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Publish / Unpublish</span>
                  </button>

                  <button type="button" onClick={() => setIsMobileMoreTabsOpen(true)} className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </div>
                    <span>More</span>
                  </button>
                </div>
              </Card>

              <Card padding="md" className="bg-white border border-[#E2E8F0] p-5 rounded-[16px] space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-[15px] font-semibold text-[#0F172A]">Course Features</h3>
                  <span className="text-[12px] font-semibold text-[#2563EB]">View all</span>
                </div>

                <div className="space-y-2.5 text-[12px] font-medium text-[#0F172A]">
                  {[
                    'Video Lessons',
                    'Quizzes',
                    'Assignments',
                    'Certificates',
                    'Discussion Forum',
                    'Drip Content',
                    'Progress Tracking',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2563EB] shrink-0 stroke-[3]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* OTHER FUNCTIONAL TABS */}
      {activeTab === 'curriculum' && <CourseCurriculumPage />}
      {activeTab === 'students' && <CourseStudentsPage />}
      {activeTab === 'assignments' && <CourseAssignmentsPage />}
      {activeTab === 'quizzes' && <CourseQuizzesPage />}
      {activeTab === 'certificates' && <CourseCertificatesPage />}
      {activeTab === 'discussions' && <CourseDiscussionsPage />}
      {activeTab === 'announcements' && <CourseAnnouncementsPage />}
      {activeTab === 'reports' && <CourseReportsPage />}
      {activeTab === 'settings' && <CourseSettingsPage />}

      <Modal isOpen={isMobileMoreTabsOpen} onClose={() => setIsMobileMoreTabsOpen(false)} title="Course Tabs">
        <div className="space-y-2 text-xs font-semibold text-left">
          {tabs.slice(3).map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => {
                setActiveTab(tb.id);
                setIsMobileMoreTabsOpen(false);
              }}
              className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
              <span>{tb.label}</span>
              <ChevronRight className="w-4 h-4 text-[#64748B]" />
            </button>
          ))}
        </div>
      </Modal>

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

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-4 py-2 flex items-center justify-around text-center text-[10px] font-medium text-[#64748B]">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 hover:text-[#0F172A]">
          <LayoutGrid className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        <Link to="/courses" className="flex flex-col items-center gap-1 text-[#2563EB] font-bold">
          <BookOpen className="w-5 h-5 text-[#2563EB]" />
          <span>Courses</span>
        </Link>

        <Link to="/students" className="flex flex-col items-center gap-1 hover:text-[#0F172A]">
          <Users className="w-5 h-5" />
          <span>Students</span>
        </Link>

        <Link to="/reports" className="flex flex-col items-center gap-1 hover:text-[#0F172A]">
          <BarChart3 className="w-5 h-5" />
          <span>Reports</span>
        </Link>

        <button type="button" onClick={() => showToast('More menu opened')} className="flex flex-col items-center gap-1 hover:text-[#0F172A]">
          <MoreVertical className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>
    </motion.div>
  );
};
