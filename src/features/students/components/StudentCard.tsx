import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Mail,
  Phone,
  ChevronRight,
  Edit3,
  Power,
  Trash2,
  MoreVertical,
  PlusCircle,
  Eye,
} from 'lucide-react';
import type { StudentDetail } from '../types/student.types';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';

interface StudentCardProps {
  student: StudentDetail;
  courseUuid?: string;
  canEdit?: boolean;
  canEnroll?: boolean;
  canToggleStatus?: boolean;
  canDelete?: boolean;
  onEnrollStudent?: (student: StudentDetail) => void;
  onToggleStatus?: (uuid: string) => void;
  onDeleteStudent?: (student: StudentDetail) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const targetUrl = courseUuid
    ? `/courses/${courseUuid}/students/${student.uuid}`
    : `/students/${student.uuid}`;

  const enrolledCount = student.enrolledCourses?.length || 0;
  const primaryCourse = student.enrolledCourses?.[0];
  const progress = primaryCourse?.progressPercent ?? 0;

  // Initials Avatar generator
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Card
      padding="none"
      className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-2xs transition-all rounded-[16px] overflow-hidden text-left font-sans flex flex-col justify-between"
    >
      {/* Top Header Card Info */}
      <div className="p-3.5 sm:p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
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

            <div className="min-w-0 flex-1 space-y-0.5">
              <button
                type="button"
                onClick={() => navigate(targetUrl)}
                className="text-left group/name w-full block cursor-pointer"
              >
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover/name:text-[#2563EB] transition-colors leading-snug break-words">
                  {student.name}
                </h3>
              </button>

              <div className="flex items-center gap-1 text-[11px] text-[#64748B] font-medium min-w-0">
                <Mail className="w-3 h-3 text-[#64748B] shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1">
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

            {/* Context menu for secondary actions */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="More Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-7 z-20 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 text-xs text-[#0F172A] space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(targetUrl);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>View Profile</span>
                  </button>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate(`/students/${student.uuid}/edit`);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Edit Student</span>
                    </button>
                  )}

                  {canEnroll && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate(`/students/${student.uuid}/enroll`);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Enroll in Course</span>
                    </button>
                  )}

                  {canToggleStatus && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onToggleStatus?.(student.uuid);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>
                        {student.status === 'Active' ? 'Deactivate Student' : 'Reactivate Student'}
                      </span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDeleteStudent?.(student);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Student</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact info row if phone exists */}
        {student.phone && (
          <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 pt-0.5 truncate">
            <Phone className="w-3 h-3 text-[#64748B] shrink-0" />
            <span className="truncate">{student.phone}</span>
          </div>
        )}

        {/* Course Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64748B] font-medium flex items-center gap-1 truncate max-w-[65%]">
              <BookOpen className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span className="truncate">
                {enrolledCount > 0 ? `${enrolledCount} ${enrolledCount === 1 ? 'Course' : 'Courses'}` : 'No Courses'}
              </span>
            </span>
            <strong className="text-[#2563EB] font-semibold shrink-0">{progress}% Progress</strong>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progress === 100 ? 'bg-emerald-500' : 'bg-[#2563EB]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
          <span className="flex items-center gap-1 truncate">
            <Clock className="w-3 h-3 text-[#64748B] shrink-0" /> Active {student.lastActivity || 'Recently'}
          </span>
          {primaryCourse?.courseTitle && (
            <span className="truncate max-w-[50%] text-right font-medium text-slate-500">
              {primaryCourse.courseTitle}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="bg-[#F8FAFC] px-3.5 py-2.5 border-t border-[#E2E8F0] flex items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          onClick={() => navigate(targetUrl)}
          className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
        >
          <span>View Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {canEnroll && (
            <button
              type="button"
              onClick={() => onEnrollStudent?.(student)}
              className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="hidden sm:inline">Enroll</span>
            </button>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={() => navigate(`/students/${student.uuid}/edit`)}
              className="p-1 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Edit Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
