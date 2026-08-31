import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  MessageCircle,
  Search,
  Send,
  ArrowLeft,
  Smile,
  ShieldCheck,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { discussionService } from '../../../services/discussion.service';
import { studentsService, type StudentData } from '../../../services/students.service';
import { authStore, useAuthStore } from '../../../store/auth.store';
import { usePersonalChatSocket } from '../hooks/usePersonalChatSocket';
import { normalizeChatMessage, type NormalizedChatMessage } from '../utils/chatNormalizer';

export interface PersonalChatViewProps {
  courseUuid?: string;
  activeStudentUuid?: string | null;
  onSelectStudentChat: (studentUuid: string) => void;
}

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

function getLastMessagePreview(room: any, currentUserId: string): string {
  if (!room) return 'No messages yet';

  let content = '';
  let senderId = '';
  let hasMedia = false;
  let mediaType = '';

  if (room.last_message && typeof room.last_message === 'object') {
    content = (room.last_message.content || '').trim();
    senderId = String(room.last_message.sender_id || room.last_message.sender?.id || '');

    if (Array.isArray(room.last_message.media_files) && room.last_message.media_files.length > 0) {
      hasMedia = true;
    } else if (Array.isArray(room.last_message.attachments) && room.last_message.attachments.length > 0) {
      hasMedia = true;
      const att = room.last_message.attachments[0];
      mediaType = String(att?.attachment_type || att?.type || '').toLowerCase();
    }
  } else if (typeof room.last_message === 'string' && room.last_message.trim()) {
    content = room.last_message.trim();
  } else if (typeof room.latest_message === 'string' && room.latest_message.trim()) {
    content = room.latest_message.trim();
  } else if (typeof room.last_message_preview === 'string' && room.last_message_preview.trim()) {
    content = room.last_message_preview.trim();
  }

  if (!content && hasMedia) {
    if (mediaType.includes('image')) content = '[Photo]';
    else if (mediaType.includes('video')) content = '[Video]';
    else if (mediaType.includes('audio')) content = '[Audio]';
    else content = '[Attachment]';
  }

  if (!content) {
    return 'No messages yet';
  }

  const isMine = Boolean(currentUserId && senderId === currentUserId);
  return isMine ? `You: ${content}` : content;
}

