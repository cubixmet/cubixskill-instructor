import React from 'react';
import {
  Megaphone,
  CheckCircle2,
  Clock,
  FileText,
  Pin,
  Archive,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export interface AnnouncementSummaryCardsProps {
  total: number;
  published: number;
  scheduled: number;
  drafts: number;
  pinned: number;
  archived: number;
  readRatePercent: number;
  unreadStudentsCount: number;
  onFilterByStatus?: (status: string) => void;
}

export const AnnouncementSummaryCards: React.FC<AnnouncementSummaryCardsProps> = ({
  total,
  published,
  scheduled,
  drafts,
  pinned,
  archived,
  readRatePercent,
  unreadStudentsCount,
  onFilterByStatus,
}) => {
  const cards = [
    {
      id: 'all',
      title: 'Total Announcements',
      value: total,
      sub: `${published} Published`,
      icon: Megaphone,
      color: 'blue',
      badge: 'Total',
    },
    {
      id: 'published',
      title: 'Published',
      value: published,
      sub: `${readRatePercent}% Avg Read Rate`,
      icon: CheckCircle2,
      color: 'emerald',
      badge: 'Active',
    },
    {
      id: 'scheduled',
      title: 'Scheduled',
      value: scheduled,
      sub: 'Auto-publish queue',
      icon: Clock,
      color: 'amber',
      badge: 'Pending',
    },
    {
      id: 'draft',
      title: 'Drafts',
      value: drafts,
      sub: 'Unpublished drafts',
      icon: FileText,
      color: 'slate',
      badge: 'Draft',
    },
    {
      id: 'pinned',
      title: 'Pinned Top',
      value: pinned,
      sub: 'Always first view',
      icon: Pin,
      color: 'indigo',
      badge: 'Pinned',
    },
    {
      id: 'unread',
      title: 'Unread Delivery',
      value: unreadStudentsCount,
      sub: 'Pending receipts',
      icon: Eye,
      color: 'rose',
      badge: 'Unread',
    },
  ];

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50/80 border-blue-100 text-blue-600';
      case 'emerald':
        return 'bg-emerald-50/80 border-emerald-100 text-emerald-600';
      case 'amber':
        return 'bg-amber-50/80 border-amber-100 text-amber-600';
      case 'indigo':
        return 'bg-indigo-50/80 border-indigo-100 text-indigo-600';
      case 'rose':
        return 'bg-rose-50/80 border-rose-100 text-rose-600';
      default:
        return 'bg-slate-50/80 border-slate-200 text-slate-600';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-sans text-left">
      {cards.map((card) => {
        const Icon = card.icon;
        const colorStyle = getColorStyles(card.color);

        return (
          <Card
            key={card.id}
            padding="sm"
            onClick={() => onFilterByStatus?.(card.id)}
            className="bg-white border border-slate-200/90 hover:border-blue-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl border ${colorStyle}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.badge}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  {card.value}
                </h4>
                <p className="text-[11px] font-bold text-slate-700 truncate">{card.title}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate">{card.sub}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
