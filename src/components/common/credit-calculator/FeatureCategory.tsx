import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CalculatorFeature, FeatureCategoryName } from './types';
import { FeatureCard } from './FeatureCard';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureCategoryProps {
  categoryName: FeatureCategoryName;
  features: CalculatorFeature[];
  selectedFeatureIds: Set<string>;
  onToggleFeature: (id: string) => void;
  onConfigureFeature?: (feature: CalculatorFeature) => void;
}

export const FeatureCategory: React.FC<FeatureCategoryProps> = ({
  categoryName,
  features,
  selectedFeatureIds,
  onToggleFeature,
  onConfigureFeature,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const selectedCount = features.filter((f) => selectedFeatureIds.has(f.id)).length;

  if (features.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all text-left">
      {/* Category Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer border-b border-slate-100"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
            {categoryName}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
            {selectedCount} of {features.length} Selected
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
      </button>

      {/* Category Body Grid */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  isEnabled={selectedFeatureIds.has(feature.id)}
                  onToggle={onToggleFeature}
                  onConfigure={onConfigureFeature}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
