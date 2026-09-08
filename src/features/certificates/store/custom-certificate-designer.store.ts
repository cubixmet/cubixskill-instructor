import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PlaceholderKey, CanvasSizeType } from '../../../types/certificate.types';
import { calculateTextInitialSize, DEFAULT_PADDING } from '../utils/textMeasurement';

export interface CustomCanvasElement {
  id: string;
  type: 'text' | 'image' | 'qr_code' | 'signature' | 'logo' | 'seal' | 'watermark' | 'badge' | 'placeholder';
  label: string;
  placeholderKey?: PlaceholderKey;
  text?: string;
  imageUrl?: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage width 5-100
  height: number; // px height (default 50px) or percentage
  fontFamily?: string;
  fontSize?: number; // max font size (default 24px)
  fontWeight?: number; // 300 - 900
  fontStyle?: 'normal' | 'italic';
  isUnderline?: boolean;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontColor?: string;
  backgroundColor?: string;
  textShadow?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  rotation?: number; // 0 - 360
  borderRadius?: number;
  zIndex?: number;
  isLocked?: boolean;
  padding?: { top: number; right: number; bottom: number; left: number };
  minFontSize?: number;
  isVisible?: boolean;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'transparent';
  solidColor: string;
  recentColors: string[];
  gradientType: 'linear' | 'radial';
  gradientColor1: string;
  gradientColor2: string;
  gradientAngle: number; // 0 - 360deg
  imageUrl?: string;
  fit?: BackgroundFit;
  position?: BackgroundPosition;
  imageFit: BackgroundFit;
  imagePosition?: BackgroundPosition;
  opacity: number; // 0 - 1
  brightness: number; // 50 - 150 (100 default)
  blur: number; // 0 - 20 px
  positionX: number; // 0 - 100%
  positionY: number; // 0 - 100%
  scale: number; // 50 - 200%
  isLocked: boolean;
}

