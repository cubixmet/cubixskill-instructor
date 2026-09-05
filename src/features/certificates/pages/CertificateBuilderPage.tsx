import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Layers,
  Save,
  Eye,
  Type,
  ImageIcon,
  QrCode,
  Sliders,
  Trash2,
  PlusCircle,
  BookOpen,
  Check,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Search,
  Upload,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  certificatesService,
  type CertificateBinding,
} from '../../../services/certificates.service';
import { coursesService } from '../../../services/courses.service';
import { useAuthStore } from '../../../store/auth.store';
import { PersonalFieldsModal } from '../components/PersonalFieldsModal';
import { measureTextAsync, getSampleTextForField } from '../utils/textMeasurement';
import { AutoFitTextContainer } from '../components/AutoFitTextContainer';
import { calculateAutoFontSize, calculateFontSizeForWidth, DEFAULT_TEXT_PADDING } from '../utils/textFit';
import {
  fetchCertificateFonts,
  loadFontFaceIntoDOM,
  FALLBACK_SYSTEM_FONTS,
  type CertificateFontItem,
} from '../utils/fontRegistry';
import { UploadFontModal } from '../components/UploadFontModal';
import {
  useCertificateCourses,
  useCertificateFonts,
  useCertificateTemplateDetail,
  certificateKeys,
} from '../hooks/useCertificateQueries';
import {
  serializeCertificateTemplate,
  deserializeCertificateTemplate,
} from '../utils/certificateSerialization';

export interface CanvasElement {
  id: string;
  binding: string;
  label: string;
  type: 'text' | 'image' | 'qr' | 'static_text';
  x: number; // percentage 0 to 1
  y: number; // percentage 0 to 1
  width: number; // percentage 0 to 1
  height: number; // percentage 0 to 1
  font_size?: number;
  fontSize?: number;
  max_font_size?: number;
  maxFontSize?: number;
  min_font_size?: number;
  minFontSize?: number;
  last_fitted_font_size?: number;
  auto_fit?: boolean;
  autoFit?: boolean;
  allow_grow?: boolean;
  allowGrow?: boolean;
  overflow?: 'ellipsis' | 'clip';
  font_weight?: string;
  fontWeight?: string;
  font_style?: string;
  fontStyle?: string;
  fontKey?: string;
  font_key?: string;
  multiline?: boolean;
  font_family?: string;
  fontFamily?: string;
  font_id?: string;
  fontId?: string;
  letter_spacing?: number;
  letterSpacing?: number;
  line_height?: number;
  lineHeight?: number;
  text_align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  fontColor?: string;
  rotation?: number;
  opacity?: number;
  is_locked?: boolean;
  is_visible?: boolean;
  prefix?: string;
  suffix?: string;
  z_index?: number;
  image_url?: string;
  static_text?: string;
  asset_id?: string | null;
  assetId?: string | null;
  padding?: { top: number; right: number; bottom: number; left: number };
  fit?: 'contain' | 'cover';
}

