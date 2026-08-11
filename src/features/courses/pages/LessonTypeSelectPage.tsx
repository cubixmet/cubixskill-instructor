import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { LESSON_TYPES_CONFIG } from '../config/lessonTypes.config';
import { useCurriculumStore } from '../store/curriculum.store';
import type { LessonType } from '../../../types/curriculum.types';

export const LessonTypeSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();

  const targetModuleUuid = searchParams.get('moduleUuid') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Lessons' | 'Assessments'>('All');

  const allModules = useCurriculumStore((state) => state.modules);
  const selectedModule =
    allModules.find((m) => m.uuid === targetModuleUuid) ||
    allModules.find((m) => m.courseUuid === courseUuid) ||
    allModules[0];

  const handleSelectType = (type: LessonType) => {
    const moduleIdParam = selectedModule?.uuid || targetModuleUuid;
    navigate(
      `/courses/${courseUuid}/curriculum/lessons/new?type=${type}${
        moduleIdParam ? `&moduleUuid=${moduleIdParam}` : ''
      }`
    );
  };

  const moduleTitle = selectedModule?.title || 'Selected Module';

  // Filter lesson types by search query and category tab
  const filteredTypes = LESSON_TYPES_CONFIG.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
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
      subtitle={`Adding to: ${moduleTitle}`}
      backUrl={`/courses/${courseUuid}/curriculum`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
        { label: 'Add Lesson' },
      ]}
    >
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 font-sans text-left space-y-4 pb-32 sm:pb-12">
        {/* Module Context Banner */}
        <div className="p-3 sm:p-4 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] block mb-0.5">
              Module Context
            </span>
            <span className="font-bold text-[#0F172A] text-xs sm:text-sm truncate block">
              Adding to: {moduleTitle}
            </span>
          </div>
          <span className="text-[10px] font-semibold bg-white border border-blue-200 text-[#2563EB] px-2.5 py-1 rounded-full shrink-0">
            {LESSON_TYPES_CONFIG.length} Types
          </span>
        </div>

        {/* Search & Category Tabs Controls */}
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lesson types..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-2xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar">
            {(['All', 'Lessons', 'Assessments'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial text-center whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-white text-[#2563EB] shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {cat} ({categoryCounts[cat]})
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Mobile Lesson Types Grid */}
        {filteredTypes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectType(item.id)}
                  className="group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-blue-50/60 hover:border-[#2563EB]/60 active:scale-[0.98] transition-all text-left shadow-2xs cursor-pointer min-h-[96px] sm:min-h-[104px] w-full min-w-0"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug break-words whitespace-normal font-sans">
                      {item.label}
                    </h3>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-[#64748B] font-medium leading-tight line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              No lesson types found
            </p>
            <p className="text-xs text-slate-500">
              No results matching "{searchQuery}". Try searching for another term.
            </p>
          </div>
        )}
      </div>
    </FormPageLayout>
  );
};
