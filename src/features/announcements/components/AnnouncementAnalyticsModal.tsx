import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  CheckCircle2,
  Users,
  Award,
  Calendar,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { AnnouncementItem } from '../store/announcement.store';

export interface AnnouncementAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: AnnouncementItem[];
}

export const AnnouncementAnalyticsModal: React.FC<AnnouncementAnalyticsModalProps> = ({
  isOpen,
  onClose,
  announcements,
}) => {
  const publishedList = announcements.filter((a) => a.status === 'published');
  const totalPublished = publishedList.length;

  const totalViews = publishedList.reduce((sum, a) => sum + a.viewsCount, 0);
  const avgReadRate =
    totalPublished > 0
      ? Math.round(
          publishedList.reduce((sum, a) => {
            const readCount = a.readReceipts.filter((r) => r.isRead).length;
            const total = a.readReceipts.length || 1;
            return sum + (readCount / total) * 100;
          }, 0) / totalPublished
        )
      : 0;

  const mostViewed = [...publishedList].sort((a, b) => b.viewsCount - a.viewsCount)[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Course Announcements Delivery Telemetry"
      subtitle="Comprehensive view rate, delivery speed, and student receipt analytics."
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-xs text-left">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-blue-700">
              <span className="font-bold text-[11px]">Total Views</span>
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-blue-950">{totalViews} Impressions</h3>
            <p className="text-[10px] text-blue-800 font-medium">Across all published announcements</p>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="font-bold text-[11px]">Average Read Rate</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-emerald-950">{avgReadRate}%</h3>
            <p className="text-[10px] text-emerald-800 font-medium">Enrolled student open conversion</p>
          </div>
        </div>

        {/* Most Viewed Announcement Highlight */}
        {mostViewed && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Top Performer Topic
              </span>
              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                {mostViewed.viewsCount} Views
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">{mostViewed.title}</h4>
            <p className="text-slate-600 text-xs line-clamp-2">{mostViewed.summary}</p>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Close Telemetry
          </Button>
        </div>
      </div>
    </Modal>
  );
};
