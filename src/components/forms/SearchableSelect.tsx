import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, AlertCircle } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  flag?: string;
}

export interface SearchableSelectProps {
  options: SearchableOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  error,
  disabled,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full font-sans ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[46px] sm:h-[48px] px-3.5 bg-white border rounded-[12px] text-sm font-normal text-[#0F172A] flex items-center justify-between transition-all duration-150 focus:outline-none cursor-pointer ${
          error
            ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
            : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100'
        } ${disabled ? 'bg-[#F8FAFC] text-[#64748B] cursor-not-allowed border-[#E2E8F0]' : ''}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.flag && <span>{selectedOption.flag}</span>}
              <span className="font-semibold text-[#0F172A]">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-[#64748B] text-xs font-normal">({selectedOption.sublabel})</span>
              )}
            </>
          ) : (
            <span className="text-[#64748B]">{placeholder}</span>
          )}
        </span>
        {error ? (
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
        ) : (
          <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E2E8F0] rounded-[12px] shadow-xl z-50 overflow-hidden animate-fadeIn">
          <div className="p-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search options..."
                className="w-full h-8 pl-8 pr-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto no-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#64748B]">No matching options found.</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full p-2.5 rounded-lg flex items-center justify-between text-xs font-medium text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50 text-[#2563EB]' : 'hover:bg-slate-50 text-[#0F172A]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {opt.flag && <span>{opt.flag}</span>}
                      <span>{opt.label}</span>
                      {opt.sublabel && <span className="text-[#64748B] text-[11px]">({opt.sublabel})</span>}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
