import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemePreset {
  id: string;
  name: string;
  category: 'Modern' | 'Corporate' | 'Minimal' | 'Vibrant' | 'Dark Accent';
  primaryColor: string;
  primaryHover: string;
  secondaryColor: string;
  buttonColor: string;
  linkColor: string;
  activeNavColor: string;
  progressColor: string;
  borderRadius: string; // e.g. '12px', '16px', '8px'
  fontFamily: string;
}

export const PREBUILT_THEMES: ThemePreset[] = [
  { id: 'theme-1', name: 'Royal Sapphire', category: 'Modern', primaryColor: '#2563EB', primaryHover: '#1D4ED8', secondaryColor: '#3B82F6', buttonColor: '#2563EB', linkColor: '#2563EB', activeNavColor: '#2563EB', progressColor: '#2563EB', borderRadius: '14px', fontFamily: 'Inter' },
  { id: 'theme-2', name: 'Emerald Growth', category: 'Modern', primaryColor: '#059669', primaryHover: '#047857', secondaryColor: '#10B981', buttonColor: '#059669', linkColor: '#059669', activeNavColor: '#059669', progressColor: '#059669', borderRadius: '14px', fontFamily: 'Inter' },
  { id: 'theme-3', name: 'Violet Enterprise', category: 'Corporate', primaryColor: '#7C3AED', primaryHover: '#6D28D9', secondaryColor: '#8B5CF6', buttonColor: '#7C3AED', linkColor: '#7C3AED', activeNavColor: '#7C3AED', progressColor: '#7C3AED', borderRadius: '12px', fontFamily: 'Inter' },
  { id: 'theme-4', name: 'Amber Dawn', category: 'Vibrant', primaryColor: '#D97706', primaryHover: '#B45309', secondaryColor: '#F59E0B', buttonColor: '#D97706', linkColor: '#D97706', activeNavColor: '#D97706', progressColor: '#D97706', borderRadius: '16px', fontFamily: 'Inter' },
  { id: 'theme-5', name: 'Crimson Edge', category: 'Vibrant', primaryColor: '#DC2626', primaryHover: '#B91C1C', secondaryColor: '#EF4444', buttonColor: '#DC2626', linkColor: '#DC2626', activeNavColor: '#DC2626', progressColor: '#DC2626', borderRadius: '14px', fontFamily: 'Inter' },
  { id: 'theme-6', name: 'Teal Horizon', category: 'Minimal', primaryColor: '#0D9488', primaryHover: '#0F766E', secondaryColor: '#14B8A6', buttonColor: '#0D9488', linkColor: '#0D9488', activeNavColor: '#0D9488', progressColor: '#0D9488', borderRadius: '10px', fontFamily: 'Inter' },
  { id: 'theme-7', name: 'Indigo Pulse', category: 'Modern', primaryColor: '#4F46E5', primaryHover: '#4338CA', secondaryColor: '#6366F1', buttonColor: '#4F46E5', linkColor: '#4F46E5', activeNavColor: '#4F46E5', progressColor: '#4F46E5', borderRadius: '14px', fontFamily: 'Inter' },
  { id: 'theme-8', name: 'Rose Petal', category: 'Vibrant', primaryColor: '#E11D48', primaryHover: '#BE123C', secondaryColor: '#F43F5E', buttonColor: '#E11D48', linkColor: '#E11D48', activeNavColor: '#E11D48', progressColor: '#E11D48', borderRadius: '16px', fontFamily: 'Inter' },
  { id: 'theme-9', name: 'Slate Executive', category: 'Corporate', primaryColor: '#475569', primaryHover: '#334155', secondaryColor: '#64748B', buttonColor: '#475569', linkColor: '#475569', activeNavColor: '#475569', progressColor: '#475569', borderRadius: '10px', fontFamily: 'Inter' },
  { id: 'theme-10', name: 'Cyan Tech', category: 'Modern', primaryColor: '#0891B2', primaryHover: '#0E7490', secondaryColor: '#06B6D4', buttonColor: '#0891B2', linkColor: '#0891B2', activeNavColor: '#0891B2', progressColor: '#0891B2', borderRadius: '12px', fontFamily: 'Inter' },
  { id: 'theme-11', name: 'Midnight Blue', category: 'Dark Accent', primaryColor: '#1E3A8A', primaryHover: '#172554', secondaryColor: '#2563EB', buttonColor: '#1E3A8A', linkColor: '#1E3A8A', activeNavColor: '#1E3A8A', progressColor: '#1E3A8A', borderRadius: '14px', fontFamily: 'Inter' },
  { id: 'theme-12', name: 'Forest Mint', category: 'Minimal', primaryColor: '#166534', primaryHover: '#14532D', secondaryColor: '#15803D', buttonColor: '#166534', linkColor: '#166534', activeNavColor: '#166534', progressColor: '#166534', borderRadius: '12px', fontFamily: 'Inter' },
  { id: 'theme-13', name: 'Sunset Bronze', category: 'Vibrant', primaryColor: '#C2410C', primaryHover: '#9A3412', secondaryColor: '#EA580C', buttonColor: '#C2410C', linkColor: '#C2410C', activeNavColor: '#C2410C', progressColor: '#C2410C', borderRadius: '14px', fontFamily: 'Inter' },
  { id: 'theme-14', name: 'Fuchsia Neon', category: 'Vibrant', primaryColor: '#C026D3', primaryHover: '#A21CAF', secondaryColor: '#D946EF', buttonColor: '#C026D3', linkColor: '#C026D3', activeNavColor: '#C026D3', progressColor: '#C026D3', borderRadius: '16px', fontFamily: 'Inter' },
  { id: 'theme-15', name: 'Charcoal Minimal', category: 'Minimal', primaryColor: '#18181B', primaryHover: '#09090B', secondaryColor: '#27272A', buttonColor: '#18181B', linkColor: '#18181B', activeNavColor: '#18181B', progressColor: '#18181B', borderRadius: '8px', fontFamily: 'Inter' },
  { id: 'theme-16', name: 'Oceanic Deep', category: 'Corporate', primaryColor: '#0369A1', primaryHover: '#075985', secondaryColor: '#0284C7', buttonColor: '#0369A1', linkColor: '#0369A1', activeNavColor: '#0369A1', progressColor: '#0369A1', borderRadius: '14px', fontFamily: 'Inter' },
  { id: 'theme-17', name: 'Lime Electric', category: 'Vibrant', primaryColor: '#65A30D', primaryHover: '#4D7C0F', secondaryColor: '#84CC16', buttonColor: '#65A30D', linkColor: '#65A30D', activeNavColor: '#65A30D', progressColor: '#65A30D', borderRadius: '12px', fontFamily: 'Inter' },
  { id: 'theme-18', name: 'Plum Royalty', category: 'Corporate', primaryColor: '#831843', primaryHover: '#701A75', secondaryColor: '#9D174D', buttonColor: '#831843', linkColor: '#831843', activeNavColor: '#831843', progressColor: '#831843', borderRadius: '14px', fontFamily: 'Inter' },
  { id: 'theme-19', name: 'Sky Clarity', category: 'Minimal', primaryColor: '#0284C7', primaryHover: '#0369A1', secondaryColor: '#38BDF8', buttonColor: '#0284C7', linkColor: '#0284C7', activeNavColor: '#0284C7', progressColor: '#0284C7', borderRadius: '16px', fontFamily: 'Inter' },
  { id: 'theme-20', name: 'Cobalt Pro', category: 'Modern', primaryColor: '#1D4ED8', primaryHover: '#1E40AF', secondaryColor: '#3B82F6', buttonColor: '#1D4ED8', linkColor: '#1D4ED8', activeNavColor: '#1D4ED8', progressColor: '#1D4ED8', borderRadius: '14px', fontFamily: 'Inter' },
];

