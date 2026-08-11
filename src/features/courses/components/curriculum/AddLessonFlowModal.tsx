import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Layers,
  ArrowLeft,
  Plus,
  Lock,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import type { CourseModule, LessonType } from '../../../../types/curriculum.types';
import { useCourseFeaturesStore } from '../../store/courseFeatures.store';
import { LESSON_TYPES_CONFIG } from '../../config/lessonTypes.config';

interface AddLessonFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: CourseModule[];
  lessonsCountByModule: Record<string, number>;
  preselectedModuleUuid?: string | null;
  onSelectTypeAndModule: (type: LessonType, moduleUuid: string) => void;
  onCreateModule: () => void;
  courseUuid: string;
}

export const AddLessonFlowModal: React.FC<AddLessonFlowModalProps> = ({
  isOpen,
  onClose,
  modules,
  lessonsCountByModule,
  preselectedModuleUuid,
  onSelectTypeAndModule,
  onCreateModule,
  courseUuid,
}) => {
  const [step, setStep] = useState<'module' | 'type'>('module');
  const [selectedModuleUuid, setSelectedModuleUuid] = useState<string | null>(null);
  const [moduleSearch, setModuleSearch] = useState('');

  const features = useCourseFeaturesStore((state) => state.getCourseFeatures(courseUuid));

  const [prevOpenKey, setPrevOpenKey] = useState<string | null>(null);
  const openKey = isOpen ? `${isOpen}-${preselectedModuleUuid || ''}-${modules.length}` : null;
  if (openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (isOpen) {
      if (preselectedModuleUuid) {
        setSelectedModuleUuid(preselectedModuleUuid);
        setStep('type');
      } else if (modules.length === 1) {
        setSelectedModuleUuid(modules[0].uuid);
        setStep('type');
      } else {
        setSelectedModuleUuid(null);
        setStep('module');
      }
      setModuleSearch('');
    }
  }

  if (!isOpen) return null;

  const filteredModules = modules.filter((m) =>
    m.title.toLowerCase().includes(moduleSearch.toLowerCase().trim())
  );

  const currentModule = modules.find((m) => m.uuid === selectedModuleUuid);

  const handleChooseModule = (moduleUuid: string) => {
    setSelectedModuleUuid(moduleUuid);
    setStep('type');
  };

  const handleSelectType = (type: LessonType) => {
    if (!selectedModuleUuid) return;
    onSelectTypeAndModule(type, selectedModuleUuid);
    onClose();
  };

  return (
    <AnimatePresence>
      <div key="add-flow-overlay" className="fixed inset-0 z-50 overflow-y-auto no-scrollbar font-sans text-left">
        {/* Backdrop */}
        <motion.div
          key="add-flow-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs hidden sm:block"
        />

        {/* Dialog Container */}
        <div className="min-h-full sm:p-4 flex items-end sm:items-center justify-center">
          <motion.div
            key="add-flow-panel"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full h-full sm:h-auto max-w-xl bg-white sm:rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-[#E2E8F0] fixed sm:relative inset-0 sm:inset-auto z-50 max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                {step === 'type' && !preselectedModuleUuid && modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep('module')}
                    className="p-1 -ml-1 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    title="Back to Module selection"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100 shrink-0">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Add Lesson</h3>
                  <p className="text-[11px] text-[#64748B] font-medium">
                    {step === 'module'
                      ? 'Step 1 of 2: Select target module'
                      : `Step 2 of 2: Choose lesson type for "${currentModule?.title || 'Selected Module'}"`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar flex-1 space-y-4">
              {/* STEP 1: SELECT MODULE */}
              {step === 'module' && (
                <div className="space-y-3">
                  {modules.length === 0 ? (
                    <div className="p-6 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E2E8F0] space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 mx-auto flex items-center justify-center">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">No modules in this course yet</h4>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Create a module first before adding lessons to your curriculum.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          onClose();
                          onCreateModule();
                        }}
                        leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                        className="bg-[#2563EB] text-white font-semibold text-xs h-9 px-4 shadow-2xs"
                      >
                        Create Module
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                        <Input
                          value={moduleSearch}
                          onChange={(e) => setModuleSearch(e.target.value)}
                          placeholder="Search modules..."
                          className="pl-9 h-10 text-xs sm:text-sm"
                        />
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                        {filteredModules.map((mod, idx) => {
                          const count = lessonsCountByModule[mod.uuid] || 0;
                          return (
                            <button
                              key={mod.uuid}
                              type="button"
                              onClick={() => handleChooseModule(mod.uuid)}
                              className="w-full p-3 bg-white hover:bg-blue-50/50 border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl flex items-center justify-between transition-all cursor-pointer text-left group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white font-semibold text-xs flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#2563EB]">
                                    {mod.title}
                                  </h4>
                                  <p className="text-[10px] text-[#64748B] font-medium">
                                    {count} {count === 1 ? 'lesson' : 'lessons'}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-[#2563EB] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                Select →
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 2: CHOOSE LESSON TYPE */}
              {step === 'type' && (
                <div className="space-y-4">
                  {/* Selected Module Banner */}
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Layers className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <span className="text-[#64748B] font-medium shrink-0">Adding to:</span>
                      <strong className="text-[#0F172A] truncate">{currentModule?.title}</strong>
                    </div>

                    {!preselectedModuleUuid && modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep('module')}
                        className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer shrink-0 ml-2"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {/* Categorized Options */}
                  {(['Lessons', 'Assessments'] as const).map((cat) => {
                    const catOptions = LESSON_TYPES_CONFIG.filter((o) => o.category === cat);

                    return (
                      <div key={cat} className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-[#64748B] tracking-wider block">
                          {cat === 'Lessons' ? 'Lessons & Learning Content' : 'Assessments & Practice'}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {catOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isFeatureDisabled =
                              opt.requiredFeature &&
                              ((opt.requiredFeature === 'quizzes' && !features.quizzes) ||
                                (opt.requiredFeature === 'assignments' && !features.assignments));

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                disabled={Boolean(isFeatureDisabled)}
                                onClick={() => handleSelectType(opt.id)}
                                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                  isFeatureDisabled
                                    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                    : 'bg-white hover:bg-blue-50/50 border-[#E2E8F0] hover:border-[#2563EB] cursor-pointer group shadow-2xs'
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                    isFeatureDisabled
                                      ? 'bg-slate-100 border-slate-200 text-slate-400'
                                      : 'bg-blue-50 text-[#2563EB] border-blue-100 group-hover:bg-[#2563EB] group-hover:text-white transition-colors'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className={`text-xs font-bold ${isFeatureDisabled ? 'text-slate-500' : 'text-[#0F172A] group-hover:text-[#2563EB]'}`}>
                                      {opt.label}
                                    </h4>
                                    {isFeatureDisabled && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                                  </div>
                                  <p className="text-[10px] text-[#64748B] font-medium leading-tight mt-0.5">
                                    {isFeatureDisabled ? 'Disabled in Course Features' : opt.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between shrink-0 pb-[calc(12px+env(safe-area-inset-bottom))]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs font-semibold h-9 px-3.5"
              >
                Cancel
              </Button>
              <span className="text-[11px] text-[#64748B] font-medium">
                {step === 'module' ? 'Select a module to continue' : 'Select a lesson type to begin authoring'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