export const PersonalChatView: React.FC<PersonalChatViewProps> = ({
  courseUuid,
  activeStudentUuid,
  onSelectStudentChat,
}) => {
  const [search, setSearch] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false);

  // Authenticated user identity for message side alignment (reactive hook)
  const { user: currentUser } = useAuthStore();
  const currentUserId = String(currentUser?.id || (currentUser as any)?.user_id || '');

  // Real Backend Data State
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Real Enrolled Students for New DM Modal
  const [eligibleStudents, setEligibleStudents] = useState<StudentData[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousMessageCountRef = useRef<number>(0);

  // Smooth / Auto bottom scroll anchor helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  }, []);

  // 1. WebSocket Hook Integration for Active Room (Deduplicated & Stable)
  const handleIncomingSocketMessage = useCallback((newMsg: any) => {
    if (!newMsg || !newMsg.id) return;
    const msgId = String(newMsg.id);

    setMessages((prev) => {
      if (prev.some((m) => String(m.id) === msgId)) {
        return prev;
      }
      const updated = [...prev, newMsg].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return updated;
    });

    // Update last message preview in chatRooms list
    setChatRooms((prev) =>
      prev.map((r) =>
        String(r.id) === String(newMsg.room_id || activeRoom?.id)
          ? { ...r, last_message: newMsg, latest_message: newMsg.content }
          : r
      )
    );
  }, [activeRoom?.id]);

  const { connectionState } = usePersonalChatSocket(activeRoom?.id, handleIncomingSocketMessage);

  // 2. Fetch Real Chat Rooms from Backend
  const loadChatRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    setRoomsError(null);
    try {
      const rooms = await discussionService.listChatRooms(courseUuid || undefined);
      // Filter DIRECT rooms for 1-to-1 personal chat
      const directRooms = rooms.filter((r: any) => r.room_type === 'DIRECT' || !r.room_type);
      setChatRooms(directRooms);
    } catch {
      setRoomsError("Failed to load personal chat conversations.");
    } finally {
      setIsLoadingRooms(false);
    }
  }, [courseUuid]);

  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  // 3. Fetch Eligible Enrolled Students when New DM modal opens
  useEffect(() => {
    if (newChatModalOpen) {
      setIsLoadingStudents(true);
      const params: Record<string, any> = {};
      if (courseUuid) params.course = courseUuid;

      studentsService
        .listStudents(params)
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.results || [];
          setEligibleStudents(list);
        })
        .catch(() => {
          setEligibleStudents([]);
        })
        .finally(() => {
          setIsLoadingStudents(false);
        });
    }
  }, [newChatModalOpen, courseUuid]);

  // 4. Resolve active room when activeStudentUuid changes or on direct URL hard refresh
  useEffect(() => {
    const invalidKeywords = ['undefined', 'null', 'new', 'create', 'all'];
    if (!activeStudentUuid || invalidKeywords.includes(String(activeStudentUuid).toLowerCase())) {
      setActiveRoom(null);
      return;
    }

    // If activeRoom is already set and matches activeStudentUuid, preserve it
    if (activeRoom) {
      const otherUser = activeRoom.other_participant || activeRoom.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
      const otherId = String(otherUser?.user_id || otherUser?.id || activeRoom.other_participant_id || '');
      if (otherId === String(activeStudentUuid) || String(activeRoom.id) === String(activeStudentUuid)) {
        return;
      }
    }

    if (chatRooms.length > 0) {
      const found = chatRooms.find((r: any) => {
        const otherUser = r.other_participant || r.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
        return (
          String(otherUser?.user_id || otherUser?.id) === String(activeStudentUuid) ||
          String(r.other_participant_id) === String(activeStudentUuid) ||
          String(r.id) === String(activeStudentUuid)
        );
      });
      if (found) {
        setActiveRoom(found);
        return;
      }
    }

    // If activeStudentUuid is in URL but not found in preloaded rooms list, fetch or create room directly
    if (!isLoadingRooms) {
      discussionService
        .getOrCreatePersonalChatRoom(courseUuid || '', activeStudentUuid)
        .then((room) => {
          if (room) {
            setChatRooms((prev) => {
              const exists = prev.some((r) => r.id === room.id);
              return exists ? prev : [room, ...prev];
            });
            setActiveRoom(room);
          }
        })
        .catch(() => {});
    }
  }, [activeStudentUuid, chatRooms, isLoadingRooms, courseUuid, currentUserId, activeRoom]);

  // 5. Fetch Real Messages when activeRoom changes & Sort Chronologically (Oldest -> Newest)
  const loadMessages = useCallback(async (roomId: string) => {
    setIsLoadingMessages(true);
    setMessagesError(null);
    try {
      const msgs = await discussionService.listChatMessages(roomId);
      const sorted = [...msgs].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setMessages(sorted);
      // Mark read
      await discussionService.markChatRoomRead(roomId).catch(() => {});
      // Scroll to bottom immediately upon initial load
      setTimeout(() => scrollToBottom('auto'), 50);
    } catch {
      setMessagesError("Failed to load chat messages.");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [scrollToBottom]);

  useEffect(() => {
    if (activeRoom?.id) {
      loadMessages(activeRoom.id);
    } else {
      setMessages([]);
    }
  }, [activeRoom?.id, loadMessages]);

  // Auto-scroll logic & new message banner detection
  useEffect(() => {
    if (activeRoom && messages.length > 0) {
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
  }, [activeRoom, messages, scrollToBottom]);

  // Scroll listener to hide "New messages ↓" banner when near bottom
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 120) {
      setShowNewMessageBanner(false);
    }
  };

  // Filtered conversations list
  const filteredRooms = useMemo(() => {
    return chatRooms.filter((r) => {
      const otherUser = r.other_participant || r.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
      const title = r.name || otherUser?.full_name || otherUser?.email || 'Student';
      const lastMsg = r.last_message?.content || r.latest_message || '';
      const q = search.toLowerCase();
      return title.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
    });
  }, [chatRooms, search, currentUserId]);

  // Group messages chronologically with date separators
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

  // Handle New DM student selection
  const handleSelectStudentForChat = async (studentId: string) => {
    setNewChatModalOpen(false);
    try {
      const room = await discussionService.getOrCreatePersonalChatRoom(courseUuid || '', studentId);
      setChatRooms((prev) => {
        const exists = prev.some((r) => r.id === room.id);
        return exists ? prev : [room, ...prev];
      });
      setActiveRoom(room);
      onSelectStudentChat(studentId);
    } catch {
      // Handled cleanly
    }
  };

  // Handle Send Message (Stays in room, scrolls to bottom, NO navigation)
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageContent.trim() || sending || !activeRoom?.id) return;

    setSending(true);
    const contentToSend = messageContent.trim();
    setMessageContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const createdMsg = await discussionService.sendChatMessage(activeRoom.id, contentToSend);
      setMessages((prev) => {
        if (prev.some((m) => String(m.id) === String(createdMsg.id))) return prev;
        const updated = [...prev, createdMsg].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        return updated;
      });
      // Update last message in room list
      setChatRooms((prev) =>
        prev.map((r) => (r.id === activeRoom.id ? { ...r, last_message: createdMsg } : r))
      );
      scrollToBottom('smooth');
    } catch {
      // Revert message content on failure
      setMessageContent(contentToSend);
    } finally {
      setSending(false);
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

  const activeStudentInfo = useMemo(() => {
    if (!activeRoom) return { full_name: 'Student', email: '', avatar: null };
    const otherUser = activeRoom.other_participant || activeRoom.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
    return {
      full_name: otherUser?.full_name || activeRoom.name || 'Student',
      email: otherUser?.email || activeRoom.student_email || '',
      avatar: otherUser?.avatar || otherUser?.profile_photo || null,
    };
  }, [activeRoom, currentUserId]);

  return (
    <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 md:rounded-2xl shadow-xs overflow-hidden h-[calc(100dvh-130px)] md:h-[calc(100dvh-180px)] min-h-[460px] flex flex-col font-sans text-xs text-left w-full max-w-full min-w-0">
      <div className="flex flex-1 h-full min-h-0 w-full max-w-full min-w-0 relative">
        
        {/* PART A — PERSONAL CONVERSATION LIST (Mobile: hidden if activeRoom is open; Desktop: fixed width w-80 lg:w-96) */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-[#0F172A] h-full min-h-0 ${
            activeRoom ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-[#111827] shrink-0 w-full max-w-full min-w-0">
            <div className="flex items-center justify-between gap-2 w-full min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight">Personal Chats</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                  1-on-1 messages with enrolled students
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setNewChatModalOpen(true)}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shrink-0 px-3 min-w-fit shadow-xs"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                New DM
              </Button>
            </div>
            <div className="w-full min-w-0">
              <Input
                placeholder="Search students or conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
                className="h-9 text-xs w-full min-w-0 box-border bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Student Chat List Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 min-h-0 w-full max-w-full min-w-0">
            {isLoadingRooms ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : roomsError ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-rose-600 dark:text-rose-400 font-semibold text-xs">{roomsError}</p>
                <Button size="sm" variant="outline" onClick={loadChatRooms}>
                  Try Again
                </Button>
              </div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const isActive = String(room.id) === String(activeRoom?.id);
                const otherUser = room.other_participant || room.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
                const studentName = room.name || otherUser?.full_name || otherUser?.email || 'Student';
                const avatarUrl = otherUser?.avatar || otherUser?.profile_photo;
                const lastMsgText = getLastMessagePreview(room, currentUserId);
                const formattedTime = formatMessageTime(
                  typeof room.last_message === 'object' ? room.last_message?.created_at : (room.last_message_at || room.updated_at)
                );
                const targetStudentId = String(otherUser?.user_id || otherUser?.id || room.other_participant_id || '');

                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      setActiveRoom(room);
                      onSelectStudentChat(targetStudentId);
                    }}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all w-full max-w-full min-w-0 border-l-4 ${
                      isActive
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 border-l-blue-600 dark:border-l-blue-500'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-900/60 bg-white dark:bg-[#111827] border-l-transparent'
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={studentName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-sm flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/40">
                        {studentName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1 w-full min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate flex-1 min-w-0">
                          {studentName}
                        </span>
                        {formattedTime && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal shrink-0">
                            {formattedTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 w-full min-w-0">
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate font-normal flex-1 min-w-0">
                          {lastMsgText}
                        </p>
                        {room.unread_count > 0 && (
                          <span className="bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-full text-[10px] shrink-0">
                            {room.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <MessageCircle className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500" />
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                  {search ? 'No matching conversations' : 'No personal chats yet'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {search ? 'Try searching for another student or name.' : 'Start a private conversation with an enrolled student.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PART B — PERSONAL CHAT THREAD (Mobile: full screen active chat; Desktop: flex-1) */}
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-[#111827] h-full min-h-0 w-full max-w-full min-w-0 ${
            !activeRoom ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeRoom ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3 sm:px-4 sm:py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#0F172A] shrink-0 w-full max-w-full min-w-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Back button for Mobile (The ONLY action that leaves active thread) */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoom(null);
                      onSelectStudentChat('');
                    }}
                    className="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer shrink-0 transition-colors"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {activeStudentInfo.avatar ? (
                    <img
                      src={activeStudentInfo.avatar}
                      alt={activeStudentInfo.full_name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
                      {(activeStudentInfo.full_name || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                      {activeStudentInfo.full_name || 'Student'}
                    </h3>
                    {activeStudentInfo.email && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate block">
                        {activeStudentInfo.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Realtime Connection Status Indicator */}
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
                            if (activeRoom?.id) discussionService.markChatRoomRead(activeRoom.id);
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

              {/* Chat Messages History Container */}
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/50 dark:bg-[#0B0F19] min-h-0 relative w-full max-w-full min-w-0 hide-scrollbar"
              >
                <div className="min-h-full flex flex-col justify-end space-y-3">
                  {isLoadingMessages ? (
                    <div className="p-4 space-y-3 my-auto">
                      <Skeleton className="h-10 w-1/2 ml-auto rounded-2xl" />
                      <Skeleton className="h-12 w-2/3 rounded-2xl" />
                      <Skeleton className="h-10 w-1/3 ml-auto rounded-2xl" />
                    </div>
                ) : messagesError ? (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-rose-600 dark:text-rose-400 font-semibold text-xs">{messagesError}</p>
                    <Button size="sm" variant="outline" onClick={() => loadMessages(activeRoom.id)}>
                      Try Again
                    </Button>
                  </div>
                ) : groupedMessages.length > 0 ? (
                  groupedMessages.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-3">
                      {/* Date Separator Pill */}
                      <div className="flex justify-center my-2">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800/70 px-2.5 py-0.5 rounded-full border border-slate-300/40 dark:border-slate-700/40">
                          {group.dateLabel}
                        </span>
                      </div>

                      {/* Messages in Date Group */}
                      {group.msgs.map((rawMsg) => {
                        const msg: NormalizedChatMessage = normalizeChatMessage(rawMsg);
                        const isMine = Boolean(currentUserId && msg.senderId && msg.senderId === currentUserId);

                        const formattedTime = formatMessageTime(msg.createdAt);

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1 w-full max-w-full min-w-0`}
                          >
                            <div
                              className={`max-w-[82%] sm:max-w-[72%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed break-words shadow-xs ${
                                isMine
                                  ? 'bg-blue-600 text-white rounded-br-xs'
                                  : 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap leading-relaxed overflow-wrap-anywhere">{msg.content}</p>
                            </div>

                            <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 font-normal">
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

                <div ref={chatEndRef} />
                </div>
              </div>

              {/* WhatsApp-Style Sticky Composer */}
              <form
                onSubmit={handleSend}
                className="p-2.5 sm:p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shrink-0 sticky bottom-0 z-20 w-full max-w-full min-w-0 box-border pb-safe"
              >
                <div className="flex items-end gap-2 w-full max-w-full min-w-0">
                  <div className="relative flex-1 min-w-0">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      placeholder="Write a message..."
                      value={messageContent}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      className="w-full min-w-0 max-w-full rounded-2xl border border-slate-300 dark:border-slate-700 py-2.5 px-3.5 pr-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-normal leading-relaxed min-h-[42px] max-h-[120px] resize-none transition-all block box-border"
                    />

                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 bottom-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer p-0.5"
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
                    disabled={sending || !messageContent.trim()}
                    className="h-10 bg-blue-600 hover:bg-blue-700 text-white px-4 font-medium text-xs rounded-2xl shrink-0 min-w-[72px] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">{sending ? '...' : 'Send'}</span>
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <MessageCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 opacity-50" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Select a Conversation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs font-normal">
                Choose a student conversation from the left pane to view and send private 1-on-1 messages.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NEW DM MODAL — LOADS REAL ENROLLED STUDENTS FROM BACKEND */}
      <Modal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        title="Start Private Student Chat"
        subtitle="Select an enrolled student to start a private conversation."
        maxWidth="sm"
      >
        <div className="space-y-3 font-sans text-xs text-left">
          <Input
            placeholder="Search enrolled students..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
          />

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {isLoadingStudents ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : eligibleStudents.filter((s) =>
                (s.full_name || s.display_name || s.name || s.email || '')
                  .toLowerCase()
                  .includes(studentSearch.toLowerCase())
              ).length > 0 ? (
              eligibleStudents
                .filter((s) =>
                  (s.full_name || s.display_name || s.name || s.email || '')
                    .toLowerCase()
                    .includes(studentSearch.toLowerCase())
                )
                .map((student) => {
                  const studentName = student.full_name || student.display_name || student.name || 'Student';
                  const studentEmail = student.email || student.user?.email || '';
                  const studentUserId = student.user_id || student.user?.id || student.id;

                  return (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudentForChat(studentUserId)}
                      className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 font-medium text-xs flex items-center justify-center shrink-0">
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <strong className="font-semibold text-slate-900 dark:text-slate-100 block truncate">{studentName}</strong>
                          {studentEmail && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate">{studentEmail}</span>
                          )}
                        </div>
                      </div>

                      <Button size="sm" variant="outline" className="h-7 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shrink-0 ml-2">
                        Start Chat
                      </Button>
                    </div>
                  );
                })
            ) : (
              <div className="p-6 text-center text-slate-500 space-y-1">
                <p className="font-semibold">No eligible enrolled students found.</p>
                <p className="text-[11px]">Ensure students are enrolled in this course or academy.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
