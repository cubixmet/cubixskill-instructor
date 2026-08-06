import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit3, Trash2, Power } from 'lucide-react';
import type { StudentDetail } from '../types/student.types';
import { Badge } from '../../../components/ui/Badge';

interface StudentTableProps {
  students: StudentDetail[];
  courseUuid?: string;
  onToggleStatus: (uuid: string) => void;
  onDeleteStudent: (uuid: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  courseUuid,
  onToggleStatus,
  onDeleteStudent,
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto no-scrollbar font-sans">
      <table className="w-full text-left text-xs font-medium text-[#0F172A]">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[10px] uppercase font-bold">
            <th className="py-3.5 px-4">Student</th>
            <th className="py-3.5 px-4">Contact</th>
            <th className="py-3.5 px-4">Enrolled Course</th>
            <th className="py-3.5 px-4">Progress</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const mainCourse = student.enrolledCourses[0];
            const progress = mainCourse?.progressPercent || 0;
            const targetUrl = courseUuid ? `/courses/${courseUuid}/students/${student.uuid}` : `/students/${student.uuid}`;

            return (
              <tr key={student.uuid} className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => navigate(targetUrl)}
                    className="text-left group cursor-pointer"
                  >
                    <strong className="block text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                      {student.name}
                    </strong>
                    <span className="text-[11px] text-[#64748B] font-normal">{student.email}</span>
                  </button>
                </td>
                <td className="py-3.5 px-4 text-[#64748B]">
                  <span className="text-xs font-medium text-[#0F172A]">{student.phone || '+91 98765 43210'}</span>
                </td>
                <td className="py-3.5 px-4 font-medium text-[#0F172A]">
                  {mainCourse?.courseTitle || 'React 19 Masterclass'}
                </td>
                <td className="py-3.5 px-4">
                  <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full ${progress === 100 ? 'bg-emerald-600' : 'bg-[#2563EB]'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[#2563EB]">{progress}% Completed</span>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={student.status === 'Active' ? 'success' : 'secondary'} size="sm" dot>
                    {student.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(targetUrl)}
                      className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="View Student Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/students/${student.uuid}/edit`)}
                      className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Student"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(student.uuid)}
                      className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title={student.status === 'Active' ? 'Suspend Student' : 'Reactivate Student'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteStudent(student.uuid)}
                      className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
