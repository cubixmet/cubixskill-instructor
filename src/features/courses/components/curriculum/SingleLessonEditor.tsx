import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files,
  CheckCircle2,
  AlertCircle,
  Link2,
  Plus,
  Upload,
  Loader2,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { authService } from '../../../../services/auth.service';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import type { CourseLesson, LessonType, CreateAssignmentInput } from '../../../../types/curriculum.types';
import { getLessonTypeMeta } from '../../config/lessonTypes.config';
import { RichTextEditor } from './RichTextEditor';
import { isHtmlContentEmpty, sanitizeHtml } from '../../utils/sanitizeHtml.util';
import {
  QuizQuestionBuilder,
  BuilderQuestion,
  createDefaultQuestion,
} from './QuizQuestionBuilder';
import { LessonResourcesSection } from './LessonResourcesSection';
import { parseEmbedVideoUrl } from './VideoLessonSettings';
import { useCurriculumStore } from '../../store/curriculum.store';
import { coursesService } from '../../../../services/courses.service';
import { storageService } from '../../../../services/storage.service';
import { MediaPickerModal } from '../../../../components/media/MediaPickerModal';
import { LessonResourcesEditor, PendingResource } from './LessonResourcesEditor';
import { LessonFormActions } from './LessonFormActions';

interface SingleLessonEditorProps {
  type: LessonType;
  moduleTitle?: string;
  moduleUuid?: string;
  onSaveLesson: (updated: Partial<CourseLesson>) => Promise<CourseLesson | void> | void;
  onCancel?: () => void;
  lesson?: CourseLesson;
  isCreateMode?: boolean;
}

const preloadBuilderQuestions = (rawQuestions?: Record<string, unknown>[]): BuilderQuestion[] => {
  if (!rawQuestions || !Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    return [createDefaultQuestion()];
  }

  return rawQuestions.map((q: any, idx: number) => {
    const qId = String(q.id || `q-${idx}-${Date.now()}`);
    const rawType = String(q.question_type || q.type || 'single_choice').toLowerCase();
    const qType: BuilderQuestionType =
      rawType === 'multiple_choice'
        ? 'multiple_choice'
        : rawType === 'true_false'
        ? 'true_false'
        : rawType === 'short_answer'
        ? 'short_answer'
        : rawType === 'long_answer'
        ? 'long_answer'
        : rawType === 'fill_blank'
        ? 'fill_blank'
        : 'single_choice';

    const questionText = String(q.question_text || q.questionText || q.question || '');

    let options: { id: string; text: string }[] = [];
    let detectedCorrectAnswer = String(q.correct_answer || q.correctAnswer || q.answer_text || '');

    if (Array.isArray(q.options)) {
      options = q.options.map((opt: any, optIdx: number) => {
        if (typeof opt === 'string') {
          return { id: `opt-${optIdx + 1}-${qId}`, text: opt };
        }
        const optId = String(opt.id || `opt-${optIdx + 1}-${qId}`);
        const optText = String(opt.option_text || opt.text || opt.label || '');
        const isOptCorrect = Boolean(opt.is_correct ?? opt.isCorrect);

        if (isOptCorrect && (!detectedCorrectAnswer || detectedCorrectAnswer === 'undefined' || detectedCorrectAnswer === 'null')) {
          detectedCorrectAnswer = optId;
        }

        return {
          id: optId,
          text: optText,
        };
      });
    }

    if (qType === 'single_choice' || qType === 'mcq') {
      if (options.length < 2) {
        options = [
          { id: `opt-1-${qId}`, text: '' },
          { id: `opt-2-${qId}`, text: '' },
        ];
      }
      if (!detectedCorrectAnswer && options.length > 0) {
        detectedCorrectAnswer = options[0].id;
      }
    } else if (qType === 'true_false' && !detectedCorrectAnswer) {
      detectedCorrectAnswer = 'True';
    }

    return {
      id: qId,
      type: qType,
      questionText,
      options,
      correctAnswer: detectedCorrectAnswer,
    };
  });
};

