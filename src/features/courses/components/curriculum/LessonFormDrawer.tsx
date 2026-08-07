import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  X,
  Video,
  Headphones,
  FileText,
  Files,
  AlignLeft,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Code2,
  CircleHelp,
  ClipboardCheck,
  Radio,
  UploadCloud,
  Globe,
  Zap,
  CreditCard,
  AlertTriangle,
  FileCheck,
  Trash2,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { useCourseFeaturesStore } from '../../store/courseFeatures.store';
import { useAssignmentStore } from '../../../assignments/store/assignment.store';
import { AttachAssignmentModal } from './AttachAssignmentModal';
import type {
  CourseLesson,
  LessonType,
  LessonContent,
} from '../../../../types/curriculum.types';

const lessonFormSchema = z.object({
  // Section 1: General Information
  title: z
    .string()
    .min(2, { message: 'Title must be at least 2 characters' })
    .max(120, { message: 'Title cannot exceed 120 characters' }),
  shortDescription: z.string().optional().default(''),
  fullDescription: z.string().optional().default(''),
  type: z.enum([
    'video',
    'audio',
    'pdf',
    'document',
    'text',
    'image',
    'download',
    'external_url',
    'embed',
    'quiz',
    'assignment',
    'live_class',
  ]),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  durationMinutes: z.coerce.number().min(1).default(10),
  isDemo: z.boolean().default(false),
  unlockRule: z.enum([
    'immediate',
    'previous_lesson',
    'previous_module',
    'video_completion',
    'quiz_pass',
    'assignment_approval',
    'specific_date',
    'days_after_enrollment',
    'manual',
  ]),
  unlockDate: z.string().optional().default(''),
  unlockAfterDays: z.coerce.number().optional().default(1),
  thumbnailUrl: z.string().optional().default(''),

  // Video Settings
  videoSourceMode: z.enum(['upload', 'url']).optional().default('upload'),
  videoUrl: z.string().optional().default(''),
  videoDeliveryMode: z.enum(['standard', 'adaptive']).optional().default('standard'),
  preventSkipping: z.boolean().optional().default(true),
  resumePlayback: z.boolean().optional().default(true),
  minimumWatchPercentage: z.coerce.number().optional().default(80),
  autoPlayNext: z.boolean().optional().default(false),
  watermark: z.boolean().optional().default(true),
  allowVideoDownload: z.boolean().optional().default(false),

  // Audio Settings
  audioSourceMode: z.enum(['upload', 'url']).optional().default('upload'),
  audioUrl: z.string().optional().default(''),
  transcript: z.string().optional().default(''),
  allowAudioDownload: z.boolean().optional().default(true),

  // PDF Settings
  pdfSourceMode: z.enum(['upload', 'url']).optional().default('upload'),
  pdfUrl: z.string().optional().default(''),
  allowPdfDownload: z.boolean().optional().default(true),
  openPdfFullScreen: z.boolean().optional().default(false),

  // Document Settings
  docSourceMode: z.enum(['upload', 'url']).optional().default('upload'),
  docUrl: z.string().optional().default(''),
  allowDocDownload: z.boolean().optional().default(true),

  // Text Settings
  textContent: z.string().optional().default(''),

  // Image Settings
  imageSourceMode: z.enum(['upload', 'url']).optional().default('upload'),
  imageUrl: z.string().optional().default(''),
  imageCaption: z.string().optional().default(''),

  // Downloadable Asset Settings
  assetSourceMode: z.enum(['upload', 'url']).optional().default('upload'),
  assetUrl: z.string().optional().default(''),

  // External URL Settings
  externalUrl: z.string().optional().default(''),

  // Embed Settings
  embedCode: z.string().optional().default(''),

  // Quiz Settings
  quizPassingMarks: z.coerce.number().optional().default(70),
  quizMaxAttempts: z.coerce.number().optional().default(3),

  // Assignment Settings
  assignmentTotalMarks: z.coerce.number().optional().default(100),

  // Live Class Settings
  liveMeetingLink: z.string().optional().default(''),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;

interface LessonFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLesson: (
    data: Omit<CourseLesson, 'uuid' | 'courseUuid' | 'moduleUuid' | 'sortOrder' | 'createdAt' | 'updatedAt'>
  ) => void;
  initialLesson?: CourseLesson | null;
}

type FormStep = 'selector' | 'general' | 'content' | 'settings';

export const LessonFormDrawer: React.FC<LessonFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmitLesson,
  initialLesson,
}) => {
  const isEditing = Boolean(initialLesson);
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();
  const courseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures(courseUuid));

  // Current Form Step: 'selector' (Screen 2) vs 'general' | 'content' | 'settings' (Screen 3)
  const [currentStep, setCurrentStep] = useState<FormStep>(isEditing ? 'general' : 'selector');

  // Assignment Attachment State
  const [attachedAssignmentUuid, setAttachedAssignmentUuid] = useState<string | null>(
    (initialLesson?.content as { assignmentUuid?: string } | undefined)?.assignmentUuid || 'assign-101'
  );
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  // Search & Category Chips state for Lesson Type Selector Drawer
  const [selectorSearch, setSelectorSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Content' | 'Assessment' | 'Live' | 'Resources'>('All');

  // File Upload & Credit State
  const [selectedFile, setSelectedFile] = useState<{ name: string; sizeMB: number } | null>({
    name: 'react-19-server-components.mp4',
    sizeMB: 2450,
  });

  const [availableCredits, setAvailableCredits] = useState<number>(12450);

  // Pre-Upload Confirmation Dialog State
  const [pendingUploadFile, setPendingUploadFile] = useState<{
    file: File;
    name: string;
    sizeMB: number;
    creditsRequired: number;
  } | null>(null);

  // Credit Calculations: 100 Credits per 1 GB
  const fileSizeGB = selectedFile ? selectedFile.sizeMB / 1024 : 0;
  const creditsRequired = selectedFile ? Math.ceil((selectedFile.sizeMB / 1024) * 100) : 0;
  const remainingCredits = availableCredits - creditsRequired;
  const isCreditsEnough = remainingCredits >= 0;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: initialLesson?.title || '',
      shortDescription: initialLesson?.description || '',
      fullDescription: '',
      type: initialLesson?.type || 'video',
      status: initialLesson?.status || 'draft',
      durationMinutes: initialLesson?.durationMinutes || 10,
      isDemo: initialLesson?.isDemo || false,
      unlockRule: initialLesson?.unlockRule || 'immediate',
      unlockDate: initialLesson?.unlockDate || '',
      unlockAfterDays: initialLesson?.unlockAfterDays || 1,
      thumbnailUrl: initialLesson?.content?.thumbnailUrl || '',

      videoSourceMode: initialLesson?.content?.videoSource === 'url' ? 'url' : 'upload',
      videoUrl: initialLesson?.content?.videoUrl || '',
      preventSkipping: initialLesson?.content?.preventSkipping ?? true,
      resumePlayback: true,
      allowVideoDownload: initialLesson?.content?.allowDownload || false,

      audioSourceMode: 'upload',
      audioUrl: initialLesson?.content?.fileUrl || '',
      transcript: initialLesson?.content?.transcript || '',
      allowAudioDownload: true,

      pdfSourceMode: 'upload',
      pdfUrl: initialLesson?.content?.fileUrl || '',
      allowPdfDownload: true,
      openPdfFullScreen: false,

      docSourceMode: 'upload',
      docUrl: initialLesson?.content?.fileUrl || '',
      allowDocDownload: true,

      textContent: initialLesson?.content?.textContent || '',

      imageSourceMode: 'upload',
      imageUrl: initialLesson?.content?.fileUrl || '',
      imageCaption: '',

      assetSourceMode: 'upload',
      assetUrl: initialLesson?.content?.fileUrl || '',

      externalUrl: initialLesson?.content?.externalUrl || '',

      embedCode: initialLesson?.content?.embedCode || '',

      quizPassingMarks: 70,
      quizMaxAttempts: 3,

      assignmentTotalMarks: 100,

      liveMeetingLink: initialLesson?.content?.liveClassUrl || '',
    },
  });

  const lessonTypeWatch = watch('type');
  const titleWatch = watch('title') || '';
  const shortDescWatch = watch('shortDescription') || '';

  // Source Mode Watches
  const videoSourceModeWatch = watch('videoSourceMode');
  const videoUrlWatch = watch('videoUrl');

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialLesson ? 'general' : 'selector');
      const mode = initialLesson?.content?.videoSource === 'url' ? 'url' : 'upload';
      reset({
        title: initialLesson?.title || '',
        shortDescription: initialLesson?.description || '',
        fullDescription: '',
        type: initialLesson?.type || 'video',
        status: initialLesson?.status || 'draft',
        durationMinutes: initialLesson?.durationMinutes || 10,
        isDemo: initialLesson?.isDemo || false,
        unlockRule: initialLesson?.unlockRule || 'immediate',
        unlockDate: initialLesson?.unlockDate || '',
        unlockAfterDays: initialLesson?.unlockAfterDays || 1,
        thumbnailUrl: initialLesson?.content?.thumbnailUrl || '',

        videoSourceMode: mode,
        videoUrl: initialLesson?.content?.videoUrl || '',
        preventSkipping: initialLesson?.content?.preventSkipping ?? true,
        resumePlayback: true,
        allowVideoDownload: initialLesson?.content?.allowDownload || false,

        audioSourceMode: 'upload',
        audioUrl: initialLesson?.content?.fileUrl || '',
        transcript: initialLesson?.content?.transcript || '',
        allowAudioDownload: true,

        pdfSourceMode: 'upload',
        pdfUrl: initialLesson?.content?.fileUrl || '',
        allowPdfDownload: true,
        openPdfFullScreen: false,

        docSourceMode: 'upload',
        docUrl: initialLesson?.content?.fileUrl || '',
        allowDocDownload: true,

        textContent: initialLesson?.content?.textContent || '',

        imageSourceMode: 'upload',
        imageUrl: initialLesson?.content?.fileUrl || '',
        imageCaption: '',

        assetSourceMode: 'upload',
        assetUrl: initialLesson?.content?.fileUrl || '',

        externalUrl: initialLesson?.content?.externalUrl || '',

        embedCode: initialLesson?.content?.embedCode || '',

        quizPassingMarks: 70,
        quizMaxAttempts: 3,

        assignmentTotalMarks: 100,

        liveMeetingLink: initialLesson?.content?.liveClassUrl || '',
      });
    }
  }, [isOpen, initialLesson, reset]);

  // URL Validation Helper
  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 12 Supported Lesson Types mapped to Categories & Course Master Features
  const lessonTypesList: {
    id: LessonType;
    label: string;
    icon: React.ElementType;
    desc: string;
    category: 'Content' | 'Assessment' | 'Live' | 'Resources';
    featureKey: keyof typeof courseFeatures;
  }[] = [
    { id: 'video', label: 'Video', icon: Video, desc: 'Upload video or add video URL', category: 'Content', featureKey: 'videoLessons' },
    { id: 'audio', label: 'Audio', icon: Headphones, desc: 'Upload audio or add audio URL', category: 'Content', featureKey: 'audioLessons' },
    { id: 'pdf', label: 'PDF', icon: FileText, desc: 'Upload PDF or add PDF URL', category: 'Content', featureKey: 'pdfLessons' },
    { id: 'document', label: 'Document', icon: Files, desc: 'Upload document or add URL', category: 'Content', featureKey: 'documentLessons' },
    { id: 'text', label: 'Text', icon: AlignLeft, desc: 'Create rich text content', category: 'Content', featureKey: 'textLessons' },
    { id: 'image', label: 'Image', icon: ImageIcon, desc: 'Upload image or add URL', category: 'Content', featureKey: 'imageLessons' },
    { id: 'download', label: 'Downloadable Asset', icon: Download, desc: 'Upload files or add download URL', category: 'Resources', featureKey: 'downloadableAssets' },
    { id: 'external_url', label: 'External URL', icon: ExternalLink, desc: 'Add link to external content', category: 'Resources', featureKey: 'externalUrlLessons' },
    { id: 'embed', label: 'Embed (iFrame)', icon: Code2, desc: 'Embed content using iframe', category: 'Resources', featureKey: 'embedLessons' },
    { id: 'quiz', label: 'Quiz', icon: CircleHelp, desc: 'Create a quiz with questions', category: 'Assessment', featureKey: 'quizzes' },
    { id: 'assignment', label: 'Assignment', icon: ClipboardCheck, desc: 'Create an assignment', category: 'Assessment', featureKey: 'assignments' },
    { id: 'live_class', label: 'Live Class', icon: Radio, desc: 'Schedule or add live class', category: 'Live', featureKey: 'liveClasses' },
  ];

  // Filter selector list based on Search & Category Chips
  const filteredSelectorTypes = lessonTypesList.filter((item) => {
    const matchesSearch = item.label.toLowerCase().includes(selectorSearch.toLowerCase()) || item.desc.toLowerCase().includes(selectorSearch.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const isFeatureOn = Boolean(courseFeatures[item.featureKey]);
    return matchesSearch && matchesCat && isFeatureOn;
  });

  const handleSelectLessonType = (type: LessonType) => {
    setValue('type', type);
    setCurrentStep('general');
  };

  // Handle File Input Selection
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = Math.round(file.size / (1024 * 1024)) || 10;
      const required = Math.ceil((sizeMB / 1024) * 100);
      setPendingUploadFile({
        file,
        name: file.name,
        sizeMB,
        creditsRequired: required,
      });
    }
  };

  const handleConfirmUpload = () => {
    if (!pendingUploadFile) return;
    setSelectedFile({
      name: pendingUploadFile.name,
      sizeMB: pendingUploadFile.sizeMB,
    });
    setAvailableCredits((prev) => Math.max(0, prev - pendingUploadFile.creditsRequired));
    setPendingUploadFile(null);
  };

  const onFormSubmit = (data: LessonFormValues) => {
    const lessonContent: LessonContent = {
      videoSource: data.type === 'video' ? data.videoSourceMode : undefined,
      videoUrl: data.type === 'video' ? data.videoUrl : undefined,
      videoDeliveryMode: data.type === 'video' && data.videoSourceMode === 'upload' ? data.videoDeliveryMode : undefined,
      fileUrl:
        data.type === 'audio'
          ? data.audioUrl
          : data.type === 'pdf'
          ? data.pdfUrl
          : data.type === 'document'
          ? data.docUrl
          : data.type === 'image'
          ? data.imageUrl
          : data.type === 'download'
          ? data.assetUrl
          : undefined,
      externalUrl: data.type === 'external_url' ? data.externalUrl : undefined,
      embedCode: data.type === 'embed' ? data.embedCode : undefined,
      textContent: data.type === 'text' ? data.textContent : undefined,
      allowDownload: data.allowVideoDownload || data.allowAudioDownload || data.allowPdfDownload || data.allowDocDownload,
      thumbnailUrl: data.thumbnailUrl,
      transcript: data.transcript,
      minimumWatchPercentage: data.minimumWatchPercentage,
      preventSkipping: data.preventSkipping,
      liveClassUrl: data.type === 'live_class' ? data.liveMeetingLink : undefined,
    };

    onSubmitLesson({
      title: data.title,
      description: data.shortDescription || '',
      type: data.type,
      status: data.status,
      durationMinutes: data.durationMinutes,
      isDemo: data.isDemo,
      unlockRule: data.unlockRule,
      unlockDate: data.unlockRule === 'specific_date' ? data.unlockDate : undefined,
      unlockAfterDays: data.unlockRule === 'days_after_enrollment' ? data.unlockAfterDays : undefined,
      content: lessonContent,
    });

    onClose();
  };

  // Reusable Content Source Selector Cards UI (Screen 3 format)
  const renderSourceSelector = (
    currentMode: 'upload' | 'url',
    onSelectMode: (mode: 'upload' | 'url') => void
  ) => (
    <div className="space-y-1.5 font-sans">
      <label className="block text-[11px] font-semibold text-[#0F172A]">Content Source</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Option 1: Upload File */}
        <button
          type="button"
          onClick={() => onSelectMode('upload')}
          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
            currentMode === 'upload'
              ? 'bg-blue-50/70 border-[#2563EB] shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-xs font-semibold text-[#0F172A] block leading-tight">Upload File</strong>
            <span className="text-[10px] text-[#64748B]">Upload video file from your device</span>
          </div>
        </button>

        {/* Option 2: External URL */}
        <button
          type="button"
          onClick={() => onSelectMode('url')}
          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
            currentMode === 'url'
              ? 'bg-blue-50/70 border-[#2563EB] shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#64748B] flex items-center justify-center shrink-0 mt-0.5">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-xs font-semibold text-[#0F172A] block leading-tight">External URL</strong>
            <span className="text-[10px] text-[#64748B]">Add video from YouTube, Vimeo, etc.</span>
          </div>
        </button>
      </div>
    </div>
  );

  // Reusable File Upload Box Component (Screen 3 Format)
  const renderUploadBox = (acceptedFormats: string, formatDescription: string) => (
    <div className="space-y-3 pt-1 font-sans">
      {!selectedFile ? (
        <div className="border-2 border-dashed border-[#2563EB]/40 hover:border-[#2563EB] bg-white p-6 rounded-2xl text-center space-y-3 relative cursor-pointer transition-colors">
          <input
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInputChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <UploadCloud className="w-8 h-8 text-[#2563EB] mx-auto" />
          <div>
            <strong className="text-xs font-semibold text-[#0F172A] block">Drag & drop your video here</strong>
            <span className="text-[10px] text-[#64748B] block mt-0.5">or</span>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs px-3 border-[#2563EB] text-[#2563EB] bg-white font-semibold mx-auto">
            Choose File
          </Button>
          <span className="text-[10px] text-[#64748B] block pt-1">{formatDescription}</span>
        </div>
      ) : (
        <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-semibold text-[#0F172A] block truncate max-w-[240px]">
                  {selectedFile.name}
                </strong>
                <span className="text-[10px] text-[#64748B]">
                  {(selectedFile.sizeMB / 1024).toFixed(2)} GB ({selectedFile.sizeMB} MB)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5 text-[#0F172A]">
                <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" /> Storage Credits Required
              </span>
              <Badge variant={isCreditsEnough ? 'success' : 'secondary'} size="sm">
                {isCreditsEnough ? 'Enough Credits' : 'Insufficient'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-[#64748B]">
              <span>File Size ({fileSizeGB.toFixed(2)} GB)</span>
              <strong className="text-[#2563EB] font-bold">{creditsRequired} Credits</strong>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0] font-semibold text-[#0F172A]">
              <span>Remaining Balance</span>
              <strong className={isCreditsEnough ? 'text-emerald-600' : 'text-rose-600'}>
                {remainingCredits.toLocaleString()} Credits
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Reusable External URL Box Component
  const renderUrlBox = (urlValue: string, registerKey: keyof LessonFormValues, placeholder: string, typeLabel: string) => (
    <div className="space-y-3 pt-1 font-sans">
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] font-medium text-[#2563EB] flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#2563EB] shrink-0" /> External URL stream requires <strong>0 Storage Credits</strong>.
        </span>
        {isValidUrl(urlValue) && <Badge variant="success" size="sm" dot>Valid URL</Badge>}
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-[#0F172A]">{typeLabel} External URL</label>
        <Input {...register(registerKey)} placeholder={placeholder} className="w-full h-9 font-normal text-xs" />
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end overflow-hidden font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs transition-opacity"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220, duration: 0.25 }}
          className="relative z-10 w-full sm:max-w-[600px] bg-white h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col overflow-hidden text-left text-xs"
        >
          {/* SCREEN 2: ADD NEW LESSON SELECTOR DRAWER */}
          {currentStep === 'selector' ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-5 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
                <button type="button" onClick={onClose} className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-semibold text-[#0F172A] text-base">Add New Lesson</h3>
                <div className="w-6" />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type="text"
                    value={selectorSearch}
                    onChange={(e) => setSelectorSearch(e.target.value)}
                    placeholder="Search lesson types..."
                    className="w-full h-[42px] pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Category Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
                  {(['All', 'Content', 'Assessment', 'Live', 'Resources'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Lesson Types Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {filteredSelectorTypes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = lessonTypeWatch === t.id;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectLessonType(t.id)}
                        className={`p-3.5 bg-white rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer relative group ${
                          isSelected
                            ? 'border-[#2563EB] bg-blue-50/40 shadow-xs'
                            : 'border-[#E2E8F0] hover:border-[#2563EB] hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="font-semibold text-[#0F172A] text-xs block leading-tight">{t.label}</strong>
                          <span className="text-[10px] text-[#64748B] line-clamp-2 mt-0.5">{t.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* SCREEN 3: MULTI-STEP LESSON FORM DRAWER */
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCurrentStep('selector')} className="p-1 text-[#0F172A] hover:bg-slate-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-semibold text-[#0F172A] text-sm">
                    {isEditing ? 'Edit Lesson' : `Add ${lessonTypeWatch.replace('_', ' ')} Lesson`}
                  </h3>
                </div>
                <button type="button" onClick={onClose} className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer">
                  Save Draft
                </button>
              </div>

              {/* Stepper Bar */}
              <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-around text-xs font-semibold text-[#64748B]">
                <button
                  type="button"
                  onClick={() => setCurrentStep('general')}
                  className={`flex items-center gap-1.5 ${currentStep === 'general' ? 'text-[#2563EB]' : ''}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 'general' ? 'bg-[#2563EB] text-white' : 'bg-slate-200 text-[#0F172A]'
                  }`}>1</span>
                  <span>General</span>
                </button>

                <div className="w-8 h-px bg-slate-200" />

                <button
                  type="button"
                  onClick={() => setCurrentStep('content')}
                  className={`flex items-center gap-1.5 ${currentStep === 'content' ? 'text-[#2563EB]' : ''}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 'content' ? 'bg-[#2563EB] text-white' : 'bg-slate-200 text-[#0F172A]'
                  }`}>2</span>
                  <span>Content</span>
                </button>

                <div className="w-8 h-px bg-slate-200" />

                <button
                  type="button"
                  onClick={() => setCurrentStep('settings')}
                  className={`flex items-center gap-1.5 ${currentStep === 'settings' ? 'text-[#2563EB]' : ''}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 'settings' ? 'bg-[#2563EB] text-white' : 'bg-slate-200 text-[#0F172A]'
                  }`}>3</span>
                  <span>Settings</span>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
                {/* STEP 1: GENERAL */}
                {currentStep === 'general' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="block font-semibold text-[#0F172A]">Lesson Title *</label>
                        <span className="text-[#64748B]">{titleWatch.length}/120</span>
                      </div>
                      <Input
                        {...register('title')}
                        placeholder="Enter lesson title"
                        className={`w-full font-medium text-xs h-10 ${errors.title ? 'border-rose-500' : ''}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="block font-semibold text-[#0F172A]">Short Description</label>
                        <span className="text-[#64748B]">{shortDescWatch.length}/200</span>
                      </div>
                      <textarea
                        {...register('shortDescription')}
                        rows={3}
                        placeholder="Enter short description"
                        className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs resize-none focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    {/* Content Source Selector for Supported Types */}
                    {['video', 'audio', 'pdf', 'document', 'image', 'download'].includes(lessonTypeWatch) && (
                      <div className="space-y-3 pt-2">
                        {renderSourceSelector(
                          videoSourceModeWatch || 'upload',
                          (mode) => setValue('videoSourceMode', mode)
                        )}

                        {videoSourceModeWatch === 'upload' ? (
                          renderUploadBox('video/*', 'Supported: MP4, WebM, MOV, AVI • Max size: 5GB')
                        ) : (
                          renderUrlBox(videoUrlWatch || '', 'videoUrl', 'https://www.youtube.com/watch?v=...', 'Video')
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: CONTENT */}
                {currentStep === 'content' && (
                  <div className="space-y-4">
                    {lessonTypeWatch === 'text' && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-[#0F172A]">Rich Text Article</label>
                        <textarea {...register('textContent')} rows={8} placeholder="Write article content..." className="w-full p-3 border rounded-xl text-xs" />
                      </div>
                    )}
                    {lessonTypeWatch === 'assignment' && (
                      <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] space-y-3">
                        <h4 className="font-semibold text-[#0F172A] text-xs uppercase tracking-wider">Assignment Attachment</h4>
                        {attachedAssignmentUuid ? (
                          <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-[14px] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                                <ClipboardCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-xs font-semibold text-[#0F172A] block">
                                  {useAssignmentStore.getState().assignments.find((a) => a.id === attachedAssignmentUuid)?.title || 'Attached Assignment'}
                                </strong>
                                <span className="text-[11px] text-[#64748B]">
                                  {useAssignmentStore.getState().assignments.find((a) => a.id === attachedAssignmentUuid)?.maxMarks || 100} Marks • Managed in Assignment Module
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAttachModalOpen(true)}
                                className="h-8 text-xs font-semibold border-[#2563EB] text-[#2563EB]"
                              >
                                Change Assignment
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsRemoveConfirmOpen(true)}
                                className="h-8 text-xs font-semibold border-rose-200 text-rose-600 hover:bg-rose-50"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-5 bg-white border border-dashed border-[#E2E8F0] rounded-[14px] text-center space-y-3">
                            <span className="text-xs text-[#64748B] block font-medium">No Assignment Attached</span>
                            <Button
                              type="button"
                              onClick={() => setIsAttachModalOpen(true)}
                              className="h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-5"
                            >
                              Attach Assignment
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: SETTINGS */}
                {currentStep === 'settings' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-[#0F172A]">Lesson Status</label>
                      <select {...register('status')} className="w-full h-9 px-3 border rounded-lg text-xs font-semibold">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-[#0F172A]">Lesson Unlock Rule</label>
                      <select {...register('unlockRule')} className="w-full h-9 px-3 border rounded-lg text-xs font-semibold">
                        <option value="immediate">Unlock Immediately</option>
                        <option value="previous_lesson">Previous Lesson Required</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Footer buttons inside form */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0] shrink-0 sticky bottom-0 bg-white min-h-[44px]">
                  {currentStep === 'general' ? (
                    <>
                      <Button type="button" variant="outline" onClick={onClose} className="h-10 text-xs">
                        Cancel
                      </Button>
                      <Button type="button" onClick={() => setCurrentStep('content')} className="h-10 bg-[#2563EB] text-white text-xs font-semibold">
                        Next: Content &gt;
                      </Button>
                    </>
                  ) : currentStep === 'content' ? (
                    <>
                      <Button type="button" variant="outline" onClick={() => setCurrentStep('general')} className="h-10 text-xs">
                        &lt; Back
                      </Button>
                      <Button type="button" onClick={() => setCurrentStep('settings')} className="h-10 bg-[#2563EB] text-white text-xs font-semibold">
                        Next: Settings &gt;
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button type="button" variant="outline" onClick={() => setCurrentStep('content')} className="h-10 text-xs">
                        &lt; Back
                      </Button>
                      <Button type="submit" className="h-10 bg-[#2563EB] text-white text-xs font-semibold">
                        {isEditing ? 'Update Lesson' : 'Create Lesson'}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>

      {/* PRE-UPLOAD CREDIT CONFIRMATION MODAL */}
      <Modal isOpen={Boolean(pendingUploadFile)} onClose={() => setPendingUploadFile(null)} title="Upload & Deduct Credits">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
            <strong className="text-[13px] font-bold text-[#0F172A] block">{pendingUploadFile?.name}</strong>
            <div className="flex items-center justify-between text-[#64748B] text-[11px]">
              <span>File Size: {((pendingUploadFile?.sizeMB || 0) / 1024).toFixed(2)} GB ({pendingUploadFile?.sizeMB} MB)</span>
              <strong className="text-[#2563EB] font-bold">{pendingUploadFile?.creditsRequired} Credits</strong>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium text-[11px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Uploading this file will deduct <strong>{pendingUploadFile?.creditsRequired} Credits</strong>.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setPendingUploadFile(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpload} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold">
              Upload & Deduct Credits
            </Button>
          </div>
        </div>
      </Modal>
      {/* ATTACH ASSIGNMENT MODAL */}
      <AttachAssignmentModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        courseUuid={courseUuid}
        currentlyAttachedUuid={attachedAssignmentUuid || undefined}
        onSelectAssignment={(assignment) => {
          setAttachedAssignmentUuid(assignment.id);
          setValue('title', assignment.title);
          setValue('shortDescription', assignment.shortDescription);
        }}
      />

      {/* REMOVE ASSIGNMENT CONFIRMATION MODAL */}
      <Modal
        isOpen={isRemoveConfirmOpen}
        onClose={() => setIsRemoveConfirmOpen(false)}
        title="Remove Assignment from this Lesson?"
      >
        <div className="space-y-4 text-xs font-sans text-left">
          <p className="text-[#64748B] font-normal leading-relaxed">
            This will only detach the assignment from this lesson. The Assignment itself will remain available in your academy repository.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setIsRemoveConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAttachedAssignmentUuid(null);
                setIsRemoveConfirmOpen(false);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </AnimatePresence>
  );
};
