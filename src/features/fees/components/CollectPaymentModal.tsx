import React, { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';
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
  const [collectionMode, setCollectionMode] = useState<string>('DIRECT_ACADEMY');
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
        collection_mode: collectionMode,
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xl max-w-md w-full p-4 sm:p-5 space-y-4 font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] text-left font-normal max-h-[90vh] overflow-y-auto min-w-0">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <StudentAvatar src={studentRecord.avatar_url} name={studentRecord.student_name} />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC] truncate">
                Record Fee Payment
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate">
                {studentRecord.student_name} ({studentRecord.student_code})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] p-1 cursor-pointer shrink-0 rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account Balance Summary */}
        <div className="bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase block">Outstanding Balance</span>
            <span className="text-sm font-semibold text-amber-600 dark:text-[#F59E0B]">
              {studentRecord.currency} {studentRecord.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase block">Total Course Fee</span>
            <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              {studentRecord.currency} {studentRecord.total_fee.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Payment Amount */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
              Payment Amount <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-xl overflow-hidden border border-[#CBD5E1] dark:border-[#334155] focus-within:border-[#3B82F6]">
              <span className="bg-slate-100 dark:bg-[#172033] px-3 flex items-center font-medium text-[#475569] dark:text-[#CBD5E1] border-r border-[#CBD5E1] dark:border-[#334155] shrink-0">
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
                className="w-full h-11 sm:h-10 px-3 border-none text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#0F172A] focus:outline-none min-h-[44px] sm:min-h-0"
              />
            </div>
            {fieldErrors.amount && <p className="text-[11px] text-rose-500 font-normal">{fieldErrors.amount}</p>}
          </div>

          {/* Collection Mode & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
                Collection Mode
              </label>
              <select
                value={collectionMode}
                onChange={(e) => setCollectionMode(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] min-h-[44px] sm:min-h-0"
              >
                <option value="DIRECT_ACADEMY">Direct Academy (UPI/Bank/Cash)</option>
                <option value="CUBIXSKILL_GATEWAY">CubixSkill Platform Gateway</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] min-h-[44px] sm:min-h-0"
              >
                <option value="UPI">UPI Payment</option>
                <option value="CASH">Cash Collection</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                <option value="CARD">Credit/Debit Card</option>
                <option value="OTHER">Other Gateway / Manual</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
              Payment Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full h-11 sm:h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] min-h-[44px] sm:min-h-0"
            />
          </div>

          {/* Transaction / Reference ID */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
              Reference / Transaction ID
            </label>
            <input
              type="text"
              placeholder="e.g. UPI-38291039, TXN-928130"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full h-11 sm:h-9.5 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-mono font-normal text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] min-h-[44px] sm:min-h-0"
            />
            {fieldErrors.referenceNumber && <p className="text-[11px] text-rose-500 font-normal">{fieldErrors.referenceNumber}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] block">
              Payment Remarks / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Collected at front desk by Staff"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-11 sm:h-9.5 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] min-h-[44px] sm:min-h-0"
            />
          </div>

          {/* Email Receipt Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-[rgba(37,99,235,0.12)] rounded-xl border border-blue-100 dark:border-[rgba(59,130,246,0.18)]">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] block">Send Receipt Email</span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate block">Send official PDF receipt to {studentRecord.student_email}</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendReceiptEmail}
              onChange={(e) => setSendReceiptEmail(e.target.checked)}
              className="w-5 h-5 sm:w-4 sm:h-4 text-[#2563EB] rounded cursor-pointer shrink-0 min-h-[24px]"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto flex-1 h-11 sm:h-10 min-h-[44px] sm:min-h-0 rounded-xl justify-center font-medium border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#172033]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex-1 h-11 sm:h-10 min-h-[44px] sm:min-h-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl justify-center font-medium"
            >
              {isSubmitting ? 'Recording...' : 'Collect & Generate Receipt'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
