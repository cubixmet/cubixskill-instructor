import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Smile,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Users,
  Paperclip,
  X,
  FileText,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { discussionService } from '../../../services/discussion.service';
import { storageService } from '../../../services/storage.service';
import { authService } from '../../../services/auth.service';
import { authStore, useAuthStore } from '../../../store/auth.store';
import { usePersonalChatSocket } from '../hooks/usePersonalChatSocket';
import { normalizeCourseId } from '../../../utils/courseValidation.utils';
import { normalizeChatMessage, type NormalizedChatMessage } from '../utils/chatNormalizer';

const EMOJIS = ['👍', '💡', '🔥', '🎯', '🙌', '❤️', '😊', '👏', '🙏', '🎉'];

function formatMessageTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateString?: string): string {
  if (!dateString) return 'Today';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Today';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const CommunityChatCoursePage: React.FC = () => {
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const navigate = useNavigate();

  const rawCourseId = params.courseId || params.courseUuid;
  const courseId = normalizeCourseId(rawCourseId);

  const { user: currentUser } = useAuthStore();
  const currentUserId = String(currentUser?.id || (currentUser as any)?.user_id || '');

  // Group Room & Messages State
  const [room, setRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // File Upload / Attachment State
  const [fileUploadEnabled, setFileUploadEnabled] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Academy Settings for File Upload Permissions
  useEffect(() => {
    let mounted = true;
    authService.getAcademySettings().then((s: any) => {
      if (mounted && s && typeof s.community_chat_file_upload_enabled === 'boolean') {
        setFileUploadEnabled(s.community_chat_file_upload_enabled);
        if (!s.community_chat_file_upload_enabled) {
          setSelectedFile(null);
          setUploadedMediaId(null);
        }
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Composer State
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  }, []);

  // Handle incoming real-time socket messages
  const handleIncomingSocketMessage = useCallback((newMsg: any) => {
    if (!newMsg || !newMsg.id) return;
    const msgId = String(newMsg.id);

    setMessages((prev) => {
      if (prev.some((m) => String(m.id) === msgId)) return prev;
      const updated = [...prev, newMsg].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return updated;
    });
    setTimeout(() => scrollToBottom('smooth'), 50);
  }, [scrollToBottom]);

  // Connect WebSocket to canonical ChatRoom
  const { connectionState, sendMessage: sendWsMessage, markRead: sendWsMarkRead } = usePersonalChatSocket(room?.id, handleIncomingSocketMessage);

  // Load canonical room and message history
  const loadRoomAndMessages = useCallback(async () => {
    if (!courseId) {
      setError('Invalid Course ID provided.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Resolve/Get-or-Create canonical room for this course
      const roomData = await discussionService.getOrCreateCommunityChatRoom(courseId);
      setRoom(roomData);

      // Load message history for room
      if (roomData?.id) {
        const msgs = await discussionService.listChatMessages(roomData.id);
        const sorted = [...msgs].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sorted);
        // Send initial read state over WebSocket
        sendWsMarkRead(sorted.length > 0 ? sorted[sorted.length - 1].id : undefined);
        setTimeout(() => scrollToBottom('auto'), 50);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.course_id || err?.message;
      if (err?.response?.status === 403) {
        setError('Feature Disabled or Forbidden. Community Chat is not available for this course.');
      } else {
        setError(msg || 'Failed to load course community chat.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId, scrollToBottom, sendWsMarkRead]);

  useEffect(() => {
    loadRoomAndMessages();
  }, [loadRoomAndMessages]);

  // File Picker Selection Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadError(null);
    setIsUploadingFile(true);

    try {
      const uploadedMedia = await storageService.uploadFile(file, {
        course_uuid: courseId || undefined,
      });

      if (uploadedMedia?.id) {
        setUploadedMediaId(uploadedMedia.id);
      } else {
        throw new Error('Upload succeeded but no media ID returned.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'File upload failed.';
      setUploadError(msg);
      setUploadedMediaId(null);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedMediaId(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string; msgs: any[] }[] = [];
    messages.forEach((msg) => {
      const label = formatDateSeparator(msg.created_at);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateLabel === label) {
        lastGroup.msgs.push(msg);
      } else {
        groups.push({ dateLabel: label, msgs: [msg] });
      }
    });
    return groups;
  }, [messages]);

  // Handle Send Message (WebSocket ONLY)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const hasText = Boolean(messageContent.trim());
    const hasMedia = Boolean(uploadedMediaId);

    if ((!hasText && !hasMedia) || !room?.id || sending || isUploadingFile) return;

    if (connectionState !== 'connected') {
      setUploadError('WebSocket disconnected. Reconnecting...');
      return;
    }

    const content = messageContent.trim();
    const mediaFileIdToSend = uploadedMediaId;

    setMessageContent('');
    setSelectedFile(null);
    setUploadedMediaId(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSending(true);

    try {
      const mediaFileIds = mediaFileIdToSend ? [mediaFileIdToSend] : [];
      // WebSocket-only send
      const sent = sendWsMessage(content, 'TEXT', undefined, mediaFileIds);
      if (sent) {
        scrollToBottom('smooth');
      } else {
        setMessageContent(content);
        setUploadError('Failed to transmit message over WebSocket.');
      }
    } catch (err) {
      // Restore on error
      setMessageContent(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100">
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-[#0F172A]">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-48 h-5 rounded" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="w-1/2 h-12 rounded-2xl" />
          <Skeleton className="w-1/3 h-12 rounded-2xl ml-auto bg-blue-100 dark:bg-blue-900/30" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0B1120] p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Access Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
        <Button onClick={() => navigate('/discussions/community')} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Community Chat List
        </Button>
      </div>
    );
  }

  const courseTitle = room?.course_title || room?.name || 'Course Community';

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-100 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-6 bg-white dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/discussions/community')}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Community Chat List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
            <Users className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {courseTitle}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
              <span>WhatsApp-style Course Community</span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className={`capitalize ${connectionState === 'connected' ? 'text-emerald-500 font-medium' : ''}`}>
                {connectionState}
              </span>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadRoomAndMessages}
          className="h-8 px-2.5 text-xs border-slate-200 dark:border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </header>

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar bg-slate-50/50 dark:bg-[#0B1120]/50"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Welcome to {courseTitle} Group Chat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
              No messages yet. Send a message to start the course conversation!
            </p>
          </div>
        ) : (
          groupedMessages.map((group, idx) => (
            <div key={idx} className="space-y-3">
              {/* Date separator badge */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-full shadow-2xs uppercase">
                  {group.dateLabel}
                </span>
              </div>

              {group.msgs.map((rawMsg) => {
                const msg: NormalizedChatMessage = normalizeChatMessage(rawMsg);
                const isMine = Boolean(currentUserId && msg.senderId && msg.senderId === currentUserId);
                const senderName = msg.senderName || 'Member';
                const timeStr = formatMessageTime(msg.createdAt);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}
                  >
                    {!isMine && (
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1 ml-1">
                        {senderName}
                      </span>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs leading-relaxed break-words ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {msg.attachments.map((att: any) => (
                            <a
                              key={att.id}
                              href={att.media_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-colors ${
                                isMine
                                  ? 'bg-blue-700/60 hover:bg-blue-700 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="truncate flex-1">{att.original_name || 'Attachment'}</span>
                              <Download className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            </a>
                          ))}
                        </div>
                      )}
                      {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                      <div
                        className={`text-[10px] font-medium mt-1 text-right tracking-tight ${
                          isMine ? 'text-blue-100/80' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {timeStr}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Composer Area */}
      <footer className="p-3 sm:p-4 bg-white dark:bg-[#0F172A] border-t border-slate-200/80 dark:border-slate-800 shrink-0 space-y-2">
        {/* Selected File / Upload Status Preview */}
        {(selectedFile || uploadError) && (
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            {uploadError ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium truncate">{uploadError}</span>
            ) : (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{selectedFile?.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                </span>
                {isUploadingFile && (
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 animate-pulse ml-1 shrink-0">
                    Uploading...
                  </span>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
              aria-label="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2">
          {/* File Picker input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />

          {fileUploadEnabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile || sending}
              className="h-11 w-11 p-0 rounded-2xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          )}

          <div className="relative flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all">
            <textarea
              ref={textareaRef}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${courseTitle}...`}
              rows={1}
              className="w-full px-4 py-3 text-xs sm:text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 resize-none max-h-32"
            />

            {showEmojiPicker && (
              <div className="absolute bottom-14 left-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl flex items-center gap-1.5 z-20">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setMessageContent((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-base transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="h-11 w-11 p-0 rounded-2xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0"
          >
            <Smile className="w-5 h-5" />
          </Button>

          <Button
            type="submit"
            disabled={(!messageContent.trim() && !uploadedMediaId) || sending || isUploadingFile}
            className="h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 shrink-0 font-medium text-xs sm:text-sm flex items-center gap-2"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
};
