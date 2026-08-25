import React from 'react';
import { Settings } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export interface DiscussionHomeHeaderProps {
  totalCount: number;
  onOpenSettings: () => void;
}

export const DiscussionHomeHeader: React.FC<DiscussionHomeHeaderProps> = ({
  totalCount,
  onOpenSettings,
}) => {
  return (
    <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs font-sans text-left w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h1 className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Discussions
            </h1>
            <Badge variant="info" size="sm" className="font-semibold shrink-0 text-[10px] bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA]">
              {totalCount} Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            Manage course discussions, answer student questions, and publish announcements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="h-8.5 text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#172033]"
            leftIcon={<Settings className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />}
          >
            Settings
          </Button>
        </div>
      </div>
    </Card>
  );
};


