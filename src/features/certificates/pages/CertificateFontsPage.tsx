import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Type,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ShieldCheck,
  HardDrive,
  Loader2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  useCertificateFonts,
} from '../hooks/useCertificateQueries';
import {
  certificatesService,
} from '../../../services/certificates.service';
import { loadFontFaceIntoDOM, type CertificateFontItem } from '../utils/fontRegistry';
import { useQueryClient } from '@tanstack/react-query';
import { certificateKeys } from '../hooks/useCertificateQueries';

export const CertificateFontsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: fonts = [], isLoading, isError, error } = useCertificateFonts();

  const [toastState, setToastState] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'error') => {
    setToastState({ message: msg, type });
    setTimeout(() => setToastState(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['ttf', 'otf', 'woff', 'woff2'];
    if (!ext || !validExts.includes(ext)) {
      showToast('Invalid font format. Supported formats: .ttf, .otf, .woff, .woff2', 'error');
      return;
    }

    const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    setIsUploading(true);
    showToast('Uploading custom certificate font...', 'info');

    try {
      const formData = new FormData();
      formData.append('font_file', file);
      formData.append('display_name', displayName);
      formData.append('user_rights_confirmed', 'true');

      const fontObj: CertificateFontItem = await certificatesService.uploadFont(formData);
      await loadFontFaceIntoDOM(fontObj);
      queryClient.invalidateQueries({ queryKey: certificateKeys.fonts() });
      showToast(`Font "${fontObj.name}" uploaded successfully!`, 'success');
    } catch (err: any) {
      const detailMsg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to upload font.';
      showToast(typeof detailMsg === 'string' ? detailMsg : JSON.stringify(detailMsg), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const academyFonts = fonts.filter((f) => f.source === 'ACADEMY');
  const systemFonts = fonts.filter((f) => f.source === 'SYSTEM');

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6 text-left font-sans pb-16 select-none">
      {/* Toast Alert */}
      {toastState && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 text-xs font-semibold rounded-2xl shadow-xl animate-fade-in flex items-center gap-2 border ${
            toastState.type === 'error'
              ? 'bg-rose-950/90 text-rose-100 border-rose-800'
              : toastState.type === 'info'
              ? 'bg-slate-900 text-blue-200 border-slate-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toastState.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastState.message}</span>
          <button type="button" onClick={() => setToastState(null)} className="p-0.5 hover:bg-slate-700 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/60">
                <Type className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Academy Certificate Fonts
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
              Upload custom TTF, OTF, WOFF, or WOFF2 fonts for certificate templates. Fonts are tenant-isolated and stored securely in your academy storage.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-10 px-4 rounded-xl cursor-pointer shadow-xs inline-flex items-center justify-center gap-2 transition-colors">
              <Upload className="w-4 h-4 text-white" />
              <span>{isUploading ? 'Uploading...' : 'Upload Font'}</span>
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* ACADEMY FONTS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Custom Academy Fonts ({academyFonts.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-12">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading academy font library...</span>
          </div>
        ) : academyFonts.length === 0 ? (
          <Card className="bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-800 p-8 rounded-2xl text-center space-y-3">
            <Type className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              No custom certificate fonts uploaded yet. Upload a TTF/OTF font file to personalize your completion certificates.
            </p>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              <span>Upload Custom Font</span>
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {academyFonts.map((font) => (
              <Card
                key={font.id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {font.name}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                      UUID: {font.id}
                    </p>
                  </div>
                  {font.pdf_compatible === false ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shrink-0">
                      PDF Incompatible ({font.outline_type || 'CFF'})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 shrink-0">
                      Active
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-center overflow-hidden">
                  <p
                    style={{ fontFamily: `"${font.family}", sans-serif` }}
                    className="text-base truncate text-slate-900 dark:text-slate-100"
                  >
                    Muhammed Ashraf Al Farooqi
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>Format: {font.format || 'TTF'} ({font.outline_type || 'TRUETYPE'})</span>
                  <span>Weight: {font.font_weight_variants?.[0] || '600'}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SYSTEM FONTS SECTION */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Built-in System Fonts ({systemFonts.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {systemFonts.map((font) => (
            <Card
              key={font.id}
              className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {font.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {font.family}
                </span>
              </div>
              <p
                style={{ fontFamily: `"${font.family}", sans-serif` }}
                className="text-xs truncate text-slate-700 dark:text-slate-300"
              >
                Muhammed Ashraf Al Farooqi
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
