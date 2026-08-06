import React, { useState } from 'react';
import {
  Eye,
  CheckCircle2,
  Monitor,
  Tablet,
  Smartphone,
  X,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAcademyBrandingStore, PREBUILT_20_THEMES, type StudentPortalTheme } from '../store/academyBranding.store';

export const ThemeGalleryTab: React.FC = () => {
  const branding = useAcademyBrandingStore((state) => state.branding);
  const setActiveTheme = useAcademyBrandingStore((state) => state.setActiveTheme);

  const [previewTheme, setPreviewTheme] = useState<StudentPortalTheme | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApplyTheme = (themeId: string) => {
    setActiveTheme(themeId);
    setPreviewTheme(null);
    setToastMessage('Theme applied to Student Portal successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-6xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">20 Prebuilt Student Portal Themes</h2>
              <Badge variant="info" size="sm" className="font-bold">
                Zero Layout Disruption
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Choose from 20 professionally crafted theme palettes. Preview themes on Desktop, Tablet, or Mobile before applying.
            </p>
          </div>
        </div>
      </Card>

      {/* 20 THEMES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {PREBUILT_20_THEMES.map((theme) => {
          const isCurrent = branding.activeThemeId === theme.id;
          return (
            <Card
              key={theme.id}
              padding="md"
              className={`transition-all border flex flex-col justify-between space-y-3 ${
                isCurrent ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-500' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${theme.previewBg} p-3 flex flex-col justify-between text-white shadow-xs`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase bg-black/30 px-2 py-0.5 rounded backdrop-blur-xs">
                      {theme.category}
                    </span>
                    {isCurrent && (
                      <span className="bg-white text-blue-600 font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="font-black text-sm">{theme.name}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: theme.primaryColor }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: theme.secondaryColor }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: theme.accentColor }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{theme.primaryColor}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewTheme(theme)}
                  className="flex-1 h-8 text-xs font-bold"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  Preview
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleApplyTheme(theme.id)}
                  disabled={isCurrent}
                  className={`h-8 font-extrabold text-xs px-3 ${
                    isCurrent ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isCurrent ? 'Applied' : 'Apply'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* LIVE INTERACTIVE THEME PREVIEW DRAWER */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col font-sans text-xs overflow-hidden">
          {/* Top Bar */}
          <div className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-sm text-white">{previewTheme.name} Theme Preview</h3>
              <span className="text-slate-500">|</span>
              <div className="flex items-center bg-slate-800 p-1 rounded-xl">
                {[
                  { id: 'desktop', icon: Monitor, label: 'Desktop' },
                  { id: 'tablet', icon: Tablet, label: 'Tablet' },
                  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                ].map((d) => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setPreviewDevice(d.id as any)}
                      className={`p-1.5 px-3 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        previewDevice === d.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleApplyTheme(previewTheme.id)}
                className="bg-blue-600 text-white font-extrabold px-5 h-9"
              >
                Apply Theme to Student Portal
              </Button>
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 bg-slate-900 p-8 overflow-y-auto flex items-center justify-center">
            <div
              className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-white ${
                previewDevice === 'mobile'
                  ? 'w-[375px]'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-full max-w-[1200px]'
              }`}
            >
              {/* Header */}
              <div
                style={{ backgroundColor: previewTheme.headerStyle === 'dark' ? '#0F172A' : '#FFFFFF' }}
                className="h-14 border-b border-slate-200 px-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <img src={branding.logoUrl} alt="Logo" className="w-7 h-7 rounded object-cover" />
                  <span className={previewTheme.headerStyle === 'dark' ? 'text-white' : 'text-slate-900'}>
                    {branding.academyName}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div style={{ backgroundColor: previewTheme.bgStyle }} className="p-8 space-y-6 text-slate-900 text-left">
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Simulated Student Dashboard</span>
                  <h2 className="text-xl font-black text-slate-900">Welcome Back, Alex Student!</h2>
                  <p className="text-slate-600 text-xs font-medium">Continue your enrolled course masterclass seamlessly.</p>
                  <button
                    type="button"
                    style={{ backgroundColor: previewTheme.primaryColor }}
                    className="px-6 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md"
                  >
                    Resume Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
