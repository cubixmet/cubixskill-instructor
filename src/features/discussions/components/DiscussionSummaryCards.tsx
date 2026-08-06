import React from 'react';
import {
  MessageSquare,
  HelpCircle,
  Pin,
  Lock,
  CheckCircle2,
  MessageCircle,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';

interface DiscussionSummaryCardsProps {
  total: number;
  open: number;
  pinned: number;
  locked: number;
  resolved: number;
  totalReplies: number;
  unread: number;
  reported: number;
  onFilterByStatus?: (status: string) => void;
}

export const DiscussionSummaryCards: React.FC<DiscussionSummaryCardsProps> = ({
  total,
  open,
  pinned,
  locked,
  resolved,
  totalReplies,
  unread,
  reported,
  onFilterByStatus,
}) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Discussions',
      value: total,
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      action: 'all',
    },
    {
      id: 'open',
      label: 'Open Discussions',
      value: open,
      icon: HelpCircle,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
      action: 'open',
    },
    {
      id: 'pinned',
      label: 'Pinned Discussions',
      value: pinned,
      icon: Pin,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      action: 'pinned',
    },
    {
      id: 'locked',
      label: 'Locked Discussions',
      value: locked,
      icon: Lock,
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      action: 'locked',
    },
    {
      id: 'resolved',
      label: 'Resolved Discussions',
      value: resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      action: 'resolved',
    },
    {
      id: 'replies',
      label: 'Total Replies',
      value: totalReplies,
      icon: MessageCircle,
      color: 'text-blue-700 bg-blue-50/70 border-blue-200',
      action: 'all',
    },
    {
      id: 'unread',
      label: 'Unread Discussions',
      value: unread,
      icon: Mail,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      action: 'unread',
    },
    {
      id: 'reported',
      label: 'Reported Messages',
      value: reported,
      icon: AlertTriangle,
      color: reported > 0 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-500 bg-slate-50 border-slate-200',
      action: 'reported',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            padding="sm"
            onClick={() => onFilterByStatus && onFilterByStatus(card.action)}
            className={`border cursor-pointer transition-all hover:shadow-xs hover:-translate-y-0.5 ${card.color} flex flex-col justify-between h-full`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {card.label}
              </span>
              <Icon className="w-3.5 h-3.5 shrink-0 opacity-90" />
            </div>
            <div className="mt-2 text-xl font-extrabold tracking-tight">
              {card.value}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
