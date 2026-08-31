import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media.utils';
import type { MediaFileApiItem } from '../../services/storage.service';

interface LessonVideoPlayerProps {
  media?: MediaFileApiItem | null;
  videoUrl?: string;
  streamUrl?: string;
  title?: string;
  onRetryProcessing?: () => void;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  media,
  videoUrl,
  streamUrl,
  title = 'Video Player',
  onRetryProcessing
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [qualities, setQualities] = useState<{ index: number; height: number; label: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const processingStatus = media?.processing_status || 'READY';
  const rawStreamPath = media?.stream_url || streamUrl || '';
  const rawVideoPath = media?.url || videoUrl || '';

  const resolvedStreamUrl = resolveMediaUrl(rawStreamPath);
  const resolvedVideoUrl = resolveMediaUrl(rawVideoPath);

  // Initialize HLS / Native Playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setMediaError(null);

    if (processingStatus === 'QUEUED' || processingStatus === 'PROCESSING') {
      return;
    }

    const isAdaptiveOn = media ? (media.adaptive_streaming_enabled !== false && media.processing_mode === 'hls') : true;
    const hlsSource = (isAdaptiveOn && processingStatus !== 'FAILED') ? (resolvedStreamUrl || (resolvedVideoUrl.endsWith('.m3u8') ? resolvedVideoUrl : '')) : '';
    const mp4Source = resolvedVideoUrl;

    if (hlsSource && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        autoStartLoad: true,
        startLevel: -1, // Auto bitrate
      });
      hlsRef.current = hls;

      hls.loadSource(hlsSource);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const parsedQualities = data.levels.map((lvl, idx) => ({
          index: idx,
          height: lvl.height,
          label: `${lvl.height}p`
        })).sort((a, b) => b.height - a.height);

        setQualities(parsedQualities);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (hls.currentLevel === -1) {
          setCurrentQuality(-1);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.warn('HLS Fatal Error, falling back to original video source:', data);
          if (mp4Source) {
            video.src = mp4Source;
          } else {
            setMediaError('Streaming manifest error.');
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && hlsSource) {
      // Native HLS (Safari)
      video.src = hlsSource;
    } else if (mp4Source) {
      // Fallback MP4
      video.src = mp4Source;
    } else {
      setMediaError('No compatible video stream available.');
    }
  }, [resolvedStreamUrl, resolvedVideoUrl, processingStatus]);

  const handleQualityChange = (levelIndex: number) => {
    setCurrentQuality(levelIndex);
    setShowQualityMenu(false);

    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  if (processingStatus === 'QUEUED' || processingStatus === 'PROCESSING') {
    return (
      <div className="aspect-video w-full max-h-80 bg-slate-900 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-indigo-200">Preparing Adaptive HLS Streaming...</h4>
          <p className="text-xs text-slate-400 max-w-sm">
            Backend is generating multi-quality video renditions for optimal playback performance.
          </p>
        </div>
      </div>
    );
  }

  if (processingStatus === 'FAILED' || mediaError) {
    return (
      <div className="aspect-video w-full max-h-80 bg-rose-950/90 border border-rose-800 rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-rose-200">Adaptive Video Stream Error</h4>
          <p className="text-xs text-rose-300 max-w-sm">
            {mediaError || media?.processing_error || 'Video processing encountered an error.'}
          </p>
        </div>
        {onRetryProcessing && (
          <button
            type="button"
            onClick={onRetryProcessing}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Video Processing
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full max-h-80 bg-slate-950 rounded-xl overflow-hidden shadow-2xl group flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setMediaError('HTML5 Video Error: Source unavailable.')}
      />

      {/* Control Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between pointer-events-none">
        <div className="flex items-center justify-between text-white text-xs font-medium pointer-events-auto">
          <span className="truncate max-w-[240px] font-semibold">{title}</span>
          <span className="px-2 py-0.5 bg-indigo-600/80 text-white rounded text-[10px] font-bold">
            {currentQuality === -1 ? 'Auto HLS' : qualities.find(q => q.index === currentQuality)?.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-white pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="text-white/80 hover:text-white transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Quality Selector Button */}
            {qualities.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{currentQuality === -1 ? 'Auto' : qualities.find(q => q.index === currentQuality)?.label}</span>
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 text-xs z-20">
                    <button
                      type="button"
                      onClick={() => handleQualityChange(-1)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-indigo-600 font-medium ${
                        currentQuality === -1 ? 'text-indigo-400 font-bold bg-indigo-950/50' : 'text-slate-200'
                      }`}
                    >
                      Auto (Adaptive)
                    </button>
                    {qualities.map((q) => (
                      <button
                        key={q.index}
                        type="button"
                        onClick={() => handleQualityChange(q.index)}
                        className={`w-full text-left px-3 py-1.5 hover:bg-indigo-600 font-medium ${
                          currentQuality === q.index ? 'text-indigo-400 font-bold bg-indigo-950/50' : 'text-slate-200'
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-white/80 hover:text-white transition"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
