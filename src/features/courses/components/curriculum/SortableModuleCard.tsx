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
  Lock,
  MoreVertical,
} from 'lucide-react';
import type { CurriculumLesson, CourseModule } from '../../../../types/curriculum.types';
import { SortableLessonItem } from './SortableLessonItem';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';

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
  onAddSubsection?: (lessonUuid: string) => void;
  onEditSubsection?: (lessonUuid: string, subsection: Record<string, unknown>) => void;
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
  onAddSubsection,
  onEditSubsection,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.uuid,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lessonIds = lessons.map((l) => l.id);
  const totalDuration = lessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) || module.durationMinutes;

  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;
  const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

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

  const getUnlockRuleLabel = (rule: string) => {
    switch (rule) {
      case 'previous_module':
        return 'Previous Module Required';
      case 'specific_date':
        return `Date: ${module.unlockDate || 'Scheduled'}`;
      case 'days_after_enrollment':
        return `Enrollment +${module.unlockAfterDays || 1} Days`;
      case 'manual':
        return 'Manual Unlock';
      case 'immediate':
      default:
        return 'Unlocked';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`module-${module.uuid}`}
      className={`bg-white rounded-[18px] border text-left overflow-hidden transition-all duration-200 shadow-xs font-sans ${
        isDragging
          ? 'opacity-50 border-[#2563EB] shadow-xl scale-[1.01]'
          : 'border-[#E2E8F0] hover:border-slate-300'
      }`}
    >
      {/* Module Header Bar */}
      <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] space-y-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Drag Handle, Number Badge & Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 rounded-lg cursor-grab active:cursor-grabbing touch-none shrink-0"
              title="Drag to reorder module"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-2xs">
              {moduleIndex}
            </div>

            <h3 className="text-base font-semibold text-[#0F172A] tracking-tight truncate">
              {module.title}
            </h3>
          </div>

          {/* Right: Status & Action Icons */}
          <div className="flex items-center gap-2 shrink-0">
            {getStatusBadge(module.status)}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 rounded-lg transition-transform cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#2563EB]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(true)}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="More Module Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Meta Strip Below Header */}
        <div className="flex items-center gap-3 text-[13px] font-normal text-[#64748B] pl-9 flex-wrap">
          <span>{lessons.length} Lessons</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" /> {durationFormatted}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[#2563EB] font-medium">
            <Lock className="w-3.5 h-3.5" /> {getUnlockRuleLabel(module.unlockRule)}
          </span>
        </div>
      </div>

      {/* Module Expanded Lessons Container */}
      {isExpanded && (
        <div className="p-4 bg-white space-y-3">
          {lessons.length === 0 ? (
            <div className="p-5 text-center bg-[#F8FAFC] rounded-[14px] border border-dashed border-[#E2E8F0] space-y-2">
              <p className="text-xs font-semibold text-[#0F172A]">No lessons in this module yet.</p>
              <p className="text-[11px] text-[#64748B]">Add a video, document, quiz, assignment, or other lesson type.</p>
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
                    key={lesson.id}
                    lesson={lesson}
                    lessonIndex={`${moduleIndex}.${idx + 1}`}
                    onSelectLesson={(lesson: CurriculumLesson) => onSelectLesson(lesson)}
                    onDeleteLesson={(lessonId) => onDeleteLesson(module.uuid, lessonId)}
                    onDuplicateLesson={(lessonId) => onDuplicateLesson && onDuplicateLesson(module.uuid, lessonId)}
                    onPreviewLesson={(lesson: CurriculumLesson) => onSelectLesson(lesson)}
                    onAddSubsection={onAddSubsection}
                    onEditSubsection={onEditSubsection}
                  />
                ))}
              </SortableContext>

              {/* Primary Add Lesson Button at Bottom of Module */}
              <button
                type="button"
                onClick={() => onAddLesson(module.uuid)}
                className="w-full h-[44px] bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-blue-50/40 text-[#2563EB] font-semibold text-xs rounded-[12px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs mt-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Lesson</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* MORE MODULE ACTIONS BOTTOM SHEET / MODAL */}
      <Modal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title={`Module Options: ${module.title}`}
      >
        <div className="space-y-2 text-xs font-sans text-left">
          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              onEditModule(module);
            }}
            className="w-full p-3 rounded-xl hover:bg-slate-100 flex items-center gap-3 font-semibold text-[#0F172A] cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-[#2563EB]" /> Edit Module Settings
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              onDuplicateModule(module.uuid);
            }}
            className="w-full p-3 rounded-xl hover:bg-slate-100 flex items-center gap-3 font-semibold text-[#0F172A] cursor-pointer"
          >
            <Copy className="w-4 h-4 text-[#2563EB]" /> Duplicate Module
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              onDeleteModule(module.uuid);
            }}
            className="w-full p-3 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-3 font-semibold cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" /> Delete Module
          </button>
        </div>
      </Modal>
    </div>
  );
};
