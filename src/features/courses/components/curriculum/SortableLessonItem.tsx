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
  Lock,
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
  HelpCircle,
  FileCode,
  Clock,
} from 'lucide-react';
import type { CourseLesson } from '../../../../types/curriculum.types';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { LessonThumbnailBadge, LessonPreviewModal } from './LessonContentPreview';
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

// Helper: Format duration safely
const formatDurationDisplay = (minutes?: number): string | null => {
  if (!minutes || minutes <= 0) return null;
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${minutes} min`;
};

// Helper: Format metadata text per lesson type
const getLessonMetadataText = (lesson: CourseLesson): string | null => {
  const anyLesson = lesson as any;
  const content = lesson.content || {};

  switch (lesson.type) {
    case 'video': {
      const dur = formatDurationDisplay(lesson.durationMinutes || anyLesson.duration_minutes);
      return dur;
    }
    case 'audio': {
      const dur = formatDurationDisplay(lesson.durationMinutes || anyLesson.duration_minutes);
      if (dur) return dur;
      if (content.durationText) return content.durationText;
      return null;
    }
    case 'document': {
      const sizeMb = content.fileSizeMb || anyLesson.file_size_mb || content.sizeMb;
      const fileName = content.fileName || content.fileUrl || lesson.title || '';
      const isPdf = fileName.toLowerCase().endsWith('.pdf') || (content.mediaUrl && content.mediaUrl.toLowerCase().endsWith('.pdf'));
      const typeLabel = isPdf ? 'PDF' : 'Document';
      if (sizeMb) return `${typeLabel} • ${sizeMb} MB`;
      return typeLabel;
    }
    case 'quiz': {
      const questions = anyLesson?.quiz?.questions || content?.questions || anyLesson?.questions || [];
      const count = typeof anyLesson?.question_count === 'number' && anyLesson.question_count > 0
        ? anyLesson.question_count
        : (Array.isArray(questions) && questions.length > 0 ? questions.length : (anyLesson?.quiz?.question_count || 0));
      return count > 0 ? `${count} Question${count !== 1 ? 's' : ''}` : 'Assessment';
    }
    case 'assignment':
    case 'project': {
      const maxScore = anyLesson?.assignment?.max_marks ?? content?.maxScore;
      if (maxScore !== undefined && maxScore !== null && maxScore !== '') return `${maxScore} Marks`;
      return null;
    }
    case 'image': {
      const sizeMb = content.fileSizeMb || anyLesson.file_size_mb;
      return sizeMb ? `${sizeMb} MB` : null;
    }
    case 'text':
    default:
      return null;
  }
};

export const SortableLessonItem: React.FC<SortableLessonItemProps> = ({
  lesson,
  lessonIndex = '1.1',
  onSelectLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onPreviewLesson,
  onAddResource,
}) => {
  const navigate = useNavigate();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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

  const isLocked = (lesson as any).is_locked === true || (lesson as any).isLocked === true;
  const resources = lesson.resources || lesson.content?.resources || [];
  const resourceCount = resources.length;

  const handleDetachResource = async (resourceId: string) => {
    if (lesson.uuid) {
      await curriculumService.deleteLessonResource(lesson.uuid, resourceId);
    }
  };

  const typeIconMap = {
    video: VideoIcon,
    image: ImageIcon,
    audio: Music,
    document: FileText,
    quiz: HelpCircle,
    assignment: FileCode,
    project: FileCode,
    text: FileText,
  };

  const TypeIconComponent = typeIconMap[lesson.type] || FileText;
  const metadataText = getLessonMetadataText(lesson);

  const handleOpenPreview = () => {
    if (onPreviewLesson) {
      onPreviewLesson(lesson);
    } else {
      setIsPreviewModalOpen(true);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          ...style,
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
        className={`rounded-[14px] sm:rounded-[16px] border text-left font-sans transition-all duration-150 overflow-hidden box-border w-full min-w-0 p-3 sm:p-3.5 space-y-2.5 ${
          isDragging ? 'opacity-40 shadow-lg scale-[1.01]' : 'shadow-2xs hover:bg-[var(--surface-hover)]'
        }`}
      >
        {/* UNIFIED COMPACT MOBILE LESSON CARD HEADER */}
        <div className="flex items-start gap-2.5 sm:gap-3.5 w-full min-w-0">
          {/* 1. Drag Handle (Isolated) */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            style={{ color: 'var(--text-muted)' }}
            className="p-1 rounded-lg cursor-grab active:cursor-grabbing touch-none shrink-0 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] mt-2"
            aria-label="Drag to reorder lesson"
            title="Drag to reorder lesson"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* 2. 76px Preview Thumbnail Badge (Clickable to Preview) */}
          <div
            onClick={handleOpenPreview}
            className="shrink-0 cursor-pointer group/thumb"
            role="button"
            tabIndex={0}
          >
            <LessonThumbnailBadge
              type={lesson.type}
              lesson={lesson}
              className="w-[76px] h-[76px] sm:w-[80px] sm:h-[80px] rounded-[12px]"
            />
          </div>

          {/* 3. Middle Column: Title, Metadata, Status (Clickable to Preview) */}
          <div
            onClick={handleOpenPreview}
            className="flex-1 min-w-0 space-y-1.5 cursor-pointer group/details"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenPreview();
              }
            }}
          >
            {/* Title (max 2 lines, word-break normal, overflow-wrap break-word) */}
            <h4
              style={{ color: 'var(--text-primary)' }}
              className="text-[15px] sm:text-[16px] font-bold leading-[1.3] min-w-0 line-clamp-2 overflow-wrap-anywhere break-words group-hover/details:text-[var(--brand-primary)] transition-colors pr-1"
            >
              {lesson.title}
            </h4>

            {/* Type + Metadata Row */}
            <div
              style={{ color: 'var(--text-secondary)' }}
              className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium flex-wrap"
            >
              <div className="flex items-center gap-1">
                <TypeIconComponent className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                <span className="capitalize">{lesson.type.replace('_', ' ')}</span>
              </div>

              {metadataText && (
                <>
                  <span className="text-[var(--text-muted)] opacity-60">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    <span>{metadataText}</span>
                  </div>
                </>
              )}

              {isLocked && (
                <>
                  <span className="text-[var(--text-muted)] opacity-60">•</span>
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Lock className="w-3 h-3 shrink-0" /> Locked
                  </span>
                </>
              )}
            </div>

            {/* Status Badge */}
            <div className="pt-0.5">
              <Badge
                variant={lesson.status === 'published' ? 'success' : 'secondary'}
                size="sm"
                dot
                className="h-[24px] px-2.5 text-[11px] font-semibold rounded-full inline-flex items-center"
              >
                {lesson.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>

          {/* 4. Three-Dot Options Menu Button (Top Right, Isolated click) */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMoreMenuOpen(true);
              }}
              style={{ color: 'var(--text-muted)' }}
              className="w-8 h-8 -mr-1 flex items-center justify-center rounded-xl transition-colors cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              aria-label="More options"
              title="More Options"
            >
              <MoreHorizontal className="w-5 h-5 opacity-70 hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* RESOURCE COMPACT FOOTER ROW */}
        <div
          style={{ borderColor: 'var(--border)' }}
          className="pt-2 border-t flex items-center justify-between gap-2 flex-wrap w-full min-w-0"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {resourceCount > 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsResourcesExpanded((prev) => !prev);
                }}
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
                <span>{resourceCount} {resourceCount === 1 ? 'Resource' : 'Resources'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 shrink-0 stroke-current ${isResourcesExpanded ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <span style={{ color: 'var(--text-muted)' }} className="text-[11px] font-medium flex items-center gap-1.5 px-1 py-0.5">
                <Paperclip className="w-3.5 h-3.5 opacity-60" />
                No resources
              </span>
            )}
          </div>

          {/* Compact + Add Resource Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
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
            className="h-7 px-2.5 border rounded-[9px] font-semibold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer shrink-0 hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:scale-[0.98]"
            title="Add a resource to this lesson"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] stroke-current" />
            <span>Add Resource</span>
          </button>
        </div>

        {/* INLINE EXPANDED RESOURCES LIST */}
        {isResourcesExpanded && resources.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              borderRadius: '10px',
            }}
            className="p-2.5 border space-y-2 text-left font-sans animate-fade-in w-full min-w-0 max-w-full box-border"
          >
            <div style={{ borderColor: 'var(--border)' }} className="flex items-center justify-between text-xs border-b pb-1.5 flex-wrap gap-2">
              <span style={{ color: 'var(--text-primary)' }} className="font-semibold flex items-center gap-1.5 text-xs">
                <Paperclip style={{ color: 'var(--brand-primary)' }} className="w-3.5 h-3.5 shrink-0" />
                <span>Attached Resources</span>
                <span style={{ color: 'var(--text-secondary)' }}>({resources.length})</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsResourcesExpanded(false);
                }}
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
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                    }}
                    className="p-2 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full min-w-0 max-w-full box-border"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
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

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={resUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
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
                            backgroundColor: 'var(--surface-secondary)',
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDetachResource(res.id);
                        }}
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

        {/* Three-Dot Menu Options Modal */}
        <Modal
          isOpen={isMoreMenuOpen}
          onClose={() => setIsMoreMenuOpen(false)}
          title={`Lesson Options: ${lesson.title}`}
          maxWidth="sm"
          mobileMode="sheet"
          contentPadding="p-3"
        >
          <div className="space-y-1 font-sans text-left">
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onSelectLesson(lesson);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left font-semibold text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
              <span>Edit Lesson</span>
            </button>

            {onDuplicateLesson && (
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onDuplicateLesson(lesson.uuid);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left font-semibold text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                <span>Duplicate Lesson</span>
              </button>
            )}

            {onAddResource && (
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onAddResource(lesson.uuid);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left font-semibold text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[var(--brand-primary)] shrink-0 stroke-[2.5]" />
                <span>Add Resource</span>
              </button>
            )}

            <div className="my-1.5 border-t border-[var(--border)]" />

            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onDeleteLesson(lesson.uuid);
              }}
              aria-label="Delete lesson"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left font-bold text-xs sm:text-sm text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Delete Lesson</span>
            </button>
          </div>
        </Modal>

        {/* Lesson Interactive Preview Modal */}
        <LessonPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          lesson={lesson}
        />
      </div>
    </>
  );
};
