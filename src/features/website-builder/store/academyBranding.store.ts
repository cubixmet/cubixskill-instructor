import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudentPortalTheme {
  id: string;
  name: string;
  category: 'Corporate' | 'Modern' | 'Dark' | 'Vibrant' | 'Minimal';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerStyle: 'light' | 'dark' | 'glass';
  bgStyle: string;
  previewBg: string;
}

export const PREBUILT_20_THEMES: StudentPortalTheme[] = [
  { id: 'theme-1', name: 'Modern Blue', category: 'Corporate', primaryColor: '#2563EB', secondaryColor: '#1D4ED8', accentColor: '#3B82F6', headerStyle: 'light', bgStyle: '#F8FAFC', previewBg: 'from-blue-600 to-indigo-700' },
  { id: 'theme-2', name: 'Dark Emerald', category: 'Dark', primaryColor: '#059669', secondaryColor: '#047857', accentColor: '#10B981', headerStyle: 'dark', bgStyle: '#0F172A', previewBg: 'from-emerald-700 to-teal-900' },
  { id: 'theme-3', name: 'Indigo Enterprise', category: 'Corporate', primaryColor: '#4F46E5', secondaryColor: '#4338CA', accentColor: '#6366F1', headerStyle: 'light', bgStyle: '#F8FAFC', previewBg: 'from-indigo-600 to-blue-800' },
  { id: 'theme-4', name: 'Cyber Purple', category: 'Vibrant', primaryColor: '#7C3AED', secondaryColor: '#6D28D9', accentColor: '#8B5CF6', headerStyle: 'dark', bgStyle: '#090D16', previewBg: 'from-purple-600 to-indigo-900' },
  { id: 'theme-5', name: 'Warm Amber', category: 'Modern', primaryColor: '#D97706', secondaryColor: '#B45309', accentColor: '#F59E0B', headerStyle: 'light', bgStyle: '#FFFBEB', previewBg: 'from-amber-600 to-orange-700' },
  { id: 'theme-6', name: 'Slate Minimal', category: 'Minimal', primaryColor: '#475569', secondaryColor: '#334155', accentColor: '#64748B', headerStyle: 'light', bgStyle: '#F1F5F9', previewBg: 'from-slate-700 to-slate-900' },
  { id: 'theme-7', name: 'Corporate Navy', category: 'Corporate', primaryColor: '#1E3A8A', secondaryColor: '#1E40AF', accentColor: '#2563EB', headerStyle: 'dark', bgStyle: '#F8FAFC', previewBg: 'from-blue-900 to-slate-900' },
  { id: 'theme-8', name: 'Sunset Orange', category: 'Vibrant', primaryColor: '#EA580C', secondaryColor: '#C2410C', accentColor: '#F97316', headerStyle: 'light', bgStyle: '#FFF7ED', previewBg: 'from-orange-600 to-amber-700' },
  { id: 'theme-9', name: 'Electric Violet', category: 'Vibrant', primaryColor: '#9333EA', secondaryColor: '#7E22CE', accentColor: '#A855F7', headerStyle: 'dark', bgStyle: '#0F0919', previewBg: 'from-violet-700 to-fuchsia-900' },
  { id: 'theme-10', name: 'Deep Ocean', category: 'Corporate', primaryColor: '#0284C7', secondaryColor: '#0369A1', accentColor: '#38BDF8', headerStyle: 'light', bgStyle: '#F0F9FF', previewBg: 'from-sky-600 to-cyan-800' },
  { id: 'theme-11', name: 'Mint Fresh', category: 'Minimal', primaryColor: '#0D9488', secondaryColor: '#0F766E', accentColor: '#14B8A6', headerStyle: 'light', bgStyle: '#F0FDFA', previewBg: 'from-teal-600 to-emerald-800' },
  { id: 'theme-12', name: 'Crimson Executive', category: 'Corporate', primaryColor: '#DC2626', secondaryColor: '#B91C1C', accentColor: '#EF4444', headerStyle: 'dark', bgStyle: '#FEF2F2', previewBg: 'from-red-700 to-rose-900' },
  { id: 'theme-13', name: 'Royal Gold', category: 'Modern', primaryColor: '#CA8A04', secondaryColor: '#A16207', accentColor: '#EAB308', headerStyle: 'dark', bgStyle: '#FEFCE8', previewBg: 'from-yellow-700 to-amber-900' },
  { id: 'theme-14', name: 'Tech Slate', category: 'Minimal', primaryColor: '#334155', secondaryColor: '#1E293B', accentColor: '#475569', headerStyle: 'dark', bgStyle: '#0F172A', previewBg: 'from-slate-800 to-slate-950' },
  { id: 'theme-15', name: 'Coral Bloom', category: 'Vibrant', primaryColor: '#F43F5E', secondaryColor: '#E11D48', accentColor: '#FB7185', headerStyle: 'light', bgStyle: '#FFF1F2', previewBg: 'from-rose-500 to-pink-700' },
  { id: 'theme-16', name: 'Obsidian Dark', category: 'Dark', primaryColor: '#3B82F6', secondaryColor: '#1D4ED8', accentColor: '#60A5FA', headerStyle: 'dark', bgStyle: '#030712', previewBg: 'from-gray-900 to-black' },
  { id: 'theme-17', name: 'Pastel Lavender', category: 'Minimal', primaryColor: '#8B5CF6', secondaryColor: '#7C3AED', accentColor: '#A78BFA', headerStyle: 'light', bgStyle: '#F5F3FF', previewBg: 'from-purple-500 to-indigo-600' },
  { id: 'theme-18', name: 'Nordic Clean', category: 'Minimal', primaryColor: '#2563EB', secondaryColor: '#1E40AF', accentColor: '#60A5FA', headerStyle: 'light', bgStyle: '#FFFFFF', previewBg: 'from-blue-500 to-slate-700' },
  { id: 'theme-19', name: 'Midnight Blue', category: 'Dark', primaryColor: '#2563EB', secondaryColor: '#1D4ED8', accentColor: '#3B82F6', headerStyle: 'dark', bgStyle: '#0A0F1D', previewBg: 'from-blue-900 to-black' },
  { id: 'theme-20', name: 'Neo Mint', category: 'Vibrant', primaryColor: '#10B981', secondaryColor: '#059669', accentColor: '#34D399', headerStyle: 'dark', bgStyle: '#062016', previewBg: 'from-emerald-600 to-teal-900' },
];

