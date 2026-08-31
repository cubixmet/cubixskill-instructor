import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AttachmentItem {
  id: string;
  name: string;
  sizeMb: number;
  type: 'pdf' | 'image' | 'doc' | 'zip' | 'audio' | 'video' | 'link';
  url: string;
}

export interface AuthorUser {
  uuid: string;
  name: string;
  role: 'instructor' | 'student' | 'ta';
  avatar?: string;
}

export interface EmojiReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  parentReplyId?: string;
  author: AuthorUser;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  likes: number;
  userLiked?: boolean;
  isOfficialAnswer?: boolean;
  isPinned?: boolean;
  isHidden?: boolean;
  attachments?: AttachmentItem[];
  mentions?: string[];
  quotedReply?: {
    id: string;
    authorName: string;
    contentSnippet: string;
  };
  reactions?: EmojiReaction[];
}

export interface DiscussionItem {
  id: string;
  courseUuid: string;
  title: string;
  shortDescription: string;
  content: string;
  category: 'General' | 'Q&A' | 'Feedback' | 'Announcements' | 'Assignments' | 'Technical';
  tags: string[];
  author: AuthorUser;
  createdAt: string;
  updatedAt: string;
  repliesCount: number;
  views: number;
  likes: number;
  userLiked?: boolean;
  isPinned: boolean;
  isLocked: boolean;
  isArchived: boolean;
  isResolved: boolean;
  isAnnouncement: boolean;
  officialAnswerReplyId?: string;
  attachments: AttachmentItem[];
  visibility: 'all' | 'students' | 'instructors';
  allowReplies: boolean;
  allowStudentAttachments: boolean;
  notifyStudents: boolean;
  reactions?: EmojiReaction[];
}

export interface DiscussionReport {
  id: string;
  discussionId: string;
  replyId?: string;
  reportedBy: string;
  reason: 'Spam' | 'Abuse' | 'Duplicate' | 'Off Topic';
  snippet: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'removed' | 'warned';
}

export interface CourseDiscussionSettings {
  enableDiscussions: boolean;
  enableStudentTopics: boolean;
  enableAttachments: boolean;
  enableLikes: boolean;
  enableMentions: boolean;
  enableReports: boolean;
  enableInstructorAnnouncements: boolean;
  allowAnonymousQuestions?: boolean;
}

export interface CourseMember {
  uuid: string;
  name: string;
  role: 'instructor' | 'ta' | 'student';
  avatar?: string;
  email: string;
}

// Personal One-to-One Messaging Models
export interface PersonalChatMessage {
  id: string;
  conversationId: string;
  senderUuid: string;
  senderRole: 'instructor' | 'student';
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'seen';
  attachments?: AttachmentItem[];
  isEdited?: boolean;
}

export interface PersonalChatConversation {
  id: string; // UUID
  courseUuid: string;
  studentUuid: string;
  studentName: string;
  studentAvatar?: string;
  studentEmail: string;
  topicTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: 'sent' | 'delivered' | 'seen';
  messages: PersonalChatMessage[];
}

export interface DiscussionStoreState {
  discussions: DiscussionItem[];
  replies: DiscussionReply[];
  reports: DiscussionReport[];
  settings: Record<string, CourseDiscussionSettings>;
  members: Record<string, CourseMember[]>;
  personalChats: PersonalChatConversation[];

  // Actions
  addDiscussion: (discussion: Omit<DiscussionItem, 'id' | 'createdAt' | 'updatedAt' | 'repliesCount' | 'views' | 'likes'>) => DiscussionItem;
  updateDiscussion: (id: string, updates: Partial<DiscussionItem>) => void;
  deleteDiscussion: (id: string) => void;
  togglePinDiscussion: (id: string) => void;
  toggleLockDiscussion: (id: string) => void;
  toggleArchiveDiscussion: (id: string) => void;
  toggleResolveDiscussion: (id: string) => void;
  incrementViews: (id: string) => void;
  toggleLikeDiscussion: (id: string) => void;
  toggleDiscussionReaction: (discussionId: string, emoji: string, userName: string) => void;

