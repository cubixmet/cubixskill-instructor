import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SectionType =
  | 'hero'
  | 'courses'
  | 'instructors'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'footer';

export interface WebsiteSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle: string;
  content?: string;
  ctaText?: string;
  ctaUrl?: string;
  bgStyle?: 'white' | 'light' | 'dark' | 'gradient';
  paddingTop?: 'sm' | 'md' | 'lg';
  paddingBottom?: 'sm' | 'md' | 'lg';
  imageUrl?: string;
  isVisible?: boolean;
}

export interface WebsitePage {
  id: string;
  slug: string;
  title: string;
  isHomePage: boolean;
  isPublished: boolean;
  sections: WebsiteSection[];
}

export interface GlobalThemeConfig {
  primaryColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
}

export interface WebsiteStoreState {
  websiteName: string;
  isPublished: boolean;
  activePageSlug: string;
  activeSectionId: string | null;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  pages: WebsitePage[];
  theme: GlobalThemeConfig;

  // Actions
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  setActivePageSlug: (slug: string) => void;
  setActiveSectionId: (id: string | null) => void;

  addPage: (title: string, slug: string) => void;
  deletePage: (slug: string) => void;
  setHomePage: (slug: string) => void;

  addSection: (pageSlug: string, type: SectionType) => void;
  removeSection: (pageSlug: string, sectionId: string) => void;
  reorderSections: (pageSlug: string, newSections: WebsiteSection[]) => void;
  updateSection: (pageSlug: string, sectionId: string, updates: Partial<WebsiteSection>) => void;

  updateTheme: (updates: Partial<GlobalThemeConfig>) => void;
  publishWebsite: () => void;
}

const DEFAULT_SECTIONS: WebsiteSection[] = [
  {
    id: 'sec-hero-1',
    type: 'hero',
    title: 'Master Modern Web Development Architecture',
    subtitle: 'Learn React 19, TypeScript, and Full Stack Architecture directly from industry experts.',
    ctaText: 'Explore Published Courses',
    ctaUrl: '/courses',
    bgStyle: 'white',
    paddingTop: 'lg',
    paddingBottom: 'lg',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    isVisible: true,
  },
  {
    id: 'sec-courses-1',
    type: 'courses',
    title: 'Featured Academy Masterclasses',
    subtitle: 'Browse top-rated full stack engineering courses with verified certificates.',
    bgStyle: 'light',
    paddingTop: 'md',
    paddingBottom: 'md',
    isVisible: true,
  },
  {
    id: 'sec-testimonials-1',
    type: 'testimonials',
    title: 'What Our Academy Graduates Say',
    subtitle: 'Over 4,200 students upgraded their software engineering careers with CubixSkill.',
    bgStyle: 'white',
    paddingTop: 'md',
    paddingBottom: 'md',
    isVisible: true,
  },
  {
    id: 'sec-faq-1',
    type: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Got questions? We have got answers about enrollment, certificates, and access.',
    bgStyle: 'light',
    paddingTop: 'md',
    paddingBottom: 'md',
    isVisible: true,
  },
  {
    id: 'sec-footer-1',
    type: 'footer',
    title: 'CubixSkill Learning Academy',
    subtitle: '© 2026 CubixSkill Enterprise Platform. All rights reserved.',
    bgStyle: 'dark',
    paddingTop: 'sm',
    paddingBottom: 'sm',
    isVisible: true,
  },
];

const DEFAULT_PAGES: WebsitePage[] = [
  { id: 'page-home', slug: 'home', title: 'Home Page', isHomePage: true, isPublished: true, sections: DEFAULT_SECTIONS },
  { id: 'page-courses', slug: 'courses', title: 'Courses Catalog', isHomePage: false, isPublished: true, sections: [DEFAULT_SECTIONS[1]] },
  { id: 'page-about', slug: 'about', title: 'About Academy', isHomePage: false, isPublished: true, sections: [DEFAULT_SECTIONS[0], DEFAULT_SECTIONS[2]] },
  { id: 'page-contact', slug: 'contact', title: 'Contact Us', isHomePage: false, isPublished: true, sections: [DEFAULT_SECTIONS[3]] },
];

export const useWebsiteStore = create<WebsiteStoreState>()(
  persist(
    (set) => ({
      websiteName: 'CubixSkill Academy Website',
      isPublished: true,
      activePageSlug: 'home',
      activeSectionId: 'sec-hero-1',
      viewportMode: 'desktop',
      pages: DEFAULT_PAGES,
      theme: {
        primaryColor: '#2563EB',
        headingFont: 'Inter',
        bodyFont: 'Inter',
        borderRadius: '0.75rem',
      },

      setViewportMode: (mode) => set({ viewportMode: mode }),
      setActivePageSlug: (slug) => set({ activePageSlug: slug }),
      setActiveSectionId: (id) => set({ activeSectionId: id }),

      addPage: (title, slug) => {
        const newPage: WebsitePage = {
          id: `page-${Date.now()}`,
          title,
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
          isHomePage: false,
          isPublished: false,
          sections: [DEFAULT_SECTIONS[0]],
        };
        set((state) => ({ pages: [...state.pages, newPage], activePageSlug: newPage.slug }));
      },

      deletePage: (slug) => {
        set((state) => ({
          pages: state.pages.filter((p) => p.slug !== slug),
          activePageSlug: state.activePageSlug === slug ? 'home' : state.activePageSlug,
        }));
      },

      setHomePage: (slug) => {
        set((state) => ({
          pages: state.pages.map((p) => ({
            ...p,
            isHomePage: p.slug === slug,
          })),
        }));
      },

      addSection: (pageSlug, type) => {
        const newSec: WebsiteSection = {
          id: `sec-${type}-${Date.now()}`,
          type,
          title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
          subtitle: 'Configure section properties in right inspector panel.',
          bgStyle: 'white',
          paddingTop: 'md',
          paddingBottom: 'md',
          isVisible: true,
        };

        set((state) => ({
          pages: state.pages.map((p) =>
            p.slug === pageSlug ? { ...p, sections: [...p.sections, newSec] } : p
          ),
          activeSectionId: newSec.id,
        }));
      },

      removeSection: (pageSlug, sectionId) => {
        set((state) => ({
          pages: state.pages.map((p) =>
            p.slug === pageSlug ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId) } : p
          ),
          activeSectionId: state.activeSectionId === sectionId ? null : state.activeSectionId,
        }));
      },

      reorderSections: (pageSlug, newSections) => {
        set((state) => ({
          pages: state.pages.map((p) => (p.slug === pageSlug ? { ...p, sections: newSections } : p)),
        }));
      },

      updateSection: (pageSlug, sectionId, updates) => {
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.slug !== pageSlug) return p;
            return {
              ...p,
              sections: p.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
            };
          }),
        }));
      },

      updateTheme: (updates) => {
        set((state) => ({ theme: { ...state.theme, ...updates } }));
      },

      publishWebsite: () => {
        set({ isPublished: true });
      },
    }),
    {
      name: 'cubixskill_website_builder_store_v1',
    }
  )
);
