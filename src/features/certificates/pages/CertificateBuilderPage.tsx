import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Save,
  Sliders,
  CheckCircle2,
  Trash2,
  Award,
  Eye,
  Upload,
  UserPlus,
  Copy,
  Layers,
  Maximize2,
  Palette,
  Search,
  ArrowRight,
  ImageIcon,
  Type,
  Check,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronsUp,
  ChevronUp as ArrowUpIcon,
  ChevronDown as ArrowDownIcon,
  ChevronsDown,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { CertificateCanvas } from '../components/CertificateCanvas';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { useCertificateStore } from '../store/certificate.store';
import { useCourseStore } from '../../courses/store/course.store';
import {
  CanvasElement,
  CertificateTemplate,
  CanvasSizeType,
  DynamicFieldItem,
  DEFAULT_AUTO_ISSUE_CONDITIONS,
} from '../../../types/certificate.types';
import { getAvailableFieldsForCourse } from '../services/certificateFieldResolver';
import { AppUnsavedChangesDialog } from '../../../components/ui/app-dialogs/AppUnsavedChangesDialog';

interface BackgroundLibraryItem {
  id: string;
  name: string;
  url: string;
}

const DEFAULT_LIBRARY_IMAGES: BackgroundLibraryItem[] = [
  {
    id: 'bg-gold-frame',
    name: 'Classic Gold Border',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'bg-modern-blue',
    name: 'Modern Navy & Blue',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'bg-minimal-academic',
    name: 'Minimal Crest Border',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
  },
];

let elementIdCounter = 100;
const generateElementId = () => {
  elementIdCounter += 1;
  return `el-node-${elementIdCounter}`;
};

