import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import {
  GripVertical,
  Edit3,
  Copy,
  Trash2,
  Plus,
  MoreHorizontal,
  Clock,
  Lock,
  Unlock,
  Paperclip,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  Archive,
  File,
} from 'lucide-react';
import type { CourseLesson, LessonType } from '../../../../types/curriculum.types';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { getLessonTypeMeta } from '../../config/lessonTypes.config';
import { LessonContentPreview } from './LessonContentPreview';
import { useCurriculumStore } from '../../store/curriculum.store';

interface SortableLessonItemProps {
  lesson: CourseLesson;
  lessonIndex?: string;
  onSelectLesson: (lesson: CourseLesson) => void;
  onDeleteLesson: (lessonUuid: string) => void;
  onDuplicateLesson?: (lessonUuid: string) => void;
  onPreviewLesson?: (lesson: CourseLesson) => void;
  onAddResource?: (lessonUuid: string) => void;
}

const getResourceIcon = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('pdf') || t.includes('doc') || t.includes('text') || t === 'document') return FileText;
  if (t.includes('url') || t.includes('link') || t.includes('web')) return Globe;
  if (t.includes('image') || t.includes('jpg') || t.includes('png')) return ImageIcon;
  if (t.includes('audio') || t.includes('mp3')) return Music;
  if (t.includes('video') || t.includes('mp4')) return VideoIcon;
  if (t.includes('zip') || t.includes('rar')) return Archive;
  return File;
};

export const SortableLessonItem: React.FC<SortableLessonItemProps> = ({
  lesson,
  lessonIndex = '1.3',
  onSelectLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onAddResource,
}) => {
  const navigate = useNavigate();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(false);
  const detachResourceFromLesson = useCurriculumStore((s) => s.detachResourceFromLesson);

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

  const getLessonIcon = (type: LessonType) => {
    const meta = getLessonTypeMeta(type);
    const Icon = meta.icon;
    return <Icon className="w-4.5 h-4.5 text-[#2563EB]" />;
  };

  const isLocked = lesson.unlockRule && lesson.unlockRule !== 'immediate';
  const resources = lesson.content?.resources || [];
  const resourceCount = resources.length;

  const handleDetachResource = (resourceId: string) => {
    if (lesson.uuid && detachResourceFromLesson) {
      detachResourceFromLesson(lesson.uuid, resourceId);
    }
  };

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
      {/* UNIFIED SINGLE LESSON CARD CONTAINER */}
      <div className="p-3 sm:p-4 space-y-2.5 w-full min-w-0">
        {/* 1. TOP UTILITY ROW: Drag handle, Index, Type Icon | Three-dot Menu */}
        <div className="flex items-center justify-between gap-2 w-full min-w-0">
          <div className="flex items-center gap-2">
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

            <div className="w-6.5 h-6.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              {getLessonIcon(lesson.type)}
            </div>
          </div>

          {/* Three-dot menu button */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(true)}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* 2. DEDICATED FULL-WIDTH LESSON TITLE */}
        <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug whitespace-normal break-words w-full font-sans">
          {lesson.title}
        </h4>

        {/* 3. METADATA ROW */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B] flex-wrap">
          <span className="capitalize font-semibold text-[#0F172A]">
            {lesson.type.replace('_', ' ')}
          </span>
          <span className="text-slate-300">•</span>
          {lesson.type === 'assignment' && (
            <>
              <span className="px-2 py-0.5 bg-blue-50 text-[#2563EB] border border-blue-100 rounded-md font-semibold text-[10px]">
                100 Marks
              </span>
              <span className="text-slate-300">•</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#64748B]" /> {lesson.durationMinutes} mins
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1">
            {isLocked ? (
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <Lock className="w-3 h-3" /> Locked
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#2563EB] font-semibold">
                <Unlock className="w-3 h-3" /> Unlocked
              </span>
            )}
          </span>
        </div>

        {/* 4. PUBLISHED STATUS BADGE */}
        <div>
          <Badge
            variant={lesson.status === 'published' ? 'success' : 'secondary'}
            size="sm"
            dot
            className="h-5 px-2 text-[10px] rounded-full inline-flex items-center"
          >
            {lesson.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>

        {/* 5. INLINE LESSON CONTENT PREVIEW */}
        <div className="pt-1 w-full min-w-0 max-w-full">
          <LessonContentPreview lesson={lesson} />
        </div>

        {/* 6. RESOURCE ACTION BAR: [Resources: N] (clickable) & [+ Add Resource] */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap w-full min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {resourceCount > 0 ? (
              <button
                type="button"
                onClick={() => setIsResourcesExpanded((prev) => !prev)}
                aria-expanded={isResourcesExpanded}
                className="h-7 px-2.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-[#2563EB] rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                title={isResourcesExpanded ? "Collapse attached resources" : `Expand ${resourceCount} attached resources`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Resources: {resourceCount}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isResourcesExpanded ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-slate-300" />
                No resources
              </span>
            )}
          </div>

          {/* Compact + Add Resource Button */}
          <button
            type="button"
            onClick={() => {
              if (onAddResource) {
                onAddResource(lesson.uuid);
              } else {
                navigate(`/courses/${lesson.courseUuid}/curriculum/resources/add?lessonUuid=${lesson.uuid}&moduleUuid=${lesson.moduleUuid}`);
              }
            }}
            className="h-7 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-[#2563EB] rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0 active:scale-[0.98]"
            title="Add a resource to this lesson"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Resource</span>
          </button>
        </div>

        {/* 7. INLINE EXPANDED RESOURCES LIST */}
        {isResourcesExpanded && resources.length > 0 && (
          <div className="mt-2 p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2 text-left font-sans animate-fade-in w-full min-w-0">
            <div className="flex items-center justify-between text-xs border-b border-slate-200/60 pb-1.5">
              <span className="font-bold text-[#0F172A] flex items-center gap-1.5 text-xs">
                <Paperclip className="w-3.5 h-3.5 text-[#2563EB]" /> Attached Resources ({resources.length})
              </span>
              <button
                type="button"
                onClick={() => setIsResourcesExpanded(false)}
                className="text-[10px] font-bold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                Hide
              </button>
            </div>

            <div className="space-y-1.5">
              {resources.map((res) => {
                const ResourceIcon = getResourceIcon(res.type);
                return (
                  <div
                    key={res.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2.5 hover:border-blue-200 transition-colors w-full min-w-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                        <ResourceIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-[#0F172A] truncate">
                          {res.title || res.name}
                        </h5>
                        <p className="text-[10px] text-[#64748B] font-medium flex items-center gap-1.5">
                          <span className="uppercase font-bold text-[#2563EB]">{res.type}</span>
                          {res.size && <span>• {res.size}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={res.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-6 px-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-[10px] font-bold rounded-md inline-flex items-center gap-1 border border-blue-200 transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDetachResource(res.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Detach resource from lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Single More Menu (•••) Options Modal */}
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

          {onAddResource && (
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onAddResource(lesson.uuid);
              }}
              className="w-full p-3 rounded-xl hover:bg-slate-100 flex items-center gap-3 font-semibold text-[#0F172A] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#2563EB]" /> Add Resource
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
