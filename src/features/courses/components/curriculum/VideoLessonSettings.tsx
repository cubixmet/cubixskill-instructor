import React, { useState } from 'react';
import {
  UploadCloud,
  Film,
  Globe,
  Layers,
  ExternalLink,
  Check,
  Info,
  RefreshCw,
  XCircle,
  Lock,
  PlayCircle,
  FileText,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import type { UnlockRuleType } from '../../../../types/curriculum.types';

export type VideoSourceType =
  | 'direct'
  | 'youtube'
  | 'vimeo'
  | 'bunny'
  | 's3'
  | 'cloudflare'
  | 'gdrive'
  | 'external';

export type VideoDeliveryMode = 'standard' | 'adaptive';
export type UploadStatus = 'waiting' | 'uploading' | 'processing' | 'ready' | 'failed' | 'cancelled';
export type CompletionMode = 'manual' | 'playback_end' | 'watch_percent' | 'watch_time' | 'full_completion';

interface VideoLessonSettingsProps {
  lesson: any;
  onSaveLesson: (updated: any) => void;
}

export const VideoLessonSettings: React.FC<VideoLessonSettingsProps> = ({
  lesson,
  onSaveLesson,
}) => {
  // 1. Video Source State
  const [sourceType, setSourceType] = useState<VideoSourceType>(
    ((lesson as any).videoSource as VideoSourceType) || 'direct'
  );
  const [externalUrl, setExternalUrl] = useState((lesson as any).videoUrl || '');

  // 2. Direct File Delivery Mode & Upload State
  const [deliveryMode, setDeliveryMode] = useState<VideoDeliveryMode>('standard');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('ready');
  const [uploadProgress, setUploadProgress] = useState(100);
  const [processingProgress, setProcessingProgress] = useState(100);
  const [selectedFile, setSelectedFile] = useState<{ name: string; sizeMb: number } | null>({
    name: 'react19_deepdive_lecture.mp4',
    sizeMb: 450,
  });

  // 3. Video Details State
  const [title, setTitle] = useState(lesson.title);
  const [shortDesc, setShortDesc] = useState('Comprehensive video tutorial explaining React 19 RSC and Actions.');
  const [fullDesc, setFullDesc] = useState('In this video lesson, we deep-dive into React 19 architecture, Server Components, Action hooks, and optimistic UI updates.');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80');
  const [captionsUrl, setCaptionsUrl] = useState('');
  const [transcriptText, setTranscriptText] = useState('Welcome to React 19 Server Components deep dive session...');
  const [durationMinutes, setDurationMinutes] = useState(lesson.durationMinutes || 15);
  const [isDemo, setIsDemo] = useState(lesson.isDemo || false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [preventSkipping, setPreventSkipping] = useState(true);
  const [resumePlayback, setResumePlayback] = useState(true);
  const [playbackSpeedControl, setPlaybackSpeedControl] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [watermark, setWatermark] = useState(true);
  const [deviceRestrictions, setDeviceRestrictions] = useState<'none' | 'mobile_only' | 'desktop_only' | 'restrict_tv'>('none');

  // 4. Video Completion Settings State
  const [completionMode, setCompletionMode] = useState<CompletionMode>('watch_percent');
  const [minWatchPercentPreset, setMinWatchPercentPreset] = useState<number | 'custom'>((lesson.unlockRule as any)?.minWatchPercent || 80);
  const [customWatchPercent, setCustomWatchPercent] = useState<number>(85);
  const [minWatchTimeMinutes, setMinWatchTimeMinutes] = useState<number>(10);
  const [_minWatchTimeSeconds, _setMinWatchTimeSeconds] = useState<number>(0);
  const [allowRewinding, setAllowRewinding] = useState(true);
  const [unlockNextAfterCompletion, setUnlockNextAfterCompletion] = useState(true);

  // 5. Unlock Rules State
  const [unlockType, setUnlockType] = useState<UnlockRuleType>((lesson.unlockRule as any)?.type || 'min_watch_percent');
  const [unlockScheduledDate, setUnlockScheduledDate] = useState((lesson.unlockRule as any)?.scheduledDate || '2026-09-01');
  const [unlockDaysAfterEnrollment, setUnlockDaysAfterEnrollment] = useState((lesson.unlockRule as any)?.daysAfterEnrollment || 3);

  // Calculated Effective Watch Percentage
  const effectiveWatchPercent = minWatchPercentPreset === 'custom' ? customWatchPercent : minWatchPercentPreset;

  // Pre-Upload Media Credit Breakdown Calculation (NO storage quota displayed)
  const fileSizeMb = selectedFile ? selectedFile.sizeMb : 450;
  const estUploadCredits = Math.max(0.1, Math.round((fileSizeMb / 100) * 10) / 10);
  const estProcessingCredits = deliveryMode === 'adaptive' ? 1.5 : 0;
  const totalEstMediaCredits = Math.round((estUploadCredits + estProcessingCredits) * 10) / 10;

  // Form Validation State
  const [titleError, setTitleError] = useState('');
  const [urlError, setUrlError] = useState('');

  // Handle Simulate Upload
  const handleSimulateUpload = () => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    setProcessingProgress(0);

    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          if (deliveryMode === 'adaptive') {
            setUploadStatus('processing');
            const procInterval = setInterval(() => {
              setProcessingProgress((proc) => {
                if (proc >= 100) {
                  clearInterval(procInterval);
                  setUploadStatus('ready');
                  return 100;
                }
                return proc + 20;
              });
            }, 300);
          } else {
            setUploadStatus('ready');
          }
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleCancelUpload = () => {
    setUploadStatus('cancelled');
    setUploadProgress(0);
    setProcessingProgress(0);
  };

  const handleRetryUpload = () => {
    handleSimulateUpload();
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMb = Math.round(file.size / (1024 * 1024));
      setSelectedFile({ name: file.name, sizeMb });
      handleSimulateUpload();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = Math.round(file.size / (1024 * 1024));
      setSelectedFile({ name: file.name, sizeMb });
      handleSimulateUpload();
    }
  };

  const handleSave = () => {
    let valid = true;
    if (!title.trim()) {
      setTitleError('Video title is required');
      valid = false;
    } else {
      setTitleError('');
    }

    if (sourceType !== 'direct' && !externalUrl.trim()) {
      setUrlError('Valid external URL or video identifier is required');
      valid = false;
    } else {
      setUrlError('');
    }

    if (!valid) return;

    onSaveLesson({
      ...lesson,
      title,
      description: shortDesc,
      videoSource: sourceType === 'direct' ? 'upload' : (sourceType as any),
      videoUrl: sourceType === 'direct' ? 'https://assets.cubixskill.com/videos/react19.mp4' : externalUrl,
      durationMinutes,
      isDemo,
      unlockRule: {
        type: unlockType,
        minWatchPercent: effectiveWatchPercent,
        scheduledDate: unlockScheduledDate,
        daysAfterEnrollment: unlockDaysAfterEnrollment,
      } as any,
    });
  };

  return (
    <div className="space-y-6 text-left text-xs">
      {/* ========================================================================= */}
      {/* 1. VIDEO SOURCE PROVIDER SELECTION */}
      {/* ========================================================================= */}
      <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
            <Film className="w-4 h-4 text-blue-600" />
            1. Select Video Source
          </h4>
          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
            Feature: Video Lessons
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'direct', label: 'Direct File Upload', icon: UploadCloud },
            { id: 'youtube', label: 'YouTube', icon: Globe },
            { id: 'vimeo', label: 'Vimeo', icon: Globe },
            { id: 'bunny', label: 'Bunny Stream', icon: Layers },
            { id: 'cloudflare', label: 'Cloudflare Stream', icon: Film },
            { id: 's3', label: 'AWS S3', icon: Film },
            { id: 'gdrive', label: 'Google Drive', icon: Globe },
            { id: 'external', label: 'External URL', icon: ExternalLink },
          ].map((src) => {
            const Icon = src.icon;
            const isSelected = sourceType === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => setSourceType(src.id as VideoSourceType)}
                className={`p-2.5 rounded-xl border text-[11px] font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{src.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DIRECT FILE UPLOAD WORKFLOW VS EXTERNAL PROVIDERS */}
      {/* ========================================================================= */}
      {sourceType === 'direct' ? (
        <div className="space-y-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              2. Video Delivery Mode Selection
            </h4>
            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Media Credits Meter Only
            </span>
          </div>

          {/* Delivery Mode Cards: Standard vs Adaptive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Standard Upload */}
            <div
              onClick={() => setDeliveryMode('standard')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                deliveryMode === 'standard'
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">Standard Upload</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      deliveryMode === 'standard'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {deliveryMode === 'standard' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Play the uploaded video in its original uploaded format.
                </p>
              </div>

              <ul className="text-[10px] space-y-1 font-semibold text-slate-600 pt-2 border-t border-slate-200/60">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Faster processing</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Lower media credit cost</li>
                <li className="flex items-center gap-1.5 text-slate-400">• No automatic quality conversion</li>
                <li className="flex items-center gap-1.5 text-slate-400">• No adaptive bitrate streaming</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Suitable for normal course videos</li>
              </ul>
            </div>

            {/* Option 2: Adaptive Streaming */}
            <div
              onClick={() => setDeliveryMode('adaptive')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                deliveryMode === 'adaptive'
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-xs">Adaptive Streaming</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[9px] rounded-md">
                      360p - 4K
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      deliveryMode === 'adaptive'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {deliveryMode === 'adaptive' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Process the uploaded video into multiple streaming qualities (360p, 480p, 720p, 1080p, 2K, 4K).
                </p>
              </div>

              <ul className="text-[10px] space-y-1 font-semibold text-slate-600 pt-2 border-t border-slate-200/60">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Adaptive bitrate streaming</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Automatic quality selection</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Better playback on slow internet</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Faster seeking & mobile optimization</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Professional streaming experience</li>
              </ul>
            </div>
          </div>

          {/* Pre-Upload Media Credits Summary Box */}
          <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl space-y-2 text-blue-950">
            <div className="flex items-center justify-between font-extrabold text-xs">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Pre-Upload Media Credit Summary
              </span>
              <span className="text-blue-800 font-black text-sm bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                {totalEstMediaCredits} Total Media Credits
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium pt-2 border-t border-blue-200/70">
              <div>File Size: <strong className="text-blue-900 font-bold">{fileSizeMb} MB</strong></div>
              <div>Mode: <strong className="text-blue-900 font-bold capitalize">{deliveryMode}</strong></div>
              <div>Upload Credits: <strong className="text-blue-900 font-bold">{estUploadCredits} Cr</strong></div>
              <div>Processing Credits: <strong className="text-blue-900 font-bold">{estProcessingCredits} Cr</strong></div>
            </div>

            <p className="text-[10px] text-blue-800 font-semibold pt-1 italic">
              * Media credits are deducted only after a successful upload or successful processing action.
            </p>
          </div>

          {/* Drag & Drop Upload Zone & Status Panel */}
          <div className="space-y-3">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 rounded-2xl text-center space-y-2 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-8 h-8 text-blue-600 mx-auto stroke-[1.5]" />
              <div>
                <p className="font-extrabold text-slate-900 text-xs">
                  Drag and drop your video file here, or{' '}
                  <label className="text-blue-600 underline cursor-pointer">
                    browse file
                    <input
                      type="file"
                      accept=".mp4,.mov,.mkv,.webm,.avi"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Supported formats: MP4, MOV, MKV, WEBM, AVI (Max file size: 2 GB)
                </p>
              </div>
            </div>

            {/* Selected File & Progress Card */}
            {selectedFile && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Film className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-extrabold text-slate-900 truncate">{selectedFile.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">({selectedFile.sizeMb} MB)</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase ${
                      uploadStatus === 'ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : uploadStatus === 'uploading'
                        ? 'bg-blue-100 text-blue-800'
                        : uploadStatus === 'processing'
                        ? 'bg-purple-100 text-purple-800'
                        : uploadStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {uploadStatus}
                  </span>
                </div>

                {/* Upload Progress Bar */}
                {uploadStatus === 'uploading' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600">
                      <span>Uploading File to Server...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Processing Progress Bar */}
                {uploadStatus === 'processing' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600">
                      <span>Transcoding Qualities (360p, 720p, 1080p, 4K)...</span>
                      <span>{processingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Ready Video Preview Mockup */}
                {uploadStatus === 'ready' && (
                  <div className="p-3 bg-slate-900 rounded-xl text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-[11px] font-bold text-slate-100">Video Transcoded & Ready for Streaming</p>
                        <p className="text-[9px] text-slate-400">
                          Mode: {deliveryMode === 'adaptive' ? 'Adaptive HLS (360p-4K)' : 'Original MP4'} • Actual Credits Used: {totalEstMediaCredits} Cr
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Preview Active
                    </span>
                  </div>
                )}

                {/* Upload Control Actions */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                  {uploadStatus === 'uploading' || uploadStatus === 'processing' ? (
                    <Button size="sm" variant="outline" onClick={handleCancelUpload} className="text-red-600 border-red-200">
                      <XCircle className="w-3.5 h-3.5" /> Cancel Upload
                    </Button>
                  ) : uploadStatus === 'cancelled' || uploadStatus === 'failed' ? (
                    <Button size="sm" variant="outline" onClick={handleRetryUpload}>
                      <RefreshCw className="w-3.5 h-3.5" /> Retry Upload
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={handleSimulateUpload}>
                      <RefreshCw className="w-3.5 h-3.5" /> Re-upload File
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EXTERNAL VIDEO PROVIDER CONFIGURATION */
        <div className="space-y-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              External Video Provider Settings
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Enter your video ID, embed code, or full URL for {sourceType.toUpperCase()}.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700">
              External Video URL or Asset Key <span className="text-red-500">*</span>
            </label>
            <Input
              value={externalUrl}
              onChange={(e) => {
                setExternalUrl(e.target.value);
                if (e.target.value.trim()) setUrlError('');
              }}
              placeholder={
                sourceType === 'youtube'
                  ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                  : sourceType === 'vimeo'
                  ? 'https://vimeo.com/76979871'
                  : sourceType === 'bunny'
                  ? 'https://video.bunnycdn.com/play/libraryId/videoId'
                  : 'https://cdn.example.com/video.mp4'
              }
              className={`w-full font-medium ${urlError ? 'border-red-500' : ''}`}
            />
            {urlError && <p className="text-[10px] text-red-500 font-bold">{urlError}</p>}
          </div>

          {/* Provider Notice */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-700 font-medium">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px]">
              <p className="font-extrabold text-slate-900">
                Video quality and streaming are managed by the selected provider.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Direct upload processing credits are not charged for provider-hosted videos. Apply credits only according to the configured external video usage rule.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIDEO DETAILS FIELDS */}
      {/* ========================================================================= */}
      <div className="space-y-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-600" />
          3. Video Details & Content Information
        </h4>

        <div className="space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700">
              Video Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError('');
              }}
              placeholder="e.g. Lesson 1.2: React 19 Server Components Deep Dive"
              className={`w-full font-semibold ${titleError ? 'border-red-500' : ''}`}
            />
            {titleError && <p className="text-[10px] text-red-500 font-bold">{titleError}</p>}
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700">Short Description</label>
            <Input
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief 1-line summary displayed in lesson list"
              className="w-full"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700">Full Description</label>
            <textarea
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              rows={3}
              placeholder="Detailed lesson overview, key takeaways, and prerequisites..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>

          {/* Thumbnail & Captions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">Custom Video Thumbnail URL</label>
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">Captions / Subtitles File (.vtt / .srt)</label>
              <Input
                value={captionsUrl}
                onChange={(e) => setCaptionsUrl(e.target.value)}
                placeholder="https://assets.cubixskill.com/subtitles/english.vtt"
                className="w-full"
              />
            </div>
          </div>

          {/* Transcript & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">Lesson Transcript</label>
              <Input
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Full text transcript for accessibility and search..."
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">Duration (Minutes)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full font-bold text-blue-700"
                />
              </div>
            </div>
          </div>

          {/* Video Options & Restrictions Grid */}
          <div className="pt-2">
            <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Playback Controls & Restrictions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Free Demo Lesson Preview</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Allow Offline Video Download</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preventSkipping}
                  onChange={(e) => setPreventSkipping(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Prevent Seeking Forward (Fast-Forwarding)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resumePlayback}
                  onChange={(e) => setResumePlayback(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Resume Playback Position</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={playbackSpeedControl}
                  onChange={(e) => setPlaybackSpeedControl(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Playback Speed Control (0.5x - 2x)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPlayNext}
                  onChange={(e) => setAutoPlayNext(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Auto-play Next Lesson</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watermark}
                  onChange={(e) => setWatermark(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Dynamic Watermark (Student ID Overlay)</span>
              </label>

              <div className="space-y-1">
                <select
                  value={deviceRestrictions}
                  onChange={(e) => setDeviceRestrictions(e.target.value as any)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-[11px] focus:outline-none focus:border-blue-600"
                >
                  <option value="none">Device Restrictions: None (All Devices)</option>
                  <option value="mobile_only">Mobile & Tablet Only</option>
                  <option value="desktop_only">Desktop Web Only</option>
                  <option value="restrict_tv">Restrict Smart TVs & Emulators</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. VIDEO COMPLETION SETTINGS */}
      {/* ========================================================================= */}
      <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          4. Video Completion Criteria
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Completion Mode Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700">Completion Trigger Condition</label>
            <select
              value={completionMode}
              onChange={(e) => setCompletionMode(e.target.value as CompletionMode)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="watch_percent">Minimum Watch Percentage Required</option>
              <option value="playback_end">Mark Complete After Playback Ends</option>
              <option value="watch_time">Minimum Watch Time (Minutes)</option>
              <option value="full_completion">Full Video Completion Required (100%)</option>
              <option value="manual">Mark Complete Manually by Student</option>
            </select>
          </div>

          {/* Dynamic Inputs based on Completion Mode */}
          {completionMode === 'watch_percent' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700">Required Watch Percentage</label>
              <div className="flex gap-2">
                <select
                  value={minWatchPercentPreset}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setMinWatchPercentPreset('custom');
                    } else {
                      setMinWatchPercentPreset(Number(val));
                    }
                  }}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-bold text-blue-700 focus:outline-none focus:border-blue-600"
                >
                  <option value={50}>50% Watch Minimum</option>
                  <option value={75}>75% Watch Minimum</option>
                  <option value={80}>80% Watch Minimum</option>
                  <option value={90}>90% Watch Minimum</option>
                  <option value={100}>100% Full Completion</option>
                  <option value="custom">Custom Percentage...</option>
                </select>

                {minWatchPercentPreset === 'custom' && (
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={customWatchPercent}
                    onChange={(e) => setCustomWatchPercent(Number(e.target.value))}
                    className="w-24 font-bold text-blue-700"
                  />
                )}
              </div>
            </div>
          )}

          {completionMode === 'watch_time' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700">Minimum Watch Time (Minutes)</label>
              <Input
                type="number"
                min={1}
                value={minWatchTimeMinutes}
                onChange={(e) => setMinWatchTimeMinutes(Number(e.target.value))}
                className="w-full font-bold text-blue-700"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] font-semibold text-slate-700">
          <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={allowRewinding}
              onChange={(e) => setAllowRewinding(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>Allow Rewinding Video</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={unlockNextAfterCompletion}
              onChange={(e) => setUnlockNextAfterCompletion(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>Unlock Next Lesson Automatically</span>
          </label>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. UNLOCK RULES */}
      {/* ========================================================================= */}
      <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-blue-600" />
          5. Lesson Access & Unlock Rules
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700">Unlock Condition</label>
            <select
              value={unlockType}
              onChange={(e) => setUnlockType(e.target.value as UnlockRuleType)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="immediate">Unlock Immediately</option>
              <option value="previous_lesson">Unlock After Previous Lesson</option>
              <option value="min_watch_percent">Unlock After Required Watch Percentage</option>
              <option value="full_video_completion">Unlock After Full Video Completion</option>
              <option value="assignment_approval">Unlock After Assignment Approval</option>
              <option value="quiz_pass">Unlock After Quiz Passing</option>
              <option value="scheduled_date">Unlock On Specific Date</option>
              <option value="days_after_enrollment">Unlock Days After Enrollment</option>
              <option value="manual">Unlock Manually by Instructor</option>
            </select>
          </div>

          {/* Dynamic Unlock Fields */}
          {(unlockType as string) === 'scheduled_date' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700">Scheduled Date</label>
              <Input
                type="date"
                value={unlockScheduledDate}
                onChange={(e) => setUnlockScheduledDate(e.target.value)}
                className="w-full font-bold text-blue-700"
              />
            </div>
          )}

          {unlockType === 'days_after_enrollment' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-700">Days After Student Enrollment</label>
              <Input
                type="number"
                min={1}
                value={unlockDaysAfterEnrollment}
                onChange={(e) => setUnlockDaysAfterEnrollment(Number(e.target.value))}
                className="w-full font-bold text-blue-700"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Action Banner */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[10px] text-slate-400 font-semibold">
          All changes are updated live into the Curriculum state.
        </span>
        <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5">
          <Check className="w-4 h-4 mr-1 stroke-[3]" /> Save Video Settings
        </Button>
      </div>
    </div>
  );
};
