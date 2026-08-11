import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Tag as TagIcon } from 'lucide-react';

interface TagMultiSelectProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableOptions?: string[];
  label?: string;
}

const DEFAULT_TAG_OPTIONS = [
  'React',
  'TypeScript',
  'Next.js',
  'Zustand',
  'Tailwind CSS',
  'Node.js',
  'Python',
  'UI/UX Design',
  'Frontend',
  'Fullstack',
  'REST API',
  'GraphQL',
];

export const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
  selectedTags = [],
  onChange,
  availableOptions = DEFAULT_TAG_OPTIONS,
  label = 'Course Tags',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tagOptions, setTagOptions] = useState<string[]>(availableOptions);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const filteredOptions = tagOptions.filter(
    (tag) =>
      tag.toLowerCase().includes(normalizedSearch) &&
      !selectedTags.some((st) => st.toLowerCase() === tag.toLowerCase())
  );

  const exactMatch = tagOptions.find(
    (tag) => tag.trim().toLowerCase() === normalizedSearch
  );

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.trim();
    if (!selectedTags.includes(normalizedTag)) {
      onChange([...selectedTags, normalizedTag]);
    }
    setSearch('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleCreateTag = () => {
    if (!search.trim()) return;

    const formattedTag = search
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    if (!tagOptions.includes(formattedTag)) {
      setTagOptions([...tagOptions, formattedTag]);
    }
    handleAddTag(formattedTag);
    setSearch('');
  };

  return (
    <div className="space-y-1.5 text-left font-sans relative" ref={containerRef}>
      {label && <label className="block text-xs font-semibold text-[#0F172A]">{label}</label>}

      {/* Selected Tags Chips */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white border border-[#E2E8F0] rounded-xl min-h-[42px] focus-within:border-[#2563EB] transition-all">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#2563EB] text-xs font-semibold rounded-lg border border-blue-100"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="hover:text-rose-600 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTags.length === 0 ? 'Type or search tags...' : 'Add tag...'}
          className="flex-1 min-w-[120px] text-xs font-medium text-[#0F172A] bg-transparent focus:outline-none h-6 px-1"
        />
      </div>

      {/* Dropdown Options */}
      {isOpen && (search.trim() || filteredOptions.length > 0) && (
        <div className="absolute left-0 top-full mt-1 z-30 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto no-scrollbar space-y-0.5 animate-in fade-in duration-100">
          {filteredOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleAddTag(opt)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-left font-medium text-[#0F172A] hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <TagIcon className="w-3 h-3 text-[#64748B]" />
                {opt}
              </span>
              <Plus className="w-3.5 h-3.5 text-[#64748B]" />
            </button>
          ))}

          {search.trim() && !exactMatch && (
            <button
              type="button"
              onClick={handleCreateTag}
              className="w-full px-2.5 py-2 rounded-lg text-xs text-left font-semibold text-[#2563EB] hover:bg-blue-50 flex items-center gap-1.5 transition-colors cursor-pointer border-t border-[#E2E8F0] mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create tag &quot;{search.trim()}&quot;</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
