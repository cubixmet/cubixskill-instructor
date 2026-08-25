import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Check,
  Bell,
  ChevronDown,
  BookOpen,
  CirclePlay,
  Clock3,
  FileCheck2,
  Medal,
  Video,
  Layers,
  Palette,
  Type,
  Layout,
  Sliders,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useCourseStore } from '../../courses/store/course.store';
import { websiteBuilderService, AcademyWebsiteThemeConfig } from '../../../services/websiteBuilder.service';
import { resolveMediaUrl } from '../../../utils/media.utils';
import { normalizeAcademyId, buildAcademyPublicWebsiteUrl } from '../../../utils/publicWebsiteUrl.utils';

export type PreviewTarget = 'public_website' | 'student_portal';
export type ViewportDevice = 'desktop' | 'tablet' | 'mobile';
export type StudioTab = 'branding' | 'colors' | 'typography' | 'buttons' | 'header_footer' | 'content';

const DEFAULT_THEME: AcademyWebsiteThemeConfig = {
  primary_color: '#2563EB',
  secondary_color: '#0F172A',
  accent_color: '#38BDF8',
  background_color: '#F8FAFC',
  surface_color: '#FFFFFF',
  text_color: '#0F172A',
  muted_text_color: '#64748B',
  border_color: '#E2E8F0',
  body_font: 'Inter',
  heading_font: 'Inter',
  button_radius: '12px',
  card_radius: '16px',
  header_variant: 'default',
  footer_variant: 'default',
  academy_name: 'CodeVerse Software Academy',
  academy_tagline: 'Software Engineering Academy',
  hero_badge: 'Official Public Academy • Live Cohorts',
  home_hero_title: 'Master Industry-Accredited Software Skills with Live Cohorts',
  home_hero_subtitle: 'Join thousands of developers mastering production-grade system architectures, microservices, and modern React 19 frameworks with 1-on-1 mentorship.',
  hero_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900',
  hero_cta_label: 'Explore Accredited Courses',
  hero_secondary_cta_label: 'Book Demo Request',
  courses_title: 'Featured Academy Masterclasses',
  courses_description: 'Explore our available professional courses.',
  contact_title: 'Contact Admissions & Support',
  contact_description: 'Get in touch with our team for cohort enrollment and support.',
  whatsapp_number: '+1 (555) 019-9831',
  address: '100 Innovation Parkway, Suite 400, Tech City',
  business_hours: 'Mon - Fri: 9:00 AM - 6:00 PM EST',
};

const PRESET_PALETTES = [
  { name: 'Modern Blue', primary: '#2563EB', secondary: '#0F172A', accent: '#38BDF8' },
  { name: 'Emerald Tech', primary: '#059669', secondary: '#064E3B', accent: '#34D399' },
  { name: 'Indigo Enterprise', primary: '#4F46E5', secondary: '#1E1B4B', accent: '#818CF8' },
  { name: 'Cyber Purple', primary: '#7C3AED', secondary: '#2E1065', accent: '#C084FC' },
  { name: 'Warm Amber', primary: '#D97706', secondary: '#451A03', accent: '#FBBF24' },
  { name: 'Slate Dark', primary: '#3B82F6', secondary: '#0B1120', accent: '#60A5FA' },
];

