import React from 'react';
import { MessageSquare, MessageCircle } from 'lucide-react';

export interface DiscussionsSectionTabsProps {
  activeSection: 'community' | 'personal';
  onSelectSection: (section: 'community' | 'personal') => void;
  unreadChatCount?: number;
  communityTopicCount?: number;
}

export const DiscussionsSectionTabs: React.FC<DiscussionsSectionTabsProps> = ({
  activeSection,
  onSelectSection,
  unreadChatCount = 0,
  communityTopicCount = 0,
}) => {
  return (
    <div className="w-full max-w-full overflow-x-auto no-scrollbar py-1">
      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-2xl font-sans text-xs font-semibold shadow-2xs whitespace-nowrap min-w-full sm:min-w-0">
        <button
          type="button"
          onClick={() => onSelectSection('community')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-2 px-3.5 sm:px-4 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeSection === 'community'
              ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-xs border border-slate-200 dark:border-[#334155] font-semibold'
              : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-200/50 dark:hover:bg-[#172033]'
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Community Discussions</span>
          {communityTopicCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 font-semibold ${
                activeSection === 'community'
                  ? 'bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA]'
                  : 'bg-slate-200 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1]'
              }`}
            >
              {communityTopicCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('personal')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-2 px-3.5 sm:px-4 rounded-xl transition-all cursor-pointer shrink-0 ${
            activeSection === 'personal'
              ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-xs border border-slate-200 dark:border-[#334155] font-semibold'
              : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-200/50 dark:hover:bg-[#172033]'
          }`}
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Personal Chats</span>
          {unreadChatCount > 0 ? (
            <span className="bg-[#2563EB] text-white font-semibold px-2 py-0.5 rounded-full text-[10px] shrink-0">
              {unreadChatCount}
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 font-semibold ${
                activeSection === 'personal'
                  ? 'bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA]'
                  : 'bg-slate-200 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1]'
              }`}
            >
              Private
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

