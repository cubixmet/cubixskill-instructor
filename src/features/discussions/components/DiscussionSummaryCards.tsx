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
      label: 'Total',
      value: total,
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      action: 'all',
    },
    {
      id: 'open',
      label: 'Open',
      value: open,
      icon: HelpCircle,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
      action: 'open',
    },
    {
      id: 'pinned',
      label: 'Pinned',
      value: pinned,
      icon: Pin,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      action: 'pinned',
    },
    {
      id: 'locked',
      label: 'Locked',
      value: locked,
      icon: Lock,
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      action: 'locked',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      value: resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      action: 'resolved',
    },
    {
      id: 'replies',
      label: 'Replies',
      value: totalReplies,
      icon: MessageCircle,
      color: 'text-blue-700 bg-blue-50/70 border-blue-200',
      action: 'all',
    },
    {
      id: 'unread',
      label: 'Unread',
      value: unread,
      icon: Mail,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      action: 'unread',
    },
    {
      id: 'reported',
      label: 'Reported',
      value: reported,
      icon: AlertTriangle,
      color: reported > 0 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-500 bg-slate-50 border-slate-200',
      action: 'reported',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 font-sans">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            padding="sm"
            onClick={() => onFilterByStatus && onFilterByStatus(card.action)}
            className={`border cursor-pointer transition-all hover:shadow-xs hover:-translate-y-0.5 ${card.color} flex flex-col justify-between h-full min-w-0 p-3 rounded-2xl`}
          >
            <div className="flex items-center justify-between gap-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-85 truncate min-w-0">
                {card.label}
              </span>
              <Icon className="w-3.5 h-3.5 shrink-0 opacity-90 text-current" />
            </div>
            <div className="mt-2 text-xl font-black tracking-tight">
              {card.value}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
