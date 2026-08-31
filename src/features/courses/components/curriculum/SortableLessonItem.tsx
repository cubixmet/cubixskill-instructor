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
  Download,
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
import { curriculumService } from '../../services/curriculum.service';

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
  const resources = lesson.resources || lesson.content?.resources || [];
  const resourceCount = resources.length;

  const handleDetachResource = (resourceId: string) => {
    if (lesson.uuid) {
      curriculumService.deleteLessonResource(lesson.uuid, resourceId);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }}
      className={`rounded-[16px] border text-left font-sans transition-all duration-150 overflow-hidden box-border min-w-0 ${
        isDragging ? 'opacity-40 shadow-lg scale-[1.01]' : 'shadow-2xs hover:bg-[var(--surface-hover)]'
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
              style={{ color: 'var(--text-muted)' }}
              className="p-1 rounded-lg cursor-grab active:cursor-grabbing touch-none shrink-0 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              title="Drag to reorder lesson"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <span style={{ color: 'var(--brand-primary)' }} className="text-xs font-bold shrink-0 font-mono">
              {lessonIndex}
            </span>

            <div
              style={{
                backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                borderColor: 'var(--border)',
                color: 'var(--brand-primary)',
              }}
              className="w-6.5 h-6.5 rounded-lg border flex items-center justify-center shrink-0"
            >
              {getLessonIcon(lesson.type)}
            </div>
          </div>

          {/* Three-dot menu button */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(true)}
            style={{ color: 'var(--text-muted)' }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* 2. DEDICATED FULL-WIDTH LESSON TITLE */}
        <h4 style={{ color: 'var(--text-primary)' }} className="text-xs sm:text-sm font-semibold leading-snug whitespace-normal break-words w-full font-sans">
          {lesson.title}
        </h4>

        {/* 3. METADATA ROW */}
        <div style={{ color: 'var(--text-muted)' }} className="flex items-center gap-1.5 text-[11px] font-medium flex-wrap">
          <span style={{ color: 'var(--text-primary)' }} className="capitalize font-semibold">
            {lesson.type.replace('_', ' ')}
          </span>
          <span style={{ color: 'var(--border)' }}>•</span>
          {(lesson.type === 'assignment' || lesson.type === 'project') && (
            <>
              {(() => {
                const dueDaysVal =
                  (lesson as any)?.assignment?.due_days ??
                  (lesson as any)?.assignment?.dueDays ??
                  (lesson?.content as any)?.dueDays ??
                  (lesson?.content as any)?.due_days;
                if (dueDaysVal && typeof dueDaysVal === 'number' && dueDaysVal >= 1) {
                  return (
                    <span
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, var(--surface-secondary))',
                        borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, var(--border))',
                        color: 'var(--brand-primary)',
                      }}
                      className="px-2 py-0.5 border rounded-md font-semibold text-[10px]"
                    >
                      Due in {dueDaysVal} days
                    </span>
                  );
                }
                return null;
              })()}
              <span style={{ color: 'var(--border)' }}>•</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-current opacity-70" /> {lesson.durationMinutes} mins
          </span>
          <span style={{ color: 'var(--border)' }}>•</span>
          <span className="flex items-center gap-1">
            {isLocked ? (
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Lock className="w-3 h-3" /> Locked
              </span>
            ) : (
              <span style={{ color: 'var(--brand-primary)' }} className="flex items-center gap-1 font-semibold">
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
        <div style={{ borderColor: 'var(--border)' }} className="pt-2 border-t flex items-center justify-between gap-2 flex-wrap w-full min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {resourceCount > 0 ? (
              <button
                type="button"
                onClick={() => setIsResourcesExpanded((prev) => !prev)}
                aria-expanded={isResourcesExpanded}
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                className="h-7 px-2.5 border rounded-lg font-semibold text-[11px] inline-flex items-center gap-1.5 transition-all cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                title={isResourcesExpanded ? "Collapse attached resources" : `Expand ${resourceCount} attached resources`}
              >
                <Paperclip style={{ color: 'var(--brand-primary)' }} className="w-3.5 h-3.5 shrink-0" />
                <span>Resources: {resourceCount}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 shrink-0 stroke-current ${isResourcesExpanded ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <span style={{ color: 'var(--text-muted)' }} className="text-[11px] font-semibold flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 opacity-60" />
                No resources
              </span>
            )}
          </div>

          {/* Compact + Add Resource Button */}
          <button
            type="button"
            onClick={() => {
              const realLessonId = lesson.id || lesson.uuid;
              if (onAddResource) {
                onAddResource(realLessonId);
              } else {
                navigate(`/courses/${lesson.courseUuid}/curriculum/resources/add?lessonUuid=${encodeURIComponent(realLessonId)}&moduleUuid=${encodeURIComponent(lesson.moduleUuid)}`);
              }
            }}
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
            className="h-7 px-2.5 border rounded-lg font-medium text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer shrink-0 hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:scale-[0.98]"
            title="Add a resource to this lesson"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] stroke-current" />
            <span>Add Resource</span>
          </button>
        </div>

        {/* 7. INLINE EXPANDED RESOURCES LIST */}
        {isResourcesExpanded && resources.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              borderRadius: '10px',
            }}
            className="mt-2 p-3 border space-y-2 text-left font-sans animate-fade-in w-full min-w-0 max-w-full box-border"
          >
            <div style={{ borderColor: 'var(--border)' }} className="flex items-center justify-between text-xs border-b pb-1.5 flex-wrap gap-2">
              <span style={{ color: 'var(--text-primary)' }} className="font-semibold flex items-center gap-1.5 text-xs">
                <Paperclip style={{ color: 'var(--brand-primary)' }} className="w-3.5 h-3.5 shrink-0" />
                <span>Attached Resources</span>
                <span style={{ color: 'var(--text-secondary)' }}>({resources.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setIsResourcesExpanded(false)}
                style={{ color: 'var(--text-muted)' }}
                className="text-[10px] font-medium hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
              >
                Hide
              </button>
            </div>

            <div className="space-y-1.5">
              {resources.map((res: any, idx: number) => {
                const ResourceIcon = getResourceIcon(res.resource_type || res.type);
                const resTitle = res.title || res.name || res.file_name || res.fileName || 'Resource File';
                const resType = res.resource_type || res.type || 'document';
                const resUrl = res.url || res.file_url || res.fileUrl || '#';

                return (
                  <div
                    key={res.id || res.resourceUuid || idx}
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                    }}
                    className="p-2.5 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full min-w-0 max-w-full box-border"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                          color: 'var(--brand-primary)',
                        }}
                        className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center shrink-0"
                      >
                        <ResourceIcon className="w-3.5 h-3.5 stroke-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5
                          style={{ color: 'var(--text-primary)' }}
                          className="text-xs font-medium truncate block min-w-0 max-w-full"
                        >
                          {resTitle}
                        </h5>
                        <p style={{ color: 'var(--text-secondary)' }} className="text-[10px] font-medium flex items-center gap-1.5">
                          <span className="uppercase font-semibold" style={{ color: 'var(--brand-primary)' }}>{resType}</span>
                          {res.sizeMb && <span>• {res.sizeMb} MB</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <a
                        href={resUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                        }}
                        className="h-6 px-2 text-[10px] font-medium rounded-md inline-flex items-center gap-1 border transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] cursor-pointer"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3 stroke-current" />
                      </a>

                      {res.allowDownload && (
                        <a
                          href={resUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                          className="h-6 px-2 text-[10px] font-medium rounded-md inline-flex items-center gap-1 border transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] cursor-pointer"
                          title="Download Resource"
                        >
                          <span>Download</span>
                          <Download className="w-3 h-3 stroke-current" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDetachResource(res.id)}
                        style={{ color: '#F87171' }}
                        className="p-1 rounded-md transition-colors cursor-pointer hover:bg-rose-500/10 hover:text-[#FCA5A5]"
                        title="Detach resource from lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-current" />
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
        maxWidth="sm"
        contentPadding="p-3"
      >
        <div className="space-y-1 font-sans text-left">
          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              onSelectLesson(lesson);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 min-h-[42px] text-left font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-[#172033] dark:hover:text-white transition-colors cursor-pointer"
          >
            <Edit3 className="w-4.5 h-4.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
            <span className="text-xs sm:text-sm font-medium leading-none">Edit Lesson</span>
          </button>

          {onDuplicateLesson && (
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onDuplicateLesson(lesson.uuid);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 min-h-[42px] text-left font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-[#172033] dark:hover:text-white transition-colors cursor-pointer"
            >
              <Copy className="w-4.5 h-4.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
              <span className="text-xs sm:text-sm font-medium leading-none">Duplicate Lesson</span>
            </button>
          )}

          {onAddResource && (
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onAddResource(lesson.uuid);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 min-h-[42px] text-left font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-[#172033] dark:hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
              <span className="text-xs sm:text-sm font-medium leading-none">Add Resource</span>
            </button>
          )}

          <div className="my-1.5 border-t border-slate-200 dark:border-[#263244]" />

          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              onDeleteLesson(lesson.uuid);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 min-h-[42px] text-left font-medium text-rose-600 hover:bg-rose-50 dark:text-[#F87171] dark:hover:bg-[rgba(239,68,68,0.08)] dark:hover:text-[#FCA5A5] transition-colors cursor-pointer"
          >
            <Trash2 className="w-4.5 h-4.5 text-rose-600 dark:text-[#F87171] shrink-0" />
            <span className="text-xs sm:text-sm font-medium leading-none">Delete Lesson</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};
