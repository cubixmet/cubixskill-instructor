import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Download, Search, LayoutGrid, List, UsersRound } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useStudentStore } from '../store/student.store';
import { StudentTable } from '../components/StudentTable';
import { StudentCard } from '../components/StudentCard';
import { BulkAddStudentsModal } from '../components/BulkAddStudentsModal';
import { exportToCsv, slugify, type CsvColumn } from '../../../utils/export-csv';
import type { StudentDetail } from '../types/student.types';

export const StudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid } = useParams<{ courseUuid?: string }>();

  const students = useStudentStore((state) => state.students);
  const toggleStudentStatus = useStudentStore((state) => state.toggleStudentStatus);
  const deleteStudent = useStudentStore((state) => state.deleteStudent);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedStudentUuids, setSelectedStudentUuids] = useState<string[]>([]);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const targetList =
      selectedStudentUuids.length > 0
        ? filtered.filter((s) => selectedStudentUuids.includes(s.uuid))
        : filtered;

    if (targetList.length === 0) {
      showToast('No students are available to export.');
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const isSelected = selectedStudentUuids.length > 0;
    const filename = `cubixskill-students-${isSelected ? 'selected-' : ''}${dateStr}.csv`;

    const columns: CsvColumn<StudentDetail>[] = [
      { header: 'Full Name', value: (row) => row.name },
      { header: 'Email', value: (row) => row.email },
      { header: 'Country Code', value: () => row.countryCode || '+91' },
      { header: 'Phone Number', value: (row) => row.phone },
      { header: 'Country', value: (row) => row.country || 'India' },
      { header: 'Student Status', value: (row) => row.status },
      { header: 'Joined Date', value: (row) => new Date(row.enrollmentDate).toISOString().split('T')[0] },
      { header: 'Enrolled Course Count', value: (row) => row.enrolledCourses?.length || 0 },
      { header: 'Overall Progress', value: (row) => '85%' },
      { header: 'Total Credits Used', value: (row) => row.creditsConsumed || 17 },
      { header: 'Last Activity', value: (row) => row.lastActivity || 'Active' },
      { header: 'Internal Notes', value: (row) => row.notes || '' },
    ];

    try {
      exportToCsv(filename, targetList, columns);
      showToast(`CSV exported successfully (${targetList.length} ${targetList.length === 1 ? 'student' : 'students'}).`);
    } catch (err) {
      showToast('CSV export failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6 text-left font-sans pb-12 max-w-[1600px] mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              Student Roster ({students.length})
            </h1>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Manage student accounts, registration details, and learning activity.
            </p>
          </div>

          {/* Action Buttons Order: Export CSV | Bulk Add Students | Add Student */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
              className="border-[#E2E8F0] text-xs font-semibold text-[#0F172A] h-10 min-h-[40px]"
            >
              {selectedStudentUuids.length > 0
                ? `Export Selected (${selectedStudentUuids.length})`
                : 'Export CSV'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UsersRound className="w-4 h-4 text-[#2563EB]" />}
              onClick={() => setIsBulkAddOpen(true)}
              className="border-[#2563EB] text-[#2563EB] text-xs font-semibold h-10 min-h-[40px]"
            >
              Bulk Add Students
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
              onClick={() => navigate('/students/create')}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-10 min-h-[40px]"
            >
              Add Student
            </Button>
          </div>
        </div>

        {/* Search Bar, Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name, email, or phone..."
              className="w-full h-10 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-semibold text-[#0F172A] text-xs focus:outline-none focus:border-[#2563EB]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Suspended">Suspended</option>
            </select>

            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B]'
                }`}
                title="Table View"
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
        </div>
      </div>

      {/* VIEW CONTENT */}
      {viewMode === 'table' ? (
        <Card padding="none" className="bg-white border border-[#E2E8F0] overflow-hidden rounded-[16px]">
          <StudentTable
            students={filtered}
            courseUuid={courseUuid}
            onToggleStatus={toggleStudentStatus}
            onDeleteStudent={deleteStudent}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <StudentCard key={s.uuid} student={s} courseUuid={courseUuid} />
          ))}
        </div>
      )}

      {/* BULK ADD STUDENTS MODAL */}
      <BulkAddStudentsModal
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
        onSuccess={() => showToast('Bulk student creation completed successfully.')}
      />
    </div>
  );
};
