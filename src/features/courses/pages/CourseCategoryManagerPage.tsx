import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Folder,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { EmptyState } from "../../../components/ui/EmptyState";
import { categoryService } from "../../../services/category.service";
import { useAuthStore } from "../../../store/auth.store";
import type { CourseCategory } from "../types/course.types";

export const CourseCategoryManagerPage: React.FC = () => {
  const { can } = useAuthStore();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isActiveStatus, setIsActiveStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm Modal State
  const [deletingCategory, setDeletingCategory] = useState<CourseCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setServerError(null);
    try {
      const data = await categoryService.list(debouncedSearch);
      setCategories(data);
    } catch (err: any) {
      setServerError("Failed to load course categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setIsActiveStatus(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CourseCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || "");
    setIsActiveStatus(cat.is_active ?? true);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.update(
          editingCategory.id,
          categoryName.trim(),
          categoryDescription.trim(),
          isActiveStatus
        );
        showToast(`Category "${categoryName.trim()}" updated successfully.`);
      } else {
        await categoryService.create(
          categoryName.trim(),
          categoryDescription.trim()
        );
        showToast(`Category "${categoryName.trim()}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save category.";
      showToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat: CourseCategory) => {
    try {
      const nextStatus = !cat.is_active;
      await categoryService.patch(cat.id, { is_active: nextStatus });
      showToast(`Category "${cat.name}" is now ${nextStatus ? "Active" : "Inactive"}.`);
      fetchCategories();
    } catch (err: any) {
      showToast("Failed to update status.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await categoryService.delete(deletingCategory.id);
      showToast(`Category "${deletingCategory.name}" deleted successfully.`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete category.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 text-left font-sans pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#334155] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-normal">
            <Link to="/courses" className="text-slate-500 dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> All Courses
            </Link>
            <span className="text-slate-400 dark:text-slate-500">›</span>
            <span className="text-slate-700 dark:text-[#CBD5E1] font-semibold">Course Categories</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Course Categories
          </h1>
          <p className="text-xs font-normal text-slate-600 dark:text-[#94A3B8] mt-0.5">
            Manage your Academy&apos;s custom course categories, status, and course assignments
          </p>
        </div>

        {can("categories.manage") && (
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-[0_4px_12px_rgba(37,99,235,0.14)]"
          >
            Add Category
          </Button>
        )}
      </div>

      {serverError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748B]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="text-xs self-end sm:self-auto">
          <span className="text-slate-500 dark:text-[#94A3B8] font-normal">Total Categories: </span>
          <span className="text-slate-900 dark:text-slate-50 font-medium">{categories.length}</span>
        </div>
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-[#60A5FA] animate-spin mx-auto mb-2" />
          <p className="text-xs font-normal text-slate-500 dark:text-[#94A3B8]">Loading Academy Categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No Categories Found"
          description={searchQuery ? "No categories match your search filter." : "Create your first category (e.g. Programming, Graphic Design, Accounting)."}
          actionLabel={can("categories.manage") && !searchQuery ? "Add First Category" : undefined}
          onAction={can("categories.manage") && !searchQuery ? handleOpenAddModal : undefined}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const courseCount = cat.courses_count || 0;
            const isCatActive = cat.is_active ?? true;

            return (
              <Card
                key={cat.id}
                className={`p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs space-y-3 transition-all hover:shadow-md ${
                  isCatActive ? "" : "opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#172033] text-blue-600 dark:text-[#60A5FA] border border-blue-100 dark:border-[#263244] shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">{cat.name}</h3>
                      <p className="text-[11px] font-normal text-slate-400 dark:text-[#94A3B8] truncate">/{cat.slug}</p>
                    </div>
                  </div>

                  <Badge variant={isCatActive ? "success" : "secondary"} size="sm">
                    {isCatActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {cat.description && (
                  <p className="text-xs font-normal text-slate-600 dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#263244] text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-[#CBD5E1]">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                    <span>{courseCount} {courseCount === 1 ? "Course" : "Courses"}</span>
                  </div>

                  {can("categories.manage") && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cat)}
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          isCatActive
                            ? "text-slate-500 dark:text-[#94A3B8] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            : "text-slate-500 dark:text-[#94A3B8] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        }`}
                        title={isCatActive ? "Deactivate Category" : "Activate Category"}
                      >
                        {isCatActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-[#60A5FA] hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingCategory(cat)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-[#F87171] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#263244] text-slate-900 dark:text-slate-50 overflow-hidden text-left font-sans">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-[#263244]">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                <Folder className="w-4 h-4 text-blue-600 dark:text-[#60A5FA]" />
                <span>{editingCategory ? "Edit Category" : "Add Course Category"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Category Name *</label>
                <Input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Programming, Graphic Design, Spoken English"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Description (Optional)</label>
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  rows={3}
                  placeholder="Short summary of topics in this category..."
                  className="w-full p-2.5 bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all"
                />
              </div>

              {editingCategory && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="cat_active"
                    checked={isActiveStatus}
                    onChange={(e) => setIsActiveStatus(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="cat_active" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Active (Visible in course creation dropdowns)
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#263244]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="dark:bg-[#111827] dark:border-[#334155] dark:text-[#CBD5E1] dark:hover:bg-[#172033] dark:hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !categoryName.trim()} className="shadow-[0_4px_12px_rgba(37,99,235,0.14)]">
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : editingCategory ? (
                    "Update Category"
                  ) : (
                    "Add Category"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Warning Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#263244] text-slate-900 dark:text-slate-50 overflow-hidden font-sans p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                <AlertTriangle className="w-6 h-6 shrink-0" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Delete Category?</h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">Category: &quot;{deletingCategory.name}&quot;</p>
              </div>
            </div>

            {deletingCategory.courses_count && deletingCategory.courses_count > 0 ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-medium text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold">⚠️ Warning: Active Courses Attached</p>
                <p>
                  This category is currently assigned to <strong>{deletingCategory.courses_count} course(s)</strong>.
                  Deleting it will set their category to Unassigned.
                </p>
              </div>
            ) : (
              <p className="text-xs font-normal text-slate-600 dark:text-[#CBD5E1]">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#263244]">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingCategory(null)} className="dark:bg-[#111827] dark:border-[#334155] dark:text-[#CBD5E1] dark:hover:bg-[#172033] dark:hover:text-white">
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDeleteCategory}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? "Deleting..." : "Delete Category"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

