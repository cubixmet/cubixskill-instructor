import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Award,
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
  Maximize2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  certificatesService,
  type CertificateTemplateData,
  type CertificateBinding,
} from '../../../services/certificates.service';
import { coursesService } from '../../../services/courses.service';
import type { CourseListItem } from '../../courses/types/course.types';
import { authStore } from '../../../store/auth.store';
import { PersonalFieldsModal } from '../components/PersonalFieldsModal';
import { calculateTextInitialSize, measureTextAsync, getSampleTextForField } from '../utils/textMeasurement';
import { AutoFitTextContainer } from '../components/AutoFitTextContainer';
import {
  fetchCertificateFonts,
  loadFontFaceIntoDOM,
  FALLBACK_SYSTEM_FONTS,
  type CertificateFontItem,
} from '../utils/fontRegistry';
import { UploadFontModal } from '../components/UploadFontModal';

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
  max_font_size?: number;
  min_font_size?: number;
  last_fitted_font_size?: number;
  auto_fit?: boolean;
  allow_grow?: boolean;
  overflow?: 'ellipsis' | 'clip';
  font_weight?: string;
  fontKey?: string;
  font_family?: string;
  text_align?: 'left' | 'center' | 'right';
  color?: string;
  prefix?: string;
  suffix?: string;
  z_index?: number;
  image_url?: string;
  static_text?: string;
  padding?: { top: number; right: number; bottom: number; left: number };
  fit?: 'contain' | 'cover';
}