const isValidHttpUrl = (str: string): boolean => {
  if (!str || !str.trim()) return false;
  const clean = str.trim().toLowerCase();
  return clean.startsWith('http://') || clean.startsWith('https://');
};

export const SingleLessonEditor: React.FC<SingleLessonEditorProps> = ({
  type,
  moduleUuid,
  onSaveLesson,
  onCancel,
  lesson,
  isCreateMode = true,
}) => {
  const meta = getLessonTypeMeta(type);
  const Icon = meta.icon || Files;

  // Module store context
  const currentCourseUuid = lesson?.courseUuid || '';
  const allModules = useCurriculumStore((state) => state.modules);
  const courseModules = allModules.filter((m) => m.courseUuid === currentCourseUuid);
  const activeModules = courseModules.length > 0 ? courseModules : allModules;
  const allLessons = useCurriculumStore((state) => state.lessons);

  const [selectedModuleUuid, setSelectedModuleUuid] = useState<string>(
    lesson?.moduleUuid || moduleUuid || activeModules[0]?.uuid || ''
  );

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // View mode: 'editor' or 'preview'
  const [editorMode, setEditorMode] = useState<'editor' | 'preview'>('editor');

  // Common Fields
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [isDemo, setIsDemo] = useState(lesson?.isDemo || false);
  const [isLocked, setIsLocked] = useState(
    Boolean((lesson as any)?.is_locked ?? lesson?.isLocked ?? false)
  );
  const [allowDownload, setAllowDownload] = useState(
    lesson?.allowDownload ?? lesson?.content?.allowDownload ?? lesson?.content?.downloadable ?? false
  );
  const [durationMinutes, setDurationMinutes] = useState(lesson?.durationMinutes || 15);
  const navigate = useNavigate();

  // Errors
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});

  // Helpers
  const showFreeDemoOption = type === 'video';
  const showAllowDownloadOption = type === 'document';
  const canUseUrlSource = !isDemo;

  // Content Source State for Video, Audio, Document, Image
  const initialMediaSource = (lesson?.content?.mediaFile || lesson?.content?.mediaFileId || !canUseUrlSource) ? 'UPLOAD' : 'URL';
  const [mediaSource, setMediaSource] = useState<'UPLOAD' | 'URL'>(initialMediaSource);

  // Per-Lesson Upload HLS Toggle State (Initialized from Academy Settings)
  const [hlsEnabled, setHlsEnabled] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAcademyHlsDefault() {
      try {
        const settings = await authService.getAcademySettings();
        if (isMounted && settings && typeof settings.hls_video_enabled === 'boolean') {
          setHlsEnabled(settings.hls_video_enabled);
        }
      } catch (_) {}
    }
    loadAcademyHlsDefault();
    return () => { isMounted = false; };
  }, []);

  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(
    lesson?.content?.mediaFileId || lesson?.content?.mediaFile?.id || null
  );
  const [uploadedFileObj, setUploadedFileObj] = useState<{ name: string; sizeMb: string; url: string } | null>(
    lesson?.content?.mediaFile
      ? {
          name: lesson.content.mediaFile.original_filename || 'Uploaded File',
          sizeMb: (lesson.content.mediaFile.file_size / (1024 * 1024)).toFixed(1),
          url: lesson.content.mediaFile.url,
        }
      : null
  );

  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Media URL for Video, Audio, Document, Image
  const [mediaUrl, setMediaUrl] = useState(
    lesson?.content?.videoUrl ||
      lesson?.content?.audioUrl ||
      lesson?.content?.imageUrl ||
      lesson?.content?.documentUrl ||
      lesson?.content?.mediaUrl ||
      lesson?.content?.externalUrl ||
      lesson?.external_url ||
      lesson?.audio_url ||
      ''
  );
  const [caption, setCaption] = useState(lesson?.content?.instructions || '');
  const [isSaving, setIsSaving] = useState(false);

  // Text Content
  const [textContent, setTextContent] = useState(
    lesson?.content?.textContent ||
      lesson?.content?.body ||
      lesson?.content?.article ||
      ''
  );

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<BuilderQuestion[]>(
    preloadBuilderQuestions((lesson as any)?.quiz?.questions || lesson?.content?.questions)
  );
  const [passingScore, setPassingScore] = useState<number>(
    (lesson as any)?.quiz?.passing_score ?? ((lesson?.content as Record<string, unknown>)?.passingScore
      ? Number((lesson?.content as Record<string, unknown>).passingScore)
      : 70)
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>(
    (lesson as any)?.quiz?.time_limit_minutes ?? ((lesson?.content as Record<string, unknown>)?.timeLimitMinutes
      ? Number((lesson?.content as Record<string, unknown>).timeLimitMinutes)
      : undefined)
  );
  const [maxAttempts, setMaxAttempts] = useState<number | undefined>(
    (lesson as any)?.quiz?.max_attempts ?? ((lesson?.content as Record<string, unknown>)?.maxAttempts
      ? Number((lesson?.content as Record<string, unknown>).maxAttempts)
      : undefined)
  );
  const [showAdvancedQuizSettings, setShowAdvancedQuizSettings] = useState(false);

  // Assignment & Project State
  const [instructions, setInstructions] = useState(
    lesson?.content?.instructions || ''
  );
  
  const initialDueDays = (() => {
    const raw =
      (lesson as any)?.assignment?.due_days ??
      (lesson as any)?.assignment?.dueDays ??
      (lesson?.content as any)?.dueDays ??
      (lesson?.content as any)?.due_days;
    if (typeof raw === 'number' && !isNaN(raw) && raw >= 1) return raw;
    if (typeof raw === 'string' && raw.trim() !== '') {
      const parsed = parseInt(raw, 10);
      return !isNaN(parsed) && parsed >= 1 ? parsed : null;
    }
    return null;
  })();

  const [dueDays, setDueDays] = useState<number | null>(initialDueDays);
  const [dueDaysError, setDueDaysError] = useState<string | null>(null);
  const [savedLessonUuid, setSavedLessonUuid] = useState<string | null>(null);

  const [maxScore, setMaxScore] = useState(lesson?.content?.maxScore ?? 100);
  const [submissionType, setSubmissionType] = useState<'file' | 'text' | 'both'>(
    lesson?.content?.submissionType || 'file'
  );
  const [allowUrlSubmission] = useState(true);

  // Staged / Pending Resources State
  const initialPendingResources: PendingResource[] = (() => {
    const existing = lesson?.resources || lesson?.content?.resources || [];
    if (Array.isArray(existing)) {
      return existing.map((r: any, idx: number) => ({
        id: String(r.id || `existing-${idx}`),
        title: r.title || r.media_file?.original_filename || 'Attached Resource',
        resourceType: r.resource_type || r.resourceType || 'document',
        mediaFileId: r.media_file?.id || r.media_file_id || r.mediaFileId,
        url: r.url || '',
        sizeMb: r.media_file?.size_bytes ? parseFloat((r.media_file.size_bytes / (1024 * 1024)).toFixed(2)) : undefined,
        status: 'ready' as const,
      }));
    }
    return [];
  })();

  const [pendingResources, setPendingResources] = useState<PendingResource[]>(initialPendingResources);



  // Helpers
  const parsedEmbed = useMemo(
    () => (type === 'video' && mediaSource === 'URL' ? parseEmbedVideoUrl(mediaUrl) : null),
    [type, mediaSource, mediaUrl]
  );
  const attachedResources = lesson?.content?.resources || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation check
    if (type === 'video' && !file.type.startsWith('video/')) {
      setUrlError('Please select a valid video file (MP4, WEBM).');
      return;
    }
    if (type === 'audio' && !file.type.startsWith('audio/')) {
      setUrlError('Please select a valid audio file (MP3, WAV, AAC).');
      return;
    }
    if (type === 'image' && !file.type.startsWith('image/')) {
      setUrlError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setUrlError('');
    setIsUploadingFile(true);
    setUploadProgress(20);

    try {
      setUploadProgress(50);
      const targetLessonUuid = lesson?.uuid || (lesson as any)?.id;
      const media = await coursesService.uploadMedia(file, currentCourseUuid, targetLessonUuid, hlsEnabled);
      setUploadProgress(100);
      setUploadedMediaId(media.id);
      setUploadedFileObj({
        name: media.original_filename || file.name,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1),
        url: (media as any)?.stream_url || media.url,
      });
    } catch (err: any) {
      setUrlError(err?.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedMediaId(null);
    setUploadedFileObj(null);
    setUrlError('');
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // 1. Title check
    if (!title.trim()) {
      setTitleError('Lesson title is required.');
      isValid = false;
    } else {
      setTitleError('');
    }

    const effectiveSource = canUseUrlSource ? mediaSource : 'UPLOAD';

    // 2. Content check for media types
    if (type === 'video' || type === 'audio' || type === 'image' || type === 'document') {
      if (effectiveSource === 'UPLOAD') {
        if (!uploadedMediaId && !uploadedFileObj) {
          setUrlError(`Please upload a valid ${meta.label} file.`);
          isValid = false;
        } else {
          setUrlError('');
        }
      } else {
        if (!mediaUrl.trim()) {
          setUrlError(`Please enter a valid ${meta.label} URL.`);
          isValid = false;
        } else if (!isValidHttpUrl(mediaUrl)) {
          setUrlError('Please enter a valid URL starting with http:// or https://');
          isValid = false;
        } else {
          setUrlError('');
        }
      }
    } else if (type === 'text') {
      if (isHtmlContentEmpty(textContent)) {
        setContentError('Lesson rich text content is required.');
        isValid = false;
      } else {
        setContentError('');
      }
    } else if (type === 'quiz') {
      const errors: Record<string, string> = {};
      let firstInvalidId = '';

      if (!quizQuestions || quizQuestions.length === 0) {
        setContentError('At least one quiz question is required.');
        isValid = false;
      } else {
        setContentError('');
        quizQuestions.forEach((q) => {
          if (!q.questionText || !q.questionText.trim()) {
            errors[q.id] = 'Question statement is required.';
            if (!firstInvalidId) firstInvalidId = q.id;
          } else if (q.type === 'single_choice' || q.type === 'mcq' || q.type === 'multiple_choice') {
            const validOpts = q.options.filter((o) => o.text && o.text.trim());
            if (validOpts.length < 2) {
              errors[q.id] = 'Multiple Choice requires at least 2 non-empty options.';
              if (!firstInvalidId) firstInvalidId = q.id;
            } else if (!q.correctAnswer || !q.correctAnswer.trim()) {
              errors[q.id] = 'Select the correct answer for this question.';
              if (!firstInvalidId) firstInvalidId = q.id;
            }
          } else if (q.type === 'true_false') {
            if (!q.correctAnswer || !q.correctAnswer.trim()) {
              errors[q.id] = 'Select the correct answer for this question.';
              if (!firstInvalidId) firstInvalidId = q.id;
            }
          }
        });
      }

      setQuestionErrors(errors);
      if (Object.keys(errors).length > 0) {
        isValid = false;
      }
    } else if (type === 'assignment' || type === 'project') {
      if (isHtmlContentEmpty(instructions)) {
        setContentError(`${meta.label} instructions are required.`);
        isValid = false;
      } else {
        setContentError('');
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setTimeout(() => {
        const errorInput = document.querySelector('[aria-invalid="true"]') || document.getElementById('media-url-input');
        if (errorInput) {
          errorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (errorInput as HTMLElement).focus?.();
        }
      }, 100);
      return;
    }

    setIsSaving(true);

    try {
      let effectiveAllowDownload = false;
      if (type === 'document') {
        effectiveAllowDownload = allowDownload;
      }

      let contentPayload: Record<string, unknown> = {
        resources: attachedResources,
        allowDownload: effectiveAllowDownload,
      };

      const effectiveSource = canUseUrlSource ? mediaSource : 'UPLOAD';

      if (type === 'video' || type === 'audio' || type === 'image' || type === 'document') {
        if (effectiveSource === 'UPLOAD') {
          contentPayload = {
            ...contentPayload,
            sourceMode: 'UPLOAD',
            mediaFileId: uploadedMediaId,
            mediaFile: uploadedFileObj,
            videoUrl: uploadedFileObj?.url || '',
            audioUrl: uploadedFileObj?.url || '',
            imageUrl: uploadedFileObj?.url || '',
            documentUrl: uploadedFileObj?.url || '',
            caption: type === 'image' ? caption.trim() : undefined,
          };
        } else {
          contentPayload = {
            ...contentPayload,
            sourceMode: 'URL',
            mediaUrl: mediaUrl.trim(),
            externalUrl: mediaUrl.trim(),
            videoUrl: type === 'video' ? mediaUrl.trim() : undefined,
            audioUrl: type === 'audio' ? mediaUrl.trim() : undefined,
            imageUrl: type === 'image' ? mediaUrl.trim() : undefined,
            documentUrl: type === 'document' ? mediaUrl.trim() : undefined,
            caption: type === 'image' ? caption.trim() : undefined,
          };
        }
      } else if (type === 'text') {
        const cleanHtml = sanitizeHtml(textContent);
        contentPayload = {
          ...contentPayload,
          textContent: cleanHtml,
          body: cleanHtml,
        };
      } else if (type === 'quiz') {
        contentPayload = {
          ...contentPayload,
          passingScore,
          timeLimitMinutes,
          maxAttempts,
          questions: quizQuestions.map((q) => ({
            id: q.id,
            type: q.type,
            questionText: q.questionText.trim(),
            options:
              q.type === 'single_choice' || q.type === 'mcq' || q.type === 'multiple_choice'
                ? q.options.map((opt) => {
                    const isCorr = q.correctAnswer === opt.id || q.correctAnswer === opt.text;
                    return {
                      id: opt.id,
                      text: opt.text.trim(),
                      is_correct: isCorr,
                      isCorrect: isCorr,
                    };
                  })
                : undefined,
            correctAnswer: q.correctAnswer,
          })),
        };
      } else if (type === 'assignment' || type === 'project') {
        if (dueDays !== null && (isNaN(dueDays) || dueDays < 1)) {
          setDueDaysError('Due Day must be at least 1.');
          setIsSaving(false);
          return;
        }

        const assignmentPayload: CreateAssignmentInput = {
          title: title.trim(),
          instructions: instructions.trim(),
          due_days: dueDays,
          max_marks: maxScore,
          allow_text_submission: submissionType === 'text' || submissionType === 'both',
          allow_file_submission: submissionType === 'file' || submissionType === 'both',
          allow_url_submission: true,
        };

        contentPayload = {
          ...contentPayload,
          instructions: instructions.trim(),
          maxScore,
          dueDays,
          submissionType,
          allowUrlSubmission,
          assignmentPayload,
        };
      }

      let processedResourcesPayload: Array<Record<string, unknown>> = [];
      if (pendingResources.length > 0) {
        processedResourcesPayload = await Promise.all(
          pendingResources.map(async (res) => {
            let finalMediaId = res.mediaFileId;
            if (res.file && !finalMediaId) {
              try {
                const uploadedMedia = await storageService.uploadFile(
                  res.file,
                  currentCourseUuid || lesson?.courseUuid || ''
                );
                finalMediaId = uploadedMedia.id;
              } catch (uploadErr) {
                console.error('Failed to upload resource file:', uploadErr);
                throw new Error(`Failed to upload resource file "${res.title}".`);
              }
            }
            return {
              media_file_id: finalMediaId || null,
              title: res.title,
              url: res.url || '',
              resource_type: res.resourceType,
              allow_download: true,
            };
          })
        );
      }

      contentPayload = {
        ...contentPayload,
        resources: processedResourcesPayload,
      };

      const savedResult = await onSaveLesson({
        moduleUuid: selectedModuleUuid,
        title: title.trim(),
        description: description.trim(),
        type,
        status: lesson?.status || 'published',
        durationMinutes,
        isDemo: Boolean(isDemo),
        is_locked: Boolean(isLocked),
        isLocked: Boolean(isLocked),
        allowDownload: effectiveAllowDownload,
        content: contentPayload,
      });

      const returnedUuid = (savedResult as any)?.uuid || (savedResult as any)?.id;
      if (returnedUuid && isCreateMode && (type === 'assignment' || type === 'project')) {
        setSavedLessonUuid(String(returnedUuid));
      }
    } catch (err) {
      console.error('Save lesson failed in editor:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  const isDocPdf =
    type === 'document' &&
    (mediaUrl.toLowerCase().includes('.pdf') || mediaUrl.toLowerCase().endsWith('.pdf'));

  const getCleanDocFileName = (urlStr: string) => {
    if (!urlStr) return 'Document File';
    try {
      const parsed = new URL(urlStr);
      const pathname = parsed.pathname;
      const filename = pathname.split('/').pop();
      return filename ? decodeURIComponent(filename) : 'Document File';
    } catch {
      return urlStr.split('/').pop() || 'Document File';
    }
  };
  if (savedLessonUuid) {
    return (
      <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm text-center space-y-5 my-8 font-sans">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Assignment Saved Successfully!
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            You can add supporting learning resources (files, documents, templates) now or return to your curriculum.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Button
            type="button"
            onClick={() =>
              navigate(
                `/courses/${currentCourseUuid || lesson?.courseUuid}/curriculum/lessons/${savedLessonUuid}/resources?moduleUuid=${selectedModuleUuid}`
              )
            }
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-primary-foreground, #FFFFFF)',
            }}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add Resources
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/courses/${currentCourseUuid || lesson?.courseUuid}/curriculum`)}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] shrink-0 min-h-[44px]"
          >
            Back to Curriculum
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form id="lesson-form" onSubmit={handleSubmit} className="w-full max-w-[1100px] mx-auto space-y-3 sm:space-y-4 font-sans text-left pb-32 md:pb-24 min-w-0">
      {/* Missing module notice */}
      {!selectedModuleUuid && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>No section selected. Please select a section for this lesson.</span>
        </div>
      )}

      {/* Main Grid: Single Column on Mobile, Responsive 2-Column Grid on Desktop ONLY when real video exists */}
      <div className={`grid grid-cols-1 ${parsedEmbed || uploadedFileObj?.url ? 'lg:grid-cols-12' : ''} gap-3 sm:gap-4 items-start`}>
        
        {/* Left / Main Column */}
        <div className={`${parsedEmbed || uploadedFileObj?.url ? 'lg:col-span-8' : 'w-full'} space-y-3 sm:space-y-4 min-w-0`}>
          
          {/* 1. BASIC INFORMATION */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] sm:rounded-[14px] p-3 sm:p-4 space-y-3 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight">
              Basic Information
            </h3>

            {/* Lesson Title */}
            <div className="space-y-1 min-w-0">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Lesson Title <span className="text-rose-500">*</span>
              </label>
              <Input
                id="lesson-title-input"
                value={title}
                autoFocus
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) setTitleError('');
                }}
                placeholder="Introduction to Web Development"
                className="h-[46px] sm:h-[48px] text-xs sm:text-sm font-medium rounded-[10px] bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] placeholder:[var(--text-muted)] w-full"
                error={titleError}
              />
            </div>

            {/* Description */}
            <div className="space-y-1 min-w-0">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Description
              </label>
              {type === 'text' ? (
                <div className="w-full min-w-0 overflow-hidden">
                  <RichTextEditor
                    value={textContent}
                    onChange={(val) => {
                      setTextContent(val);
                      if (!isHtmlContentEmpty(val)) setContentError('');
                    }}
                    placeholder="Write a description for this lesson..."
                    minHeight="100px"
                  />
                </div>
              ) : (
                <div className="w-full min-w-0 overflow-hidden">
                  <RichTextEditor
                    value={description}
                    onChange={(val) => setDescription(val)}
                    placeholder="Write a description for this lesson..."
                    minHeight="100px"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. MEDIA CONTENT */}
          {(type === 'video' || type === 'audio' || type === 'image' || type === 'document') && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] sm:rounded-[14px] p-3 sm:p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight">
                  {meta.label} Lesson Content
                </h3>

                {/* HLS Toggle for Video Uploads */}
                {type === 'video' && mediaSource === 'UPLOAD' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Adaptive HLS</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={hlsEnabled}
                        disabled={isUploadingFile}
                        onChange={(e) => setHlsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-[var(--surface-secondary)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--brand-primary)]" />
                    </label>
                  </div>
                )}
              </div>

              {/* Source Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setMediaSource('UPLOAD');
                    setUrlError('');
                  }}
                  className={`py-1.5 px-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
                    mediaSource === 'UPLOAD'
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Upload {meta.label}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaSource('URL');
                    setUrlError('');
                  }}
                  className={`py-1.5 px-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
                    mediaSource === 'URL'
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {meta.label} URL
                </button>
              </div>

              {/* Upload Mode Area */}
              {mediaSource === 'UPLOAD' && (
                <div>
                  {!uploadedFileObj ? (
                    <div className="relative border-2 border-dashed border-[var(--border)] hover:border-[var(--brand-primary)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] rounded-[10px] p-3 sm:p-4 text-center transition-all min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={isUploadingFile}
                        accept={
                          type === 'video'
                            ? 'video/*'
                            : type === 'audio'
                            ? 'audio/*'
                            : type === 'image'
                            ? 'image/*'
                            : '.pdf,.doc,.docx,.ppt,.pptx,.zip'
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                          {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">
                            {isUploadingFile
                              ? `Uploading ${meta.label.toLowerCase()}...`
                              : `Tap to upload ${meta.label.toLowerCase()} or drag and drop`}
                          </p>
                        </div>
                        {isUploadingFile && (
                          <div className="w-full max-w-xs bg-[var(--border)] h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div className="bg-[var(--brand-primary)] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[10px] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <strong className="text-xs text-[var(--text-primary)] block truncate font-bold">
                            {uploadedFileObj.name}
                          </strong>
                          <span className="text-[11px] text-[var(--text-secondary)]">
                            {uploadedFileObj.sizeMb} MB • Ready
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={handleRemoveUploadedFile}
                        className="text-rose-500 hover:bg-rose-500/10 font-bold shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* URL Input Mode Area */}
              {mediaSource === 'URL' && (
                <div className="space-y-1.5 min-w-0">
                  <label className="block text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>{meta.label} URL</span>
                  </label>
                  <Input
                    id="media-url-input"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      if (e.target.value.trim()) setUrlError('');
                    }}
                    placeholder={
                      type === 'audio'
                        ? 'https://example.com/audio.mp3 or Soundcloud URL'
                        : type === 'video'
                        ? 'https://www.youtube.com/embed/VIDEO_ID or direct MP4 URL'
                        : `https://example.com/${type.toLowerCase()}-url`
                    }
                    className="h-[46px] sm:h-[48px] text-xs sm:text-sm font-medium rounded-[10px] bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] placeholder:[var(--text-muted)] w-full"
                    error={urlError}
                  />
                  {parsedEmbed && (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-[8px] text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Provider: <strong>{parsedEmbed.provider}</strong>
                      </span>
                      <Badge variant="success" size="sm" className="text-[10px]">Ready</Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. LESSON SETTINGS */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] sm:rounded-[14px] p-3 sm:p-4 space-y-3 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight">
              Lesson Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {/* Status Selector */}
              <div className="space-y-1 min-w-0">
                <label className="block text-xs font-bold text-[var(--text-primary)]">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="p-2.5 rounded-[10px] border border-[var(--brand-primary)] bg-[var(--surface-secondary)] ring-1.5 ring-[var(--brand-primary)]/30 text-left flex items-center gap-2 cursor-pointer h-[46px]"
                  >
                    <div className="w-4 h-4 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">Published</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {}}
                    className="p-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-secondary)] text-left flex items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 h-[46px]"
                  >
                    <div className="w-4 h-4 rounded-full border border-[var(--text-muted)] shrink-0" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">Draft</span>
                  </button>
                </div>
              </div>

              {/* Free Preview Toggle */}
              {showFreeDemoOption && (
                <div className="space-y-1 min-w-0">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Free Preview
                  </label>
                  <div className="p-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between gap-3 h-[46px]">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Allow Free Preview</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={isDemo}
                        onChange={(e) => {
                          setIsDemo(e.target.checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--brand-primary)]" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QUIZ LESSON BUILDER */}
          {type === 'quiz' && (
            <div className="space-y-3 sm:space-y-4">
              {/* Quiz Settings Card */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] sm:rounded-[14px] p-3 sm:p-4 space-y-3 shadow-xs font-sans text-left">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    Quiz Settings
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                    Configure passing thresholds and limits.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Passing Score */}
                  <div className="space-y-1 min-w-0">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      Passing Score (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      placeholder="70"
                      className="h-[44px] sm:h-[46px] text-xs sm:text-sm font-medium rounded-[10px] bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] w-full"
                    />
                  </div>

                  {/* Time Limit */}
                  <div className="space-y-1 min-w-0">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      Time Limit (Minutes)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={timeLimitMinutes ?? ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setTimeLimitMinutes(val ? Number(val) : undefined);
                      }}
                      placeholder="No limit"
                      className="h-[44px] sm:h-[46px] text-xs sm:text-sm font-medium rounded-[10px] bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] w-full"
                    />
                  </div>

                  {/* Attempts Allowed */}
                  <div className="space-y-1 min-w-0">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      Attempts Allowed
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={maxAttempts ?? ''}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setMaxAttempts(val ? Number(val) : undefined);
                      }}
                      placeholder="Unlimited"
                      className="h-[44px] sm:h-[46px] text-xs sm:text-sm font-medium rounded-[10px] bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] w-full"
                    />
                    <span className="text-[10px] text-[var(--text-secondary)] block">Number of attempts allowed</span>
                  </div>
                </div>

                {/* Advanced Settings Collapsible Toggle */}
                <div className="pt-1 border-t border-[var(--border)] mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedQuizSettings((prev) => !prev)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>Advanced Settings</span>
                    {showAdvancedQuizSettings ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showAdvancedQuizSettings && (
                    <div className="pt-2 text-xs text-[var(--text-secondary)] font-medium">
                      <p>Standard assessment configuration active.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quiz Questions Section */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] sm:rounded-[14px] p-3 sm:p-4 shadow-xs">
                <QuizQuestionBuilder
                  questions={quizQuestions}
                  onChange={setQuizQuestions}
                  errors={questionErrors}
                />
              </div>
            </div>
          )}

          {/* Staged & Attached Resources Section */}
          <LessonResourcesEditor
            resources={pendingResources}
            onChangeResources={setPendingResources}
            courseUuid={currentCourseUuid || lesson?.courseUuid}
          />
        </div>

        {/* Right Column - REAL Video Preview Box (Desktop Only when video exists) */}
        {(parsedEmbed || uploadedFileObj?.url) && (
          <div className="lg:col-span-4 space-y-4 min-w-0 hidden lg:block">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] sm:rounded-[16px] p-4 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Video Preview
              </h3>

              <div className="aspect-video w-full rounded-[10px] bg-[var(--surface-secondary)] border border-[var(--border)] flex flex-col items-center justify-center overflow-hidden">
                {parsedEmbed ? (
                  <iframe
                    src={parsedEmbed.embedUrl}
                    title="Video Preview"
                    className="w-full h-full rounded-lg border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={uploadedFileObj?.url} controls className="w-full h-full rounded-lg object-contain" />
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. RESPONSIVE ACTIONS */}
      <LessonFormActions
        formId="lesson-form"
        isCreateMode={isCreateMode}
        isSaving={isSaving}
        onCancel={handleCancelClick}
      />
    </form>
  );
};


