import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Percent, Calendar, AlertCircle } from 'lucide-react';
import { CouponFormData, CouponFormErrors } from '../types/coupon.types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCourseStore } from '../../courses/store/course.store';
import { useCouponStore } from '../store/coupon.store';
import { AppUnsavedChangesDialog } from '../../../components/ui/app-dialogs/AppUnsavedChangesDialog';

interface CouponFormProps {
  initialValues?: Partial<CouponFormData>;
  editingCouponId?: string;
  courseIdContext?: string;
  onSubmit: (formData: CouponFormData) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  submittingText?: string;
  apiError?: string | null;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  initialValues,
  editingCouponId,
  courseIdContext,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Create Coupon',
  submittingText = 'Creating Coupon...',
  apiError = null,
}) => {
  const navigate = useNavigate();
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);
  const isCodeTaken = useCouponStore((state) => state.isCodeTaken);

  const coursesList = Object.values(coursesByUuid);

  // Form Initial State
  const defaultState: CouponFormData = {
    code: initialValues?.code || '',
    discountType: initialValues?.discountType || 'percentage',
    discountValue: initialValues?.discountValue ?? '',
    currency: initialValues?.currency || 'INR',
    courseScope: courseIdContext || initialValues?.courseScope || 'all',
    validFrom: initialValues?.validFrom || '',
    expiryDate: initialValues?.expiryDate || '',
    usageLimit: initialValues?.usageLimit ?? '',
    perStudentLimit: initialValues?.perStudentLimit ?? 1,
    status: initialValues?.status || 'active',
  };

  const [formData, setFormData] = useState<CouponFormData>(defaultState);
  const [errors, setErrors] = useState<CouponFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // References for focusing invalid fields
  const codeRef = useRef<HTMLInputElement>(null);
  const discountValRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const usageLimitRef = useRef<HTMLInputElement>(null);
  const perStudentLimitRef = useRef<HTMLInputElement>(null);

  // Track Form Dirtiness
  const updateField = <K extends keyof CouponFormData>(field: K, value: CouponFormData[K]) => {
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validation Engine
  const validateForm = (data: CouponFormData): { isValid: boolean; newErrors: CouponFormErrors } => {
    const newErrors: CouponFormErrors = {};

    // 1. Coupon Code Validation
    const cleanCode = data.code.trim().toUpperCase();
    if (!cleanCode) {
      newErrors.code = 'Coupon code is required.';
    } else if (cleanCode.length < 3) {
      newErrors.code = 'Coupon code must be at least 3 characters.';
    } else if (isCodeTaken(cleanCode, editingCouponId)) {
      newErrors.code = `Coupon code "${cleanCode}" already exists. Please enter a unique code.`;
    }

    // 2. Discount Value Validation
    const dVal = Number(data.discountValue);
    if (data.discountValue === '' || isNaN(dVal)) {
      newErrors.discountValue = 'Discount value is required.';
    } else if (dVal <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0.';
    } else if (data.discountType === 'percentage' && dVal > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%.';
    }

    // 3. Expiry Date Validation
    if (data.validFrom && data.expiryDate) {
      const start = new Date(data.validFrom).getTime();
      const end = new Date(data.expiryDate).getTime();
      if (end < start) {
        newErrors.expiryDate = 'Expiry date cannot be before Valid From start date.';
      }
    }

    // 4. Usage Limit Validation
    if (data.usageLimit !== '' && data.usageLimit !== null && data.usageLimit !== undefined) {
      const uLim = Number(data.usageLimit);
      if (isNaN(uLim) || uLim < 0) {
        newErrors.usageLimit = 'Usage limit cannot be negative.';
      }
    }

    // 5. Per-Student Limit Validation
    if (data.perStudentLimit !== '' && data.perStudentLimit !== null && data.perStudentLimit !== undefined) {
      const pLim = Number(data.perStudentLimit);
      if (isNaN(pLim) || pLim < 1) {
        newErrors.perStudentLimit = 'Per-student usage limit must be at least 1.';
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      newErrors,
    };
  };

  const handleBlur = (field: keyof CouponFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const { newErrors } = validateForm(formData);
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Mark all fields as touched
    setTouched({
      code: true,
      discountType: true,
      discountValue: true,
      courseScope: true,
      validFrom: true,
      expiryDate: true,
      usageLimit: true,
      perStudentLimit: true,
      status: true,
    });

    const { isValid, newErrors } = validateForm(formData);
    setErrors(newErrors);

    if (!isValid) {
      // Focus & Scroll to the first field with an error
      const firstErrorKey = Object.keys(newErrors)[0] as keyof CouponFormErrors;
      if (firstErrorKey === 'code' && codeRef.current) {
        codeRef.current.focus();
        codeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstErrorKey === 'discountValue' && discountValRef.current) {
        discountValRef.current.focus();
        discountValRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstErrorKey === 'expiryDate' && expiryDateRef.current) {
        expiryDateRef.current.focus();
        expiryDateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstErrorKey === 'usageLimit' && usageLimitRef.current) {
        usageLimitRef.current.focus();
        usageLimitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstErrorKey === 'perStudentLimit' && perStudentLimitRef.current) {
        perStudentLimitRef.current.focus();
        perStudentLimitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    await onSubmit(formData);
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      executeCancel();
    }
  };

  const executeCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (courseIdContext) {
      navigate(`/courses/${courseIdContext}/coupons`);
    } else {
      navigate('/coupons');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="font-sans text-left space-y-4 sm:space-y-5 pb-28 sm:pb-6">
      {/* API Submission Error Banner */}
      {apiError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* 1. Coupon Code */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        <div>
          <Input
            ref={codeRef}
            id="couponCodeInput"
            label="Coupon Code *"
            placeholder="SUMMER25"
            value={formData.code}
            onChange={(e) =>
              updateField('code', e.target.value.toUpperCase().replace(/\s+/g, ''))
            }
            onBlur={() => handleBlur('code')}
            error={touched.code ? errors.code : undefined}
            leftIcon={<Ticket className="w-4 h-4 text-slate-400" />}
            helperText="Code is uppercase only (e.g. SUMMER25)."
            className="font-mono uppercase tracking-wider font-bold text-slate-900"
          />
        </div>

        {/* 2. Discount Type Selector */}
        <div>
          <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">
            Discount Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => updateField('discountType', 'percentage')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left w-full ${
                formData.discountType === 'percentage'
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 flex items-center justify-center w-8 h-8 ${
                  formData.discountType === 'percentage'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Percent className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs sm:text-sm text-slate-900">Percentage</div>
                <div className="text-[11px] text-slate-500">Discount by % (e.g. 25%)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateField('discountType', 'fixed')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left w-full ${
                formData.discountType === 'fixed'
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 flex items-center justify-center w-8 h-8 font-bold text-sm ${
                  formData.discountType === 'fixed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                ₹
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs sm:text-sm text-slate-900">Fixed Amount</div>
                <div className="text-[11px] text-slate-500">Flat price deduction in INR (e.g. ₹500)</div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Discount Value Input */}
        <div>
          <Input
            ref={discountValRef}
            id="discountValueInput"
            label={`Discount Value (${formData.discountType === 'percentage' ? '%' : '₹'}) *`}
            type="number"
            placeholder={formData.discountType === 'percentage' ? '25' : '500'}
            value={formData.discountValue}
            onChange={(e) =>
              updateField('discountValue', e.target.value === '' ? '' : Number(e.target.value))
            }
            onBlur={() => handleBlur('discountValue')}
            error={touched.discountValue ? errors.discountValue : undefined}
            leftIcon={
              formData.discountType === 'percentage' ? (
                <Percent className="w-4 h-4 text-slate-400" />
              ) : (
                <span className="font-bold text-sm text-slate-600 select-none">₹</span>
              )
            }
          />
        </div>
      </div>

      {/* 4. Applicable Course / Scope */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        <div>
          <label htmlFor="courseScopeSelect" className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">
            Applicable Course / Scope *
          </label>
          <select
            id="courseScopeSelect"
            value={formData.courseScope}
            onChange={(e) => updateField('courseScope', e.target.value)}
            disabled={Boolean(courseIdContext)}
            className="w-full h-[48px] px-3.5 text-[14px] bg-white border border-slate-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium text-slate-900 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="all">All Courses (Global Platform Scope)</option>
            {coursesList.map((course) => (
              <option key={course.uuid} value={course.uuid}>
                {course.title}
              </option>
            ))}
          </select>
          {courseIdContext && (
            <p className="text-[11px] text-slate-500 mt-1">
              Course scope is preset to this specific course.
            </p>
          )}
        </div>

        {/* 5 & 6. Date Fields: Valid From & Expiry Date (Stacked 1-column on mobile, side-by-side on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <Input
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) => updateField('validFrom', e.target.value)}
              onBlur={() => handleBlur('validFrom')}
              error={touched.validFrom ? errors.validFrom : undefined}
              leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
              helperText="Optional start date"
            />
          </div>

          <div>
            <Input
              ref={expiryDateRef}
              label="Expiry Date"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => updateField('expiryDate', e.target.value)}
              onBlur={() => handleBlur('expiryDate')}
              error={touched.expiryDate ? errors.expiryDate : undefined}
              leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
              helperText="Optional expiration date"
            />
          </div>
        </div>

        {/* 7 & 8. Usage Limits (Stacked 1-column on mobile, 2-column on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <Input
              ref={usageLimitRef}
              label="Usage Limit"
              type="number"
              placeholder="e.g. 100 (Optional)"
              value={formData.usageLimit ?? ''}
              onChange={(e) =>
                updateField('usageLimit', e.target.value === '' ? '' : Number(e.target.value))
              }
              onBlur={() => handleBlur('usageLimit')}
              error={touched.usageLimit ? errors.usageLimit : undefined}
              helperText="Leave blank for unlimited usage."
            />
          </div>

          <div>
            <Input
              ref={perStudentLimitRef}
              label="Per-Student Usage Limit"
              type="number"
              placeholder="e.g. 1 (Optional)"
              value={formData.perStudentLimit ?? 1}
              onChange={(e) =>
                updateField('perStudentLimit', e.target.value === '' ? '' : Number(e.target.value))
              }
              onBlur={() => handleBlur('perStudentLimit')}
              error={touched.perStudentLimit ? errors.perStudentLimit : undefined}
              helperText="Redemptions allowed per student (default 1)."
            />
          </div>
        </div>

        {/* 9. Status Selector */}
        <div>
          <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">
            Status *
          </label>
          <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="couponStatusRadio"
                checked={formData.status === 'active'}
                onChange={() => updateField('status', 'active')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800">Active</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="couponStatusRadio"
                checked={formData.status === 'inactive'}
                onChange={() => updateField('status', 'inactive')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800">Inactive</span>
            </label>
          </div>
        </div>
      </div>

      {/* 10. Sticky Mobile & Desktop Action Bar (Sits ABOVE mobile bottom navigation) */}
      <div className="fixed sm:static bottom-16 sm:bottom-0 left-0 right-0 z-30 bg-white border-t sm:border-t-0 border-slate-200 p-3 sm:p-0 shadow-lg sm:shadow-none flex items-center justify-end gap-2.5 pb-safe">
        <div className="w-full sm:w-auto flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCancelClick}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            loadingText={submittingText}
            className="flex-1 sm:flex-initial min-w-[140px]"
          >
            {submitButtonText}
          </Button>
        </div>
      </div>

      {/* Discard Unsaved Changes Dialog */}
      <AppUnsavedChangesDialog
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirmDiscard={() => {
          setShowDiscardModal(false);
          executeCancel();
        }}
      />
    </form>
  );
};
