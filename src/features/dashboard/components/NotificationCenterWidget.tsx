import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle, Coins, Archive, Check } from 'lucide-react';
import type { NotificationItem } from '../types/dashboard.types';

interface NotificationCenterWidgetProps {
  notifications: NotificationItem[];
}

export const NotificationCenterWidget: React.FC<NotificationCenterWidgetProps> = ({
  notifications: initialNotifs,
}) => {
  const [activeTab, setActiveTab] = useState<'Unread' | 'Read' | 'Priority' | 'Archive'>('Unread');
  const [items, setItems] = useState<NotificationItem[]>(initialNotifs);

  const filtered = items.filter((n) => {
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Read') return n.read;
    if (activeTab === 'Priority') return n.category === 'Priority';
    return n.category === 'Archive';
  });

  const getIcon = (type: NotificationItem['iconType']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-[#D97706]" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-[#16A34A]" />;
      case 'credit': return <Coins className="w-4 h-4 text-[#2563EB]" />;
      default: return <Info className="w-4 h-4 text-[#0EA5E9]" />;
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs text-left transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
            Notification Center
          </h3>
          <p className="text-xs font-medium text-[#64748B]">
            System messages, alerts & submission notifications
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl">
          {(['Unread', 'Read', 'Priority', 'Archive'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <div
              key={n.id}
              className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] shrink-0 mt-0.5">
                  {getIcon(n.iconType)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#0F172A]">{n.title}</h4>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">{n.description}</p>
                  <span className="text-[10px] text-[#94A3B8] font-semibold block mt-1">
                    {n.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs font-semibold text-[#64748B]">
            No notifications found in {activeTab}.
          </div>
        )}
      </div>
    </div>
  );
};
