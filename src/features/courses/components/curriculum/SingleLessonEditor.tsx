import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Link2,
  Plus,
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

  // View mode: 'editor' or 'preview'
  const [editorMode, setEditorMode] = useState<'editor' | 'preview'>('editor');

  // Common Fields
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [isDemo, setIsDemo] = useState(lesson?.isDemo || false);
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
  const showFreeDemoOption = type === 'video' || type === 'audio';
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
  const parsedEmbed = type === 'video' && mediaSource === 'URL' ? parseEmbedVideoUrl(mediaUrl) : null;
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
        isDemo: showFreeDemoOption ? isDemo : false,
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
    <form id="lesson-form" onSubmit={handleSubmit} className="space-y-5 text-left font-sans max-w-4xl mx-auto pb-44 md:pb-16 w-full min-w-0 px-1 md:px-0">
      {/* Top Header Card */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
        className="p-3.5 sm:p-5 border rounded-2xl shadow-2xs space-y-4 w-full min-w-0"
      >
        <div style={{ borderColor: 'var(--border)' }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 w-full min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 w-full">
            <div
              style={{
                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                color: 'var(--brand-primary)',
                borderColor: 'var(--border)',
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs"
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 style={{ color: 'var(--text-primary)' }} className="text-sm sm:text-base font-semibold truncate">
                  {isCreateMode ? `Create ${meta.label}` : `Edit ${meta.label}`}
                </h3>
                <Badge variant="primary" size="sm" className="text-xs px-2 py-0.5">
                  {meta.label}
                </Badge>
              </div>

              {/* Explicit Module Selector Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mt-2 sm:mt-1 w-full min-w-0">
                <div style={{ color: 'var(--text-muted)' }} className="flex items-center gap-1 text-xs font-medium shrink-0">
                  <Layers style={{ color: 'var(--brand-primary)' }} className="w-3.5 h-3.5 shrink-0" />
                  <span>Section:</span>
                </div>
                <select
                  value={selectedModuleUuid}
                  onChange={(e) => setSelectedModuleUuid(e.target.value)}
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--text-primary)',
                  }}
                  className="w-full sm:w-auto min-w-0 max-w-full font-semibold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer truncate"
                >
                  {activeModules.map((mod, idx) => (
                    <option key={mod.uuid} value={mod.uuid} style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }} className="truncate">
                      Module #{idx + 1}: {mod.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 1. COMMON LESSON FIELDS (TOP SECTION) */}
        <div className="space-y-4">
          <div>
            <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-medium mb-1">
              Lesson Title <span style={{ color: 'var(--brand-primary)' }}>*</span>
            </label>
            <Input
              id="lesson-title-input"
              value={title}
              autoFocus
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError('');
              }}
              placeholder={`e.g. Master ${meta.label} Fundamentals`}
              className="h-11 text-xs sm:text-sm font-medium rounded-xl"
              error={titleError}
            />
          </div>

          <div>
            <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-medium mb-1">
              Short Description <span style={{ color: 'var(--text-muted)' }} className="font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Concise summary of what students will learn in this unit..."
              rows={2}
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
              }}
              className="w-full p-3 rounded-xl text-xs sm:text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all resize-y font-normal"
            />
          </div>

          {/* Quick Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {/* Field: Duration */}
            <div
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
              className="p-3 border rounded-xl space-y-1"
            >
              <label style={{ color: 'var(--text-secondary)' }} className="text-[11px] font-semibold flex items-center gap-1.5">
                <Clock style={{ color: 'var(--brand-primary)' }} className="w-3.5 h-3.5" />
                <span>Duration (Mins)</span>
              </label>
              <input
                type="number"
                min={1}
                max={600}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-primary)',
                }}
                className="w-full h-8 px-2.5 border rounded-lg text-xs font-bold focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            {/* Field: Free Trial / Demo Toggle (Only for Video Lessons) */}
            {showFreeDemoOption && (
              <div
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
                className="p-3 border rounded-xl flex items-center justify-between"
              >
                <div>
                  <span style={{ color: 'var(--text-secondary)' }} className="text-[11px] font-semibold block">Free Demo / Trial</span>
                  <span style={{ color: 'var(--text-muted)' }} className="text-[10px]">Trial preview for non-enrolled</span>
                </div>
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setIsDemo(enabled);
                    if (enabled) {
                      setMediaSource('UPLOAD');
                      setMediaUrl('');
                      setUrlError('');
                    }
                  }}
                  style={{ accentColor: 'var(--brand-primary)' }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </div>
            )}

            {/* Field: Allow Download Toggle (Only for Document Lessons) */}
            {showAllowDownloadOption && (
              <div
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
                className="p-3 border rounded-xl flex items-center justify-between"
              >
                <div>
                  <span style={{ color: 'var(--text-secondary)' }} className="text-[11px] font-semibold block">Allow Download</span>
                  <span style={{ color: 'var(--text-muted)' }} className="text-[10px]">Permit learners to save/download file</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  style={{ accentColor: 'var(--brand-primary)' }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. TYPE-SPECIFIC CONTENT EDITOR SECTION */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
        className="p-4 sm:p-5 border rounded-2xl shadow-2xs space-y-4"
      >
          <div style={{ borderColor: 'var(--border)' }} className="border-b pb-2 flex items-center justify-between">
            <div>
              <h4 style={{ color: 'var(--text-primary)' }} className="text-xs font-semibold uppercase tracking-wider">
                Lesson Content Configuration
              </h4>
              <p style={{ color: 'var(--text-muted)' }} className="text-[11px]">
                Enter media URL, text content, assessment questions, or project criteria.
              </p>
            </div>
          </div>

          {/* A. MEDIA CONTENT SOURCE SELECTOR (FOR VIDEO, AUDIO, IMAGE, DOCUMENT) */}
          {(type === 'video' || type === 'audio' || type === 'image' || type === 'document') && (
            <div className="space-y-4">
              {/* Content Source Mode Switcher */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                  Content Source <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
                </label>
                <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155]">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaSource('UPLOAD');
                      setUrlError('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      mediaSource === 'UPLOAD'
                        ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  {canUseUrlSource && (
                    <button
                      type="button"
                      onClick={() => {
                        setMediaSource('URL');
                        setUrlError('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        mediaSource === 'URL'
                          ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                          : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Use URL</span>
                    </button>
                  )}
                </div>
              </div>

              {/* HLS Video Processing Toggle (Only visible for Video lessons in Upload File mode) */}
              {type === 'video' && mediaSource === 'UPLOAD' && (
                <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                        HLS Video Processing
                      </span>
                      {hlsEnabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          ON
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                          OFF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight">
                      {hlsEnabled
                        ? 'Video will be converted to HLS after upload.'
                        : 'Original uploaded video will be used directly.'}
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={hlsEnabled}
                      disabled={isUploadingFile}
                      onChange={(e) => setHlsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]" />
                  </label>
                </div>
              )}

              {/* UPLOAD FILE MODE */}
              {mediaSource === 'UPLOAD' && (
                <div className="space-y-3">
                  {!uploadedFileObj ? (
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-[#475569] hover:border-[#3B82F6] dark:hover:border-[#3B82F6] bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100/50 dark:hover:bg-[#172033] rounded-2xl p-6 text-center transition-all">
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
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center">
                          {isUploadingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {isUploadingFile ? 'Uploading file to storage...' : `Click or drag ${meta.label} file to upload`}
                          </p>
                          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                            {type === 'video' && 'Supports MP4, WEBM (Max 100MB)'}
                            {type === 'audio' && 'Supports MP3, WAV, AAC (Max 50MB)'}
                            {type === 'image' && 'Supports PNG, JPG, WEBP (Max 10MB)'}
                            {type === 'document' && 'Supports PDF, DOCX, ZIP (Max 25MB)'}
                          </p>
                        </div>
                        {isUploadingFile && (
                          <div className="w-full max-w-xs bg-slate-200 dark:bg-[#1E293B] h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="bg-[#2563EB] dark:bg-[#3B82F6] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#172033] border border-[#334155] rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <strong className="text-xs text-[#F8FAFC] block truncate font-semibold">
                            {uploadedFileObj.name}
                          </strong>
                          <span className="text-[10px] text-[#94A3B8]">
                            {uploadedFileObj.sizeMb} MB • Uploaded & Linked
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={handleRemoveUploadedFile}
                        className="text-[#F87171] hover:bg-rose-950/40 font-semibold"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* URL MODE */}
              {mediaSource === 'URL' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] mb-1 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                      <span>{type === 'audio' ? 'Audio URL' : `${meta.label} Content URL`}</span> <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
                    </label>
                    <Input
                      id="media-url-input"
                      value={mediaUrl}
                      onChange={(e) => {
                        setMediaUrl(e.target.value);
                        if (e.target.value.trim()) setUrlError('');
                      }}
                      placeholder={
                        type === 'video'
                          ? 'https://www.youtube.com/embed/VIDEO_ID or direct MP4 URL'
                          : type === 'audio'
                          ? 'https://example.com/audio/lesson.mp3'
                          : type === 'image'
                          ? 'https://domain.com/images/diagram.png'
                          : 'https://domain.com/docs/handout.pdf'
                      }
                      className="h-11 text-xs sm:text-sm font-medium rounded-xl"
                      error={urlError}
                    />
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium hidden sm:block">
                      {type === 'audio'
                        ? 'Enter a direct link to an audio file such as MP3, M4A, OGG, or WAV.'
                        : 'Enter a publicly accessible URL starting with http:// or https://'}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium sm:hidden">
                      {type === 'audio'
                        ? 'Direct audio file link'
                        : 'Enter a publicly accessible URL starting with http:// or https://'}
                    </p>
                  </div>

                  {parsedEmbed && (
                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Valid Embed Provider: <strong>{parsedEmbed.provider}</strong>
                      </span>
                      <Badge variant="success" size="sm" className="text-[10px]">Ready</Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Image Caption Optional Input */}
              {type === 'image' && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] mb-1">
                    Image Caption <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Explain diagram labels or key visual details for learners..."
                    rows={2}
                    className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                  />
                </div>
              )}

              {urlError && (
                <p className="text-[11px] font-semibold text-[#F87171] mt-1">
                  {urlError}
                </p>
              )}
            </div>
          )}

          {/* E. TEXT LESSON TYPE */}
          {type === 'text' && (
            <div className="space-y-3">
              <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-semibold mb-1">
                Text Lesson Article Content <span style={{ color: 'var(--brand-primary)' }}>*</span>
              </label>
              <RichTextEditor
                value={textContent}
                onChange={(val) => {
                  setTextContent(val);
                  if (!isHtmlContentEmpty(val)) setContentError('');
                }}
                placeholder="Write comprehensive text content, paste code blocks, insert markdown, or format headings..."
                minHeight="280px"
              />
              {contentError && (
                <div id="content-error-box" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{contentError}</span>
                </div>
              )}
            </div>
          )}

          {/* F. QUIZ LESSON TYPE */}
          {type === 'quiz' && (
            <div className="space-y-5">
              <div
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 border rounded-xl"
              >
                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-[11px] font-bold mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Math.min(100, Math.max(1, Number(e.target.value))))}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-primary)',
                    }}
                    className="w-full h-9 px-2.5 border rounded-lg text-xs font-bold focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-[11px] font-bold mb-1">
                    Time Limit (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={timeLimitMinutes || ''}
                    onChange={(e) =>
                      setTimeLimitMinutes(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="No limit"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-primary)',
                    }}
                    className="w-full h-9 px-2.5 border rounded-lg text-xs font-bold placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-[11px] font-bold mb-1">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={maxAttempts || ''}
                    onChange={(e) =>
                      setMaxAttempts(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="Unlimited"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-primary)',
                    }}
                    className="w-full h-9 px-2.5 border rounded-lg text-xs font-bold placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              {contentError && (
                <div id="content-error-box" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{contentError}</span>
                </div>
              )}

              <QuizQuestionBuilder
                questions={quizQuestions}
                onChange={setQuizQuestions}
                errors={questionErrors}
              />
            </div>
          )}

          {/* G. ASSIGNMENT & PROJECT LESSON TYPE */}
          {(type === 'assignment' || type === 'project') && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-[var(--text-primary)]">
                  {type === 'project' ? 'Project Requirements & Guidelines' : 'Assignment Instructions'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => {
                    setInstructions(e.target.value);
                    if (e.target.value.trim()) setContentError('');
                  }}
                  rows={4}
                  placeholder="Detail step-by-step requirements, submission format, grading criteria..."
                  className="w-full p-3 rounded-xl text-xs sm:text-sm bg-[var(--surface-secondary)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all resize-y font-normal"
                />
                {contentError && (
                  <p id="content-error-box" className="text-xs font-semibold text-rose-600 mt-1">
                    {contentError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-[var(--text-secondary)]">
                    Max Marks / Score
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={maxScore}
                    onChange={(e) => setMaxScore(Math.max(1, Number(e.target.value)))}
                    className="w-full h-9 px-2.5 rounded-lg text-xs font-bold bg-[var(--surface-secondary)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 flex items-center gap-1 text-[var(--text-secondary)]">
                    <Clock style={{ color: 'var(--brand-primary)' }} className="w-3.5 h-3.5" />
                    <span>Due Day (Optional)</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      placeholder="e.g. 7"
                      value={dueDays === null ? '' : dueDays}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setDueDays(null);
                          setDueDaysError(null);
                        } else {
                          const parsed = parseInt(val, 10);
                          setDueDays(parsed);
                          if (isNaN(parsed) || parsed < 1) {
                            setDueDaysError('Due Day must be at least 1.');
                          } else {
                            setDueDaysError(null);
                          }
                        }
                      }}
                      className="w-full h-9 pl-2.5 pr-11 rounded-lg text-xs font-bold bg-[var(--surface-secondary)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                    <span className="absolute right-2.5 text-[11px] text-[var(--text-muted)] pointer-events-none font-medium">
                      days
                    </span>
                  </div>
                  {dueDaysError && (
                    <p className="text-[10px] font-semibold text-rose-600 mt-0.5">{dueDaysError}</p>
                  )}
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Number of days students have to complete this assignment.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 text-[var(--text-secondary)]">
                    Submission Format
                  </label>
                  <select
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value as 'file' | 'text' | 'both')}
                    className="w-full h-9 px-2 rounded-lg text-xs font-bold bg-[var(--surface-secondary)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                  >
                    <option value="file">File Upload Only</option>
                    <option value="text">Text Response Only</option>
                    <option value="both">File Upload + Text Response</option>
                  </select>
                </div>
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

      {/* 4. RESPONSIVE LESSON FORM ACTIONS (Container-aligned on Desktop, persistent above navbar on Mobile) */}
      <LessonFormActions
        formId="lesson-form"
        isCreateMode={isCreateMode}
        isSaving={isSaving}
        onCancel={handleCancelClick}
      />
    </form>
  );
};
