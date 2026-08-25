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
        setTimeout(() => {
          pendingFeaturesPromises.delete(validId);
        }, 2000);
      });

    pendingFeaturesPromises.set(validId, promise);
    return promise;
  },

  async enable(courseUuid?: string | null, featureCode?: string): Promise<void> {
    if (!isValidCourseId(courseUuid) || !featureCode) return;
    await apiClient.post(`/api/v1/courses/${encodeURIComponent(courseUuid.trim())}/features/${encodeURIComponent(featureCode)}/enable/`);
  },

  async disable(courseUuid?: string | null, featureCode?: string): Promise<void> {
    if (!isValidCourseId(courseUuid) || !featureCode) return;
    await apiClient.post(`/api/v1/courses/${encodeURIComponent(courseUuid.trim())}/features/${encodeURIComponent(featureCode)}/disable/`);
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
};
