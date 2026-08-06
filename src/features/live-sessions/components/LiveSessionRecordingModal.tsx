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
          <label className="block font-bold text-slate-900 mb-1">Recording Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white font-bold text-slate-900"
          >
            <option value="Direct">CubixSkill CDN Direct MP4</option>
            <option value="YouTube">YouTube Unlisted Link</option>
            <option value="Vimeo">Vimeo Video Link</option>
            <option value="Google Drive">Google Drive Shared Link</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-900 mb-1">Recording URL *</label>
          <Input
            placeholder="https://cdn.cubixskill.com/recordings/session.mp4 or YouTube URL"
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            required
            leftIcon={<LinkIcon className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {session.recordingUrl && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Active Recording Attached</span>
            </div>
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Preview Recording
            </a>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#2563EB] text-white font-extrabold px-6">
            Save Recording URL
          </Button>
        </div>
      </form>
    </Modal>
  );
};