export interface SocialLinksConfig {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
}

export interface AcademyBrandingConfig {
  academyName: string;
  academySlug: string;
  logoUrl: string;
  faviconUrl: string;
  websiteUrl: string;
  address: string;
  supportEmail: string;
  supportPhone: string;
  socialLinks: SocialLinksConfig;
  activeThemeId: string;
}

export interface EnrolledAcademyItem {
  id: string;
  academyName: string;
  academySlug: string;
  logoUrl: string;
  themeId: string;
  enrolledCoursesCount: number;
  lastActive: string;
}

const DEFAULT_BRANDING: AcademyBrandingConfig = {
  academyName: 'Bright Academy of Technology',
  academySlug: 'brightacademy',
  logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
  faviconUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=32',
  websiteUrl: 'https://brightacademy.com',
  address: 'Building 4, Tech Park, Bengaluru, India',
  supportEmail: 'support@brightacademy.com',
  supportPhone: '+91 98765 43210',
  socialLinks: {
    facebook: 'https://facebook.com/brightacademy',
    instagram: 'https://instagram.com/brightacademy',
    linkedin: 'https://linkedin.com/company/brightacademy',
    youtube: 'https://youtube.com/@brightacademy',
    whatsapp: '+919876543210',
    telegram: 'https://t.me/brightacademy',
  },
  activeThemeId: 'theme-1',
};

interface AcademyBrandingStoreState {
  branding: AcademyBrandingConfig;
  enrolledAcademies: EnrolledAcademyItem[];
  activeStudentAcademySlug: string;

  updateBranding: (updates: Partial<AcademyBrandingConfig>) => void;
  resetBranding: () => void;
  setActiveTheme: (themeId: string) => void;
  selectStudentAcademy: (slug: string) => void;
}

export const useAcademyBrandingStore = create<AcademyBrandingStoreState>()(
  persist(
    (set) => ({
      branding: DEFAULT_BRANDING,

      enrolledAcademies: [
        {
          id: 'acad-1',
          academyName: 'Bright Academy of Technology',
          academySlug: 'brightacademy',
          logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
          themeId: 'theme-1',
          enrolledCoursesCount: 3,
          lastActive: '2 hours ago',
        },
        {
          id: 'acad-2',
          academyName: 'CodeVerse Software Academy',
          academySlug: 'codeverse',
          logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100',
          themeId: 'theme-2',
          enrolledCoursesCount: 2,
          lastActive: 'Yesterday',
        },
        {
          id: 'acad-3',
          academyName: 'MathWorld Data Institute',
          academySlug: 'mathworld',
          logoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=100',
          themeId: 'theme-5',
          enrolledCoursesCount: 1,
          lastActive: '3 days ago',
        },
      ],

      activeStudentAcademySlug: 'brightacademy',

      updateBranding: (updates) => {
        set((state) => ({
          branding: { ...state.branding, ...updates },
        }));
      },

      resetBranding: () => {
        set({ branding: DEFAULT_BRANDING });
      },

      setActiveTheme: (themeId) => {
        set((state) => ({
          branding: { ...state.branding, activeThemeId: themeId },
        }));
      },

      selectStudentAcademy: (slug) => {
        set({ activeStudentAcademySlug: slug });
      },
    }),
    {
      name: 'cubixskill_academy_branding_store_v3',
    }
  )
);
