import apiClient from '../api/client';
import { isValidCourseId, normalizeCourseId } from '../utils/courseValidation.utils';

export interface CourseFeatureItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  scope: string;
  frontend_key: string;
  frontend_route: string;
  icon_key: string;
  sort_order: number;
  academy_enabled: boolean;
  course_enabled: boolean;
  effective_enabled: boolean;
  is_enabled: boolean;
  can_configure: boolean;
  config?: Record<string, any>;
  enabled_at?: string | null;
  disabled_at?: string | null;
  credit_cost?: number;
  billing_unit?: string;
  billing_unit_label?: string;
  is_included_in_base?: boolean;
  display_text?: string;
  pricing?: {
    credit_cost?: number;
    billing_unit?: string;
    is_active?: boolean;
    is_included_in_base?: boolean;
    display_text?: string;
    name?: string;
  };
}

const pendingFeaturesPromises = new Map<string, Promise<CourseFeatureItem[]>>();

export const courseFeaturesService = {
  async list(courseUuid?: string | null): Promise<CourseFeatureItem[]> {
    const validId = normalizeCourseId(courseUuid);
    if (!validId) {
      return [];
    }

    if (pendingFeaturesPromises.has(validId)) {
      return pendingFeaturesPromises.get(validId)!;
    }

    const promise = apiClient
      .get(`/api/v1/courses/${encodeURIComponent(validId)}/features/`)
      .then((res) => {
        const data = res.data;
        const body =
          data && typeof data === 'object' && 'features' in data
            ? data.features
            : data && typeof data === 'object' && 'data' in data
              ? data.data
              : data;
        return (Array.isArray(body) ? body : []) as CourseFeatureItem[];
      })
      .finally(() => {
        pendingFeaturesPromises.delete(validId);
      });

    pendingFeaturesPromises.set(validId, promise);
    return promise;
  },

  async enable(courseUuid?: string | null, featureCode?: string): Promise<any> {
    const validId = normalizeCourseId(courseUuid);
    if (!validId || !featureCode) return null;
    if (validId) pendingFeaturesPromises.delete(validId);
    const res = await apiClient.post(`/api/v1/courses/${encodeURIComponent(validId)}/features/${encodeURIComponent(featureCode)}/enable/`);
    return res.data;
  },

  async disable(courseUuid?: string | null, featureCode?: string): Promise<any> {
    const validId = normalizeCourseId(courseUuid);
    if (!validId || !featureCode) return null;
    if (validId) pendingFeaturesPromises.delete(validId);
    const res = await apiClient.post(`/api/v1/courses/${encodeURIComponent(validId)}/features/${encodeURIComponent(featureCode)}/disable/`);
    return res.data;
  },

  async toggle(courseUuid?: string | null, featureCode?: string, currentlyEnabled?: boolean): Promise<void> {
    if (!isValidCourseId(courseUuid) || !featureCode) return;
    if (currentlyEnabled) {
      await this.disable(courseUuid, featureCode);
    } else {
      await this.enable(courseUuid, featureCode);
    }
  },

  async saveBulk(courseUuid?: string | null, featuresMap?: Record<string, boolean>): Promise<CourseFeatureItem[]> {
    if (!isValidCourseId(courseUuid) || !featuresMap) return [];
    const res = await apiClient.post(`/api/v1/courses/${encodeURIComponent(courseUuid.trim())}/features/save-bulk/`, {
      features: featuresMap,
    });
    const data = res.data;
    const body =
      data && typeof data === 'object' && 'features' in data
        ? data.features
        : data && typeof data === 'object' && 'data' in data
          ? data.data
          : data;
    return (Array.isArray(body) ? body : []) as CourseFeatureItem[];
  },

  async getPerStudentPricing(courseUuid?: string | null): Promise<{
    total_per_student_credits: number;
    per_student_features: Array<{
      key: string;
      code: string;
      name: string;
      credit_rate: number;
      billing_unit: string;
      billing_unit_label: string;
    }>;
  }> {
    const validId = normalizeCourseId(courseUuid);
    if (!validId) {
      return { total_per_student_credits: 0, per_student_features: [] };
    }

    try {
      const res = await apiClient.get(`/api/v1/courses/${encodeURIComponent(validId)}/features/`);
      const data = res.data || {};
      const total = data.total_per_student_credits ?? 0;
      const list = data.per_student_features || [];
      return { total_per_student_credits: total, per_student_features: list };
    } catch {
      return { total_per_student_credits: 0, per_student_features: [] };
    }
  },
};
