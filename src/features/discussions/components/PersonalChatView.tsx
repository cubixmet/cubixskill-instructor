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
  X,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { discussionService } from '../../../services/discussion.service';
import { type StudentData } from '../../../services/students.service';
import { storageService } from '../../../services/storage.service';
import { useAuthStore } from '../../../store/auth.store';
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

  // Dynamic Visual Viewport Height tracking for Mobile Keyboard (Android/iOS Safari)
  const [viewportHeight, setViewportHeight] = useState<string | number>('100dvh');

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
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

  // 1. WebSocket Hook Integration for Active Room (Deduplicated & Stable)
  const handleIncomingSocketMessage = useCallback((newMsg: any) => {
    if (!newMsg || (!newMsg.id && !newMsg.uuid && !newMsg.message_id)) return;
    const normalized = normalizeChatMessage(newMsg);

    setMessages((prev) => {
      if (prev.some((m) => String(m.id) === normalized.id)) {
        return prev;
      }
      const updated = [...prev, normalized].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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

  // 3. Fetch Eligible Enrolled Students when New Chat modal opens
  useEffect(() => {
    if (newChatModalOpen) {
      setIsLoadingStudents(true);
      discussionService
        .listEligibleUsers(studentSearch)
        .then((res) => {
          setEligibleStudents(res || []);
        })
        .catch(() => {
          setEligibleStudents([]);
        })
        .finally(() => {
          setIsLoadingStudents(false);
        });
    }
  }, [newChatModalOpen, studentSearch]);

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
      const normalized = msgs.map(normalizeChatMessage);
      const sorted = [...normalized].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sorted);
      // Mark read
      await discussionService.markChatRoomRead(roomId).catch(() => {});
      // Scroll to bottom immediately upon initial load
      setTimeout(() => scrollToBottom('auto'), 50);
    } catch {
      setMessagesError('Failed to load message history.');
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

  // Image Attachment & Lightbox State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-Chat Message Search State
  const [showInChatSearch, setShowInChatSearch] = useState<boolean>(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files (JPEG, PNG, GIF, WebP) are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds maximum allowed limit of 10MB.');
      return;
    }

    setSelectedFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInChatSearch = async (query: string) => {
    setInChatSearchQuery(query);
    if (!query.trim() || !activeRoom?.id) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await discussionService.searchInChatMessages(activeRoom.id, query);
      setSearchResults(res);
    } catch {
      setSearchResults([]);
    }
  };

  const handleJumpToMessage = (msgId: string) => {
    setHighlightedMsgId(msgId);
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setHighlightedMsgId(null), 3000);
    }
  };

  // Optimistic Send & Retry
  const executeSendMessage = async (tempId: string, contentToSend: string, mediaFileIds: string[] = []) => {
    try {
      const createdMsg = await discussionService.sendChatMessage(activeRoom.id, contentToSend, mediaFileIds);
      const normalized = normalizeChatMessage({ ...createdMsg, delivery_status: 'SENT' });
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? normalized : m))
      );
      setChatRooms((prev) =>
        prev.map((r) => (r.id === activeRoom.id ? { ...r, last_message: createdMsg } : r))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, deliveryStatus: 'FAILED' } : m))
      );
    }
  };

  const handleRetryMessage = (msg: NormalizedChatMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, deliveryStatus: 'PENDING' } : m))
    );
    executeSendMessage(msg.id, msg.content, []);
  };

  // Handle Send Message (Optimistic + Images + Ticks)
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!messageContent.trim() && !selectedFile) || sending || !activeRoom?.id) return;

    setSending(true);
    const contentToSend = messageContent.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Clear input immediately
    setMessageContent('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    let uploadedMediaIds: string[] = [];
    let localPreview = imagePreviewUrl;

    if (selectedFile) {
      setUploadingImage(true);
      try {
        const uploadRes = await storageService.uploadFile(selectedFile);
        if (uploadRes?.id) {
          uploadedMediaIds = [uploadRes.id];
        }
      } catch {
        alert('Failed to upload image. Please try again.');
        setSending(false);
        setUploadingImage(false);
        return;
      }
    }

    handleCancelFile();

    // Optimistic message item
    const optimisticMsg: NormalizedChatMessage = {
      id: tempId,
      roomId: activeRoom.id,
      senderId: currentUserId,
      senderName: currentUser?.full_name || 'You',
      content: contentToSend,
      createdAt: new Date().toISOString(),
      attachments: localPreview ? [{ media_url: localPreview }] : [],
      deliveryStatus: 'PENDING',
      clientId: tempId,
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom('smooth');

    await executeSendMessage(tempId, contentToSend, uploadedMediaIds);
    setSending(false);
    setUploadingImage(false);

    // Keep textarea focused on mobile after sending so keyboard stays open
    if (textareaRef.current) {
      textareaRef.current.focus();
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
    <div
      style={{ height: activeRoom && typeof window !== 'undefined' && window.innerWidth < 768 ? viewportHeight : undefined }}
      className={`bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 md:rounded-2xl shadow-xs overflow-hidden font-sans text-xs text-left w-full max-w-full min-w-0 ${
        activeRoom
          ? 'h-dvh md:h-[calc(100dvh-180px)] md:min-h-[460px]'
          : 'h-[calc(100dvh-130px)] md:h-[calc(100dvh-180px)] min-h-[460px]'
      } flex flex-col`}
    >
      <div className="flex flex-1 h-full min-h-0 w-full max-w-full min-w-0 relative">
        
        {/* PART A — PERSONAL CONVERSATION LIST (Mobile: hidden if activeRoom is open; Desktop: fixed width w-80 lg:w-96) */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-[#0F172A] h-full min-h-0 ${
            activeRoom ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-[#111827] shrink-0 w-full max-w-full min-w-0">
            <div className="flex items-center justify-between gap-3 w-full min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg sm:text-xl tracking-tight leading-tight">
                  Personal Chats
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-normal">
                  Private 1-on-1 messages with enrolled students
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setNewChatModalOpen(true)}
                className="h-10 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shrink-0 px-3.5 min-w-[100px] shadow-xs flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </Button>
            </div>
            <div className="w-full min-w-0">
              <Input
                placeholder="Search chats or people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                className="h-10 text-sm w-full min-w-0 box-border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          {/* Student Chat List Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 min-h-0 w-full max-w-full min-w-0 pb-16 md:pb-0">
            {isLoadingRooms ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
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
                const rawName = room.name || otherUser?.full_name || otherUser?.email || 'Student';
                const avatarUrl = otherUser?.avatar || otherUser?.profile_photo;
                const targetStudentId = String(otherUser?.user_id || otherUser?.id || room.other_participant_id || '');
                const lastMsgObj = typeof room.last_message === 'object' ? room.last_message : null;
                const lastMsgContent = lastMsgObj?.content || (typeof room.last_message === 'string' ? room.last_message : room.latest_message || room.last_message_preview);
                const senderId = lastMsgObj?.sender_id || lastMsgObj?.sender?.id;
                const attachments = lastMsgObj?.attachments || lastMsgObj?.media_files;
                const timestamp = lastMsgObj?.created_at || room.last_message_at;

                return (
                  <ConversationRowItem
                    key={room.id}
                    id={room.id}
                    title={rawName}
                    avatarUrl={avatarUrl}
                    lastMessageContent={lastMsgContent}
                    lastMessageSenderId={senderId}
                    lastMessageAttachments={attachments}
                    timestamp={timestamp}
                    unreadCount={room.unread_count || 0}
                    isActive={isActive}
                    currentUserId={currentUserId}
                    onClick={() => {
                      setActiveRoom(room);
                      onSelectStudentChat(targetStudentId);
                    }}
                  />
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
                      onClick={() => setShowInChatSearch(!showInChatSearch)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                      title="Search messages"
                    >
                      <Search className="w-4 h-4" />
                    </button>
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

              {/* In-Chat Message Search Drawer */}
              {showInChatSearch && (
                <div className="p-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 z-10">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search inside this conversation..."
                      value={inChatSearchQuery}
                      onChange={(e) => handleInChatSearch(e.target.value)}
                      leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                      className="h-8 text-xs bg-white dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowInChatSearch(false);
                        setInChatSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {searchResults.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => handleJumpToMessage(res.id)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="truncate text-slate-800 dark:text-slate-200">{res.content}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{formatMessageTime(res.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                      {group.msgs.map((msg) => {
                        const isMine = Boolean(currentUserId) && Boolean(msg.senderId) && String(msg.senderId) === String(currentUserId);
                        const formattedTime = formatMessageTime(msg.createdAt);
                        const isHighlighted = highlightedMsgId === msg.id;

                        return (
                          <div
                            key={msg.id}
                            id={`msg-${msg.id}`}
                            className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1 w-full max-w-full min-w-0 transition-colors duration-500 ${
                              isHighlighted ? 'bg-amber-100/50 dark:bg-amber-900/30 p-1 rounded-xl' : ''
                            }`}
                          >
                            <div
                              className={`max-w-[82%] sm:max-w-[72%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed break-words shadow-xs ${
                                isMine
                                  ? 'bg-blue-600 text-white rounded-br-xs'
                                  : 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                              }`}
                            >
                              {/* Image Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mb-2 space-y-1">
                                  {msg.attachments.map((att: any, idx: number) => {
                                    const mediaUrl = att.media_url || att.url;
                                    return (
                                      <img
                                        key={idx}
                                        src={mediaUrl}
                                        alt={att.original_name || 'Attachment'}
                                        onClick={() => setLightboxUrl(mediaUrl)}
                                        className="max-w-full max-h-60 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity border border-white/20"
                                      />
                                    );
                                  })}
                                </div>
                              )}

                              {msg.content && (
                                <p className="whitespace-pre-wrap leading-relaxed overflow-wrap-anywhere">{msg.content}</p>
                              )}
                            </div>

                            <div className={`flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 px-1 font-normal ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <span>{formattedTime}</span>

                              {/* WhatsApp Ticks for sent messages */}
                              {isMine && (
                                <span className="inline-flex items-center ml-0.5" title={`Status: ${msg.deliveryStatus || 'SENT'}`}>
                                  {msg.deliveryStatus === 'PENDING' && (
                                    <Clock className="w-3 h-3 text-slate-300 animate-spin" aria-label="Pending" />
                                  )}
                                  {msg.deliveryStatus === 'SENT' && (
                                    <Check className="w-3.5 h-3.5 text-slate-300" aria-label="Sent" />
                                  )}
                                  {msg.deliveryStatus === 'DELIVERED' && (
                                    <CheckCheck className="w-3.5 h-3.5 text-slate-300" aria-label="Delivered" />
                                  )}
                                  {msg.deliveryStatus === 'READ' && (
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-400 dark:text-blue-400 font-bold" aria-label="Read" />
                                  )}
                                  {msg.deliveryStatus === 'FAILED' && (
                                    <button
                                      type="button"
                                      onClick={() => handleRetryMessage(msg)}
                                      className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                                      aria-label="Retry failed send"
                                    >
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <span>Retry</span>
                                    </button>
                                  )}
                                </span>
                              )}
                            </div>
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
                {/* Image Attachment Preview Bar */}
                {imagePreviewUrl && (
                  <div className="mb-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={imagePreviewUrl} alt="Upload preview" className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-300 dark:border-slate-600" />
                      <span className="text-xs text-slate-700 dark:text-slate-200 truncate">{selectedFile?.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelFile}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 w-full max-w-full min-w-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-pointer shrink-0"
                    title="Attach Image"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

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
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                    disabled={sending || (!messageContent.trim() && !selectedFile)}
                    className="h-10 bg-blue-600 hover:bg-blue-700 text-white px-4 font-medium text-xs rounded-2xl shrink-0 min-w-[72px] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">{sending || uploadingImage ? '...' : 'Send'}</span>
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
            ) : eligibleStudents.length > 0 ? (
              eligibleStudents.map((user: any) => {
                const userName = user.full_name || user.email || 'User';
                const userEmail = user.email || '';
                const userId = user.id;

                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectStudentForChat(userId)}
                    className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {user.avatar ? (
                        <img src={user.avatar} alt={userName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 font-medium text-xs flex items-center justify-center shrink-0">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <strong className="font-semibold text-slate-900 dark:text-slate-100 block truncate">{userName}</strong>
                        {userEmail && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate">{userEmail}</span>
                        )}
                      </div>
                    </div>

                    <Button size="sm" variant="outline" className="h-7 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shrink-0 ml-2">
                      {user.existing_room_id ? 'Open Chat' : 'Start Chat'}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-slate-500 space-y-1">
                <p className="font-semibold">No eligible members found.</p>
                <p className="text-[11px]">Searching authorized academy or course participants.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-white/10 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxUrl} alt="Enlarged preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
};
