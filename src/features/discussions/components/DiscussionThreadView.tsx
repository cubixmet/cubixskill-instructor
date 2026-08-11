import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  CheckCircle2,
  Lock,
  Flag,
  Paperclip,
  Award,
  Send,
  AtSign,
  AlertTriangle,
  Smile,
  X,
  Megaphone,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { DiscussionMessageCard } from './DiscussionMessageCard';
import type { DiscussionItem, DiscussionReply } from '../store/discussion.store';

export interface DiscussionThreadViewProps {
  discussion: DiscussionItem;
  replies: DiscussionReply[];
  onBack: () => void;
  onAddReply: (
    content: string,
    parentReplyId?: string,
    mentions?: string[],
    quotedReply?: { id: string; authorName: string; contentSnippet: string }
  ) => void;
  onLikeDiscussion: (id: string) => void;
  onLikeReply: (replyId: string) => void;
  onPinReply: (replyId: string) => void;
  onMarkOfficialAnswer: (discussionId: string, replyId: string) => void;
  onDeleteReply: (replyId: string) => void;
  onReport: (discussionId: string, replyId?: string) => void;
  onReaction: (replyId: string, emoji: string) => void;
  isInstructor?: boolean;
  currentUserRole?: 'instructor' | 'student';
}

const MENTIONABLE_USERS = [
  { name: 'Dr. Vikramaditya Rao', role: 'Instructor' },
  { name: 'Ananya Deshmukh', role: 'TA' },
  { name: 'Aarav Sharma', role: 'Student' },
  { name: 'Priya Patel', role: 'Student' },
  { name: 'Rohan Mehta', role: 'Student' },
  { name: 'Kavita Sundaram', role: 'Student' },
];

const EMOJIS = ['👍', '💡', '🔥', '🎯', '🙌', '❤️', '🚀'];

