import { create } from 'zustand';
import { liveSessionsService, type BackendLiveSession, type CreateLiveSessionPayload, type UpdateLiveSessionPayload } from '../../../services/liveSessions.service';

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
  scheduledStartIso: string;
  scheduledEndIso: string;
  durationMinutes: number;
  timezone?: string;
  hostName: string;
  maxParticipants?: number;
  enableWaitingRoom?: boolean;
  allowChat: boolean;
  allowQuestions: boolean;
  allowScreenShare?: boolean;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  rawStatus: string;
  isRecorded: boolean;
  recordingUrl?: string;
  recordingProvider?: 'YouTube' | 'Vimeo' | 'Google Drive' | 'Direct';
  notifyStudents: boolean;
  autoCreateAnnouncement?: boolean;
  attendanceRecords: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export function mapBackendToLiveSessionItem(b: BackendLiveSession): LiveSessionItem {
  const courseUuid = typeof b.course === 'object' ? b.course?.id || '' : b.course || '';
  const courseTitle = b.course_title || (typeof b.course === 'object' ? b.course?.title : '') || '';

  const startDate = b.scheduled_start ? new Date(b.scheduled_start) : new Date();
  const endDate = b.scheduled_end ? new Date(b.scheduled_end) : new Date(startDate.getTime() + 60 * 60 * 1000);

  const durationMinutes = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)));

  const dateStr = startDate.toISOString().split('T')[0];
  const timeStr = startDate.toTimeString().substring(0, 5);

  let mappedPlatform: LiveSessionItem['platform'] = 'Custom';
  if (b.provider === 'ZOOM') mappedPlatform = 'Zoom';
  else if (b.provider === 'GOOGLE_MEET') mappedPlatform = 'Google Meet';
  else if (b.provider === 'MICROSOFT_TEAMS') mappedPlatform = 'Microsoft Teams';

  const effStatus = (b.effective_status || b.status || 'SCHEDULED').toUpperCase();
  let mappedStatus: LiveSessionItem['status'] = 'upcoming';
  if (effStatus === 'LIVE') mappedStatus = 'live';
  else if (effStatus === 'ENDED') mappedStatus = 'completed';
  else if (effStatus === 'CANCELLED') mappedStatus = 'cancelled';
  else mappedStatus = 'upcoming';

  return {
    id: b.id,
    courseUuid,
    courseTitle,
    title: b.title || 'Untitled Session',
    description: b.description || '',
    sessionType: b.session_mode === 'NATIVE' ? 'cubixskill_live' : 'external',
    platform: mappedPlatform,
    meetingUrl: b.meeting_url || '',
    scheduledDate: dateStr,
    scheduledTime: timeStr,
    scheduledStartIso: b.scheduled_start,
    scheduledEndIso: b.scheduled_end,
    durationMinutes,
    hostName: b.host_name || 'Instructor',
    maxParticipants: b.max_participants || 100,
    allowChat: b.allow_chat ?? true,
    allowQuestions: b.allow_raise_hand ?? true,
    allowScreenShare: b.allow_screen_share ?? true,
    status: mappedStatus,
    rawStatus: effStatus,
    isRecorded: b.recording_enabled || false,
    notifyStudents: true,
    attendanceRecords: [],
    createdAt: b.created_at || new Date().toISOString(),
    updatedAt: b.updated_at || new Date().toISOString(),
  };
}

export interface LiveSessionStoreState {
  sessions: LiveSessionItem[];
  isLoading: boolean;
  error: string | null;

  // Async Actions
  fetchCourseLiveSessions: (courseUuid?: string) => Promise<LiveSessionItem[]>;
  createLiveSession: (payload: CreateLiveSessionPayload) => Promise<LiveSessionItem>;
  updateLiveSessionApi: (id: string, payload: UpdateLiveSessionPayload) => Promise<LiveSessionItem>;
  cancelLiveSessionApi: (id: string, reason?: string) => Promise<void>;
  startLiveSessionApi: (id: string) => Promise<void>;
  endLiveSessionApi: (id: string, reason?: string) => Promise<void>;
  deleteLiveSessionApi: (id: string) => Promise<void>;

  // Synchronous store fallbacks
  updateLiveSession: (id: string, updates: Partial<LiveSessionItem>) => void;
  cancelLiveSession: (id: string) => void;
  startLiveSession: (id: string) => void;
  endLiveSession: (id: string, recordingUrl?: string) => void;
  uploadRecording: (id: string, recordingUrl: string, provider?: 'YouTube' | 'Vimeo' | 'Google Drive' | 'Direct') => void;
  updateAttendance: (id: string, records: AttendanceRecord[]) => void;
  deleteLiveSession: (id: string) => void;
  getCourseLiveSessions: (courseUuid: string) => LiveSessionItem[];
}

export const useLiveSessionStore = create<LiveSessionStoreState>((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,

  fetchCourseLiveSessions: async (courseUuid?: string) => {
    set({ isLoading: true, error: null });
    try {
      const rawBackendSessions = await liveSessionsService.list(courseUuid);
      const mapped = rawBackendSessions.map(mapBackendToLiveSessionItem);
      set({ sessions: mapped, isLoading: false });
      return mapped;
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to fetch live sessions.';
      set({ error: msg, isLoading: false });
      return [];
    }
  },

  createLiveSession: async (payload: CreateLiveSessionPayload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await liveSessionsService.create(payload);
      const mapped = mapBackendToLiveSessionItem(created);
      set((state) => ({ sessions: [mapped, ...state.sessions], isLoading: false }));
      return mapped;
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to create live session.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  updateLiveSessionApi: async (id: string, payload: UpdateLiveSessionPayload) => {
    try {
      const updated = await liveSessionsService.update(id, payload);
      const mapped = mapBackendToLiveSessionItem(updated);
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? mapped : s)),
      }));
      return mapped;
    } catch (err: any) {
      throw err;
    }
  },

  cancelLiveSessionApi: async (id: string, reason = '') => {
    try {
      const res = await liveSessionsService.cancel(id, reason);
      const mapped = mapBackendToLiveSessionItem(res);
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? mapped : s)),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  startLiveSessionApi: async (id: string) => {
    try {
      const res = await liveSessionsService.start(id);
      const mapped = mapBackendToLiveSessionItem(res);
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? mapped : s)),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  endLiveSessionApi: async (id: string, reason = '') => {
    try {
      const res = await liveSessionsService.end(id, reason);
      const mapped = mapBackendToLiveSessionItem(res);
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? mapped : s)),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  deleteLiveSessionApi: async (id: string) => {
    try {
      await liveSessionsService.delete(id);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
      }));
    } catch (err: any) {
      throw err;
    }
  },

  updateLiveSession: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    }));
  },

  cancelLiveSession: (id) => {
    get().cancelLiveSessionApi(id).catch(() => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, status: 'cancelled', updatedAt: new Date().toISOString() } : s
        ),
      }));
    });
  },

  startLiveSession: (id) => {
    get().startLiveSessionApi(id).catch(() => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, status: 'live', updatedAt: new Date().toISOString() } : s
        ),
      }));
    });
  },

  endLiveSession: (id, recordingUrl) => {
    get().endLiveSessionApi(id).catch(() => {
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
    });
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
    get().deleteLiveSessionApi(id).catch(() => {
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
      }));
    });
  },

  getCourseLiveSessions: (courseUuid) => {
    return get().sessions.filter((s) => s.courseUuid === courseUuid);
  },
}));

