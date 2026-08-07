import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Save,
  Globe,
  ZoomIn,
  ZoomOut,
  Trash2,
  Copy,
  Type,
  Move,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Undo,
  Redo,
  Grid,
  Maximize2,
  ShieldCheck,
  Award,
  FileUp,
  Sliders,
  X,
  Palette,
  Bookmark,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { PlaceholderKey, CanvasSizeType } from '../../../types/certificate.types';
import { AutoFitTextContainer } from '../components/AutoFitTextContainer';
import { useCustomCertificateDesignerStore } from '../store/custom-certificate-designer.store';
import { validateAndReadImageFile } from '../store/certificate-image-template.store';

// 25+ PROFESSIONAL FONTS LIST (CURATED FOR CERTIFICATE TYPOGRAPHY)
const PROFESSIONAL_FONTS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Playfair Display',
  'Cinzel',
  'Montserrat',
  'Lora',
  'Merriweather',
  'Cormorant Garamond',
  'Great Vibes',
  'Dancing Script',
  'Alex Brush',
  'Cinzel Decorative',
  'Pinyon Script',
  'Bodoni Moda',
  'Prata',
  'Marcellus',
  'Forum',
  'Oswald',
  'Raleway',
  'Nunito',
  'Source Sans Pro',
  'Outfit',
  'Plus Jakarta Sans',
  'Space Grotesk',
];

