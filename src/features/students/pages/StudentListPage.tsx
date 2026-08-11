import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useStudentStore } from '../store/student.store';
import { useCourseStore } from '../../courses/store/course.store';
import { authStore } from '../../../store/auth.store';
import { StudentTable } from '../components/StudentTable';
import { StudentCard } from '../components/StudentCard';
import { BulkAddStudentsModal } from '../components/BulkAddStudentsModal';
import { EnrollStudentModal } from '../components/EnrollStudentModal';
import { DeleteStudentModal } from '../components/DeleteStudentModal';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';
import type { StudentDetail } from '../types/student.types';

export const StudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid } = useParams<{ courseUuid?: string }>();

  // Stores
  const students = useStudentStore((state) => state.students);
  const toggleStudentStatus = useStudentStore((state) => state.toggleStudentStatus);
  const deleteStudent = useStudentStore((state) => state.deleteStudent);
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

  // Filters & State
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>(courseUuid || 'all');
  const [progressFilter, setProgressFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Modals state
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [enrollingStudent, setEnrollingStudent] = useState<StudentDetail | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentDetail | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Search query
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          (s.phone && s.phone.includes(query));

        // Status filter
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

        // Course filter
        const matchesCourse =
          courseFilter === 'all' ||
          s.enrolledCourses?.some((c) => c.courseUuid === courseFilter);

        // Progress filter
        const primaryProgress = s.enrolledCourses?.[0]?.progressPercent ?? 0;
        const matchesProgress =
          progressFilter === 'all' ||
          (progressFilter === 'not_started' && primaryProgress === 0) ||
          (progressFilter === 'in_progress' && primaryProgress > 0 && primaryProgress < 100) ||
          (progressFilter === 'completed' && primaryProgress === 100);

        return matchesSearch && matchesStatus && matchesCourse && matchesProgress;
      })
      .sort((a, b) => {
        const aProgress = a.enrolledCourses?.[0]?.progressPercent ?? 0;
        const bProgress = b.enrolledCourses?.[0]?.progressPercent ?? 0;

        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'progress_high') return bProgress - aProgress;
        if (sortBy === 'progress_low') return aProgress - bProgress;

        // Default: 'recent'
        const aTime = a.enrollmentDate ? new Date(a.enrollmentDate).getTime() : 0;
        const bTime = b.enrollmentDate ? new Date(b.enrollmentDate).getTime() : 0;
        return bTime - aTime;
      });
  }, [students, searchQuery, statusFilter, courseFilter, progressFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All' ||
    courseFilter !== 'all' ||
    progressFilter !== 'all' ||
    sortBy !== 'recent';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCourseFilter('all');
    setProgressFilter('all');
    setSortBy('recent');
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      showToast('No students available to export.');
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `cubixskill-students-${dateStr}.csv`;

    const columns: CsvColumn<StudentDetail>[] = [
      { header: 'Full Name', value: (row) => row.name },
      { header: 'Email', value: (row) => row.email },
      { header: 'Country Code', value: (row) => row.countryCode || '+91' },
      { header: 'Phone Number', value: (row) => row.phone || '' },
      { header: 'Country', value: (row) => row.country || 'India' },
      { header: 'Student Status', value: (row) => row.status },
      { header: 'Joined Date', value: (row) => new Date(row.enrollmentDate).toISOString().split('T')[0] },
      { header: 'Enrolled Course Count', value: (row) => row.enrolledCourses?.length || 0 },
      { header: 'Primary Course Progress', value: (row) => `${row.enrolledCourses?.[0]?.progressPercent || 0}%` },
      { header: 'Total Credits Used', value: (row) => row.creditsConsumed || 17 },
      { header: 'Last Activity', value: (row) => row.lastActivity || 'Active' },
      { header: 'Internal Notes', value: (row) => row.notes || '' },
    ];

    try {
      exportToCsv(filename, filteredStudents, columns);
      showToast(`Exported ${filteredStudents.length} ${filteredStudents.length === 1 ? 'student' : 'students'} to CSV.`);
    } catch (_) {
      showToast('CSV export failed. Please try again.');
    }
  };

  const handleDeleteConfirm = (studentUuid: string) => {
    deleteStudent(studentUuid);
    showToast('Student account deleted successfully.');
  };

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
      <div className="bg-white p-4 sm:p-6 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
                Students
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-50 text-[#2563EB] text-xs font-bold rounded-full border border-blue-100">
                {students.length}
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              <span className="hidden sm:inline">Manage student accounts, course enrollments, and learning activity.</span>
              <span className="sm:hidden">Manage your Academy students.</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4 text-[#0F172A]" />}
              onClick={handleExportCSV}
              className="border-[#E2E8F0] text-xs font-semibold text-[#0F172A] h-9 sm:h-10 cursor-pointer"
            >
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>

            {canCreate && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<UsersRound className="w-4 h-4 text-[#2563EB]" />}
                  onClick={() => navigate('/students/bulk-upload')}
                  className="border-[#2563EB] text-[#2563EB] text-xs font-semibold h-9 sm:h-10 cursor-pointer"
                >
                  <span className="hidden sm:inline">Bulk Add Students</span>
                  <span className="sm:hidden">Bulk Add</span>
                </Button>

                <Button
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                  onClick={() => navigate('/students/create')}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-9 sm:h-10 cursor-pointer shadow-2xs"
                >
                  Add Student
                </Button>
              </>
            )}
          </div>
        </div>

        {/* SEARCH & FILTERS TOOLBAR */}
        <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, email, or phone..."
                className="w-full h-10 pl-9 pr-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] p-0.5 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Toggle on Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-[#2563EB] shadow-2xs font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#2563EB] shadow-2xs font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Compact Horizontally Scrollable Filter Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {/* Status Filter */}
            <div className="shrink-0 flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 h-9 text-xs">
              <span className="text-[#64748B] font-medium hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-semibold text-[#0F172A] text-xs focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Course Filter */}
            <div className="shrink-0 flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 h-9 text-xs max-w-[200px] sm:max-w-xs">
              <span className="text-[#64748B] font-medium hidden sm:inline">Course:</span>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="bg-transparent font-semibold text-[#0F172A] text-xs focus:outline-none cursor-pointer truncate"
              >
                <option value="all">All Courses</option>
                {coursesList.map((c) => (
                  <option key={c.uuid} value={c.uuid}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Progress Filter */}
            <div className="shrink-0 flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 h-9 text-xs">
              <span className="text-[#64748B] font-medium hidden sm:inline">Progress:</span>
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="bg-transparent font-semibold text-[#0F172A] text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">All Progress</option>
                <option value="not_started">Not Started (0%)</option>
                <option value="in_progress">In Progress (1-99%)</option>
                <option value="completed">Completed (100%)</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="shrink-0 flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 h-9 text-xs">
              <span className="text-[#64748B] font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-[#0F172A] text-xs focus:outline-none cursor-pointer"
              >
                <option value="recent">Recently Added</option>
                <option value="name_asc">Name (A–Z)</option>
                <option value="name_desc">Name (Z–A)</option>
                <option value="progress_high">Highest Progress</option>
                <option value="progress_low">Lowest Progress</option>
              </select>
            </div>

            {/* Clear Filters Button */}
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

      {/* VIEW CONTENT */}
      {filteredStudents.length === 0 ? (
        <Card padding="lg" className="bg-white border border-[#E2E8F0] rounded-[16px] text-center p-8 sm:p-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] mx-auto flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          {students.length === 0 ? (
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-base font-semibold text-[#0F172A]">No students yet</h3>
              <p className="text-xs text-[#64748B]">
                Add your first student to begin managing course enrollments and tracking learning progress.
              </p>
              {canCreate && (
                <div className="pt-2">
                  <Button
                    onClick={() => navigate('/students/create')}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="bg-[#2563EB] text-white text-xs font-semibold"
                  >
                    Add First Student
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-base font-semibold text-[#0F172A]">No students match your criteria</h3>
              <p className="text-xs text-[#64748B]">
                Try adjusting your search term or active filters to view results.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="border-[#E2E8F0] text-xs font-semibold"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <>
          {/* MOBILE VIEW (CARD GRID - ALWAYS FOR MOBILE SCREENS < md) */}
          <div className="block md:hidden">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.uuid}
                  student={student}
                  courseUuid={courseUuid}
                  canEdit={canEdit}
                  canEnroll={canEnroll}
                  canToggleStatus={canToggleStatus}
                  canDelete={canDelete}
                  onEnrollStudent={(s) => setEnrollingStudent(s)}
                  onToggleStatus={toggleStudentStatus}
                  onDeleteStudent={(s) => setDeletingStudent(s)}
                />
              ))}
            </div>
          </div>

          {/* DESKTOP VIEW (TOGGLEABLE TABLE OR GRID FOR md AND ABOVE) */}
          <div className="hidden md:block">
            {viewMode === 'table' ? (
              <Card padding="none" className="bg-white border border-[#E2E8F0] overflow-hidden rounded-[16px] shadow-2xs">
                <StudentTable
                  students={filteredStudents}
                  courseUuid={courseUuid}
                  canEdit={canEdit}
                  canEnroll={canEnroll}
                  canToggleStatus={canToggleStatus}
                  canDelete={canDelete}
                  onEnrollStudent={(s) => setEnrollingStudent(s)}
                  onToggleStatus={toggleStudentStatus}
                  onDeleteStudent={(s) => setDeletingStudent(s)}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.uuid}
                    student={student}
                    courseUuid={courseUuid}
                    canEdit={canEdit}
                    canEnroll={canEnroll}
                    canToggleStatus={canToggleStatus}
                    canDelete={canDelete}
                    onEnrollStudent={(s) => setEnrollingStudent(s)}
                    onToggleStatus={toggleStudentStatus}
                    onDeleteStudent={(s) => setDeletingStudent(s)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* MODALS */}
      {/* BULK ADD STUDENTS MODAL */}
      <BulkAddStudentsModal
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
        onSuccess={() => showToast('Bulk student accounts created successfully.')}
      />

      {/* ENROLL STUDENT IN COURSE MODAL */}
      {enrollingStudent && (
        <EnrollStudentModal
          isOpen={Boolean(enrollingStudent)}
          onClose={() => setEnrollingStudent(null)}
          onSuccess={() => {
            setEnrollingStudent(null);
            showToast(`Enrolled ${enrollingStudent.name} in course successfully.`);
          }}
        />
      )}

      {/* SAFE DELETE CONFIRMATION MODAL */}
      <DeleteStudentModal
        isOpen={Boolean(deletingStudent)}
        student={deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
