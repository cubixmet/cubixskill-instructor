import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalSearchInput } from './GlobalSearchInput';
import { GlobalSearchResults } from './GlobalSearchResults';
import { useGlobalSearch } from './useGlobalSearch';

export const MobileGlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { debouncedQuery, isLoading, results, totalResultsCount } = useGlobalSearch(query);

  // Close search results dropdown on click outside
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
    <div className="relative w-full min-w-0 font-sans" ref={containerRef}>
      <GlobalSearchInput
        inputRef={inputRef}
        value={query}
        onChange={(val) => {
          setQuery(val);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onClear={() => {
          setQuery('');
          setIsOpen(false);
        }}
        isLoading={isLoading}
        placeholder="Search Academy..."
        className="w-full"
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-left"
          >
            <GlobalSearchResults
              query={debouncedQuery}
              results={results}
              totalResultsCount={totalResultsCount}
              isLoading={isLoading}
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
