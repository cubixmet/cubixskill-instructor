import React from 'react';
import { GLOBAL_SETTINGS_SECTIONS } from '../constants/globalSettingsSections';

export interface GlobalSettingsNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
}

export const GlobalSettingsNav: React.FC<GlobalSettingsNavProps> = ({
  activeSection,
  onSelectSection,
}) => {
  return (
    <nav className="w-full space-y-1 font-sans text-xs text-left">
      {GLOBAL_SETTINGS_SECTIONS.map((sec) => {
        const Icon = sec.icon;
        const isSelected = activeSection === sec.id;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={`w-full px-3 py-2.5 rounded-xl font-bold flex items-center justify-between transition-all cursor-pointer ${
              isSelected
                ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{sec.label}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
