export type CourseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
export type CourseVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';

export interface MediaFile {
  id: string;
  file?: string;
  url?: string;
  file_url?: string;
  stored_filename?: string;
  relative_path?: string;
  original_filename?: string;
  mime_type?: string;
  size_bytes?: number;
  created_at?: string;
}

export interface CategoryAlias {
  id: string;
  name: string;
  slug: string;
  canonical_category?: string;
  created_at?: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
  aliases?: CategoryAlias[];
}


export interface CourseModule {
  id: string;
  course: string;
  title: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface CourseListItem {
  id: string;
  uuid?: string;
  title: string;
  slug: string;
  subtitle: string;
  thumbnail: MediaFile | null;
  thumbnail_url?: string;
  level: CourseLevel;
  language: string;
  price: string | number;
  currency: string;
  is_free: boolean;
  status: CourseStatus;
  visibility: CourseVisibility;
  category_name: string | null;
  created_at: string;
}

export interface CourseDetail {
  id: string;
  academy?: string;
  category: CourseCategory | null;
  title: string;
  slug: string;
  subtitle: string;
  short_description: string;
  description: string;
  thumbnail: MediaFile | null;
  thumbnail_url?: string;
  promo_video: MediaFile | null;
  promo_video_url?: string;
  level: CourseLevel;
  language: string;
  duration_minutes: number;
  price: string | number;
  currency: string;
  is_free: boolean;
  visibility: CourseVisibility;
  status: CourseStatus;
  is_published: boolean;
  published_at: string | null;
  demo_enabled: boolean;
  demo_duration_days: number;
  certificate_enabled: boolean;
  allow_data_export?: boolean;
  modules: CourseModule[];
  created_at: string;
  updated_at: string;
}

export interface CreateCoursePayload {
  category?: string | null;
  title: string;
  subtitle?: string;
  short_description?: string;
  description?: string;
  thumbnail?: string | null;
  thumbnail_url?: string;
  promo_video?: string | null;
  promo_video_url?: string;
  level?: CourseLevel;
  language?: string;
  duration_minutes?: number;
  price?: string | number;
  currency?: string;
  is_free?: boolean;
  visibility?: CourseVisibility;
  status?: CourseStatus;
  demo_enabled?: boolean;
  demo_duration_days?: number;
  certificate_enabled?: boolean;
  allow_data_export?: boolean;
  data_export?: boolean;
}


export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export interface PublishReadinessItem {
  key: string;
  label: string;
  required: boolean;
  complete: boolean;
  count?: number;
  status?: string;
  value_text?: string;
}

export interface CoursePublishReadiness {
  course_id: string;
  status: CourseStatus;
  ready_to_publish: boolean;
  module_count: number;
  lesson_count: number;
  processing_count: number;
  remaining_required_count: number;
  items: PublishReadinessItem[];
}
