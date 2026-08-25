import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { courseFeesCollectionService, CourseFeeConfigurationData } from '../../../services/courseFeesCollection.service';

interface ConfigureFeePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseUuid: string;
  existingConfig: CourseFeeConfigurationData | null;
  onSuccess: () => void;
}

export const ConfigureFeePlanModal: React.FC<ConfigureFeePlanModalProps> = ({
  isOpen,
  onClose,
  courseUuid,
  existingConfig,
  onSuccess,
}) => {
  const [planType, setPlanType] = useState<string>('MONTHLY');
  const [totalFeeAmount, setTotalFeeAmount] = useState<string>('12000');
  const [currency, setCurrency] = useState<string>('INR');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(6);
  const [notes, setNotes] = useState<string>('');

  const [customInstallments, setCustomInstallments] = useState<Array<{ label: string; due_date: string; amount: string }>>([
    { label: 'Admission Fee', due_date: new Date().toISOString().split('T')[0], amount: '6000' },
    { label: 'Final Installment', due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: '6000' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingConfig && existingConfig.is_configured) {
      if (existingConfig.plan_type) setPlanType(existingConfig.plan_type);
      if (existingConfig.total_fee) setTotalFeeAmount(String(existingConfig.total_fee));
      if (existingConfig.currency) setCurrency(existingConfig.currency);
      if (existingConfig.number_of_installments) setNumberOfInstallments(existingConfig.number_of_installments);
      if (existingConfig.start_date) setStartDate(existingConfig.start_date);
      if (existingConfig.notes) setNotes(existingConfig.notes);
      if (existingConfig.custom_installments && existingConfig.custom_installments.length > 0) {
        setCustomInstallments(existingConfig.custom_installments.map(r => ({
          label: r.label || 'Installment',
          due_date: r.due_date,
          amount: String(r.amount)
        })));
      }
    }
  }, [existingConfig]);

  if (!isOpen) return null;

  const handleAddCustomRow = () => {
    setCustomInstallments((prev) => [
      ...prev,
      { label: `Installment ${prev.length + 1}`, due_date: new Date().toISOString().split('T')[0], amount: '1000' },
    ]);
  };

  const handleRemoveCustomRow = (index: number) => {
    setCustomInstallments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCustomRowChange = (index: number, field: string, val: string) => {
    setCustomInstallments((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    const totalFeeNum = parseFloat(totalFeeAmount);
    if (isNaN(totalFeeNum) || totalFeeNum <= 0) {
      setFieldErrors({ totalFee: 'Total fee amount must be greater than 0.' });
      return;
    }

    let parsedCustom = undefined;
    if (planType === 'CUSTOM') {
      const sumCustom = customInstallments.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
      if (Math.abs(sumCustom - totalFeeNum) > 0.01) {
        setFieldErrors({ custom: `Sum of custom installments (${sumCustom}) must equal total fee (${totalFeeNum}).` });
        return;
      }
      parsedCustom = customInstallments.map((r) => ({
        label: r.label,
        due_date: r.due_date,
        amount: parseFloat(r.amount) || 0,
      }));
    }

    setIsSubmitting(true);
    try {
      await courseFeesCollectionService.saveCourseFeeConfiguration(courseUuid, {
        student_id: '',
        plan_type: planType,
        total_fee_amount: totalFeeNum,
        start_date: startDate,
        currency,
        number_of_installments: numberOfInstallments,
        custom_installments: parsedCustom,
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save course fee configuration:', err);
      const resData = err?.response?.data;
      if (resData && typeof resData === 'object') {
        const mapped: Record<string, string> = {};
        if (resData.total_fee_amount) mapped.totalFee = String(resData.total_fee_amount);
        if (resData.custom_installments) mapped.custom = String(resData.custom_installments);
        setFieldErrors(mapped);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xl max-w-md w-full p-4 sm:p-5 space-y-4 font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] text-left max-h-[90vh] overflow-y-auto font-normal min-w-0">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
          <div>
            <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
              {existingConfig?.is_configured ? 'Edit Course Fee Configuration' : 'Configure Course Fee'}
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal">
              Applies default fee plan to all eligible enrolled students
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] p-1 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Plan Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
              Fee Plan Structure
            </label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full h-9.5 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="ONE_TIME">One-Time Lump Sum</option>
              <option value="MONTHLY">Monthly Installments</option>
              <option value="WEEKLY">Weekly Installments</option>
              <option value="QUARTERLY">Quarterly Installments</option>
              <option value="HALF_YEARLY">Half-Yearly Installments</option>
              <option value="YEARLY">Yearly Installments</option>
              <option value="CUSTOM">Custom Schedule</option>
            </select>
          </div>

          {/* Total Fee & Currency */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
                Total Fee Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={totalFeeAmount}
                onChange={(e) => setTotalFeeAmount(e.target.value)}
                className={`w-full h-9.5 px-3 rounded-xl border text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#0F172A] focus:outline-none ${
                  fieldErrors.totalFee ? 'border-rose-500' : 'border-[#CBD5E1] dark:border-[#334155] focus:border-[#3B82F6]'
                }`}
              />
              {fieldErrors.totalFee && <p className="text-[10px] text-rose-500 font-normal">{fieldErrors.totalFee}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-9.5 px-2 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED</option>
              </select>
            </div>
          </div>

          {/* Start Date & Installment Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
                First Due Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-9.5 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            {planType !== 'ONE_TIME' && planType !== 'CUSTOM' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
                  Installments
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={numberOfInstallments}
                  onChange={(e) => setNumberOfInstallments(parseInt(e.target.value) || 1)}
                  className="w-full h-9.5 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
            )}
          </div>

          {/* CUSTOM INSTALLMENTS EDITOR */}
          {planType === 'CUSTOM' && (
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
                  Custom Installment Schedule
                </label>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={handleAddCustomRow}
                  leftIcon={<Plus className="w-3 h-3" />}
                  className="border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033]"
                >
                  Add Row
                </Button>
              </div>

              {customInstallments.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={row.label}
                    onChange={(e) => handleCustomRowChange(idx, 'label', e.target.value)}
                    className="flex-1 h-8.5 px-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                  <input
                    type="date"
                    value={row.due_date}
                    onChange={(e) => handleCustomRowChange(idx, 'due_date', e.target.value)}
                    className="w-28 h-8.5 px-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(e) => handleCustomRowChange(idx, 'amount', e.target.value)}
                    className="w-20 h-8.5 px-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                  {customInstallments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomRow(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {fieldErrors.custom && <p className="text-[11px] text-rose-500 font-normal">{fieldErrors.custom}</p>}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
              Configuration Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Approved fee structure for Fall batch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto flex-1 h-9.5 rounded-xl justify-center font-medium border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex-1 h-9.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl justify-center font-medium min-h-[42px]"
            >
              {isSubmitting ? 'Applying Plan...' : 'Save & Apply to All Students'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