  addReply: (reply: Omit<DiscussionReply, 'id' | 'createdAt' | 'likes'>) => DiscussionReply;
  updateReply: (id: string, updates: Partial<DiscussionReply>) => void;
  deleteReply: (id: string) => void;
  toggleLikeReply: (id: string) => void;
  togglePinReply: (id: string) => void;
  toggleHideReply: (id: string) => void;
  toggleReplyReaction: (replyId: string, emoji: string, userName: string) => void;
  markOfficialAnswer: (discussionId: string, replyId: string) => void;

  reportItem: (report: Omit<DiscussionReport, 'id' | 'createdAt' | 'status'>) => void;
  handleReportAction: (reportId: string, action: 'approved' | 'removed' | 'warned') => void;

  getCourseSettings: (courseUuid: string) => CourseDiscussionSettings;
  updateCourseSettings: (courseUuid: string, settings: Partial<CourseDiscussionSettings>) => void;
  getCourseMembers: (courseUuid: string) => CourseMember[];

  // Personal Chat Actions
  sendPersonalMessage: (courseUuid: string, studentUuid: string, content: string, senderRole: 'instructor' | 'student', attachments?: AttachmentItem[]) => void;
  markChatAsSeen: (conversationId: string) => void;
  getCoursePersonalChats: (courseUuid: string) => PersonalChatConversation[];
}

const DEFAULT_SETTINGS: CourseDiscussionSettings = {
  enableDiscussions: true,
  enableStudentTopics: true,
  enableAttachments: true,
  enableLikes: true,
  enableMentions: true,
  enableReports: true,
  enableInstructorAnnouncements: true,
  allowAnonymousQuestions: false,
};

const SEED_MEMBERS: CourseMember[] = [];
const SEED_DISCUSSIONS: DiscussionItem[] = [];
const SEED_REPLIES: DiscussionReply[] = [];
const SEED_REPORTS: DiscussionReport[] = [];

const SEED_PERSONAL_CHATS: PersonalChatConversation[] = [];

