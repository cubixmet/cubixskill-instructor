import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  GripVertical,
  ChevronDown,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Clock,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import type { CurriculumLesson, CourseModule } from '../../../../types/curriculum.types';
import { SortableLessonItem } from './SortableLessonItem';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';

interface SortableModuleCardProps {
  module: CourseModule;
  lessons: CurriculumLesson[];
  moduleIndex?: number;
  onToggleCollapse?: (moduleUuid: string) => void;
  onAddLesson: (moduleUuid: string) => void;
  onSelectLesson: (lesson: CurriculumLesson) => void;
  onDeleteLesson: (moduleUuid: string, lessonUuid: string) => void;
  onDeleteModule: (moduleUuid: string) => void;
  onDuplicateModule: (moduleUuid: string) => void;
  onEditModule: (module: CourseModule) => void;
  onTogglePublishModule?: (moduleUuid: string, currentStatus: string) => void;
  onDuplicateLesson?: (moduleUuid: string, lessonUuid: string) => void;
  onAddResource?: (moduleUuid: string, lessonUuid?: string) => void;
}

export const SortableModuleCard: React.FC<SortableModuleCardProps> = ({
  module,
  lessons = [],
  moduleIndex = 1,
  onToggleCollapse: _onToggleCollapse,
  onAddLesson,
  onSelectLesson,
  onDeleteLesson,
  onDeleteModule,
  onDuplicateModule,
  onEditModule,
  onTogglePublishModule: _onTogglePublishModule,
  onDuplicateLesson,
  onAddResource,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.uuid,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lessonIds = lessons.map((l) => l.id);
  const totalDuration = lessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;
  const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success" dot>Published</Badge>;
      case 'scheduled':
        return <Badge variant="warning" dot>Scheduled</Badge>;
      case 'draft':
      default:
        return <Badge variant="secondary" dot>Draft</Badge>;
    }
  };

  const handleConfirmDelete = () => {
    setIsDeleteConfirmOpen(false);
    onDeleteModule(module.uuid);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`module-${module.uuid}`}
      className={`bg-white dark:bg-[#111827] rounded-[18px] border text-left overflow-hidden transition-all duration-200 shadow-xs font-sans ${
        isDragging
          ? 'opacity-50 border-[#2563EB] shadow-xl scale-[1.01]'
          : 'border-slate-200 dark:border-[#263244] hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Module Header Bar: Single Standard Content Card */}
      <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-[#172033] border-b border-slate-200 dark:border-[#263244] space-y-2.5 w-full min-w-0">
        {/* 1. TOP UTILITY ROW: Drag Handle, Module Index | Expand Icon, Three-dot Menu */}
        <div className="flex items-center justify-between gap-2 w-full min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="p-1 text-slate-400 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#60A5FA] hover:bg-slate-200/60 dark:hover:bg-[#1E293B] rounded-lg cursor-grab active:cursor-grabbing touch-none shrink-0"
              title="Drag to reorder module"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {moduleIndex}
            </div>
          </div>

          {/* Right Controls: Expand & Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1E293B] rounded-lg transition-transform cursor-pointer"
              title={isExpanded ? 'Collapse Module' : 'Expand Module'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#2563EB] dark:text-[#60A5FA]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(true)}
              className="p-1.5 text-slate-400 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
              title="More Module Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. DEDICATED FULL-WIDTH MODULE TITLE & DESCRIPTION */}
        <div className="w-full space-y-0.5">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-snug break-words whitespace-normal font-sans w-full">
            {module.title}
          </h3>
          {module.description && (
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] break-words whitespace-normal font-normal">
              {module.description}
            </p>
          )}
        </div>

        {/* 3. METADATA & PUBLISHED STATUS ROW */}
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#94A3B8] flex-wrap pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span>{lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" /> {durationFormatted}
            </span>
          </div>

          <div>
            {getStatusBadge(module.status || 'published')}
          </div>
        </div>
      </div>

      {/* Module Expanded Lessons Container */}
      {isExpanded && (
        <div className="p-3 sm:p-4 bg-white dark:bg-[#111827] space-y-3">
          {lessons.length === 0 ? (
            <div className="p-5 text-center bg-slate-50 dark:bg-[#0F172A] rounded-[14px] border border-dashed border-slate-200 dark:border-[#263244] space-y-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">No lessons in this module yet.</p>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Add a video, document, quiz, assignment, or other lesson type.</p>
              <button
                type="button"
                onClick={() => onAddLesson(module.uuid)}
                className="h-[44px] px-4 bg-[#2563EB] text-white font-semibold text-xs rounded-[12px] hover:bg-[#1D4ED8] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add First Lesson
              </button>
            </div>
          ) : (
            <>
              <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
                {lessons.map((lesson, idx) => (
                  <SortableLessonItem
                    key={lesson.id || lesson.uuid || `lesson-${module.uuid}-${idx}`}
                    lesson={lesson}
                    lessonIndex={`${moduleIndex}.${idx + 1}`}
                    onSelectLesson={(lesson: CurriculumLesson) => onSelectLesson(lesson)}
                    onDeleteLesson={(lessonId) => onDeleteLesson(module.uuid, lessonId)}
                    onDuplicateLesson={(lessonId) => onDuplicateLesson && onDuplicateLesson(module.uuid, lessonId)}
                    onAddResource={(lessonId) => onAddResource && onAddResource(module.uuid, lessonId)}
                  />
                ))}
              </SortableContext>

              {/* Primary Add Lesson Button at Bottom of Module */}
              <button
                type="button"
                onClick={() => onAddLesson(module.uuid)}
                className="w-full min-h-[42px] h-[44px] bg-white dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:bg-blue-50/40 dark:hover:bg-[#1E293B] text-[#2563EB] dark:text-[#F8FAFC] font-semibold text-xs rounded-[12px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs dark:shadow-[0_3px_10px_rgba(37,99,235,0.06)] mt-2"
              >
                <Plus className="w-4 h-4 stroke-[3] text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Add Lesson</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* MORE MODULE ACTIONS MODAL */}
      <Modal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title={`Module Options: ${module.title}`}
        maxWidth="sm"
      >
        <div className="flex flex-col gap-1 text-left font-sans py-1">
          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              onEditModule(module);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 min-h-[42px] text-left text-sm font-medium text-[#334155] dark:text-[#CBD5E1] hover:bg-slate-100/80 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#3B82F6]"
          >
            <Edit3 className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
            <span>Edit Module Settings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              onDuplicateModule(module.uuid);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 min-h-[42px] text-left text-sm font-medium text-[#334155] dark:text-[#CBD5E1] hover:bg-slate-100/80 dark:hover:bg-[#172033] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#3B82F6]"
          >
            <Copy className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
            <span>Duplicate Module</span>
          </button>

          <div className="my-1 border-t border-[#E2E8F0] dark:border-[#263244]" />

          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              setIsDeleteConfirmOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 min-h-[42px] text-left text-sm font-medium text-rose-600 dark:text-[#F87171] hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-[#FCA5A5] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <Trash2 className="w-4 h-4 text-current shrink-0" />
            <span>Delete Module</span>
          </button>
        </div>
      </Modal>

      {/* SAFE DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteConfirmOpen(false);
            setDeleteError(null);
          }
        }}
        title="Delete Module?"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-3 p-6 text-left font-sans text-xs">
          <p className="text-sm font-normal text-[var(--text-secondary,#64748B)] dark:text-[#94A3B8] leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-medium text-[var(--text-primary,#0F172A)] dark:text-[#F8FAFC]">
              "{module.title}"
            </span>
            ?
          </p>

          <p className="text-xs text-[#F87171] font-medium">
            This action cannot be undone.
          </p>

          {lessons.length > 0 && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 font-medium text-xs">
              Warning: This module contains {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}. Deleting it will permanently remove all contained lessons.
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
                setIsDeleteConfirmOpen(false);
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
    </div>
  );
};
