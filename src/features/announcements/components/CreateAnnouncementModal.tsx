import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Send,
  Paperclip,
  AlertTriangle,
  FileText,
  Plus,
  Trash2,
  Video,
  Mail,
  Bell,
  Smartphone,
  BookOpen,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCourseFeaturesStore } from '../../courses/store/courseFeatures.store';
import { useLiveSessionStore } from '../../live-sessions/store/liveSession.store';
import { usePlatformStore } from '../../../store/usePlatformStore';
import type { AnnouncementItem, AnnouncementAttachment } from '../store/announcement.store';

export interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<AnnouncementItem>) => void;
  editingAnnouncement?: AnnouncementItem | null;
  defaultCourseUuid?: string;
}

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingAnnouncement,
  defaultCourseUuid,
}) => {
  const courses = usePlatformStore((state) => state.courses || []);
  const getCourseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures);
  const liveSessions = useLiveSessionStore((state) => state.sessions || []);

  const [selectedCourseUuid, setSelectedCourseUuid] = useState(defaultCourseUuid || '');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'General' | 'Exam & Quiz' | 'Assignment' | 'Schedule' | 'Important'>('General');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [publishOption, setPublishOption] = useState<'now' | 'schedule' | 'draft'>('now');

  const [scheduledDate, setScheduledDate] = useState('2026-08-10');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [isPinned, setIsPinned] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [allowComments, setAllowComments] = useState(true);

  const [linkedLiveSessionId, setLinkedLiveSessionId] = useState<string>('');
  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);

  // Storage Credit Notice Modal
  const [storageNoticeOpen, setStorageNoticeOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<AnnouncementAttachment | null>(null);

  const activeCourseUuid = defaultCourseUuid || selectedCourseUuid;
  const courseFeatures = getCourseFeatures ? getCourseFeatures(activeCourseUuid) : { liveSessions: true };

  const availableLiveSessions = liveSessions.filter((s) => s.courseUuid === activeCourseUuid);

  useEffect(() => {
    if (editingAnnouncement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCourseUuid(editingAnnouncement.courseUuid);
      setTitle(editingAnnouncement.title);
      setSummary(editingAnnouncement.summary);
      setContent(editingAnnouncement.content);
      setCategory(editingAnnouncement.category as 'General' | 'Exam & Quiz' | 'Assignment' | 'Schedule' | 'Important');
      setPriority(editingAnnouncement.priority as 'normal' | 'important' | 'urgent');
      setPublishOption(editingAnnouncement.publishOption as 'now' | 'schedule' | 'draft');
      setIsPinned(editingAnnouncement.isPinned);
      setSendEmail(editingAnnouncement.sendEmail ?? true);
      setSendPush(editingAnnouncement.sendPush ?? true);
      setSendInApp(editingAnnouncement.sendInApp ?? true);
      setAllowComments(editingAnnouncement.allowComments);
      setLinkedLiveSessionId(editingAnnouncement.linkedLiveSessionId || '');
      setAttachments(editingAnnouncement.attachments || []);
      setTargetSegment((editingAnnouncement.targetSegment as 'all_students' | 'enrolled_only' | 'interested_only') || 'all_students');
    } else {
      setSelectedCourseUuid(defaultCourseUuid || (courses[0]?.id || '550e8400-e29b-41d4-a716-446655440000'));
      setTitle('');
      setSummary('');
      setContent('');
      setCategory('General');
      setPriority('normal');
      setPublishOption('now');
      setIsPinned(false);
      setSendEmail(true);
      setSendPush(true);
      setSendInApp(true);
      setAllowComments(true);
      setLinkedLiveSessionId('');
      setAttachments([]);
    }
  }, [editingAnnouncement, isOpen, defaultCourseUuid, courses]);

  const handleRequestAttachment = () => {
    const newAtt: AnnouncementAttachment = {
      id: `att-${Date.now()}`,
      name: `Resource_Document_${attachments.length + 1}.pdf`,
      sizeMb: 2.1,
      type: 'pdf',
      url: '#',
    };
    setPendingFile(newAtt);
    setStorageNoticeOpen(true);
  };

  const handleConfirmStorageNotice = () => {
    if (pendingFile) {
      setAttachments([...attachments, pendingFile]);
      setPendingFile(null);
    }
    setStorageNoticeOpen(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!activeCourseUuid) {
      alert('Please select a target course first.');
      return;
    }

    const selectedCourseObj = courses.find((c) => c.id === activeCourseUuid);
    const linkedSessionObj = availableLiveSessions.find((s) => s.id === linkedLiveSessionId);

    const scheduledAt =
      publishOption === 'schedule'
        ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
        : undefined;

    onSubmit({
      courseUuid: activeCourseUuid,
      courseTitle: selectedCourseObj?.title || 'Course Academy',
      title,
      summary,
      content,
      category,
      priority,
      publishOption,
      scheduledAt,
      timezone,
      isPinned,
      notifyStudents: sendEmail || sendPush || sendInApp,
      sendEmail,
      sendPush,
      sendInApp,
      allowComments,
      linkedLiveSessionId: linkedLiveSessionId || undefined,
      linkedLiveSessionTitle: linkedSessionObj?.title,
      attachments,
      author: editingAnnouncement?.author || {
        uuid: 'inst-1',
        name: 'Dr. Vikramaditya Rao',
        role: 'instructor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      },
    });

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingAnnouncement ? 'Edit Course Announcement' : 'Create New Course Announcement'}
        subtitle="Publish updates, extensions, and news directly to enrolled students."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs text-left max-h-[75vh] overflow-y-auto pr-1">
          {/* Mandatory Course Selector (When creating from Global Announcements) */}
          {!defaultCourseUuid && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
              <label className="block font-extrabold text-blue-950 flex items-center gap-1.5 text-xs">
                <BookOpen className="w-4 h-4 text-blue-600" /> Target Course Selection *
              </label>
              <select
                value={selectedCourseUuid}
                onChange={(e) => setSelectedCourseUuid(e.target.value)}
                required
                className="w-full h-9 rounded-lg border border-blue-300 px-3 bg-white text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- Select Target Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Summary */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Announcement Title *</label>
              <Input
                placeholder="e.g. 📢 Assignment 2 Submission Deadline Extended"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Short Summary Preview</label>
              <Input
                placeholder="Brief overview shown on dashboard notification cards..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'General' | 'Exam & Quiz' | 'Assignment' | 'Schedule' | 'Important')}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-bold"
              >
                <option value="General">General</option>
                <option value="Exam & Quiz">Exam &amp; Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Schedule">Schedule</option>
                <option value="Important">Important</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'important' | 'urgent')}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-bold"
              >
                <option value="normal">Normal Priority</option>
                <option value="important">Important Priority</option>
                <option value="urgent">Urgent Banner</option>
              </select>
            </div>
          </div>

          {/* Content Body */}
          <div>
            <label className="block font-bold text-slate-900 mb-1">Announcement Body *</label>
            <textarea
              rows={5}
              placeholder="Write complete announcement message details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Live Session Integration Linker (Only if Live Sessions Feature is ON) */}
          {courseFeatures?.liveSessions && availableLiveSessions.length > 0 && (
            <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-1.5">
              <label className="block font-extrabold text-indigo-950 flex items-center gap-1.5 text-xs">
                <Video className="w-4 h-4 text-indigo-600" /> Link Live Session (Optional)
              </label>
              <select
                value={linkedLiveSessionId}
                onChange={(e) => setLinkedLiveSessionId(e.target.value)}
                className="w-full h-9 rounded-lg border border-indigo-300 px-3 bg-white text-slate-900 font-bold text-xs"
              >
                <option value="">-- No Linked Live Session --</option>
                {availableLiveSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.scheduledDate} {s.scheduledTime})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-indigo-800 font-medium block">
                Enrolled students will receive an explicit "Join Live Session" action button inside the announcement feed.
              </span>
            </div>
          )}

          {/* Publish Options (Now / Schedule / Draft) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="block font-extrabold text-slate-900">Publishing Mode</label>
            <div className="flex items-center gap-2">
              {[
                { id: 'now', label: 'Publish Now', icon: Send },
                { id: 'schedule', label: 'Schedule Release', icon: Calendar },
                { id: 'draft', label: 'Save Draft', icon: FileText },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = publishOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPublishOption(opt.id as 'now' | 'schedule' | 'draft')}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {publishOption === 'schedule' && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">Date</label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">Time</label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">Time Zone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 px-2 bg-white text-slate-900 font-bold text-xs"
                  >
                    <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                    <option value="America/New_York">EST (UTC-5)</option>
                    <option value="Europe/London">GMT (UTC+0)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Notification Channels */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <label className="block font-extrabold text-slate-900 text-xs">Notification Channels</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Send Email
              </label>

              <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendPush}
                  onChange={(e) => setSendPush(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> Push Notification
              </label>

              <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendInApp}
                  onChange={(e) => setSendInApp(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Bell className="w-3.5 h-3.5 text-emerald-600" /> In-App Feed
              </label>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-extrabold text-slate-900">File Attachments</label>
              <button
                type="button"
                onClick={handleRequestAttachment}
                className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Attach Resource File
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900">{att.name}</span>
                      <span className="text-[10px] text-slate-500">({att.sizeMb} MB)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
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
              {editingAnnouncement ? 'Save Changes' : publishOption === 'now' ? 'Publish Announcement' : 'Save Announcement'}
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
              Files uploaded to announcements are stored in your academy media storage. Storage credits will be deducted based on the uploaded file size. Credits are deducted only after the file upload is completed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setStorageNoticeOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmStorageNotice}
              className="bg-blue-600 text-white font-extrabold px-5"
            >
              Continue &amp; Attach File
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
