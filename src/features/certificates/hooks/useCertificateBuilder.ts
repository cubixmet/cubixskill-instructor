import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { CanvasElement } from '../../../types/certificate.types';
import {
  certificatesService,
  type CertificateBinding,
  type CertificateTemplateData,
} from '../../../services/certificates.service';
import { coursesService } from '../../../services/courses.service';
import { useAuthStore } from '../../../store/auth.store';
import { measureTextAsync, getSampleTextForField } from '../utils/textMeasurement';
import { calculateAutoFontSize, calculateFontSizeForWidth, DEFAULT_TEXT_PADDING } from '../utils/textFit';
import {
  fetchCertificateFonts,
  loadFontFaceIntoDOM,
  getRuntimeFontFamily,
  FALLBACK_SYSTEM_FONTS,
  type CertificateFontItem,
} from '../utils/fontRegistry';
import {
  useCertificateCourses,
  useCertificateTemplates,
  useCertificateFonts,
  useCertificateTemplateDetail,
  certificateKeys,
} from './useCertificateQueries';
import {
  serializeCertificateTemplate,
  deserializeCertificateTemplate,
} from '../utils/certificateSerialization';

export const resolveSampleValue = (el: CanvasElement): string => {
  if (el.type === 'static_text') {
    return el.static_text || el.label || 'Sample Text';
  }
  if (el.binding) {
    return getSampleTextForField(el.binding);
  }
  return el.label || 'Sample Field';
};

