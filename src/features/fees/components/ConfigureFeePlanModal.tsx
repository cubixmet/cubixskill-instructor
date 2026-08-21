import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Layers, Plus, Trash2, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xl max-w-md w-full p-5 space-y-4 font-sans text-xs text-slate-900 dark:text-white text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-3">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              {existingConfig?.is_configured ? 'Edit Course Fee Configuration' : 'Configure Course Fee'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              Applies default fee plan to all eligible enrolled students
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Plan Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
              Fee Plan Structure
            </label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                Total Fee Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={totalFeeAmount}
                onChange={(e) => setTotalFeeAmount(e.target.value)}
                className={`w-full h-9 px-3 rounded-xl border text-xs font-normal text-slate-900 dark:text-white bg-white dark:bg-[#0F172A] focus:outline-none ${
                  fieldErrors.totalFee ? 'border-rose-500' : 'border-slate-200 dark:border-[#334155] focus:border-blue-500'
                }`}
              />
              {fieldErrors.totalFee && <p className="text-[10px] text-rose-500 font-normal">{fieldErrors.totalFee}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                First Due Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {planType !== 'ONE_TIME' && planType !== 'CUSTOM' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Installments
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={numberOfInstallments}
                  onChange={(e) => setNumberOfInstallments(parseInt(e.target.value) || 1)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* CUSTOM INSTALLMENTS EDITOR */}
          {planType === 'CUSTOM' && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#263244]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Custom Installment Schedule
                </label>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={handleAddCustomRow}
                  leftIcon={<Plus className="w-3 h-3" />}
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
                    className="flex-1 h-8 px-2 rounded-lg border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal"
                  />
                  <input
                    type="date"
                    value={row.due_date}
                    onChange={(e) => handleCustomRowChange(idx, 'due_date', e.target.value)}
                    className="w-28 h-8 px-2 rounded-lg border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(e) => handleCustomRowChange(idx, 'amount', e.target.value)}
                    className="w-20 h-8 px-2 rounded-lg border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal"
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
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
              Configuration Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Approved fee structure for Fall batch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-8 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-[#263244]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-9 rounded-xl justify-center font-normal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl justify-center font-normal"
            >
              {isSubmitting ? 'Applying Plan...' : 'Save & Apply to All Students'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
