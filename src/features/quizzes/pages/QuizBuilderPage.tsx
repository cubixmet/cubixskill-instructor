import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings2,
  ChevronDown as ChevronDownIcon,
  RefreshCw,
  Layers,
  Check,
} from 'lucide-react';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { apiClient } from '../../../api/client';
import { curriculumService } from '../../courses/services/curriculum.service';
import { isValidCourseId } from '../../../utils/courseValidation.utils';
import type { CourseModule, CreateQuizInput, CreateLessonInput } from '../../../types/curriculum.types';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface UIQuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
}

export interface UIQuestion {
  id: string; // crypto.randomUUID() for new, real UUID for existing
  question_type: QuestionType;
  question_text: string;
  explanation: string;
  points: number;
  answer_text: string;
  options: UIQuestionOption[];
}

export interface QuizValidationError {
  field?: string;
  questionIndex?: number;
  message: string;
}

export const QuizBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{ courseId?: string; quizId?: string; lessonId?: string }>();

  // Route Context Resolution
  const routeCourseId = (params.courseId || searchParams.get('courseId') || '').trim();
  const rawModuleUuid = searchParams.get('moduleUuid') || '';
  const quizIdParam = params.quizId || params.lessonId || searchParams.get('quizId') || searchParams.get('lessonId') || '';

  const isCourseValid = isValidCourseId(routeCourseId);

  // Core State
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(quizIdParam));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Section / Module Picker State
  const [allModules, setAllModules] = useState<CourseModule[]>([]);
  const [selectedModuleUuid, setSelectedModuleUuid] = useState<string>(rawModuleUuid);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [passingScore, setPassingScore] = useState<number>(70);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [maxAttempts, setMaxAttempts] = useState<number | ''>('');
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Questions State
  const [questions, setQuestions] = useState<UIQuestion[]>([]);

  // Validation State
  const [validationErrors, setValidationErrors] = useState<QuizValidationError[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refs for scrolling to errors
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const createDefaultQuestion = (type: QuestionType = 'SINGLE_CHOICE'): UIQuestion => {
    let defaultOptions: UIQuestionOption[] = [];
    if (type === 'TRUE_FALSE') {
      defaultOptions = [
        { id: crypto.randomUUID(), option_text: 'True', is_correct: true },
        { id: crypto.randomUUID(), option_text: 'False', is_correct: false },
      ];
    } else if (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') {
      defaultOptions = [
        { id: crypto.randomUUID(), option_text: 'Option A', is_correct: true },
        { id: crypto.randomUUID(), option_text: 'Option B', is_correct: false },
        { id: crypto.randomUUID(), option_text: 'Option C', is_correct: false },
      ];
    }

    return {
      id: crypto.randomUUID(),
      question_type: type,
      question_text: '',
      explanation: '',
      points: 1,
      answer_text: '',
      options: defaultOptions,
    };
  };

  // 1. Initial Load & Curriculum Modules Fetch
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (isCourseValid && routeCourseId) {
        try {
          const fetchedModules = await curriculumService.fetchModules(routeCourseId);
          if (isMounted) {
            setAllModules(fetchedModules);
            if (!selectedModuleUuid && fetchedModules.length > 0) {
              const matched = fetchedModules.find((m) => m.uuid === rawModuleUuid) || fetchedModules[0];
              setSelectedModuleUuid(matched.uuid);
            }
          }
        } catch (err) {
          console.error('[QuizBuilderPage] Error fetching modules:', err);
        }
      }

      // If Editing an existing Quiz/Lesson
      if (quizIdParam) {
        setIsLoading(true);
        setLoadError(null);
        try {
          let quizData: any = null;
          let lessonObj: any = null;

          // Try fetching lesson first (if quizId is a lesson ID)
          try {
            const lessonRes = await apiClient.get(`/api/v1/lessons/${quizIdParam}/`);
            lessonObj = lessonRes.data?.data || lessonRes.data;
            if (lessonObj && lessonObj.quiz) {
              quizData = lessonObj.quiz;
            }
          } catch (e) {
            // Fallback to quiz endpoint
            const quizRes = await apiClient.get(`/api/v1/quizzes/${quizIdParam}/`);
            quizData = quizRes.data?.data || quizRes.data;
          }

          if (!quizData && !lessonObj) {
            throw new Error('Quiz not found.');
          }

          if (isMounted) {
            setTitle(quizData?.title || lessonObj?.title || '');
            setDescription(quizData?.instructions || lessonObj?.description || '');
            setPassingScore(quizData?.passing_score ?? 70);
            setTimeLimitMinutes(quizData?.time_limit_minutes ?? '');
            setMaxAttempts(quizData?.max_attempts ?? '');
            setShuffleQuestions(Boolean(quizData?.shuffle_questions));
            setShowResult(quizData?.show_result ?? true);

            if (lessonObj?.module) {
              setSelectedModuleUuid(typeof lessonObj.module === 'object' ? lessonObj.module.id : lessonObj.module);
            }

            // Populate Questions
            const loadedQuestions = quizData?.questions || [];
            if (Array.isArray(loadedQuestions) && loadedQuestions.length > 0) {
              const formatted: UIQuestion[] = loadedQuestions.map((q: any) => ({
                id: q.id || crypto.randomUUID(),
                question_type: (q.question_type || 'SINGLE_CHOICE').toUpperCase() as QuestionType,
                question_text: q.question_text || '',
                explanation: q.explanation || '',
                points: q.points ?? 1,
                answer_text: q.answer_text || '',
                options: (q.options || []).map((opt: any) => ({
                  id: opt.id || crypto.randomUUID(),
                  option_text: opt.option_text || '',
                  is_correct: Boolean(opt.is_correct),
                })),
              }));
              setQuestions(formatted);
            } else {
              setQuestions([createDefaultQuestion()]);
            }
          }
        } catch (err: any) {
          console.error('[QuizBuilderPage] Error loading quiz:', err);
          if (isMounted) {
            const status = err?.response?.status;
            if (status === 403) setLoadError('Access Denied. You do not have permission to edit this quiz.');
            else if (status === 404) setLoadError('Quiz not found.');
            else setLoadError('Failed to load quiz details. Please try again.');
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else {
        if (isMounted && questions.length === 0) {
          setQuestions([createDefaultQuestion()]);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [quizIdParam, routeCourseId, isCourseValid]);

  // Question Mutators
  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, createDefaultQuestion('SINGLE_CHOICE')]);
    showToast('Question added.');
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      showToast('A quiz must have at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    showToast('Question removed.');
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleTypeChange = (index: number, newType: QuestionType) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        let opts = q.options;
        if (newType === 'TRUE_FALSE') {
          opts = [
            { id: crypto.randomUUID(), option_text: 'True', is_correct: true },
            { id: crypto.randomUUID(), option_text: 'False', is_correct: false },
          ];
        } else if ((q.question_type === 'SHORT_ANSWER' || q.question_type === 'TRUE_FALSE') && (newType === 'SINGLE_CHOICE' || newType === 'MULTIPLE_CHOICE')) {
          opts = [
            { id: crypto.randomUUID(), option_text: 'Option A', is_correct: true },
            { id: crypto.randomUUID(), option_text: 'Option B', is_correct: false },
          ];
        }
        return {
          ...q,
          question_type: newType,
          options: opts,
        };
      })
    );
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptLabel = `Option ${String.fromCharCode(65 + q.options.length)}`;
        return {
          ...q,
          options: [
            ...q.options,
            { id: crypto.randomUUID(), option_text: newOptLabel, is_correct: false },
          ],
        };
      })
    );
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length <= 2) {
          showToast('Multiple choice questions require at least 2 options.');
          return q;
        }
        return {
          ...q,
          options: q.options.filter((_, oIdx) => oIdx !== optIndex),
        };
      })
    );
  };

  const handleToggleCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const isSingleChoice = q.question_type === 'SINGLE_CHOICE' || q.question_type === 'TRUE_FALSE';

        const updatedOptions = q.options.map((opt, oIdx) => {
          if (oIdx === optIndex) {
            return { ...opt, is_correct: isSingleChoice ? true : !opt.is_correct };
          }
          return isSingleChoice ? { ...opt, is_correct: false } : opt;
        });

        return { ...q, options: updatedOptions };
      })
    );
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: QuizValidationError[] = [];

    if (!title.trim()) {
      errors.push({ field: 'title', message: 'Quiz Title is required.' });
    }

    if (isCourseValid && !selectedModuleUuid) {
      errors.push({ field: 'module', message: 'Please select a target Section/Module for this quiz.' });
    }

    if (questions.length === 0) {
      errors.push({ message: 'Quiz must contain at least 1 question.' });
    }

    questions.forEach((q, qIdx) => {
      if (!q.question_text.trim()) {
        errors.push({
          questionIndex: qIdx,
          message: `Question ${qIdx + 1}: Question text is required.`,
        });
      }

      if (q.question_type === 'SINGLE_CHOICE' || q.question_type === 'MULTIPLE_CHOICE' || q.question_type === 'TRUE_FALSE') {
        const validOpts = q.options.filter((o) => o.option_text.trim().length > 0);
        if (validOpts.length < 2) {
          errors.push({
            questionIndex: qIdx,
            message: `Question ${qIdx + 1}: At least 2 options are required.`,
          });
        }

        const hasCorrect = q.options.some((o) => o.is_correct);
        if (!hasCorrect) {
          errors.push({
            questionIndex: qIdx,
            message: `Question ${qIdx + 1}: Select the correct answer.`,
          });
        }
      }
    });

    setValidationErrors(errors);

    if (errors.length > 0) {
      const firstError = errors[0];
      if (firstError.field === 'title' && titleInputRef.current) {
        titleInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleInputRef.current.focus();
      } else if (firstError.questionIndex !== undefined && questionRefs.current[firstError.questionIndex]) {
        questionRefs.current[firstError.questionIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  // Handle Quiz Save
  const handleSaveQuiz = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const quizPayload: CreateQuizInput = {
        title: title.trim(),
        instructions: description.trim(),
        passingScore: passingScore || 70,
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
        maxAttempts: maxAttempts ? Number(maxAttempts) : null,
        shuffleQuestions,
        showResult,
        questions: questions.map((q) => ({
          questionText: q.question_text.trim(),
          question_type: q.question_type,
          points: q.points || 1,
          explanation: q.explanation.trim(),
          answer_text: q.answer_text.trim(),
          options: q.options
            .filter((o) => o.option_text.trim().length > 0)
            .map((o) => ({
              option_text: o.option_text.trim(),
              is_correct: o.is_correct,
            })),
        })),
      };

      if (quizIdParam) {
        // Edit Mode: Update existing Quiz/Lesson
        await apiClient.patch(`/api/v1/lessons/${quizIdParam}/`, {
          title: title.trim(),
          description: description.trim(),
          content: quizPayload,
        });

        showToast('Quiz updated successfully!');
      } else {
        // Create Mode: Attach Quiz Lesson under Module
        if (!isCourseValid || !selectedModuleUuid) {
          throw new Error('Valid Course and Section/Module are required.');
        }

        const lessonPayload: CreateLessonInput = {
          title: title.trim(),
          description: description.trim(),
          type: 'quiz',
          status: 'published',
          durationMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : 0,
          isDemo: false,
          content: {
            quizPayload,
          },
        };

        await curriculumService.createLesson(routeCourseId, selectedModuleUuid, lessonPayload);

        showToast('Quiz created and added to curriculum!');
      }

      if (isCourseValid && routeCourseId) {
        await curriculumService.fetchModules(routeCourseId);
        navigate(`/courses/${routeCourseId}/curriculum`);
      } else {
        navigate('/courses');
      }
    } catch (err: any) {
      console.error('[QuizBuilderPage] Save error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save quiz. Please try again.';
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedModuleObj = allModules.find((m) => m.uuid === selectedModuleUuid);

  if (isLoading) {
    return (
      <FormPageLayout
        title="Quiz Builder"
        subtitle="Loading quiz..."
        backUrl={isCourseValid ? `/courses/${routeCourseId}/curriculum` : '/courses'}
        breadcrumbs={[{ label: 'Courses', url: '/courses' }, { label: 'Quiz Builder' }]}
      >
        <div className="w-full max-w-md mx-auto py-20 text-center space-y-4 font-sans">
          <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Loading Quiz Authoring details...
          </p>
        </div>
      </FormPageLayout>
    );
  }

  if (loadError) {
    return (
      <FormPageLayout
        title="Quiz Builder"
        subtitle="Error Loading Quiz"
        backUrl={isCourseValid ? `/courses/${routeCourseId}/curriculum` : '/courses'}
        breadcrumbs={[{ label: 'Courses', url: '/courses' }, { label: 'Quiz Builder' }]}
      >
        <div className="w-full max-w-lg mx-auto py-16 px-4 text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{loadError}</h2>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Button
              onClick={() => navigate(isCourseValid ? `/courses/${routeCourseId}/curriculum` : '/courses')}
              className="bg-[#2563EB] text-white font-medium"
            >
              {isCourseValid ? 'Back to Curriculum' : 'Back to Courses'}
            </Button>
          </div>
        </div>
      </FormPageLayout>
    );
  }

  const backDestination = isCourseValid ? `/courses/${routeCourseId}/curriculum` : '/courses';

  return (
    <FormPageLayout
      title={quizIdParam ? 'Edit Quiz' : 'Create Quiz'}
      subtitle="Add questions and choose the correct answers."
      backUrl={backDestination}
      breadcrumbs={[
        { label: 'Courses', url: '/courses' },
        ...(isCourseValid ? [{ label: 'Curriculum', url: `/courses/${routeCourseId}/curriculum` }] : []),
        { label: quizIdParam ? 'Edit Quiz' : 'Create Quiz' },
      ]}
    >
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6 font-sans text-left space-y-4 pb-[calc(100px+env(safe-area-inset-bottom,0px))] sm:pb-24 box-border min-w-0">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Validation Errors Banner */}
        {validationErrors.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-2 text-xs w-full min-w-0 box-border">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Please resolve the following errors before saving:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {validationErrors.map((err, i) => (
                <li key={`val-err-${i}`}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* PAGE HEADER NAVIGATION */}
        {isCourseValid && (
          <div className="flex items-center justify-end gap-2.5 w-full min-w-0">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] hidden sm:inline shrink-0">
              Target Section:
            </span>
            <button
              type="button"
              onClick={() => setIsModuleModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] text-xs font-bold hover:bg-[var(--brand-primary)]/20 flex items-center gap-1.5 cursor-pointer min-w-0"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                {selectedModuleObj?.title || 'Select Section'}
              </span>
              <span className="text-[10px] bg-[var(--brand-primary)] text-white px-1.5 py-0.5 rounded font-extrabold ml-0.5 shrink-0">
                Change
              </span>
            </button>
          </div>
        )}

        {/* SECTION 1: QUIZ DETAILS CARD */}
        <Card padding="md" className="space-y-3.5 p-3.5 sm:p-4 rounded-[14px] bg-[var(--surface)] border-[var(--border)] w-full min-w-0 box-border">
          <div className="border-b border-[var(--border)] pb-2.5">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Quiz Details</h2>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">Basic metadata for student evaluation.</p>
          </div>

          <div className="space-y-3 w-full min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Quiz Title *
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Module 1 Review Quiz"
                className="w-full px-3.5 py-2.5 h-[44px] sm:h-[48px] bg-[var(--surface-secondary)] border border-[var(--input-border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-medium min-w-0 box-border"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Short Description / Instructions
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instructions for students taking this assessment..."
                className="w-full px-3.5 py-2.5 bg-[var(--surface-secondary)] border border-[var(--input-border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-medium min-h-[70px] min-w-0 box-border resize-y"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 2: QUIZ SETTINGS CARD */}
        <Card padding="md" className="space-y-3.5 p-3.5 sm:p-4 rounded-[14px] bg-[var(--surface)] border-[var(--border)] w-full min-w-0 box-border">
          <div className="border-b border-[var(--border)] pb-2.5">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Quiz Settings</h2>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">Configure passing thresholds and limits.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full px-3 py-2.5 h-[44px] sm:h-[48px] bg-[var(--surface-secondary)] border border-[var(--input-border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] font-medium min-w-0 box-border"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="No limit"
                className="w-full px-3 py-2.5 h-[44px] sm:h-[48px] bg-[var(--surface-secondary)] border border-[var(--input-border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-medium min-w-0 box-border"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Attempts Allowed
              </label>
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Unlimited"
                className="w-full px-3 py-2.5 h-[44px] sm:h-[48px] bg-[var(--surface-secondary)] border border-[var(--input-border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-medium min-w-0 box-border"
              />
            </div>
          </div>

          {/* ADVANCED SETTINGS COLLAPSIBLE */}
          <div className="pt-1 w-full min-w-0">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer box-border"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Advanced Settings</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
            </button>

            {showAdvancedSettings && (
              <div className="mt-2.5 p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2 text-xs w-full min-w-0 box-border">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="font-semibold text-[var(--text-primary)]">Shuffle Questions Order</span>
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 text-[var(--brand-primary)] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-[var(--border)]">
                  <span className="font-semibold text-[var(--text-primary)]">Show Result Immediately After Submit</span>
                  <input
                    type="checkbox"
                    checked={showResult}
                    onChange={(e) => setShowResult(e.target.checked)}
                    className="w-4 h-4 text-[var(--brand-primary)] rounded cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>
        </Card>

        {/* SECTION 3: QUESTION BUILDER */}
        <div className="space-y-3.5 w-full min-w-0">
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">
              Questions ({questions.length})
            </h2>
            <Button
              type="button"
              onClick={handleAddQuestion}
              className="bg-[var(--brand-primary)] text-white text-xs font-bold px-3 py-1.5 h-9 rounded-xl shadow-xs shrink-0"
            >
              + Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card padding="md" className="text-center py-8 space-y-3 bg-[var(--surface)] border border-[var(--border)] rounded-[14px] w-full min-w-0">
              <HelpCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">No questions yet</p>
              <p className="text-xs text-[var(--text-secondary)]">Start by adding your first question.</p>
              <Button onClick={handleAddQuestion} className="bg-[var(--brand-primary)] text-white text-xs font-bold px-4 py-2 h-10 rounded-xl">
                + Add First Question
              </Button>
            </Card>
          ) : (
            <div className="space-y-3.5 w-full min-w-0">
              {questions.map((q, qIdx) => (
                <Card
                  key={q.id}
                  padding="md"
                  className="space-y-3 relative border border-[var(--border)] bg-[var(--surface)] rounded-[14px] shadow-2xs p-3 sm:p-4 w-full min-w-0 box-border"
                >
                  <div
                    ref={(el) => {
                      questionRefs.current[qIdx] = el;
                    }}
                  />

                  {/* Question Card Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] font-black text-xs flex items-center justify-center shrink-0">
                        {qIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                        Question {qIdx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Desktop & Mobile Move Up / Move Down */}
                      <button
                        type="button"
                        disabled={qIdx === 0}
                        onClick={() => handleMoveQuestion(qIdx, 'up')}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={qIdx === questions.length - 1}
                        onClick={() => handleMoveQuestion(qIdx, 'down')}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Remove Question */}
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="p-1 text-[var(--text-secondary)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                        title="Remove Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Inputs */}
                  <div className="space-y-3 w-full min-w-0">
                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                        Question Text *
                      </label>
                      <textarea
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestions((prev) =>
                            prev.map((item, idx) => (idx === qIdx ? { ...item, question_text: val } : item))
                          );
                        }}
                        placeholder="Enter question text here..."
                        className="w-full px-3.5 py-2.5 bg-[var(--surface-secondary)] border border-[var(--input-border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-medium min-h-[80px] min-w-0 box-border resize-y"
                      />
                    </div>

                    <div className="grid grid-cols-1 min-[350px]:grid-cols-[minmax(0,1fr)_88px] gap-2.5 items-start w-full min-w-0">
                      <div className="min-w-0">
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                          Question Type
                        </label>
                        <div className="relative inline-flex items-center w-full min-w-0">
                          <select
                            value={q.question_type}
                            onChange={(e) => handleTypeChange(qIdx, e.target.value as QuestionType)}
                            className="h-[44px] sm:h-[48px] w-full pl-3 pr-8 bg-[var(--surface-secondary)] border border-[var(--input-border)] rounded-xl text-xs text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--brand-primary)] appearance-none cursor-pointer min-w-0 box-border"
                          >
                            <option value="SINGLE_CHOICE">Single Choice</option>
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                            <option value="TRUE_FALSE">True / False</option>
                            <option value="SHORT_ANSWER">Short Answer</option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] shrink-0" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                          Points
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={q.points}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setQuestions((prev) =>
                              prev.map((item, idx) => (idx === qIdx ? { ...item, points: val } : item))
                            );
                          }}
                          className="w-full h-[44px] sm:h-[48px] px-3 bg-[var(--surface-secondary)] border border-[var(--input-border)] rounded-xl text-xs text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--brand-primary)] text-center min-w-0 box-border"
                        />
                      </div>
                    </div>

                    {/* OPTIONS AREA FOR CHOICE QUESTIONS */}
                    {(q.question_type === 'SINGLE_CHOICE' ||
                      q.question_type === 'MULTIPLE_CHOICE' ||
                      q.question_type === 'TRUE_FALSE') && (
                      <div className="space-y-2 pt-1 w-full min-w-0">
                        <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-1 w-full">
                          <label className="block text-xs font-bold text-[var(--text-primary)]">
                            Options
                          </label>
                          <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                            Mark the correct answer
                          </span>
                        </div>

                        <div className="space-y-2 w-full min-w-0">
                          {q.options.map((opt, oIdx) => (
                            <div key={opt.id} className={`grid grid-cols-[28px_minmax(0,1fr)_32px] items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-[10px] border transition-all w-full min-w-0 box-border ${
                              opt.is_correct
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-[var(--border)] bg-[var(--surface-secondary)]'
                            }`}>
                              {/* Choice Selector */}
                              <button
                                type="button"
                                onClick={() => handleToggleCorrectOption(qIdx, oIdx)}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                  opt.is_correct
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                                    : 'border-[var(--input-border)] bg-[var(--surface)] text-transparent hover:border-emerald-500'
                                }`}
                                title="Toggle Correct Answer"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              {/* Option Input Wrapper */}
                              <div className="relative flex items-center w-full min-w-0">
                                <input
                                  type="text"
                                  readOnly={q.question_type === 'TRUE_FALSE'}
                                  value={opt.option_text}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions((prev) =>
                                      prev.map((item, idx) => {
                                        if (idx !== qIdx) return item;
                                        return {
                                          ...item,
                                          options: item.options.map((o, targetOIdx) =>
                                            targetOIdx === oIdx ? { ...o, option_text: val } : o
                                          ),
                                        };
                                      })
                                    );
                                  }}
                                  placeholder={`Option ${oIdx + 1}`}
                                  className={`w-full h-[40px] px-3 border rounded-[8px] text-xs font-medium focus:outline-none min-w-0 ${
                                    opt.is_correct
                                      ? 'border-emerald-500/60 bg-[var(--surface)] text-[var(--text-primary)] font-bold pr-16 sm:pr-20'
                                      : 'border-[var(--input-border)] bg-[var(--surface)] text-[var(--text-primary)] pr-3'
                                  }`}
                                />
                                {opt.is_correct && (
                                  <span className="hidden min-[360px]:inline-flex absolute right-2 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-full pointer-events-none shrink-0 border border-emerald-500/20">
                                    Correct
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-center shrink-0">
                                {q.question_type !== 'TRUE_FALSE' && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(qIdx, oIdx)}
                                    className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                    title="Remove Option"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {q.question_type !== 'TRUE_FALSE' && (
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIdx)}
                            className="w-full h-[44px] rounded-[10px] border border-dashed border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--brand-primary)] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors hover:border-[var(--brand-primary)] box-border mt-1"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>
                    )}

                    {/* SHORT ANSWER EXPECTED TEXT */}
                    {q.question_type === 'SHORT_ANSWER' && (
                      <div className="pt-2 w-full min-w-0">
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                          Expected Answer / Grading Key (Optional)
                        </label>
                        <input
                          type="text"
                          value={q.answer_text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) =>
                              prev.map((item, idx) => (idx === qIdx ? { ...item, answer_text: val } : item))
                            );
                          }}
                          placeholder="Enter expected answer string for reference..."
                          className="w-full h-[44px] px-3 bg-[var(--surface-secondary)] border border-[var(--input-border)] rounded-xl text-xs text-[var(--text-primary)] font-medium min-w-0 box-border"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              <Button
                type="button"
                onClick={handleAddQuestion}
                className="w-full h-[48px] rounded-[12px] bg-[var(--brand-primary)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                + Add Question
              </Button>
            </div>
          )}
        </div>

        {/* SECTION MODAL PICKER */}
        <Modal
          isOpen={isModuleModalOpen}
          onClose={() => setIsModuleModalOpen(false)}
          title="Select Target Section"
        >
          <div className="space-y-3 font-sans text-xs text-left p-1 w-full min-w-0">
            <p className="text-[var(--text-secondary)] text-xs">
              Where should this quiz be placed in the curriculum?
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 w-full min-w-0">
              {allModules.map((mod, idx) => {
                const isSelected = mod.uuid === selectedModuleUuid;
                return (
                  <button
                    key={`mod-pick-${mod.uuid}`}
                    type="button"
                    onClick={() => {
                      setSelectedModuleUuid(mod.uuid);
                      setIsModuleModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-w-0 box-border ${
                      isSelected
                        ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold shadow-xs'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[var(--brand-primary)] text-white' : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
                      }`}>
                        {idx + 1}
                      </div>
                      <strong className="text-xs truncate block leading-tight">{mod.title}</strong>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      </div>

      {/* MOBILE & DESKTOP STICKY ACTION BAR (Positioned above mobile nav on mobile) */}
      <div className="fixed bottom-[calc(68px+env(safe-area-inset-bottom,0px))] sm:bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] p-2.5 sm:p-4 shadow-lg box-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(backDestination)}
            className="w-full sm:w-auto h-[46px] sm:h-10 text-xs font-semibold px-4 border-[var(--border)] text-[var(--text-primary)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveQuiz}
            className="w-full sm:w-auto h-[46px] sm:h-10 bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold text-xs sm:text-sm px-6 rounded-xl shadow-md min-w-[120px]"
          >
            {isSubmitting ? 'Saving Quiz...' : 'Create Quiz'}
          </Button>
        </div>
      </div>
    </FormPageLayout>
  );
};
