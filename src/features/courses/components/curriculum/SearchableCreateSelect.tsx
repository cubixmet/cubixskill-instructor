import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Check, ChevronDown, AlertTriangle } from 'lucide-react';

interface SearchableCreateSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  onAddNewOption?: (newOpt: string) => void;
  name?: string;
}

export const SearchableCreateSelect: React.FC<SearchableCreateSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select or search...',
  label,
  error,
  onAddNewOption,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  // Filter options with case-insensitive check
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(normalizedSearch)
  );

  // Check if search matches an existing option (case-insensitive & trimmed)
  const exactMatch = options.find(
    (opt) => opt.trim().toLowerCase() === normalizedSearch
  );

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setSearch('');
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    if (!search.trim()) return;

    // Normalize casing (capitalize first letter of each word)
    const normalizedNewVal = search
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    if (exactMatch) {
      handleSelect(exactMatch);
      return;
    }

    onAddNewOption?.(normalizedNewVal);
    handleSelect(normalizedNewVal);
  };

  return (
    <div className="space-y-1 text-left font-sans relative" ref={containerRef} data-field-name={name}>
      {label && <label className="block text-xs font-semibold text-[#0F172A]">{label}</label>}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-invalid={Boolean(error)}
          aria-describedby={error && name ? `${name}-error` : undefined}
          className={`w-full h-10 px-3 bg-white border rounded-xl text-xs font-medium text-left flex items-center justify-between gap-2 focus:outline-none transition-all cursor-pointer ${
            error
              ? 'border-rose-500 ring-1 ring-rose-500/20 bg-rose-50/10 text-rose-900'
              : 'border-[#E2E8F0] focus:border-[#2563EB]'
          }`}
        >
          <span className={value ? 'text-[#0F172A] font-semibold' : 'text-[#64748B]'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 shrink-0 ${error ? 'text-rose-500' : 'text-[#64748B]'}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-11 z-30 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
            {/* Search bar inside dropdown */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search or type to add..."
                className="w-full h-8 pl-8 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                autoFocus
              />
            </div>

            {/* List options */}
            <div className="max-h-48 overflow-y-auto no-scrollbar space-y-0.5 pt-1">
              {filteredOptions.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs text-left font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#2563EB] font-semibold'
                        : 'text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                  </button>
                );
              })}

              {/* Add New Custom Option */}
              {search.trim() && !exactMatch && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full px-2.5 py-2 rounded-lg text-xs text-left font-semibold text-[#2563EB] hover:bg-blue-50 flex items-center gap-1.5 transition-colors cursor-pointer border-t border-[#E2E8F0] mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add &quot;{search.trim()}&quot;</span>
                </button>
              )}

              {filteredOptions.length === 0 && !search.trim() && (
                <div className="p-3 text-center text-xs text-[#64748B]">No options found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p id={name ? `${name}-error` : undefined} className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
