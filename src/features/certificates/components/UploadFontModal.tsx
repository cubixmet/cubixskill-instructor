import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { certificatesService } from '../../../services/certificates.service';
import { CertificateFontItem } from '../utils/fontRegistry';
import { certificateKeys } from '../hooks/useCertificateQueries';

interface UploadFontModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFontUploaded: (font: CertificateFontItem) => void;
}

export const UploadFontModal: React.FC<UploadFontModalProps> = ({ isOpen, onClose, onFontUploaded }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [userRightsConfirmed, setUserRightsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!displayName) {
        const rawName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDisplayName(rawName.charAt(0).toUpperCase() + rawName.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a font file (.ttf, .otf, .woff, or .woff2).');
      return;
    }
    if (!displayName.trim()) {
      setError('Please enter a display name for the font.');
      return;
    }
    if (!userRightsConfirmed) {
      setError('You must confirm that you have the necessary rights or license to use this font.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('font_file', file);
      formData.append('display_name', displayName.trim());
      formData.append('user_rights_confirmed', 'true');

      const res = await certificatesService.uploadFont(formData);
      queryClient.invalidateQueries({ queryKey: certificateKeys.fonts() });
      onFontUploaded(res);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload font. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Custom Font</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload brand font for your Academy's certificates</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Font File * <span className="text-slate-400 dark:text-slate-500 font-normal">(.ttf, .otf, .woff, .woff2)</span>
            </label>
            <input
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-950 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Brand Bold Serif"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 p-3.5 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={userRightsConfirmed}
                onChange={(e) => setUserRightsConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                By uploading this font, you confirm that you have the necessary rights or license to use and embed it in certificates.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !userRightsConfirmed || !file || !displayName.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Font'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