export interface SavedCustomTemplateItem {
  id: string;
  title: string;
  description?: string;
  canvasSize: CanvasSizeType;
  bgConfig: BackgroundConfig;
  elements: CustomCanvasElement[];
  selectedFields: { id: string; key: PlaceholderKey; label: string; sampleValue?: string; category?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomCertificateDesignerDraft {
  templateUuid: string;
  courseUuid: string;
  title: string;
  description: string;
  canvasSize: CanvasSizeType;
  bgConfig: BackgroundConfig;
  elements: CustomCanvasElement[];
  selectedFields: { id: string; key: PlaceholderKey; label: string; sampleValue?: string; category?: string }[];
  updatedAt: string;
}

const DEFAULT_BG_CONFIG: BackgroundConfig = {
  type: 'solid',
  solidColor: '#FFFFFF',
  recentColors: ['#FFFFFF', '#F8FAFC', '#EFF6FF', '#FEF3C7', '#ECFDF5', '#0F172A'],
  gradientType: 'linear',
  gradientColor1: '#2563EB',
  gradientColor2: '#1E1B4B',
  gradientAngle: 135,
  imageUrl: undefined,
  fit: 'cover',
  position: 'center',
  imageFit: 'cover',
  imagePosition: 'center',
  opacity: 1,
  brightness: 100,
  blur: 0,
  positionX: 50,
  positionY: 50,
  scale: 100,
  isLocked: true,
};

const DEFAULT_ELEMENTS: CustomCanvasElement[] = [
  {
    id: 'el-101',
    type: 'placeholder',
    label: 'Academy Name',
    placeholderKey: '{{academy_name}}',
    text: 'BRIGHT ACADEMY OF TECHNOLOGY',
    x: 50,
    y: 15,
    width: 80,
    height: 48,
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: 800,
    fontColor: '#2563EB',
    textAlign: 'center',
    opacity: 1,
    rotation: 0,
    zIndex: 10,
    isLocked: false,
    isVisible: true,
  },
  {
    id: 'el-102',
    type: 'text',
    label: 'Header Banner',
    text: 'CERTIFICATE OF COMPLETION',
    x: 50,
    y: 26,
    width: 85,
    height: 60,
    fontFamily: 'Cinzel',
    fontSize: 34,
    fontWeight: 800,
    fontColor: '#0F172A',
    textAlign: 'center',
    opacity: 1,
    rotation: 0,
    zIndex: 11,
    isLocked: false,
    isVisible: true,
  },
  {
    id: 'el-103',
    type: 'text',
    label: 'Subheading',
    text: 'THIS IS PROUDLY PRESENTED TO',
    x: 50,
    y: 38,
    width: 60,
    height: 36,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 600,
    fontColor: '#64748B',
    textAlign: 'center',
    opacity: 1,
    rotation: 0,
    zIndex: 12,
    isLocked: false,
    isVisible: true,
  },
  {
    id: 'el-104',
    type: 'placeholder',
    label: 'Student Name',
    placeholderKey: '{{student_name}}',
    text: 'Aarav Patel',
    x: 50,
    y: 48,
    width: 75,
    height: 64,
    fontFamily: 'Playfair Display',
    fontSize: 38,
    fontWeight: 800,
    fontColor: '#1E293B',
    textAlign: 'center',
    opacity: 1,
    rotation: 0,
    zIndex: 13,
    isLocked: false,
    isVisible: true,
  },
  {
    id: 'el-105',
    type: 'text',
    label: 'Completion Description',
    text: 'for successfully completing all professional coursework, examinations, and project requirements for',
    x: 50,
    y: 58,
    width: 80,
    height: 40,
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: 500,
    fontColor: '#475569',
    textAlign: 'center',
    opacity: 1,
    rotation: 0,
    zIndex: 14,
    isLocked: false,
    isVisible: true,
  },
  {
    id: 'el-106',
    type: 'placeholder',
    label: 'Course Name',
    placeholderKey: '{{course_name}}',
    text: 'Full Stack React 19 & Cloud Architecture',
    x: 50,
    y: 67,
    width: 80,
    height: 52,
    fontFamily: 'Montserrat',
    fontSize: 26,
    fontWeight: 800,
    fontColor: '#2563EB',
    textAlign: 'center',
    opacity: 1,
    rotation: 0,
    zIndex: 15,
    isLocked: false,
    isVisible: true,
  },
  {
    id: 'el-107',
    type: 'signature',
    label: 'Instructor Signature',
    text: 'Dr. Vikramaditya Sharma',
    x: 25,
    y: 82,
    width: 35,
    height: 50,
    fontFamily: 'Playfair Display',
    fontSize: 16,
    fontWeight: 700,
    fontColor: '#0F172A',
    textAlign: 'center',
    opacity: 1,
    rotation: 0,
    zIndex: 16,
    isLocked: false,
    isVisible: true,
  },
  {
    id: 'el-108',
    type: 'qr_code',
    label: 'Verification QR',
    placeholderKey: '{{qr_code}}',
    x: 75,
    y: 82,
    width: 20,
    height: 60,
    textAlign: 'center',
    opacity: 1,
    rotation: 0,
    zIndex: 17,
    isLocked: false,
    isVisible: true,
  },
];

const PRESET_CUSTOM_TEMPLATES: SavedCustomTemplateItem[] = [
  {
    id: 'tmpl-preset-1',
    title: 'Modern Executive Blue',
    description: 'Clean corporate layout with royal blue accents and gold foil banner.',
    canvasSize: 'a4_landscape',
    bgConfig: {
      ...DEFAULT_BG_CONFIG,
      type: 'gradient',
      gradientType: 'linear',
      gradientColor1: '#0F172A',
      gradientColor2: '#1E293B',
      gradientAngle: 135,
    },
    elements: DEFAULT_ELEMENTS,
    selectedFields: [
      { id: 'f-1', key: '{{student_name}}' as PlaceholderKey, label: 'Student Full Name', sampleValue: 'Aarav Patel' },
      { id: 'f-2', key: '{{course_name}}' as PlaceholderKey, label: 'Course Name', sampleValue: 'Cloud Architecture' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tmpl-preset-2',
    title: 'Minimalist Ivory Elegance',
    description: 'Sophisticated warm ivory template ideal for university & masterclass completion.',
    canvasSize: 'a4_landscape',
    bgConfig: {
      ...DEFAULT_BG_CONFIG,
      type: 'solid',
      solidColor: '#FFFDF9',
    },
    elements: DEFAULT_ELEMENTS,
    selectedFields: [
      { id: 'f-1', key: '{{student_name}}' as PlaceholderKey, label: 'Student Full Name', sampleValue: 'Ananya Roy' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface CustomCertificateDesignerState {
  draft: CustomCertificateDesignerDraft;
  savedCustomTemplates: SavedCustomTemplateItem[];
  hasHydrated: boolean;
  selectedElementId: string | null;
  zoomLevel: number;
  showGrid: boolean;
  snapToGrid: boolean;

  // History stack for Undo / Redo
  history: CustomCanvasElement[][];
  historyIndex: number;

  // Actions
  setHasHydrated: (hydrated: boolean) => void;
  setSelectedElementId: (id: string | null) => void;
  setZoomLevel: (zoom: number) => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  
  setDraft: (updates: Partial<CustomCertificateDesignerDraft>) => void;
  updateBackground: (updates: Partial<BackgroundConfig>) => void;
  addElement: (el: Omit<CustomCanvasElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<CustomCanvasElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  reorderElement: (id: string, direction: 'front' | 'forward' | 'backward' | 'back') => void;
  alignElement: (id: string, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  
  // Custom Template Library Actions
  saveAsCustomTemplate: (title: string, description?: string) => SavedCustomTemplateItem;
  loadCustomTemplate: (templateId: string) => { missingFields: string[] };
  duplicateCustomTemplate: (templateId: string) => void;
  renameCustomTemplate: (templateId: string, newTitle: string) => void;
  deleteCustomTemplate: (templateId: string) => void;

  undo: () => void;
  redo: () => void;
  saveDraft: () => void;
}

export const useCustomCertificateDesignerStore = create<CustomCertificateDesignerState>()(
  persist(
    (set, get) => ({
      draft: {
        templateUuid: 'tpl-custom-draft-1',
        courseUuid: '',
        title: 'Custom Certificate Design',
        description: 'Enterprise grade custom certificate built with CubixSkill',
        canvasSize: 'a4_landscape',
        bgConfig: DEFAULT_BG_CONFIG,
        elements: DEFAULT_ELEMENTS,
        selectedFields: [
          { id: 'f-1', key: '{{student_name}}' as PlaceholderKey, label: 'Student Full Name', sampleValue: 'Aarav Patel' },
          { id: 'f-2', key: '{{course_name}}' as PlaceholderKey, label: 'Course Name', sampleValue: 'Full Stack React 19 & Cloud Architecture' },
          { id: 'f-3', key: '{{academy_name}}' as PlaceholderKey, label: 'Academy / Institute Name', sampleValue: 'Bright Academy of Technology' },
          { id: 'f-4', key: '{{certificate_number}}' as PlaceholderKey, label: 'Certificate Number', sampleValue: 'CERT-2026-8841' },
          { id: 'f-5', key: '{{issue_date}}' as PlaceholderKey, label: 'Issue Date', sampleValue: 'August 5, 2026' },
          { id: 'f-6', key: '{{qr_code}}' as PlaceholderKey, label: 'Verification QR Code', sampleValue: 'https://cubixskill.com/verify/CERT-2026-8841' },
        ],
        updatedAt: new Date().toISOString(),
      },

      savedCustomTemplates: PRESET_CUSTOM_TEMPLATES,
      hasHydrated: false,
      selectedElementId: null,
      zoomLevel: 100,
      showGrid: true,
      snapToGrid: false,

      history: [DEFAULT_ELEMENTS],
      historyIndex: 0,

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      setSelectedElementId: (id) => set({ selectedElementId: id }),
      setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
      setShowGrid: (show) => set({ showGrid: show }),
      setSnapToGrid: (snap) => set({ snapToGrid: snap }),

      setDraft: (updates) => {
        const current = get().draft;
        set({
          draft: { ...current, ...updates, updatedAt: new Date().toISOString() },
        });
      },

      updateBackground: (updates) => {
        const state = get();
        const currentBg = state.draft.bgConfig || DEFAULT_BG_CONFIG;
        const recentColors = [...(currentBg.recentColors || [])];
        if (updates.solidColor && !recentColors.includes(updates.solidColor)) {
          recentColors.unshift(updates.solidColor);
          if (recentColors.length > 8) recentColors.pop();
        }

        const newBgConfig: BackgroundConfig = {
          ...currentBg,
          ...updates,
          recentColors,
        };

        set({
          draft: {
            ...state.draft,
            bgConfig: newBgConfig,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      addElement: (el) => {
        const state = get();
        const newId = `el-${Date.now()}`;
        const maxZIndex = state.draft.elements.reduce((max, e) => Math.max(max, e.zIndex || 10), 10);
        
        let initialWidth = el.width;
        let initialHeight = el.height;
        const fontSz = el.fontSize || 56;
        const padding = el.padding || DEFAULT_PADDING;
        const textContent = el.text || el.label || 'Sample Text';

        if ((el.type === 'text' || el.type === 'placeholder') && (!el.width || !el.height)) {
          const metrics = calculateTextInitialSize({
            text: textContent,
            fontSize: fontSz,
            fontFamily: el.fontFamily || 'Inter',
            fontWeight: el.fontWeight || '600',
            fontStyle: el.fontStyle || 'normal',
            letterSpacing: el.letterSpacing || 0,
            lineHeight: el.lineHeight || 1.1,
            padding,
          });
          initialWidth = metrics.widthPercent;
          initialHeight = metrics.heightPercent;
        }

        const newElement: CustomCanvasElement = {
          ...el,
          id: newId,
          width: initialWidth || 50,
          height: initialHeight || 40,
          fontSize: fontSz,
          minFontSize: el.minFontSize ?? 1,
          padding,
          zIndex: maxZIndex + 1,
          isLocked: false,
          isVisible: true,
        };

        const newElements = [...state.draft.elements, newElement];
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newElements);

        set({
          draft: { ...state.draft, elements: newElements, updatedAt: new Date().toISOString() },
          selectedElementId: newId,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      updateElement: (id, updates) => {
        const state = get();
        const newElements = state.draft.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        );

        set({
          draft: { ...state.draft, elements: newElements, updatedAt: new Date().toISOString() },
        });
      },

      deleteElement: (id) => {
        const state = get();
        const newElements = state.draft.elements.filter((el) => el.id !== id);
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newElements);

        set({
          draft: { ...state.draft, elements: newElements, updatedAt: new Date().toISOString() },
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      duplicateElement: (id) => {
        const state = get();
        const target = state.draft.elements.find((el) => el.id === id);
        if (!target) return;

        const newId = `el-${Date.now()}`;
        const duplicated: CustomCanvasElement = {
          ...target,
          id: newId,
          label: `${target.label} (Copy)`,
          x: Math.min(90, target.x + 4),
          y: Math.min(90, target.y + 4),
          zIndex: (target.zIndex || 10) + 1,
        };

        const newElements = [...state.draft.elements, duplicated];
        set({
          draft: { ...state.draft, elements: newElements, updatedAt: new Date().toISOString() },
          selectedElementId: newId,
        });
      },

      reorderElement: (id, direction) => {
        const state = get();
        const elements = [...state.draft.elements];
        const idx = elements.findIndex((el) => el.id === id);
        if (idx === -1) return;

        const target = elements[idx];
        if (direction === 'front') {
          elements.splice(idx, 1);
          elements.push(target);
        } else if (direction === 'back') {
          elements.splice(idx, 1);
          elements.unshift(target);
        } else if (direction === 'forward' && idx < elements.length - 1) {
          const temp = elements[idx];
          elements[idx] = elements[idx + 1];
          elements[idx + 1] = temp;
        } else if (direction === 'backward' && idx > 0) {
          const temp = elements[idx];
          elements[idx] = elements[idx - 1];
          elements[idx - 1] = temp;
        }

        const reindexed = elements.map((el, i) => ({ ...el, zIndex: (i + 1) * 10 }));

        set({
          draft: { ...state.draft, elements: reindexed, updatedAt: new Date().toISOString() },
        });
      },

      alignElement: (id, alignment) => {
        const state = get();
        const target = state.draft.elements.find((el) => el.id === id);
        if (!target) return;

        let newX = target.x;
        let newY = target.y;

        if (alignment === 'left') newX = Math.round(target.width / 2);
        else if (alignment === 'center') newX = 50;
        else if (alignment === 'right') newX = Math.round(100 - target.width / 2);
        else if (alignment === 'top') newY = 10;
        else if (alignment === 'middle') newY = 50;
        else if (alignment === 'bottom') newY = 90;

        get().updateElement(id, { x: newX, y: newY });
      },

      // Custom Reusable Template Actions
      saveAsCustomTemplate: (title, description = '') => {
        const state = get();
        const newTemplate: SavedCustomTemplateItem = {
          id: `tmpl-custom-${Date.now()}`,
          title: title || state.draft.title || 'Untitled Custom Template',
          description,
          canvasSize: state.draft.canvasSize,
          bgConfig: state.draft.bgConfig || DEFAULT_BG_CONFIG,
          elements: state.draft.elements,
          selectedFields: state.draft.selectedFields,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedTemplates = [newTemplate, ...state.savedCustomTemplates];
        set({ savedCustomTemplates: updatedTemplates });
        return newTemplate;
      },

      loadCustomTemplate: (templateId) => {
        const state = get();
        const target = state.savedCustomTemplates.find((t) => t.id === templateId);
        if (!target) return { missingFields: [] };

        const currentFieldKeys = state.draft.selectedFields.map((f) => f.key);
        const templatePlaceholderKeys = target.elements
          .filter((e) => e.placeholderKey)
          .map((e) => e.placeholderKey as string);

        const missingFields = templatePlaceholderKeys.filter((pk) => !currentFieldKeys.includes(pk as PlaceholderKey));

        set({
          draft: {
            ...state.draft,
            title: target.title,
            canvasSize: target.canvasSize,
            bgConfig: target.bgConfig,
            elements: target.elements,
            updatedAt: new Date().toISOString(),
          },
          history: [target.elements],
          historyIndex: 0,
          selectedElementId: null,
        });

        return { missingFields };
      },

      duplicateCustomTemplate: (templateId) => {
        const state = get();
        const target = state.savedCustomTemplates.find((t) => t.id === templateId);
        if (!target) return;

        const copyItem: SavedCustomTemplateItem = {
          ...target,
          id: `tmpl-custom-${Date.now()}`,
          title: `${target.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({ savedCustomTemplates: [copyItem, ...state.savedCustomTemplates] });
      },

      renameCustomTemplate: (templateId, newTitle) => {
        const state = get();
        const updated = state.savedCustomTemplates.map((t) =>
          t.id === templateId ? { ...t, title: newTitle, updatedAt: new Date().toISOString() } : t
        );
        set({ savedCustomTemplates: updated });
      },

      deleteCustomTemplate: (templateId) => {
        const state = get();
        const updated = state.savedCustomTemplates.filter((t) => t.id !== templateId);
        set({ savedCustomTemplates: updated });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const prevIndex = state.historyIndex - 1;
          set({
            draft: { ...state.draft, elements: state.history[prevIndex] },
            historyIndex: prevIndex,
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const nextIndex = state.historyIndex + 1;
          set({
            draft: { ...state.draft, elements: state.history[nextIndex] },
            historyIndex: nextIndex,
          });
        }
      },

      saveDraft: () => {
        const state = get();
        set({
          draft: { ...state.draft, updatedAt: new Date().toISOString() },
        });
      },
    }),
    {
      name: 'cubixskill-custom-certificate-designer-draft',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
