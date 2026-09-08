import React, { useState } from 'react';
import {
  FileText,
  HelpCircle,
  FileCode,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Play,
  Music,
  Image as ImageIcon,
  CheckSquare,
  Eye,
  X,
  Volume2,
} from 'lucide-react';
import type { CourseLesson, LessonType } from '../../../../types/curriculum.types';
import { Badge } from '../../../../components/ui/Badge';
import { parseEmbedVideoUrl } from './VideoLessonSettings';
import { sanitizeHtml, isHtmlContentEmpty } from '../../utils/sanitizeHtml.util';
import { AudioPlayer } from '../../../../components/ui/AudioPlayer';
import { LessonVideoPlayer } from '../../../../components/media/LessonVideoPlayer';
import { resolveMediaUrl } from '../../../../utils/media.utils';

// Helper to extract thumbnail/media preview image
export const getLessonThumbnailUrl = (lesson: CourseLesson): string | null => {
  const anyLesson = lesson as any;
  const content = lesson.content || {};

  const candidates = [
    content.thumbnailUrl,
    anyLesson.thumbnail_url,
    anyLesson.thumbnail,
    anyLesson.imageUrl,
    content.mediaUrl,
    content.fileUrl,
    anyLesson.primary_media?.thumbnail_url,
    anyLesson.primary_media?.url,
    anyLesson.media_files?.[0]?.media_file?.url,
    anyLesson.media_files?.[0]?.media_file?.thumbnail_url,
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim() && !c.includes('.mp4') && !c.includes('.m3u8') && !c.includes('.pdf') && !c.includes('.mp3')) {
      return resolveMediaUrl(c);
    }
  }

  return null;
};

interface LessonThumbnailBadgeProps {
  type: LessonType;
  lesson: CourseLesson;
  className?: string;
}

