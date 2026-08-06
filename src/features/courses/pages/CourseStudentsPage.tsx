import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Check,
  Eye,
  Award,
  BarChart3,
  Clock,
  UserCheck,
  CreditCard,
  UserPlus,
  Download,
  List,
  LayoutGrid,
  X,
  Calendar,
  AlertTriangle,
  UserX,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { EnrollStudentModal } from '../../students/components/EnrollStudentModal';
import { BulkEnrollModal } from '../../students/components/BulkEnrollModal';
import { exportToCsv, slugify, type CsvColumn } from '../../../utils/export-csv';

interface StudentRecord {
  id: string;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  expiryDate: string;
  progressPercent: number;
  status: 'Active' | 'Pending' | 'Completed' | 'Expired' | 'Suspended';
  lessonsCompleted: number;
  totalLessons: number;
  quizzesTaken: number;
  assignmentsSubmitted: number;
  certificatesIssued: number;
  creditsUsed: number;
  lastActive: string;
}

const INITIAL_COURSE_STUDENTS: StudentRecord[] = [
  {
    id: '1',
    uuid: '550e8400-e29b-41d4-a716-446655440101',
    name: 'Aarav Patel',
    email: 'aarav.patel@gmail.com',
    phone: '+91 98765 43210',
    enrollmentDate: '2026-08-01',
    expiryDate: '2027-08-01',
    progressPercent: 85,
    status: 'Active',
    lessonsCompleted: 18,
    totalLessons: 24,
    quizzesTaken: 4,
    assignmentsSubmitted: 2,
    certificatesIssued: 0,
    creditsUsed: 17,
    lastActive: '10 mins ago',
  },
  {
    id: '2',
    uuid: '550e8400-e29b-41d4-a716-446655440102',
    name: 'Priya Sharma',
    email: 'priya.sharma@yahoo.com',
    phone: '+91 98123 45678',
    enrollmentDate: '2026-07-28',
    expiryDate: '2027-07-28',
    progressPercent: 100,
    status: 'Completed',
    lessonsCompleted: 24,
    totalLessons: 24,
    quizzesTaken: 5,
    assignmentsSubmitted: 3,
    certificatesIssued: 1,
    creditsUsed: 17,
    lastActive: '2 hours ago',
  },
  {
    id: '3',
    uuid: '550e8400-e29b-41d4-a716-446655440103',
    name: 'Rahul Nair',
    email: 'rahul.nair@outlook.com',
    phone: '+91 97654 32109',
    enrollmentDate: '2026-07-20',
    expiryDate: '2027-07-20',
    progressPercent: 12,
    status: 'Suspended',
    lessonsCompleted: 3,
    totalLessons: 24,
    quizzesTaken: 0,
    assignmentsSubmitted: 0,
    certificatesIssued: 0,
    creditsUsed: 17,
    lastActive: '3 days ago',
  },
  {
    id: '4',
    uuid: '550e8400-e29b-41d4-a716-446655440104',
    name: 'Ananya Gupta',
    email: 'ananya.g@example.com',
    phone: '+91 96543 21098',
    enrollmentDate: '2026-06-15',
    expiryDate: '2026-08-01',
    progressPercent: 45,
    status: 'Expired',
    lessonsCompleted: 11,
    totalLessons: 24,
    quizzesTaken: 2,
    assignmentsSubmitted: 1,
    certificatesIssued: 0,
    creditsUsed: 17,
    lastActive: '1 week ago',
  },
  {
    id: '5',
    uuid: '550e8400-e29b-41d4-a716-446655440105',
    name: 'Vikram Singh',
    email: 'vikram.s@example.com',
    phone: '+91 95432 10987',
    enrollmentDate: '2026-08-04',
    expiryDate: '2027-08-04',
    progressPercent: 0,
    status: 'Pending',
    lessonsCompleted: 0,
    totalLessons: 24,
    quizzesTaken: 0,
    assignmentsSubmitted: 0,
    certificatesIssued: 0,
    creditsUsed: 17,
    lastActive: 'Just now',
  },
];

