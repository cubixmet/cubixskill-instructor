import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Search, MessageSquare, RefreshCw, ArrowRight } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { discussionService } from '../../../services/discussion.service';
import { authStore } from '../../../store/auth.store';

function formatMessageTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getLatestMessagePreview(item: any, currentUserId: string): string {
  const room = item.room;
  if (!room) return 'No messages yet';

  const lastMsg = room.last_message;
  if (!lastMsg) return 'No messages yet';

  let content = (lastMsg.content || '').trim();
  if (!content) return 'No messages yet';

  const senderId = String(lastMsg.sender_id || '');
  const senderName = lastMsg.sender_name || '';

  if (currentUserId && senderId === currentUserId) {
    return `You: ${content}`;
  }
  return senderName ? `${senderName}: ${content}` : content;
}

export const CommunityChatListPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authStore.getState().user;
  const currentUserId = String(currentUser?.id || (currentUser as any)?.user_id || '');

  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await discussionService.listCommunityGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load community chat groups.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const query = search.toLowerCase().trim();
    return groups.filter((g) => g.course?.title?.toLowerCase().includes(query));
  }, [groups, search]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Community Chat
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct course-based community group discussions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="pl-9 h-9 text-xs bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGroups}
              disabled={isLoading}
              className="h-9 px-3 text-xs border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white dark:bg-[#1E293B]/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 animate-pulse"
              >
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-64 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1E293B]/60 border border-red-200 dark:border-red-900/30">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchGroups} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#1E293B]/40 border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No Course Community Groups Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {search
                ? `No courses matching "${search}"`
                : 'No courses with Community Discussion feature enabled are currently available.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredGroups.map((group) => {
              const course = group.course;
              const room = group.room;
              const unreadCount = room?.unread_count || 0;
              const previewText = getLatestMessagePreview(group, currentUserId);
              const timestamp = room?.last_message?.created_at || room?.last_message_at;
              const timeDisplay = formatMessageTime(timestamp);

              return (
                <Link
                  key={course.id}
                  to={`/discussions/community/${course.id}`}
                  className="group relative p-4 rounded-xl bg-white dark:bg-[#1E293B]/60 hover:bg-slate-50 dark:hover:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-200 flex items-center gap-4 shadow-sm hover:shadow"
                >
                  {/* Thumbnail / Avatar */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm tracking-wider uppercase">
                        {course.title ? course.title.substring(0, 2) : 'CC'}
                      </span>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {course.title}
                      </h3>
                      {timeDisplay && (
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                          {timeDisplay}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate pr-2">
                        {previewText}
                      </p>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-blue-600 rounded-full shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
