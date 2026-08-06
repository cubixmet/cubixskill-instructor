import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useWebsiteStore } from '../store/website.store';
import { usePlatformStore } from '../../../store/usePlatformStore';

export const WebsiteCanvas: React.FC = () => {
  const activePageSlug = useWebsiteStore((state) => state.activePageSlug);
  const pages = useWebsiteStore((state) => state.pages);
  const viewportMode = useWebsiteStore((state) => state.viewportMode);

  const activeSectionId = useWebsiteStore((state) => state.activeSectionId);
  const setActiveSectionId = useWebsiteStore((state) => state.setActiveSectionId);
  const removeSection = useWebsiteStore((state) => state.removeSection);
  const reorderSections = useWebsiteStore((state) => state.reorderSections);

  const publishedCourses = usePlatformStore((state) => state.courses || []);

  const currentPage = pages.find((p) => p.slug === activePageSlug) || pages[0];
  const sections = currentPage?.sections || [];

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSecs = [...sections];
    const temp = newSecs[index - 1];
    newSecs[index - 1] = newSecs[index];
    newSecs[index] = temp;
    reorderSections(activePageSlug, newSecs);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSecs = [...sections];
    const temp = newSecs[index + 1];
    newSecs[index + 1] = newSecs[index];
    newSecs[index] = temp;
    reorderSections(activePageSlug, newSecs);
  };

  // Viewport Container Widths
  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'tablet':
        return 'w-[768px]';
      case 'mobile':
        return 'w-[375px]';
      default:
        return 'w-full max-w-[1400px]';
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto flex flex-col items-center select-none no-scrollbar">
      <div className={`${getViewportWidth()} transition-all duration-300 bg-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden font-sans text-slate-900`}>
        {/* PUBLIC ACADEMY NAVIGATION HEADER */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 font-black text-blue-600 text-base tracking-tight">
            <BookOpen className="w-5 h-5" />
            <span>CubixSkill Academy</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-extrabold text-slate-700">
            <span className="text-blue-600">Home</span>
            <span>Courses</span>
            <span>Instructors</span>
            <span>About</span>
            <span>Contact</span>
          </div>

          <button type="button" className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-xs">
            Student Login
          </button>
        </header>

        {/* PAGE CANVAS SECTIONS */}
        <div className="divide-y divide-slate-100 min-h-[600px]">
          {sections.map((section, idx) => {
            const isSelected = activeSectionId === section.id;

            return (
              <div
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`relative group transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/10' : 'hover:ring-1 hover:ring-blue-300'
                }`}
              >
                {/* SECTION TOOLBAR CONTROLS (ON HOVER / SELECTION) */}
                <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white p-1 rounded-xl shadow-lg flex items-center gap-1">
                  <span className="text-[10px] font-bold px-2 uppercase text-slate-300">{section.type}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(idx);
                    }}
                    className="p-1 hover:text-blue-400 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(idx);
                    }}
                    className="p-1 hover:text-blue-400 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(activePageSlug, section.id);
                    }}
                    className="p-1 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1. HERO SECTION */}
                {section.type === 'hero' && (
                  <div className="py-16 px-6 sm:px-12 text-center space-y-6 bg-gradient-to-b from-blue-50/50 to-white">
                    <div className="max-w-3xl mx-auto space-y-3">
                      <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full">
                        Official Learning Academy
                      </span>
                      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        {section.title}
                      </h1>
                      <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed font-medium">
                        {section.subtitle}
                      </p>
                    </div>

                    <div className="flex justify-center gap-3">
                      <button type="button" className="px-6 py-3 rounded-2xl bg-[#2563EB] text-white font-extrabold text-xs shadow-md flex items-center gap-2">
                        {section.ctaText || 'Explore Courses'} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {section.imageUrl && (
                      <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200 mt-6">
                        <img src={section.imageUrl} alt="Hero" className="w-full h-64 object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {/* 2. COURSES SECTION */}
                {section.type === 'courses' && (
                  <div className="py-12 px-6 sm:px-12 space-y-6 bg-slate-50/50">
                    <div className="text-center space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{section.title}</h2>
                      <p className="text-xs text-slate-500 font-medium">{section.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {publishedCourses.slice(0, 3).map((c) => (
                        <div key={c.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs space-y-2 p-3 text-left">
                          <img src={(c as any).thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'} alt={c.title} className="w-full h-32 object-cover rounded-xl" />
                          <h4 className="font-extrabold text-slate-900 text-xs truncate">{c.title}</h4>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-black text-blue-600">₹{(c as any).price || 4999}</span>
                            <span className="text-slate-400 font-bold">4.9 ★ (420)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. TESTIMONIALS SECTION */}
                {section.type === 'testimonials' && (
                  <div className="py-12 px-6 sm:px-12 space-y-6 bg-white text-center">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{section.title}</h2>
                      <p className="text-xs text-slate-500 font-medium">{section.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">★★★★★</div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          "CubixSkill transformed our dev team's full-stack architecture skills in just 4 weeks!"
                        </p>
                        <span className="font-extrabold text-slate-900 text-xs block">— Aarav Sharma (Senior Frontend Engineer)</span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">★★★★★</div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          "The live virtual classroom &amp; verified QR certificates are absolute game-changers."
                        </p>
                        <span className="font-extrabold text-slate-900 text-xs block">— Priya Patel (Full Stack Developer)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. FOOTER SECTION */}
                {section.type === 'footer' && (
                  <div className="py-8 px-6 bg-slate-900 text-white text-center space-y-2">
                    <h3 className="font-black text-base tracking-tight text-white">{section.title}</h3>
                    <p className="text-xs text-slate-400 font-medium">{section.subtitle}</p>
                  </div>
                )}

                {/* GENERIC SECTION FALLBACK */}
                {section.type !== 'hero' && section.type !== 'courses' && section.type !== 'testimonials' && section.type !== 'footer' && (
                  <div className="py-10 px-6 text-center space-y-2 bg-slate-50">
                    <h3 className="text-xl font-black text-slate-900">{section.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{section.subtitle}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
