import React, { useState } from 'react';
import {
  Files,
  UploadCloud,
  Layers,
  Eye,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import type { CourseLesson, LessonType } from '../../../../types/curriculum.types';
import { getLessonTypeMeta } from '../../config/lessonTypes.config';
import { RichTextEditor } from './RichTextEditor';
import { isHtmlContentEmpty, sanitizeHtml } from '../../utils/sanitizeHtml.util';
import {
  QuizQuestionBuilder,
  BuilderQuestion,
  createDefaultQuestion,
} from './QuizQuestionBuilder';
import { MediaPickerModal } from '../../../../components/media/MediaPickerModal';
import { LessonResourcesSection } from './LessonResourcesSection';
import { useCurriculumStore } from '../../store/curriculum.store';

interface GenericLessonSettingsProps {
  type: LessonType;
  moduleTitle?: string;
  onSaveLesson: (updated: Partial<CourseLesson>) => void;
  lesson?: CourseLesson;
  isCreateMode?: boolean;
}

const preloadBuilderQuestions = (rawQuestions?: Record<string, unknown>[]): BuilderQuestion[] => {
  if (!rawQuestions || !Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    return [createDefaultQuestion()];
  }

  return rawQuestions.map((q, idx) => {
    const qId = (q.id as string) || `q-${idx}-${Date.now()}`;
    const type =
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

    if (type === 'mcq' && options.length < 2) {
      options = [
        { id: `opt-1-${qId}`, text: '' },
        { id: `opt-2-${qId}`, text: '' },
      ];
    }

    const correctAnswer =
      q.correctAnswer || q.correctAnswers || (options[0]?.id || 'True');

    return {
      id: qId,
      type,
      questionText,
      options,
      correctAnswer: String(correctAnswer),
    };
  });
};

export const GenericLessonSettings: React.FC<GenericLessonSettingsProps> = ({
  type,
  moduleTitle = 'Selected Module',
  onSaveLesson,
  lesson,
  isCreateMode = true,
}) => {
  const meta = getLessonTypeMeta(type);
  const Icon = meta.icon || Files;

  const detachResourceFromLesson = useCurriculumStore((state) => state.detachResourceFromLesson);
  const attachedResources = lesson?.content?.resources || [];

  // Stepper state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // General fields
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

  // Content fields for Audio / Document / Image
  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>(
    lesson?.content?.mediaUrl ? 'url' : 'upload'
  );
  const [contentUrl, setContentUrl] = useState(lesson?.content?.mediaUrl || '');
  const [selectedFile, setSelectedFile] = useState<{ name: string; sizeMb: number; url?: string } | null>(
    lesson?.content?.fileUrl
      ? { name: lesson.content.fileUrl, sizeMb: type === 'audio' ? 8 : 5, url: lesson.content.mediaUrl }
      : null
  );
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [textPreviewMode, setTextPreviewMode] = useState<'edit' | 'preview'>('edit');

  // Content for Text Lesson
  const [textContent, setTextContent] = useState(
    lesson?.content?.textContent ||
    lesson?.content?.body ||
    lesson?.content?.article ||
    ''
  );

  // Content for Quiz
  const [quizQuestions, setQuizQuestions] = useState<BuilderQuestion[]>(
    preloadBuilderQuestions(lesson?.content?.questions)
  );
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});

  // Content for Assignment / Project
  const [instructions, setInstructions] = useState(
    lesson?.content?.instructions || ''
  );
  const [maxScore, setMaxScore] = useState(lesson?.content?.maxScore ?? 100);
  const [submissionType, setSubmissionType] = useState<'file' | 'text' | 'both'>(
    lesson?.content?.submissionType || 'file'
  );

  const handleNextFromGeneral = () => {
    if (!title.trim()) {
      setTitleError('Lesson title is required.');
      return;
    }
    setTitleError('');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Lesson title is required.');
      setCurrentStep(1);
      return;
    }
    setTitleError('');

    let contentPayload: Record<string, unknown> = {};

    if (type === 'audio' || type === 'document' || type === 'image') {
      contentPayload = {
        sourceMode,
        fileUrl: sourceMode === 'upload' ? selectedFile?.name : undefined,
        mediaUrl: sourceMode === 'url' ? contentUrl.trim() : undefined,
      };
    } else if (type === 'text') {
      if (isHtmlContentEmpty(textContent)) {
        setContentError('Lesson content is required.');
        setCurrentStep(2);
        return;
      }
      setContentError('');
      const cleanHtml = sanitizeHtml(textContent);
      contentPayload = { textContent: cleanHtml };
    } else if (type === 'quiz') {
      const errors: Record<string, string> = {};
      let firstInvalidId = '';

      if (!quizQuestions || quizQuestions.length === 0) {
        setContentError('At least one question is required.');
        setCurrentStep(2);
        return;
      }

      quizQuestions.forEach((q) => {
        if (!q.questionText || !q.questionText.trim()) {
          errors[q.id] = 'Question statement is required.';
          if (!firstInvalidId) firstInvalidId = q.id;
          return;
        }

        if (q.type === 'mcq') {
          const validOpts = q.options.filter((o) => o.text && o.text.trim());
          if (validOpts.length < 2) {
            errors[q.id] = 'Multiple Choice requires at least 2 non-empty options.';
            if (!firstInvalidId) firstInvalidId = q.id;
            return;
          }
          if (!q.correctAnswer) {
            errors[q.id] = 'Please select the correct answer option.';
            if (!firstInvalidId) firstInvalidId = q.id;
            return;
          }
        } else if (q.type === 'true_false') {
          if (!q.correctAnswer) {
            errors[q.id] = 'Please select the correct answer (True or False).';
            if (!firstInvalidId) firstInvalidId = q.id;
            return;
          }
        } else if (q.type === 'short_answer') {
          if (!q.correctAnswer || !q.correctAnswer.trim()) {
            errors[q.id] = 'Expected answer is required for Short Answer.';
            if (!firstInvalidId) firstInvalidId = q.id;
            return;
          }
        }
      });

      if (Object.keys(errors).length > 0) {
        setQuestionErrors(errors);
        setCurrentStep(2);
        if (firstInvalidId) {
          const el = document.getElementById(`question-card-${firstInvalidId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      setQuestionErrors({});

      contentPayload = {
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
        instructions,
        maxScore,
        submissionType,
      };
    }

    onSaveLesson({
      title: title.trim(),
      description: description.trim(),
      type,
      status: lesson?.status || 'published',
      durationMinutes: lesson?.durationMinutes || 15,
      isDemo: lesson?.isDemo || false,
      content: contentPayload,
    });
  };

  const getPageHeading = () => {
    const action = isCreateMode ? 'Create' : 'Edit';
    if (type === 'quiz') return `${action} Quiz`;
    if (type === 'assignment') return `${action} Assignment`;
    if (type === 'project') return `${action} Project`;
    return `${action} ${meta.label}`;
  };

  const getButtonLabel = () => {
    if (!isCreateMode) return 'Save Changes';
    if (type === 'quiz') return 'Create Quiz';
    if (type === 'assignment') return 'Create Assignment';
    if (type === 'project') return 'Create Project';
    return 'Create Lesson';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans max-w-3xl mx-auto pb-36 md:pb-10 w-full min-w-0 px-1 md:px-0">
      {/* Top Header & Parent Context */}
      <div className="p-3.5 sm:p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0F172A]">{getPageHeading()}</h3>
                <Badge variant="primary" size="sm" className="text-[10px] px-2 py-0.5">
                  {meta.label}
                </Badge>
              </div>
              <p className="text-[11px] text-[#64748B] font-medium flex items-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>
                  {isCreateMode ? 'Adding to: ' : 'Parent module: '}
                  <strong>{moduleTitle}</strong>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Compact 2-Step Stepper Bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentStep === 1
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>General</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (title.trim()) {
                setCurrentStep(2);
              } else {
                setTitleError('Lesson title is required.');
              }
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentStep === 2
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Content</span>
          </button>
        </div>
      </div>

      {/* STEP 1: GENERAL */}
      {currentStep === 1 && (
        <div className="p-4 sm:p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs space-y-4">
          <div className="border-b border-[#E2E8F0] pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              1. General Details
            </h4>
            <p className="text-[11px] text-[#64748B]">Primary details for this learning unit.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Lesson Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={title}
                autoFocus
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) setTitleError('');
                }}
                placeholder={`e.g. ${meta.label} Overview`}
                className="h-11 text-xs sm:text-sm font-medium rounded-xl"
                error={titleError}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Short Description <span className="text-[#64748B] font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a concise overview of what students will cover..."
                rows={3}
                className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition-all resize-y font-normal"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONTENT */}
      {currentStep === 2 && (
        <div className="p-4 sm:p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs space-y-4">
          <div className="border-b border-[#E2E8F0] pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              2. Content
            </h4>
            <p className="text-[11px] text-[#64748B]">
              Configure content for this {meta.label.toLowerCase()}.
            </p>
          </div>

          {/* Media / File Upload types: audio, document, image */}
          {(type === 'audio' || type === 'document' || type === 'image') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    sourceMode === 'upload'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload {type === 'audio' ? 'Audio' : type === 'image' ? 'Image' : 'File'}</span>
                </button>
                {type !== 'audio' && (
                  <button
                    type="button"
                    onClick={() => setSourceMode('url')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      sourceMode === 'url'
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>External URL</span>
                  </button>
                )}
              </div>

              {sourceMode === 'upload' ? (
                <div className="space-y-3">
                  {!selectedFile ? (
                    <div
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="border-2 border-dashed border-[#2563EB]/40 hover:border-[#2563EB] bg-blue-50/20 p-5 rounded-2xl text-center space-y-2 cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-7 h-7 text-[#2563EB] mx-auto" />
                      <div>
                        <strong className="text-xs font-bold text-[#0F172A] block">
                          Choose {type} asset from Media Library or Upload New
                        </strong>
                        <span className="text-[10px] text-[#64748B] block">
                          {type === 'audio' && 'Supports MP3, WAV, AAC'}
                          {type === 'document' && 'Supports PDF, DOCX, PPTX'}
                          {type === 'image' && 'Supports PNG, JPG, WebP, SVG'}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-3 border-[#2563EB] text-[#2563EB] font-semibold mx-auto"
                      >
                        Select / Upload Asset
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-[#0F172A] block truncate">
                            {selectedFile.name}
                          </strong>
                          <span className="text-[10px] text-[#64748B]">
                            {selectedFile.sizeMb} MB • Selected from Media Library
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsMediaPickerOpen(true)}
                          className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          Replace
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                          title="Remove from lesson"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  <MediaPickerModal
                    isOpen={isMediaPickerOpen}
                    onClose={() => setIsMediaPickerOpen(false)}
                    defaultMediaType={
                      type === 'audio' ? 'audio' : type === 'image' ? 'image' : 'document'
                    }
                    title={`Select ${meta.label} Asset`}
                    onSelectAsset={(asset) => {
                      setSelectedFile({
                        name: asset.name,
                        sizeMb: asset.sizeMb,
                        url: asset.url,
                      });
                    }}
                  />

                  {/* IN-PAGE CONTENT PREVIEW & CREDIT STORAGE FOR AUDIO, IMAGE, DOCUMENT */}
                  {selectedFile && (
                    <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                        <span className="font-bold text-[#0F172A] flex items-center gap-1.5 text-xs">
                          <Eye className="w-3.5 h-3.5 text-[#2563EB]" /> {meta.label} Preview
                        </span>
                        <span className="text-[10px] text-[#64748B]">{selectedFile.name}</span>
                      </div>

                      {type === 'image' && (
                        <div className="w-full max-h-80 bg-slate-900/5 rounded-xl border border-[#E2E8F0] p-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={selectedFile.url || contentUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
                            alt={selectedFile.name}
                            className="max-h-72 w-full object-contain rounded-lg shadow-2xs"
                          />
                        </div>
                      )}

                      {type === 'audio' && (
                        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                          <audio
                            controls
                            autoPlay={false}
                            className="w-full h-10 rounded-xl"
                            src={selectedFile.url || contentUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
                          >
                            Your browser does not support inline audio preview.
                          </audio>
                        </div>
                      )}

                      {type === 'document' && (
                        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-2.5 flex-wrap w-full min-w-0">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-bold text-[#0F172A] truncate" title={selectedFile.name}>
                                {selectedFile.name}
                              </h5>
                              <p className="text-[10px] text-[#64748B] font-medium">
                                Document • {selectedFile.sizeMb} MB
                              </p>
                            </div>
                          </div>
                          <a
                            href={selectedFile.url || contentUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 px-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-100 rounded-lg text-[11px] font-bold text-[#2563EB] inline-flex items-center gap-1 shrink-0 w-fit transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Document</span>
                          </a>
                        </div>
                      )}

                      {/* Storage Credits Card */}
                      <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2 font-sans">
                        <div className="flex items-center justify-between text-xs border-b border-[#E2E8F0] pb-1.5">
                          <span className="font-bold text-[#0F172A]">Storage & Credits</span>
                          <span className="text-[10px] text-[#64748B]">Available: <strong>50 Credits</strong></span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-white border border-[#E2E8F0] rounded-lg">
                            <span className="text-[10px] text-[#64748B] block font-semibold">File Size</span>
                            <strong className="text-xs text-[#0F172A]">{selectedFile.sizeMb} MB</strong>
                          </div>

                          <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
                            <span className="text-[10px] text-[#2563EB] block font-semibold">Credits Required</span>
                            <strong className="text-xs text-[#2563EB] font-bold">1 Credit</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    URL / Embed Link
                  </label>
                  <Input
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-11 text-xs sm:text-sm font-medium rounded-xl"
                  />
                </div>
              )}
            </div>
          )}

          {/* Text Lesson Rich Text Editor & Live Preview Toggle */}
          {type === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Article Content <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTextPreviewMode('edit')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      textPreviewMode === 'edit'
                        ? 'bg-white text-[#2563EB] shadow-2xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Edit Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextPreviewMode('preview')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      textPreviewMode === 'preview'
                        ? 'bg-white text-[#2563EB] shadow-2xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Live Preview
                  </button>
                </div>
              </div>

              {textPreviewMode === 'edit' ? (
                <RichTextEditor
                  value={textContent}
                  onChange={(val) => {
                    setTextContent(val);
                    if (!isHtmlContentEmpty(val)) {
                      setContentError('');
                    }
                  }}
                  placeholder="Write lesson content, reading material, instructions, or guidelines for students..."
                  minHeight="min-h-[240px] sm:min-h-[300px]"
                  error={contentError}
                  name="article-content"
                />
              ) : (
                <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl font-sans text-left space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-[#2563EB]" /> Article Live Preview
                    </span>
                    <span className="text-[10px] text-slate-500">Student Reader View</span>
                  </div>
                  {!isHtmlContentEmpty(textContent) ? (
                    <div
                      className="prose max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(textContent) }}
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic">No content written yet. Switch to Edit Content mode to write article material.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quiz Question Builder */}
          {type === 'quiz' && (
            <div className="space-y-4">
              <QuizQuestionBuilder
                questions={quizQuestions}
                onChange={(updated) => {
                  setQuizQuestions(updated);
                  setQuestionErrors({});
                }}
                errors={questionErrors}
              />
            </div>
          )}

          {/* Assignment & Project */}
          {(type === 'assignment' || type === 'project') && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Instructions & Requirements
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Detail what students must submit or complete..."
                  rows={5}
                  className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Maximum Points / Score
                  </label>
                  <Input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Submission Format
                  </label>
                  <select
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value as 'file' | 'text' | 'both')}
                    className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="file">File Upload Only</option>
                    <option value="text">Text Response Only</option>
                    <option value="both">File Upload or Text Response</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* LESSON ATTACHED RESOURCES SECTION */}
          <LessonResourcesSection
            resources={attachedResources}
            courseUuid={lesson?.courseUuid || '550e8400-e29b-41d4-a716-446655440000'}
            moduleUuid={lesson?.moduleUuid}
            lessonUuid={lesson?.uuid}
            onRemoveResource={(resId) => {
              if (lesson?.uuid) {
                detachResourceFromLesson(lesson.uuid, resId);
              }
            }}
          />
        </div>
      )}

      {/* Sticky Mobile Bottom Action Bar (Above App Bottom Nav) / Desktop Action Bar */}
      <div className="fixed md:relative bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 z-35 p-3 md:p-0 bg-white/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-0 border-[#E2E8F0] shadow-lg md:shadow-none flex items-center justify-between gap-3 md:pt-2 max-w-3xl mx-auto">
        {currentStep === 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSaveLesson({ title })}
              className="h-11 md:h-10 text-xs font-bold px-4 md:px-5 shrink-0"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleNextFromGeneral}
              className="h-11 md:h-10 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-xs sm:text-sm font-bold px-5 md:px-6 shadow-md flex-1 md:flex-initial"
            >
              Next: Content
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="h-11 md:h-10 text-xs font-bold px-4 md:px-5 shrink-0"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="h-11 md:h-10 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-xs sm:text-sm font-bold px-5 md:px-6 shadow-md flex-1 md:flex-initial"
            >
              {getButtonLabel()}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};