export const CertificateBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { templateId, courseId: routeCourseId } = useParams<{ templateId?: string; courseId?: string }>();

  const authState = authStore.getState();
  const academyName = authState.academy?.name || (authState.user as any)?.academy_name || 'CubixSkill Academy';

  // Step Control (Step 1: Course & Dynamic Fields Selection, Step 2: Visual Designer)
  const [step, setStep] = useState<1 | 2>(templateId ? 2 : 1);

  // Course State
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(routeCourseId || '');
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

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
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');

  // Canvas Elements (Starts BLANK as required by product spec)
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);

  // Font Registry & License State
  const [availableFonts, setAvailableFonts] = useState<CertificateFontItem[]>(FALLBACK_SYSTEM_FONTS);
  const [isUploadFontModalOpen, setIsUploadFontModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [selectedLicenseFont, setSelectedLicenseFont] = useState<CertificateFontItem | null>(null);

  useEffect(() => {
    fetchCertificateFonts().then((fonts) => {
      setAvailableFonts(fonts);
      fonts.forEach((f) => loadFontFaceIntoDOM(f));
    });
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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load available Courses on mount
  useEffect(() => {
    setIsLoadingCourses(true);
    coursesService
      .listCourses({ page_size: 100 })
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.results || [];
        setCourses(list);
        if (!selectedCourseId && list.length > 0) {
          setSelectedCourseId(list[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingCourses(false));
  }, []);

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

  // Load existing template if editing
  useEffect(() => {
    if (templateId) {
      certificatesService
        .getTemplate(templateId)
        .then((tmpl) => {
          if (tmpl) {
            setTemplateName(tmpl.name);
            setDescription(tmpl.description || '');
            if (tmpl.template_data && Array.isArray(tmpl.template_data.elements)) {
              setElements(tmpl.template_data.elements);
              const keys = tmpl.template_data.elements.map((el: CanvasElement) => el.binding);
              setSelectedFieldKeys(Array.from(new Set(keys)));
            }
            if (tmpl.background_media?.stored_filename || tmpl.background_media?.relative_path) {
              setBackgroundImageUrl(tmpl.background_media.stored_filename || tmpl.background_media.relative_path);
            }
          }
        })
        .catch(() => {});
    }
  }, [templateId]);

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

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  const toggleFieldSelection = (key: string) => {
    setSelectedFieldKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const addElement = async (binding: CertificateBinding) => {
    // 1. Resolve preview text string FIRST
    const sampleText = getSampleTextForField(binding.key, binding.label);

    // 2. Resolve selected font FIRST & load font into DOM
    const defaultFontKey = 'inter';
    const defaultFontObj = availableFonts.find(f => f.key === defaultFontKey) || availableFonts[0];
    if (defaultFontObj) {
      await loadFontFaceIntoDOM(defaultFontObj);
    }

    // 3. Measure real text using loaded font metrics + tight padding
    const tightPadding = { top: 1, right: 2, bottom: 1, left: 2 };
    const measured = await measureTextAsync({
      text: sampleText,
      fontSize: 16,
      fontFamily: defaultFontObj?.family || 'Inter',
      fontWeight: '600',
      padding: tightPadding,
      canvasWidth: 1600,
      canvasHeight: 1131,
    });

    const width = parseFloat((measured.widthPercent / 100).toFixed(4));
    const height = parseFloat((measured.heightPercent / 100).toFixed(4));
    const nextY = parseFloat((0.25 + ((elements.length * 0.1) % 0.45)).toFixed(2));

    // 4. Development assertions / guards
    if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
      return;
    }

    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      binding: binding.key,
      label: binding.label,
      type: binding.type,
      x: 0.5,
      y: nextY,
      width,
      height,
      font_size: 16,
      min_font_size: 1,
      font_weight: '600',
      fontKey: defaultFontObj?.key || 'inter',
      font_family: defaultFontObj?.family || 'Inter',
      text_align: 'center',
      color: '#0F172A',
      padding: tightPadding,
      z_index: elements.length + 1,
    };

    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  const addStaticTextElement = async () => {
    const textLabel = 'Certificate of Completion';

    const defaultFontKey = 'inter';
    const defaultFontObj = availableFonts.find(f => f.key === defaultFontKey) || availableFonts[0];
    if (defaultFontObj) {
      await loadFontFaceIntoDOM(defaultFontObj);
    }

    const tightPadding = { top: 1, right: 2, bottom: 1, left: 2 };
    const measured = await measureTextAsync({
      text: textLabel,
      fontSize: 16,
      fontFamily: defaultFontObj?.family || 'Inter',
      fontWeight: '700',
      padding: tightPadding,
      canvasWidth: 1600,
      canvasHeight: 1131,
    });

    const width = parseFloat((measured.widthPercent / 100).toFixed(4));
    const height = parseFloat((measured.heightPercent / 100).toFixed(4));
    const nextY = parseFloat((0.25 + ((elements.length * 0.1) % 0.45)).toFixed(2));

    if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
      return;
    }

    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      binding: 'static_text',
      label: 'Static Heading',
      type: 'static_text',
      static_text: textLabel,
      x: 0.5,
      y: nextY,
      width,
      height,
      font_size: 16,
      min_font_size: 1,
      font_weight: '700',
      fontKey: defaultFontObj?.key || 'inter',
      font_family: defaultFontObj?.family || 'Inter',
      text_align: 'center',
      color: '#0F172A',
      padding: tightPadding,
      z_index: elements.length + 1,
    };

    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newEl: CanvasElement = {
        id: `el-${Date.now()}`,
        binding: 'custom_image',
        label: 'Academy Stamp / Image',
        type: 'image',
        image_url: url,
        x: 0.5,
        y: 0.75,
        width: 0.15,
        height: 0.15,
        z_index: elements.length + 1,
        fit: 'contain',
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedElementId(newEl.id);
      showToast('Image element added to canvas.');
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackgroundImageUrl(event.target?.result as string);
      showToast('Certificate background image updated.');
    };
    reader.readAsDataURL(file);
  };

  const handlePersonalFieldCreated = (field: { key: string; label: string; field_type: string }) => {
    const newKey = `student.custom.${field.key}`;
    const newBinding: CertificateBinding = {
      key: newKey,
      label: `Student ${field.label}`,
      group: 'Personal Details (Custom Student Fields)',
      type: 'text',
    };
    setAvailableBindings((prev) => [...prev, newBinding]);
    setSelectedFieldKeys((prev) => [...prev, newKey]);
    showToast(`Personal field '${field.label}' created.`);
  };

  const updateSelectedElement = async (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;

    const curEl = elements.find((el) => el.id === selectedElementId);
    let extraUpdates: Partial<CanvasElement> = {};

    if (curEl && typeof updates.font_size === 'number' && updates.font_size !== curEl.font_size) {
      const newFontSize = updates.font_size;
      const sampleText = resolveSampleValue(curEl);
      const fontObj = availableFonts.find((f) => f.key === curEl.fontKey || f.family === curEl.font_family);
      const tightPadding = curEl.padding || { top: 1, right: 2, bottom: 1, left: 2 };

      const measured = await measureTextAsync({
        text: sampleText,
        fontSize: newFontSize,
        fontFamily: fontObj?.family || curEl.font_family || 'Inter',
        fontWeight: curEl.font_weight || '600',
        padding: tightPadding,
        canvasWidth: 1600,
        canvasHeight: 1131,
      });

      const newWidth = parseFloat((measured.widthPercent / 100).toFixed(4));
      const newHeight = parseFloat((measured.heightPercent / 100).toFixed(4));

      if (newWidth > 0 && newHeight > 0) {
        extraUpdates.width = newWidth;
        extraUpdates.height = newHeight;
      }
    }

    setElements((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, ...updates, ...extraUpdates } : el))
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
      let newW = dragStartRef.current.elementW;
      let newH = dragStartRef.current.elementH;

      if (isResizing.includes('r')) newW = Math.max(0.05, dragStartRef.current.elementW + deltaX);
      if (isResizing.includes('b')) newH = Math.max(0.02, dragStartRef.current.elementH + deltaY);

      updateSelectedElement({ width: parseFloat(newW.toFixed(4)), height: parseFloat(newH.toFixed(4)) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      const payload: Partial<CertificateTemplateData> = {
        name: templateName,
        description,
        page_size: pageSize,
        orientation,
        template_data: {
          elements,
          canvas: { width: 1600, height: 1131 },
          background_image_url: backgroundImageUrl,
        },
      };

      if (templateId) {
        await certificatesService.updateTemplate(templateId, payload);
        showToast('Certificate template updated.');
      } else {
        const created = await certificatesService.createTemplate(payload);
        showToast('Certificate template created successfully.');
        if (selectedCourseId) {
          await certificatesService.assignCourseToTemplate(created.id, selectedCourseId);
        }
        navigate(`/certificates`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save template.');
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
  const designerSelectedBindings = availableBindings.filter((b) =>
    selectedFieldKeys.includes(b.key)
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      className="space-y-4 sm:space-y-6 text-left font-sans pb-32 sm:pb-12 max-w-[1600px] mx-auto px-1 sm:px-2 select-none"
    >
      {/* Hidden File Inputs */}
      <input type="file" ref={imageFileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={bgFileInputRef} onChange={handleBackgroundUpload} accept="image/*" className="hidden" />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
          <button type="button" onClick={() => setToastMsg(null)} className="p-0.5 hover:bg-slate-700 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER & TOOLBAR */}
      <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-[16px] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (step === 2 && !templateId ? setStep(1) : navigate('/certificates'))}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263244] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:border-[#2563EB]"
                />
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  Step {step} of 2
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-0.5">
                {step === 1
                  ? 'Select Course & Pick Dynamic Fields — Choose the information source for automatic certificate generation.'
                  : 'Visual Certificate Designer — Move/resize containers, add images, and preview live text auto-fit.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 1 ? (
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedCourseId || selectedFieldKeys.length === 0}
                onClick={() => setStep(2)}
                rightIcon={<ChevronRight className="w-4 h-4 text-white" />}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold h-9 cursor-pointer shadow-xs shadow-[#2563EB]/25"
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
                    className="text-xs font-semibold h-9 cursor-pointer"
                  >
                    Edit Fields Selection
                  </Button>
                )}
                <Button
                  variant={isPreview ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setIsPreview(!isPreview)}
                  leftIcon={<Eye className="w-4 h-4" />}
                  className="text-xs font-semibold h-9 cursor-pointer"
                >
                  {isPreview ? 'Edit Layout' : 'Preview Sample'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  onClick={handleSaveTemplate}
                  leftIcon={<Save className="w-4 h-4 text-white" />}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold h-9 cursor-pointer shadow-xs shadow-[#2563EB]/25"
                >
                  {isSaving ? 'Saving...' : 'Save Template'}
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

            {isLoadingCourses ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                <span>Loading available courses...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                    Course Context
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.code || 'CS-COURSE'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Selecting a course evaluates its specific lesson structure. If a course lacks Quizzes or Assignments, those specific score fields will be automatically excluded.
                  </p>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN — TOOLBAR & FIELD LIBRARY */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-4 rounded-[16px] shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] border-b border-slate-100 dark:border-[#263244] pb-2 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-[#2563EB]" />
                <span>Add Custom Elements</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={addStaticTextElement}
                  className="p-2.5 bg-slate-50 dark:bg-[#172033] hover:bg-blue-50 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-[#263244] rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Type className="w-4 h-4 text-[#2563EB]" />
                  <span>+ Static Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="p-2.5 bg-slate-50 dark:bg-[#172033] hover:bg-emerald-50 dark:hover:bg-[#132e25] border border-slate-200 dark:border-[#263244] rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>+ Image</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#263244]">
                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  className="w-full p-2.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-purple-500" />
                  <span>Set Background Image</span>
                </button>
              </div>
            </Card>

            <Card className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-4 rounded-[16px] shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  <span>Selected Dynamic Fields</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-[#2563EB] rounded">
                  {designerSelectedBindings.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                {designerSelectedBindings.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => addElement(b)}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#172033] hover:bg-blue-50 dark:hover:bg-[#1e293b] border border-[#E2E8F0] dark:border-[#263244] rounded-xl text-left flex items-center justify-between text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {b.type === 'text' && <Type className="w-3.5 h-3.5 text-[#2563EB]" />}
                      {b.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />}
                      {b.type === 'qr' && <QrCode className="w-3.5 h-3.5 text-purple-500" />}
                      <span className="truncate">{b.label}</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal px-1.5 py-0.5 bg-slate-200/60 dark:bg-[#0F172A] rounded">
                      {b.group}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* CENTER COLUMN — CANVAS PREVIEW WITH RESIZE HANDLES & DRAG */}
          <div className="lg:col-span-6">
            <Card className="bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-6 rounded-[16px] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-[#94A3B8] uppercase tracking-wider">
                  {isPreview ? 'Live Sample Document Preview' : 'Interactive Layout Canvas (Drag / Resize / Arrow Keys)'}
                </span>
                <span className="px-2 py-0.5 bg-slate-200 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded-md">
                  1600 × 1131 px
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
                className="w-full aspect-[1.414/1] bg-white text-slate-900 border-8 border-[#1E293B] shadow-2xl rounded-lg relative overflow-hidden font-serif select-none"
              >
                <div className="absolute inset-2 border-2 border-[#D97706]/40 pointer-events-none" />

                {elements.map((el) => {
                  const isSelected = selectedElementId === el.id;

                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => !isPreview && handleMouseDownOnElement(e, el)}
                      onTouchStart={(e) => !isPreview && handleMouseDownOnElement(e, el)}
                      style={{
                        position: 'absolute',
                        left: `${el.x * 100}%`,
                        top: `${el.y * 100}%`,
                        width: `${el.width * 100}%`,
                        height: `${el.height * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: el.font_size ? `${el.font_size}px` : undefined,
                        fontWeight: el.font_weight || 'normal',
                        textAlign: el.text_align || 'center',
                        color: el.color || '#0F172A',
                        fontFamily: 'serif',
                        zIndex: el.z_index || 1,
                      }}
                      className={`px-2 py-1 rounded cursor-move transition-all flex items-center justify-center relative overflow-hidden box-border ${
                        isSelected && !isPreview
                          ? 'ring-2 ring-[#2563EB] bg-blue-50/70 dark:bg-blue-900/30 shadow-md'
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
                        <AutoFitTextContainer
                          text={resolveSampleValue(el)}
                          maxFontSize={el.font_size || 16}
                          minFontSize={el.min_font_size || 1}
                          fontFamily={el.font_family || 'Inter'}
                          fontWeight={el.font_weight || 'normal'}
                          fontColor={el.color || '#0F172A'}
                          textAlign={el.text_align || 'center'}
                          padding={el.padding || { top: 1, right: 2, bottom: 1, left: 2 }}
                          isEditorMode={!isPreview}
                          className="w-full h-full pointer-events-none"
                        />
                      )}

                      {/* 4 CORNER RESIZE HANDLES */}
                      {isSelected && !isPreview && (
                        <>
                          {/* TOP-LEFT */}
                          <div
                            onMouseDown={(e) => handleMouseDownOnElement(e, el, 'lt')}
                            onTouchStart={(e) => handleMouseDownOnElement(e, el, 'lt')}
                            className="w-3.5 h-3.5 bg-white border-2 border-[#2563EB] rounded-full absolute -left-1.5 -top-1.5 cursor-nwse-resize shadow-xs z-50 hover:scale-125 transition-transform"
                          />
                          {/* TOP-RIGHT */}
                          <div
                            onMouseDown={(e) => handleMouseDownOnElement(e, el, 'rt')}
                            onTouchStart={(e) => handleMouseDownOnElement(e, el, 'rt')}
                            className="w-3.5 h-3.5 bg-white border-2 border-[#2563EB] rounded-full absolute -right-1.5 -top-1.5 cursor-nesw-resize shadow-xs z-50 hover:scale-125 transition-transform"
                          />
                          {/* BOTTOM-LEFT */}
                          <div
                            onMouseDown={(e) => handleMouseDownOnElement(e, el, 'lb')}
                            onTouchStart={(e) => handleMouseDownOnElement(e, el, 'lb')}
                            className="w-3.5 h-3.5 bg-white border-2 border-[#2563EB] rounded-full absolute -left-1.5 -bottom-1.5 cursor-nesw-resize shadow-xs z-50 hover:scale-125 transition-transform"
                          />
                          {/* BOTTOM-RIGHT */}
                          <div
                            onMouseDown={(e) => handleMouseDownOnElement(e, el, 'rb')}
                            onTouchStart={(e) => handleMouseDownOnElement(e, el, 'rb')}
                            className="w-3.5 h-3.5 bg-[#2563EB] border-2 border-white rounded-full absolute -right-1.5 -bottom-1.5 cursor-nwse-resize shadow-md z-50 hover:scale-125 transition-transform flex items-center justify-center"
                          >
                            <Maximize2 className="w-1.5 h-1.5 text-white" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN — ELEMENT INSPECTOR & LAYER CONTROLS */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-4 rounded-[16px] shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] border-b border-slate-100 dark:border-[#263244] pb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#2563EB]" />
                  <span>Element Properties</span>
                </span>
                {selectedElement && (
                  <button
                    type="button"
                    onClick={deleteSelectedElement}
                    title="Delete Element"
                    className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-[#3f1d24] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </h3>

              {selectedElement ? (
                <div className="space-y-3 text-xs">
                  {/* ACTIVE ELEMENT CONTEXT HEADER */}
                  <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl flex items-center justify-between">
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                        {selectedElement.type === 'static_text'
                          ? 'Static Text'
                          : selectedElement.type === 'image'
                          ? 'Image Element'
                          : selectedElement.binding.startsWith('student.custom.')
                          ? 'Personal Detail'
                          : 'Dynamic Field'}
                      </span>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate block">
                        {selectedElement.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-white dark:bg-[#0F172A] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shrink-0">
                      #{selectedElement.id.slice(-4)}
                    </span>
                  </div>

                  {/* 1. CONTENT / FIELD READONLY KEY (TEXT TYPES) */}
                  {selectedElement.type === 'static_text' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        Static Text Content
                      </label>
                      <input
                        type="text"
                        value={selectedElement.static_text || ''}
                        onChange={(e) => updateSelectedElement({ static_text: e.target.value })}
                        className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  ) : selectedElement.type !== 'image' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        Field Resolver Key (Read-Only)
                      </label>
                      <input
                        type="text"
                        value={selectedElement.binding}
                        disabled
                        className="w-full h-8 px-2 bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#263244] rounded text-xs font-mono text-slate-500"
                      />
                    </div>
                  ) : null}

                  {/* 2. IMAGE CONTENT CONTROLS */}
                  {selectedElement.type === 'image' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        Image Source
                      </label>
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className="w-full h-8 px-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Replace Image</span>
                      </button>
                    </div>
                  )}

                  {/* 3. POSITION CONTROLS */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        Position X (0–1)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={selectedElement.x}
                        onChange={(e) => updateSelectedElement({ x: parseFloat(e.target.value) || 0.5 })}
                        className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        Position Y (0–1)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={selectedElement.y}
                        onChange={(e) => updateSelectedElement({ y: parseFloat(e.target.value) || 0.5 })}
                        className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                      />
                    </div>
                  </div>

                  {/* 4. SIZE CONTROLS */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        Width (0.05–1)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.05"
                        max="1"
                        value={selectedElement.width}
                        onChange={(e) => updateSelectedElement({ width: parseFloat(e.target.value) || 0.2 })}
                        className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        Height (0.02–1)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.02"
                        max="1"
                        value={selectedElement.height}
                        onChange={(e) => updateSelectedElement({ height: parseFloat(e.target.value) || 0.05 })}
                        className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                      />
                    </div>
                  </div>

                  {/* 5. IMAGE-SPECIFIC FIT & OPACITY CONTROLS */}
                  {selectedElement.type === 'image' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                          Object Fit
                        </label>
                        <select
                          value={selectedElement.fit || 'contain'}
                          onChange={(e) => updateSelectedElement({ fit: e.target.value as any })}
                          className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                        >
                          <option value="contain">Contain</option>
                          <option value="cover">Cover</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                          Z-Index Layer
                        </label>
                        <input
                          type="number"
                          value={selectedElement.z_index || 1}
                          onChange={(e) => updateSelectedElement({ z_index: parseInt(e.target.value, 10) || 1 })}
                          className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* 6. TYPOGRAPHY CONTROLS (TEXT TYPES ONLY) */}
                  {selectedElement.type !== 'image' && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-[#263244]">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            Font Family
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsUploadFontModalOpen(true)}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 cursor-pointer"
                          >
                            + Upload
                          </button>
                        </div>
                        <select
                          value={selectedElement.fontKey || selectedElement.font_family || 'inter'}
                          onChange={(e) => {
                            const fontKey = e.target.value;
                            const fontObj = availableFonts.find((f) => f.key === fontKey || f.family === fontKey);
                            if (fontObj) {
                              loadFontFaceIntoDOM(fontObj);
                              updateSelectedElement({
                                fontKey: fontObj.key,
                                font_family: fontObj.family,
                              });
                            }
                          }}
                          className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                        >
                          <optgroup label="DEFAULT SYSTEM FONTS">
                            {availableFonts.filter(f => f.source === 'SYSTEM').map((f) => (
                              <option key={f.id} value={f.key}>
                                {f.name} ({f.license_name})
                              </option>
                            ))}
                          </optgroup>
                          {availableFonts.some(f => f.source === 'ACADEMY') && (
                            <optgroup label="MY ACADEMY FONTS">
                              {availableFonts.filter(f => f.source === 'ACADEMY').map((f) => (
                                <option key={f.id} value={f.key}>
                                  {f.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            Font Weight
                          </label>
                          <select
                            value={selectedElement.font_weight || '600'}
                            onChange={(e) => updateSelectedElement({ font_weight: e.target.value })}
                            className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                          >
                            {(() => {
                              const curFont = availableFonts.find(f => f.key === selectedElement.fontKey || f.family === selectedElement.font_family);
                              const variants = curFont?.font_weight_variants || ['400', '600', '700'];
                              return variants.map(v => (
                                <option key={v} value={v}>
                                  {v === '400' ? '400 (Regular)' : v === '500' ? '500 (Medium)' : v === '600' ? '600 (SemiBold)' : v === '700' ? '700 (Bold)' : v === '800' ? '800 (ExtraBold)' : v}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            Font Size
                          </label>
                          <input
                            type="number"
                            value={selectedElement.font_size || 16}
                            onChange={(e) => updateSelectedElement({ font_size: parseInt(e.target.value, 10) || 16 })}
                            className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            Color
                          </label>
                          <input
                            type="color"
                            value={selectedElement.color || '#0F172A'}
                            onChange={(e) => updateSelectedElement({ color: e.target.value })}
                            className="w-full h-8 p-0.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            Alignment
                          </label>
                          <select
                            value={selectedElement.text_align || 'center'}
                            onChange={(e) => updateSelectedElement({ text_align: e.target.value as any })}
                            className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. LAYER ORDERING BUTTONS */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#263244] flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      Layer Order (z-index: {selectedElement.z_index || 1})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveLayer('up')}
                        className="p-1 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
                        title="Bring Forward"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLayer('down')}
                        className="p-1 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
                        title="Send Backward"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <Sliders className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No element selected
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px] mx-auto">
                    Click an element on the canvas to inspect and edit its type-specific properties.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* PERSONAL FIELDS MODAL */}
      <PersonalFieldsModal
        isOpen={isPersonalModalOpen}
        onClose={() => setIsPersonalModalOpen(false)}
        onFieldCreated={handlePersonalFieldCreated}
      />

      {/* UPLOAD CUSTOM FONT MODAL */}
      <UploadFontModal
        isOpen={isUploadFontModalOpen}
        onClose={() => setIsUploadFontModalOpen(false)}
        onFontUploaded={(newFont) => {
          setAvailableFonts((prev) => [...prev, newFont]);
          loadFontFaceIntoDOM(newFont);
          if (selectedElementId) {
            updateSelectedElement({
              fontKey: newFont.key,
              font_family: newFont.family,
            });
          }
          setToastMsg(`Font "${newFont.name}" uploaded successfully!`);
          setTimeout(() => setToastMsg(null), 3000);
        }}
      />
    </div>
  );
};
