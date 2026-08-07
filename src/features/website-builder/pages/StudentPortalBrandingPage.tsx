import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Trash2,
  RefreshCw,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  Sparkles,
  Bell,
  ChevronDown,
  BookOpen,
  CirclePlay,
  Clock3,
  FileCheck2,
  Medal,
  RotateCcw,
  Video,
  Menu,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input as TextInput } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useAcademyBrandingStore, PREBUILT_THEMES } from '../store/academy-branding.store';

export const StudentPortalBrandingPage: React.FC = () => {
  const navigate = useNavigate();

  const academyName = useAcademyBrandingStore((state) => state.academyName);
  const logoFileUrl = useAcademyBrandingStore((state) => state.logoFileUrl);
  const faviconFileUrl = useAcademyBrandingStore((state) => state.faviconFileUrl);
  const supportEmail = useAcademyBrandingStore((state) => state.supportEmail);
  const supportPhone = useAcademyBrandingStore((state) => state.supportPhone);
  const activeThemeId = useAcademyBrandingStore((state) => state.activeThemeId);
  const customPrimaryColor = useAcademyBrandingStore((state) => state.customPrimaryColor);
  const customSecondaryColor = useAcademyBrandingStore((state) => state.customSecondaryColor);

  const updateBranding = useAcademyBrandingStore((state) => state.updateBranding);
  const applyTheme = useAcademyBrandingStore((state) => state.applyTheme);
  const removeLogo = useAcademyBrandingStore((state) => state.removeLogo);
  const removeFavicon = useAcademyBrandingStore((state) => state.removeFavicon);
  const resetToDefaults = useAcademyBrandingStore((state) => state.resetToDefaults);
  const getActiveTheme = useAcademyBrandingStore((state) => state.getActiveTheme);

  // Local Form State
  const [formName, setFormName] = useState(academyName);
  const [formEmail, setFormEmail] = useState(supportEmail);
  const [formPhone, setFormPhone] = useState(supportPhone);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Form Inline Validation State
  const [emailError, setEmailError] = useState('');

  // Confirmation Modals
  const [confirmModalType, setConfirmModalType] = useState<'logo' | 'favicon' | 'reset' | null>(null);

  // Viewport Device Toggles
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const activeTheme = getActiveTheme();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormName(val);
    updateBranding({ academyName: val });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormEmail(val);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val && !emailRegex.test(val)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
    updateBranding({ supportEmail: val });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormPhone(val);
    updateBranding({ supportPhone: val });
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

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (emailError) return;
    updateBranding({
      academyName: formName,
      supportEmail: formEmail,
      supportPhone: formPhone,
    });
    setSaveToast('Student Portal branding successfully saved and published!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleConfirmAction = () => {
    if (confirmModalType === 'logo') {
      removeLogo();
    } else if (confirmModalType === 'favicon') {
      removeFavicon();
    } else if (confirmModalType === 'reset') {
      resetToDefaults();
      setFormName('CodeVerse Software Academy');
      setFormEmail('support@codeverse.com');
      setFormPhone('+1 (555) 019-9831');
    }
    setConfirmModalType(null);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-5 font-sans text-xs text-slate-900 text-left overflow-x-hidden min-w-0 pb-28 sm:pb-12">
      {/* 1. STACKED MOBILE-FRIENDLY PAGE HEADER BAR */}
      <div className="flex flex-col space-y-4 border-b border-slate-200/80 pb-4 min-w-0">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/website-builder')}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer shadow-2xs shrink-0 mt-0.5"
            title="Back to Website Builder"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight leading-tight break-words">
              Student Portal Branding
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-normal mt-1 leading-normal break-words">
              Customize fixed student portal identity, logos, custom colors, and 20 prebuilt themes.
            </p>
          </div>
        </div>

        {/* HEADER ACTIONS (STACK ON MOBILE <390px, 2-COLUMN GRID ON SM, FLEX ON MD+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center md:justify-end gap-2.5 w-full pt-1">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setConfirmModalType('reset')}
            className="text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold h-11 rounded-[10px] text-xs sm:text-sm w-full md:w-auto min-h-[44px]"
            leftIcon={<RotateCcw className="w-4 h-4 text-slate-500" />}
          >
            Reset Defaults
          </Button>

          <Button
            size="md"
            onClick={() => handleSave()}
            style={{ backgroundColor: activeTheme.primaryColor }}
            className="text-white font-semibold shadow-xs h-11 rounded-[10px] text-xs sm:text-sm w-full md:w-auto min-h-[44px]"
          >
            Save Branding
          </Button>
        </div>
      </div>

      {/* TOAST ALERT */}
      {saveToast && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in min-w-0">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">{saveToast}</span>
        </div>
      )}

      {/* 2. TWO-COLUMN RESPONSIVE LAYOUT */}
      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start min-w-0">
        {/* LEFT PANEL: BRANDING SETTINGS */}
        <div className="xl:col-span-6 space-y-5 min-w-0 w-full">
          {/* SECTION 1: ACADEMY INFORMATION */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">1. Academy Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-[13px] font-medium text-slate-800 mb-1">
                  Academy Name <span className="text-rose-500">*</span>
                </label>
                <TextInput
                  type="text"
                  value={formName}
                  onChange={handleNameChange}
                  placeholder="e.g. CodeVerse Software Academy"
                  required
                  className="w-full h-11 sm:h-12 text-xs sm:text-sm rounded-[10px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-[13px] font-medium text-slate-800 mb-1">Support Email</label>
                  <TextInput
                    type="email"
                    value={formEmail}
                    onChange={handleEmailChange}
                    placeholder="support@academy.com"
                    className="w-full h-11 sm:h-12 text-xs sm:text-sm rounded-[10px]"
                  />
                  {emailError && <p className="text-rose-600 text-[11px] mt-1 font-semibold">{emailError}</p>}
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-medium text-slate-800 mb-1">Support Phone</label>
                  <TextInput
                    type="text"
                    value={formPhone}
                    onChange={handlePhoneChange}
                    placeholder="+1 (555) 019-9831"
                    className="w-full h-11 sm:h-12 text-xs sm:text-sm rounded-[10px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ACADEMY LOGO UPLOAD CARD */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 min-w-0">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">2. Academy Logo</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Displays in the Student Portal header. Max file size: 5MB (PNG, JPG, SVG, WEBP).
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 min-w-0">
              {logoFileUrl ? (
                <div className="flex flex-col space-y-3 p-3 rounded-xl bg-white border border-slate-200 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={logoFileUrl} alt="Academy Logo" className="w-12 h-12 rounded-xl object-cover border p-0.5 bg-slate-50 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 text-xs block truncate">Active Logo File</span>
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5 shrink-0" /> Ready for Header
                      </span>
                    </div>
                  </div>

                  {/* BUTTONS GRID: 1-COLUMN BELOW 340PX, 2-COLUMN AT 340PX+ */}
                  <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2 w-full pt-1">
                    <label className="h-11 px-3 rounded-[10px] border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] w-full">
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Replace</span>
                      <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => setConfirmModalType('logo')}
                      className="h-11 px-3 rounded-[10px] border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] w-full"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 cursor-pointer text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-900 text-xs">Click to upload Academy Logo</span>
                  <span className="text-[11px] text-slate-400">PNG, JPG, JPEG, SVG or WEBP (Max 5MB)</span>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* SECTION 3: FAVICON UPLOAD */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 min-w-0">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">3. Academy Favicon</h2>
              <p className="text-slate-500 text-xs mt-0.5">Recommended 512×512 PNG, ICO, or SVG for browser tab icon.</p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 min-w-0">
              {faviconFileUrl ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={faviconFileUrl} alt="Favicon" className="w-8 h-8 rounded-lg object-contain border p-0.5 bg-slate-50 shrink-0" />
                    <span className="font-bold text-xs text-slate-900 truncate">Favicon Uploaded</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmModalType('favicon')}
                    className="h-10 px-3 rounded-[10px] border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-between p-3 cursor-pointer text-slate-700 font-semibold min-h-[44px]">
                  <span className="text-xs">Upload Favicon (512×512)</span>
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/x-icon" onChange={(e) => handleFileUpload(e, 'favicon')} className="hidden" />
                  <Upload className="w-4 h-4 text-slate-500 shrink-0" />
                </label>
              )}
            </div>
          </div>

          {/* SECTION 4: 20 PREBUILT THEMES GALLERY */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 min-w-0">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>4. 20 Prebuilt Themes</span>
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Click any theme to apply it instantly to the Student Portal Live Preview.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              {PREBUILT_THEMES.map((theme) => {
                const isSelected = activeThemeId === theme.id && !customPrimaryColor;
                return (
                  <div
                    key={theme.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-3 cursor-pointer ${
                      isSelected ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                    onClick={() => applyTheme(theme.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs truncate">{theme.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{theme.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border shadow-2xs shrink-0" style={{ backgroundColor: theme.primaryColor }} title="Primary" />
                      <div className="w-6 h-6 rounded-full border shadow-2xs shrink-0" style={{ backgroundColor: theme.secondaryColor }} title="Secondary" />
                      <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-2xs truncate" style={{ backgroundColor: theme.buttonColor }}>
                        Button
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-[10px] font-mono text-slate-400">{theme.primaryColor}</span>
                      {isSelected ? (
                        <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Applied
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 hover:text-blue-600">
                          Apply Theme
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: CUSTOM BRAND COLOR OVERRIDES */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">5. Custom Brand Color Overrides</h2>
            <p className="text-slate-500 text-xs">Optionally override theme primary &amp; secondary colors using custom HEX codes.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Primary Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.primaryColor}
                    onChange={(e) => updateBranding({ customPrimaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={activeTheme.primaryColor}
                    onChange={(e) => updateBranding({ customPrimaryColor: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-[10px] border border-slate-200 font-mono text-xs"
                    placeholder="#2563EB"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">Secondary Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.secondaryColor}
                    onChange={(e) => updateBranding({ customSecondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={activeTheme.secondaryColor}
                    onChange={(e) => updateBranding({ customSecondaryColor: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-[10px] border border-slate-200 font-mono text-xs"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE STUDENT PORTAL PREVIEW */}
        <div className="xl:col-span-6 space-y-6 xl:sticky xl:top-6 min-w-0 w-full">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md space-y-4 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Live Student Portal Preview</h3>
                <span className="text-[11px] text-slate-400 font-medium">Updates in real time as you edit</span>
              </div>

              {/* SEGMENTED VIEWPORT CONTROLS */}
              <div className="grid grid-cols-3 sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`py-1.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px] ${
                    previewViewport === 'desktop' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  className={`py-1.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px] ${
                    previewViewport === 'tablet' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`py-1.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px] ${
                    previewViewport === 'mobile' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER (REALISTIC BROWSER / DEVICE FRAME) */}
            <div className="bg-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-200/80 overflow-x-auto flex justify-center items-start min-w-0">
              <div
                className={`bg-[#f8fafc] rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300 flex flex-col relative ${
                  previewViewport === 'mobile'
                    ? 'w-full max-w-[390px] min-h-[580px] pb-16'
                    : previewViewport === 'tablet'
                    ? 'w-full max-w-[520px] min-h-[580px]'
                    : 'w-full min-h-[580px]'
                }`}
              >
                {/* BROWSER WINDOW TOP BAR */}
                <div className="h-7 bg-slate-900 px-3 flex items-center justify-between border-b border-slate-800 text-slate-400 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px] sm:max-w-[240px]">
                    http://localhost:5173/student/courses/overview
                  </span>
                  <div className="w-4" />
                </div>

                {/* REAL STUDENT PORTAL HEADER (DESKTOP vs MOBILE RESPONSIVE) */}
                <header className="h-[60px] px-3 sm:px-4 bg-white flex items-center justify-between border-b border-slate-200 shadow-2xs shrink-0">
                  {previewViewport === 'mobile' ? (
                    /* MOBILE HEADER: [Academy Logo + Name (minmax(0,1fr))] [Notification (44px)] (HIDE PROFILE AVATAR & NAME) */
                    <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-2.5 w-full h-full">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {logoFileUrl ? (
                          <img src={logoFileUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0" />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs"
                            style={{ backgroundColor: activeTheme.primaryColor }}
                          >
                            {(formName || 'C').substring(0, 1)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[12px] sm:text-[13px] font-semibold text-slate-950 truncate block leading-tight">
                            {formName || 'CodeVerse Software Academy'}
                          </span>
                          <span className="text-[10px] font-normal text-slate-500 truncate block">
                            Node.js Microservices &amp; Event-Driven Systems
                          </span>
                        </div>
                      </div>

                      <div className="relative w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 shrink-0">
                        <Bell className="w-4 h-4 text-slate-600" />
                        <span
                          className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: activeTheme.primaryColor }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* DESKTOP & TABLET HEADER: Show Logo + Name on Left, Notification + Avatar on Right */
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        {logoFileUrl ? (
                          <img src={logoFileUrl} alt="Logo" className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div
                            className="h-8 w-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs"
                            style={{ backgroundColor: activeTheme.primaryColor }}
                          >
                            {(formName || 'C').substring(0, 1)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-slate-950 block leading-tight">
                            {formName || 'CodeVerse Software Academy'}
                          </p>
                          <p className="truncate text-[11px] text-slate-500 block max-w-[180px] sm:max-w-[240px]">
                            Node.js Microservices &amp; Event-Driven Systems
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="relative grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 cursor-pointer">
                          <Bell className="h-[19px] w-[19px] text-slate-600" />
                          <span
                            className="absolute right-2 top-2 h-2 w-2 rounded-full animate-pulse"
                            style={{ backgroundColor: activeTheme.primaryColor }}
                          />
                        </div>

                        <div className="flex h-11 items-center gap-2 rounded-xl px-2 hover:bg-slate-50 cursor-pointer">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
                            alt="Alex Student"
                            className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <span className="hidden text-[12px] font-semibold sm:block text-slate-900 truncate">
                            ALEX STUDENT
                          </span>
                          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block shrink-0" />
                        </div>
                      </div>
                    </>
                  )}
                </header>

                {/* STUDENT COURSE HERO CARD & STATS AREA */}
                <div className="p-3 sm:p-4 space-y-4 text-left flex-1 overflow-y-auto hide-scrollbar min-w-0">
                  <div className="rounded-[20px] border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4 min-w-0">
                    <div className={`grid gap-4 items-center ${previewViewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-[180px_minmax(0,1fr)]'}`}>
                      <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900"
                        alt="Course Thumbnail"
                        className="aspect-16/10 w-full rounded-[14px] object-cover border border-slate-100"
                      />

                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold"
                            style={{
                              color: activeTheme.primaryColor,
                              borderColor: activeTheme.primaryColor,
                            }}
                          >
                            Advanced
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">• English</span>
                        </div>

                        <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                          Node.js Microservices &amp; Event-Driven Systems
                        </h2>

                        <p className="text-[11px] text-slate-500 truncate">
                          Lead Instructor: <strong className="font-semibold text-slate-700">Aarav Patel</strong>
                        </p>

                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            className="flex h-11 items-center justify-center gap-2 rounded-[10px] px-4 text-xs sm:text-sm font-semibold text-white shadow-2xs w-full sm:w-auto min-h-[44px]"
                            style={{ backgroundColor: activeTheme.primaryColor }}
                          >
                            <CirclePlay className="w-4 h-4" />
                            Continue Learning
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 STATS CARDS (2x2 GRID ON MOBILE) */}
                  <div className="grid grid-cols-2 gap-2.5 min-w-0">
                    <div className="flex min-h-[80px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs space-y-1">
                      <BookOpen className="h-4 w-4 shrink-0" style={{ color: activeTheme.primaryColor }} />
                      <p className="text-sm font-bold text-slate-900 leading-none">8/19</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500">Lessons</p>
                    </div>

                    <div className="flex min-h-[80px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs space-y-1">
                      <Clock3 className="h-4 w-4 shrink-0" style={{ color: activeTheme.primaryColor }} />
                      <p className="text-sm font-bold text-slate-900 leading-none">14.5 Hours</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500">Learning Time</p>
                    </div>

                    <div className="flex min-h-[80px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs space-y-1">
                      <FileCheck2 className="h-4 w-4 shrink-0" style={{ color: activeTheme.primaryColor }} />
                      <p className="text-sm font-bold text-slate-900 leading-none">1 Pending</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500">Assignments</p>
                    </div>

                    <div className="flex min-h-[80px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-2xs space-y-1">
                      <Medal className="h-4 w-4 shrink-0" style={{ color: activeTheme.primaryColor }} />
                      <p className="text-sm font-bold text-slate-900 leading-none">Eligible</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500">Certificate</p>
                    </div>
                  </div>

                  {/* BLURRED PAGE CONTENT BELOW */}
                  <div className="filter blur-[1px] opacity-60 pointer-events-none select-none space-y-2 pt-1">
                    <div className="h-16 rounded-2xl bg-white border border-slate-200 p-3" />
                  </div>
                </div>

                {/* MOBILE BOTTOM NAVIGATION BAR (5 EQUAL COLUMNS: My Course, Learn, Assignments, Live, More) */}
                {previewViewport === 'mobile' && (
                  <div className="absolute bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200/90 grid grid-cols-5 items-center font-sans text-[10px] font-semibold text-slate-500 z-30 shadow-lg">
                    <div className="flex flex-col items-center justify-center gap-0.5" style={{ color: activeTheme.primaryColor }}>
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
            </div>
          </div>
        </div>
      </form>

      {/* 3. STICKY MOBILE SAVE BAR (<640px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:hidden shadow-lg pb-[calc(12px+env(safe-area-inset-bottom))] flex items-center justify-between gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setConfirmModalType('reset')}
          className="text-slate-700 border-slate-200 font-semibold h-11 flex-1 min-h-[44px] rounded-[10px] text-xs"
          leftIcon={<RotateCcw className="w-4 h-4 text-slate-500" />}
        >
          Reset
        </Button>

        <Button
          size="md"
          onClick={() => handleSave()}
          style={{ backgroundColor: activeTheme.primaryColor }}
          className="text-white font-semibold shadow-xs h-11 flex-1 min-h-[44px] rounded-[10px] text-xs"
        >
          Save Branding
        </Button>
      </div>

      {/* CONFIRMATION MODALS */}
      {confirmModalType && (
        <Modal
          isOpen={!!confirmModalType}
          onClose={() => setConfirmModalType(null)}
          title={
            confirmModalType === 'logo'
              ? 'Remove Academy Logo?'
              : confirmModalType === 'favicon'
              ? 'Remove Academy Favicon?'
              : 'Reset Branding Defaults?'
          }
        >
          <div className="space-y-4 text-xs font-sans text-left">
            <p className="text-slate-600 text-sm">
              {confirmModalType === 'logo'
                ? 'Are you sure you want to remove the current academy logo?'
                : confirmModalType === 'favicon'
                ? 'Are you sure you want to remove the uploaded favicon?'
                : 'This will reset all academy branding settings, custom colors, and logo assets back to initial defaults.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="md" onClick={() => setConfirmModalType(null)} className="font-semibold min-h-[44px] rounded-[10px]">
                Cancel
              </Button>
              <Button
                size="md"
                onClick={handleConfirmAction}
                style={{ backgroundColor: confirmModalType === 'reset' ? '#DC2626' : activeTheme.primaryColor }}
                className="text-white font-semibold min-h-[44px] rounded-[10px]"
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
