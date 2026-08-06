import React, { useState } from 'react';
import {
  UploadCloud,
  Film,
  Zap,
  Check,
  Globe,
  Info,
  Layers,
  Sparkles,
  PlayCircle,
  Video,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

export type VideoSourceType = 'direct' | 'youtube' | 'vimeo' | 'bunny' | 'cloudflare' | 'external';
export type VideoDeliveryMode = 'standard' | 'adaptive';

export interface VideoLessonItem {
  id: string;
  title: string;
  sourceType: VideoSourceType;
  videoUrl?: string;
  fileName?: string;
  deliveryMode?: VideoDeliveryMode;
  additionalCreditCost?: number;
  duration?: string;
}

export const VideoUploadWorkflow: React.FC = () => {
  // Mock lessons list
  const [lessons, setLessons] = useState<VideoLessonItem[]>([
    {
      id: 'les-1',
      title: '01. Course Overview & Prerequisites',
      sourceType: 'direct',
      fileName: '01_intro_react19.mp4',
      deliveryMode: 'adaptive',
      additionalCreditCost: 0.5,
      duration: '12:45',
    },
    {
      id: 'les-2',
      title: '02. Architecture & Directory Structure',
      sourceType: 'youtube',
      videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '08:20',
    },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [lessonTitle, setLessonTitle] = useState('');
  const [sourceType, setSourceType] = useState<VideoSourceType>('direct');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<VideoDeliveryMode>('standard');
  const [isUploading, setIsUploading] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetForm = () => {
    setLessonTitle('');
    setSourceType('direct');
    setVideoUrl('');
    setSelectedFile(null);
    setDeliveryMode('standard');
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSaveLesson = () => {
    if (!lessonTitle.trim()) {
      showToast('Please enter a lesson title.');
      return;
    }

    if (sourceType === 'direct' && !selectedFile) {
      // Allow fallback sample file name for demo
    }

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const newLesson: VideoLessonItem = {
        id: `les-${Date.now()}`,
        title: lessonTitle,
        sourceType,
        videoUrl: sourceType !== 'direct' ? videoUrl : undefined,
        fileName: sourceType === 'direct' ? (selectedFile?.name || 'react_19_lesson.mp4') : undefined,
        deliveryMode: sourceType === 'direct' ? deliveryMode : undefined,
        additionalCreditCost: sourceType === 'direct' && deliveryMode === 'adaptive' ? 0.5 : 0,
        duration: '10:00',
      };

      setLessons((prev) => [...prev, newLesson]);
      setIsModalOpen(false);
      resetForm();
      showToast('Video lesson saved successfully!');
    }, 500);
  };

  const handleDeleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    showToast('Lesson deleted.');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workflow Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Curriculum Video Lessons Upload
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
              Step 3
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Upload video lessons directly or embed external provider URLs. Adaptive streaming settings configured per upload.
          </p>
        </div>

        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenModal}>
          Add Video Lesson
        </Button>
      </div>

      {/* Video Lessons List */}
      <Card padding="none" className="overflow-hidden">
        {lessons.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Film className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No video lessons uploaded yet</h4>
            <p className="text-xs max-w-sm mx-auto">
              Click the "Add Video Lesson" button above to upload a video or embed external URLs.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lessons.map((les, index) => (
              <div key={les.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center shrink-0 border border-blue-200/60">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{les.title}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-extrabold text-[10px] uppercase">
                        {les.sourceType}
                      </span>
                      {les.deliveryMode === 'adaptive' && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] uppercase flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-600" /> Adaptive Stream
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{les.fileName || les.videoUrl || 'Direct Video Upload'}</span>
                      {les.duration && (
                        <>
                          <span>•</span>
                          <span>{les.duration}</span>
                        </>
                      )}
                      {les.additionalCreditCost ? (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-bold">+{les.additionalCreditCost} Cr / student</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteLesson(les.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upload Video Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Video Lesson"
        subtitle="Configure video source and delivery options for optimal student playback."
      >
        <div className="space-y-5 text-left">
          {/* Lesson Title */}
          <Input
            label="Lesson Title *"
            placeholder="e.g. 03. State Management with Zustand"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
          />

          {/* Video Source Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Video Source Provider *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'direct', label: 'Direct File Upload', icon: UploadCloud },
                { id: 'youtube', label: 'YouTube', icon: Globe },
                { id: 'vimeo', label: 'Vimeo', icon: Globe },
                { id: 'bunny', label: 'Bunny Stream', icon: Layers },
                { id: 'cloudflare', label: 'Cloudflare Stream', icon: Film },
                { id: 'external', label: 'External URL', icon: ExternalLink },
              ].map((src) => {
                const Icon = src.icon;
                const isSelected = sourceType === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSourceType(src.id as VideoSourceType)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-600 ring-1 ring-blue-600/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{src.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source 1: DIRECT FILE UPLOAD */}
          {sourceType === 'direct' ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Choose Video File *
                </label>
                <div className="p-6 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl bg-slate-50/50 hover:bg-blue-50/30 transition-all text-center space-y-2 cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-900">
                    {selectedFile ? selectedFile.name : 'Click to select or drag video file here'}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">MP4, MOV, WebM or MKV up to 5GB</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="video-file-input"
                  />
                  <label
                    htmlFor="video-file-input"
                    className="inline-block px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                  >
                    Browse Computer
                  </label>
                </div>
              </div>

              {/* DIRECT UPLOAD SPECIFIC: VIDEO DELIVERY MODE SELECTION */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Video Delivery Mode</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Choose how this video should be delivered to students.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Standard Upload */}
                  <div
                    onClick={() => setDeliveryMode('standard')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 text-left ${
                      deliveryMode === 'standard'
                        ? 'bg-blue-50/60 border-blue-600 ring-1 ring-blue-600/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-slate-900">Option 1: Standard Upload</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          deliveryMode === 'standard' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}>
                          {deliveryMode === 'standard' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        The uploaded video will be played exactly as uploaded.
                      </p>
                    </div>

                    <ul className="text-[11px] space-y-1 font-semibold text-slate-600 pt-2 border-t border-slate-200/60">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Faster processing</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Lower credit cost</li>
                      <li className="flex items-center gap-1.5 text-slate-400">• No adaptive streaming</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Best for small courses</li>
                    </ul>

                    <div className="pt-2 border-t border-slate-200/60 font-bold text-xs text-slate-700">
                      Cost: Base Video Credit Only
                    </div>
                  </div>

                  {/* Option 2: Adaptive Streaming */}
                  <div
                    onClick={() => setDeliveryMode('adaptive')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 text-left ${
                      deliveryMode === 'adaptive'
                        ? 'bg-blue-50/60 border-blue-600 ring-1 ring-blue-600/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900">Option 2: Adaptive Streaming</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[9px] uppercase">
                            HD/4K
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          deliveryMode === 'adaptive' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}>
                          {deliveryMode === 'adaptive' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Automatically generate multiple streaming qualities (360p, 480p, 720p, 1080p, 2K, 4K). Changes quality dynamically based on student speed.
                      </p>
                    </div>

                    <ul className="text-[11px] space-y-1 font-semibold text-slate-600 pt-2 border-t border-slate-200/60">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Adaptive Bitrate Streaming</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Better playback & faster seeking</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Mobile optimized</li>
                    </ul>

                    {/* Estimated Additional Credit Cost Box */}
                    <div className="p-2.5 bg-blue-100/70 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 flex items-center justify-between">
                      <span>Est. Additional Cost:</span>
                      <span className="text-blue-700 font-black">+0.5 Credits / student</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Source 2: EXTERNAL URL PROVIDERS (YouTube, Vimeo, Bunny, Cloudflare, etc.) */
            <div className="space-y-4 pt-2">
              <Input
                label="Video / Embed URL *"
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />

              {/* PROVIDER MANAGED STREAMING NOTICE */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-700 font-medium">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900">Streaming Quality Provider Managed</p>
                  <p className="text-slate-500 mt-0.5">
                    Streaming quality is managed by your selected video provider.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modal Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={isUploading}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {isUploading ? 'Saving Lesson...' : 'Save Video Lesson'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
