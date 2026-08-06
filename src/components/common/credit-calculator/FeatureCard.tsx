import React from 'react';
import { Settings, Sparkles, Star } from 'lucide-react';
import type { CalculatorFeature } from './types';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  feature: CalculatorFeature;
  isEnabled: boolean;
  onToggle: (id: string) => void;
  onConfigure?: (feature: CalculatorFeature) => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  isEnabled,
  onToggle,
  onConfigure,
}) => {
  const Icon = feature.icon;

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      onClick={() => onToggle(feature.id)}
      className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between h-full min-h-[160px] text-left ${
        isEnabled
          ? 'bg-blue-50/60 border-blue-600 shadow-sm ring-1 ring-blue-600/20'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
      }`}
    >
      <div>
        {/* Top Bar: Icon, Badges & Top-Right Toggle Switch */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isEnabled
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>

            {feature.isPremium && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Premium
              </span>
            )}
            {feature.recommended && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Star className="w-2.5 h-2.5 text-blue-600 fill-blue-600" /> Recommended
              </span>
            )}
          </div>

          {/* Accessible Top-Right shadcn Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            aria-label={`Toggle ${feature.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(feature.id);
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              isEnabled ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Feature Title & Description */}
        <h4 className="text-sm font-bold text-slate-900 leading-snug tracking-tight">
          {feature.name}
        </h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5 line-clamp-2">
          {feature.description}
        </p>
      </div>

      {/* Footer: Credit Cost Badge & Optional Configure Button */}
      <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-200/50">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold tracking-tight ${
            isEnabled
              ? 'bg-blue-100/80 text-blue-700 border border-blue-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200/60'
          }`}
        >
          +{feature.creditCost} {feature.creditCost === 1 ? 'Credit' : 'Credits'}
        </span>

        {feature.isConfigurable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfigure?.(feature);
            }}
            className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Settings className="w-3 h-3 text-slate-400" />
            <span>Configure</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
