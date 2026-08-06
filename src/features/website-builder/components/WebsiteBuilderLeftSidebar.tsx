import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Layers,
  Palette,
  Star,
} from 'lucide-react';
import { useWebsiteStore, type SectionType } from '../store/website.store';
import { Button } from '../../../components/ui/Button';

export const WebsiteBuilderLeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'sections' | 'styles'>('pages');

  const pages = useWebsiteStore((state) => state.pages);
  const activePageSlug = useWebsiteStore((state) => state.activePageSlug);
  const setActivePageSlug = useWebsiteStore((state) => state.setActivePageSlug);
  const addPage = useWebsiteStore((state) => state.addPage);
  const deletePage = useWebsiteStore((state) => state.deletePage);
  const setHomePage = useWebsiteStore((state) => state.setHomePage);
  const addSection = useWebsiteStore((state) => state.addSection);
  const theme = useWebsiteStore((state) => state.theme);
  const updateTheme = useWebsiteStore((state) => state.updateTheme);

  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;
    addPage(newPageTitle, newPageSlug || newPageTitle);
    setNewPageTitle('');
    setNewPageSlug('');
  };

  const sectionBlocks: { type: SectionType; title: string; desc: string }[] = [
    { type: 'hero', title: 'Hero Banner', desc: 'Main headline, subtitle & CTA' },
    { type: 'courses', title: 'Course Grid', desc: 'Published academy masterclasses' },
    { type: 'instructors', title: 'Instructors Showcase', desc: 'Profile photos & bio cards' },
    { type: 'testimonials', title: 'Student Testimonials', desc: 'Graduate quotes & ratings' },
    { type: 'pricing', title: 'Pricing & Plans', desc: 'Enrollment tier cards' },
    { type: 'faq', title: 'FAQ Accordion', desc: 'Frequently asked questions' },
    { type: 'contact', title: 'Contact Form', desc: 'Lead capture & inquiry form' },
    { type: 'footer', title: 'Academy Footer', desc: 'Logo, links & copyright' },
  ];

  return (
    <div className="w-[280px] bg-slate-950 border-r border-slate-800 flex flex-col font-sans text-xs text-left shrink-0 overflow-hidden text-white">
      {/* Tab Switcher */}
      <div className="p-2 border-b border-slate-800 grid grid-cols-3 gap-1 bg-slate-900">
        {[
          { id: 'pages', label: 'Pages', icon: FileText },
          { id: 'sections', label: 'Sections', icon: Layers },
          { id: 'styles', label: 'Theme', icon: Palette },
        ].map((t) => {
          const Icon = t.icon;
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                isSelected ? 'bg-blue-600 text-white shadow-xs font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PAGES MANAGER */}
      {activeTab === 'pages' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Academy Pages ({pages.length})</span>
            <div className="space-y-1.5">
              {pages.map((p) => {
                const isActive = p.slug === activePageSlug;
                return (
                  <div
                    key={p.slug}
                    onClick={() => setActivePageSlug(p.slug)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-950/60 border-blue-600/80 text-white font-extrabold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="truncate block font-bold text-xs">{p.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">/{p.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {p.isHomePage ? (
                        <span className="bg-amber-500/20 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-amber-500/30">
                          HOME
                        </span>
                      ) : (
                        <button
                          type="button"
                          title="Set as Home Page"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHomePage(p.slug);
                          }}
                          className="p-1 text-slate-500 hover:text-amber-400"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!p.isHomePage && pages.length > 1 && (
                        <button
                          type="button"
                          title="Delete Page"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(p.slug);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Page Form */}
          <form onSubmit={handleCreatePage} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <span className="font-extrabold text-xs text-white block">Create New Page</span>
            <input
              type="text"
              placeholder="e.g. Testimonials"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              required
              className="w-full h-8 rounded-lg bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <Button type="submit" size="sm" className="w-full h-8 bg-blue-600 text-white font-extrabold text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Page
            </Button>
          </form>
        </div>
      )}

      {/* TAB 2: SECTIONS LIBRARY */}
      {activeTab === 'sections' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Drag &amp; Drop Section Blocks</span>
          {sectionBlocks.map((block) => (
            <div
              key={block.type}
              onClick={() => addSection(activePageSlug, block.type)}
              className="p-3 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div>
                <h4 className="font-extrabold text-xs text-white group-hover:text-blue-400">{block.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium">{block.desc}</p>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: GLOBAL STYLES & THEME */}
      {activeTab === 'styles' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <label className="block font-bold text-slate-300">Primary Brand Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-xs text-slate-400">{theme.primaryColor}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-300">Typography Font Family</label>
            <select
              value={theme.headingFont}
              onChange={(e) => updateTheme({ headingFont: e.target.value, bodyFont: e.target.value })}
              className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 px-3 text-xs text-white font-bold"
            >
              <option value="Inter">Inter (Modern Clean)</option>
              <option value="Roboto">Roboto (Google Standard)</option>
              <option value="Outfit">Outfit (Geometric Enterprise)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
