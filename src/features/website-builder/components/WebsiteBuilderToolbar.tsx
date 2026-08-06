import React from 'react';
import {
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Save,
  Send,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useWebsiteStore } from '../store/website.store';

export interface WebsiteBuilderToolbarProps {
  onOpenPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const WebsiteBuilderToolbar: React.FC<WebsiteBuilderToolbarProps> = ({
  onOpenPreview,
  onSaveDraft,
  onPublish,
}) => {
  const websiteName = useWebsiteStore((state) => state.websiteName);
  const activePageSlug = useWebsiteStore((state) => state.activePageSlug);
  const pages = useWebsiteStore((state) => state.pages);
  const setActivePageSlug = useWebsiteStore((state) => state.setActivePageSlug);
  const viewportMode = useWebsiteStore((state) => state.viewportMode);
  const setViewportMode = useWebsiteStore((state) => state.setViewportMode);

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between font-sans text-white text-xs shrink-0">
      {/* Site Name & Active Page Select */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-2">
          <h2 className="font-extrabold text-sm text-white truncate max-w-xs">{websiteName}</h2>
          <Badge variant="info" size="sm" className="font-bold">
            Live Builder
          </Badge>
        </div>

        <span className="text-slate-600">|</span>

        {/* Page Selector Dropdown */}
        <select
          value={activePageSlug}
          onChange={(e) => setActivePageSlug(e.target.value)}
          className="h-8 px-2.5 rounded-lg bg-slate-800 border border-slate-700 font-extrabold text-white text-xs"
        >
          {pages.map((p) => (
            <option key={p.slug} value={p.slug}>
              Page: {p.title} ({p.slug}) {p.isHomePage ? '★ Home' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Center Viewport Switcher */}
      <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
        {[
          { id: 'desktop', icon: Monitor, label: 'Desktop' },
          { id: 'tablet', icon: Tablet, label: 'Tablet' },
          { id: 'mobile', icon: Smartphone, label: 'Mobile' },
        ].map((vp) => {
          const Icon = vp.icon;
          const isSelected = viewportMode === vp.id;
          return (
            <button
              key={vp.id}
              type="button"
              onClick={() => setViewportMode(vp.id as any)}
              className={`p-1.5 px-2.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isSelected ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{vp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenPreview}
          className="h-8 text-xs font-semibold text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Live Preview
        </Button>

        <Button
          size="sm"
          onClick={onSaveDraft}
          variant="outline"
          className="h-8 text-xs font-semibold text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700"
          leftIcon={<Save className="w-3.5 h-3.5" />}
        >
          Save Draft
        </Button>

        <Button
          size="sm"
          onClick={onPublish}
          className="h-8 bg-[#2563EB] text-white font-extrabold text-xs px-4 hover:bg-blue-700"
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          Publish Website
        </Button>
      </div>
    </header>
  );
};
