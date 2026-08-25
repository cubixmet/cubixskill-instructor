import React from 'react';
import {
  Pin,
  Lock,
  CheckCircle2,
  MessageCircle,
  Eye,
  ThumbsUp,
  MoreVertical,
  Paperclip,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  Megaphone,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { DiscussionItem } from '../store/discussion.store';

interface DiscussionListCardProps {
  discussion: DiscussionItem;
  onOpen: (id: string) => void;
  onEdit: (d: DiscussionItem) => void;
  onTogglePin: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onToggleResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
}

export const DiscussionListCard: React.FC<DiscussionListCardProps> = ({
  discussion,
  onOpen,
  onEdit,
  onTogglePin,
  onToggleLock,
  onToggleArchive,
  onToggleResolve,
  onDelete,
  onLike,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const formattedDate = new Date(discussion.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const replyCountLabel = discussion.repliesCount === 1 ? '1 Reply' : `${discussion.repliesCount} Replies`;

  return (
    <Card
      padding="none"
      className={`w-full min-w-0 max-w-full rounded-xl border p-3 sm:p-4 space-y-3 font-sans text-left transition-all duration-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] hover:border-blue-300 dark:hover:border-[rgba(59,130,246,0.30)] ${
        discussion.isPinned
          ? 'border-l-4 border-l-[#2563EB] dark:border-l-[#3B82F6] bg-blue-50/20 dark:bg-[rgba(37,99,235,0.06)] border-[#E2E8F0] dark:border-[#263244]'
          : 'border-[#E2E8F0] dark:border-[#263244]'
      } ${discussion.isArchived ? 'opacity-70 bg-slate-50 dark:bg-[#0F172A]' : ''}`}
    >
      {/* Header: Badges & Three dot menu */}
      <div className="flex items-start justify-between gap-2 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
          {discussion.isAnnouncement && (
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40 text-[10px]">
              <Megaphone className="w-3 h-3 shrink-0" /> Announcement
            </span>
          )}
          {discussion.isPinned && (
            <Badge variant="info" size="sm" className="font-semibold flex items-center gap-1 text-[10px] py-0.5 bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA]">
              <Pin className="w-3 h-3 shrink-0" /> Pinned
            </Badge>
          )}
          {discussion.isResolved && (
            <Badge variant="success" size="sm" className="font-semibold flex items-center gap-1 text-[10px] py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3 shrink-0" /> Answered
            </Badge>
          )}
          {discussion.isLocked && (
            <Badge variant="neutral" size="sm" className="font-semibold flex items-center gap-1 text-[10px] py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400">
              <Lock className="w-3 h-3 shrink-0" /> Locked
            </Badge>
          )}
          {discussion.isArchived && (
            <Badge variant="warning" size="sm" className="font-semibold text-[10px] py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              Archived
            </Badge>
          )}
          <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] bg-slate-100 dark:bg-[#172033] px-2 py-0.5 rounded-md border border-[#E2E8F0] dark:border-[#334155]">
            {discussion.category}
          </span>
        </div>

        {/* Quick Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] rounded-xl shadow-lg z-20 py-1 font-sans text-xs space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpen(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#FFFFFF] font-medium flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> Open Discussion
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(discussion);
                }}
                className="w-full text-left px-3 py-2 text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#FFFFFF] font-medium flex items-center gap-2 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" /> Edit Discussion
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onTogglePin(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#FFFFFF] font-medium flex items-center gap-2 cursor-pointer"
              >
                <Pin className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                {discussion.isPinned ? 'Unpin Discussion' : 'Pin Discussion'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleLock(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#FFFFFF] font-medium flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                {discussion.isLocked ? 'Unlock Thread' : 'Lock Thread'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleResolve(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#FFFFFF] font-medium flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {discussion.isResolved ? 'Mark Unresolved' : 'Mark Answered'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleArchive(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#FFFFFF] font-medium flex items-center gap-2 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
                {discussion.isArchived ? 'Unarchive' : 'Archive'}
              </button>

              <div className="border-t border-[#E2E8F0] dark:border-[#263244] my-1" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-red-600 dark:text-[#F87171] hover:bg-red-50 dark:hover:bg-red-900/20 font-medium flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Discussion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Discussion Title */}
      <h3
        onClick={() => onOpen(discussion.id)}
        className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] cursor-pointer transition-colors leading-snug break-words whitespace-normal"
      >
        {discussion.title}
      </h3>

      {/* Short preview */}
      <p className="text-xs text-[#475569] dark:text-[#CBD5E1] font-normal line-clamp-2 leading-relaxed">
        {discussion.shortDescription || discussion.content}
      </p>

      {/* Author Section & Date */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {discussion.author.avatar ? (
            <img
              src={discussion.author.avatar}
              alt={discussion.author.name}
              className="w-6 h-6 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155] shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.12)] border border-[#DBEAFE] dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] font-semibold text-[10px] flex items-center justify-center shrink-0">
              {discussion.author.name.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] break-words">{discussion.author.name}</span>
          <span
            className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded uppercase shrink-0 ${
              discussion.author.role === 'instructor'
                ? 'bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] border border-[#DBEAFE] dark:border-[rgba(59,130,246,0.18)]'
                : 'bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]'
            }`}
          >
            {discussion.author.role}
          </span>
        </div>
        <span className="text-[#94A3B8] hidden sm:inline">•</span>
        <span className="text-[#64748B] dark:text-[#94A3B8] font-normal text-[11px] w-full sm:w-auto">{formattedDate}</span>
      </div>

      {/* Stats & Replies CTA Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244] text-xs">
        <div className="flex items-center gap-3 text-[#64748B] dark:text-[#94A3B8] text-xs font-normal">
          {discussion.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
              <Paperclip className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
              {discussion.attachments.length}
            </span>
          )}

          <button
            type="button"
            onClick={() => onLike(discussion.id)}
            className={`flex items-center gap-1 transition-colors hover:text-[#2563EB] dark:hover:text-[#60A5FA] cursor-pointer ${
              discussion.userLiked ? 'text-[#2563EB] dark:text-[#60A5FA] font-semibold' : ''
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            {discussion.likes}
          </button>

          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {discussion.views}
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpen(discussion.id)}
          className="h-7 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:bg-blue-50 dark:hover:bg-[#172033] w-auto shrink-0 max-w-full"
          leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
        >
          {replyCountLabel}
        </Button>
      </div>
    </Card>
  );
};
