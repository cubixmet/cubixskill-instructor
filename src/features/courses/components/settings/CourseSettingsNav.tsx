import React from 'react';
import {
  FileText,
  Eye,
  DollarSign,
  Download,
  AlertTriangle,
} from 'lucide-react';

export interface SettingsSectionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  featureKey?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SETTINGS_SECTIONS: SettingsSectionItem[] = [
  { id: 'basic', label: 'Basic Information', icon: FileText },
  { id: 'access', label: 'Access & Visibility', icon: Eye },
  { id: 'pricing', label: 'Pricing (INR)', icon: DollarSign },
  { id: 'data-export', label: 'Data & Export', icon: Download },
  { id: 'danger-zone', label: 'Danger Zone', icon: AlertTriangle },
];

export interface CourseSettingsNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  courseFeatures: Record<string, boolean | undefined>;
}

export const CourseSettingsNav: React.FC<CourseSettingsNavProps> = ({
  activeSection,
  onSelectSection,
  courseFeatures,
}) => {
  return (
    <nav className="w-full space-y-1 font-sans text-xs text-left">
      {SETTINGS_SECTIONS.map((sec) => {
        const Icon = sec.icon;
        const isSelected = activeSection === sec.id;
        const isDisabledFeature = sec.featureKey ? courseFeatures[sec.featureKey] === false : false;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={`w-full px-3 py-2.5 rounded-xl font-semibold flex items-center justify-between transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                : isDisabledFeature
                ? 'text-[var(--text-muted)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{sec.label}</span>
            </div>

            {isDisabledFeature && (
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded shrink-0">
                OFF
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
