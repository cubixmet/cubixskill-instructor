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
  quizId?: string;
  type: QuestionType;
  question?: string;
  questionText?: string;
  imageUrl?: string;
  marks: number;
  negativeMarks?: number;
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  questionSet?: string; // 'Set A', 'Set B', 'Set C', etc.
  isRequired?: boolean;
  requiresManualReview?: boolean;
  options?: any;
  correctAnswer?: any;
  correctAnswers?: any;
  matchingPairs?: { id: string; left: string; right: string }[];
  orderingItems?: { id: string; text: string }[];
  starterCode?: string;
  expectedOutputDescription?: string;
  codingLanguage?: string;
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
  description?: string;
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
  passingMarks?: number;
  maxMarks: number;
  totalMarks?: number;
  maxAttempts: number;
  timeLimitMinutes: number;
  negativeMarking: boolean;
  negativeMarksEnabled?: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  shuffleAnswers?: boolean;
  randomSelection?: boolean;
  randomQuestionSelection?: boolean;
  randomQuestionsToShowCount?: number;
  randomizeSets: boolean;
  questionNumbering: boolean;
  questionsToDisplay?: number;

  showScoreAfterSubmit: boolean;
  showScoreAfterSubmission?: boolean;
  showAnswersAfterSubmit: boolean;
  showAnswersAfterSubmission?: boolean;
  hideCorrectAnswers: boolean;
  autoGrading: boolean;
  requiresManualReview: boolean;
  manualReviewRequired?: boolean;
  autoSubmitOnTimeout?: boolean;
  unlockNextLesson?: boolean;
  unlockNextLessonAfterPass?: boolean;
  unlockNextModule?: boolean;
  certificateOnPass?: boolean;
  triggerCertificateAfterPass?: boolean;
  fullScreenRequired?: boolean;
  disableNavigation?: boolean;
  warnOnTabSwitch?: boolean;
  autoSaveAnswers?: boolean;
  resumeAfterDisconnect?: boolean;

  examMode: ExamModeSettings;
  isExamMode?: boolean;

  questions?: QuizQuestion[];

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
  quizId?: string;
  courseUuid?: string;
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  attemptNumber: number;
  startedAt?: string;
  submittedAt: string;
  timeTakenSeconds?: number;
  timeTakenMinutes?: number;
  score: number;
  maxScore: number;
  percentage?: number;
  isPassed?: boolean;
  passed?: boolean;
  autoGradedMarks: number;
  manualMarks: number;
  pendingManualMarks?: number;
  instructorFeedback?: string;
  status: 'completed' | 'pending_review' | 'graded' | 'reset' | 'needs_manual_review';
  answers?: QuizAnswerPayload[];
}

export type QuizData = Quiz;
export type QuizQuestionItem = QuizQuestion;
export type QuizAttemptResult = QuizAttempt;