export const CustomCertificateDesignerPage: React.FC = () => {
  const navigate = useNavigate();

  // Zustand Store Selectors
  const draft = useCustomCertificateDesignerStore((state) => state.draft);
  const hasHydrated = useCustomCertificateDesignerStore((state) => state.hasHydrated);
  const selectedElementId = useCustomCertificateDesignerStore((state) => state.selectedElementId);
  const zoomLevel = useCustomCertificateDesignerStore((state) => state.zoomLevel);
  const showGrid = useCustomCertificateDesignerStore((state) => state.showGrid);
  const snapToGrid = useCustomCertificateDesignerStore((state) => state.snapToGrid);

  const setSelectedElementId = useCustomCertificateDesignerStore((state) => state.setSelectedElementId);
  const setZoomLevel = useCustomCertificateDesignerStore((state) => state.setZoomLevel);
  const setShowGrid = useCustomCertificateDesignerStore((state) => state.setShowGrid);
  const setSnapToGrid = useCustomCertificateDesignerStore((state) => state.setSnapToGrid);
  void setSnapToGrid; // available for future use

  const setDraft = useCustomCertificateDesignerStore((state) => state.setDraft);
  const addElement = useCustomCertificateDesignerStore((state) => state.addElement);
  const updateElement = useCustomCertificateDesignerStore((state) => state.updateElement);
  const deleteElement = useCustomCertificateDesignerStore((state) => state.deleteElement);
  const duplicateElement = useCustomCertificateDesignerStore((state) => state.duplicateElement);
  const reorderElement = useCustomCertificateDesignerStore((state) => state.reorderElement);
  void reorderElement; // available for future drag-reorder UI
  const alignElement = useCustomCertificateDesignerStore((state) => state.alignElement);
  void alignElement; // available for future alignment toolbar
  const updateBackground = useCustomCertificateDesignerStore((state) => state.updateBackground);

  const savedCustomTemplates = useCustomCertificateDesignerStore((state) => state.savedCustomTemplates);
  const saveAsCustomTemplate = useCustomCertificateDesignerStore((state) => state.saveAsCustomTemplate);
  const loadCustomTemplate = useCustomCertificateDesignerStore((state) => state.loadCustomTemplate);
  const duplicateCustomTemplate = useCustomCertificateDesignerStore((state) => state.duplicateCustomTemplate);
  const renameCustomTemplate = useCustomCertificateDesignerStore((state) => state.renameCustomTemplate);
  const deleteCustomTemplate = useCustomCertificateDesignerStore((state) => state.deleteCustomTemplate);

  const undo = useCustomCertificateDesignerStore((state) => state.undo);
  const redo = useCustomCertificateDesignerStore((state) => state.redo);
  const saveDraft = useCustomCertificateDesignerStore((state) => state.saveDraft);

  // Local UI State & Panel Collapse / Fullscreen States
  const [activeLeftTab, setActiveLeftTab] = useState<'fields' | 'text' | 'elements' | 'uploads' | 'background' | 'templates' | 'layers'>('fields');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [warningToast, setWarningToast] = useState<string | null>(null);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [mobileSheet, setMobileSheet] = useState<'fields' | 'text' | 'elements' | 'uploads' | 'background' | 'templates' | 'layers' | 'properties' | null>(null);

  // Custom Template Save & Rename Modal State
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState<boolean>(false);
  const [templateSaveTitle, setTemplateSaveTitle] = useState<string>('');
  const [templateSaveDesc, setTemplateSaveDesc] = useState<string>('');
  const [renamingTemplateId, setRenamingTemplateId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>('');

  // Mouse Drag Position & Resize States
  const canvasRef = useRef<HTMLDivElement>(null);

  const [draggingState, setDraggingState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const [resizingState, setResizingState] = useState<{
    elementId: string;
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Auto-open Inspector Bottom Sheet on Mobile when element is selected
  useEffect(() => {
    if (selectedElementId && window.innerWidth < 1024) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileSheet('properties');
    }
  }, [selectedElementId]);

  // Selected Canvas Element Derived Value
  const selectedElement = draft.elements.find((el) => el.id === selectedElementId);

  // Filtered Dynamic Fields for Sidebar Search
  const filteredDynamicFields = draft.selectedFields.filter(
    (f) =>
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Background Configuration with safe defaults
  const bgConfig = draft.bgConfig || {
    type: 'solid',
    solidColor: '#FFFFFF',
    recentColors: ['#FFFFFF', '#F8FAFC', '#EFF6FF', '#FEF3C7', '#ECFDF5', '#0F172A'],
    gradientType: 'linear',
    gradientColor1: '#2563EB',
    gradientColor2: '#1E1B4B',
    gradientAngle: 135,
    imageFit: 'fit',
    opacity: 1,
    brightness: 100,
    blur: 0,
    positionX: 50,
    positionY: 50,
    scale: 100,
    isLocked: true,
  };

  const getCanvasBgStyle = (): React.CSSProperties => {
    if (bgConfig.type === 'solid') {
      return { backgroundColor: bgConfig.solidColor || '#FFFFFF' };
    }
    if (bgConfig.type === 'gradient') {
      if (bgConfig.gradientType === 'radial') {
        return {
          backgroundImage: `radial-gradient(circle, ${bgConfig.gradientColor1 || '#2563EB'}, ${bgConfig.gradientColor2 || '#1E1B4B'})`,
        };
      }
      return {
        backgroundImage: `linear-gradient(${bgConfig.gradientAngle || 135}deg, ${bgConfig.gradientColor1 || '#2563EB'}, ${bgConfig.gradientColor2 || '#1E1B4B'})`,
      };
    }
    if (bgConfig.type === 'transparent') {
      return {
        backgroundColor: 'transparent',
      };
    }
    return { backgroundColor: '#FFFFFF' };
  };

  // Keyboard Shortcuts (Delete, Undo, Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        deleteElement(selectedElementId);
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteElement, undo, redo]);

  // REAL-TIME MOUSE DRAG HANDLERS
  const handleStartDrag = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const target = draft.elements.find((el) => el.id === elementId);
    if (!target || target.isLocked) return;

    setSelectedElementId(elementId);
    setDraggingState({
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: target.x,
      initialY: target.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingState) {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const deltaXPixels = e.clientX - draggingState.startX;
        const deltaYPixels = e.clientY - draggingState.startY;

        const deltaXPercent = (deltaXPixels / rect.width) * 100;
        const deltaYPercent = (deltaYPixels / rect.height) * 100;

        let newX = draggingState.initialX + deltaXPercent;
        let newY = draggingState.initialY + deltaYPercent;

        // Snap to grid (10% increments)
        if (snapToGrid) {
          newX = Math.round(newX / 5) * 5;
          newY = Math.round(newY / 5) * 5;
        }

        // Clamp inside canvas (0-100%)
        newX = Math.max(5, Math.min(95, newX));
        newY = Math.max(5, Math.min(95, newY));

        updateElement(draggingState.elementId, {
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        });
      } else if (resizingState) {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const deltaXPixels = e.clientX - resizingState.startX;
        const deltaYPixels = e.clientY - resizingState.startY;

        let newWidth = resizingState.initialWidth;
        let newHeight = resizingState.initialHeight;
        let newX = resizingState.initialX;
        let newY = resizingState.initialY;

        const deltaXPercent = (deltaXPixels / rect.width) * 100;

        if (resizingState.handle.includes('e')) {
          newWidth = Math.max(10, resizingState.initialWidth + deltaXPercent);
        } else if (resizingState.handle.includes('w')) {
          newWidth = Math.max(10, resizingState.initialWidth - deltaXPercent);
          newX = resizingState.initialX + deltaXPercent / 2;
        }

        if (resizingState.handle.includes('s')) {
          newHeight = Math.max(20, resizingState.initialHeight + deltaYPixels);
        } else if (resizingState.handle.includes('n')) {
          newHeight = Math.max(20, resizingState.initialHeight - deltaYPixels);
          newY = resizingState.initialY - (deltaYPixels / rect.height) * 50;
        }

        updateElement(resizingState.elementId, {
          width: Math.round(newWidth * 10) / 10,
          height: Math.round(newHeight),
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingState(null);
      setResizingState(null);
    };

    if (draggingState || resizingState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingState, resizingState, snapToGrid, updateElement]);

  const handleStartResize = (
    e: React.MouseEvent,
    elementId: string,
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
  ) => {
    e.stopPropagation();
    const target = draft.elements.find((el) => el.id === elementId);
    if (!target) return;

    setResizingState({
      elementId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: target.width,
      initialHeight: target.height || 50,
      initialX: target.x,
      initialY: target.y,
    });
  };

  // Image File Upload Handler for Logo / Signature / Seal
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateAndReadImageFile(file, (dataUrl) => {
      addElement({
        type: 'image',
        label: `Uploaded ${label}`,
        imageUrl: dataUrl,
        x: 50,
        y: 50,
        width: 25,
        height: 100,
        opacity: 1,
        rotation: 0,
      });
      setUploadError(null);
    });

    if (error) setUploadError(error);
  };

  // Background Image Upload Handler
  const handleImageBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateAndReadImageFile(file, (dataUrl) => {
      updateBackground({
        type: 'image',
        imageUrl: dataUrl,
      });
      setSaveToast('Background image uploaded!');
      setTimeout(() => setSaveToast(null), 3000);
      setUploadError(null);
    });

    if (error) setUploadError(error);
  };

  // Preset Text Generators
  const addHeadingElement = () => {
    addElement({
      type: 'text',
      label: 'Main Heading',
      text: 'CERTIFICATE TITLE',
      x: 50,
      y: 30,
      width: 70,
      height: 60,
      fontFamily: 'Cinzel',
      fontSize: 36,
      fontWeight: 800,
      fontColor: '#0F172A',
      textAlign: 'center',
    });
  };

  const addSubheadingElement = () => {
    addElement({
      type: 'text',
      label: 'Subheading',
      text: 'For Exceptional Merit & Outstanding Performance',
      x: 50,
      y: 40,
      width: 65,
      height: 40,
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 600,
      fontColor: '#475569',
      textAlign: 'center',
    });
  };

  const addBodyElement = () => {
    addElement({
      type: 'text',
      label: 'Paragraph Text',
      text: 'Has successfully fulfilled all curriculum requirements and passed final assessments.',
      x: 50,
      y: 60,
      width: 80,
      height: 50,
      fontFamily: 'Roboto',
      fontSize: 14,
      fontWeight: 400,
      fontColor: '#64748B',
      textAlign: 'center',
    });
  };

  const addDynamicFieldElement = (field: { key: PlaceholderKey; label: string; sampleValue?: string }) => {
    const isPlaced = draft.elements.some((el) => el.placeholderKey === field.key);
    if (!isPlaced) {
      addElement({
        type: 'placeholder',
        label: field.label,
        placeholderKey: field.key,
        text: field.sampleValue || field.label,
        x: 50,
        y: 50,
        width: 60,
        height: 48,
        fontFamily: 'Inter',
        fontSize: 22,
        fontWeight: 700,
        fontColor: '#0F172A',
        textAlign: 'center',
      });
    }
  };

  const addQrCodeElement = () => {
    addElement({
      type: 'qr_code',
      label: 'Verification QR',
      placeholderKey: '{{qr_code}}',
      x: 75,
      y: 82,
      width: 20,
      height: 60,
      textAlign: 'center',
    });
  };

  const addSignatureElement = () => {
    addElement({
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
    });
  };

  // Custom Template Handlers
  const handleSaveAsTemplate = () => {
    if (!templateSaveTitle.trim()) return;
    const item = saveAsCustomTemplate(templateSaveTitle.trim(), templateSaveDesc.trim());
    setIsSaveTemplateModalOpen(false);
    setTemplateSaveTitle('');
    setTemplateSaveDesc('');
    setSaveToast(`Saved "${item.title}" as reusable Custom Template!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleLoadTemplate = (templateId: string) => {
    const { missingFields } = loadCustomTemplate(templateId);
    if (missingFields.length > 0) {
      setWarningToast(`Template loaded with ${missingFields.length} unconfigured field(s): ${missingFields.join(', ')}.`);
      setTimeout(() => setWarningToast(null), 6000);
    } else {
      setSaveToast('Custom Template loaded into editor!');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleSaveDraft = () => {
    saveDraft();
    setSaveToast('Custom certificate template saved successfully!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  if (!hasHydrated) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-xs text-slate-900 bg-[#F8FAFC] overflow-x-hidden text-left pb-12">
      {/* TOAST NOTIFICATION */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* WARNING TOAST */}
      {warningToast && (
        <div className="fixed top-20 right-6 z-50 bg-amber-900 text-amber-100 font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-700 max-w-md animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{warningToast}</span>
          <button type="button" onClick={() => setWarningToast(null)} className="ml-auto text-amber-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP STUDIO TOOLBAR (DESKTOP & MOBILE DEDICATED LAYOUTS) */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 shrink-0 text-slate-900 sticky top-0 z-20 shadow-2xs">
        {/* MOBILE 3-ROW TOOLBAR (< md screens) */}
        <div className="md:hidden space-y-2">
          {/* ROW 1: BACK & TEMPLATE NAME */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/certificates')}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer shrink-0 min-h-[44px] min-w-[44px]"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ title: e.target.value })}
              className="bg-white border-slate-200 font-extrabold text-xs text-slate-900 h-10 focus:border-blue-600 flex-1 truncate"
            />
          </div>

          {/* ROW 2: ZOOM CONTROLS & FULL SCREEN */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-1 justify-center">
              <button
                type="button"
                onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-700 px-3 select-none">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer min-h-[44px] ${
                isFullScreen ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isFullScreen ? 'Exit' : 'Full Screen'}</span>
            </button>
          </div>

          {/* ROW 3: SAVE DRAFT & PUBLISH TEMPLATE */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveDraft}
              className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold text-xs min-h-[44px] w-full justify-center"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={handleSaveDraft}
              style={{ backgroundColor: '#059669' }}
              className="text-white font-bold text-xs shadow-xs min-h-[44px] w-full justify-center hover:bg-emerald-700"
              leftIcon={<Globe className="w-4 h-4" />}
            >
              Publish
            </Button>
          </div>
        </div>

        {/* DESKTOP TOOLBAR (>= md screens) */}
        <div className="hidden md:flex w-full flex-wrap items-center justify-between gap-2.5">
          {/* LEFT: BACK BUTTON & TITLE & MODE BADGE */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/certificates')}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer shrink-0"
              title="Back to Certificates"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ title: e.target.value })}
                className="bg-white border-slate-200 font-extrabold text-xs text-slate-900 h-9 focus:border-blue-600 w-44 sm:w-60 truncate"
              />
              <span className="whitespace-nowrap inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-blue-50 text-blue-700 font-bold border border-blue-200 shrink-0">
                Custom Studio
              </span>
            </div>
          </div>

          {/* CENTER: ZOOM, CANVAS SIZE & WORKSPACE TOGGLES */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* UNDO / REDO */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={undo}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={redo}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CANVAS SIZE SELECTOR */}
            <select
              value={draft.canvasSize}
              onChange={(e) => setDraft({ canvasSize: e.target.value as CanvasSizeType })}
              className="h-8 px-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800 shrink-0"
            >
              <option value="a4_landscape">A4 Landscape</option>
              <option value="a4_portrait">A4 Portrait</option>
              <option value="letter">US Letter</option>
            </select>

            {/* ZOOM CONTROLS */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-700 px-2 select-none">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* GRID TOGGLE */}
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-1 rounded-lg border font-bold text-xs flex items-center gap-1 cursor-pointer min-h-[32px] whitespace-nowrap shrink-0 ${
                showGrid ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Grid
            </button>

            {/* WORKSPACE SIDEBAR TOGGLES & FULLSCREEN */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all whitespace-nowrap min-h-[32px] ${
                  isLeftCollapsed ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-white'
                }`}
                title={isLeftCollapsed ? 'Show Sidebar Tools' : 'Hide Sidebar Tools'}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-[11px]">{isLeftCollapsed ? 'Tools' : 'Tools'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all whitespace-nowrap min-h-[32px] ${
                  isRightCollapsed ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-white'
                }`}
                title={isRightCollapsed ? 'Show Inspector' : 'Hide Inspector'}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-[11px]">{isRightCollapsed ? 'Inspector' : 'Inspector'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all whitespace-nowrap min-h-[32px] ${
                  isFullScreen ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                title="Full Screen Canvas Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">{isFullScreen ? 'Exit' : 'Full Screen'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: SAVE TEMPLATE, SAVE DRAFT & PUBLISH */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTemplateSaveTitle(draft.title || 'Custom Certificate Template');
                setIsSaveTemplateModalOpen(true);
              }}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-bold text-xs min-h-[36px] px-3 whitespace-nowrap"
              leftIcon={<Bookmark className="w-3.5 h-3.5" />}
            >
              Save as Template
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveDraft}
              className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold text-xs min-h-[36px] px-3 whitespace-nowrap"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={handleSaveDraft}
              style={{ backgroundColor: '#059669' }}
              className="text-white font-bold text-xs shadow-xs min-h-[36px] px-3.5 whitespace-nowrap hover:bg-emerald-700"
              leftIcon={<Globe className="w-3.5 h-3.5" />}
            >
              Publish Template
            </Button>
          </div>
        </div>
      </header>

      {/* FULL SCREEN CANVAS OVERLAY MODE */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-auto">
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white border border-slate-800 rounded-2xl px-5 py-2.5 shadow-2xl flex items-center gap-4">
            <span className="font-extrabold text-xs text-blue-400 truncate max-w-[200px]">{draft.title}</span>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-bold text-white px-2">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Exit Fullscreen
            </button>
          </div>

          <div className="overflow-auto w-full h-full flex items-center justify-center pt-16">
            <div
              ref={canvasRef}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center center',
                ...getCanvasBgStyle(),
                aspectRatio: draft.canvasSize === 'a4_portrait' ? '0.707' : '1.414',
              }}
              className={`relative max-w-full rounded-2xl border-4 border-slate-800 shadow-2xl transition-all overflow-hidden shrink-0 inline-block w-[1100px] ${
                showGrid ? 'bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px]' : ''
              }`}
            >
              {/* BACKDROP IMAGE LAYER (LOCKED AT BOTTOM) */}
              {bgConfig.type === 'image' && bgConfig.imageUrl && (
                <img
                  src={bgConfig.imageUrl}
                  alt="Certificate Background"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: bgConfig.imageFit === 'stretch' ? 'fill' : bgConfig.imageFit === 'center' ? 'none' : bgConfig.imageFit === 'fit' ? 'contain' : 'cover',
                    objectPosition: `${bgConfig.positionX ?? 50}% ${bgConfig.positionY ?? 50}%`,
                    opacity: bgConfig.opacity ?? 1,
                    filter: `brightness(${bgConfig.brightness ?? 100}%) blur(${bgConfig.blur ?? 0}px)`,
                    transform: `scale(${(bgConfig.scale ?? 100) / 100})`,
                    zIndex: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                />
              )}

              {draft.elements
                .filter((el) => el.isVisible !== false)
                .map((el) => {
                  const isSelected = el.id === selectedElementId;
                  const containerHeight = el.height || 50;
                  const isQr = el.placeholderKey === '{{qr_code}}';

                  return (
                    <AutoFitTextContainer
                      key={el.id}
                      text={isQr ? '' : el.text || el.label}
                      maxFontSize={el.fontSize || 24}
                      fontFamily={el.fontFamily || 'Inter'}
                      fontWeight={el.fontWeight || 600}
                      fontStyle={el.fontStyle || 'normal'}
                      fontColor={el.fontColor || '#0F172A'}
                      textAlign={el.textAlign || 'center'}
                      isUnderline={el.isUnderline}
                      letterSpacing={el.letterSpacing}
                      opacity={el.opacity ?? 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(el.id);
                      }}
                      onMouseDown={(e) => handleStartDrag(e, el.id)}
                      style={{
                        position: 'absolute',
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.width}%`,
                        height: `${containerHeight}px`,
                        transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
                        zIndex: el.zIndex || 10,
                      }}
                      className={`cursor-move p-1.5 transition-shadow rounded-lg select-none ${
                        isSelected
                          ? 'border-2 border-dashed border-blue-600 bg-blue-50/20 shadow-lg'
                          : 'hover:border hover:border-dashed hover:border-slate-400'
                      }`}
                    >
                      {el.type === 'image' && el.imageUrl ? (
                        <img src={el.imageUrl} alt={el.label} className="w-full h-full object-contain pointer-events-none" />
                      ) : isQr ? (
                        <div className="p-2 bg-white rounded-xl border border-slate-300 inline-block shadow-2xs">
                          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-[9px]">
                            QR
                          </div>
                        </div>
                      ) : undefined}
                    </AutoFitTextContainer>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* THREE-COLUMN EDITOR STUDIO */}
      <div
        className={`flex-1 w-full mx-auto p-3 grid gap-4 overflow-hidden transition-all duration-300 ${
          isLeftCollapsed && isRightCollapsed
            ? 'grid-cols-1'
            : isLeftCollapsed
            ? 'grid-cols-1 lg:grid-cols-[1fr_240px]'
            : isRightCollapsed
            ? 'grid-cols-1 lg:grid-cols-[220px_1fr]'
            : 'grid-cols-1 lg:grid-cols-[220px_1fr_240px]'
        }`}
      >
        {/* LEFT PANEL: 7-TAB SIDEBAR (FIELDS, TEXT, ELEMENTS, UPLOADS, BACKGROUND, TEMPLATES, LAYERS) */}
        {!isLeftCollapsed && (
          <div className="hidden lg:flex bg-white border border-slate-200 shadow-2xs rounded-2xl p-3 flex-col h-full space-y-3 w-full lg:w-[220px] shrink-0">
          {/* TAB HEADERS GRID */}
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveLeftTab('fields')}
              className={`py-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeLeftTab === 'fields' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              title="Dynamic Fields"
            >
              <Sparkles className="w-3.5 h-3.5" /> Fields
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab('text')}
              className={`py-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeLeftTab === 'text' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              title="Text Elements"
            >
              <Type className="w-3.5 h-3.5" /> Text
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab('elements')}
              className={`py-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeLeftTab === 'elements' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              title="Elements"
            >
              <Award className="w-3.5 h-3.5" /> Elements
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab('uploads')}
              className={`py-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeLeftTab === 'uploads' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              title="Upload Images"
            >
              <Upload className="w-3.5 h-3.5" /> Uploads
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab('background')}
              className={`py-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeLeftTab === 'background' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              title="Custom Background"
            >
              <Palette className="w-3.5 h-3.5" /> Bg Style
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab('templates')}
              className={`py-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeLeftTab === 'templates' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              title="Custom Templates"
            >
              <Bookmark className="w-3.5 h-3.5" /> Templates
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab('layers')}
              className={`py-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center gap-1 transition-all cursor-pointer col-span-2 ${
                activeLeftTab === 'layers' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              title="Layers Manager"
            >
              <Layers className="w-3.5 h-3.5" /> Layers
            </button>
          </div>

          {/* TAB 1: SETUP DYNAMIC FIELDS */}
          {activeLeftTab === 'fields' && (
            <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar">
              <div className="space-y-1">
                <h3 className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                  <span>Selected Dynamic Fields</span>
                  <span className="font-mono text-[9px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {draft.selectedFields.length} Setup Fields
                  </span>
                </h3>
              </div>

              <div className="space-y-2">
                {draft.selectedFields.map((field) => {
                  const isPlaced = draft.elements.some((el) => el.placeholderKey === field.key);
                  return (
                    <div
                      key={field.key}
                      onClick={() => addDynamicFieldElement(field)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                        isPlaced
                          ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{field.label}</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                            isPlaced ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          {isPlaced ? 'Placed' : 'Place'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">{field.key}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TEXT PRESETS */}
          {activeLeftTab === 'text' && (
            <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar">
              <h3 className="font-extrabold text-xs text-slate-900">Add Custom Typography</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={addHeadingElement}
                  className="w-full p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-extrabold text-xs text-left cursor-pointer flex items-center justify-between min-h-[44px]"
                >
                  <span>+ Add Main Heading</span>
                  <Plus className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  type="button"
                  onClick={addSubheadingElement}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs text-left cursor-pointer flex items-center justify-between min-h-[44px]"
                >
                  <span>+ Add Subheading</span>
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  type="button"
                  onClick={addBodyElement}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs text-left cursor-pointer flex items-center justify-between min-h-[44px]"
                >
                  <span>+ Add Paragraph Text</span>
                  <Plus className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DECORATIVE ELEMENTS */}
          {activeLeftTab === 'elements' && (
            <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar">
              <h3 className="font-extrabold text-xs text-slate-900">Decorative Elements</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={addQrCodeElement}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-900 font-bold text-xs text-left cursor-pointer flex items-center justify-between min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-blue-600" />
                    <span>Verification QR</span>
                  </div>
                  <Plus className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  type="button"
                  onClick={addSignatureElement}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-900 font-bold text-xs text-left cursor-pointer flex items-center justify-between min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Instructor Signature</span>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: UPLOADS */}
          {activeLeftTab === 'uploads' && (
            <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar">
              <h3 className="font-extrabold text-xs text-slate-900">Upload Logos & Signatures</h3>
              <div className="space-y-2">
                <label className="p-3 bg-blue-50 border border-dashed border-blue-300 rounded-xl cursor-pointer flex items-center justify-between text-blue-900 hover:bg-blue-100 min-h-[44px]">
                  <span className="font-bold text-xs">Upload Logo / Emblem</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={(e) => handleImageUpload(e, 'Logo')}
                    className="hidden"
                  />
                  <FileUp className="w-4 h-4 text-blue-600" />
                </label>

                <label className="p-3 bg-emerald-50 border border-dashed border-emerald-300 rounded-xl cursor-pointer flex items-center justify-between text-emerald-900 hover:bg-emerald-100 min-h-[44px]">
                  <span className="font-bold text-xs">Upload Signature</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={(e) => handleImageUpload(e, 'Signature')}
                    className="hidden"
                  />
                  <FileUp className="w-4 h-4 text-emerald-600" />
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: BACKGROUND DESIGNER */}
          {activeLeftTab === 'background' && (
            <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar text-slate-900">
              <div className="space-y-1">
                <h3 className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                  <span>Certificate Background</span>
                  <button
                    type="button"
                    onClick={() => updateBackground({ isLocked: !bgConfig.isLocked })}
                    className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md hover:bg-slate-200"
                  >
                    {bgConfig.isLocked ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
                    <span>{bgConfig.isLocked ? 'Locked' : 'Unlocked'}</span>
                  </button>
                </h3>
                <p className="text-[10px] text-slate-500">
                  Background stays locked at layer index 0 behind all text & placeholders.
                </p>
              </div>

              {/* BACKGROUND TYPE PILLS */}
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['solid', 'gradient', 'image', 'transparent'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateBackground({ type: t })}
                    className={`py-1.5 rounded-lg font-bold text-[10px] capitalize transition-all cursor-pointer ${
                      bgConfig.type === t ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* SOLID COLOR CONTROLS */}
              {bgConfig.type === 'solid' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Solid Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgConfig.solidColor || '#FFFFFF'}
                        onChange={(e) => updateBackground({ solidColor: e.target.value })}
                        className="w-10 h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                      />
                      <Input
                        value={bgConfig.solidColor || '#FFFFFF'}
                        onChange={(e) => updateBackground({ solidColor: e.target.value })}
                        className="bg-white border-slate-200 text-xs h-9 font-mono font-bold flex-1"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Color Palette Swatches</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['#FFFFFF', '#F8FAFC', '#F1F5F9', '#EFF6FF', '#FEF3C7', '#ECFDF5', '#FAF5FF', '#FFF1F2', '#0F172A'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateBackground({ solidColor: c })}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-lg border cursor-pointer hover:scale-110 transition-transform ${
                            bgConfig.solidColor === c ? 'border-blue-600 ring-2 ring-blue-400' : 'border-slate-300'
                          }`}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GRADIENT CONTROLS */}
              {bgConfig.type === 'gradient' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateBackground({ gradientType: 'linear' })}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs border ${
                        bgConfig.gradientType === 'linear' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      Linear
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBackground({ gradientType: 'radial' })}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs border ${
                        bgConfig.gradientType === 'radial' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      Radial
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Color 1</label>
                      <input
                        type="color"
                        value={bgConfig.gradientColor1 || '#2563EB'}
                        onChange={(e) => updateBackground({ gradientColor1: e.target.value })}
                        className="w-full h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Color 2</label>
                      <input
                        type="color"
                        value={bgConfig.gradientColor2 || '#1E1B4B'}
                        onChange={(e) => updateBackground({ gradientColor2: e.target.value })}
                        className="w-full h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                      />
                    </div>
                  </div>

                  {bgConfig.gradientType === 'linear' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Gradient Angle</label>
                        <span className="text-[10px] font-mono text-blue-600 font-bold">{bgConfig.gradientAngle ?? 135}°</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={bgConfig.gradientAngle ?? 135}
                        onChange={(e) => updateBackground({ gradientAngle: Number(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* IMAGE CONTROLS */}
              {bgConfig.type === 'image' && (
                <div className="space-y-3">
                  <label className="p-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center text-blue-700 min-h-[90px]">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="font-bold text-xs">Upload Background Image</span>
                    <span className="text-[10px] text-blue-500">PNG, JPG, WEBP</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageBgUpload}
                      className="hidden"
                    />
                  </label>

                  {bgConfig.imageUrl && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Fitting Mode</label>
                        <select
                          value={bgConfig.imageFit || 'fit'}
                          onChange={(e) => updateBackground({ imageFit: e.target.value as 'fit' | 'fill' | 'stretch' | 'center' })}
                          className="w-full h-9 px-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                        >
                          <option value="fit">Fit (Contain - Aspect Ratio)</option>
                          <option value="fill">Fill (Cover - Fill Canvas)</option>
                          <option value="stretch">Stretch (Fill Canvas Bounds)</option>
                          <option value="center">Center (Original Size)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span>Opacity</span>
                          <span className="font-bold text-blue-600">{Math.round((bgConfig.opacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={bgConfig.opacity ?? 1}
                          onChange={(e) => updateBackground({ opacity: Number(e.target.value) })}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span>Brightness</span>
                          <span className="font-bold text-blue-600">{bgConfig.brightness ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={150}
                          value={bgConfig.brightness ?? 100}
                          onChange={(e) => updateBackground({ brightness: Number(e.target.value) })}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span>Blur</span>
                          <span className="font-bold text-blue-600">{bgConfig.blur ?? 0}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={20}
                          value={bgConfig.blur ?? 0}
                          onChange={(e) => updateBackground({ blur: Number(e.target.value) })}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBackground({ imageUrl: undefined, type: 'solid' })}
                        className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 font-bold min-h-[36px]"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CUSTOM REUSABLE TEMPLATES LIBRARY */}
          {activeLeftTab === 'templates' && (
            <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar text-slate-900">
              <div className="space-y-1">
                <h3 className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                  <span>My Saved Templates ({savedCustomTemplates.length})</span>
                </h3>
                <p className="text-[10px] text-slate-500">
                  Save current design layout as a reusable template for future certificates.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setTemplateSaveTitle(draft.title || 'Custom Certificate Template');
                  setIsSaveTemplateModalOpen(true);
                }}
                className="w-full bg-blue-600 text-white font-bold text-xs shadow-xs min-h-[40px]"
                leftIcon={<Bookmark className="w-4 h-4" />}
              >
                + Save Current Design as Template
              </Button>

              <div className="space-y-2 pt-1">
                {savedCustomTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 hover:border-blue-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 truncate">
                        <span className="font-bold text-xs text-slate-900 block truncate">{t.title}</span>
                        {t.description && <span className="text-[10px] text-slate-500 block truncate">{t.description}</span>}
                      </div>
                      <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                        {t.elements.length} Layers
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleLoadTemplate(t.id)}
                        className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg text-center cursor-pointer"
                      >
                        Use Template
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateCustomTemplate(t.id)}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg text-center cursor-pointer"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingTemplateId(t.id);
                          setRenameTitle(t.title);
                        }}
                        className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[10px] rounded-lg text-center cursor-pointer"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomTemplate(t.id)}
                        className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-[10px] rounded-lg text-center cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: LAYER MANAGER PANEL */}
          {activeLeftTab === 'layers' && (
            <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar">
              <div className="space-y-1">
                <h3 className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                  <span>Layer Management ({draft.elements.length})</span>
                  <span className="text-[9px] text-slate-400 font-mono">Drag or click to order</span>
                </h3>
              </div>

              <div className="space-y-1.5">
                {[...draft.elements].reverse().map((el) => {
                  const isSelected = el.id === selectedElementId;
                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Type className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="font-bold text-xs truncate">{el.label}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => updateElement(el.id, { isVisible: el.isVisible === false ? true : false })}
                          className="p-1 hover:bg-black/10 rounded cursor-pointer"
                        >
                          {el.isVisible === false ? (
                            <EyeOff className="w-3.5 h-3.5 opacity-60" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateElement(el.id, { isLocked: !el.isLocked })}
                          className="p-1 hover:bg-black/10 rounded cursor-pointer"
                        >
                          {el.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <Unlock className="w-3.5 h-3.5 opacity-60" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        )}

        {/* CENTER PANEL: RESPONSIVE CERTIFICATE CANVAS WITH GRID & RESIZE HANDLES */}
        <div className="bg-slate-100/90 border border-slate-200 shadow-2xs rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center overflow-auto min-h-[400px] lg:min-h-[650px] w-full max-w-full pb-20 lg:pb-4">
          <div className="overflow-auto w-full flex justify-center">
            <div
              ref={canvasRef}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                ...getCanvasBgStyle(),
                aspectRatio: draft.canvasSize === 'a4_portrait' ? '0.707' : '1.414',
              }}
              className={`relative max-w-full rounded-2xl border-4 border-slate-900 shadow-2xl transition-all overflow-hidden shrink-0 inline-block w-[960px] ${
                showGrid ? 'bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]' : ''
              }`}
            >
              {/* BACKDROP IMAGE LAYER (ALWAYS LOCKED AS BOTTOM-MOST LAYER) */}
              {bgConfig.type === 'image' && bgConfig.imageUrl && (
                <img
                  src={bgConfig.imageUrl}
                  alt="Certificate Background"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: bgConfig.imageFit === 'stretch' ? 'fill' : bgConfig.imageFit === 'center' ? 'none' : bgConfig.imageFit === 'fit' ? 'contain' : 'cover',
                    objectPosition: `${bgConfig.positionX ?? 50}% ${bgConfig.positionY ?? 50}%`,
                    opacity: bgConfig.opacity ?? 1,
                    filter: `brightness(${bgConfig.brightness ?? 100}%) blur(${bgConfig.blur ?? 0}px)`,
                    transform: `scale(${(bgConfig.scale ?? 100) / 100})`,
                    zIndex: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                />
              )}

              {/* RENDER CANVAS ELEMENTS */}
              {draft.elements
                .filter((el) => el.isVisible !== false)
                .map((el) => {
                  const isSelected = el.id === selectedElementId;
                  const containerHeight = el.height || 50;
                  const isQr = el.placeholderKey === '{{qr_code}}';

                  return (
                    <AutoFitTextContainer
                      key={el.id}
                      text={isQr ? '' : el.text || el.label}
                      maxFontSize={el.fontSize || 24}
                      fontFamily={el.fontFamily || 'Inter'}
                      fontWeight={el.fontWeight || 600}
                      fontStyle={el.fontStyle || 'normal'}
                      fontColor={el.fontColor || '#0F172A'}
                      textAlign={el.textAlign || 'center'}
                      isUnderline={el.isUnderline}
                      letterSpacing={el.letterSpacing}
                      opacity={el.opacity ?? 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(el.id);
                      }}
                      onMouseDown={(e) => handleStartDrag(e, el.id)}
                      style={{
                        position: 'absolute',
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.width}%`,
                        height: `${containerHeight}px`,
                        transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
                        zIndex: el.zIndex || 10,
                      }}
                      className={`cursor-move p-1.5 transition-shadow rounded-lg select-none ${
                        isSelected
                          ? 'border-2 border-dashed border-blue-600 bg-blue-50/20 shadow-lg'
                          : 'hover:border hover:border-dashed hover:border-slate-400'
                      }`}
                    >
                      {el.type === 'image' && el.imageUrl ? (
                        <img src={el.imageUrl} alt={el.label} className="w-full h-full object-contain pointer-events-none" />
                      ) : isQr ? (
                        <div className="p-2 bg-white rounded-xl border border-slate-300 inline-block shadow-2xs">
                          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-[9px]">
                            QR
                          </div>
                        </div>
                      ) : undefined}

                      {/* 8 INTERACTIVE RESIZE HANDLES ON SELECTED CONTAINER */}
                      {isSelected && (
                        <>
                          <div
                            onMouseDown={(e) => handleStartResize(e, el.id, 'nw')}
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-nwse-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, el.id, 'ne')}
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-nesw-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, el.id, 'sw')}
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-nesw-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, el.id, 'se')}
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-nwse-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, el.id, 'n')}
                            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-ns-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, el.id, 's')}
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-ns-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, el.id, 'w')}
                            className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-ew-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, el.id, 'e')}
                            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-ew-resize z-30 hover:scale-125 transition-transform"
                          />
                        </>
                      )}
                    </AutoFitTextContainer>
                  );
                })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: SELECTED ELEMENT PROPERTY INSPECTOR (SLIM 240PX, DESKTOP ONLY) */}
        {!isRightCollapsed && (
          <div className="hidden lg:flex bg-white border border-slate-200 shadow-2xs rounded-2xl p-3 space-y-3 flex-col h-full text-slate-900 w-full lg:w-[240px] shrink-0">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Element Properties</h3>
            {selectedElement && (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold truncate max-w-[120px]">
                {selectedElement.label}
              </span>
            )}
          </div>

          {selectedElement ? (
            <div className="space-y-4 overflow-y-auto hide-scrollbar max-h-[650px] pr-1">
              {selectedElement.type !== 'image' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Text Content
                  </label>
                  <Input
                    value={selectedElement.text || ''}
                    onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                    className="bg-white border-slate-200 text-xs h-9 font-bold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Font Family (25+ Professional Fonts)
                </label>
                <select
                  value={selectedElement.fontFamily || 'Inter'}
                  onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                  className="w-full h-9 px-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                >
                  {PROFESSIONAL_FONTS.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Font Size (px)
                  </label>
                  <span className="text-[10px] font-mono text-blue-600 font-extrabold">
                    {selectedElement.fontSize || 24} px
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        fontSize: Math.max(8, (selectedElement.fontSize || 24) - 2),
                      })
                    }
                    className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl font-extrabold text-slate-700 flex items-center justify-center shrink-0"
                  >
                    -
                  </button>

                  <Input
                    type="number"
                    min={8}
                    max={120}
                    value={selectedElement.fontSize || 24}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { fontSize: Math.max(8, Number(e.target.value) || 8) })
                    }
                    className="bg-white border-slate-200 text-xs h-9 font-bold text-center flex-1"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        fontSize: Math.min(120, (selectedElement.fontSize || 24) + 2),
                      })
                    }
                    className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl font-extrabold text-slate-700 flex items-center justify-center shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => duplicateElement(selectedElement.id)}
                  className="w-full font-semibold min-h-[40px]"
                  leftIcon={<Copy className="w-4 h-4" />}
                >
                  Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteElement(selectedElement.id)}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold min-h-[40px]"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete Layer
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2 my-auto">
              <Move className="w-8 h-8 mx-auto" />
              <p className="text-xs">Click any layer or element on the canvas to edit properties.</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* MOBILE BOTTOM FLOATING BAR (< lg screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          type="button"
          onClick={() => setMobileSheet('fields')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer min-h-[44px] min-w-[44px] ${
            mobileSheet === 'fields' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Fields</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSheet('background')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer min-h-[44px] min-w-[44px] ${
            mobileSheet === 'background' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Bg Style</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSheet('templates')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer min-h-[44px] min-w-[44px] ${
            mobileSheet === 'templates' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Templates</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSheet('text')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer min-h-[44px] min-w-[44px] ${
            mobileSheet === 'text' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Text</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSheet('layers')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer min-h-[44px] min-w-[44px] ${
            mobileSheet === 'layers' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Layers</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSheet('properties')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer min-h-[44px] min-w-[44px] ${
            mobileSheet === 'properties' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Inspector</span>
        </button>
      </div>

      {/* MOBILE BOTTOM SHEET OVERLAY DRAWER */}
      {mobileSheet !== null && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setMobileSheet(null)}
          />

          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl p-4 border-t border-slate-200 max-h-[85vh] overflow-y-auto pb-20 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto" />
              <button
                type="button"
                onClick={() => setMobileSheet(null)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DYNAMIC FIELDS MOBILE SHEET */}
            {mobileSheet === 'fields' && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Dynamic Fields
                </h3>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dynamic fields..."
                  className="bg-white border-slate-200 text-xs h-10"
                />
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {filteredDynamicFields.map((f) => (
                    <div
                      key={f.key}
                      onClick={() => {
                        addDynamicFieldElement(f);
                        setMobileSheet(null);
                      }}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between min-h-[44px]"
                    >
                      <div>
                        <span className="font-bold text-xs block">{f.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">{f.key}</span>
                      </div>
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BACKGROUND MOBILE SHEET */}
            {mobileSheet === 'background' && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-600" /> Certificate Background
                </h3>
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['solid', 'gradient', 'image', 'transparent'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateBackground({ type: t })}
                      className={`py-1.5 rounded-lg font-bold text-[10px] capitalize ${
                        bgConfig.type === t ? 'bg-blue-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {bgConfig.type === 'solid' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgConfig.solidColor || '#FFFFFF'}
                      onChange={(e) => updateBackground({ solidColor: e.target.value })}
                      className="w-12 h-10 rounded-xl border p-1"
                    />
                    <Input
                      value={bgConfig.solidColor || '#FFFFFF'}
                      onChange={(e) => updateBackground({ solidColor: e.target.value })}
                      className="bg-white border-slate-200 font-mono text-xs h-10 font-bold flex-1"
                    />
                  </div>
                )}
              </div>
            )}

            {/* CUSTOM TEMPLATES MOBILE SHEET */}
            {mobileSheet === 'templates' && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Custom Templates ({savedCustomTemplates.length})</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setTemplateSaveTitle(draft.title || 'Custom Certificate Template');
                      setIsSaveTemplateModalOpen(true);
                      setMobileSheet(null);
                    }}
                    className="bg-blue-600 text-white text-[10px] font-bold py-1 px-2.5 h-8"
                  >
                    + Save Design
                  </Button>
                </h3>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {savedCustomTemplates.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                      <span className="font-bold text-xs">{t.title}</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleLoadTemplate(t.id);
                          setMobileSheet(null);
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg min-h-[36px]"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* SAVE CUSTOM TEMPLATE MODAL */}
      {isSaveTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-600" /> Save as Custom Template
              </h3>
              <button
                type="button"
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Template Name *</label>
                <Input
                  value={templateSaveTitle}
                  onChange={(e) => setTemplateSaveTitle(e.target.value)}
                  placeholder="e.g. Modern Executive Gold Certificate"
                  className="bg-white border-slate-200 text-xs font-bold h-10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Description (Optional)</label>
                <Input
                  value={templateSaveDesc}
                  onChange={(e) => setTemplateSaveDesc(e.target.value)}
                  placeholder="e.g. Royal blue theme with gold signatures"
                  className="bg-white border-slate-200 text-xs h-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="font-semibold min-h-[40px]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAsTemplate}
                className="bg-blue-600 text-white font-bold min-h-[40px]"
              >
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME TEMPLATE MODAL */}
      {renamingTemplateId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-sm w-full space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Rename Custom Template</h3>
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              className="bg-white border-slate-200 text-xs font-bold h-10"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setRenamingTemplateId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (renameTitle.trim()) {
                    renameCustomTemplate(renamingTemplateId, renameTitle.trim());
                    setRenamingTemplateId(null);
                    setSaveToast('Template renamed successfully!');
                    setTimeout(() => setSaveToast(null), 3000);
                  }
                }}
                className="bg-blue-600 text-white font-bold"
              >
                Save Rename
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