export const WebsiteBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  // Load real courses for preview
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid) || {};
  const storeCoursesList = Object.values(coursesByUuid);
  const courses = storeCoursesList.length > 0 ? storeCoursesList.map((c) => ({
    uuid: c.uuid,
    title: c.title,
    level: c.level || 'Advanced',
    duration: `${c.durationHours || 4} Hours`,
    priceDisplay: c.isFree ? 'Free Enrollment' : `₹${(c.price || 3499).toLocaleString()}`,
    thumbnail: c.thumbnailUrl ? resolveMediaUrl(c.thumbnailUrl) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
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

  // Core Theme State (ONE SINGLE THEME OBJECT)
  const [draftTheme, setDraftTheme] = useState<AcademyWebsiteThemeConfig>(DEFAULT_THEME);
  const [savedDraft, setSavedDraft] = useState<AcademyWebsiteThemeConfig>(DEFAULT_THEME);
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [faviconUrl, setFaviconUrl] = useState<string>('');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(false);

  // Editor UI Controls
  const [activeTab, setActiveTab] = useState<StudioTab>('branding');
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget>('public_website');
  const [viewport, setViewport] = useState<ViewportDevice>('desktop');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'design' | 'settings'>('design');

  // Overflow Menu on Mobile Header
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Interactive State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmModalType, setConfirmModalType] = useState<'logo' | 'favicon' | 'reset' | null>(null);

  // Mobile Drawer Inside Embedded Preview Header
  const [previewMobileMenuOpen, setPreviewMobileMenuOpen] = useState<boolean>(false);

  // Fetch initial theme settings from backend DB
  useEffect(() => {
    let isMounted = true;
    async function loadBackendSettings() {
      try {
        setIsLoading(true);
        const data = await websiteBuilderService.getSettings();
        if (isMounted && data) {
          if (data.academy_id) {
            setAcademyId(normalizeAcademyId(data.academy_id));
          }
          const loadedConfig = { ...DEFAULT_THEME, ...(data.draft_config || {}) };
          if (data.academy_name) loadedConfig.academy_name = data.academy_name;
          setDraftTheme(loadedConfig);
          setSavedDraft(loadedConfig);
          if (data.logo_url) setLogoUrl(resolveMediaUrl(data.logo_url));
          if (data.favicon_url) setFaviconUrl(resolveMediaUrl(data.favicon_url));
          setPublishedAt(data.published_at);
          setHasUnpublishedChanges(data.has_unpublished_changes);
        }
      } catch {
        // Safe fallback to defaults if offline
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadBackendSettings();
    return () => { isMounted = false; };
  }, []);

  const publicWebsiteUrl = buildAcademyPublicWebsiteUrl(academyId);

  const updateDraft = (updates: Partial<AcademyWebsiteThemeConfig>) => {
    setDraftTheme((prev) => {
      const next = { ...prev, ...updates };
      setHasUnpublishedChanges(JSON.stringify(next) !== JSON.stringify(savedDraft));
      return next;
    });
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await websiteBuilderService.updateDraftSettings(draftTheme);
      setSavedDraft(draftTheme);
      setHasUnpublishedChanges(res.has_unpublished_changes);
      showToast('Draft theme settings saved successfully!');
    } catch {
      showToast('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      // 1. Flush/save latest draft first
      await websiteBuilderService.updateDraftSettings(draftTheme);
      // 2. Publish
      const res = await websiteBuilderService.publishSettings();
      setSavedDraft(draftTheme);
      setPublishedAt(res.published_at);
      setHasUnpublishedChanges(false);
      showToast('Website theme successfully published live to production!');
    } catch {
      showToast('Failed to publish theme. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleResetToSaved = () => {
    setDraftTheme(savedDraft);
    setHasUnpublishedChanges(false);
    showToast('Reset unsaved changes to last saved draft.');
    setConfirmModalType(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
            setLogoUrl(event.target.result as string);
          } else {
            setFaviconUrl(event.target.result as string);
          }
          showToast(`Uploaded temporary ${target}. Save draft to persist.`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip min-h-screen flex flex-col font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0B1120] pb-24 lg:pb-6 font-normal">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 bg-[#0F172A] dark:bg-[#1E293B] text-white font-medium text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#334155] animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. BUILDER HEADER (COMPACT & RESPONSIVE ON ALL VIEWPORTS) */}
      <header className="bg-white dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-[#263244] px-3 sm:px-6 py-2.5 shrink-0 text-[#0F172A] dark:text-[#F8FAFC] z-20 sticky top-0 shadow-2xs w-full min-w-0 max-w-full">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 min-w-0">
          {/* LEFT: BACK BUTTON + TITLE */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] flex items-center justify-center text-[#475569] dark:text-[#CBD5E1] cursor-pointer transition-colors shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="font-semibold text-sm sm:text-base text-[#0F172A] dark:text-[#F8FAFC] block leading-tight truncate">Website Builder</h1>
                {hasUnpublishedChanges ? (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-[rgba(245,158,11,0.12)] text-amber-700 dark:text-[#FBBF24] border border-amber-200 dark:border-[rgba(245,158,11,0.22)] shrink-0">
                    Unpublished
                  </span>
                ) : (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-700 dark:text-[#34D399] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)] shrink-0">
                    Published
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] font-normal truncate block mt-0.5">
                Single Theme Studio
              </p>
            </div>
          </div>

          {/* MIDDLE: PREVIEW TARGET & DEVICE VIEWPORT CONTROLS (DESKTOP & TABLET) */}
          <div className="hidden lg:flex items-center gap-2 min-w-0">
            {/* PREVIEW TARGET SELECTOR */}
            <div className="flex items-center bg-slate-100 dark:bg-[#172033] p-1 rounded-xl border border-[#CBD5E1] dark:border-[#334155]">
              <button
                type="button"
                onClick={() => setPreviewTarget('public_website')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[34px] flex items-center justify-center gap-1.5 ${
                  previewTarget === 'public_website'
                    ? 'bg-[#2563EB] text-white shadow-2xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Public Website
              </button>
              <button
                type="button"
                onClick={() => setPreviewTarget('student_portal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[34px] flex items-center justify-center gap-1.5 ${
                  previewTarget === 'student_portal'
                    ? 'bg-[#2563EB] text-white shadow-2xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Student Portal
              </button>
            </div>

            {/* DEVICE VIEWPORT SELECTOR */}
            <div className="flex items-center bg-slate-100 dark:bg-[#172033] p-1 rounded-xl border border-[#CBD5E1] dark:border-[#334155]">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[34px] ${
                  viewport === 'desktop' ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
                title="Desktop View (100% Width)"
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[34px] ${
                  viewport === 'tablet' ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
                title="Tablet View (768px Viewport)"
              >
                <Tablet className="w-3.5 h-3.5" /> Tablet
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[34px] ${
                  viewport === 'mobile' ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs font-semibold' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
                title="Mobile View (390px Viewport)"
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          </div>

          {/* RIGHT ACTIONS: SAVE + OVERFLOW MENU */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-xs min-h-[38px] px-3 cursor-pointer text-xs"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>

            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
              className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs min-h-[38px] px-3 cursor-pointer text-xs"
              leftIcon={<Globe className="w-3.5 h-3.5" />}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>

            {/* OVERFLOW MENU BUTTON (MOBILE & TABLET) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] flex items-center justify-center text-[#475569] dark:text-[#CBD5E1] cursor-pointer"
                title="More Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* OVERFLOW DROPDOWN MENU */}
              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] rounded-xl shadow-xl p-1.5 z-50 text-xs font-medium space-y-1">
                  <button
                    type="button"
                    onClick={() => { setConfirmModalType('reset'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] flex items-center gap-2 cursor-pointer min-h-[36px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" /> Reset Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => { handlePublish(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-emerald-600 dark:text-[#34D399] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 flex items-center gap-2 cursor-pointer min-h-[36px] sm:hidden"
                  >
                    <Globe className="w-3.5 h-3.5" /> Publish Website
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* REAL PUBLIC WEBSITE URL BANNER */}
      <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 pt-3">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Public Website URL</span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal hidden md:inline">
                  (Published Academy Website on port 5174)
                </span>
              </div>
              {publicWebsiteUrl ? (
                <span className="font-mono text-xs text-[#2563EB] dark:text-[#60A5FA] block truncate select-all">
                  {publicWebsiteUrl}
                </span>
              ) : (
                <span className="text-[#64748B] text-xs font-normal block">Loading Academy UUID...</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              disabled={!publicWebsiteUrl}
              onClick={() => {
                if (publicWebsiteUrl) {
                  navigator.clipboard.writeText(publicWebsiteUrl);
                  showToast('Public Website URL copied to clipboard!');
                }
              }}
              className="text-xs font-semibold h-9 border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
            >
              Copy URL
            </Button>

            {publicWebsiteUrl ? (
              <a
                href={publicWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all h-9 shadow-xs cursor-pointer"
              >
                <span>Open Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Button size="sm" disabled className="text-xs font-semibold h-9 opacity-50">
                Open Website
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN BUILDER BODY (RESPONSIVE GRID) */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-2 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 grid grid-cols-1 lg:grid-cols-[minmax(340px,400px)_minmax(0,1fr)] gap-4 items-start min-w-0 max-w-full">
        {/* DESKTOP LEFT DESIGN & CONTENT SETTINGS PANEL (VISIBLE ON LG ≥ 1024PX) */}
        <div className="hidden lg:flex bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs rounded-2xl flex-col shrink-0 text-[#0F172A] dark:text-[#F8FAFC] overflow-hidden w-full min-w-0">
          {/* LOCKED LAYOUT BANNER */}
          <div className="p-3 sm:p-4 bg-[#FFFBEB] dark:bg-[rgba(245,158,11,0.12)] border-b border-[#FDE68A] dark:border-[rgba(245,158,11,0.22)] flex items-center justify-between text-xs font-medium text-[#92400E] dark:text-[#FBBF24]">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" /> Single Shared Academy Theme
            </span>
            <span className="text-[#B45309] dark:text-[#FBBF24] text-[11px] font-normal">Applies to Both Previews</span>
          </div>

          {/* STUDIO NAVIGATION TABS */}
          <div className="grid grid-cols-6 border-b border-[#E2E8F0] dark:border-[#263244] p-1.5 bg-slate-100/80 dark:bg-[#172033] gap-1 text-[11px] font-medium min-w-0 w-full">
            {(
              [
                { id: 'branding', label: 'Branding' },
                { id: 'colors', label: 'Colors' },
                { id: 'typography', label: 'Fonts' },
                { id: 'buttons', label: 'Buttons' },
                { id: 'header_footer', label: 'Header' },
                { id: 'content', label: 'Content' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 rounded-xl transition-all cursor-pointer text-center truncate min-h-[36px] flex flex-col items-center justify-center gap-0.5 ${
                  activeTab === tab.id
                    ? 'bg-[#2563EB] text-white shadow-2xs font-semibold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-white/60 dark:hover:bg-[#1E293B]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* STUDIO TAB FORM CONTROLS */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[700px] hide-scrollbar font-normal">
            {renderTabContent(activeTab, draftTheme, updateDraft, logoUrl, setLogoUrl, faviconUrl, setFaviconUrl, setConfirmModalType, handleFileUpload)}
          </div>
        </div>

        {/* RIGHT LIVE PREVIEW CANVAS (PERMANENTLY RENDERED ON ALL VIEWPORTS) */}
        <div className="flex-1 bg-slate-100/70 dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#263244] shadow-2xs flex flex-col items-center p-2 sm:p-4 md:p-6 overflow-y-auto hide-scrollbar rounded-2xl min-w-0 max-w-full w-full">
          {/* MOBILE TOOLBAR VIEWPORT SWITCHER (< 1024PX) */}
          <div className="flex lg:hidden items-center justify-between gap-2 w-full mb-3 pb-2 border-b border-[#CBD5E1] dark:border-[#263244] min-w-0">
            {/* PREVIEW TARGET TOGGLE */}
            <div className="flex items-center bg-slate-200 dark:bg-[#172033] p-0.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setPreviewTarget('public_website')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer min-h-[32px] truncate ${
                  previewTarget === 'public_website' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
              >
                Public Website
              </button>
              <button
                type="button"
                onClick={() => setPreviewTarget('student_portal')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer min-h-[32px] truncate ${
                  previewTarget === 'student_portal' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
              >
                Student Portal
              </button>
            </div>

            {/* VIEWPORT DEVICE TOGGLE */}
            <div className="flex items-center bg-slate-200 dark:bg-[#172033] p-0.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] shrink-0">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  viewport === 'desktop' ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  viewport === 'tablet' ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  viewport === 'mobile' ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]' : 'text-[#64748B] dark:text-[#94A3B8]'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PREVIEW CONTAINER RESPONSIVE FRAME (RESPONDS TO VIEWPORT STATE) */}
          <div
            className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300 flex flex-col text-slate-900 font-sans text-xs min-w-0 ${
              viewport === 'mobile'
                ? 'w-full max-w-[390px] min-h-[600px]'
                : viewport === 'tablet'
                ? 'w-full max-w-[768px] min-h-[600px]'
                : 'w-full max-w-[1200px] min-h-[600px]'
            }`}
            style={{
              width: viewport === 'mobile' ? 'min(100%, 390px)' : viewport === 'tablet' ? 'min(100%, 768px)' : '100%',
              borderRadius: draftTheme.card_radius || '16px',
              fontFamily: draftTheme.body_font || 'Inter',
            }}
          >
            {/* RENDER TARGET 1: PUBLIC WEBSITE */}
            {previewTarget === 'public_website' && (
              <div className="flex-1 flex flex-col bg-[#F8FAFC] min-w-0 font-normal">
                {/* PUBLIC HEADER */}
                <header
                  className={`h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center shrink-0 shadow-2xs ${
                    draftTheme.header_variant === 'centered'
                      ? 'justify-center flex-col sm:flex-row'
                      : 'justify-between'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-xl text-white font-semibold flex items-center justify-center text-sm shadow-2xs shrink-0"
                        style={{ backgroundColor: draftTheme.primary_color, borderRadius: draftTheme.button_radius }}
                      >
                        {(draftTheme.academy_name || 'C').substring(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 tracking-tight block leading-tight truncate">
                        {draftTheme.academy_name || 'CodeVerse Software Academy'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal truncate block mt-0.5">
                        {draftTheme.academy_tagline || 'Software Engineering Academy'}
                      </span>
                    </div>
                  </div>

                  {viewport !== 'mobile' ? (
                    <div className="flex items-center gap-6 font-medium text-xs text-slate-600">
                      <span className="font-semibold" style={{ color: draftTheme.primary_color }}>Home</span>
                      <span className="hover:text-slate-900 cursor-pointer">Courses</span>
                      <span className="hover:text-slate-900 cursor-pointer">Contact</span>
                      <button
                        type="button"
                        className="px-4 py-2 text-white font-medium shadow-2xs text-xs cursor-pointer"
                        style={{
                          backgroundColor: draftTheme.primary_color,
                          borderRadius: draftTheme.button_radius,
                        }}
                      >
                        Enroll Now
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPreviewMobileMenuOpen(true)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer ml-auto"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                  )}
                </header>

                {/* PUBLIC HERO SECTION */}
                <div className="p-4 sm:p-8 space-y-6 flex-1 overflow-y-auto font-normal">
                  <div
                    className="p-6 sm:p-8 border border-slate-200/80 bg-white shadow-2xs space-y-6"
                    style={{ borderRadius: draftTheme.card_radius }}
                  >
                    <div className={`grid gap-6 items-center ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                      <div className="space-y-4 text-left">
                        <span
                          className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-block"
                          style={{
                            backgroundColor: `${draftTheme.primary_color}15`,
                            color: draftTheme.primary_color,
                          }}
                        >
                          {draftTheme.hero_badge}
                        </span>

                        <h2
                          className="text-lg sm:text-2xl font-semibold text-slate-900 tracking-tight leading-tight"
                          style={{ fontFamily: draftTheme.heading_font || 'Inter' }}
                        >
                          {draftTheme.home_hero_title}
                        </h2>

                        <p className="text-xs text-slate-600 font-normal leading-relaxed">
                          {draftTheme.home_hero_subtitle}
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <button
                            type="button"
                            className="px-5 py-2.5 text-white font-medium text-xs shadow-2xs min-h-[42px] cursor-pointer"
                            style={{
                              backgroundColor: draftTheme.primary_color,
                              borderRadius: draftTheme.button_radius,
                            }}
                          >
                            {draftTheme.hero_cta_label}
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2.5 border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 min-h-[42px] cursor-pointer"
                            style={{ borderRadius: draftTheme.button_radius }}
                          >
                            {draftTheme.hero_secondary_cta_label}
                          </button>
                        </div>
                      </div>

                      <div>
                        <img
                          src={draftTheme.hero_image_url}
                          alt="Hero"
                          className="w-full aspect-16/10 rounded-2xl object-cover border border-slate-200 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FEATURED COURSES GRID */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: draftTheme.heading_font }}>
                        {draftTheme.courses_title}
                      </h3>
                      <span className="text-xs font-semibold" style={{ color: draftTheme.primary_color }}>View All</span>
                    </div>

                    <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : viewport === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {courses.map((c) => (
                        <div
                          key={c.uuid}
                          className="bg-white p-4 border border-slate-200 shadow-2xs space-y-3"
                          style={{ borderRadius: draftTheme.card_radius }}
                        >
                          <img src={c.thumbnail} alt={c.title} className="w-full aspect-16/10 rounded-xl object-cover border border-slate-100" />
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{c.level} • {c.duration}</span>
                            <h4 className="font-semibold text-sm text-slate-900 leading-snug">{c.title}</h4>
                            <p className="text-xs font-semibold" style={{ color: draftTheme.primary_color }}>{c.priceDisplay}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PUBLIC CONTACT INFORMATION CARD */}
                  <div
                    className="p-5 sm:p-6 bg-white border border-slate-200 shadow-2xs space-y-4"
                    style={{ borderRadius: draftTheme.card_radius }}
                  >
                    <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: draftTheme.heading_font }}>
                      {draftTheme.contact_title}
                    </h3>
                    <p className="text-xs text-slate-600 font-normal">{draftTheme.contact_description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-normal text-slate-700 pt-1 border-t border-slate-100">
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-500 shrink-0" /> WhatsApp: <strong className="font-semibold text-slate-900">{draftTheme.whatsapp_number}</strong></p>
                      <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /> Campus: <strong className="font-semibold text-slate-900">{draftTheme.address}</strong></p>
                    </div>
                  </div>
                </div>

                {/* PUBLIC FOOTER */}
                <footer className="bg-slate-950 text-slate-400 p-6 border-t border-slate-900 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 text-center sm:text-left">
                    <div>
                      <span className="font-semibold text-white text-sm block">{draftTheme.academy_name}</span>
                      <span className="text-xs text-slate-500 font-normal block mt-0.5">{draftTheme.academy_tagline}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
                      <span>Home</span>
                      <span>Courses</span>
                      <span>Contact</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 text-center font-normal">
                    <span>&copy; {new Date().getFullYear()} {draftTheme.academy_name}. All rights reserved.</span>
                    <span>Powered by CubixSkill Platform</span>
                  </div>
                </footer>
              </div>
            )}

            {/* RENDER TARGET 2: STUDENT PORTAL (USES THE EXACT SAME DRAFT THEME OBJECT!) */}
            {previewTarget === 'student_portal' && (
              <div className="flex-1 flex flex-col bg-[#F8FAFC] min-w-0 font-normal">
                {/* STUDENT PORTAL HEADER */}
                <header className="h-[60px] px-3 sm:px-4 bg-white flex items-center justify-between border-b border-slate-200 shadow-2xs shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: draftTheme.primary_color, borderRadius: draftTheme.button_radius }}
                      >
                        {(draftTheme.academy_name || 'C').substring(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-slate-950 block leading-tight">
                        {draftTheme.academy_name || 'CodeVerse Software Academy'}
                      </p>
                      <p className="truncate text-[11px] text-slate-500 font-normal block max-w-[180px] sm:max-w-[240px]">
                        Student Learning Portal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-slate-50 border border-slate-200">
                      <Bell className="h-4 w-4 text-slate-600" />
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: draftTheme.primary_color }} />
                    </div>

                    {viewport !== 'mobile' && (
                      <div className="flex h-10 items-center gap-2 rounded-xl px-2 bg-slate-50 border border-slate-200">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
                          alt="Student Avatar"
                          className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <span className="text-[12px] font-semibold text-slate-900 truncate">ALEX STUDENT</span>
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      </div>
                    )}
                  </div>
                </header>

                {/* STUDENT PORTAL BODY */}
                <div className="p-3 sm:p-5 space-y-4 flex-1 overflow-y-auto font-normal">
                  {/* ENROLLED COURSE HERO CARD */}
                  <div
                    className="p-4 sm:p-5 border border-slate-200 bg-white shadow-2xs space-y-4"
                    style={{ borderRadius: draftTheme.card_radius }}
                  >
                    <div className={`grid gap-4 items-center ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-[180px_minmax(0,1fr)]'}`}>
                      <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900"
                        alt="Course Thumbnail"
                        className="aspect-16/10 w-full rounded-[14px] object-cover border border-slate-100"
                      />

                      <div className="min-w-0 space-y-2 text-left">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold"
                            style={{ color: draftTheme.primary_color, borderColor: draftTheme.primary_color }}
                          >
                            Enrolled Course
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">• 65% Completed</span>
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 leading-tight truncate" style={{ fontFamily: draftTheme.heading_font }}>
                          Node.js Microservices &amp; Event-Driven Systems
                        </h3>

                        {/* PROGRESS BAR */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                          <div style={{ backgroundColor: draftTheme.primary_color, width: '65%' }} className="h-full rounded-full" />
                        </div>

                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            className="px-4 py-2 text-xs font-semibold text-white shadow-2xs flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                            style={{
                              backgroundColor: draftTheme.primary_color,
                              borderRadius: draftTheme.button_radius,
                            }}
                          >
                            <CirclePlay className="w-4 h-4" /> Continue Learning
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 STATS CARDS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 min-w-0">
                    <div className="flex min-h-[80px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs space-y-1">
                      <BookOpen className="h-4 w-4 shrink-0" style={{ color: draftTheme.primary_color }} />
                      <p className="text-sm font-bold text-slate-900 leading-none">8/19</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500">Lessons</p>
                    </div>

                    <div className="flex min-h-[80px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs space-y-1">
                      <Clock3 className="h-4 w-4 shrink-0" style={{ color: draftTheme.primary_color }} />
                      <p className="text-sm font-bold text-slate-900 leading-none">14.5 Hours</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500">Learning Time</p>
                    </div>

                    <div className="flex min-h-[80px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs space-y-1">
                      <FileCheck2 className="h-4 w-4 shrink-0" style={{ color: draftTheme.primary_color }} />
                      <p className="text-sm font-bold text-slate-900 leading-none">1 Pending</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500">Assignments</p>
                    </div>

                    <div className="flex min-h-[80px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs space-y-1">
                      <Medal className="h-4 w-4 shrink-0" style={{ color: draftTheme.primary_color }} />
                      <p className="text-sm font-bold text-slate-900 leading-none">Eligible</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500">Certificate</p>
                    </div>
                  </div>
                </div>

                {/* MOBILE BOTTOM NAVIGATION BAR */}
                {viewport === 'mobile' && (
                  <div className="h-14 bg-white border-t border-slate-200/90 grid grid-cols-5 items-center font-sans text-[10px] font-medium text-slate-500 shadow-lg shrink-0">
                    <div className="flex flex-col items-center justify-center gap-0.5" style={{ color: draftTheme.primary_color }}>
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span className="truncate">My Course</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <CirclePlay className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">Learn</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <FileCheck2 className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">Assignments</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <Video className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">Live</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <Menu className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">More</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. DEDICATED MOBILE BUILDER TOOLBAR (< 1024PX) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0B1120] border-t border-[#E2E8F0] dark:border-[#263244] px-2 py-2 grid grid-cols-2 gap-2 shadow-2xl pb-[calc(8px+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => { setMobileDrawerTab('design'); setMobileDrawerOpen(true); }}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#172033] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs min-h-[40px] cursor-pointer"
        >
          <Palette className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
          <span>Design &amp; Theme</span>
        </button>

        <button
          type="button"
          onClick={() => { setMobileDrawerTab('settings'); setMobileDrawerOpen(true); }}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#2563EB] text-white font-semibold text-xs min-h-[40px] shadow-xs cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
          <span>Edit Settings</span>
        </button>
      </div>

      {/* 4. MOBILE DESIGN / SETTINGS DRAWER SHEET */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-white dark:bg-[#111827] border-t border-[#E2E8F0] dark:border-[#263244] rounded-t-3xl max-h-[85dvh] flex flex-col w-full min-w-0 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* DRAWER HEADER */}
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#263244] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Sliders className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {mobileDrawerTab === 'design' ? 'Theme Design & Branding' : 'Website Settings'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#172033] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* HORIZONTALLY SCROLLABLE TABS */}
            <div className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0 text-xs font-medium">
              {(
                [
                  { id: 'branding', label: 'Branding' },
                  { id: 'colors', label: 'Colors' },
                  { id: 'typography', label: 'Fonts' },
                  { id: 'buttons', label: 'Buttons' },
                  { id: 'header_footer', label: 'Header' },
                  { id: 'content', label: 'Content' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[34px] ${
                    activeTab === tab.id
                      ? 'bg-[#2563EB] text-white font-semibold shadow-2xs'
                      : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* DRAWER BODY CONTROLS */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 font-normal pb-[calc(16px+env(safe-area-inset-bottom))]">
              {renderTabContent(activeTab, draftTheme, updateDraft, logoUrl, setLogoUrl, faviconUrl, setFaviconUrl, setConfirmModalType, handleFileUpload)}

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#263244] flex items-center justify-end">
                <Button
                  size="md"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-full bg-[#2563EB] text-white font-medium min-h-[42px] justify-center"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR RESET / ASSET REMOVAL */}
      {confirmModalType && (
        <Modal
          isOpen={!!confirmModalType}
          onClose={() => setConfirmModalType(null)}
          title={
            confirmModalType === 'logo'
              ? 'Remove Academy Logo?'
              : confirmModalType === 'favicon'
              ? 'Remove Academy Favicon?'
              : 'Reset Unsaved Changes?'
          }
        >
          <div className="space-y-4 text-xs font-sans text-left">
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              {confirmModalType === 'logo'
                ? 'Are you sure you want to remove the current academy logo?'
                : confirmModalType === 'favicon'
                ? 'Are you sure you want to remove the current favicon?'
                : 'Are you sure you want to discard all unsaved edits and restore the last saved theme draft?'}
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
              <Button size="sm" variant="outline" onClick={() => setConfirmModalType(null)} className="w-full sm:w-auto font-medium min-h-[42px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (confirmModalType === 'logo') setLogoUrl('');
                  else if (confirmModalType === 'favicon') setFaviconUrl('');
                  else handleResetToSaved();
                  setConfirmModalType(null);
                }}
                className="w-full sm:w-auto bg-rose-600 text-white font-medium min-h-[42px] rounded-xl cursor-pointer"
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PREVIEW MOBILE DRAWER OVERLAY */}
      {previewMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col font-sans text-xs">
          <div className="p-4 bg-white flex items-center justify-between border-b border-slate-200">
            <span className="font-semibold text-sm text-slate-900">{draftTheme.academy_name}</span>
            <button
              type="button"
              onClick={() => setPreviewMobileMenuOpen(false)}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 bg-white flex-1 space-y-4 font-normal">
            <div className="space-y-3 font-medium text-sm text-slate-800">
              <div className="p-3 rounded-xl hover:bg-slate-100 cursor-pointer" onClick={() => setPreviewMobileMenuOpen(false)}>Home</div>
              <div className="p-3 rounded-xl hover:bg-slate-100 cursor-pointer" onClick={() => setPreviewMobileMenuOpen(false)}>Courses</div>
              <div className="p-3 rounded-xl hover:bg-slate-100 cursor-pointer" onClick={() => setPreviewMobileMenuOpen(false)}>Contact</div>
            </div>
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <Button size="md" style={{ backgroundColor: draftTheme.primary_color }} className="w-full font-medium justify-center text-white min-h-[44px]">
                Enroll Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// HELPER FUNCTION FOR TABBED CONTROLS RENDERING
function renderTabContent(
  tab: StudioTab,
  draftTheme: AcademyWebsiteThemeConfig,
  updateDraft: (updates: Partial<AcademyWebsiteThemeConfig>) => void,
  logoUrl: string,
  setLogoUrl: (url: string) => void,
  faviconUrl: string,
  setFaviconUrl: (url: string) => void,
  setConfirmModalType: (type: 'logo' | 'favicon' | 'reset' | null) => void,
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'favicon') => void
) {
  if (tab === 'branding') {
    return (
      <div className="space-y-4 font-normal">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Academy Name</label>
          <Input
            value={draftTheme.academy_name}
            onChange={(e) => updateDraft({ academy_name: e.target.value })}
            className="w-full max-w-full min-w-0 bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium h-11 focus:border-blue-600"
            placeholder="e.g. CodeVerse Software Academy"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Academy Tagline</label>
          <Input
            value={draftTheme.academy_tagline}
            onChange={(e) => updateDraft({ academy_tagline: e.target.value })}
            className="w-full max-w-full min-w-0 bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal h-11 focus:border-blue-600"
            placeholder="e.g. Software Engineering Academy"
          />
        </div>

        {/* LOGO UPLOAD */}
        <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Academy Logo</label>
          {logoUrl ? (
            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-[#CBD5E1] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-[#CBD5E1] dark:border-[#334155] shrink-0 bg-white" />
                <span className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] truncate">Active Logo</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setConfirmModalType('logo')} className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium min-h-[38px] w-full sm:w-auto" leftIcon={<Trash2 className="w-4 h-4" />}>
                Remove
              </Button>
            </div>
          ) : (
            <label className="flex items-center justify-between p-4 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] cursor-pointer text-[#0F172A] dark:text-[#CBD5E1] hover:border-blue-500 min-h-[52px]">
              <span className="text-xs font-medium">Upload Logo (PNG / SVG)</span>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
              <Upload className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
            </label>
          )}
        </div>

        {/* FAVICON UPLOAD */}
        <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Favicon Icon</label>
          {faviconUrl ? (
            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-[#CBD5E1] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={faviconUrl} alt="Favicon" className="w-7 h-7 rounded-lg object-contain border border-[#CBD5E1] dark:border-[#334155] shrink-0 bg-white" />
                <span className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] truncate">Active Favicon</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setConfirmModalType('favicon')} className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium min-h-[38px] w-full sm:w-auto" leftIcon={<Trash2 className="w-4 h-4" />}>
                Remove
              </Button>
            </div>
          ) : (
            <label className="flex items-center justify-between p-4 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] cursor-pointer text-[#0F172A] dark:text-[#CBD5E1] hover:border-blue-500 min-h-[52px]">
              <span className="text-xs font-medium">Upload Favicon (512×512)</span>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} className="hidden" />
              <Upload className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
            </label>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'colors') {
    return (
      <div className="space-y-4 font-normal">
        {/* PRESET PALETTES */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Quick Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_PALETTES.map((p) => (
              <div
                key={p.name}
                onClick={() => updateDraft({ primary_color: p.primary, secondary_color: p.secondary, accent_color: p.accent })}
                className="p-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-blue-500 cursor-pointer space-y-1.5 transition-all"
              >
                <span className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate block">{p.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full border shadow-2xs shrink-0" style={{ backgroundColor: p.primary }} title="Primary" />
                  <div className="w-4 h-4 rounded-full border shadow-2xs shrink-0" style={{ backgroundColor: p.secondary }} title="Secondary" />
                  <div className="w-4 h-4 rounded-full border shadow-2xs shrink-0" style={{ backgroundColor: p.accent }} title="Accent" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INDIVIDUAL COLOR PICKERS */}
        <div className="space-y-3 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Custom Theme Colors</label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Primary Color</label>
              <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2 items-center">
                <input
                  type="color"
                  value={draftTheme.primary_color}
                  onChange={(e) => updateDraft({ primary_color: e.target.value })}
                  className="w-11 h-9 rounded-xl border border-[#CBD5E1] dark:border-[#334155] cursor-pointer p-0.5 bg-white dark:bg-[#0F172A] shrink-0"
                />
                <Input
                  value={draftTheme.primary_color}
                  onChange={(e) => updateDraft({ primary_color: e.target.value })}
                  className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs h-9 w-full min-w-0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Secondary Color</label>
              <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2 items-center">
                <input
                  type="color"
                  value={draftTheme.secondary_color}
                  onChange={(e) => updateDraft({ secondary_color: e.target.value })}
                  className="w-11 h-9 rounded-xl border border-[#CBD5E1] dark:border-[#334155] cursor-pointer p-0.5 bg-white dark:bg-[#0F172A] shrink-0"
                />
                <Input
                  value={draftTheme.secondary_color}
                  onChange={(e) => updateDraft({ secondary_color: e.target.value })}
                  className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs h-9 w-full min-w-0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Accent Color</label>
              <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2 items-center">
                <input
                  type="color"
                  value={draftTheme.accent_color}
                  onChange={(e) => updateDraft({ accent_color: e.target.value })}
                  className="w-11 h-9 rounded-xl border border-[#CBD5E1] dark:border-[#334155] cursor-pointer p-0.5 bg-white dark:bg-[#0F172A] shrink-0"
                />
                <Input
                  value={draftTheme.accent_color}
                  onChange={(e) => updateDraft({ accent_color: e.target.value })}
                  className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs h-9 w-full min-w-0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Background Color</label>
              <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2 items-center">
                <input
                  type="color"
                  value={draftTheme.background_color}
                  onChange={(e) => updateDraft({ background_color: e.target.value })}
                  className="w-11 h-9 rounded-xl border border-[#CBD5E1] dark:border-[#334155] cursor-pointer p-0.5 bg-white dark:bg-[#0F172A] shrink-0"
                />
                <Input
                  value={draftTheme.background_color}
                  onChange={(e) => updateDraft({ background_color: e.target.value })}
                  className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-mono text-xs h-9 w-full min-w-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'typography') {
    return (
      <div className="space-y-4 font-normal">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Body Font Family</label>
          <select
            value={draftTheme.body_font}
            onChange={(e) => updateDraft({ body_font: e.target.value })}
            className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium min-w-0 max-w-full"
          >
            <option value="Inter">Inter (Clean &amp; Modern)</option>
            <option value="Roboto">Roboto (Google Standard)</option>
            <option value="Outfit">Outfit (Display &amp; Tech)</option>
            <option value="Plus Jakarta Sans">Plus Jakarta Sans (SaaS)</option>
            <option value="system-ui">System Default UI</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Heading Font Family</label>
          <select
            value={draftTheme.heading_font}
            onChange={(e) => updateDraft({ heading_font: e.target.value })}
            className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium min-w-0 max-w-full"
          >
            <option value="Inter">Inter (Bold Geometric)</option>
            <option value="Outfit">Outfit (Modern Bold)</option>
            <option value="Roboto">Roboto (Clean Modern)</option>
            <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
            <option value="system-ui">System Default UI</option>
          </select>
        </div>
      </div>
    );
  }

  if (tab === 'buttons') {
    return (
      <div className="space-y-4 font-normal">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Button Corner Radius</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Square', value: '0px' },
              { label: 'Sm (6px)', value: '6px' },
              { label: 'Md (12px)', value: '12px' },
              { label: 'Full', value: '9999px' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDraft({ button_radius: opt.value })}
                className={`py-2 rounded-xl text-xs font-medium border cursor-pointer min-h-[36px] ${
                  draftTheme.button_radius === opt.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-600 font-semibold'
                    : 'border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#CBD5E1]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Card Corner Radius</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: 'Subtle (8px)', value: '8px' },
              { label: 'Rounded (16px)', value: '16px' },
              { label: 'Curved (24px)', value: '24px' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDraft({ card_radius: opt.value })}
                className={`py-2 rounded-xl text-xs font-medium border cursor-pointer min-h-[36px] ${
                  draftTheme.card_radius === opt.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-600 font-semibold'
                    : 'border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#CBD5E1]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'header_footer') {
    return (
      <div className="space-y-4 font-normal">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Header Alignment Variant</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: 'Default Left', value: 'default' },
              { label: 'Centered', value: 'centered' },
              { label: 'Compact', value: 'compact' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDraft({ header_variant: opt.value as 'default' | 'centered' | 'compact' })}
                className={`py-2 rounded-xl text-xs font-medium border cursor-pointer min-h-[36px] ${
                  draftTheme.header_variant === opt.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-600 font-semibold'
                    : 'border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#CBD5E1]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Footer Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Full Detailed Footer', value: 'default' },
              { label: 'Compact Minimal', value: 'minimal' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateDraft({ footer_variant: opt.value as 'default' | 'minimal' })}
                className={`py-2 rounded-xl text-xs font-medium border cursor-pointer min-h-[36px] ${
                  draftTheme.footer_variant === opt.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-600 font-semibold'
                    : 'border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#CBD5E1]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'content') {
    return (
      <div className="space-y-4 font-normal">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Hero Badge Text</label>
          <Input
            value={draftTheme.hero_badge}
            onChange={(e) => updateDraft({ hero_badge: e.target.value })}
            className="w-full max-w-full min-w-0 bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs h-11 font-medium focus:border-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Hero Title</label>
          <textarea
            rows={3}
            value={draftTheme.home_hero_title}
            onChange={(e) => updateDraft({ home_hero_title: e.target.value })}
            className="w-full max-w-full min-w-0 p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:border-blue-600 focus:outline-hidden min-h-[90px] resize-y"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Hero Subtitle</label>
          <textarea
            rows={4}
            value={draftTheme.home_hero_subtitle}
            onChange={(e) => updateDraft({ home_hero_subtitle: e.target.value })}
            className="w-full max-w-full min-w-0 p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-normal focus:border-blue-600 focus:outline-hidden min-h-[110px] resize-y"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Hero Image URL</label>
          <Input
            value={draftTheme.hero_image_url}
            onChange={(e) => updateDraft({ hero_image_url: e.target.value })}
            className="w-full max-w-full min-w-0 bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs h-11 font-normal focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Primary CTA Label</label>
            <Input
              value={draftTheme.hero_cta_label}
              onChange={(e) => updateDraft({ hero_cta_label: e.target.value })}
              className="w-full max-w-full min-w-0 bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs h-11 font-medium focus:border-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">Secondary CTA Label</label>
            <Input
              value={draftTheme.hero_secondary_cta_label}
              onChange={(e) => updateDraft({ hero_secondary_cta_label: e.target.value })}
              className="w-full max-w-full min-w-0 bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs h-11 font-medium focus:border-blue-600"
            />
          </div>
        </div>

        <div className="space-y-1 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
          <label className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">WhatsApp Support Phone</label>
          <Input
            value={draftTheme.whatsapp_number}
            onChange={(e) => updateDraft({ whatsapp_number: e.target.value })}
            className="w-full max-w-full min-w-0 bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs h-11 focus:border-blue-600"
          />
        </div>
      </div>
    );
  }

  return null;
}
