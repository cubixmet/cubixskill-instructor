import React, { useState } from 'react';
import {
  Video,
  UploadCloud,
  Globe,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import type { CourseLesson } from '../../../../types/curriculum.types';
import { calculateVideoCredits } from '../../utils/videoCredits.util';
import { LessonResourcesSection } from './LessonResourcesSection';
import { useCurriculumStore } from '../../store/curriculum.store';
import { MediaPickerModal } from '../../../../components/media/MediaPickerModal';

interface VideoLessonSettingsProps {
  lesson: CourseLesson;
  moduleTitle?: string;
  onSaveLesson: (updated: Partial<CourseLesson>) => void;
  onChangeModule?: () => void;
  isCreateMode?: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const parseEmbedVideoUrl = (url: string) => {
  if (!url) return null;
  const cleanUrl = url.trim();

  // YouTube match
  const ytMatch = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      id: ytMatch[1],
    };
  }

  // Vimeo match
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      id: vimeoMatch[1],
    };
  }

  // Generic https url fallback
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return {
      provider: 'generic',
      embedUrl: cleanUrl,
      id: 'custom',
    };
  }

  return null;
};

export const VideoLessonSettings: React.FC<VideoLessonSettingsProps> = ({
  lesson,
  moduleTitle = 'Selected Module',
  onSaveLesson,
  onChangeModule,
  isCreateMode = false,
}) => {
  // Stepper state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Section 1: General
  const [title, setTitle] = useState(lesson.title || '');
  const [description, setDescription] = useState(lesson.description || '');
  const [titleError, setTitleError] = useState('');

  // Section 2: Video Content & Source
  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>(
    lesson.content?.videoSource === 'url' ? 'url' : 'upload'
  );
  const [videoUrl, setVideoUrl] = useState(lesson.content?.videoUrl || '');
  const [urlError, setUrlError] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; sizeMb: number; url?: string } | null>(
    lesson.content?.fileUrl
      ? { name: lesson.content.fileUrl, sizeMb: 250, url: lesson.content.fileUrl }
      : null
  );
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [uploadProgress, _setUploadProgress] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(lesson.durationMinutes || 15);
  const [isDurationAuto, setIsDurationAuto] = useState(true);
  const [adaptiveStreaming, setAdaptiveStreaming] = useState(
    lesson.content?.allowDownload !== false
  );

  const parsedEmbed = parseEmbedVideoUrl(videoUrl);

  const handleNextFromGeneral = () => {
    if (!title.trim()) {
      setTitleError('Lesson title is required.');
      return;
    }
    setTitleError('');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Lesson title is required.');
      setCurrentStep(1);
      return;
    }
    setTitleError('');

    if (sourceMode === 'url' && videoUrl.trim()) {
      if (!parsedEmbed) {
        setUrlError('Please enter a valid video iFrame/embed URL.');
        setCurrentStep(2);
        return;
      }
    }
    setUrlError('');

    onSaveLesson({
      title: title.trim(),
      description: description.trim(),
      type: 'video',
      status: isCreateMode ? 'published' : (lesson.status || 'published'),
      durationMinutes,
      isDemo: false,
      content: {
        ...lesson.content,
        videoSource: sourceMode,
        videoUrl: sourceMode === 'url' ? videoUrl.trim() : undefined,
        fileUrl: sourceMode === 'upload' ? selectedFile?.name : undefined,
        allowDownload: sourceMode === 'upload' ? adaptiveStreaming : false,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans max-w-3xl mx-auto pb-36 md:pb-10 w-full min-w-0 px-1 md:px-0">
      {/* Top Header & Context Banner */}
      <div className="p-3.5 sm:p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {isCreateMode ? 'Create Video Lesson' : 'Edit Video Lesson'}
                </h3>
                <Badge variant="primary" size="sm" className="text-[10px] px-2 py-0.5">Video</Badge>
              </div>
              <p className="text-[11px] text-[#64748B] font-medium flex items-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Adding to: <strong>{moduleTitle}</strong></span>
              </p>
            </div>
          </div>

          {onChangeModule && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onChangeModule}
              className="text-[11px] font-semibold h-7 px-2.5 text-[#2563EB]"
            >
              Change Module
            </Button>
          )}
        </div>

        {/* Compact 2-Step Stepper Bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentStep === 1
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>General</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (title.trim()) {
                setCurrentStep(2);
              } else {
                setTitleError('Lesson title is required.');
              }
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentStep === 2
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Content</span>
          </button>
        </div>
      </div>

      {/* STEP 1: GENERAL */}
      {currentStep === 1 && (
        <div className="p-4 sm:p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs space-y-4">
          <div className="border-b border-[#E2E8F0] pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              1. General Details
            </h4>
            <p className="text-[11px] text-[#64748B]">Primary title and description for this video lesson.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Lesson Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={title}
                autoFocus
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) setTitleError('');
                }}
                placeholder="e.g. Introduction to React Components"
                className="h-11 text-xs sm:text-sm font-medium rounded-xl"
                error={titleError}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Short Description <span className="text-[#64748B] font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short overview of what students will learn in this video lesson..."
                rows={3}
                className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition-all resize-y font-normal"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONTENT */}
      {currentStep === 2 && (
        <div className="p-4 sm:p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs space-y-4">
          <div className="border-b border-[#E2E8F0] pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              2. Video Content & Source
            </h4>
            <p className="text-[11px] text-[#64748B]">Configure video payload, storage, and playback options.</p>
          </div>

          {/* Source Segmented Control */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#0F172A]">Content Source</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setSourceMode('upload')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sourceMode === 'upload'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('url')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sourceMode === 'url'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>iFrame URL</span>
              </button>
            </div>

            {/* MODE A: UPLOAD FILE / CHOOSE FROM MEDIA LIBRARY */}
            {sourceMode === 'upload' && (
              <div className="space-y-3 pt-1">
                {!selectedFile ? (
                  <div
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="border-2 border-dashed border-[#2563EB]/40 hover:border-[#2563EB] bg-blue-50/20 p-5 rounded-2xl text-center space-y-2 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-7 h-7 text-[#2563EB] mx-auto" />
                    <div>
                      <strong className="text-xs font-bold text-[#0F172A] block">
                        Choose Video from Media Library or Upload New
                      </strong>
                      <span className="text-[10px] text-[#64748B]">
                        Supports MP4, WebM formats
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs px-3 border-[#2563EB] text-[#2563EB] font-semibold mx-auto"
                    >
                      Select / Upload Video
                    </Button>
                  </div>
                ) : (
                  <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-[#0F172A] block truncate">
                            {selectedFile.name}
                          </strong>
                          <span className="text-[10px] text-[#64748B]">
                            {selectedFile.sizeMb} MB • Ready for streaming
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsMediaPickerOpen(true)}
                          className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          Replace
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                          title="Remove from lesson"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* 16:9 Video Player Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Video Preview
                        </span>
                        <Badge variant="success" size="sm" className="text-[10px] px-2 py-0.5">
                          {adaptiveStreaming ? 'Ready • Adaptive' : 'Ready • MP4'}
                        </Badge>
                      </div>

                      <div className="aspect-video w-full max-h-72 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                        <video
                          controls
                          preload="metadata"
                          autoPlay={false}
                          className="w-full h-full object-contain"
                          poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
                        >
                          <source
                            src={
                              selectedFile.url ||
                              'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4'
                            }
                            type="video/mp4"
                          />
                          Your browser does not support HTML5 video preview.
                        </video>
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Picker Modal */}
                <MediaPickerModal
                  isOpen={isMediaPickerOpen}
                  onClose={() => setIsMediaPickerOpen(false)}
                  defaultMediaType="video"
                  title="Select Video Asset"
                  onSelectAsset={(asset) => {
                    setSelectedFile({
                      name: asset.name,
                      sizeMb: asset.sizeMb,
                      url: asset.url,
                    });
                  }}
                />

                {/* Adaptive Streaming Option */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Adaptive Streaming
                    </strong>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      Optimize playback for different internet speeds.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={adaptiveStreaming}
                    onChange={(e) => setAdaptiveStreaming(e.target.checked)}
                    className="w-4 h-4 text-[#2563EB] rounded cursor-pointer shrink-0"
                  />
                </div>

                {/* Storage & Credit Calculation */}
                {selectedFile && (() => {
                  const creditsInfo = calculateVideoCredits(selectedFile.sizeMb, adaptiveStreaming);
                  const availableCredits = 50;
                  const hasInsufficientCredits = creditsInfo.totalCreditsRequired > availableCredits;

                  return (
                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2 font-sans">
                      <div className="flex items-center justify-between text-xs border-b border-[#E2E8F0] pb-1.5">
                        <span className="font-bold text-[#0F172A]">Storage & Credits</span>
                        <span className="text-[10px] text-[#64748B]">Available: <strong>{availableCredits} Credits</strong></span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2 bg-white border border-[#E2E8F0] rounded-lg">
                          <span className="text-[10px] text-[#64748B] block font-semibold">File Size</span>
                          <strong className="text-xs text-[#0F172A]">{selectedFile.sizeMb} MB</strong>
                        </div>

                        {adaptiveStreaming && (
                          <div className="p-2 bg-white border border-[#E2E8F0] rounded-lg">
                            <span className="text-[10px] text-[#64748B] block font-semibold">Streaming Storage</span>
                            <strong className="text-xs text-[#0F172A]">
                              {(creditsInfo.estimatedStreamingMb / 1024).toFixed(1)} GB
                            </strong>
                          </div>
                        )}

                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
                          <span className="text-[10px] text-[#2563EB] block font-semibold">Credits Required</span>
                          <strong className="text-xs text-[#2563EB] font-bold">
                            {creditsInfo.totalCreditsRequired} Credits
                          </strong>
                        </div>
                      </div>

                      {hasInsufficientCredits && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-semibold flex items-center justify-between gap-2">
                          <span>Insufficient Credits ({creditsInfo.totalCreditsRequired} needed)</span>
                          <Button type="button" variant="outline" size="xs" className="border-rose-300 text-rose-700 bg-white h-7">
                            Buy Credits
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* MODE B: IFRAME URL */}
            {sourceMode === 'url' && (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[11px] font-medium text-[#2563EB] flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span>Embedded video uses <strong>0 Storage Credits</strong>.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Video iFrame URL <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      if (e.target.value.trim()) setUrlError('');
                    }}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    className="h-11 text-xs sm:text-sm font-medium rounded-xl"
                    error={urlError}
                  />
                </div>

                {/* 16:9 Responsive Embed Preview */}
                {parsedEmbed ? (
                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0F172A] flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Provider: <strong>{parsedEmbed.provider}</strong>
                      </span>
                      <Badge variant="success" size="sm" className="text-[10px] px-2 py-0.5">Valid Embed</Badge>
                    </div>

                    <div className="aspect-video w-full max-h-72 bg-slate-900 rounded-xl overflow-hidden shadow-inner">
                      <iframe
                        src={parsedEmbed.embedUrl}
                        title="Video Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : videoUrl.trim() ? (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Please enter a valid video iFrame/embed URL.</span>
                  </div>
                ) : null}
              </div>
            )}

            {/* DURATION */}
            <div className="pt-1">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">
                      Duration: {durationMinutes} mins
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {isDurationAuto ? 'Auto-detected metadata' : 'Manual duration'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isDurationAuto ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Input
                        type="number"
                        min={1}
                        max={600}
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value) || 1)}
                        className="w-20 h-8 text-xs font-bold"
                      />
                      <span className="text-[11px] text-[#64748B]">mins</span>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => setIsDurationAuto(false)}
                      className="text-[11px] text-[#2563EB] font-bold h-7"
                    >
                      Edit Duration
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LESSON ATTACHED RESOURCES SECTION */}
          <LessonResourcesSection
            resources={lesson?.content?.resources || []}
            courseUuid={lesson?.courseUuid || '550e8400-e29b-41d4-a716-446655440000'}
            moduleUuid={lesson?.moduleUuid}
            lessonUuid={lesson?.uuid}
            onRemoveResource={(resId) => {
              if (lesson?.uuid) {
                useCurriculumStore.getState().detachResourceFromLesson(lesson.uuid, resId);
              }
            }}
          />
        </div>
      )}

      {/* Sticky Mobile Bottom Action Bar (Above App Bottom Nav) / Desktop Action Bar */}
      <div className="fixed md:relative bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 z-35 p-3 md:p-0 bg-white/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-0 border-[#E2E8F0] shadow-lg md:shadow-none flex items-center justify-between gap-3 md:pt-2 max-w-3xl mx-auto">
        {currentStep === 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSaveLesson({ title })}
              className="h-11 md:h-10 text-xs font-bold px-4 md:px-5 shrink-0"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleNextFromGeneral}
              className="h-11 md:h-10 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-xs sm:text-sm font-bold px-5 md:px-6 shadow-md flex-1 md:flex-initial"
            >
              Next: Content
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="h-11 md:h-10 text-xs font-bold px-4 md:px-5 shrink-0"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={uploadProgress !== null}
              leftIcon={<CheckCircle2 className="w-4 h-4 stroke-[3]" />}
              className="h-11 md:h-10 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-xs sm:text-sm font-bold px-5 md:px-6 shadow-md flex-1 md:flex-initial"
            >
              {isCreateMode ? 'Create Lesson' : 'Save Changes'}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};
