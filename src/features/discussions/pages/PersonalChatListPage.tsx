import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import {
  MessageCircle,
  Search,
  Plus,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { discussionService } from '../../../services/discussion.service';
import { type StudentData } from '../../../services/students.service';
import { authStore } from '../../../store/auth.store';
import { courseRoutes } from '../../../utils/courseRoutes.utils';
import { normalizeCourseId } from '../../../utils/courseValidation.utils';
import { ConversationRowItem } from '../components/ConversationRowItem';


function getStudentIdFromRoom(room: any, currentUserId: string): string {
  const otherUser = room.other_participant || room.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
  return String(
    otherUser?.user_id ||
    otherUser?.id ||
    otherUser?.uuid ||
    room.other_participant_id ||
    room.student_id ||
    room.student?.id ||
    room.student?.uuid ||
    room.student_user_id ||
    room.id ||
    ''
  ).trim();
}



export const PersonalChatListPage: React.FC = () => {
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const navigate = useNavigate();

  const rawCourseId = params.courseId || params.courseUuid;
  const courseId = normalizeCourseId(rawCourseId);

  const currentUser = authStore.getState().user;
  const currentUserId = String(currentUser?.id || (currentUser as any)?.user_id || '');

  // Backend Chat Rooms State
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  // Search & New DM Modal State
  const [search, setSearch] = useState('');
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState<StudentData[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Fetch real chat rooms
  const loadChatRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    setRoomsError(null);
    try {
      const rooms = await discussionService.listChatRooms(courseId || undefined);
      const directRooms = rooms.filter((r: any) => r.room_type === 'DIRECT' || !r.room_type);
      setChatRooms(directRooms);
    } catch {
      setRoomsError('Failed to load personal chat conversations.');
    } finally {
      setIsLoadingRooms(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  // Fetch eligible authorized users when New DM modal opens
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

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return chatRooms.filter((r) => {
      const otherUser = r.other_participant || r.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
      const title = r.name || otherUser?.full_name || otherUser?.email || 'Student';
      const lastMsg = r.last_message?.content || r.latest_message || '';
      const q = search.toLowerCase();
      return title.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
    });
  }, [chatRooms, search, currentUserId]);

  const handleSelectStudentForChat = async (studentId: string) => {
    setNewChatModalOpen(false);
    navigate(courseRoutes.discussions.personal(courseId, studentId));
  };

  return (
    <div className="bg-white dark:bg-[#0B0F19] border-0 md:border border-slate-200 dark:border-slate-800 md:rounded-2xl shadow-xs overflow-hidden h-[calc(100dvh-120px)] md:h-[calc(100dvh-180px)] min-h-[460px] flex flex-col font-sans text-xs text-left w-full max-w-full min-w-0">
      {/* Header & Controls */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-[#111827] shrink-0 w-full max-w-full min-w-0">
        <div className="flex items-center justify-between gap-3 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg sm:text-xl tracking-tight leading-tight">
              Personal Chats
            </h2>
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

      {/* Student Conversation List Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 min-h-0 w-full max-w-full min-w-0 bg-slate-50/50 dark:bg-[#0B0F19] pb-16">
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
            const otherUser = room.other_participant || room.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
            const rawName = room.name || otherUser?.full_name || otherUser?.email || 'Student';
            const avatarUrl = otherUser?.avatar || otherUser?.profile_photo;
            const targetStudentId = getStudentIdFromRoom(room, currentUserId);
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
                currentUserId={currentUserId}
                onClick={() => handleSelectStudentForChat(targetStudentId)}
              />
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3 my-auto">
            <MessageCircle className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 opacity-60" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {search ? 'No matching conversations' : 'No personal chats yet'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {search
                  ? 'Try searching for another student name or message text.'
                  : 'Click "New Chat" to start a private 1-on-1 conversation with an enrolled student.'}
              </p>
            </div>
            {!search && (
              <Button
                size="sm"
                onClick={() => setNewChatModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 h-9 text-xs"
              >
                + Start First Chat
              </Button>
            )}
          </div>
        )}
      </div>

      {/* NEW DM MODAL — LOADS REAL ENROLLED STUDENTS FROM BACKEND */}
      <Modal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        title="Start Private Student Chat"
        subtitle="Select an enrolled student to start a private 1-on-1 conversation."
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
    </div>
  );
};