export const CertificateBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { certificateId, courseUuid, courseId } = useParams<{
    certificateId?: string;
    courseUuid?: string;
    courseId?: string;
  }>();

  const activeCourseIdContext = courseUuid || courseId;

  // Stores
  const templates = useCertificateStore((state) => state.templates);
  const addTemplate = useCertificateStore((state) => state.addTemplate);
  const updateTemplate = useCertificateStore((state) => state.updateTemplate);
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);

  const coursesList = Object.values(coursesByUuid);
  const existingTemplate = certificateId ? templates.find((t) => t.id === certificateId) : undefined;

  // Wizard Step State: Step 1 = Course & Fields Selection, Step 2 = Visual Designer
  const [currentStep, setCurrentStep] = useState<1 | 2>(existingTemplate ? 2 : 1);

  // Step 1: Course Selection & Search
  const [selectedCourseUuid, setSelectedCourseUuid] = useState<string>(
    activeCourseIdContext || existingTemplate?.courseUuid || coursesList[0]?.uuid || '550e8400-e29b-41d4-a716-446655440000'
  );
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [fieldSearchQuery, setFieldSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    if (!courseSearchQuery.trim()) return coursesList;
    return coursesList.filter((c) =>
      c.title.toLowerCase().includes(courseSearchQuery.toLowerCase())
    );
  }, [coursesList, courseSearchQuery]);

  const selectedCourse = coursesByUuid[selectedCourseUuid];

  // Available Fields for selected course
  const [customPersonalFields, setCustomPersonalFields] = useState<DynamicFieldItem[]>([]);
  const allAvailableFields = useMemo(() => {
    const derived = getAvailableFieldsForCourse(selectedCourse?.title, selectedCourseUuid);
    return [...derived, ...customPersonalFields];
  }, [selectedCourse, selectedCourseUuid, customPersonalFields]);

  // Selected Field Keys state (Step 1 -> Step 2)
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>(
    existingTemplate
      ? existingTemplate.elements
          .filter((el) => el.type === 'dynamic_field')
          .map((el) => el.fieldKey || '')
          .filter(Boolean)
      : ['student.full_name', 'course.name', 'result.completion_percentage', 'result.overall_percentage']
  );

  // Designer Active Tab (Fields | Images | Canvas)
  const [activeTab, setActiveTab] = useState<'fields' | 'images' | 'canvas'>('fields');

  // Progressive Disclosure Collapsible Sections State in Properties Panel
  const [isTextExpanded, setIsTextExpanded] = useState(true);
  const [isPositionExpanded, setIsPositionExpanded] = useState(false);
  const [isLayerExpanded, setIsLayerExpanded] = useState(false);

  // Canvas Dimensions & Preset State (DEFAULT TRANSPARENT CANVAS)
  const [canvasPreset, setCanvasPreset] = useState<CanvasSizeType>(
    existingTemplate?.canvasSize || 'a4_landscape'
  );
  const [canvasWidth, setCanvasWidth] = useState<number>(
    existingTemplate?.canvasWidth || 1123
  );
  const [canvasHeight, setCanvasHeight] = useState<number>(
    existingTemplate?.canvasHeight || 794
  );
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    existingTemplate?.orientation || 'landscape'
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    existingTemplate?.backgroundColor || 'transparent'
  );

  // Background Library & Background Layer State
  const [imageLibrary, setImageLibrary] = useState<BackgroundLibraryItem[]>(
    DEFAULT_LIBRARY_IMAGES
  );
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<BackgroundLibraryItem | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>(existingTemplate?.backgroundUrl);
  const [bgFit, setBgFit] = useState<'cover' | 'contain'>(existingTemplate?.bgFit || 'cover');
  const [bgPosition, setBgPosition] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>(
    existingTemplate?.bgPosition || 'center'
  );

  const [elements, setElements] = useState<CanvasElement[]>(
    existingTemplate?.elements || [
      {
        id: 'el-1',
        type: 'dynamic_field',
        label: 'Student Full Name',
        fieldKey: 'student.full_name',
        x: 15,
        y: 35,
        width: 70,
        height: 14,
        fontFamily: 'Inter',
        fontSize: 36,
        preferredFontSize: 36,
        minimumFontSize: 16,
        fontWeight: '800',
        fontColor: '#2563EB',
        textAlign: 'center',
        opacity: 1,
        zIndex: 10,
        isLocked: false,
      },
      {
        id: 'el-2',
        type: 'dynamic_field',
        label: 'Course Name',
        fieldKey: 'course.name',
        x: 15,
        y: 55,
        width: 70,
        height: 10,
        fontFamily: 'Inter',
        fontSize: 22,
        preferredFontSize: 22,
        minimumFontSize: 14,
        fontWeight: '600',
        fontColor: '#334155',
        textAlign: 'center',
        opacity: 1,
        zIndex: 10,
        isLocked: false,
      },
    ]
  );

  // Automation & Delivery Settings
  const [autoIssueOnCompletion, setAutoIssueOnCompletion] = useState<boolean>(
    existingTemplate?.autoIssueOnCompletion ?? true
  );
  const [allowStudentDownload, setAllowStudentDownload] = useState<boolean>(
    existingTemplate?.allowStudentDownload ?? false
  );

  // UI State Controls
  const [selectedElementId, setSelectedElementId] = useState<string | null>('el-1');
  const [isPreviewOnly, setIsPreviewOnly] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  // Close course dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCourseDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [isToolsPanelCollapsed, setIsToolsPanelCollapsed] = useState(false);
  const [isAddPersonalFieldOpen, setIsAddPersonalFieldOpen] = useState(false);
  const [newPersonalFieldName, setNewPersonalFieldName] = useState('');
  const [deleteLibraryItemId, setDeleteLibraryItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedElement = useMemo(() => {
    return elements.find((el) => el.id === selectedElementId);
  }, [elements, selectedElementId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset: CanvasSizeType) => {
    setCanvasPreset(preset);
    setIsDirty(true);
    if (preset === 'a4_landscape') {
      setCanvasWidth(1123);
      setCanvasHeight(794);
      setOrientation('landscape');
    } else if (preset === 'a4_portrait') {
      setCanvasWidth(794);
      setCanvasHeight(1123);
      setOrientation('portrait');
    } else if (preset === 'letter') {
      setCanvasWidth(1056);
      setCanvasHeight(816);
      setOrientation('landscape');
    }
  };

  // Toggle Orientation
  const handleToggleOrientation = () => {
    setIsDirty(true);
    setOrientation((prev) => (prev === 'landscape' ? 'portrait' : 'landscape'));
    setCanvasWidth(canvasHeight);
    setCanvasHeight(canvasWidth);
  };

  // Toggle field selection in Step 1
  const toggleFieldSelection = (key: string) => {
    setIsDirty(true);
    setSelectedFieldKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Add Custom Personal Field
  const handleAddPersonalField = () => {
    if (!newPersonalFieldName.trim()) return;
    const slug = newPersonalFieldName.toLowerCase().replace(/\s+/g, '_');
    const key = `student.custom_${slug}`;
    const newField: DynamicFieldItem = {
      key,
      label: newPersonalFieldName.trim(),
      group: 'student',
      sampleValue: 'Sample Custom Value',
      description: 'Instructor created personal detail field',
    };

    setCustomPersonalFields((prev) => [...prev, newField]);
    setSelectedFieldKeys((prev) => [...prev, key]);
    setNewPersonalFieldName('');
    setIsAddPersonalFieldOpen(false);
    showToast(`Added custom personal field "${newField.label}"`);
  };

  // Canvas Element Updates
  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    setIsDirty(true);
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  // Add Dynamic Field to Canvas
  const handleAddFieldToCanvas = (field: DynamicFieldItem, xPercent = 15, yPercent = 40) => {
    setIsDirty(true);
    const newId = generateElementId();
    const newElement: CanvasElement = {
      id: newId,
      type: 'dynamic_field',
      label: field.label,
      fieldKey: field.key,
      x: xPercent,
      y: yPercent,
      width: 70,
      height: 10,
      fontFamily: 'Inter',
      fontSize: 28,
      preferredFontSize: 28,
      minimumFontSize: 14,
      fontWeight: '700',
      fontColor: '#0F172A',
      textAlign: 'center',
      opacity: 1,
      zIndex: 10,
      isLocked: false,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newId);
    if (window.innerWidth < 1024) {
      setIsToolsPanelCollapsed(true);
    }
    showToast(`Added "${field.label}" to canvas`);
  };

  // ADD IMAGE ELEMENT TO CANVAS
  const handleAddImageToCanvas = (url: string, name = 'Image Asset', xPercent = 35, yPercent = 25) => {
    setIsDirty(true);
    const newId = generateElementId();
    const maxZ = elements.reduce((max, el) => Math.max(max, el.zIndex ?? 10), 10);

    const newElement: CanvasElement = {
      id: newId,
      type: 'image',
      label: name,
      imageUrl: url,
      x: xPercent,
      y: yPercent,
      width: 30,
      height: 30,
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '600',
      fontColor: '#000000',
      textAlign: 'center',
      opacity: 1,
      zIndex: maxZ + 1,
      isLocked: false,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newId);
    if (window.innerWidth < 1024) {
      setIsToolsPanelCollapsed(true);
    }
    showToast(`Added image "${name}" to canvas`);
  };

  // UPLOAD IMAGE → ADD TO IMAGE LIBRARY ONLY
  const handleUploadImageToLibrary = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const newItem: BackgroundLibraryItem = {
      id: `img-asset-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, '') || 'Uploaded Asset',
      url,
    };

    setImageLibrary((prev) => [newItem, ...prev]);
    showToast('Uploaded image added to Image Library');
  };

  // EXPLICIT APPLY BACKGROUND TO CANVAS
  const handleApplyBackground = (url: string) => {
    setBackgroundUrl(url);
    setIsDirty(true);
    showToast('Set image as full canvas background');
  };

  // REMOVE BACKGROUND FROM CANVAS
  const handleRemoveBackgroundFromCanvas = () => {
    setBackgroundUrl(undefined);
    setIsDirty(true);
    showToast('Removed background layer from canvas');
  };

  // DELETE IMAGE FROM LIBRARY
  const handleDeleteFromLibraryConfirm = () => {
    if (!deleteLibraryItemId) return;

    const target = imageLibrary.find((item) => item.id === deleteLibraryItemId);
    if (target && backgroundUrl === target.url) {
      setBackgroundUrl(undefined);
    }

    setImageLibrary((prev) => prev.filter((item) => item.id !== deleteLibraryItemId));
    if (selectedLibraryItem?.id === deleteLibraryItemId) {
      setSelectedLibraryItem(null);
    }
    setDeleteLibraryItemId(null);
    showToast('Deleted image from library');
  };

  const handleDeleteElement = (id: string) => {
    setIsDirty(true);
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // DUPLICATE ELEMENT WITH OFFSET
  const handleDuplicateElement = (element: CanvasElement) => {
    setIsDirty(true);
    const newId = generateElementId();
    const dup: CanvasElement = {
      ...element,
      id: newId,
      label: `${element.label} (Copy)`,
      x: Math.min(80, element.x + 4),
      y: Math.min(80, element.y + 4),
      zIndex: (element.zIndex ?? 10) + 1,
    };
    setElements((prev) => [...prev, dup]);
    setSelectedElementId(newId);
    showToast(`Duplicated "${element.label}"`);
  };

  // LAYER REORDERING
  const handleReorderLayer = (id: string, action: 'front' | 'back' | 'forward' | 'backward') => {
    setIsDirty(true);
    setElements((prev) => {
      const target = prev.find((el) => el.id === id);
      if (!target) return prev;

      const currentZ = target.zIndex ?? 10;
      let newZ = currentZ;

      if (action === 'front') {
        const maxZ = prev.reduce((m, el) => Math.max(m, el.zIndex ?? 10), 10);
        newZ = maxZ + 5;
      } else if (action === 'back') {
        newZ = 1;
      } else if (action === 'forward') {
        newZ = currentZ + 1;
      } else if (action === 'backward') {
        newZ = Math.max(1, currentZ - 1);
      }

      return prev.map((el) => (el.id === id ? { ...el, zIndex: newZ } : el));
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const courseTitle = selectedCourse?.title || 'Course';
    const autoTitle = `${courseTitle} Certificate`;

    const templateData: Partial<CertificateTemplate> = {
      courseUuid: selectedCourseUuid,
      title: autoTitle,
      type: 'dynamic_unified',
      status: 'Active',
      autoIssueRule: 'course_completion',
      autoIssueConditions: DEFAULT_AUTO_ISSUE_CONDITIONS,
      autoIssueOnCompletion,
      allowStudentDownload,
      canvasSize: canvasPreset,
      canvasWidth,
      canvasHeight,
      canvasUnit: 'px',
      orientation,
      backgroundColor,
      backgroundUrl,
      bgFit,
      bgPosition,
      elements,
    };

    if (existingTemplate) {
      updateTemplate(existingTemplate.id, templateData);
      showToast('Certificate saved successfully');
    } else {
      const created = addTemplate({
        courseUuid: selectedCourseUuid,
        title: autoTitle,
        type: 'dynamic_unified',
        status: 'Active',
        autoIssueRule: 'course_completion',
        autoIssueConditions: DEFAULT_AUTO_ISSUE_CONDITIONS,
        autoIssueOnCompletion,
        allowStudentDownload,
        canvasSize: canvasPreset,
        canvasWidth,
        canvasHeight,
        canvasUnit: 'px',
        orientation,
        backgroundColor,
        backgroundUrl,
        bgFit,
        bgPosition,
        elements,
      });
      showToast('Certificate created successfully');
      navigate(`/certificates/${created.id}`);
    }

    setIsSubmitting(false);
    setIsDirty(false);
  };

  const backUrl = activeCourseIdContext
    ? `/courses/${activeCourseIdContext}/certificates`
    : '/certificates';

  const breadcrumbs = [
    { label: 'Certificates', url: backUrl },
    { label: existingTemplate ? 'Edit Designer' : 'Create Certificate' },
  ];

  // Group fields into Personal Details vs Course Details
  const personalDetailFields = allAvailableFields.filter((f) => {
    if (f.group === 'student') return true;
    if (fieldSearchQuery.trim()) {
      return f.label.toLowerCase().includes(fieldSearchQuery.toLowerCase()) && f.group === 'student';
    }
    return false;
  });

  const courseDetailFields = allAvailableFields.filter((f) => {
    if (f.group !== 'student') {
      if (fieldSearchQuery.trim()) {
        return f.label.toLowerCase().includes(fieldSearchQuery.toLowerCase());
      }
      return true;
    }
    return false;
  });

  const isContinueDisabled = !selectedCourseUuid || selectedFieldKeys.length === 0;

  // Render Element Properties Panel Content
  const renderPropertiesContent = () => {
    if (!selectedElement) {
      return (
        <div className="py-10 text-center space-y-2">
          <Sliders className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-medium px-4">
            Select an element on the canvas to configure properties.
          </p>
        </div>
      );
    }

    const isField = selectedElement.type === 'dynamic_field';

    return (
      <div className="space-y-4 text-xs font-sans">
        {/* Header & Element Identity Info */}
        <div className="border-b border-slate-100 pb-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-extrabold text-slate-900 leading-snug break-words">
              {selectedElement.label}
            </h4>
            <Badge variant={isField ? 'primary' : 'neutral'} size="sm">
              {isField ? 'Dynamic Field' : 'Image Asset'}
            </Badge>
          </div>

          {/* Compact Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              leftIcon={<Copy className="w-3.5 h-3.5" />}
              onClick={() => handleDuplicateElement(selectedElement)}
            >
              Duplicate
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="text-xs h-8"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => handleDeleteElement(selectedElement.id)}
            >
              Remove
            </Button>
          </div>
        </div>

        {/* SECTION 1: TEXT SETTINGS (For Dynamic Fields Only) */}
        {isField && (
          <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setIsTextExpanded(!isTextExpanded)}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between font-extrabold text-slate-800 text-xs cursor-pointer border-b border-slate-100"
            >
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-600" /> Text Formatting
              </span>
              {isTextExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isTextExpanded && (
              <div className="p-3 space-y-3 bg-white">
                {/* Auto Fit Indicator Header */}
                <div className="flex items-center justify-between bg-blue-50/80 p-2 rounded-lg border border-blue-100/80">
                  <span className="text-[11px] font-extrabold text-blue-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Auto Fit Engine
                  </span>
                  <Badge variant="primary" size="sm">ON</Badge>
                </div>

                {/* Max & Min Font Size (Auto-Fit Range) */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 mb-1">Max Font (px)</label>
                    <input
                      type="number"
                      value={selectedElement.preferredFontSize || selectedElement.fontSize || 32}
                      onChange={(e) =>
                        handleUpdateElement(selectedElement.id, {
                          preferredFontSize: Number(e.target.value),
                          fontSize: Number(e.target.value),
                        })
                      }
                      className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-md font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 mb-1">Min Font (px)</label>
                    <input
                      type="number"
                      value={selectedElement.minimumFontSize || 14}
                      onChange={(e) =>
                        handleUpdateElement(selectedElement.id, {
                          minimumFontSize: Number(e.target.value),
                        })
                      }
                      className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-md font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Alignment Visual Segmented Control */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Alignment</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleUpdateElement(selectedElement.id, { textAlign: 'left' })}
                      className={`h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                        selectedElement.textAlign === 'left' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateElement(selectedElement.id, { textAlign: 'center' })}
                      className={`h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                        (selectedElement.textAlign || 'center') === 'center' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateElement(selectedElement.id, { textAlign: 'right' })}
                      className={`h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                        selectedElement.textAlign === 'right' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Font Family & Color */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Font Family</label>
                    <select
                      value={selectedElement.fontFamily || 'Inter'}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                      className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-md font-semibold text-slate-900"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Playfair Display">Playfair</option>
                      <option value="Cinzel">Cinzel</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Roboto">Roboto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={selectedElement.fontColor || '#0F172A'}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { fontColor: e.target.value })}
                      className="w-full h-8 p-1 bg-white border border-slate-200 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: POSITION & SIZE (Collapsible) */}
        <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setIsPositionExpanded(!isPositionExpanded)}
            className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between font-extrabold text-slate-800 text-xs cursor-pointer border-b border-slate-100"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" /> Position & Dimensions (%)
            </span>
            {isPositionExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isPositionExpanded && (
            <div className="p-3 bg-white">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">X Position (%)</label>
                  <input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Y Position (%)</label>
                  <input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Width (%)</label>
                  <input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { width: Number(e.target.value) })}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Height (%)</label>
                  <input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { height: Number(e.target.value) })}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md font-bold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: OPACITY SLIDER */}
        <div className="p-3 bg-white border border-slate-200/90 rounded-xl space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Opacity</span>
            <span className="font-mono text-[11px] text-slate-500">
              {Math.round((selectedElement.opacity ?? 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={selectedElement.opacity ?? 1}
            onChange={(e) => handleUpdateElement(selectedElement.id, { opacity: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* SECTION 4: LAYER ORDERING (Compact 2x2 Grid) */}
        <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setIsLayerExpanded(!isLayerExpanded)}
            className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between font-extrabold text-slate-800 text-xs cursor-pointer border-b border-slate-100"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Layer Ordering
            </span>
            {isLayerExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isLayerExpanded && (
            <div className="p-3 bg-white">
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-8"
                  leftIcon={<ChevronsUp className="w-3.5 h-3.5 text-blue-600" />}
                  onClick={() => handleReorderLayer(selectedElement.id, 'front')}
                >
                  Front
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-8"
                  leftIcon={<ArrowUpIcon className="w-3.5 h-3.5" />}
                  onClick={() => handleReorderLayer(selectedElement.id, 'forward')}
                >
                  Forward
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-8"
                  leftIcon={<ArrowDownIcon className="w-3.5 h-3.5" />}
                  onClick={() => handleReorderLayer(selectedElement.id, 'backward')}
                >
                  Backward
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-8"
                  leftIcon={<ChevronsDown className="w-3.5 h-3.5" />}
                  onClick={() => handleReorderLayer(selectedElement.id, 'back')}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <FormPageLayout
      title={existingTemplate ? `Edit Certificate — ${selectedCourse?.title}` : 'Create Certificate'}
      subtitle={currentStep === 1 ? 'Step 1: Choose course & fields' : 'Step 2: Visual Designer'}
      backUrl={backUrl}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-4 font-sans text-left max-w-6xl mx-auto px-3 sm:px-6 pb-32 sm:pb-8">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* STEP 1: COURSE SELECTION & DYNAMIC FIELD PICKER */}
        {currentStep === 1 ? (
          <div className="space-y-5 w-full min-w-0">
            {/* Mobile-First Step Header */}
            <div className="flex flex-col space-y-1 border-b border-slate-200 pb-3.5 w-full min-w-0">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Step 1 of 2
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug break-words">
                Choose Course & Fields
              </h1>
              <span className="text-xs font-bold text-slate-500">
                {selectedFieldKeys.length} fields selected
              </span>
            </div>

            {/* 1. SELECT COURSE */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4 w-full min-w-0">
              <div className="border-b border-slate-100 pb-3 space-y-0.5">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600 shrink-0" />
                  Select Course *
                </h2>
                <p className="text-xs text-slate-500">
                  Choose the course this certificate configuration belongs to.
                </p>
              </div>

              {/* Course Search Filter */}
              {coursesList.length > 5 && (
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-w-0"
                  />
                </div>
              )}

              <div ref={courseDropdownRef} className="relative w-full min-w-0">
                {/* Custom Mobile-Responsive Course Select Trigger */}
                <button
                  type="button"
                  disabled={Boolean(activeCourseIdContext)}
                  onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                  className={`w-full min-w-0 h-auto py-3 px-3.5 text-left bg-white border border-slate-200 hover:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all flex items-center justify-between gap-2.5 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed ${
                    isCourseDropdownOpen ? 'ring-2 ring-blue-600/20 border-blue-600' : ''
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words whitespace-normal flex-1 min-w-0">
                    {selectedCourse?.title || 'Select Course...'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isCourseDropdownOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {/* Custom Mobile-Responsive Popover Menu */}
                {isCourseDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto w-full max-w-[calc(100vw-24px)] divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1">
                    {/* Course Search Filter Inside Popover */}
                    {coursesList.length > 5 && (
                      <div className="p-2 sticky top-0 bg-white border-b border-slate-100 z-10">
                        <div className="relative w-full">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search courses..."
                            value={courseSearchQuery}
                            onChange={(e) => setCourseSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                          />
                        </div>
                      </div>
                    )}

                    {/* Option List */}
                    <div className="py-1">
                      {filteredCourses.length === 0 ? (
                        <div className="p-3 text-xs text-slate-400 text-center font-medium">
                          No courses found
                        </div>
                      ) : (
                        filteredCourses.map((c) => {
                          const isSelected = c.uuid === selectedCourseUuid;
                          return (
                            <button
                              key={c.uuid}
                              type="button"
                              onClick={() => {
                                setSelectedCourseUuid(c.uuid);
                                setIsDirty(true);
                                setIsCourseDropdownOpen(false);
                              }}
                              className={`w-full p-3 text-left hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-2.5 transition-colors border-b border-slate-50 last:border-0 ${
                                isSelected
                                  ? 'bg-blue-50/90 text-blue-900 font-extrabold'
                                  : 'text-slate-800 font-medium'
                              }`}
                            >
                              <span className="text-xs sm:text-sm leading-snug break-words whitespace-normal flex-1 min-w-0">
                                {c.title}
                              </span>
                              {isSelected && (
                                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. CHOOSE CERTIFICATE FIELDS */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-5 w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="space-y-0.5">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Choose Certificate Fields
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select the information you want to place on the certificate for "{selectedCourse?.title}".
                  </p>
                </div>

                {/* Field Search Filter */}
                <div className="relative w-full sm:w-64 min-w-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search fields..."
                    value={fieldSearchQuery}
                    onChange={(e) => setFieldSearchQuery(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl min-w-0"
                  />
                </div>
              </div>

              {/* GROUP 1: PERSONAL DETAILS (Checkbox List) */}
              <div className="space-y-3 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold text-blue-600 tracking-wider">
                    1. Personal Details
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit text-xs h-8 px-2.5"
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                    onClick={() => setIsAddPersonalFieldOpen(true)}
                  >
                    Add Personal Field
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
                  {personalDetailFields.map((field) => {
                    const isChecked = selectedFieldKeys.includes(field.key);
                    return (
                      <label
                        key={field.key}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all w-full min-w-0 ${
                          isChecked
                            ? 'border-blue-600 bg-blue-50/60 shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFieldSelection(field.key)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 break-words whitespace-normal leading-snug">
                            {field.label}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-400">
                            Personal Details
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* GROUP 2: COURSE DETAILS */}
              <div className="space-y-3 pt-2 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold text-blue-600 tracking-wider">
                    2. Course Details
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Read-only system fields
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
                  {courseDetailFields.map((field) => {
                    const isChecked = selectedFieldKeys.includes(field.key);
                    const sourceText = field.group === 'assessments' ? 'Assessment Result' : 'Course Details';
                    return (
                      <label
                        key={field.key}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all w-full min-w-0 ${
                          isChecked
                            ? 'border-blue-600 bg-blue-50/60 shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFieldSelection(field.key)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 break-words whitespace-normal leading-snug">
                            {field.label}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-400">
                            {sourceText}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: VISUAL CERTIFICATE DESIGNER */
          <div className="space-y-2.5">
            {/* Top Navigation Header */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 sm:p-3.5 shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-[34px] px-2.5 text-[11px] font-bold text-slate-700 shrink-0"
                  onClick={() => setCurrentStep(1)}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Setup
                </Button>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 border-l border-slate-200 pl-2 truncate leading-tight">
                  Certificate Designer
                </span>
                <span className="text-xs font-semibold text-slate-400 border-l border-slate-200 pl-2 hidden md:inline truncate">
                  Course: <span className="text-blue-600 font-bold">{selectedCourse?.title}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Preview Toggle */}
                <Button
                  variant={isPreviewOnly ? 'primary' : 'outline'}
                  size="sm"
                  className="h-[34px] px-2.5 text-[11px] font-bold"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setIsPreviewOnly(!isPreviewOnly)}
                >
                  {isPreviewOnly ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </div>

            {/* Standard Segmented Tool Switcher Toolbar (One component on mobile with 38px collapse button) */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-1 gap-1.5 w-full h-[38px] sm:h-10">
              <div
                role="tablist"
                aria-label="Certificate designer tools"
                className="grid grid-cols-3 gap-0.5 p-[3px] bg-slate-100/90 rounded-[10px] border border-slate-200/90 w-full h-full min-w-0"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'fields'}
                  onClick={() => {
                    setActiveTab('fields');
                    setIsToolsPanelCollapsed(false);
                  }}
                  className={`w-full h-full rounded-[7px] text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap transition-all ${
                    activeTab === 'fields'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Type className="w-3.5 h-3.5 shrink-0" /> Fields
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'images'}
                  onClick={() => {
                    setActiveTab('images');
                    setIsToolsPanelCollapsed(false);
                  }}
                  className={`w-full h-full rounded-[7px] text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap transition-all ${
                    activeTab === 'images'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 shrink-0" /> Images
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'canvas'}
                  onClick={() => {
                    setActiveTab('canvas');
                    setIsToolsPanelCollapsed(false);
                  }}
                  className={`w-full h-full rounded-[7px] text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap transition-all ${
                    activeTab === 'canvas'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5 shrink-0" /> Canvas
                </button>
              </div>

              {/* Mobile Tool Panel Collapse Toggle (Hidden on desktop) */}
              <button
                type="button"
                onClick={() => setIsToolsPanelCollapsed(!isToolsPanelCollapsed)}
                aria-label={isToolsPanelCollapsed ? 'Expand tools' : 'Collapse tools'}
                className="w-[38px] h-[38px] sm:h-10 rounded-[10px] bg-slate-100/90 border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors shrink-0 cursor-pointer lg:hidden"
              >
                {isToolsPanelCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Main Builder Layout (Left Tools | Center Canvas | Right Properties) */}
            <div className="flex flex-col lg:flex-row items-start gap-4 w-full">
              {/* Left Panel: Tool Content (250px on desktop, collapsible on mobile) */}
              {!isToolsPanelCollapsed && (
                <div className="w-full lg:w-64 shrink-0 space-y-3 transition-all duration-200">
                {/* TAB 1: CERTIFICATE FIELDS PANEL */}
                {activeTab === 'fields' && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs space-y-2.5">
                    <div className="border-b border-slate-100 pb-1.5">
                      <h3 className="text-xs font-bold text-slate-900 tracking-wider">
                        Certificate Fields
                      </h3>
                      <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                        Tap a field to add it to the certificate canvas.
                      </p>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                      {allAvailableFields
                        .filter((f) => selectedFieldKeys.includes(f.key))
                        .map((field) => {
                          const isAlreadyAdded = elements.some(
                            (el) => el.type === 'dynamic_field' && el.fieldKey === field.key
                          );
                          const sourceLabel = field.group === 'student' ? 'Personal Details' : 'Course Details';

                          return (
                            <div
                              key={field.key}
                              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center justify-between gap-2 text-left min-h-[58px]"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-[12px] font-semibold text-slate-900 break-words whitespace-normal leading-snug">
                                  {field.label}
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                                  {sourceLabel}
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={isAlreadyAdded}
                                onClick={() => handleAddFieldToCanvas(field)}
                                className={`h-7 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                                  isAlreadyAdded
                                    ? 'px-2.5 bg-slate-200 text-slate-600 cursor-not-allowed'
                                    : 'w-7 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                                }`}
                                title={isAlreadyAdded ? 'Already added to canvas' : 'Add to canvas'}
                              >
                                {isAlreadyAdded ? (
                                  <span className="flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Added
                                  </span>
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* TAB 2: IMAGE ASSETS LIBRARY */}
                {activeTab === 'images' && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Image Assets
                      </h3>
                      <label className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadImageToLibrary(file);
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1">
                      {imageLibrary.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              'application/image-library',
                              JSON.stringify({ url: item.url, name: item.name })
                            );
                          }}
                          onClick={() => handleAddImageToCanvas(item.url, item.name)}
                          className="relative rounded-xl border border-slate-200 hover:border-blue-500 overflow-hidden cursor-pointer transition-all group aspect-video bg-slate-100/80"
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-contain p-1"
                          />
                          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center">
                            <span className="text-[9px] font-extrabold text-white bg-blue-600 px-2 py-0.5 rounded mb-1">
                              + Add to Canvas
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: CANVAS SIZE & BACKGROUND STYLE */}
                {activeTab === 'canvas' && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3.5">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Canvas Settings
                    </h3>

                    <div>
                      <label htmlFor="presetSelect" className="block text-[11px] font-bold text-slate-700 mb-1">
                        Preset Size
                      </label>
                      <select
                        id="presetSelect"
                        value={canvasPreset}
                        onChange={(e) => handleSelectPreset(e.target.value as CanvasSizeType)}
                        className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="a4_landscape">A4 Landscape (1123 × 794 px)</option>
                        <option value="a4_portrait">A4 Portrait (794 × 1123 px)</option>
                        <option value="letter">Letter Landscape (1056 × 816 px)</option>
                        <option value="custom">Custom Size</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={canvasWidth}
                          onChange={(e) => {
                            setCanvasWidth(Number(e.target.value));
                            setCanvasPreset('custom');
                            setIsDirty(true);
                          }}
                          className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg font-extrabold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={canvasHeight}
                          onChange={(e) => {
                            setCanvasHeight(Number(e.target.value));
                            setCanvasPreset('custom');
                            setIsDirty(true);
                          }}
                          className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg font-extrabold"
                        />
                      </div>
                    </div>

                    {/* Orientation Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-slate-700">Orientation</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={handleToggleOrientation}
                      >
                        {orientation === 'landscape' ? 'Landscape' : 'Portrait'}
                      </Button>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label htmlFor="bgColorSelect" className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-blue-600" />
                        Background Style
                      </label>
                      <select
                        id="bgColorSelect"
                        value={backgroundColor}
                        onChange={(e) => {
                          setBackgroundColor(e.target.value);
                          setIsDirty(true);
                        }}
                        className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="transparent">Transparent (Default - Real Alpha)</option>
                        <option value="#FFFFFF">Solid White (#FFFFFF)</option>
                        <option value="#F8FAFC">Slate Light (#F8FAFC)</option>
                        <option value="#FFFBEB">Cream Gold (#FFFBEB)</option>
                      </select>
                    </div>

                    {/* Optional Full Background Layer Settings */}
                    {backgroundUrl && (
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 text-[11px]">Full Background Layer</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 text-[10px] h-6 px-1.5"
                            onClick={handleRemoveBackgroundFromCanvas}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label htmlFor="fitSelect" className="block text-[10px] font-bold text-slate-600 mb-0.5">Fit Mode</label>
                            <select
                              id="fitSelect"
                              value={bgFit}
                              onChange={(e) => {
                                setBgFit(e.target.value as 'cover' | 'contain');
                                setIsDirty(true);
                              }}
                              className="w-full h-7 px-1.5 bg-white border border-slate-200 rounded text-[10px] font-semibold"
                            >
                              <option value="cover">Fill (Cover)</option>
                              <option value="contain">Fit (Contain)</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="positionSelect" className="block text-[10px] font-bold text-slate-600 mb-0.5">Position</label>
                            <select
                              id="positionSelect"
                              value={bgPosition}
                              onChange={(e) => {
                                setBgPosition(e.target.value as 'center' | 'top' | 'bottom' | 'left' | 'right');
                                setIsDirty(true);
                              }}
                              className="w-full h-7 px-1.5 bg-white border border-slate-200 rounded text-[10px] font-semibold"
                            >
                              <option value="center">Center</option>
                              <option value="top">Top</option>
                              <option value="bottom">Bottom</option>
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Automation & Delivery Rules */}
                    <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Auto-Issue on Completion</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAutoIssueOnCompletion(!autoIssueOnCompletion);
                            setIsDirty(true);
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-extrabold cursor-pointer transition-colors ${
                            autoIssueOnCompletion
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {autoIssueOnCompletion ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Allow Student Download</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAllowStudentDownload(!allowStudentDownload);
                            setIsDirty(true);
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-extrabold cursor-pointer transition-colors ${
                            allowStudentDownload
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {allowStudentDownload ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Center Panel: Certificate Canvas Workspace (Flex 1 Dominant Workspace) */}
              <div className="flex-1 w-full min-w-0 space-y-3">
                <div className="bg-slate-100/90 p-3 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center overflow-hidden">
                  <CertificateCanvas
                    elements={elements}
                    selectedElementId={selectedElementId}
                    onSelectElement={(id) => {
                      setSelectedElementId(id);
                      if (id && window.innerWidth < 1024) {
                        setIsMobileSettingsOpen(true);
                      } else if (!id) {
                        setIsMobileSettingsOpen(false);
                      }
                    }}
                    onUpdateElement={handleUpdateElement}
                    onDropBackgroundImage={handleUploadImageToLibrary}
                    onApplyBackgroundImage={handleApplyBackground}
                    onDropField={(key, label, x, y) =>
                      handleAddFieldToCanvas({ key, label, group: 'course', sampleValue: '' }, x, y)
                    }
                    onDropImageElement={(url, name, x, y) => handleAddImageToCanvas(url, name, x, y)}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    backgroundUrl={backgroundUrl}
                    backgroundColor={backgroundColor}
                    bgFit={bgFit}
                    bgPosition={bgPosition}
                    isEditorMode={true}
                    isPreviewOnly={isPreviewOnly}
                  />
                  <div className="text-[11px] font-semibold text-slate-500 text-center mt-3">
                    Transparent · {canvasWidth} × {canvasHeight} px
                  </div>
                </div>
              </div>

              {/* Right Panel: Selected Element Properties (Desktop - 280px) */}
              <div className="hidden lg:block lg:w-72 shrink-0 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs sticky top-20 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Element Properties
                  </h3>
                  {renderPropertiesContent()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Element Properties Non-Modal Half-Screen Bottom Sheet */}
        <AnimatePresence>
          {isMobileSettingsOpen && selectedElement && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed bottom-16 left-0 right-0 z-40 bg-white rounded-t-2xl border-t border-x border-slate-200 shadow-2xl max-h-[50dvh] flex flex-col font-sans lg:hidden"
            >
              {/* Sticky Handle & Header */}
              <div className="p-3 border-b border-slate-100 bg-white sticky top-0 z-10 flex items-center justify-between shrink-0">
                <div className="flex flex-col min-w-0 flex-1 pr-2">
                  <div className="w-9 h-1 bg-slate-300 rounded-full mx-auto mb-2 shrink-0" />
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {selectedElement.type === 'dynamic_field' ? 'Dynamic Field' : 'Image Asset'}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug truncate">
                        {selectedElement.label}
                      </h4>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileSettingsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                  aria-label="Close properties"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Property Controls */}
              <div className="p-3 overflow-y-auto max-h-[calc(50dvh-56px)] flex-1 space-y-3">
                {renderPropertiesContent()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Image from Library Confirmation Modal */}
        <Modal
          isOpen={Boolean(deleteLibraryItemId)}
          onClose={() => setDeleteLibraryItemId(null)}
          title="Delete Image from Library"
          subtitle="Are you sure you want to delete this image asset from your library?"
        >
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="md" onClick={() => setDeleteLibraryItemId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleDeleteFromLibraryConfirm}>
              Delete Image
            </Button>
          </div>
        </Modal>

        {/* Add Custom Personal Field Modal */}
        <Modal
          isOpen={isAddPersonalFieldOpen}
          onClose={() => setIsAddPersonalFieldOpen(false)}
          title="Add Custom Personal Field"
          subtitle="Create a custom personal student field for certificate generation"
        >
          <div className="space-y-4 font-sans text-left py-2">
            <Input
              label="Field Display Name *"
              placeholder="e.g. Student Registration Number"
              value={newPersonalFieldName}
              onChange={(e) => setNewPersonalFieldName(e.target.value)}
            />
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="ghost" size="md" onClick={() => setIsAddPersonalFieldOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleAddPersonalField}>
                Add Field
              </Button>
            </div>
          </div>
        </Modal>

        {/* Sticky Mobile/Desktop Actions Bar for Step 1 */}
        {currentStep === 1 && (
          <div className="fixed sm:static bottom-16 sm:bottom-0 left-0 right-0 z-30 bg-white border-t sm:border-t-0 border-slate-200 px-3 py-2.5 sm:p-0 shadow-lg sm:shadow-none flex items-center justify-between sm:justify-end gap-2.5 pb-safe max-w-6xl mx-auto">
            <div className="text-xs font-semibold text-slate-600 truncate min-w-0 flex-1 sm:hidden">
              {selectedFieldKeys.length} {selectedFieldKeys.length === 1 ? 'field' : 'fields'} selected
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="h-10 px-3.5 text-xs font-semibold shrink-0"
              disabled={isContinueDisabled}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => {
                if (!isContinueDisabled) {
                  setCurrentStep(2);
                }
              }}
            >
              <span className="sm:hidden">Next</span>
              <span className="hidden sm:inline">Continue to Designer</span>
            </Button>
          </div>
        )}

        {/* Sticky Mobile Actions Bar (Step 2 Designer Only - Hidden when Properties sheet is open on mobile) */}
        {currentStep === 2 && !isMobileSettingsOpen && (
          <div className="fixed sm:static bottom-16 sm:bottom-0 left-0 right-0 z-30 bg-white border-t sm:border-t-0 border-slate-200 p-2.5 sm:p-0 shadow-lg sm:shadow-none grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] sm:flex sm:items-center sm:justify-end gap-2 pb-safe max-w-6xl mx-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="h-10 text-xs font-semibold w-full sm:w-auto sm:px-4"
              onClick={() => {
                if (isDirty) setShowDiscardDialog(true);
                else navigate(backUrl);
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              className="h-10 text-xs font-semibold w-full sm:w-auto sm:min-w-[150px] sm:px-4"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSave}
            >
              Save Certificate
            </Button>
          </div>
        )}

        {/* Unsaved Changes Confirmation Dialog */}
        <AppUnsavedChangesDialog
          isOpen={showDiscardDialog}
          onClose={() => setShowDiscardDialog(false)}
          onConfirmDiscard={() => {
            setShowDiscardDialog(false);
            navigate(backUrl);
          }}
        />
      </div>
    </FormPageLayout>
  );
};
