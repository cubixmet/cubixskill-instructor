import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { creditService } from '../../services/credit.service';
import { formatCreditRate } from '../../utils/creditFormatter';

export interface CreditUsageConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  featureCode?: string;
  courseId?: string;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const CreditUsageConfirmationModal: React.FC<CreditUsageConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  featureCode = 'LESSONS',
  courseId,
  title,
  description,
  isSubmitting = false,
  confirmText = 'Continue',
  cancelText = 'Cancel',
}) => {
  const navigate = useNavigate();

  const [preview, setPreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingPreview(true);
    setPreviewError(null);
    setPreview(null);

    creditService
      .getUsagePreview({
        feature_code: featureCode,
        course_id: courseId,
      })
      .then((data) => {
        if (isMounted && data) {
          setPreview(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch backend credit usage preview:', err);
        if (isMounted) {
          setPreviewError(err?.response?.data?.detail || err?.message || 'Failed to load credit usage preview.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, featureCode, courseId]);

  if (!isOpen) return null;

  const unitLabel = preview?.billing_unit_label || preview?.billing_unit || 'Unit';
  const creditRate = preview?.credit_rate ?? 0;
  const billableQty = preview?.billable_quantity ?? 0;
  const estimatedCharge = preview?.estimated_charge ?? 0;
  const currentBalance = preview?.current_balance ?? 0;
  const remainingBalance = preview?.remaining_balance ?? 0;
  const canAfford = preview?.can_afford ?? false;

  const modalTitle = title || (preview ? `Per ${unitLabel} Credit Usage` : 'Credit Usage Preview');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="space-y-4 font-sans text-xs text-left font-normal pb-1">
        {/* Header Banner */}
        <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 dark:bg-[rgba(37,99,235,0.08)] border border-blue-100 dark:border-[rgba(59,130,246,0.2)] rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC]">
              {preview ? (creditRate === 0 ? 'Free Feature (0 Credits)' : `Billing Unit: ${unitLabel}`) : 'Feature Billing Preview'}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-normal mt-0.5">
              {description || (preview ? `Platform credits are charged strictly per ${unitLabel.toLowerCase()}.` : 'Fetching real-time backend configuration...')}
            </p>
          </div>
        </div>

        {isLoadingPreview ? (
          <div className="p-8 text-center space-y-2 bg-slate-50 dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244]">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Calculating credit usage preview...</p>
          </div>
        ) : previewError ? (
          <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/50 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to Load Credit Preview</span>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400">{previewError}</p>
          </div>
        ) : preview ? (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#263244] bg-white dark:bg-[#111827] space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-[#1E293B]">
              <span className="text-slate-600 dark:text-[#94A3B8]">Credit Rate</span>
              <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {formatCreditRate(creditRate, unitLabel)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-[#1E293B]">
              <span className="text-slate-600 dark:text-[#94A3B8]">Billable Quantity ({unitLabel})</span>
              <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {billableQty} {unitLabel}{billableQty === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-[#1E293B]">
              <span className="text-slate-600 dark:text-[#94A3B8]">Estimated Charge</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                {estimatedCharge.toLocaleString('en-IN')} Credits
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-[#1E293B]">
              <span className="text-slate-600 dark:text-[#94A3B8]">Current Balance</span>
              <span className={`font-semibold ${!canAfford ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-[#F8FAFC]'}`}>
                {currentBalance.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Credits
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-600 dark:text-[#94A3B8]">Remaining Balance</span>
              <span className={`font-extrabold ${!canAfford ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {remainingBalance.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Credits
              </span>
            </div>
          </div>
        ) : null}

        {/* Insufficient Credit Warning */}
        {preview && !canAfford && !isLoadingPreview && !previewError && (
          <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-[rgba(239,68,68,0.08)] flex items-center justify-between gap-3 text-xs text-rose-900 dark:text-rose-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="truncate">You do not have enough credits to enable this feature.</span>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                navigate('/credits/buy');
              }}
              className="h-8 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
            >
              Buy Credits
            </Button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-[#263244]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-semibold border-slate-300 dark:border-[#263244]"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onConfirm()}
            disabled={isSubmitting || !preview || !canAfford || isLoadingPreview || Boolean(previewError)}
            leftIcon={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            {isSubmitting ? 'Enabling...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
