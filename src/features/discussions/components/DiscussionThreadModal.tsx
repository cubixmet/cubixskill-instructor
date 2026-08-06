import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  ThumbsUp,
  MessageCircle,
  Pin,
  CheckCircle2,
  Lock,
  Flag,
  Share2,
  Paperclip,
  Trash2,
  Edit,
  Award,
  CornerDownRight,
  Send,
  AtSign,
  AlertTriangle,
  Megaphone,
} from 'lucide-react';
import type { DiscussionItem, DiscussionReply } from '../store/discussion.store';

export interface DiscussionThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussion: DiscussionItem | null;
  replies: DiscussionReply[];
  onAddReply: (content: string, parentReplyId?: string, mentions?: string[]) => void;
  onLikeDiscussion: (id: string) => void;
  onLikeReply: (replyId: string) => void;
  onPinReply: (replyId: string) => void;
  onMarkOfficialAnswer: (discussionId: string, replyId: string) => void;
  onDeleteReply: (replyId: string) => void;
  onReport: (discussionId: string, replyId?: string, reason?: string, snippet?: string) => void;
  isInstructor?: boolean;
}

const MENTIONABLE_USERS = [
  { name: 'Dr. Vikramaditya Rao', role: 'Instructor', tag: '@Instructor' },
  { name: 'Aarav Sharma', role: 'Student', tag: '@Student' },
  { name: 'Priya Patel', role: 'Student', tag: '@Student' },
  { name: 'Rohan Mehta', role: 'Student', tag: '@Student' },
  { name: 'Kavita Sundaram', role: 'Student', tag: '@Student' },
];

