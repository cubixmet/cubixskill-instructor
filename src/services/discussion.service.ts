import apiClient from '../api/client';
import { isValidCourseId } from '../utils/courseValidation.utils';

export interface BackendDiscussionAttachment {
  id: string;
  media_file_id: string;
  media_url: string;
  original_name: string;
  order_index: number;
}

export interface BackendDiscussionReply {
  id: string;
  thread: string;
  author_id: string;
  author_name: string;
  author_email: string;
  parent_reply?: string;
  content: string;
  is_answer: boolean;
  is_pinned: boolean;
  status: string;
  attachments?: BackendDiscussionAttachment[];
  created_at: string;
  edited_at?: string;
}

export interface BackendDiscussionThread {
  id: string;
  course?: string;
  course_title?: string;
  author_id: string;
  author_name: string;
  author_email: string;
  title: string;
  content: string;
  thread_type: 'DISCUSSION' | 'QUESTION' | 'ANNOUNCEMENT';
  is_pinned: boolean;
  is_locked: boolean;
  status: string;
  last_activity_at: string;
  reply_count: number;
  accepted_answer_id?: string;
  attachments?: BackendDiscussionAttachment[];
  created_at: string;
}

export interface FetchDiscussionsParams {
  courseId?: string | null;
  search?: string;
  threadType?: string;
  status?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
}

export const discussionService = {
  async listDiscussions(params: FetchDiscussionsParams = {}): Promise<{ results: BackendDiscussionThread[]; count: number }> {
    const queryParams: Record<string, any> = {};

    if (isValidCourseId(params.courseId)) {
      queryParams.course_id = params.courseId.trim();
    }
    if (params.search?.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.threadType) {
      queryParams.thread_type = params.threadType;
    }
    if (params.status && params.status !== 'all') {
      queryParams.status = params.status.toUpperCase();
    }
    if (params.ordering) {
      queryParams.ordering = params.ordering;
    }
    if (params.page) {
      queryParams.page = params.page;
    }
    if (params.pageSize) {
      queryParams.page_size = params.pageSize;
    }

    const res = await apiClient.get('/api/v1/discussions/discussions/', { params: queryParams });
    const data = res.data;
    if (Array.isArray(data)) {
      return { results: data, count: data.length };
    }
    return {
      results: data.results || [],
      count: data.count || (data.results ? data.results.length : 0),
    };
  },

  async getDiscussion(id: string): Promise<BackendDiscussionThread> {
    const res = await apiClient.get(`/api/v1/discussions/discussions/${id}/`);
    return res.data;
  },

  async createDiscussion(data: {
    course_id?: string | null;
    title: string;
    content: string;
    thread_type?: string;
    media_file_ids?: string[];
  }): Promise<BackendDiscussionThread> {
    const payload: Record<string, any> = {
      title: data.title,
      content: data.content,
      thread_type: data.thread_type || 'DISCUSSION',
      media_file_ids: data.media_file_ids || [],
    };
    if (isValidCourseId(data.course_id)) {
      payload.course_id = data.course_id.trim();
    }
    const res = await apiClient.post('/api/v1/discussions/discussions/', payload);
    return res.data;
  },

  async updateDiscussion(id: string, data: { title?: string; content?: string }): Promise<BackendDiscussionThread> {
    const res = await apiClient.patch(`/api/v1/discussions/discussions/${id}/`, data);
    return res.data;
  },

  async deleteDiscussion(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/discussions/discussions/${id}/`);
  },

  async listReplies(threadId: string): Promise<BackendDiscussionReply[]> {
    const res = await apiClient.get(`/api/v1/discussions/discussions/${threadId}/replies/`);
    const data = res.data;
    if (Array.isArray(data)) return data;
    return data.results || [];
  },

  async addReply(
    threadId: string,
    data: { content: string; parent_reply_id?: string; media_file_ids?: string[] }
  ): Promise<BackendDiscussionReply> {
    const res = await apiClient.post(`/api/v1/discussions/discussions/${threadId}/replies/`, data);
    return res.data;
  },

  async pinDiscussion(id: string, isPinned: boolean): Promise<BackendDiscussionThread> {
    const res = await apiClient.post(`/api/v1/discussions/discussions/${id}/pin/`, { is_pinned: isPinned });
    return res.data;
  },

  async lockDiscussion(id: string, isLocked: boolean): Promise<BackendDiscussionThread> {
    const res = await apiClient.post(`/api/v1/discussions/discussions/${id}/lock/`, { is_locked: isLocked });
    return res.data;
  },

  async acceptAnswer(threadId: string, replyId: string): Promise<BackendDiscussionThread> {
    const res = await apiClient.post(`/api/v1/discussions/discussions/${threadId}/accept-answer/`, { reply_id: replyId });
    return res.data;
  },
};
