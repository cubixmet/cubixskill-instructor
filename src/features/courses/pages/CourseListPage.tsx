import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  MoreVertical,
  CheckCircle2,
  Archive,
  Eye,
  Edit3,
  Copy,
  Trash2,
  X,
  RotateCcw,
  ArrowUpDown,
  Users,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useCourseStore } from '../store/course.store';
import { usePlatformStore } from '../../../store/usePlatformStore';
import { authStore } from '../../../store/auth.store';
import type { CourseDetails } from '../types/course.types';
import { DuplicateCourseModal } from '../components/curriculum/DuplicateCourseModal';
import { formatCurrency } from '../../../utils/currency';

export const CourseListPage: React.FC = () => {
  // Store Subscriptions
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);
  const updateCourse = useCourseStore((state) => state.updateCourse);
  const duplicateCourse = useCourseStore((state) => state.duplicateCourse);
  const deleteCourse = useCourseStore((state) => state.deleteCourse);
  const duplicatePlatformCourse = usePlatformStore((state) => state.duplicateCourse);

  const coursesList = useMemo(() => Object.values(coursesByUuid), [coursesByUuid]);

  // Role Permissions
  const user = authStore.getState().user;
  const userRole = user?.role || 'instructor';

  const canCreate = userRole === 'admin' || userRole === 'instructor' || userRole === 'ta';
  const canEdit = userRole === 'admin' || userRole === 'instructor' || userRole === 'ta';
  const canDuplicate = userRole === 'admin' || userRole === 'instructor' || userRole === 'ta';
  const canPublish = userRole === 'admin' || userRole === 'instructor';
  const canDelete = userRole === 'admin' || userRole === 'instructor';

  // Filtering & View State
  const [activeStatusTab, setActiveStatusTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');

  // Interactive Action State
  const [activeMenuUuid, setActiveMenuUuid] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<CourseDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseDetails | null>(null);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState<string>('');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close card 3-dot dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuUuid(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Status Summary Counts
  const counts = useMemo(() => {
    return {
      total: coursesList.length,
      published: coursesList.filter((c) => c.status === 'published').length,
      draft: coursesList.filter((c) => c.status === 'draft').length,
      scheduled: coursesList.filter((c) => c.status === 'scheduled').length,
      archived: coursesList.filter((c) => c.status === 'archived').length,
      totalStudents: coursesList.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0),
    };
  }, [coursesList]);

  // Categories & Levels options for filters
  const categories = useMemo(() => {
    const set = new Set<string>();
    coursesList.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [coursesList]);

  // Check if any filter is active
  const hasActiveFilters = selectedCategory !== 'all' || selectedLevel !== 'all' || searchQuery.trim() !== '';

  // Filtered & Sorted Courses List
  const filteredCourses = useMemo(() => {
    const result = coursesList.filter((course) => {
      // Tab Status Filter
      if (activeStatusTab !== 'All') {
        const tabLower = activeStatusTab.toLowerCase();
        if (course.status !== tabLower) return false;
      }

      // Search Query (Title, Description, Category, Tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (course.title || '').toLowerCase().includes(q);
        const descMatch = (course.shortDescription || '').toLowerCase().includes(q);
        const catMatch = (course.category || '').toLowerCase().includes(q);
        const tagMatch = (course.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !catMatch && !tagMatch) return false;
      }

      // Category Dropdown Filter
      if (selectedCategory !== 'all' && course.category !== selectedCategory) {
        return false;
      }

      // Level Dropdown Filter
      if (selectedLevel !== 'all' && course.level !== selectedLevel) {
        return false;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'students') {
        return (b.enrolledStudentsCount || 0) - (a.enrolledStudentsCount || 0);
      }
      // Default: Recently updated
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });
  }, [coursesList, activeStatusTab, searchQuery, selectedCategory, selectedLevel, sortBy]);

  // Action Handlers
  const handleConfirmDuplicate = (newTitle: string) => {
    if (!duplicateTarget) return;

    // 1. Duplicate in course store
    const duplicatedCourse = duplicateCourse(duplicateTarget.uuid, newTitle);

    // 2. Duplicate in platform store (syncs curriculum modules)
    duplicatePlatformCourse(duplicateTarget.uuid);

    showToast(`Course "${duplicatedCourse.title}" duplicated successfully as Draft.`);
    setDuplicateTarget(null);
    setActiveMenuUuid(null);
  };

  const handleTogglePublish = (course: CourseDetails) => {
    const nextStatus = course.status === 'published' ? 'draft' : 'published';
    updateCourse(course.uuid, { status: nextStatus });
    showToast(`Course status updated to ${nextStatus === 'published' ? 'Published' : 'Draft'}.`);
    setActiveMenuUuid(null);
  };

  const handleArchiveCourse = (course: CourseDetails) => {
    updateCourse(course.uuid, { status: 'archived' });
    showToast(`Course "${course.title}" archived.`);
    setActiveMenuUuid(null);
  };

  const handleDeleteCourse = () => {
    if (!deleteTarget) return;
    deleteCourse(deleteTarget.uuid);
    showToast('Course deleted successfully.');
    setDeleteTarget(null);
    setDeleteConfirmTitle('');
    setActiveMenuUuid(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto pb-16 text-left font-sans min-w-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="p-1 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <h1 className="text-lg sm:text-2xl font-medium text-slate-900 tracking-tight leading-tight">
              Course Management
            </h1>
          </div>
          <p className="text-xs font-normal text-slate-500">
            Create, manage, and duplicate Academy courses, curriculum, and settings.
          </p>
        </div>

        {canCreate && (
          <Link
            to="/courses/create"
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            <span>Create Course</span>
          </Link>
        )}
      </div>

      {/* 2. Compact 2-Row Mobile / Unified Desktop Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-2.5">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100 min-w-0">
          {[
            { label: 'All', count: counts.total },
            { label: 'Published', count: counts.published },
            { label: 'Draft', count: counts.draft },
            { label: 'Scheduled', count: counts.scheduled },
            { label: 'Archived', count: counts.archived },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveStatusTab(tab.label)}
              className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer ${activeStatusTab === tab.label
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}

            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeStatusTab === tab.label
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200/70 text-slate-600'
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* 2-ROW MOBILE / 1-ROW DESKTOP FILTER SECTION */}
        <div className="space-y-2 md:space-y-0 md:flex md:items-center md:justify-between md:gap-3 min-w-0">
          {/* ROW 1: FULL-WIDTH SEARCH FIELD */}
          <div className="relative w-full md:flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full h-9.5 sm:h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ROW 2: ISOLATED HORIZONTALLY SCROLLABLE CONTROL CHIPS */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 min-w-0 pt-0.5 md:pt-0">
            {/* Filter Chips Container */}
            <div className="flex items-center gap-1.5 shrink-0 min-w-0 overflow-x-auto no-scrollbar">
              {/* Category Filter Chip / Dropdown */}
              <div
                className={`relative flex items-center gap-1 border rounded-xl px-2.5 h-8.5 text-[11px] font-bold transition-all cursor-pointer ${selectedCategory !== 'all'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <SlidersHorizontal className="w-3 h-3 text-slate-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-[11px] font-bold text-current max-w-[110px] truncate"
                >
                  <option value="all">Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory('all');
                    }}
                    className="p-0.5 text-blue-600 hover:text-blue-900 rounded-full"
                    title="Clear Category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Level Filter Chip / Dropdown */}
              <div
                className={`relative flex items-center gap-1 border rounded-xl px-2.5 h-8.5 text-[11px] font-bold transition-all cursor-pointer ${selectedLevel !== 'all'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-[11px] font-bold text-current max-w-[90px] truncate"
                >
                  <option value="all">Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                {selectedLevel !== 'all' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLevel('all');
                    }}
                    className="p-0.5 text-blue-600 hover:text-blue-900 rounded-full"
                    title="Clear Level filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sort Chip / Dropdown */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 h-8.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-[11px] font-bold text-slate-700 max-w-[110px] truncate"
                >
                  <option value="updated">Sort</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A–Z)</option>
                  <option value="students">Most Students</option>
                </select>
              </div>

              {/* Reset Filters Chip */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                  }}
                  className="h-8.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                  title="Reset all filters"
                >
                  Reset
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. Empty State Handling */}
      {filteredCourses.length === 0 ? (
        <Card className="p-8 text-center space-y-3 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              No courses found
            </h3>
            <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
              No courses match your current search or status filter criteria. Try resetting your search query or filters.
            </p>
          </div>
          {(searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all' || activeStatusTab !== 'All') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLevel('all');
                setActiveStatusTab('All');
              }}
              className="h-9 px-3.5 text-xs font-bold text-slate-700"
            >
              Clear All Filters
            </Button>
          )}
        </Card>
      ) : (
        /* 4. Grid View Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 min-w-0">
          {filteredCourses.map((course) => {
            const isMenuOpen = activeMenuUuid === course.uuid;
            const isDraft = course.status === 'draft';

            return (
              <Card
                key={course.uuid}
                className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group min-w-0"
              >
                <div>
                  {/* Card Thumbnail & Status Badge */}
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white">
                        <BookOpen className="w-12 h-12 opacity-80" />
                      </div>
                    )}

                    {/* ACTIONABLE STATUS BADGE */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {isDraft && canEdit ? (
                        <Link
                          to={`/courses/${course.uuid}/edit`}
                          className="text-[10px] font-medium px-2.5 py-0.5 rounded-full border shadow-2xs bg-amber-500 text-white border-amber-600 hover:bg-amber-600 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Resume Draft Setup in Wizard"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>DRAFT (RESUME SETUP)</span>
                        </Link>
                      ) : (
                        <span
                          className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border shadow-2xs ${course.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : course.status === 'scheduled'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                        >
                          {(course.status || 'draft').toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Contextual 3-Dot Action Menu */}
                    <div className="absolute top-3 right-3" ref={isMenuOpen ? menuRef : undefined}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuUuid(isMenuOpen ? null : course.uuid);
                        }}
                        className="p-1.5 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 hover:bg-white border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
                        title="Course Actions"
                        aria-label="Course Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl p-1 z-50 text-left animate-in fade-in slide-in-from-top-2">
                          {isDraft && canEdit ? (
                            <Link
                              to={`/courses/${course.uuid}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-xl"
                              onClick={() => setActiveMenuUuid(null)}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              <span>Resume Setup</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/courses/${course.uuid}/overview`}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 rounded-xl"
                              onClick={() => setActiveMenuUuid(null)}
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Open / Manage</span>
                            </Link>
                          )}

                          {canEdit && (
                            <Link
                              to={`/courses/${course.uuid}/curriculum`}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 rounded-xl"
                              onClick={() => setActiveMenuUuid(null)}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit Curriculum</span>
                            </Link>
                          )}

                          {canDuplicate && (
                            <button
                              type="button"
                              onClick={() => {
                                setDuplicateTarget(course);
                                setActiveMenuUuid(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 rounded-xl text-left cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-blue-600" />
                              <span>Duplicate Course</span>
                            </button>
                          )}

                          {canPublish && (
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(course)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 rounded-xl text-left cursor-pointer"
                            >
                              {course.status === 'published' ? (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Unpublish to Draft</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Publish Course</span>
                                </>
                              )}
                            </button>
                          )}

                          {canPublish && course.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => handleArchiveCourse(course)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 rounded-xl text-left cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5 text-slate-500" />
                              <span>Archive Course</span>
                            </button>
                          )}

                          {canDelete && (
                            <div className="border-t border-slate-100 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget(course);
                                  setDeleteConfirmTitle('');
                                  setActiveMenuUuid(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl text-left cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Course</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-normal text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                        {course.category || 'General'}
                      </span>
                      <span>&bull;</span>
                      <span>{course.level || 'All Levels'}</span>
                    </div>

                    <Link
                      to={isDraft ? `/courses/${course.uuid}/edit` : `/courses/${course.uuid}/overview`}
                      className="block group-hover:text-blue-600 transition-colors"
                    >
                      <h3 className="text-[14px] sm:text-[15px] font-medium text-slate-900 leading-[1.35] line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>


                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      {course.shortDescription || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Card Footer & Action Toolbar */}
                <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-normal text-slate-600">
                    <div className="flex items-center gap-1 text-slate-600 font-normal">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{course.enrolledStudentsCount || 0} Students</span>
                    </div>

                    <div className="font-medium text-slate-900">
                      {course.isFree || course.price === 0
                        ? 'Free'
                        : formatCurrency(course.price || 0, 'INR')}
                    </div>
                  </div>

                  {/* PROMINENT RESPONSIVE ACTION BUTTONS TOOLBAR */}
                  <div className="pt-2.5 mt-2 border-t border-slate-200/75 grid grid-cols-3 gap-1 min-[375px]:gap-1.5 w-full">
                    {/* VIEW / RESUME */}
                    {isDraft ? (
                      <Link
                        to={`/courses/${course.uuid}/edit`}
                        className="h-8.5 w-full min-w-0 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border border-blue-600 rounded-xl text-[10px] min-[360px]:text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 px-1 min-[360px]:px-1.5 sm:px-2 transition-colors shadow-2xs whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        title="Resume Course Setup"
                      >
                        <Edit3 className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 shrink-0" />
                        <span>Resume</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/courses/${course.uuid}/overview`}
                        className="h-8.5 w-full min-w-0 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border border-blue-600 rounded-xl text-[10px] min-[360px]:text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 px-1 min-[360px]:px-1.5 sm:px-2 transition-colors shadow-2xs whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        title="View Course Overview"
                      >
                        <Eye className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 shrink-0" />
                        <span>View</span>
                      </Link>
                    )}

                    {/* DUPLICATE */}
                    {canDuplicate ? (
                      <button
                        type="button"
                        onClick={() => setDuplicateTarget(course)}
                        className="h-8.5 w-full min-w-0 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] min-[360px]:text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 px-1 min-[360px]:px-1.5 sm:px-2 transition-colors shadow-2xs cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                        title="Duplicate Course"
                      >
                        <Copy className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 shrink-0 text-slate-500" />
                        <span>Duplicate</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {/* DELETE */}
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(course);
                          setDeleteConfirmTitle('');
                        }}
                        className="h-8.5 w-full min-w-0 bg-rose-50 hover:bg-rose-100 active:bg-rose-200/70 text-rose-700 border border-rose-200/80 rounded-xl text-[10px] min-[360px]:text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 px-1 min-[360px]:px-1.5 sm:px-2 transition-colors shadow-2xs cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 shrink-0 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Duplicate Course Modal Dialog */}
      <DuplicateCourseModal
        isOpen={!!duplicateTarget}
        onClose={() => setDuplicateTarget(null)}
        course={duplicateTarget}
        onConfirmDuplicate={handleConfirmDuplicate}
      />

      {/* SAFE DELETE CONFIRMATION MODAL WITH TITLE MATCHING */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteConfirmTitle('');
        }}
        title="Delete Course Confirmation"
        size="md"
      >
        <div className="space-y-4 text-left font-sans">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="leading-snug">
                You are about to permanently delete <strong className="font-bold">&ldquo;{deleteTarget?.title}&rdquo;</strong>.
              </p>
              <p className="text-[11px] text-rose-700">
                This action cannot be undone. All course configurations will be permanently removed.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              To confirm, type <span className="font-black text-rose-600">&ldquo;{deleteTarget?.title}&rdquo;</span> below:
            </label>
            <input
              type="text"
              value={deleteConfirmTitle}
              onChange={(e) => setDeleteConfirmTitle(e.target.value)}
              placeholder={deleteTarget?.title || 'Enter exact course title...'}
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteConfirmTitle('');
              }}
              className="h-10 px-4 text-xs font-bold text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={!deleteTarget || deleteConfirmTitle.trim() !== deleteTarget.title.trim()}
              onClick={handleDeleteCourse}
              className="h-10 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 shadow-xs"
            >
              Delete Course
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
