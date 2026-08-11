import React from 'react';
import { CreditCard, Download, CheckCircle2 } from 'lucide-react';
import type { TransactionItem } from '../types/dashboard.types';
import { formatCurrency } from '../../../utils/currency';

interface RecentTransactionsWidgetProps {
  transactions: TransactionItem[];
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs text-left transition-all">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight">
            Recent Credit & Billing Transactions
          </h3>
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B]">
            Invoices, credit top-ups, subscriptions, and billing history
          </p>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="p-3 sm:p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all"
          >
            {/* Left Info */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[#0F172A] truncate leading-snug">{tx.type}</h4>
                <p className="text-[11px] text-[#64748B] font-medium truncate">
                  {tx.date} &bull; {tx.credits ? `${tx.credits} Credits` : 'Billing Invoice'}
                </p>
              </div>
            </div>

            {/* Right Status & Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <div className="text-left sm:text-right min-w-0">
                <p className="font-extrabold text-[#0F172A] text-xs sm:text-sm">
                  {formatCurrency(tx.amount)}
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#16A34A]">
                  <CheckCircle2 className="w-2.5 h-2.5" /> {tx.status}
                </span>
              </div>

              <a
                href={tx.invoiceUrl || '#'}
                className="p-2 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors shrink-0 flex items-center justify-center min-h-[36px] min-w-[36px]"
                title="Download Invoice PDF"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
