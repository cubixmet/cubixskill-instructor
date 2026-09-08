import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  BookOpen,
  MoreHorizontal,
  CheckCircle2,
  Archive,
  Copy,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  Users,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ViewToggle, ViewMode } from "../../../components/ui/ViewToggle";
import { EmptyState } from "../../../components/ui/EmptyState";
import { DeleteCourseModal } from "../components/settings/DeleteCourseModal";
import { DraftCourseDetailsModal } from "../components/DraftCourseDetailsModal";
import { CourseThumbnailImage } from "../../../components/courses/CourseThumbnailImage";
import { coursesService } from "../../../services/courses.service";
import { useAuthStore } from "../../../store/auth.store";
import type {
  CourseListItem,
  CourseCategory
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
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Interactive Action States
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseListItem | null>(null);

  // Draft Details Modal State
  const [selectedDraftCourse, setSelectedDraftCourse] = useState<CourseListItem | null>(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

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
      await coursesService.duplicateCourse(course.id);
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
      <div className="p-8 text-center bg-[var(--surface)] rounded-2xl border border-[var(--border)] space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Access Restricted</h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
          Your role or Academy license does not have permission to view Course Management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto pb-20 md:pb-6 text-left font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title Area + Create Course CTA */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
            My Courses
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-normal mt-0.5 truncate">
            Create and manage your courses
          </p>
        </div>

        {can("courses.create") && (
          <Link to="/courses/create" className="shrink-0">
            <Button
              variant="primary"
              size="md"
              className="h-10 min-h-[40px] px-3.5 sm:px-4 rounded-xl bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[var(--brand-primary-hover)] transition-all shrink-0"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
            >
              <span>Create Course</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Course Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { key: "ALL", label: "All Courses", count: counts.total },
          { key: "PUBLISHED", label: "Published", count: counts.published },
          { key: "DRAFT", label: "Drafts", count: counts.draft },
          ...(counts.archived > 0 ? [{ key: "ARCHIVED", label: "Archived", count: counts.archived }] : []),
        ].map((pill) => {
          const isActive = activeStatusTab === pill.key;
          return (
            <button
              key={pill.key}
              type="button"
              onClick={() => setActiveStatusTab(pill.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] shadow-xs"
                  : "bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 min-h-[40px] pl-9 pr-3.5 bg-[var(--surface-secondary)] border border-[var(--input-border)] focus:border-[var(--brand-primary)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-all font-medium"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilterDrawer((prev) => !prev)}
            className={`h-10 w-10 min-h-[40px] min-w-[40px] border rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              showFilterDrawer || selectedCategory !== "ALL" || selectedLevel !== "ALL"
                ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                : "bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
            title="Toggle Filters"
            aria-label="Filter Options"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <div className="hidden sm:block">
            <ViewToggle mode={viewMode} onChange={handleViewModeChange} />
          </div>
        </div>

        {/* Expandable Category & Level Filters */}
        {showFilterDrawer && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--input-border)] rounded-xl text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase mb-1">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--input-border)] rounded-xl text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ALL_LEVELS">All Levels</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 space-y-3">
              <div className="flex gap-3 items-center">
                <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-[var(--surface)] rounded-2xl border border-rose-500/20 space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Failed to Load Courses</h3>
            <p className="text-xs text-[var(--text-secondary)]">{errorMessage}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCoursesAndCategories} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry API
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses Found"
          description="Create your first course to get started with CubixSkill Academy."
          actionLabel={can("courses.create") ? "Create First Course" : undefined}
          onAction={can("courses.create") ? () => navigate("/courses/create") : undefined}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {courses.map((course) => {
            const isActionBusy = actionLoadingId === course.id;

            return (
              <div
                key={course.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 sm:p-4 shadow-xs text-left relative min-w-0 space-y-3 transition-all hover:border-[var(--brand-primary)]/40 group flex flex-col justify-between"
              >
                <div className="space-y-3 min-w-0">
                  {/* Grid Layout: Thumbnail (56px) | Content Area (minmax(0, 1fr)) */}
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 items-start min-w-0">
                    {/* Thumbnail Icon */}
                    <div className="w-[56px] h-[56px] rounded-xl bg-[var(--surface-secondary)] overflow-hidden shrink-0 border border-[var(--border)] flex items-center justify-center">
                      <CourseThumbnailImage
                        src={course.thumbnail}
                        alt={course.title}
                        iconClassName="w-6 h-6 text-[var(--text-muted)]"
                      />
                    </div>

                    {/* Title, Subtitle, Status Badge & Action Menu */}
                    <div className="min-w-0 space-y-1.5">
                      <div className="min-w-0 space-y-0.5">
                        <Link
                          to={`/courses/${course.id}/curriculum`}
                          className="font-bold text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2 block break-words [word-break:normal] [overflow-wrap:break-word] leading-snug"
                        >
                          {course.title}
                        </Link>
                        <p className="text-xs text-[var(--text-secondary)] font-normal line-clamp-2 leading-relaxed break-words [word-break:normal] [overflow-wrap:break-word]">
                          {course.subtitle || "No description provided."}
                        </p>
                      </div>

                      {/* Meta Row below Title & Subtitle: Status Badge on Left | 3-Dot Menu on Right */}
                      <div className="flex items-center justify-between gap-2 pt-0.5 min-w-0">
                        <div>
                          {course.status === "DRAFT" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDraftCourse(course);
                                setIsDraftModalOpen(true);
                              }}
                              className="h-[22px] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Draft</span>
                              <Info className="w-3 h-3" />
                            </button>
                          ) : (
                            <span
                              className={`h-[22px] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center ${
                                course.status === "PUBLISHED"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-[var(--surface-secondary)] text-[var(--text-muted)] border-[var(--border)]"
                              }`}
                            >
                              {course.status}
                            </span>
                          )}
                        </div>

                        {/* Options Dropdown Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === course.id ? null : course.id)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                            aria-label="Course Options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuId === course.id && (
                            <div className="absolute right-0 top-9 w-44 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-30 p-1 space-y-0.5 text-xs text-left">
                              <Link
                                to={`/courses/${course.id}/overview`}
                                onClick={() => setActiveMenuId(null)}
                                className="flex items-center gap-2 px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors font-medium"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                <span>View Overview</span>
                              </Link>

                              <Link
                                to={`/courses/${course.id}/curriculum`}
                                onClick={() => setActiveMenuId(null)}
                                className="flex items-center gap-2 px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors font-medium"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                <span>Curriculum</span>
                              </Link>

                              {can("courses.edit") && course.status === "DRAFT" && (
                                <button
                                  type="button"
                                  disabled={isActionBusy}
                                  onClick={() => handlePublish(course)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg cursor-pointer font-medium"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Publish</span>
                                </button>
                              )}

                              {can("courses.edit") && course.status === "PUBLISHED" && (
                                <button
                                  type="button"
                                  disabled={isActionBusy}
                                  onClick={() => handleArchive(course)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-lg cursor-pointer font-medium"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  <span>Archive</span>
                                </button>
                              )}

                              {can("courses.create") && (
                                <button
                                  type="button"
                                  disabled={isActionBusy}
                                  onClick={() => handleDuplicate(course)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer font-medium"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Duplicate</span>
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
                                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Row (3 Columns: Students | Lessons | Rating) */}
                <div className="pt-2.5 mt-3 border-t border-[var(--border)] grid grid-cols-3 gap-2 text-left min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                        {(course as any).total_students ?? (course as any).enrolled_count ?? (course as any).total_enrollments ?? 0}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium block truncate">
                        Students
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                        {(course as any).lessons_count ?? (course as any).total_lessons ?? (course as any).modules?.length ?? 0}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium block truncate">
                        Lessons
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                        {(course as any).rating ?? (course as any).avg_rating ?? "4.8"}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium block truncate">
                        Rating
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GitHub-style Course Delete Confirmation Modal */}
      <DeleteCourseModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        courseTitle={deleteTarget?.title || ""}
        onConfirmDelete={handleDelete}
        isDeleting={actionLoadingId === deleteTarget?.id}
      />

      {/* Draft Course Details & Publish Readiness Modal */}
      <DraftCourseDetailsModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        course={selectedDraftCourse}
        onStatusUpdated={fetchCoursesAndCategories}
      />
    </div>
  );
};
