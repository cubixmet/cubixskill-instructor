import React, { useState, useMemo } from 'react';
import type {
  DragEndEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
  Search,
  ArrowLeft,
  Check,
  X,
  Video,
  FileText,
  Radio,
  Layers,
  Eye,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Headphones,
  Files,
  AlignLeft,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Code2,
  ClipboardCheck,
} from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type {
  CourseModule,
  CourseLesson,
  CourseLessonSubsection,
  CurriculumLesson,
  LessonContent,
  LessonType,
} from '../../../types/curriculum.types';
import { SortableModuleCard } from '../components/curriculum/SortableModuleCard';
import { ModuleFormModal } from '../components/curriculum/ModuleFormModal';
import { LessonFormDrawer } from '../components/curriculum/LessonFormDrawer';
import { AttachAssignmentModal } from '../components/curriculum/AttachAssignmentModal';
import { AttachQuizModal } from '../components/curriculum/AttachQuizModal';
import { CurriculumOverviewWidget } from '../components/curriculum/CurriculumOverviewWidget';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';
import { useCurriculumStore } from '../store/curriculum.store';
import { curriculumService } from '../services/curriculum.service';

export const CourseCurriculumPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoAttachedUuid = searchParams.get('attachedUuid');
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();

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

  const courseModuleUuids = useMemo(() => modules.map((m) => m.uuid), [modules]);

  const courseLessons = useMemo(
    () => allLessons.filter((l) => courseModuleUuids.includes(l.moduleUuid)),
    [allLessons, courseModuleUuids]
  );

  const totalLessonCount = courseLessons.length;
  const totalCourseDuration = courseLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const publishedLessonCount = courseLessons.filter((l) => l.status === 'published').length;
  const draftLessonCount = courseLessons.filter((l) => l.status === 'draft').length;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter] = useState<string>('all');
  const [typeFilter] = useState<string>('all');
  const [isAllCollapsed, setIsAllCollapsed] = useState(false);

  // Active Lesson Config Drawer State
  const [activeLessonConfig, setActiveLessonConfig] = useState<CourseLesson | null>(null);
  const [activeSubsectionTarget, setActiveSubsectionTarget] = useState<{
    lessonUuid: string;
    subsection?: CourseLessonSubsection | null;
  } | null>(null);

  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);

  // Lesson Type Selector Modal State
  const [isLessonTypeSelectorOpen, setIsLessonTypeSelectorOpen] = useState(false);
  const [targetModuleForLesson, setTargetModuleForLesson] = useState<string | null>(null);

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

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModuleModal = (mod: CourseModule) => {
    setEditingModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = (data: Partial<CourseModule>) => {
    if (editingModule) {
      curriculumService.updateModule(editingModule.uuid, data);
      showToast('Module updated successfully.');
    } else {
      const created = curriculumService.createModule(courseUuid, data);
      showToast('Module created successfully.');
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

  const handleConfirmDelete = () => {
    if (!deleteModalTarget) return;
    if (deleteModalTarget.type === 'module') {
      curriculumService.deleteModule(deleteModalTarget.moduleUuid);
      showToast('Module and its lessons deleted.');
    } else if (deleteModalTarget.lessonUuid) {
      curriculumService.deleteLesson(deleteModalTarget.lessonUuid);
      showToast('Lesson deleted successfully.');
    }
    setDeleteModalTarget(null);
  };

  // LESSON SERVICE HANDLERS
  const handleOpenLessonTypeSelector = (moduleUuid: string) => {
    setTargetModuleForLesson(moduleUuid);
    setIsLessonTypeSelectorOpen(true);
  };

  const handleSelectLessonType = (type: LessonType) => {
    const targetMod = targetModuleForLesson || modules[0]?.uuid;
    if (!targetMod) {
      showToast('Please create a module first before adding lessons.');
      return;
    }

    if (type === 'assignment') {
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

    const typeLabel = type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    const createdLesson = curriculumService.createLesson(courseUuid, targetMod, {
      title: `New ${typeLabel} Lesson`,
      description: `Description for ${typeLabel}...`,
      type,
      status: 'draft',
      durationMinutes: 10,
      isDemo: false,
      unlockRule: 'immediate',
      content: { videoSource: 'upload', allowDownload: true },
    });

    setIsLessonTypeSelectorOpen(false);
    setActiveLessonConfig(createdLesson);
    showToast('Lesson created successfully.');
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

  // 12 Distinct & Unique Lesson Type Options with specific Lucide Icons
  const lessonTypeOptions: { type: LessonType; label: string; description: string; icon: React.ElementType }[] = [
    { type: 'video', label: 'Video Lesson', description: 'Direct upload, HLS streaming, YouTube, Vimeo', icon: Video },
    { type: 'audio', label: 'Audio Podcast', description: 'MP3/WAV audio stream with transcript', icon: Headphones },
    { type: 'pdf', label: 'PDF Reader', description: 'Embedded PDF viewer with download options', icon: FileText },
    { type: 'document', label: 'Rich Document', description: 'DOCX, PPTX, XLSX, HTML articles', icon: Files },
    { type: 'text', label: 'Text Article', description: 'Short text notes and reading materials', icon: AlignLeft },
    { type: 'image', label: 'Image Gallery', description: 'High resolution infographics & slides', icon: ImageIcon },
    { type: 'download', label: 'Downloadable Asset', description: 'ZIP, source code, worksheets, templates', icon: Download },
    { type: 'external_url', label: 'External Resource', description: 'External URL or GitHub repository', icon: ExternalLink },
    { type: 'embed', label: 'Embedded Widget', description: 'iFrame, Figma prototype, CodeSandbox', icon: Code2 },
    { type: 'quiz', label: 'Quiz Assessment', description: 'Interactive quiz with auto-grading rules', icon: CircleHelp },
    { type: 'assignment', label: 'Assignment Project', description: 'Student file upload & rubric evaluation', icon: ClipboardCheck },
    { type: 'live_class', label: 'Live Stream Class', description: 'Zoom, Google Meet, or live webinar link', icon: Radio },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-[calc(88px+env(safe-area-inset-bottom))] no-scrollbar">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. STICKY MOBILE HEADER (<768px) */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-[#E2E8F0] p-3 shadow-2xs -mx-3 sm:-mx-6 -mt-3 sm:-mt-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="flex items-center gap-1.5 text-[#0F172A] text-sm font-semibold p-1"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
            <span>Curriculum</span>
          </button>

          <Badge variant="success" size="sm" dot>Published</Badge>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0] mt-2 font-medium">
          <span>{modules.length} Modules • {totalLessonCount} Lessons</span>
          <span>{Math.floor(totalCourseDuration / 60)}h {totalCourseDuration % 60}m Total</span>
        </div>
      </div>

      {/* 2. DESKTOP HEADER CARD (>=768px) */}
      <div className="hidden md:block bg-white p-5 sm:p-6 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              Course Curriculum
            </h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Structure modules, drag lessons to reorder, and configure unlock prerequisites.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#64748B] font-medium mt-2 flex-wrap">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[#0F172A] border border-[#E2E8F0]">
                {modules.length} Modules
              </span>
              <span>•</span>
              <span className="px-2.5 py-1 bg-blue-50 text-[#2563EB] rounded-lg border border-blue-100 font-semibold">
                {totalLessonCount} Lessons
              </span>
              <span>•</span>
              <span className="px-2.5 py-1 bg-slate-100 text-[#0F172A] rounded-lg border border-[#E2E8F0]">
                {Math.floor(totalCourseDuration / 60)}h {totalCourseDuration % 60}m Total
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAllCollapsed(!isAllCollapsed)}
              leftIcon={isAllCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            >
              {isAllCollapsed ? 'Expand All' : 'Collapse All'}
            </Button>

            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
              onClick={handleOpenAddModuleModal}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-4"
            >
              Add Module
            </Button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE SUMMARY CARD (<768px 2-COLUMN GRID) */}
      <Card padding="md" className="md:hidden bg-white border border-[#E2E8F0] p-4 rounded-[16px] shadow-2xs space-y-3">
        <strong className="text-[13px] font-semibold text-[#0F172A] block">Curriculum Summary</strong>
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-medium">
          <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">Modules</span>
            <strong className="text-[16px] font-bold text-[#0F172A]">{modules.length}</strong>
          </div>
          <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">Total Lessons</span>
            <strong className="text-[16px] font-bold text-[#2563EB]">{totalLessonCount}</strong>
          </div>
          <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">Published</span>
            <strong className="text-[16px] font-bold text-emerald-600">{publishedLessonCount}</strong>
          </div>
          <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px]">Drafts</span>
            <strong className="text-[16px] font-bold text-[#64748B]">{draftLessonCount}</strong>
          </div>
        </div>
      </Card>

      {/* 4. SEARCH BAR & QUICK ACTIONS */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules, lessons, or subsections..."
            className="w-full h-[46px] pl-10 pr-10 bg-white border border-[#E2E8F0] rounded-[14px] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Quick Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
          <Button onClick={handleOpenAddModuleModal} leftIcon={<Plus className="w-4 h-4 stroke-[3]" />} className="h-[46px] w-full text-xs">
            Add Module
          </Button>
          <Button onClick={() => setIsLessonTypeSelectorOpen(true)} variant="secondary" leftIcon={<Plus className="w-4 h-4 stroke-[3]" />} className="h-[46px] w-full text-xs">
            Add Lesson
          </Button>
          <Button onClick={() => setIsAllCollapsed(!isAllCollapsed)} variant="outline" className="h-[46px] w-full text-xs">
            {isAllCollapsed ? 'Expand All' : 'Collapse All'}
          </Button>
          <Button onClick={() => showToast('Course preview opened.')} variant="ghost" leftIcon={<Eye className="w-4 h-4" />} className="h-[46px] w-full text-xs">
            Preview
          </Button>
        </div>
      </div>

      {/* 5. MAIN CURRICULUM WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={moduleUuids} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {filteredModules.length === 0 ? (
                  <Card padding="md" className="p-8 text-center bg-white rounded-[16px] border border-[#E2E8F0] space-y-3">
                    <Layers className="w-10 h-10 mx-auto text-[#64748B]" />
                    <p className="font-semibold text-[#0F172A] text-sm">No Modules Found</p>
                    <p className="text-xs text-[#64748B]">Click "Add Module" to start creating your course curriculum.</p>
                    <Button size="sm" onClick={handleOpenAddModuleModal} className="bg-[#2563EB] text-white font-semibold mx-auto">
                      <Plus className="w-4 h-4 stroke-[3]" /> Add Module
                    </Button>
                  </Card>
                ) : (
                  filteredModules.map((module, idx) => {
                    const moduleLessons = (lessonsByModule[module.uuid] || []).map((l) => ({
                      ...l,
                      id: l.uuid,
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
                            if (full) setActiveLessonConfig(full);
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
                          onAddSubsection={(lessonUuid) => {
                            setActiveSubsectionTarget({ lessonUuid, subsection: null });
                          }}
                          onEditSubsection={(lessonUuid, sub) => {
                            setActiveSubsectionTarget({ lessonUuid, subsection: sub });
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Desktop Sidebar Overview */}
        <div className="hidden xl:block xl:col-span-4 2xl:col-span-3 sticky top-4">
          <CurriculumOverviewWidget
            moduleCount={modules.length}
            totalLessonCount={Object.values(lessonsByModule).flat().length}
            totalDurationMinutes={120}
            publishedCount={modules.filter((m) => m.status === 'published').length}
            draftCount={modules.filter((m) => m.status === 'draft').length}
            onAddModule={handleOpenAddModuleModal}
            onAddLesson={() => handleOpenLessonTypeSelector(modules[0]?.uuid || 'temp')}
            onSaveDraft={() => showToast('Draft saved.')}
            onPreviewCourse={() => showToast('Previewing course.')}
            onExpandAll={() => showToast('Expanded all.')}
            onCollapseAll={() => showToast('Collapsed all.')}
          />
        </div>
      </div>

      {/* 6. STICKY MOBILE BOTTOM ACTION BAR (<768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-3 flex items-center justify-between gap-2 shadow-xl pb-[calc(12px+env(safe-area-inset-bottom))]">
        <Button onClick={handleOpenAddModuleModal} className="h-[44px] text-xs font-semibold flex-1">
          + Module
        </Button>
        <Button onClick={() => setIsLessonTypeSelectorOpen(true)} variant="secondary" className="h-[44px] text-xs font-semibold flex-1">
          + Lesson
        </Button>
        <Button onClick={() => showToast('Course preview opened.')} variant="outline" className="h-[44px] text-xs font-semibold border-[#E2E8F0]">
          Preview
        </Button>
      </div>

      {/* Lesson & Subsection Configuration Drawer */}
      <LessonFormDrawer
        isOpen={Boolean(activeLessonConfig || activeSubsectionTarget)}
        onClose={() => {
          setActiveLessonConfig(null);
          setActiveSubsectionTarget(null);
        }}
        onSubmitLesson={(data) => {
          if (activeSubsectionTarget) {
            if (activeSubsectionTarget.subsection) {
              curriculumService.updateSubsection(
                activeSubsectionTarget.lessonUuid,
                activeSubsectionTarget.subsection.uuid,
                data
              );
              showToast('Subsection updated successfully.');
            } else {
              curriculumService.addSubsection(activeSubsectionTarget.lessonUuid, data);
              showToast('Subsection added successfully.');
            }
            setActiveSubsectionTarget(null);
          } else if (activeLessonConfig) {
            curriculumService.updateLesson(activeLessonConfig.uuid, data);
            showToast('Lesson updated successfully.');
            setActiveLessonConfig(null);
          }
        }}
        initialLesson={activeSubsectionTarget?.subsection || activeLessonConfig || undefined}
      />

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
                  key={opt.type}
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
        onClose={() => setDeleteModalTarget(null)}
        title={`Delete ${deleteModalTarget?.type === 'module' ? 'Module' : 'Lesson'}?`}
      >
        <div className="space-y-4 text-xs text-left font-sans">
          <p className="text-[#64748B] font-normal">
            Are you sure you want to delete <strong className="text-[#0F172A]">{deleteModalTarget?.title}</strong>?
          </p>

          {deleteModalTarget?.type === 'module' && (deleteModalTarget.lessonCount || 0) > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-medium">
              ⚠️ Warning: This module contains {deleteModalTarget.lessonCount} lessons. Deleting the module will also permanently remove all inner lessons.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setDeleteModalTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Confirm Delete
            </Button>
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
    </div>
  );
};
