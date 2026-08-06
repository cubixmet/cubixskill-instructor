import React, { useState } from 'react';
import { Sliders, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { useWebsiteStore } from '../store/website.store';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

export const WebsiteBuilderRightSidebar: React.FC = () => {
  const activePageSlug = useWebsiteStore((state) => state.activePageSlug);
  const activeSectionId = useWebsiteStore((state) => state.activeSectionId);
  const pages = useWebsiteStore((state) => state.pages);
  const updateSection = useWebsiteStore((state) => state.updateSection);

  const [storageNoticeOpen, setStorageNoticeOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState('');

  const currentPage = pages.find((p) => p.slug === activePageSlug);
  const activeSection = currentPage?.sections.find((s) => s.id === activeSectionId);

  if (!activeSection) {
    return (
      <div className="w-[320px] bg-slate-950 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center font-sans text-xs text-slate-400 shrink-0 select-none">
        <Sliders className="w-8 h-8 text-slate-600 mb-2" />
        <h4 className="font-extrabold text-white text-xs">No Section Selected</h4>
        <p className="text-[11px] text-slate-400 mt-1">Click any section on the canvas to inspect &amp; edit properties.</p>
      </div>
    );
  }

  const handleConfirmStorageNotice = () => {
    if (pendingImageUrl && activeSection) {
      updateSection(activePageSlug, activeSection.id, { imageUrl: pendingImageUrl });
    }
    setStorageNoticeOpen(false);
  };

  return (
    <div className="w-[320px] bg-slate-950 border-l border-slate-800 flex flex-col font-sans text-xs text-left shrink-0 overflow-y-auto p-4 space-y-4 text-white">
      <div className="border-b border-slate-800 pb-2">
        <span className="text-[10px] font-bold uppercase text-blue-400 block">Element Property Inspector</span>
        <h3 className="font-extrabold text-sm text-white capitalize">{activeSection.type} Section Properties</h3>
      </div>

      {/* Content Controls */}
      <div className="space-y-3">
        <div>
          <label className="block font-bold text-slate-300 mb-1">Headline Title *</label>
          <Input
            value={activeSection.title}
            onChange={(e) => updateSection(activePageSlug, activeSection.id, { title: e.target.value })}
            className="bg-slate-900 border-slate-800 text-white"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-300 mb-1">Subtitle / Overview</label>
          <textarea
            rows={3}
            value={activeSection.subtitle}
            onChange={(e) => updateSection(activePageSlug, activeSection.id, { subtitle: e.target.value })}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {activeSection.type === 'hero' && (
          <>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Call to Action (CTA) Button Text</label>
              <Input
                value={activeSection.ctaText || ''}
                onChange={(e) => updateSection(activePageSlug, activeSection.id, { ctaText: e.target.value })}
                className="bg-slate-900 border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Hero Image URL</label>
              <Input
                placeholder="https://images.unsplash.com/photo-..."
                value={activeSection.imageUrl || ''}
                onChange={(e) => {
                  setPendingImageUrl(e.target.value);
                  setStorageNoticeOpen(true);
                }}
                className="bg-slate-900 border-slate-800 text-white"
                leftIcon={<ImageIcon className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </>
        )}
      </div>

      {/* Style & Spacing Controls */}
      <div className="pt-3 border-t border-slate-800 space-y-3">
        <span className="text-[10px] font-bold uppercase text-slate-400 block">Section Layout &amp; Padding</span>

        <div>
          <label className="block font-bold text-slate-300 mb-1">Background Style</label>
          <select
            value={activeSection.bgStyle || 'white'}
            onChange={(e) => updateSection(activePageSlug, activeSection.id, { bgStyle: e.target.value as any })}
            className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-3 text-xs text-white font-bold"
          >
            <option value="white">Clean White</option>
            <option value="light">Soft Gray Accent</option>
            <option value="dark">Dark Slate Accent</option>
          </select>
        </div>
      </div>

      {/* STORAGE CREDIT WARNING MODAL */}
      <Modal
        isOpen={storageNoticeOpen}
        onClose={() => setStorageNoticeOpen(false)}
        title="⚠ Media Storage Credit Notice"
        subtitle="Instructor storage quota usage notice."
        maxWidth="sm"
      >
        <div className="space-y-4 font-sans text-xs text-left">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
            <div className="flex items-center gap-2 font-black text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Academy Storage Consumption Notice</span>
            </div>
            <p className="text-amber-800 text-xs leading-relaxed font-medium">
              Images uploaded to website sections are stored in your academy media storage. Storage credits will be deducted based on the uploaded file size.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setStorageNoticeOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmStorageNotice} className="bg-blue-600 text-white font-extrabold px-5">
              Confirm &amp; Update Image
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