export function useCertificateBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { templateId, courseId: routeCourseId } = useParams<{ templateId?: string; courseId?: string }>();
  const isEditMode = Boolean(templateId);

  const auth = useAuthStore();
  const academyName = auth.academy?.name || (auth.user as any)?.academy_name || 'CubixSkill Academy';

  // Load queries
  const {
    data: queriedCourses = [],
    isLoading: isLoadingCoursesQuery,
    refetch: refetchCourses,
  } = useCertificateCourses();

  const {
    data: existingTemplates = [],
    isLoading: isLoadingTemplatesQuery,
    refetch: refetchTemplates,
  } = useCertificateTemplates();

  const { data: queriedFonts = FALLBACK_SYSTEM_FONTS } = useCertificateFonts();

  const {
    data: templateDetail,
    isLoading: isLoadingTemplate,
  } = useCertificateTemplateDetail(templateId);

  const hydratedTemplateRef = useRef<string | null>(null);

  // Step Control
  const [step, setStep] = useState<1 | 2>(templateId ? 2 : 1);

  // Course Selection State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(routeCourseId || '');

  // Compute configured course IDs (excluding currently edited template's course if in edit mode)
  const configuredCourseIds = useMemo(() => {
    const set = new Set<string>();
    for (const t of existingTemplates) {
      if (isEditMode && t.id === templateId) continue;
      const cId = t.course_id || t.template_data?.selected_course_id;
      if (cId) set.add(String(cId));
    }
    return set;
  }, [existingTemplates, isEditMode, templateId]);

  const eligibleCourses = useMemo(() => {
    return queriedCourses.filter((c: any) => !configuredCourseIds.has(String(c.id)));
  }, [queriedCourses, configuredCourseIds]);

  const refreshCourseEligibility = async () => {
    await Promise.all([refetchCourses(), refetchTemplates()]);
  };

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
  const [pageSize, setPageSize] = useState<string>('CERTIFICATE_LANDSCAPE');
  const [orientation, setOrientation] = useState<'LANDSCAPE' | 'PORTRAIT'>('LANDSCAPE');
  const [customWidth, setCustomWidth] = useState<number | undefined>(210);
  const [customHeight, setCustomHeight] = useState<number | undefined>(297);
  const [customUnit, setCustomUnit] = useState<'MM' | 'CM' | 'INCH'>('MM');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');
  const [backgroundAssetId, setBackgroundAssetId] = useState<string | null>(null);
  const [bgFit, setBgFit] = useState<BackgroundFit>('cover');
  const [bgPosition, setBgPosition] = useState<BackgroundPosition>('center');
  const [bgOpacity, setBgOpacity] = useState<number>(100);
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // Canvas Elements
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const selectedElement = useMemo(() => elements.find((e) => e.id === selectedElementId), [elements, selectedElementId]);

  // Inputs
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

  // Fonts & Modals
  const [availableFonts, setAvailableFonts] = useState<CertificateFontItem[]>(FALLBACK_SYSTEM_FONTS);
  const [isUploadFontModalOpen, setIsUploadFontModalOpen] = useState(false);

  // Zoom & Dragging
  const [zoomScale, setZoomScale] = useState<number>(0.65);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elementX: number; elementY: number; elementW: number; elementH: number }>({
    mouseX: 0,
    mouseY: 0,
    elementX: 0,
    elementY: 0,
    elementW: 0,
    elementH: 0,
  });

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'error') => {
    setToastState({ message: msg, type });
    setTimeout(() => setToastState(null), 3500);
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

  const resizeTextElementToContent = async (
    el: CanvasElement,
    options?: {
      fontSize?: number;
      fontObj?: CertificateFontItem;
      text?: string;
    }
  ) => {
    if (el.type === 'image') return;
    const fontSize = Math.min(150, Math.max(1, options?.fontSize ?? el.fontSize ?? el.font_size ?? 16));
    const fontObj = options?.fontObj ?? availableFonts.find((f) => f.id === el.fontId || f.id === el.font_id || f.key === el.fontKey || f.family === el.font_family);

    if (fontObj) {
      const loaded = await loadFontFaceIntoDOM(fontObj);
      if (!loaded) throw new Error('Unable to load selected font.');
    }

    const runtimeFamily = fontObj ? getRuntimeFontFamily(fontObj) : (el.fontId || el.font_id ? getRuntimeFontFamily(el.fontId || el.font_id!) : el.font_family || el.fontFamily || 'Inter');
    const renderedText = options?.text ?? resolveSampleValue(el);

    if (document.fonts) {
      try {
        await document.fonts.load(
          `${el.font_style || el.fontStyle || 'normal'} ${el.font_weight || el.fontWeight || '400'} ${fontSize}px "${runtimeFamily}"`,
          renderedText
        );
        await document.fonts.ready;
      } catch {}
    }

    const measured = await measureTextAsync({
      text: renderedText,
      fontSize,
      fontFamily: runtimeFamily,
      fontWeight: el.font_weight || el.fontWeight || '400',
      fontStyle: el.font_style || el.fontStyle || 'normal',
      letterSpacing: el.letter_spacing || 0,
      lineHeight: el.line_height || 1,
      padding: el.padding || DEFAULT_TEXT_PADDING,
      canvasWidth: 1600,
      canvasHeight: 1131,
    });

    const width = Math.max(1 / 1600, measured.widthPx / 1600);
    const height = Math.max(1 / 1131, measured.heightPx / 1131);

    return { width, height, fontSize, runtimeFamily, fontObj };
  };

  const handleFontUploaded = async (fontObj: CertificateFontItem) => {
    showToast('Loading uploaded font...', 'info');
    try {
      const loaded = await loadFontFaceIntoDOM(fontObj);
      const runtimeFamily = fontObj.source === 'ACADEMY' ? `cubix-font-${fontObj.id}` : fontObj.family;
      if (loaded && typeof document !== 'undefined' && document.fonts) {
        try {
          await document.fonts.load(`16px "${runtimeFamily}"`);
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

      if (selectedElementId && selectedElement) {
        const widthPx = (selectedElement.width || 0.2) * 1600;
        const heightPx = (selectedElement.height || 0.05) * 1131;

        const fitRes = calculateAutoFontSize({
          text: resolveSampleValue(selectedElement),
          width: widthPx,
          height: heightPx,
          padding: selectedElement.padding || DEFAULT_TEXT_PADDING,
          fontFamily: runtimeFamily,
          fontWeight: selectedElement.font_weight || selectedElement.fontWeight || '400',
          fontStyle: selectedElement.font_style || selectedElement.fontStyle || 'normal',
          maxFontSize: 150,
          minFontSize: 1,
          lineHeight: selectedElement.line_height || 1.0,
          letterSpacing: selectedElement.letter_spacing || 0,
          multiline: selectedElement.multiline || false,
        });

        const fittedFont = Math.round(Math.min(150, Math.max(1, fitRes.renderedFontSize)));

        updateSelectedElement({
          fontKey: runtimeFamily,
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

  const handleFontSizeChange = async (targetFontSize: number, targetElement?: CanvasElement) => {
    const el = targetElement || selectedElement;
    if (!el || el.type === 'image') return;
    try {
      const result = await resizeTextElementToContent(el, { fontSize: targetFontSize });
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
    } catch (error: any) {
      showToast(error?.message || 'Unable to resize text element.', 'error');
    }
  };

  const handleTextContentChange = async (value: string) => {
    if (!selectedElement) return;
    const nextElement: CanvasElement = { ...selectedElement, static_text: value };
    const result = await resizeTextElementToContent(nextElement, { text: value });
    if (!result) return;
    updateSelectedElement({ static_text: value, width: result.width, height: result.height });
    setWidthInput(String(Math.round(result.width * 1600)));
    setHeightInput(String(Math.round(result.height * 1131)));
  };

  useEffect(() => {
    if (queriedFonts && queriedFonts.length > 0) setAvailableFonts(queriedFonts);
  }, [queriedFonts]);

  useEffect(() => {
    if (!selectedCourseId) return;
    setIsLoadingFields(true);
    certificatesService
      .getTemplateBindings(selectedCourseId)
      .then((res) => {
        const uniqueBindings = (res || []).filter((b: CertificateBinding, index: number, self: CertificateBinding[]) => index === self.findIndex((t) => t.key === b.key));
        setAvailableBindings(uniqueBindings);
        const validKeys = uniqueBindings.map((b) => b.key);
        setSelectedFieldKeys((prev) => prev.filter((k) => validKeys.includes(k)));
      })
      .catch(() => showToast("Couldn't load available fields for this course."))
      .finally(() => setIsLoadingFields(false));
  }, [selectedCourseId]);

  useEffect(() => {
    if (!templateId) {
      hydratedTemplateRef.current = null;
      setTemplateName('Custom Course Completion Certificate');
      setDescription('');
      setPageSize('CERTIFICATE_LANDSCAPE');
      setOrientation('LANDSCAPE');
      setCustomWidth(undefined);
      setCustomHeight(undefined);
      setCustomUnit('MM');
      setBackgroundImageUrl('');
      setBackgroundAssetId(null);
      setBgFit('cover');
      setBgPosition('center');
      setBgOpacity(100);
      setBgColor('#ffffff');
      setElements([{
        id: 'system-verification-qr',
        type: 'qr',
        binding: 'certificate.verification_url',
        label: 'Verification QR Code',
        x: 0.85,
        y: 0.78,
        width: 0.1,
        height: 0.141,
        z_index: 999,
        is_locked: false,
        is_visible: true,
      }]);
      setSelectedElementId(null);
      setSelectedFieldKeys(['student.full_name', 'course.title', 'certificate.number', 'certificate.issue_date']);
      setStep(1);
    }
  }, [templateId]);

  useEffect(() => {
    if (templateDetail && templateId) {
      const templateIdentity = templateDetail.id || templateId;
      if (hydratedTemplateRef.current === templateIdentity) return;
      hydratedTemplateRef.current = templateIdentity;
      const deserialized = deserializeCertificateTemplate(templateDetail);
      setTemplateName(deserialized.templateName);
      setDescription(deserialized.description);
      setPageSize(deserialized.pageSize);
      setOrientation(deserialized.orientation);
      setCustomWidth(deserialized.customWidth);
      setCustomHeight(deserialized.customHeight);
      if (deserialized.customUnit) setCustomUnit(deserialized.customUnit);
      setBackgroundImageUrl(deserialized.backgroundImageUrl);
      setBackgroundAssetId(deserialized.backgroundAssetId ?? null);
      if (deserialized.bgFit) setBgFit(deserialized.bgFit);
      if (deserialized.bgPosition) setBgPosition(deserialized.bgPosition);
      if (typeof deserialized.bgOpacity === 'number') setBgOpacity(deserialized.bgOpacity);
      if (deserialized.bgColor) setBgColor(deserialized.bgColor);
      if (deserialized.selectedCourseId) setSelectedCourseId(deserialized.selectedCourseId);
      setStep(2);
      (async () => {
        try {
          const fontsToSearch = queriedFonts && queriedFonts.length > 0 ? queriedFonts : await fetchCertificateFonts();
          for (const el of deserialized.elements) {
            const fontId = el.fontId ?? el.font_id;
            const fontKey = el.fontKey ?? el.font_key;
            if (fontId || fontKey) {
              const match = fontsToSearch.find((f) => String(f.id) === String(fontId) || f.key === fontKey);
              if (match) await loadFontFaceIntoDOM(match);
            }
          }
        } catch (_) {}
        setElements(deserialized.elements);
        const keys = deserialized.elements.map((el) => el.binding).filter(Boolean);
        if (keys.length > 0) setSelectedFieldKeys(Array.from(new Set(keys)));
      })();
    }
  }, [templateDetail, templateId, queriedFonts]);

  const addElement = async (binding: CertificateBinding) => {
    const sampleText = getSampleTextForField(binding.key, binding.label);
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
      padding: DEFAULT_TEXT_PADDING,
    };
    const result = await resizeTextElementToContent(draftEl, { fontSize: 16, fontObj: defaultFontObj, text: sampleText });
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
      padding: DEFAULT_TEXT_PADDING,
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
      padding: DEFAULT_TEXT_PADDING,
    };
    const result = await resizeTextElementToContent(draftEl, { fontSize: 16, fontObj: defaultFontObj, text: textLabel });
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
      const url = media.url || media.relative_path || media.file_url || (media.stored_filename ? `/media/${media.stored_filename}` : '');
      if (!media.id || !url) throw new Error('Upload completed but backend did not return a valid media id/url.');
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
      const url = media.url || media.relative_path || media.file_url || (media.stored_filename ? `/media/${media.stored_filename}` : '');
      if (!media.id || !url) throw new Error('Upload completed but backend did not return a valid media id/url.');
      setBackgroundImageUrl(url);
      setBackgroundAssetId(media.id);
      showToast('Certificate background image uploaded successfully.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload background image.', 'error');
    }
  };

  const handlePersonalFieldCreated = async (field: { key: string; label: string; field_type: string; }) => {
    const newKey = `student.custom.${field.key}`;
    const newBinding: CertificateBinding = {
      key: newKey,
      label: `Student ${field.label}`,
      group: 'Personal Details (Custom Student Fields)',
      type: 'text',
    };
    setAvailableBindings((prev) => {
      if (prev.some((item) => item.key === newKey)) return prev;
      return [...prev, newBinding];
    });
    setSelectedFieldKeys((prev) => {
      if (prev.includes(newKey)) return prev;
      return [...prev, newKey];
    });
    await queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    if (selectedCourseId) {
      try {
        const bindings = await certificatesService.getTemplateBindings(selectedCourseId);
        setAvailableBindings(bindings);
        if (bindings.some((item) => item.key === newKey)) {
          setSelectedFieldKeys((prev) => (prev.includes(newKey) ? prev : [...prev, newKey]));
        }
      } catch (err: any) {
        showToast(err?.response?.data?.message || err?.message || 'Personal field was created, but fields could not be refreshed.', 'error');
        return;
      }
    }
    showToast(`Personal field '${field.label}' created.`, 'success');
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    const target = elements.find((el) => el.id === selectedElementId);
    if (target && (target.binding === 'certificate.verification_url' || target.id === 'system-verification-qr' || target.type === 'qr')) {
      showToast('Verification QR Code is mandatory and cannot be deleted.', 'error');
      return;
    }
    setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
  };

  const moveLayer = (direction: 'up' | 'down') => {
    if (!selectedElement) return;
    const currentZ = selectedElement.z_index || 1;
    const newZ = direction === 'up' ? currentZ + 1 : Math.max(1, currentZ - 1);
    updateSelectedElement({ z_index: newZ });
  };

  const handlePointerDownOnElement = (e: React.PointerEvent, el: CanvasElement, resizeHandle?: string) => {
    e.stopPropagation();
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setSelectedElementId(el.id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elementX: el.x,
      elementY: el.y,
      elementW: el.width,
      elementH: el.height,
    };
    if (resizeHandle) setIsResizing(resizeHandle); else setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging && !isResizing) return;
    if (!selectedElement || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    const deltaX = (clientX - dragStartRef.current.mouseX) / rect.width;
    const deltaY = (clientY - dragStartRef.current.mouseY) / rect.height;
    if (isDragging) {
      const newX = Math.max(0, Math.min(1, dragStartRef.current.elementX + deltaX));
      const newY = Math.max(0, Math.min(1, dragStartRef.current.elementY + deltaY));
      updateSelectedElement({ x: parseFloat(newX.toFixed(4)), y: parseFloat(newY.toFixed(4)) });
    } else if (isResizing) {
      const canvasWidthPx = 1600;
      const canvasHeightPx = 1131;
      const MIN_TEXT_WIDTH_RATIO = 1 / canvasWidthPx;
      const MIN_TEXT_HEIGHT_RATIO = 1 / canvasHeightPx;
      let newW = dragStartRef.current.elementW;
      let newH = dragStartRef.current.elementH;
      if (isResizing.includes('r')) newW = Math.max(MIN_TEXT_WIDTH_RATIO, dragStartRef.current.elementW + deltaX);
      if (isResizing.includes('l')) newW = Math.max(MIN_TEXT_WIDTH_RATIO, dragStartRef.current.elementW - deltaX);
      if (isResizing.includes('b')) newH = Math.max(MIN_TEXT_HEIGHT_RATIO, dragStartRef.current.elementH + deltaY);
      if (isResizing.includes('t')) newH = Math.max(MIN_TEXT_HEIGHT_RATIO, dragStartRef.current.elementH - deltaY);
      if (selectedElement.type === 'qr' || selectedElement.binding === 'certificate.verification_url' || selectedElement.id === 'system-verification-qr') {
        const minW = Math.max(0.05, 40 / canvasWidthPx);
        newW = Math.max(minW, newW);
        const physicalPx = newW * canvasWidthPx;
        newH = physicalPx / canvasHeightPx;
        updateSelectedElement({ width: newW, height: newH });
        setWidthInput(String(Math.round(physicalPx)));
        setHeightInput(String(Math.round(physicalPx)));
        return;
      }
      const widthPx = newW * canvasWidthPx;
      const heightPx = newH * canvasHeightPx;
      if (selectedElement.type !== 'image') {
        const isSingleLine = !selectedElement.multiline;
        if (isSingleLine) {
          const fontObj = availableFonts.find((f) => f.key === selectedElement.fontKey || f.id === selectedElement.fontId || f.id === selectedElement.font_id);
          const runtimeFamily = fontObj?.source === 'ACADEMY' ? `cubix-font-${fontObj.id}` : fontObj?.family || selectedElement.font_family || selectedElement.fontFamily || 'Inter';
          const fontRes = calculateFontSizeForWidth({
            text: resolveSampleValue(selectedElement),
            targetWidthPx: widthPx,
            padding: selectedElement.padding || DEFAULT_TEXT_PADDING,
            fontFamily: runtimeFamily,
            fontWeight: selectedElement.font_weight || selectedElement.fontWeight || '600',
            fontStyle: selectedElement.font_style || selectedElement.fontStyle || 'normal',
            lineHeight: selectedElement.line_height || 1,
            letterSpacing: selectedElement.letter_spacing || 0,
            maxFontSize: 150,
            minFontSize: 1,
          });
          const nextFontSize = Math.round(Math.min(150, Math.max(1, fontRes.fontSize)));
          const finalWidthRatio = Math.max(1 / 1600, fontRes.measuredWidthPx / 1600);
          const finalHeightRatio = Math.max(1 / 1131, fontRes.measuredHeightPx / 1131);
          updateSelectedElement({
            fontSize: nextFontSize,
            font_size: nextFontSize,
            maxFontSize: nextFontSize,
            max_font_size: nextFontSize,
            width: finalWidthRatio,
            height: finalHeightRatio,
          });
          setFontSizeInput(String(nextFontSize));
          setWidthInput(String(Math.round(finalWidthRatio * 1600)));
          setHeightInput(String(Math.round(finalHeightRatio * 1131)));
        } else {
          updateSelectedElement({ width: newW, height: newH });
          setWidthInput(String(Math.round(widthPx)));
          setHeightInput(String(Math.round(heightPx)));
        }
      } else {
        updateSelectedElement({ width: newW, height: newH });
        setWidthInput(String(Math.round(widthPx)));
        setHeightInput(String(Math.round(heightPx)));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setIsResizing(null);
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (_) {}
  };

  const handleSaveTemplate = async () => {
    if (!selectedCourseId) {
      showToast('Please select a course for this certificate.');
      setStep(1);
      return;
    }
    if (!templateName.trim()) {
      showToast('Please provide a valid template name.');
      return;
    }
    if (pageSize === 'CUSTOM') {
      const w = Number(customWidth);
      const h = Number(customHeight);
      if (!customWidth || isNaN(w) || w <= 0) {
        showToast('Please provide a valid custom width greater than 0.');
        setStep(1);
        return;
      }
      if (!customHeight || isNaN(h) || h <= 0) {
        showToast('Please provide a valid custom height greater than 0.');
        setStep(1);
        return;
      }
    }
    setIsSaving(true);
    showToast('Saving certificate template...', 'info');
    try {
      const payload = serializeCertificateTemplate({
        templateName,
        description,
        selectedCourseId,
        pageSize,
        orientation,
        customWidth,
        customHeight,
        customUnit,
        backgroundImageUrl,
        backgroundAssetId,
        bgFit,
        bgPosition,
        bgOpacity,
        bgColor,
        elements,
        isEditMode,
        existingTemplateDetail: templateDetail,
      });
      let saved: CertificateTemplateData;
      if (isEditMode && templateId) {
        saved = await certificatesService.updateTemplate(templateId, payload);
      } else {
        saved = await certificatesService.createTemplate(payload);
      }
      await queryClient.invalidateQueries({ queryKey: certificateKeys.all });
      showToast('Certificate template saved successfully!', 'success');
      setTimeout(() => {
        navigate(routeCourseId ? `/courses/${routeCourseId}/certificates` : '/certificates');
      }, 800);
    } catch (err: any) {
      await refreshCourseEligibility();
      const data = err?.response?.data;
      let msg = 'Failed to save certificate template.';
      if (typeof data === 'string') {
        msg = data;
      } else if (data?.detail) {
        msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      } else if (data?.message) {
        msg = data.message;
      } else if (Array.isArray(data) && data.length > 0) {
        msg = data[0];
      } else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          msg = Array.isArray(val) ? val[0] : String(val);
        }
      } else if (err?.message) {
        msg = err.message;
      }
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const designerSelectedBindings = useMemo(() => {
    return availableBindings.filter((b) => selectedFieldKeys.includes(b.key));
  }, [availableBindings, selectedFieldKeys]);

  return {
    navigate,
    templateId,
    routeCourseId,
    isEditMode,
    academyName,
    templateDetail,
    isLoadingTemplate,
    step,
    setStep,
    queriedCourses,
    eligibleCourses,
    isLoadingCoursesQuery,
    isLoadingTemplatesQuery,
    refreshCourseEligibility,
    selectedCourseId,
    setSelectedCourseId,
    availableBindings,
    selectedFieldKeys,
    setSelectedFieldKeys,
    isLoadingFields,
    fieldSearch,
    setFieldSearch,
    templateName,
    setTemplateName,
    description,
    setDescription,
    pageSize,
    setPageSize,
    orientation,
    setOrientation,
    customWidth,
    setCustomWidth,
    customHeight,
    setCustomHeight,
    customUnit,
    setCustomUnit,
    backgroundImageUrl,
    setBackgroundImageUrl,
    backgroundAssetId,
    setBackgroundAssetId,
    bgFit,
    setBgFit,
    bgPosition,
    setBgPosition,
    bgOpacity,
    setBgOpacity,
    bgColor,
    setBgColor,
    elements,
    setElements,
    selectedElementId,
    setSelectedElementId,
    selectedElement,
    widthInput,
    setWidthInput,
    heightInput,
    setHeightInput,
    fontSizeInput,
    setFontSizeInput,
    isSaving,
    isPreview,
    setIsPreview,
    toastState,
    isPersonalModalOpen,
    setIsPersonalModalOpen,
    availableFonts,
    isUploadFontModalOpen,
    setIsUploadFontModalOpen,
    zoomScale,
    setZoomScale,
    isDragging,
    isResizing,
    workspaceRef,
    canvasRef,
    imageFileInputRef,
    bgFileInputRef,
    showToast,
    updateSelectedElement,
    deleteSelectedElement,
    moveLayer,
    handleFontSizeChange,
    handleTextContentChange,
    handleFontUploaded,
    handleImageUpload,
    handleBackgroundUpload,
    handlePersonalFieldCreated,
    handlePointerDownOnElement,
    handlePointerMove,
    handlePointerUp,
    handleSaveTemplate,
    addElement,
    addStaticTextElement,
    designerSelectedBindings,
  };
}
