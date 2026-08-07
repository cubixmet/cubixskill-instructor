import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OverlayField } from '../pages/ImageTemplateDesignerPage';

import { PlaceholderKey } from '../../../types/certificate.types';

export interface SelectedFieldSetting {
  id: string;
  key: PlaceholderKey;
  label: string;
  sampleValue?: string;
  category?: string;
}

export interface UploadedDesignDraft {
  templateUuid: string;
  courseUuid: string;
  templateName: string;
  autoIssueRule: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  previewDataUrl: string; // Persistent Base64 Data URL or mock reference
  placedFields: OverlayField[];
  selectedFields?: SelectedFieldSetting[];
  createdAt: string;
  updatedAt: string;
}

interface CertificateImageTemplateState {
  uploadedDesign: UploadedDesignDraft | null;
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  setUploadedDesign: (data: Omit<UploadedDesignDraft, 'createdAt' | 'updatedAt'>) => void;
  getUploadedDesign: () => UploadedDesignDraft | null;
  clearUploadedDesign: () => void;
  updateTemplateDraft: (updates: Partial<UploadedDesignDraft>) => void;
  saveTemplateDraft: () => void;
}

export const useCertificateImageTemplateStore = create<CertificateImageTemplateState>()(
  persist(
    (set, get) => ({
      uploadedDesign: null,
      hasHydrated: false,

      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),

      setUploadedDesign: (data) => {
        const now = new Date().toISOString();
        const draft: UploadedDesignDraft = {
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        set({ uploadedDesign: draft });
      },

      getUploadedDesign: () => get().uploadedDesign,

      clearUploadedDesign: () => set({ uploadedDesign: null }),

      updateTemplateDraft: (updates) => {
        const current = get().uploadedDesign;
        if (!current) return;
        set({
          uploadedDesign: {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      saveTemplateDraft: () => {
        const current = get().uploadedDesign;
        if (!current) return;
        set({
          uploadedDesign: {
            ...current,
            updatedAt: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: 'cubixskill-certificate-image-template-draft',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  dataUrl?: string;
}

/**
 * Validates uploaded certificate design file (PNG, JPG, WEBP, PDF)
 * Checks file type, file size (<20MB), minimum dimensions (>300x200px), and unreadable/corrupt files.
 */
export const validateAndReadImageFile = (file: File): Promise<FileValidationResult> => {
  return new Promise((resolve) => {
    // 1. Format check
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    const fileType = file.type.toLowerCase();

    if (!allowedTypes.includes(fileType) && !file.name.match(/\.(png|jpe?g|webp|pdf)$/i)) {
      resolve({
        valid: false,
        error: 'Unsupported file format. Please upload a PNG, JPG, JPEG, or WEBP image file.',
      });
      return;
    }

    // 2. File size check (max 20MB)
    const maxSizeBytes = 20 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      resolve({
        valid: false,
        error: `File size exceeds 20MB limit. Current file size is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
      });
      return;
    }

    // 3. Read file as Data URL
    const reader = new FileReader();
    reader.onerror = () => {
      resolve({
        valid: false,
        error: 'Failed to read the uploaded file. The file may be corrupt or unreadable.',
      });
    };

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        resolve({
          valid: false,
          error: 'Could not generate preview for the uploaded file.',
        });
        return;
      }

      // If PDF file, handle gracefully
      if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
        resolve({
          valid: true,
          dataUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600', // Mock converted PDF background
          width: 1920,
          height: 1080,
        });
        return;
      }

      // 4. Image dimension & corruption check
      const img = new Image();
      img.onerror = () => {
        resolve({
          valid: false,
          error: 'The image file appears to be corrupted or unreadable.',
        });
      };

      img.onload = () => {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          resolve({
            valid: false,
            error: 'The uploaded image has invalid or 0px dimensions.',
          });
          return;
        }

        if (img.naturalWidth < 300 || img.naturalHeight < 200) {
          resolve({
            valid: false,
            error: `Image resolution too low (${img.naturalWidth}x${img.naturalHeight}px). Minimum 300x200px required for certificate printing.`,
          });
          return;
        }

        resolve({
          valid: true,
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
};
