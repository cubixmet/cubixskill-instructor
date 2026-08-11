import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalSearchInput } from './GlobalSearchInput';
import { GlobalSearchResults } from './GlobalSearchResults';
import { useGlobalSearch } from './useGlobalSearch';
import { useNavigate } from 'react-router-dom';

export const DesktopGlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { debouncedQuery, isLoading, results, totalResultsCount } = useGlobalSearch(query);

  // Flat array of all search result items for keyboard arrow navigation
  const flatResults = useMemo(() => {
    return results.flatMap((r) => r.items);
  }, [results]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Keyboard Shortcuts (Cmd/Ctrl + K & Escape & Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }

      if (!isOpen || flatResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < flatResults.length) {
        e.preventDefault();
        const selected = flatResults[selectedIndex];
        setIsOpen(false);
        navigate(selected.route);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatResults, selectedIndex, navigate]);

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <GlobalSearchInput
        inputRef={inputRef}
        value={query}
        onChange={(val) => {
          setQuery(val);
          setIsOpen(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onClear={() => {
          setQuery('');
          setIsOpen(false);
        }}
        isLoading={isLoading}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-left"
          >
            <GlobalSearchResults
              query={debouncedQuery}
              results={results}
              totalResultsCount={totalResultsCount}
              isLoading={isLoading}
              selectedIndex={selectedIndex}
              onHoverIndex={(idx) => setSelectedIndex(idx)}
              onSelectResult={() => {
                setIsOpen(false);
                setQuery('');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
