import React, { useState } from 'react';
import {
  X,
  Save,
  Trash2,
  Lock,
} from 'lucide-react';
import type { CurriculumLesson, LessonType, DownloadAssetType, UnlockRuleType, LessonContent } from '../../../../types/curriculum.types';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { VideoLessonSettings } from './VideoLessonSettings';

interface LessonConfigPanelProps {
  lesson: CurriculumLesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLesson: (updated: CurriculumLesson) => void;
  onDeleteLesson: (lessonUuid: string) => void;
}

export const LessonConfigPanel: React.FC<LessonConfigPanelProps> = ({
  lesson,
  isOpen,
  onClose,
  onSaveLesson,
  onDeleteLesson,
}) => {
  // ALL hooks must be declared before any conditional returns (Rules of Hooks)
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [type, setType] = useState<LessonType>(lesson?.type ?? 'video');
  const [durationMinutes, setDurationMinutes] = useState(lesson?.durationMinutes ?? 0);
  const [isDemo, setIsDemo] = useState(lesson?.isDemo ?? false);
  const [isPublished, setIsPublished] = useState(lesson?.status === 'published');
  const [unlockType, setUnlockType] = useState<UnlockRuleType>(lesson?.unlockRule ?? 'immediate');
  const [minWatchPercent, setMinWatchPercent] = useState(
    lesson?.content?.minimumWatchPercentage ?? 80
  );
  const [videoSource, setVideoSource] = useState<string>(
    lesson?.content?.videoSource ?? 'upload'
  );
  const [videoUrl, setVideoUrl] = useState<string>(lesson?.content?.videoUrl ?? '');
  const [downloadAssetType, setDownloadAssetType] = useState<DownloadAssetType>(
    'pdf'
  );

  // Early return AFTER all hooks
  if (!isOpen || !lesson) return null;

  const handleSave = () => {
    const updatedContent: LessonContent = {
      ...(lesson.content ?? {}),
      videoSource,
      videoUrl,
      minimumWatchPercentage: unlockType === 'video_completion' ? minWatchPercent : undefined,
    };

    onSaveLesson({
      ...lesson,
      title,
      type,
      durationMinutes,
      isDemo,
      status: isPublished ? 'published' : 'draft',
      content: updatedContent,
      unlockRule: unlockType,
    });
    onClose();
  };

  // Silence unused-var for setters that are wired but not exposed in UI yet
  void setIsPublished;
  void setVideoSource;
  void setVideoUrl;
  void setDownloadAssetType;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-left bg-slate-900/40 backdrop-blur-xs flex justify-end">
      {/* Side Panel Drawer */}
      <div className="w-full sm:w-[480px] lg:w-[520px] bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
              Lesson Configuration Panel
            </span>
            <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
              {title || 'Edit Lesson Settings'}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">UUID: {lesson.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* General Metadata */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950">
              Basic Settings
            </h4>
            <Input
              label="Lesson Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Server Components Deep Dive"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">Lesson Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LessonType)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="video">Video Lesson</option>
                  <option value="audio">Audio Lesson</option>
                  <option value="pdf">PDF Document</option>
                  <option value="document">Text Article</option>
                  <option value="download">Downloadable Asset</option>
                  <option value="external_url">External Link</option>
                  <option value="embed">Embed iFrame</option>
                  <option value="quiz">Quiz Assessment</option>
                  <option value="assignment">Assignment Task</option>
                  <option value="live_class">Live Webinar</option>
                </select>
              </div>

              <Input
                label="Duration (Minutes)"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>

            {/* Quick Switches */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">Free Preview / Demo</span>
                <span className="text-[11px] text-slate-500">Allow non-enrolled students to watch as trial</span>
              </div>
              <input
                type="checkbox"
                checked={isDemo}
                onChange={(e) => setIsDemo(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-md cursor-pointer"
              />
            </div>
          </div>

          {/* Type-Specific Content Configuration */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950">
              Content Source Configuration
            </h4>

            {type === 'video' && (
              <VideoLessonSettings
                lesson={lesson}
                onSaveLesson={onSaveLesson}
              />
            )}

            {type === 'download' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <label className="block text-[11px] font-semibold text-slate-600">Downloadable File Type</label>
                <select
                  value={downloadAssetType}
                  onChange={(e) => setDownloadAssetType(e.target.value as DownloadAssetType)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="zip">ZIP Source Archive</option>
                  <option value="doc">Word Document</option>
                  <option value="docx">Word Document (docx)</option>
                  <option value="mp4">MP4 Video</option>
                  <option value="mp3">MP3 Audio</option>
                  <option value="other">Other Asset File</option>
                </select>
              </div>
            )}

            {type === 'quiz' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <span className="font-bold text-amber-900 block">Quiz Builder Integration</span>
                <p className="text-amber-800 text-[11px]">Configure questions, pass criteria, and automatic grading.</p>
                <Button size="sm" variant="outline" className="mt-1">Open Quiz Builder</Button>
              </div>
            )}

            {type === 'assignment' && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                <span className="font-bold text-purple-900 block">Assignment Builder Integration</span>
                <p className="text-purple-800 text-[11px]">Set instructions, max marks, and manual review criteria.</p>
                <Button size="sm" variant="outline" className="mt-1">Open Assignment Builder</Button>
              </div>
            )}
          </div>

          {/* Lesson Level Unlock Rules */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" /> Lesson Unlock &amp; Progression Rule
            </h4>

            <div className="space-y-2">
              <select
                value={unlockType}
                onChange={(e) => setUnlockType(e.target.value as UnlockRuleType)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="immediate">Unlock Immediately</option>
                <option value="previous_lesson">Unlock After Previous Lesson Completed</option>
                <option value="video_completion">Unlock After Video Completion</option>
                <option value="quiz_pass">Unlock After Passing Quiz</option>
                <option value="assignment_approval">Unlock After Assignment Approved</option>
                <option value="specific_date">Unlock on Scheduled Date</option>
                <option value="manual">Unlock Manually</option>
              </select>

              {unlockType === 'video_completion' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-blue-900">Minimum Required Watch %</span>
                  <input
                    type="number"
                    value={minWatchPercent}
                    onChange={(e) => setMinWatchPercent(Number(e.target.value))}
                    className="w-20 h-8 px-2 bg-white border border-blue-300 rounded-lg font-bold text-center text-blue-950"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteLesson(lesson.id)}
            className="text-rose-600 hover:bg-rose-50 border-rose-200"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
              Save Lesson
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
