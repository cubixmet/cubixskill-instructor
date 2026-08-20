import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, Check, Plus, ChevronDown, AlertCircle, Loader2, X } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { coursesService } from "../../../services/courses.service";
import type { CourseCategory } from "../types/course.types";

interface SearchableCategorySelectorProps {
  value?: string | null;
  onChange: (category: CourseCategory | null) => void;
  error?: string;
  disabled?: boolean;
}

export const SearchableCategorySelector: React.FC<SearchableCategorySelectorProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Similar Category Modal State
  const [similarModalOpen, setSimilarModalOpen] = useState(false);
  const [pendingCategoryName, setPendingCategoryName] = useState("");
  const [similarMatches, setSimilarMatches] = useState<CourseCategory[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial category list
  const fetchCategories = useCallback(async (searchQuery = "") => {
    setIsLoading(true);
    setApiError(null);
    try {
      const list = await coursesService.listCategories(searchQuery);
      setCategories(list);
    } catch (err: any) {
      setApiError(err?.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Sync selected category object
  const selectedCategory = useMemo(() => {
    if (!value) return null;
    return categories.find((c) => c.id === value) || null;
  }, [value, categories]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered categories based on local search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term) ||
        cat.slug.toLowerCase().includes(term) ||
        cat.aliases?.some((a) => a.name.toLowerCase().includes(term) || a.slug.toLowerCase().includes(term))
    );
  }, [categories, searchTerm]);

  // Check if search term matches any existing category name exactly
  const hasExactMatch = useMemo(() => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return categories.some(
      (cat) =>
        cat.name.toLowerCase() === term ||
        cat.aliases?.some((a) => a.name.toLowerCase() === term)
    );
  }, [categories, searchTerm]);

  const handleSelectCategory = (cat: CourseCategory) => {
    onChange(cat);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm("");
  };

  // Process Add New Category with duplicate & similarity check
  const handleInitiateCreateCategory = async () => {
    const rawName = searchTerm.trim();
    if (!rawName) return;

    setIsCreating(true);
    setApiError(null);

    try {
      // 1. Backend similarity & alias check
      const checkRes = await coursesService.checkSimilarCategories(rawName);

      // Exact or alias match returned by backend
      const canonicalMatch = checkRes.exact_match || checkRes.alias_match;
      if (canonicalMatch) {
        handleSelectCategory(canonicalMatch);
        setIsCreating(false);
        return;
      }

      // Similar categories detected
      if (checkRes.similar_categories && checkRes.similar_categories.length > 0) {
        setPendingCategoryName(rawName);
        setSimilarMatches(checkRes.similar_categories);
        setSimilarModalOpen(true);
        setIsCreating(false);
        setIsOpen(false);
        return;
      }

      // No match found -> create directly
      const newCategory = await coursesService.createCategory(rawName);
      setCategories((prev) => [...prev, newCategory]);
      handleSelectCategory(newCategory);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.message || "Failed to create category");
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmCreateGenuinelyNew = async () => {
    if (!pendingCategoryName) return;
    setIsCreating(true);
    try {
      const newCategory = await coursesService.createCategory(pendingCategoryName);
      setCategories((prev) => [...prev, newCategory]);
      handleSelectCategory(newCategory);
      setSimilarModalOpen(false);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.message || "Failed to create category");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative w-full text-left font-sans" ref={dropdownRef}>
      {/* Input Trigger Button */}
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }
        }}
        className={`w-full min-h-[42px] px-3.5 py-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] rounded-xl flex items-center justify-between gap-2 text-xs font-semibold cursor-pointer transition-all ${
          error ? "border-rose-500 bg-rose-50/20" : isOpen ? "border-blue-500 dark:border-[#3B82F6] ring-2 ring-blue-100 dark:ring-[#3B82F6]/20 bg-white dark:bg-[#0F172A]" : "hover:border-slate-300 dark:hover:border-[#475569]"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-invalid={Boolean(error)}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {selectedCategory ? (
            <span className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold truncate">{selectedCategory.name}</span>
          ) : (
            <span className="text-[#64748B] dark:text-[#64748B] font-normal truncate">Search or select category...</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedCategory && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-[#64748B] dark:text-[#94A3B8] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {error && <p className="text-[11px] font-semibold text-rose-600 mt-1">{error}</p>}
      {apiError && <p className="text-[11px] font-semibold text-rose-600 mt-1">{apiError}</p>}

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl shadow-xl overflow-hidden animate-fade-in max-h-80 flex flex-col w-full min-w-0">
          {/* Search Header */}
          <div className="p-2 border-b border-[#E2E8F0] dark:border-[#263244] bg-[#F8FAFC] dark:bg-[#172033] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                fetchCategories(e.target.value);
              }}
              placeholder="Search category name..."
              className="w-full bg-transparent text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] dark:placeholder:text-[#64748B] focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  fetchCategories();
                }}
                className="p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List Options */}
          <div className="overflow-y-auto p-1.5 space-y-1 flex-1 no-scrollbar">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Searching categories...</span>
              </div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const isSelected = value === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 dark:bg-[rgba(37,99,235,0.15)] text-[#2563EB] dark:text-[#60A5FA] font-bold"
                        : "text-[#0F172A] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#172033]"
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{cat.name}</span>
                      {cat.aliases && cat.aliases.length > 0 && (
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate">
                          Also matches: {cat.aliases.map((a) => a.name).join(", ")}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">No matching categories found</div>
            )}

            {/* Add New Category Action */}
            {searchTerm.trim() && !hasExactMatch && (
              <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#263244] mt-1">
                <button
                  type="button"
                  onClick={handleInitiateCreateCategory}
                  disabled={isCreating}
                  className="w-full px-3 py-2.5 rounded-xl bg-blue-50/70 dark:bg-[#172033] hover:bg-blue-100 dark:hover:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                  )}
                  <span className="truncate">Add &quot;{searchTerm.trim()}&quot; as a new category</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Similar Category Detection Confirmation Modal */}
      <Modal isOpen={similarModalOpen} onClose={() => setSimilarModalOpen(false)} title="Similar Category Detected">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Possible Existing Categories Found</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                We detected existing categories that are similar to &quot;{pendingCategoryName}&quot;. Select an existing category below to prevent duplicates, or continue creating a genuinely new category.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Recommended Existing Categories</span>
            <div className="space-y-1.5">
              {similarMatches.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    handleSelectCategory(cat);
                    setSimilarModalOpen(false);
                  }}
                  className="w-full p-3 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-900 transition-all cursor-pointer"
                >
                  <span>Use Existing: &quot;{cat.name}&quot;</span>
                  <Check className="w-4 h-4 text-blue-600" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setSimilarModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isCreating}
              onClick={handleConfirmCreateGenuinelyNew}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {isCreating ? "Creating..." : `Create New "${pendingCategoryName}"`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
