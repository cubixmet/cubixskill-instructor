import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Mail, ChevronRight } from 'lucide-react';
import type { StudentDetail } from '../types/student.types';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';

interface StudentCardProps {
  student: StudentDetail;
  courseUuid?: string;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, courseUuid }) => {
  const navigate = useNavigate();
  const targetUrl = courseUuid ? `/courses/${courseUuid}/students/${student.uuid}` : `/students/${student.uuid}`;

  const mainCourse = student.enrolledCourses[0];
  const progress = mainCourse?.progressPercent || 0;

  return (
    <Card
      padding="md"
      className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all rounded-[14px] p-4 text-left font-sans space-y-3 cursor-pointer group"
      onClick={() => navigate(targetUrl)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] font-bold text-sm flex items-center justify-center shrink-0">
            {student.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-tight">
              {student.name}
            </h3>
            <span className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-[#64748B]" /> {student.email}
            </span>
          </div>
        </div>

        <Badge variant={student.status === 'Active' ? 'success' : 'secondary'} size="sm" dot>
          {student.status}
        </Badge>
      </div>

      {/* Course Progress */}
      <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B] font-medium flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
            {mainCourse?.courseTitle || 'React 19 Masterclass'}
          </span>
          <strong className="text-[#2563EB] font-semibold">{progress}%</strong>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-[#2563EB] h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1 font-medium">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#64748B]" /> Active {student.lastActivity}
        </span>
        <span className="text-[#2563EB] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
          View Profile <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Card>
  );
};
