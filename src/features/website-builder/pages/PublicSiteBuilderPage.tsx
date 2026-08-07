import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  Save,
  Globe,
  Upload,
  Trash2,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useCourseStore } from '../../courses/store/course.store';
import { useAcademyBrandingStore, PREBUILT_THEMES } from '../store/academy-branding.store';

export type PublicSitePageTab = 'Home' | 'Courses' | 'Contact';

export const PublicSiteBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  const coursesByUuid = useCourseStore((state) => state.coursesByUuid) || {};
  const storeCoursesList = Object.values(coursesByUuid);

  const courses = storeCoursesList.length > 0 ? storeCoursesList.map((c) => ({
    uuid: c.uuid,
    title: c.title,
    level: c.level || 'Advanced',
    duration: `${c.durationHours || 4} Hours`,
    priceDisplay: c.isFree ? 'Free Enrollment' : `₹${(c.price || 3499).toLocaleString()}`,
    thumbnail: c.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
  })) : [
    {
      uuid: 'c-101',
      title: 'Node.js Microservices & Event-Driven Architecture',
      level: 'Advanced',
      duration: '14.5 Hours',
      priceDisplay: '₹3,499',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
    },
    {
      uuid: 'c-102',
      title: 'Full-Stack React 19 & Next.js 15 Enterprise Masterclass',
      level: 'Intermediate',
      duration: '18.0 Hours',
      priceDisplay: '₹4,999',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
    },
    {
      uuid: 'c-103',
      title: 'System Design & Distributed Architectures for Senior Devs',
      level: 'Advanced',
      duration: '22.0 Hours',
      priceDisplay: '₹5,999',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500',
    },
  ];

  // Academy Branding Store State
  const academyName = useAcademyBrandingStore((state) => state.academyName);
  const logoFileUrl = useAcademyBrandingStore((state) => state.logoFileUrl);
  const faviconFileUrl = useAcademyBrandingStore((state) => state.faviconFileUrl);
  const supportEmail = useAcademyBrandingStore((state) => state.supportEmail);
  const supportPhone = useAcademyBrandingStore((state) => state.supportPhone);
  const activeThemeId = useAcademyBrandingStore((state) => state.activeThemeId);
  const customPrimaryColor = useAcademyBrandingStore((state) => state.customPrimaryColor);

  const updateBranding = useAcademyBrandingStore((state) => state.updateBranding);
  const applyTheme = useAcademyBrandingStore((state) => state.applyTheme);
  const removeLogo = useAcademyBrandingStore((state) => state.removeLogo);
  const removeFavicon = useAcademyBrandingStore((state) => state.removeFavicon);
  const resetToDefaults = useAcademyBrandingStore((state) => state.resetToDefaults);
  const getActiveTheme = useAcademyBrandingStore((state) => state.getActiveTheme);

  // Local Master Template Customizable Content Fields
  const [academyTagline, setAcademyTagline] = useState('Software Engineering Academy');
  const [heroBadge, setHeroBadge] = useState('Official Public Academy • Live Cohorts');
  const [heroTitle, setHeroTitle] = useState('Master Industry-Accredited Software Skills with Live Cohorts');
  const [heroDescription, setHeroDescription] = useState(
    'Join thousands of developers mastering production-grade system architectures, microservices, and modern React 19 frameworks with 1-on-1 mentorship.'
  );
  const [heroImageUrl, setHeroImageUrl] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900');
  const [heroCtaLabel, setHeroCtaLabel] = useState('Explore Accredited Courses');
  const [heroSecondaryCtaLabel, setHeroSecondaryCtaLabel] = useState('Book Demo Request');
  const [whatsAppNumber, setWhatsAppNumber] = useState('+1 (555) 019-9831');
  const [address, setAddress] = useState('100 Innovation Parkway, Suite 400, Tech City');
  const [businessHours, setBusinessHours] = useState('Mon - Fri: 9:00 AM - 6:00 PM EST');

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('CodeVerse Software Academy | Master Software Architecture');
  const [seoMetaDescription, setSeoMetaDescription] = useState('Learn microservices, React 19, and cloud-native systems with live cohorts and certificates.');

  // Studio Control States
  const [activeStudioTab, setActiveStudioTab] = useState<'branding' | 'hero' | 'contact' | 'themes' | 'seo'>('branding');
  const [activePreviewPage, setActivePreviewPage] = useState<PublicSitePageTab>('Home');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [confirmModalType, setConfirmModalType] = useState<'logo' | 'favicon' | null>(null);

  // Mobile Drawer Inside Embedded Preview Header
  const [previewMobileMenuOpen, setPreviewMobileMenuOpen] = useState<boolean>(false);

  const activeTheme = getActiveTheme() || PREBUILT_THEMES[0] || {
    id: 'slate_minimal',
    name: 'Slate Minimal',
    primaryColor: '#2563EB',
    secondaryColor: '#0F172A',
    accentColor: '#38BDF8',
  };

  const handleSaveDraft = () => {
    setSaveStatus('Draft Saved!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handlePublish = () => {
    setSaveStatus('Website Published Live!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Unsupported format. Please upload PNG, JPG, JPEG, SVG, or WEBP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds maximum 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (target === 'logo') {
            updateBranding({ logoFileUrl: event.target.result as string });
          } else {
            updateBranding({ faviconFileUrl: event.target.result as string });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-xs text-slate-900 bg-[#F8FAFC] overflow-x-hidden text-left pb-24 xl:pb-6">
      {/* 1. TOP STUDIO TOOLBAR (100% RESPONSIVE LIGHT ENTERPRISE THEME) */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 shrink-0 text-slate-900 z-20 sticky top-0 shadow-2xs">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* ROW 1: BACK BUTTON + TITLE */}
          <div className="flex items-center gap-3 w-full lg:w-auto min-w-0 justify-between lg:justify-start">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/website-builder')}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors shrink-0 min-h-[44px]"
                title="Back to Website Builder Landing"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 block leading-tight truncate">Public Website Master Builder</h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-mono truncate block">Master Template Route: /academy/550e8400-e29b-41d4-a716-446655440000</p>
              </div>
            </div>

            {/* STATUS TOAST ON MOBILE */}
            {saveStatus && <span className="lg:hidden text-xs text-emerald-600 font-bold px-2 truncate">{saveStatus}</span>}
          </div>

          {/* ROW 2: VIEWPORT TOGGLES */}
          <div className="flex items-center justify-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-full lg:w-auto max-w-xs">
            <div className="grid grid-cols-3 gap-1 w-full">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
                  viewport === 'desktop' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
                  viewport === 'tablet' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" /> Tablet
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
                  viewport === 'mobile' ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          </div>

          {/* ROW 3: RIGHT ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto justify-end">
            {saveStatus && <span className="hidden lg:inline text-xs text-emerald-600 font-bold px-2">{saveStatus}</span>}
            <div className="grid grid-cols-1 min-[375px]:grid-cols-3 lg:flex items-center gap-2 w-full lg:w-auto">
              <Button size="sm" variant="outline" onClick={() => resetToDefaults()} className="w-full lg:w-auto bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold min-h-[44px] px-3.5" leftIcon={<RotateCcw className="w-4 h-4" />}>
                Reset
              </Button>
              <Button size="sm" variant="outline" onClick={handleSaveDraft} className="w-full lg:w-auto bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold min-h-[44px] px-3.5" leftIcon={<Save className="w-4 h-4" />}>
                Save Draft
              </Button>
              <Button size="sm" onClick={handlePublish} style={{ backgroundColor: '#059669' }} className="w-full lg:w-auto text-white font-semibold shadow-xs min-h-[44px] px-4" leftIcon={<Globe className="w-4 h-4" />}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN STUDIO BODY (SWITCHES TO 2 COLUMNS ONLY AT XL ≥ 1200px) */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 lg:px-6 lg:py-6 xl:px-8 grid grid-cols-1 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] gap-6 overflow-hidden">
        {/* LEFT PANEL: MASTER TEMPLATE CONTENT & BRANDING STUDIO */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl flex flex-col shrink-0 text-slate-900 overflow-hidden w-full max-w-full min-w-0">
          {/* MASTER LAYOUT LOCKED CARD (LIGHT INFORMATION DESIGN) */}
          <div className="p-3 sm:p-4 bg-[#FFFBEB] border-b border-[#FDE68A] flex items-center justify-between text-xs font-semibold text-[#92400E]">
            <span className="flex items-center gap-1.5 font-bold">
              <Lock className="w-4 h-4 text-[#D97706]" /> Master Layout Locked
            </span>
            <span className="text-[#B45309] text-[11px]">100% Fixed Responsive UI</span>
          </div>

          {/* STUDIO NAVIGATION TABS (5 EQUAL COLUMNS) */}
          <div className="grid grid-cols-5 border-b border-slate-200 p-1.5 bg-slate-100/80 gap-1 text-[11px] font-bold min-w-0 w-full">
            {(
              [
                { id: 'branding', label: 'Branding' },
                { id: 'hero', label: 'Hero' },
                { id: 'contact', label: 'Contact' },
                { id: 'themes', label: 'Themes' },
                { id: 'seo', label: 'SEO' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStudioTab(tab.id)}
                className={`py-2 rounded-xl transition-all cursor-pointer text-center truncate min-h-[36px] ${
                  activeStudioTab === tab.id ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* STUDIO TAB FORM CONTENT */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[700px] hide-scrollbar">
            {/* TAB 1: ACADEMY BRANDING */}
            {activeStudioTab === 'branding' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Academy Name</label>
                  <Input
                    value={academyName}
                    onChange={(e) => updateBranding({ academyName: e.target.value })}
                    className="bg-white border-slate-200 text-slate-900 text-xs font-semibold h-11 focus:border-blue-600"
                    placeholder="Academy Name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Academy Tagline</label>
                  <Input
                    value={academyTagline}
                    onChange={(e) => setAcademyTagline(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 text-xs h-11 focus:border-blue-600"
                    placeholder="e.g. Master Full-Stack Engineering"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Academy Logo</label>
                  {logoFileUrl ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={logoFileUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                        <span className="text-xs font-semibold text-slate-900">Active Custom Logo</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setConfirmModalType('logo')} className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold min-h-[40px] w-full sm:w-auto" leftIcon={<Trash2 className="w-4 h-4" />}>
                        Remove Logo
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 cursor-pointer text-slate-700 hover:border-blue-500 min-h-[52px]">
                      <span className="text-xs font-semibold">Upload Logo (PNG / SVG)</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
                      <Upload className="w-5 h-5 text-slate-400" />
                    </label>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Favicon Icon</label>
                  {faviconFileUrl ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={faviconFileUrl} alt="Favicon" className="w-7 h-7 rounded-lg object-contain border border-slate-200 shrink-0" />
                        <span className="text-xs font-semibold text-slate-900">Active Custom Favicon</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setConfirmModalType('favicon')} className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold min-h-[40px] w-full sm:w-auto" leftIcon={<Trash2 className="w-4 h-4" />}>
                        Remove Favicon
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 cursor-pointer text-slate-700 hover:border-blue-500 min-h-[52px]">
                      <span className="text-xs font-semibold">Upload Favicon (512×512)</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} className="hidden" />
                      <Upload className="w-5 h-5 text-slate-400" />
                    </label>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Support Email</label>
                      <Input
                        value={supportEmail}
                        onChange={(e) => updateBranding({ supportEmail: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 text-xs h-11 focus:border-blue-600"
                        placeholder="support@academy.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Support Phone</label>
                      <Input
                        value={supportPhone}
                        onChange={(e) => updateBranding({ supportPhone: e.target.value })}
                        className="bg-white border-slate-200 text-slate-900 text-xs h-11 focus:border-blue-600"
                        placeholder="+1 (555) 019-9831"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HERO CONTENT */}
            {activeStudioTab === 'hero' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Hero Badge Text</label>
                  <Input
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 text-xs h-11 font-semibold focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Hero Headline</label>
                  <textarea
                    rows={3}
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:border-blue-600 focus:outline-hidden min-h-[90px] resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Hero Subtitle / Description</label>
                  <textarea
                    rows={4}
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-normal focus:border-blue-600 focus:outline-hidden min-h-[110px] resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Hero Image URL</label>
                  <Input
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 text-xs h-11 focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Primary CTA Label</label>
                    <Input
                      value={heroCtaLabel}
                      onChange={(e) => setHeroCtaLabel(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 text-xs h-11 font-semibold focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Secondary CTA Label</label>
                    <Input
                      value={heroSecondaryCtaLabel}
                      onChange={(e) => setHeroSecondaryCtaLabel(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 text-xs h-11 font-semibold focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CONTACT & HOURS */}
            {activeStudioTab === 'contact' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">WhatsApp Contact Number</label>
                  <Input
                    value={whatsAppNumber}
                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 text-xs h-11 focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Physical Campus Address</label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 text-xs h-11 focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Business Operating Hours</label>
                  <Input
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 text-xs h-11 focus:border-blue-600"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: 20 PREBUILT THEMES (RESPONSIVE GRID) */}
            {activeStudioTab === 'themes' && (
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Select 1 of 20 Prebuilt Themes</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-3">
                  {PREBUILT_THEMES.map((theme) => {
                    const isSelected = activeThemeId === theme.id && !customPrimaryColor;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => applyTheme(theme.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected ? 'border-blue-600 bg-blue-50/50 shadow-2xs' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">{theme.name}</span>
                          {isSelected && <span className="text-[10px] font-bold text-blue-600 shrink-0">Applied</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: theme.primaryColor }} />
                          <div className="w-5 h-5 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: theme.secondaryColor }} />
                          <span className="text-[10px] font-mono text-slate-500 truncate">{theme.primaryColor}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: SEO SETTINGS */}
            {activeStudioTab === 'seo' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Meta Page Title</label>
                  <Input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 text-xs h-11 focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Meta Description</label>
                  <textarea
                    rows={4}
                    value={seoMetaDescription}
                    onChange={(e) => setSeoMetaDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-blue-600 focus:outline-hidden min-h-[110px] resize-y"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: MASTER TEMPLATE LIVE PREVIEW CANVAS */}
        <div className="flex-1 bg-slate-100/70 border border-slate-200 shadow-2xs flex flex-col items-center p-2 sm:p-6 overflow-y-auto hide-scrollbar rounded-2xl min-w-0 w-full">
          {/* PAGE SELECTOR TOOLBAR (HOME, COURSES, CONTACT ONLY) */}
          <div className="mb-4 flex flex-wrap items-center justify-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs gap-1.5 z-10 w-full max-w-md">
            {(['Home', 'Courses', 'Contact'] as const).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setActivePreviewPage(page)}
                className={`flex-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                  activePreviewPage === page ? 'bg-[#2563EB] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* MASTER TEMPLATE PREVIEW FRAME (RESPONSIVE VIEWPORT SCALING) */}
          <div
            className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300 flex flex-col text-slate-900 font-sans text-xs min-w-0 mx-auto ${
              viewport === 'mobile'
                ? 'w-full max-w-[390px] min-h-[640px]'
                : viewport === 'tablet'
                ? 'w-full max-w-[768px] min-h-[640px]'
                : 'w-full max-w-[1200px] min-h-[640px]'
            }`}
          >
            {/* MASTER TEMPLATE HEADER */}
            <header className="h-16 px-3 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
              {/* LEFT: LOGO & ACADEMY TITLE */}
              <div className="flex items-center gap-3 min-w-0">
                {logoFileUrl ? (
                  <img src={logoFileUrl} alt="Logo" className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-2xl text-white font-extrabold flex items-center justify-center text-sm shadow-2xs shrink-0" style={{ backgroundColor: activeTheme.primaryColor }}>
                    {(academyName || 'B').substring(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight block leading-tight truncate">
                    {academyName || 'Bright Academy of Technology'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal truncate block mt-0.5">
                    {academyTagline || 'Master Full-Stack Engineering'}
                  </span>
                </div>
              </div>

              {/* DESKTOP NAV LINKS (SHOW ON DESKTOP & TABLET PREVIEW VIEWPORTS) */}
              {viewport !== 'mobile' ? (
                <>
                  <div className="hidden md:flex items-center gap-8 font-semibold text-xs text-slate-600">
                    {(['Home', 'Courses', 'Contact'] as const).map((page) => {
                      const isActive = activePreviewPage === page;
                      return (
                        <span
                          key={page}
                          onClick={() => setActivePreviewPage(page)}
                          className={`relative py-2 cursor-pointer transition-colors ${
                            isActive ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
                          }`}
                          style={{ color: isActive ? activeTheme.primaryColor : undefined }}
                        >
                          {page}
                          {isActive && (
                            <span
                              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                              style={{ backgroundColor: activeTheme.primaryColor }}
                            />
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="hidden sm:inline-flex border-slate-200 text-slate-700 font-semibold rounded-xl px-3.5 h-9">
                      Book Demo
                    </Button>
                    <Button size="sm" style={{ backgroundColor: activeTheme.primaryColor }} className="text-white font-semibold rounded-xl px-4 h-9 shadow-xs">
                      Enroll Now
                    </Button>
                  </div>
                </>
              ) : (
                /* MOBILE VIEWPORT HEADER MENU TRIGGER */
                <button
                  type="button"
                  onClick={() => setPreviewMobileMenuOpen(true)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </header>

            {/* PREVIEW PAGE BODY */}
            <div className="flex-1 p-4 sm:p-8 space-y-8 bg-slate-50/50 overflow-y-auto">
              {activePreviewPage === 'Home' && (
                <>
                  {/* HERO SECTION */}
                  <div className="rounded-3xl p-5 sm:p-8 border border-slate-200/80 bg-white shadow-2xs space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="space-y-4 text-left">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block" style={{ backgroundColor: `${activeTheme.primaryColor}15`, color: activeTheme.primaryColor }}>
                          {heroBadge}
                        </span>

                        <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          {heroTitle}
                        </h1>

                        <p className="text-xs text-slate-600 font-normal leading-relaxed">
                          {heroDescription}
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <Button size="md" style={{ backgroundColor: activeTheme.primaryColor }} className="text-white font-semibold rounded-xl px-6 min-h-[44px]">
                            {heroCtaLabel}
                          </Button>
                          <Button size="md" variant="outline" className="border-slate-200 text-slate-700 font-semibold rounded-xl px-5 min-h-[44px]">
                            {heroSecondaryCtaLabel}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <img
                          src={heroImageUrl}
                          alt="Hero Showcase"
                          className="aspect-16/10 w-full rounded-2xl object-cover border border-slate-200 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FEATURED COURSES SECTION */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h2 className="text-base font-bold text-slate-900">Featured Academy Courses</h2>
                      <span className="text-xs font-semibold hover:underline cursor-pointer" style={{ color: activeTheme.primaryColor }} onClick={() => setActivePreviewPage('Courses')}>View All</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(courses || []).slice(0, 3).map((c) => (
                        <div key={c.uuid} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                          <img src={c.thumbnail} alt={c.title} className="w-full aspect-16/10 rounded-xl object-cover border border-slate-100" />
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.level} • {c.duration}</span>
                            <h3 className="font-bold text-sm text-slate-900 leading-snug">{c.title}</h3>
                            <p className="text-xs font-bold" style={{ color: activeTheme.primaryColor }}>{c.priceDisplay}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activePreviewPage === 'Courses' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">All Courses ({(courses || []).length})</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(courses || []).map((c) => (
                      <div key={c.uuid} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                        <img src={c.thumbnail} alt={c.title} className="w-full aspect-16/10 rounded-xl object-cover border border-slate-100" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.level}</span>
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">{c.title}</h3>
                        <p className="text-xs font-bold" style={{ color: activeTheme.primaryColor }}>{c.priceDisplay}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePreviewPage === 'Contact' && (
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Contact Admissions &amp; Support</h2>
                  <div className="space-y-3 text-xs text-slate-600">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400 shrink-0" /> Support Email: <span className="font-semibold text-slate-900 truncate">{supportEmail}</span></p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400 shrink-0" /> Support Phone: <span className="font-semibold text-slate-900">{supportPhone}</span></p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-500 shrink-0" /> WhatsApp: <span className="font-semibold text-slate-900">{whatsAppNumber}</span></p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /> Campus Address: <span className="font-semibold text-slate-900">{address}</span></p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400 shrink-0" /> Business Hours: <span className="font-semibold text-slate-900">{businessHours}</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* MASTER TEMPLATE FOOTER */}
            <footer className="bg-slate-950 text-slate-400 p-6 border-t border-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 text-center sm:text-left">
                <div>
                  <span className="font-bold text-white text-sm block">{academyName}</span>
                  <span className="text-xs text-slate-500 block mt-0.5">{academyTagline}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
                  <span className="hover:text-white cursor-pointer" onClick={() => setActivePreviewPage('Home')}>Home</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => setActivePreviewPage('Courses')}>All Courses</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => setActivePreviewPage('Contact')}>Contact Support</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 text-center">
                <span>&copy; {new Date().getFullYear()} {academyName}. All rights reserved.</span>
                <span>Powered by CubixSkill Platform</span>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* STICKY MOBILE SAVE BAR (< 640px) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg z-50 flex items-center gap-2 sm:hidden">
        <Button size="sm" variant="outline" onClick={handleSaveDraft} className="flex-1 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 font-semibold min-h-[44px]" leftIcon={<Save className="w-4 h-4" />}>
          Save Draft
        </Button>
        <Button size="sm" onClick={handlePublish} style={{ backgroundColor: '#059669' }} className="flex-1 text-white font-semibold shadow-xs min-h-[44px]" leftIcon={<Globe className="w-4 h-4" />}>
          Publish
        </Button>
      </div>

      {/* CONFIRMATION MODAL FOR LOGO / FAVICON REMOVAL */}
      {confirmModalType && (
        <Modal
          isOpen={!!confirmModalType}
          onClose={() => setConfirmModalType(null)}
          title={confirmModalType === 'logo' ? 'Remove Logo?' : 'Remove Favicon?'}
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p>Are you sure you want to remove the uploaded {confirmModalType} file?</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button size="sm" variant="outline" onClick={() => setConfirmModalType(null)} className="text-slate-700 border-slate-200 min-h-[40px]">Cancel</Button>
              <Button size="sm" onClick={() => { if (confirmModalType === 'logo') removeLogo(); else removeFavicon(); setConfirmModalType(null); }} className="bg-rose-600 text-white font-semibold min-h-[40px]">Confirm</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PREVIEW MOBILE DRAWER OVERLAY */}
      {previewMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col font-sans text-xs">
          <div className="p-4 bg-white flex items-center justify-between border-b border-slate-200">
            <span className="font-extrabold text-sm text-slate-900">{academyName}</span>
            <button
              type="button"
              onClick={() => setPreviewMobileMenuOpen(false)}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 bg-white flex-1 space-y-4">
            <div className="space-y-3 font-semibold text-sm text-slate-800">
              <div className="p-3 rounded-xl hover:bg-slate-100 cursor-pointer" onClick={() => { setActivePreviewPage('Home'); setPreviewMobileMenuOpen(false); }}>Home</div>
              <div className="p-3 rounded-xl hover:bg-slate-100 cursor-pointer" onClick={() => { setActivePreviewPage('Courses'); setPreviewMobileMenuOpen(false); }}>Courses</div>
              <div className="p-3 rounded-xl hover:bg-slate-100 cursor-pointer" onClick={() => { setActivePreviewPage('Contact'); setPreviewMobileMenuOpen(false); }}>Contact</div>
            </div>
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <Button size="md" variant="outline" className="w-full font-semibold justify-center min-h-[44px]">
                Book Demo Request
              </Button>
              <Button size="md" style={{ backgroundColor: activeTheme.primaryColor }} className="w-full font-semibold justify-center text-white min-h-[44px]">
                Enroll Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
