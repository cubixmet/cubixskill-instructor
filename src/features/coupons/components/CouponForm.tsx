import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { courseCouponsService, CreateCouponPayload } from '../../../services/courseCoupons.service';

interface CouponFormProps {
  courseUuid: string;
  initialData?: Partial<CreateCouponPayload>;
  isEditing?: boolean;
  onSubmit: (payload: CreateCouponPayload) => Promise<void>;
  onCancel: () => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  courseUuid,
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
}) => {
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<string>('20');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<string>('0');
  const [validFrom, setValidFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>('');
  const [totalUsageLimit, setTotalUsageLimit] = useState<string>('100');
  const [perUserUsageLimit, setPerUserUsageLimit] = useState<string>('1');
  const [firstPurchaseOnly, setFirstPurchaseOnly] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      if (initialData.code) setCode(initialData.code);
      if (initialData.name) setName(initialData.name);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.discount_type) setDiscountType(initialData.discount_type);
      if (initialData.discount_value !== undefined) setDiscountValue(String(initialData.discount_value));
      if (initialData.max_discount_amount !== undefined && initialData.max_discount_amount !== null) {
        setMaxDiscountAmount(String(initialData.max_discount_amount));
      }
      if (initialData.minimum_order_amount !== undefined) setMinimumOrderAmount(String(initialData.minimum_order_amount));
      if (initialData.valid_from) setValidFrom(initialData.valid_from.split('T')[0]);
      if (initialData.valid_until) setValidUntil(initialData.valid_until.split('T')[0]);
      if (initialData.total_usage_limit !== undefined) setTotalUsageLimit(String(initialData.total_usage_limit));
      if (initialData.per_user_usage_limit !== undefined) setPerUserUsageLimit(String(initialData.per_user_usage_limit));
      if (initialData.first_purchase_only !== undefined) setFirstPurchaseOnly(initialData.first_purchase_only);
      if (initialData.is_active !== undefined) setIsActive(initialData.is_active);
    }
  }, [initialData]);

  const handleGenerateCode = async () => {
    if (!courseUuid || isGenerating) return;
    setIsGenerating(true);
    try {
      const generated = await courseCouponsService.generateCode(courseUuid);
      setCode(generated);
      if (!name) setName(`${generated} Offer`);
    } catch (err) {
      console.error('Failed to generate code:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setFieldErrors({ code: 'Coupon promo code is required.' });
      return;
    }

    const valNum = parseFloat(discountValue);
    if (isNaN(valNum) || valNum <= 0) {
      setFieldErrors({ discountValue: 'Discount value must be greater than 0.' });
      return;
    }

    if (discountType === 'PERCENTAGE' && valNum > 100) {
      setFieldErrors({ discountValue: 'Percentage discount cannot exceed 100%.' });
      return;
    }

    if (validUntil && validFrom && new Date(validUntil) <= new Date(validFrom)) {
      setFieldErrors({ validUntil: 'End date must be after start date.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        code: trimmedCode,
        name: name.trim() || trimmedCode,
        description: description.trim(),
        discount_type: discountType,
        discount_value: valNum,
        max_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        minimum_order_amount: minimumOrderAmount ? parseFloat(minimumOrderAmount) : 0,
        valid_from: validFrom,
        valid_until: validUntil || null,
        total_usage_limit: totalUsageLimit ? parseInt(totalUsageLimit) : 0,
        per_user_usage_limit: perUserUsageLimit ? parseInt(perUserUsageLimit) : 1,
        first_purchase_only: firstPurchaseOnly,
        is_active: isActive,
      });
    } catch (err: any) {
      console.error('Coupon form error:', err);
      const resData = err?.response?.data;
      if (resData && typeof resData === 'object') {
        const mapped: Record<string, string> = {};
        if (resData.code) mapped.code = Array.isArray(resData.code) ? resData.code[0] : String(resData.code);
        if (resData.discount_value) mapped.discountValue = Array.isArray(resData.discount_value) ? resData.discount_value[0] : String(resData.discount_value);
        if (resData.valid_until) mapped.validUntil = Array.isArray(resData.valid_until) ? resData.valid_until[0] : String(resData.valid_until);
        setFieldErrors(mapped);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-4 font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] text-left font-normal max-w-lg mx-auto bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs min-w-0 box-border">
      <div className="border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
        <h2 className="font-semibold text-sm sm:text-base text-[#0F172A] dark:text-[#F8FAFC]">
          {isEditing ? 'Edit Promotional Coupon' : 'Create Course Coupon'}
        </h2>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed mt-0.5">
          Define discount rules, validity dates, and usage limits for course checkouts.
        </p>
      </div>

      {/* Coupon Code & Auto-Generate */}
      <div className="space-y-1.5 min-w-0">
        <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
          Coupon Promo Code <span className="text-rose-500">*</span>
        </label>
        <div className="flex flex-col min-[360px]:flex-row gap-2 min-w-0">
          <input
            type="text"
            placeholder="e.g. WELCOME20"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={`w-full flex-1 h-11 sm:h-9 px-3 rounded-xl border font-mono font-semibold uppercase text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#0F172A] focus:outline-none min-h-[44px] sm:min-h-0 ${
              fieldErrors.code ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#CBD5E1] dark:border-[#334155] focus:border-[#2563EB]'
            }`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="w-full min-[360px]:w-auto min-[360px]:shrink-0 h-11 sm:h-9 min-h-[44px] sm:min-h-0 px-3.5 font-medium border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] rounded-xl justify-center"
            leftIcon={<Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#2563EB]" />}
          >
            {isGenerating ? 'Generating...' : 'Auto-Generate'}
          </Button>
        </div>
        {fieldErrors.code && <p className="text-xs text-rose-500 font-normal">{fieldErrors.code}</p>}
      </div>

      {/* Display Name & Description */}
      <div className="space-y-1.5 min-w-0">
        <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
          Coupon Name / Campaign Label
        </label>
        <input
          type="text"
          placeholder="e.g. Early Bird 20% Off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 sm:h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] min-h-[44px] sm:min-h-0"
        />
      </div>

      <div className="space-y-1.5 min-w-0">
        <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
          Description / Internal Note
        </label>
        <input
          type="text"
          placeholder="e.g. Applicable for Fall 2026 course batch checkouts"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-11 sm:h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] min-h-[44px] sm:min-h-0"
        />
      </div>

      {/* Discount Type & Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
            Discount Type
          </label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as any)}
            className="w-full h-11 sm:h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] min-h-[44px] sm:min-h-0 cursor-pointer"
          >
            <option value="PERCENTAGE">Percentage Discount (%)</option>
            <option value="FIXED_AMOUNT">Fixed Flat Amount (INR)</option>
          </select>
        </div>

        <div className="space-y-1.5 min-w-0">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
            Discount Value <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder={discountType === 'PERCENTAGE' ? '20' : '500'}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className={`w-full h-11 sm:h-9 px-3 rounded-xl border text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#0F172A] focus:outline-none min-h-[44px] sm:min-h-0 ${
              fieldErrors.discountValue ? 'border-rose-500' : 'border-[#CBD5E1] dark:border-[#334155] focus:border-[#2563EB]'
            }`}
          />
          {fieldErrors.discountValue && <p className="text-xs text-rose-500 font-normal">{fieldErrors.discountValue}</p>}
        </div>
      </div>

      {/* Max Discount & Min Order */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        {discountType === 'PERCENTAGE' && (
          <div className="space-y-1.5 min-w-0">
            <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
              Max Discount Cap (₹)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 1000"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value)}
              className="w-full h-11 sm:h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] min-h-[44px] sm:min-h-0"
            />
          </div>
        )}

        <div className="space-y-1.5 min-w-0">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
            Min Subtotal Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0"
            value={minimumOrderAmount}
            onChange={(e) => setMinimumOrderAmount(e.target.value)}
            className="w-full h-11 sm:h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] min-h-[44px] sm:min-h-0"
          />
        </div>
      </div>

      {/* Validity Window */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
            Start Date (Valid From)
          </label>
          <input
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            className="w-full h-11 sm:h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] min-h-[44px] sm:min-h-0"
          />
        </div>

        <div className="space-y-1.5 min-w-0">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
            End Date (Valid Until)
          </label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className={`w-full h-11 sm:h-9 px-3 rounded-xl border text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#0F172A] focus:outline-none min-h-[44px] sm:min-h-0 ${
              fieldErrors.validUntil ? 'border-rose-500' : 'border-[#CBD5E1] dark:border-[#334155] focus:border-[#2563EB]'
            }`}
          />
          {fieldErrors.validUntil && <p className="text-xs text-rose-500 font-normal">{fieldErrors.validUntil}</p>}
        </div>
      </div>

      {/* Usage Limits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
            Total Usage Limit (0 = Unlimited)
          </label>
          <input
            type="number"
            min="0"
            value={totalUsageLimit}
            onChange={(e) => setTotalUsageLimit(e.target.value)}
            className="w-full h-11 sm:h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] min-h-[44px] sm:min-h-0"
          />
        </div>

        <div className="space-y-1.5 min-w-0">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">
            Per-Student Limit
          </label>
          <input
            type="number"
            min="1"
            value={perUserUsageLimit}
            onChange={(e) => setPerUserUsageLimit(e.target.value)}
            className="w-full h-11 sm:h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] min-h-[44px] sm:min-h-0"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
        <span className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Coupon Status</span>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-[#2563EB] rounded accent-[#2563EB]"
          />
          <span>Active & Redeemable</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-[#E2E8F0] dark:border-[#263244] min-w-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:flex-1 h-11 sm:h-9 min-h-[44px] sm:min-h-0 font-medium border-[#CBD5E1] dark:border-[#334155] rounded-xl text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#172033] justify-center"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:flex-1 h-11 sm:h-9 min-h-[44px] sm:min-h-0 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl justify-center"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Coupon' : 'Save Coupon'}
        </Button>
      </div>
    </form>
  );
};
