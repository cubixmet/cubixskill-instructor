import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Layers,
  FileText,
  Image as ImageIcon,
  Video,
  FileCheck,
  Edit3,
  Eye,
  Send,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { CourseListItem, CourseDetail, CoursePublishReadiness } from '../types/course.types';
import { coursesService } from '../../../services/courses.service';
import { resolveMediaUrl } from '../../../utils/media.utils';
import { Button } from '../../../components/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  course: CourseListItem | CourseDetail | null;
  onStatusUpdated?: () => void;
}

export const DraftCourseDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  course,
  onStatusUpdated,
}) => {
  const navigate = useNavigate();

  const [fullDetail, setFullDetail] = useState<CourseDetail | null>(null);
  const [readiness, setReadiness] = useState<CoursePublishReadiness | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [readinessError, setReadinessError] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const loadReadiness = (courseId: string) => {
    setIsLoading(true);
    setReadinessError(null);
    setPublishError(null);

    Promise.all([
      coursesService.getCourse(courseId).catch(() => null),
      coursesService.getPublishReadiness(courseId).catch((err) => {
        console.error('Failed to load publish readiness:', err);
        setReadinessError('Unable to calculate publish readiness.');
        return null;
      }),
    ])
      .then(([detailRes, readinessRes]) => {
        if (detailRes) setFullDetail(detailRes);
        if (readinessRes) setReadiness(readinessRes);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen && course?.id) {
      setPublishSuccess(false);
      loadReadiness(course.id);
    } else {
      setFullDetail(null);
      setReadiness(null);
      setReadinessError(null);
      setPublishError(null);
    }
  }, [isOpen, course?.id]);

  if (!isOpen || !course) return null;

  // Merge available course properties
  const title = fullDetail?.title || course.title || 'Untitled Course';
  const subtitle = fullDetail?.subtitle || ('subtitle' in course ? course.subtitle : '');
  const description = fullDetail?.description || fullDetail?.short_description || subtitle || '';
  const rawThumbnail = fullDetail?.thumbnail || fullDetail?.thumbnail_url || course.thumbnail || ('thumbnail_url' in course ? course.thumbnail_url : null);
  const thumbnail = resolveMediaUrl(rawThumbnail);

  const modulesCount = readiness !== null
    ? readiness.module_count
    : (fullDetail?.module_count !== undefined
      ? fullDetail.module_count
      : (('module_count' in course && typeof (course as any).module_count === 'number')
        ? (course as any).module_count
        : null));

  const lessonsCount = readiness !== null
    ? readiness.lesson_count
    : (fullDetail?.lesson_count !== undefined
      ? fullDetail.lesson_count
      : (('lesson_count' in course && typeof (course as any).lesson_count === 'number')
        ? (course as any).lesson_count
        : null));

  const processingCount = readiness ? readiness.processing_count : 0;

  // Icon mapping for backend checklist keys
  const getChecklistIcon = (key: string) => {
    switch (key) {
      case 'title':
        return FileText;
      case 'category':
        return Layers;
      case 'thumbnail':
        return ImageIcon;
      case 'modules':
        return Layers;
      case 'lessons':
        return BookOpen;
      case 'video_processing':
        return Video;
      default:
        return FileText;
    }
  };

  // Canonical checklist derived from backend readiness items (or fallback to empty array while loading)
  const checklistItems = (readiness?.items || []).map((item) => ({
    key: item.key,
    label: item.label,
    isRequired: item.required,
    isComplete: item.complete,
    valueText: item.value_text || (item.complete ? 'Ready' : 'Missing'),
    icon: getChecklistIcon(item.key),
  }));

  const missingRequiredItems = checklistItems.filter((item) => item.isRequired && !item.isComplete);
  const remainingCount = missingRequiredItems.length;

  const isReadyToPublish = readiness
    ? (readiness.ready_to_publish && remainingCount === 0)
    : false;

  const handlePublishCourse = async () => {
    if (isPublishing || !course.id) return;
    setIsPublishing(true);
    setPublishError(null);
    try {
      await coursesService.publishCourse(course.id);
      setPublishSuccess(true);
      if (onStatusUpdated) onStatusUpdated();
      setTimeout(() => {
        onClose();
        navigate(`/courses/${course.id}/overview`);
      }, 1200);
    } catch (err: any) {
      console.error('Failed to publish course:', err);
      setPublishError(err.response?.data?.message || err.message || 'Failed to publish course.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleContinueEditing = () => {
    onClose();
    navigate(`/courses/${course.id}/edit`);
  };

  const handlePreview = () => {
    onClose();
    navigate(`/courses/${course.id}/overview`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans text-left text-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#263244] flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#0F172A]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-[#F8FAFC] truncate">
                  Draft Setup & Publish Readiness
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white shrink-0">
                  DRAFT
                </span>
              </div>
              <p className="text-xs font-normal text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">
                {title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1E293B] flex items-center justify-center text-slate-500 dark:text-[#94A3B8] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 hide-scrollbar">
          {/* SUCCESS BANNER IF PUBLISHED */}
          {publishSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] border border-emerald-200 dark:border-emerald-500/30 space-y-2 text-emerald-900 dark:text-emerald-200 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-bold text-base">Course Published Successfully!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                This course is now live and visible to enrolled students.
              </p>
            </div>
          ) : (
            <>
              {/* READINESS SUMMARY BADGE BANNER */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isReadyToPublish
                    ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.1)] border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-[rgba(245,158,11,0.1)] border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isReadyToPublish ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">
                      {isReadyToPublish
                        ? 'All required setup items complete!'
                        : `${remainingCount} required ${remainingCount === 1 ? 'item' : 'items'} remaining`}
                    </span>
                    <span className="text-[11px] font-normal text-slate-500 dark:text-[#94A3B8] block">
                      {isReadyToPublish
                        ? 'Course is ready to be published to students.'
                        : 'Complete all required items below to enable publishing.'}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadReadiness(course.id)}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
                  className="h-8 px-3 text-xs font-semibold shrink-0"
                >
                  Refresh
                </Button>
              </div>

              {publishError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{publishError}</span>
                </div>
              )}

              {/* SETUP CHECKLIST TABLE / LIST */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#64748B] px-1">
                  Required Publish Items
                </h4>

                {isLoading ? (
                  <div className="p-8 text-center space-y-2 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#263244]">
                    <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Checking persisted curriculum & media readiness...</p>
                  </div>
                ) : readinessError ? (
                  <div className="p-6 text-center space-y-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300">
                    <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
                    <p className="text-xs font-medium">{readinessError}</p>
                    <Button size="sm" onClick={() => loadReadiness(course.id)} className="h-8 bg-rose-600 text-white font-bold text-xs">
                      Retry Readiness Check
                    </Button>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#263244] rounded-2xl divide-y divide-slate-100 dark:divide-[#263244] overflow-hidden">
                    {checklistItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.key}
                          className="p-3.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#263244] flex items-center justify-center text-slate-500 shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] block truncate">
                                {item.label}
                              </span>
                              {item.isRequired ? (
                                <span className="text-[10px] text-slate-400 font-normal block">Required</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-normal block">Optional</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`font-extrabold text-xs px-2.5 py-1 rounded-lg ${
                                item.isComplete
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                  : item.isRequired
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                              }`}
                            >
                              {item.valueText}
                            </span>
                            {item.isComplete ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              item.isRequired && <AlertCircle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-[#263244] bg-slate-50/50 dark:bg-[#0F172A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleContinueEditing}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial font-semibold border-slate-300 dark:border-[#263244] text-slate-700 dark:text-[#CBD5E1]"
            >
              Continue Editing
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial font-semibold border-slate-300 dark:border-[#263244] text-slate-700 dark:text-[#CBD5E1]"
            >
              Preview
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handlePublishCourse}
            disabled={!isReadyToPublish || isPublishing || isLoading}
            leftIcon={isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            className={`px-5 font-bold text-xs shadow-xs ${
              isReadyToPublish
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-300 dark:bg-[#1E293B] text-slate-500 cursor-not-allowed'
            }`}
          >
            {isPublishing ? 'Publishing...' : 'Publish Course'}
          </Button>
        </div>
      </div>
    </div>
  );
};
