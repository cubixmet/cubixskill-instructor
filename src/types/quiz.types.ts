export type QuestionType =
  | 'mcq'
  | 'multi_select'
  | 'true_false'
  | 'fill_blank'
  | 'short_answer'
  | 'essay'
  | 'matching'
  | 'ordering'
  | 'coding';

export type QuestionMode = 'OMR' | 'Direct';

export type QuizType = 'practice' | 'graded' | 'final_exam' | 'assessment';

export type QuizStatus = 'Draft' | 'Published' | 'Scheduled' | 'Closed' | 'Archived';

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  imageUrl?: string;
  marks: number;
  negativeMarks: number;
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  questionSet?: string; // 'Set A', 'Set B', 'Set C', etc.
  isRequired: boolean;
  requiresManualReview: boolean;
  options?: { id: string; text: string; isCorrect?: boolean }[];
  correctAnswer?: any;
  matchingPairs?: { id: string; left: string; right: string }[];
  orderingItems?: { id: string; text: string }[];
  codingSettings?: {
    language: string;
    starterCode: string;
    expectedOutput: string;
  };
}

export interface ExamModeSettings {
  enabled: boolean;
  fullScreen: boolean;
  timer: boolean;
  autoSubmitOnTimeout: boolean;
  disableNavigation: boolean;
  warnOnLeave: boolean;
  autoSave: boolean;
  resumeOnConnectionLoss: boolean;
}

export interface Quiz {
  id: string;
  courseUuid: string;
  title: string;
  shortDescription: string;
  instructions: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  relatedModuleUuid?: string;
  relatedLessonUuid?: string;
  quizType: QuizType;
  status: QuizStatus;
  estimatedDurationMinutes: number;
  tags: string[];

  // Step 2 Configuration
  questionMode: QuestionMode; // 'OMR' | 'Direct'
  numberOfSets: number; // 1, 2, 4, 10
  questionsPerSet: number; // 25, 50, 100

  passingScore: number;
  maxMarks: number;
  maxAttempts: number;
  timeLimitMinutes: number;
  negativeMarking: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  randomizeSets: boolean;
  questionNumbering: boolean;
  questionsToDisplay?: number;

  showScoreAfterSubmit: boolean;
  showAnswersAfterSubmit: boolean;
  hideCorrectAnswers: boolean;
  autoGrading: boolean;
  requiresManualReview: boolean;
  unlockNextLesson?: boolean;
  unlockNextModule?: boolean;
  certificateOnPass?: boolean;

  examMode: ExamModeSettings;

  createdAt: string;
  updatedAt: string;
  attachedLessonsCount: number;
  totalAttemptsCount: number;
  averageScore: number;
  passRate: number;
}

export interface QuizAnswerPayload {
  questionId: string;
  studentAnswer: any;
  marksAwarded?: number;
  feedback?: string;
  isCorrect?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseUuid: string;
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  timeTakenSeconds: number;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  autoGradedMarks: number;
  manualMarks: number;
  status: 'completed' | 'pending_review' | 'graded' | 'reset';
  answers: QuizAnswerPayload[];
}
