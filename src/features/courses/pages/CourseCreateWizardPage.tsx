import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Video,
  Globe,
  Image as ImageIcon,
  AlertTriangle,
  Award,
  MessageSquare,
  Users,
  Radio,
  Sliders,
  HelpCircle,
  Edit3,
  BookOpen,
  X,
  ReceiptIndianRupee,
  User,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Switch } from '../../../components/ui/Switch';
import { useCourseStore } from '../store/course.store';
import { RichTextEditor } from '../components/curriculum/RichTextEditor';
import { SearchableCreateSelect } from '../components/curriculum/SearchableCreateSelect';
import { TagMultiSelect } from '../components/curriculum/TagMultiSelect';
import { DurationPicker } from '../components/curriculum/DurationPicker';
import { useCourseCredit } from '../hooks/useCourseCredit';
import { CourseCreditPopover } from '../components/curriculum/CourseCreditPopover';

const CATEGORY_MAP: Record<string, string[]> = {
  'Web Development': ['React', 'Next.js', 'Angular', 'Vue', 'Node.js', 'Tailwind CSS'],
  Programming: ['Python', 'Java', 'C#', 'PHP', 'Go', 'Rust'],
  Design: ['UI/UX Design', 'Figma', 'Web Design', '3D Motion'],
  Business: ['Product Management', 'Entrepreneurship', 'Sales', 'Finance'],
  Marketing: ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media'],
  'AI & Machine Learning': ['PyTorch', 'TensorFlow', 'LLMs & RAG', 'Prompt Engineering'],
};

const DEFAULT_CATEGORIES = Object.keys(CATEGORY_MAP);
const LANGUAGES = ['English', 'Malayalam', 'Tamil', 'Hindi', 'Arabic', 'French', 'German'];

const wizardSchema = z.object({
  title: z.string().trim().min(3, 'Course title is required (min 3 characters).'),
  shortDescription: z.string().trim().min(10, 'Short description is required (min 10 characters).'),
  fullDescription: z.string().optional(),
  category: z.string().trim().min(1, 'Please select a category.'),
  subcategory: z.string().trim().min(1, 'Please select a subcategory.'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'], {
    message: 'Please select a difficulty level.',
  }),
  language: z.string().trim().min(1, 'Please select a language.'),
  durationHours: z.coerce.number().min(0, 'Hours must be 0 or more.'),
  durationMinutes: z.coerce.number().min(0, 'Minutes must be 0 or more.').max(59, 'Minutes cannot exceed 59.'),
  thumbnailUrl: z.string().optional(),
  promoVideoUrl: z.string().optional(),
  promoVideoMethod: z.enum(['upload', 'embed']).default('embed'),
  visibility: z.enum(['Public', 'Private']).default('Public'),
  isFree: z.boolean().default(false),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to ₹0.'),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('draft'),
  tags: z.array(z.string()).default([]),
});

export type WizardFormValues = z.infer<typeof wizardSchema>;

// Course Features List
interface FeatureOption {
  id: string;
  name: string;
  description: string;
  creditCost: number;
  icon: React.ComponentType<{ className?: string }>;
}

const COURSE_FEATURE_OPTIONS: FeatureOption[] = [
  {
    id: 'lessons',
    name: 'Lessons',
    description: 'Create and manage structured lessons for this course.',
    creditCost: 1.0,
    icon: BookOpen,
  },
  {
    id: 'certificates',
    name: 'Certificates',
    description: 'Automated completion certificates with custom design templates & verification URLs',
    creditCost: 2.0,
    icon: Award,
  },
  {
    id: 'chat_one_on_one',
    name: 'One-to-One Direct Chat',
    description: 'Direct private messaging channel between student and assigned instructor/TA',
    creditCost: 3.0,
    icon: MessageSquare,
  },
  {
    id: 'community_chat',
    name: 'Community Discussions',
    description: 'Collaborative course discussion forum and Q&A threads for enrolled students',
    creditCost: 2.0,
    icon: Users,
  },
  {
    id: 'live_classes',
    name: 'Live Classes',
    description: 'Schedule live interactive video streams & webinar classrooms',
    creditCost: 5.0,
    icon: Radio,
  },
  {
    id: 'quizzes',
    name: 'Assessments & Quizzes',
    description: 'Graded quizzes, multiple-choice questions & auto-evaluated assignments',
    creditCost: 2.0,
    icon: HelpCircle,
  },
  {
    id: 'progress_controls',
    name: 'Progress Controls & Locking',
    description: 'Control lesson access, lock learning progress, and view student progress reports.',
    creditCost: 1.0,
    icon: Sliders,
  },
  {
    id: 'fee_collection',
    name: 'Fee Collection',
    description: 'Collect and manage course-related student fees.',
    creditCost: 0,
    icon: ReceiptIndianRupee,
  },
];

