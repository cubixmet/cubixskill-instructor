import React, { useState } from 'react';
import { Link as LinkIcon, CheckCircle2, Play } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { LiveSessionItem } from '../store/liveSession.store';

export interface LiveSessionRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: LiveSessionItem | null;
  onSaveRecording: (id: string, url: string, provider: 'YouTube' | 'Vimeo' | 'Google Drive' | 'Direct') => void;
}

export const LiveSessionRecordingModal: React.FC<LiveSessionRecordingModalProps> = ({
  isOpen,
  onClose,
  session,
  onSaveRecording,
}) => {
  const [recordingUrl, setRecordingUrl] = useState(session?.recordingUrl || '');
  const [provider, setProvider] = useState<'YouTube' | 'Vimeo' | 'Google Drive' | 'Direct'>(
    session?.recordingProvider || 'Direct'
  );

  if (!session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingUrl.trim()) return;

    onSaveRecording(session.id, recordingUrl, provider);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Session Recording - ${session.title}`}
      subtitle="Attach recording URL or upload MP4 file for student playback."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs text-left">
        <div>
          <label className="block font-semibold text-[#0F172A] dark:text-[#CBD5E1] mb-1">Recording Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as typeof provider)}
            className="w-full h-9 rounded-lg border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
          >
            <option value="Direct" className="bg-white dark:bg-[#111827]">CubixSkill CDN Direct MP4</option>
            <option value="YouTube" className="bg-white dark:bg-[#111827]">YouTube Unlisted Link</option>
            <option value="Vimeo" className="bg-white dark:bg-[#111827]">Vimeo Video Link</option>
            <option value="Google Drive" className="bg-white dark:bg-[#111827]">Google Drive Shared Link</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#0F172A] dark:text-[#CBD5E1] mb-1">Recording URL *</label>
          <Input
            placeholder="https://cdn.cubixskill.com/recordings/session.mp4 or YouTube URL"
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            required
            leftIcon={<LinkIcon className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
            className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B]"
          />
        </div>

        {session.recordingUrl && (
          <div className="p-3 bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)] rounded-xl space-y-2 text-emerald-950 dark:text-[#6EE7B7]">
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#34D399] shrink-0" />
              <span>Active Recording Attached</span>
            </div>
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 dark:bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Preview Recording
            </a>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
          <Button variant="outline" type="button" onClick={onClose} className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1]">
            Cancel
          </Button>
          <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-6 shadow-[0_4px_12px_rgba(37,99,235,0.12)]">
            Save Recording URL
          </Button>
        </div>
      </form>
    </Modal>
  );
};
