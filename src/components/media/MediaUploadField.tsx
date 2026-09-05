import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  Loader2,
  Film,
  Music,
  File,
  Image as ImageIcon,
} from 'lucide-react';
import { storageService, type MediaFileApiItem } from '../../services/storage.service';
import { resolveMediaUrl } from '../../utils/mediaResolver';
import { Button } from '../ui/Button';

export type UploadStatus = 'idle' | 'selected' | 'uploading' | 'uploaded' | 'failed';

export interface MediaUploadFieldProps {
  label?: string;
  value?: MediaFileApiItem | string | null;
  accept?: string;
  required?: boolean;
  courseUuid?: string;
  lessonUuid?: string;
  hlsEnabled?: boolean;
  maxSizeBytes?: number; // Default 100MB
  onUploaded: (media: MediaFileApiItem) => void;
  onRemove?: () => void;
  helpText?: string;
  className?: string;
}

export const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  label = 'File Upload',
  value,
  accept = 'image/*,video/*,audio/*,application/pdf',
  required = false,
  courseUuid,
  lessonUuid,
  hlsEnabled = false,
  maxSizeBytes = 100 * 1024 * 1024, // 100MB
  onUploaded,
  onRemove,
  helpText,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<MediaFileApiItem | null>(null);

  // Sync value from props (persisted backend state)
  useEffect(() => {
    if (value && typeof value === 'object') {
      setUploadedMedia(value);
      setStatus('uploaded');
    } else if (typeof value === 'string' && value.trim()) {
      // String URL or UUID
      if (value.startsWith('http') || value.startsWith('/')) {
        setUploadedMedia({
          id: 'existing-id',
          original_filename: 'Persisted Media File',
          display_name: 'Persisted Media File',
          stored_filename: '',
          storage_key: '',
          relative_path: value,
          mime_type: 'image/*',
          file_type: 'image',
          file_extension: '',
          size_bytes: 0,
          media_type: 'IMAGE',
          status: 'READY',
          url: value,
          created_at: '',
          usage_count: 1,
        });
        setStatus('uploaded');
      }
    } else if (!value) {
      if (status === 'uploaded') {
        setUploadedMedia(null);
        setStatus('idle');
      }
    }
  }, [value]);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [localBlobUrl]);

  // File selection handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size === 0) {
      setErrorMessage('Selected file is empty (0 bytes). Please choose a valid file.');
      setStatus('failed');
      return;
    }

    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setErrorMessage(`File size exceeds maximum allowed limit of ${maxMb}MB.`);
      setStatus('failed');
      return;
    }

    // Revoke previous blob URL if any
    if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localBlobUrl);
    }

    const newBlobUrl = URL.createObjectURL(file);
    setLocalBlobUrl(newBlobUrl);
    setSelectedFile(file);
    setErrorMessage(null);
    setStatus('selected');

    // Auto-trigger upload
    executeUpload(file);
  };

  // Execute upload handler
  const executeUpload = async (fileToUpload: File) => {
    setStatus('uploading');
    setProgress(0);
    setErrorMessage(null);

    try {
      const media = await storageService.uploadFile(fileToUpload, {
        course_uuid: courseUuid,
        lesson_uuid: lessonUuid,
        hls_enabled: hlsEnabled,
        onProgress: (pct) => setProgress(pct),
      });

      setUploadedMedia(media);
      setStatus('uploaded');
      onUploaded(media);
    } catch (err: any) {
      console.error('File upload error:', err);
      setErrorMessage(err?.message || 'Upload failed. Please check network connection and try again.');
      setStatus('failed');
    } finally {
      // Reset input value so same file can be reselected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRetry = () => {
    if (selectedFile) {
      executeUpload(selectedFile);
    }
  };

  const handleRemove = () => {
    if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localBlobUrl);
    }
    setLocalBlobUrl(null);
    setSelectedFile(null);
    setUploadedMedia(null);
    setStatus('idle');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) onRemove();
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Determine media icon
  const getMediaIcon = () => {
    const mime = selectedFile?.type || uploadedMedia?.mime_type || '';
    if (mime.startsWith('image/')) return ImageIcon;
    if (mime.startsWith('video/')) return Film;
    if (mime.startsWith('audio/')) return Music;
    return FileText;
  };

  const MediaIcon = getMediaIcon();
  const displayUrl = resolveMediaUrl(uploadedMedia?.url || localBlobUrl);

  return (
    <div className={`space-y-2 text-left font-sans text-xs ${className}`}>
      {/* HEADER LABEL */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-800 dark:text-[#CBD5E1]">
          {label} {required ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
        </label>
        {status === 'uploaded' && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
          </span>
        )}
      </div>

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={status === 'uploading'}
        className="hidden"
      />

      {/* IDLE STATE: DROPZONE / PICKER */}
      {status === 'idle' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#263244] hover:border-[#2563EB] dark:hover:border-[#3B82F6] bg-slate-50/60 dark:bg-[#0F172A] hover:bg-blue-50/30 dark:hover:bg-[rgba(37,99,235,0.06)] transition-all cursor-pointer text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] block">
              Click to upload file
            </span>
            <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal block mt-0.5">
              {helpText || `Supports ${accept.replace(/\/\*/g, '')} up to ${Math.round(maxSizeBytes / (1024 * 1024))}MB`}
            </span>
          </div>
        </div>
      )}

      {/* UPLOADING STATE */}
      {status === 'uploading' && (
        <div className="p-4 rounded-2xl border border-blue-200 dark:border-[rgba(59,130,246,0.3)] bg-blue-50/50 dark:bg-[rgba(37,99,235,0.08)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] animate-spin shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                Uploading {selectedFile?.name}...
              </span>
            </div>
            <span className="font-semibold text-[#2563EB] dark:text-[#60A5FA] shrink-0">
              {progress}%
            </span>
          </div>

          <div className="w-full bg-blue-200/60 dark:bg-[#263244] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2563EB] dark:bg-[#3B82F6] h-full rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* UPLOADED PERSISTED STATE */}
      {status === 'uploaded' && (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#263244] bg-white dark:bg-[#111827] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0 w-full">
            {/* MEDIA PREVIEW THUMBNAIL IF IMAGE */}
            {displayUrl && (uploadedMedia?.media_type === 'IMAGE' || selectedFile?.type.startsWith('image/')) ? (
              <img
                src={displayUrl}
                alt="Uploaded media"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-[#263244] shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-950">
                <MediaIcon className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] block truncate">
                {uploadedMedia?.original_filename || uploadedMedia?.display_name || selectedFile?.name || 'Uploaded File'}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">
                <span>{formatSize(uploadedMedia?.size_bytes || selectedFile?.size)}</span>
                <span>•</span>
                <span className="font-mono text-[10px] text-slate-400">{uploadedMedia?.id?.substring(0, 8)}...</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 text-xs font-semibold border-slate-300 dark:border-[#263244]"
            >
              Replace
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer transition-colors"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FAILED STATE */}
      {status === 'failed' && (
        <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-[rgba(239,68,68,0.08)] flex items-center justify-between gap-4 text-xs text-rose-900 dark:text-rose-200">
          <div className="flex items-center gap-3 min-w-0">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold block truncate">Upload Failed</span>
              <span className="text-[11px] text-rose-700 dark:text-rose-300 block leading-tight truncate">
                {errorMessage || 'A storage error occurred during upload.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={handleRetry}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="h-8 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
            >
              Retry
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