export const DiscussionThreadView: React.FC<DiscussionThreadViewProps> = ({
  discussion,
  replies,
  onBack,
  onAddReply,
  onLikeDiscussion,
  onLikeReply,
  onPinReply: _,
  onMarkOfficialAnswer,
  onDeleteReply,
  onReport,
  onReaction,
  isInstructor = true,
  currentUserRole = 'instructor',
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [replyingToParentId, setReplyingToParentId] = useState<string | undefined>(undefined);
  const [quotedReply, setQuotedReply] = useState<{ id: string; authorName: string; contentSnippet: string } | undefined>(undefined);

  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  const discussionReplies = replies.filter((r) => r.discussionId === discussion.id);
  const officialAnswer = discussionReplies.find((r) => r.isOfficialAnswer || r.id === discussion.officialAnswerReplyId);

  // Exclude official answer from regular list if rendered at top
  const regularReplies = discussionReplies.filter((r) => r.id !== officialAnswer?.id);
  const topLevelReplies = regularReplies.filter((r) => !r.parentReplyId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const mentionsFound = MENTIONABLE_USERS.filter((u) =>
      replyContent.includes(`@${u.name}`)
    ).map((u) => u.name);

    onAddReply(replyContent, replyingToParentId, mentionsFound, quotedReply);

    setReplyContent('');
    setReplyingToParentId(undefined);
    setQuotedReply(undefined);
  };

  const handleQuoteReply = (targetReply: DiscussionReply) => {
    setQuotedReply({
      id: targetReply.id,
      authorName: targetReply.author.name,
      contentSnippet: targetReply.content.slice(0, 90),
    });
    replyInputRef.current?.focus();
  };

  const handleInsertMention = (name: string) => {
    setReplyContent((prev) => `${prev} @${name} `);
    setShowMentionMenu(false);
    replyInputRef.current?.focus();
  };

  return (
    <div className="space-y-4 font-sans text-xs text-left w-full max-w-full min-w-0 pb-20 sm:pb-0">
      {/* 1. THREAD NAVIGATION HEADER */}
      <Card padding="none" className="bg-white border border-slate-200/90 p-3 shadow-2xs w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 mt-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">{discussion.category}</span>
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug break-words whitespace-normal">{discussion.title}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {discussion.isAnnouncement && (
              <Badge variant="warning" size="sm" className="font-bold flex items-center gap-1 text-[10px]">
                <Megaphone className="w-3 h-3" /> Announcement
              </Badge>
            )}
            {discussion.isResolved && (
              <Badge variant="success" size="sm" className="font-bold flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Resolved
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* 2. ORIGINAL QUESTION CARD */}
      <div className="p-3.5 sm:p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3 sm:space-y-4 shadow-2xs w-full max-w-full min-w-0">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {discussion.author.avatar ? (
              <img
                src={discussion.author.avatar}
                alt={discussion.author.name}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                {discussion.author.name.charAt(0)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <strong className="font-extrabold text-slate-900 text-xs sm:text-sm break-words">{discussion.author.name}</strong>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                    discussion.author.role === 'instructor'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {discussion.author.role}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {new Date(discussion.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onReport(discussion.id)}
            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer shrink-0"
            title="Report Discussion"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        {/* Discussion Body */}
        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line break-words overflow-wrap-anywhere w-full min-w-0">
          {discussion.content}
        </div>

        {/* Attachments */}
        {discussion.attachments.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Discussion Files:</span>
            <div className="flex flex-wrap gap-2">
              {discussion.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors text-xs max-w-full truncate"
                >
                  <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{att.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal shrink-0">({att.sizeMb} MB)</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom stats & like */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
          <button
            type="button"
            onClick={() => onLikeDiscussion(discussion.id)}
            className={`flex items-center gap-1.5 font-bold hover:text-blue-600 cursor-pointer transition-colors ${
              discussion.userLiked ? 'text-blue-600' : ''
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{discussion.likes} Likes</span>
          </button>

          <span className="flex items-center gap-1.5 font-semibold">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <span>{discussionReplies.length} Replies</span>
          </span>
        </div>
      </div>

      {/* 3. OFFICIAL INSTRUCTOR ANSWER */}
      {officialAnswer && (
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1 pl-1">
            <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" /> OFFICIAL INSTRUCTOR SOLUTION
          </div>
          <DiscussionMessageCard
            reply={officialAnswer}
            onLike={onLikeReply}
            onReply={(pid) => {
              setReplyingToParentId(pid);
              replyInputRef.current?.focus();
            }}
            onQuote={handleQuoteReply}
            onReaction={onReaction}
            onMarkOfficial={(rid) => onMarkOfficialAnswer(discussion.id, rid)}
            onDelete={onDeleteReply}
            onReport={(rid) => onReport(discussion.id, rid)}
            isInstructor={isInstructor}
            currentUserRole={currentUserRole}
          />
        </div>
      )}

      {/* 4. REPLIES STREAM */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Replies ({regularReplies.length})
        </h4>

        {topLevelReplies.length > 0 ? (
          <div className="space-y-3">
            {topLevelReplies.map((reply) => {
              const childReplies = regularReplies.filter((r) => r.parentReplyId === reply.id);

              return (
                <div key={reply.id} className="space-y-2">
                  <DiscussionMessageCard
                    reply={reply}
                    onLike={onLikeReply}
                    onReply={(pid) => {
                      setReplyingToParentId(pid);
                      replyInputRef.current?.focus();
                    }}
                    onQuote={handleQuoteReply}
                    onReaction={onReaction}
                    onMarkOfficial={(rid) => onMarkOfficialAnswer(discussion.id, rid)}
                    onDelete={onDeleteReply}
                    onReport={(rid) => onReport(discussion.id, rid)}
                    isInstructor={isInstructor}
                    currentUserRole={currentUserRole}
                  />

                  {/* Capped Nested Comments for Mobile */}
                  {childReplies.length > 0 && (
                    <div className="pl-2 sm:pl-5 border-l-2 border-slate-200/80 ml-2 sm:ml-4 space-y-2">
                      {childReplies.map((child) => (
                        <DiscussionMessageCard
                          key={child.id}
                          reply={child}
                          onLike={onLikeReply}
                          onReply={(pid) => {
                            setReplyingToParentId(pid);
                            replyInputRef.current?.focus();
                          }}
                          onQuote={handleQuoteReply}
                          onReaction={onReaction}
                          onMarkOfficial={(rid) => onMarkOfficialAnswer(discussion.id, rid)}
                          onDelete={onDeleteReply}
                          onReport={(rid) => onReport(discussion.id, rid)}
                          isInstructor={isInstructor}
                          currentUserRole={currentUserRole}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 space-y-1">
            <MessageCircle className="w-7 h-7 mx-auto text-slate-300" />
            <p className="font-bold text-slate-600 text-xs">No replies yet.</p>
            <p className="text-[11px]">Be the first to post an answer in this thread.</p>
          </div>
        )}
      </div>

      {/* 5. REPLY INPUT BOX (Fixed Above Bottom Nav on Mobile if needed, sticky/responsive) */}
      {!discussion.isLocked ? (
        <form
          onSubmit={handleSendReply}
          className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-md space-y-2 relative w-full max-w-full min-w-0"
        >
          {/* Quote / Replying To Indicator */}
          {(replyingToParentId || quotedReply) && (
            <div className="flex items-center justify-between bg-blue-50/90 border border-blue-200 px-3 py-1.5 rounded-xl text-blue-800 font-semibold text-[11px]">
              <div className="truncate">
                {quotedReply ? (
                  <span>
                    Quoting <strong>{quotedReply.authorName}</strong>: "{quotedReply.contentSnippet}"
                  </span>
                ) : (
                  <span>Replying to comment thread...</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplyingToParentId(undefined);
                  setQuotedReply(undefined);
                }}
                className="p-1 text-blue-600 hover:text-blue-900 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              ref={replyInputRef}
              rows={3}
              placeholder="Write a message... Use @ to mention students or instructor"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 pr-16 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-normal"
              required
            />

            <div className="absolute right-3 top-3 flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => setShowMentionMenu(!showMentionMenu)}
                className="p-1 hover:text-blue-600 cursor-pointer"
                title="Mention User (@)"
              >
                <AtSign className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 hover:text-blue-600 cursor-pointer"
                title="Add Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            {/* Mention Menu */}
            {showMentionMenu && (
              <div className="absolute right-0 bottom-12 w-56 sm:w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 space-y-0.5 max-h-48 overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Mention Course Member</div>
                {MENTIONABLE_USERS.map((user) => (
                  <button
                    key={user.name}
                    type="button"
                    onClick={() => handleInsertMention(user.name)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{user.name}</span>
                    <span className="text-[10px] text-blue-600 font-bold shrink-0">{user.role}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Emoji Menu */}
            {showEmojiPicker && (
              <div className="absolute right-2 bottom-12 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 flex items-center gap-1 flex-wrap max-w-xs">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      setReplyContent((prev) => prev + e);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1.5 hover:bg-blue-50 rounded-lg text-sm cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Instructor Storage Notice */}
          {isInstructor && currentUserRole === 'instructor' && (
            <div className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Storage credits are deducted only after file attachments are uploaded.</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-slate-400 font-medium">
              Markdown and @mentions supported.
            </span>
            <Button
              type="submit"
              className="bg-[#2563EB] text-white px-5 font-bold h-9 text-xs w-full sm:w-auto"
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post Reply
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-center font-bold text-slate-600 flex items-center justify-center gap-2 text-xs">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>This discussion thread is locked by the instructor. Replies are disabled.</span>
        </div>
      )}
    </div>
  );
};