export const LessonThumbnailBadge: React.FC<LessonThumbnailBadgeProps> = ({ type, lesson, className = "w-[76px] h-[76px]" }) => {
  const [imgError, setImgError] = useState(false);
  const thumbUrl = getLessonThumbnailUrl(lesson);
  const content = lesson.content || {};
  const anyLesson = lesson as any;

  // Format tile duration string e.g. "6:50:00" or "15:00"
  const durMins = lesson.durationMinutes || anyLesson.duration_minutes;
  const tileDuration = durMins && durMins > 0
    ? (durMins >= 60
        ? `${Math.floor(durMins / 60)}:${(durMins % 60).toString().padStart(2, '0')}:00`
        : `${durMins}:00`)
    : null;

  // If real thumbnail/image exists
  if (thumbUrl && !imgError) {
    return (
      <div className={`relative rounded-[12px] overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 group/thumb ${className}`}>
        <img
          src={thumbUrl}
          alt={lesson.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
        />
        {type === 'video' && (
          <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-between p-1.5">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-xs flex items-center justify-center shadow-md border border-white/20">
                <Play className="w-4 h-4 fill-white ml-0.5 text-white" />
              </div>
            </div>
            {tileDuration && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-xs shadow-xs leading-none">
                {tileDuration}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Type-specific icon fallbacks with styled gradient tiles
  switch (type) {
    case 'video': {
      return (
        <div className={`relative rounded-[12px] overflow-hidden bg-gradient-to-br from-[#1E293B] via-[#1E2538] to-[#0F172A] border border-slate-700/60 flex flex-col items-center justify-between p-2 shrink-0 text-white ${className}`}>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-md border border-white/20">
              <Play className="w-4 h-4 fill-white ml-0.5 text-white" />
            </div>
          </div>
          {tileDuration && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs shadow-xs leading-none">
              {tileDuration}
            </span>
          )}
        </div>
      );
    }
    case 'image':
      return (
        <div className={`rounded-[12px] bg-gradient-to-br from-purple-950/40 via-indigo-900/30 to-slate-900 border border-purple-500/20 text-purple-400 flex flex-col items-center justify-center shrink-0 ${className}`}>
          <ImageIcon className="w-7 h-7" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-purple-300">IMAGE</span>
        </div>
      );
    case 'audio':
      return (
        <div className={`rounded-[12px] bg-gradient-to-br from-amber-950/40 via-orange-900/30 to-slate-900 border border-amber-500/20 text-amber-400 flex flex-col items-center justify-center shrink-0 ${className}`}>
          <Music className="w-7 h-7" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-amber-300">AUDIO</span>
        </div>
      );
    case 'document': {
      const fileName = content.fileName || content.fileUrl || lesson.title;
      const isPdf = fileName.toLowerCase().endsWith('.pdf') || (content.mediaUrl && content.mediaUrl.toLowerCase().endsWith('.pdf'));
      return (
        <div className={`rounded-[12px] ${isPdf ? 'bg-gradient-to-br from-rose-950/40 via-red-900/30 to-slate-900 border-rose-500/20 text-rose-400' : 'bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/20 text-blue-400'} border flex flex-col items-center justify-center shrink-0 ${className}`}>
          <FileText className="w-7 h-7" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1">
            {isPdf ? 'PDF' : 'DOC'}
          </span>
        </div>
      );
    }
    case 'quiz':
      return (
        <div className={`rounded-[12px] bg-gradient-to-br from-emerald-950/40 via-teal-900/30 to-slate-900 border border-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center shrink-0 ${className}`}>
          <HelpCircle className="w-7 h-7" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-emerald-300">QUIZ</span>
        </div>
      );
    case 'assignment':
    case 'project':
      return (
        <div className={`rounded-[12px] bg-gradient-to-br from-blue-950/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 text-blue-400 flex flex-col items-center justify-center shrink-0 ${className}`}>
          <CheckSquare className="w-7 h-7" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-blue-300">TASK</span>
        </div>
      );
    case 'text':
    default:
      return (
        <div className={`rounded-[12px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-slate-700/60 text-slate-300 flex flex-col items-center justify-center shrink-0 ${className}`}>
          <FileText className="w-7 h-7" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-slate-400">TEXT</span>
        </div>
      );
  }
};

// Full Screen / Drawer Interactive Lesson Modal Preview
export interface LessonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: CourseLesson | null;
}

export const LessonPreviewModal: React.FC<LessonPreviewModalProps> = ({ isOpen, onClose, lesson }) => {
  if (!isOpen || !lesson) return null;

  const anyLesson = lesson as any;
  const content = lesson.content || {};
  const { type } = lesson;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--surface)] text-[var(--text-primary)] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between gap-3 shrink-0 bg-[var(--surface-secondary)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                  {type.replace('_', ' ')}
                </span>
                <Badge
                  variant={lesson.status === 'published' ? 'success' : 'secondary'}
                  size="sm"
                  dot
                >
                  {lesson.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate mt-0.5">
                {lesson.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Main Media Player / Content View */}
          <div className="w-full">
            <LessonContentPreview lesson={lesson} isExpandedView={true} />
          </div>

          {/* Description & Additional Info */}
          {lesson.description && (
            <div className="space-y-1.5 pt-3 border-t border-[var(--border)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Description</h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {lesson.description}
              </p>
            </div>
          )}

          {/* Resources */}
          {((lesson.resources && lesson.resources.length > 0) || (content.resources && content.resources.length > 0)) && (
            <div className="space-y-2 pt-3 border-t border-[var(--border)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Attached Resources ({(lesson.resources || content.resources).length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(lesson.resources || content.resources).map((res: any, i: number) => (
                  <a
                    key={res.id || i}
                    href={res.url || res.file_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:border-[var(--brand-primary)] flex items-center justify-between text-xs text-[var(--text-primary)] transition-colors group"
                  >
                    <span className="font-medium truncate mr-2">{res.title || res.name || 'Resource File'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface LessonContentPreviewProps {
  lesson: CourseLesson;
  isExpandedView?: boolean;
}

interface StableIframeEmbedProps {
  embedUrl: string;
  title: string;
}

export const StableIframeEmbed: React.FC<StableIframeEmbedProps> = React.memo(({ embedUrl, title }) => {
  return (
    <div className="w-full space-y-1.5 overflow-hidden">
      <div className="aspect-video w-full max-w-full max-h-72 sm:max-h-96 bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative">
        <iframe
          src={embedUrl}
          title={`Preview ${title}`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
});

export const LessonContentPreview: React.FC<LessonContentPreviewProps> = ({
  lesson,
  isExpandedView = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedView);
  const [mediaError, setMediaError] = useState(false);

  const { type, content } = lesson;
  const anyLesson = lesson as any;

  // 1. VIDEO LESSON
  if (type === 'video') {
    const rawUrl =
      anyLesson?.video_url ||
      anyLesson?.videoUrl ||
      content?.mediaUrl ||
      content?.videoUrl ||
      content?.fileUrl ||
      anyLesson?.media_files?.[0]?.media_file?.url ||
      anyLesson?.primary_media?.url ||
      '';

    const streamUrl =
      anyLesson?.stream_url ||
      anyLesson?.primary_media?.stream_url ||
      content?.streamUrl ||
      '';
    const parsedEmbed = parseEmbedVideoUrl(rawUrl);

    if (!rawUrl.trim() && !streamUrl.trim()) {
      return (
        <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl text-center text-[var(--text-muted)] text-xs font-medium">
          No video attached to this lesson.
        </div>
      );
    }

    if (parsedEmbed) {
      return <StableIframeEmbed embedUrl={parsedEmbed.embedUrl} title={lesson.title} />;
    }

    return (
      <div className="w-full space-y-1.5 overflow-hidden">
        <LessonVideoPlayer
          media={anyLesson?.primary_media}
          videoUrl={rawUrl}
          streamUrl={streamUrl}
          title={lesson.title}
        />
      </div>
    );
  }

  // 2. IMAGE LESSON
  if (type === 'image') {
    const imgUrl = anyLesson?.imageUrl || content?.mediaUrl || content?.fileUrl || anyLesson?.primary_media?.url || getLessonThumbnailUrl(lesson) || '';
    const resolvedImgUrl = resolveMediaUrl(imgUrl);

    if (!imgUrl.trim()) {
      return (
        <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl text-center text-[var(--text-muted)] text-xs font-medium">
          Image content not configured
        </div>
      );
    }

    if (mediaError) {
      return (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>Image unavailable.</span>
        </div>
      );
    }

    return (
      <div className="w-full overflow-hidden">
        <div className="w-full max-h-72 sm:max-h-96 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] p-1 flex items-center justify-center overflow-hidden">
          <img
            src={resolvedImgUrl}
            alt={lesson.title}
            onError={() => setMediaError(true)}
            className="w-full h-auto max-h-68 sm:max-h-92 object-contain rounded-lg shadow-2xs"
          />
        </div>
      </div>
    );
  }

  // 3. AUDIO LESSON
  if (type === 'audio') {
    const audioUrl =
      anyLesson?.audio_url ||
      anyLesson?.audioUrl ||
      anyLesson?.external_url ||
      anyLesson?.externalUrl ||
      content?.audioUrl ||
      content?.externalUrl ||
      content?.mediaUrl ||
      content?.fileUrl ||
      anyLesson?.primary_media?.url ||
      anyLesson?.primary_media?.file ||
      anyLesson?.media_files?.[0]?.media_file?.url ||
      '';

    const resolvedAudioUrl = resolveMediaUrl(audioUrl);

    return <AudioPlayer src={resolvedAudioUrl} title={lesson.title} />;
  }

  // 4. DOCUMENT LESSON
  if (type === 'document') {
    const docUrl = anyLesson?.documentUrl || content?.mediaUrl || content?.fileUrl || anyLesson?.primary_media?.url || '';
    const resolvedDocUrl = resolveMediaUrl(docUrl);
    const rawFileName = content?.fileName || content?.fileUrl || lesson.title || 'Document File';
    const cleanFileName = rawFileName.startsWith('http')
      ? rawFileName.split('/').pop()?.split('?')[0] || lesson.title
      : rawFileName;

    const fileExt = cleanFileName.includes('.') ? cleanFileName.split('.').pop()?.toUpperCase() || 'DOCUMENT' : 'DOCUMENT';

    return (
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          borderRadius: '10px',
        }}
        className="p-2.5 sm:p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs w-full min-w-0 max-w-full box-border"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
              color: 'var(--brand-primary)',
              borderColor: 'var(--border)',
            }}
            className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
          >
            <FileText className="w-4 h-4 stroke-current text-current" />
          </div>
          <div className="min-w-0 flex-1">
            <strong style={{ color: 'var(--text-primary)' }} className="font-semibold block text-xs truncate min-w-0 max-w-full">
              {cleanFileName}
            </strong>
            <span style={{ color: 'var(--text-muted)' }} className="text-[12px] font-normal block">
              {fileExt} / Document
            </span>
          </div>
        </div>

        {resolvedDocUrl ? (
          <a
            href={resolvedDocUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="h-8 px-3 rounded-lg border font-medium text-[11px] inline-flex items-center justify-center gap-1.5 shrink-0 transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] cursor-pointer whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0 stroke-current text-current" />
            <span className="whitespace-nowrap">Open Document</span>
          </a>
        ) : (
          <span
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
            className="px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0"
          >
            Attached Document
          </span>
        )}
      </div>
    );
  }

  // 5. TEXT LESSON
  if (type === 'text') {
    const rawHtml = content?.textContent || content?.body || content?.article || '';

    if (isHtmlContentEmpty(rawHtml)) {
      return (
        <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl text-center text-[var(--text-muted)] text-xs font-medium">
          Text content empty
        </div>
      );
    }

    const cleanHtml = sanitizeHtml(rawHtml);

    return (
      <div className="space-y-1.5 text-xs text-[var(--text-primary)] bg-[var(--surface-secondary)] border border-[var(--border)] p-3.5 rounded-xl font-sans">
        <div
          className={`prose max-w-none text-xs text-[var(--text-primary)] leading-relaxed overflow-hidden transition-all ${
            isExpanded ? '' : 'max-h-24 line-clamp-4'
          }`}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />

        {rawHtml.length > 180 && !isExpandedView && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Show more
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  if (type === 'quiz') {
    const questions = anyLesson?.quiz?.questions || content?.questions || anyLesson?.questions || [];
    const count = typeof anyLesson?.question_count === 'number' && anyLesson.question_count > 0
      ? anyLesson.question_count
      : (Array.isArray(questions) && questions.length > 0 ? questions.length : (anyLesson?.quiz?.question_count || anyLesson?.question_count || 0));

    const questionTypeLabels = anyLesson?.quiz?.question_types_summary || content?.questionTypesSummary || 'Multiple Choice • Short Answer • True/False';

    return (
      <div
        style={{
          backgroundColor: 'color-mix(in srgb, var(--brand-primary) 7%, var(--surface-secondary))',
          borderColor: 'color-mix(in srgb, var(--brand-primary) 25%, var(--border))',
          color: 'var(--text-primary)',
          borderRadius: '10px',
        }}
        className="p-3 border flex flex-wrap items-center justify-between gap-2 text-xs font-sans w-full max-w-full min-w-0 transition-colors hover:bg-[color-mix(in_srgb,var(--brand-primary)_10%,var(--surface-secondary))] hover:border-[var(--brand-primary)]"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
              color: 'var(--brand-primary)',
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          >
            <HelpCircle className="w-4 h-4 stroke-current text-current" />
          </div>
          <div className="min-w-0 flex-1">
            <strong style={{ color: 'var(--text-primary)' }} className="font-semibold block text-xs truncate">
              Quiz • {count} Question{count !== 1 ? 's' : ''}
            </strong>
            <span style={{ color: 'var(--text-muted)' }} className="text-[12px] font-normal block truncate">
              {questionTypeLabels}
            </span>
          </div>
        </div>

        <span
          style={{
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, var(--surface))',
            borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, var(--border))',
            color: 'var(--brand-primary)',
          }}
          className="px-2.5 py-1 rounded-md border font-medium text-[11px] shrink-0"
        >
          Assessment
        </span>
      </div>
    );
  }

  // 7. ASSIGNMENT & PROJECT
  if (type === 'assignment' || type === 'project') {
    const instructions = content?.instructions || (lesson as any)?.assignment?.instructions || '';
    const maxScore = (lesson as any)?.assignment?.max_marks ?? content?.maxScore ?? 100;
    const subType = (lesson as any)?.assignment?.allow_file_submission
      ? (lesson as any)?.assignment?.allow_text_submission ? 'file • text' : 'file'
      : (lesson as any)?.assignment?.allow_text_submission ? 'text' : (content?.submissionType || 'file');

    return (
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
        className="p-3 border rounded-xl space-y-1.5 text-xs font-sans w-full min-w-0 max-w-full box-border"
      >
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <strong
            style={{ color: 'var(--text-primary)' }}
            className="font-medium capitalize flex items-center gap-1.5"
          >
            <FileCode style={{ color: 'var(--brand-primary)' }} className="w-4 h-4 shrink-0 stroke-current text-current" />
            <span>{type}</span>
          </strong>
          <span
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, var(--surface-secondary))',
              borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, var(--border))',
              color: 'var(--brand-primary)',
            }}
            className="px-2.5 py-0.5 rounded-md border font-semibold text-[10px] inline-flex items-center shrink-0"
          >
            {maxScore} Marks • {subType}
          </span>
        </div>

        {instructions.trim() && (
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px] line-clamp-2 italic">
            "{instructions}"
          </p>
        )}
      </div>
    );
  }

  return null;
};
