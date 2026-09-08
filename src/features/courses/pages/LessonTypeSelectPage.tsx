import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { LESSON_TYPES_CONFIG } from '../config/lessonTypes.config';
import { curriculumService } from '../services/curriculum.service';
import { useCurriculumStore } from '../store/curriculum.store';
import { isValidCourseId } from '../../../utils/courseValidation.utils';
import type { CourseModule } from '../../../types/curriculum.types';
import { Button } from '../../../components/ui/Button';

// Semantic Icon Tile Background & Text Colors
const TILE_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  video: { bg: 'bg-[#3B82F6]', text: 'text-white' }, // Blue
  audio: { bg: 'bg-[#A855F7]', text: 'text-white' }, // Purple
  document: { bg: 'bg-[#F43F5E]', text: 'text-white' }, // Pink / Red
  image: { bg: 'bg-[#10B981]', text: 'text-white' }, // Emerald / Green
  text: { bg: 'bg-[#F59E0B]', text: 'text-white' }, // Yellow / Amber
  quiz: { bg: 'bg-[#8B5CF6]', text: 'text-white' }, // Indigo / Violet
  assignment: { bg: 'bg-[#14B8A6]', text: 'text-white' }, // Teal
  project: { bg: 'bg-[#F97316]', text: 'text-white' }, // Orange
};

export const LessonTypeSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { courseId, courseUuid } = useParams<{ courseId?: string; courseUuid?: string }>();
  const effectiveCourseId = (courseId || courseUuid || '').trim();
  const rawModuleUuid = searchParams.get('moduleUuid');

  const isCourseValid = isValidCourseId(effectiveCourseId);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<'NONE' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR'>('NONE');
  const [targetModule, setTargetModule] = useState<CourseModule | null>(null);
  const [allModules, setAllModules] = useState<CourseModule[]>([]);

  const storeModules = useCurriculumStore((state) => state.modules);

  // Always reset scroll position to top on page open or route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const appScrollContainer = document.querySelector('[data-app-scroll-container]') || document.querySelector('main');
    if (appScrollContainer) {
      appScrollContainer.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.search]);

  const loadData = async () => {
    if (!isCourseValid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorState('NONE');

    try {
      const fetchedModules = await curriculumService.fetchModules(effectiveCourseId);
      const modulesList = fetchedModules.length > 0 ? fetchedModules : storeModules.filter((m) => m.courseUuid === effectiveCourseId);
      setAllModules(modulesList);

      if (rawModuleUuid) {
        const foundModule = modulesList.find((m) => m.uuid === rawModuleUuid);
        if (foundModule) {
          setTargetModule(foundModule);
        } else if (modulesList.length > 0) {
          setTargetModule(modulesList[0]);
        } else {
          setErrorState('NOT_FOUND');
        }
      } else if (modulesList.length > 0) {
        setTargetModule(modulesList[0]);
      } else {
        setErrorState('NOT_FOUND');
      }
    } catch (err: any) {
      console.error('[LessonTypeSelectPage] Error loading module data:', err);
      const status = err?.response?.status;
      if (status === 403) {
        setErrorState('FORBIDDEN');
      } else if (status === 404) {
        setErrorState('NOT_FOUND');
      } else {
        setErrorState('SERVER_ERROR');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveCourseId, rawModuleUuid]);

  const handleBackToCurriculum = () => {
    navigate(`/courses/${effectiveCourseId}/curriculum`);
  };

  const handleSelectLessonType = (typeId: string) => {
    const activeModuleUuid = rawModuleUuid || targetModule?.uuid || allModules[0]?.uuid || '';
    if (!activeModuleUuid) {
      alert('Module information is missing. Return to curriculum and select Add Lesson again.');
      return;
    }

    if (typeId.toLowerCase() === 'quiz') {
      navigate(`/courses/${effectiveCourseId}/curriculum/quizzes/new?moduleUuid=${activeModuleUuid}`);
      return;
    }
    navigate(`/courses/${effectiveCourseId}/curriculum/lessons/new?type=${typeId}&moduleUuid=${activeModuleUuid}`);
  };

  if (!isCourseValid) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 font-sans text-left">
        <div className="w-full max-w-lg p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Invalid Course URL</h2>
          <p className="text-sm text-[var(--text-secondary)]">The course identifier in the URL is missing or malformed.</p>
          <Button onClick={() => navigate('/courses')} className="bg-[var(--brand-primary)] text-white font-medium">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 font-sans text-left">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[var(--brand-primary)] animate-spin mx-auto" />
          <p className="text-sm text-[var(--text-secondary)] font-semibold">Loading lesson options...</p>
        </div>
      </div>
    );
  }

  if (errorState === 'FORBIDDEN') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 font-sans text-left">
        <div className="w-full max-w-lg p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-center space-y-4 shadow-xl">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Access Denied</h2>
          <p className="text-sm text-[var(--text-secondary)]">You do not have permission to create lessons in this course.</p>
          <Button onClick={handleBackToCurriculum} className="bg-[var(--brand-primary)] text-white font-medium">
            Back to Curriculum
          </Button>
        </div>
      </div>
    );
  }

  if (allModules.length === 0 || errorState === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 font-sans text-left">
        <div className="w-full max-w-lg p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-center space-y-4 shadow-xl">
          <Layers className="w-10 h-10 text-[var(--brand-primary)] mx-auto" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Create a Section First</h2>
          <p className="text-sm text-[var(--text-secondary)]">Lessons need a section to keep your course organized.</p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button onClick={() => navigate(`/courses/${effectiveCourseId}/curriculum/modules/new`)} className="bg-[var(--brand-primary)] text-white font-medium">
              + Create Section
            </Button>
            <Button variant="outline" onClick={handleBackToCurriculum}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-sans px-3 sm:px-6 py-3 sm:py-6 lg:p-8 flex flex-col items-center box-border pb-[calc(84px+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-5xl space-y-3 sm:space-y-6">
        
        {/* Back Link & Compact Header without huge top gap */}
        <div className="space-y-1.5 sm:space-y-3 pt-0">
          <Link
            to={`/courses/${effectiveCourseId}/curriculum`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Curriculum</span>
          </Link>

          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Choose Lesson Type
            </h1>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5 font-normal max-w-2xl leading-tight">
              Select the type of lesson you want to create.
            </p>
          </div>
        </div>

        {/* 1 Column on Mobile (<= 600px), 2 Columns on Desktop (>= 768px) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3.5 w-full">
          {LESSON_TYPES_CONFIG.map((item) => {
            const Icon = item.icon;
            const colors = TILE_COLOR_MAP[item.id] || { bg: 'bg-[#3B82F6]', text: 'text-white' };

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectLessonType(item.id)}
                className="group relative p-3 sm:p-4 rounded-[12px] sm:rounded-[16px] border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] active:scale-[0.98] text-left transition-all cursor-pointer flex items-center gap-3 sm:gap-3.5 w-full min-w-0 box-border"
              >
                {/* Compact Icon Tile */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-[12px] ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h3 className="text-xs sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors leading-tight">
                    {item.label}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-normal leading-tight">
                    {item.description}
                  </p>
                </div>

                {/* Right Arrow Chevron Indicator */}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};


