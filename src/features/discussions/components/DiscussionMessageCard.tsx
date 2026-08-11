import React, { useState } from 'react';
import {
  ThumbsUp,
  CornerDownRight,
  Quote,
  Paperclip,
  Trash2,
  Edit2,
  Smile,
  Copy,
  Check,
  Flag,
  Award,
  Pin,
} from 'lucide-react';
import type { DiscussionReply } from '../store/discussion.store';

export interface DiscussionMessageCardProps {
  reply: DiscussionReply;
  onLike: (replyId: string) => void;
  onReply: (parentReplyId: string) => void;
  onQuote: (reply: DiscussionReply) => void;
  onReaction: (replyId: string, emoji: string) => void;
  onMarkOfficial?: (replyId: string) => void;
  onDelete?: (replyId: string) => void;
  onEdit?: (reply: DiscussionReply) => void;
  onReport?: (replyId: string) => void;
  isInstructor?: boolean;
  currentUserRole?: 'instructor' | 'student';
}

const EMOJI_OPTIONS = ['👍', '💡', '🔥', '🎯', '🙌', '❤️'];

export const DiscussionMessageCard: React.FC<DiscussionMessageCardProps> = ({
  reply,
  onLike,
  onReply,
  onQuote,
  onReaction,
  onMarkOfficial,
  onDelete,
  onEdit,
  onReport,
  isInstructor = true,
  currentUserRole: _ = 'instructor',
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const formattedTime = new Date(reply.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  return (
    <div
      id={`reply-${reply.id}`}
      className={`p-3 sm:p-4 rounded-2xl border transition-all space-y-2.5 font-sans text-xs text-left w-full max-w-full min-w-0 ${
        reply.isOfficialAnswer
          ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
          : 'bg-white border-slate-200/90 shadow-2xs'
      }`}
    >
      {/* Top Author Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {reply.author.avatar ? (
            <img
              src={reply.author.avatar}
              alt={reply.author.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {reply.author.name.charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <strong className="font-extrabold text-slate-900 text-xs break-words">{reply.author.name}</strong>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                  reply.author.role === 'instructor'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : reply.author.role === 'ta'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {reply.author.role}
              </span>

              {reply.isEdited && (
                <span className="text-[10px] text-slate-400 font-medium italic shrink-0">(edited)</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">{formattedTime}</span>
          </div>
        </div>

        {/* Right Official Answer / Pinned Badges */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {reply.isOfficialAnswer && (
            <span className="bg-[#2563EB] text-white text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3 shrink-0" /> OFFICIAL ANSWER
            </span>
          )}
          {reply.isPinned && (
            <span className="bg-indigo-50 text-indigo-700 text-[9.5px] font-extrabold px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1">
              <Pin className="w-3 h-3 shrink-0" /> Pinned
            </span>
          )}
        </div>
      </div>

      {/* Quoted Message Preview */}
      {reply.quotedReply && (
        <div className="p-2 bg-slate-50 border-l-3 border-l-blue-600 rounded-r-xl space-y-0.5 text-[11px] text-slate-600 w-full min-w-0">
          <span className="font-bold text-blue-700 flex items-center gap-1">
            <Quote className="w-3 h-3 shrink-0" /> Replying to {reply.quotedReply.authorName}
          </span>
          <p className="line-clamp-2 italic font-normal text-slate-700 break-words">
            "{reply.quotedReply.contentSnippet}"
          </p>
        </div>
      )}

      {/* Message Content */}
      <div className="text-slate-800 text-xs leading-relaxed font-normal whitespace-pre-line break-words overflow-wrap-anywhere w-full min-w-0">
        {reply.content}
      </div>

      {/* File Attachments */}
      {reply.attachments && reply.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {reply.attachments.map((att) => (
            <a
              key={att.id}
              href={att.url}
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors text-[11px] max-w-full truncate"
            >
              <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{att.name}</span>
              <span className="text-[10px] text-slate-400 font-normal shrink-0">({att.sizeMb} MB)</span>
            </a>
          ))}
        </div>
      )}

      {/* Emoji Reactions Row */}
      {reply.reactions && reply.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {reply.reactions.map((rx) => (
            <button
              key={rx.emoji}
              type="button"
              onClick={() => onReaction(reply.id, rx.emoji)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 font-bold text-[10.5px] cursor-pointer transition-all shrink-0"
            >
              <span>{rx.emoji}</span>
              <span>{rx.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-slate-500">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Like */}
          <button
            type="button"
            onClick={() => onLike(reply.id)}
            className={`flex items-center gap-1 font-bold transition-colors hover:text-blue-600 cursor-pointer ${
              reply.userLiked ? 'text-blue-600' : ''
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{reply.likes}</span>
          </button>

          {/* Reply */}
          <button
            type="button"
            onClick={() => onReply(reply.id)}
            className="flex items-center gap-1 font-semibold hover:text-blue-600 cursor-pointer"
          >
            <CornerDownRight className="w-3.5 h-3.5" /> Reply
          </button>

          {/* Quote */}
          <button
            type="button"
            onClick={() => onQuote(reply)}
            className="flex items-center gap-1 font-semibold hover:text-blue-600 cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" /> Quote
          </button>

          {/* Emoji Picker Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
              title="Add Reaction"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {showEmojiPicker && (
              <div className="absolute left-0 bottom-7 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1 flex items-center gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReaction(reply.id, emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1.5 hover:bg-blue-50 rounded-lg text-sm cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Official Answer Toggle */}
          {isInstructor && onMarkOfficial && (
            <button
              type="button"
              onClick={() => onMarkOfficial(reply.id)}
              className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                reply.isOfficialAnswer
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {reply.isOfficialAnswer ? 'Official Answer ✓' : 'Mark Official'}
            </button>
          )}

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 cursor-pointer"
            title="Copy Message Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Edit */}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(reply)}
              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
              title="Edit Message"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete */}
          {onDelete && isInstructor && (
            <button
              type="button"
              onClick={() => onDelete(reply.id)}
              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
              title="Delete Message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Report */}
          {onReport && (
            <button
              type="button"
              onClick={() => onReport(reply.id)}
              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
              title="Report Message"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
