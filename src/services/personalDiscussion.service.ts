import apiClient from '../api/client';
import { isValidCourseId } from '../utils/courseValidation.utils';

export interface BackendChatRoom {
  id: string;
  academy?: string;
  course?: string;
  course_title?: string;
  room_type: string;
  name: string;
  is_locked: boolean;
  last_message_at?: string;
  unread_count: number;
  student_id?: string;
  student_name?: string;
  student_email?: string;
  student_avatar?: string;
  last_message?: string;
  created_at: string;
}

export interface BackendChatMessageAttachment {
  id: string;
  media_file_id: string;
  media_url: string;
  original_name: string;
  attachment_type: string;
}

export interface BackendChatMessage {
  id: string;
  room: string;
  sender_id: string;
  sender_name: string;
  message_type: string;
  content: string;
  reply_to?: string;
  status: string;
  attachments?: BackendChatMessageAttachment[];
  created_at: string;
  edited_at?: string;
}

export const personalDiscussionService = {
  async listPersonalRooms(courseId?: string | null): Promise<BackendChatRoom[]> {
    const params: Record<string, string> = { room_type: 'DIRECT' };
    if (isValidCourseId(courseId)) {
      params.course_id = courseId.trim();
    }
    const res = await apiClient.get('/api/v1/chat/rooms/', { params });
    const data = res.data;
    if (Array.isArray(data)) return data;
    return data.results || [];
  },

  async getOrCreatePersonalRoom(courseId: string, studentId: string): Promise<BackendChatRoom> {
    if (!isValidCourseId(courseId) || !studentId) {
      throw new Error('Valid Course ID and Student ID are required.');
    }
    const res = await apiClient.post('/api/v1/chat/rooms/get-or-create-personal/', {
      course_id: courseId.trim(),
      student_id: studentId.trim(),
    });
    return res.data;
  },

  async getRoomMessages(roomId: string, limit = 50, beforeId?: string): Promise<BackendChatMessage[]> {
    if (!roomId) return [];
    const params: Record<string, any> = { limit };
    if (beforeId) params.before_id = beforeId;
    const res = await apiClient.get(`/api/v1/chat/rooms/${roomId}/messages/`, { params });
    const data = res.data;
    if (Array.isArray(data)) return data;
    return data.results || [];
  },

  async sendMessage(roomId: string, content: string, mediaFileIds: string[] = []): Promise<BackendChatMessage> {
    if (!roomId) throw new Error('Room ID is required.');
    const res = await apiClient.post(`/api/v1/chat/rooms/${roomId}/send-message/`, {
      content,
      media_file_ids: mediaFileIds,
      message_type: 'TEXT',
    });
    return res.data;
  },

  async markRoomAsRead(roomId: string): Promise<number> {
    if (!roomId) return 0;
    const res = await apiClient.post(`/api/v1/chat/rooms/${roomId}/read/`);
    return res.data?.unread_count ?? 0;
  },
};
