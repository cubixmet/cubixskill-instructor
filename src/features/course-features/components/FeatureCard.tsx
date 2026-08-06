import React from 'react';
import { Sliders, Sparkles, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import type { CourseFeatureDefinition } from '../config/course-features';

export interface FeatureCardProps {
  feature: CourseFeatureDefinition;
  isEnabled: boolean;
  onToggle: (featureId: string, newState: boolean) => void;
  onConfigure?: (feature: CourseFeatureDefinition) => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  isEnabled,
  onToggle,
  onConfigure,
}) => {
  return (
    <Card
      padding="md"
      className={`transition-all border font-sans text-xs text-left flex flex-col justify-between shadow-2xs space-y-3 ${
        isEnabled
          ? 'bg-blue-50/20 border-blue-300 ring-1 ring-blue-500/10'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="space-y-2">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {feature.isRequired && (
              <Badge variant="error" size="sm" className="font-extrabold">
                Mandatory Base
              </Badge>
            )}
            {feature.isRecommended && (
              <Badge variant="success" size="sm" className="font-extrabold">
                Recommended
              </Badge>
            )}
            {feature.isPremium && (
              <Badge variant="warning" size="sm" className="font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Premium
              </Badge>
            )}
          </div>

          <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            +{feature.creditCostPerStudent} Credits/Student
          </span>
        </div>

        {/* Feature Title & Description */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
            {feature.name}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-medium line-clamp-2">
            {feature.description}
          </p>
        </div>

        {/* Dependencies note */}
        {feature.dependencies && feature.dependencies.length > 0 && (
          <div className="text-[10px] text-slate-500 font-semibold bg-slate-100/80 px-2 py-1 rounded border border-slate-200">
            Requires: {feature.dependencies.join(', ')}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
        {feature.settingsSchema ? (
          <button
            type="button"
            onClick={() => onConfigure?.(feature)}
            className="text-blue-600 font-extrabold text-xs flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" /> Configure
          </button>
        ) : (
          <span className="text-[10px] text-slate-400 font-medium">Standard Feature</span>
        )}

        {/* Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            disabled={feature.isRequired}
            onChange={(e) => onToggle(feature.id, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50" />
        </label>
      </div>
    </Card>
  );
};
