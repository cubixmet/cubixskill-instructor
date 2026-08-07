import React, { useState, useEffect } from 'react';
import {
  Video,
  Link as LinkIcon,
  Plus,
  Trash2,
  Paperclip,
  AlertTriangle,
  Radio,
  Megaphone,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { LiveSessionItem } from '../store/liveSession.store';
import type { AnnouncementAttachment } from '../../announcements/store/announcement.store';

export interface CreateLiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LiveSessionItem>) => void;
  editingSession?: LiveSessionItem | null;
}

export const CreateLiveSessionModal: React.FC<CreateLiveSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingSession,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sessionType, setSessionType] = useState<'external' | 'cubixskill_live'>('external');
  const [platform, setPlatform] = useState<'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Jitsi' | 'Custom'>('Zoom');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [passcode, setPasscode] = useState('');

  const [scheduledDate, setScheduledDate] = useState('2026-08-10');
  const [scheduledTime, setScheduledTime] = useState('17:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [hostName, setHostName] = useState('Dr. Vikramaditya Rao');

  const [allowChat, setAllowChat] = useState(true);
  const [allowQuestions, setAllowQuestions] = useState(true);
  const [isRecorded, setIsRecorded] = useState(true);
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [autoCreateAnnouncement, setAutoCreateAnnouncement] = useState(true);

  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);
  const [storageNoticeOpen, setStorageNoticeOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<AnnouncementAttachment | null>(null);

  useEffect(() => {
    const apply = () => {
      if (editingSession) {
        setTitle(editingSession.title);
        setDescription(editingSession.description);
        setInstructions(editingSession.instructions || '');
        setSessionType(editingSession.sessionType || 'external');
        setPlatform(editingSession.platform);
        setMeetingUrl(editingSession.meetingUrl);
        setMeetingId(editingSession.meetingId || '');
        setPasscode(editingSession.passcode || '');
        setScheduledDate(editingSession.scheduledDate);
        setScheduledTime(editingSession.scheduledTime);
        setDurationMinutes(editingSession.durationMinutes);
        setHostName(editingSession.hostName);
        setAllowChat(editingSession.allowChat);
        setAllowQuestions(editingSession.allowQuestions);
        setIsRecorded(editingSession.isRecorded);
        setNotifyStudents(editingSession.notifyStudents);
        setAutoCreateAnnouncement(editingSession.autoCreateAnnouncement ?? true);
        setAttachments(editingSession.attachments || []);
      } else {
        setTitle('');
        setDescription('');
        setInstructions('');
        setSessionType('external');
        setPlatform('Zoom');
        setMeetingUrl('');
        setMeetingId('');
        setPasscode('');
        setScheduledDate('2026-08-10');
        setScheduledTime('17:00');
        setDurationMinutes(60);
        setHostName('Dr. Vikramaditya Rao');
        setAllowChat(true);
        setAllowQuestions(true);
        setIsRecorded(true);
        setNotifyStudents(true);
        setAutoCreateAnnouncement(true);
        setAttachments([]);
      }
    };
    const tid = setTimeout(apply, 0);
    return () => clearTimeout(tid);
  }, [editingSession, isOpen]);

  const handleRequestAttachment = () => {
    const newAtt: AnnouncementAttachment = {
      id: `att-${crypto.randomUUID()}`,
      name: `Session_Resource_${attachments.length + 1}.pdf`,
      sizeMb: 3.5,
      type: 'pdf',
      url: '#',
    };
    setPendingFile(newAtt);
    setStorageNoticeOpen(true);
  };

  const handleConfirmStorage = () => {
    if (pendingFile) {
      setAttachments([...attachments, pendingFile]);
      setPendingFile(null);
    }
    setStorageNoticeOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      description,
      instructions,
      sessionType,
      platform,
      meetingUrl: meetingUrl || (sessionType === 'cubixskill_live' ? 'https://cdn.cubixskill.com/live/room-native' : '#'),
      meetingId: meetingId || undefined,
      passcode: passcode || undefined,
      scheduledDate,
      scheduledTime,
      durationMinutes: Number(durationMinutes),
      hostName,
      allowChat,
      allowQuestions,
      status: editingSession ? editingSession.status : 'upcoming',
      isRecorded,
      notifyStudents,
      autoCreateAnnouncement,
      attachments,
    });

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingSession ? 'Edit Live Session' : 'Schedule Live Virtual Classroom'}
        subtitle="Configure live session parameters, platform provider, and classroom resources."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs text-left max-h-[75vh] overflow-y-auto pr-1">
          {/* Session Mode Selector: External Provider vs CubixSkill Live */}
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
            <label className="block font-extrabold text-blue-950 text-xs">Live Classroom Engine</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSessionType('external')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sessionType === 'external'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>External Provider (Zoom/Meet/Teams)</span>
              </button>

              <button
                type="button"
                onClick={() => setSessionType('cubixskill_live')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sessionType === 'cubixskill_live'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Radio className="w-4 h-4 text-rose-300" />
                <span>CubixSkill Live (Native WebRTC)</span>
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Session Title *</label>
              <Input
                placeholder="e.g. 🚀 React 19 Server Components Architecture & Live Q&A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Short Agenda Description</label>
              <Input
                placeholder="Key topics to cover during lecture..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Platform & Host Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Meeting Provider</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as LiveSessionItem['platform'])}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-bold"
              >
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Jitsi">Jitsi</option>
                <option value="Custom">Custom Provider Link</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Host Name</label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Instructor Name"
              />
            </div>
          </div>

          {/* Provider Credentials */}
          {sessionType === 'external' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Meeting Join Link *</label>
                <Input
                  placeholder="https://zoom.us/j/9876543210 or Google Meet URL"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  required
                  leftIcon={<LinkIcon className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">Meeting ID (Optional)</label>
                  <Input
                    placeholder="987 654 3210"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">Passcode (Optional)</label>
                  <Input
                    placeholder="cubix2026"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Scheduled Date *</label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Start Time *</label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Duration (Mins)</label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Auto-Announcement Dispatcher Toggle */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-indigo-950 flex items-center gap-1.5 text-xs">
                <Megaphone className="w-4 h-4 text-indigo-600" /> Auto-Publish Course Announcement
              </span>
              <p className="text-[10px] text-indigo-800 font-medium">
                Automatically generate a linked Course Announcement with a "Join Live Classroom" action button.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoCreateAnnouncement}
              onChange={(e) => setAutoCreateAnnouncement(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-extrabold text-slate-900">Lecture Materials &amp; Resources</label>
              <button
                type="button"
                onClick={handleRequestAttachment}
                className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Attach Lecture Resource
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900">{att.name}</span>
                      <span className="text-[10px] text-slate-500">({att.sizeMb} MB)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 sticky bottom-0 bg-white">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2563EB] text-white font-extrabold px-6">
              {editingSession ? 'Save Changes' : 'Schedule Live Session'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* STORAGE CREDIT WARNING MODAL */}
      <Modal
        isOpen={storageNoticeOpen}
        onClose={() => setStorageNoticeOpen(false)}
        title="⚠ Storage Credit Notice"
        subtitle="Instructor storage quota usage notice."
        maxWidth="sm"
      >
        <div className="space-y-4 font-sans text-xs text-left">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
            <div className="flex items-center gap-2 font-black text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Academy Storage Consumption Notice</span>
            </div>
            <p className="text-amber-800 text-xs leading-relaxed font-medium">
              Files uploaded to live session lecture materials are stored in your academy media storage. Storage credits will be deducted based on the uploaded file size.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setStorageNoticeOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmStorage} className="bg-blue-600 text-white font-extrabold px-5">
              Continue &amp; Attach Resource
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
