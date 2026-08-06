import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Video,
  FileText,
  Headphones,
  Download,
  ExternalLink,
  Radio,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Clock,
  ChevronDown,
  Plus,
  Files,
  AlignLeft,
  Image as ImageIcon,
  Code2,
  CircleHelp,
  ClipboardCheck,
  MoreHorizontal,
  Folder,
} from 'lucide-react';
import type { CourseLesson, CourseLessonSubsection, LessonType } from '../../../../types/curriculum.types';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { useCurriculumStore } from '../../store/curriculum.store';

interface SortableLessonItemProps {
  lesson: CourseLesson;
  lessonIndex?: string;
  onSelectLesson: (lesson: CourseLesson) => void;
  onDeleteLesson: (lessonUuid: string) => void;
  onDuplicateLesson?: (lessonUuid: string) => void;
  onPreviewLesson?: (lesson: CourseLesson) => void;
  onAddSubsection?: (lessonUuid: string) => void;
  onEditSubsection?: (lessonUuid: string, subsection: CourseLessonSubsection) => void;
}

export const SortableLessonItem: React.FC<SortableLessonItemProps> = ({
  lesson,
  lessonIndex = '1.3',
  onSelectLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onPreviewLesson,
  onAddSubsection,
  onEditSubsection,
}) => {
  const [isSubsectionsExpanded, setIsSubsectionsExpanded] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const deleteSubsection = useCurriculumStore((state) => state.deleteSubsection);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const subsections = lesson.subsections || [];

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'pdf':
        return <FileText className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'quiz':
        return <CircleHelp className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'assignment':
        return <ClipboardCheck className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'audio':
        return <Headphones className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'download':
        return <Download className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'external_url':
        return <ExternalLink className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'live_class':
        return <Radio className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'text':
        return <AlignLeft className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'image':
        return <ImageIcon className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'document':
        return <Files className="w-4.5 h-4.5 text-[#2563EB]" />;
      case 'embed':
        return <Code2 className="w-4.5 h-4.5 text-[#2563EB]" />;
      default:
        return <FileText className="w-4.5 h-4.5 text-[#2563EB]" />;
    }
  };

  const isLocked = lesson.unlockRule && lesson.unlockRule !== 'immediate';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-[16px] border text-left font-sans transition-all duration-150 overflow-hidden ${
        isDragging
          ? 'opacity-40 border-[#2563EB] shadow-lg scale-[1.01]'
          : 'border-[#E2E8F0] hover:border-blue-200 shadow-2xs'
      }`}
    >
      {/* 1. Header Layout: Left (Drag, Number, Icon), Center (Title), Right (Badge, More •••) */}
      <div className="p-3.5 bg-white space-y-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Drag Handle, Number, Icon */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg cursor-grab active:cursor-grabbing touch-none shrink-0"
              title="Drag to reorder lesson"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-[#2563EB] shrink-0 font-mono">
              {lessonIndex}
            </span>

            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              {getLessonIcon(lesson.type)}
            </div>

            {/* Center: Lesson Title */}
            <h4 className="text-[15px] font-semibold text-[#0F172A] leading-tight truncate">
              {lesson.title}
            </h4>
          </div>

          {/* Right: Status Badge & More Menu (•••) */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={lesson.status === 'published' ? 'success' : 'secondary'} size="sm" dot className="h-6 rounded-full">
              {lesson.status === 'published' ? 'Published' : 'Draft'}
            </Badge>

            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(true)}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="More Options"
            >
              <MoreHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* 2. Lesson Content Metadata Row */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] pl-[84px] flex-wrap">
          <span className="capitalize text-[13px] font-medium text-[#0F172A]">
            {lesson.type.replace('_', ' ')}
          </span>
          <span>•</span>
          {lesson.type === 'assignment' && (
            <>
              <span className="px-2.5 py-0.5 bg-blue-50 text-[#2563EB] border border-blue-100 rounded-md font-semibold text-[11px]">
                Assignment: {lesson.title}
              </span>
              <span>•</span>
              <span className="text-xs font-semibold text-[#0F172A]">100 Marks</span>
              <span>•</span>
              <span className="text-xs font-medium text-[#64748B]">File + URL</span>
              <span>•</span>
            </>
          )}
          <span className="flex items-center gap-1 text-[12px]">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" /> {lesson.durationMinutes} mins
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[12px]">
            {isLocked ? (
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <Lock className="w-3.5 h-3.5" /> Locked
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#2563EB] font-semibold">
                <Unlock className="w-3.5 h-3.5" /> Unlocked
              </span>
            )}
          </span>
        </div>
      </div>

      {/* 3. Subsection Strip Bar */}
      <div className="px-3.5 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsSubsectionsExpanded(!isSubsectionsExpanded)}
          className="text-xs font-semibold text-[#2563EB] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSubsectionsExpanded ? 'rotate-180' : ''}`} />
          <span>{subsections.length > 0 ? `▼ Subsections (${subsections.length})` : '▼ Subsections'}</span>
        </button>

        {onAddSubsection && (
          <button
            type="button"
            onClick={() => onAddSubsection(lesson.uuid)}
            className="h-[40px] px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-[12px] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Subsection</span>
          </button>
        )}
      </div>

      {/* 4. Compact Empty or Nested Subsections Accordion Content */}
      {isSubsectionsExpanded && (
        <div className="p-3 bg-[#F8FAFC] space-y-2 border-t border-[#E2E8F0]">
          {subsections.length === 0 ? (
            <div className="max-h-[90px] p-3 text-center bg-white rounded-xl border border-dashed border-[#E2E8F0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-left">
                <Folder className="w-5 h-5 text-[#2563EB] shrink-0" />
                <div>
                  <strong className="text-xs font-semibold text-[#0F172A] block leading-tight">No subsections yet</strong>
                  <span className="text-[11px] text-[#64748B]">Break this lesson into smaller units.</span>
                </div>
              </div>

              {onAddSubsection && (
                <button
                  type="button"
                  onClick={() => onAddSubsection(lesson.uuid)}
                  className="h-[36px] px-3 bg-[#2563EB] text-white font-semibold text-xs rounded-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add
                </button>
              )}
            </div>
          ) : (
            subsections.map((sub, idx) => (
              <div
                key={sub.uuid}
                className="p-2.5 bg-white rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs ml-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-[#2563EB] font-mono">
                    {lessonIndex}.{idx + 1}
                  </span>
                  <strong className="font-semibold text-[#0F172A] truncate">{sub.title}</strong>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={sub.status === 'published' ? 'success' : 'secondary'} size="sm">
                    {sub.status}
                  </Badge>

                  {onEditSubsection && (
                    <button
                      type="button"
                      onClick={() => onEditSubsection(lesson.uuid, sub)}
                      className="p-1 text-[#64748B] hover:text-[#2563EB] rounded cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteSubsection(lesson.uuid, sub.uuid)}
                    className="p-1 text-[#64748B] hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. Single More Menu (•••) Options Modal */}
      <Modal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title={`Lesson Options: ${lesson.title}`}
      >
        <div className="space-y-2 text-xs font-sans text-left">
          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              onSelectLesson(lesson);
            }}
            className="w-full p-3 rounded-xl hover:bg-slate-100 flex items-center gap-3 font-semibold text-[#0F172A] cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-[#2563EB]" /> Edit Lesson
          </button>

          {onPreviewLesson && (
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onPreviewLesson(lesson);
              }}
              className="w-full p-3 rounded-xl hover:bg-slate-100 flex items-center gap-3 font-semibold text-[#0F172A] cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#2563EB]" /> Preview Lesson
            </button>
          )}

          {onDuplicateLesson && (
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onDuplicateLesson(lesson.uuid);
              }}
              className="w-full p-3 rounded-xl hover:bg-slate-100 flex items-center gap-3 font-semibold text-[#0F172A] cursor-pointer"
            >
              <Copy className="w-4 h-4 text-[#2563EB]" /> Duplicate Lesson
            </button>
          )}

          {onAddSubsection && (
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onAddSubsection(lesson.uuid);
              }}
              className="w-full p-3 rounded-xl hover:bg-slate-100 flex items-center gap-3 font-semibold text-[#0F172A] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#2563EB]" /> Add Subsection
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              onDeleteLesson(lesson.uuid);
            }}
            className="w-full p-3 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-3 font-semibold cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" /> Delete Lesson
          </button>
        </div>
      </Modal>
    </div>
  );
};
