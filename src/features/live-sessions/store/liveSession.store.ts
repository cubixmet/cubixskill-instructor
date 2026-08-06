import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnnouncementAttachment } from '../../announcements/store/announcement.store';
import { useAnnouncementStore } from '../../announcements/store/announcement.store';

export interface AttendanceRecord {
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  status: 'joined' | 'absent' | 'registered';
  joinTime?: string;
  leaveTime?: string;
  durationMinutes?: number;
}

export interface LiveSessionItem {
  id: string;
  courseUuid: string;
  courseTitle?: string;
  title: string;
  description: string;
  instructions?: string;
  sessionType: 'external' | 'cubixskill_live';
  platform: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Jitsi' | 'Custom';
  meetingUrl: string;
  meetingId?: string;
  passcode?: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  timezone?: string;
  hostName: string;
  maxParticipants?: number;
  enableWaitingRoom?: boolean;
  allowChat: boolean;
  allowQuestions: boolean;
  allowScreenShare?: boolean;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  isRecorded: boolean;
  recordingUrl?: string;
  recordingProvider?: 'YouTube' | 'Vimeo' | 'Google Drive' | 'Direct';
  notifyStudents: boolean;
  autoCreateAnnouncement?: boolean;
  reminderConfig?: {
    notify24h: boolean;
    notify1h: boolean;
    notify15m: boolean;
    notifyAtStart: boolean;
  };
  attachments?: AnnouncementAttachment[];
  attendanceRecords: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface LiveSessionStoreState {
  sessions: LiveSessionItem[];

  // Actions
  addLiveSession: (session: Omit<LiveSessionItem, 'id' | 'createdAt' | 'updatedAt' | 'attendanceRecords'>) => LiveSessionItem;
  updateLiveSession: (id: string, updates: Partial<LiveSessionItem>) => void;
  cancelLiveSession: (id: string) => void;
  startLiveSession: (id: string) => void;
  endLiveSession: (id: string, recordingUrl?: string) => void;
  uploadRecording: (id: string, recordingUrl: string, provider?: 'YouTube' | 'Vimeo' | 'Google Drive' | 'Direct') => void;
  updateAttendance: (id: string, records: AttendanceRecord[]) => void;
  deleteLiveSession: (id: string) => void;

  getCourseLiveSessions: (courseUuid: string) => LiveSessionItem[];
}

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { studentUuid: 'stu-101', studentName: 'Aarav Sharma', studentEmail: 'aarav@gmail.com', studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', status: 'joined', joinTime: '17:02', leaveTime: '18:00', durationMinutes: 58 },
  { studentUuid: 'stu-102', studentName: 'Priya Patel', studentEmail: 'priya@gmail.com', studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', status: 'joined', joinTime: '17:00', leaveTime: '18:00', durationMinutes: 60 },
  { studentUuid: 'stu-103', studentName: 'Rohan Mehta', studentEmail: 'rohan@gmail.com', studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', status: 'absent' },
  { studentUuid: 'stu-104', studentName: 'Kavita Sundaram', studentEmail: 'kavita@gmail.com', studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', status: 'joined', joinTime: '17:05', leaveTime: '17:55', durationMinutes: 50 },
];

const SEED_LIVE_SESSIONS: LiveSessionItem[] = [
  {
    id: 'ls-550e-01',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'Full Stack Web Development Architecture',
    title: '🚀 React 19 Architecture & Live Q&A Workshop',
    description: 'Interactive live session detailing Server Actions, Optimistic UI updates, and production deployment strategies.',
    instructions: 'Please have Node.js v20+ installed and your IDE ready for live coding exercises.',
    sessionType: 'external',
    platform: 'Zoom',
    meetingUrl: 'https://zoom.us/j/9876543210',
    meetingId: '987 654 3210',
    passcode: 'cubix2026',
    scheduledDate: '2026-08-08',
    scheduledTime: '17:00',
    durationMinutes: 60,
    timezone: 'Asia/Kolkata',
    hostName: 'Dr. Vikramaditya Rao',
    maxParticipants: 100,
    enableWaitingRoom: true,
    allowChat: true,
    allowQuestions: true,
    allowScreenShare: true,
    status: 'upcoming',
    isRecorded: true,
    notifyStudents: true,
    autoCreateAnnouncement: true,
    reminderConfig: {
      notify24h: true,
      notify1h: true,
      notify15m: true,
      notifyAtStart: true,
    },
    attachments: [
      { id: 'att-ls-1', name: 'React19_LiveCoding_Starter.zip', sizeMb: 4.5, type: 'zip', url: '#' },
    ],
    attendanceRecords: SEED_ATTENDANCE,
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 'ls-550e-02',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'Full Stack Web Development Architecture',
    title: '🔥 Live Code Review: Module 2 Student Projects',
    description: 'Live feedback and code refactoring for student submissions in Module 2.',
    instructions: 'Review your PR feedback in GitHub prior to joining.',
    sessionType: 'cubixskill_live',
    platform: 'Custom',
    meetingUrl: 'https://cdn.cubixskill.com/live/room-101',
    scheduledDate: '2026-08-04',
    scheduledTime: '14:00',
    durationMinutes: 90,
    timezone: 'Asia/Kolkata',
    hostName: 'Dr. Vikramaditya Rao',
    maxParticipants: 50,
    enableWaitingRoom: false,
    allowChat: true,
    allowQuestions: true,
    allowScreenShare: true,
    status: 'completed',
    isRecorded: true,
    recordingUrl: 'https://cdn.cubixskill.com/recordings/module2_review.mp4',
    recordingProvider: 'Direct',
    notifyStudents: true,
    attendanceRecords: SEED_ATTENDANCE,
    createdAt: '2026-08-03T09:00:00Z',
    updatedAt: '2026-08-04T15:30:00Z',
  },
];

export const useLiveSessionStore = create<LiveSessionStoreState>()(
  persist(
    (set, get) => ({
      sessions: SEED_LIVE_SESSIONS,

      addLiveSession: (input) => {
        const now = new Date().toISOString();
        const newSessionId = `ls-${Date.now()}`;
        const newSession: LiveSessionItem = {
          ...input,
          id: newSessionId,
          createdAt: now,
          updatedAt: now,
          attendanceRecords: SEED_ATTENDANCE,
        };

        set((state) => ({ sessions: [newSession, ...state.sessions] }));

        // Auto-create linked Announcement if toggle enabled
        if (input.autoCreateAnnouncement) {
          try {
            const addAnnouncement = useAnnouncementStore.getState().addAnnouncement;
            addAnnouncement({
              courseUuid: input.courseUuid,
              courseTitle: input.courseTitle || 'Course Academy',
              title: `🗓️ Upcoming Live Session: ${input.title}`,
              summary: input.description || `Live interactive classroom session scheduled for ${input.scheduledDate} at ${input.scheduledTime}.`,
              content: `Dear Students,\n\nWe have scheduled a live interactive virtual classroom session:\n\n📌 **Title:** ${input.title}\n📅 **Date:** ${input.scheduledDate}\n⏰ **Time:** ${input.scheduledTime} (${input.durationMinutes} mins)\n\nPlease click the **Join Live Classroom** button below at the scheduled time to enter the CubixSkill Virtual Classroom.`,
              category: 'Schedule',
              priority: 'important',
              status: 'published',
              publishOption: 'now',
              isPinned: true,
              notifyStudents: true,
              sendEmail: true,
              sendPush: true,
              sendInApp: true,
              allowComments: true,
              linkedLiveSessionId: newSessionId,
              linkedLiveSessionTitle: input.title,
              targetAudience: 'entire_course',
              attachments: input.attachments || [],
              author: {
                uuid: 'inst-1',
                name: input.hostName || 'Dr. Vikramaditya Rao',
                role: 'instructor',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
              },
            });
          } catch (e) {
            console.error('Failed to auto-create announcement:', e);
          }
        }

        return newSession;
      },

      updateLiveSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      cancelLiveSession: (id) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status: 'cancelled', updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      startLiveSession: (id) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status: 'live', updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      endLiveSession: (id, recordingUrl) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: 'completed',
                  recordingUrl: recordingUrl || s.recordingUrl,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }));
      },

      uploadRecording: (id, recordingUrl, provider = 'Direct') => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  recordingUrl,
                  recordingProvider: provider,
                  isRecorded: true,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }));
      },

      updateAttendance: (id, records) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, attendanceRecords: records, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      deleteLiveSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }));
      },

      getCourseLiveSessions: (courseUuid) => {
        return get().sessions.filter((s) => s.courseUuid === courseUuid);
      },
    }),
    {
      name: 'cubixskill_live_sessions_store_v3',
    }
  )
);
