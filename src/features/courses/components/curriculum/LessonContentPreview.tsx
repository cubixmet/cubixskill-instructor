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

interface LessonContentPreviewProps {
  lesson: CourseLesson;
}

export const LessonContentPreview: React.FC<LessonContentPreviewProps> = ({
  lesson,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const { type, content } = lesson;

  // 1. VIDEO LESSON
  if (type === 'video') {
    const rawUrl = content?.mediaUrl || content?.videoUrl || content?.fileUrl || '';
    const parsedEmbed = parseEmbedVideoUrl(rawUrl);

    if (!rawUrl.trim()) {
      return (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-xs font-medium">
          Content not configured
        </div>
      );
    }

    if (mediaError) {
      return (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Video unavailable. Please verify video URL or file source.</span>
        </div>
      );
    }

    return (
      <div className="w-full space-y-1.5 overflow-hidden">
        <div className="aspect-video w-full max-w-full max-h-72 sm:max-h-80 bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative">
          {parsedEmbed ? (
            <iframe
              src={parsedEmbed.embedUrl}
              title={`Preview ${lesson.title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              controls
              autoPlay={false}
              preload="metadata"
              onError={() => setMediaError(true)}
              className="w-full h-full object-contain"
            >
              <source src={rawUrl} type="video/mp4" />
              Your browser does not support HTML5 video preview.
            </video>
          )}
        </div>
      </div>
    );
  }

  // 2. IMAGE LESSON
  if (type === 'image') {
    const imgUrl = content?.mediaUrl || content?.fileUrl || '';

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
            src={imgUrl}
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
    const audioUrl = content?.mediaUrl || content?.fileUrl || '';

    return <AudioPlayer src={audioUrl} />;
  }

  // 4. DOCUMENT LESSON
  if (type === 'document') {
    const docUrl = content?.mediaUrl || content?.fileUrl || '';
    const rawFileName = content?.fileName || content?.fileUrl || lesson.title || 'Document File';
    const cleanFileName = rawFileName.startsWith('http')
      ? rawFileName.split('/').pop()?.split('?')[0] || lesson.title
      : rawFileName;

    return (
      <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2.5 text-xs w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <strong className="font-bold text-slate-900 block text-xs truncate">
              {cleanFileName}
            </strong>
            <span className="text-[10px] text-slate-500 font-medium block">PDF / Document</span>
          </div>
        </div>

        {docUrl ? (
          <a
            href={docUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 active:scale-95 rounded-md sm:rounded-lg text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 shrink-0 w-auto transition-all shadow-2xs whitespace-nowrap"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="whitespace-nowrap">Open Document</span>
          </a>
        ) : (
          <Badge variant="secondary" size="sm" className="text-[10px] px-2 py-0.5 shrink-0">
            Attached Document
          </Badge>
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

  // 6. QUIZ
  if (type === 'quiz') {
    const questions = content?.questions || [];
    const count = Array.isArray(questions) ? questions.length : 0;

    return (
      <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between text-xs font-sans">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
          <div>
            <strong className="font-bold text-purple-950 block">
              Quiz • {count} Question{count !== 1 ? 's' : ''}
            </strong>
            <span className="text-[10px] text-purple-700">
              Multiple Choice • Short Answer • True/False
            </span>
          </div>
        </div>

        <Badge variant="secondary" size="sm" className="border-purple-200 text-purple-700">
          Assessment
        </Badge>
      </div>
    );
  }

  // 7. ASSIGNMENT
  if (type === 'assignment') {
    const instructions = content?.instructions || '';
    const maxScore = content?.maxScore ?? 100;
    const subType = content?.submissionType || 'file';

    return (
      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5 text-xs text-slate-700 font-sans">
        <div className="flex items-center justify-between text-xs">
          <strong className="font-bold text-slate-900 capitalize flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-blue-600" /> {type}
          </strong>
          <Badge variant="primary" size="sm">
            {maxScore} Marks • {subType}
          </Badge>
        </div>

        {instructions.trim() && (
          <p className="text-[11px] text-slate-600 line-clamp-2 italic">
            "{instructions}"
          </p>
        )}
      </div>
    );
  }

  return null;
};
