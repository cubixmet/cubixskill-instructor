import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Smile,
  RefreshCw,
  AlertCircle,
  Paperclip,
  X,
  FileText,
  Download,
  Users,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { CourseThumbnailImage } from '../../../components/courses/CourseThumbnailImage';
import { discussionService } from '../../../services/discussion.service';
import { storageService } from '../../../services/storage.service';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';
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

  // Dynamic Visual Viewport Height tracking for Mobile Keyboard (Android/iOS Safari)
  const [viewportHeight, setViewportHeight] = useState<string | number>('100dvh');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      if (window.visualViewport) {
        if (window.innerWidth < 768) {
          setViewportHeight(`${window.visualViewport.height}px`);
        } else {
          setViewportHeight('100%');
        }
      }
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    handleResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  }, []);

  // Handle incoming real-time socket messages
  const handleIncomingSocketMessage = useCallback((newMsg: any) => {
    if (!newMsg || (!newMsg.id && !newMsg.uuid)) return;
    const normalized = normalizeChatMessage(newMsg);

    setMessages((prev) => {
      if (prev.some((m) => String(m.id) === normalized.id)) return prev;
      const updated = [...prev, normalized].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
        const normalized = msgs.map(normalizeChatMessage);
        const sorted = [...normalized].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
    const groups: { dateLabel: string; msgs: NormalizedChatMessage[] }[] = [];
    messages.forEach((msg) => {
      const label = formatDateSeparator(msg.createdAt);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateLabel === label) {
        lastGroup.msgs.push(msg);
      } else {
        groups.push({ dateLabel: label, msgs: [msg] });
      }
    });
    return groups;
  }, [messages]);

  // Handle Send Message (WebSocket + REST Fallback)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const hasText = Boolean(messageContent.trim());
    const hasMedia = Boolean(uploadedMediaId);

    if ((!hasText && !hasMedia) || !room?.id || sending || isUploadingFile) return;

    setSending(true);
    setUploadError(null);

    const content = messageContent.trim();
    const mediaFileIdToSend = uploadedMediaId;
    const mediaFileIds = mediaFileIdToSend ? [mediaFileIdToSend] : [];

    setMessageContent('');
    setSelectedFile(null);
    setUploadedMediaId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      let sent = false;
      if (connectionState === 'connected') {
        sent = sendWsMessage({
          content,
          messageType: 'TEXT',
          mediaFileIds,
        });
      }

      if (!sent) {
        const createdMsg = await discussionService.sendChatMessage(room.id, content, mediaFileIds);
        const normalized = normalizeChatMessage(createdMsg);
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === normalized.id)) return prev;
          return [...prev, normalized].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }

      scrollToBottom('smooth');
    } catch (err: any) {
      setMessageContent(content);
      const msg = err?.response?.data?.detail || err?.message || 'Failed to send message.';
      setUploadError(msg);
    } finally {
      setSending(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
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
        <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-[#0F172A]">
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
      <div className="flex flex-col items-center justify-center min-h-[460px] h-[calc(100dvh-180px)] p-6 bg-white dark:bg-[#0B0F19] font-sans text-xs text-center border border-slate-200 dark:border-slate-800 md:rounded-2xl">
        <div className="max-w-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{error}</p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/discussions/community')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4"
          >
            Back to Community Chat List
          </Button>
        </div>
      </div>
    );
  }

  const courseTitle = room?.course_title || room?.name || 'Course Community';

  return (
    <div
      style={{ height: typeof window !== 'undefined' && window.innerWidth < 768 ? viewportHeight : undefined }}
      className="bg-white dark:bg-[#0B0F19] border-0 sm:border border-slate-200 dark:border-slate-800 sm:rounded-2xl shadow-xs overflow-hidden h-dvh md:h-[calc(100vh-6rem)] min-h-[500px] flex flex-col font-sans text-xs text-left w-full max-w-5xl mx-auto min-w-0"
    >
      {/* 1. CHAT HEADER */}
      <div className="p-3 sm:px-4 sm:py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/90 dark:bg-[#0F172A] shrink-0 w-full max-w-full min-w-0 z-10 box-border">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/discussions/community')}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer shrink-0 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -ml-1"
          aria-label="Back to Community Chat List"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar / Thumbnail */}
        <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <CourseThumbnailImage
            src={room?.course_thumbnail || room?.thumbnail}
            alt={courseTitle}
            initials={courseTitle ? courseTitle.substring(0, 2) : 'CC'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Flexible Course Information */}
        <div className="flex-1 min-w-0 space-y-0.5 py-0.5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2 break-words max-w-full">
            {courseTitle}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1.5 leading-normal mt-0.5">
            <span>Course community</span>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                connectionState === 'connected'
                  ? 'bg-emerald-500'
                  : connectionState === 'connecting' || connectionState === 'reconnecting'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-slate-400'
              }`}
              title={`Connection state: ${connectionState}`}
              aria-label={`Connection state: ${connectionState}`}
            />
          </p>
        </div>

        {/* Refresh Icon-Only Button (44x44px target) */}
        <Button
          variant="outline"
          size="sm"
          onClick={loadRoomAndMessages}
          disabled={isLoading}
          className="h-11 w-11 min-w-[44px] min-h-[44px] p-0 flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0 shadow-2xs cursor-pointer transition-colors flex-none"
          aria-label="Refresh conversation"
          title="Refresh conversation"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* 2. MESSAGES SCROLL AREA */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/50 dark:bg-[#0B0F19] min-h-0 relative w-full max-w-full min-w-0 hide-scrollbar"
      >
        <div className="min-h-full flex flex-col justify-end space-y-2.5">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2 my-auto">
              <Users className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 opacity-60" />
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                Welcome to {courseTitle} Community
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                No messages yet. Send the first message to start this course conversation.
              </p>
            </div>
          ) : (
            groupedMessages.map((group, idx) => (
              <div key={idx} className="space-y-2.5">
                {/* Date separator badge */}
                <div className="flex justify-center my-2 sticky top-1 z-10">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-900/90 shadow-2xs backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-800/80">
                    {group.dateLabel}
                  </span>
                </div>

                {group.msgs.map((msg) => {
                  const isMine = Boolean(currentUserId && msg.senderId && String(msg.senderId) === String(currentUserId));
                  const senderName = msg.senderName || 'Member';
                  const timeStr = formatMessageTime(msg.createdAt);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1 w-full max-w-full min-w-0`}
                    >
                      {!isMine && (
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 px-1">
                          {senderName}
                        </span>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[72%] p-3 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed break-words shadow-2xs ${
                          isMine
                            ? 'bg-[#2563EB] text-white rounded-br-xs'
                            : 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#263244] rounded-bl-xs'
                        }`}
                      >
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-1.5 space-y-1">
                            {msg.attachments.map((att: any, attIdx: number) => {
                              const mediaUrl = att.media_url || att.url;
                              const isImage = (att.attachment_type || att.type || '').toLowerCase().includes('image') || (mediaUrl && /\.(png|jpe?g|gif|webp)$/i.test(mediaUrl));
                              return isImage ? (
                                <img
                                  key={att.id || attIdx}
                                  src={mediaUrl}
                                  alt={att.original_name || 'Attachment'}
                                  className="max-w-full max-h-60 rounded-lg object-cover border border-white/20"
                                />
                              ) : (
                                <a
                                  key={att.id || attIdx}
                                  href={mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-colors ${
                                    isMine
                                      ? 'bg-blue-700/60 hover:bg-blue-700 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <FileText className="w-4 h-4 shrink-0" />
                                  <span className="truncate flex-1">{att.original_name || att.name || 'Attachment'}</span>
                                  <Download className="w-3.5 h-3.5 shrink-0 opacity-80" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                        {msg.content && <p className="whitespace-pre-line leading-relaxed break-words">{msg.content}</p>}
                      </div>

                      <span className={`text-[10px] text-slate-400 dark:text-slate-500 px-1 font-normal ${isMine ? 'text-right' : 'text-left'}`}>
                        {timeStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={chatEndRef} className="h-1 shrink-0" />
        </div>
      </div>

      {/* 3. STICKY COMPOSER */}
      <form
        onSubmit={handleSendMessage}
        className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shrink-0 sticky bottom-0 z-20 w-full max-w-full min-w-0 box-border pb-safe space-y-1.5"
      >
        {/* Selected File / Upload Status Preview */}
        {(selectedFile || uploadError) && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            {uploadError ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium truncate">{uploadError}</span>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate font-medium text-slate-800 dark:text-slate-200">{selectedFile?.name}</span>
                {isUploadingFile ? (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold animate-pulse shrink-0">Uploading...</span>
                ) : (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">Ready</span>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title="Remove Attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!fileUploadEnabled && !uploadError && (
          <div className="px-3 py-1 text-[10px] font-normal text-slate-500 dark:text-slate-400">
            File uploads are disabled for this Community Chat.
          </div>
        )}

        <div className="flex items-end gap-1.5 sm:gap-2 w-full max-w-full min-w-0">
          {fileUploadEnabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile || sending}
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Attach File"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="relative flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={`Message ${courseTitle}...`}
              value={messageContent}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              className="w-full min-w-0 max-w-full rounded-xl sm:rounded-2xl border border-slate-300 dark:border-slate-700 py-2 sm:py-2.5 px-3 sm:px-3.5 pr-8 sm:pr-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-normal leading-relaxed min-h-[38px] sm:min-h-[42px] max-h-[120px] resize-none transition-all block box-border"
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2.5 bottom-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer p-0.5"
              title="Add Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            {showEmojiPicker && (
              <div className="absolute right-0 bottom-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 p-2 flex items-center gap-1 flex-wrap max-w-xs">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      setMessageContent((prev) => prev + e);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            disabled={sending || isUploadingFile || (!messageContent.trim() && !uploadedMediaId)}
            className="h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 font-medium text-xs rounded-xl sm:rounded-2xl shrink-0 min-w-[56px] sm:min-w-[72px] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{sending ? '...' : 'Send'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
