import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Eye, Award } from 'lucide-react';
import type { DiscussionItem, DiscussionReply } from '../store/discussion.store';

export interface DiscussionAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussions: DiscussionItem[];
  replies: DiscussionReply[];
}

export const DiscussionAnalyticsModal: React.FC<DiscussionAnalyticsModalProps> = ({
  isOpen,
  onClose,
  discussions,
  replies,
}) => {
  const totalPosts = discussions.length;
  const totalReplies = replies.length;
  const resolvedCount = discussions.filter((d) => d.isResolved).length;
  const resolvedRate = totalPosts > 0 ? Math.round((resolvedCount / totalPosts) * 100) : 100;

  // Most active students
  const studentPostCounts: Record<string, { name: string; count: number; avatar?: string }> = {};
  [...discussions, ...replies].forEach((item) => {
    if (item.author.role === 'student') {
      if (!studentPostCounts[item.author.name]) {
        studentPostCounts[item.author.name] = {
          name: item.author.name,
          count: 0,
          avatar: item.author.avatar,
        };
      }
      studentPostCounts[item.author.name].count += 1;
    }
  });

  const activeStudents = Object.values(studentPostCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Most viewed topics
  const mostViewed = [...discussions].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Course Community & Discussion Analytics"
      subtitle="Insights on student participation, response times, resolved topics, and active contributors."
      maxWidth="lg"
    >
      <div className="space-y-6 font-sans text-xs text-left max-h-[75vh] overflow-y-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase">Total Discussions</span>
            <div className="text-xl font-extrabold text-blue-900">{totalPosts}</div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Total Replies</span>
            <div className="text-xl font-extrabold text-indigo-900">{totalReplies}</div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Resolved Rate</span>
            <div className="text-xl font-extrabold text-emerald-900">{resolvedRate}%</div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase">Avg Response Time</span>
            <div className="text-xl font-extrabold text-amber-900">1.4 hrs</div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Most Active Students */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">Most Active Students</h4>
            </div>

            {activeStudents.length > 0 ? (
              <div className="space-y-2">
                {activeStudents.map((st, idx) => (
                  <div
                    key={st.name}
                    className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 font-bold text-slate-400">#{idx + 1}</span>
                      {st.avatar ? (
                        <img src={st.avatar} alt={st.name} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {st.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-bold text-slate-800">{st.name}</span>
                    </div>
                    <span className="font-extrabold text-blue-600">{st.count} Posts</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No student activity logged yet.</p>
            )}
          </div>

          {/* Most Viewed Topics */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">Most Viewed Topics</h4>
            </div>

            <div className="space-y-2">
              {mostViewed.map((topic) => (
                <div
                  key={topic.id}
                  className="p-2 bg-white border border-slate-200 rounded-lg space-y-1 text-xs"
                >
                  <div className="font-bold text-slate-800 line-clamp-1">{topic.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>{topic.category}</span>
                    <span className="text-indigo-600 font-bold">{topic.views} Views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
