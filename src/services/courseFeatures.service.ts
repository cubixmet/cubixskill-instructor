import apiClient from '../api/client';

export interface CourseFeatureItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  scope: string;
  frontend_key: string;
  frontend_route?: string;
  icon_key?: string;
  sort_order: number;
  academy_enabled: boolean;
  course_enabled: boolean;
  effective_enabled: boolean;
  is_enabled: boolean;
  can_configure: boolean;
  config?: Record<string, any>;
}

const pendingFeaturesPromises = new Map<string, Promise<CourseFeatureItem[]>>();

export const courseFeaturesService = {
  async list(courseUuid: string): Promise<CourseFeatureItem[]> {
    if (!courseUuid) return [];
    if (pendingFeaturesPromises.has(courseUuid)) {
      return pendingFeaturesPromises.get(courseUuid)!;
    }

    const promise = apiClient.get(`/api/v1/courses/${courseUuid}/features/`)
      .then((res) => {
        const data = res.data;
        const body = data && typeof data === 'object' && 'features' in data ? data.features : (data && typeof data === 'object' && 'data' in data ? data.data : data);
        return (Array.isArray(body) ? body : []) as CourseFeatureItem[];
      })
      .finally(() => {
        setTimeout(() => {
          pendingFeaturesPromises.delete(courseUuid);
        }, 2000);
      });

    pendingFeaturesPromises.set(courseUuid, promise);
    return promise;
  },

  async enable(courseUuid: string, featureCode: string): Promise<void> {
    await apiClient.post(`/api/v1/courses/${courseUuid}/features/${featureCode}/enable/`);
  },

  async disable(courseUuid: string, featureCode: string): Promise<void> {
    await apiClient.post(`/api/v1/courses/${courseUuid}/features/${featureCode}/disable/`);
  },

  async toggle(courseUuid: string, featureCode: string, currentlyEnabled: boolean): Promise<void> {
    if (currentlyEnabled) {
      await this.disable(courseUuid, featureCode);
    } else {
      await this.enable(courseUuid, featureCode);
    }
  },

  async saveBulk(courseUuid: string, featuresMap: Record<string, boolean>): Promise<CourseFeatureItem[]> {
    const res = await apiClient.post(`/api/v1/courses/${courseUuid}/features/save-bulk/`, {
      features: featuresMap,
    });
    const data = res.data;
    const body = data && typeof data === 'object' && 'features' in data ? data.features : (data && typeof data === 'object' && 'data' in data ? data.data : data);
    return (Array.isArray(body) ? body : []) as CourseFeatureItem[];
  },
};
