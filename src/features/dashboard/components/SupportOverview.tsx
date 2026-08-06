import React from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SupportSummary } from '../types/dashboard.types';

interface SupportOverviewProps {
  summary: SupportSummary;
}

export const SupportOverview: React.FC<SupportOverviewProps> = ({ summary }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#0F172A]">Support Overview</h3>
          <p className="text-xs text-[#64748B]">Helpdesk SLA and active ticket status</p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
            summary.liveChatAvailable
              ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
          }`}
        >
          {summary.liveChatAvailable ? 'Live Chat Online' : 'Chat Offline'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <span className="text-lg font-black text-[#0F172A] block">{summary.openTickets}</span>
          <span className="text-[10px] text-[#64748B] font-bold">Open Tickets</span>
        </div>
        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <span className="text-lg font-black text-[#2563EB] block">{summary.inProgressTickets}</span>
          <span className="text-[10px] text-[#64748B] font-bold">In Progress</span>
        </div>
        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <span className="text-lg font-black text-[#16A34A] block">{summary.resolvedTickets}</span>
          <span className="text-[10px] text-[#64748B] font-bold">Resolved</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0]">
        <Link
          to="/support"
          className="w-full sm:w-auto px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Create Ticket
        </Link>
        <Link
          to="/support"
          className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1"
        >
          Knowledge Base <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
