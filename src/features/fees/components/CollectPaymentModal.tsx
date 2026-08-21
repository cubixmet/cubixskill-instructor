import React, { useState, useEffect } from 'react';
import { X, Wallet, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { courseFeesCollectionService, StudentFeeRecordItem } from '../../../services/courseFeesCollection.service';
import { StudentAvatar } from './StudentAvatar';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseUuid: string;
  studentRecord: StudentFeeRecordItem | null;
  onSuccess: () => void;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  isOpen,
  onClose,
  courseUuid,
  studentRecord,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [sendReceiptEmail, setSendReceiptEmail] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studentRecord) {
      if (studentRecord.balance > 0) {
        setAmount(String(studentRecord.balance));
      } else {
        setAmount('');
      }
      setReferenceNumber('');
      setNotes('');
    }
  }, [studentRecord]);

  if (!isOpen || !studentRecord) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !studentRecord.fee_account_id) return;

    setFieldErrors({});
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFieldErrors({ amount: 'Payment amount must be greater than 0.' });
      return;
    }

    if (numAmount > studentRecord.balance + 0.01) {
      setFieldErrors({ amount: `Payment amount cannot exceed outstanding balance (${studentRecord.currency} ${studentRecord.balance}).` });
      return;
    }

    setIsSubmitting(true);
    try {
      await courseFeesCollectionService.collectPayment(courseUuid, studentRecord.fee_account_id, {
        amount: numAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim(),
        notes: notes.trim(),
        send_receipt_email: sendReceiptEmail,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to collect payment:', err);
      const resData = err?.response?.data;
      if (resData && typeof resData === 'object') {
        const mapped: Record<string, string> = {};
        if (resData.amount) mapped.amount = Array.isArray(resData.amount) ? resData.amount[0] : String(resData.amount);
        if (resData.reference_number) mapped.referenceNumber = String(resData.reference_number);
        setFieldErrors(mapped);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xl max-w-md w-full p-5 space-y-4 font-sans text-xs text-slate-900 dark:text-white text-left font-normal">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-3">
          <div className="flex items-center gap-2.5">
            <StudentAvatar src={studentRecord.avatar_url} name={studentRecord.student_name} />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Record Fee Payment
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                {studentRecord.student_name} ({studentRecord.student_code})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account Balance Summary */}
        <div className="bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-normal uppercase block">Outstanding Balance</span>
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {studentRecord.currency} {studentRecord.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-normal uppercase block">Total Fee</span>
            <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
              {studentRecord.currency} {studentRecord.total_fee.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Payment Amount */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
              Payment Amount <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-normal text-slate-400">
                {studentRecord.currency === 'USD' ? '$' : '₹'}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={studentRecord.balance}
                placeholder="2000.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (fieldErrors.amount) setFieldErrors((prev) => ({ ...prev, amount: '' }));
                }}
                className={`w-full h-10 pl-8 pr-3 rounded-xl border text-xs font-normal text-slate-900 dark:text-white bg-white dark:bg-[#0F172A] focus:outline-none ${
                  fieldErrors.amount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-[#334155] focus:border-blue-500'
                }`}
              />
            </div>
            {fieldErrors.amount && <p className="text-[11px] text-rose-500 font-normal">{fieldErrors.amount}</p>}
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="UPI">UPI Payment</option>
                <option value="CASH">Cash Collection</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                <option value="CARD">Credit/Debit Card</option>
                <option value="CHEQUE">Cheque / Demand Draft</option>
                <option value="OTHER">Other Gateway / Manual</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Transaction / Reference ID */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
              Reference / Transaction ID
            </label>
            <input
              type="text"
              placeholder="e.g. UPI-38291039, TXN-928130"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-mono font-normal text-slate-900 dark:text-white"
            />
            {fieldErrors.referenceNumber && <p className="text-[11px] text-rose-500 font-normal">{fieldErrors.referenceNumber}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
              Payment Remarks / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Collected at front desk by Staff"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white"
            />
          </div>

          {/* Email Receipt Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-[#263244]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="text-xs font-medium text-slate-900 dark:text-white block">Send Receipt Email</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Send official PDF receipt to {studentRecord.student_email}</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendReceiptEmail}
              onChange={(e) => setSendReceiptEmail(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-[#263244]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl justify-center font-normal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl justify-center font-normal"
            >
              {isSubmitting ? 'Recording...' : 'Collect & Generate Receipt'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
