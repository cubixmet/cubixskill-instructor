import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Globe, CheckCircle2, ArrowRight, Layout, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const WebsiteBuilderLandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-xs text-slate-900 text-left pb-24 sm:pb-16 w-full max-w-full min-w-0 px-2.5 sm:px-0 overflow-x-hidden">
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-medium text-slate-900 tracking-tight">
          Website Builder
        </h1>
        <p className="text-slate-500 text-xs font-normal leading-relaxed">
          Customize your Student Portal branding or configure your public-facing academy website.
        </p>
      </div>

      {/* TWO BUILDER OPTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CARD 1: STUDENT PORTAL BRANDING */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                Fixed Portal Layout
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-medium text-slate-900">Student Portal</h2>
              <p className="text-slate-500 text-xs font-normal leading-relaxed">
                Customize the logged-in student learning experience with logos, colors, and branding.
              </p>
            </div>

            <div className="pt-2 space-y-1.5 border-t border-slate-100">
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-normal">Academy Name &amp; Support Contact</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-normal">Logo &amp; Favicon Upload</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-normal">20 Prebuilt Themes with Color Accents</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-normal">Support Email &amp; Phone</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Button
              size="sm"
              onClick={() => navigate('/website-builder/student-portal')}
              className="w-full h-[38px] min-h-[38px] font-medium text-xs justify-center text-white rounded-xl"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Customize Portal
            </Button>
          </div>
        </div>

        {/* CARD 2: PUBLIC WEBSITE BUILDER */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-emerald-200 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                Builder Studio
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-medium text-slate-900">Public Site</h2>
              <p className="text-slate-600 text-xs font-normal leading-relaxed">
                Create and manage the public academy website with pages, hero sections, and SEO settings.
              </p>
            </div>

            <div className="pt-2 space-y-1.5 border-t border-slate-100">
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-normal">Public Academy Landing Pages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-normal">Live Course Grid &amp; Navigation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-normal">Hero, Branding &amp; Footer Builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-normal">SEO Schema &amp; Meta Settings</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Button
              size="sm"
              style={{ backgroundColor: '#059669' }}
              onClick={() => navigate('/website-builder/public-site')}
              className="w-full h-[38px] min-h-[38px] font-medium text-xs justify-center text-white rounded-xl"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Customize Public Site
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
