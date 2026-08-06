import React, { useState } from 'react';
import {
  Pin,
  Clock,
  Eye,
  Paperclip,
  MessageSquare,
  MoreVertical,
  Edit2,
  Copy,
  Archive,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { AnnouncementItem } from '../store/announcement.store';

export interface AnnouncementCardProps {
  announcement: AnnouncementItem;
  onOpen: (id: string) => void;
  onEdit: (announcement: AnnouncementItem) => void;
  onDuplicate: (id: string) => void;
  onPublish: (id: string) => void;
  onTogglePin: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onOpen,
  onEdit,
  onDuplicate,
  onPublish,
  onTogglePin,
  onArchive,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const readCount = announcement.readReceipts.filter((r) => r.isRead).length;
  const totalStudents = announcement.readReceipts.length || 1;
  const readRate = Math.round((readCount / totalStudents) * 100);

  const getPriorityBadge = (priority: string) => {
    if (priority === 'urgent')
      return <Badge variant="error" size="sm" className="font-extrabold">Urgent</Badge>;
    if (priority === 'important')
      return <Badge variant="warning" size="sm" className="font-extrabold">Important</Badge>;
    return <Badge variant="neutral" size="sm" className="font-semibold">Normal</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'published')
      return <Badge variant="success" size="sm" className="font-extrabold">Published</Badge>;
    if (status === 'scheduled')
      return <Badge variant="warning" size="sm" className="font-extrabold">Scheduled</Badge>;
    if (status === 'draft')
      return <Badge variant="neutral" size="sm" className="font-extrabold">Draft</Badge>;
    return <Badge variant="neutral" size="sm" className="font-semibold">Archived</Badge>;
  };

  return (
    <Card
      padding="md"
      className={`bg-white border transition-all shadow-2xs font-sans text-xs text-left relative space-y-3 ${
        announcement.isPinned
          ? 'border-blue-300 bg-blue-50/20'
          : 'border-slate-200/90 hover:border-blue-300'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {announcement.isPinned && (
              <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Pin className="w-3 h-3 fill-current" /> Pinned Top
              </span>
            )}
            {getStatusBadge(announcement.status)}
            {getPriorityBadge(announcement.priority)}
            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
              {announcement.category}
            </span>
          </div>

          <h3
            onClick={() => onOpen(announcement.id)}
            className="text-base font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors leading-tight"
          >
            {announcement.title}
          </h3>
        </div>

        {/* Action Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-xl z-30 w-44 py-1 space-y-0.5 text-xs font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => onOpen(announcement.id)}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Open Details
              </button>
              <button
                type="button"
                onClick={() => onEdit(announcement)}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit
              </button>
              <button
                type="button"
                onClick={() => onDuplicate(announcement.id)}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-600" /> Duplicate
              </button>
              <button
                type="button"
                onClick={() => onTogglePin(announcement.id)}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <Pin className="w-3.5 h-3.5 text-amber-600" />
                {announcement.isPinned ? 'Unpin Topic' : 'Pin to Top'}
              </button>
              {announcement.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => onPublish(announcement.id)}
                  className="w-full px-3 py-1.5 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" /> Publish Now
                </button>
              )}
              <button
                type="button"
                onClick={() => onArchive(announcement.id)}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 text-slate-700 flex items-center gap-2"
              >
                <Archive className="w-3.5 h-3.5 text-slate-500" /> Archive
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                type="button"
                onClick={() => onDelete(announcement.id)}
                className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Snippet */}
      <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-normal">
        {announcement.summary}
      </p>

      {/* Bottom Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          {announcement.author.avatar ? (
            <img
              src={announcement.author.avatar}
              alt={announcement.author.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
              {announcement.author.name.charAt(0)}
            </div>
          )}
          <span className="text-slate-900 font-bold">{announcement.author.name}</span>
          <span>•</span>
          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Read Receipts */}
          <div className="flex items-center gap-1 text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>{readCount}/{totalStudents} Read ({readRate}%)</span>
          </div>

          {/* Attachments */}
          {announcement.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-slate-600">
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              <span>{announcement.attachments.length} files</span>
            </div>
          )}

          {/* Comments */}
          {announcement.allowComments && (
            <div className="flex items-center gap-1 text-slate-600">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>{announcement.comments.length} comments</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
