import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Video,
  Check,
  Globe,
  Lock,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { useLiveSessionStore } from '../store/liveSession.store';

export const CreateLiveSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, sessionId } = useParams<{ courseUuid?: string; sessionId?: string }>();
  const addLiveSession = useLiveSessionStore((state) => state.addLiveSession);
  const updateLiveSession = useLiveSessionStore((state) => state.updateLiveSession);
  const sessions = useLiveSessionStore((state) => state.sessions);

  const existing = sessionId ? sessions.find((s) => s.id === sessionId) : undefined;

  // Form Fields State
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [hostName, setHostName] = useState(existing?.hostName || 'Dr. Alex Rivera');
  const [date, setDate] = useState(existing?.scheduledDate || '2026-08-15');
  const [time, setTime] = useState(existing?.scheduledTime || '18:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(existing?.durationMinutes || 60);
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(existing?.isRecorded ?? true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxParticipants] = useState(existing?.maxParticipants || 100);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const backLink = courseUuid ? `/courses/${courseUuid}/live-sessions` : '/live-classroom';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Session title is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!date) {
      setErrorMsg('Scheduled Date is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!time) {
      setErrorMsg('Start Time is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      if (sessionId && existing) {
        updateLiveSession(sessionId, {
          title,
          description,
          hostName,
          scheduledDate: date,
          scheduledTime: time,
          durationMinutes,
          isRecorded: isRecordingEnabled,
          maxParticipants,
        });
        showToast('Live session updated.');
      } else {
        addLiveSession({
          courseUuid: courseUuid || '550e8400-e29b-41d4-a716-446655440000',
          title,
          description,
          hostName,
          scheduledDate: date,
          scheduledTime: time,
          durationMinutes,
          sessionType: 'external',
          platform: 'Zoom',
          meetingUrl: 'https://zoom.us',
          status: 'upcoming',
          isRecorded: isRecordingEnabled,
          notifyStudents: true,
          allowChat: true,
          allowQuestions: true,
          maxParticipants,
        });
        showToast('Live session scheduled successfully.');
      }

      setIsSubmitting(false);
      navigate(backLink);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-[900px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 text-left font-sans pb-36 md:pb-12"
    >
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(backLink)}
            className="p-2 -ml-2 text-[#0F172A] hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <div>
            <h1 className="text-base sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              {sessionId ? 'Edit Live Session' : 'Schedule Live Session'}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#64748B] font-medium truncate">
              Configure session timing, host, and recording settings.
            </p>
          </div>
        </div>

        <Link to={backLink}>
          <Button variant="outline" size="sm" className="text-xs font-semibold h-9 px-3">
            Cancel
          </Button>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="space-y-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#0F172A]">Session Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Live Q&A and Advanced State Architecture Walkthrough"
              className="h-11 text-xs font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#0F172A]">Agenda & Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail key topics to cover, prerequisites, and instructions for students..."
              className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* SINGLE COLUMN ON MOBILE, 2-COLUMN ON DESKTOP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">Scheduled Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 text-xs font-medium w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">Start Time *</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11 text-xs font-medium w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-11 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A]"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes (1.5 Hours)</option>
                <option value={120}>120 Minutes (2 Hours)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">Host Instructor</label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Instructor Name"
                className="h-11 text-xs font-medium w-full"
              />
            </div>
          </div>

          {/* TOGGLES & ACCESS RULES */}
          <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
            <label className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <Video className="w-4 h-4 text-[#2563EB] shrink-0" />
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#0F172A] block">Enable Auto-Cloud Recording</strong>
                  <span className="text-[11px] text-[#64748B] block font-medium truncate">Record session automatically for replay</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecordingEnabled}
                onChange={(e) => setIsRecordingEnabled(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB] shrink-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                {isPrivate ? <Lock className="w-4 h-4 text-amber-600 shrink-0" /> : <Globe className="w-4 h-4 text-emerald-600 shrink-0" />}
                <div className="min-w-0">
                  <strong className="text-xs font-bold text-[#0F172A] block">Enrolled Students Only</strong>
                  <span className="text-[11px] text-[#64748B] block font-medium truncate">Restrict attendance access to course members</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB] shrink-0 cursor-pointer"
              />
            </label>
          </div>
        </Card>

        {/* CONTAINER-AWARE STICKY ACTION BAR */}
        <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-2 z-20 w-full bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-3 sm:p-3.5 shadow-lg rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(backLink)}
            className="text-xs font-semibold h-10 px-4 border-[#E2E8F0] w-full sm:w-auto cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            leftIcon={<Video className="w-4 h-4" />}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs h-10 px-5 w-full sm:w-auto cursor-pointer shadow-2xs"
          >
            {isSubmitting ? 'Scheduling...' : sessionId ? 'Save Session Changes' : 'Schedule Live Session'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
