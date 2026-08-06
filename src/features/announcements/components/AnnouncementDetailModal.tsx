import React, { useState } from 'react';
import {
  Megaphone,
  Pin,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  Paperclip,
  Download,
  MessageSquare,
  Send,
  Trash2,
  ThumbsUp,
  User,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { AnnouncementItem } from '../store/announcement.store';

export interface AnnouncementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: AnnouncementItem | null;
  onAddComment: (announcementId: string, content: string) => void;
  onDeleteComment: (announcementId: string, commentId: string) => void;
  onLikeComment: (announcementId: string, commentId: string) => void;
}

export const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  isOpen,
  onClose,
  announcement,
  onAddComment,
  onDeleteComment,
  onLikeComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'receipts' | 'comments'>('content');

  if (!announcement) return null;

  const readCount = announcement.readReceipts.filter((r) => r.isRead).length;
  const totalStudents = announcement.readReceipts.length || 1;
  const readRate = Math.round((readCount / totalStudents) * 100);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(announcement.id, commentText);
    setCommentText('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={announcement.title}
      subtitle={`Published on ${new Date(announcement.createdAt).toLocaleDateString()} • ${announcement.category}`}
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans text-xs text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Navigation Tabs ([ Announcement Content ] | [ Read Receipts (85%) ] | [ Comments (2) ]) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'content'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Announcement Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receipts')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'receipts'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Read Receipts ({readRate}%)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'comments'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({announcement.comments.length})</span>
          </button>
        </div>

        {/* TAB 1: ANNOUNCEMENT CONTENT */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Header badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {announcement.isPinned && (
                <Badge variant="info" size="sm" className="font-bold">
                  Pinned Top
                </Badge>
              )}
              <Badge variant="success" size="sm" className="font-extrabold uppercase">
                {announcement.status}
              </Badge>
              <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                {announcement.priority.toUpperCase()} PRIORITY
              </span>
            </div>

            {/* Author Info */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3">
              {announcement.author.avatar ? (
                <img
                  src={announcement.author.avatar}
                  alt={announcement.author.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {announcement.author.name.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">
                  {announcement.author.name}
                </h4>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Course Senior Instructor • {new Date(announcement.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-slate-800 text-xs leading-relaxed whitespace-pre-line font-normal">
              {announcement.content}
            </div>

            {/* Attachments */}
            {announcement.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900">Attachments ({announcement.attachments.length})</h4>
                <div className="space-y-1.5">
                  {announcement.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-blue-600" />
                        <div>
                          <strong className="font-bold text-slate-900 block">{att.name}</strong>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {att.sizeMb} MB • High Speed CDN Download
                          </span>
                        </div>
                      </div>

                      <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold text-blue-600">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: READ RECEIPTS */}
        {activeTab === 'receipts' && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-blue-900 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>{readCount} of {totalStudents}</strong> enrolled students have opened this announcement.
                </span>
              </div>
              <span className="font-extrabold text-blue-700 text-sm">{readRate}% Read</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {announcement.readReceipts.map((receipt) => (
                <div
                  key={receipt.studentUuid}
                  className="p-3 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    {receipt.studentAvatar ? (
                      <img
                        src={receipt.studentAvatar}
                        alt={receipt.studentName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                        {receipt.studentName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <strong className="font-bold text-slate-900 block">{receipt.studentName}</strong>
                      <span className="text-[10px] text-slate-400">{receipt.studentEmail}</span>
                    </div>
                  </div>

                  {receipt.isRead ? (
                    <div className="text-right">
                      <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded border border-emerald-200 block">
                        Read
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {new Date(receipt.readAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded">
                      Unread
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMMENTS SECTION */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {announcement.comments.length > 0 ? (
              <div className="space-y-2">
                {announcement.comments.map((cm) => (
                  <div
                    key={cm.id}
                    className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {cm.author.avatar ? (
                          <img
                            src={cm.author.avatar}
                            alt={cm.author.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {cm.author.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{cm.author.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteComment(announcement.id, cm.id)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed">{cm.content}</p>

                    <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500">
                      <button
                        type="button"
                        onClick={() => onLikeComment(announcement.id, cm.id)}
                        className="flex items-center gap-1 hover:text-blue-600 font-bold cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3" /> Like ({cm.likes})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-1 bg-slate-50 rounded-xl border border-slate-200">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700">No comments yet</p>
                <p className="text-[11px]">Be the first instructor to comment on this announcement.</p>
              </div>
            )}

            {/* Post Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Button type="submit" size="sm" className="h-9 bg-[#2563EB] text-white font-bold">
                Comment
              </Button>
            </form>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