export const CertificateBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { templateId, courseId: routeCourseId } = useParams<{ templateId?: string; courseId?: string }>();
  const isEditMode = Boolean(templateId);

  const auth = useAuthStore();
  const academyName = auth.academy?.name || (auth.user as any)?.academy_name || 'CubixSkill Academy';

  // Load queries at top level in fixed hook order
  const {
    data: queriedCourses = [],
    isLoading: isLoadingCoursesQuery,
    isError: isCoursesError,
    error: coursesError,
    refetch: refetchCourses,
  } = useCertificateCourses();

  const { data: queriedFonts = FALLBACK_SYSTEM_FONTS } = useCertificateFonts();

  const {
    data: templateDetail,
    isLoading: isLoadingTemplate,
    isError: isTemplateError,
    error: templateError,
  } = useCertificateTemplateDetail(templateId);

  // Single-hydration ref guard to prevent re-hydration resets when background queries update
  const hydratedTemplateRef = useRef<string | null>(null);

  // Step Control (Step 1: Course & Dynamic Fields Selection, Step 2: Visual Designer)
  const [step, setStep] = useState<1 | 2>(templateId ? 2 : 1);

  // Course State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(routeCourseId || '');

  // Dynamic Fields Discovery State
  const [availableBindings, setAvailableBindings] = useState<CertificateBinding[]>([]);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>([
    'student.full_name',
    'course.title',
    'certificate.number',
    'certificate.issue_date',
  ]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [fieldSearch, setFieldSearch] = useState('');

  // Template State
  const [templateName, setTemplateName] = useState<string>('Custom Course Completion Certificate');
  const [description, setDescription] = useState<string>('');
  const [pageSize, setPageSize] = useState<'A4' | 'LETTER' | 'CUSTOM'>('A4');
  const [orientation, setOrientation] = useState<'LANDSCAPE' | 'PORTRAIT'>('LANDSCAPE');
  const [customWidth, setCustomWidth] = useState<number | undefined>(undefined);
  const [customHeight, setCustomHeight] = useState<number | undefined>(undefined);
  const [customUnit, setCustomUnit] = useState<'MM' | 'CM' | 'INCH'>('MM');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');
  const [backgroundAssetId, setBackgroundAssetId] = useState<string | null>(null);

  // Canvas Elements (Starts BLANK as required by product spec)
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  // Local state for numeric inputs (Width, Height, Font Size)
  const [widthInput, setWidthInput] = useState<string>('');
  const [heightInput, setHeightInput] = useState<string>('');
  const [fontSizeInput, setFontSizeInput] = useState<string>('');
  const selectedElementIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedElement) {
      setWidthInput(String(Math.round((selectedElement.width || 0.2) * 1600)));
      setHeightInput(String(Math.round((selectedElement.height || 0.05) * 1131)));
      const configuredSize = selectedElement.fontSize ?? selectedElement.font_size ?? selectedElement.maxFontSize ?? selectedElement.max_font_size ?? 56;
      if (selectedElementIdRef.current !== selectedElement.id) {
        selectedElementIdRef.current = selectedElement.id;
        setFontSizeInput(String(configuredSize));
      }
    } else {
      selectedElementIdRef.current = null;
      setWidthInput('');
      setHeightInput('');
      setFontSizeInput('');
    }
  }, [
    selectedElement?.id,
    selectedElement?.width,
    selectedElement?.height,
  ]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [toastState, setToastState] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);

  // Font Registry & License State
  const [availableFonts, setAvailableFonts] = useState<CertificateFontItem[]>(FALLBACK_SYSTEM_FONTS);
  const [isUploadFontModalOpen, setIsUploadFontModalOpen] = useState(false);



  useEffect(() => {
    if (queriedFonts && queriedFonts.length > 0) {
      setAvailableFonts(queriedFonts);
    }
  }, [queriedFonts]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'error') => {
    setToastState({ message: msg, type });
    setTimeout(() => setToastState(null), 3500);
  };

  const [_canvasRenderScale, setCanvasRenderScale] = useState(1);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateScale = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const nextScale = Math.min(rect.width / 1600, rect.height / 1131);
      if (Number.isFinite(nextScale) && nextScale > 0) {
        setCanvasRenderScale(nextScale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  // Move & Resize Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elementX: number; elementY: number; elementW: number; elementH: number }>({
    mouseX: 0,
    mouseY: 0,
    elementX: 0,
    elementY: 0,
    elementW: 0,
    elementH: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const fontFileInputRef = useRef<HTMLInputElement>(null);

  const handleFontUploaded = async (fontObj: CertificateFontItem) => {
    showToast('Loading uploaded font...', 'info');
    try {
      const loaded = await loadFontFaceIntoDOM(fontObj);
      if (loaded && typeof document !== 'undefined' && document.fonts) {
        try {
          await document.fonts.load(`16px "${fontObj.family}"`);
          await document.fonts.ready;
        } catch (_e) {}
      }
      if (!loaded) {
        showToast('Unable to load uploaded font.', 'error');
        return;
      }
      showToast('Font ready', 'success');

      setAvailableFonts((prev) => {
        if (prev.some((f) => f.id === fontObj.id || f.key === fontObj.key)) {
          return prev.map((f) => (f.id === fontObj.id || f.key === fontObj.key ? fontObj : f));
        }
        return [...prev, fontObj];
      });

      const runtimeFamily = fontObj.source === 'ACADEMY' ? `cubix-font-${fontObj.id}` : fontObj.family;

      if (selectedElementId) {
        const widthPx = (selectedElement?.width || 0.2) * 1600;
        const heightPx = (selectedElement?.height || 0.05) * 1131;

        const fitRes = calculateAutoFontSize({
          text: resolveSampleValue(selectedElement),
          width: widthPx,
          height: heightPx,
          padding: selectedElement.padding || DEFAULT_TEXT_PADDING,
          fontFamily: runtimeFamily,
          fontWeight: selectedElement.font_weight || selectedElement.fontWeight || '600',
          fontStyle: selectedElement.font_style || selectedElement.fontStyle || 'normal',
          maxFontSize: 150,
          minFontSize: 1,
          lineHeight: selectedElement.line_height || 1.0,
          letterSpacing: selectedElement.letter_spacing || 0,
          multiline: selectedElement.multiline || false,
        });

        const fittedFont = Math.round(Math.min(150, Math.max(1, fitRes.renderedFontSize)));

        updateSelectedElement({
          fontKey: fontObj.key,
          font_family: runtimeFamily,
          fontFamily: runtimeFamily,
          font_id: fontObj.id,
          fontId: fontObj.id,
          fontSize: fittedFont,
          font_size: fittedFont,
          maxFontSize: fittedFont,
          max_font_size: fittedFont,
        });
        setFontSizeInput(String(fittedFont));
      }
    } catch (err: any) {
      showToast(err.message || 'Unable to load uploaded font.', 'error');
    }
  };

  const resizeTextElementToContent = async (
    el: CanvasElement,
    options?: {
      fontSize?: number;
      fontObj?: CertificateFontItem;
      text?: string;
    }
  ) => {
    if (el.type === 'image') return;

    const fontSize = Math.min(
      150,
      Math.max(
        1,
        options?.fontSize ??
          el.fontSize ??
          el.font_size ??
          16
      )
    );

    const fontObj =
      options?.fontObj ??
      availableFonts.find(
        (f) =>
          f.key === el.fontKey ||
          f.id === el.fontId ||
          f.id === el.font_id ||
          f.family === el.font_family
      );

    if (fontObj) {
      const loaded = await loadFontFaceIntoDOM(fontObj);

      if (!loaded) {
        throw new Error('Unable to load selected font.');
      }
    }

    // IMPORTANT:
    // Academy fonts are registered under cubix-font-UUID.
    // Measure using THAT SAME runtime family.
    const runtimeFamily =
      fontObj?.source === 'ACADEMY'
        ? `cubix-font-${fontObj.id}`
        : fontObj?.family ||
          el.font_family ||
          el.fontFamily ||
          'Inter';

    const renderedText =
      options?.text ??
      resolveSampleValue(el);

    if (document.fonts) {
      try {
        await document.fonts.load(
          `${el.font_style || el.fontStyle || 'normal'} ${
            el.font_weight || el.fontWeight || '600'
          } ${fontSize}px "${runtimeFamily}"`,
          renderedText
        );

        await document.fonts.ready;
      } catch {
        // loadFontFaceIntoDOM already handles registered font state
      }
    }

    const canvas = canvasRef.current;
    const rect = canvas ? canvas.getBoundingClientRect() : null;
    const canvasWidth = rect && rect.width > 0 ? rect.width : 1600;
    const canvasHeight = rect && rect.height > 0 ? rect.height : 1131;

    const measured = await measureTextAsync({
      text: renderedText,
      fontSize,
      fontFamily: runtimeFamily,
      fontWeight: el.font_weight || el.fontWeight || '600',
      fontStyle: el.font_style || el.fontStyle || 'normal',
      letterSpacing: el.letter_spacing || 0,
      lineHeight: el.line_height || 1,
      padding: el.padding || {
        top: 1,
        right: 2,
        bottom: 1,
        left: 2,
      },
      canvasWidth,
      canvasHeight,
    });

    // Calculate container ratios from displayed canvas dimensions
    const width = Math.max(1 / canvasWidth, measured.widthPx / canvasWidth);
    const height = Math.max(1 / canvasHeight, measured.heightPx / canvasHeight);

    return {
      width,
      height,
      fontSize,
      runtimeFamily,
      fontObj,
    };
  };

  const handleFontSizeChange = async (
    targetFontSize: number,
    targetElement?: CanvasElement
  ) => {
    const el = targetElement || selectedElement;
    if (!el || el.type === 'image') return;

    try {
      const result = await resizeTextElementToContent(el, {
        fontSize: targetFontSize,
      });

      if (!result) return;

      updateSelectedElement({
        fontSize: result.fontSize,
        font_size: result.fontSize,
        maxFontSize: result.fontSize,
        max_font_size: result.fontSize,

        width: result.width,
        height: result.height,

        font_family: result.runtimeFamily,
        fontFamily: result.runtimeFamily,
      });

      setFontSizeInput(String(result.fontSize));
      setWidthInput(String(Math.round(result.width * 1600)));
      setHeightInput(String(Math.round(result.height * 1131)));

      // IMPORTANT:
      // x and y are CENTER coordinates.
      // Never change x/y here.
    } catch (error: any) {
      showToast(
        error?.message || 'Unable to resize text element.',
        'error'
      );
    }
  };

  const handleTextContentChange = async (value: string) => {
    if (!selectedElement) return;

    const nextElement: CanvasElement = {
      ...selectedElement,
      static_text: value,
    };

    const result = await resizeTextElementToContent(nextElement, {
      text: value,
    });

    if (!result) return;

    updateSelectedElement({
      static_text: value,
      width: result.width,
      height: result.height,
    });

    setWidthInput(String(Math.round(result.width * 1600)));
    setHeightInput(String(Math.round(result.height * 1131)));
  };

  const handleDirectFontFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['ttf', 'otf', 'woff', 'woff2'];
    if (!ext || !validExtensions.includes(ext)) {
      showToast('Invalid font file format. Supported formats: .ttf, .otf, .woff, .woff2.');
      return;
    }

    showToast('Uploading font...', 'info');
    try {
      const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      const formData = new FormData();
      formData.append('font_file', file);
      formData.append('display_name', displayName);
      formData.append('user_rights_confirmed', 'true');

      const uploaded = await certificatesService.uploadFont(formData);
      await handleFontUploaded(uploaded);
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to upload font.');
    }
  };

  const courses = React.useMemo(() => {
    return Array.isArray(queriedCourses)
      ? queriedCourses
      : (queriedCourses as any)?.results ?? [];
  }, [queriedCourses]);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // Fetch available fields whenever selectedCourseId changes
  useEffect(() => {
    if (!selectedCourseId) return;
    setIsLoadingFields(true);
    certificatesService
      .getTemplateBindings(selectedCourseId)
      .then((res) => {
        setAvailableBindings(res);
        const validKeys = res.map((b) => b.key);
        setSelectedFieldKeys((prev) => prev.filter((k) => validKeys.includes(k)));
      })
      .catch(() => {
        showToast("Couldn't load available fields for this course.");
      })
      .finally(() => setIsLoadingFields(false));
  }, [selectedCourseId]);

  // Reset state when entering /certificates/new (no templateId)
  useEffect(() => {
    if (!templateId) {
      hydratedTemplateRef.current = null;
      setTemplateName('Custom Course Completion Certificate');
      setDescription('');
      setPageSize('A4');
      setOrientation('LANDSCAPE');
      setCustomWidth(undefined);
      setCustomHeight(undefined);
      setCustomUnit('MM');
      setBackgroundImageUrl('');
      setBackgroundAssetId(null);
      setElements([]);
      setSelectedElementId(null);
      setSelectedFieldKeys([
        'student.full_name',
        'course.title',
        'certificate.number',
        'certificate.issue_date',
      ]);
      setStep(1);
    }
  }, [templateId]);

  // Load existing template if editing (Hydrate EXACTLY ONCE per template identity)
  useEffect(() => {
    if (templateDetail && templateId) {
      const templateIdentity = templateDetail.id || templateId;
      if (hydratedTemplateRef.current === templateIdentity) {
        return;
      }
      hydratedTemplateRef.current = templateIdentity;

      const deserialized = deserializeCertificateTemplate(templateDetail);
      setTemplateName(deserialized.templateName);
      setDescription(deserialized.description);
      setPageSize(deserialized.pageSize);
      setOrientation(deserialized.orientation);
      setCustomWidth(deserialized.customWidth);
      setCustomHeight(deserialized.customHeight);
      if (deserialized.customUnit) {
        setCustomUnit(deserialized.customUnit);
      }
      setBackgroundImageUrl(deserialized.backgroundImageUrl);
      setBackgroundAssetId(deserialized.backgroundAssetId ?? null);
      if (deserialized.selectedCourseId) {
        setSelectedCourseId(deserialized.selectedCourseId);
      }
      setStep(2);

      // Pre-load custom fonts into DOM BEFORE setting elements
      (async () => {
        try {
          const fontsToSearch = queriedFonts && queriedFonts.length > 0 ? queriedFonts : await fetchCertificateFonts();
          for (const el of deserialized.elements) {
            const fontId = el.fontId ?? el.font_id;
            const fontKey = el.fontKey ?? el.font_key;
            if (fontId || fontKey) {
              const match = fontsToSearch.find((f) => String(f.id) === String(fontId) || f.key === fontKey);
              if (match) {
                await loadFontFaceIntoDOM(match);
              }
            }
          }
          if (typeof document !== 'undefined' && document.fonts) {
            await document.fonts.ready;
          }
        } catch (_) {}

        setElements(deserialized.elements);
        const keys = deserialized.elements.map((el) => el.binding).filter(Boolean);
        if (keys.length > 0) {
          setSelectedFieldKeys(Array.from(new Set(keys)));
        }
      })();
    }
  }, [templateDetail, templateId, queriedFonts]);

  // Keyboard navigation & movement shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      if (!selectedElementId) return;

      const stepSize = e.shiftKey ? 0.05 : 0.01;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateSelectedElement({ x: Math.max(0, (selectedElement?.x || 0.5) - stepSize) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateSelectedElement({ x: Math.min(1, (selectedElement?.x || 0.5) + stepSize) });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateSelectedElement({ y: Math.max(0, (selectedElement?.y || 0.5) - stepSize) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateSelectedElement({ y: Math.min(1, (selectedElement?.y || 0.5) + stepSize) });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, elements]);

  const toggleFieldSelection = (key: string) => {
    setSelectedFieldKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const addElement = async (binding: CertificateBinding) => {
    // 1. Resolve preview text string FIRST
    const sampleText = getSampleTextForField(binding.key, binding.label);

    // 2. Resolve selected font FIRST & load font into DOM
    const defaultFontObj = availableFonts[0] || FALLBACK_SYSTEM_FONTS[0];
    const draftEl: CanvasElement = {
      id: `el-${Date.now()}`,
      binding: binding.key,
      label: binding.label,
      type: binding.type,
      x: 0.5,
      y: 0.5,
      width: 0.2,
      height: 0.05,
      fontSize: 16,
      font_size: 16,
      font_weight: '600',
      fontKey: defaultFontObj?.key || 'inter',
      font_family: defaultFontObj?.family || 'Inter',
      padding: { top: 1, right: 2, bottom: 1, left: 2 },
    };

    const result = await resizeTextElementToContent(draftEl, {
      fontSize: 16,
      fontObj: defaultFontObj,
      text: sampleText,
    });

    if (!result) return;
    const nextY = parseFloat((0.25 + ((elements.length * 0.1) % 0.45)).toFixed(2));

    const newEl: CanvasElement = {
      ...draftEl,
      y: nextY,
      width: result.width,
      height: result.height,
      font_size: 16,
      fontSize: 16,
      min_font_size: 1,
      minFontSize: 1,
      max_font_size: 16,
      maxFontSize: 16,
      auto_fit: true,
      autoFit: true,
      allow_grow: false,
      allowGrow: false,
      font_weight: '600',
      fontKey: defaultFontObj?.key || 'inter',
      font_family: result.runtimeFamily,
      fontFamily: result.runtimeFamily,
      text_align: 'center',
      color: '#0F172A',
      padding: { top: 1, right: 2, bottom: 1, left: 2 },
      z_index: elements.length + 1,
    };

    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  const addStaticTextElement = async () => {
    const textLabel = 'Certificate of Completion';
    const defaultFontObj = availableFonts[0] || FALLBACK_SYSTEM_FONTS[0];

    const draftEl: CanvasElement = {
      id: `el-${Date.now()}`,
      binding: 'static_text',
      label: 'Static Heading',
      type: 'static_text',
      static_text: textLabel,
      x: 0.5,
      y: 0.5,
      width: 0.2,
      height: 0.05,
      fontSize: 16,
      font_size: 16,
      font_weight: '700',
      fontKey: defaultFontObj?.key || 'inter',
      font_family: defaultFontObj?.family || 'Inter',
      padding: { top: 1, right: 2, bottom: 1, left: 2 },
    };

    const result = await resizeTextElementToContent(draftEl, {
      fontSize: 16,
      fontObj: defaultFontObj,
      text: textLabel,
    });

    if (!result) return;
    const nextY = parseFloat((0.25 + ((elements.length * 0.1) % 0.45)).toFixed(2));

    const newEl: CanvasElement = {
      ...draftEl,
      y: nextY,
      width: result.width,
      height: result.height,
      font_size: 16,
      fontSize: 16,
      min_font_size: 1,
      minFontSize: 1,
      max_font_size: 16,
      maxFontSize: 16,
      auto_fit: true,
      autoFit: true,
      allow_grow: false,
      allowGrow: false,
      font_weight: '700',
      fontKey: defaultFontObj?.key || 'inter',
      font_family: defaultFontObj?.family || 'Inter',
      text_align: 'center',
      color: '#0F172A',
      padding: DEFAULT_TEXT_PADDING,
      z_index: elements.length + 1,
    };

    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    showToast('Uploading image asset...', 'info');
    try {
      const media = await coursesService.uploadMedia(file);
      const url =
        media.url ||
        media.relative_path ||
        media.file_url ||
        (media.stored_filename ? `/media/${media.stored_filename}` : '');

      if (!media.id || !url) {
        throw new Error('Upload completed but backend did not return a valid media id/url.');
      }

      const newEl: CanvasElement = {
        id: `el-${Date.now()}`,
        binding: 'custom_image',
        label: 'Academy Stamp / Image',
        type: 'image',
        image_url: url,
        asset_id: media.id,
        assetId: media.id,
        x: 0.5,
        y: 0.75,
        width: 0.15,
        height: 0.15,
        z_index: elements.length + 1,
        fit: 'contain',
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedElementId(newEl.id);
      showToast('Image element uploaded and added to stage.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload image asset.', 'error');
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    showToast('Uploading background image...', 'info');
    try {
      const media = await coursesService.uploadMedia(file);
      const url =
        media.url ||
        media.relative_path ||
        media.file_url ||
        (media.stored_filename ? `/media/${media.stored_filename}` : '');

      if (!media.id || !url) {
        throw new Error('Upload completed but backend did not return a valid media id/url.');
      }

      setBackgroundImageUrl(url);
      setBackgroundAssetId(media.id);
      showToast('Certificate background image uploaded successfully.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload background image.', 'error');
    }
  };

  const handlePersonalFieldCreated = async (field: {
    key: string;
    label: string;
    field_type: string;
  }) => {
    const newKey = `student.custom.${field.key}`;

    const newBinding: CertificateBinding = {
      key: newKey,
      label: `Student ${field.label}`,
      group: 'Personal Details (Custom Student Fields)',
      type: 'text',
    };

    // Optimistically show the field immediately.
    setAvailableBindings((prev) => {
      if (prev.some((item) => item.key === newKey)) {
        return prev;
      }

      return [...prev, newBinding];
    });

    // Automatically select the new field.
    setSelectedFieldKeys((prev) => {
      if (prev.includes(newKey)) {
        return prev;
      }

      return [...prev, newKey];
    });

    // Invalidate certificate-related server cache.
    await queryClient.invalidateQueries({
      queryKey: certificateKeys.all,
    });

    // Re-sync canonical bindings from backend.
    if (selectedCourseId) {
      try {
        const bindings =
          await certificatesService.getTemplateBindings(selectedCourseId);

        setAvailableBindings(bindings);

        if (bindings.some((item) => item.key === newKey)) {
          setSelectedFieldKeys((prev) =>
            prev.includes(newKey)
              ? prev
              : [...prev, newKey]
          );
        }
      } catch (err: any) {
        showToast(
          err?.response?.data?.message ||
            err?.message ||
            'Personal field was created, but fields could not be refreshed.',
          'error'
        );

        return;
      }
    }

    showToast(
      `Personal field '${field.label}' created.`,
      'success'
    );
  };

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;

    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== selectedElementId) return el;
        const fontVal = updates.font_size ?? updates.fontSize;
        const maxFontVal = updates.max_font_size ?? updates.maxFontSize;
        const familyVal = updates.font_family ?? updates.fontFamily;
        const idVal = updates.font_id ?? updates.fontId;
        const weightVal = updates.font_weight ?? updates.fontWeight;
        const styleVal = updates.font_style ?? updates.fontStyle;

        return {
          ...el,
          ...updates,
          ...(fontVal !== undefined ? { font_size: fontVal, fontSize: fontVal } : {}),
          ...(maxFontVal !== undefined ? { max_font_size: maxFontVal, maxFontSize: maxFontVal } : {}),
          ...(familyVal !== undefined ? { font_family: familyVal, fontFamily: familyVal } : {}),
          ...(idVal !== undefined ? { font_id: idVal, fontId: idVal } : {}),
          ...(weightVal !== undefined ? { font_weight: weightVal, fontWeight: weightVal } : {}),
          ...(styleVal !== undefined ? { font_style: styleVal, fontStyle: styleVal } : {}),
        };
      })
    );
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
  };

  // Layer ordering
  const moveLayer = (direction: 'up' | 'down') => {
    if (!selectedElement) return;
    const currentZ = selectedElement.z_index || 1;
    const newZ = direction === 'up' ? currentZ + 1 : Math.max(1, currentZ - 1);
    updateSelectedElement({ z_index: newZ });
  };

  // Mouse / Touch / Pointer Dragging & Resizing Handlers
  const handleMouseDownOnElement = (e: React.MouseEvent | React.TouchEvent, el: CanvasElement, resizeHandle?: string) => {
    // Explicitly stop event propagation to prevent canvas click handler from clearing selection
    e.stopPropagation();
    if ('nativeEvent' in e && e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation?.();
    }

    // Set canonical active element ID immediately
    setSelectedElementId(el.id);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      elementX: el.x,
      elementY: el.y,
      elementW: el.width,
      elementH: el.height,
    };

    if (resizeHandle) {
      setIsResizing(resizeHandle);
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !isResizing) return;
    if (!selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = (clientX - dragStartRef.current.mouseX) / rect.width;
    const deltaY = (clientY - dragStartRef.current.mouseY) / rect.height;

    if (isDragging) {
      const newX = Math.max(0, Math.min(1, dragStartRef.current.elementX + deltaX));
      const newY = Math.max(0, Math.min(1, dragStartRef.current.elementY + deltaY));
      updateSelectedElement({ x: parseFloat(newX.toFixed(4)), y: parseFloat(newY.toFixed(4)) });
    } else if (isResizing) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();

      const canvasWidthPx = canvasRect.width;
      const canvasHeightPx = canvasRect.height;

      if (canvasWidthPx <= 0 || canvasHeightPx <= 0) return;

      // Text elements can become very small.
      // These ratios are based on the ACTUAL DISPLAYED CANVAS.
      const MIN_TEXT_WIDTH_RATIO = 1 / canvasWidthPx;
      const MIN_TEXT_HEIGHT_RATIO = 1 / canvasHeightPx;

      let newW = dragStartRef.current.elementW;
      let newH = dragStartRef.current.elementH;

      if (isResizing.includes('r')) {
        newW = Math.max(
          MIN_TEXT_WIDTH_RATIO,
          dragStartRef.current.elementW + deltaX
        );
      }

      if (isResizing.includes('l')) {
        newW = Math.max(
          MIN_TEXT_WIDTH_RATIO,
          dragStartRef.current.elementW - deltaX
        );
      }

      if (isResizing.includes('b')) {
        newH = Math.max(
          MIN_TEXT_HEIGHT_RATIO,
          dragStartRef.current.elementH + deltaY
        );
      }

      if (isResizing.includes('t')) {
        newH = Math.max(
          MIN_TEXT_HEIGHT_RATIO,
          dragStartRef.current.elementH - deltaY
        );
      }

      // IMPORTANT:
      // Convert normalized dimensions to CURRENT VISIBLE CANVAS pixels.
      // Do NOT use 1600 / 1131 here.
      const widthPx = newW * canvasWidthPx;
      const heightPx = newH * canvasHeightPx;

      if (selectedElement.type !== 'image') {
        const isSingleLine = !selectedElement.multiline;

        if (isSingleLine) {
          const fontObj = availableFonts.find(
            (f) =>
              f.key === selectedElement.fontKey ||
              f.id === selectedElement.fontId ||
              f.id === selectedElement.font_id
          );

          // Academy/custom fonts must use the exact runtime family
          // that FontFace registered.
          const runtimeFamily =
            fontObj?.source === 'ACADEMY'
              ? `cubix-font-${fontObj.id}`
              : fontObj?.family ||
                selectedElement.font_family ||
                selectedElement.fontFamily ||
                'Inter';

          const fontRes = calculateFontSizeForWidth({
            text: resolveSampleValue(selectedElement),

            // WIDTH RESIZE IS AUTHORITATIVE.
            // This is the real visible width of the blue box.
            targetWidthPx: widthPx,

            padding:
              selectedElement.padding ||
              {
                top: 1,
                right: 2,
                bottom: 1,
                left: 2,
              },

            fontFamily: runtimeFamily,

            fontWeight:
              selectedElement.font_weight ||
              selectedElement.fontWeight ||
              '600',

            fontStyle:
              selectedElement.font_style ||
              selectedElement.fontStyle ||
              'normal',

            lineHeight:
              selectedElement.line_height ||
              1,

            letterSpacing:
              selectedElement.letter_spacing ||
              0,

            maxFontSize: 150,
            minFontSize: 1,
          });

          const fittedFont = Math.min(
            150,
            Math.max(1, fontRes.fontSize)
          );

          /*
           * CRITICAL:
           *
           * Height must follow the NEW font size.
           * Do not preserve the previous dragged height for single-line text.
           *
           * calculateFontSizeForWidth should return the natural height
           * for the final fitted font.
           */
          const naturalHeightPx = Math.max(
            1,
            fontRes.measuredHeightPx
          );

          const naturalHeightRatio =
            naturalHeightPx / canvasHeightPx;

          updateSelectedElement({
            width: newW,

            // Natural single-line height follows Font Size.
            height: naturalHeightRatio,

            fontSize: fittedFont,
            font_size: fittedFont,

            maxFontSize: fittedFont,
            max_font_size: fittedFont,

            font_family: runtimeFamily,
            fontFamily: runtimeFamily,
          });

          setFontSizeInput(
            String(Math.round(fittedFont))
          );

          setWidthInput(
            String(Math.round(widthPx))
          );

          setHeightInput(
            String(Math.round(naturalHeightPx))
          );
        } else {
          // Multiline text may use both width and height constraints.
          const fitRes = calculateAutoFontSize({
            text: resolveSampleValue(selectedElement),
            width: widthPx,
            height: heightPx,

            padding:
              selectedElement.padding ||
              DEFAULT_TEXT_PADDING,

            fontFamily:
              selectedElement.font_family ||
              selectedElement.fontFamily ||
              availableFonts[0]?.family ||
              'Inter',

            fontWeight:
              selectedElement.font_weight ||
              selectedElement.fontWeight ||
              '600',

            fontStyle:
              selectedElement.font_style ||
              selectedElement.fontStyle ||
              'normal',

            maxFontSize: 150,
            minFontSize: 1,

            lineHeight:
              selectedElement.line_height ||
              1,

            letterSpacing:
              selectedElement.letter_spacing ||
              0,

            multiline: true,
          });

          const fittedFont = Math.min(
            150,
            Math.max(1, fitRes.renderedFontSize)
          );

          updateSelectedElement({
            width: newW,
            height: newH,

            fontSize: fittedFont,
            font_size: fittedFont,

            maxFontSize: fittedFont,
            max_font_size: fittedFont,
          });

          setFontSizeInput(
            String(Math.round(fittedFont))
          );

          setWidthInput(
            String(Math.round(widthPx))
          );

          setHeightInput(
            String(Math.round(heightPx))
          );
        }
      } else {
        updateSelectedElement({
          width: newW,
          height: newH,
        });

        setWidthInput(
          String(Math.round(widthPx))
        );

        setHeightInput(
          String(Math.round(heightPx))
        );
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const handleSaveTemplate = async () => {
    if (isSaving) return;
    if (!templateName.trim()) {
      showToast('Template name is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = serializeCertificateTemplate({
        templateName,
        description,
        pageSize,
        orientation,
        customWidth,
        customHeight,
        customUnit,
        backgroundImageUrl,
        backgroundAssetId,
        elements,
        selectedCourseId,
        availableFonts,
      });

      const targetId = templateDetail?.id || templateId;
      if (isEditMode && targetId) {
        // EDIT FLOW: PATCH existing template UUID
        await certificatesService.updateTemplate(targetId, payload);
        if (selectedCourseId) {
          try {
            await certificatesService.assignCourseToTemplate(targetId, selectedCourseId);
          } catch (courseErr: any) {
            showToast(`Template updated, but course assignment failed: ${courseErr?.message || 'Unknown error'}`);
          }
        }
        queryClient.invalidateQueries({ queryKey: certificateKeys.templates() });
        queryClient.invalidateQueries({ queryKey: certificateKeys.template(targetId) });
        queryClient.invalidateQueries({ queryKey: certificateKeys.summary() });
        showToast('Certificate template updated.', 'success');
        navigate('/certificates');
      } else {
        // CREATE FLOW: POST template -> assign course -> invalidate -> navigate to /certificates
        const created = await certificatesService.createTemplate(payload);
        const createdUuid = created.id;

        if (selectedCourseId && createdUuid) {
          try {
            await certificatesService.assignCourseToTemplate(createdUuid, selectedCourseId);
          } catch (courseErr: any) {
            showToast(`Template created, but course assignment failed: ${courseErr?.message || 'Unknown error'}`);
          }
        }

        queryClient.invalidateQueries({ queryKey: certificateKeys.templates() });
        queryClient.invalidateQueries({ queryKey: certificateKeys.summary() });
        showToast('Certificate template saved.', 'success');
        navigate('/certificates', { replace: true });
      }
    } catch (err: any) {
      const respData = err?.response?.data;
      let errorMsg = 'Failed to save certificate template.';
      if (typeof respData === 'string') {
        errorMsg = respData;
      } else if (respData && typeof respData === 'object') {
        if (respData.detail) {
          errorMsg = respData.detail;
        } else if (respData.message) {
          errorMsg = respData.message;
        } else {
          errorMsg = Object.entries(respData)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ');
        }
      } else if (err?.message) {
        errorMsg = err.message;
      }
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const sampleValues: Record<string, string> = {
    'student.full_name': 'Muhammed Ashraf Al Farooqi',
    'student.student_code': 'STD-2026-88',
    'student.email': 'student@cubixskill.edu',
    'student.phone': '+91 98765 43210',
    'course.title': 'Full Stack Cloud Microservices Architecture',
    'course.code': 'CS-401',
    'academy.name': academyName,
    'instructor.name': 'Dr. Alan Turing',
    'certificate.number': 'CS-2026-99218',
    'certificate.issue_date': new Date().toLocaleDateString(),
    'certificate.completion_date': new Date().toLocaleDateString(),
    'enrollment.enrolled_at': new Date().toLocaleDateString(),
    'enrollment.progress_percent': '100%',
    'assessment.overall_score': '95%',
    'assessment.assignment_overall_score': '92%',
    'assessment.quiz_overall_score': '98%',
  };

  const resolveSampleValue = (el: CanvasElement) => {
    if (el.type === 'static_text') return el.static_text || 'Certificate Text';
    let val = sampleValues[el.binding] || `{${el.label}}`;
    if (el.prefix) val = el.prefix + val;
    if (el.suffix) val = val + el.suffix;
    return val;
  };

  // Filter Bindings by Search
  const filteredBindings = availableBindings.filter(
    (b) =>
      b.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
      b.group.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const nonPersonalBindings = filteredBindings.filter(
    (b) => b.group !== 'Personal Details (Custom Student Fields)' && b.group !== 'Personal Details'
  );
  const personalBindings = filteredBindings.filter(
    (b) => b.group === 'Personal Details (Custom Student Fields)' || b.group === 'Personal Details'
  );

  const systemGroups = Array.from(new Set(nonPersonalBindings.map((b) => b.group)));

  // Designer Left Sidebar showing ONLY selected bindings
  if (templateId && isLoadingTemplate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] w-full space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Loading certificate template...</p>
      </div>
    );
  }

  if (templateId && isTemplateError) {
    const status = (templateError as any)?.response?.status;
    const isForbidden = status === 403;
    return (
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-8 rounded-[16px] max-w-lg mx-auto my-12 text-center space-y-4 font-sans">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          {isForbidden ? 'Permission Denied' : 'Certificate Template Not Found'}
        </h3>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          {isForbidden
            ? 'You do not have access permission to edit this certificate template.'
            : 'The requested certificate template could not be found or has been deleted.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/certificates')}
          className="mt-2 text-xs font-semibold cursor-pointer"
        >
          Back to Certificates
        </Button>
      </div>
    );
  }

  // Designer Left Sidebar showing ONLY selected bindings
  const designerSelectedBindings = availableBindings.filter((b) =>
    selectedFieldKeys.includes(b.key)
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6 text-left font-sans pb-12 select-none"
    >
      {/* Hidden File Inputs */}
      <input type="file" ref={imageFileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={bgFileInputRef} onChange={handleBackgroundUpload} accept="image/*" className="hidden" />

      {/* Toast Alert */}
      {toastState && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 text-xs font-semibold rounded-2xl shadow-xl animate-fade-in flex items-center gap-2 border ${
            toastState.type === 'error'
              ? 'bg-rose-950/90 text-rose-100 border-rose-800'
              : toastState.type === 'info'
              ? 'bg-slate-900 text-blue-200 border-slate-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toastState.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastState.message}</span>
          <button type="button" onClick={() => setToastState(null)} className="p-0.5 hover:bg-slate-700 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER & TOOLBAR */}
      <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (step === 2 && !activeSlug ? setStep(1) : navigate('/certificates'))}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer shrink-0 transition-colors"
              aria-label="Back to Certificates"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="Certificate Template Name"
                />
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 shrink-0">
                  Step {step} of 2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                {step === 1
                  ? 'Select Course & Pick Dynamic Fields â€” Choose the information source for automatic certificate generation.'
                  : 'Design and configure your certificate template.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {step === 1 ? (
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedCourseId || selectedFieldKeys.length === 0}
                onClick={() => setStep(2)}
                rightIcon={<ChevronRight className="w-4 h-4 text-white" />}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-10 px-4 rounded-xl cursor-pointer shadow-xs inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Continue to Designer ({selectedFieldKeys.length} Fields)
              </Button>
            ) : (
              <>
                {!templateId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="text-xs font-medium h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    Edit Fields Selection
                  </Button>
                )}
                <Button
                  variant={isPreview ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setIsPreview(!isPreview)}
                  leftIcon={<Eye className="w-4 h-4" />}
                  className="text-xs font-medium h-10 px-4 rounded-xl cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isPreview ? 'Edit Layout' : 'Preview Sample'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSaving || !templateName.trim()}
                  onClick={handleSaveTemplate}
                  leftIcon={<Save className="w-4 h-4 text-white" />}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-10 px-4 rounded-xl cursor-pointer shadow-xs inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isSaving
                    ? templateId
                      ? 'Updating...'
                      : 'Saving...'
                    : templateId
                    ? 'Update Certificate'
                    : 'Save Certificate'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* STEP 1: COURSE & FIELDS SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-5 rounded-[16px] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2563EB]" />
                <span>Step 1: Select Target Course *</span>
              </h3>
            </div>

            {isLoadingCoursesQuery ? (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-8">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading available courses...</span>
              </div>
            ) : isCoursesError ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {coursesError instanceof Error ? coursesError.message : 'Unable to load available courses.'}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refetchCourses()}
                  className="text-xs font-semibold h-8 shrink-0"
                >
                  Retry
                </Button>
              </div>
            ) : courses.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-3">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  No courses are available yet. Create a course first before building a certificate template.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/courses/create')}
                  className="text-xs font-semibold"
                >
                  Create Course
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                      Course Context
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      {courses.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Selecting a course evaluates its specific lesson structure. If a course lacks Quizzes or Assignments, those specific score fields will be automatically excluded.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                      Page Size
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as any)}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="A4">A4 (Standard 210 Ã— 297 mm)</option>
                      <option value="LETTER">US Letter (8.5 Ã— 11 in)</option>
                      <option value="CUSTOM">Custom Dimensions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                      Orientation
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as any)}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="LANDSCAPE">Landscape (Horizontal)</option>
                      <option value="PORTRAIT">Portrait (Vertical)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-5 rounded-[16px] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#263244] pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  <span>Step 2: Choose Certificate Dynamic Fields</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    placeholder="Search fields..."
                    className="h-8 pl-8 pr-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsPersonalModalOpen(true)}
                  className="h-8 px-3 bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] dark:text-blue-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Personal Detail</span>
                </button>
              </div>
            </div>

            {isLoadingFields ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-8 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                <span>Discovering available course fields...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  {systemGroups.map((groupName) => {
                    const groupFields = nonPersonalBindings.filter((b) => b.group === groupName);
                    if (groupFields.length === 0) return null;

                    return (
                      <div key={groupName} className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {groupName}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {groupFields.map((field) => {
                            const isChecked = selectedFieldKeys.includes(field.key);
                            return (
                              <div
                                key={field.key}
                                onClick={() => toggleFieldSelection(field.key)}
                                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#2563EB] text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs'
                                    : 'bg-[#F8FAFC] dark:bg-[#172033] border-[#E2E8F0] dark:border-[#263244] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <div
                                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                      isChecked
                                        ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0F172A]'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="truncate">{field.label}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-[#0F172A] rounded shrink-0">
                                  {field.type}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#263244]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Personal Details (Custom Student Fields)</span>
                    </h4>
                  </div>

                  {personalBindings.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-[#172033] rounded-xl border border-dashed border-slate-200 dark:border-[#263244] text-center text-xs text-slate-500">
                      No custom personal detail fields created yet. Click "+ Add Personal Detail" above to define one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {personalBindings.map((field) => {
                        const isChecked = selectedFieldKeys.includes(field.key);
                        return (
                          <div
                            key={field.key}
                            onClick={() => toggleFieldSelection(field.key)}
                            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs'
                                : 'bg-[#F8FAFC] dark:bg-[#172033] border-[#E2E8F0] dark:border-[#263244] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                  isChecked
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0F172A]'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="truncate">{field.label}</span>
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono px-1.5 py-0.5 bg-emerald-100/50 dark:bg-emerald-950/60 rounded shrink-0">
                              Personal
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* STEP 2: VISUAL DESIGNER */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] gap-5 lg:gap-6 items-start">
          {/* LEFT COLUMN â€” TOOLBAR, FIELD LIBRARY & PROPERTIES */}
          <div className="space-y-4 w-full">
            <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Add Elements</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={addStaticTextElement}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Type className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate"> Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate"> Image</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  className="w-full p-2.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Set Background Image</span>
                </button>
              </div>
            </Card>

            <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Selected Fields</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-900/40">
                  {designerSelectedBindings.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {designerSelectedBindings.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => addElement(b)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-left flex items-center justify-between text-xs font-medium text-slate-900 dark:text-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {b.type === 'text' && <Type className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                      {b.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      {b.type === 'qr' && <QrCode className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                      <span className="truncate">{b.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-800 rounded shrink-0">
                      {b.group}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* PROPERTIES PANEL */}
            <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Properties</span>
                </span>
                {selectedElement && (
                  <button
                    type="button"
                    onClick={deleteSelectedElement}
                    title="Delete Element"
                    className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </h3>

              {selectedElement ? (
                <div className="space-y-3.5 text-xs">
                  <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl flex items-center justify-between">
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
                        {selectedElement.type === 'static_text'
                          ? 'Static Text'
                          : selectedElement.type === 'image'
                          ? 'Image Element'
                          : selectedElement.binding.startsWith('student.custom.')
                          ? 'Personal Detail'
                          : 'Dynamic Field'}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                        {selectedElement.label}
                      </span>
                    </div>
                  </div>

                  {selectedElement.type === 'static_text' ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Static Text Content
                      </label>
                      <input
                        type="text"
                        value={selectedElement.static_text || ''}
                        onChange={(e) => handleTextContentChange(e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ) : selectedElement.type !== 'image' ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Field Resolver Key
                      </label>
                      <input
                        type="text"
                        value={selectedElement.binding}
                        disabled
                        className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-500 dark:text-slate-400"
                      />
                    </div>
                  ) : null}

                  {selectedElement.type === 'image' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Image Source
                      </label>
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className="w-full h-10 px-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Replace Image</span>
                      </button>
                    </div>
                  )}

                  {/* DIMENSIONS & FONT SIZE CONTROLS */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Width
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={20}
                          max={1600}
                          value={widthInput}
                          onChange={(e) => {
                            const valStr = e.target.value;
                            setWidthInput(valStr);
                            if (valStr !== '' && selectedElement) {
                              const num = parseInt(valStr, 10);
                              if (!isNaN(num)) {
                                const clampedWidth = Math.min(1600, Math.max(20, num));
                                const widthRatio = parseFloat((clampedWidth / 1600).toFixed(4));
                                const heightPx = (selectedElement.height || 0.05) * 1131;

                                if (selectedElement.type !== 'image') {
                                  if (!selectedElement.multiline) {
                                    const fontRes = calculateFontSizeForWidth({
                                      text: resolveSampleValue(selectedElement),
                                      targetWidthPx: clampedWidth,
                                      padding: selectedElement.padding || DEFAULT_TEXT_PADDING,
                                      fontFamily: selectedElement.font_family || selectedElement.fontFamily || availableFonts[0]?.family || 'Inter',
                                      fontWeight: selectedElement.font_weight || selectedElement.fontWeight || '600',
                                      fontStyle: selectedElement.font_style || selectedElement.fontStyle || 'normal',
                                      lineHeight: selectedElement.line_height || 1.0,
                                      letterSpacing: selectedElement.letter_spacing || 0,
                                      maxFontSize: 150,
                                      minFontSize: 1,
                                    });

                                    const fittedFont = Math.round(Math.min(150, Math.max(1, fontRes.fontSize)));
                                    const naturalHeightRatio = parseFloat((fontRes.measuredHeightPx / 1131).toFixed(4));

                                    updateSelectedElement({
                                      width: widthRatio,
                                      height: naturalHeightRatio,
                                      fontSize: fittedFont,
                                      font_size: fittedFont,
                                      maxFontSize: fittedFont,
                                      max_font_size: fittedFont,
                                    });
                                    setFontSizeInput(String(fittedFont));
                                    setHeightInput(String(Math.round(fontRes.measuredHeightPx)));
                                  } else {
                                    const fitRes = calculateAutoFontSize({
                                      text: resolveSampleValue(selectedElement),
                                      width: clampedWidth,
                                      height: heightPx,
                                      padding: selectedElement.padding || DEFAULT_TEXT_PADDING,
                                      fontFamily: selectedElement.font_family || selectedElement.fontFamily || availableFonts[0]?.family || 'Inter',
                                      fontWeight: selectedElement.font_weight || selectedElement.fontWeight || '600',
                                      fontStyle: selectedElement.font_style || selectedElement.fontStyle || 'normal',
                                      maxFontSize: 150,
                                      minFontSize: 1,
                                      lineHeight: selectedElement.line_height || 1.0,
                                      letterSpacing: selectedElement.letter_spacing || 0,
                                      multiline: true,
                                    });

                                    const fittedFont = Math.round(Math.min(150, Math.max(1, fitRes.renderedFontSize)));

                                    updateSelectedElement({
                                      width: widthRatio,
                                      fontSize: fittedFont,
                                      font_size: fittedFont,
                                      maxFontSize: fittedFont,
                                      max_font_size: fittedFont,
                                    });
                                    setFontSizeInput(String(fittedFont));
                                  }
                                } else {
                                  updateSelectedElement({ width: widthRatio });
                                }
                              }
                            }
                          }}
                          onBlur={() => {
                            const num = parseInt(widthInput, 10);
                            const clamped = isNaN(num) ? 320 : Math.min(1600, Math.max(20, num));
                            setWidthInput(String(clamped));
                            if (selectedElement) {
                              const widthRatio = parseFloat((clamped / 1600).toFixed(4));
                              updateSelectedElement({ width: widthRatio });
                            }
                          }}
                          className="w-full h-9 pl-2.5 pr-7 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                        <span className="absolute right-2.5 text-[10px] font-mono text-slate-400 pointer-events-none">
                          px
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Height
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={10}
                          max={1131}
                          value={heightInput}
                          onChange={(e) => {
                            const valStr = e.target.value;
                            setHeightInput(valStr);
                            if (valStr !== '' && selectedElement) {
                              const num = parseInt(valStr, 10);
                              if (!isNaN(num)) {
                                const clampedHeight = Math.min(1131, Math.max(10, num));
                                const heightRatio = parseFloat((clampedHeight / 1131).toFixed(4));
                                const widthPx = (selectedElement.width || 0.2) * 1600;

                                if (selectedElement.type !== 'image') {
                                  const fitRes = calculateAutoFontSize({
                                    text: resolveSampleValue(selectedElement),
                                    width: widthPx,
                                    height: clampedHeight,
                                    padding: selectedElement.padding || DEFAULT_TEXT_PADDING,
                                    fontFamily: selectedElement.font_family || selectedElement.fontFamily || availableFonts[0]?.family || 'Inter',
                                    fontWeight: selectedElement.font_weight || selectedElement.fontWeight || '600',
                                    fontStyle: selectedElement.font_style || selectedElement.fontStyle || 'normal',
                                    maxFontSize: 150,
                                    minFontSize: 1,
                                    lineHeight: selectedElement.line_height || 1.0,
                                    letterSpacing: selectedElement.letter_spacing || 0,
                                    multiline: selectedElement.multiline || false,
                                  });

                                  const fittedFont = Math.round(Math.min(150, Math.max(1, fitRes.renderedFontSize)));

                                  updateSelectedElement({
                                    height: heightRatio,
                                    fontSize: fittedFont,
                                    font_size: fittedFont,
                                    maxFontSize: fittedFont,
                                    max_font_size: fittedFont,
                                  });
                                  setFontSizeInput(String(fittedFont));
                                } else {
                                  updateSelectedElement({ height: heightRatio });
                                }
                              }
                            }
                          }}
                          onBlur={() => {
                            const num = parseInt(heightInput, 10);
                            const clamped = isNaN(num) ? 60 : Math.min(1131, Math.max(10, num));
                            setHeightInput(String(clamped));
                            if (selectedElement) {
                              const heightRatio = parseFloat((clamped / 1131).toFixed(4));
                              updateSelectedElement({ height: heightRatio });
                            }
                          }}
                          className="w-full h-9 pl-2.5 pr-7 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                        <span className="absolute right-2.5 text-[10px] font-mono text-slate-400 pointer-events-none">
                          px
                        </span>
                      </div>
                    </div>

                    {selectedElement.type !== 'image' && (
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Font Size
                        </label>
                        <div className="relative flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              const configured = selectedElement.fontSize ?? selectedElement.font_size ?? selectedElement.maxFontSize ?? selectedElement.max_font_size ?? 56;
                              const parsed = parseInt(fontSizeInput, 10);
                              const current = isNaN(parsed) ? configured : parsed;
                              const next = Math.max(1, current - 1);
                              handleFontSizeChange(next);
                            }}
                            className="w-8 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-xl text-xs transition-colors cursor-pointer select-none"
                            title="Decrease font size"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={150}
                            step={1}
                            value={fontSizeInput}
                            onChange={(e) => {
                              const valStr = e.target.value;
                              setFontSizeInput(valStr);
                              if (valStr !== '') {
                                const num = parseInt(valStr, 10);
                                if (!isNaN(num)) {
                                  handleFontSizeChange(num);
                                }
                              }
                            }}
                            onBlur={() => {
                              const num = parseInt(fontSizeInput, 10);
                              const configured = selectedElement.fontSize ?? selectedElement.font_size ?? selectedElement.maxFontSize ?? selectedElement.max_font_size ?? 56;
                              const clamped = isNaN(num) ? configured : Math.min(150, Math.max(1, num));
                              handleFontSizeChange(clamped);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const num = parseInt(fontSizeInput, 10);
                                const configured = selectedElement.fontSize ?? selectedElement.font_size ?? selectedElement.maxFontSize ?? selectedElement.max_font_size ?? 56;
                                const clamped = isNaN(num) ? configured : Math.min(150, Math.max(1, num));
                                handleFontSizeChange(clamped);
                              }
                            }}
                            className="w-full h-9 text-center bg-slate-50 dark:bg-slate-900 border-y border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const configured = selectedElement.fontSize ?? selectedElement.font_size ?? selectedElement.maxFontSize ?? selectedElement.max_font_size ?? 56;
                              const parsed = parseInt(fontSizeInput, 10);
                              const current = isNaN(parsed) ? configured : parsed;
                              const next = Math.min(150, current + 1);
                              handleFontSizeChange(next);
                            }}
                            className="w-8 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-l-0 border-slate-300 dark:border-slate-700 rounded-r-xl text-xs transition-colors cursor-pointer select-none"
                            title="Increase font size"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                    {/* FONT SELECT & TYPOGRAPHY */}
                    {selectedElement.type !== 'image' && (
                      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            Font
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              value={
                                selectedElement.fontKey ||
                                availableFonts.find(
                                  (f) => f.family === selectedElement.font_family || f.id === selectedElement.fontId || f.id === selectedElement.font_id
                                )?.key ||
                                availableFonts[0]?.key ||
                                'inter'
                              }
                              style={{
                                fontFamily: `"${selectedElement.font_family || selectedElement.fontFamily || availableFonts.find(f => f.key === selectedElement.fontKey)?.family || 'Inter'}", sans-serif`,
                              }}
                              onChange={async (e) => {
                                const val = e.target.value;
                                if (val === '__upload_new__') {
                                  setIsUploadFontModalOpen(true);
                                  return;
                                }
                                const fontObj = availableFonts.find((f) => f.key === val);
                                if (fontObj && selectedElement) {
                                  try {
                                    const currentFontSize = selectedElement.fontSize ?? selectedElement.font_size ?? 16;
                                    const result = await resizeTextElementToContent(selectedElement, {
                                      fontSize: currentFontSize,
                                      fontObj,
                                    });

                                    if (!result) return;

                                    updateSelectedElement({
                                      fontKey: fontObj.key,
                                      fontId: fontObj.id,
                                      font_id: fontObj.id,

                                      fontFamily: result.runtimeFamily,
                                      font_family: result.runtimeFamily,

                                      fontSize: currentFontSize,
                                      font_size: currentFontSize,

                                      width: result.width,
                                      height: result.height,
                                    });

                                    setFontSizeInput(String(currentFontSize));
                                    setWidthInput(String(Math.round(result.width * 1600)));
                                    setHeightInput(String(Math.round(result.height * 1131)));
                                  } catch (error: any) {
                                    showToast(error?.message || 'Unable to load selected font.', 'error');
                                  }
                                }
                              }}
                              className="flex-1 h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <optgroup label="System / built-in fonts">
                                {availableFonts
                                  .filter((f) => f.source === 'SYSTEM')
                                  .map((f) => (
                                    <option key={f.id} value={f.key} style={{ fontFamily: `"${f.family}", sans-serif` }}>
                                      {f.name}
                                    </option>
                                  ))}
                              </optgroup>
                              {availableFonts.some((f) => f.source === 'ACADEMY') && (
                                <optgroup label="Custom Fonts">
                                  {availableFonts
                                    .filter((f) => f.source === 'ACADEMY')
                                    .map((f) => (
                                      <option key={f.id} value={f.key} style={{ fontFamily: `"${f.family}", sans-serif` }}>
                                        {f.name}
                                      </option>
                                    ))}
                                </optgroup>
                              )}
                              <optgroup label="Actions">
                                <option value="__upload_new__">+ Upload New Font...</option>
                              </optgroup>
                            </select>
                            <button
                              type="button"
                              onClick={() => fontFileInputRef.current?.click()}
                              className="h-10 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              Upload Font
                            </button>
                            <input
                              ref={fontFileInputRef}
                              type="file"
                              accept=".ttf,.otf,.woff,.woff2"
                              onChange={handleDirectFontFileUpload}
                              className="hidden"
                            />
                          </div>
                        </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            Font Weight
                          </label>
                          <select
                            value={selectedElement.font_weight || '600'}
                            onChange={async (e) => {
                              const newWeight = e.target.value;
                              if (!selectedElement) return;
                              const updatedElement = {
                                ...selectedElement,
                                font_weight: newWeight,
                                fontWeight: newWeight,
                              };
                              const result = await resizeTextElementToContent(updatedElement);
                              if (!result) return;

                              updateSelectedElement({
                                font_weight: newWeight,
                                fontWeight: newWeight,
                                width: result.width,
                                height: result.height,
                              });
                              setWidthInput(String(Math.round(result.width * 1600)));
                              setHeightInput(String(Math.round(result.height * 1131)));
                            }}
                            className="w-full h-10 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {(() => {
                              const curFont = availableFonts.find(f => f.key === selectedElement.fontKey || f.family === selectedElement.font_family);
                              const variants = curFont?.font_weight_variants || ['400', '500', '600', '700'];
                              return variants.map(v => (
                                <option key={v} value={v}>
                                  {v === '400' ? '400 (Regular)' : v === '500' ? '500 (Medium)' : v === '600' ? '600 (SemiBold)' : v === '700' ? '700 (Bold)' : v === '800' ? '800 (ExtraBold)' : v}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            Alignment
                          </label>
                          <select
                            value={selectedElement.text_align || 'center'}
                            onChange={(e) => updateSelectedElement({ text_align: e.target.value as any })}
                            className="w-full h-10 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={selectedElement.color || '#0F172A'}
                          onChange={(e) => updateSelectedElement({ color: e.target.value })}
                          className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* LAYER ORDERING */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Layer Order ({selectedElement.z_index || 1})
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveLayer('up')}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                        title="Bring Forward"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLayer('down')}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                        title="Send Backward"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Sliders className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    No element selected
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px] mx-auto">
                    Click an element on the canvas to edit properties.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN â€” CANVAS PREVIEW */}
          <div className="w-full flex items-start justify-center">
            <div className="w-full max-w-[900px]">
              <Card className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 rounded-2xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {isPreview ? 'Live Sample Preview' : 'Interactive Canvas'}
                  </span>
                  <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-medium rounded-md border border-slate-200 dark:border-slate-700">
                    1600 Ã— 1131 px
                  </span>
                </div>

                <div
                  ref={canvasRef}
                  onClick={(e) => {
                    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-backdrop')) {
                      setSelectedElementId(null);
                    }
                  }}
                  style={{
                    backgroundImage: backgroundImageUrl
                      ? `url(${backgroundImageUrl})`
                      : `radial-gradient(#CBD5E1 1px, transparent 1px), radial-gradient(#CBD5E1 1px, #FFFFFF 1px)`,
                    backgroundSize: backgroundImageUrl ? 'cover' : '20px 20px',
                    backgroundPosition: backgroundImageUrl ? 'center' : '0 0, 10px 10px',
                  }}
                  className="w-full aspect-[1.414/1] bg-white text-slate-900 border-4 sm:border-8 border-slate-800 shadow-xl rounded-xl relative overflow-hidden font-sans select-none"
                >
                  <div className="absolute inset-2 border-2 border-amber-500/40 pointer-events-none" />

                  {elements.map((el) => {
                    const isSelected = selectedElementId === el.id;
                    const safeWidth =
                      el.type === 'image'
                        ? Math.max(20 / 1600, el.width || 0.15)
                        : Math.max(1 / 1600, el.width || 1 / 1600);
                    const safeHeight =
                      el.type === 'image'
                        ? Math.max(20 / 1131, el.height || 0.15)
                        : Math.max(1 / 1131, el.height || 1 / 1131);

                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => !isPreview && handleMouseDownOnElement(e, el)}
                        onTouchStart={(e) => !isPreview && handleMouseDownOnElement(e, el)}
                        style={{
                          position: 'absolute',
                          left: `${el.x * 100}%`,
                          top: `${el.y * 100}%`,
                          width: `${safeWidth * 100}%`,
                          height: `${safeHeight * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          fontWeight: el.font_weight || el.fontWeight || 'normal',
                          textAlign: el.text_align || el.textAlign || 'center',
                          color: el.color || '#0F172A',
                          fontFamily: el.font_family || el.fontFamily || availableFonts[0]?.family || 'Inter',
                          zIndex: el.z_index || 1,
                        }}
                        className={`rounded cursor-move transition-all flex items-center justify-center relative overflow-visible box-border ${
                          isSelected && !isPreview
                            ? 'ring-2 ring-blue-600 bg-blue-50/70 dark:bg-blue-900/30 shadow-md'
                            : 'hover:ring-1 hover:ring-blue-300 hover:bg-slate-100/40'
                        }`}
                      >
                        {el.type === 'image' ? (
                          <img
                            src={el.image_url || 'https://via.placeholder.com/150'}
                            alt={el.label}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full overflow-hidden pointer-events-none">
                            <AutoFitTextContainer
                              text={resolveSampleValue(el)}
                              maxFontSize={el.fontSize ?? el.font_size ?? el.maxFontSize ?? el.max_font_size ?? 16}
                              minFontSize={Math.max(1, el.min_font_size ?? el.minFontSize ?? 1)}
                              fontFamily={el.font_family || el.fontFamily || availableFonts[0]?.family || 'Inter'}
                              fontWeight={el.font_weight || el.fontWeight || 'normal'}
                              fontColor={el.color || '#0F172A'}
                              textAlign={el.text_align || el.textAlign || 'center'}
                              padding={el.padding || { top: 1, right: 2, bottom: 1, left: 2 }}
                              isEditorMode={!isPreview}
                              className="w-full h-full pointer-events-none"
                            />
                          </div>
                        )}

                        {/* RESIZE HANDLES (OUTSIDE TEXT BOX) */}
                        {isSelected && !isPreview && (
                          <>
                            <div
                              onMouseDown={(e) => handleMouseDownOnElement(e, el, 'lt')}
                              onTouchStart={(e) => handleMouseDownOnElement(e, el, 'lt')}
                              className="w-2 h-2 bg-white border-2 border-blue-600 rounded-full absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize shadow-xs z-50 hover:scale-125 transition-transform pointer-events-auto"
                            />
                            <div
                              onMouseDown={(e) => handleMouseDownOnElement(e, el, 'rt')}
                              onTouchStart={(e) => handleMouseDownOnElement(e, el, 'rt')}
                              className="w-2 h-2 bg-white border-2 border-blue-600 rounded-full absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize shadow-xs z-50 hover:scale-125 transition-transform pointer-events-auto"
                            />
                            <div
                              onMouseDown={(e) => handleMouseDownOnElement(e, el, 'lb')}
                              onTouchStart={(e) => handleMouseDownOnElement(e, el, 'lb')}
                              className="w-2 h-2 bg-white border-2 border-blue-600 rounded-full absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize shadow-xs z-50 hover:scale-125 transition-transform pointer-events-auto"
                            />
                            <div
                              onMouseDown={(e) => handleMouseDownOnElement(e, el, 'rb')}
                              onTouchStart={(e) => handleMouseDownOnElement(e, el, 'rb')}
                              className="w-2 h-2 bg-blue-600 border-2 border-white rounded-full absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize shadow-md z-50 hover:scale-125 transition-transform pointer-events-auto flex items-center justify-center"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* PERSONAL FIELDS MODAL */}
      <PersonalFieldsModal
        isOpen={isPersonalModalOpen}
        onClose={() => setIsPersonalModalOpen(false)}
        onFieldCreated={handlePersonalFieldCreated}
      />

      {/* HIDDEN FILE INPUTS */}
      <input
        ref={bgFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* UPLOAD CUSTOM FONT MODAL */}
      <UploadFontModal
        isOpen={isUploadFontModalOpen}
        onClose={() => setIsUploadFontModalOpen(false)}
        onFontUploaded={(font) => {
          handleFontUploaded(font);
        }}
      />
    </div>
  );
};

