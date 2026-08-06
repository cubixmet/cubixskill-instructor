import React, { useState, useEffect } from 'react';
import {
  Video,
  Radio,
  Clock,
  LogOut,
  Users,
  MessageSquare,
  Paperclip,
  HelpCircle,
  FileText,
  Mic,
  MicOff,
  Hand,
  ShieldCheck,
  Send,
  ExternalLink,
  BookOpen,
  Megaphone,
  ClipboardCheck,
  Smile,
  Maximize2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { LiveSessionItem } from '../store/liveSession.store';

export interface DedicatedLiveClassroomViewProps {
  session: LiveSessionItem;
  onLeaveClassroom: () => void;
}

const DUMMY_CHAT_MESSAGES = [
  { id: '1', sender: 'Aarav Sharma', role: 'student', content: 'Good afternoon Dr. Vikram! Excited for today Server Actions walkthrough.', time: '17:02' },
  { id: '2', sender: 'Dr. Vikramaditya Rao', role: 'instructor', content: 'Welcome everyone! Please open Module 3 code exercises.', time: '17:03' },
  { id: '3', sender: 'Priya Patel', role: 'student', content: 'Is the slide deck uploaded in resources?', time: '17:05' },
];

export const DedicatedLiveClassroomView: React.FC<DedicatedLiveClassroomViewProps> = ({
  session,
  onLeaveClassroom,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'resources' | 'qa'>('chat');
  const [chatMessages, setChatMessages] = useState(DUMMY_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  // Timer counter
  const [secondsElapsed, setSecondsElapsed] = useState(2712); // ~45 mins
  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages([
      ...chatMessages,
      {
        id: `cm-${Date.now()}`,
        sender: 'Dr. Vikramaditya Rao',
        role: 'instructor',
        content: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white font-sans flex flex-col overflow-hidden select-none">
      {/* 1. CLASSROOM HEADER BAR */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
            C
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-white truncate max-w-sm">
                {session.title}
              </h2>
              <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shrink-0">
                <Radio className="w-3 h-3" /> LIVE CLASSROOM
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block truncate">
              {session.courseTitle || 'CubixSkill Enterprise LMS'} • Host: {session.hostName}
            </span>
          </div>
        </div>

        {/* Live Timer & Leave Action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs font-mono font-bold text-sky-400">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <Button
            size="sm"
            onClick={onLeaveClassroom}
            className="h-8 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Leave Classroom
          </Button>
        </div>
      </header>

      {/* 2. THREE-PANE MAIN LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL: COURSE CONTEXT & NAV (3 Cols Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 bg-slate-950 border-r border-slate-800 flex-col p-3 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Course Info</span>
            <h4 className="font-extrabold text-xs text-white">
              {session.courseTitle || 'Full Stack Web Development Architecture'}
            </h4>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Classroom Agenda</span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {session.description}
            </p>
          </div>

          {/* Instructions */}
          {session.instructions && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-[11px]">
              <span className="font-bold text-amber-400 block">Session Instructions:</span>
              <p className="text-slate-300">{session.instructions}</p>
            </div>
          )}

          {/* Provider Credentials Info */}
          <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-blue-300 font-bold">
              <span>{session.platform} Embedded Room</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            {session.meetingId && (
              <span className="text-slate-300 block font-mono text-[10px]">
                ID: <strong>{session.meetingId}</strong>
              </span>
            )}
            {session.passcode && (
              <span className="text-slate-300 block font-mono text-[10px]">
                Passcode: <strong>{session.passcode}</strong>
              </span>
            )}
            <a
              href={session.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline font-bold text-[10px] flex items-center gap-1 pt-1"
            >
              <ExternalLink className="w-3 h-3" /> Direct Provider Window
            </a>
          </div>
        </div>

        {/* CENTER PANEL: LIVE VIDEO / EMBEDDED MEETING AREA (6 Cols Desktop) */}
        <div className="lg:col-span-6 bg-black flex flex-col relative justify-center items-center overflow-hidden">
          {session.sessionType === 'external' ? (
            /* EXTERNAL MEETING EMBEDDED CONTAINER */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Video className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md">
                <Badge variant="info" size="sm" className="font-bold uppercase">
                  {session.platform} Virtual Classroom Active
                </Badge>
                <h3 className="text-lg font-extrabold text-white">{session.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are participating in a secure CubixSkill embedded session hosted via {session.platform}. Attendance, chat, and resources are synchronized inside CubixSkill.
                </p>
              </div>

              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" /> Launch Interactive Meeting
              </a>
            </div>
          ) : (
            /* CUBIXSKILL NATIVE LIVE WEBRTC PLAYER CONTAINER */
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 relative">
              <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
                  alt="CubixSkill Native Stream"
                  className="w-full h-full object-cover opacity-60"
                />

                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-xs font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>CubixSkill Ultra-Low Latency Native Stream</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: INTERACTIVE CHAT & TABS (3 Cols Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 bg-slate-950 border-l border-slate-800 flex-col overflow-hidden">
          {/* Tabs */}
          <div className="p-2 border-b border-slate-800 flex items-center gap-1 bg-slate-900">
            {[
              { id: 'chat', label: 'Live Chat', icon: MessageSquare },
              { id: 'participants', label: 'People (4)', icon: Users },
              { id: 'resources', label: 'Resources', icon: Paperclip },
              { id: 'qa', label: 'Q&A', icon: HelpCircle },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: LIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {chatMessages.map((m) => (
                  <div key={m.id} className="space-y-0.5 text-xs text-left">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`font-bold ${m.role === 'instructor' ? 'text-blue-400' : 'text-slate-300'}`}>
                        {m.sender}
                      </span>
                      <span className="text-slate-500 text-[9px]">{m.time}</span>
                    </div>
                    <p className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs">
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-2.5 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Send message to classroom..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 h-8 rounded-lg bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PARTICIPANTS */}
          {activeTab === 'participants' && (
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs text-left">
              {(session.attendanceRecords || []).map((student) => (
                <div key={student.studentUuid} className="p-2 bg-slate-900 rounded-xl flex items-center justify-between border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {student.studentName.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-200 text-xs">{student.studentName}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                    Joined
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs text-left">
              {(session.attachments || []).map((att) => (
                <div key={att.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-bold text-slate-200 text-xs truncate max-w-[140px]">{att.name}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold text-blue-400 border-slate-700">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Q&A */}
          {activeTab === 'qa' && (
            <div className="flex-1 p-4 text-center text-slate-500 space-y-1 text-xs">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-600" />
              <p className="font-bold text-slate-300">Live Q&amp;A Queue Empty</p>
              <p className="text-[11px]">Students can raise hand or post questions during lecture.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM CLASSROOM CONTROL BAR */}
      <footer className="h-14 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isMicOn ? 'bg-slate-900 border-slate-800 text-white' : 'bg-rose-900/60 border-rose-800 text-rose-300'
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-rose-400" />}
            <span className="hidden sm:inline">{isMicOn ? 'Mute Mic' : 'Unmute Mic'}</span>
          </button>

          <button
            type="button"
            onClick={() => setHandRaised(!handRaised)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              handRaised ? 'bg-amber-900/60 border-amber-800 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <Hand className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
          CubixSkill Enterprise Virtual Classroom Engine • All interactions encrypted &amp; logged
        </div>

        <Button
          size="sm"
          onClick={onLeaveClassroom}
          className="h-8 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4"
        >
          Leave
        </Button>
      </footer>
    </div>
  );
};
