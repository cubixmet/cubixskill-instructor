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
  ChevronUp,
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
        {/* 1. TOP CONTROL & PREVIEW ROW */}
        <div className="flex items-center justify-between gap-2.5 w-full min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Drag Handle */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              style={{ color: 'var(--text-muted)' }}
              className="p-1 rounded-lg cursor-grab active:cursor-grabbing touch-none shrink-0 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              aria-label="Drag to reorder lesson"
              title="Drag to reorder lesson"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 opacity-75" />
            </button>

            {/* Small Media Preview Badge (56-64px max) */}
            <div
              onClick={handleOpenPreview}
              className="shrink-0 cursor-pointer group/thumb"
              role="button"
              tabIndex={0}
            >
              <LessonThumbnailBadge
                type={lesson.type}
                lesson={lesson}
                className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-[10px] sm:rounded-[12px]"
              />
            </div>
          </div>

          {/* Action Buttons: Expand Toggle Chevron & More Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsResourcesExpanded((prev) => !prev);
              }}
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 border rounded-xl flex items-center justify-center transition-all cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              aria-label={isResourcesExpanded ? "Collapse lesson card" : "Expand lesson card"}
              title={isResourcesExpanded ? "Collapse lesson card" : "Expand lesson card"}
            >
              {isResourcesExpanded ? (
                <ChevronUp className="w-4 h-4 shrink-0 stroke-[2.5]" />
              ) : (
                <ChevronDown className="w-4 h-4 shrink-0 stroke-[2.5]" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMoreMenuOpen(true);
              }}
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 border rounded-xl flex items-center justify-center transition-all cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              aria-label="More options"
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4 opacity-80 hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* 2. FULL-WIDTH LESSON CONTENT SECTION (Title, Meta, Status) */}
        <div
          onClick={handleOpenPreview}
          className="w-full min-w-0 space-y-1.5 cursor-pointer group/details pt-1"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenPreview();
            }
          }}
        >
          {/* Full Width Lesson Title (Natural wrapping across full card width) */}
          <h4
            style={{ color: 'var(--text-primary)' }}
            className="text-[14px] sm:text-[15px] font-bold leading-[1.35] w-full min-w-0 break-words overflow-wrap-anywhere group-hover/details:text-[var(--brand-primary)] transition-colors"
          >
            {lesson.title}
          </h4>

          {/* Meta Row: Lesson Type + Duration */}
          <div
            style={{ color: 'var(--text-secondary)' }}
            className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium flex-wrap"
          >
            <div className="flex items-center gap-1 shrink-0">
              <TypeIconComponent className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
              <span className="capitalize">{lesson.type.replace('_', ' ')}</span>
            </div>

            {metadataText && (
              <>
                <span className="text-[var(--text-muted)] opacity-60">•</span>
                <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <span className="whitespace-nowrap">{metadataText}</span>
                </div>
              </>
            )}

            {isLocked && (
              <>
                <span className="text-[var(--text-muted)] opacity-60">•</span>
                <span className="flex items-center gap-1 text-amber-500 font-semibold whitespace-nowrap shrink-0">
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
              className="h-[22px] sm:h-[24px] px-2 text-[10px] sm:text-[11px] font-semibold rounded-full inline-flex items-center"
            >
              {lesson.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        {/* 3. RESOURCE COMPACT FOOTER ROW (Rendered only when expanded) */}
        {isResourcesExpanded && (
          <div
            style={{ borderColor: 'var(--border)' }}
            className="pt-2.5 mt-3 border-t flex items-center justify-between gap-2 flex-wrap w-full min-w-0 animate-fade-in"
          >
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span style={{ color: 'var(--text-muted)' }} className="text-[12px] font-medium flex items-center gap-1.5 px-1 py-0.5">
                <Paperclip className="w-3.5 h-3.5 opacity-70 shrink-0" />
                {resourceCount > 0 ? (
                  <span style={{ color: 'var(--text-primary)' }} className="font-semibold">{resourceCount} {resourceCount === 1 ? 'resource' : 'resources'}</span>
                ) : (
                  <span>No resources</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {resourceCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPreview();
                  }}
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  className="h-8 px-3 border rounded-lg font-semibold text-[11px] sm:text-xs inline-flex items-center gap-1 transition-all cursor-pointer hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)]"
                >
                  View
                </button>
              )}

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
                className="h-8 px-3 border rounded-[9px] font-semibold text-[11px] sm:text-xs inline-flex items-center gap-1 transition-all cursor-pointer shrink-0 hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:scale-[0.98]"
                title="Add a resource to this lesson"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5] stroke-current" />
                <span>Add Resource</span>
              </button>
            </div>
          </div>
        )}

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
