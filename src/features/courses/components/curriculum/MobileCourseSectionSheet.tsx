import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import {
  COURSE_NAV_GROUPS,
  CourseNavSection,
} from '../../config/courseNavigation.config';

interface MobileCourseSectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sections: CourseNavSection[];
  activeSectionId: string;
  onSelectSection: (section: CourseNavSection) => void;
  courseTitle: string;
}

export const MobileCourseSectionSheet: React.FC<MobileCourseSectionSheetProps> = ({
  isOpen,
  onClose,
  sections,
  activeSectionId,
  onSelectSection,
  courseTitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden font-sans text-left">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Bottom Sheet Drawer */}
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
          <motion.div
            ref={containerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white rounded-t-[24px] shadow-2xl border-t border-[#E2E8F0] overflow-hidden flex flex-col max-h-[85vh] pb-[calc(16px+env(safe-area-inset-bottom))]"
          >
            {/* Sheet Handle */}
            <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Course Sections</h3>
                <p className="text-[11px] text-[#64748B] font-medium truncate max-w-[240px]">
                  {courseTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grouped Section Items List */}
            <div className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
              {COURSE_NAV_GROUPS.map((group) => {
                const groupSections = sections.filter((s) => s.group === group.id);
                if (groupSections.length === 0) return null;

                return (
                  <div key={group.id} className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-[#64748B] tracking-wider px-2 block">
                      {group.label}
                    </span>
                    <div className="space-y-1">
                      {groupSections.map((section) => {
                        const Icon = section.icon;
                        const isSelected = activeSectionId === section.id;

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => {
                              onSelectSection(section);
                              onClose();
                            }}
                            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 text-[#2563EB] border border-blue-100'
                                : 'text-[#0F172A] hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  isSelected ? 'text-[#2563EB]' : 'text-[#64748B]'
                                }`}
                              />
                              <span>{section.label}</span>
                            </div>

                            {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
