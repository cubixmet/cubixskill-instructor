import React, { useState } from 'react';
import {
  FileText,
  HelpCircle,
  FileCode,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import type { CourseLesson } from '../../../../types/curriculum.types';
import { Badge } from '../../../../components/ui/Badge';
import { parseEmbedVideoUrl } from './VideoLessonSettings';
import { sanitizeHtml, isHtmlContentEmpty } from '../../utils/sanitizeHtml.util';
import { AudioPlayer } from '../../../../components/ui/AudioPlayer';
import { LessonVideoPlayer } from '../../../../components/media/LessonVideoPlayer';
import { resolveMediaUrl } from '../../../../utils/media.utils';

interface LessonContentPreviewProps {
  lesson: CourseLesson;
}

export const LessonContentPreview: React.FC<LessonContentPreviewProps> = ({
  lesson,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

    const streamManifest = anyLesson?.primary_media?.stream_manifest_key || anyLesson?.stream_manifest_key || anyLesson?.primary_media?.stream_url || anyLesson?.stream_url;
    const parsedEmbed = parseEmbedVideoUrl(rawUrl);

    if (!rawUrl.trim() && !streamManifest) {
      return (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-xs font-medium">
          No video attached to this lesson.
        </div>
      );
    }

    if (parsedEmbed) {
      return (
        <div className="w-full space-y-1.5 overflow-hidden">
          <div className="aspect-video w-full max-w-full max-h-72 sm:max-h-80 bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative">
            <iframe
              src={parsedEmbed.embedUrl}
              title={`Preview ${lesson.title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-1.5 overflow-hidden">
        <LessonVideoPlayer
          media={anyLesson?.primary_media}
          videoUrl={rawUrl}
          streamUrl={streamManifest}
          title={lesson.title}
        />
      </div>
    );
  }

  // 2. IMAGE LESSON
  if (type === 'image') {
    const imgUrl = anyLesson?.imageUrl || content?.mediaUrl || content?.fileUrl || anyLesson?.primary_media?.url || '';
    const resolvedImgUrl = resolveMediaUrl(imgUrl);

    if (!imgUrl.trim()) {
      return (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-xs font-medium">
          Image content not configured
        </div>
      );
    }

    if (mediaError) {
      return (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Image unavailable.</span>
        </div>
      );
    }

    return (
      <div className="w-full overflow-hidden">
        <div className="w-full max-h-64 sm:max-h-72 bg-slate-900/5 rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
          <img
            src={resolvedImgUrl}
            alt={lesson.title}
            onError={() => setMediaError(true)}
            className="w-full h-auto max-h-60 sm:max-h-68 object-contain rounded-lg shadow-2xs"
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
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-xs font-medium">
          Text content empty
        </div>
      );
    }

    const cleanHtml = sanitizeHtml(rawHtml);

    return (
      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/80 border border-slate-200 p-3.5 rounded-xl font-sans">
        <div
          className={`prose max-w-none text-xs text-slate-800 leading-relaxed overflow-hidden transition-all ${
            isExpanded ? '' : 'max-h-24 line-clamp-4'
          }`}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />

        {rawHtml.length > 180 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer pt-1"
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

    return (
      <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl flex items-center justify-between text-xs font-sans">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <div>
            <strong className="font-bold text-purple-950 dark:text-purple-200 block">
              Quiz • {count} Question{count !== 1 ? 's' : ''}
            </strong>
            <span className="text-[10px] text-purple-700 dark:text-purple-300">
              Multiple Choice • Short Answer • True/False
            </span>
          </div>
        </div>

        <Badge variant="secondary" size="sm" className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
          Assessment
        </Badge>
      </div>
    );
  }

  // 7. ASSIGNMENT & PROJECT
  if (type === 'assignment' || type === 'project') {
    const instructions = content?.instructions || (lesson as any)?.assignment?.instructions || '';
    const maxScore = (lesson as any)?.assignment?.max_marks ?? content?.maxScore ?? 100;
    const subType = (lesson as any)?.assignment?.allow_file_submission
      ? (lesson as any)?.assignment?.allow_text_submission ? 'file + text' : 'file'
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
