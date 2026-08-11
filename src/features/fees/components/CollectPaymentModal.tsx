import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useFeesStore, PaymentMethod, StudentFeeRecord } from '../store/fees.store';
import { Wallet, CheckCircle2 } from 'lucide-react';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentFeeRecord | null;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const collectPayment = useFeesStore((s) => s.collectPayment);

  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceId, setReferenceId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [prevRecord, setPrevRecord] = useState<StudentFeeRecord | null>(record);
  if (record !== prevRecord) {
    setPrevRecord(record);
    setAmount(record ? record.pendingINR : 0);
    setIsSuccess(false);
  }

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    collectPayment({
      studentId: record.studentId,
      courseUuid: record.courseUuid,
      amountINR: Number(amount),
      paymentDate,
      paymentMethod,
      referenceId: referenceId.trim() || undefined,
      notes: notes.trim() || undefined,
      recordedBy: 'Instructor Admin',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Collect Fee Payment"
      subtitle={`Recording payment for ${record.studentName}`}
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3 font-sans">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
          <h3 className="text-sm font-medium text-slate-900">Payment Recorded Successfully!</h3>
          <p className="text-xs text-slate-500 font-normal">
            Updated ₹{amount.toLocaleString('en-IN')} for {record.studentName}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs text-slate-900 text-left">
          {/* Summary Box */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-normal block">Course</span>
              <span className="font-medium text-slate-900 truncate block">{record.courseTitle}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-normal block">Pending Balance</span>
              <span className="font-medium text-amber-600 block">₹{record.pendingINR.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Amount (₹)</label>
            <Input
              type="number"
              min={1}
              max={record.pendingINR}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-white border-slate-200 font-medium text-xs h-10"
              required
            />
          </div>

          {/* Date & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Payment Date</label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="bg-white border-slate-200 font-normal text-xs h-10"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Razorpay">Razorpay Online</option>
                <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                <option value="Cash">Cash Collection</option>
                <option value="Cheque">Cheque</option>
                <option value="Stripe">Stripe Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Reference ID */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Reference / Txn ID (Optional)</label>
            <Input
              placeholder="e.g. UPI-9988223311 or Check No"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="bg-white border-slate-200 font-normal text-xs h-10"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Notes / Waiver Remarks</label>
            <textarea
              rows={2}
              placeholder="Any comments regarding installment or waiving..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-normal focus:outline-none focus:border-blue-500 resize-none bg-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="font-medium h-9 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" size="sm" leftIcon={<Wallet className="w-3.5 h-3.5" />} className="font-medium h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirm Payment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
