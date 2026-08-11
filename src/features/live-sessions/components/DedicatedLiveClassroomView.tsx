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
  Mic,
  MicOff,
  Hand,
  ShieldCheck,
  Send,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
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
    return () => clearTimeout(timer);
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
    <div className="fixed inset-0 z-50 bg-slate-900 text-white font-sans flex flex-col overflow-hidden select-none w-full max-w-full min-w-0">
      {/* 1. CLASSROOM HEADER BAR */}
      <header className="h-12 sm:h-14 bg-slate-950 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 w-full max-w-full min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onLeaveClassroom}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer shrink-0"
            title="Leave Classroom"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm shrink-0">
            C
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-sm">
                {session.title}
              </h2>
              <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse shrink-0">
                <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> LIVE
              </span>
            </div>
            <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium block truncate">
              {session.courseTitle || 'CubixSkill LMS'}
            </span>
          </div>
        </div>

        {/* Live Timer & Leave Action */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 sm:px-3 py-1 rounded-xl border border-slate-800 text-[11px] font-mono font-bold text-sky-400">
            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <Button
            size="sm"
            onClick={onLeaveClassroom}
            className="h-8 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-2.5 sm:px-3"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </header>

      {/* 2. MAIN RESPONSIVE CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden min-h-0 w-full max-w-full min-w-0">
        {/* LEFT PANEL: DESKTOP COURSE CONTEXT & NAV (3 Cols Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 bg-slate-950 border-r border-slate-800 flex-col p-3 space-y-4 overflow-y-auto min-h-0">
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

          {session.instructions && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-[11px]">
              <span className="font-bold text-amber-400 block">Session Instructions:</span>
              <p className="text-slate-300">{session.instructions}</p>
            </div>
          )}

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

        {/* CENTER PANEL: LIVE VIDEO CONTAINER (Aspect 16:9 on mobile, flex-1 on desktop) */}
        <div className="w-full lg:col-span-6 bg-black flex flex-col relative justify-center items-center overflow-hidden aspect-video lg:aspect-auto lg:h-full shrink-0 lg:shrink">
          {session.sessionType === 'external' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 text-center space-y-2 sm:space-y-4 bg-slate-950">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-1 max-w-md">
                <Badge variant="info" size="sm" className="font-bold uppercase text-[9px] sm:text-[10px]">
                  {session.platform} Classroom Active
                </Badge>
                <h3 className="text-xs sm:text-lg font-extrabold text-white truncate max-w-xs sm:max-w-md">{session.title}</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed hidden sm:block">
                  Participating in a secure CubixSkill embedded session. Attendance &amp; chat are synchronized.
                </p>
              </div>

              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Launch Interactive Meeting
              </a>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 relative">
              <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
                  alt="CubixSkill Native Stream"
                  className="w-full h-full object-cover opacity-60"
                />

                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Native Stream</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE CHAT & TABS PANE (Flex-1 below video on mobile; Right 3 Cols Desktop) */}
        <div className="flex-1 lg:col-span-3 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-hidden min-h-0 w-full max-w-full min-w-0">
          {/* Mobile/Desktop Tab Header */}
          <div className="p-1.5 sm:p-2 border-b border-slate-800 flex items-center gap-1 bg-slate-900 shrink-0 w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'participants', label: 'People (4)', icon: Users },
              { id: 'resources', label: 'Files', icon: Paperclip },
              { id: 'qa', label: 'Q&A', icon: HelpCircle },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as 'chat' | 'participants' | 'resources' | 'qa')}
                  className={`flex-1 py-1.5 px-2 text-[10.5px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 ${
                    active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: LIVE CHAT STREAM & COMPOSER */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 w-full max-w-full min-w-0">
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-0">
                {chatMessages.map((m) => (
                  <div key={m.id} className="space-y-0.5 text-xs text-left w-full min-w-0">
                    <div className="flex items-center justify-between text-[10px] gap-1">
                      <span className={`font-bold truncate ${m.role === 'instructor' ? 'text-blue-400' : 'text-slate-300'}`}>
                        {m.sender}
                      </span>
                      <span className="text-slate-500 text-[9px] shrink-0">{m.time}</span>
                    </div>
                    <p className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-slate-200 text-xs leading-relaxed break-words whitespace-pre-wrap">
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chat Full-Width Input */}
              <form onSubmit={handleSendChat} className="p-2 sm:p-2.5 border-t border-slate-800 bg-slate-900 flex items-center gap-2 shrink-0 w-full box-border">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 min-w-0 h-9 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:border-blue-500 font-normal"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PARTICIPANTS STREAM */}
          {activeTab === 'participants' && (
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs text-left min-h-0">
              {(session.attendanceRecords || []).map((student) => (
                <div key={student.studentUuid} className="p-2 bg-slate-900 rounded-xl flex items-center justify-between border border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {student.studentName.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-200 text-xs truncate">{student.studentName}</span>
                  </div>
                  <span className="text-[9.5px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded shrink-0">
                    Joined
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs text-left min-h-0">
              {(session.attachments || []).map((att) => (
                <div key={att.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-bold text-slate-200 text-xs truncate">{att.name}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold text-blue-400 border-slate-700 shrink-0">
                    Get
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Q&A */}
          {activeTab === 'qa' && (
            <div className="flex-1 p-4 text-center text-slate-500 space-y-1 text-xs min-h-0 flex flex-col justify-center">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-600" />
              <p className="font-bold text-slate-300">Q&amp;A Queue Empty</p>
              <p className="text-[11px]">Students can raise hand or post questions.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM CLASSROOM CONTROL BAR (Sticky above mobile nav) */}
      <footer className="h-12 sm:h-14 bg-slate-950 border-t border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 pb-[env(safe-area-inset-bottom)]">
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

        <div className="text-[11px] text-slate-400 font-medium hidden md:block">
          CubixSkill Enterprise Virtual Classroom Engine
        </div>

        <Button
          size="sm"
          onClick={onLeaveClassroom}
          className="h-8 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3 sm:px-4"
        >
          Leave
        </Button>
      </footer>
    </div>
  );
};
