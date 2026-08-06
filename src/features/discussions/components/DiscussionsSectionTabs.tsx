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
    <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200/80 flex items-center gap-1 font-sans text-xs font-bold shadow-2xs">
      <button
        type="button"
        onClick={() => onSelectSection('community')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all cursor-pointer ${
          activeSection === 'community'
            ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-extrabold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        <span>Community Discussions</span>
        {communityTopicCount > 0 && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeSection === 'community'
                ? 'bg-blue-50 text-blue-700 font-extrabold'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {communityTopicCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onSelectSection('personal')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all cursor-pointer ${
          activeSection === 'personal'
            ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-extrabold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>Personal Chats (1-on-1 DMs)</span>
        {unreadChatCount > 0 ? (
          <span className="bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px]">
            {unreadChatCount} New
          </span>
        ) : (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeSection === 'personal'
                ? 'bg-blue-50 text-blue-700 font-extrabold'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            Private
          </span>
        )}
      </button>
    </div>
  );
};
