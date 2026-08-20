import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from '../../../contexts/ThemeContext';

export const AuthThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { mode: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-xl bg-slate-200/60 dark:bg-[#172033] border border-slate-200 dark:border-[#263244] shadow-2xs backdrop-blur-sm">
      {options.map((opt) => {
        const isActive = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            onClick={() => setTheme(opt.mode)}
            title={`Switch to ${opt.label} Mode`}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
            aria-label={`Switch theme to ${opt.label}`}
          >
            {opt.icon}
            <span className="hidden min-[400px]:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
