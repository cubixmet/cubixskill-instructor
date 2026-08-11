import React from 'react';

export type SearchCategoryType =
  | 'courses'
  | 'students'
  | 'staff'
  | 'assignments'
  | 'quizzes'
  | 'live_sessions'
  | 'announcements'
  | 'discussions'
  | 'leads'
  | 'certificates'
  | 'media';

export interface GlobalSearchResultItem {
  id: string;
  category: SearchCategoryType;
  categoryLabel: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'success' | 'secondary' | 'warning' | 'info';
  icon: React.ElementType;
  route: string;
}

export interface GroupedSearchResults {
  category: SearchCategoryType;
  categoryLabel: string;
  items: GlobalSearchResultItem[];
}
