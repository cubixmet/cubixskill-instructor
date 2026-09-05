import { useState, useCallback } from 'react';
import { storageService, type MediaFileApiItem } from '../services/storage.service';

export type UploadStateStatus = 'idle' | 'selected' | 'uploading' | 'uploaded' | 'failed';

export interface UseMediaUploadOptions {
  courseUuid?: string;
  lessonUuid?: string;
  hlsEnabled?: boolean;
  onSuccess?: (media: MediaFileApiItem) => void;
  onError?: (error: Error) => void;
}

export function useMediaUpload(options?: UseMediaUploadOptions) {
  const [status, setStatus] = useState<UploadStateStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<MediaFileApiItem | null>(null);

  const upload = useCallback(
    async (file: File, overrideOptions?: UseMediaUploadOptions) => {
      if (!file || file.size === 0) {
        const err = new Error('FILE_EMPTY: Selected file is empty (0 bytes).');
        setError(err.message);
        setStatus('failed');
        if (options?.onError) options.onError(err);
        return null;
      }

      setStatus('uploading');
      setProgress(0);
      setError(null);

      const mergedOptions = { ...options, ...overrideOptions };

      try {
        const media = await storageService.uploadFile(file, {
          course_uuid: mergedOptions?.courseUuid,
          lesson_uuid: mergedOptions?.lessonUuid,
          hls_enabled: mergedOptions?.hlsEnabled,
          onProgress: (pct) => setProgress(pct),
        });

        setUploadedMedia(media);
        setStatus('uploaded');

        if (mergedOptions?.onSuccess) {
          mergedOptions.onSuccess(media);
        }
        return media;
      } catch (err: any) {
        console.error('useMediaUpload failed:', err);
        const errMsg = err?.message || 'File upload failed.';
        setError(errMsg);
        setStatus('failed');
        if (mergedOptions?.onError) {
          mergedOptions.onError(err instanceof Error ? err : new Error(errMsg));
        }
        return null;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    setUploadedMedia(null);
  }, []);

  return {
    upload,
    reset,
    status,
    progress,
    error,
    uploadedMedia,
    isUploading: status === 'uploading',
    isUploaded: status === 'uploaded',
    isFailed: status === 'failed',
  };
}
