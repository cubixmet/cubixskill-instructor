import React, { useState } from 'react';
import {
  Palette,
  Globe,
  Sparkles,
  Layout,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { StudentPortalBrandingTab } from '../components/StudentPortalBrandingTab';
import { ThemeGalleryTab } from '../components/ThemeGalleryTab';

import { WebsiteBuilderToolbar } from '../components/WebsiteBuilderToolbar';
import { WebsiteBuilderLeftSidebar } from '../components/WebsiteBuilderLeftSidebar';
import { WebsiteCanvas } from '../components/WebsiteCanvas';
import { WebsiteBuilderRightSidebar } from '../components/WebsiteBuilderRightSidebar';
import { WebsitePreviewModal } from '../components/WebsitePreviewModal';
import { useWebsiteStore } from '../store/website.store';

export const WebsiteBuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student-branding' | 'public-site' | 'themes'>('student-branding');
  const publishWebsite = useWebsiteStore((state) => state.publishWebsite);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="space-y-6 text-left font-sans pb-16">
      {/* 1. TOP MAIN NAV SWITCHER */}
      <Card padding="sm" className="bg-slate-900 border border-slate-800 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <h1 className="text-base font-black tracking-tight text-white">Multi-Academy Website Management System</h1>
              <p className="text-[11px] text-slate-400 font-medium">Manage student portal branding &amp; marketing drag-and-drop public website.</p>
            </div>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('student-branding')}
              className={`px-4 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'student-branding'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Student Portal Branding</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('public-site')}
              className={`px-4 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'public-site'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Public Website Builder</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('themes')}
              className={`px-4 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'themes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>20 Prebuilt Themes</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 2. TAB CONTENT VIEW */}
      {activeTab === 'student-branding' && <StudentPortalBrandingTab />}

      {activeTab === 'themes' && <ThemeGalleryTab />}

      {activeTab === 'public-site' && (
        <div className="h-[750px] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col bg-slate-950">
          <WebsiteBuilderToolbar
            onOpenPreview={() => setIsPreviewOpen(true)}
            onSaveDraft={() => alert('Draft saved.')}
            onPublish={() => {
              publishWebsite();
              alert('Website published!');
            }}
          />

          <div className="flex-1 flex overflow-hidden">
            <WebsiteBuilderLeftSidebar />
            <WebsiteCanvas />
            <WebsiteBuilderRightSidebar />
          </div>

          <WebsitePreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
