import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, Check, Plus, ChevronDown, Loader2, Globe } from "lucide-react";
import { languageService, type CourseLanguageItem } from "../../../services/language.service";

interface SearchableLanguageSelectorProps {
  value?: string | null;
  onChange: (languageName: string) => void;
  error?: string;
  disabled?: boolean;
}

export const SearchableLanguageSelector: React.FC<SearchableLanguageSelectorProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<CourseLanguageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch languages with debounce support
  const fetchLanguages = useCallback(async (searchQuery = "") => {
    setIsLoading(true);
    setApiError(null);
    try {
      const list = await languageService.list(searchQuery);
      setLanguages(list);
    } catch (err: any) {
      setApiError(err?.message || "Failed to load languages.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  // Handle Search Input with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLanguages(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchLanguages]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  // Check if search matches an existing language case-insensitively
  const exactMatch = useMemo(() => {
    if (!normalizedSearch) return null;
    return languages.find((l) => l.name.toLowerCase() === normalizedSearch) || null;
  }, [languages, normalizedSearch]);

  const handleSelectLanguage = (langName: string) => {
    onChange(langName);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCreateLanguage = async () => {
    const cleanName = searchTerm.trim();
    if (!cleanName || isCreating) return;

    if (exactMatch) {
      handleSelectLanguage(exactMatch.name);
      return;
    }

    setIsCreating(true);
    setApiError(null);
    try {
      const newLang = await languageService.create(cleanName);
      setLanguages((prev) => [...prev.filter((l) => l.id !== newLang.id), newLang]);
      onChange(newLang.name);
      setIsOpen(false);
      setSearchTerm("");
    } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.message || "Failed to create new language.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative w-full text-left font-sans" ref={dropdownRef} data-field-name="language">
      <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] mb-1">
        Course Language <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
      </label>

      {/* Selector Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-3.5 bg-white dark:bg-[#0F172A] border rounded-xl flex items-center justify-between text-xs sm:text-sm font-medium transition-all shadow-2xs cursor-pointer ${
          error
            ? "border-rose-500 ring-2 ring-rose-500/20 text-rose-900 dark:text-rose-300"
            : "border-slate-300 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] hover:border-slate-400 dark:hover:border-slate-600"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900" : ""}`}
      >
        <div className="flex items-center gap-2 truncate">
          <Globe className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
          <span className="truncate">{value || "Select Course Language"}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-[#64748B] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl p-2 space-y-2 max-h-72 flex flex-col">
          {/* Search Box */}
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search or add language..."
              className="w-full h-9 pl-9 pr-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
            />
          </div>

          {/* Languages List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 min-h-0">
            {isLoading && languages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-[#94A3B8] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                <span>Loading languages...</span>
              </div>
            ) : languages.length > 0 ? (
              languages.map((lang) => {
                const isSelected = value?.toLowerCase() === lang.name.toLowerCase();
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.name)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer text-left ${
                      isSelected
                        ? "bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] font-semibold"
                        : "text-slate-800 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033]"
                    }`}
                  >
                    <span>{lang.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
                No existing languages match "{searchTerm}"
              </div>
            )}
          </div>

          {/* Add New Language Action Button */}
          {searchTerm.trim().length > 0 && !exactMatch && (
            <div className="pt-2 border-t border-slate-100 dark:border-[#263244] shrink-0">
              <button
                type="button"
                disabled={isCreating}
                onClick={handleCreateLanguage}
                className="w-full h-9 px-3 bg-blue-50 dark:bg-[#172033] hover:bg-blue-100 dark:hover:bg-[#1E293B] border border-blue-200 dark:border-[#334155] rounded-lg text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Language...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add "{searchTerm.trim()}"</span>
                  </>
                )}
              </button>
            </div>
          )}

          {apiError && (
            <p className="text-[11px] text-rose-600 dark:text-[#F87171] font-semibold px-2 py-1">
              {apiError}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] font-medium text-rose-600 dark:text-[#F87171] mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
