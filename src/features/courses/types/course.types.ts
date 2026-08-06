export interface CourseDetails {
  uuid: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  thumbnailUrl: string;
  category: string;
  subcategory: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  language: string;
  durationHours?: number;
  durationMinutes?: number;
  courseType: 'Free' | 'Paid' | 'Private' | 'Invite Only';
  visibility: 'Public' | 'Unlisted' | 'Private';
  tags: string[];
  instructorName: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledAt?: string;

  // SEO Fields
  seoTitle?: string;
  metaDescription?: string;
  seoKeywords?: string;
  ogImageUrl?: string;

  // Telemetry & Pricing
  createdAt: string;
  updatedAt: string;
  enrolledStudentsCount: number;
  rating: number;
  totalRevenue: number;
  creditsPerStudent: number;
  isFree: boolean;
  price: number;
}