export interface AcademyBrandingState {
  academyName: string;
  logoFileUrl: string | null;
  faviconFileUrl: string | null;
  supportEmail: string;
  supportPhone: string;
  activeThemeId: string;
  customPrimaryColor?: string;
  customSecondaryColor?: string;

  updateBranding: (data: Partial<Omit<AcademyBrandingState, 'updateBranding' | 'applyTheme' | 'removeLogo' | 'removeFavicon' | 'resetToDefaults' | 'getActiveTheme'>>) => void;
  applyTheme: (themeId: string) => void;
  removeLogo: () => void;
  removeFavicon: () => void;
  resetToDefaults: () => void;
  getActiveTheme: () => ThemePreset;
}

const DEFAULT_BRANDING = {
  academyName: 'CodeVerse Software Academy',
  logoFileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120',
  faviconFileUrl: null,
  supportEmail: 'support@codeverse.com',
  supportPhone: '+1 (555) 019-9831',
  activeThemeId: 'theme-1',
  customPrimaryColor: undefined,
  customSecondaryColor: undefined,
};

export const useAcademyBrandingStore = create<AcademyBrandingState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_BRANDING,

      updateBranding: (data) => set((state) => ({ ...state, ...data })),

      applyTheme: (themeId) => set({ activeThemeId: themeId, customPrimaryColor: undefined, customSecondaryColor: undefined }),

      removeLogo: () => set({ logoFileUrl: null }),

      removeFavicon: () => set({ faviconFileUrl: null }),

      resetToDefaults: () => set(DEFAULT_BRANDING),

      getActiveTheme: () => {
        const theme = PREBUILT_THEMES.find((t) => t.id === get().activeThemeId) || PREBUILT_THEMES[0];
        const primary = get().customPrimaryColor || theme.primaryColor;
        const secondary = get().customSecondaryColor || theme.secondaryColor;
        return {
          ...theme,
          primaryColor: primary,
          buttonColor: primary,
          linkColor: primary,
          activeNavColor: primary,
          progressColor: primary,
          secondaryColor: secondary,
        };
      },
    }),
    {
      name: 'cubixskill_instructor_academy_branding',
    }
  )
);
