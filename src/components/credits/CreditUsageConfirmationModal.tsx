import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { creditService, type CreditUsagePreviewResponse } from '../../services/credit.service';

export interface CreditUsageConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  dailyCost?: number | string; // Fallback or override
  currentBalance?: number | string;
  resourceType?: string; // e.g. 'COURSE_FEATURE'
  resourceId?: string;   // e.g. 'LIVE_CLASS'
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
  dailyCost: customDailyCost,
  currentBalance: customBalance,
  resourceType = 'COURSE_FEATURE',
  resourceId,
  courseId,
  title = 'Daily Credit Usage',
  description = 'Credits are deducted daily while this feature remains active.',
  isSubmitting = false,
  confirmText = 'Continue',
  cancelText = 'Cancel',
}) => {
  const navigate = useNavigate();

  const [preview, setPreview] = useState<CreditUsagePreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (!resourceId) {
      // Use custom props fallback
      return;
    }

    let isMounted = true;
    setIsLoadingPreview(true);
    setPreviewError(null);

    creditService
      .getUsagePreview({
        resource_type: resourceType,
        resource_id: resourceId,
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
          setPreviewError('Unable to verify daily credit pricing from server.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, resourceType, resourceId, courseId]);

  if (!isOpen) return null;

  // Resolve values from backend preview or custom props
  const rawDailyCost = preview ? preview.daily_credit_cost : (customDailyCost !== undefined ? customDailyCost : 10);
  const numDailyCost = typeof rawDailyCost === 'number' ? rawDailyCost : parseFloat(String(rawDailyCost || 0));
  const safeDailyCost = isNaN(numDailyCost) ? 0 : numDailyCost;

  const rawBalance = preview ? preview.current_balance : (customBalance !== undefined ? customBalance : 0);
  const numBalance = typeof rawBalance === 'number' ? rawBalance : parseFloat(String(rawBalance || 0));
  const safeBalance = isNaN(numBalance) ? 0 : numBalance;

  const currentDailyUsage = preview ? parseFloat(preview.current_daily_usage || '0') : 0;
  const projectedDailyUsage = preview ? parseFloat(preview.projected_daily_usage || '0') : safeDailyCost;

  const estimatedDays = preview
    ? preview.estimated_days_remaining
    : (safeDailyCost > 0 ? Math.floor(safeBalance / safeDailyCost) : null);

  const hasEnoughCredits = preview ? preview.has_enough_credits : (safeBalance >= safeDailyCost);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5 font-sans text-xs text-left font-normal pb-1">
        {/* Header Banner */}
        <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 dark:bg-[rgba(37,99,235,0.08)] border border-blue-100 dark:border-[rgba(59,130,246,0.2)] rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC]">
              This action uses credits daily
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-normal mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {isLoadingPreview ? (
          <div className="p-8 text-center space-y-2 bg-slate-50 dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244]">
            <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Checking daily credit usage...</p>
          </div>
        ) : (
          /* Main Billing Cards */
          <div className="space-y-3">
            {/* Primary Highlighted Daily Cost Card */}
            <div className="p-4 rounded-2xl border-2 border-blue-200 dark:border-[rgba(59,130,246,0.4)] bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-[rgba(37,99,235,0.1)] dark:to-[rgba(99,102,241,0.06)] flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-wider block">
                  Daily Credit Usage
                </span>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Deducted every 24 hours</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight block">
                  {safeDailyCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA]">Credits / day</span>
              </div>
            </div>

            {/* Aggregate Usage & Balance Card */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#263244] bg-white dark:bg-[#111827] space-y-2.5 shadow-2xs">
              {currentDailyUsage > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-[#1E293B]">
                    <span className="text-slate-600 dark:text-[#94A3B8]">Current Daily Usage</span>
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {currentDailyUsage.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Credits / day
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-[#1E293B]">
                    <span className="text-slate-600 dark:text-[#94A3B8]">After Activation</span>
                    <span className="font-bold text-[#2563EB] dark:text-[#60A5FA]">
                      {projectedDailyUsage.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Credits / day
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-[#1E293B]">
                <span className="text-slate-600 dark:text-[#94A3B8]">Current Balance</span>
                <span className={`font-extrabold text-sm ${!hasEnoughCredits ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-[#F8FAFC]'}`}>
                  {safeBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Credits
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-[#1E293B]">
                <span className="text-slate-600 dark:text-[#94A3B8]">Estimated Coverage</span>
                <span className={`font-extrabold ${!hasEnoughCredits ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {estimatedDays !== null
                    ? estimatedDays === 0
                      ? 'Less than 1 day'
                      : `Approximately ${estimatedDays} day${estimatedDays === 1 ? '' : 's'}`
                    : 'Unlimited'}
                </span>
              </div>

              {preview?.next_charge_date && (
                <div className="flex items-center justify-between text-xs py-1 text-slate-500 dark:text-[#94A3B8]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Next Deduction</span>
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-[#CBD5E1]">
                    {preview.next_charge_date}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insufficient Credit Warning */}
        {!hasEnoughCredits && !isLoadingPreview && (
          <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-[rgba(239,68,68,0.08)] flex items-center justify-between gap-3 text-xs text-rose-900 dark:text-rose-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="truncate">You need more credits to start this daily usage.</span>
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
            disabled={isSubmitting || !hasEnoughCredits || isLoadingPreview}
            leftIcon={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            className="h-9 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs"
          >
            {isSubmitting ? 'Activating...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
