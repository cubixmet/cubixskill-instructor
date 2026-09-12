import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Smile,
  ShieldCheck,
  MoreVertical,
  MessageCircle,
  RefreshCw,
  Paperclip,
  X,
  FileText,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { discussionService } from '../../../services/discussion.service';
import { coursesService } from '../../../services/courses.service';
import { storageService } from '../../../services/storage.service';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';
import { usePersonalChatSocket } from '../hooks/usePersonalChatSocket';
import { courseRoutes } from '../../../utils/courseRoutes.utils';
import { normalizeCourseId } from '../../../utils/courseValidation.utils';
import { normalizeChatMessage, type NormalizedChatMessage } from '../utils/chatNormalizer';

const RESERVED_KEYWORDS = ['undefined', 'null', 'new', 'create', 'all'];
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

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const PersonalChatStudentPage: React.FC = () => {
  const params = useParams<{ courseId?: string; courseUuid?: string; studentId?: string }>();
  const navigate = useNavigate();

  const rawCourseId = params.courseId || params.courseUuid;
  const courseId = normalizeCourseId(rawCourseId);
  const studentId = params.studentId?.trim();

  // Current authenticated user identity (reactive subscription)
  const { user: currentUser } = useAuthStore();
  const currentUserId = String(currentUser?.id || (currentUser as any)?.user_id || '');

  // Room & Messages state
  const [room, setRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Academy setting state
  const [fileUploadEnabled, setFileUploadEnabled] = useState<boolean>(true);

  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Academy Settings
  useEffect(() => {
    let mounted = true;
    authService.getAcademySettings().then((s) => {
      if (mounted && s && typeof s.personal_chat_file_upload_enabled === 'boolean') {
        setFileUploadEnabled(s.personal_chat_file_upload_enabled);
        if (!s.personal_chat_file_upload_enabled) {
          setSelectedFile(null);
          setUploadedMediaId(null);
        }
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Composer & UI state
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousMessageCountRef = useRef<number>(0);

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

  // Smooth / Auto bottom scroll anchor helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  }, []);

  // Handle incoming realtime socket messages
  const handleIncomingSocketMessage = useCallback((newMsg: any) => {
    if (!newMsg || (!newMsg.id && !newMsg.uuid && !newMsg.message_id)) return;
    const normalized = normalizeChatMessage(newMsg);

    setMessages((prev) => {
      if (prev.some((m) => String(m.id) === normalized.id)) return prev;
      const updated = [...prev, normalized].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return updated;
    });
  }, []);

  // WebSocket hook integration
  const { connectionState, sendMessage: sendWsMessage, markRead: sendWsMarkRead } = usePersonalChatSocket(room?.id, handleIncomingSocketMessage);

  // Load real room & message history for studentId
  const loadChatData = useCallback(async () => {
    if (!studentId || RESERVED_KEYWORDS.includes(studentId.toLowerCase())) {
      setIsLoading(false);
      setError('Invalid student conversation ID.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. First, search existing ChatRooms for a direct room matching this student
      const allRooms = await discussionService.listChatRooms();
      let resolvedRoom = allRooms.find((r: any) => {
        const otherUser = r.other_participant || r.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
        const otherId = String(
          otherUser?.user_id ||
          otherUser?.id ||
          otherUser?.uuid ||
          r.other_participant_id ||
          r.student_id ||
          r.student?.id ||
          ''
        );
        return (
          otherId === studentId ||
          String(r.id) === studentId ||
          (r.participants && r.participants.some((p: any) => String(p.user_id || p.id) === studentId))
        );
      });

      // 2. If no existing room was found, resolve an authoritative course_id before calling getOrCreatePersonalChatRoom
      if (!resolvedRoom) {
        let effectiveCourseId = courseId;
        if (!effectiveCourseId) {
          try {
            const courseRes = await coursesService.listCourses();
            const coursesList = Array.isArray(courseRes) ? courseRes : courseRes?.results || [];
            if (coursesList.length > 0) {
              effectiveCourseId = normalizeCourseId(coursesList[0].id);
            }
          } catch {
            // ignore course load failure
          }
        }

        if (!effectiveCourseId) {
          setError('No course context found for starting a 1-on-1 personal chat for this student.');
          setIsLoading(false);
          return;
        }

        // Call get-or-create ONCE with valid course_id
        resolvedRoom = await discussionService.getOrCreatePersonalChatRoom(effectiveCourseId, studentId);
      }

      setRoom(resolvedRoom);

      // 3. Load existing messages and sort chronologically (oldest -> newest)
      if (resolvedRoom?.id) {
        const msgs = await discussionService.listChatMessages(resolvedRoom.id);
        const normalized = msgs.map(normalizeChatMessage);
        const sorted = [...normalized].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sorted);
        // Mark read via WebSocket if connected
        sendWsMarkRead(sorted.length > 0 ? sorted[sorted.length - 1].id : undefined);
        setTimeout(() => scrollToBottom('auto'), 50);
      }
    } catch {
      setError('Failed to load student conversation. Ensure you have proper permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, courseId, currentUserId, scrollToBottom, sendWsMarkRead]);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  // Auto-scroll logic on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const currentCount = messages.length;
      const container = chatContainerRef.current;

      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 140;

        if (previousMessageCountRef.current === 0 || isNearBottom) {
          scrollToBottom('smooth');
        } else if (currentCount > previousMessageCountRef.current) {
          setShowNewMessageBanner(true);
        }
      } else {
        scrollToBottom('smooth');
      }

      previousMessageCountRef.current = currentCount;
    } else {
      previousMessageCountRef.current = 0;
    }
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 120) {
      setShowNewMessageBanner(false);
    }
  };

  // Group messages chronologically with date separators
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

  // Student header display info
  const studentInfo = useMemo(() => {
    if (!room) return { full_name: 'Student', email: '', avatar: null };
    const otherUser = room.other_participant || room.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
    return {
      full_name: otherUser?.full_name || room.name || 'Student',
      email: otherUser?.email || room.student_email || '',
      avatar: otherUser?.avatar || otherUser?.profile_photo || null,
    };
  }, [room, currentUserId]);

  // File selection & upload handler
  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fileUploadEnabled) return;

    setSelectedFile(file);
    setUploadError(null);
    setIsUploadingFile(true);

    try {
      const mediaItem = await storageService.uploadFile(file);
      if (mediaItem?.id) {
        setUploadedMediaId(mediaItem.id);
      } else {
        setUploadError('Upload succeeded but no media reference was returned.');
      }
    } catch (err: any) {
      setUploadError(err?.response?.data?.detail || 'Failed to upload file.');
      setUploadedMediaId(null);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setUploadedMediaId(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Send Message (Stays on page, scrolls to bottom, NO navigation)
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hasText = Boolean(messageContent.trim());
    const hasFile = Boolean(uploadedMediaId);

    if ((!hasText && !hasFile) || sending || isUploadingFile || !room?.id) return;

    setSending(true);
    setUploadError(null);
    const contentToSend = messageContent.trim();
    const mediaIdsToSend = uploadedMediaId ? [uploadedMediaId] : [];

    try {
      const sentViaWs = sendWsMessage({
        content: contentToSend,
        messageType: 'TEXT',
        mediaFileIds: mediaIdsToSend,
      });

      if (!sentViaWs) {
        const createdMsg = await discussionService.sendChatMessage(room.id, contentToSend, mediaIdsToSend);
        const normalized = normalizeChatMessage(createdMsg);
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === normalized.id)) return prev;
          const updated = [...prev, normalized].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return updated;
        });
      }

      setMessageContent('');
      setSelectedFile(null);
      setUploadedMediaId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (textareaRef.current) textareaRef.current.style.height = 'auto';

      scrollToBottom('smooth');
    } catch (err: any) {
      setMessageContent(contentToSend);
      if (err?.response?.data?.code === 'CHAT_FILE_UPLOAD_DISABLED' || err?.response?.status === 403) {
        setUploadError('File uploads are disabled by your Academy.');
        setFileUploadEnabled(false);
      } else {
        setUploadError(err?.response?.data?.detail || err?.message || 'Failed to send message.');
      }
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
      handleSend();
    }
  };

  const handleBackToChats = () => {
    navigate(courseRoutes.discussions.personal(courseId));
  };

  // Invalid studentId guard
  if (!studentId || RESERVED_KEYWORDS.includes(studentId.toLowerCase())) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] h-[calc(100dvh-180px)] p-6 bg-white dark:bg-[#0B0F19] font-sans text-xs text-center border border-slate-200 dark:border-slate-800 md:rounded-2xl">
        <div className="max-w-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center mx-auto">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Conversation Not Available
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The requested student conversation ID is invalid or cannot be loaded.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleBackToChats}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4"
          >
            Back to Personal Chats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height: typeof window !== 'undefined' && window.innerWidth < 768 ? viewportHeight : undefined }}
      className="bg-white dark:bg-[#0B0F19] border-0 sm:border border-slate-200 dark:border-slate-800 sm:rounded-2xl shadow-xs overflow-hidden h-dvh md:h-[calc(100vh-6rem)] min-h-[500px] flex flex-col font-sans text-xs text-left w-full max-w-5xl mx-auto min-w-0"
    >
      {/* 1. CHAT HEADER */}
      <div className="h-14 px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-[#0F172A] shrink-0 w-full max-w-full min-w-0 z-10">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleBackToChats}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer shrink-0 transition-colors"
            aria-label="Back to Personal Chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {studentInfo.avatar ? (
            <img
              src={studentInfo.avatar}
              alt={studentInfo.full_name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
              {(studentInfo.full_name || 'S').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
              {studentInfo.full_name || 'Student'}
            </h3>
            {studentInfo.email && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate block">
                {studentInfo.email}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Socket Connection Status */}
          <div
            className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            title={`Socket: ${connectionState}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionState === 'connected'
                  ? 'bg-emerald-500'
                  : connectionState === 'connecting' || connectionState === 'reconnecting'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span className="capitalize text-slate-600 dark:text-slate-300 hidden sm:inline">{connectionState}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Private DM</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-20 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (room?.id) sendWsMarkRead(messages.length > 0 ? messages[messages.length - 1].id : undefined);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                >
                  Mark as Read
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CHAT MESSAGES THREAD (Continuous flex-col stack with top spacer for natural bottom-anchored WhatsApp layout) */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/70 dark:bg-[#0B0F19] min-h-0 relative w-full max-w-full min-w-0 hide-scrollbar"
      >
        <div className="min-h-full flex flex-col justify-end space-y-2.5">
          {isLoading ? (
            <div className="p-4 space-y-3 my-auto">
              <Skeleton className="h-10 w-1/2 ml-auto rounded-2xl" />
              <Skeleton className="h-12 w-2/3 rounded-2xl" />
              <Skeleton className="h-10 w-1/3 ml-auto rounded-2xl" />
            </div>
          ) : error ? (
            <div className="p-6 text-center space-y-2 my-auto">
              <p className="text-rose-600 dark:text-rose-400 font-semibold text-xs">{error}</p>
              <Button size="sm" variant="outline" onClick={loadChatData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Try Again
              </Button>
            </div>
        ) : groupedMessages.length > 0 ? (
          groupedMessages.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              {/* Date Separator Pill */}
              <div className="flex justify-center my-2 sticky top-1 z-10">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-900/90 shadow-2xs backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-800/80">
                  {group.dateLabel}
                </span>
              </div>

              {/* Messages in Date Group */}
              {group.msgs.map((msg) => {
                const isMine = Boolean(currentUserId) && Boolean(msg.senderId) && String(msg.senderId) === String(currentUserId);

                if (import.meta.env.DEV) {
                  console.debug('[PersonalChat Message Identity]', {
                    messageId: msg.id,
                    senderId: msg.senderId,
                    currentUserId,
                    isMine,
                  });
                }

                const formattedTime = formatMessageTime(msg.createdAt);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1 w-full max-w-full min-w-0`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[72%] p-3 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed break-words shadow-2xs ${
                        isMine
                          ? 'bg-[#2563EB] text-white rounded-br-xs'
                          : 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#263244] rounded-bl-xs'
                      }`}
                    >
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-1.5 space-y-1">
                          {msg.attachments.map((att: any, attIdx: number) => (
                            <a
                              key={att.id || att.media_file_id || attIdx}
                              href={att.media_url || att.url}
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
                          ))}
                        </div>
                      )}
                      {msg.content && <p className="whitespace-pre-line leading-relaxed break-words">{msg.content}</p>}
                    </div>

                    <span className={`text-[10px] text-slate-400 dark:text-slate-500 px-1 font-normal ${isMine ? 'text-right' : 'text-left'}`}>
                      {formattedTime}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2 my-auto">
            <MessageCircle className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 opacity-60" />
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">No messages yet</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Send the first private message to start this conversation.</p>
          </div>
        )}

        {showNewMessageBanner && (
          <div className="sticky bottom-2 left-0 right-0 flex justify-center pointer-events-none z-10">
            <button
              type="button"
              onClick={() => {
                scrollToBottom('smooth');
                setShowNewMessageBanner(false);
              }}
              className="bg-blue-600 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5 pointer-events-auto"
            >
              New messages ↓
            </button>
          </div>
        )}

        <div ref={chatEndRef} className="h-1 shrink-0" />
        </div>
      </div>

      {/* 3. STICKY COMPOSER */}
      <form
        onSubmit={handleSend}
        className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shrink-0 sticky bottom-0 z-20 w-full max-w-full min-w-0 box-border pb-safe space-y-1.5"
      >
        {/* Pending Attachment Preview / Upload Error */}
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
              onClick={handleRemoveSelectedFile}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title="Remove Attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-1.5 sm:gap-2 w-full max-w-full min-w-0">
          {fileUploadEnabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelection}
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
              placeholder="Write a message..."
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
