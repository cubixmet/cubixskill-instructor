import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  BookOpen,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  CheckCircle2,
  Clock,
  Archive,
  Eye,
  Edit3,
  Copy,
  Trash2,
  X,
  ChevronRight,
  Layers,
  Film,
  RotateCcw,
  Check,
  ArrowUpDown,
  BarChart3,
  Megaphone,
  Activity,
  Menu,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { CourseRating } from '../components/curriculum/CourseRating';
import { useCourseStore } from '../store/course.store';
import type { CourseDetails } from '../types/course.types';

export const CourseListPage: React.FC = () => {
  const navigate = useNavigate();

  // Store Subscriptions
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);
  const updateCourse = useCourseStore((state) => state.updateCourse);
  const addCourse = useCourseStore((state) => state.addCourse);
  const deleteCourse = useCourseStore((state) => state.deleteCourse);

  const coursesList = useMemo(() => Object.values(coursesByUuid), [coursesByUuid]);

  // Tab & View Mode State
  const [activeStatusTab, setActiveStatusTab] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedPriceType] = useState<string>('all');
  const [sortBy] = useState<string>('updated');

  // Mobile Specific UI Toggle State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // General UI State
  const [activeMenuUuid, setActiveMenuUuid] = useState<string | null>(null);
  const [selectedCourseUuids, setSelectedCourseUuids] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseDetails | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Status Summary Counts
  const counts = useMemo(() => {
    return {
      total: coursesList.length,
      published: coursesList.filter((c) => c.status === 'published').length,
      draft: coursesList.filter((c) => c.status === 'draft').length,
      pending: coursesList.filter((c) => c.status === 'scheduled').length,
      archived: coursesList.filter((c) => c.status === 'archived').length,
      totalStudents: coursesList.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0),
    };
  }, [coursesList]);

  // Filtered & Sorted Courses List
  const filteredCourses = useMemo(() => {
    let result = coursesList.filter((course) => {
      // Tab Status
      if (activeStatusTab !== 'All') {
        const tabLower = activeStatusTab.toLowerCase();
        if (tabLower === 'pending review' && course.status !== 'scheduled') return false;
        if (tabLower !== 'pending review' && course.status !== tabLower) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchCat = course.category?.toLowerCase().includes(q);
        const matchSub = course.subcategory?.toLowerCase().includes(q);
        const matchTag = course.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchCat && !matchSub && !matchTag) return false;
      }

      // Dropdown Filters
      if (selectedCategory !== 'all' && course.category !== selectedCategory) return false;
      if (selectedLevel !== 'all' && course.level !== selectedLevel) return false;
      if (selectedLanguage !== 'all' && course.language !== selectedLanguage) return false;
      if (selectedStatusFilter !== 'all' && course.status !== selectedStatusFilter) return false;
      if (selectedPriceType === 'free' && !course.isFree) return false;
      if (selectedPriceType === 'paid' && course.isFree) return false;

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'students') return (b.enrolledStudentsCount || 0) - (a.enrolledStudentsCount || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [
    coursesList,
    activeStatusTab,
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedLanguage,
    selectedStatusFilter,
    selectedPriceType,
    sortBy,
  ]);

  // Categories list matching mobile screenshot
  const categorySummaryList = [
    { name: 'Web Development', count: 10, icon: Film, color: 'text-[#2563EB] bg-blue-50' },
    { name: 'Design', count: 5, icon: Layers, color: 'text-[#2563EB] bg-blue-50' },
    { name: 'Business', count: 4, icon: BarChart3, color: 'text-[#2563EB] bg-blue-50' },
    { name: 'Marketing', count: 3, icon: Megaphone, color: 'text-[#2563EB] bg-blue-50' },
    { name: 'Data Science', count: 2, icon: Activity, color: 'text-[#2563EB] bg-blue-50' },
  ];

  // Actions
  const handleDuplicateCourse = (course: CourseDetails) => {
    addCourse({
      ...course,
      title: `${course.title} (Copy)`,
      status: 'draft',
    });
    showToast('Course duplicated successfully.');
    setActiveMenuUuid(null);
  };

  const handleTogglePublish = (course: CourseDetails) => {
    const nextStatus = course.status === 'published' ? 'draft' : 'published';
    updateCourse(course.uuid, { status: nextStatus });
    showToast(`Course status updated to ${nextStatus.toUpperCase()}.`);
    setActiveMenuUuid(null);
  };

  const _handleToggleArchive = (course: CourseDetails) => {
    const nextStatus = course.status === 'archived' ? 'draft' : 'archived';
    updateCourse(course.uuid, { status: nextStatus });
    showToast(`Course ${nextStatus === 'archived' ? 'archived' : 'restored'}.`);
    setActiveMenuUuid(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteCourse(deleteTarget.uuid);
      showToast('Course deleted successfully.');
      setDeleteTarget(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedCourseUuids.length === filteredCourses.length) {
      setSelectedCourseUuids([]);
    } else {
      setSelectedCourseUuids(filteredCourses.map((c) => c.uuid));
    }
  };

  const _handleBulkPublish = () => {
    selectedCourseUuids.forEach((id) => updateCourse(id, { status: 'published' }));
    showToast(`${selectedCourseUuids.length} courses published.`);
    setSelectedCourseUuids([]);
  };

  const _handleBulkArchive = () => {
    selectedCourseUuids.forEach((id) => updateCourse(id, { status: 'archived' }));
    showToast(`${selectedCourseUuids.length} courses archived.`);
    setSelectedCourseUuids([]);
  };

  // Level Theme
  const getLevelBadgeTheme = (lvl: string) => {
    switch (lvl) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-blue-50 text-[#2563EB] border-blue-200';
      case 'Advanced':
        return 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30';
      case 'Expert':
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 text-left font-sans pb-[calc(96px+env(safe-area-inset-bottom))] no-scrollbar"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 -ml-2 rounded-xl text-[#0F172A] hover:bg-slate-100 sm:hidden cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[22px] sm:text-[26px] font-semibold text-[#0F172A] tracking-tight">
              Courses
            </h1>
            <p className="text-[13px] font-normal text-[#64748B] mt-0.5 hidden sm:block">
              Manage and organize your courses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast('Import feature ready.')}
            className="hidden sm:inline-flex"
          >
            Import Course
          </Button>

          {/* Mobile Circular Plus Button */}
          <Link to="/courses/create" className="shrink-0 sm:hidden">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs cursor-pointer"
              title="Create Course"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          </Link>

          {/* Desktop Horizontal Inline Button */}
          <Link to="/courses/create" className="shrink-0 hidden sm:inline-flex">
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold h-10 px-4 rounded-xl shadow-xs inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              Create Course
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. STATUS TABS */}
      <div className="border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Published', 'Draft', 'Archived'].map((tab) => {
            const isActive = activeStatusTab === tab;
            let countVal = counts.total;
            if (tab === 'Published') countVal = counts.published;
            if (tab === 'Draft') countVal = counts.draft;
            if (tab === 'Archived') countVal = counts.archived;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveStatusTab(tab)}
                className={`flex items-center gap-2 px-3 py-2 text-[13px] font-semibold transition-all border-b-2 shrink-0 cursor-pointer ${isActive
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  }`}
              >
                <span>{tab} ({countVal})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE CONTROL ROW */}
      <div className="sm:hidden grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setIsFilterModalOpen(true)}
          className="h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-semibold text-[#0F172A] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Filter</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSortModalOpen(true)}
          className="h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[12px] font-semibold text-[#0F172A] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Sort</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('grid')}
          className={`h-10 border rounded-xl flex items-center justify-center transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]' : 'bg-white border-[#E2E8F0] text-[#64748B]'
            }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setViewMode('table')}
          className={`h-10 border rounded-xl flex items-center justify-center transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]' : 'bg-white border-[#E2E8F0] text-[#64748B]'
            }`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* 3. DESKTOP METRIC CARDS */}
      <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card padding="sm" className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B]">Total Courses</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[24px] font-bold text-[#0F172A] block leading-none pt-1">{counts.total}</span>
          <span className="text-[11px] text-[#64748B] font-medium block">All Courses</span>
        </Card>

        <Card padding="sm" className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B]">Published</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[24px] font-bold text-[#0F172A] block leading-none pt-1">{counts.published}</span>
          <span className="text-[11px] text-emerald-700 font-medium block">Active Courses</span>
        </Card>

        <Card padding="sm" className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B]">Draft</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[24px] font-bold text-[#0F172A] block leading-none pt-1">{counts.draft}</span>
          <span className="text-[11px] text-[#64748B] font-medium block">Unpublished</span>
        </Card>

        <Card padding="sm" className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B]">Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[24px] font-bold text-[#0F172A] block leading-none pt-1">{counts.pending}</span>
          <span className="text-[11px] text-[#64748B] font-medium block">Under Review</span>
        </Card>

        <Card padding="sm" className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B]">Archived</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#64748B] flex items-center justify-center">
              <Archive className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[24px] font-bold text-[#0F172A] block leading-none pt-1">{counts.archived}</span>
          <span className="text-[11px] text-[#64748B] font-medium block">Archived Courses</span>
        </Card>
      </div>

      {/* 4. SEARCH & FILTER TOOLBAR */}
      <Card padding="md" className="hidden sm:block bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by title, category, instructor, or tag..."
              className="w-full h-11 pl-9 pr-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[13px] font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="h-11 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-medium text-[#0F172A] text-[13px]">
              <option value="all">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
            </select>

            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="h-11 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-medium text-[#0F172A] text-[13px]">
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>

            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="h-11 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-medium text-[#0F172A] text-[13px]">
              <option value="all">All Languages</option>
              <option value="English">English</option>
              <option value="Malayalam">Malayalam</option>
            </select>

            <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} className="h-11 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-medium text-[#0F172A] text-[13px]">
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shrink-0">
              <button type="button" onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-[#2563EB] text-white' : 'text-[#64748B]'}`}>
                <List className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#2563EB] text-white' : 'text-[#64748B]'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. COURSES TABLE VIEW */}
      {viewMode === 'table' ? (
        <Card padding="none" className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-[13px] font-normal text-[#0F172A]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase font-semibold">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedCourseUuids.length === filteredCourses.length && filteredCourses.length > 0}
                      onChange={handleSelectAll}
                      className="accent-[#2563EB] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">COURSE</th>
                  <th className="py-3.5 px-4">CATEGORY</th>
                  <th className="py-3.5 px-4">LEVEL</th>
                  <th className="py-3.5 px-4">STUDENTS</th>
                  <th className="py-3.5 px-4">RATING</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4">PRICE</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredCourses.map((course, idx) => {
                  const isSelected = selectedCourseUuids.includes(course.uuid);
                  return (
                    <motion.tr
                      key={course.uuid}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('.action-menu')) return;
                        navigate(`/courses/${course.uuid}/overview`);
                      }}
                    >
                      <td className="py-3.5 px-4 action-menu">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedCourseUuids(selectedCourseUuids.filter((id) => id !== course.uuid));
                            } else {
                              setSelectedCourseUuids([...selectedCourseUuids, course.uuid]);
                            }
                          }}
                          className="accent-[#2563EB] cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <strong className="text-[#0F172A] font-semibold block group-hover:text-[#2563EB] transition-colors leading-snug">
                              {course.title}
                            </strong>
                            <span className="text-[11px] text-[#64748B]">12 Lessons • 4h 35m</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                          {course.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold ${getLevelBadgeTheme(course.level)}`}>
                          {course.level}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        {course.enrolledStudentsCount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <CourseRating rating={course.rating || 4.8} />
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={course.status === 'published' ? 'success' : 'secondary'} size="sm" dot>
                          {course.status === 'published' ? 'Published' : course.status === 'draft' ? 'Draft' : 'Pending'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        {course.isFree ? 'Free' : `₹${course.price.toLocaleString()}`}
                      </td>

                      <td className="py-3.5 px-4 text-right action-menu relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuUuid(activeMenuUuid === course.uuid ? null : course.uuid)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-[#64748B] cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuUuid === course.uuid && (
                          <div className="absolute right-4 top-12 w-44 bg-white rounded-xl border border-[#E2E8F0] shadow-xl py-1.5 z-30 text-xs font-medium text-left">
                            <button type="button" onClick={() => { navigate(`/courses/${course.uuid}/overview`); setActiveMenuUuid(null); }} className="w-full px-3.5 py-2 hover:bg-slate-50 text-[#0F172A] flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5 text-[#64748B]" /> Open Course
                            </button>
                            <button type="button" onClick={() => { navigate(`/courses/${course.uuid}/edit`); setActiveMenuUuid(null); }} className="w-full px-3.5 py-2 hover:bg-slate-50 text-[#0F172A] flex items-center gap-2">
                              <Edit3 className="w-3.5 h-3.5 text-[#64748B]" /> Edit Details
                            </button>
                            <button type="button" onClick={() => handleDuplicateCourse(course)} className="w-full px-3.5 py-2 hover:bg-slate-50 text-[#0F172A] flex items-center gap-2">
                              <Copy className="w-3.5 h-3.5 text-[#64748B]" /> Duplicate
                            </button>
                            <button type="button" onClick={() => handleTogglePublish(course)} className="w-full px-3.5 py-2 hover:bg-slate-50 text-[#0F172A] flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {course.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <div className="border-t border-[#E2E8F0] my-1" />
                            <button type="button" onClick={() => { setDeleteTarget(course); setActiveMenuUuid(null); }} className="w-full px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold">
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* 6. COURSES GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCourses.map((course, idx) => (
            <motion.div
              key={course.uuid}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                padding="none"
                className="bg-white border border-[#E2E8F0] rounded-[16px] overflow-hidden hover:border-[#2563EB]/40 transition-all flex flex-col justify-between group shadow-xs cursor-pointer h-full"
                onClick={() => navigate(`/courses/${course.uuid}/overview`)}
              >
                <div>
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-[#0F172A]/70 backdrop-blur-md text-white text-[10px] font-semibold rounded-lg uppercase tracking-wider">
                        {course.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant={course.status === 'published' ? 'success' : 'secondary'} size="sm" dot>
                        {course.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 text-left">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-md border font-semibold ${getLevelBadgeTheme(course.level)}`}>
                        {course.level}
                      </span>
                      <span className="text-[#64748B] font-medium">{course.enrolledStudentsCount} Students</span>
                    </div>

                    <h3 className="font-semibold text-[#0F172A] text-[15px] line-clamp-2 leading-snug group-hover:text-[#2563EB] transition-colors">
                      {course.title}
                    </h3>

                    <div className="grid grid-cols-4 gap-1 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center text-[11px]">
                      <div>
                        <span className="font-bold text-[#0F172A] block">3</span>
                        <span className="text-[#64748B] text-[10px]">Modules</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#0F172A] block">12</span>
                        <span className="text-[#64748B] text-[10px]">Lessons</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#0F172A] block">4h 35m</span>
                        <span className="text-[#64748B] text-[10px]">Duration</span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <CourseRating rating={course.rating || 4.8} compact />
                        <span className="text-[#64748B] text-[10px]">Rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[12px] font-semibold text-[#0F172A]">
                  <CourseRating rating={course.rating || 4.8} />
                  <span className="text-[#2563EB]">Manage →</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* MOBILE CATEGORY SUMMARY SECTION */}
      <div className="sm:hidden space-y-3 pt-4 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#0F172A]">Categories</h3>
          <span className="text-[12px] font-semibold text-[#2563EB]">View all</span>
        </div>

        <div className="space-y-2">
          {categorySummaryList.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.name);
                  showToast(`Filtered by ${cat.name}`);
                }}
                className="w-full p-3.5 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[13px] font-semibold text-[#0F172A] block">{cat.name}</strong>
                    <span className="text-[11px] font-normal text-[#64748B]">{cat.count} Courses</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#64748B]" />
              </button>
            );
          })}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Course?">
        <div className="space-y-4 text-[13px] text-left">
          <p className="text-[#64748B]">
            Are you sure you want to delete <strong className="text-[#0F172A]">{deleteTarget?.title}</strong>?
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">Confirm Delete</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
