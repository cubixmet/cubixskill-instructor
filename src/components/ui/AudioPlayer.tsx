import React, { useState } from 'react';
import { Headphones, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface AudioPlayerProps {
  src: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  subtitle,
  className,
}) => {
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  if (!src || !src.trim()) {
    return (
      <div className="w-full min-w-0 p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-center text-slate-400 dark:text-[#94A3B8] text-xs font-medium">
        Audio content not configured
      </div>
    );
  }

  if (hasPlaybackError) {
    return (
      <div className="w-full min-w-0 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-center text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="truncate">Audio preview could not be played.</span>
        </div>
        {src.startsWith('http') && (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-rose-200 dark:border-rose-800 hover:bg-rose-100/50 rounded-lg text-[11px] font-semibold text-rose-700 dark:text-rose-300 inline-flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>Open Audio</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full min-w-0 max-w-full rounded-lg border p-2 bg-slate-50 border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] space-y-2 font-sans',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="flex items-center gap-2.5 min-w-0 px-1 pt-0.5">
          <Headphones className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
          <div className="min-w-0 flex-1">
            {title && (
              <strong className="text-xs text-slate-900 dark:text-[#F8FAFC] block truncate font-semibold">
                {title}
              </strong>
            )}
            {subtitle && (
              <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] block truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      )}
      <audio
        controls
        preload="metadata"
        onError={() => setHasPlaybackError(true)}
        className="lesson-audio-player block w-full min-w-0 max-w-full h-9 dark:[color-scheme:dark]"
        src={src}
      >
        Your browser does not support audio playback.
      </audio>
    </div>
  );
};
