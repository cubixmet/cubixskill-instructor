import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, Layers, CheckCircle2, ArrowRight, FileText } from 'lucide-react';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { LESSON_TYPES_CONFIG } from '../config/lessonTypes.config';
import { useCurriculumStore } from '../store/curriculum.store';
import type { LessonType } from '../../../types/curriculum.types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export const LessonTypeSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courseUuid = '' } = useParams<{ courseUuid?: string }>();

  const initialModuleUuid = searchParams.get('moduleUuid') || '';

  const allModules = useCurriculumStore((state) => state.modules);
  const courseModules = allModules.filter((m) => m.courseUuid === courseUuid);
  const activeModules = courseModules.length > 0 ? courseModules : allModules;
  const allLessons = useCurriculumStore((state) => state.lessons);

  // Active step: 1 (Module) or 2 (Lesson Type)
  const [activeStep, setActiveStep] = useState<1 | 2>(initialModuleUuid ? 2 : 1);

  // Selected module UUID
  const [selectedModuleUuid, setSelectedModuleUuid] = useState<string>(
    initialModuleUuid || activeModules[0]?.uuid || ''
  );
  const [moduleError, setModuleError] = useState('');

  // Search & Category for Step 2
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Lessons' | 'Assessments'>('All');

  const selectedModule = activeModules.find((m) => m.uuid === selectedModuleUuid) || activeModules[0];

  const getLessonCountForModule = (modUuid: string) => {
    return allLessons.filter((l) => l.moduleUuid === modUuid).length;
  };

  const handleSelectModule = (modUuid: string) => {
    setSelectedModuleUuid(modUuid);
    setModuleError('');
    setActiveStep(2);
  };

  const handleSelectType = (type: LessonType) => {
    if (!selectedModuleUuid) {
      setModuleError('Please select a target module first.');
      setActiveStep(1);
      return;
    }
    navigate(
      `/courses/${courseUuid}/curriculum/lessons/new?type=${type}&moduleUuid=${selectedModuleUuid}`
    );
  };

  // Filter lesson types
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

  return (
    <FormPageLayout
      title="Add Lesson"
      subtitle={selectedModule ? `Target Module: ${selectedModule.title}` : 'Select Module & Lesson Type'}
      backUrl={`/courses/${courseUuid}/curriculum`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
        { label: 'Add Lesson' },
      ]}
    >
      <div className="w-full max-w-4xl min-w-0 mx-auto px-1 sm:px-4 py-3 sm:py-6 font-sans text-left space-y-4 sm:space-y-5 pb-32 sm:pb-12">
        {/* 2-Step Stepper Header */}
        <div className="p-2 sm:p-3 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`w-full min-w-0 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-start sm:justify-center gap-2 ${
              activeStep === 1
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-50 dark:bg-[#0F172A] text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-extrabold shrink-0">
              1
            </span>
            <span className="truncate whitespace-normal text-left">1. Select Module</span>
            {selectedModuleUuid && activeStep === 2 && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedModuleUuid) {
                setActiveStep(2);
              } else {
                setModuleError('Please select a target module first.');
              }
            }}
            className={`w-full min-w-0 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-start sm:justify-center gap-2 ${
              activeStep === 2
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-50 dark:bg-[#0F172A] text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-extrabold shrink-0">
              2
            </span>
            <span className="truncate whitespace-normal text-left">2. Select Lesson Type</span>
          </button>
        </div>

        {/* STEP 1: SELECT MODULE */}
        {activeStep === 1 && (
          <div className="space-y-4 w-full min-w-0">
            <div className="border-b border-[#E2E8F0] dark:border-[#263244] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  <span>Step 1: Select Target Module</span>
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Select which course module this new lesson will belong to.
                </p>
              </div>

              {activeModules.length === 0 && (
                <Button
                  size="xs"
                  onClick={() => navigate(`/courses/${courseUuid}/curriculum/modules/new`)}
                  className="bg-[#2563EB] text-white font-medium w-full sm:w-auto"
                >
                  Create Module First
                </Button>
              )}
            </div>

            {moduleError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs font-semibold text-rose-700 dark:text-[#F87171]">
                {moduleError}
              </div>
            )}

            {activeModules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full min-w-0">
                {activeModules.map((mod, idx) => {
                  const isSelected = mod.uuid === selectedModuleUuid;
                  const count = getLessonCountForModule(mod.uuid);

                  return (
                    <div
                      key={mod.uuid}
                      onClick={() => handleSelectModule(mod.uuid)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative group w-full min-w-0 ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-[rgba(37,99,235,0.10)] border-[#2563EB] dark:border-[#3B82F6] ring-2 ring-[#2563EB]/20 dark:ring-[#3B82F6]/20 shadow-xs'
                          : 'bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#263244] hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-slate-50/80 dark:hover:bg-[#172033] shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] bg-blue-100/70 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">
                          Module #{idx + 1}
                        </span>
                        {isSelected && (
                          <Badge variant="primary" size="sm" className="gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </Badge>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors line-clamp-2 break-words">
                          {mod.title}
                        </h4>
                        {mod.description && (
                          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mt-1 break-words">
                            {mod.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-[#263244] flex items-center justify-between text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                          {count} {count === 1 ? 'Lesson' : 'Lessons'}
                        </span>
                        <span className="text-[#2563EB] dark:text-[#60A5FA] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Select <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl space-y-3">
                <Layers className="w-8 h-8 text-slate-400 dark:text-[#94A3B8] mx-auto" />
                <h4 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-sm">No Modules Created Yet</h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">You need at least one module in this course before adding lessons.</p>
                <Button
                  onClick={() => navigate(`/courses/${courseUuid}/curriculum/modules/new`)}
                  className="bg-[#2563EB] text-white font-medium mx-auto w-full sm:w-auto"
                >
                  Create New Module
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SELECT LESSON TYPE */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200 w-full min-w-0">
            {/* Selected Module Banner */}
            <div className="p-3 sm:p-4 rounded-2xl bg-blue-50 dark:bg-[#111827] border border-blue-100 dark:border-[#263244] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs w-full min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] block">
                    Target Module Selected
                  </span>
                  <strong className="text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] truncate block font-semibold">
                    {selectedModule?.title || 'Selected Module'}
                  </strong>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setActiveStep(1)}
                className="h-10 sm:h-8 text-xs px-3 border-blue-200 dark:border-[#334155] text-[#2563EB] dark:text-[#60A5FA] bg-white dark:bg-[#172033] hover:bg-blue-100/60 dark:hover:bg-[#1E293B] font-semibold w-full sm:w-auto shrink-0"
              >
                Change Module
              </Button>
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

            {/* Responsive Grid */}
            {filteredTypes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 w-full min-w-0">
                {filteredTypes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectType(item.id)}
                      className="group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#172033] hover:border-slate-300 dark:hover:border-[rgba(59,130,246,0.45)] active:scale-[0.98] transition-all text-left shadow-2xs cursor-pointer min-h-[96px] w-full min-w-0"
                    >
                      <div className="space-y-2 min-w-0 w-full">
                        <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.10)] border border-[#DBEAFE] dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] group-hover:bg-[#2563EB] dark:group-hover:bg-[#2563EB] group-hover:text-white dark:group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>

                        <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors leading-snug break-words whitespace-normal font-sans">
                          {item.label}
                        </h3>
                      </div>

                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal leading-tight line-clamp-2 mt-1 break-words">
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
          </div>
        )}
      </div>
    </FormPageLayout>
  );
};
