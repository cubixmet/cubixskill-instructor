import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RecentOrderItem } from '../types/dashboard.types';

interface RecentOrdersProps {
  orders: RecentOrderItem[];
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#0F172A]">Recent Orders</h3>
          <p className="text-xs text-[#64748B]">Recent student purchase transactions</p>
        </div>
        <Link to="/payments" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
          View All Orders <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {orders.map((ord) => (
          <div key={ord.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#2563EB]">{ord.id}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                  ord.status === 'Paid'
                    ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                    : ord.status === 'Pending'
                    ? 'bg-[#FFFBEB] text-[#F59E0B] border border-[#FDE68A]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                }`}
              >
                {ord.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#0F172A] block">{ord.student}</span>
                <span className="text-[11px] text-[#64748B] block truncate max-w-[200px]">{ord.course}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-[#0F172A] block">₹{ord.amount.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-[#94A3B8] block">{ord.paymentMethod} &bull; {ord.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
