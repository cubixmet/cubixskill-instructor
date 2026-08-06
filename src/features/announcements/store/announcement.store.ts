import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AnnouncementAttachment {
  id: string;
  name: string;
  sizeMb: number;
  type: 'pdf' | 'image' | 'doc' | 'zip' | 'audio' | 'video' | 'link';
  url: string;
}

export interface ReadReceipt {
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  isRead: boolean;
  readAt?: string;
}

export interface AnnouncementComment {
  id: string;
  announcementId: string;
  author: {
    uuid: string;
    name: string;
    role: 'instructor' | 'student' | 'ta';
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
  isPinned?: boolean;
}

export interface AnnouncementItem {
  id: string;
  courseUuid: string;
  courseTitle?: string;
  title: string;
  summary: string;
  content: string;
  category: 'General' | 'Exam & Quiz' | 'Assignment' | 'Schedule' | 'Important';
  priority: 'normal' | 'important' | 'urgent';
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  publishOption: 'now' | 'schedule' | 'draft';
  publishAt?: string;
  scheduledAt?: string;
  timezone?: string;
  isPinned: boolean;
  notifyStudents: boolean;
  sendEmail?: boolean;
  sendPush?: boolean;
  sendInApp?: boolean;
  allowComments: boolean;
  linkedLiveSessionId?: string;
  linkedLiveSessionTitle?: string;
  targetAudience?: 'entire_course' | 'specific_batch' | 'specific_students';
  author: {
    uuid: string;
    name: string;
    role: 'instructor' | 'ta';
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  attachments: AnnouncementAttachment[];
  readReceipts: ReadReceipt[];
  comments: AnnouncementComment[];
  viewsCount: number;
}

export interface AnnouncementStoreState {
  announcements: AnnouncementItem[];

  // Actions
  addAnnouncement: (announcement: Omit<AnnouncementItem, 'id' | 'createdAt' | 'updatedAt' | 'readReceipts' | 'comments' | 'viewsCount'>) => AnnouncementItem;
  updateAnnouncement: (id: string, updates: Partial<AnnouncementItem>) => void;
  deleteAnnouncement: (id: string) => void;
  duplicateAnnouncement: (id: string) => void;
  publishAnnouncement: (id: string) => void;
  scheduleAnnouncement: (id: string, scheduledAt: string) => void;
  archiveAnnouncement: (id: string) => void;
  togglePinAnnouncement: (id: string) => void;

  markAsRead: (announcementId: string, studentUuid: string) => void;
  addComment: (announcementId: string, author: AnnouncementComment['author'], content: string) => void;
  deleteComment: (announcementId: string, commentId: string) => void;
  toggleCommentLike: (announcementId: string, commentId: string) => void;

