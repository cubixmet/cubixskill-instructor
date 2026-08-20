import React from 'react';
import { Headphones } from 'lucide-react';
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
  if (!src || !src.trim()) {
    return (
      <div className="w-full min-w-0 p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-center text-slate-400 dark:text-[#94A3B8] text-xs font-medium">
        Audio content not configured
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full min-w-0 max-w-full rounded-lg border p-2 bg-slate-50 border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] space-y-2',
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
        className="lesson-audio-player block w-full min-w-0 max-w-full h-9 dark:[color-scheme:dark]"
        src={src}
      >
        Your browser does not support audio playback.
      </audio>
    </div>
  );
};
