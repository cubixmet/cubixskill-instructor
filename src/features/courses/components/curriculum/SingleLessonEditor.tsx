import React, { useState } from 'react';
import {
  Video,
  Headphones,
  Files,
  Image as ImageIcon,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  FileText,
  Clock,
  Sparkles,
  Download,
  Calendar,
  Link2,
  Upload,
  Loader2,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { AudioPlayer } from '../../../../components/ui/AudioPlayer';
import type { CourseLesson, LessonType } from '../../../../types/curriculum.types';
import { getLessonTypeMeta } from '../../config/lessonTypes.config';
import { RichTextEditor } from './RichTextEditor';
import { isHtmlContentEmpty, sanitizeHtml } from '../../utils/sanitizeHtml.util';
import { resolveMediaUrl } from '../../../../utils/media.utils';
import {
  QuizQuestionBuilder,
  BuilderQuestion,
  createDefaultQuestion,
} from './QuizQuestionBuilder';
import { LessonResourcesSection } from './LessonResourcesSection';
import { parseEmbedVideoUrl } from './VideoLessonSettings';
import { useCurriculumStore } from '../../store/curriculum.store';
import { coursesService } from '../../../../services/courses.service';

interface SingleLessonEditorProps {
  type: LessonType;
  moduleTitle?: string;
  moduleUuid?: string;
  onSaveLesson: (updated: Partial<CourseLesson>) => void;
  onCancel?: () => void;
  lesson?: CourseLesson;
  isCreateMode?: boolean;
}

const preloadBuilderQuestions = (rawQuestions?: Record<string, unknown>[]): BuilderQuestion[] => {
  if (!rawQuestions || !Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    return [createDefaultQuestion()];
  }

  return rawQuestions.map((q, idx) => {
    const qId = (q.id as string) || `q-${idx}-${Date.now()}`;
    const qType =
      q.type === 'true_false' || q.type === 'short_answer' ? q.type : 'mcq';
    const questionText = (q.questionText as string) || (q.question as string) || '';

    let options: { id: string; text: string }[] = [];
    if (Array.isArray(q.options)) {
      options = q.options.map((opt: unknown, optIdx: number) => {
        if (typeof opt === 'string') {
          return { id: `opt-${optIdx + 1}-${qId}`, text: opt };
        }
        const objOpt = opt as { id?: string; text?: string };
        return {
          id: objOpt.id || `opt-${optIdx + 1}-${qId}`,
          text: objOpt.text || '',
        };
      });
    }

    if (qType === 'mcq' && options.length < 2) {
      options = [
        { id: `opt-1-${qId}`, text: '' },
        { id: `opt-2-${qId}`, text: '' },
      ];
    }

    const correctAnswer =
      q.correctAnswer || q.correctAnswers || (options[0]?.id || 'True');

    return {
      id: qId,
      type: qType,
      questionText,
      options,
      correctAnswer: String(correctAnswer),
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

  // Errors
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});

  // Content Source State for Video, Audio, Document, Image
  const initialMediaSource = lesson?.content?.mediaFile || lesson?.content?.mediaFileId ? 'UPLOAD' : 'URL';
  const [mediaSource, setMediaSource] = useState<'UPLOAD' | 'URL'>(initialMediaSource);

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
    preloadBuilderQuestions(lesson?.content?.questions)
  );
  const [passingScore, setPassingScore] = useState<number>(
    (lesson?.content as Record<string, unknown>)?.passingScore
      ? Number((lesson?.content as Record<string, unknown>).passingScore)
      : 70
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>(
    (lesson?.content as Record<string, unknown>)?.timeLimitMinutes
      ? Number((lesson?.content as Record<string, unknown>).timeLimitMinutes)
      : undefined
  );
  const [maxAttempts, setMaxAttempts] = useState<number | undefined>(
    (lesson?.content as Record<string, unknown>)?.maxAttempts
      ? Number((lesson?.content as Record<string, unknown>).maxAttempts)
      : undefined
  );

  // Assignment & Project State
  const [instructions, setInstructions] = useState(
    lesson?.content?.instructions || ''
  );
  const [dueDate, setDueDate] = useState<string>(
    (lesson?.content as Record<string, unknown>)?.dueDate
      ? String((lesson?.content as Record<string, unknown>).dueDate)
      : ''
  );
  const [maxScore, setMaxScore] = useState(lesson?.content?.maxScore ?? 100);
  const [submissionType, setSubmissionType] = useState<'file' | 'text' | 'both'>(
    lesson?.content?.submissionType || 'file'
  );
  const [allowUrlSubmission] = useState(true);

  // Helpers
  const showFreeDemoOption = type === 'video';
  const showAllowDownloadOption = type === 'document';
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
      const media = await coursesService.uploadMedia(file);
      setUploadProgress(100);
      setUploadedMediaId(media.id);
      setUploadedFileObj({
        name: media.original_filename || file.name,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1),
        url: media.url,
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

    // 2. Content check for media types
    if (type === 'video' || type === 'audio' || type === 'image' || type === 'document') {
      if (mediaSource === 'UPLOAD') {
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
          } else if (q.type === 'mcq') {
            const validOpts = q.options.filter((o) => o.text && o.text.trim());
            if (validOpts.length < 2) {
              errors[q.id] = 'Multiple Choice requires at least 2 non-empty options.';
              if (!firstInvalidId) firstInvalidId = q.id;
            } else if (!q.correctAnswer) {
              errors[q.id] = 'Please select a correct answer option.';
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

  const handleSubmit = (e: React.FormEvent) => {
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

    let effectiveAllowDownload = false;
    if (type === 'document') {
      effectiveAllowDownload = allowDownload;
    }

    let contentPayload: Record<string, unknown> = {
      resources: attachedResources,
      allowDownload: effectiveAllowDownload,
    };

    if (type === 'video' || type === 'audio' || type === 'image' || type === 'document') {
      if (mediaSource === 'UPLOAD') {
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
            q.type === 'mcq'
              ? q.options.map((opt) => ({ id: opt.id, text: opt.text.trim() }))
              : undefined,
          correctAnswer: q.correctAnswer,
        })),
      };
    } else if (type === 'assignment' || type === 'project') {
      contentPayload = {
        ...contentPayload,
        instructions: instructions.trim(),
        maxScore,
        dueDate,
        submissionType,
        allowUrlSubmission,
      };
    }

    onSaveLesson({
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

    setIsSaving(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans max-w-4xl mx-auto pb-36 md:pb-12 w-full min-w-0 px-1 md:px-0">
      {/* Top Header Card */}
      <div className="p-3.5 sm:p-5 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs space-y-4 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#263244] pb-3.5 w-full min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 w-full">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] border border-blue-100 dark:border-[#263244] flex items-center justify-center shrink-0 shadow-2xs">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {isCreateMode ? `Create ${meta.label}` : `Edit ${meta.label}`}
                </h3>
                <Badge variant="primary" size="sm" className="text-xs px-2 py-0.5">
                  {meta.label}
                </Badge>
              </div>

              {/* Explicit Module Selector Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mt-2 sm:mt-1 w-full min-w-0">
                <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium shrink-0">
                  <Layers className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                  <span>Target Module:</span>
                </div>
                <select
                  value={selectedModuleUuid}
                  onChange={(e) => setSelectedModuleUuid(e.target.value)}
                  className="w-full sm:w-auto min-w-0 max-w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] cursor-pointer truncate"
                >
                  {activeModules.map((mod, idx) => {
                    const count = allLessons.filter((l) => l.moduleUuid === mod.uuid).length;
                    return (
                      <option key={mod.uuid} value={mod.uuid} className="dark:bg-[#111827] truncate">
                        Module #{idx + 1}: {mod.title} ({count} {count === 1 ? 'lesson' : 'lessons'})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Single Page Editor / Student Preview Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-[#F8FAFC] dark:bg-[#0F172A] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#263244] w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setEditorMode('editor')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center whitespace-normal leading-tight ${
                editorMode === 'editor'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Editor Controls</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('preview')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center whitespace-normal leading-tight ${
                editorMode === 'preview'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>Student Preview</span>
            </button>
          </div>
        </div>

        {/* 1. COMMON LESSON FIELDS (TOP SECTION) */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] mb-1">
              Lesson Title <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
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
            <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] mb-1">
              Short Description <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Concise summary of what students will learn in this unit..."
              rows={2}
              className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#2563EB]/10 dark:focus:ring-[#3B82F6]/10 transition-all resize-y font-normal"
            />
          </div>

          {/* Quick Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {/* Field: Duration */}
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl space-y-1">
              <label className="text-[11px] font-semibold text-[#0F172A] dark:text-[#CBD5E1] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Duration (Mins)</span>
              </label>
              <input
                type="number"
                min={1}
                max={600}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                className="w-full h-8 px-2.5 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>

            {/* Field: Free Trial / Demo Toggle (Only for Video Lessons) */}
            {showFreeDemoOption && (
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">Free Demo / Trial</span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Trial preview for non-enrolled</span>
                </div>
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="w-4 h-4 text-[#2563EB] rounded cursor-pointer accent-[#2563EB]"
                />
              </div>
            )}

            {/* Field: Allow Download Toggle (Only for Document Lessons) */}
            {showAllowDownloadOption && (
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#CBD5E1] block">Allow Download</span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Permit learners to save/download the uploaded file</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 text-[#2563EB] rounded cursor-pointer accent-[#2563EB]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. TYPE-SPECIFIC CONTENT EDITOR SECTION */}
      {editorMode === 'editor' && (
        <div className="p-4 sm:p-5 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs space-y-4">
          <div className="border-b border-[#E2E8F0] dark:border-[#263244] pb-2 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Lesson Content Configuration
              </h4>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
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
                </div>
              </div>

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
                      <span>{meta.label} Content URL</span> <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
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
                          ? 'https://domain.com/audio/lesson-01.mp3'
                          : type === 'image'
                          ? 'https://domain.com/images/diagram.png'
                          : 'https://domain.com/docs/handout.pdf'
                      }
                      className="h-11 text-xs sm:text-sm font-medium rounded-xl"
                      error={urlError}
                    />
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      Enter a publicly accessible URL starting with http:// or https://
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
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Rich Text Lesson Content <span className="text-rose-500">*</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Math.min(100, Math.max(1, Number(e.target.value))))}
                    className="w-full h-9 px-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
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
                    className="w-full h-9 px-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
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
                    className="w-full h-9 px-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#0F172A]"
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
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
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
                  className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
                {contentError && (
                  <p id="content-error-box" className="text-xs font-semibold text-rose-600 mt-1">
                    {contentError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                    Max Marks / Score
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={maxScore}
                    onChange={(e) => setMaxScore(Math.max(1, Number(e.target.value)))}
                    className="w-full h-9 px-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Due Date</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-9 px-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                    Submission Format
                  </label>
                  <select
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value as 'file' | 'text' | 'both')}
                    className="w-full h-9 px-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#0F172A] cursor-pointer"
                  >
                    <option value="file">File Upload Only</option>
                    <option value="text">Text Response Only</option>
                    <option value="both">File Upload + Text Response</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Attached Resources Section */}
          <LessonResourcesSection
            courseUuid={currentCourseUuid}
            moduleUuid={selectedModuleUuid}
            lessonUuid={lesson?.id || lesson?.uuid}
            resources={attachedResources}
          />
        </div>
      )}

      {/* 3. STUDENT LIVE PREVIEW SECTION */}
      {editorMode === 'preview' && (
        <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4 text-white font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm" className="bg-blue-600 text-white">
                Student View
              </Badge>
              <h4 className="text-xs font-bold text-slate-200">
                {title || 'Untitled Lesson'}
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Live Render</span>
          </div>

          {/* Video Preview */}
          {type === 'video' && (
            <div>
              {(mediaSource === 'UPLOAD' ? uploadedFileObj?.url : mediaUrl) ? (
                parsedEmbed ? (
                  <div className="aspect-video w-full max-h-96 bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
                    <iframe
                      src={parsedEmbed.embedUrl}
                      title="Video Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full max-h-96 bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
                    <video controls className="w-full h-full object-contain" src={resolveMediaUrl(mediaSource === 'UPLOAD' ? uploadedFileObj?.url : mediaUrl)}>
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )
              ) : (
                <div className="aspect-video w-full max-h-60 bg-slate-850 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <Video className="w-8 h-8 text-slate-600" />
                  <p className="text-xs text-slate-400 font-medium">Upload a video file or enter a video URL above to preview playback here.</p>
                </div>
              )}
            </div>
          )}

          {/* Audio Preview */}
          {type === 'audio' && (
            <AudioPlayer
              src={resolveMediaUrl(mediaSource === 'UPLOAD' ? (uploadedFileObj?.url || '') : mediaUrl)}
              title={uploadedFileObj?.name || 'Audio Content'}
              subtitle={mediaSource === 'UPLOAD' ? uploadedFileObj?.url : mediaUrl}
            />
          )}

          {/* Image Preview */}
          {type === 'image' && (
            <div>
              {(mediaSource === 'UPLOAD' ? uploadedFileObj?.url : mediaUrl) ? (
                <div className="space-y-2 bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <div className="max-h-80 w-full overflow-hidden rounded-lg flex items-center justify-center bg-black">
                    <img
                      src={resolveMediaUrl(mediaSource === 'UPLOAD' ? uploadedFileObj?.url : mediaUrl)}
                      alt={caption || title}
                      className="max-h-80 object-contain rounded-lg"
                    />
                  </div>
                  {caption && <p className="text-xs italic text-slate-300 text-center">{caption}</p>}
                </div>
              ) : (
                <div className="p-6 bg-slate-850 border border-slate-800 rounded-xl text-center text-xs text-slate-400 space-y-1">
                  <ImageIcon className="w-6 h-6 text-slate-600 mx-auto" />
                  <span>Enter an image URL to preview responsive display.</span>
                </div>
              )}
            </div>
          )}

          {/* Document Preview */}
          {type === 'document' && (
            <div>
              {mediaUrl ? (
                isDocPdf ? (
                  <div className="aspect-[4/3] w-full max-h-96 bg-white rounded-xl overflow-hidden border border-slate-700">
                    <iframe
                      src={resolveMediaUrl(mediaUrl)}
                      title="PDF Document Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-7 h-7 text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <strong className="text-xs text-white block truncate">{getCleanDocFileName(mediaUrl)}</strong>
                        <span className="text-[10px] text-slate-400">Document Resource URL</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open / View
                      </a>
                      {allowDownload && (
                        <a
                          href={mediaUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="p-6 bg-slate-850 border border-slate-800 rounded-xl text-center text-xs text-slate-400 space-y-1">
                  <Files className="w-6 h-6 text-slate-600 mx-auto" />
                  <span>Enter a document URL to display document preview.</span>
                </div>
              )}
            </div>
          )}

          {/* Text Preview */}
          {type === 'text' && (
            <div className="bg-white text-slate-900 p-5 rounded-xl border border-slate-700 text-xs sm:text-sm leading-relaxed max-h-80 overflow-y-auto">
              {textContent ? (
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(textContent) }}
                  className="prose max-w-none [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-[#2563EB] [&_blockquote]:pl-3 [&_blockquote]:bg-slate-50 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                />
              ) : (
                <p className="text-slate-400 italic text-center py-4">Rich text preview will render here as you type...</p>
              )}
            </div>
          )}

          {/* Quiz Preview */}
          {type === 'quiz' && (
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200">
                  Quiz Questions ({quizQuestions.length})
                </span>
                <span className="text-[10px] text-slate-400">
                  Passing: {passingScore}% • {timeLimitMinutes ? `${timeLimitMinutes} mins` : 'No time limit'}
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-800 rounded-lg text-xs space-y-2 border border-slate-750">
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-slate-200 block font-semibold">
                        Q{idx + 1}. {q.questionText || 'Empty Question'}
                      </strong>
                      <Badge variant="secondary" size="sm" className="text-[9px] uppercase">
                        {q.type}
                      </Badge>
                    </div>

                    {q.type === 'mcq' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-2 rounded border text-[11px] flex items-center justify-between ${
                              q.correctAnswer === opt.id
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                                : 'bg-slate-850 border-slate-700 text-slate-300'
                            }`}
                          >
                            <span>{opt.text || 'Option'}</span>
                            {q.correctAnswer === opt.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignment / Project Preview */}
          {(type === 'assignment' || type === 'project') && (
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 capitalize">
                  {type} Task Specification
                </span>
                <Badge variant="primary" size="sm">
                  {maxScore} Marks
                </Badge>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Instructions</span>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {instructions || 'No instructions provided.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-[#E2E8F0] dark:border-[#263244] p-3 sm:p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancelClick}
            className="text-xs font-semibold text-[#64748B] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] dark:hover:bg-[#172033]"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="h-10 text-xs font-semibold px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs rounded-xl cursor-pointer"
          >
            {isSaving ? 'Saving Lesson...' : isCreateMode ? 'Save Lesson' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
};
