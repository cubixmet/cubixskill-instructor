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

  // Attachments state
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const students = courseMembers.filter((m) => m.role === 'student');

  // Active Conversation
  const activeConversation = conversations.find(
    (c) => c.studentUuid === activeStudentUuid
  );

  useEffect(() => {
    if (activeConversation) {
      onMarkSeen(activeConversation.id);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation, onMarkSeen]);

  const filteredConversations = conversations.filter(
    (c) =>
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() && attachments.length === 0) return;
    if (!activeStudentUuid) return;

    onSendMessage(
      activeStudentUuid,
      messageContent,
      attachments.length > 0 ? attachments : undefined
    );

    setMessageContent('');
    setAttachments([]);
  };

  const handleAddAttachment = () => {
    const newAtt: AttachmentItem = {
      id: `att-${Date.now()}`,
      name: `Private_Document_${attachments.length + 1}.pdf`,
      sizeMb: 1.5,
      type: 'pdf',
      url: '#',
    };
    setAttachments([...attachments, newAtt]);
  };

  const renderStatusTicks = (status: 'sent' | 'delivered' | 'seen') => {
    if (status === 'seen') {
      return <span title="Seen"><CheckCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" /></span>;
    }
    if (status === 'delivered') {
      return <span title="Delivered"><CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" /></span>;
    }
    return <span title="Sent"><Check className="w-3.5 h-3.5 text-slate-400 shrink-0" /></span>;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden min-h-[600px] flex flex-col font-sans text-xs text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 flex-1">
        {/* LEFT PANE: STUDENT CONVERSATION LIST */}
        <div
          className={`md:col-span-1 border-r border-slate-200/80 flex flex-col bg-slate-50/50 ${
            activeStudentUuid ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-200/80 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Personal Chats</h3>
              <Button
                size="sm"
                onClick={() => setNewChatModalOpen(true)}
                className="h-7 text-[11px] bg-blue-600 text-white font-bold"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                New DM
              </Button>
            </div>
            <Input
              placeholder="Search student DMs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          {/* Student Chat List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
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
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
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
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {chat.studentName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {formattedTime}
                        </span>
                      </div>

                      <p className="text-slate-600 text-[11px] line-clamp-1 font-normal">
                        {chat.lastMessage}
                      </p>

                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-blue-600 font-semibold truncate">
                          {chat.topicTitle || 'Private Inquiry'}
                        </span>
                        <div className="flex items-center gap-1">
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
              <div className="p-8 text-center text-slate-400 space-y-1">
                <MessageCircle className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">No chats found</p>
                <p className="text-[11px]">Click "New DM" above to start a private student conversation.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: CHAT WINDOW */}
        <div
          className={`md:col-span-2 flex flex-col bg-white ${
            !activeStudentUuid ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectStudentChat('')}
                    className="md:hidden p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {activeConversation.studentAvatar ? (
                    <img
                      src={activeConversation.studentAvatar}
                      alt={activeConversation.studentName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {activeConversation.studentName.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs">
                      {activeConversation.studentName}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Enrolled Student • {activeConversation.studentEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Private 1-on-1 DM Channel</span>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {activeConversation.messages.map((msg) => {
                  const isMe = msg.senderRole === 'instructor';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 max-w-[80%] ${
                        isMe ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                          {msg.senderName.charAt(0)}
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-2xl space-y-1 shadow-2xs ${
                          isMe
                            ? 'bg-[#2563EB] text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px]">
                          <span
                            className={`font-extrabold ${
                              isMe ? 'text-blue-100' : 'text-slate-600'
                            }`}
                          >
                            {msg.senderName}
                          </span>
                          <span
                            className={`text-[9px] ${
                              isMe ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed whitespace-pre-line">
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
                                <span className="truncate">{att.name}</span>
                                <span className="text-[9px] opacity-75">
                                  ({att.sizeMb} MB)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status Ticks (For sent messages) */}
                        {isMe && (
                          <div className="flex justify-end pt-0.5">
                            {renderStatusTicks(msg.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Footer */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-slate-200 space-y-2 bg-white relative"
              >
                {/* Instructor Storage Notice (If attaching file) */}
                <div className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Uploading files consumes storage credits. Storage credits are deducted after upload.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="text-blue-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Paperclip className="w-3 h-3" /> + Attach File
                  </button>
                </div>

                {/* Attachments preview */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-900"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        <span>{att.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachments([])}
                          className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative flex items-center gap-2">
                  <textarea
                    rows={2}
                    placeholder="Type private message to student..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 pr-10 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-14 top-3 text-slate-400 hover:text-blue-600 cursor-pointer"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <Button
                    type="submit"
                    className="h-10 bg-[#2563EB] text-white px-5 font-bold text-xs shrink-0"
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Send
                  </Button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute right-12 bottom-12 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 flex items-center gap-1">
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
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageCircle className="w-12 h-12 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No Student DM Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Select a student conversation from the left panel to view and send private messages.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NEW DM MODAL */}
      <Modal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        title="Start Private Student Chat (1-on-1 DM)"
        subtitle="Select an enrolled student in this course to start a private conversation."
        maxWidth="sm"
      >
        <div className="space-y-3 font-sans text-xs text-left max-h-[60vh] overflow-y-auto">
          {students.map((student) => (
            <div
              key={student.uuid}
              onClick={() => {
                onSelectStudentChat(student.uuid);
                setNewChatModalOpen(false);
              }}
              className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {student.name.charAt(0)}
                  </div>
                )}
                <div>
                  <strong className="font-bold text-slate-900 block">{student.name}</strong>
                  <span className="text-[10px] text-slate-500 font-medium">{student.email}</span>
                </div>
              </div>

              <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold text-blue-600">
                Start Chat
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
