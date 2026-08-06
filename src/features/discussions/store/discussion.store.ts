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

const SEED_MEMBERS: CourseMember[] = [
  { uuid: 'inst-1', name: 'Dr. Vikramaditya Rao', role: 'instructor', email: 'vikram@cubixskill.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { uuid: 'ta-1', name: 'Ananya Deshmukh', role: 'ta', email: 'ananya.ta@cubixskill.com', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' },
  { uuid: 'stu-101', name: 'Aarav Sharma', role: 'student', email: 'aarav@gmail.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
  { uuid: 'stu-102', name: 'Priya Patel', role: 'student', email: 'priya@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { uuid: 'stu-103', name: 'Rohan Mehta', role: 'student', email: 'rohan@gmail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
  { uuid: 'stu-104', name: 'Kavita Sundaram', role: 'student', email: 'kavita@gmail.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
];

const SEED_DISCUSSIONS: DiscussionItem[] = [
  {
    id: 'disc-550e8400-01',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'React 19 Server Actions vs standard API routes in Next.js 15',
    shortDescription: 'Best practices on when to trigger server actions vs traditional API endpoints.',
    content: 'When designing a scalable LMS application, how should we handle heavy data mutations? Are Server Actions recommended for multi-file form uploads, or should we stick to REST handlers?',
    category: 'Technical',
    tags: ['React 19', 'Next.js', 'Server Actions'],
    author: { uuid: 'stu-101', name: 'Aarav Sharma', role: 'student', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    createdAt: '2026-08-05T14:30:00Z',
    updatedAt: '2026-08-06T09:15:00Z',
    repliesCount: 3,
    views: 142,
    likes: 18,
    userLiked: true,
    isPinned: true,
    isLocked: false,
    isArchived: false,
    isResolved: true,
    isAnnouncement: false,
    officialAnswerReplyId: 'rep-550e-02',
    attachments: [
      { id: 'att-1', name: 'Architecture_Diagram.pdf', sizeMb: 2.4, type: 'pdf', url: '#' },
    ],
    visibility: 'all',
    allowReplies: true,
    allowStudentAttachments: true,
    notifyStudents: true,
    reactions: [
      { emoji: '💡', count: 8, users: ['Priya Patel', 'Rohan Mehta'] },
      { emoji: '🔥', count: 5, users: ['Dr. Vikramaditya Rao'] },
    ],
  },
  {
    id: 'disc-550e8400-02',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: '📢 IMPORTANT: Updated Office Hours & Assignment 2 Submission Guidelines',
    shortDescription: 'Please read carefully before submitting your module 3 assignments.',
    content: 'Hello everyone! We have extended the submission deadline for Assignment 2 to Friday 11:59 PM. Please ensure your GitHub repository is public and includes test coverage report screenshots.',
    category: 'Announcements',
    tags: ['Announcement', 'Assignment2', 'Deadline'],
    author: { uuid: 'inst-1', name: 'Dr. Vikramaditya Rao', role: 'instructor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    createdAt: '2026-08-04T10:00:00Z',
    updatedAt: '2026-08-04T10:00:00Z',
    repliesCount: 1,
    views: 310,
    likes: 45,
    userLiked: false,
    isPinned: true,
    isLocked: true,
    isArchived: false,
    isResolved: false,
    isAnnouncement: true,
    attachments: [
      { id: 'att-2', name: 'Assignment2_Rubric_V2.pdf', sizeMb: 1.1, type: 'pdf', url: '#' },
    ],
    visibility: 'all',
    allowReplies: false,
    allowStudentAttachments: false,
    notifyStudents: true,
    reactions: [
      { emoji: '🙌', count: 12, users: ['Aarav Sharma', 'Priya Patel'] },
    ],
  },
  {
    id: 'disc-550e8400-03',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Zustand hydration mismatch error in Next.js SSR',
    shortDescription: 'Receiving Text content does not match server-rendered HTML error.',
    content: 'Hi @Instructor, whenever I persist state in `usePlatformStore` and load the dashboard on refresh, React throws a hydration mismatch error. Is `useEffect` mounting state required?',
    category: 'Q&A',
    tags: ['Zustand', 'SSR', 'Hydration'],
    author: { uuid: 'stu-102', name: 'Priya Patel', role: 'student', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    createdAt: '2026-08-06T08:20:00Z',
    updatedAt: '2026-08-06T08:20:00Z',
    repliesCount: 2,
    views: 87,
    likes: 6,
    userLiked: false,
    isPinned: false,
    isLocked: false,
    isArchived: false,
    isResolved: false,
    isAnnouncement: false,
    attachments: [],
    visibility: 'all',
    allowReplies: true,
    allowStudentAttachments: true,
    notifyStudents: true,
  },
];

const SEED_REPLIES: DiscussionReply[] = [
  {
    id: 'rep-550e-01',
    discussionId: 'disc-550e8400-01',
    author: { uuid: 'stu-103', name: 'Rohan Mehta', role: 'student', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    content: 'Great question @Aarav Sharma! I ran into memory issues when sending files larger than 10MB through Server Actions directly.',
    createdAt: '2026-08-05T15:10:00Z',
    likes: 4,
    userLiked: false,
    mentions: ['Aarav Sharma'],
    reactions: [{ emoji: '👍', count: 3, users: ['Aarav Sharma'] }],
  },
  {
    id: 'rep-550e-02',
    discussionId: 'disc-550e8400-01',
    author: { uuid: 'inst-1', name: 'Dr. Vikramaditya Rao', role: 'instructor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    content: 'Here is the recommended architecture pattern: Use standard REST upload endpoints for large binary files (video/audio/zip) to avoid buffering payloads into Next.js Server Action memory. For form mutations with simple JSON payloads, Server Actions work perfectly.',
    createdAt: '2026-08-05T16:45:00Z',
    likes: 15,
    userLiked: true,
    isOfficialAnswer: true,
    isPinned: true,
    reactions: [{ emoji: '🎯', count: 7, users: ['Rohan Mehta', 'Aarav Sharma'] }],
  },
  {
    id: 'rep-550e-03',
    discussionId: 'disc-550e8400-01',
    parentReplyId: 'rep-550e-02',
    author: { uuid: 'stu-101', name: 'Aarav Sharma', role: 'student', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    content: 'Thank you @Dr. Vikramaditya Rao! That clarifies the exact tradeoff for media files vs forms.',
    createdAt: '2026-08-05T17:00:00Z',
    likes: 3,
    userLiked: false,
    mentions: ['Dr. Vikramaditya Rao'],
    quotedReply: {
      id: 'rep-550e-02',
      authorName: 'Dr. Vikramaditya Rao',
      contentSnippet: 'Here is the recommended architecture pattern: Use standard REST upload endpoints...',
    },
  },
  {
    id: 'rep-550e-04',
    discussionId: 'disc-550e8400-03',
    author: { uuid: 'inst-1', name: 'Dr. Vikramaditya Rao', role: 'instructor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    content: 'Yes! Use a custom `useHasMounted` hook or defer reading local persistent storage until after the initial client hydration cycle to eliminate mismatch warnings.',
    createdAt: '2026-08-06T09:00:00Z',
    likes: 5,
    userLiked: false,
  },
];

const SEED_REPORTS: DiscussionReport[] = [
  {
    id: 'rep-sp-1',
    discussionId: 'disc-550e8400-03',
    reportedBy: 'Kavita Sundaram',
    reason: 'Off Topic',
    snippet: 'This issue is already discussed in Lesson 4 Module Q&A thread.',
    createdAt: '2026-08-06T09:30:00Z',
    status: 'pending',
  },
];

const SEED_PERSONAL_CHATS: PersonalChatConversation[] = [
  {
    id: 'pchat-stu-101',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    studentUuid: 'stu-101',
    studentName: 'Aarav Sharma',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    studentEmail: 'aarav@gmail.com',
    topicTitle: 'Completed Quiz Question Clarification',
    lastMessage: 'Thank you Sir! The explanation for question 4 makes total sense now.',
    lastMessageAt: '2026-08-06T10:15:00Z',
    unreadCount: 2,
    status: 'seen',
    messages: [
      {
        id: 'pm-1',
        conversationId: 'pchat-stu-101',
        senderUuid: 'stu-101',
        senderRole: 'student',
        senderName: 'Aarav Sharma',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        content: 'Hello Dr. Vikram! I had a quick private doubt regarding Quiz 2 question 4. Does the server action revalidate the path automatically?',
        timestamp: '2026-08-06T09:40:00Z',
        status: 'seen',
      },
      {
        id: 'pm-2',
        conversationId: 'pchat-stu-101',
        senderUuid: 'inst-1',
        senderRole: 'instructor',
        senderName: 'Dr. Vikramaditya Rao',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        content: 'Hi Aarav! Yes, when calling `revalidatePath("/courses")` inside the server action, Next.js purges the router cache for all active subscribers immediately.',
        timestamp: '2026-08-06T10:00:00Z',
        status: 'seen',
      },
      {
        id: 'pm-3',
        conversationId: 'pchat-stu-101',
        senderUuid: 'stu-101',
        senderRole: 'student',
        senderName: 'Aarav Sharma',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        content: 'Thank you Sir! The explanation for question 4 makes total sense now.',
        timestamp: '2026-08-06T10:15:00Z',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'pchat-stu-102',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    studentUuid: 'stu-102',
    studentName: 'Priya Patel',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    studentEmail: 'priya@gmail.com',
    topicTitle: 'Assignment 2 Extension Request',
    lastMessage: 'I have attached my preliminary code draft screenshot for your review.',
    lastMessageAt: '2026-08-05T18:20:00Z',
    unreadCount: 0,
    status: 'seen',
    messages: [
      {
        id: 'pm-4',
        conversationId: 'pchat-stu-102',
        senderUuid: 'stu-102',
        senderRole: 'student',
        senderName: 'Priya Patel',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        content: 'Good evening Professor! I have attached my preliminary code draft screenshot for your review.',
        timestamp: '2026-08-05T18:20:00Z',
        status: 'seen',
      },
    ],
  },
  {
    id: 'pchat-stu-103',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    studentUuid: 'stu-103',
    studentName: 'Rohan Mehta',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    studentEmail: 'rohan@gmail.com',
    topicTitle: 'Certificate Eligibility Question',
    lastMessage: 'Is passing the final assignment required to issue the completion certificate?',
    lastMessageAt: '2026-08-04T12:00:00Z',
    unreadCount: 0,
    status: 'seen',
    messages: [
      {
        id: 'pm-5',
        conversationId: 'pchat-stu-103',
        senderUuid: 'stu-103',
        senderRole: 'student',
        senderName: 'Rohan Mehta',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        content: 'Is passing the final assignment required to issue the completion certificate?',
        timestamp: '2026-08-04T12:00:00Z',
        status: 'seen',
      },
    ],
  },
];

export const useDiscussionStore = create<DiscussionStoreState>()(
  persist(
    (set, get) => ({
      discussions: SEED_DISCUSSIONS,
      replies: SEED_REPLIES,
      reports: SEED_REPORTS,
      settings: {},
      members: {
        '550e8400-e29b-41d4-a716-446655440000': SEED_MEMBERS,
      },
      personalChats: SEED_PERSONAL_CHATS,

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
            const targetStudent = memberList.find((m) => m.uuid === studentUuid) || {
              uuid: studentUuid,
              name: 'Student User',
              email: 'student@gmail.com',
            };

            const newChatId = `pchat-${studentUuid}`;
            const newMsg: PersonalChatMessage = {
              id: `pm-${Date.now()}`,
              conversationId: newChatId,
              senderUuid: senderRole === 'instructor' ? 'inst-1' : studentUuid,
              senderRole,
              senderName: senderRole === 'instructor' ? 'Dr. Vikramaditya Rao' : targetStudent.name,
              senderAvatar: senderRole === 'instructor' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' : targetStudent.avatar,
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
              studentAvatar: targetStudent.avatar,
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
        return get().personalChats.filter((c) => c.courseUuid === courseUuid);
      },
    }),
    {
      name: 'cubixskill_discussions_store_v3',
    }
  )
);