export const useDiscussionStore = create<DiscussionStoreState>()(
  persist(
    (set, get) => ({
      discussions: SEED_DISCUSSIONS,
      replies: SEED_REPLIES,
      reports: SEED_REPORTS,
      settings: {},
      members: {},
      personalChats: [],

      addDiscussion: (input) => {
        const newDisc: DiscussionItem = {
          ...input,
          id: `disc-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          repliesCount: 0,
          views: 1,
          likes: 0,
          reactions: [],
        };
        set((state) => ({ discussions: [newDisc, ...state.discussions] }));
        return newDisc;
      },

      updateDiscussion: (id, updates) => {
        set((state) => ({
          discussions: state.discussions.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        }));
      },

      deleteDiscussion: (id) => {
        set((state) => ({
          discussions: state.discussions.filter((d) => d.id !== id),
          replies: state.replies.filter((r) => r.discussionId !== id),
          reports: state.reports.filter((rep) => rep.discussionId !== id),
        }));
      },

      togglePinDiscussion: (id) => {
        set((state) => ({
          discussions: state.discussions.map((d) =>
            d.id === id ? { ...d, isPinned: !d.isPinned } : d
          ),
        }));
      },

      toggleLockDiscussion: (id) => {
        set((state) => ({
          discussions: state.discussions.map((d) =>
            d.id === id ? { ...d, isLocked: !d.isLocked } : d
          ),
        }));
      },

      toggleArchiveDiscussion: (id) => {
        set((state) => ({
          discussions: state.discussions.map((d) =>
            d.id === id ? { ...d, isArchived: !d.isArchived } : d
          ),
        }));
      },

      toggleResolveDiscussion: (id) => {
        set((state) => ({
          discussions: state.discussions.map((d) =>
            d.id === id ? { ...d, isResolved: !d.isResolved } : d
          ),
        }));
      },

      incrementViews: (id) => {
        set((state) => ({
          discussions: state.discussions.map((d) =>
            d.id === id ? { ...d, views: d.views + 1 } : d
          ),
        }));
      },

      toggleLikeDiscussion: (id) => {
        set((state) => ({
          discussions: state.discussions.map((d) => {
            if (d.id === id) {
              const liked = !d.userLiked;
              return {
                ...d,
                userLiked: liked,
                likes: liked ? d.likes + 1 : Math.max(0, d.likes - 1),
              };
            }
            return d;
          }),
        }));
      },

      toggleDiscussionReaction: (discussionId, emoji, userName) => {
        set((state) => ({
          discussions: state.discussions.map((d) => {
            if (d.id !== discussionId) return d;
            const existingReactions = d.reactions || [];
            const found = existingReactions.find((r) => r.emoji === emoji);
            let updated: EmojiReaction[];

            if (found) {
              const hasUser = found.users.includes(userName);
              if (hasUser) {
                const newUsers = found.users.filter((u) => u !== userName);
                if (newUsers.length === 0) {
                  updated = existingReactions.filter((r) => r.emoji !== emoji);
                } else {
                  updated = existingReactions.map((r) =>
                    r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r
                  );
                }
              } else {
                const newUsers = [...found.users, userName];
                updated = existingReactions.map((r) =>
                  r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r
                );
              }
            } else {
              updated = [...existingReactions, { emoji, count: 1, users: [userName] }];
            }

            return { ...d, reactions: updated };
          }),
        }));
      },

      addReply: (input) => {
        const newReply: DiscussionReply = {
          ...input,
          id: `rep-${Date.now()}`,
          createdAt: new Date().toISOString(),
          likes: 0,
          reactions: [],
        };

        set((state) => {
          const updatedDiscussions = state.discussions.map((d) =>
            d.id === input.discussionId
              ? { ...d, repliesCount: d.repliesCount + 1, updatedAt: new Date().toISOString() }
              : d
          );
          return {
            replies: [...state.replies, newReply],
            discussions: updatedDiscussions,
          };
        });

        return newReply;
      },

      updateReply: (id, updates) => {
        set((state) => ({
          replies: state.replies.map((r) =>
            r.id === id ? { ...r, ...updates, isEdited: true, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      deleteReply: (id) => {
        set((state) => {
          const target = state.replies.find((r) => r.id === id);
          if (!target) return state;

          const updatedDiscussions = state.discussions.map((d) =>
            d.id === target.discussionId
              ? { ...d, repliesCount: Math.max(0, d.repliesCount - 1) }
              : d
          );

          return {
            replies: state.replies.filter((r) => r.id !== id && r.parentReplyId !== id),
            discussions: updatedDiscussions,
          };
        });
      },

      toggleLikeReply: (id) => {
        set((state) => ({
          replies: state.replies.map((r) => {
            if (r.id === id) {
              const liked = !r.userLiked;
              return {
                ...r,
                userLiked: liked,
                likes: liked ? r.likes + 1 : Math.max(0, r.likes - 1),
              };
            }
            return r;
          }),
        }));
      },

      togglePinReply: (id) => {
        set((state) => ({
          replies: state.replies.map((r) => (r.id === id ? { ...r, isPinned: !r.isPinned } : r)),
        }));
      },

      toggleHideReply: (id) => {
        set((state) => ({
          replies: state.replies.map((r) => (r.id === id ? { ...r, isHidden: !r.isHidden } : r)),
        }));
      },

      toggleReplyReaction: (replyId, emoji, userName) => {
        set((state) => ({
          replies: state.replies.map((r) => {
            if (r.id !== replyId) return r;
            const existingReactions = r.reactions || [];
            const found = existingReactions.find((rx) => rx.emoji === emoji);
            let updated: EmojiReaction[];

            if (found) {
              const hasUser = found.users.includes(userName);
              if (hasUser) {
                const newUsers = found.users.filter((u) => u !== userName);
                if (newUsers.length === 0) {
                  updated = existingReactions.filter((rx) => rx.emoji !== emoji);
                } else {
                  updated = existingReactions.map((rx) =>
                    rx.emoji === emoji ? { ...rx, count: newUsers.length, users: newUsers } : rx
                  );
                }
              } else {
                const newUsers = [...found.users, userName];
                updated = existingReactions.map((rx) =>
                  rx.emoji === emoji ? { ...rx, count: newUsers.length, users: newUsers } : rx
                );
              }
            } else {
              updated = [...existingReactions, { emoji, count: 1, users: [userName] }];
            }

            return { ...r, reactions: updated };
          }),
        }));
      },

      markOfficialAnswer: (discussionId, replyId) => {
        set((state) => ({
          discussions: state.discussions.map((d) =>
            d.id === discussionId
              ? {
                  ...d,
                  isResolved: true,
                  officialAnswerReplyId: d.officialAnswerReplyId === replyId ? undefined : replyId,
                }
              : d
          ),
          replies: state.replies.map((r) => {
            if (r.discussionId === discussionId) {
              if (r.id === replyId) {
                return { ...r, isOfficialAnswer: !r.isOfficialAnswer };
              }
              return { ...r, isOfficialAnswer: false };
            }
            return r;
          }),
        }));
      },

      reportItem: (input) => {
        const newReport: DiscussionReport = {
          ...input,
          id: `rep-sp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({ reports: [newReport, ...state.reports] }));
      },

      handleReportAction: (reportId, action) => {
        set((state) => ({
          reports: state.reports.map((r) => (r.id === reportId ? { ...r, status: action } : r)),
        }));
      },

      getCourseSettings: (courseUuid) => {
        const existing = get().settings[courseUuid];
        return existing || DEFAULT_SETTINGS;
      },

      updateCourseSettings: (courseUuid, newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [courseUuid]: {
              ...(state.settings[courseUuid] || DEFAULT_SETTINGS),
              ...newSettings,
            },
          },
        }));
      },

      getCourseMembers: (courseUuid) => {
        return get().members[courseUuid] || SEED_MEMBERS;
      },

      sendPersonalMessage: (courseUuid, studentUuid, content, senderRole, attachments) => {
        const now = new Date().toISOString();
        set((state) => {
          const existingChat = state.personalChats.find(
            (c) => c.courseUuid === courseUuid && c.studentUuid === studentUuid
          );

          if (existingChat) {
            const newMsg: PersonalChatMessage = {
              id: `pm-${Date.now()}`,
              conversationId: existingChat.id,
              senderUuid: senderRole === 'instructor' ? 'inst-1' : studentUuid,
              senderRole,
              senderName: senderRole === 'instructor' ? 'Dr. Vikramaditya Rao' : existingChat.studentName,
              senderAvatar: senderRole === 'instructor' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' : existingChat.studentAvatar,
              content,
              timestamp: now,
              status: 'sent',
              attachments,
            };

            const updatedChats = state.personalChats.map((c) =>
              c.id === existingChat.id
                ? {
                    ...c,
                    lastMessage: content,
                    lastMessageAt: now,
                    status: 'sent' as const,
                    messages: [...c.messages, newMsg],
                  }
                : c
            );

            return { personalChats: updatedChats };
          } else {
            const memberList = state.members[courseUuid] || SEED_MEMBERS;
            const targetStudent: { uuid: string; name: string; email: string; avatar?: string } = memberList.find((m) => m.uuid === studentUuid) || {
              uuid: studentUuid,
              name: 'Student User',
              email: 'student@gmail.com',
              avatar: undefined,
            };

            const newChatId = `pchat-${studentUuid}`;
            const newMsg: PersonalChatMessage = {
              id: `pm-${Date.now()}`,
              conversationId: newChatId,
              senderUuid: senderRole === 'instructor' ? 'inst-1' : studentUuid,
              senderRole,
              senderName: senderRole === 'instructor' ? 'Dr. Vikramaditya Rao' : targetStudent.name,
              senderAvatar: senderRole === 'instructor' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' : targetStudent.avatar || '',
              content,
              timestamp: now,
              status: 'sent',
              attachments,
            };

            const newConversation: PersonalChatConversation = {
              id: newChatId,
              courseUuid,
              studentUuid,
              studentName: targetStudent.name,
              studentAvatar: targetStudent.avatar || '',
              studentEmail: targetStudent.email,
              lastMessage: content,
              lastMessageAt: now,
              unreadCount: 0,
              status: 'sent',
              messages: [newMsg],
            };

            return { personalChats: [newConversation, ...state.personalChats] };
          }
        });
      },

      markChatAsSeen: (conversationId) => {
        set((state) => ({
          personalChats: state.personalChats.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0, status: 'seen' } : c
          ),
        }));
      },

      getCoursePersonalChats: (courseUuid) => {
        if (!courseUuid) return get().personalChats;
        return get().personalChats.filter((c) => c.courseUuid === courseUuid);
      },
    }),
    {
      name: 'cubixskill_discussions_store_v3',
    }
  )
);
