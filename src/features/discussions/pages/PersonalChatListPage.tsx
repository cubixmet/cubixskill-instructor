import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { studentsService, type StudentData } from '../../../services/students.service';
import { authStore } from '../../../store/auth.store';
import { courseRoutes } from '../../../utils/courseRoutes.utils';
import { normalizeCourseId } from '../../../utils/courseValidation.utils';

function formatMessageTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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

  // Fetch eligible enrolled students when New DM modal opens
  useEffect(() => {
    if (newChatModalOpen) {
      setIsLoadingStudents(true);
      const queryParams: Record<string, any> = {};
      if (courseId) queryParams.course = courseId;

      studentsService
        .listStudents(queryParams)
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
  }, [newChatModalOpen, courseId]);

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
    <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 md:rounded-2xl shadow-xs overflow-hidden h-[calc(100dvh-130px)] md:h-[calc(100dvh-180px)] min-h-[460px] flex flex-col font-sans text-xs text-left w-full max-w-full min-w-0">
      {/* Header & Controls */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-[#111827] shrink-0 w-full max-w-full min-w-0">
        <div className="flex items-center justify-between gap-2 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight">
              Personal Chats
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
              Private 1-on-1 messages with enrolled students
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setNewChatModalOpen(true)}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shrink-0 px-3 min-w-fit shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New DM</span>
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

      {/* Student Conversation List Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 min-h-0 w-full max-w-full min-w-0 bg-slate-50/50 dark:bg-[#0B0F19]">
        {isLoadingRooms ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : roomsError ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-rose-600 dark:text-rose-400 font-semibold text-xs">{roomsError}</p>
            <Button size="sm" variant="outline" onClick={loadChatRooms}>
              Try Again
            </Button>
          </div>
        ) : filteredRooms.length > 0 ? (
          filteredRooms.map((room) => {
            const otherUser = room.other_participant || room.participants?.find((p: any) => String(p.user_id || p.id) !== currentUserId);
            const studentName = room.name || otherUser?.full_name || otherUser?.email || 'Student';
            const avatarUrl = otherUser?.avatar || otherUser?.profile_photo;
            const lastMsgText = getLastMessagePreview(room, currentUserId);
            const formattedTime = formatMessageTime(
              typeof room.last_message === 'object' ? room.last_message?.created_at : (room.last_message_at || room.updated_at)
            );
            const targetStudentId = getStudentIdFromRoom(room, currentUserId);
            const targetPath = courseRoutes.discussions.personal(courseId, targetStudentId);

            return (
              <Link
                key={room.id}
                to={targetPath}
                className="p-3.5 sm:px-5 flex items-center gap-3.5 cursor-pointer transition-all hover:bg-slate-100/70 dark:hover:bg-slate-900/60 bg-white dark:bg-[#111827] border-l-4 border-l-transparent hover:border-l-blue-500 w-full max-w-full min-w-0 text-inherit no-underline block"
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
              </Link>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3 my-auto">
            <MessageCircle className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 opacity-60" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {search ? 'No matching conversations' : 'No personal chats yet'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {search
                  ? 'Try searching for another student name or message text.'
                  : 'Click "+ New DM" to start a private 1-on-1 conversation with an enrolled student.'}
              </p>
            </div>
            {!search && (
              <Button
                size="sm"
                onClick={() => setNewChatModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 h-8 text-xs"
              >
                + Start First DM
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