export const CourseStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();

  const [studentList, setStudentList] = useState<StudentRecord[]>(INITIAL_COURSE_STUDENTS);

  // Search, Filter & View Mode state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [progressFilter, setProgressFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedStudentUuids, setSelectedStudentUuids] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Modal Action States
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isBulkEnrollOpen, setIsBulkEnrollOpen] = useState(false);
  const [extendAccessTarget, setExtendAccessTarget] = useState<StudentRecord | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('2027-12-31');
  const [removeTarget, setRemoveTarget] = useState<StudentRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return studentList
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()) ||
          s.phone.includes(search);

        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

        let matchesProgress = true;
        if (progressFilter === '0-25') matchesProgress = s.progressPercent <= 25;
        if (progressFilter === '26-50') matchesProgress = s.progressPercent >= 26 && s.progressPercent <= 50;
        if (progressFilter === '51-75') matchesProgress = s.progressPercent >= 51 && s.progressPercent <= 75;
        if (progressFilter === '76-100') matchesProgress = s.progressPercent >= 76;

        return matchesSearch && matchesStatus && matchesProgress;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'highest-progress') return b.progressPercent - a.progressPercent;
        if (sortBy === 'lowest-progress') return a.progressPercent - b.progressPercent;
        if (sortBy === 'most-credits') return b.creditsUsed - a.creditsUsed;
        return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
      });
  }, [studentList, search, statusFilter, progressFilter, sortBy]);

  // Statistics Summary Counts
  const totalEnrolled = studentList.length;
  const activeCount = studentList.filter((s) => s.status === 'Active').length;
  const pendingCount = studentList.filter((s) => s.status === 'Pending').length;
  const completedCount = studentList.filter((s) => s.status === 'Completed').length;
  const expiredCount = studentList.filter((s) => s.status === 'Expired').length;
  const suspendedCount = studentList.filter((s) => s.status === 'Suspended').length;
  const avgProgress = Math.round(studentList.reduce((acc, curr) => acc + curr.progressPercent, 0) / (totalEnrolled || 1));
  const totalCreditsConsumed = studentList.reduce((acc, curr) => acc + curr.creditsUsed, 0);

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedStudentUuids.length === filteredStudents.length) {
      setSelectedStudentUuids([]);
    } else {
      setSelectedStudentUuids(filteredStudents.map((s) => s.uuid));
    }
  };

  const handleToggleSelectStudent = (uuid: string) => {
    if (selectedStudentUuids.includes(uuid)) {
      setSelectedStudentUuids(selectedStudentUuids.filter((id) => id !== uuid));
    } else {
      setSelectedStudentUuids([...selectedStudentUuids, uuid]);
    }
  };

  const handleToggleStatus = (uuid: string) => {
    setStudentList((prev) =>
      prev.map((s) =>
        s.uuid === uuid
          ? { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' }
          : s
      )
    );
    showToast('Student enrollment status updated.');
  };

  const handleViewStudent = (studentUuid: string) => {
    if (!courseUuid || !studentUuid) return;
    navigate(`/courses/${courseUuid}/students/${studentUuid}/overview`);
  };

  const handleConfirmExtendAccess = () => {
    if (!extendAccessTarget) return;
    setStudentList((prev) =>
      prev.map((s) => (s.uuid === extendAccessTarget.uuid ? { ...s, expiryDate: newExpiryDate, status: 'Active' } : s))
    );
    setExtendAccessTarget(null);
    showToast(`Access extended for ${extendAccessTarget.name} until ${newExpiryDate}.`);
  };

  const handleConfirmRemoveStudent = () => {
    if (!removeTarget) return;
    setStudentList((prev) => prev.filter((s) => s.uuid !== removeTarget.uuid));
    setRemoveTarget(null);
    showToast(`${removeTarget.name} removed from course.`);
  };

  const handleExportCSV = () => {
    const targetList =
      selectedStudentUuids.length > 0
        ? filteredStudents.filter((s) => selectedStudentUuids.includes(s.uuid))
        : filteredStudents;

    if (targetList.length === 0) {
      showToast('No students are available to export.');
      return;
    }

    const courseTitle = 'Fullstack React 19 & TypeScript Masterclass';
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `cubixskill-course-students-${slugify(courseTitle)}-${dateStr}.csv`;

    const columns: CsvColumn<StudentRecord>[] = [
      { header: 'Student Name', value: (row) => row.name },
      { header: 'Email', value: (row) => row.email },
      { header: 'Country Code', value: () => '+91' },
      { header: 'Phone Number', value: (row) => row.phone },
      { header: 'Enrollment Status', value: (row) => row.status },
      { header: 'Enrollment Date', value: (row) => row.enrollmentDate },
      { header: 'Access Start Date', value: (row) => row.enrollmentDate },
      { header: 'Access Expiry Date', value: (row) => row.expiryDate },
      { header: 'Batch', value: () => 'Batch 2026-A' },
      { header: 'Learning Progress', value: (row) => `${row.progressPercent}%` },
      { header: 'Completed Lessons', value: (row) => row.lessonsCompleted },
      { header: 'Total Lessons', value: (row) => row.totalLessons },
      { header: 'Credits Used', value: (row) => row.creditsUsed },
      { header: 'Last Activity', value: (row) => row.lastActive },
      { header: 'Course Name', value: () => courseTitle },
      { header: 'Course Status', value: () => 'Published' },
    ];

    try {
      exportToCsv(filename, targetList, columns);
      showToast(`CSV exported successfully (${targetList.length} ${targetList.length === 1 ? 'student' : 'students'}).`);
    } catch (err) {
      showToast('CSV export failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6 text-left font-sans pb-[calc(88px+env(safe-area-inset-bottom))] no-scrollbar max-w-[1600px] mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="bg-white p-5 sm:p-6 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              Course Students ({totalEnrolled})
            </h1>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Manage enrolled students, learning progress telemetry, access extensions, and credit usage.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
              className="border-[#E2E8F0] text-xs font-semibold text-[#0F172A]"
            >
              {selectedStudentUuids.length > 0
                ? `Export Selected (${selectedStudentUuids.length})`
                : 'Export CSV'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Users className="w-4 h-4" />}
              onClick={() => setIsBulkEnrollOpen(true)}
              className="border-[#2563EB] text-[#2563EB] text-xs font-semibold"
            >
              Bulk Enroll
            </Button>
            <Button
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4 stroke-[2.5]" />}
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold"
            >
              Enroll Student
            </Button>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY CARDS (2 to 8 Responsive Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <Users className="w-4 h-4 text-[#2563EB] mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Total Enrolled</span>
          <strong className="text-base font-bold text-[#0F172A]">{totalEnrolled}</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <UserCheck className="w-4 h-4 text-emerald-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Active</span>
          <strong className="text-base font-bold text-emerald-600">{activeCount}</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <Clock className="w-4 h-4 text-sky-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Pending</span>
          <strong className="text-base font-bold text-[#0F172A]">{pendingCount}</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <Award className="w-4 h-4 text-purple-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Completed</span>
          <strong className="text-base font-bold text-[#0F172A]">{completedCount}</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Expired</span>
          <strong className="text-base font-bold text-amber-600">{expiredCount}</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <UserX className="w-4 h-4 text-rose-600 mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Suspended</span>
          <strong className="text-base font-bold text-rose-600">{suspendedCount}</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <BarChart3 className="w-4 h-4 text-[#2563EB] mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Avg. Progress</span>
          <strong className="text-base font-bold text-[#2563EB]">{avgProgress}%</strong>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
          <CreditCard className="w-4 h-4 text-[#2563EB] mx-auto" />
          <span className="text-[10px] text-[#64748B] block font-medium">Credits Used</span>
          <strong className="text-base font-bold text-[#2563EB]">{totalCreditsConsumed}</strong>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className="space-y-3">
        <div className="bg-white p-4 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students by name, email, or phone..."
                className="w-full h-10 pl-10 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Desktop Filters & View Toggle */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
              </select>

              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
              >
                <option value="All">All Progress</option>
                <option value="0-25">0 – 25%</option>
                <option value="26-50">26 – 50%</option>
                <option value="51-75">51 – 75%</option>
                <option value="76-100">76 – 100%</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
              >
                <option value="recent">Recently Enrolled</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="highest-progress">Highest Progress</option>
                <option value="lowest-progress">Lowest Progress</option>
                <option value="most-credits">Most Credits Used</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B]'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B]'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="flex md:hidden items-center justify-between gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => setIsMobileFilterOpen(true)}
                className="h-10 text-xs w-full justify-center"
              >
                Filters & Sort
              </Button>
              <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white text-[#2563EB]' : 'text-[#64748B]'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-[#2563EB]' : 'text-[#64748B]'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER CHIPS */}
          {(statusFilter !== 'All' || progressFilter !== 'All' || search) && (
            <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] overflow-x-auto no-scrollbar text-xs">
              <span className="text-[#64748B] text-[11px] font-semibold">Active Filters:</span>

              {statusFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-blue-50 text-[#2563EB] border border-blue-100 rounded-full flex items-center gap-1 font-semibold text-[11px]">
                  Status: {statusFilter}
                  <button type="button" onClick={() => setStatusFilter('All')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {progressFilter !== 'All' && (
                <span className="px-2.5 py-1 bg-blue-50 text-[#2563EB] border border-blue-100 rounded-full flex items-center gap-1 font-semibold text-[11px]">
                  Progress: {progressFilter}%
                  <button type="button" onClick={() => setProgressFilter('All')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {search && (
                <span className="px-2.5 py-1 bg-blue-50 text-[#2563EB] border border-blue-100 rounded-full flex items-center gap-1 font-semibold text-[11px]">
                  Search: "{search}"
                  <button type="button" onClick={() => setSearch('')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setProgressFilter('All');
                  setSearch('');
                }}
                className="text-[11px] font-semibold text-[#64748B] hover:text-[#0F172A] underline cursor-pointer ml-1"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. CONTENT VIEW (DESKTOP TABLE vs MOBILE GRID) */}
      {viewMode === 'list' ? (
        <Card padding="none" className="bg-white border border-[#E2E8F0] overflow-hidden rounded-[16px] shadow-2xs">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs font-medium text-[#0F172A]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase font-bold">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedStudentUuids.length > 0 && selectedStudentUuids.length === filteredStudents.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                  </th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Learning Progress</th>
                  <th className="py-3.5 px-4">Enrolled Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Credits</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#64748B]">
                      No students match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const isSelected = selectedStudentUuids.includes(student.uuid);

                    return (
                      <tr
                        key={student.uuid}
                        tabIndex={0}
                        onClick={() => handleViewStudent(student.uuid)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleViewStudent(student.uuid);
                          }
                        }}
                        className={`border-b border-[#E2E8F0] transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(student.uuid)}
                            className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 text-left font-semibold text-[#0F172A]">
                            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            <strong className="block text-xs">{student.name}</strong>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">
                          <div>{student.email}</div>
                          <div className="text-[11px] text-[#64748B]">{student.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden mb-1">
                            <div
                              className={`h-full ${student.progressPercent === 100 ? 'bg-emerald-600' : 'bg-[#2563EB]'}`}
                              style={{ width: `${student.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-[#2563EB]">{student.progressPercent}% Completed</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">{student.enrollmentDate}</td>
                        <td className="py-3.5 px-4 text-[#64748B]">{student.expiryDate}</td>
                        <td className="py-3.5 px-4 font-bold text-[#2563EB]">{student.creditsUsed} Credits</td>
                        <td className="py-3.5 px-4">
                          <Badge variant={student.status === 'Active' || student.status === 'Completed' ? 'success' : student.status === 'Expired' ? 'warning' : 'secondary'} size="sm" dot>
                            {student.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewStudent(student.uuid);
                              }}
                              leftIcon={<Eye className="w-4 h-4 shrink-0" />}
                              className="bg-blue-50 text-[#2563EB] hover:bg-blue-100 font-semibold text-xs h-8 whitespace-nowrap shrink-0"
                            >
                              View Student
                            </Button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExtendAccessTarget(student);
                              }}
                              className="p-1.5 text-[#64748B] hover:text-[#2563EB] rounded-lg cursor-pointer"
                              title="Extend Access"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(student.uuid);
                              }}
                              className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg cursor-pointer"
                              title={student.status === 'Active' ? 'Suspend' : 'Reactivate'}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRemoveTarget(student);
                              }}
                              className="p-1.5 text-[#64748B] hover:text-rose-600 rounded-lg cursor-pointer"
                              title="Remove from Course"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const statusBadgeStyles = {
              Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              Completed: 'bg-blue-50 text-[#2563EB] border-blue-200',
              Pending: 'bg-amber-50 text-amber-700 border-amber-200',
              Expired: 'bg-rose-50 text-rose-700 border-rose-200',
              Suspended: 'bg-rose-50 text-rose-700 border-rose-200',
            }[student.status] || 'bg-slate-50 text-slate-700 border-slate-200';

            return (
              <motion.div
                key={student.uuid}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleViewStudent(student.uuid)}
                className="bg-white border border-[#E2E8F0] p-4 rounded-[18px] space-y-4 shadow-2xs cursor-pointer hover:border-slate-300 hover:shadow-md transition-all duration-200 font-sans text-left"
              >
                {/* HEADER: 48px Avatar + Name & Email + Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-base font-semibold text-[#0F172A] leading-tight block truncate">
                        {student.name}
                      </strong>
                      <span className="text-[13px] font-normal text-[#64748B] block truncate max-w-[180px] sm:max-w-[220px]">
                        {student.email}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border shrink-0 ${statusBadgeStyles}`}>
                    {student.status}
                  </span>
                </div>

                {/* LEARNING PROGRESS BAR (8px height, 999px radius, smooth animation) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#64748B] text-[12px]">Learning Progress</span>
                    <strong className="text-[#2563EB] text-[14px] font-semibold">{student.progressPercent}%</strong>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${student.progressPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-[#2563EB] rounded-full"
                    />
                  </div>
                </div>

                {/* INFORMATION GRID (2 Columns: Enrolled & Expiry) */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E2E8F0]">
                  <div>
                    <span className="text-[12px] font-medium text-[#64748B] block">Enrolled</span>
                    <strong className="text-[14px] font-semibold text-[#0F172A] block mt-0.5">{student.enrollmentDate}</strong>
                  </div>
                  <div>
                    <span className="text-[12px] font-medium text-[#64748B] block">Expiry</span>
                    <strong className="text-[14px] font-semibold text-[#0F172A] block mt-0.5">{student.expiryDate}</strong>
                  </div>
                </div>

                {/* FOOTER: Credits Used + View Student Button */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
                  <div>
                    <span className="text-[11px] font-medium text-[#64748B] block">Credits Used</span>
                    <strong className="text-[14px] font-semibold text-[#2563EB] block">{student.creditsUsed} Credits</strong>
                  </div>

                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStudent(student.uuid);
                    }}
                    leftIcon={<Eye className="w-4 h-4 shrink-0" />}
                    className="h-[40px] px-4 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm flex items-center gap-2 shadow-2xs whitespace-nowrap shrink-0"
                  >
                    View Student
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* EXTEND ACCESS MODAL */}
      <Modal isOpen={Boolean(extendAccessTarget)} onClose={() => setExtendAccessTarget(null)} title={`Extend Access: ${extendAccessTarget?.name}`}>
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="space-y-1">
            <label className="block font-semibold text-[#0F172A]">Current Expiry Date</label>
            <Input value={extendAccessTarget?.expiryDate || ''} readOnly className="bg-[#F8FAFC] text-[#64748B] h-9 text-xs" />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#0F172A]">New Expiry Date *</label>
            <Input type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} className="h-9 text-xs" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setExtendAccessTarget(null)}>Cancel</Button>
            <Button onClick={handleConfirmExtendAccess} className="bg-[#2563EB] text-white font-semibold">Save Expiry Date</Button>
          </div>
        </div>
      </Modal>

      {/* REMOVE FROM COURSE CONFIRMATION MODAL */}
      <Modal isOpen={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)} title="Remove Student from Course">
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-medium text-xs">
            ⚠️ Are you sure you want to remove <strong>{removeTarget?.name}</strong> from this course? This action removes enrollment access.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button onClick={handleConfirmRemoveStudent} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Remove Student
            </Button>
          </div>
        </div>
      </Modal>

      {/* ENROLL STUDENT MODAL */}
      <EnrollStudentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        defaultCourseUuid={courseUuid}
        onSuccess={() => showToast('Student enrolled successfully.')}
      />

      {/* BULK ENROLL MODAL */}
      <BulkEnrollModal
        isOpen={isBulkEnrollOpen}
        onClose={() => setIsBulkEnrollOpen(false)}
        courseUuid={courseUuid}
        onSuccess={() => showToast('Bulk enrollment completed successfully.')}
      />
    </div>
  );
};