export const DiscussionThreadModal: React.FC<DiscussionThreadModalProps> = ({
  isOpen,
  onClose,
  discussion,
  replies,
  onAddReply,
  onLikeDiscussion,
  onLikeReply,
  onPinReply,
  onMarkOfficialAnswer,
  onDeleteReply,
  onReport,
  isInstructor = true,
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [replyingToParentId, setReplyingToParentId] = useState<string | undefined>(undefined);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [targetReportReplyId, setTargetReportReplyId] = useState<string | undefined>(undefined);
  const [reportReason, setReportReason] = useState<'Spam' | 'Abuse' | 'Duplicate' | 'Off Topic'>('Off Topic');

  if (!discussion) return null;

  const discussionReplies = replies.filter((r) => r.discussionId === discussion.id);
  const officialAnswer = discussionReplies.find((r) => r.isOfficialAnswer || r.id === discussion.officialAnswerReplyId);
  const topLevelReplies = discussionReplies.filter((r) => !r.parentReplyId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    // Detect mentions
    const mentionsFound = MENTIONABLE_USERS.filter((u) => replyContent.includes(`@${u.name}`))
      .map((u) => u.name);

    onAddReply(replyContent, replyingToParentId, mentionsFound);
    setReplyContent('');
    setReplyingToParentId(undefined);
  };

  const handleInsertMention = (name: string) => {
    setReplyContent((prev) => `${prev} @${name} `);
    setShowMentionMenu(false);
  };

  const handleOpenReport = (replyId?: string) => {
    setTargetReportReplyId(replyId);
    setReportModalOpen(true);
  };

  const handleSubmitReport = () => {
    onReport(
      discussion.id,
      targetReportReplyId,
      reportReason,
      targetReportReplyId
        ? replies.find((r) => r.id === targetReportReplyId)?.content.slice(0, 80)
        : discussion.title
    );
    setReportModalOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={discussion.title}
      subtitle={`Category: ${discussion.category} • Posted by ${discussion.author.name} (${discussion.author.role})`}
      maxWidth="xl"
    >
      <div className="space-y-6 font-sans text-xs text-left max-h-[80vh] overflow-y-auto pr-1">
        {/* Original Post */}
        <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {discussion.author.avatar ? (
                <img
                  src={discussion.author.avatar}
                  alt={discussion.author.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {discussion.author.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <strong className="font-extrabold text-slate-900 text-sm">{discussion.author.name}</strong>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      discussion.author.role === 'instructor'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {discussion.author.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(discussion.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {discussion.isAnnouncement && (
                <Badge variant="warning" size="sm" className="font-bold flex items-center gap-1">
                  <Megaphone className="w-3 h-3" /> Announcement
                </Badge>
              )}
              {discussion.isResolved && (
                <Badge variant="success" size="sm" className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Resolved
                </Badge>
              )}
            </div>
          </div>

          <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
            {discussion.content}
          </div>

          {/* Original Post Attachments */}
          {discussion.attachments.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Attached Files:</span>
              <div className="flex flex-wrap gap-2">
                {discussion.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    <span>{att.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({att.sizeMb} MB)</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Original Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-slate-500">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onLikeDiscussion(discussion.id)}
                className={`flex items-center gap-1 font-bold transition-colors hover:text-blue-600 cursor-pointer ${
                  discussion.userLiked ? 'text-blue-600' : ''
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{discussion.likes} Likes</span>
              </button>

              <span className="flex items-center gap-1 font-semibold">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{discussionReplies.length} Replies</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleOpenReport()}
              className="text-slate-400 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" /> Report Topic
            </button>
          </div>
        </div>

        {/* OFFICIAL INSTRUCTOR ANSWER BANNER (If present) */}
        {officialAnswer && (
          <div className="p-4 bg-blue-50/80 border-2 border-blue-600/60 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-[#2563EB] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> OFFICIAL INSTRUCTOR ANSWER
                </span>
                <span className="text-xs font-bold text-slate-800">{officialAnswer.author.name}</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {officialAnswer.content}
            </p>
          </div>
        )}

        {/* REPLIES SECTION */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Discussion Replies ({discussionReplies.length})
          </h4>

          {topLevelReplies.length > 0 ? (
            <div className="space-y-3">
              {topLevelReplies.map((reply) => {
                const childReplies = discussionReplies.filter((r) => r.parentReplyId === reply.id);

                return (
                  <div key={reply.id} className="space-y-2">
                    {/* Reply Card */}
                    <div
                      className={`p-3.5 bg-white border rounded-xl space-y-2 font-sans text-xs ${
                        reply.isOfficialAnswer
                          ? 'border-blue-500 ring-1 ring-blue-500/20 bg-blue-50/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {reply.author.avatar ? (
                            <img
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center">
                              {reply.author.name.charAt(0)}
                            </div>
                          )}
                          <strong className="font-bold text-slate-900">{reply.author.name}</strong>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              reply.author.role === 'instructor'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {reply.author.role}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {reply.isOfficialAnswer && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Official Answer
                          </span>
                        )}
                      </div>

                      <p className="text-slate-800 text-xs leading-relaxed">{reply.content}</p>

                      {/* Reply Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onLikeReply(reply.id)}
                            className={`flex items-center gap-1 font-semibold hover:text-blue-600 cursor-pointer ${
                              reply.userLiked ? 'text-blue-600 font-bold' : ''
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> {reply.likes}
                          </button>

                          <button
                            type="button"
                            onClick={() => setReplyingToParentId(reply.id)}
                            className="flex items-center gap-1 font-semibold hover:text-blue-600 cursor-pointer"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" /> Reply
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {isInstructor && (
                            <button
                              type="button"
                              onClick={() => onMarkOfficialAnswer(discussion.id, reply.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer ${
                                reply.isOfficialAnswer
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                            >
                              {reply.isOfficialAnswer ? 'Official Answer ✓' : 'Mark Official Answer'}
                            </button>
                          )}

                          {isInstructor && (
                            <button
                              type="button"
                              onClick={() => onDeleteReply(reply.id)}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nested Replies */}
                    {childReplies.length > 0 && (
                      <div className="pl-6 space-y-2 border-l-2 border-slate-200 ml-3">
                        {childReplies.map((child) => (
                          <div key={child.id} className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <strong className="font-bold text-slate-800">{child.author.name}</strong>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{child.author.role}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(child.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-800 text-xs">{child.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              No replies yet. Be the first to answer or participate in this thread!
            </div>
          )}
        </div>

        {/* REPLY EDITOR (Bottom Sticky Form) */}
        {!discussion.isLocked ? (
          <form onSubmit={handleSendReply} className="space-y-2 border-t border-slate-200 pt-3 relative">
            {replyingToParentId && (
              <div className="flex items-center justify-between bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700 font-semibold text-[11px]">
                <span>Replying to nested comment thread...</span>
                <button
                  type="button"
                  onClick={() => setReplyingToParentId(undefined)}
                  className="font-bold text-xs hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={3}
                placeholder="Write your response... Use @ to mention students or instructor"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />

              <button
                type="button"
                onClick={() => setShowMentionMenu(!showMentionMenu)}
                className="absolute right-3 top-3 text-slate-400 hover:text-blue-600 cursor-pointer"
                title="Mention someone (@)"
              >
                <AtSign className="w-4 h-4" />
              </button>

              {/* Mention Autocomplete Menu */}
              {showMentionMenu && (
                <div className="absolute right-0 bottom-12 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Mention User</div>
                  {MENTIONABLE_USERS.map((user) => (
                    <button
                      key={user.name}
                      type="button"
                      onClick={() => handleInsertMention(user.name)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <span>{user.name}</span>
                      <span className="text-[10px] text-blue-600 font-bold">{user.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                Supports markdown and @mentions notifications.
              </span>
              <Button type="submit" className="bg-[#2563EB] text-white px-5 font-bold h-9 text-xs" leftIcon={<Send className="w-3.5 h-3.5" />}>
                Post Reply
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center font-bold text-slate-600 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            This discussion thread has been locked by the instructor. Replies are disabled.
          </div>
        )}
      </div>

      {/* REPORT MODAL */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Message / Thread"
        subtitle="Help keep our course community safe, helpful, and respectful."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-sans text-left">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Reason for Report</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as any)}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-semibold"
            >
              <option value="Spam">Spam / Promotional link</option>
              <option value="Abuse">Abusive or disrespectful language</option>
              <option value="Duplicate">Duplicate topic already resolved</option>
              <option value="Off Topic">Off topic / Incorrect module</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitReport} className="bg-red-600 text-white font-bold">
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};
