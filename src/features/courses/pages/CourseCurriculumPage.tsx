import React, { useState, useMemo } from 'react';
import type {
  DragEndEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  Check,
  Video,
  Layers,
  CircleHelp,
  Headphones,
  Files,
  AlignLeft,
  Image as ImageIcon,
  ClipboardCheck,
  Award
} from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type {
  CourseModule,
  CourseLesson,
  CurriculumLesson,
  LessonContent,
  LessonType,
} from '../../../types/curriculum.types';
import { SortableModuleCard } from '../components/curriculum/SortableModuleCard';
import { ModuleFormModal } from '../components/curriculum/ModuleFormModal';
import { AttachAssignmentModal } from '../components/curriculum/AttachAssignmentModal';
import { AttachQuizModal } from '../components/curriculum/AttachQuizModal';
import { AddLessonFlowModal } from '../components/curriculum/AddLessonFlowModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';
import { useCurriculumStore } from '../store/curriculum.store';
import { curriculumService } from '../services/curriculum.service';

export const CourseCurriculumPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const courseUuid = params.courseId || params.courseUuid;
  const autoAttachedUuid = searchParams.get('attachedUuid');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<{ code?: number; message: string } | null>(null);
  const fetchedCourseUuidRef = React.useRef<string | null>(null);

  const loadCurriculum = React.useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      await curriculumService.fetchModules(id);
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      const msg =
        status === 403
          ? 'Access Denied: You do not have permission to view curriculum for this course.'
          : status === 404
          ? 'Course or Modules not found.'
          : 'Failed to load course curriculum from backend. Please try again.';
      setFetchError({ code: status, message: msg });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (courseUuid && fetchedCourseUuidRef.current !== courseUuid) {
      fetchedCourseUuidRef.current = courseUuid;
      loadCurriculum(courseUuid);
    }
  }, [courseUuid, loadCurriculum]);

  // Stable Direct Store Subscriptions
  const allModules = useCurriculumStore((state) => state.modules);
  const allLessons = useCurriculumStore((state) => state.lessons);

  // Derived Stable Memoized Data
  const modules = useMemo(
    () => allModules.filter((m) => m.courseUuid === courseUuid).sort((a, b) => a.sortOrder - b.sortOrder),
    [allModules, courseUuid]
  );

  const lessonsByModule = useMemo(() => {
    const map: Record<string, CourseLesson[]> = {};
    allLessons.forEach((lesson) => {
      if (!map[lesson.moduleUuid]) {
        map[lesson.moduleUuid] = [];
      }
      map[lesson.moduleUuid].push(lesson);
    });
    Object.keys(map).forEach((modUuid) => {
      map[modUuid].sort((a, b) => a.sortOrder - b.sortOrder);
    });
    return map;
  }, [allLessons]);

  const lessonsCountByModule = useMemo(() => {
    const map: Record<string, number> = {};
    modules.forEach((mod) => {
      map[mod.uuid] = allLessons.filter((l) => l.moduleUuid === mod.uuid).length;
    });
    return map;
  }, [modules, allLessons]);

  // Search & Filter State
  const [searchQuery] = useState('');
  const [statusFilter] = useState<string>('all');
  const [typeFilter] = useState<string>('all');



  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const editingModule = null;

  // Lesson Type Selector Modal State
  const [isLessonTypeSelectorOpen, setIsLessonTypeSelectorOpen] = useState(false);

  // Attach Assignment & Quiz Modal State
  const [isAttachAssignmentOpen, setIsAttachAssignmentOpen] = useState(Boolean(autoAttachedUuid));
  const autoAttachedQuizUuid = searchParams.get('attachedQuizUuid');
  const [isAttachQuizOpen, setIsAttachQuizOpen] = useState(Boolean(autoAttachedQuizUuid));
  const [attachTargetLesson, setAttachTargetLesson] = useState<CourseLesson | null>(null);

  // Toast & Delete Modal State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteModalTarget, setDeleteModalTarget] = useState<{
    type: 'module' | 'lesson';
    moduleUuid: string;
    lessonUuid?: string;
    title: string;
    lessonCount?: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sensors for dnd-kit with touch support
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Modules List
  const filteredModules = modules.filter((mod) => {
    const q = searchQuery.toLowerCase().trim();
    const modLessons = lessonsByModule[mod.uuid] || [];

    if (statusFilter !== 'all' && mod.status !== statusFilter) return false;
    if (typeFilter !== 'all' && !modLessons.some((l) => l.type === typeFilter)) return false;

    if (!q) return true;
    const matchModTitle = mod.title.toLowerCase().includes(q);
    const matchLesson = modLessons.some((l) => l.title.toLowerCase().includes(q) || l.type.includes(q));
    return matchModTitle || matchLesson;
  });

  // MODULE SERVICE HANDLERS
  const handleOpenAddModuleModal = () => {
    setEditingModuleState(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModuleModal = (mod: CourseModule) => {
    setEditingModuleState(mod);
    setIsModuleModalOpen(true);
  };

  const [editingModuleState, setEditingModuleState] = useState<CourseModule | null>(null);

  const handleSaveModule = async (data: Partial<CourseModule>) => {
    if (editingModuleState) {
      await curriculumService.updateModule(editingModuleState.uuid, courseUuid, data);
      showToast('Section updated successfully.');
    } else {
      const created = await curriculumService.createModule(courseUuid, {
        title: data.title || 'Untitled Section',
        description: data.description || '',
        status: data.status || 'published',
        durationMinutes: 0,
        isCollapsed: false,
      });
      showToast('Section created successfully.');
      setTimeout(() => {
        const el = document.getElementById(`module-${created.uuid}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  const handleDuplicateModule = (moduleUuid: string) => {
    const duplicated = curriculumService.duplicateModule(moduleUuid);
    if (duplicated) {
      showToast('Module duplicated successfully.');
      setTimeout(() => {
        const el = document.getElementById(`module-${duplicated.uuid}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalTarget || !courseUuid || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (deleteModalTarget.type === 'module') {
        await curriculumService.deleteModule(deleteModalTarget.moduleUuid, courseUuid);
        showToast('Section removed from curriculum.');
      } else if (deleteModalTarget.lessonUuid) {
        await curriculumService.deleteLesson(deleteModalTarget.lessonUuid);
        showToast('Lesson deleted successfully.');
      }
      setDeleteModalTarget(null);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setDeleteError(err?.response?.data?.detail || 'Cannot delete section while lessons exist. Remove lessons first.');
      } else {
        setDeleteError(err?.response?.data?.message || err?.message || 'Failed to delete. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // LESSON SERVICE HANDLERS
  const handleOpenGeneralAddLesson = () => {
    const firstModule = modules[0];
    const targetUuid = firstModule ? firstModule.uuid : '';
    navigate(
      `/courses/${courseUuid}/curriculum/lessons/select-type${
        targetUuid ? `?moduleUuid=${targetUuid}` : ''
      }`
    );
  };

  const handleOpenLessonTypeSelector = (moduleUuid: string) => {
    navigate(
      `/courses/${courseUuid}/curriculum/lessons/select-type?moduleUuid=${moduleUuid}`
    );
  };

  const handleOpenAddResourcePage = (moduleUuid: string, lessonUuid?: string) => {
    if (!courseUuid || courseUuid === 'undefined' || !moduleUuid) {
      showToast('Cannot add resource: missing valid course or module identifier.');
      return;
    }
    navigate(
      `/courses/${courseUuid}/curriculum/resources/add?moduleUuid=${encodeURIComponent(moduleUuid)}${
        lessonUuid ? `&lessonUuid=${encodeURIComponent(lessonUuid)}` : ''
      }`
    );
  };

  const handleSelectTypeAndModule = (type: LessonType, moduleUuid: string) => {
    if (!moduleUuid) {
      showToast('Please select a module first before adding lessons.');
      return;
    }

    if (type === 'assignment' || type === 'project') {
      setIsLessonTypeSelectorOpen(false);
      setAttachTargetLesson(null);
      setIsAttachAssignmentOpen(true);
      return;
    }

    if (type === 'quiz') {
      setIsLessonTypeSelectorOpen(false);
      setAttachTargetLesson(null);
      setIsAttachQuizOpen(true);
      return;
    }

    if ((type as string) === 'live_class') {
      setIsLessonTypeSelectorOpen(false);
      showToast('Live session scheduling window opened.');
      return;
    }

    setIsLessonTypeSelectorOpen(false);
    navigate(`/courses/${courseUuid}/curriculum/lessons/new?type=${type}&moduleUuid=${moduleUuid}`);
  };

  const handleSelectLessonType = (type: LessonType) => {
    const targetModuleUuid = modules[0]?.uuid || '';
    handleSelectTypeAndModule(type, targetModuleUuid);
  };

  const handleDuplicateLesson = (_moduleUuid: string, lessonUuid: string) => {
    const duplicated = curriculumService.duplicateLesson(lessonUuid);
    if (duplicated) showToast('Lesson duplicated successfully.');
  };

  // DRAG & DROP HANDLER
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 1. Reorder Modules
    const activeModuleIdx = modules.findIndex((m) => m.uuid === activeId);
    const overModuleIdx = modules.findIndex((m) => m.uuid === overId);

    if (activeModuleIdx !== -1 && overModuleIdx !== -1 && activeModuleIdx !== overModuleIdx) {
      const updated = arrayMove(modules, activeModuleIdx, overModuleIdx);
      curriculumService.reorderModules(courseUuid, updated.map((m) => m.uuid));
      showToast('Modules reordered.');
      return;
    }

    // 2. Reorder Lessons (Intra & Inter module)
    let sourceModuleUuid = '';
    let targetModuleUuid = '';

    modules.forEach((mod) => {
      const modLessons = lessonsByModule[mod.uuid] || [];
      if (modLessons.some((l) => l.uuid === activeId)) sourceModuleUuid = mod.uuid;
      if (modLessons.some((l) => l.uuid === overId)) targetModuleUuid = mod.uuid;
    });

    if (sourceModuleUuid && targetModuleUuid) {
      const sourceLessons = (lessonsByModule[sourceModuleUuid] || []).map((l) => l.uuid);
      const targetLessons = (lessonsByModule[targetModuleUuid] || []).map((l) => l.uuid);

      if (sourceModuleUuid === targetModuleUuid) {
        const fromIdx = sourceLessons.indexOf(activeId);
        const toIdx = sourceLessons.indexOf(overId);
        const reordered = arrayMove(sourceLessons, fromIdx, toIdx);
        curriculumService.reorderLessons(sourceModuleUuid, reordered);
        showToast('Lessons reordered.');
      } else {
        const toIdx = targetLessons.indexOf(overId);
        curriculumService.moveLesson(activeId, targetModuleUuid, toIdx);
        showToast('Lesson moved successfully.');
      }
    }
  };

  const moduleUuids = filteredModules.map((m) => m.uuid);

  // 8 Supported Backend Lesson Type Options
  const lessonTypeOptions: { type: LessonType; label: string; description: string; icon: React.ElementType }[] = [
    { type: 'video', label: 'Video Lesson', description: 'Embed URL, YouTube, Vimeo, MP4 stream', icon: Video },
    { type: 'audio', label: 'Audio Podcast', description: 'Audio stream URL (MP3/WAV)', icon: Headphones },
    { type: 'document', label: 'Document / PDF', description: 'PDF iframe, DOCX, ZIP files', icon: Files },
    { type: 'image', label: 'Image Content', description: 'High resolution diagram, infographics & slides', icon: ImageIcon },
    { type: 'text', label: 'Text Article', description: 'Rich text lesson notes and reading materials', icon: AlignLeft },
    { type: 'quiz', label: 'Quiz Assessment', description: 'Interactive quiz with auto-grading rules', icon: CircleHelp },
    { type: 'assignment', label: 'Assignment', description: 'Student file upload & rubric evaluation', icon: ClipboardCheck },
    { type: 'project', label: 'Project Task', description: 'Hands-on practical capstone project', icon: Award },
  ];



  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-[calc(88px+env(safe-area-inset-bottom))] no-scrollbar">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}





      {/* 4. COURSE CURRICULUM SECTION HEADER */}
      <div className="flex flex-col min-[340px]:flex-row items-stretch min-[340px]:items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight leading-tight m-0">
            Course Curriculum
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-normal mt-0.5 mb-0">
            Organize your sections and lessons
          </p>
        </div>

        <Button
          size="sm"
          leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
          onClick={handleOpenAddModuleModal}
          className="bg-[var(--brand-primary)] hover:opacity-90 text-[var(--brand-primary-foreground)] font-bold px-3.5 h-10 sm:h-9 text-xs rounded-xl shrink-0 self-auto min-[340px]:self-center whitespace-nowrap"
        >
          Add Section
        </Button>
      </div>

      {/* 5. MAIN CURRICULUM WORKSPACE */}
      <div className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={moduleUuids} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-8 text-center bg-[var(--surface)] rounded-2xl border border-[var(--border)] space-y-3">
                  <div className="w-8 h-8 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">Loading course curriculum...</p>
                </div>
              ) : fetchError ? (
                <Card padding="md" className="p-8 text-center bg-[var(--surface)] rounded-[16px] border border-rose-500/20 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto font-bold text-base">
                    !
                  </div>
                  <p className="font-semibold text-[var(--text-primary)] text-sm">{fetchError.message}</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (courseUuid) loadCurriculum(courseUuid);
                    }}
                    className="bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] font-semibold mx-auto"
                  >
                    Retry Loading
                  </Button>
                </Card>
              ) : filteredModules.length === 0 ? (
                <EmptyState
                  icon={Layers}
                  title="No Modules Found"
                  description="Click &quot;Add Section&quot; to start creating your course curriculum."
                  actionLabel="Add Section"
                  onAction={handleOpenAddModuleModal}
                  actionIcon={<Plus className="w-4 h-4" />}
                />
              ) : (
                filteredModules.map((module, idx) => {
                  const moduleLessons = (lessonsByModule[module.uuid] || []).map((l, lIdx) => ({
                    ...l,
                    id: l.uuid || `lesson-temp-${lIdx}-${l.title}`,
                  }));

                  return (
                    <div key={module.uuid} className="space-y-2">
                      <SortableModuleCard
                        module={module}
                        lessons={moduleLessons}
                        moduleIndex={idx + 1}
                        onAddLesson={handleOpenLessonTypeSelector}
                        onSelectLesson={(lesson: CurriculumLesson) => {
                          const full = lessonsByModule[module.uuid]?.find((l) => l.uuid === lesson.id);
                          if (full) {
                            navigate(`/courses/${courseUuid}/curriculum/lessons/${full.uuid}/edit`);
                          }
                        }}
                        onDeleteLesson={(modUuid, lessonUuid) =>
                          setDeleteModalTarget({
                            type: 'lesson',
                            moduleUuid: modUuid,
                            lessonUuid,
                            title: 'Selected Lesson',
                          })
                        }
                        onDeleteModule={(modUuid) =>
                          setDeleteModalTarget({
                            type: 'module',
                            moduleUuid: modUuid,
                            title: module.title,
                            lessonCount: moduleLessons.length,
                          })
                        }
                        onDuplicateModule={handleDuplicateModule}
                        onEditModule={handleOpenEditModuleModal}
                        onDuplicateLesson={handleDuplicateLesson}
                        onAddResource={handleOpenAddResourcePage}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* 6. STICKY MOBILE BOTTOM ACTION BAR (<768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-3 flex items-center justify-between gap-2 shadow-xl pb-[calc(12px+env(safe-area-inset-bottom))]">
        <Button onClick={handleOpenAddModuleModal} className="h-[44px] text-xs font-semibold flex-1">
          + Module
        </Button>
        <Button onClick={handleOpenGeneralAddLesson} variant="secondary" className="h-[44px] text-xs font-semibold flex-1">
          + Lesson
        </Button>
        <Button onClick={() => showToast('Course preview opened.')} variant="outline" className="h-[44px] text-xs font-semibold border-[#E2E8F0]">
          Preview
        </Button>
      </div>

      {/* ADD / EDIT MODULE MODAL */}
      <ModuleFormModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSubmitModule={handleSaveModule}
        initialModule={editingModule}
      />

      {/* LESSON TYPE SELECTOR MODAL */}
      <Modal
        isOpen={isLessonTypeSelectorOpen}
        onClose={() => setIsLessonTypeSelectorOpen(false)}
        title="Select Lesson Type to Add"
      >
        <div className="space-y-4 text-xs text-left font-sans pb-2">
          <p className="text-[12px] text-[#64748B] font-medium">
            Choose a lesson format to configure content payload and unlock rules.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {lessonTypeOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={`type-opt-${opt.type}`}
                  type="button"
                  onClick={() => handleSelectLessonType(opt.type)}
                  className="p-3.5 bg-white hover:bg-blue-50/70 border border-[#E2E8F0] hover:border-[#2563EB] rounded-[14px] text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 group shadow-xs min-h-[105px]"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-[#2563EB] group-hover:border-[#2563EB] flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4 text-[#2563EB] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <strong className="font-semibold text-[#0F172A] text-[12px] group-hover:text-[#2563EB] block leading-snug transition-colors">
                      {opt.label}
                    </strong>
                    <p className="text-[10px] text-[#64748B] font-normal leading-normal mt-0.5 line-clamp-2">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deleteModalTarget)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalTarget(null);
            setDeleteError(null);
          }
        }}
        title={`Delete ${deleteModalTarget?.type === 'module' ? 'Module' : 'Lesson'}?`}
        maxWidth="sm"
      >
        <div className="flex flex-col gap-3 p-6 text-left font-sans text-xs">
          <p className="text-sm font-normal text-[var(--text-secondary,#64748B)] dark:text-[#94A3B8] leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-medium text-[var(--text-primary,#0F172A)] dark:text-[#F8FAFC]">
              "{deleteModalTarget?.title}"
            </span>
            ?
          </p>

          <p className="text-xs text-[#F87171] font-medium">
            This action cannot be undone.
          </p>

          {deleteModalTarget?.type === 'module' && (deleteModalTarget.lessonCount || 0) > 0 && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 font-medium text-xs">
              Warning: This module contains {deleteModalTarget.lessonCount} {deleteModalTarget.lessonCount === 1 ? 'lesson' : 'lessons'}. Deleting it will permanently remove all contained lessons.
            </div>
          )}

          {deleteError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 font-medium text-xs">
              {deleteError}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-[var(--border,#E2E8F0)] dark:border-[#263244] mt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setDeleteModalTarget(null);
                setDeleteError(null);
              }}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-medium text-sm bg-[var(--surface-secondary,#F1F5F9)] dark:bg-[#1E293B] border border-[var(--border,#E2E8F0)] dark:border-[#334155] text-[var(--text-secondary,#64748B)] dark:text-[#CBD5E1] hover:bg-[var(--surface-hover,#E2E8F0)] dark:hover:bg-[#334155] hover:text-[var(--text-primary,#0F172A)] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-medium text-sm bg-[#E11D48] hover:bg-[#BE123C] text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Confirm Delete</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ATTACH ASSIGNMENT MODAL */}
      <AttachAssignmentModal
        isOpen={isAttachAssignmentOpen}
        onClose={() => setIsAttachAssignmentOpen(false)}
        courseUuid={courseUuid}
        autoSelectUuid={autoAttachedUuid || undefined}
        currentlyAttachedUuid={attachTargetLesson?.content?.assignmentUuid || undefined}
        onSelectAssignment={(assignment) => {
          if (attachTargetLesson) {
            curriculumService.updateLesson(attachTargetLesson.uuid, {
              title: assignment.title,
              description: assignment.shortDescription,
              content: {
                assignmentUuid: assignment.id,
              } as LessonContent,
            });
            showToast(`Attached "${assignment.title}" to course curriculum.`);
          }
        }}
      />

      {/* ATTACH QUIZ MODAL */}
      <AttachQuizModal
        isOpen={isAttachQuizOpen}
        onClose={() => setIsAttachQuizOpen(false)}
        courseUuid={courseUuid}
        currentlyAttachedUuid={attachTargetLesson?.content?.quizUuid || undefined}
        onSelectQuiz={(quiz) => {
          if (attachTargetLesson) {
            curriculumService.updateLesson(attachTargetLesson.uuid, {
              title: quiz.title,
              description: quiz.shortDescription,
              content: {
                quizUuid: quiz.id,
              } as LessonContent,
            });
            showToast(`Attached "${quiz.title}" to lesson.`);
          } else {
            showToast(`Attached "${quiz.title}" to course curriculum.`);
          }
        }}
      />

      {/* ADD / EDIT SECTION MODAL */}
      <ModuleFormModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSubmitModule={handleSaveModule}
        initialModule={editingModuleState}
      />

      {/* ADD LESSON FLOW MODAL */}
      <AddLessonFlowModal
        isOpen={isLessonTypeSelectorOpen}
        onClose={() => setIsLessonTypeSelectorOpen(false)}
        modules={modules}
        lessonsCountByModule={lessonsCountByModule}
        preselectedModuleUuid={modules[0]?.uuid || null}
        onSelectTypeAndModule={handleSelectTypeAndModule}
        onCreateModule={handleOpenAddModuleModal}
        courseUuid={courseUuid}
      />
    </div>
  );
};
