import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAcademyBrandingStore, PREBUILT_20_THEMES } from '../store/academyBranding.store';

export const MyAcademiesPage: React.FC = () => {
  const navigate = useNavigate();
  const enrolledAcademies = useAcademyBrandingStore((state) => state.enrolledAcademies);
  const selectStudentAcademy = useAcademyBrandingStore((state) => state.selectStudentAcademy);

  const handleEnterAcademy = (slug: string) => {
    selectStudentAcademy(slug);
    navigate(`/student?academy=${slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white p-6 sm:p-12 space-y-8 text-left">
      <div className="max-w-5xl mx-auto space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm" className="font-bold">
            Global Student Account
          </Badge>
          <span className="text-slate-400 text-xs font-mono">student@cubixskill.com</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">My Enrolled Academies</h1>
        <p className="text-slate-400 text-xs font-medium max-w-xl">
          Select an academy below to enter its custom branded student portal with personalized themes, course progress, and certificates.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {enrolledAcademies.map((acad) => {
          const theme = PREBUILT_20_THEMES.find((t) => t.id === acad.themeId) || PREBUILT_20_THEMES[0];

          return (
            <Card
              key={acad.id}
              padding="none"
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Header Gradient */}
              <div className={`h-24 bg-gradient-to-r ${theme.previewBg} p-4 flex items-center gap-3 relative`}>
                <img src={acad.logoUrl} alt={acad.academyName} className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 shadow-md" />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-white truncate">{acad.academyName}</h3>
                  <span className="text-[10px] text-white/80 font-mono">cubixskill.com/{acad.academySlug}</span>
                </div>
              </div>

              {/* Body Info */}
              <div className="p-4 space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>{acad.enrolledCoursesCount} Enrolled Courses</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {acad.lastActive}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <Button
                    onClick={() => handleEnterAcademy(acad.academySlug)}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs h-10 shadow-md flex items-center justify-center gap-2"
                  >
                    Enter Branded Academy <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
