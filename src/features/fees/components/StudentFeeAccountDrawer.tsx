import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, DollarSign, Wallet, History, AlertCircle, CheckCircle2, Gift, Send, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { courseFeesCollectionService, StudentFeeAccountDetail } from '../../../services/courseFeesCollection.service';
import { StudentAvatar } from './StudentAvatar';

interface StudentFeeAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courseUuid: string;
  accountId: string | null;
  onCollectPaymentClick: () => void;
  onRefreshParent: () => void;
}

export const StudentFeeAccountDrawer: React.FC<StudentFeeAccountDrawerProps> = ({
  isOpen,
  onClose,
  courseUuid,
  accountId,
  onCollectPaymentClick,
  onRefreshParent,
}) => {
  const [detail, setDetail] = useState<StudentFeeAccountDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'waiver'>('schedule');

  // Waiver / Override Form State
  const [waiverAmount, setWaiverAmount] = useState<string>('');
  const [waiverReason, setWaiverReason] = useState<string>('');
  const [isWaiving, setIsWaiving] = useState<boolean>(false);
  const [waiverError, setWaiverError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!accountId) return;
    setIsLoading(true);
    try {
      const data = await courseFeesCollectionService.getAccountDetail(courseUuid, accountId);
      setDetail(data);
    } catch (err: any) {
      console.error('Failed to fetch account detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseUuid, accountId]);

  useEffect(() => {
    if (isOpen && accountId) {
      fetchDetail();
    }
  }, [isOpen, accountId, fetchDetail]);

  if (!isOpen || !accountId) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyWaiver = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaiverError(null);

    const wAmt = parseFloat(waiverAmount);
    if (isNaN(wAmt) || wAmt <= 0) {
      setWaiverError('Waiver amount must be greater than 0.');
      return;
    }

    if (detail && wAmt > detail.balance) {
      setWaiverError(`Waiver amount cannot exceed outstanding balance (${detail.currency} ${detail.balance}).`);
      return;
    }

    setIsWaiving(true);
    try {
      await courseFeesCollectionService.waiveFee(courseUuid, accountId, {
        amount: wAmt,
        reason: waiverReason.trim(),
      });
      showToast('Fee override / waiver applied successfully.');
      setWaiverAmount('');
      setWaiverReason('');
      fetchDetail();
      onRefreshParent();
    } catch (err: any) {
      console.error('Waiver error:', err);
      setWaiverError('Failed to apply fee waiver.');
    } finally {
      setIsWaiving(false);
    }
  };

  const handleSendReminder = async () => {
    try {
      await courseFeesCollectionService.sendReminder(courseUuid, accountId, { send_email: true });
      showToast('Fee reminder notification and email sent.');
    } catch (err: any) {
      console.error('Reminder error:', err);
      showToast('Failed to send reminder.');
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-normal bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200">Paid</span>;
      case 'PARTIAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-normal bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200">Partial</span>;
      case 'OVERDUE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-normal bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200">Overdue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-normal bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200">Pending</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-[#111827] w-full max-w-lg h-full border-l border-slate-200 dark:border-[#263244] shadow-2xl flex flex-col font-sans text-xs text-slate-900 dark:text-white text-left font-normal">
        {/* Toast Overlay */}
        {toastMessage && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-emerald-600 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-bounce">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-[#263244] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <StudentAvatar name={detail?.student_name} />
            <div>
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                Student Fee Account Drawer
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                {detail?.student_name} ({detail?.student_code})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {isLoading ? (
          <div className="p-6 space-y-4 flex-1">
            <div className="h-20 bg-slate-100 dark:bg-[#0F172A] rounded-xl animate-pulse" />
            <div className="h-40 bg-slate-100 dark:bg-[#0F172A] rounded-xl animate-pulse" />
          </div>
        ) : detail ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-normal">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
                <span className="text-[10px] text-slate-500 font-normal uppercase block">Total Fee</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {detail.currency} {detail.effective_fee_amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
                <span className="text-[10px] text-emerald-600 font-normal uppercase block">Total Paid</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {detail.currency} {detail.total_paid.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
                <span className="text-[10px] text-amber-600 font-normal uppercase block">Balance</span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {detail.currency} {detail.balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex items-center gap-2">
              {detail.balance > 0 && (
                <Button
                  size="sm"
                  onClick={onCollectPaymentClick}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-normal h-9 rounded-xl justify-center"
                  leftIcon={<Wallet className="w-4 h-4" />}
                >
                  Collect Payment
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendReminder}
                className="font-normal h-9 rounded-xl border-slate-200 dark:border-[#334155]"
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Reminder
              </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-[#263244]">
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`py-2 px-3 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'schedule'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Installments ({detail.installments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`py-2 px-3 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Receipt Ledger ({detail.payments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('waiver')}
                className={`py-2 px-3 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'waiver'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Override & Waivers
              </button>
            </div>

            {/* TAB 1: INSTALLMENT SCHEDULE */}
            {activeTab === 'schedule' && (
              <div className="space-y-2 font-normal">
                {detail.installments.length === 0 ? (
                  <p className="text-center text-slate-400 py-6 font-normal">No installment schedule generated yet.</p>
                ) : (
                  detail.installments.map((inst) => (
                    <div
                      key={inst.id}
                      className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-normal text-slate-900 dark:text-white block">{inst.label}</span>
                        <span className="text-[10px] text-slate-500 block">Due: {inst.due_date}</span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="font-normal text-slate-900 dark:text-white block">
                          {detail.currency} {inst.amount.toLocaleString('en-IN')}
                        </span>
                        {getStatusBadge(inst.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: PAYMENT HISTORY LEDGER */}
            {activeTab === 'history' && (
              <div className="space-y-2 font-normal">
                {detail.payments.length === 0 ? (
                  <p className="text-center text-slate-400 py-6 font-normal">No payments recorded for this account yet.</p>
                ) : (
                  detail.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] space-y-1 font-normal"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-normal text-emerald-600 dark:text-emerald-400 text-xs">
                          {detail.currency} {p.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="bg-slate-200 dark:bg-[#1E293B] font-mono text-[10px] px-2 py-0.5 rounded font-normal">
                          {p.receipt_number}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Method: {p.payment_method}</span>
                        <span>Date: {p.payment_date}</span>
                      </div>
                      {p.reference_number && (
                        <p className="text-[10px] font-mono text-slate-400">Ref: {p.reference_number}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: WAIVERS & ADJUSTMENTS */}
            {activeTab === 'waiver' && (
              <div className="space-y-4 font-normal">
                <form onSubmit={handleApplyWaiver} className="bg-slate-50 dark:bg-[#0F172A] p-3.5 rounded-xl border border-slate-200 dark:border-[#334155] space-y-3">
                  <span className="font-medium text-xs text-slate-900 dark:text-white block">Student Fee Override / Waiver</span>
                  <div className="space-y-1">
                    <label className="text-[11px] font-normal text-slate-700 dark:text-slate-300 block">Waiver Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      value={waiverAmount}
                      onChange={(e) => setWaiverAmount(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#172033] text-xs font-normal"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-normal text-slate-700 dark:text-slate-300 block">Reason / Approval</label>
                    <input
                      type="text"
                      placeholder="e.g. Scholarship reduction approved by Dean"
                      value={waiverReason}
                      onChange={(e) => setWaiverReason(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#172033] text-xs font-normal"
                    />
                  </div>
                  {waiverError && <p className="text-[11px] text-rose-500 font-normal">{waiverError}</p>}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isWaiving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-normal h-9 rounded-lg justify-center"
                  >
                    {isWaiving ? 'Applying Waiver...' : 'Apply Student Override Waiver'}
                  </Button>
                </form>

                {/* Adjustments History */}
                <div className="space-y-2">
                  <span className="font-medium text-xs text-slate-700 dark:text-slate-300 block">Override Log</span>
                  {detail.adjustments.length === 0 ? (
                    <p className="text-center text-slate-400 py-3 font-normal">No student waivers or adjustments applied.</p>
                  ) : (
                    detail.adjustments.map((adj) => (
                      <div key={adj.id} className="p-2.5 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] text-[11px]">
                        <div className="flex justify-between font-normal text-indigo-600 dark:text-indigo-400">
                          <span>{adj.adjustment_type}</span>
                          <span>{detail.currency} {adj.amount.toLocaleString('en-IN')}</span>
                        </div>
                        {adj.reason && <p className="text-slate-500 italic mt-0.5">"{adj.reason}"</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
