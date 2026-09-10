import React, { useState } from 'react';
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Link2,
  X,
  ImageIcon,
  Video,
  Check,
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import type { CourseSettingsConfig } from '../../store/courseSettings.store';
import { coursesService } from '../../../../services/courses.service';
import { SearchableCategorySelector } from '../SearchableCategorySelector';
import { SearchableLanguageSelector } from '../SearchableLanguageSelector';

const CategoryAndMediaSection: React.FC<{
  settings: CourseSettingsConfig;
  onChange: (updates: Partial<CourseSettingsConfig>) => void;
}> = ({ settings, onChange }) => {
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isThumbnailUrlBroken, setIsThumbnailUrlBroken] = useState(false);

  const [isUploadingPromoVideo, setIsUploadingPromoVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [promoVideoError, setPromoVideoError] = useState<string | null>(null);
  const [isPromoVideoUrlBroken, setIsPromoVideoUrlBroken] = useState(false);

  const thumbnailMode = settings.thumbnailMode || 'UPLOAD';
  const promoVideoMode = settings.promoVideoMode || 'UPLOAD';

  // Handle Thumbnail File Upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setThumbnailError(null);

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setThumbnailError('File size exceeds maximum limit of 10 MB.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setThumbnailError('Invalid file format. Supported formats: JPG, JPEG, PNG, WEBP.');
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      const media = await coursesService.uploadMedia(file);
      const url = media.url || media.relative_path || media.file_url || (media.stored_filename ? `/media/${media.stored_filename}` : '');
      if (!media.id || !url) throw new Error('Upload succeeded but backend returned no valid media file.');

      onChange({
        thumbnailMediaId: media.id,
        thumbnailPreviewUrl: url,
        thumbnailMode: 'UPLOAD',
      });
    } catch (err: any) {
      setThumbnailError(err?.response?.data?.message || err?.message || 'Failed to upload thumbnail image.');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // Handle Promo Video File Upload
  const handlePromoVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setPromoVideoError(null);

    // Validate size (max 100MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPromoVideoError('File size exceeds maximum limit of 100 MB.');
      return;
    }

    // Validate type
    const validTypes = ['video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPromoVideoError('Invalid file format. Supported formats: MP4, WEBM.');
      return;
    }

    setIsUploadingPromoVideo(true);
    setUploadProgress(30);
    try {
      const media = await coursesService.uploadMedia(file);
      setUploadProgress(100);
      const url = media.url || media.relative_path || media.file_url || (media.stored_filename ? `/media/${media.stored_filename}` : '');
      if (!media.id || !url) throw new Error('Upload succeeded but backend returned no valid media file.');

      onChange({
        promoVideoMediaId: media.id,
        promoVideoPreviewUrl: url,
        promoVideoMode: 'UPLOAD',
      });
    } catch (err: any) {
      setPromoVideoError(err?.response?.data?.message || err?.message || 'Failed to upload promo video file.');
    } finally {
      setIsUploadingPromoVideo(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-6 font-sans text-xs text-left">
      <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
        Category &amp; Media Management
      </h3>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Field 1: Category */}
        <div className="space-y-1 min-w-0">
          <label className="text-xs font-semibold text-[var(--text-primary)] block">Course Category</label>
          <SearchableCategorySelector
            value={settings.categoryId}
            onChange={(cat) => onChange({ categoryId: cat?.id || null, category: cat?.name || '' })}
          />
        </div>

        {/* Field 2: Difficulty Level */}
        <div className="space-y-1 min-w-0">
          <label className="text-xs font-semibold text-[var(--text-primary)] block">Difficulty Level *</label>
          <select
            value={settings.level}
            onChange={(e) => onChange({ level: e.target.value as CourseSettingsConfig['level'] })}
            className="w-full h-11 px-3 bg-[var(--surface)] border border-[var(--input-border)] text-[var(--text-primary)] rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="All Levels">All Levels</option>
          </select>
        </div>

        {/* Field 3: Language */}
        <div className="space-y-1 min-w-0">
          <label className="text-xs font-semibold text-[var(--text-primary)] block">Course Language *</label>
          <SearchableLanguageSelector
            value={settings.language || 'English'}
            onChange={(langName) => onChange({ language: langName })}
          />
        </div>
      </div>

      {/* --- THUMBNAIL MEDIA SECTION --- */}
      <div className="space-y-3 pt-3 border-t border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] block">Course Thumbnail Image</label>
            <p className="text-[11px] text-[var(--text-secondary)] font-normal">Standard 16:9 aspect ratio (Recommended 1280 × 720 px)</p>
          </div>

          {/* Mode Toggle Selector */}
          <div className="inline-flex items-center p-1 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                onChange({ thumbnailMode: 'UPLOAD' });
                setIsThumbnailUrlBroken(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                thumbnailMode === 'UPLOAD'
                  ? 'bg-[var(--surface)] text-blue-600 dark:text-[#60A5FA] shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ thumbnailMode: 'URL' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                thumbnailMode === 'URL'
                  ? 'bg-[var(--surface)] text-blue-600 dark:text-[#60A5FA] shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Custom URL</span>
            </button>
          </div>
        </div>

        {thumbnailError && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{thumbnailError}</span>
          </div>
        )}

        {/* Thumbnail Mode: UPLOAD */}
        {thumbnailMode === 'UPLOAD' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
            {settings.thumbnailPreviewUrl ? (
              <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-slate-900 shadow-2xs">
                <img
                  src={settings.thumbnailPreviewUrl}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      thumbnailMediaId: null,
                      thumbnailPreviewUrl: null,
                    });
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg shadow-md cursor-pointer transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
                  title="Remove Thumbnail"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-full sm:w-44 aspect-video rounded-xl bg-[var(--surface-secondary)] border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text-muted)] shrink-0">
                <ImageIcon className="w-6 h-6 mb-1 text-[var(--text-muted)]" />
                <span className="text-[10px] font-bold">16:9 Thumbnail</span>
              </div>
            )}

            <div className="space-y-2 min-w-0 flex-1 w-full">
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-[#172033] text-blue-600 dark:text-[#60A5FA] hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl text-xs font-bold cursor-pointer transition-all border border-blue-200 dark:border-blue-900/60 min-h-[44px] w-full sm:w-auto">
                {isUploadingThumbnail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isUploadingThumbnail ? 'Uploading File...' : 'Select Thumbnail File'}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/jpg"
                  onChange={handleThumbnailUpload}
                  disabled={isUploadingThumbnail}
                  className="hidden"
                />
              </label>
              <div className="text-[11px] text-[var(--text-secondary)] space-y-0.5 font-normal leading-normal">
                <p>• <strong>Formats:</strong> JPG, JPEG, PNG, WEBP • <strong>Max Size:</strong> 10 MB</p>
              </div>
            </div>
          </div>
        )}

        {/* Thumbnail Mode: URL */}
        {thumbnailMode === 'URL' && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">Custom Image URL</label>
              <Input
                type="url"
                value={settings.customThumbnailUrl || ''}
                onChange={(e) => {
                  onChange({ customThumbnailUrl: e.target.value });
                  setIsThumbnailUrlBroken(false);
                }}
                placeholder="https://images.unsplash.com/photo-example.jpg"
              />
            </div>

            {settings.customThumbnailUrl?.trim() && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-slate-900 shadow-2xs">
                  {!isThumbnailUrlBroken ? (
                    <img
                      src={settings.customThumbnailUrl.trim()}
                      alt="Custom Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={() => setIsThumbnailUrlBroken(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-2 text-center">
                      <AlertTriangle className="w-5 h-5 mb-1 shrink-0" />
                      <span className="text-[10px] font-bold">Image Failed to Load</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">
                  {!isThumbnailUrlBroken ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Valid Image URL Preview
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      Invalid or inaccessible image URL. Please check link.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- PROMO VIDEO MEDIA SECTION --- */}
      <div className="space-y-3 pt-4 border-t border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] block">Course Promo Video</label>
            <p className="text-[11px] text-[var(--text-secondary)] font-normal">Teaser video shown on course sales page</p>
          </div>

          {/* Mode Toggle Selector */}
          <div className="inline-flex items-center p-1 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                onChange({ promoVideoMode: 'UPLOAD' });
                setIsPromoVideoUrlBroken(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                promoVideoMode === 'UPLOAD'
                  ? 'bg-[var(--surface)] text-blue-600 dark:text-[#60A5FA] shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ promoVideoMode: 'URL' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                promoVideoMode === 'URL'
                  ? 'bg-[var(--surface)] text-blue-600 dark:text-[#60A5FA] shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>External URL</span>
            </button>
          </div>
        </div>

        {promoVideoError && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{promoVideoError}</span>
          </div>
        )}

        {/* Promo Video Mode: UPLOAD */}
        {promoVideoMode === 'UPLOAD' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
            {settings.promoVideoPreviewUrl ? (
              <div className="relative w-full sm:w-52 aspect-video rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-slate-900 shadow-2xs">
                <video
                  src={settings.promoVideoPreviewUrl}
                  controls
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      promoVideoMediaId: null,
                      promoVideoPreviewUrl: null,
                    });
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg shadow-md cursor-pointer transition-all z-10 min-h-[32px] min-w-[32px] flex items-center justify-center"
                  title="Remove Promo Video"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-full sm:w-52 aspect-video rounded-xl bg-[var(--surface-secondary)] border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text-muted)] shrink-0">
                <Video className="w-6 h-6 mb-1 text-[var(--text-muted)]" />
                <span className="text-[10px] font-bold">Promo Video File</span>
              </div>
            )}

            <div className="space-y-2 min-w-0 flex-1 w-full">
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-[#172033] text-blue-600 dark:text-[#60A5FA] hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl text-xs font-bold cursor-pointer transition-all border border-blue-200 dark:border-blue-900/60 min-h-[44px] w-full sm:w-auto">
                {isUploadingPromoVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isUploadingPromoVideo ? 'Uploading Video...' : 'Select Promo Video File'}</span>
                <input
                  type="file"
                  accept="video/mp4, video/webm"
                  onChange={handlePromoVideoUpload}
                  disabled={isUploadingPromoVideo}
                  className="hidden"
                />
              </label>

              {isUploadingPromoVideo && (
                <div className="space-y-1 pt-1 w-full max-w-xs">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#2563EB]">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="text-[11px] text-[var(--text-secondary)] space-y-0.5 font-normal leading-normal">
                <p>• <strong>Formats:</strong> MP4, WEBM • <strong>Max Size:</strong> 100 MB</p>
              </div>
            </div>
          </div>
        )}

        {/* Promo Video Mode: URL */}
        {promoVideoMode === 'URL' && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">External Video URL</label>
              <Input
                type="url"
                value={settings.customPromoVideoUrl || ''}
                onChange={(e) => {
                  onChange({ customPromoVideoUrl: e.target.value });
                  setIsPromoVideoUrlBroken(false);
                }}
                placeholder="https://www.youtube.com/watch?v=example or https://vimeo.com/example"
              />
            </div>

            {settings.customPromoVideoUrl?.trim() && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-52 aspect-video rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-slate-900 shadow-2xs flex items-center justify-center">
                  <Video className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Valid Video URL Link
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export interface CourseSettingsSectionsProps {
  sectionId: string;
  settings: CourseSettingsConfig;
  onChange: (updates: Partial<CourseSettingsConfig>) => void;
  courseFeatures: Record<string, boolean | undefined>;
  courseUuid: string;
  onOpenDeleteModal: () => void;
}

export const CourseSettingsSections: React.FC<CourseSettingsSectionsProps> = ({
  sectionId,
  settings,
  onChange,
  courseFeatures,
  courseUuid,
  onOpenDeleteModal,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // 1. Basic Information & Category & Media Management
  if (sectionId === 'basic') {
    return (
      <div className="space-y-6 text-left font-sans text-xs">
        <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Basic Course Information</h3>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Course Title *</label>
              <Input
                value={settings.title}
                onChange={(e) => onChange({ title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Short Description Preview</label>
              <Input
                value={settings.shortDescription}
                onChange={(e) => onChange({ shortDescription: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Full Course Overview</label>
              <textarea
                rows={4}
                value={settings.fullDescription}
                onChange={(e) => onChange({ fullDescription: e.target.value })}
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--surface)] p-3 text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </Card>

        <CategoryAndMediaSection settings={settings} onChange={onChange} />
      </div>
    );
  }

  // 2. Access & Visibility
  if (sectionId === 'access') {
    return (
      <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Access &amp; Visibility</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Visibility Mode</label>
            <select
              value={settings.visibility}
              onChange={(e) => onChange({ visibility: e.target.value as CourseSettingsConfig['visibility'] })}
              className="w-full h-9 rounded-lg border border-[var(--input-border)] px-3 bg-[var(--surface)] font-semibold text-[var(--text-primary)]"
            >
              <option value="Public">Public (Listed in catalog)</option>
              <option value="Unlisted">Unlisted (Link only)</option>
              <option value="Private">Private (Invite only)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Access Type</label>
            <select
              value={settings.accessType}
              onChange={(e) => onChange({ accessType: e.target.value as CourseSettingsConfig['accessType'] })}
              className="w-full h-9 rounded-lg border border-[var(--input-border)] px-3 bg-[var(--surface)] font-semibold text-[var(--text-primary)]"
            >
              <option value="Paid">Paid Course</option>
              <option value="Free">Free Course</option>
              <option value="Invite Only">Invite Only</option>
              <option value="Internal">Internal Academy</option>
            </select>
          </div>
        </div>
      </Card>
    );
  }

  // 4. Pricing (INR)
  if (sectionId === 'pricing') {
    return (
      <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Course Pricing Defaults (INR)</h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Currency</label>
            <Input value={settings.currency} disabled className="bg-[var(--surface-secondary)]" />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Regular Price (₹)</label>
            <Input
              type="number"
              value={settings.price}
              onChange={(e) => onChange({ price: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Discounted Price (₹)</label>
            <Input
              type="number"
              value={settings.discountPrice}
              onChange={(e) => onChange({ discountPrice: Number(e.target.value) })}
            />
          </div>
        </div>
      </Card>
    );
  }

  // 10. Data & Export Settings
  if (sectionId === 'data-export') {
    const isExportEnabled = settings.allowDataExport !== false;

    const handleExport = async () => {
      if (!isExportEnabled) return;
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(false);

      try {
        const blob = await coursesService.exportCourseData(courseUuid);
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = (settings.title || 'course').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `${safeTitle}-students-${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to export course data.';
        setExportError(msg);
      } finally {
        setIsExporting(false);
      }
    };

    return (
      <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-5 font-sans text-xs text-left">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <Download className="w-4 h-4 text-[#2563EB]" /> data-export Settings
          </h3>
          <p className="text-[var(--text-secondary)] mt-1">Configure course-specific parameters for data-export.</p>
        </div>

        {/* Toggle Switch Card */}
        <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <label className="font-bold text-[var(--text-primary)] text-xs block">Allow Student &amp; Enrollment Data Export</label>
            <p className="text-[11px] text-[var(--text-secondary)] font-normal">
              When enabled, authorized instructors and academy administrators can download CSV exports of course student enrollments and progress.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isExportEnabled}
              onChange={(e) => onChange({ allowDataExport: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
          </label>
        </div>

        {/* Export Action Card */}
        <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-[#2563EB] shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[var(--text-primary)] block text-xs">Course Students &amp; Enrollment Data (CSV)</span>
                <span className="text-[11px] text-[var(--text-secondary)]">Includes Student Name, Email, Status, Access Type, Enrolled Date, and Progress %.</span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleExport}
              disabled={!isExportEnabled || isExporting}
              className={`shrink-0 font-semibold h-9 px-4 text-xs transition-all ${
                !isExportEnabled ? 'opacity-50 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-xs'
              }`}
              leftIcon={isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            >
              {isExporting ? 'Exporting...' : 'Export Course Data'}
            </Button>
          </div>

          {!isExportEnabled && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Data export is currently OFF for this course. Enable the setting above and save changes to perform exports.</span>
            </div>
          )}

          {exportSuccess && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Course data file generated and downloaded successfully!</span>
            </div>
          )}

          {exportError && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-lg text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{exportError}</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // 17. Danger Zone
  if (sectionId === 'danger-zone') {
    return (
      <Card padding="md" className="bg-[var(--surface)] border border-rose-200 dark:border-rose-900/50 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 border-b border-rose-100 dark:border-rose-900/30 pb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Danger Zone Actions
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--text-primary)] block">Archive Course</span>
              <span className="text-[10px] text-[var(--text-secondary)] font-normal">Hide course from student directory while preserving all records.</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => alert('Course archived.')}>
              Archive Course
            </Button>
          </div>

          <div className="p-3 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-rose-600 dark:text-rose-400 block">Delete Course Permanently</span>
              <span className="text-[10px] text-rose-500/80 font-normal">Permanently delete course, student submissions, and certificates.</span>
            </div>
            <Button size="sm" onClick={onOpenDeleteModal} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Delete Course
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Default Fallback Form
  return (
    <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-3 font-sans text-xs text-left">
      <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 capitalize">{sectionId} Settings</h3>
      <p className="text-[var(--text-secondary)]">Configure course-specific parameters for {sectionId}.</p>
    </Card>
  );
};
