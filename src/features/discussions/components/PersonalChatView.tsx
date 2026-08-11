import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Search,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  ArrowLeft,
  AlertTriangle,
  Smile,
  ShieldCheck,
  Plus,
  Trash2,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import type {
  PersonalChatConversation,
  CourseMember,
  AttachmentItem,
} from '../store/discussion.store';

export interface PersonalChatViewProps {
  courseUuid: string;
  conversations: PersonalChatConversation[];
  courseMembers: CourseMember[];
  activeStudentUuid?: string | null;
  onSelectStudentChat: (studentUuid: string) => void;
  onSendMessage: (
    studentUuid: string,
    content: string,
    attachments?: AttachmentItem[]
  ) => void;
  onMarkSeen: (conversationId: string) => void;
}

const EMOJIS = ['👍', '💡', '🔥', '🎯', '🙌', '❤️', '😊', '👏'];

export const PersonalChatView: React.FC<PersonalChatViewProps> = ({
  courseUuid: _,
  conversations,
  courseMembers,
  activeStudentUuid,
  onSelectStudentChat,
  onSendMessage,
  onMarkSeen,
}) => {
  const [search, setSearch] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [failedMessageIds, setFailedMessageIds] = useState<string[]>([]);
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false);

  // Attachments state
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef<number>(0);

  const students = courseMembers.filter((m) => m.role === 'student');

  // Active Conversation
  const activeConversation = conversations.find(
    (c) => c.studentUuid === activeStudentUuid
  );

  // Auto-scroll logic & new message banner detection
  useEffect(() => {
    if (activeConversation) {
      onMarkSeen(activeConversation.id);

      const currentCount = activeConversation.messages.length;
      const container = chatContainerRef.current;

      if (container) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 120;

        if (previousMessageCountRef.current === 0 || isNearBottom) {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (currentCount > previousMessageCountRef.current) {
          setTimeout(() => setShowNewMessageBanner(true), 0);
        }
      } else {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

      previousMessageCountRef.current = currentCount;
    } else {
      previousMessageCountRef.current = 0;
    }
  }, [activeConversation, onMarkSeen]);

  const filteredConversations = conversations.filter(
    (c) =>
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageContent.trim() && attachments.length === 0) || sending) return;
    if (!activeStudentUuid) return;

    setSending(true);
    const contentToSend = messageContent;
    const attachmentsToSend = attachments.length > 0 ? [...attachments] : undefined;

    setMessageContent('');
    setAttachments([]);

    try {
      onSendMessage(activeStudentUuid, contentToSend, attachmentsToSend);
      setTimeout(() => {
        setSending(false);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setSending(false);
      setFailedMessageIds((prev) => [...prev, `failed-${Date.now()}`]);
    }
  };

  const handleRetryFailed = (msgId: string, content: string) => {
    setFailedMessageIds((prev) => prev.filter((id) => id !== msgId));
    if (activeStudentUuid) {
      onSendMessage(activeStudentUuid, content);
    }
  };

  const handleAddAttachment = () => {
    const newAtt: AttachmentItem = {
      id: `att-${Date.now()}`,
      name: `Document_${attachments.length + 1}.pdf`,
      sizeMb: 1.4,
      type: 'pdf',
      url: '#',
    };
    setAttachments([...attachments, newAtt]);
  };

  const renderStatusTicks = (status: 'sent' | 'delivered' | 'seen') => {
    if (status === 'seen') {
      return (
        <span title="Seen">
          <CheckCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        </span>
      );
    }
    if (status === 'delivered') {
      return (
        <span title="Delivered">
          <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </span>
      );
    }
    return (
      <span title="Sent">
        <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden h-[calc(100dvh-170px)] min-h-[480px] max-h-[850px] flex flex-col font-sans text-xs text-left w-full max-w-full min-w-0">
      <div className="grid grid-cols-1 md:grid-cols-3 flex-1 h-full min-h-0 w-full max-w-full min-w-0">
        {/* PART A — PERSONAL CONVERSATION LIST (< md: full page; >= md: left sidebar) */}
        <div
          className={`md:col-span-1 border-r border-slate-200/80 flex flex-col bg-slate-50/50 h-full min-h-0 w-full max-w-full min-w-0 ${
            activeStudentUuid ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-3 sm:p-4 border-b border-slate-200/80 space-y-2.5 bg-white shrink-0 w-full max-w-full min-w-0">
            <div className="flex items-center justify-between gap-2 w-full min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Personal Chats</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                  1-on-1 messages with enrolled students
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setNewChatModalOpen(true)}
                className="h-8 text-xs bg-[#2563EB] text-white font-bold shrink-0 px-3 min-w-fit"
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
                leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                className="h-10 text-xs w-full min-w-0 box-border"
              />
            </div>
          </div>

          {/* Student Chat List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/90 min-h-0 w-full max-w-full min-w-0">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((chat) => {
                const isActive = chat.studentUuid === activeStudentUuid;
                const formattedTime = new Date(chat.lastMessageAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={chat.id}
                    onClick={() => onSelectStudentChat(chat.studentUuid)}
                    className={`p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-all w-full max-w-full min-w-0 ${
                      isActive
                        ? 'bg-blue-50/90 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-100/70 bg-white'
                    }`}
                  >
                    {chat.studentAvatar ? (
                      <img
                        src={chat.studentAvatar}
                        alt={chat.studentName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {chat.studentName.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1 w-full min-w-0">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm truncate flex-1 min-w-0">
                          {chat.studentName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {formattedTime}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs line-clamp-1 font-normal break-words w-full min-w-0">
                        {chat.lastMessage}
                      </p>

                      <div className="flex items-center justify-between text-[10px] pt-0.5 gap-1 w-full min-w-0">
                        <span className="text-blue-600 font-semibold truncate flex-1 min-w-0">
                          {chat.topicTitle || 'Private Inquiry'}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {renderStatusTicks(chat.status)}
                          {chat.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded-full text-[9px]">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageCircle className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600 text-xs">No personal conversations yet.</p>
                <p className="text-[11px] text-slate-400">Click "New DM" above to start a private student conversation.</p>
              </div>
            )}
          </div>
        </div>

        {/* PART B — PERSONAL CHAT THREAD (< md: dedicated thread page; >= md: right pane) */}
        <div
          className={`md:col-span-2 flex flex-col bg-white h-full min-h-0 w-full max-w-full min-w-0 ${
            !activeStudentUuid ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Mobile Header */}
              <div className="p-3 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70 shrink-0 w-full max-w-full min-w-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onSelectStudentChat('')}
                    className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 cursor-pointer shrink-0 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {activeConversation.studentAvatar ? (
                    <img
                      src={activeConversation.studentAvatar}
                      alt={activeConversation.studentName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {activeConversation.studentName.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                      {activeConversation.studentName}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium truncate block">
                      Student • {activeConversation.studentEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Private DM</span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onMarkSeen(activeConversation.id);
                          }}
                          className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                        >
                          Mark as Read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages Container */}
              <div
                ref={chatContainerRef}
                className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/40 min-h-0 relative w-full max-w-full min-w-0"
              >
                {/* Date Separator Example */}
                <div className="flex justify-center my-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                    Today
                  </span>
                </div>

                {activeConversation.messages.map((msg) => {
                  const isMe = msg.senderRole === 'instructor';
                  const isFailed = failedMessageIds.includes(msg.id);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full max-w-full min-w-0`}
                    >
                      <div
                        className={`p-3 rounded-2xl space-y-1 shadow-2xs max-w-[85%] sm:max-w-[78%] min-w-0 ${
                          isMe
                            ? 'bg-[#2563EB] text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                        }`}
                      >
                        <p className="text-xs leading-relaxed whitespace-pre-wrap overflow-wrap-anywhere break-words font-normal">
                          {msg.content}
                        </p>

                        {/* Message Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="pt-1.5 space-y-1">
                            {msg.attachments.map((att) => (
                              <div
                                key={att.id}
                                className={`flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-bold ${
                                  isMe
                                    ? 'bg-blue-700/60 text-white'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate flex-1">{att.name}</span>
                                <span className="text-[9px] opacity-75 shrink-0">
                                  ({att.sizeMb} MB)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Timestamp & Ticks */}
                        <div
                          className={`flex items-center justify-end gap-1 text-[9.5px] pt-0.5 ${
                            isMe ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && renderStatusTicks(msg.status)}
                        </div>
                      </div>

                      {/* Send Failure State */}
                      {isFailed && (
                        <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-bold pt-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Failed to send</span>
                          <button
                            type="button"
                            onClick={() => handleRetryFailed(msg.id, msg.content)}
                            className="underline text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Retry
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* New Message Floating Banner */}
                {showNewMessageBanner && (
                  <div className="sticky bottom-2 flex justify-center z-20">
                    <button
                      type="button"
                      onClick={() => {
                        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        setShowNewMessageBanner(false);
                      }}
                      className="bg-blue-600 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      New messages ↓
                    </button>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Footer (Mobile Full-Width Vertical Composer) */}
              <form
                onSubmit={handleSend}
                className="p-3 sm:p-4 border-t border-slate-200/90 space-y-2.5 bg-white shrink-0 sticky bottom-0 z-20 w-full max-w-full min-w-0 box-border"
              >
                {/* 1. Attachment / Storage Warning (Placed safely above textarea) */}
                <div className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5 w-full min-w-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate flex-1">File attachments consume storage credits after upload.</span>
                </div>

                {/* Attachments preview list */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 w-full min-w-0">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-1.5 p-1 px-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate max-w-[140px]">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachments([])}
                          className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Message Input (Row 1: 100% full width, multiline capable, no character-by-character wrap) */}
                <div className="relative w-full max-w-full min-w-0 flex-1">
                  <textarea
                    rows={2}
                    placeholder="Write a message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 pr-10 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-normal leading-relaxed overflow-wrap-break-word whitespace-pre-wrap break-normal block box-border min-h-[44px] max-h-[120px]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                    title="Add Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {/* Emoji Picker Popup */}
                  {showEmojiPicker && (
                    <div className="absolute right-0 bottom-12 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 flex items-center gap-1 flex-wrap max-w-xs">
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => {
                            setMessageContent((prev) => prev + e);
                            setShowEmojiPicker(false);
                          }}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-sm cursor-pointer"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Action Controls Row (Row 2: Attach File button left, compact Send button right) */}
                <div className="flex items-center justify-between gap-2 w-full max-w-full min-w-0 pt-0.5">
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors shrink-0"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Attach File</span>
                  </button>

                  <Button
                    type="submit"
                    disabled={sending}
                    className="h-9 sm:h-10 bg-[#2563EB] text-white px-4 font-bold text-xs rounded-xl shrink-0 min-w-[82px] w-auto"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageCircle className="w-12 h-12 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No Student Conversation Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Select a student conversation from the list to view and send private 1-on-1 messages.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NEW DM MODAL */}
      <Modal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        title="Start Private Student Chat"
        subtitle="Select an enrolled student in this course to start a private conversation."
        maxWidth="sm"
      >
        <div className="space-y-2.5 font-sans text-xs text-left max-h-[60vh] overflow-y-auto">
          {students.map((student) => (
            <div
              key={student.uuid}
              onClick={() => {
                onSelectStudentChat(student.uuid);
                setNewChatModalOpen(false);
              }}
              className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {student.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <strong className="font-bold text-slate-900 block truncate">{student.name}</strong>
                  <span className="text-[10px] text-slate-500 font-medium block truncate">{student.email}</span>
                </div>
              </div>

              <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold text-blue-600 shrink-0 ml-2">
                Start Chat
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
