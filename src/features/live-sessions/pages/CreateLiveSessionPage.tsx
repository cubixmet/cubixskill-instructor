import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  CalendarCheck,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Switch } from '../../../components/ui/Switch';
import { useLiveSessionStore } from '../store/liveSession.store';
import { courseRoutes } from '../../../utils/courseRoutes.utils';
import { useCourseFeatures } from '../../../hooks/useCourseFeatures';

// Brand icons or SVGs for supported platforms
const GoogleMeetIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CreateLiveSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, sessionId } = useParams<{ courseUuid?: string; sessionId?: string }>();
  const createLiveSession = useLiveSessionStore((state) => state.createLiveSession);
  const updateLiveSessionApi = useLiveSessionStore((state) => state.updateLiveSessionApi);
  const sessions = useLiveSessionStore((state) => state.sessions);

  const { isLoading: isFeaturesLoading, isFeatureEnabled } = useCourseFeatures(courseUuid);

  // Real feature flags
  const canUseCourseAnnouncement = isFeatureEnabled('COURSE_ANNOUNCEMENTS') || isFeatureEnabled('ANNOUNCEMENTS');
  const canUseEmailDelivery = isFeatureEnabled('EMAIL_NOTIFICATIONS') || isFeatureEnabled('EMAIL_DELIVERY') || isFeatureEnabled('NOTIFICATIONS');

  const hasAdditionalSettings = canUseCourseAnnouncement || canUseEmailDelivery;

  const existing = sessionId ? sessions.find((s) => s.id === sessionId) : undefined;
  const todayStr = new Date().toISOString().split('T')[0];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const mainContainer = document.querySelector('main') || document.documentElement;
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }, []);

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
  const [date, setDate] = useState(existing?.scheduledDate || todayStr);
  const [time, setTime] = useState(existing?.scheduledTime || '10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(existing?.durationMinutes || 60);

  // Additional Settings State
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(true);
  const [allowEarlyJoin, setAllowEarlyJoin] = useState(true);
  const [sendEmailNotification, setSendEmailNotification] = useState<boolean>(true);
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(existing?.isRecorded ?? false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title || '');
      setDescription(existing.description || '');
      setDate(existing.scheduledDate || todayStr);
      setTime(existing.scheduledTime || '10:00');
      setDurationMinutes(existing.durationMinutes || 60);
      setIsRecordingEnabled(existing.isRecorded ?? false);
    }
  }, [existing, todayStr]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const backLink = courseUuid ? courseRoutes.liveSessions(courseUuid) : '/live-classes';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setFieldErrors({});

    const newFieldErrors: Record<string, string> = {};

    if (!title.trim()) {
      newFieldErrors.title = 'Session title is required.';
    }
    if (!date) {
      newFieldErrors.date = 'Scheduled date is required.';
    }
    if (!time) {
      newFieldErrors.time = 'Start time is required.';
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

    setIsSubmitting(true);

    // Payload safety: If email delivery feature is OFF, do not send send_email: true
    const safeSendEmail = canUseEmailDelivery ? sendEmailNotification : false;

    try {
      if (sessionId && existing) {
        await updateLiveSessionApi(sessionId, {
          title: title.trim(),
          description: description.trim(),
          scheduled_start: startDateTime.toISOString(),
          scheduled_end: endDateTime.toISOString(),
          provider,
          recording_enabled: isRecordingEnabled,
          send_email: safeSendEmail,
        });
        showToast('Live session updated successfully.');
      } else {
        await createLiveSession({
          course_id: courseUuid || '',
          title: title.trim(),
          description: description.trim(),
          scheduled_start: startDateTime.toISOString(),
          scheduled_end: endDateTime.toISOString(),
          session_mode: 'EXTERNAL',
          provider,
          recording_enabled: isRecordingEnabled,
          send_email: safeSendEmail,
          status: 'SCHEDULED',
        });
        showToast('Live session scheduled successfully.');
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
      }

      if (Object.keys(mappedFieldErrors).length > 0) {
        setFieldErrors(mappedFieldErrors);
        setFormError('Please correct the highlighted fields.');
      } else {
        const fallbackMsg = responseData?.detail || responseData?.error?.message || err?.message || 'Failed to schedule live session.';
        setFormError(fallbackMsg);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-[640px] mx-auto px-3.5 sm:px-6 py-3 sm:py-6 space-y-4 text-left font-sans"
      style={{
        paddingBottom: 'calc(var(--mobile-bottom-nav-height, 56px) + env(safe-area-inset-bottom, 0px) + 24px)',
      }}
    >
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] dark:bg-[#1E293B] text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 border border-[#334155]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="space-y-3">


        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            {sessionId ? 'Edit Live Session' : 'Schedule Live Session'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            Create and schedule a new live class for this course.
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          {formError}
        </div>
      )}

      {/* FULL PAGE FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* MAIN FORM CARD */}
        <Card padding="none" className="space-y-4 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-4 sm:p-5 shadow-2xs">
          {/* 1. SESSION TITLE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#CBD5E1]">
              Session Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
              }}
              required
              placeholder="e.g. Introduction to React Hooks"
              className={`w-full h-12 px-3.5 rounded-xl bg-white dark:bg-[#0F172A] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                fieldErrors.title ? 'border-2 border-rose-500' : 'border border-[#CBD5E1] dark:border-[#334155]'
              }`}
            />
            {fieldErrors.title && (
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">{fieldErrors.title}</span>
            )}
          </div>

          {/* 2. DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#CBD5E1]">Description</label>
            <div className="relative">
              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description about what you will cover in this live session..."
                className="w-full p-3.5 pb-6 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none min-h-[100px]"
              />
              <span className="absolute right-3 bottom-2 text-[10px] text-[#64748B] dark:text-[#64748B] font-semibold">
                {description.length}/500
              </span>
            </div>
          </div>

          {/* 3. PLATFORM */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#CBD5E1]">
              Platform <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full h-12 pl-3.5 pr-10 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="GOOGLE_MEET" className="bg-white dark:bg-[#111827]">Google Meet</option>
                <option value="ZOOM" className="bg-white dark:bg-[#111827]">Zoom</option>
                <option value="MICROSOFT_TEAMS" className="bg-white dark:bg-[#111827]">Microsoft Teams</option>
                <option value="CUSTOM" className="bg-white dark:bg-[#111827]">Custom Meeting Link</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. DATE & TIME */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#CBD5E1]">
              Date & Time <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  required
                  className={`w-full h-12 pl-9 pr-3 rounded-xl bg-white dark:bg-[#0F172A] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                    fieldErrors.date ? 'border-2 border-rose-500' : 'border border-[#CBD5E1] dark:border-[#334155]'
                  }`}
                />
                <Calendar className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    if (fieldErrors.time) setFieldErrors((prev) => ({ ...prev, time: '' }));
                  }}
                  required
                  className={`w-full h-12 pl-9 pr-3 rounded-xl bg-white dark:bg-[#0F172A] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                    fieldErrors.time ? 'border-2 border-rose-500' : 'border border-[#CBD5E1] dark:border-[#334155]'
                  }`}
                />
                <Clock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {fieldErrors.date && <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">{fieldErrors.date}</span>}
            {fieldErrors.time && <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">{fieldErrors.time}</span>}
          </div>

          {/* 5. DURATION */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#CBD5E1]">
              Duration <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-12 pl-9 pr-10 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value={30} className="bg-white dark:bg-[#111827]">30 minutes</option>
                <option value={45} className="bg-white dark:bg-[#111827]">45 minutes</option>
                <option value={60} className="bg-white dark:bg-[#111827]">1 hour</option>
                <option value={90} className="bg-white dark:bg-[#111827]">1.5 hours</option>
                <option value={120} className="bg-white dark:bg-[#111827]">2 hours</option>
              </select>
              <Clock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 6. MEETING LINK NOTICE */}
          <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center gap-3">
            <Info className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
            <p className="text-xs text-[#2563EB] dark:text-[#60A5FA] font-medium leading-relaxed">
              A meeting link will be generated automatically after you create the session.
            </p>
          </div>

          {/* 7. ADDITIONAL SETTINGS COLLAPSIBLE CARD */}
          {!isFeaturesLoading && hasAdditionalSettings && (
            <div className="border border-[#E2E8F0] dark:border-[#263244] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsAdditionalOpen(!isAdditionalOpen)}
                className="w-full p-3.5 bg-slate-50 dark:bg-[#0F172A] flex items-center justify-between font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer transition-colors"
              >
                <span>Additional Settings</span>
                {isAdditionalOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isAdditionalOpen && (
                <div className="p-3.5 space-y-4 bg-white dark:bg-[#111827] border-t border-[#E2E8F0] dark:border-[#263244]">
                  {/* Allow Early Join */}
                  {canUseCourseAnnouncement && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <strong className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
                          Allow students to join early
                        </strong>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-normal leading-tight">
                          Students can join 10 minutes before start time
                        </span>
                      </div>
                      <Switch checked={allowEarlyJoin} onCheckedChange={setAllowEarlyJoin} />
                    </div>
                  )}

                  {/* Email Notifications */}
                  {canUseEmailDelivery && (
                    <div
                      className={`flex items-center justify-between gap-3 ${
                        canUseCourseAnnouncement ? 'pt-3 border-t border-slate-100 dark:border-[#263244]' : ''
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <strong className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
                          Send email notifications
                        </strong>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-normal leading-tight">
                          Notify enrolled students about this session
                        </span>
                      </div>
                      <Switch checked={sendEmailNotification} onCheckedChange={setSendEmailNotification} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 8. SCHEDULE SESSION ACTION BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all cursor-pointer disabled:opacity-50"
            >
              <CalendarCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Scheduling...' : sessionId ? 'Save Changes' : 'Schedule Session'}</span>
            </button>
          </div>
        </Card>
      </form>
    </motion.div>
  );
};