const STEP_FIELDS_MAP: Record<number, (keyof WizardFormValues)[]> = {
  1: ['title', 'shortDescription'],
  2: ['category', 'subcategory', 'language', 'level'],
  3: ['promoVideoUrl'],
  4: [],
  5: ['price'],
  6: ['title', 'shortDescription', 'category', 'subcategory', 'language', 'level', 'price'],
};

export const CourseCreateWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid } = useParams<{ courseUuid?: string }>();

  const addCourse = useCourseStore((state) => state.addCourse);
  const updateCourse = useCourseStore((state) => state.updateCourse);
  const getCourseByUuid = useCourseStore((state) => state.getCourseByUuid);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([
    'lessons',
    'certificates',
    'quizzes',
    'progress_controls',
  ]);
  const [isCreditPopoverOpen, setIsCreditPopoverOpen] = useState(false);

  // Per-student credit service hook
  const { calculateCredits } = useCourseCredit();
  const creditCalcResult = calculateCredits(selectedFeatureIds);

  // Video embed validation state
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null);

  const steps = [
    { id: 1, name: 'Basic Information', shortName: 'Basic' },
    { id: 2, name: 'Classification & Details', shortName: 'Details' },
    { id: 3, name: 'Media', shortName: 'Media' },
    { id: 4, name: 'Course Features', shortName: 'Features' },
    { id: 5, name: 'Pricing & Visibility', shortName: 'Pricing' },
    { id: 6, name: 'Review & Publish', shortName: 'Review' },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      shortDescription: '',
      fullDescription: '',
      category: 'Web Development',
      subcategory: 'React',
      level: 'Beginner',
      language: 'English',
      durationHours: 4,
      durationMinutes: 30,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
      promoVideoUrl: '',
      promoVideoMethod: 'embed',
      visibility: 'Public',
      isFree: false,
      price: 1499,
      status: 'draft',
      tags: ['React', 'TypeScript'],
    },
  });

  // Pre-fill existing draft course data if editing / resuming
  useEffect(() => {
    if (courseUuid) {
      const existing = getCourseByUuid(courseUuid);
      if (existing) {
        reset({
          title: existing.title || '',
          shortDescription: existing.shortDescription || '',
          fullDescription: existing.fullDescription || '',
          category: existing.category || 'Web Development',
          subcategory: existing.subcategory || 'React',
          level: (existing.level as CourseFormValues['level']) || 'Beginner',
          language: existing.language || 'English',
          durationHours: existing.durationHours || 0,
          durationMinutes: existing.durationMinutes || 0,
          thumbnailUrl:
            existing.thumbnailUrl ||
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
          promoVideoUrl: '',
          promoVideoMethod: 'embed',
          visibility: existing.visibility === 'Private' ? 'Private' : 'Public',
          isFree: existing.isFree || false,
          price: existing.price || 0,
          status: (existing.status as CourseFormValues['status']) || 'draft',
          tags: existing.tags || ['React'],
        });
      }
    }
  }, [courseUuid, getCourseByUuid, reset]);

  const watchTitle = watch('title') || '';
  const watchShortDesc = watch('shortDescription') || '';
  const watchFullDesc = watch('fullDescription') || '';
  const watchCategory = watch('category');
  const watchSubcategory = watch('subcategory');
  const watchLevel = watch('level');
  const watchLanguage = watch('language');
  const watchTags = watch('tags') || [];
  const watchDurationHours = watch('durationHours') || 0;
  const watchDurationMinutes = watch('durationMinutes') || 0;
  const watchThumbnail = watch('thumbnailUrl') || '';
  const watchPromoVideoMethod = watch('promoVideoMethod');
  const watchPromoVideoUrl = watch('promoVideoUrl') || '';
  const watchIsFree = watch('isFree');
  const watchPrice = watch('price');
  const watchVisibility = watch('visibility');

  const subcategoryOptions =
    CATEGORY_MAP[watchCategory] || ['General', 'Overview', 'Advanced', 'Specialization'];

  // Smooth Auto-scroll to first invalid element
  const scrollToFirstError = (firstErrorField?: string) => {
    setTimeout(() => {
      let targetEl: HTMLElement | null = null;
      if (firstErrorField) {
        targetEl =
          document.querySelector(`[data-field-name="${firstErrorField}"]`) ||
          document.querySelector(`[name="${firstErrorField}"]`);
      }

      if (!targetEl) {
        targetEl = document.querySelector('[aria-invalid="true"], .border-rose-500');
      }

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = targetEl.querySelector('input, textarea, select, button') || targetEl;
        if (focusable && typeof (focusable as HTMLElement).focus === 'function') {
          (focusable as HTMLElement).focus();
        }
      }
    }, 100);
  };

  // Real-time Embed Video URL Validation
  const validateEmbedVideoUrl = (url: string) => {
    if (!url.trim()) {
      setVideoUrlError(null);
      return true;
    }

    const videoPattern = /(youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.m3u8)/i;
    if (!videoPattern.test(url.trim())) {
      setVideoUrlError('This video URL cannot be embedded. Please enter a valid YouTube, Vimeo, or MP4 URL.');
      return false;
    }

    setVideoUrlError(null);
    return true;
  };

  const handleToggleFeature = (featureId: string) => {
    if (selectedFeatureIds.includes(featureId)) {
      setSelectedFeatureIds(selectedFeatureIds.filter((id) => id !== featureId));
    } else {
      setSelectedFeatureIds([...selectedFeatureIds, featureId]);
    }
  };

  const handleNextStep = async () => {
    // Special embed video check for Step 3
    if (currentStep === 3 && watchPromoVideoMethod === 'embed' && watchPromoVideoUrl) {
      const isVideoValid = validateEmbedVideoUrl(watchPromoVideoUrl);
      if (!isVideoValid) {
        scrollToFirstError('promoVideoUrl');
        return;
      }
    }

    const fieldsToValidate = STEP_FIELDS_MAP[currentStep] || [];
    if (fieldsToValidate.length > 0) {
      const isStepValid = await trigger(fieldsToValidate);
      if (!isStepValid) {
        const firstErr = fieldsToValidate.find((f) => errors[f]);
        showToast('Please fix required fields to continue.');
        scrollToFirstError(firstErr);
        return;
      }
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    const currentValues = watch();

    if (courseUuid) {
      updateCourse(courseUuid, {
        title: currentValues.title || 'Untitled Course Draft',
        shortDescription: currentValues.shortDescription || '',
        fullDescription: currentValues.fullDescription || '',
        category: currentValues.category || 'Web Development',
        subcategory: currentValues.subcategory || 'React',
        level: currentValues.level || 'Beginner',
        language: currentValues.language || 'English',
        durationHours: currentValues.durationHours || 0,
        durationMinutes: currentValues.durationMinutes || 0,
        visibility: currentValues.visibility || 'Public',
        tags: currentValues.tags || ['React'],
        status: 'draft',
        isFree: currentValues.isFree || false,
        price: currentValues.isFree ? 0 : currentValues.price || 0,
      });
      showToast('Draft saved successfully.');
    } else {
      const created = addCourse({
        title: currentValues.title || 'Untitled Course Draft',
        shortDescription: currentValues.shortDescription || '',
        fullDescription: currentValues.fullDescription || '',
        thumbnailUrl:
          currentValues.thumbnailUrl ||
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
        category: currentValues.category || 'Web Development',
        subcategory: currentValues.subcategory || 'React',
        level: currentValues.level || 'Beginner',
        language: currentValues.language || 'English',
        durationHours: currentValues.durationHours || 0,
        durationMinutes: currentValues.durationMinutes || 0,
        visibility: currentValues.visibility || 'Public',
        tags: currentValues.tags || ['React'],
        instructorName: 'Dr. Rajesh Varma',
        status: 'draft',
        creditsPerStudent: 15,
        isFree: currentValues.isFree || false,
        price: currentValues.isFree ? 0 : currentValues.price || 0,
        slug: '',
      });
      showToast('Draft saved.');
      navigate(`/courses/${created.uuid}/edit`);
    }
  };

  const onFinalSubmit: SubmitHandler<WizardFormValues> = async (data) => {
    // Validate embed video URL if selected
    if (data.promoVideoMethod === 'embed' && data.promoVideoUrl) {
      const isVideoValid = validateEmbedVideoUrl(data.promoVideoUrl);
      if (!isVideoValid) {
        setCurrentStep(3);
        scrollToFirstError('promoVideoUrl');
        return;
      }
    }

    const isFullValid = await trigger();
    if (!isFullValid) {
      // Find step containing the first error
      const firstErrField = (Object.keys(errors) as (keyof WizardFormValues)[]).find((f) => errors[f]);

      let targetStep = 1;
      if (['title', 'shortDescription'].includes(firstErrField || '')) targetStep = 1;
      else if (['category', 'subcategory', 'language', 'level'].includes(firstErrField || '')) targetStep = 2;
      else if (['promoVideoUrl'].includes(firstErrField || '')) targetStep = 3;
      else if (['price'].includes(firstErrField || '')) targetStep = 5;

      setCurrentStep(targetStep);
      showToast('Please fix required fields before publishing.');
      scrollToFirstError(firstErrField);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (courseUuid) {
        updateCourse(courseUuid, {
          title: data.title || 'Untitled Course',
          shortDescription: data.shortDescription || '',
          fullDescription: data.fullDescription || '',
          thumbnailUrl:
            data.thumbnailUrl ||
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
          category: data.category || 'Web Development',
          subcategory: data.subcategory || 'React',
          level: data.level || 'Beginner',
          language: data.language || 'English',
          durationHours: data.durationHours || 0,
          durationMinutes: data.durationMinutes || 0,
          visibility: data.visibility || 'Public',
          tags: data.tags || ['React'],
          instructorName: 'Dr. Rajesh Varma',
          status: 'published',
          isFree: data.isFree || false,
          price: data.isFree ? 0 : data.price,
        });

        setIsSubmitting(false);
        showToast('Course published successfully!');
        navigate(`/courses/${courseUuid}/overview`);
      } else {
        const created = addCourse({
          title: data.title || 'Untitled Course',
          shortDescription: data.shortDescription || '',
          fullDescription: data.fullDescription || '',
          thumbnailUrl:
            data.thumbnailUrl ||
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
          category: data.category || 'Web Development',
          subcategory: data.subcategory || 'React',
          level: data.level || 'Beginner',
          language: data.language || 'English',
          durationHours: data.durationHours || 0,
          durationMinutes: data.durationMinutes || 0,
          visibility: data.visibility || 'Public',
          tags: data.tags || ['React'],
          instructorName: 'Dr. Rajesh Varma',
          status: 'published',
          creditsPerStudent: 15,
          isFree: data.isFree || false,
          price: data.isFree ? 0 : data.price,
          slug: '',
        });

        setIsSubmitting(false);
        showToast('Course published successfully!');
        navigate(`/courses/${created.uuid}/overview`);
      }
    }, 400);
  };

  const hasStepErrors = Boolean(
    STEP_FIELDS_MAP[currentStep]?.some((f) => Boolean(errors[f]))
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 text-left font-sans pb-28 sm:pb-16 no-scrollbar">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-0.5 hover:bg-slate-700 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER & TOP BAR */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
          <Link to="/courses" className="hover:text-[#0F172A] transition-colors">
            Courses
          </Link>
          <span>›</span>
          <span className="text-[#0F172A] font-semibold">
            {courseUuid ? 'Edit Course Wizard' : 'Create Course Wizard'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              {courseUuid ? 'Edit Course Setup' : 'Create New Course'}
            </h1>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Step-by-step progressive course configuration wizard.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="h-9 sm:h-10 px-3.5 bg-white border-[#E2E8F0] text-[#0F172A] text-xs font-semibold cursor-pointer"
            >
              Save Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/courses')}
              className="h-9 sm:h-10 px-3.5 bg-white border-[#E2E8F0] text-[#0F172A] text-xs font-semibold cursor-pointer"
            >
              Exit
            </Button>
          </div>
        </div>

        {/* STEPPER PROGRESS INDICATOR */}
        <div className="bg-white p-3 sm:p-4 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#0F172A]">
              Step {currentStep} of 6 — <span className="text-[#2563EB]">{steps[currentStep - 1].name}</span>
            </span>
            <span className="text-[#64748B] font-semibold">{Math.round((currentStep / 6) * 100)}% Complete</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex gap-1 p-0.5">
            {steps.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  if (completedSteps.includes(s.id) || s.id < currentStep) {
                    setCurrentStep(s.id);
                  }
                }}
                className={`h-full flex-1 rounded-full transition-all cursor-pointer ${s.id === currentStep
                    ? 'bg-[#2563EB]'
                    : s.id < currentStep
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                title={s.name}
              />
            ))}
          </div>

          {/* Desktop Step Pills */}
          <div className="hidden sm:flex items-center justify-between pt-1 text-[11px] font-semibold text-[#64748B]">
            {steps.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (completedSteps.includes(s.id) || s.id < currentStep) {
                    setCurrentStep(s.id);
                  }
                }}
                className={`hover:text-[#0F172A] transition-colors cursor-pointer ${s.id === currentStep ? 'text-[#2563EB] font-bold' : ''
                  }`}
              >
                {s.id}. {s.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Step Error Banner */}
        {hasStepErrors && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Please fix the highlighted fields on this step before continuing.</span>
            </div>
            <button
              type="button"
              onClick={() => scrollToFirstError()}
              className="text-[11px] font-bold text-rose-700 underline cursor-pointer shrink-0"
            >
              Go to first error
            </button>
          </div>
        )}
      </div>

      {/* WIZARD FORM */}
      <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-6">
        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <Card padding="lg" className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">Step 1: Basic Information</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Provide the essential title and descriptions for your course.</p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1" data-field-name="title">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#0F172A]">Course Title *</label>
                  <span className="text-[#64748B] text-[11px]">{watchTitle.length}/120</span>
                </div>
                <Input
                  {...register('title')}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? 'title-error' : undefined}
                  placeholder="e.g. Fullstack React 19 & TypeScript Masterclass"
                  className={`w-full text-xs sm:text-sm h-10 ${errors.title ? 'border-rose-500 ring-1 ring-rose-500/20 bg-rose-50/10' : ''
                    }`}
                />
                {errors.title && (
                  <p id="title-error" className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{errors.title.message}</span>
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-1" data-field-name="shortDescription">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#0F172A]">Short Description *</label>
                  <span className="text-[#64748B] text-[11px]">{watchShortDesc.length}/300</span>
                </div>
                <textarea
                  {...register('shortDescription')}
                  aria-invalid={Boolean(errors.shortDescription)}
                  aria-describedby={errors.shortDescription ? 'shortDescription-error' : undefined}
                  rows={2}
                  placeholder="A clear, 1-2 sentence summary of what students will learn..."
                  className={`w-full p-3 bg-white border rounded-xl text-xs sm:text-sm font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB] resize-none ${errors.shortDescription
                      ? 'border-rose-500 ring-1 ring-rose-500/20 bg-rose-50/10'
                      : 'border-[#E2E8F0]'
                    }`}
                />
                {errors.shortDescription && (
                  <p id="shortDescription-error" className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{errors.shortDescription.message}</span>
                  </p>
                )}
              </div>

              {/* Full Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F172A]">Full Description (Rich Text)</label>
                <RichTextEditor
                  value={watchFullDesc}
                  onChange={(val) => setValue('fullDescription', val, { shouldValidate: true, shouldDirty: true })}
                  placeholder="Comprehensive course syllabus, learning goals, prerequisites, and target audience..."
                  minHeight="min-h-[160px]"
                  name="fullDescription"
                />
              </div>
            </div>
          </Card>
        )}

        {/* STEP 2: CLASSIFICATION & DETAILS */}
        {currentStep === 2 && (
          <Card padding="lg" className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">Step 2: Classification & Details</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Categorize your course, set skill level, language, and tags.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableCreateSelect
                label="Category *"
                name="category"
                options={categoryList}
                value={watchCategory}
                onChange={(val) => {
                  setValue('category', val, { shouldValidate: true, shouldDirty: true });
                  trigger('category');
                  const newSubs = CATEGORY_MAP[val] || ['General'];
                  setValue('subcategory', newSubs[0], { shouldValidate: true, shouldDirty: true });
                  trigger('subcategory');
                }}
                onAddNewOption={(newCat) => setCategoryList([...categoryList, newCat])}
                placeholder="Search or add category..."
                error={errors.category?.message}
              />

              <SearchableCreateSelect
                label="Subcategory *"
                name="subcategory"
                options={subcategoryOptions}
                value={watchSubcategory}
                onChange={(val) => {
                  setValue('subcategory', val, { shouldValidate: true, shouldDirty: true });
                  trigger('subcategory');
                }}
                placeholder="Search or add subcategory..."
                error={errors.subcategory?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1" data-field-name="level">
                <label className="block text-xs font-semibold text-[#0F172A]">Difficulty Level *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setValue('level', lvl as CourseFormValues['level'], { shouldValidate: true, shouldDirty: true });
                        trigger('level');
                      }}
                      className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${watchLevel === lvl
                          ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100'
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                {errors.level && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{errors.level.message}</span>
                  </p>
                )}
              </div>

              <SearchableCreateSelect
                label="Primary Language *"
                name="language"
                options={LANGUAGES}
                value={watchLanguage}
                onChange={(val) => {
                  setValue('language', val, { shouldValidate: true, shouldDirty: true });
                  trigger('language');
                }}
                placeholder="Select course language..."
                error={errors.language?.message}
              />
            </div>

            <div className="pt-2">
              <TagMultiSelect
                selectedTags={watchTags}
                onChange={(tags) => setValue('tags', tags, { shouldValidate: true, shouldDirty: true })}
                label="Course Tags & Topics"
              />
            </div>

            <div className="pt-2">
              <DurationPicker
                hours={watchDurationHours}
                minutes={watchDurationMinutes}
                onHoursChange={(h) => setValue('durationHours', h, { shouldValidate: true, shouldDirty: true })}
                onMinutesChange={(m) => setValue('durationMinutes', m, { shouldValidate: true, shouldDirty: true })}
              />
            </div>
          </Card>
        )}

        {/* STEP 3: MEDIA */}
        {currentStep === 3 && (
          <Card padding="lg" className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">Step 3: Course Media</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Upload a cover thumbnail and configure promo video.</p>
            </div>

            {/* Course Thumbnail */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#0F172A]">Course Cover Thumbnail</label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-4 aspect-video bg-slate-100 rounded-xl overflow-hidden border border-[#E2E8F0] relative group">
                  {watchThumbnail ? (
                    <img src={watchThumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#64748B]">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[11px]">No Thumbnail</span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-8 space-y-2">
                  <Input
                    value={watchThumbnail}
                    onChange={(e) => setValue('thumbnailUrl', e.target.value)}
                    placeholder="Paste image URL or choose upload..."
                    className="w-full text-xs h-10"
                  />
                  <div className="p-3 border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] bg-[#F8FAFC] rounded-xl text-center cursor-pointer transition-colors">
                    <span className="text-xs font-semibold text-[#2563EB]">Click to Upload Image</span>
                    <span className="text-[11px] text-[#64748B] block">Recommended size: 1280 × 720 (16:9)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Video */}
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#0F172A]">Promo Video Trailer</label>
                <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setValue('promoVideoMethod', 'embed')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${watchPromoVideoMethod === 'embed'
                        ? 'bg-white text-[#2563EB] shadow-2xs'
                        : 'text-[#64748B]'
                      }`}
                  >
                    Embed URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('promoVideoMethod', 'upload')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${watchPromoVideoMethod === 'upload'
                        ? 'bg-white text-[#2563EB] shadow-2xs'
                        : 'text-[#64748B]'
                      }`}
                  >
                    Upload Media
                  </button>
                </div>
              </div>

              {watchPromoVideoMethod === 'embed' ? (
                <div className="space-y-1.5" data-field-name="promoVideoUrl">
                  <Input
                    value={watchPromoVideoUrl}
                    onChange={(e) => {
                      setValue('promoVideoUrl', e.target.value, { shouldValidate: true, shouldDirty: true });
                      validateEmbedVideoUrl(e.target.value);
                    }}
                    aria-invalid={Boolean(videoUrlError)}
                    placeholder="https://www.youtube.com/watch?v=... or Vimeo URL"
                    className={`w-full text-xs h-10 ${videoUrlError ? 'border-rose-500 ring-1 ring-rose-500/20 bg-rose-50/10' : ''}`}
                  />
                  {videoUrlError ? (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{videoUrlError}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#64748B]">Supports YouTube, Vimeo, or direct MP4/M3U8 URLs.</p>
                  )}
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] bg-[#F8FAFC] rounded-xl text-center space-y-2 transition-colors">
                  <Video className="w-6 h-6 text-[#2563EB] mx-auto" />
                  <div>
                    <strong className="text-xs font-semibold text-[#0F172A] block">Upload Video File</strong>
                    <span className="text-[11px] text-[#64748B]">MP4, MOV, or WEBM up to 2GB</span>
                  </div>
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[#2563EB] text-[11px] font-medium max-w-md mx-auto">
                    Note: Uploaded promo media uses your Academy storage allocation.
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* STEP 4: COURSE FEATURES */}
        {currentStep === 4 && (
          <Card padding="lg" className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">Step 4: Course Features</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Enable learning capabilities and student engagement tools for this course.
                </p>
              </div>

              {/* Compact Per-Student Credit Indicator */}
              <div className="relative self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsCreditPopoverOpen(!isCreditPopoverOpen)}
                  className="h-7 px-2.5 bg-amber-50 hover:bg-amber-100/80 text-amber-900 text-[11px] font-semibold rounded-lg border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer w-fit shrink-0 shadow-2xs"
                  title="View per-student credit breakdown"
                >
                  <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{creditCalcResult.totalCreditsPerStudent} Credits / Student</span>
                </button>

                {/* Credit Info Popover Modal */}
                <CourseCreditPopover
                  isOpen={isCreditPopoverOpen}
                  onClose={() => setIsCreditPopoverOpen(false)}
                  calculation={creditCalcResult}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {COURSE_FEATURE_OPTIONS.map((feat) => {
                const Icon = feat.icon;
                const isSelected = selectedFeatureIds.includes(feat.id);

                return (
                  <div
                    key={feat.id}
                    onClick={() => handleToggleFeature(feat.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${isSelected
                        ? 'bg-blue-50/50 border-[#2563EB] shadow-2xs'
                        : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                      }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#64748B]'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-[#0F172A]">{feat.name}</h4>
                        <Switch checked={isSelected} onChange={() => handleToggleFeature(feat.id)} />
                      </div>
                      <p className="text-[11px] text-[#64748B] font-medium mt-1 leading-snug">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* STEP 5: PRICING & VISIBILITY */}
        {currentStep === 5 && (
          <Card padding="lg" className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">Step 5: Pricing & Visibility</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Set enrollment fee in INR (₹) and course access rules.</p>
            </div>

            <div className="space-y-4">
              {/* Free Toggle */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#0F172A]">Free Course (₹0)</h4>
                  <p className="text-[11px] text-[#64748B]">Students can enroll for free without payment.</p>
                </div>
                <Switch
                  checked={watchIsFree}
                  onChange={(val) => {
                    setValue('isFree', val, { shouldValidate: true });
                    if (val) setValue('price', 0, { shouldValidate: true });
                  }}
                />
              </div>

              {/* Price Input */}
              {!watchIsFree && (
                <div className="space-y-1" data-field-name="price">
                  <label className="block text-xs font-semibold text-[#0F172A]">Enrollment Fee (INR / ₹) *</label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0F172A]">
                      ₹
                    </span>
                    <Input
                      type="number"
                      {...register('price')}
                      aria-invalid={Boolean(errors.price)}
                      aria-describedby={errors.price ? 'price-error' : undefined}
                      min={0}
                      placeholder="1499"
                      className={`w-full h-10 pl-7 text-xs font-bold text-[#0F172A] ${errors.price ? 'border-rose-500 ring-1 ring-rose-500/20 bg-rose-50/10' : ''
                        }`}
                    />
                  </div>
                  {errors.price && (
                    <p id="price-error" className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{errors.price.message}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Visibility Options */}
              <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                <label className="block text-xs font-semibold text-[#0F172A]">Course Visibility</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setValue('visibility', 'Public')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${watchVisibility === 'Public'
                        ? 'bg-blue-50/50 border-[#2563EB]'
                        : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                      <Globe className="w-4 h-4 text-[#2563EB]" />
                      <span>Public</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Visible in Academy course catalog for all prospective students.
                    </p>
                  </div>

                  <div
                    onClick={() => setValue('visibility', 'Private')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${watchVisibility === 'Private'
                        ? 'bg-blue-50/50 border-[#2563EB]'
                        : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                      <Badge variant="secondary" size="sm">Private</Badge>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Restricted access. Only students with direct enrollment link or staff invite can view.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 6: REVIEW & PUBLISH */}
        {currentStep === 6 && (
          <Card padding="lg" className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 sm:p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">Step 6: Review & Publish</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Summary review of course configuration before publishing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info Summary */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#0F172A]">Basic Information</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-xs text-[#64748B] space-y-1">
                  <p><strong className="text-[#0F172A]">Title:</strong> {watchTitle || '—'}</p>
                  <p className="truncate"><strong className="text-[#0F172A]">Short Desc:</strong> {watchShortDesc || '—'}</p>
                </div>
              </div>

              {/* Classification Summary */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#0F172A]">Classification & Details</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-xs text-[#64748B] space-y-1">
                  <p><strong className="text-[#0F172A]">Category:</strong> {watchCategory} ({watchSubcategory})</p>
                  <p><strong className="text-[#0F172A]">Level:</strong> {watchLevel} &bull; <strong className="text-[#0F172A]">Language:</strong> {watchLanguage}</p>
                  <p><strong className="text-[#0F172A]">Duration:</strong> {watchDurationHours}h {watchDurationMinutes}m</p>
                </div>
              </div>

              {/* Features Summary */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#0F172A]">Course Features</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedFeatureIds.map((id) => {
                    const feat = COURSE_FEATURE_OPTIONS.find((f) => f.id === id);
                    return (
                      <span key={id} className="px-2 py-0.5 bg-white border border-[#E2E8F0] text-[11px] font-semibold rounded-md text-[#0F172A]">
                        {feat?.name || id}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Pricing & Visibility Summary */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#0F172A]">Pricing & Visibility</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="text-xs text-[#64748B] space-y-1">
                  <p><strong className="text-[#0F172A]">Price:</strong> {watchIsFree ? 'Free (₹0)' : `₹${watchPrice}`}</p>
                  <p><strong className="text-[#0F172A]">Visibility:</strong> {watchVisibility}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* MOBILE & DESKTOP STICKY NAVIGATION FOOTER */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-3 sm:p-4 shadow-lg pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="border-[#E2E8F0] text-xs font-semibold h-10 px-4 disabled:opacity-40 cursor-pointer"
            >
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                className="border-[#E2E8F0] text-xs font-semibold h-10 px-3.5 cursor-pointer hidden sm:inline-flex"
              >
                Save Draft
              </Button>

              {currentStep < 6 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-10 px-5 cursor-pointer shadow-2xs"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-10 px-6 cursor-pointer shadow-2xs"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Course'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
