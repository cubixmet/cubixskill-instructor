import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Rocket,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link2,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Switch } from '../../../components/ui/Switch';
import { useCourseStore } from '../store/course.store';
import { StepGuard } from '../../../components/common/StepGuard';

import { CENTRAL_PLATFORM_FEATURES } from '../../course-features/config/courseFeatures.config';

export interface FeatureItem {
  id: string;
  name: string;
  category: any;
  description: string;
  creditCost: number;
  icon: any;
  isRecommended?: boolean;
  requiresConfig?: boolean;
  isPremium?: boolean;
}

const APPROVED_FEATURES: FeatureItem[] = CENTRAL_PLATFORM_FEATURES.map((f) => ({
  id: f.id,
  name: f.name,
  category: f.category,
  description: f.description,
  creditCost: f.creditCost,
  icon: f.icon,
  isRecommended: f.isRecommended,
  requiresConfig: f.requiresConfig,
  isPremium: f.isPremium,
}));

const CATEGORY_MAP: Record<string, string[]> = {
  'Web Development': ['React', 'Next.js', 'Angular', 'Vue', 'Node.js', 'Tailwind CSS'],
  Programming: ['Python', 'Java', 'C#', 'PHP', 'Go', 'Rust'],
  Design: ['UI/UX Design', 'Figma', 'Web Design', '3D Motion'],
  Business: ['Product Management', 'Entrepreneurship', 'Sales', 'Finance'],
  Marketing: ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media'],
  'AI & Machine Learning': ['PyTorch', 'TensorFlow', 'LLMs & RAG', 'Prompt Engineering'],
};

const LANGUAGES = ['English', 'Malayalam', 'Tamil', 'Hindi', 'Arabic', 'French', 'German'];

