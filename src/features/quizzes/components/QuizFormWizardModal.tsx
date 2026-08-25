import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  X,
  FileCheck,
  FileText,
  AlertCircle,
  Download,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StepGuard } from '../../../components/common/StepGuard';
import { useQuizStore } from '../store/quiz.store';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';
import type { Quiz, QuizQuestion, QuestionType, QuestionMode, QuizType, QuizStatus } from '../../../types/quiz.types';

interface QuizFormWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: Quiz) => void;
  initialQuiz?: Quiz | null;
  courseUuid?: string;
}

export const QuizFormWizardModal: React.FC<QuizFormWizardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuiz,
  courseUuid = '',
}) => {
  const isEditing = Boolean(initialQuiz);
  const addQuiz = useQuizStore((state) => state.addQuiz);
  const updateQuiz = useQuizStore((state) => state.updateQuiz);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    { id: 1, name: 'Quiz Information', shortName: '1. Info' },
    { id: 2, name: 'Question Config', shortName: '2. Config' },
    { id: 3, name: 'Questions', shortName: '3. Questions' },
    { id: 4, name: 'Quiz Settings', shortName: '4. Settings' },
    { id: 5, name: 'Review & Publish', shortName: '5. Review' },
  ];

  // STEP 1: Quiz Information
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [shortDesc, setShortDesc] = useState(initialQuiz?.shortDescription || '');
  const [instructions, setInstructions] = useState(initialQuiz?.instructions || '');
  const [category, setCategory] = useState(initialQuiz?.category || 'General');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(initialQuiz?.difficulty || 'Medium');
  const [quizType, setQuizType] = useState<QuizType>(initialQuiz?.quizType || 'graded');
  const [status] = useState<QuizStatus>(initialQuiz?.status || 'Published');
  const [duration, setDuration] = useState<number>(initialQuiz?.estimatedDurationMinutes || 15);
  const [tags] = useState<string>(initialQuiz?.tags?.join(', ') || 'React, Assessment');

  // STEP 2: Question Configuration
  const [questionMode, setQuestionMode] = useState<QuestionMode>(initialQuiz?.questionMode || 'OMR');
  const [numberOfSets, setNumberOfSets] = useState<number>(initialQuiz?.numberOfSets || 4);
  const [questionsPerSet, setQuestionsPerSet] = useState<number>(initialQuiz?.questionsPerSet || 25);
  const [passingScore, setPassingScore] = useState<number>(initialQuiz?.passingScore || 75);
  const [maxMarks] = useState<number>(initialQuiz?.maxMarks || 100);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(initialQuiz?.negativeMarking ?? false);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(initialQuiz?.shuffleQuestions ?? true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(initialQuiz?.shuffleOptions ?? true);
  const [randomizeSets, setRandomizeSets] = useState<boolean>(initialQuiz?.randomizeSets ?? true);
  const [questionNumbering] = useState<boolean>(initialQuiz?.questionNumbering ?? true);

  // STEP 3: Questions List & Mode (Manual vs Bulk Upload)
  const [entryMode, setEntryMode] = useState<'manual' | 'bulk'>('bulk');
  const [questions, setQuestions] = useState<Partial<QuizQuestion>[]>(
    initialQuiz
      ? useQuizStore.getState().getQuestionsByQuiz(initialQuiz.id)
      : [
          {
            id: 'temp-1',
            type: 'mcq',
            question: 'Sample Question 1: What is the primary feature of React 19?',
            marks: 2,
            negativeMarks: 0,
            questionSet: 'Set A',
            isRequired: true,
            requiresManualReview: false,
            options: [
              { id: 'opt-1', text: 'Server Components', isCorrect: true },
              { id: 'opt-2', text: 'Virtual DOM Rewrite', isCorrect: false },
              { id: 'opt-3', text: 'Global Redux Store', isCorrect: false },
            ],
          },
        ]
  );

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parseNotice, setParseNotice] = useState<string | null>(null);

  // STEP 4: Quiz Settings
  const [maxAttempts, setMaxAttempts] = useState<number>(initialQuiz?.maxAttempts || 3);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(initialQuiz?.timeLimitMinutes || 15);
  const [showScoreAfterSubmit] = useState<boolean>(initialQuiz?.showScoreAfterSubmit ?? true);
  const [showAnswersAfterSubmit] = useState<boolean>(initialQuiz?.showAnswersAfterSubmit ?? true);
  const [autoSubmitOnTimeout] = useState<boolean>(initialQuiz?.examMode?.autoSubmitOnTimeout ?? true);
  const [unlockNextLesson, setUnlockNextLesson] = useState<boolean>(initialQuiz?.unlockNextLesson ?? true);
  const [certificateOnPass, setCertificateOnPass] = useState<boolean>(initialQuiz?.certificateOnPass ?? false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set Labels (Set A, Set B, Set C, etc.)
  const setLabels = useMemo(() => {
    return Array.from({ length: numberOfSets }, (_, i) => `Set ${String.fromCharCode(65 + i)}`);
  }, [numberOfSets]);

  // Questions Per Set Count Status
  const setProgress = useMemo(() => {
    return setLabels.map((setLabel) => {
      const count = questions.filter((q) => q.questionSet === setLabel || (!q.questionSet && setLabel === 'Set A')).length;
      return {
        label: setLabel,
        count,
        target: questionsPerSet,
        isComplete: count >= questionsPerSet,
      };
    });
  }, [setLabels, questions, questionsPerSet]);

  if (!isOpen) return null;

  // TEMPLATE GENERATOR & DOWNLOAD
  const handleGenerateTemplate = (mode: QuestionMode) => {
    if (mode === 'OMR') {
      const templateData = [];
      for (let s = 0; s < numberOfSets; s++) {
        const setName = `Set ${String.fromCharCode(65 + s)}`;
        for (let q = 1; q <= 5; q++) {
          templateData.push({
            Question: `Sample OMR Question ${q} for ${setName}?`,
            'Option A': 'Choice A',
            'Option B': 'Choice B',
            'Option C': 'Choice C',
            'Option D': 'Choice D',
            'Option E': 'Choice E',
            'Correct Answer': 'Option A',
            Marks: 2,
            Explanation: 'Detailed explanation text',
            Difficulty: 'Medium',
            Tags: 'React, Quiz',
            'Question Set': setName,
          });
        }
      }
      const columns: CsvColumn<Record<string, unknown>>[] = [
        { header: 'Question', value: (row) => row['Question'] },
        { header: 'Option A', value: (row) => row['Option A'] },
        { header: 'Option B', value: (row) => row['Option B'] },
        { header: 'Option C', value: (row) => row['Option C'] },
        { header: 'Option D', value: (row) => row['Option D'] },
        { header: 'Option E', value: (row) => row['Option E'] },
        { header: 'Correct Answer', value: (row) => row['Correct Answer'] },
        { header: 'Marks', value: (row) => row['Marks'] },
        { header: 'Explanation', value: (row) => row['Explanation'] },
        { header: 'Difficulty', value: (row) => row['Difficulty'] },
        { header: 'Tags', value: (row) => row['Tags'] },
        { header: 'Question Set', value: (row) => row['Question Set'] },
      ];
      exportToCsv(`omr-quiz-template-${numberOfSets}-sets.csv`, templateData, columns);
    } else {
      const templateData = [];
      for (let s = 0; s < numberOfSets; s++) {
        const setName = `Set ${String.fromCharCode(65 + s)}`;
        for (let q = 1; q <= 5; q++) {
          templateData.push({
            Question: `Direct Answer Question ${q} for ${setName}?`,
            Answer: 'Expected direct answer hint',
            Marks: 5,
            Explanation: 'Sample explanation',
            Difficulty: 'Medium',
            Tags: 'Direct, ShortAnswer',
            'Question Set': setName,
          });
        }
      }
      const columns: CsvColumn<Record<string, unknown>>[] = [
        { header: 'Question', value: (row) => row['Question'] },
        { header: 'Answer', value: (row) => row['Answer'] },
        { header: 'Marks', value: (row) => row['Marks'] },
        { header: 'Explanation', value: (row) => row['Explanation'] },
        { header: 'Difficulty', value: (row) => row['Difficulty'] },
        { header: 'Tags', value: (row) => row['Tags'] },
        { header: 'Question Set', value: (row) => row['Question Set'] },
      ];
      exportToCsv(`direct-answer-quiz-template-${numberOfSets}-sets.csv`, templateData, columns);
    }
  };

  // BULK FILE UPLOAD PARSER & VALIDATOR
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          setErrorMsg('File contains no data rows');
          return;
        }

        const newQuestions: Partial<QuizQuestion>[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length < 2) continue;

          const questionText = cols[0] || `Uploaded Question ${i}`;
          const setName = cols[cols.length - 1] || 'Set A';
          const marks = Number(cols[7] || cols[2]) || 2;

          if (!questionText) {
            errors.push(`Row ${i + 1}: Missing Question text`);
          }

          newQuestions.push({
            id: `temp-bulk-${i}-${Date.now()}`,
            type: questionMode === 'OMR' ? 'mcq' : 'short_answer',
            question: questionText,
            marks,
            negativeMarks: 0,
            questionSet: setName,
            isRequired: true,
            requiresManualReview: questionMode === 'Direct',
            options:
              questionMode === 'OMR'
                ? [
                    { id: 'opt-a', text: cols[1] || 'Option A', isCorrect: true },
                    { id: 'opt-b', text: cols[2] || 'Option B', isCorrect: false },
                    { id: 'opt-c', text: cols[3] || 'Option C', isCorrect: false },
                    { id: 'opt-d', text: cols[4] || 'Option D', isCorrect: false },
                  ]
                : undefined,
          });
        }

        setQuestions([...questions, ...newQuestions]);
        setValidationErrors(errors);
        setParseNotice(`Successfully parsed ${newQuestions.length} questions from ${file.name}`);
      } catch (_) {
        setErrorMsg('Error parsing uploaded file. Please check CSV format.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddQuestion = (type: QuestionType) => {
    const newQ: Partial<QuizQuestion> = {
      id: `temp-${Date.now()}`,
      type,
      question: `New ${type.replace('_', ' ')} question`,
      marks: 2,
      negativeMarks: 0,
      questionSet: 'Set A',
      isRequired: true,
      requiresManualReview: type === 'essay' || type === 'coding',
      options:
        type === 'mcq' || type === 'multi_select'
          ? [
              { id: 'opt-1', text: 'Option 1', isCorrect: true },
              { id: 'opt-2', text: 'Option 2', isCorrect: false },
            ]
          : undefined,
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !title.trim()) {
      setErrorMsg('Quiz Name is required');
      return;
    }
    if (currentStep === 2 && questionsPerSet <= 0) {
      setErrorMsg('Questions per set must be at least 1');
      return;
    }

    setErrorMsg(null);
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleSaveQuiz = (asDraft = false) => {
    if (!title.trim()) {
      setErrorMsg('Quiz Name is required');
      setCurrentStep(1);
      return;
    }

    const quizData = {
      courseUuid,
      title,
      shortDescription: shortDesc,
      instructions,
      category,
      difficulty,
      quizType,
      status: asDraft ? ('Draft' as QuizStatus) : status,
      estimatedDurationMinutes: duration,
      tags: tags.split(',').map((t) => t.trim()),
      questionMode,
      numberOfSets,
      questionsPerSet,
      passingScore,
      maxMarks,
      maxAttempts,
      timeLimitMinutes,
      negativeMarking,
      shuffleQuestions,
      shuffleOptions,
      randomizeSets,
      questionNumbering,
      randomSelection: numberOfSets > 1,
      showScoreAfterSubmit,
      showAnswersAfterSubmit,
      hideCorrectAnswers: false,
      autoGrading: true,
      requiresManualReview: questions.some((q) => q.requiresManualReview),
      unlockNextLesson,
      certificateOnPass,
      examMode: {
        enabled: true,
        fullScreen: true,
        timer: true,
        autoSubmitOnTimeout,
        disableNavigation: true,
        warnOnLeave: true,
        autoSave: true,
        resumeOnConnectionLoss: true,
      },
    };

    let savedQuiz: Quiz;
    if (initialQuiz) {
      updateQuiz(initialQuiz.id, quizData);
      savedQuiz = { ...initialQuiz, ...quizData };
    } else {
      savedQuiz = addQuiz(quizData);
    }

    onSave(savedQuiz);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 font-sans text-left overflow-hidden bg-[#F8FAFC]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-[1280px] h-full sm:h-[94vh] bg-[#F8FAFC] rounded-none sm:rounded-[20px] shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden"
        >
          {/* HEADER */}
          <div className="bg-white px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A] tracking-tight">
                {isEditing ? 'Edit Quiz Module' : 'Quiz Creation Wizard'}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5 font-normal">
                Independent Quiz Management • Set Configuration & Bulk Question Upload
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={status === 'Published' ? 'success' : 'secondary'} size="sm">
                {status}
              </Badge>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* STEP GUARD NAVIGATION */}
          <div className="px-6 py-3 bg-white border-b border-[#E2E8F0]">
            <StepGuard
              steps={steps}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={(stepNum) => setCurrentStep(stepNum)}
            />
          </div>

          {/* WIZARD FORM BODY */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: QUIZ INFORMATION */}
            {currentStep === 1 && (
              <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-4 shadow-2xs">
                <h3 className="text-base font-semibold text-[#0F172A] border-b pb-2">STEP 1 — Quiz Information</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Quiz Name *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. React 19 Server Components Assessment"
                      className="w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-xl font-medium focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Short Description</label>
                    <input
                      type="text"
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                      placeholder="Brief overview displayed to students"
                      className="w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-xl font-medium focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Detailed Instructions</label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={3}
                      placeholder="Special instructions, exam rules, and pass requirements..."
                      className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl font-medium focus:outline-none focus:border-[#2563EB] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Quiz Category</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 px-3 border border-[#E2E8F0] rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Quiz Type</label>
                      <select
                        value={quizType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQuizType(e.target.value as QuizType)}
                        className="w-full h-11 px-3 border border-[#E2E8F0] rounded-xl font-semibold"
                      >
                        <option value="practice">Practice Quiz</option>
                        <option value="graded">Graded Assessment</option>
                        <option value="final_exam">Final Exam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                        className="w-full h-11 px-3 border border-[#E2E8F0] rounded-xl font-semibold"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Duration (Mins)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full h-11 px-3 border border-[#E2E8F0] rounded-xl font-bold text-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: QUESTION CONFIGURATION */}
            {currentStep === 2 && (
              <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-6 shadow-2xs">
                <h3 className="text-base font-semibold text-[#0F172A] border-b pb-2">STEP 2 — Question Configuration</h3>

                {/* Mandatory Question Mode Toggle */}
                <div className="space-y-2 text-xs">
                  <label className="block font-semibold text-[#0F172A]">Question Mode *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setQuestionMode('OMR')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        questionMode === 'OMR'
                          ? 'bg-blue-50/70 border-[#2563EB] ring-2 ring-blue-100'
                          : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
                        <FileCheck className="w-4 h-4 text-[#2563EB]" />
                        <span>OMR (Objective Multiple Choice)</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Automated OMR scoring with options A to E, single/multiple correct answers, and set randomization.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuestionMode('Direct')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        questionMode === 'Direct'
                          ? 'bg-blue-50/70 border-[#2563EB] ring-2 ring-blue-100'
                          : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
                        <FileText className="w-4 h-4 text-[#2563EB]" />
                        <span>Direct Answer (Short/Essay)</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Short answer & essay evaluations requiring expected answer hints or manual instructor review.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Question Sets & Count Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Number of Question Sets</label>
                    <select
                      value={numberOfSets}
                      onChange={(e) => setNumberOfSets(Number(e.target.value))}
                      className="w-full h-11 px-3 border border-[#E2E8F0] rounded-xl font-bold text-[#2563EB]"
                    >
                      <option value={1}>1 Set (Set A)</option>
                      <option value={2}>2 Sets (Set A, B)</option>
                      <option value={4}>4 Sets (Set A, B, C, D)</option>
                      <option value={10}>10 Sets (Set A to J)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Questions Per Set</label>
                    <select
                      value={questionsPerSet}
                      onChange={(e) => setQuestionsPerSet(Number(e.target.value))}
                      className="w-full h-11 px-3 border border-[#E2E8F0] rounded-xl font-bold text-[#2563EB]"
                    >
                      <option value={10}>10 Questions</option>
                      <option value={25}>25 Questions</option>
                      <option value={50}>50 Questions</option>
                      <option value={100}>100 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Passing Threshold (%)</label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      className="w-full h-11 px-3 border border-[#E2E8F0] rounded-xl font-bold text-[#2563EB]"
                    />
                  </div>
                </div>

                {/* Scoring Rules & Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-[#E2E8F0]">
                  <label className="flex items-center gap-2 font-medium text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={(e) => setShuffleQuestions(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB]"
                    />
                    Shuffle Questions
                  </label>
                  <label className="flex items-center gap-2 font-medium text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={(e) => setShuffleOptions(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB]"
                    />
                    Shuffle Options
                  </label>
                  <label className="flex items-center gap-2 font-medium text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={randomizeSets}
                      onChange={(e) => setRandomizeSets(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB]"
                    />
                    Randomize Sets
                  </label>
                  <label className="flex items-center gap-2 font-medium text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={negativeMarking}
                      onChange={(e) => setNegativeMarking(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB]"
                    />
                    Negative Marking
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: QUESTIONS (MANUAL OR BULK UPLOAD) */}
            {currentStep === 3 && (
              <div className="space-y-5">
                {/* SET PROGRESS CARDS */}
                <div className="bg-white p-4 border border-[#E2E8F0] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#0F172A]">Question Sets Status</h4>
                    <span className="text-[11px] text-[#64748B]">Target: {questionsPerSet} Questions / Set</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {setProgress.map((st) => (
                      <div
                        key={st.label}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          st.isComplete
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50/80 border-amber-200 text-amber-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{st.label}</span>
                          <span>{st.count} / {st.target}</span>
                        </div>
                        <span className="text-[10px] block opacity-80">
                          {st.isComplete ? '✓ Set Completed' : `Needs ${st.target - st.count} Questions`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ENTRY MODE SELECTOR (MANUAL vs BULK UPLOAD) */}
                <div className="flex items-center justify-between bg-white p-4 border border-[#E2E8F0] rounded-xl">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEntryMode('bulk')}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        entryMode === 'bulk' ? 'bg-[#2563EB] text-white shadow-2xs' : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                      Option 2: Bulk Upload (Excel/CSV)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryMode('manual')}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        entryMode === 'manual' ? 'bg-[#2563EB] text-white shadow-2xs' : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      Option 1: Manual Entry
                    </button>
                  </div>

                  {entryMode === 'manual' && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddQuestion(questionMode === 'OMR' ? 'mcq' : 'short_answer')}
                      className="h-9 text-xs font-semibold bg-[#2563EB] text-white"
                    >
                      + Add Question
                    </Button>
                  )}
                </div>

                {/* BULK UPLOAD PANEL */}
                {entryMode === 'bulk' && (
                  <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-4 shadow-2xs text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                      <div>
                        <h4 className="font-semibold text-sm text-[#0F172A]">Generate & Download Excel/CSV Template</h4>
                        <p className="text-[11px] text-[#64748B]">
                          Automatically generated based on Step 2 Config ({questionMode} Mode • {numberOfSets} Sets • {questionsPerSet} Qs/Set).
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateTemplate(questionMode)}
                          leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
                          className="h-10 text-xs font-semibold border-[#2563EB] text-[#2563EB]"
                        >
                          Download {questionMode} Template
                        </Button>
                      </div>
                    </div>

                    {/* FILE DROPZONE */}
                    <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl p-6 text-center bg-[#F8FAFC] space-y-2">
                      <FileSpreadsheet className="w-8 h-8 text-[#2563EB] mx-auto" />
                      <div className="space-y-1">
                        <strong className="text-xs font-semibold text-[#0F172A] block">
                          Upload CSV or Excel Workbook (.csv, .xlsx)
                        </strong>
                        <span className="text-[11px] text-[#64748B] block">
                          Select the template file populated with your question sets.
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="bulk-quiz-upload"
                      />
                      <label
                        htmlFor="bulk-quiz-upload"
                        className="inline-flex items-center px-4 py-2 bg-[#2563EB] text-white font-semibold text-xs rounded-xl cursor-pointer hover:bg-[#1D4ED8] transition-colors"
                      >
                        Choose File to Upload
                      </label>
                    </div>

                    {parseNotice && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
                        ✓ {parseNotice}
                      </div>
                    )}

                    {validationErrors.length > 0 && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                        <strong className="font-semibold text-rose-900 block">Validation Errors Found:</strong>
                        <ul className="list-disc list-inside text-rose-800 text-[11px]">
                          {validationErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* EDITABLE QUESTIONS LIST */}
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id || idx} className="p-4 bg-white border border-[#E2E8F0] rounded-[16px] space-y-3 shadow-2xs text-xs">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2563EB]">Q{idx + 1}</span>
                          <Badge variant="neutral" size="sm" className="border-blue-200 text-[#2563EB]">
                            {q.questionSet || 'Set A'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={q.marks || 2}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].marks = Number(e.target.value);
                              setQuestions(updated);
                            }}
                            className="w-16 h-7 px-2 border rounded-lg font-bold text-center text-[#2563EB]"
                          />
                          <span className="text-[#64748B]">Marks</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={q.question || ''}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].question = e.target.value;
                          setQuestions(updated);
                        }}
                        placeholder="Type question prompt..."
                        className="w-full h-10 px-3 border rounded-xl font-medium focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: QUIZ SETTINGS */}
            {currentStep === 4 && (
              <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-4 shadow-2xs text-xs">
                <h3 className="text-base font-semibold text-[#0F172A] border-b pb-2">STEP 4 — Quiz Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Max Attempts</label>
                    <input
                      type="number"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Number(e.target.value))}
                      className="w-full h-11 px-3 border rounded-xl font-bold text-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Time Limit (Minutes)</label>
                    <input
                      type="number"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                      className="w-full h-11 px-3 border rounded-xl font-bold text-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Passing Threshold (%)</label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      className="w-full h-11 px-3 border rounded-xl font-bold text-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                  <label className="flex items-center gap-2 font-medium text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unlockNextLesson}
                      onChange={(e) => setUnlockNextLesson(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB]"
                    />
                    Unlock Next Lesson Upon Passing
                  </label>
                  <label className="flex items-center gap-2 font-medium text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={certificateOnPass}
                      onChange={(e) => setCertificateOnPass(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB]"
                    />
                    Generate Course Certificate Upon Passing
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & PUBLISH */}
            {currentStep === 5 && (
              <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-4 shadow-2xs text-xs">
                <h3 className="text-base font-semibold text-[#0F172A] border-b pb-2">STEP 5 — Review & Publish Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[#64748B] block">Quiz Name:</span>
                    <strong className="text-[#0F172A] font-semibold block truncate">{title}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[#64748B] block">Question Mode:</span>
                    <strong className="text-[#2563EB] font-bold block">{questionMode} Mode</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[#64748B] block">Question Sets:</span>
                    <strong className="text-[#2563EB] font-bold block">{numberOfSets} Sets ({questionsPerSet} Qs/Set)</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[#64748B] block">Pass Threshold:</span>
                    <strong className="text-emerald-600 font-bold block">{passingScore}%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STICKY FOOTER */}
          <div className="bg-white px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
              className="h-10 text-xs font-semibold"
            >
              &lt; Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="h-10 text-xs font-semibold">
                Cancel
              </Button>
              {currentStep < 5 ? (
                <Button type="button" onClick={handleNextStep} className="h-10 bg-[#2563EB] text-white text-xs font-semibold px-6">
                  Next Step &gt;
                </Button>
              ) : (
                <Button type="button" onClick={() => handleSaveQuiz(false)} className="h-10 bg-[#2563EB] text-white text-xs font-semibold px-6">
                  {isEditing ? 'Update Quiz' : 'Create & Publish Quiz'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
