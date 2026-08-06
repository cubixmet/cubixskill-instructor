import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Pin } from 'lucide-react';
import type { AnnouncementItem } from '../types/dashboard.types';

interface AnnouncementsWidgetProps {
  announcements: AnnouncementItem[];
}

export const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({ announcements }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs text-left transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
            Latest Announcements & Events
          </h3>
          <p className="text-xs font-medium text-[#64748B]">
            Platform release updates, maintenance notices & upcoming events
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {announcements.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 2 }}
            className="p-3.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl flex items-start justify-between gap-3 transition-all"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] shrink-0 mt-0.5">
                <Megaphone className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#0F172A] mt-1 line-clamp-1">
                  {item.title}
                </h4>

                <p className="text-[11px] font-medium text-[#64748B] mt-0.5">
                  By {item.author} &bull; {item.date}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
