import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit3, Trash2, Power, PlusCircle, BookOpen } from 'lucide-react';
import type { StudentDetail } from '../types/student.types';
import { Badge } from '../../../components/ui/Badge';

interface StudentTableProps {
  students: StudentDetail[];
  courseUuid?: string;
  canEdit?: boolean;
  canEnroll?: boolean;
  canToggleStatus?: boolean;
  canDelete?: boolean;
  onEnrollStudent?: (student: StudentDetail) => void;
  onToggleStatus: (uuid: string) => void;
  onDeleteStudent: (student: StudentDetail) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  courseUuid,
  canEdit = true,
  canEnroll = true,
  canToggleStatus = true,
  canDelete = true,
  onEnrollStudent,
  onToggleStatus,
  onDeleteStudent,
}) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="overflow-x-auto no-scrollbar font-sans">
      <table className="w-full text-left text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] border-collapse">
        <thead>
          <tr className="bg-[#F8FAFC] dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">
            <th className="py-3.5 px-4 min-w-[200px]">Student</th>
            <th className="py-3.5 px-4 min-w-[140px]">Contact</th>
            <th className="py-3.5 px-4 min-w-[180px]">Enrolled Courses</th>
            <th className="py-3.5 px-4 min-w-[140px]">Overall Progress</th>
            <th className="py-3.5 px-4 min-w-[100px]">Status</th>
            <th className="py-3.5 px-4 min-w-[110px]">Joined Date</th>
            <th className="py-3.5 px-4 text-right min-w-[140px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244]">
          {students.map((student) => {
            const mainCourse = student.enrolledCourses?.[0];
            const courseCount = student.enrolledCourses?.length || 0;
            const progress = mainCourse?.progressPercent ?? 0;
            const targetUrl = courseUuid
              ? `/courses/${courseUuid}/students/${student.uuid}`
              : `/students/${student.uuid}`;

            const joinedDate = student.enrollmentDate
              ? new Date(student.enrollmentDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Aug 1, 2026';

            return (
              <tr key={student.uuid} className="bg-white dark:bg-[#111827] hover:bg-slate-50/80 dark:hover:bg-[#172033] transition-colors">
                {/* Student info */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-[#172033] border border-blue-200 dark:border-[#263244] text-[#2563EB] dark:text-[#60A5FA] font-bold text-xs flex items-center justify-center shrink-0">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(student.name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(targetUrl)}
                        className="text-left group cursor-pointer block max-w-full"
                      >
                        <strong className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors truncate">
                          {student.name}
                        </strong>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate block">
                          {student.email}
                        </span>
                      </button>
                    </div>
                  </div>
                </td>

                {/* Contact info */}
                <td className="py-3.5 px-4 text-[#64748B] dark:text-[#94A3B8]">
                  <div className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {student.phone || '+91 98765 43210'}
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate">
                    {student.country || 'India'}
                  </div>
                </td>

                {/* Enrolled Courses */}
                <td className="py-3.5 px-4 font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                    <span className="text-xs truncate max-w-[160px]">
                      {mainCourse?.courseTitle || 'React 19 Masterclass'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-semibold block mt-0.5">
                    {courseCount} {courseCount === 1 ? 'Course' : 'Courses'} Enrolled
                  </span>
                </td>

                {/* Progress */}
                <td className="py-3.5 px-4">
                  <div className="w-28 bg-slate-100 dark:bg-[#263244] h-2 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full transition-all ${
                        progress === 100 ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-[#2563EB] dark:bg-[#3B82F6]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[#2563EB] dark:text-[#60A5FA]">{progress}% Completed</span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <Badge
                    variant={
                      student.status === 'Active'
                        ? 'success'
                        : student.status === 'Completed'
                        ? 'primary'
                        : 'secondary'
                    }
                    size="sm"
                    dot
                  >
                    {student.status}
                  </Badge>
                </td>

                {/* Joined date */}
                <td className="py-3.5 px-4 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  {joinedDate}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(targetUrl)}
                      className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-[#172033] rounded-lg transition-colors cursor-pointer"
                      title="View Student Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {canEnroll && (
                      <button
                        type="button"
                        onClick={() => onEnrollStudent?.(student)}
                        className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-[#172033] rounded-lg transition-colors cursor-pointer"
                        title="Enroll in Course"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => navigate(`/students/${student.uuid}/edit`)}
                        className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-[#172033] rounded-lg transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {canToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(student.uuid)}
                        className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg transition-colors cursor-pointer"
                        title={student.status === 'Active' ? 'Suspend Student' : 'Reactivate Student'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeleteStudent(student)}
                        className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
