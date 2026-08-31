import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, Layers, AlertCircle, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { LESSON_TYPES_CONFIG } from '../config/lessonTypes.config';
import { curriculumService } from '../services/curriculum.service';
import { useCurriculumStore } from '../store/curriculum.store';
import { isValidCourseId, isValidModuleUuid } from '../../../utils/courseValidation.utils';
import type { CourseModule } from '../../../types/curriculum.types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

export const LessonTypeSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courseId, courseUuid } = useParams<{ courseId?: string; courseUuid?: string }>();
  const effectiveCourseId = (courseId || courseUuid || '').trim();
  const rawModuleUuid = searchParams.get('moduleUuid');

  // Pre-flight validation checks:
  const isCourseValid = isValidCourseId(effectiveCourseId);
  const isModuleProvided = rawModuleUuid !== null && rawModuleUuid.trim() !== '';
  const isModuleValid = isModuleProvided && isValidModuleUuid(rawModuleUuid!);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<'NONE' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR'>('NONE');
  const [targetModule, setTargetModule] = useState<CourseModule | null>(null);
  const [allModules, setAllModules] = useState<CourseModule[]>([]);
  const [isSectionPickerOpen, setIsSectionPickerOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Lessons' | 'Assessments'>('All');

  const storeModules = useCurriculumStore((state) => state.modules);

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

  // 1. Invalid Course ID
  if (!isCourseValid) {
    return (
      <FormPageLayout
        title="Add Lesson"
        subtitle="Invalid Course Identifier"
        backUrl="/courses"
        breadcrumbs={[{ label: 'Courses', url: '/courses' }, { label: 'Invalid Course' }]}
      >
        <div className="w-full max-w-lg mx-auto py-12 px-4 text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Invalid Course URL</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The course identifier in the URL is missing or malformed.
          </p>
          <div className="pt-4">
            <Button onClick={() => navigate('/courses')} className="bg-[#2563EB] text-white font-medium">
              Back to Courses
            </Button>
          </div>
        </div>
      </FormPageLayout>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <FormPageLayout
        title="Add Lesson"
        subtitle="Loading Curriculum Setup..."
        backUrl={`/courses/${effectiveCourseId}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
          { label: 'Add Lesson' },
        ]}
      >
        <div className="w-full max-w-md mx-auto py-16 text-center space-y-4 font-sans">
          <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Loading lesson setup options...
          </p>
        </div>
      </FormPageLayout>
    );
  }

  // 3. 403 Forbidden State
  if (errorState === 'FORBIDDEN') {
    return (
      <FormPageLayout
        title="Add Lesson"
        subtitle="Permission Denied"
        backUrl={`/courses/${effectiveCourseId}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
          { label: 'Add Lesson' },
        ]}
      >
        <div className="w-full max-w-lg mx-auto py-12 px-4 text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Access Denied</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You do not have permission to create lessons in this Course.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => navigate(`/courses/${effectiveCourseId}/curriculum`)}
              className="bg-[#2563EB] text-white font-medium"
            >
              Back to Curriculum
            </Button>
          </div>
        </div>
      </FormPageLayout>
    );
  }

  // 4. No Sections Exist
  if (allModules.length === 0 || errorState === 'NOT_FOUND') {
    return (
      <FormPageLayout
        title="Add Lesson"
        subtitle="Create a Section First"
        backUrl={`/courses/${effectiveCourseId}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
          { label: 'Add Lesson' },
        ]}
      >
        <div className="w-full max-w-lg mx-auto py-12 px-4 text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create a Section First</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Lessons need a section to keep your course organized. Create your first course section to get started.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Button
              onClick={() => navigate(`/courses/${effectiveCourseId}/curriculum/modules/new`)}
              className="bg-[#2563EB] text-white font-medium px-5"
            >
              + Create Section
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/courses/${effectiveCourseId}/curriculum`)}
              className="font-medium"
            >
              Back to Curriculum
            </Button>
          </div>
        </div>
      </FormPageLayout>
    );
  }

  const activeModuleUuid = targetModule?.uuid || allModules[0]?.uuid || '';

  const filteredTypes = LESSON_TYPES_CONFIG.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q || item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    All: LESSON_TYPES_CONFIG.length,
    Lessons: LESSON_TYPES_CONFIG.filter((t) => t.category === 'Lessons').length,
    Assessments: LESSON_TYPES_CONFIG.filter((t) => t.category === 'Assessments').length,
  };

  const handleSelectType = (type: string) => {
    if (type.toLowerCase() === 'quiz') {
      navigate(
        `/courses/${effectiveCourseId}/curriculum/quizzes/new?moduleUuid=${activeModuleUuid}`
      );
      return;
    }
    navigate(
      `/courses/${effectiveCourseId}/curriculum/lessons/new?type=${type}&moduleUuid=${activeModuleUuid}`
    );
  };

  const handleSwitchSection = (mod: CourseModule) => {
    setTargetModule(mod);
    setIsSectionPickerOpen(false);
    navigate(`/courses/${effectiveCourseId}/curriculum/lessons/select-type?moduleUuid=${mod.uuid}`, { replace: true });
  };

  return (
    <FormPageLayout
      title="Choose Lesson Type"
      subtitle={`Adding to Section: ${targetModule?.title || 'Course Section'}`}
      backUrl={`/courses/${effectiveCourseId}/curriculum`}
      breadcrumbs={[
        { label: 'Courses', url: '/courses' },
        { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
        { label: targetModule?.title || 'Section', url: `/courses/${effectiveCourseId}/curriculum` },
        { label: 'Add Lesson' },
      ]}
    >
      <div className="w-full max-w-4xl min-w-0 mx-auto px-1 sm:px-4 py-3 sm:py-6 font-sans text-left space-y-4 sm:space-y-5 pb-32 sm:pb-12">
        {/* Selected Section Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 dark:bg-[#111827] border border-blue-100 dark:border-[#263244] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs w-full min-w-0 shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] block">
                Target Section
              </span>
              <strong className="text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] truncate block font-bold">
                {targetModule?.title || 'Selected Section'}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setIsSectionPickerOpen(true)}
              className="h-9 sm:h-8 text-xs px-3 border-blue-200 dark:border-[#334155] text-[#2563EB] dark:text-[#60A5FA] bg-white dark:bg-[#172033] hover:bg-blue-100/60 dark:hover:bg-[#1E293B] font-bold w-full sm:w-auto"
            >
              Change Section
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => navigate(`/courses/${effectiveCourseId}/curriculum`)}
              className="h-9 sm:h-8 text-xs px-3 border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-[#1E293B] font-medium hidden sm:inline-flex"
            >
              Back
            </Button>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="space-y-3 w-full min-w-0">
          <div className="relative w-full min-w-0">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lesson types..."
              className="w-full min-w-0 pl-10 pr-4 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0F172A] border border-slate-200/50 dark:border-[#263244] rounded-xl w-full max-w-full overflow-x-auto no-scrollbar whitespace-nowrap">
            {(['All', 'Lessons', 'Assessments'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeCategory === cat
                    ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs border border-slate-200/60 dark:border-[#263244]'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {cat} ({categoryCounts[cat]})
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid of Cards */}
        {filteredTypes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full min-w-0">
            {filteredTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectType(item.id)}
                  className="group flex flex-col justify-between p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#111827] hover:bg-blue-50/40 dark:hover:bg-[#172033] hover:border-[#2563EB] dark:hover:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 active:scale-[0.98] transition-all text-left shadow-2xs cursor-pointer min-h-[115px] w-full min-w-0"
                >
                  <div className="space-y-2 min-w-0 w-full">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.10)] border border-[#DBEAFE] dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] group-hover:bg-[#2563EB] dark:group-hover:bg-[#2563EB] group-hover:text-white dark:group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors leading-snug break-words font-sans">
                      {item.label}
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal leading-tight line-clamp-2 mt-2 break-words">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 sm:p-8 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-[#F8FAFC]">No lesson types found</p>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              No results matching "{searchQuery}". Try searching for another term.
            </p>
          </div>
        )}

        {/* SECTION / MODULE SWITCHER BOTTOM-SHEET MODAL */}
        <Modal
          isOpen={isSectionPickerOpen}
          onClose={() => setIsSectionPickerOpen(false)}
          title="Select Target Section"
        >
          <div className="space-y-3 font-sans text-xs text-left p-1">
            <p className="text-slate-500 dark:text-[#94A3B8] text-xs">
              Choose which section this new lesson will be added to:
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {allModules.map((mod, idx) => {
                const isSelected = mod.uuid === activeModuleUuid;
                return (
                  <button
                    key={`switch-mod-${mod.uuid}`}
                    type="button"
                    onClick={() => handleSwitchSection(mod)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-[#2563EB] text-[#2563EB] font-bold shadow-xs'
                        : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] text-slate-800 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8]'
                      }`}>
                        {idx + 1}
                      </div>
                      <strong className="text-xs truncate block">{mod.title}</strong>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      </div>
    </FormPageLayout>
  );
};
