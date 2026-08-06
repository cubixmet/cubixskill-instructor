import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quiz, QuizQuestion, QuizAttempt, QuizStatus } from '../../../types/quiz.types';

interface QuizState {
  quizzes: Quiz[];
  questions: Record<string, QuizQuestion[]>; // quizId -> questions[]
  attempts: QuizAttempt[];

  // Quiz Actions
  addQuiz: (data: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'attachedLessonsCount' | 'totalAttemptsCount' | 'averageScore' | 'passRate'>) => Quiz;
  updateQuiz: (id: string, data: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  duplicateQuiz: (id: string) => Quiz | null;
  publishQuiz: (id: string) => void;
  archiveQuiz: (id: string) => void;
  getQuizzesByCourse: (courseUuid: string) => Quiz[];

  // Question Actions
  addQuestion: (quizId: string, question: Omit<QuizQuestion, 'id' | 'quizId'>) => QuizQuestion;
  updateQuestion: (quizId: string, questionId: string, data: Partial<QuizQuestion>) => void;
  deleteQuestion: (quizId: string, questionId: string) => void;
  duplicateQuestion: (quizId: string, questionId: string) => QuizQuestion | null;
  reorderQuestions: (quizId: string, questionIds: string[]) => void;
  getQuestionsByQuiz: (quizId: string) => QuizQuestion[];

  // Attempt Actions
  addAttempt: (attempt: Omit<QuizAttempt, 'id'>) => QuizAttempt;
  gradeAttempt: (attemptId: string, manualMarks: number, feedback?: string) => void;
  allowReattempt: (attemptId: string) => void;
  resetAttempt: (attemptId: string) => void;
  getAttemptsByQuiz: (quizId: string) => QuizAttempt[];
}

const SEED_QUIZZES: Quiz[] = [
  {
    id: 'qz-101',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'React 19 Server Components Assessment',
    shortDescription: 'Test your understanding of React 19 RSC, Actions, and Store Middleware.',
    instructions: 'Complete all 10 questions within the 15-minute time limit. Passing threshold is 75%.',
    quizType: 'graded',
    status: 'Published',
    estimatedDurationMinutes: 15,
    tags: ['React 19', 'RSC', 'Zustand'],
    questionMode: 'OMR',
    numberOfSets: 4,
    questionsPerSet: 25,
    passingScore: 75,
    maxMarks: 100,
    maxAttempts: 3,
    timeLimitMinutes: 15,
    negativeMarking: false,
    shuffleQuestions: true,
    shuffleAnswers: true,
    shuffleOptions: true,
    randomizeSets: true,
    questionNumbering: true,
    randomSelection: false,
    showScoreAfterSubmit: true,
    showAnswersAfterSubmit: true,
    hideCorrectAnswers: false,
    autoGrading: true,
    requiresManualReview: true,
    examMode: {
      enabled: true,
      fullScreen: true,
      timer: true,
      autoSubmitOnTimeout: true,
      disableNavigation: true,
      warnOnLeave: true,
      autoSave: true,
      resumeOnConnectionLoss: true,
    },
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-04T16:30:00Z',
    attachedLessonsCount: 2,
    totalAttemptsCount: 142,
    averageScore: 84.5,
    passRate: 91.2,
  },
  {
    id: 'qz-102',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Zustand Store Middleware & Persistence Quiz',
    shortDescription: 'Practice quiz covering Zustand persist, custom middleware, and devtools integration.',
    instructions: 'Practice quiz with unlimited attempts and instant score breakdown.',
    quizType: 'practice',
    status: 'Published',
    estimatedDurationMinutes: 10,
    tags: ['Zustand', 'State Management'],
    questionMode: 'Direct',
    numberOfSets: 1,
    questionsPerSet: 10,
    passingScore: 70,
    maxMarks: 50,
    maxAttempts: 99,
    timeLimitMinutes: 10,
    negativeMarking: false,
    shuffleQuestions: false,
    shuffleAnswers: true,
    shuffleOptions: true,
    randomizeSets: false,
    questionNumbering: true,
    randomSelection: false,
    showScoreAfterSubmit: true,
    showAnswersAfterSubmit: true,
    hideCorrectAnswers: false,
    autoGrading: true,
    requiresManualReview: false,
    examMode: {
      enabled: false,
      fullScreen: false,
      timer: true,
      autoSubmitOnTimeout: false,
      disableNavigation: false,
      warnOnLeave: false,
      autoSave: true,
      resumeOnConnectionLoss: true,
    },
    createdAt: '2026-08-02T14:00:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
    attachedLessonsCount: 1,
    totalAttemptsCount: 98,
    averageScore: 88.0,
    passRate: 95.5,
  },
  {
    id: 'qz-103',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Full Stack Architecture Final Exam',
    shortDescription: 'Comprehensive final exam for course certification.',
    instructions: 'Final exam under strict Exam Mode conditions. Passing grade required for certificate.',
    quizType: 'final_exam',
    status: 'Draft',
    estimatedDurationMinutes: 45,
    tags: ['Final Exam', 'Certification'],
    questionMode: 'OMR',
    numberOfSets: 4,
    questionsPerSet: 50,
    passingScore: 80,
    maxMarks: 200,
    maxAttempts: 2,
    timeLimitMinutes: 45,
    negativeMarking: true,
    shuffleQuestions: true,
    shuffleAnswers: true,
    shuffleOptions: true,
    randomizeSets: true,
    questionNumbering: true,
    randomSelection: true,
    questionsToDisplay: 20,
    showScoreAfterSubmit: true,
    showAnswersAfterSubmit: false,
    hideCorrectAnswers: true,
    autoGrading: true,
    requiresManualReview: true,
    examMode: {
      enabled: true,
      fullScreen: true,
      timer: true,
      autoSubmitOnTimeout: true,
      disableNavigation: true,
      warnOnLeave: true,
      autoSave: true,
      resumeOnConnectionLoss: true,
    },
    createdAt: '2026-08-03T11:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
    attachedLessonsCount: 0,
    totalAttemptsCount: 0,
    averageScore: 0,
    passRate: 0,
  },
];

const SEED_QUESTIONS: Record<string, QuizQuestion[]> = {
  'qz-101': [
    {
      id: 'q-1',
      quizId: 'qz-101',
      type: 'mcq',
      question: 'Which hook in React 19 allows reading promise values directly in render?',
      marks: 10,
      negativeMarks: 0,
      explanation: 'The use() hook in React 19 can read promises and context during render.',
      isRequired: true,
      requiresManualReview: false,
      options: [
        { id: 'opt-1', text: 'use()', isCorrect: true },
        { id: 'opt-2', text: 'usePromise()', isCorrect: false },
        { id: 'opt-3', text: 'useAsync()', isCorrect: false },
        { id: 'opt-4', text: 'useFetch()', isCorrect: false },
      ],
    },
    {
      id: 'q-2',
      quizId: 'qz-101',
      type: 'multi_select',
      question: 'Select all valid features introduced in React 19:',
      marks: 15,
      negativeMarks: 0,
      explanation: 'React 19 introduces React Server Components, Actions, useActionState, and useOptimistic.',
      isRequired: true,
      requiresManualReview: false,
      options: [
        { id: 'opt-21', text: 'Server Actions', isCorrect: true },
        { id: 'opt-22', text: 'useOptimistic Hook', isCorrect: true },
        { id: 'opt-23', text: 'Class Component Deprecation', isCorrect: false },
        { id: 'opt-24', text: 'Asset Loading Support', isCorrect: true },
      ],
    },
    {
      id: 'q-3',
      quizId: 'qz-101',
      type: 'essay',
      question: 'Explain how custom Zustand middleware persists state to localStorage in React 19.',
      marks: 25,
      negativeMarks: 0,
      explanation: 'Requires manual instructor evaluation.',
      isRequired: true,
      requiresManualReview: true,
    },
  ],
};

const SEED_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att-501',
    quizId: 'qz-101',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    studentUuid: 'std-201',
    studentName: 'Alex Rivera',
    studentEmail: 'alex.rivera@example.com',
    attemptNumber: 1,
    startedAt: '2026-08-04T14:10:00Z',
    submittedAt: '2026-08-04T14:22:15Z',
    timeTakenSeconds: 735,
    score: 85,
    maxScore: 100,
    percentage: 85,
    isPassed: true,
    autoGradedMarks: 60,
    manualMarks: 25,
    status: 'graded',
    answers: [
      { questionId: 'q-1', studentAnswer: 'opt-1', marksAwarded: 10, isCorrect: true },
      { questionId: 'q-2', studentAnswer: ['opt-21', 'opt-22', 'opt-24'], marksAwarded: 15, isCorrect: true },
      { questionId: 'q-3', studentAnswer: 'Zustand persist middleware wraps the store config and synchronizes state with local storage using custom serializers.', marksAwarded: 25, feedback: 'Excellent explanation of middleware state hydration.' },
    ],
  },
  {
    id: 'att-502',
    quizId: 'qz-101',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    studentUuid: 'std-202',
    studentName: 'Sophia Lin',
    studentEmail: 'sophia.lin@example.com',
    attemptNumber: 1,
    startedAt: '2026-08-05T08:00:00Z',
    submittedAt: '2026-08-05T08:12:30Z',
    timeTakenSeconds: 750,
    score: 60,
    maxScore: 100,
    percentage: 60,
    isPassed: false,
    autoGradedMarks: 60,
    manualMarks: 0,
    status: 'pending_review',
    answers: [
      { questionId: 'q-1', studentAnswer: 'opt-1', marksAwarded: 10, isCorrect: true },
      { questionId: 'q-2', studentAnswer: ['opt-21', 'opt-22'], marksAwarded: 10, isCorrect: false },
      { questionId: 'q-3', studentAnswer: 'Zustand saves data using storage API.', marksAwarded: 0 },
    ],
  },
];

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      quizzes: SEED_QUIZZES,
      questions: SEED_QUESTIONS,
      attempts: SEED_ATTEMPTS,

      // QUIZ ACTIONS
      addQuiz: (data) => {
        const newQuiz: Quiz = {
          ...data,
          id: `qz-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachedLessonsCount: 0,
          totalAttemptsCount: 0,
          averageScore: 0,
          passRate: 0,
        };
        set((state) => ({ quizzes: [newQuiz, ...state.quizzes] }));
        return newQuiz;
      },

      updateQuiz: (id, data) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === id ? { ...q, ...data, updatedAt: new Date().toISOString() } : q
          ),
        }));
      },

      deleteQuiz: (id) => {
        set((state) => ({
          quizzes: state.quizzes.filter((q) => q.id !== id),
          attempts: state.attempts.filter((a) => a.quizId !== id),
        }));
      },

      duplicateQuiz: (id) => {
        const source = get().quizzes.find((q) => q.id === id);
        if (!source) return null;

        const newId = `qz-${Date.now()}`;
        const duplicatedQuiz: Quiz = {
          ...source,
          id: newId,
          title: `${source.title} (Copy)`,
          status: 'Draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachedLessonsCount: 0,
          totalAttemptsCount: 0,
          averageScore: 0,
          passRate: 0,
        };

        const sourceQuestions = get().questions[id] || [];
        const duplicatedQuestions = sourceQuestions.map((q) => ({
          ...q,
          id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          quizId: newId,
        }));

        set((state) => ({
          quizzes: [duplicatedQuiz, ...state.quizzes],
          questions: { ...state.questions, [newId]: duplicatedQuestions },
        }));

        return duplicatedQuiz;
      },

      publishQuiz: (id) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === id ? { ...q, status: 'Published', updatedAt: new Date().toISOString() } : q
          ),
        }));
      },

      archiveQuiz: (id) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === id ? { ...q, status: 'Archived', updatedAt: new Date().toISOString() } : q
          ),
        }));
      },

      getQuizzesByCourse: (courseUuid) => {
        return get().quizzes.filter((q) => q.courseUuid === courseUuid);
      },

      // QUESTION ACTIONS
      addQuestion: (quizId, questionData) => {
        const newQuestion: QuizQuestion = {
          ...questionData,
          id: `q-${Date.now()}`,
          quizId,
        };

        set((state) => {
          const currentList = state.questions[quizId] || [];
          return {
            questions: {
              ...state.questions,
              [quizId]: [...currentList, newQuestion],
            },
          };
        });

        return newQuestion;
      },

      updateQuestion: (quizId, questionId, data) => {
        set((state) => {
          const currentList = state.questions[quizId] || [];
          return {
            questions: {
              ...state.questions,
              [quizId]: currentList.map((q) => (q.id === questionId ? { ...q, ...data } : q)),
            },
          };
        });
      },

      deleteQuestion: (quizId, questionId) => {
        set((state) => {
          const currentList = state.questions[quizId] || [];
          return {
            questions: {
              ...state.questions,
              [quizId]: currentList.filter((q) => q.id !== questionId),
            },
          };
        });
      },

      duplicateQuestion: (quizId, questionId) => {
        const currentList = get().questions[quizId] || [];
        const source = currentList.find((q) => q.id === questionId);
        if (!source) return null;

        const duplicated: QuizQuestion = {
          ...source,
          id: `q-${Date.now()}`,
          question: `${source.question} (Copy)`,
        };

        set((state) => ({
          questions: {
            ...state.questions,
            [quizId]: [...(state.questions[quizId] || []), duplicated],
          },
        }));

        return duplicated;
      },

      reorderQuestions: (quizId, questionIds) => {
        set((state) => {
          const currentList = state.questions[quizId] || [];
          const sortedList = questionIds
            .map((id) => currentList.find((q) => q.id === id))
            .filter(Boolean) as QuizQuestion[];

          return {
            questions: {
              ...state.questions,
              [quizId]: sortedList,
            },
          };
        });
      },

      getQuestionsByQuiz: (quizId) => {
        return get().questions[quizId] || [];
      },

      // ATTEMPT ACTIONS
      addAttempt: (attemptData) => {
        const newAttempt: QuizAttempt = {
          ...attemptData,
          id: `att-${Date.now()}`,
        };
        set((state) => ({ attempts: [newAttempt, ...state.attempts] }));
        return newAttempt;
      },

      gradeAttempt: (attemptId, manualMarks, feedback) => {
        set((state) => ({
          attempts: state.attempts.map((att) => {
            if (att.id !== attemptId) return att;
            const finalScore = att.autoGradedMarks + manualMarks;
            const finalPercentage = Math.round((finalScore / att.maxScore) * 100);
            return {
              ...att,
              manualMarks,
              score: finalScore,
              percentage: finalPercentage,
              isPassed: finalPercentage >= 75,
              status: 'graded',
            };
          }),
        }));
      },

      allowReattempt: (attemptId) => {
        set((state) => ({
          attempts: state.attempts.map((att) =>
            att.id === attemptId ? { ...att, status: 'reset' } : att
          ),
        }));
      },

      resetAttempt: (attemptId) => {
        set((state) => ({
          attempts: state.attempts.filter((att) => att.id !== attemptId),
        }));
      },

      getAttemptsByQuiz: (quizId) => {
        return get().attempts.filter((a) => a.quizId === quizId);
      },
    }),
    {
      name: 'cubixskill-quiz-store',
    }
  )
);
