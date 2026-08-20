import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  BookOpen,
  MoreVertical,
  CheckCircle2,
  Archive,
  Edit3,
  Copy,
  Trash2,
  RefreshCw,
  AlertTriangle,
  SlidersHorizontal,
  GraduationCap,
  Folder,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ViewToggle, ViewMode } from "../../../components/ui/ViewToggle";
import { EmptyState } from "../../../components/ui/EmptyState";
import { coursesService } from "../../../services/courses.service";
import { useAuthStore } from "../../../store/auth.store";
import type {
  CourseListItem,
  CourseCategory,
  CourseStatus,
} from "../types/course.types";

export const CourseListPage: React.FC = () => {
  const navigate = useNavigate();
  const { can, hasFeature } = useAuthStore();

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // View Mode: Grid vs List
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("course-view-mode") as ViewMode | null;
    return saved === "list" || saved === "grid" ? saved : "grid";
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("course-view-mode", mode);
  };

  // Filters & Tabs
  const [activeStatusTab, setActiveStatusTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  // Interactive Action States
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseListItem | null>(null);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCoursesAndCategories = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const params: Record<string, any> = {};
      if (activeStatusTab !== "ALL") {
        params.status = activeStatusTab;
      }
      if (selectedLevel !== "ALL") {
        params.level = selectedLevel;
      }
      if (selectedCategory !== "ALL") {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const [courseRes, categoryRes] = await Promise.allSettled([
        coursesService.listCourses(params),
        coursesService.listCategories(),
      ]);

      if (courseRes.status === "fulfilled") {
        const raw = courseRes.value;
        const list = Array.isArray(raw) ? raw : (raw as any)?.results || [];
        setCourses(list);
      } else {
        throw new Error("Failed to load courses list from server.");
      }

      if (categoryRes.status === "fulfilled") {
        setCategories(categoryRes.value);
      }
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err?.message || "Error loading courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [activeStatusTab, selectedLevel, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchCoursesAndCategories();
  }, [fetchCoursesAndCategories]);

  // Handle Actions
  const handlePublish = async (course: CourseListItem) => {
    setActionLoadingId(course.id);
    setActiveMenuId(null);
    try {
      await coursesService.publishCourse(course.id);
      showToast(`Course "${course.title}" published successfully!`);
      await fetchCoursesAndCategories();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to publish course.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (course: CourseListItem) => {
    setActionLoadingId(course.id);
    setActiveMenuId(null);
    try {
      await coursesService.archiveCourse(course.id);
      showToast(`Course "${course.title}" archived successfully!`);
      await fetchCoursesAndCategories();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to archive course.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDuplicate = async (course: CourseListItem) => {
    setActionLoadingId(course.id);
    setActiveMenuId(null);
    try {
      const dup = await coursesService.duplicateCourse(course.id);
      showToast(`Course "${course.title}" duplicated!`);
      await fetchCoursesAndCategories();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to duplicate course.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoadingId(deleteTarget.id);
    try {
      await coursesService.deleteCourse(deleteTarget.id);
      showToast(`Course "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      setDeleteConfirmTitle("");
      await fetchCoursesAndCategories();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete course.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      total: courses.length,
      published: courses.filter((c) => c.status === "PUBLISHED").length,
      draft: courses.filter((c) => c.status === "DRAFT").length,
      archived: courses.filter((c) => c.status === "ARCHIVED").length,
    };
  }, [courses]);

  if (!hasFeature("courses") || !can("courses.view")) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Your role or Academy license does not have permission to view Course Management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#263244] text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Course Catalog</h1>
          <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            Manage, publish, and structure academy courses using live backend services
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/courses/categories">
            <Button variant="outline" size="md" leftIcon={<Folder className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />}>
              Manage Categories
            </Button>
          </Link>
          {can("courses.create") && (
            <Link to="/courses/create">
              <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Create Course
              </Button>
            </Link>
          )}
        </div>

      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
        {[
          { key: "ALL", label: `All Courses (${counts.total})` },
          { key: "PUBLISHED", label: `Published (${counts.published})` },
          { key: "DRAFT", label: `Draft (${counts.draft})` },
          { key: "ARCHIVED", label: `Archived (${counts.archived})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStatusTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeStatusTab === tab.key
                ? "bg-[#2563EB] text-white shadow-xs"
                : "bg-[#F8FAFC] dark:bg-[#172033] text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#263244] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="dark:bg-[#111827]">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="dark:bg-[#111827]">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="dark:bg-[#111827]">All Levels</option>
              <option value="BEGINNER" className="dark:bg-[#111827]">Beginner</option>
              <option value="INTERMEDIATE" className="dark:bg-[#111827]">Intermediate</option>
              <option value="ADVANCED" className="dark:bg-[#111827]">Advanced</option>
              <option value="ALL_LEVELS" className="dark:bg-[#111827]">All Levels</option>
            </select>
          </div>
        </div>

        <ViewToggle mode={viewMode} onChange={handleViewModeChange} />
      </div>

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Failed to Load Courses</h3>
            <p className="text-xs text-slate-500">{errorMessage}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCoursesAndCategories} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry API
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses Found"
          description="There are no courses matching your query or filter parameters in this Academy."
          actionLabel={can("courses.create") ? "Create First Course" : undefined}
          onAction={can("courses.create") ? () => navigate("/courses/create") : undefined}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : viewMode === "list" ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[#475569] dark:text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Course / Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244]">
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-9 rounded-lg bg-slate-100 dark:bg-[#172033] overflow-hidden shrink-0 border border-slate-200 dark:border-[#263244]">
                          {course.thumbnail?.url ? (
                            <img src={course.thumbnail.url} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-600 dark:text-[#60A5FA]">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/courses/${course.id}/curriculum`} className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors truncate block">
                            {course.title}
                          </Link>
                          <p className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] truncate max-w-md">
                            {course.subtitle || 'No subtitle provided.'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        course.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : course.status === "ARCHIVED"
                          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {course.is_free ? "FREE" : `${course.currency} ${Number(course.price).toLocaleString()}`}
                    </td>
                    <td className="py-3.5 px-4 text-[#475569] dark:text-[#CBD5E1] font-medium">
                      {course.category_name || "General"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/courses/${course.id}/curriculum`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold dark:border-[#3B82F6] dark:text-[#60A5FA] dark:hover:bg-[rgba(37,99,235,0.10)]">
                          Curriculum
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const isActionBusy = actionLoadingId === course.id;

            return (
              <div key={course.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl overflow-hidden transition-all flex flex-col justify-between group shadow-2xs">
                <div className="space-y-3">
                  {/* Thumbnail / Header */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-[#172033] overflow-hidden rounded-t-xl">
                    {course.thumbnail?.url ? (
                      <img
                        src={course.thumbnail.url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-50 to-sky-100 dark:from-[#172033] dark:to-[#1E293B] text-blue-600 dark:text-[#60A5FA]">
                        <BookOpen className="w-10 h-10 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-[#60A5FA]">No Cover Media</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs ${
                          course.status === "PUBLISHED"
                            ? "bg-emerald-500 text-white"
                            : course.status === "ARCHIVED"
                            ? "bg-slate-700 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {course.status}
                      </span>
                      {course.category_name && (
                        <span className="text-[10px] font-bold bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xs text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md shadow-xs border border-transparent dark:border-[#263244]">
                          {course.category_name}
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-3 right-3 text-[11px] font-extrabold bg-slate-900/80 dark:bg-[#0B1120]/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg">
                      {course.is_free ? "FREE" : `${course.currency} ${Number(course.price).toLocaleString()}`}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2 text-left">
                    <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs font-normal text-[#64748B] dark:text-[#94A3B8] line-clamp-2">
                      {course.subtitle || "No subtitle provided."}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                      <span>
                        <span className="font-normal text-[#64748B] dark:text-[#94A3B8]">Level: </span>
                        <span className="font-medium text-[#475569] dark:text-[#CBD5E1]">{course.level}</span>
                      </span>
                      <span>
                        <span className="font-normal text-[#64748B] dark:text-[#94A3B8]">Created: </span>
                        <span className="font-medium text-[#475569] dark:text-[#CBD5E1]">{new Date(course.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-[#E2E8F0] dark:border-[#334155] mt-3 pt-3">
                  <Link to={`/courses/${course.id}/overview`} className="flex-1">
                    <button
                      type="button"
                      className="w-full py-2 px-3 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#F8FAFC] dark:bg-transparent dark:border-[#3B82F6] dark:text-[#60A5FA] dark:hover:bg-[rgba(37,99,235,0.10)] dark:hover:text-[#93C5FD] font-medium text-xs transition-colors flex items-center justify-center cursor-pointer"
                    >
                      View / Edit
                    </button>
                  </Link>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === course.id ? null : course.id)}
                      className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === course.id && (
                      <div className="absolute right-0 bottom-10 w-44 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl z-30 p-1 space-y-0.5 text-xs text-left">
                        {can("courses.edit") && course.status === "DRAFT" && (
                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => handlePublish(course)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg cursor-pointer font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                          </button>
                        )}

                        {can("courses.edit") && course.status === "PUBLISHED" && (
                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => handleArchive(course)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg cursor-pointer font-medium"
                          >
                            <Archive className="w-3.5 h-3.5" /> Archive
                          </button>
                        )}

                        {can("courses.create") && (
                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => handleDuplicate(course)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg cursor-pointer font-medium"
                          >
                            <Copy className="w-3.5 h-3.5" /> Duplicate
                          </button>
                        )}

                        {can("courses.delete") && (
                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => {
                              setActiveMenuId(null);
                              setDeleteTarget(course);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete Course">
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong className="text-slate-900">"{deleteTarget.title}"</strong>? This operation cannot be undone.
            </p>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Type the course title to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmTitle}
                onChange={(e) => setDeleteConfirmTitle(e.target.value)}
                placeholder={deleteTarget.title}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={deleteConfirmTitle !== deleteTarget.title || actionLoadingId === deleteTarget.id}
                onClick={handleDelete}
              >
                Delete Course
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