const wizardSchema = z.object({
  title: z.string().min(3, 'Title is required').max(120, 'Title max 120 chars'),
  shortDescription: z.string().min(10, 'Short description is required').max(300, 'Max 300 chars'),
  fullDescription: z.string().optional().default(''),
  thumbnailUrl: z.string().optional().default(''),
  promoVideoUrl: z.string().optional().default(''),
  category: z.string().min(1, 'Select category'),
  subcategory: z.string().min(1, 'Select subcategory'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  language: z.string().min(1, 'Select language'),
  durationHours: z.coerce.number().min(0).default(0),
  durationMinutes: z.coerce.number().min(0).max(59).default(0),
  courseType: z.enum(['Free', 'Paid', 'Private', 'Invite Only']),
  visibility: z.enum(['Public', 'Unlisted', 'Private']),
  price: z.coerce.number().min(0).default(1499),
  discountPrice: z.coerce.number().min(0).optional().default(999),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  scheduledAt: z.string().optional(),
  instructorName: z.string().default('John Instructor'),
  tags: z.string().optional().default(''),

  // SEO
  seoTitle: z.string().max(60).optional().default(''),
  metaDescription: z.string().max(160).optional().default(''),
  seoKeywords: z.string().optional().default(''),
  ogImageUrl: z.string().optional().default(''),
});

export type WizardFormValues = z.infer<typeof wizardSchema>;

export const CourseCreateWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const addCourse = useCourseStore((state) => state.addCourse);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    { id: 1, name: 'Basic Information', shortName: 'Basic Info' },
    { id: 2, name: 'Feature Selection', shortName: 'Features' },
    { id: 3, name: 'Pricing', shortName: 'Pricing' },
    { id: 4, name: 'SEO', shortName: 'SEO' },
    { id: 5, name: 'Review & Create', shortName: 'Review' },
  ];

  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([
    'video_lessons',
    'pdf_lessons',
    'quizzes',
    'assignments',
    'certificates',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema) as any,
    defaultValues: {
      title: '',
      shortDescription: '',
      fullDescription: '',
      thumbnailUrl: '',
      promoVideoUrl: '',
      category: '',
      subcategory: '',
      level: 'Beginner',
      language: 'English',
      durationHours: 0,
      durationMinutes: 0,
      courseType: 'Paid',
      visibility: 'Public',
      price: 1499,
      discountPrice: 999,
      status: 'draft',
      instructorName: 'John Instructor',
      tags: '',
    },
  });

  const watchTitle = watch('title') || '';
  const watchShortDesc = watch('shortDescription') || '';
  const watchCategory = watch('category');
  const watchSubcategory = watch('subcategory');
  const watchLevel = watch('level');
  const watchLanguage = watch('language');
  const watchCourseType = watch('courseType');
  const watchVisibility = watch('visibility');
  const watchDurationHours = watch('durationHours') || 0;
  const watchDurationMinutes = watch('durationMinutes') || 0;
  const watchThumbnail = watch('thumbnailUrl');

  const subcategories = CATEGORY_MAP[watchCategory] || ['Select subcategory'];

  const [targetStudentCount, setTargetStudentCount] = useState<number>(100);

  const MINIMUM_BASE_STUDENT_CREDIT = 10;
  const effectiveBaseCredit = Math.max(MINIMUM_BASE_STUDENT_CREDIT, 10);

  const selectedFeaturesList = APPROVED_FEATURES.filter((f) => selectedFeatureIds.includes(f.id));
  const selectedFeatureCredits = selectedFeaturesList.reduce((acc, feat) => acc + (feat.creditCost || 0), 0);

  const finalCreditsPerStudent = effectiveBaseCredit + selectedFeatureCredits;
  const estimatedTotalCredits = finalCreditsPerStudent * targetStudentCount;
  const availableWalletBalance = 12450;
  const estimatedRemainingBalance = availableWalletBalance - estimatedTotalCredits;

  const handleToggleFeature = (featureId: string) => {
    if (selectedFeatureIds.includes(featureId)) {
      setSelectedFeatureIds(selectedFeatureIds.filter((id) => id !== featureId));
    } else {
      setSelectedFeatureIds([...selectedFeatureIds, featureId]);
    }
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) {
      return watchTitle.trim().length >= 3 && watchShortDesc.trim().length >= 10 && Boolean(watchCategory);
    }
    if (currentStep === 2) {
      return selectedFeatureIds.length > 0;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!isCurrentStepValid()) {
      showToast('Complete all required fields to continue.');
      return;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onFinalSubmit = (data: WizardFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
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
        courseType: data.courseType || 'Paid',
        visibility: data.visibility || 'Public',
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : ['React'],
        instructorName: data.instructorName || 'John Instructor',
        status: data.status || 'draft',
        creditsPerStudent: 15,
        isFree: data.courseType === 'Free',
        price: data.courseType === 'Free' ? 0 : data.price,
        slug: '',
      });

      setIsSubmitting(false);
      showToast('Course created successfully!');
      navigate(`/courses/${created.uuid}/overview`);
    }, 400);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 text-left font-sans pb-[calc(88px+env(safe-area-inset-bottom))] no-scrollbar">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BREADCRUMB & HEADER */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#64748B]">
          <Link to="/courses" className="hover:text-[#0F172A] transition-colors">Courses</Link>
          <span>›</span>
          <span className="text-[#0F172A] font-semibold">Create Course</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[26px] font-semibold text-[#0F172A] tracking-tight">
              Create Course
            </h1>
            <p className="text-[13px] font-normal text-[#64748B] mt-0.5">
              Build and publish a high-quality course for your students.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => showToast('Draft saved.')} className="h-10 px-4 bg-white border-[#E2E8F0] text-[#0F172A]">
              Save Draft
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/courses')} className="h-10 px-4 bg-white border-[#E2E8F0] text-[#0F172A]">
              Exit
            </Button>
          </div>
        </div>

        {/* 5 STEP GUARD WIZARD BAR */}
        <StepGuard
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(stepNum) => setCurrentStep(stepNum)}
        />
      </div>

      {/* MAIN TWO-COLUMN FORM LAYOUT */}
      <form onSubmit={handleSubmit(onFinalSubmit as any)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          {currentStep === 1 && (
            <Card padding="md" className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-[18px] font-semibold text-[#0F172A]">Course Information</h2>
                <p className="text-[13px] font-normal text-[#64748B] mt-0.5">
                  Provide the basic details about your course.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[12px]">
                      <label className="font-semibold text-[#0F172A]">Course Title *</label>
                      <span className="text-[#64748B] text-[11px]">{watchTitle.length}/120</span>
                    </div>
                    <Input
                      {...register('title')}
                      placeholder="Enter course title"
                      className={`w-full text-[13px] ${errors.title ? 'border-red-500' : ''}`}
                    />
                    {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[12px]">
                      <label className="font-semibold text-[#0F172A]">Short Description *</label>
                      <span className="text-[#64748B] text-[11px]">{watchShortDesc.length}/300</span>
                    </div>
                    <textarea
                      {...register('shortDescription')}
                      rows={2}
                      placeholder="Enter short description"
                      className={`w-full p-3 bg-white border rounded-xl text-[13px] font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB] resize-none ${
                        errors.shortDescription ? 'border-red-500' : 'border-[#E2E8F0]'
                      }`}
                    />
                    {errors.shortDescription && <p className="text-[11px] text-red-500 font-semibold">{errors.shortDescription.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[12px] font-semibold text-[#0F172A]">Full Description</label>
                    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
                      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-2 flex items-center gap-1.5 text-[#64748B] text-[11px] font-medium overflow-x-auto no-scrollbar">
                        <select className="h-7 px-2 bg-white border border-[#E2E8F0] rounded-md text-[11px]">
                          <option>Paragraph</option>
                          <option>Heading 1</option>
                          <option>Heading 2</option>
                        </select>
                        <span className="text-[#E2E8F0]">|</span>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-[#0F172A]"><Bold className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-[#0F172A]"><Italic className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-[#0F172A]"><Underline className="w-3.5 h-3.5" /></button>
                        <span className="text-[#E2E8F0]">|</span>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-[#0F172A]"><List className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-[#0F172A]"><ListOrdered className="w-3.5 h-3.5" /></button>
                        <span className="text-[#E2E8F0]">|</span>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-[#0F172A]"><Quote className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-[#0F172A]"><Link2 className="w-3.5 h-3.5" /></button>
                      </div>

                      <textarea
                        {...register('fullDescription')}
                        rows={4}
                        placeholder="Write a detailed description about your course..."
                        className="w-full p-3 font-normal text-[13px] text-[#0F172A] focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[12px] font-semibold text-[#0F172A]">Course Thumbnail *</label>
                    <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] bg-[#F8FAFC] rounded-2xl p-5 text-center space-y-2 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center mx-auto text-[#2563EB]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-[13px] font-semibold text-[#0F172A] block">Upload Image</strong>
                        <span className="text-[11px] text-[#64748B]">PNG, JPG up to 5MB</span>
                      </div>
                      <Button variant="outline" size="sm" type="button" className="h-8 text-[11px] px-3 font-semibold bg-white border-[#E2E8F0] text-[#0F172A]">
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[12px] font-semibold text-[#0F172A]">Promotional Video (Optional)</label>
                    <Input {...register('promoVideoUrl')} placeholder="https://" className="w-full text-[13px]" />
                    <span className="text-[11px] text-[#64748B] block">YouTube, Vimeo or any video link</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Category *</label>
                  <select
                    {...register('category')}
                    onChange={(e) => {
                      setValue('category', e.target.value);
                      const subList = CATEGORY_MAP[e.target.value] || ['Select subcategory'];
                      setValue('subcategory', subList[0]);
                    }}
                    className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select category</option>
                    {Object.keys(CATEGORY_MAP).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Subcategory *</label>
                  <select
                    {...register('subcategory')}
                    className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Level *</label>
                  <select
                    {...register('level')}
                    className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Language *</label>
                  <select
                    {...register('language')}
                    className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Course Type *</label>
                  <select
                    {...register('courseType')}
                    className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select course type</option>
                    <option value="Paid">Paid Course</option>
                    <option value="Free">Free Course</option>
                    <option value="Private">Private</option>
                    <option value="Invite Only">Invite Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Visibility *</label>
                  <select
                    {...register('visibility')}
                    className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select visibility</option>
                    <option value="Public">Public</option>
                    <option value="Unlisted">Unlisted</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Estimated Duration (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" min={0} {...register('durationHours')} placeholder="Hours: 0" className="w-full text-[13px]" />
                    <Input type="number" min={0} max={59} {...register('durationMinutes')} placeholder="Minutes: 0" className="w-full text-[13px]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Tags (Optional)</label>
                  <Input {...register('tags')} placeholder="Type and press Enter" className="w-full text-[13px]" />
                  <span className="text-[11px] text-[#64748B] block">Add relevant tags for your course</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Instructor</label>
                  <Input {...register('instructorName')} readOnly className="w-full bg-[#F8FAFC] text-[13px] text-[#64748B]" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Status *</label>
                  <select
                    {...register('status')}
                    className="w-full h-11 px-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card padding="md" className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-5">
              <div>
                <h2 className="text-[18px] font-semibold text-[#0F172A]">2. Feature Selection</h2>
                <p className="text-[13px] text-[#64748B] mt-0.5">
                  Select optional features for this course. Base Student Credit is always active and mandatory.
                </p>
              </div>

              {/* 1. MANDATORY BASE STUDENT CREDIT CARD */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/70 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-semibold text-[#0F172A]">Base Student Credit</strong>
                    <Badge variant="success" size="sm">Always Active</Badge>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">Mandatory core platform allocation per student.</p>
                </div>
                <div className="text-right shrink-0">
                  <strong className="text-base font-bold text-[#2563EB] block">10 Credits / Student</strong>
                  <span className="text-[11px] text-[#64748B] font-medium">Required • Cannot be removed</span>
                </div>
              </div>

              {/* 2. STICKY MINI CREDIT SUMMARY */}
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                  <span>Live Per Student Credit Formula</span>
                  <Badge variant="secondary" size="sm">{selectedFeaturesList.length} Add-ons Enabled</Badge>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#2563EB] text-center">
                  10 Base + {selectedFeatureCredits} Features = {finalCreditsPerStudent} Credits / Student
                </div>
              </div>

              {/* 3. OPTIONAL FEATURES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {APPROVED_FEATURES.map((feat) => {
                  const isSelected = selectedFeatureIds.includes(feat.id);
                  return (
                    <div
                      key={feat.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isSelected ? 'bg-blue-50/60 border-[#2563EB] shadow-2xs' : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-[13px] font-semibold text-[#0F172A]">{feat.name}</strong>
                          <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            +{feat.creditCost} {feat.creditCost === 1 ? 'Credit' : 'Credits'} / Student
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748B] block leading-tight">{feat.description}</span>
                      </div>
                      <Switch checked={isSelected} onCheckedChange={() => handleToggleFeature(feat.id)} />
                    </div>
                  );
                })}
              </div>

              {/* 4. LIVE CREDIT CALCULATOR */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3 text-xs">
                <strong className="text-xs font-semibold text-[#0F172A] block border-b border-[#E2E8F0] pb-2">
                  Live Course Credit Calculator
                </strong>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0]">
                    <span className="text-[11px] text-[#64748B] block">Base Credit</span>
                    <strong className="text-sm font-bold text-[#0F172A]">10 Credits</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0]">
                    <span className="text-[11px] text-[#64748B] block">Add-on Features</span>
                    <strong className="text-sm font-bold text-[#2563EB]">+{selectedFeatureCredits} Credits</strong>
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-[11px] text-[#2563EB] block font-semibold">Final Per Student</span>
                    <strong className="text-base font-extrabold text-[#2563EB]">{finalCreditsPerStudent} Credits</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#0F172A]">Target Enrolled Students</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={targetStudentCount}
                        onChange={(e) => setTargetStudentCount(Math.max(1, Number(e.target.value) || 1))}
                        className="w-24 h-8 px-2 bg-white border border-[#E2E8F0] rounded-lg text-right font-bold text-xs focus:outline-none focus:border-[#2563EB]"
                      />
                      <span className="text-xs text-[#64748B]">Students</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-[#64748B] text-[11px]">
                    <span>Estimated Total Required</span>
                    <strong className="text-[#2563EB] font-bold">{estimatedTotalCredits.toLocaleString()} Credits</strong>
                  </div>
                  <div className="flex justify-between text-[#64748B] text-[11px]">
                    <span>Available Wallet Balance</span>
                    <span className="font-semibold text-[#0F172A]">12,450 Credits</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-[#E2E8F0] text-xs">
                    <span className="text-[#0F172A]">Estimated Remaining Balance</span>
                    <strong className={estimatedRemainingBalance >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {estimatedRemainingBalance.toLocaleString()} Credits
                    </strong>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card padding="md" className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <h2 className="text-[18px] font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-3">3. Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Regular Price (INR)</label>
                  <Input type="number" {...register('price')} className="w-full text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A]">Discount Price (INR)</label>
                  <Input type="number" {...register('discountPrice')} className="w-full text-[13px]" />
                </div>
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card padding="md" className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <h2 className="text-[18px] font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-3">4. SEO Metadata</h2>
              <div className="space-y-3">
                <Input {...register('seoTitle')} placeholder="SEO Meta Title" className="w-full text-[13px]" />
                <textarea {...register('metaDescription')} rows={3} placeholder="Meta description..." className="w-full p-3 border border-[#E2E8F0] rounded-xl text-[13px] resize-none" />
              </div>
            </Card>
          )}

          {currentStep === 5 && (
            <Card padding="md" className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <h2 className="text-[18px] font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-3">5. Review & Confirm</h2>
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-[13px]">
                <strong className="text-[15px] text-[#0F172A] block">{watchTitle || 'Untitled Course'}</strong>
                <p className="text-[#64748B]">{watchShortDesc || 'No short description provided.'}</p>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 sticky top-[96px] space-y-5">
          <Card padding="md" className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Course Summary</h3>
              <button type="button" className="text-[12px] font-semibold text-[#2563EB] flex items-center gap-1 hover:underline cursor-pointer">
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] overflow-hidden shrink-0">
                {watchThumbnail ? (
                  <img src={watchThumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                )}
              </div>

              <div className="space-y-1">
                <strong className="font-semibold text-[#0F172A] text-[13px] block leading-snug">
                  {watchTitle || 'Course Title'}
                </strong>
                <Badge variant="secondary" size="sm">Draft</Badge>
              </div>
            </div>

            <div className="space-y-2 text-[12px] pt-2 border-t border-[#E2E8F0]">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-[#64748B]">Category</span>
                <strong className="text-[#0F172A] font-semibold">{watchCategory || '-'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-[#64748B]">Subcategory</span>
                <strong className="text-[#0F172A] font-semibold">{watchSubcategory || '-'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-[#64748B]">Level</span>
                <strong className="text-[#0F172A] font-semibold">{watchLevel || '-'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-[#64748B]">Language</span>
                <strong className="text-[#0F172A] font-semibold">{watchLanguage || '-'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-[#64748B]">Type</span>
                <strong className="text-[#0F172A] font-semibold">{watchCourseType || '-'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-[#64748B]">Visibility</span>
                <strong className="text-[#0F172A] font-semibold">{watchVisibility || '-'}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Duration</span>
                <strong className="text-[#0F172A] font-semibold">{watchDurationHours}h {watchDurationMinutes}m</strong>
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <h3 className="text-[15px] font-semibold text-[#0F172A]">Quick Tips</h3>
            <div className="space-y-2 text-[12px] text-[#0F172A] font-medium">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                Choose a clear and descriptive title
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                Add a high-quality thumbnail
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                Write a compelling course description
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                Select appropriate category and level
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                Review all details before publishing
              </p>
            </div>
          </Card>

          {currentStep < 5 ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleNextStep}
              className="w-full h-[48px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[14px] rounded-[14px] flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <span>Next: {steps[currentStep]?.name || 'Feature Selection'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[48px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[14px] rounded-[14px] flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Rocket className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Creating Course...' : 'Create Course & Open Overview'}</span>
            </motion.button>
          )}
        </div>
      </form>
    </div>
  );
};
