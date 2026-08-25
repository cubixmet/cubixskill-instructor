import apiClient from '../api/client';

export interface AcademyWebsiteThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  muted_text_color: string;
  border_color: string;
  body_font: string;
  heading_font: string;
  button_radius: string;
  card_radius: string;
  header_variant: string;
  footer_variant: string;
  academy_name: string;
  academy_tagline: string;
  hero_badge: string;
  home_hero_title: string;
  home_hero_subtitle: string;
  hero_image_url: string;
  hero_cta_label: string;
  hero_secondary_cta_label: string;
  courses_title: string;
  courses_description: string;
  contact_title: string;
  contact_description: string;
  whatsapp_number: string;
  address: string;
  business_hours: string;
}

export interface WebsiteSettingsResponse {
  academy_id: string;
  academy_name: string;
  academy_slug: string;
  logo_url: string;
  favicon_url: string;
  draft_config: AcademyWebsiteThemeConfig;
  published_config: AcademyWebsiteThemeConfig;
  published_at: string | null;
  has_unpublished_changes: boolean;
  updated_at: string | null;
}

export const websiteBuilderService = {
  async getSettings(): Promise<WebsiteSettingsResponse> {
    const response = await apiClient.get<WebsiteSettingsResponse>('/api/v1/website/settings/');
    return response.data;
  },

  async updateDraftSettings(draftConfigPartial: Partial<AcademyWebsiteThemeConfig>): Promise<WebsiteSettingsResponse> {
    const response = await apiClient.patch<WebsiteSettingsResponse>('/api/v1/website/settings/', draftConfigPartial);
    return response.data;
  },

  async publishSettings(): Promise<{ message: string; published_config: AcademyWebsiteThemeConfig; published_at: string; has_unpublished_changes: boolean }> {
    const response = await apiClient.post<{ message: string; published_config: AcademyWebsiteThemeConfig; published_at: string; has_unpublished_changes: boolean }>('/api/v1/website/settings/publish/');
    return response.data;
  },

  async getPublicConfig(academySlug: string) {
    const response = await apiClient.get(`/api/v1/website/public/academies/${academySlug}/website/`);
    return response.data;
  }
};
