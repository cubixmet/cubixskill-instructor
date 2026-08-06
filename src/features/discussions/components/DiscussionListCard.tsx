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
  Sparkles,
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

  return (
    <Card
      padding="md"
      className={`border bg-white transition-all hover:border-blue-300 hover:shadow-xs space-y-3 font-sans text-left ${
        discussion.isPinned ? 'border-l-4 border-l-blue-600 bg-blue-50/20' : 'border-slate-200/80'
      } ${discussion.isArchived ? 'opacity-70 bg-slate-50' : ''}`}
    >
      {/* Top badges & Title */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {discussion.isAnnouncement && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                <Megaphone className="w-3 h-3" /> Announcement
              </span>
            )}
            {discussion.isPinned && (
              <Badge variant="info" size="sm" className="font-bold flex items-center gap-1">
                <Pin className="w-3 h-3" /> Pinned
              </Badge>
            )}
            {discussion.isResolved && (
              <Badge variant="success" size="sm" className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Resolved
              </Badge>
            )}
            {discussion.isLocked && (
              <Badge variant="neutral" size="sm" className="font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </Badge>
            )}
            {discussion.isArchived && (
              <Badge variant="warning" size="sm" className="font-bold">
                Archived
              </Badge>
            )}

            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {discussion.category}
            </span>
          </div>

          <h3
            onClick={() => onOpen(discussion.id)}
            className="text-base font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors line-clamp-1"
          >
            {discussion.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {discussion.shortDescription || discussion.content}
          </p>
        </div>

        {/* Quick Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 font-sans text-xs space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpen(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Open Discussion
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(discussion);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit Discussion
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onTogglePin(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
              >
                <Pin className="w-3.5 h-3.5 text-indigo-600" />
                {discussion.isPinned ? 'Unpin Discussion' : 'Pin Discussion'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleLock(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                {discussion.isLocked ? 'Unlock Thread' : 'Lock Thread'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleResolve(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {discussion.isResolved ? 'Mark Unresolved' : 'Mark Resolved'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleArchive(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
              >
                <Archive className="w-3.5 h-3.5 text-amber-600" />
                {discussion.isArchived ? 'Unarchive' : 'Archive'}
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(discussion.id);
                }}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Discussion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Author & Footer Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          {discussion.author.avatar ? (
            <img
              src={discussion.author.avatar}
              alt={discussion.author.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
              {discussion.author.name.charAt(0)}
            </div>
          )}
          <span className="font-bold text-slate-800">{discussion.author.name}</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
              discussion.author.role === 'instructor'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {discussion.author.role}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-medium">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold">
          {discussion.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-slate-600">
              <Paperclip className="w-3.5 h-3.5 text-blue-600" />
              {discussion.attachments.length} Files
            </span>
          )}

          <button
            type="button"
            onClick={() => onLike(discussion.id)}
            className={`flex items-center gap-1 transition-colors hover:text-blue-600 cursor-pointer ${
              discussion.userLiked ? 'text-blue-600 font-bold' : ''
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            {discussion.likes}
          </button>

          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {discussion.views}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpen(discussion.id)}
            className="h-7 text-xs font-bold text-blue-600 hover:bg-blue-50"
            leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
          >
            {discussion.repliesCount} Replies
          </Button>
        </div>
      </div>
    </Card>
  );
};
