import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { HardDrive, AlertCircle } from 'lucide-react';
import type { StorageEstimateResponse } from '../../services/storage.service';

export interface StorageUploadConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
  estimate: StorageEstimateResponse | null;
  isLoadingEstimate?: boolean;
  isUploading?: boolean;
}

export const StorageUploadConfirmationModal: React.FC<StorageUploadConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileName,
  estimate,
  isLoadingEstimate = false,
  isUploading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Storage Usage Confirmation">
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
          <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block text-slate-900 dark:text-white">Pre-Upload Storage Estimate</span>
            Review the calculated billing contribution before uploading to your academy account.
          </div>
        </div>

        {isLoadingEstimate ? (
          <div className="py-6 text-center text-xs text-slate-500 animate-pulse">
            Calculating storage estimation from server...
          </div>
        ) : estimate ? (
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">File Name:</span>
              <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{fileName}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">File Size:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{estimate.file_size_display}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Current Storage Usage:</span>
              <span className="font-medium text-slate-900 dark:text-white">{estimate.current_storage_usage}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Estimated New Usage:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{estimate.estimated_new_usage}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Configured Storage Rate:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{estimate.price_per_unit} / {estimate.storage_unit} / month
              </span>
            </div>

            <div className="flex justify-between py-2 p-2 rounded-md bg-slate-100 dark:bg-[#0F172A] font-semibold text-sm">
              <span className="text-slate-700 dark:text-slate-300">Estimated Monthly Charge:</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                ₹{estimate.additional_monthly_cost}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Could not load estimation details. Proceeding with standard file upload.</span>
          </div>
        )}

        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          This file will contribute to your academy's monthly storage usage.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} isLoading={isUploading} disabled={isLoadingEstimate}>
            Confirm & Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
};
