import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Video,
  HelpCircle,
  FileCheck,
  ShieldAlert,
  Award,
  DollarSign,
  BarChart3,
  Film,
  Download,
  Printer,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  QrCode,
  FileText,
  AlertTriangle,
  PlayCircle,
  Award as CertificateIcon,
  ShoppingBag,
  CreditCard,
  Layers,
  ChevronRight,
  ExternalLink,
  Eye,
  Check,
  XCircle,
  FileSpreadsheet,
  FileDown,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { SkeletonCard, SkeletonTable } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';

export type ReportTab =
  | 'students'
  | 'courses'
  | 'videos'
  | 'quizzes'
  | 'assignments'
  | 'exams'
  | 'certificates'
  | 'revenue'
  | 'credits'
  | 'media';

export const ReportsPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<ReportTab>('students');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [dateRange, setDateRange] = useState('30d');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Simulated Export Actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExport = (format: string) => {
    showToast(`Generating ${format.toUpperCase()} report export...`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  // Mock Tabs metadata
  const tabs: { id: ReportTab; label: string; icon: any; count?: string }[] = [
    { id: 'students', label: 'Student Reports', icon: Users, count: '1,248' },
    { id: 'courses', label: 'Course Reports', icon: BookOpen, count: '14' },
    { id: 'videos', label: 'Video Reports', icon: Video, count: '186' },
    { id: 'quizzes', label: 'Quiz Reports', icon: HelpCircle, count: '42' },
    { id: 'assignments', label: 'Assignment Reports', icon: FileCheck, count: '28' },
    { id: 'exams', label: 'Exam Reports', icon: ShieldAlert, count: '6' },
    { id: 'certificates', label: 'Certificate Reports', icon: Award, count: '890' },
    { id: 'revenue', label: 'Revenue Reports', icon: DollarSign, count: '₹4.8M' },
    { id: 'credits', label: 'Credit Reports', icon: BarChart3, count: '12.4k' },
    { id: 'media', label: 'Media Reports', icon: Film, count: '342' },
  ];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Reports & Analytics Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
              Core Module
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Comprehensive telemetry, learning progress, financial performance, and credit consumption analytics.
          </p>
        </div>

        {/* Global Action & Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>

          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileDown className="w-3.5 h-3.5 text-rose-600" />}
            onClick={() => handleExport('PDF')}
          >
            Export PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={() => handleExport('Excel')}
          >
            Export Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5 text-blue-600" />}
            onClick={() => handleExport('CSV')}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <Card padding="md" className="space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Report Filter Matrix
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setDateRange('30d');
              setSelectedCourse('All');
              setSelectedStudent('All');
              setSelectedBatch('All');
              setSelectedCategory('All');
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Date Range */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Course Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs truncate"
            >
              <option value="All">All Courses</option>
              <option value="react">Fullstack React 19</option>
              <option value="python">Python FastAPI Backend</option>
              <option value="uiux">UI/UX Design Masterclass</option>
            </select>
          </div>

          {/* Student Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
            >
              <option value="All">All Enrolled Students</option>
              <option value="aarav">Aarav Patel</option>
              <option value="priya">Priya Sharma</option>
              <option value="rahul">Rahul Nair</option>
            </select>
          </div>

          {/* Batch Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
            >
              <option value="All">All Batches</option>
              <option value="2026-A">Batch 2026-A</option>
              <option value="2026-B">Batch 2026-B</option>
              <option value="weekend">Weekend Special</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
            >
              <option value="All">All Categories</option>
              <option value="webdev">Web Development</option>
              <option value="backend">Backend Engineering</option>
              <option value="design">Design & UX</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Dropout">Dropout</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Horizontal Nav Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content View */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard rows={3} />
          <SkeletonTable rows={5} />
        </div>
      ) : hasError ? (
        <ErrorState
          title="Failed to Load Report Data"
          message="An error occurred while fetching the telemetry data. Please retry."
          onRetry={handleRefresh}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* 1. STUDENT REPORTS TAB */}
            {activeTab === 'students' && <StudentReportsView searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}

            {/* 2. COURSE REPORTS TAB */}
            {activeTab === 'courses' && <CourseReportsView />}

            {/* 3. VIDEO REPORTS TAB */}
            {activeTab === 'videos' && <VideoReportsView />}

            {/* 4. QUIZ REPORTS TAB */}
            {activeTab === 'quizzes' && <QuizReportsView />}

            {/* 5. ASSIGNMENT REPORTS TAB */}
            {activeTab === 'assignments' && <AssignmentReportsView />}

            {/* 6. EXAM REPORTS TAB */}
            {activeTab === 'exams' && <ExamReportsView />}

            {/* 7. CERTIFICATE REPORTS TAB */}
            {activeTab === 'certificates' && <CertificateReportsView />}

            {/* 8. REVENUE REPORTS TAB */}
            {activeTab === 'revenue' && <RevenueReportsView />}

            {/* 9. CREDIT REPORTS TAB */}
            {activeTab === 'credits' && <CreditReportsView />}

            {/* 10. MEDIA REPORTS TAB */}
            {activeTab === 'media' && <MediaReportsView />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

/* =========================================================================
   1. STUDENT REPORTS SUB-COMPONENT
   ========================================================================= */
const StudentReportsView: React.FC<{ searchQuery: string; setSearchQuery: (q: string) => void }> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const studentsList = [
    {
      id: 'st-101',
      name: 'Aarav Patel',
      email: 'aarav.patel@gmail.com',
      overallProgress: 88,
      courseProgress: '88% (Fullstack React 19)',
      moduleProgress: 'Module 6 of 8 Completed',
      lessonCompletion: '42 / 48 Lessons',
      videoWatchProgress: '94% watched',
      quizResults: 'Avg 92% (5/5 passed)',
      assignmentResults: '3 Approved / 0 Pending',
      examResults: 'Passed (89%)',
      certStatus: 'Issued',
      lastLogin: '10 mins ago',
      learningTime: '34.5 hrs',
      courseCompletionPercent: 88,
      activityTimeline: 'Completed "Custom Hooks Deep Dive"',
    },
    {
      id: 'st-102',
      name: 'Priya Sharma',
      email: 'priya.sharma@yahoo.com',
      overallProgress: 45,
      courseProgress: '45% (Python FastAPI Backend)',
      moduleProgress: 'Module 3 of 7 Completed',
      lessonCompletion: '18 / 40 Lessons',
      videoWatchProgress: '60% watched',
      quizResults: 'Avg 78% (3/4 passed)',
      assignmentResults: '1 Approved / 1 Pending Review',
      examResults: 'Not Attempted',
      certStatus: 'In Progress',
      lastLogin: '2 hours ago',
      learningTime: '18.2 hrs',
      courseCompletionPercent: 45,
      activityTimeline: 'Submitted Assignment 2',
    },
    {
      id: 'st-103',
      name: 'Rahul Nair',
      email: 'rahul.nair@outlook.com',
      overallProgress: 12,
      courseProgress: '12% (Fullstack React 19)',
      moduleProgress: 'Module 1 of 8 Completed',
      lessonCompletion: '5 / 48 Lessons',
      videoWatchProgress: '15% watched',
      quizResults: 'Avg 54% (1/2 passed)',
      assignmentResults: '0 Submitted',
      examResults: 'Not Attempted',
      certStatus: 'In Progress',
      lastLogin: '3 days ago',
      learningTime: '4.1 hrs',
      courseCompletionPercent: 12,
      activityTimeline: 'Watched "Introduction to JSX"',
    },
  ];

  const filtered = studentsList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student progress reports..."
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <span className="text-xs font-extrabold text-slate-500">
          Showing {filtered.length} of {studentsList.length} Student Reports
        </span>
      </div>

      {/* Main Student Progress Table (Desktop) */}
      <Card padding="none" className="overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Overall Progress</th>
                <th className="p-4">Module & Lessons</th>
                <th className="p-4">Video Watch</th>
                <th className="p-4">Quiz / Exam</th>
                <th className="p-4">Assignments</th>
                <th className="p-4">Learning Time</th>
                <th className="p-4">Certificate</th>
                <th className="p-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{st.name}</span>
                        <span className="text-[11px] text-slate-400">{st.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="w-32 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700">
                        <span>{st.overallProgress}%</span>
                        <span className="text-blue-600 font-semibold">Overall</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${st.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800 block">{st.moduleProgress}</span>
                    <span className="text-[11px] text-slate-500">{st.lessonCompletion}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
                      {st.videoWatchProgress}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800 block">{st.quizResults}</span>
                    <span className="text-[11px] text-emerald-600 font-bold">Exam: {st.examResults}</span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{st.assignmentResults}</td>
                  <td className="p-4 font-bold text-slate-900">{st.learningTime}</td>
                  <td className="p-4">
                    <Badge variant={st.certStatus === 'Issued' ? 'success' : 'neutral'}>
                      {st.certStatus}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-800 font-semibold block">{st.lastLogin}</span>
                    <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
                      {st.activityTimeline}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="lg:hidden p-4 space-y-4">
          {filtered.map((st) => (
            <div key={st.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {st.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                    <p className="text-[11px] text-slate-500">{st.email}</p>
                  </div>
                </div>
                <Badge variant={st.certStatus === 'Issued' ? 'success' : 'neutral'}>
                  {st.certStatus}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Course Progress</span>
                  <span>{st.overallProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${st.overallProgress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold">Video Watch</span>
                  <span className="font-bold text-slate-800">{st.videoWatchProgress}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Learning Time</span>
                  <span className="font-bold text-slate-800">{st.learningTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Quizzes</span>
                  <span className="font-bold text-slate-800">{st.quizResults}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Last Active</span>
                  <span className="font-bold text-slate-800">{st.lastLogin}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* =========================================================================
   2. COURSE REPORTS SUB-COMPONENT
   ========================================================================= */
const CourseReportsView: React.FC = () => {
  const courses = [
    {
      title: 'Fullstack React 19 & TypeScript Masterclass',
      totalEnrollments: 420,
      activeStudents: 380,
      completedStudents: 32,
      dropoutStudents: 8,
      avgProgress: 76,
      avgQuizScore: '88%',
      assignmentCompletionRate: '92%',
      certificateIssued: 32,
      revenueGenerated: '₹1,259,580',
      creditsConsumed: '4,200 Cr',
    },
    {
      title: 'Python FastAPI Backend & Microservices',
      totalEnrollments: 310,
      activeStudents: 275,
      completedStudents: 25,
      dropoutStudents: 10,
      avgProgress: 68,
      avgQuizScore: '82%',
      assignmentCompletionRate: '85%',
      certificateIssued: 25,
      revenueGenerated: '₹774,690',
      creditsConsumed: '3,100 Cr',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Aggregated Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatWidget title="Total Enrollments" value="1,248" sub="Across all courses" icon={Users} color="blue" />
        <StatWidget title="Active Students" value="1,120" sub="90% active engagement" icon={CheckCircle2} color="emerald" />
        <StatWidget title="Completed Students" value="98" sub="Graduated students" icon={Award} color="sky" />
        <StatWidget title="Dropout Rate" value="2.4%" sub="Low churn metric" icon={AlertTriangle} color="amber" />
        <StatWidget title="Credits Consumed" value="12,480" sub="Enrolled credit sum" icon={BarChart3} color="purple" />
      </div>

      {/* Detailed Course Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course, idx) => (
          <Card key={idx} padding="md" className="space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">{course.title}</h3>
                <span className="text-xs text-slate-500 font-medium">Telemetry overview</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200">
                Active Course
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Enrollments</span>
                <span className="font-extrabold text-slate-900 text-sm">{course.totalEnrollments}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Active Students</span>
                <span className="font-extrabold text-emerald-600 text-sm">{course.activeStudents}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Completed</span>
                <span className="font-extrabold text-blue-600 text-sm">{course.completedStudents}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Dropouts</span>
                <span className="font-extrabold text-rose-600 text-sm">{course.dropoutStudents}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Avg Quiz Score</span>
                <span className="font-extrabold text-slate-900 text-sm">{course.avgQuizScore}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Assignment Rate</span>
                <span className="font-extrabold text-slate-900 text-sm">{course.assignmentCompletionRate}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-bold">
              <span className="text-slate-600">Revenue: <strong className="text-slate-900 font-black">{course.revenueGenerated}</strong></span>
              <span className="text-blue-600">Credits: {course.creditsConsumed}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   3. VIDEO REPORTS SUB-COMPONENT
   ========================================================================= */
const VideoReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatWidget title="Avg Watch Percentage" value="84.2%" sub="+3.1% from last month" icon={Video} color="blue" />
        <StatWidget title="Completed Video Views" value="14,290" sub="Full playbacks" icon={PlayCircle} color="emerald" />
        <StatWidget title="Avg Watch Time" value="14.8 Mins" sub="Per video session" icon={Clock} color="purple" />
        <StatWidget title="Skipped Videos" value="1.8%" sub="Low skip rate" icon={AlertTriangle} color="amber" />
      </div>

      {/* Most & Least Viewed Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md" className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <PlayCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Most Viewed Lessons</h3>
          </div>
          <div className="space-y-3 text-xs">
            <VideoRow title="1. React 19 Server Components Explained" views="3,420 views" retention="96% retention" rating="4.9/5" />
            <VideoRow title="2. Fast API Async Database Handlers" views="2,890 views" retention="92% retention" rating="4.8/5" />
            <VideoRow title="3. Zustand State Management & Selectors" views="2,410 views" retention="89% retention" rating="4.7/5" />
          </div>
        </Card>

        <Card padding="md" className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-extrabold text-slate-900">Least Viewed / Low Retention Lessons</h3>
          </div>
          <div className="space-y-3 text-xs">
            <VideoRow title="1. Legacy Redux Toolkit Migration" views="180 views" retention="42% retention" rating="3.8/5" warning />
            <VideoRow title="2. Complex WebGL Canvas Setup" views="210 views" retention="48% retention" rating="4.0/5" warning />
            <VideoRow title="3. Docker Multi-Stage Builds" views="310 views" retention="55% retention" rating="4.2/5" warning />
          </div>
        </Card>
      </div>
    </div>
  );
};

const VideoRow: React.FC<{ title: string; views: string; retention: string; rating: string; warning?: boolean }> = ({
  title,
  views,
  retention,
  rating,
  warning,
}) => (
  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
    <div className="min-w-0">
      <span className="font-bold text-slate-900 truncate block">{title}</span>
      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
        <span>{views}</span>
        <span>•</span>
        <span className={warning ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{retention}</span>
      </div>
    </div>
    <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-extrabold text-[11px] text-slate-700 shrink-0">
      {rating}
    </span>
  </div>
);

/* =========================================================================
   4. QUIZ REPORTS SUB-COMPONENT
   ========================================================================= */
const QuizReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatWidget title="Total Attempts" value="3,840" sub="All quizzes" icon={HelpCircle} color="blue" />
        <StatWidget title="Pass Rate" value="88.4%" sub="Passed first try" icon={CheckCircle2} color="emerald" />
        <StatWidget title="Fail Rate" value="11.6%" sub="Needs retake" icon={XCircle} color="rose" />
        <StatWidget title="Highest Score" value="100%" sub="Perfect score" icon={Award} color="amber" />
        <StatWidget title="Lowest Score" value="34%" sub="Minimum grade" icon={AlertTriangle} color="slate" />
        <StatWidget title="Average Score" value="82.5%" sub="Overall average" icon={BarChart3} color="purple" />
      </div>

      <Card padding="md" className="space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
          Quiz Question Difficulty & Item Analysis
        </h3>
        <div className="space-y-3 text-xs">
          <QuestionAnalysisRow
            question="Q1: What is the main difference between Server and Client Components in React 19?"
            correctRate="94%"
            avgTime="45s"
            difficulty="Easy"
          />
          <QuestionAnalysisRow
            question="Q2: How do you handle race conditions in FastAPI asynchronous background tasks?"
            correctRate="62%"
            avgTime="1m 20s"
            difficulty="Hard"
          />
          <QuestionAnalysisRow
            question="Q3: What happens when Zustand useStore selector returns a mutated state object?"
            correctRate="78%"
            avgTime="55s"
            difficulty="Medium"
          />
        </div>
      </Card>
    </div>
  );
};

const QuestionAnalysisRow: React.FC<{ question: string; correctRate: string; avgTime: string; difficulty: string }> = ({
  question,
  correctRate,
  avgTime,
  difficulty,
}) => (
  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <span className="font-bold text-slate-900 flex-1">{question}</span>
    <div className="flex items-center gap-3 shrink-0 text-[11px]">
      <span className="text-slate-500">Avg Time: <strong>{avgTime}</strong></span>
      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
        Correct: {correctRate}
      </span>
      <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
        {difficulty}
      </span>
    </div>
  </div>
);

/* =========================================================================
   5. ASSIGNMENT REPORTS SUB-COMPONENT
   ========================================================================= */
const AssignmentReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <StatWidget title="Total Assignments" value="28" sub="Published tasks" icon={FileCheck} color="blue" />
        <StatWidget title="Submitted" value="1,840" sub="Student submissions" icon={Check} color="sky" />
        <StatWidget title="Pending Review" value="18" sub="Needs instructor grading" icon={Clock} color="amber" />
        <StatWidget title="Approved" value="1,750" sub="Accepted tasks" icon={CheckCircle2} color="emerald" />
        <StatWidget title="Rejected" value="72" sub="Requires resubmission" icon={XCircle} color="rose" />
        <StatWidget title="Late Submissions" value="45" sub="Submitted past deadline" icon={AlertTriangle} color="purple" />
        <StatWidget title="Average Marks" value="86 / 100" sub="Overall grade" icon={Award} color="emerald" />
      </div>
    </div>
  );
};

/* =========================================================================
   6. EXAM REPORTS SUB-COMPONENT
   ========================================================================= */
const ExamReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <StatWidget title="Exam Attempts" value="640" sub="Total attempts" icon={ShieldAlert} color="blue" />
        <StatWidget title="Pass Percentage" value="91.2%" sub="Passed exam" icon={CheckCircle2} color="emerald" />
        <StatWidget title="Fail Percentage" value="8.8%" sub="Failed exam" icon={XCircle} color="rose" />
        <StatWidget title="Avg Time Taken" value="48 Mins" sub="Out of 60 Mins" icon={Clock} color="purple" />
        <StatWidget title="Top Rank" value="#1 (100%)" sub="Aarav Patel" icon={Award} color="amber" />
        <StatWidget title="Avg Marks" value="88 / 100" sub="Mean score" icon={BarChart3} color="sky" />
        <StatWidget title="Completion Status" value="98.5%" sub="Submitted on time" icon={Check} color="emerald" />
      </div>
    </div>
  );
};

/* =========================================================================
   7. CERTIFICATE REPORTS SUB-COMPONENT
   ========================================================================= */
const CertificateReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatWidget title="Certificates Issued" value="890" sub="Verified credentials" icon={Award} color="emerald" />
        <StatWidget title="Pending Verification" value="12" sub="Awaiting final check" icon={Clock} color="amber" />
        <StatWidget title="Certificate Downloads" value="1,420" sub="PDF downloads" icon={Download} color="blue" />
        <StatWidget title="QR Verifications" value="3,120" sub="Scanned & verified" icon={QrCode} color="purple" />
      </div>
    </div>
  );
};

/* =========================================================================
   8. REVENUE REPORTS SUB-COMPONENT
   ========================================================================= */
const RevenueReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatWidget title="Total Revenue" value="₹4,850,000" sub="+28.4% YoY" icon={DollarSign} color="emerald" />
        <StatWidget title="Total Orders" value="1,620" sub="Successful purchases" icon={ShoppingBag} color="blue" />
        <StatWidget title="Refund Rate" value="0.4%" sub="2 refunds processed" icon={AlertTriangle} color="rose" />
        <StatWidget title="Coupons Used" value="340" sub="Discount redemptions" icon={CreditCard} color="purple" />
        <StatWidget title="Monthly Revenue" value="₹412,000" sub="This month" icon={TrendingUp} color="sky" />
        <StatWidget title="Yearly Revenue" value="₹4.85M" sub="Current fiscal year" icon={Calendar} color="indigo" />
      </div>
    </div>
  );
};

/* =========================================================================
   9. CREDIT REPORTS SUB-COMPONENT
   ========================================================================= */
const CreditReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Primary Credit Overview Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatWidget title="Credits Purchased" value="50,000 Cr" sub="Lifetime bought" icon={BarChart3} color="blue" />
        <StatWidget title="Credits Used" value="37,550 Cr" sub="Total consumed" icon={BarChart3} color="purple" />
        <StatWidget title="Credits Remaining" value="12,450 Cr" sub="Available balance" icon={CheckCircle2} color="emerald" />
        <StatWidget title="Enrollment Credits" value="28,400 Cr" sub="Student enrollment fee" icon={Users} color="indigo" />
      </div>

      {/* Credit Consumption Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md" className="space-y-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Media Upload Credits</span>
          <div className="text-xl font-extrabold text-slate-900">4,250 Credits</div>
          <p className="text-slate-500 font-medium">Video DRM encoding and asset distribution.</p>
        </Card>

        <Card padding="md" className="space-y-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Staff Access Credits</span>
          <div className="text-xl font-extrabold text-slate-900">1,800 Credits</div>
          <p className="text-slate-500 font-medium">Teaching assistant seat allocations.</p>
        </Card>

        <Card padding="md" className="space-y-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Support Desk Credits</span>
          <div className="text-xl font-extrabold text-slate-900">3,100 Credits</div>
          <p className="text-slate-500 font-medium">Priority student support SLA tickets.</p>
        </Card>
      </div>
    </div>
  );
};

/* =========================================================================
   10. MEDIA REPORTS SUB-COMPONENT (NO STORAGE PLANS / PERCENTAGE / QUOTA)
   ========================================================================= */
const MediaReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Strict Compliance Notice: No Storage Quota / Percentage Displayed */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center gap-2 text-xs text-blue-900 font-semibold">
        <Film className="w-4 h-4 text-blue-600 shrink-0" />
        <span>Media file counts and credit usage breakdown. (Storage quotas/percentages are excluded).</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatWidget title="Uploaded Videos" value="186 Videos" sub="DRM encrypted" icon={Video} color="blue" />
        <StatWidget title="Uploaded Images" value="412 Images" sub="PNG/WebP assets" icon={Film} color="purple" />
        <StatWidget title="Uploaded Documents" value="94 PDFs" sub="PDF study guides" icon={FileText} color="emerald" />
        <StatWidget title="Uploaded Audio" value="48 Podcasts" sub="MP3 audio lessons" icon={Film} color="amber" />
        <StatWidget title="Total Media Files" value="740 Files" sub="Across all courses" icon={Layers} color="sky" />
        <StatWidget title="Media Credits Used" value="4,250 Cr" sub="Processing fee" icon={BarChart3} color="indigo" />
      </div>
    </div>
  );
};

/* =========================================================================
   GENERIC STAT WIDGET HELPER
   ========================================================================= */
const StatWidget: React.FC<{
  title: string;
  value: string;
  sub: string;
  icon: any;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'sky' | 'indigo' | 'slate';
}> = ({ title, value, sub, icon: Icon, color }) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200/60',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    purple: 'bg-purple-50 text-purple-600 border-purple-200/60',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/60',
    rose: 'bg-rose-50 text-rose-600 border-rose-200/60',
    sky: 'bg-sky-50 text-sky-600 border-sky-200/60',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200/60',
  };

  return (
    <Card padding="sm" className="space-y-2 text-left">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${colorStyles[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <span className="text-xl font-black text-slate-900 tracking-tight block leading-none">{value}</span>
        <span className="text-[10px] font-semibold text-slate-400 mt-1 block truncate">{sub}</span>
      </div>
    </Card>
  );
};
