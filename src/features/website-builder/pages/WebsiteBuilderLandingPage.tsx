import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Globe, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Layout } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const WebsiteBuilderLandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 font-sans text-xs text-slate-900 text-left pb-16 w-full max-w-full">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Website Builder &amp; Portal Branding
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Select between customizing fixed Student Portal branding or launching the drag-and-drop Public Website Builder.
        </p>
      </div>

      {/* TWO SEPARATED CARDS SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* CARD 1: STUDENT PORTAL BRANDING */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-blue-300 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Palette className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                Fixed Portal Layout
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Student Portal Branding</h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                Customize branding assets for the student learning environment. Layout remains fixed for student UX consistency.
              </p>
            </div>

            <div className="pt-2 space-y-2 border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Customizable Properties:</span>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Academy Name &amp; Support Contact</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Academy Logo File Upload (PNG, JPG, SVG, WEBP)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Favicon &amp; Brand Assets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Support Email &amp; Support Phone Number</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>20 Prebuilt Themes (Accents, Buttons, Progress &amp; Typography)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button
              size="lg"
              onClick={() => navigate('/website-builder/student-portal')}
              className="w-full font-semibold justify-center text-white min-h-[48px]"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Branding Settings
            </Button>
          </div>
        </div>

        {/* CARD 2: PUBLIC WEBSITE BUILDER */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-emerald-300 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Globe className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Drag-and-Drop Studio
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Public Website Builder</h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                Create and manage a high-converting public storefront for your academy with custom pages and live course grids.
              </p>
            </div>

            <div className="pt-2 space-y-2 border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Features &amp; Modules:</span>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Public Academy Website &amp; Landing Pages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Course Grid (Binds directly to published courses)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Header, Navigation &amp; Footer Builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SEO Schema &amp; Meta Settings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automated Lead Capture &amp; Student Registration</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button
              size="lg"
              style={{ backgroundColor: '#059669' }}
              onClick={() => navigate('/website-builder/public-site')}
              className="w-full font-semibold justify-center text-white min-h-[48px]"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Website Builder Studio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
