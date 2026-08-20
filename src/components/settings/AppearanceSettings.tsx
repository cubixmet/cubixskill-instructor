import React from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';

export const AppearanceSettings: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const options: { id: ThemeMode; label: string; description: string; icon: React.ElementType }[] = [
    {
      id: 'light',
      label: 'Light Mode',
      description: 'Clean, high contrast white interface for bright workspaces.',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      description: 'Sleek, eye-friendly dark workspace (#0B1120) with subtle blue glow.',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System Default',
      description: 'Automatically switches to match your operating system theme preference.',
      icon: Laptop,
    },
  ];

  return (
    <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] space-y-5 font-sans text-xs text-left">
      <div className="border-b border-slate-200 dark:border-[#263244] pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Appearance &amp; Theme Customization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select your preferred display theme for the CubixSkill Instructor dashboard.
          </p>
        </div>

        <Badge variant="primary" size="sm" className="font-bold uppercase tracking-wider text-[10px]">
          Current: {resolvedTheme}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/30 dark-blue-shadow-active'
                  : 'bg-slate-50 dark:bg-[#172033] border-slate-200 dark:border-[#263244] hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#263244]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <strong className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">
                  {opt.label}
                </strong>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {/* Visual Mini Preview Box */}
              <div className="pt-2">
                <div
                  className={`h-12 rounded-lg border p-1.5 flex items-center justify-between text-[10px] ${
                    opt.id === 'dark' || (opt.id === 'system' && resolvedTheme === 'dark')
                      ? 'bg-[#0B1120] border-[#263244] text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="font-semibold">Dashboard</span>
                  </div>
                  <div className="w-8 h-2 rounded bg-slate-300 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
