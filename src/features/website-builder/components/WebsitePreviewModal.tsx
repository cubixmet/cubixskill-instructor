import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useWebsiteStore } from '../store/website.store';

export interface WebsitePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebsitePreviewModal: React.FC<WebsitePreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const activePageSlug = useWebsiteStore((state) => state.activePageSlug);
  const pages = useWebsiteStore((state) => state.pages);
  const currentPage = pages.find((p) => p.slug === activePageSlug) || pages[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col font-sans select-none overflow-hidden">
      {/* Top Preview Bar */}
      <div className="h-12 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">
            PUBLIC SITE PREVIEW
          </span>
          <span className="font-bold text-slate-300">
            Viewing: {currentPage.title} (https://cubixskill.com/{currentPage.slug})
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-8 text-xs font-bold text-slate-300 border-slate-700 hover:bg-slate-800"
          leftIcon={<X className="w-4 h-4" />}
        >
          Exit Preview
        </Button>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8 space-y-12 text-slate-900 text-left px-6">
          {currentPage.sections.map((sec) => (
            <div key={sec.id} className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900">{sec.title}</h2>
              <p className="text-slate-600 text-sm">{sec.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
