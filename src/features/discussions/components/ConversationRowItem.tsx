import React from 'react';
import { CourseThumbnailImage } from '../../../components/courses/CourseThumbnailImage';

export interface ConversationRowItemProps {
  id: string;
  title: string;
  avatarUrl?: string | null;
  courseThumbnail?: string | null;
  lastMessageContent?: string | null;
  lastMessageSenderName?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageAttachments?: any[];
  timestamp?: string | null;
  unreadCount?: number;
  isActive?: boolean;
  isCommunity?: boolean;
  currentUserId?: string;
  onClick?: () => void;
}

export function formatConversationTime(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatConversationPreview(
  content?: string | null,
  senderId?: string | null,
  senderName?: string | null,
  attachments?: any[],
  currentUserId?: string,
  isCommunity?: boolean
): { text: string; hasMessage: boolean } {
  let mainText = (content || '').trim();
  let mediaType = '';

  if (Array.isArray(attachments) && attachments.length > 0) {
    const att = attachments[0];
    mediaType = String(att?.attachment_type || att?.type || att?.media_type || '').toLowerCase();
    if (!mainText) {
      if (mediaType.includes('image') || mediaType.includes('photo')) mainText = '[Photo]';
      else if (mediaType.includes('video')) mainText = '[Video]';
      else if (mediaType.includes('audio')) mainText = '[Audio]';
      else mainText = '[Attachment]';
    }
  }

  if (!mainText) {
    return { text: 'No messages yet', hasMessage: false };
  }

  const isMine = Boolean(currentUserId && senderId && String(senderId) === String(currentUserId));

  if (isMine) {
    return { text: `You: ${mainText}`, hasMessage: true };
  }

  if (isCommunity && senderName) {
    return { text: `${senderName}: ${mainText}`, hasMessage: true };
  }

  return { text: mainText, hasMessage: true };
}

export const ConversationRowItem: React.FC<ConversationRowItemProps> = ({
  title,
  avatarUrl,
  courseThumbnail,
  lastMessageContent,
  lastMessageSenderName,
  lastMessageSenderId,
  lastMessageAttachments,
  timestamp,
  unreadCount = 0,
  isActive = false,
  isCommunity = false,
  currentUserId = '',
  onClick,
}) => {
  // Clean raw display name by removing "Private DM:" if present
  const cleanTitle = title.replace(/^Private DM:\s*/i, '');
  const initials = cleanTitle ? cleanTitle.substring(0, 2).toUpperCase() : 'DM';

  const { text: previewText, hasMessage } = formatConversationPreview(
    lastMessageContent,
    lastMessageSenderId,
    lastMessageSenderName,
    lastMessageAttachments,
    currentUserId,
    isCommunity
  );

  const displayTime = hasMessage ? formatConversationTime(timestamp) : '';
  const isUnread = unreadCount > 0;
  const badgeText = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <div
      onClick={onClick}
      className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all w-full max-w-full min-w-0 border-l-4 min-h-[60px] select-none ${
        isActive
          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-l-blue-600 dark:border-l-blue-500'
          : isUnread
          ? 'bg-blue-50/30 dark:bg-blue-900/10 border-l-transparent hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
          : 'bg-white dark:bg-[#111827] border-l-transparent hover:bg-slate-100/70 dark:hover:bg-slate-900/60'
      }`}
    >
      {/* Avatar / Course Thumbnail */}
      <div className="relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-full overflow-hidden shrink-0 shadow-xs border border-slate-200 dark:border-slate-700 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
        {isCommunity ? (
          <CourseThumbnailImage
            src={courseThumbnail}
            alt={cleanTitle}
            initials={initials}
            className="w-full h-full object-cover"
          />
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt={cleanTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Name + Last Message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`text-sm tracking-tight truncate ${
              isUnread
                ? 'font-bold text-slate-900 dark:text-slate-50'
                : 'font-semibold text-slate-900 dark:text-slate-100'
            }`}
          >
            {cleanTitle}
          </h4>
          {displayTime && (
            <span
              className={`text-[11px] shrink-0 ${
                isUnread
                  ? 'font-bold text-blue-600 dark:text-blue-400'
                  : 'font-medium text-slate-400 dark:text-slate-500'
              }`}
            >
              {displayTime}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-xs truncate ${
              isUnread
                ? 'font-semibold text-slate-900 dark:text-slate-100'
                : 'font-normal text-slate-500 dark:text-slate-400'
            }`}
          >
            {previewText}
          </p>

          {isUnread && (
            <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
