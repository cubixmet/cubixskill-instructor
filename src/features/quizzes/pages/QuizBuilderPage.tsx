import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  GripVertical,
  Check,
  Code,
  Shield,
  Save,
  Rocket,
  CheckCircle2,
  ArrowLeft,
  Settings,
  Users,
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import type { Quiz, QuizQuestionItem, QuestionType, QuizAttemptResult } from '../../../types/quiz.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const QuizBuilderPage: React.FC = () => {
  const { courseUuid = '', quizUuid = '' } = useParams<{ courseUuid?: string; quizUuid?: string }>();

  const [activeTab, setActiveTab] = useState<'editor' | 'settings' | 'exam_mode' | 'results' | 'review'>('editor');

  // Quiz Data State
  const [quiz, setQuiz] = useState<Quiz>({
    id: quizUuid,
    courseUuid,
    title: 'React 19 Server Components & Actions Assessment',
    description: 'Comprehensive quiz evaluating server components, action hooks, and state boundaries.',
    instructions: 'Read each question carefully. Correct answers get positive marks.',
    passingMarks: 80,
    totalMarks: 100,
    maxAttempts: 3,
    timeLimitMinutes: 30,
    negativeMarksEnabled: false,
    shuffleQuestions: true,
    shuffleAnswers: true,
    randomQuestionSelection: false,
    randomQuestionsToShowCount: 5,
    showScoreAfterSubmission: true,
    showAnswersAfterSubmission: true,
    hideCorrectAnswers: false,
    autoGrading: true,
    manualReviewRequired: true,
    autoSubmitOnTimeout: true,
    unlockNextLessonAfterPass: true,
    triggerCertificateAfterPass: false,
    isExamMode: false,
    fullScreenRequired: true,
    disableNavigation: true,
    warnOnTabSwitch: true,
    autoSaveAnswers: true,
    resumeAfterDisconnect: true,
    questions: [
      {
        id: 'q-550e8400-e29b-41d4-a716-446655444001',
        type: 'mcq',
        questionText: 'What is the primary benefit of React Server Components (RSC)?',
        options: [
          'Zero client-side JavaScript bundle size for server components',
          'Faster CSS animations on mobile devices',
          'Automatic Redux store synchronization',
          'Bypassing server-side rendering entirely',
        ],
        correctAnswers: 'Zero client-side JavaScript bundle size for server components',
        marks: 25,
        explanation: 'Server Components execute only on the server and do not ship code to the client bundle.',
        isRequired: true,
      },
      {
        id: 'q-550e8400-e29b-41d4-a716-446655444002',
        type: 'true_false',
        questionText: 'Server Actions can be called directly from Client Components via form actions or event handlers.',
        options: ['True', 'False'],
        correctAnswers: 'True',
        marks: 25,
        explanation: 'Server actions act as RPC endpoints and can be triggered directly from client components.',
        isRequired: true,
      },
      {
        id: 'q-550e8400-e29b-41d4-a716-446655444003',
        type: 'coding',
        questionText: 'Write a basic Server Action function to mutate cart state in React 19.',
        codingLanguage: 'typescript',
        starterCode: `'use server';\n\nexport async function updateCart(formData: FormData) {\n  // TODO: Add cart item mutation logic\n}`,
        expectedOutputDescription: 'Function must accept FormData and append item to cart state.',
        marks: 50,
        explanation: 'Requires manual instructor review.',
        isRequired: true,
      },
    ],
  } as unknown as Quiz);

  // Results Mock Data
  const [results, setResults] = useState<QuizAttemptResult[]>([
    {
      id: 'att-1',
      studentUuid: 'st-101',
      studentName: 'Aarav Patel',
      studentEmail: 'aarav@gmail.com',
      attemptNumber: 1,
      score: 50,
      maxScore: 100,
      passed: false,
      timeTakenMinutes: 18,
      submittedAt: '2026-08-04 14:30',
      autoGradedMarks: 50,
      manualMarks: 0,
      pendingManualMarks: 50,
      status: 'needs_manual_review',
    },
    {
      id: 'att-2',
      studentUuid: 'st-102',
      studentName: 'Priya Sharma',
      studentEmail: 'priya@yahoo.com',
      attemptNumber: 1,
      score: 95,
      maxScore: 100,
      passed: true,
      timeTakenMinutes: 22,
      submittedAt: '2026-08-04 15:10',
      autoGradedMarks: 50,
      manualMarks: 45,
      pendingManualMarks: 45,
      status: 'graded',
      instructorFeedback: 'Excellent implementation of Server Action!',
    },
  ]);

  // Active question modal / editor state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reviewAttemptModal, setReviewAttemptModal] = useState<QuizAttemptResult | null>(null);
  const [manualMarksInput, setManualMarksInput] = useState<number>(45);
  const [feedbackInput, setFeedbackInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddQuestion = (type: QuestionType) => {
    const newQ: QuizQuestionItem = {
      id: `q-${crypto.randomUUID()}`,
      type,
      questionText: 'New Question Prompt',
      marks: 10,
      isRequired: true,
      options: type === 'mcq' ? ['Option A', 'Option B', 'Option C'] : undefined,
      correctAnswers: type === 'mcq' ? ['Option A'] : undefined,
      starterCode: type === 'coding' ? `'use server';\n// Enter starter code` : undefined,
    };
    setQuiz((prev) => ({ ...prev, questions: [...(prev.questions || []), newQ] }));
    showToast(`Added ${type.toUpperCase()} question.`);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuiz((prev) => ({ ...prev, questions: (prev.questions || []).filter((q) => q.id !== id) }));
    showToast('Question removed.');
  };

  const handleGradeAttempt = () => {
    if (!reviewAttemptModal) return;
    const finalScore = reviewAttemptModal.autoGradedMarks + manualMarksInput;
    const isPass = finalScore >= (quiz.passingMarks || 0);

    setResults((prev) =>
      prev.map((r) =>
        r.id === reviewAttemptModal.id
          ? {
              ...r,
              score: finalScore,
              passed: isPass,
              status: 'graded',
              instructorFeedback: feedbackInput,
            }
          : r
      )
    );
    showToast('Student attempt graded successfully.');
    setReviewAttemptModal(null);
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to={`/courses/${courseUuid}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Course
            </Link>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{quiz.title}</h1>
              {quiz.isExamMode && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black uppercase">
                  Exam Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 font-mono">UUID: {quiz.id}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => showToast('Quiz draft saved.')}>
              <Save className="w-4 h-4" /> Save Draft
            </Button>

            <Button size="sm" leftIcon={<Rocket className="w-4 h-4" />} onClick={() => showToast('Quiz published!')}>
              Publish Quiz
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-slate-100 text-xs">
          {[
            { id: 'editor', label: 'Question Editor', icon: HelpCircle, count: `${(quiz.questions || []).length}` },
            { id: 'settings', label: 'Quiz Settings', icon: Settings },
            { id: 'exam_mode', label: 'Exam Mode Settings', icon: Shield },
            { id: 'results', label: 'Student Results & Grading', icon: Users, count: `${results.length}` },
            { id: 'review', label: 'Review & Summary', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50/80 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Panels */}
      <div className="space-y-6">
        {/* 1. QUESTION EDITOR TAB */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Quick Add Question Bar */}
            <Card padding="sm" className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Add Question Type</span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
                {[
                  { type: 'mcq', label: 'Multiple Choice' },
                  { type: 'multi_select', label: 'Multiple Select' },
                  { type: 'true_false', label: 'True / False' },
                  { type: 'fill_blank', label: 'Fill in Blank' },
                  { type: 'short_answer', label: 'Short Answer' },
                  { type: 'essay', label: 'Essay Question' },
                  { type: 'matching', label: 'Matching' },
                  { type: 'ordering', label: 'Ordering' },
                  { type: 'coding', label: 'Coding Question' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddQuestion(item.type as QuestionType)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Questions List */}
            <div className="space-y-4">
              {(quiz.questions || []).map((q, qIdx) => (
                <Card key={q.id} padding="md" className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center">
                        {qIdx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-extrabold text-[10px] uppercase text-slate-600">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-blue-600">{q.marks} Marks</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Input
                    label="Question Text"
                    value={q.questionText || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuiz((prev) => ({
                        ...prev,
                        questions: (prev.questions || []).map((item) =>
                          item.id === q.id ? { ...item, questionText: val } : item
                        ),
                      }));
                    }}
                  />

                  {/* CODING QUESTION SPECIFIC BUILDER */}
                  {q.type === 'coding' && (
                    <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                          <Code className="w-4 h-4" /> Browser-Based Code Editor
                        </span>
                        <span className="text-[10px] text-slate-400">Manual Review Required</span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Starter Code</label>
                        <textarea
                          rows={4}
                          value={q.starterCode || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuiz((prev) => ({
                              ...prev,
                              questions: (prev.questions || []).map((item) =>
                                item.id === q.id ? { ...item, starterCode: val } : item
                              ),
                            }));
                          }}
                          className="w-full p-3 bg-slate-950 text-emerald-400 font-mono border border-slate-800 rounded-xl focus:outline-none"
                        />
                      </div>

                      <Input
                        label="Expected Output / Instructions Description"
                        value={q.expectedOutputDescription || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuiz((prev) => ({
                            ...prev,
                            questions: (prev.questions || []).map((item) =>
                              item.id === q.id ? { ...item, expectedOutputDescription: val } : item
                            ),
                          }));
                        }}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 2. QUIZ SETTINGS TAB */}
        {activeTab === 'settings' && (
          <Card padding="md" className="space-y-6 text-xs max-w-3xl">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Quiz Scoring & Delivery Settings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Passing Marks (%)"
                type="number"
                value={quiz.passingMarks}
                onChange={(e) => setQuiz({ ...quiz, passingMarks: Number(e.target.value) })}
              />
              <Input
                label="Time Limit (Minutes)"
                type="number"
                value={quiz.timeLimitMinutes}
                onChange={(e) => setQuiz({ ...quiz, timeLimitMinutes: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-3 pt-2">
              {[
                { key: 'shuffleQuestions', label: 'Shuffle Questions Order per Student' },
                { key: 'shuffleAnswers', label: 'Shuffle Options Order per Question' },
                { key: 'randomQuestionSelection', label: 'Random Question Pool Selection' },
                { key: 'autoSubmitOnTimeout', label: 'Auto Submit Quiz when Timer Expires' },
                { key: 'unlockNextLessonAfterPass', label: 'Unlock Next Lesson after Passing Quiz' },
              ].map((sw) => (
                <label key={sw.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer">
                  <span className="font-extrabold text-slate-900">{sw.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean((quiz as unknown as Record<string, boolean>)[sw.key])}
                    onChange={(e) => setQuiz({ ...quiz, [sw.key]: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              ))}
            </div>
          </Card>
        )}

        {/* 3. EXAM MODE SETTINGS */}
        {activeTab === 'exam_mode' && (
          <Card padding="md" className="space-y-6 text-xs max-w-3xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Exam Mode Configuration</h3>
                <p className="text-slate-500 mt-0.5">Strict assessment rules without camera/proctoring plugins.</p>
              </div>
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <span>Enable Exam Mode</span>
                <input
                  type="checkbox"
                  checked={quiz.isExamMode}
                  onChange={(e) => setQuiz({ ...quiz, isExamMode: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded"
                />
              </label>
            </div>

            <div className="space-y-3">
              {[
                { key: 'fullScreenRequired', label: 'Enforce Full-Screen Browser Mode' },
                { key: 'disableNavigation', label: 'Disable Platform Navigation during Exam' },
                { key: 'warnOnTabSwitch', label: 'Show Warning on Full-Screen Exit' },
                { key: 'autoSaveAnswers', label: 'Auto Save Student Responses Continuously' },
                { key: 'resumeAfterDisconnect', label: 'Resume Quiz after Connection Loss' },
              ].map((sw) => (
                <label key={sw.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer">
                  <span className="font-extrabold text-slate-900">{sw.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean((quiz as unknown as Record<string, boolean>)[sw.key])}
                    onChange={(e) => setQuiz({ ...quiz, [sw.key]: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </label>
              ))}
            </div>
          </Card>
        )}

        {/* 4. STUDENT RESULTS & GRADING TAB */}
        {activeTab === 'results' && (
          <Card padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Student Quiz Attempts ({results.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Attempt</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Time Taken</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{r.studentName}</span>
                        <span className="text-[11px] text-slate-400">{r.studentEmail}</span>
                      </td>
                      <td className="p-4 font-bold">Attempt #{r.attemptNumber}</td>
                      <td className="p-4">
                        <span className={`font-black text-sm ${r.passed ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {r.score} / {r.maxScore}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{r.timeTakenMinutes} Mins</td>
                      <td className="p-4">
                        <Badge variant={r.status === 'graded' ? 'success' : 'warning'} dot>
                          {r.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewAttemptModal(r);
                            setManualMarksInput(r.pendingManualMarks || 0);
                            setFeedbackInput(r.instructorFeedback || '');
                          }}
                          className="font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Review Attempt &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Manual Grading Review Modal */}
      <Modal
        isOpen={Boolean(reviewAttemptModal)}
        onClose={() => setReviewAttemptModal(null)}
        title="Review Student Attempt & Grade"
      >
        <div className="space-y-4 text-xs text-left">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between">
            <div>
              <strong className="text-slate-900 block">{reviewAttemptModal?.studentName}</strong>
              <span className="text-slate-500">{reviewAttemptModal?.studentEmail}</span>
            </div>
            <span className="font-black text-blue-600 text-base">
              Auto: {reviewAttemptModal?.autoGradedMarks} Marks
            </span>
          </div>

          <Input
            label="Manual Review Marks (Coding Question / Essay)"
            type="number"
            value={manualMarksInput}
            onChange={(e) => setManualMarksInput(Number(e.target.value))}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">Instructor Feedback</label>
            <textarea
              rows={3}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Provide constructive feedback for student..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setReviewAttemptModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleGradeAttempt}>Approve & Save Grade</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
