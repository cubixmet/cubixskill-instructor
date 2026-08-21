import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  Download,
  Search,
  UsersRound,
  LayoutGrid,
  List,
  RotateCcw,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  BookOpen,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useCourseStore } from '../../courses/store/course.store';
import { authStore } from '../../../store/auth.store';
import { StudentTable } from '../components/StudentTable';
import { StudentCard } from '../components/StudentCard';
import { BulkAddStudentsModal } from '../components/BulkAddStudentsModal';
import { EnrollStudentModal } from '../components/EnrollStudentModal';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';
import { studentsService, type StudentData, type StudentSummaryData } from '../../../services/students.service';
import type { StudentDetail } from '../types/student.types';

export const StudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid } = useParams<{ courseUuid?: string }>();

  // Course store for course filter titles
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);
  const coursesList = useMemo(() => Object.values(coursesByUuid), [coursesByUuid]);

  // Auth / Permissions Check
  const user = authStore.getState().user;
  const userRole = (user?.role || 'instructor') as string;

  const canCreate = userRole === 'admin' || userRole === 'instructor' || userRole === 'ta';
  const canEdit = userRole === 'admin' || userRole === 'instructor' || userRole === 'ta';
  const canEnroll = userRole === 'admin' || userRole === 'instructor' || userRole === 'ta';
  const canToggleStatus = userRole === 'admin' || userRole === 'instructor';
  const canDelete = userRole === 'admin' || userRole === 'instructor';

  // View mode preference
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    return (localStorage.getItem('student-view-mode') as 'table' | 'grid') || 'table';
  });

  const handleSetViewMode = (mode: 'table' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('student-view-mode', mode);
  };

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>(courseUuid || 'all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Data States
  const [students, setStudents] = useState<StudentData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [summary, setSummary] = useState<StudentSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Modals state
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [enrollingStudent, setEnrollingStudent] = useState<StudentDetail | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentDetail | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for Add Student modal
  const [addForm, setAddForm] = useState({ full_name: '', email: '', phone: '' });
  const [addFormErrors, setAddFormErrors] = useState<{ full_name?: string; email?: string; general?: string }>({});
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch summary counts
  const fetchSummary = useCallback(async () => {
    try {
      const data = await studentsService.getSummary();
      setSummary(data);
    } catch (_) {
      // Non-critical metric failure
    }
  }, []);

  // Fetch student list from real API
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    try {
      const params: Record<string, any> = {
        page: currentPage,
        page_size: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (courseFilter && courseFilter !== 'all') params.course = courseFilter;
      if (sortBy) params.sort_by = sortBy;

      const response = await studentsService.listStudents(params);

      if (response && 'results' in response && Array.isArray(response.results)) {
        setStudents(response.results);
        setTotalCount(response.count ?? response.results.length);
      } else if (Array.isArray(response)) {
        setStudents(response);
        setTotalCount(response.length);
      } else {
        setStudents([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err.message || 'Unable to load students from server.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, courseFilter, sortBy]);

  useEffect(() => {
    fetchStudents();
    fetchSummary();
  }, [fetchStudents, fetchSummary]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All' ||
    courseFilter !== 'all' ||
    sortBy !== 'recent';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCourseFilter('all');
    setSortBy('recent');
    setCurrentPage(1);
  };

  // Map backend StudentData to UI StudentDetail format
  const mappedStudents: StudentDetail[] = useMemo(() => {
    return students.map((s) => ({
      uuid: s.id,
      name: s.display_name || s.full_name || s.user?.full_name || 'Unnamed Student',
      email: s.email || s.user?.email || '',
      phone: s.phone || s.user?.phone || '',
      country: 'India',
      status: (s.status === 'ACTIVE' ? 'Active' : s.status === 'INACTIVE' ? 'Inactive' : s.status || 'Active') as any,
      enrollmentDate: s.joined_at || new Date().toISOString(),
      lastActivity: 'Active',
      creditsConsumed: 0,
      enrolledCourses: [
        {
          courseUuid: courseFilter !== 'all' ? courseFilter : '',
          courseTitle: `${s.enrollments_count || s.enrolledCoursesCount || 0} Course(s)`,
          enrolledAt: s.joined_at || '',
          progressPercent: 0,
          lessonsCompleted: 0,
          totalLessons: 0,
          quizzesPassed: 0,
          assignmentsSubmitted: 0,
          certificatesEarned: 0,
          creditsConsumed: 0,
        },
      ],
      activityLogs: [],
    }));
  }, [students, courseFilter]);

  const handleExportCSV = () => {
    if (mappedStudents.length === 0) {
      showToast('No student records available to export.');
      return;
    }

    const filename = `students_export_${new Date().toISOString().slice(0, 10)}.csv`;
    const columns: CsvColumn<StudentDetail>[] = [
      { header: 'Full Name', value: (row) => row.name },
      { header: 'Email Address', value: (row) => row.email },
      { header: 'Phone Number', value: (row) => row.phone || '' },
      { header: 'Status', value: (row) => row.status },
      { header: 'Joined Date', value: (row) => row.enrollmentDate || '' },
    ];

    try {
      exportToCsv(filename, mappedStudents, columns);
      showToast(`Exported ${mappedStudents.length} student records to CSV.`);
    } catch (_) {
      showToast('CSV export failed. Please try again.');
    }
  };

  const handleToggleStatus = async (uuid: string) => {
    const target = students.find((s) => s.id === uuid);
    if (!target) return;
    try {
      if (target.status === 'ACTIVE') {
        await studentsService.deactivateStudent(uuid);
        showToast(`Deactivated ${target.display_name || 'student'}.`);
      } else {
        await studentsService.activateStudent(uuid);
        showToast(`Activated ${target.display_name || 'student'}.`);
      }
      fetchStudents();
      fetchSummary();
    } catch (err: any) {
      showToast(err.message || 'Status update failed.');
    }
  };

  const handleCreateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormErrors({});
    if (!addForm.full_name.trim()) {
      setAddFormErrors((prev) => ({ ...prev, full_name: 'Full name is required.' }));
      return;
    }
    if (!addForm.email.trim()) {
      setAddFormErrors((prev) => ({ ...prev, email: 'Email address is required.' }));
      return;
    }

    setIsSubmittingAdd(true);
    try {
      await studentsService.createStudent({
        full_name: addForm.full_name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
      });
      showToast('Student account created successfully.');
      setIsAddModalOpen(false);
      setAddForm({ full_name: '', email: '', phone: '' });
      fetchStudents();
      fetchSummary();
    } catch (err: any) {
      if (err.data && typeof err.data === 'object') {
        setAddFormErrors({
          email: Array.isArray(err.data.email) ? err.data.email[0] : err.data.email,
          full_name: Array.isArray(err.data.full_name) ? err.data.full_name[0] : err.data.full_name,
          general: err.message || 'Failed to create student.',
        });
      } else {
        setAddFormErrors({ general: err.message || 'A student with this email may already exist.' });
      }
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4 sm:space-y-5 text-left font-sans pb-32 sm:pb-12 max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-0.5 hover:bg-slate-700 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-[16px] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Students
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] text-xs font-bold rounded-full border border-blue-100 dark:border-[#263244]">
                {totalCount}
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-0.5">
              <span>Manage Academy student accounts, course enrollments, and status directory.</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />}
              onClick={handleExportCSV}
              className="border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-[#1E293B] h-9 sm:h-10 cursor-pointer"
            >
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>

            {canCreate && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<UsersRound className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />}
                  onClick={() => navigate('/students/bulk-upload')}
                  className="border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-[#60A5FA] bg-white dark:bg-[#172033] hover:bg-blue-50 dark:hover:bg-[#1E293B] text-xs font-semibold h-9 sm:h-10 cursor-pointer"
                >
                  <span className="hidden sm:inline">Bulk Import</span>
                  <span className="sm:hidden">Import</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4 text-white" />}
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold h-9 sm:h-10 cursor-pointer shadow-xs shadow-[#2563EB]/25"
                >
                  <span>Add Student</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* METRIC CARDS SUMMARY */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-[#1e293b] text-[#2563EB] rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Total Students</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.total_students}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-[#064e3b] text-emerald-600 rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Active Students</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.active_students}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-[#881337] text-rose-600 rounded-lg">
                <UserX className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Inactive Students</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.inactive_students}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-[#312e81] text-indigo-600 rounded-lg">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Enrolled Students</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.enrolled_students}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & View Controls */}
        <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, email, or code..."
                className="w-full h-10 pl-9 pr-8 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] p-0.5 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Toggle on Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSetViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-semibold'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs font-semibold'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontally Scrollable Filter Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {/* Status Filter */}
            <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#172033] rounded-xl px-2.5 h-9 text-xs transition-all shadow-xs">
              <span className="text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer"
              >
                <option value="All" className="dark:bg-[#111827] dark:text-[#F8FAFC]">All Statuses</option>
                <option value="ACTIVE" className="dark:bg-[#111827] dark:text-[#F8FAFC]">Active</option>
                <option value="INACTIVE" className="dark:bg-[#111827] dark:text-[#F8FAFC]">Inactive</option>
                <option value="PENDING" className="dark:bg-[#111827] dark:text-[#F8FAFC]">Pending</option>
                <option value="SUSPENDED" className="dark:bg-[#111827] dark:text-[#F8FAFC]">Suspended</option>
              </select>
            </div>

            {/* Course Filter */}
            <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#172033] rounded-xl px-2.5 h-9 text-xs max-w-[200px] sm:max-w-xs transition-all shadow-xs">
              <span className="text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:inline">Course:</span>
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer truncate"
              >
                <option value="all" className="dark:bg-[#111827] dark:text-[#F8FAFC]">All Courses</option>
                {coursesList.map((c) => (
                  <option key={c.uuid} value={c.uuid} className="dark:bg-[#111827] dark:text-[#F8FAFC]">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#172033] rounded-xl px-2.5 h-9 text-xs transition-all shadow-xs">
              <span className="text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-medium text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer"
              >
                <option value="recent" className="dark:bg-[#111827] dark:text-[#F8FAFC]">Recently Added</option>
                <option value="name_asc" className="dark:bg-[#111827] dark:text-[#F8FAFC]">Name (A–Z)</option>
                <option value="name_desc" className="dark:bg-[#111827] dark:text-[#F8FAFC]">Name (Z–A)</option>
                <option value="oldest" className="dark:bg-[#111827] dark:text-[#F8FAFC]">Oldest Joined</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="shrink-0 text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN VIEW AREA */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#111827] p-12 rounded-[16px] border border-[#E2E8F0] dark:border-[#263244] text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Loading students from backend...</p>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 dark:bg-[#3f1d24] p-8 rounded-[16px] border border-rose-200 dark:border-rose-800 text-center flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600" />
          <div>
            <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">Unable to Load Students</h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{errorMessage}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStudents} className="border-rose-300 text-rose-700">
            Retry
          </Button>
        </div>
      ) : mappedStudents.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={GraduationCap}
            title="No Students Match Criteria"
            description="Try adjusting your search term or active filters to view student records."
            actionLabel="Clear All Filters"
            onAction={clearAllFilters}
            actionIcon={<RotateCcw className="w-4 h-4" />}
          />
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No Students Found"
            description="Add your first student account to manage course enrollments and tracking."
            actionLabel={canCreate ? "Add First Student" : undefined}
            onAction={canCreate ? () => setIsAddModalOpen(true) : undefined}
            actionIcon={<Plus className="w-4 h-4" />}
          />
        )
      ) : (
        <>
          {/* MOBILE VIEW */}
          <div className="block md:hidden">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {mappedStudents.map((student) => (
                <StudentCard
                  key={student.uuid}
                  student={student}
                  courseUuid={courseUuid}
                  canEdit={canEdit}
                  canEnroll={canEnroll}
                  canToggleStatus={canToggleStatus}
                  canDelete={canDelete}
                  onEnrollStudent={(s) => setEnrollingStudent(s)}
                  onToggleStatus={handleToggleStatus}
                  onDeleteStudent={(s) => setDeletingStudent(s)}
                />
              ))}
            </div>
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block">
            {viewMode === 'table' ? (
              <Card padding="none" className="bg-white border border-[#E2E8F0] overflow-hidden rounded-[16px] shadow-2xs">
                <StudentTable
                  students={mappedStudents}
                  courseUuid={courseUuid}
                  canEdit={canEdit}
                  canEnroll={canEnroll}
                  canToggleStatus={canToggleStatus}
                  canDelete={canDelete}
                  onEnrollStudent={(s) => setEnrollingStudent(s)}
                  onToggleStatus={handleToggleStatus}
                  onDeleteStudent={(s) => setDeletingStudent(s)}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mappedStudents.map((student) => (
                  <StudentCard
                    key={student.uuid}
                    student={student}
                    courseUuid={courseUuid}
                    canEdit={canEdit}
                    canEnroll={canEnroll}
                    canToggleStatus={canToggleStatus}
                    canDelete={canDelete}
                    onEnrollStudent={(s) => setEnrollingStudent(s)}
                    onToggleStatus={handleToggleStatus}
                    onDeleteStudent={(s) => setDeletingStudent(s)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION BAR */}
          {totalCount > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3 sm:p-4 rounded-xl border border-[#E2E8F0] dark:border-[#263244]">
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Showing <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{startRecord}</span>–<span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{endRecord}</span> of <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{totalCount}</span> students
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2.5 text-xs cursor-pointer disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Add New Student</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addFormErrors.general && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium">
                {addFormErrors.general}
              </div>
            )}

            <form onSubmit={handleCreateStudentSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Full Name *</label>
                <input
                  type="text"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                  placeholder="e.g. Anish Varma"
                  required
                  className={`w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border ${
                    addFormErrors.full_name ? 'border-rose-500' : 'border-[#E2E8F0] dark:border-[#334155]'
                  } rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
                />
                {addFormErrors.full_name && (
                  <p className="text-[11px] text-rose-600 font-medium">{addFormErrors.full_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Email Address *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="anish@example.com"
                  required
                  className={`w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border ${
                    addFormErrors.email ? 'border-rose-500' : 'border-[#E2E8F0] dark:border-[#334155]'
                  } rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
                />
                {addFormErrors.email && (
                  <p className="text-[11px] text-rose-600 font-medium">{addFormErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Phone Number</label>
                <input
                  type="text"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="bg-[#2563EB] text-white"
                >
                  {isSubmittingAdd ? 'Saving...' : 'Create Student'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ADD STUDENTS MODAL */}
      <BulkAddStudentsModal
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
        onSuccess={() => {
          showToast('Bulk student accounts created successfully.');
          fetchStudents();
          fetchSummary();
        }}
      />

      {/* ENROLL STUDENT IN COURSE MODAL */}
      {enrollingStudent && (
        <EnrollStudentModal
          isOpen={Boolean(enrollingStudent)}
          onClose={() => setEnrollingStudent(null)}
          onSuccess={() => {
            setEnrollingStudent(null);
            showToast(`Enrolled ${enrollingStudent.name} in course successfully.`);
            fetchStudents();
            fetchSummary();
          }}
        />
      )}
    </div>
  );
};