  getCourseAnnouncements: (courseUuid: string) => AnnouncementItem[];
}

const SEED_RECEIPTS: ReadReceipt[] = [
  { studentUuid: 'stu-101', studentName: 'Aarav Sharma', studentEmail: 'aarav@gmail.com', studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', isRead: true, readAt: '2026-08-05T11:20:00Z' },
  { studentUuid: 'stu-102', studentName: 'Priya Patel', studentEmail: 'priya@gmail.com', studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', isRead: true, readAt: '2026-08-05T12:05:00Z' },
  { studentUuid: 'stu-103', studentName: 'Rohan Mehta', studentEmail: 'rohan@gmail.com', studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', isRead: false },
  { studentUuid: 'stu-104', studentName: 'Kavita Sundaram', studentEmail: 'kavita@gmail.com', studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', isRead: true, readAt: '2026-08-05T14:40:00Z' },
];

const SEED_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'anc-550e-01',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'Full Stack Web Development Architecture',
    title: '📢 Module 3 Live Q&A Session Rescheduled to Friday',
    summary: 'The upcoming live interactive session on React 19 Server Components has been moved to Friday 5 PM IST.',
    content: `Dear Students,\n\nPlease note that our upcoming live interactive session on **React 19 Server Components & State Synchronization** has been rescheduled to Friday at 5:00 PM IST.\n\nWe will be covering:\n1. Server Actions vs Client State Sync\n2. Optimistic UI Mutations\n3. Q&A on Assignment 2 Submission\n\nPlease download the attached PDF slide deck prior to attending the session.`,
    category: 'Schedule',
    priority: 'important',
    status: 'published',
    publishOption: 'now',
    publishAt: '2026-08-05T10:00:00Z',
    isPinned: true,
    notifyStudents: true,
    sendEmail: true,
    sendPush: true,
    sendInApp: true,
    allowComments: true,
    linkedLiveSessionId: 'ls-550e-01',
    linkedLiveSessionTitle: '🚀 React 19 Architecture & Live Q&A Workshop',
    targetAudience: 'entire_course',
    author: {
      uuid: 'inst-1',
      name: 'Dr. Vikramaditya Rao',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
    attachments: [
      { id: 'att-anc-1', name: 'Module3_LiveSession_Slides.pdf', sizeMb: 3.2, type: 'pdf', url: '#' },
    ],
    readReceipts: SEED_RECEIPTS,
    comments: [
      {
        id: 'cm-1',
        announcementId: 'anc-550e-01',
        author: { uuid: 'stu-101', name: 'Aarav Sharma', role: 'student', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
        content: 'Thank you Sir! Will the recording be made available after Friday session?',
        createdAt: '2026-08-05T11:30:00Z',
        likes: 3,
      },
      {
        id: 'cm-2',
        announcementId: 'anc-550e-01',
        author: { uuid: 'inst-1', name: 'Dr. Vikramaditya Rao', role: 'instructor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        content: 'Yes Aarav! The high-definition recording will be uploaded to Module 3 within 2 hours of session completion.',
        createdAt: '2026-08-05T12:00:00Z',
        likes: 5,
        isPinned: true,
      },
    ],
    viewsCount: 184,
  },
  {
    id: 'anc-550e-02',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'Full Stack Web Development Architecture',
    title: '⚠️ Assignment 2 Deadline Extension & Final Rubric Released',
    summary: 'The deadline for Assignment 2 (Full-stack API Integration) is extended by 48 hours.',
    content: `Attention all enrolled students!\n\nDue to request from multiple student cohorts, we have extended the final submission deadline for Assignment 2 by 48 hours. The new deadline is Sunday August 10th at 11:59 PM.\n\nPlease carefully read the updated grading rubric attached below. Make sure to submit your public GitHub repository URL along with screenshot proofs.`,
    category: 'Assignment',
    priority: 'urgent',
    status: 'published',
    publishOption: 'now',
    publishAt: '2026-08-04T09:00:00Z',
    isPinned: true,
    notifyStudents: true,
    sendEmail: true,
    sendPush: true,
    sendInApp: true,
    allowComments: true,
    targetAudience: 'entire_course',
    author: {
      uuid: 'inst-1',
      name: 'Dr. Vikramaditya Rao',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    createdAt: '2026-08-04T09:00:00Z',
    updatedAt: '2026-08-04T09:00:00Z',
    attachments: [
      { id: 'att-anc-2', name: 'Assignment2_Final_Rubric_v2.pdf', sizeMb: 1.4, type: 'pdf', url: '#' },
    ],
    readReceipts: SEED_RECEIPTS,
    comments: [],
    viewsCount: 245,
  },
  {
    id: 'anc-550e-03',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'Full Stack Web Development Architecture',
    title: '🗓️ Upcoming Quiz 3 Scheduled for Next Tuesday',
    summary: 'Quiz 3 covering State Management and Custom Hooks will auto-release next Tuesday at 10 AM.',
    content: `Hello everyone,\n\nQuiz 3 is scheduled to automatically publish next Tuesday at 10:00 AM IST. It will consist of 15 multiple-choice questions and 1 practical code snippet exercise. Time duration is 30 minutes.`,
    category: 'Exam & Quiz',
    priority: 'normal',
    status: 'scheduled',
    publishOption: 'schedule',
    scheduledAt: '2026-08-11T10:00:00Z',
    timezone: 'Asia/Kolkata',
    isPinned: false,
    notifyStudents: true,
    sendEmail: true,
    sendInApp: true,
    allowComments: false,
    targetAudience: 'entire_course',
    author: {
      uuid: 'inst-1',
      name: 'Dr. Vikramaditya Rao',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    createdAt: '2026-08-06T08:00:00Z',
    updatedAt: '2026-08-06T08:00:00Z',
    attachments: [],
    readReceipts: [],
    comments: [],
    viewsCount: 0,
  },
];

export const useAnnouncementStore = create<AnnouncementStoreState>()(
  persist(
    (set, get) => ({
      announcements: SEED_ANNOUNCEMENTS,

      addAnnouncement: (input) => {
        const now = new Date().toISOString();
        const newAnc: AnnouncementItem = {
          ...input,
          id: `anc-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
          publishAt: input.publishOption === 'now' ? now : input.publishAt,
          status: input.publishOption === 'now' ? 'published' : input.publishOption === 'schedule' ? 'scheduled' : 'draft',
          readReceipts: SEED_RECEIPTS.map((r) => ({ ...r, isRead: false, readAt: undefined })),
          comments: [],
          viewsCount: 0,
        };

        set((state) => ({ announcements: [newAnc, ...state.announcements] }));
        return newAnc;
      },

      updateAnnouncement: (id, updates) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },

      deleteAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        }));
      },

      duplicateAnnouncement: (id) => {
        const target = get().announcements.find((a) => a.id === id);
        if (!target) return;
        const now = new Date().toISOString();

        const duplicated: AnnouncementItem = {
          ...target,
          id: `anc-${Date.now()}`,
          title: `${target.title} (Copy)`,
          status: 'draft',
          publishOption: 'draft',
          createdAt: now,
          updatedAt: now,
          viewsCount: 0,
          comments: [],
          readReceipts: SEED_RECEIPTS.map((r) => ({ ...r, isRead: false, readAt: undefined })),
        };

        set((state) => ({ announcements: [duplicated, ...state.announcements] }));
      },

      publishAnnouncement: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, status: 'published', publishOption: 'now', publishAt: now, updatedAt: now } : a
          ),
        }));
      },

      scheduleAnnouncement: (id, scheduledAt) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, status: 'scheduled', publishOption: 'schedule', scheduledAt, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },

      archiveAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, status: 'archived', updatedAt: new Date().toISOString() } : a
          ),
        }));
      },

      togglePinAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, isPinned: !a.isPinned, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },

      markAsRead: (announcementId, studentUuid) => {
        const now = new Date().toISOString();
        set((state) => ({
          announcements: state.announcements.map((a) => {
            if (a.id !== announcementId) return a;
            const updatedReceipts = a.readReceipts.map((r) =>
              r.studentUuid === studentUuid ? { ...r, isRead: true, readAt: now } : r
            );
            return {
              ...a,
              viewsCount: a.viewsCount + 1,
              readReceipts: updatedReceipts,
            };
          }),
        }));
      },

      addComment: (announcementId, author, content) => {
        const newComment: AnnouncementComment = {
          id: `cm-${Date.now()}`,
          announcementId,
          author,
          content,
          createdAt: new Date().toISOString(),
          likes: 0,
        };

        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === announcementId ? { ...a, comments: [...a.comments, newComment] } : a
          ),
        }));
      },

      deleteComment: (announcementId, commentId) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === announcementId
              ? { ...a, comments: a.comments.filter((c) => c.id !== commentId) }
              : a
          ),
        }));
      },

      toggleCommentLike: (announcementId, commentId) => {
        set((state) => ({
          announcements: state.announcements.map((a) => {
            if (a.id !== announcementId) return a;
            const updatedComments = a.comments.map((c) => {
              if (c.id === commentId) {
                const liked = !c.userLiked;
                return {
                  ...c,
                  userLiked: liked,
                  likes: liked ? c.likes + 1 : Math.max(0, c.likes - 1),
                };
              }
              return c;
            });
            return { ...a, comments: updatedComments };
          }),
        }));
      },

      getCourseAnnouncements: (courseUuid) => {
        return get().announcements.filter((a) => a.courseUuid === courseUuid);
      },
    }),
    {
      name: 'cubixskill_announcements_store_v3',
    }
  )
);
