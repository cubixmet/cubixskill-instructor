import { apiClient } from "../api/client";
import type { BackendApiResponse, PaginatedResponse } from "../api/types";
import type { CourseCategory } from "../features/courses/types/course.types";

export interface SimilarCategoryCheckResult {
  exact_match: CourseCategory | null;
  alias_match: CourseCategory | null;
  similar_categories: CourseCategory[];
}

export interface MergeCategoryResult {
  message: string;
  target_category: CourseCategory;
}

export const categoryService = {
  /**
   * List or search course categories.
   * Handles direct arrays, DRF paginated responses ({ count, results }), and wrapped API responses ({ data: [...] }).
   */
  async list(search?: string): Promise<CourseCategory[]> {
    const response = await apiClient.get<
      BackendApiResponse<CourseCategory[] | PaginatedResponse<CourseCategory>> |
      PaginatedResponse<CourseCategory> |
      CourseCategory[]
    >("/api/v1/courses/course-categories/", {
      params: search ? { search } : undefined,
    });

    const raw = response.data;

    // Check wrapped response: { data: ... }
    const data = (raw as any)?.data !== undefined ? (raw as any).data : raw;

    // Direct array: [...]
    if (Array.isArray(data)) {
      return data;
    }

    // Paginated response: { results: [...] }
    if (data && Array.isArray(data.results)) {
      return data.results;
    }

    return [];
  },

  /**
   * Search alias helper
   */
  async search(query: string): Promise<CourseCategory[]> {
    return this.list(query);
  },

  /**
   * Create a new category
   */
  async create(name: string, description?: string, is_active: boolean = true): Promise<CourseCategory> {
    const response = await apiClient.post<BackendApiResponse<CourseCategory> | CourseCategory>(
      "/api/v1/courses/course-categories/",
      { name, description, is_active }
    );
    const raw = response.data;
    return (raw as any)?.data || raw;
  },

  /**
   * Update category (PUT)
   */
  async update(id: string, name: string, description?: string, is_active?: boolean): Promise<CourseCategory> {
    const response = await apiClient.put<BackendApiResponse<CourseCategory> | CourseCategory>(
      `/api/v1/courses/course-categories/${id}/`,
      { name, description, is_active }
    );
    const raw = response.data;
    return (raw as any)?.data || raw;
  },

  /**
   * Patch category status or partial fields
   */
  async patch(id: string, payload: Partial<{ name: string; description: string; is_active: boolean }>): Promise<CourseCategory> {
    const response = await apiClient.patch<BackendApiResponse<CourseCategory> | CourseCategory>(
      `/api/v1/courses/course-categories/${id}/`,
      payload
    );
    const raw = response.data;
    return (raw as any)?.data || raw;
  },

  /**
   * Delete category
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/courses/course-categories/${id}/`);
  },

  /**
   * Check for duplicate or similar category names before creation
   */
  async checkSimilar(name: string): Promise<SimilarCategoryCheckResult> {
    const response = await apiClient.get<BackendApiResponse<SimilarCategoryCheckResult> | SimilarCategoryCheckResult>(
      "/api/v1/courses/course-categories/check-similar/",
      { params: { name } }
    );
    const raw = response.data;
    return (raw as any)?.data || raw;
  },

  /**
   * Merge source category into target category
   */
  async merge(sourceCategoryId: string, targetCategoryId: string): Promise<MergeCategoryResult> {
    const response = await apiClient.post<BackendApiResponse<MergeCategoryResult> | MergeCategoryResult>(
      "/api/v1/courses/course-categories/merge/",
      { source_category_id: sourceCategoryId, target_category_id: targetCategoryId }
    );
    const raw = response.data;
    return (raw as any)?.data || raw;
  },

  /**
   * List category merge audit log records
   */
  async getMergeAudits(): Promise<any[]> {
    const response = await apiClient.get<BackendApiResponse<any[]> | any[]>(
      "/api/v1/courses/course-categories/merge-audits/"
    );
    const raw = response.data;
    const data = (raw as any)?.data !== undefined ? (raw as any).data : raw;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  },
};
