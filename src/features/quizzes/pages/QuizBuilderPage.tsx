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
      <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-3 sm:py-6 font-sans text-left space-y-5 pb-36 sm:pb-24">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Validation Errors Banner */}
        {validationErrors.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-700 dark:text-rose-300">
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
        <div className="flex items-center justify-between gap-3">
          <Link
            to={backDestination}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Curriculum
          </Link>

          {isCourseValid && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                Target Section:
              </span>
              <button
                type="button"
                onClick={() => setIsModuleModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[#2563EB] dark:text-[#60A5FA] text-xs font-bold hover:bg-blue-100 flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {selectedModuleObj?.title || 'Select Section'}
                </span>
                <span className="text-[10px] bg-[#2563EB] text-white px-1.5 py-0.5 rounded font-extrabold ml-1">
                  Change
                </span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION 1: QUIZ DETAILS CARD */}
        <Card padding="md" className="space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Quiz Details</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Basic metadata for student evaluation.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quiz Title *
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Module 1 Review Quiz"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Description / Instructions
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instructions for students taking this assessment..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium shadow-2xs"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 2: QUIZ SETTINGS CARD */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Quiz Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure passing thresholds and limits.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="No limit"
                className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Attempts Allowed
              </label>
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Unlimited"
                className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* ADVANCED SETTINGS COLLAPSIBLE */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{showAdvancedSettings ? 'Hide Advanced Settings' : 'Advanced Settings'}</span>
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
            </button>

            {showAdvancedSettings && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] space-y-2.5 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Shuffle Questions Order</span>
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 text-[#2563EB] rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Result Immediately After Submit</span>
                  <input
                    type="checkbox"
                    checked={showResult}
                    onChange={(e) => setShowResult(e.target.checked)}
                    className="w-4 h-4 text-[#2563EB] rounded"
                  />
                </label>
              </div>
            )}
          </div>
        </Card>

        {/* SECTION 3: QUESTION BUILDER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Questions ({questions.length})
            </h2>
            <Button
              type="button"
              onClick={handleAddQuestion}
              className="bg-[#2563EB] text-white text-xs font-bold px-3 py-1.5 h-8 rounded-xl shadow-xs"
            >
              + Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card padding="md" className="text-center py-10 space-y-3">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No questions yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Start by adding your first question.</p>
              <Button onClick={handleAddQuestion} className="bg-[#2563EB] text-white text-xs font-bold px-4 py-2">
                + Add First Question
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <Card
                  key={q.id}
                  padding="md"
                  className="space-y-4 relative border border-slate-200 dark:border-[#263244] shadow-2xs"
                >
                  <div
                    ref={(el) => {
                      questionRefs.current[qIdx] = el;
                    }}
                  />

                  {/* Question Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] font-black text-xs flex items-center justify-center">
                        {qIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Question {qIdx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Desktop Move Up / Move Down */}
                      <button
                        type="button"
                        disabled={qIdx === 0}
                        onClick={() => handleMoveQuestion(qIdx, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer hidden sm:inline-flex"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={qIdx === questions.length - 1}
                        onClick={() => handleMoveQuestion(qIdx, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer hidden sm:inline-flex"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Remove Question */}
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Remove Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                        className="w-full px-3.5 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Question Type
                        </label>
                        <select
                          value={q.question_type}
                          onChange={(e) => handleTypeChange(qIdx, e.target.value as QuestionType)}
                          className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] font-semibold focus:outline-none focus:border-blue-600"
                        >
                          <option value="SINGLE_CHOICE">Single Choice</option>
                          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                          <option value="TRUE_FALSE">True / False</option>
                          <option value="SHORT_ANSWER">Short Answer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                          className="w-full px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] font-semibold focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    {/* OPTIONS AREA FOR CHOICE QUESTIONS */}
                    {(q.question_type === 'SINGLE_CHOICE' ||
                      q.question_type === 'MULTIPLE_CHOICE' ||
                      q.question_type === 'TRUE_FALSE') && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            Options
                          </label>
                          <span className="text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                            Mark the correct answer
                          </span>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              {/* Choice Selector */}
                              <button
                                type="button"
                                onClick={() => handleToggleCorrectOption(qIdx, oIdx)}
                                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                  opt.is_correct
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent hover:border-emerald-500'
                                }`}
                                title="Toggle Correct Answer"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              {/* Option Input */}
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
                                className={`flex-1 px-3 py-1.5 border rounded-xl text-xs font-medium focus:outline-none ${
                                  opt.is_correct
                                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 font-bold'
                                    : 'border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200'
                                }`}
                              />

                              {opt.is_correct && (
                                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full shrink-0">
                                  Correct answer
                                </span>
                              )}

                              {q.question_type !== 'TRUE_FALSE' && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(qIdx, oIdx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {q.question_type !== 'TRUE_FALSE' && (
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIdx)}
                            className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline pt-1 inline-block"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>
                    )}

                    {/* SHORT ANSWER EXPECTED TEXT */}
                    {q.question_type === 'SHORT_ANSWER' && (
                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                          className="w-full px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] font-medium"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* SECTION MODAL PICKER */}
        <Modal
          isOpen={isModuleModalOpen}
          onClose={() => setIsModuleModalOpen(false)}
          title="Select Target Section"
        >
          <div className="space-y-3 font-sans text-xs text-left p-1">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Where should this quiz be placed in the curriculum?
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
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
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-[#2563EB] text-[#2563EB] font-bold shadow-xs'
                        : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] text-slate-800 dark:text-[#CBD5E1] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <strong className="text-xs truncate block">{mod.title}</strong>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      </div>

      {/* MOBILE & DESKTOP STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#263244] p-3 sm:p-4 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] sm:pb-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(backDestination)}
            className="text-xs font-semibold px-4 h-10 border-slate-300"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveQuiz}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 h-10 rounded-xl shadow-md min-w-[120px]"
          >
            {isSubmitting ? 'Saving Quiz...' : 'Save Quiz'}
          </Button>
        </div>
      </div>
    </FormPageLayout>
  );
};
