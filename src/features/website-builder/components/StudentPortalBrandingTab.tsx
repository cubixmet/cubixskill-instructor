import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Upload,
  Trash2,
  RefreshCw,
  Lock,
  RotateCcw,
  Save,
  Globe,
  Mail,
  Phone,
  BookOpen,
  Award,
  FileCheck,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useAcademyBrandingStore, PREBUILT_20_THEMES } from '../store/academyBranding.store';

export const StudentPortalBrandingTab: React.FC = () => {
  const branding = useAcademyBrandingStore((state) => state.branding);
  const updateBranding = useAcademyBrandingStore((state) => state.updateBranding);
  const resetBranding = useAcademyBrandingStore((state) => state.resetBranding);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [storageModalOpen, setStorageModalOpen] = useState(false);
  const [pendingUploadType, setPendingUploadType] = useState<'logo' | 'favicon'>('logo');
  const [pendingFileUrl, setPendingFileUrl] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeTheme = PREBUILT_20_THEMES.find((t) => t.id === branding.activeThemeId) || PREBUILT_20_THEMES[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setPendingUploadType(type);
      setPendingFileUrl(fakeUrl);
      setStorageModalOpen(true);
    }
  };

  const handleConfirmUpload = () => {
    if (pendingFileUrl) {
      if (pendingUploadType === 'logo') {
        updateBranding({ logoUrl: pendingFileUrl });
      } else {
        updateBranding({ faviconUrl: pendingFileUrl });
      }
    }
    setStorageModalOpen(false);
    setToastMessage(`${pendingUploadType === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully. Deducted storage credits.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveBranding = () => {
    setToastMessage('Student Portal branding settings saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetBranding = () => {
    resetBranding();
    setToastMessage('Reset student portal branding to platform defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-6xl mx-auto pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. LAYOUT PROTECTION & HEADER BANNER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Student Portal Branding Manager</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Customize your academy logo, favicon, colors, and support links. Changes dynamically update across student login, dashboards, assignments, quizzes, and certificates.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
              Active Theme: {activeTheme.name}
            </span>
          </div>
        </div>

        {/* LOCKED LAYOUT PROTECTION BANNER */}
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center gap-2.5 font-bold text-xs">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            🔒 <strong>Layout Protection Active:</strong> Student Portal layout, sidebar structure, and navigation positions are locked to ensure 100% UI consistency across all academies. Only branding elements and color themes change dynamically.
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT COLUMN: BRANDING INPUTS */}
        <div className="md:col-span-6 space-y-4">
          {/* ACADEMY NAME & SLUG */}
          <Card padding="md" className="bg-white border border-slate-200 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Academy Identity</h3>
            <div>
              <label className="block font-bold text-slate-900 mb-1">Academy Name *</label>
              <Input
                value={branding.academyName}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                  updateBranding({ academyName: name, academySlug: slug || 'academy' });
                }}
                required
              />
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Public URL Slug: cubixskill.com/{branding.academySlug}
              </span>
            </div>
          </Card>

          {/* LOGO & FAVICON FILE UPLOADS */}
          <Card padding="md" className="bg-white border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Media File Uploads</h3>

            {/* 1. LOGO UPLOAD */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-900">Academy Logo File Upload</label>
              <input
                type="file"
                ref={logoInputRef}
                onChange={(e) => handleFileSelect(e, 'logo')}
                accept=".png,.jpg,.jpeg,.svg,.webp"
                className="hidden"
              />

              {branding.logoUrl ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={branding.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">Current Academy Logo</span>
                      <span className="text-[10px] text-slate-400 font-medium">PNG, JPG, SVG, WEBP</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => logoInputRef.current?.click()} className="h-8 text-xs">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateBranding({ logoUrl: '' })} className="h-8 text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center cursor-pointer transition-all bg-slate-50/50"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="font-extrabold text-xs text-slate-900 block">Upload Logo File</span>
                </div>
              )}
            </div>

            {/* 2. FAVICON UPLOAD */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-900">Favicon File Upload (PNG, ICO, SVG)</label>
              <input
                type="file"
                ref={faviconInputRef}
                onChange={(e) => handleFileSelect(e, 'favicon')}
                accept=".png,.ico,.svg"
                className="hidden"
              />

              {branding.faviconUrl ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={branding.faviconUrl} alt="Favicon" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">Current Favicon</span>
                      <span className="text-[10px] text-slate-400 font-medium">PNG, ICO, SVG</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => faviconInputRef.current?.click()} className="h-8 text-xs">
                    Replace Favicon
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => faviconInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center cursor-pointer transition-all bg-slate-50/50"
                >
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="font-extrabold text-xs text-slate-900 block">Upload Favicon File</span>
                </div>
              )}
            </div>

            {/* STORAGE CREDIT WARNING */}
            <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Uploading logos and favicons consumes media storage credits. Credits are deducted after upload completes.</span>
            </div>
          </Card>

          {/* SUPPORT INFO & SOCIAL LINKS */}
          <Card padding="md" className="bg-white border border-slate-200 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Support &amp; Social Links</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Support Email</label>
                <Input
                  value={branding.supportEmail}
                  onChange={(e) => updateBranding({ supportEmail: e.target.value })}
                  leftIcon={<Mail className="w-3.5 h-3.5 text-slate-400" />}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-900 mb-1">Support Phone</label>
                <Input
                  value={branding.supportPhone}
                  onChange={(e) => updateBranding({ supportPhone: e.target.value })}
                  leftIcon={<Phone className="w-3.5 h-3.5 text-slate-400" />}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Official Website URL</label>
              <Input
                value={branding.websiteUrl || ''}
                onChange={(e) => updateBranding({ websiteUrl: e.target.value })}
                leftIcon={<Globe className="w-3.5 h-3.5 text-slate-400" />}
              />
            </div>

            {/* SOCIAL HANDLES */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="font-extrabold text-xs text-slate-900 block">Social Media Handles</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Input
                  placeholder="Facebook URL"
                  value={branding.socialLinks?.facebook || ''}
                  onChange={(e) => updateBranding({ socialLinks: { ...branding.socialLinks, facebook: e.target.value } })}
                />
                <Input
                  placeholder="Instagram URL"
                  value={branding.socialLinks?.instagram || ''}
                  onChange={(e) => updateBranding({ socialLinks: { ...branding.socialLinks, instagram: e.target.value } })}
                />
                <Input
                  placeholder="LinkedIn URL"
                  value={branding.socialLinks?.linkedin || ''}
                  onChange={(e) => updateBranding({ socialLinks: { ...branding.socialLinks, linkedin: e.target.value } })}
                />
                <Input
                  placeholder="YouTube URL"
                  value={branding.socialLinks?.youtube || ''}
                  onChange={(e) => updateBranding({ socialLinks: { ...branding.socialLinks, youtube: e.target.value } })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: LIVE BRANDED STUDENT PORTAL PREVIEW */}
        <div className="md:col-span-6">
          <Card padding="md" className="bg-white border border-slate-200 space-y-3 sticky top-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-sm text-slate-900">Live Student Portal Preview</span>
              <span className="text-[10px] font-mono text-slate-500">Student Dashboard Simulation</span>
            </div>

            {/* SIMULATED BRANDED STUDENT PORTAL FRAME */}
            <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-md font-sans text-slate-900">
              {/* BRANDED HEADER */}
              <div
                style={{ backgroundColor: activeTheme.headerStyle === 'dark' ? '#0F172A' : '#FFFFFF' }}
                className="h-12 border-b border-slate-200 px-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <img src={branding.logoUrl} alt="Logo" className="w-6 h-6 rounded-md object-cover" />
                  <span className={`font-black text-xs ${activeTheme.headerStyle === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {branding.academyName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-extrabold">
                  <span style={{ color: activeTheme.primaryColor }}>Dashboard</span>
                  <span className="text-slate-400">My Courses</span>
                  <span className="text-slate-400">Live Classroom</span>
                </div>
              </div>

              {/* BRANDED PORTAL BODY */}
              <div style={{ backgroundColor: activeTheme.bgStyle }} className="p-4 space-y-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Course</span>
                  <h4 className="font-extrabold text-xs text-slate-900">Full Stack Web Development Architecture</h4>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                    <div style={{ backgroundColor: activeTheme.primaryColor, width: '65%' }} className="h-full rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <BookOpen className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                    <span>3 Courses</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <FileCheck className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                    <span>5 Quizzes</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <Award className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                    <span>2 Certificates</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    style={{ backgroundColor: activeTheme.primaryColor }}
                    className="flex-1 py-2 rounded-xl text-white font-extrabold text-xs shadow-xs"
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* STICKY SAVE BRANDING FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg flex items-center justify-between font-sans text-xs max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 text-slate-600 font-bold">
          <span>Student Portal Branding Active</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetBranding} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset Branding
          </Button>
          <Button size="sm" onClick={handleSaveBranding} className="bg-[#2563EB] text-white font-extrabold px-6 hover:bg-blue-700" leftIcon={<Save className="w-4 h-4" />}>
            Save Branding
          </Button>
        </div>
      </div>

      {/* UPLOAD CONFIRMATION MODAL */}
      <Modal
        isOpen={storageModalOpen}
        onClose={() => setStorageModalOpen(false)}
        title="⚠ Media Storage Credit Notice"
        subtitle={`Confirm ${pendingUploadType} file upload.`}
        maxWidth="sm"
      >
        <div className="space-y-4 font-sans text-xs text-left">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
            <div className="flex items-center gap-2 font-black text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Media Credit Deduction Notice</span>
            </div>
            <p className="text-amber-800 text-xs leading-relaxed font-medium">
              Uploading custom {pendingUploadType} files consumes media storage credits based on image file size.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setStorageModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmUpload} className="bg-blue-600 text-white font-extrabold px-5">
              Confirm &amp; Upload {pendingUploadType}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
