import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Search,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Move,
  CheckCircle2,
  FileWarning,
  Sliders,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { PlaceholderKey } from '../../../types/certificate.types';
import { AutoFitTextContainer } from '../components/AutoFitTextContainer';
import {
  useCertificateImageTemplateStore,
  validateAndReadImageFile,
} from '../store/certificate-image-template.store';

export interface OverlayField {
  id: string;
  key: PlaceholderKey;
  label: string;
  sampleValue: string;
  xPercent: number; // 0-100 percentage
  yPercent: number; // 0-100 percentage
  widthPercent: number; // 0-100 percentage
  heightPx?: number; // container height in px (min 20px)
  fontFamily: string;
  fontSize: number; // Max Font Size
  fontWeight?: number; // 300 - 900 font weight
  fontColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  opacity: number;
  rotation: number;
  zIndex: number;
}

export const ImageTemplateDesignerPage: React.FC = () => {
  const navigate = useNavigate();

  // Zustand Store
  const hasHydrated = useCertificateImageTemplateStore((state) => state.hasHydrated);
  const uploadedDesign = useCertificateImageTemplateStore((state) => state.uploadedDesign);
  const setUploadedDesign = useCertificateImageTemplateStore((state) => state.setUploadedDesign);
  const saveTemplateDraft = useCertificateImageTemplateStore((state) => state.saveTemplateDraft);

  // Local Editor State
  const [templateName, setTemplateName] = useState<string>('Photoshop Exported Certificate');
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [fileDimensions, setFileDimensions] = useState<{ width: number; height: number; fileSize: number }>({
    width: 1920,
    height: 1080,
    fileSize: 1024,
  });
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Placed Fields State
  const [placedFields, setPlacedFields] = useState<OverlayField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Panel Collapse & Fullscreen States
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [mobileSheet, setMobileSheet] = useState<'fields' | 'properties' | null>(null);

  useEffect(() => {
    if (selectedFieldId && window.innerWidth < 1024) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileSheet('properties');
    }
  }, [selectedFieldId]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Dynamic Fields (ONLY fields chosen during Certificate Template setup in Step 2)
  const configuredSelectedFields = useMemo(() => {
    if (uploadedDesign?.selectedFields && uploadedDesign.selectedFields.length > 0) {
      return uploadedDesign.selectedFields;
    }
    // Fallback default setup fields if not explicitly specified
    return [
      { id: 'f-1', key: '{{student_name}}' as PlaceholderKey, label: 'Student Full Name', sampleValue: 'Aarav Patel', category: 'Student' },
      { id: 'f-2', key: '{{course_name}}' as PlaceholderKey, label: 'Course Name', sampleValue: 'React 19 & Cloud Architecture', category: 'Course' },
      { id: 'f-3', key: '{{certificate_number}}' as PlaceholderKey, label: 'Certificate Number', sampleValue: 'CERT-2026-8841', category: 'Certificate' },
      { id: 'f-4', key: '{{issue_date}}' as PlaceholderKey, label: 'Issue Date', sampleValue: 'August 5, 2026', category: 'Certificate' },
      { id: 'f-5', key: '{{qr_code}}' as PlaceholderKey, label: 'Verification QR Code', sampleValue: 'https://cubixskill.com/verify/CERT-2026-8841', category: 'Verification' },
    ];
  }, [uploadedDesign?.selectedFields]);

  // Track if local state has been initialized from store to avoid re-initializing loop
  const isInitializedRef = useRef(false);

  // Hydration & Store Restore (Runs ONCE when store hydrations completes)
  useEffect(() => {
    if (hasHydrated && uploadedDesign && !isInitializedRef.current) {
      isInitializedRef.current = true;
      setTemplateName(uploadedDesign.templateName || 'Photoshop Exported Certificate');
      setBgImageUrl(uploadedDesign.previewDataUrl || null);
      setFileDimensions({
        width: uploadedDesign.width || 1920,
        height: uploadedDesign.height || 1080,
        fileSize: uploadedDesign.fileSize || 1024,
      });
      if (uploadedDesign.placedFields && uploadedDesign.placedFields.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlacedFields(uploadedDesign.placedFields);
        setSelectedFieldId(uploadedDesign.placedFields[0].id);
      }
    }
  }, [hasHydrated, uploadedDesign]);

  // Sync edits to Store Draft
  useEffect(() => {
    if (hasHydrated && isInitializedRef.current) {
      useCertificateImageTemplateStore.getState().updateTemplateDraft({
        templateName,
        previewDataUrl: bgImageUrl || undefined,
        placedFields,
      });
    }
  }, [templateName, bgImageUrl, placedFields, hasHydrated]);

  // Dragging / Moving Position State
  const [draggingState, setDraggingState] = useState<{
    fieldId: string;
    startX: number;
    startY: number;
    initialXPercent: number;
    initialYPercent: number;
  } | null>(null);

  const handleStartDrag = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    setSelectedFieldId(fieldId);

    const field = placedFields.find((f) => f.id === fieldId);
    if (!field) return;

    setDraggingState({
      fieldId,
      startX: e.clientX,
      startY: e.clientY,
      initialXPercent: field.xPercent,
      initialYPercent: field.yPercent,
    });
  };

  // Real-time Mouse Drag Moving Effect (xPercent & yPercent)
  useEffect(() => {
    if (!draggingState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const deltaX = e.clientX - draggingState.startX;
      const deltaY = e.clientY - draggingState.startY;

      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;

      const newXPercent = Math.min(98, Math.max(2, Math.round(draggingState.initialXPercent + deltaXPercent)));
      const newYPercent = Math.min(98, Math.max(2, Math.round(draggingState.initialYPercent + deltaYPercent)));

      setPlacedFields((prev) =>
        prev.map((f) => (f.id === draggingState.fieldId ? { ...f, xPercent: newXPercent, yPercent: newYPercent } : f))
      );
    };

    const handleMouseUp = () => {
      setDraggingState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingState]);

  // Resizing State for 8 Handles
  const [resizingState, setResizingState] = useState<{
    fieldId: string;
    direction: 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';
    startX: number;
    startY: number;
    initialWidthPercent: number;
    initialHeightPx: number;
  } | null>(null);

  const handleStartResize = (
    e: React.MouseEvent,
    fieldId: string,
    direction: 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const field = placedFields.find((f) => f.id === fieldId);
    if (!field) return;

    setResizingState({
      fieldId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialWidthPercent: field.widthPercent || 40,
      initialHeightPx: field.heightPx || 50,
    });
  };

  // Real-time Mouse Drag Container Resizing Effect
  useEffect(() => {
    if (!resizingState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizingState.startX;
      const deltaY = e.clientY - resizingState.startY;

      const canvasWidth = canvasRef.current?.clientWidth || 800;
      const deltaWidthPercent = (deltaX / canvasWidth) * 100;

      setPlacedFields((prev) =>
        prev.map((f) => {
          if (f.id !== resizingState.fieldId) return f;

          let newWidth = f.widthPercent;
          let newHeight = f.heightPx || 50;

          const dir = resizingState.direction;

          if (dir.includes('e')) {
            newWidth = Math.max(8, resizingState.initialWidthPercent + deltaWidthPercent * 2);
          } else if (dir.includes('w')) {
            newWidth = Math.max(8, resizingState.initialWidthPercent - deltaWidthPercent * 2);
          }

          if (dir.includes('s')) {
            newHeight = Math.max(20, resizingState.initialHeightPx + deltaY * 2);
          } else if (dir.includes('n')) {
            newHeight = Math.max(20, resizingState.initialHeightPx - deltaY * 2);
          }

          return {
            ...f,
            widthPercent: Math.min(100, Math.max(8, Math.round(newWidth))),
            heightPx: Math.max(20, Math.round(newHeight)),
          };
        })
      );
    };

    const handleMouseUp = () => {
      setResizingState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingState]);

  // Handle Nudge / Drag Key Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedFieldId) return;
      const step = e.shiftKey ? 5 : 1;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPlacedFields((prev) =>
          prev.map((f) => (f.id === selectedFieldId ? { ...f, xPercent: Math.max(0, f.xPercent - step) } : f))
        );
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPlacedFields((prev) =>
          prev.map((f) => (f.id === selectedFieldId ? { ...f, xPercent: Math.min(100, f.xPercent + step) } : f))
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPlacedFields((prev) =>
          prev.map((f) => (f.id === selectedFieldId ? { ...f, yPercent: Math.max(0, f.yPercent - step) } : f))
        );
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPlacedFields((prev) =>
          prev.map((f) => (f.id === selectedFieldId ? { ...f, yPercent: Math.min(100, f.yPercent + step) } : f))
        );
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        setPlacedFields((prev) => prev.filter((f) => f.id !== selectedFieldId));
        setSelectedFieldId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId]);

  // File Upload inside Editor
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditorError(null);
    const res = await validateAndReadImageFile(file);

    if (!res.valid) {
      setEditorError(res.error || 'Invalid image file.');
      return;
    }

    if (res.dataUrl) {
      setBgImageUrl(res.dataUrl);
      setFileDimensions({
        width: res.width || 1920,
        height: res.height || 1080,
        fileSize: file.size,
      });

      // Update Zustand persistent store
      setUploadedDesign({
        templateUuid: uploadedDesign?.templateUuid || `tmpl-${Date.now()}`,
        courseUuid: uploadedDesign?.courseUuid || '550e8400-e29b-41d4-a716-446655440000',
        templateName,
        autoIssueRule: uploadedDesign?.autoIssueRule || 'course_completion',
        fileName: file.name,
        fileType: file.type || 'image/png',
        fileSize: file.size,
        width: res.width || 1920,
        height: res.height || 1080,
        previewDataUrl: res.dataUrl,
        placedFields: placedFields.length > 0 ? placedFields : [],
        selectedFields: configuredSelectedFields,
      });

      setSaveToast('Uploaded certificate design loaded successfully!');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleAddField = (fieldDef: { key: PlaceholderKey; label: string; sampleValue?: string; category?: string }) => {
    const existing = placedFields.find((pf) => pf.key === fieldDef.key);
    if (existing) {
      setSelectedFieldId(existing.id);
      return;
    }

    const newField: OverlayField = {
      id: `f-${crypto.randomUUID()}`,
      key: fieldDef.key,
      label: fieldDef.label,
      sampleValue: fieldDef.sampleValue || fieldDef.label,
      xPercent: 50,
      yPercent: 50,
      widthPercent: 40,
      fontFamily: 'Inter',
      fontSize: 18,
      fontColor: '#0F172A',
      isBold: true,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center',
      letterSpacing: 0,
      lineHeight: 1.2,
      opacity: 1,
      rotation: 0,
      zIndex: placedFields.length + 10,
    };
    setPlacedFields([...placedFields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateSelectedField = (props: Partial<OverlayField>) => {
    if (!selectedFieldId) return;
    setPlacedFields(placedFields.map((f) => (f.id === selectedFieldId ? { ...f, ...props } : f)));
  };

  const handleDuplicateField = () => {
    const selected = placedFields.find((f) => f.id === selectedFieldId);
    if (!selected) return;
    const dup: OverlayField = {
      ...selected,
      id: `f-${Date.now()}`,
      xPercent: Math.min(95, selected.xPercent + 3),
      yPercent: Math.min(95, selected.yPercent + 3),
    };
    setPlacedFields([...placedFields, dup]);
    setSelectedFieldId(dup.id);
  };

  const handleSaveTemplate = () => {
    saveTemplateDraft();
    setSaveToast('Image Template & Field Overlays Saved Successfully!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const filteredFields = configuredSelectedFields.filter(
    (f) => f.label.toLowerCase().includes(searchQuery.toLowerCase()) || f.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedField = placedFields.find((f) => f.id === selectedFieldId);

  // 1. SKELETON LOADING STATE UNTIL STORE HYDRATION COMPLETES
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 space-y-6 font-sans text-left">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] gap-6">
          <Skeleton className="h-[650px] rounded-2xl" />
          <Skeleton className="h-[650px] rounded-2xl" />
          <Skeleton className="h-[650px] rounded-2xl" />
        </div>
      </div>
    );
  }

  // 2. ROUTE GUARD: NO UPLOADED DESIGN FOUND
  if (!uploadedDesign || !uploadedDesign.previewDataUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 font-sans text-left">
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8 max-w-lg w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <FileWarning className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">No Certificate Design Uploaded</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              No artwork has been selected for the Image Template editor. Please upload your high-resolution certificate design (PNG, JPG, or WEBP) exported from Photoshop or Canva.
            </p>
          </div>

          {editorError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {editorError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="md"
              variant="outline"
              onClick={() => navigate('/certificates')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="w-full sm:w-auto font-semibold min-h-[44px]"
            >
              Back to Certificates
            </Button>

            <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer hover:bg-blue-700 min-h-[44px] shadow-xs">
              <Upload className="w-4 h-4" /> Upload Certificate Design
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN EDITOR VIEW
  return (
    <div className="min-h-screen flex flex-col font-sans text-xs text-slate-900 bg-[#F8FAFC] overflow-x-hidden text-left pb-12">
      {/* TOAST NOTIFICATION */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
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
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="bg-white border-slate-200 font-extrabold text-xs text-slate-900 h-10 focus:border-blue-600 flex-1 truncate"
            />
          </div>

          {/* ROW 2: ZOOM CONTROLS & FULL SCREEN */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-1 justify-center">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-700 px-3 select-none">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
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
              onClick={handleSaveTemplate}
              className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold text-xs min-h-[44px] w-full justify-center"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTemplate}
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
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="bg-white border-slate-200 font-extrabold text-xs text-slate-900 h-9 focus:border-blue-600 w-44 sm:w-60 truncate"
              />
              <span className="whitespace-nowrap inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                Image Mode
              </span>
            </div>
          </div>

          {/* CENTER: ZOOM, DIMENSIONS & WORKSPACE TOGGLES */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-700 px-2 select-none">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden xl:flex items-center px-2.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-600 font-bold whitespace-nowrap shrink-0">
              <span>{fileDimensions.width} × {fileDimensions.height} px</span>
            </div>

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

          {/* RIGHT: SAVE DRAFT & PUBLISH */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveTemplate}
              className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold text-xs min-h-[36px] px-3 whitespace-nowrap"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTemplate}
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
          {/* FLOATING GLASSMORPHISM TOOLBAR */}
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white border border-slate-800 rounded-2xl px-5 py-2.5 shadow-2xl flex items-center gap-4">
            <span className="font-extrabold text-xs text-blue-400 truncate max-w-[200px]">{templateName}</span>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-bold text-white px-2">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <button
              type="button"
              onClick={handleSaveTemplate}
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

          {/* LARGE CERTIFICATE ARTWORK IN FULLSCREEN */}
          <div className="overflow-auto w-full h-full flex items-center justify-center pt-16">
            <div
              ref={canvasRef}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
              className="relative max-w-full rounded-2xl border-4 border-slate-800 bg-white shadow-2xl transition-all overflow-hidden shrink-0 inline-block"
            >
              {bgImageUrl && (
                <img
                  src={bgImageUrl}
                  alt="Certificate Artwork"
                  className="w-full max-w-full h-auto object-contain block pointer-events-none select-none"
                  style={{ maxHeight: '85vh' }}
                />
              )}

              {placedFields.map((field) => {
                const isSelected = field.id === selectedFieldId;
                const containerHeight = field.heightPx || 50;
                const isQr = field.key === '{{qr_code}}';

                return (
                  <AutoFitTextContainer
                    key={field.id}
                    text={isQr ? '' : field.sampleValue || field.label}
                    maxFontSize={field.fontSize}
                    fontFamily={field.fontFamily}
                    fontWeight={field.fontWeight || (field.isBold ? 800 : 400)}
                    fontStyle={field.isItalic ? 'italic' : 'normal'}
                    fontColor={field.fontColor}
                    textAlign={field.textAlign}
                    isUnderline={field.isUnderline}
                    letterSpacing={field.letterSpacing}
                    opacity={field.opacity}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFieldId(field.id);
                    }}
                    onMouseDown={(e) => handleStartDrag(e, field.id)}
                    style={{
                      position: 'absolute',
                      left: `${field.xPercent}%`,
                      top: `${field.yPercent}%`,
                      width: `${field.widthPercent}%`,
                      height: `${containerHeight}px`,
                      transform: `translate(-50%, -50%) rotate(${field.rotation}deg)`,
                      zIndex: field.zIndex,
                    }}
                    className={`cursor-move p-1.5 transition-shadow rounded-lg select-none ${
                      isSelected
                        ? 'border-2 border-dashed border-blue-500 bg-blue-500/20 shadow-lg'
                        : 'hover:border hover:border-dashed hover:border-slate-500'
                    }`}
                  >
                    {isQr && (
                      <div className="p-2 bg-white rounded-xl border border-slate-300 inline-block shadow-2xs">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-[9px]">
                          QR
                        </div>
                      </div>
                    )}
                  </AutoFitTextContainer>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* THREE-COLUMN EDITOR STUDIO (SLIM PANELS & MAXIMUM CANVAS AREA) */}
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
        {/* LEFT PANEL: SELECTED DYNAMIC FIELDS (SLIM 220PX, DESKTOP ONLY) */}
        {!isLeftCollapsed && (
          <div className="hidden lg:flex bg-white border border-slate-200 shadow-2xs rounded-2xl p-3 space-y-3 flex-col h-full w-full lg:w-[220px] shrink-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-600" /> Selected Dynamic Fields
              </h3>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {configuredSelectedFields.length} Fields
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Only fields configured during template setup are available to overlay.
            </p>
          </div>

          {/* SEARCH FIELDS */}
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search selected fields..."
              className="bg-white border-slate-200 text-xs pl-8 h-9"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>

          {/* CONFIGURED FIELD PILLS LIST */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 hide-scrollbar max-h-[600px]">
            {filteredFields.map((f) => {
              const isPlaced = placedFields.some((pf) => pf.key === f.key);
              return (
                <div
                  key={f.key}
                  onClick={() => handleAddField(f)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    isPlaced
                      ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{f.label}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                        isPlaced
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {isPlaced ? 'Placed' : 'Click to Place'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">{f.key}</span>
                </div>
              );
            })}
          </div>

          {/* REPLACE BACKGROUND ARTWORK */}
          <label className="p-3 bg-emerald-50 border border-dashed border-emerald-300 rounded-xl cursor-pointer flex items-center justify-between text-emerald-800 hover:bg-emerald-100 min-h-[44px]">
            <span className="font-bold text-xs">Replace Background Artwork</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Upload className="w-4 h-4 text-emerald-600" />
          </label>
        </div>
        )}

        {/* CENTER PANEL: RESPONSIVE IMAGE CANVAS (CONTAIN OBJECT FIT & PERSISTED IMAGE) */}
        <div className="bg-slate-100/80 border border-slate-200 shadow-2xs rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center overflow-auto min-h-[400px] lg:min-h-[600px] w-full max-w-full pb-20 lg:pb-4">
          {editorError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold w-full max-w-md text-center">
              {editorError}
            </div>
          )}

          {bgImageUrl ? (
            <div className="overflow-auto w-full flex justify-center">
              <div
                ref={canvasRef}
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="relative max-w-full rounded-2xl border-4 border-slate-900 bg-white shadow-2xl transition-all overflow-hidden shrink-0 inline-block"
              >
                {/* HIGH-RES BACKGROUND ARTWORK (CONTAIN, NO CROP, NO STRETCH) */}
                <img
                  src={bgImageUrl}
                  alt="Certificate Artwork"
                  className="w-full max-w-full h-auto object-contain block pointer-events-none select-none"
                  style={{ maxHeight: '72vh' }}
                />

                {/* DYNAMIC FIELD PERCENTAGE OVERLAYS (AUTO FONT FIT & RESIZABLE CONTAINER) */}
                {placedFields.map((field) => {
                  const isSelected = field.id === selectedFieldId;
                  const containerHeight = field.heightPx || 50;
                  const isQr = field.key === '{{qr_code}}';

                  return (
                    <AutoFitTextContainer
                      key={field.id}
                      text={isQr ? '' : field.sampleValue || field.label}
                      maxFontSize={field.fontSize}
                      fontFamily={field.fontFamily}
                      fontWeight={field.fontWeight || (field.isBold ? 800 : 400)}
                      fontStyle={field.isItalic ? 'italic' : 'normal'}
                      fontColor={field.fontColor}
                      textAlign={field.textAlign}
                      isUnderline={field.isUnderline}
                      letterSpacing={field.letterSpacing}
                      opacity={field.opacity}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFieldId(field.id);
                      }}
                      onMouseDown={(e) => handleStartDrag(e, field.id)}
                      style={{
                        position: 'absolute',
                        left: `${field.xPercent}%`,
                        top: `${field.yPercent}%`,
                        width: `${field.widthPercent}%`,
                        height: `${containerHeight}px`,
                        transform: `translate(-50%, -50%) rotate(${field.rotation}deg)`,
                        zIndex: field.zIndex,
                      }}
                      className={`cursor-move p-1.5 transition-shadow rounded-lg select-none ${
                        isSelected
                          ? 'border-2 border-dashed border-blue-600 bg-blue-50/20 shadow-lg'
                          : 'hover:border hover:border-dashed hover:border-slate-400'
                      }`}
                    >
                      {isQr && (
                        <div className="p-2 bg-white rounded-xl border border-slate-300 inline-block shadow-2xs">
                          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-[9px]">
                            QR
                          </div>
                        </div>
                      )}

                      {/* 8 INTERACTIVE RESIZE HANDLES ON SELECTED CONTAINER */}
                      {isSelected && (
                        <>
                          {/* CORNERS */}
                          <div
                            onMouseDown={(e) => handleStartResize(e, field.id, 'nw')}
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-nwse-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, field.id, 'ne')}
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-nesw-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, field.id, 'sw')}
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-nesw-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, field.id, 'se')}
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-nwse-resize z-30 hover:scale-125 transition-transform"
                          />

                          {/* EDGES */}
                          <div
                            onMouseDown={(e) => handleStartResize(e, field.id, 'n')}
                            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-ns-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, field.id, 's')}
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-ns-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, field.id, 'w')}
                            className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-ew-resize z-30 hover:scale-125 transition-transform"
                          />
                          <div
                            onMouseDown={(e) => handleStartResize(e, field.id, 'e')}
                            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-ew-resize z-30 hover:scale-125 transition-transform"
                          />
                        </>
                      )}
                    </AutoFitTextContainer>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 p-8 bg-white border border-slate-200 rounded-2xl max-w-md">
              <Upload className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900">Upload Certificate Artwork</h3>
                <p className="text-xs text-slate-500">
                  Upload high-resolution PNG, JPG, or WEBP exported from Photoshop, Canva, or Illustrator.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700 min-h-[44px]">
                Browse File
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: SELECTED FIELD PROPERTY TOOLBAR (SLIM 240PX, DESKTOP ONLY) */}
        {!isRightCollapsed && (
          <div className="hidden lg:flex bg-white border border-slate-200 shadow-2xs rounded-2xl p-3 space-y-3 flex-col h-full text-slate-900 w-full lg:w-[240px] shrink-0">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Field Properties</h3>
            {selectedField && (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold truncate max-w-[120px]">
                {selectedField.label}
              </span>
            )}
          </div>

          {selectedField ? (
            <div className="space-y-4 overflow-y-auto hide-scrollbar max-h-[600px] pr-1">
              {/* FONT FAMILY & SIZE WITH INCREMENT / DECREMENT (+ / -) */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Font Family
                  </label>
                  <select
                    value={selectedField.fontFamily}
                    onChange={(e) => updateSelectedField({ fontFamily: e.target.value })}
                    className="w-full h-9 px-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>

                {/* FONT SIZE WITH +/- INCREASE / DECREASE BUTTONS */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      Font Size (px)
                    </label>
                    <span className="text-[10px] font-mono text-blue-600 font-extrabold">
                      {selectedField.fontSize} px
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedField({ fontSize: Math.max(8, (selectedField.fontSize || 18) - 2) })
                      }
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center font-extrabold text-sm text-slate-700 cursor-pointer min-h-[36px]"
                      title="Decrease Font Size (-2px)"
                    >
                      -
                    </button>

                    <Input
                      type="number"
                      min={8}
                      max={120}
                      value={selectedField.fontSize}
                      onChange={(e) => updateSelectedField({ fontSize: Math.max(8, Number(e.target.value) || 8) })}
                      className="bg-white border-slate-200 text-xs h-9 font-bold text-center flex-1"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedField({ fontSize: Math.min(120, (selectedField.fontSize || 18) + 2) })
                      }
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center font-extrabold text-sm text-slate-700 cursor-pointer min-h-[36px]"
                      title="Increase Font Size (+2px)"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* FONT WEIGHT / BOLDNESS (INCREASE / DECREASE) */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">
                      Font Weight / Boldness
                    </label>
                    <span className="text-[10px] font-mono text-blue-600 font-extrabold">
                      {selectedField.fontWeight || (selectedField.isBold ? 800 : 400)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const current = selectedField.fontWeight || (selectedField.isBold ? 800 : 400);
                        const next = Math.max(300, current - 100);
                        updateSelectedField({ fontWeight: next, isBold: next >= 700 });
                      }}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                      title="Decrease Boldness"
                    >
                      - Lighter
                    </button>

                    <select
                      value={selectedField.fontWeight || (selectedField.isBold ? 800 : 400)}
                      onChange={(e) => {
                        const weight = Number(e.target.value);
                        updateSelectedField({ fontWeight: weight, isBold: weight >= 700 });
                      }}
                      className="flex-1 h-8 rounded-lg bg-white border border-slate-200 text-xs font-bold px-2"
                    >
                      <option value="300">Light (300)</option>
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">SemiBold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">ExtraBold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const current = selectedField.fontWeight || (selectedField.isBold ? 800 : 400);
                        const next = Math.min(900, current + 100);
                        updateSelectedField({ fontWeight: next, isBold: next >= 700 });
                      }}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                      title="Increase Boldness"
                    >
                      + Bolder
                    </button>
                  </div>
                </div>
              </div>

              {/* FORMATTING & COLOR */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Formatting & Color
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const newBold = !selectedField.isBold;
                      updateSelectedField({ isBold: newBold, fontWeight: newBold ? 800 : 400 });
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      selectedField.isBold
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedField({ isItalic: !selectedField.isItalic })}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      selectedField.isItalic
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedField({ isUnderline: !selectedField.isUnderline })}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      selectedField.isUnderline
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <input
                    type="color"
                    value={selectedField.fontColor}
                    onChange={(e) => updateSelectedField({ fontColor: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                </div>
              </div>

              {/* ALIGNMENT */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Alignment
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateSelectedField({ textAlign: 'left' })}
                    className={`py-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                      selectedField.textAlign === 'left'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedField({ textAlign: 'center' })}
                    className={`py-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                      selectedField.textAlign === 'center'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedField({ textAlign: 'right' })}
                    className={`py-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                      selectedField.textAlign === 'right'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CONTAINER DIMENSIONS (WIDTH & HEIGHT RESIZING WITH SLIDERS) */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Container Dimensions
                  </label>
                  <span className="text-[10px] font-mono text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {selectedField.widthPercent}% × {selectedField.heightPx || 50}px
                  </span>
                </div>

                {/* MAX FONT SIZE WITH RANGE SLIDER SCROLLBAR */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">
                      Max Font Size ({selectedField.fontSize} px)
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      type="number"
                      min={8}
                      max={120}
                      value={selectedField.fontSize}
                      onChange={(e) => updateSelectedField({ fontSize: Math.max(8, Number(e.target.value) || 8) })}
                      className="bg-white border-slate-200 text-xs h-8 font-bold w-20 shrink-0"
                    />
                    <input
                      type="range"
                      min="8"
                      max={120}
                      value={selectedField.fontSize}
                      onChange={(e) => updateSelectedField({ fontSize: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* CONTAINER WIDTH SLIDER */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">
                      Container Width ({selectedField.widthPercent} %)
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      type="number"
                      min={8}
                      max={100}
                      value={selectedField.widthPercent}
                      onChange={(e) =>
                        updateSelectedField({ widthPercent: Math.min(100, Math.max(8, Number(e.target.value) || 8)) })
                      }
                      className="bg-white border-slate-200 text-xs h-8 font-bold w-20 shrink-0"
                    />
                    <input
                      type="range"
                      min="8"
                      max={100}
                      value={selectedField.widthPercent}
                      onChange={(e) => updateSelectedField({ widthPercent: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* CONTAINER HEIGHT SLIDER */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">
                      Container Height ({selectedField.heightPx || 50} px)
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      type="number"
                      min={20}
                      max={300}
                      value={selectedField.heightPx || 50}
                      onChange={(e) =>
                        updateSelectedField({ heightPx: Math.max(20, Number(e.target.value) || 20) })
                      }
                      className="bg-white border-slate-200 text-xs h-8 font-bold w-20 shrink-0"
                    />
                    <input
                      type="range"
                      min="20"
                      max={300}
                      value={selectedField.heightPx || 50}
                      onChange={(e) => updateSelectedField({ heightPx: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* PERCENTAGE POSITIONS */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    X Position ({selectedField.xPercent}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedField.xPercent}
                    onChange={(e) => updateSelectedField({ xPercent: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Y Position ({selectedField.yPercent}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedField.yPercent}
                    onChange={(e) => updateSelectedField({ yPercent: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* FIELD ACTIONS */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDuplicateField}
                  className="w-full font-semibold min-h-[40px]"
                  leftIcon={<Copy className="w-4 h-4" />}
                >
                  Duplicate Field
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPlacedFields(placedFields.filter((f) => f.id !== selectedFieldId));
                    setSelectedFieldId(null);
                  }}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold min-h-[40px]"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Remove Field
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2 my-auto">
              <Move className="w-8 h-8 mx-auto" />
              <p className="text-xs">Click any field on the canvas to edit properties.</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* MOBILE BOTTOM FLOATING BAR (< lg screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          type="button"
          onClick={() => setMobileSheet('fields')}
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer min-h-[44px] min-w-[44px] ${
            mobileSheet === 'fields' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Place Fields</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSheet('properties')}
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer min-h-[44px] min-w-[44px] ${
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
            {/* SHEET HEADER & CLOSE BUTTON */}
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
                  <Sparkles className="w-4 h-4 text-blue-600" /> Configured Dynamic Fields
                </h3>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search configured fields..."
                  className="bg-white border-slate-200 text-xs h-10"
                />
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {filteredFields.map((f) => {
                    const isPlaced = placedFields.some((pf) => pf.key === f.key);
                    return (
                      <div
                        key={f.key}
                        onClick={() => {
                          handleAddField(f);
                          setMobileSheet(null);
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer min-h-[44px] ${
                          isPlaced ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs block">{f.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">{f.key}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isPlaced ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>
                          {isPlaced ? 'Placed' : 'Place'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PROPERTIES INSPECTOR MOBILE SHEET */}
            {mobileSheet === 'properties' && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" /> Field Properties
                </h3>
                {selectedField ? (
                  <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                        Font Family
                      </label>
                      <select
                        value={selectedField.fontFamily}
                        onChange={(e) => updateSelectedField({ fontFamily: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Cinzel">Cinzel</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Roboto">Roboto</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPlacedFields(placedFields.filter((f) => f.id !== selectedFieldId));
                          setSelectedFieldId(null);
                          setMobileSheet(null);
                        }}
                        className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 font-bold min-h-[44px]"
                      >
                        Remove Field
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">Tap any dynamic field on the canvas to edit properties.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
