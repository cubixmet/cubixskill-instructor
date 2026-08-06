import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  Download,
  Search,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Copy,
  Archive,
  Award,
  BarChart3,
  Shield,
  Layers,
  MoreVertical,
  Sliders,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useQuizStore } from '../../quizzes/store/quiz.store';
import { QuizFormWizardModal } from '../../quizzes/components/QuizFormWizardModal';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';
import type { Quiz, QuizStatus } from '../../../types/quiz.types';

export const CourseQuizzesPage: React.FC = () => {
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Store Selectors
  const quizzes = useQuizStore((state) => state.quizzes);
  const attempts = useQuizStore((state) => state.attempts);
  const deleteQuiz = useQuizStore((state) => state.deleteQuiz);
  const duplicateQuiz = useQuizStore((state) => state.duplicateQuiz);
  const publishQuiz = useQuizStore((state) => state.publishQuiz);
  const archiveQuiz = useQuizStore((state) => state.archiveQuiz);

  // Local UI & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'All' | 'Published' | 'Draft' | 'Archived' | 'Pending Review'>('All');
  const [quizTypeFilter, setQuizTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const returnTo = location.state?.returnTo || searchParams.get('returnTo');

  useEffect(() => {
    if (searchParams.get('create') === 'true' || location.state?.openCreateQuiz) {
      setIsWizardOpen(true);
    }
  }, [searchParams, location.state]);

  const courseQuizzes = useMemo(
    () => quizzes.filter((q) => q.courseUuid === courseUuid || !q.courseUuid),
    [quizzes, courseUuid]
  );

  // Summary Metrics
  const totalQuizzes = courseQuizzes.length;
  const publishedQuizzes = courseQuizzes.filter((q) => q.status === 'Published').length;
  const draftQuizzes = courseQuizzes.filter((q) => q.status === 'Draft').length;
  const totalAttempts = courseQuizzes.reduce((acc, q) => acc + (q.totalAttemptsCount || 0), 0);
  const avgScore = courseQuizzes.length
    ? Math.round(courseQuizzes.reduce((acc, q) => acc + (q.averageScore || 0), 0) / courseQuizzes.length)
    : 0;

  // Filtered Quizzes
  const filteredQuizzes = courseQuizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusTab === 'All' ? true : quiz.status === statusTab;
    const matchesType = quizTypeFilter === 'All' ? true : quiz.quizType === quizTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExportCSV = () => {
    const columns: CsvColumn<Quiz>[] = [
      { header: 'Quiz Title', accessor: 'title' },
      { header: 'Status', accessor: 'status' },
      { header: 'Type', accessor: 'quizType' },
      { header: 'Passing Score (%)', accessor: 'passingScore' },
      { header: 'Time Limit (Mins)', accessor: 'timeLimitMinutes' },
      { header: 'Attempts', accessor: 'totalAttemptsCount' },
      { header: 'Avg Score (%)', accessor: 'averageScore' },
      { header: 'Exam Mode', accessor: (q) => (q.examMode?.enabled ? 'Enabled' : 'Disabled') },
    ];

    exportToCsv(courseQuizzes, columns, `course-quizzes-${courseUuid}.csv`);
  };

  return (
    <div className="space-y-6 font-sans text-left bg-[#F8FAFC]">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-[#E2E8F0] rounded-[16px] shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Course Quizzes ({totalQuizzes})
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 font-normal">
            Create assessments, manage questions, review attempts, and analyze student performance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
            className="h-11 px-4 text-xs font-semibold"
          >
            Export Results
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditingQuiz(null);
              setIsWizardOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4 text-white stroke-[3]" />}
            className="h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-[12px]"
          >
            Create Quiz
          </Button>
        </div>
      </div>

      {/* 2. SUMMARY CARDS (5 Cards Row) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">Total Quizzes</span>
            <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          </div>
          <strong className="text-2xl font-bold text-[#0F172A]">{totalQuizzes}</strong>
        </Card>

        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-2xl font-bold text-emerald-600">{publishedQuizzes}</strong>
        </Card>

        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">Drafts</span>
            <Edit className="w-4 h-4 text-[#64748B]" />
          </div>
          <strong className="text-2xl font-bold text-[#0F172A]">{draftQuizzes}</strong>
        </Card>

        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">Total Attempts</span>
            <BarChart3 className="w-4 h-4 text-[#2563EB]" />
          </div>
          <strong className="text-2xl font-bold text-[#2563EB]">{totalAttempts}</strong>
        </Card>

        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">Avg Pass Score</span>
            <Award className="w-4 h-4 text-[#2563EB]" />
          </div>
          <strong className="text-2xl font-bold text-[#0F172A]">{avgScore}%</strong>
        </Card>
      </div>

      {/* 3. TOOLBAR (Search, Status Tabs & View Toggle) */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {(['All', 'Published', 'Draft', 'Archived'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusTab(tab)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  statusTab === tab
                    ? 'bg-[#2563EB] text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & View Mode */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quizzes by title..."
                className="w-full h-10 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex items-center border border-[#E2E8F0] rounded-xl p-1 bg-[#F8FAFC] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-[#2563EB]' : 'text-[#64748B]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-[#2563EB]' : 'text-[#64748B]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUIZ LIST / GRID CONTAINER */}
      {filteredQuizzes.length === 0 ? (
        <Card padding="lg" className="bg-white border border-[#E2E8F0] text-center space-y-3 py-12 rounded-[16px]">
          <HelpCircle className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-semibold text-[#0F172A]">No Quizzes Found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            No quizzes match your current filter or search criteria.
          </p>
        </Card>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Quiz Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Pass Threshold</th>
                  <th className="py-3.5 px-4">Time Limit</th>
                  <th className="py-3.5 px-4">Attempts</th>
                  <th className="py-3.5 px-4">Avg Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-xs font-semibold text-[#0F172A] block">{quiz.title}</strong>
                          <span className="text-[11px] text-[#64748B] line-clamp-1">{quiz.shortDescription}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 uppercase text-[11px] font-semibold text-[#64748B]">
                      {quiz.quizType}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#2563EB]">
                      {quiz.passingScore}%
                    </td>
                    <td className="py-4 px-4 font-medium text-[#0F172A]">
                      {quiz.timeLimitMinutes} Mins
                    </td>
                    <td className="py-4 px-4 font-bold text-[#0F172A]">
                      {quiz.totalAttemptsCount}
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-600">
                      {quiz.averageScore}%
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={quiz.status === 'Published' ? 'success' : 'secondary'} size="sm">
                        {quiz.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingQuiz(quiz);
                            setIsWizardOpen(true);
                          }}
                          className="h-8 text-[11px] px-3 font-semibold"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateQuiz(quiz.id)}
                          className="h-8 text-[11px] px-2"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => deleteQuiz(quiz.id)}
                          className="h-8 text-[11px] px-2 border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] space-y-4 shadow-2xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={quiz.status === 'Published' ? 'success' : 'secondary'} size="sm">
                      {quiz.status}
                    </Badge>
                    {quiz.examMode?.enabled && (
                      <Badge variant="outline" size="sm" className="border-blue-200 text-[#2563EB]">
                        Exam Mode
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-[#0F172A]">{quiz.title}</h3>
                  <p className="text-xs text-[#64748B] line-clamp-2">{quiz.shortDescription}</p>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-[#64748B]">
                  <span>Passing Score:</span>
                  <strong className="text-[#2563EB] font-bold">{quiz.passingScore}%</strong>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Time Limit:</span>
                  <strong className="text-[#0F172A] font-semibold">{quiz.timeLimitMinutes} Mins</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingQuiz(quiz);
                    setIsWizardOpen(true);
                  }}
                  className="h-8 text-xs font-semibold"
                >
                  Edit Quiz
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => deleteQuiz(quiz.id)}
                  className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* QUIZ WIZARD MODAL */}
      <QuizFormWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialQuiz={editingQuiz}
        courseUuid={courseUuid}
        onSave={(savedQuiz) => {
          if (returnTo) {
            navigate(`${returnTo}?attachedQuizUuid=${savedQuiz.id}`);
          }
        }}
      />
    </div>
  );
};
