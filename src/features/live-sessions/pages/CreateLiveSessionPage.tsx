import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Video,
  Check,
  Globe,
  Lock,
  Link as LinkIcon,
  Bell,
  Mail,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { useLiveSessionStore } from '../store/liveSession.store';

export const CreateLiveSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, sessionId } = useParams<{ courseUuid?: string; sessionId?: string }>();
  const createLiveSession = useLiveSessionStore((state) => state.createLiveSession);
  const updateLiveSessionApi = useLiveSessionStore((state) => state.updateLiveSessionApi);
  const sessions = useLiveSessionStore((state) => state.sessions);

  const existing = sessionId ? sessions.find((s) => s.id === sessionId) : undefined;
  const todayStr = new Date().toISOString().split('T')[0];

  // Form Fields State
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [provider, setProvider] = useState<'GOOGLE_MEET' | 'ZOOM' | 'MICROSOFT_TEAMS' | 'CUSTOM'>(
    existing?.platform === 'Zoom'
      ? 'ZOOM'
      : existing?.platform === 'Google Meet'
      ? 'GOOGLE_MEET'
      : existing?.platform === 'Microsoft Teams'
      ? 'MICROSOFT_TEAMS'
      : 'GOOGLE_MEET'
  );
  const [meetingUrl, setMeetingUrl] = useState(existing?.meetingUrl || '');
  const [date, setDate] = useState(existing?.scheduledDate || todayStr);
  const [time, setTime] = useState(existing?.scheduledTime || '18:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(existing?.durationMinutes || 60);
  const [maxParticipants, setMaxParticipants] = useState<number>(existing?.maxParticipants || 100);
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(existing?.isRecorded ?? false);
  const [sendEmailNotification, setSendEmailNotification] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title || '');
      setDescription(existing.description || '');
      setMeetingUrl(existing.meetingUrl || '');
      setDate(existing.scheduledDate || todayStr);
      setTime(existing.scheduledTime || '18:00');
      setDurationMinutes(existing.durationMinutes || 60);
      setIsRecordingEnabled(existing.isRecorded ?? false);
      setMaxParticipants(existing.maxParticipants || 100);
    }
  }, [existing, todayStr]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const backLink = courseUuid ? `/courses/${courseUuid}/live-sessions` : '/courses';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setFieldErrors({});

    const newFieldErrors: Record<string, string> = {};

    if (!courseUuid) {
      setFormError('Course ID is missing from URL route.');
      return;
    }
    if (!title.trim()) {
      newFieldErrors.title = 'Session title is required.';
    }
    if (!date) {
      newFieldErrors.date = 'Scheduled Date is required.';
    }
    if (!time) {
      newFieldErrors.time = 'Start Time is required.';
    }
    if (meetingUrl.trim() && !meetingUrl.startsWith('http://') && !meetingUrl.startsWith('https://')) {
      newFieldErrors.meetingUrl = 'Enter a valid URL starting with http:// or https://';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setFormError('Please correct the highlighted fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Construct ISO DateTime
    const startDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(startDateTime.getTime())) {
      setFieldErrors({ date: 'Invalid start date or time format.' });
      setFormError('Invalid start date or time format.');
      return;
    }

    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    // Validate start in past for new sessions
    if (!sessionId && startDateTime.getTime() < Date.now() - 15 * 60 * 1000) {
      setFieldErrors({ time: 'Start time must be in the future.' });
      setFormError('Scheduled start time cannot be in the past.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (sessionId && existing) {
        await updateLiveSessionApi(sessionId, {
          title: title.trim(),
          description: description.trim(),
          scheduled_start: startDateTime.toISOString(),
          scheduled_end: endDateTime.toISOString(),
          provider,
          meeting_url: meetingUrl.trim(),
          max_participants: maxParticipants,
          recording_enabled: isRecordingEnabled,
          send_email: sendEmailNotification,
        });
        showToast('Live session updated successfully.');
      } else {
        await createLiveSession({
          course_id: courseUuid,
          title: title.trim(),
          description: description.trim(),
          scheduled_start: startDateTime.toISOString(),
          scheduled_end: endDateTime.toISOString(),
          session_mode: 'EXTERNAL',
          provider,
          meeting_url: meetingUrl.trim(),
          max_participants: maxParticipants,
          recording_enabled: isRecordingEnabled,
          send_email: sendEmailNotification,
          status: 'SCHEDULED',
        });
        const msg = sendEmailNotification
          ? 'Live session created and student email notifications have been scheduled.'
          : 'Live session created and in-app notifications have been scheduled.';
        showToast(msg);
      }

      setIsSubmitting(false);
      navigate(backLink);
    } catch (err: any) {
      console.error('Error saving live session:', err);
      setIsSubmitting(false);

      const responseData = err?.response?.data;
      const mappedFieldErrors: Record<string, string> = {};

      if (responseData && typeof responseData === 'object') {
        if (responseData.title) mappedFieldErrors.title = Array.isArray(responseData.title) ? responseData.title[0] : responseData.title;
        if (responseData.scheduled_start) mappedFieldErrors.time = Array.isArray(responseData.scheduled_start) ? responseData.scheduled_start[0] : responseData.scheduled_start;
        if (responseData.scheduled_end) mappedFieldErrors.duration = Array.isArray(responseData.scheduled_end) ? responseData.scheduled_end[0] : responseData.scheduled_end;
        if (responseData.meeting_url) mappedFieldErrors.meetingUrl = Array.isArray(responseData.meeting_url) ? responseData.meeting_url[0] : responseData.meeting_url;
        if (responseData.course_id) mappedFieldErrors.course = Array.isArray(responseData.course_id) ? responseData.course_id[0] : responseData.course_id;
      }

      if (Object.keys(mappedFieldErrors).length > 0) {
        setFieldErrors(mappedFieldErrors);
        setFormError('Please correct the highlighted fields.');
      } else {
        const fallbackMsg = responseData?.detail || responseData?.error?.message || err?.message || 'Failed to save live session.';
        setFormError(fallbackMsg);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-[900px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 text-left font-sans pb-36 md:pb-12"
    >
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] dark:bg-[#1E293B] text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 border border-[#334155]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#263244] pb-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(backLink)}
            className="p-2 -ml-2 text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-xl cursor-pointer transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A] dark:text-[#F8FAFC]" />
          </button>
          <div>
            <h1 className="text-base sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              {sessionId ? 'Edit Live Session' : 'Schedule Live Session'}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] font-normal truncate">
              Configure session timing, meeting links, notifications, and recording settings.
            </p>
          </div>
        </div>

        <Link to={backLink}>
          <Button variant="outline" size="sm" className="text-xs font-semibold h-9 px-3 bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1]">
            Cancel
          </Button>
        </Link>
      </div>

      {formError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          {formError}
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="space-y-4 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-4 sm:p-6 shadow-2xs">
          {/* SESSION TITLE */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Session Title *</label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
              }}
              required
              placeholder="e.g. Live Q&A and Advanced State Architecture Walkthrough"
              className={`h-11 text-xs font-medium bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] ${
                fieldErrors.title ? 'border-rose-500 focus:border-rose-500' : 'border-[#CBD5E1] dark:border-[#334155]'
              }`}
            />
            {fieldErrors.title && <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">{fieldErrors.title}</span>}
          </div>

          {/* AGENDA & DESCRIPTION */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Agenda & Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail key topics to cover, prerequisites, and instructions for students..."
              className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
            />
          </div>

          {/* MEETING PROVIDER & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Meeting Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <option value="GOOGLE_MEET" className="bg-white dark:bg-[#111827]">Google Meet</option>
                <option value="ZOOM" className="bg-white dark:bg-[#111827]">Zoom</option>
                <option value="MICROSOFT_TEAMS" className="bg-white dark:bg-[#111827]">Microsoft Teams</option>
                <option value="CUSTOM" className="bg-white dark:bg-[#111827]">Custom Meeting Link</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Meeting URL</label>
              <Input
                value={meetingUrl}
                onChange={(e) => {
                  setMeetingUrl(e.target.value);
                  if (fieldErrors.meetingUrl) setFieldErrors((prev) => ({ ...prev, meetingUrl: '' }));
                }}
                placeholder="https://meet.google.com/abc-defg-hij or Zoom URL"
                leftIcon={<LinkIcon className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />}
                className={`h-11 text-xs font-medium w-full bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] ${
                  fieldErrors.meetingUrl ? 'border-rose-500 focus:border-rose-500' : 'border-[#CBD5E1] dark:border-[#334155]'
                }`}
              />
              {fieldErrors.meetingUrl && <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">{fieldErrors.meetingUrl}</span>}
            </div>
          </div>

          {/* DATE & TIME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Scheduled Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: '' }));
                }}
                required
                className={`h-11 text-xs font-medium w-full bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] ${
                  fieldErrors.date ? 'border-rose-500' : 'border-[#CBD5E1] dark:border-[#334155]'
                }`}
              />
              {fieldErrors.date && <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">{fieldErrors.date}</span>}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Start Time *</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  if (fieldErrors.time) setFieldErrors((prev) => ({ ...prev, time: '' }));
                }}
                required
                className={`h-11 text-xs font-medium w-full bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] ${
                  fieldErrors.time ? 'border-rose-500' : 'border-[#CBD5E1] dark:border-[#334155]'
                }`}
              />
              {fieldErrors.time && <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">{fieldErrors.time}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <option value={30} className="bg-white dark:bg-[#111827]">30 Minutes</option>
                <option value={45} className="bg-white dark:bg-[#111827]">45 Minutes</option>
                <option value={60} className="bg-white dark:bg-[#111827]">60 Minutes (1 Hour)</option>
                <option value={90} className="bg-white dark:bg-[#111827]">90 Minutes (1.5 Hours)</option>
                <option value={120} className="bg-white dark:bg-[#111827]">120 Minutes (2 Hours)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">Max Participants</label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="h-11 text-xs font-medium w-full bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES */}
          <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Notifications</h4>

            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Bell className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block">In-App Notifications</strong>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium truncate">Automatically sent to all enrolled course students</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                ALWAYS ACTIVE
              </span>
            </div>

            <label className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block">Send Email Notification</strong>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">
                    When enabled, enrolled students will receive a scheduled email now and a reminder email 1 hour before the session.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={sendEmailNotification}
                onChange={(e) => setSendEmailNotification(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] rounded border-slate-300 dark:border-[#334155] focus:ring-[#2563EB] shrink-0 cursor-pointer"
              />
            </label>
          </div>

          {/* TOGGLES & ACCESS RULES */}
          <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
            <label className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <Video className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block">Enable Auto-Cloud Recording</strong>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium truncate">Record session automatically for replay</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecordingEnabled}
                onChange={(e) => setIsRecordingEnabled(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] rounded border-slate-300 dark:border-[#334155] focus:ring-[#2563EB] shrink-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                {isPrivate ? <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> : <Globe className="w-4 h-4 text-emerald-600 dark:text-[#34D399] shrink-0" />}
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block">Enrolled Students Only</strong>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium truncate">Restrict attendance access to course members</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] rounded border-slate-300 dark:border-[#334155] focus:ring-[#2563EB] shrink-0 cursor-pointer"
              />
            </label>
          </div>
        </Card>

        {/* CONTAINER-AWARE STICKY ACTION BAR */}
        <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-2 z-20 w-full bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-[#E2E8F0] dark:border-[#334155] p-3 sm:p-3.5 shadow-lg rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(backLink)}
            className="text-xs font-semibold h-10 px-4 bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] w-full sm:w-auto cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            leftIcon={<Video className="w-4 h-4" />}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs h-10 px-5 w-full sm:w-auto cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
          >
            {isSubmitting ? 'Scheduling...' : sessionId ? 'Save Session Changes' : 'Schedule Live Session'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
