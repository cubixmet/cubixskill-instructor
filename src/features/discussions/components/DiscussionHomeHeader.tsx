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
    <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs font-sans text-left w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              Discussions
            </h1>
            <Badge variant="info" size="sm" className="font-semibold shrink-0 text-[10px]">
              {totalCount} Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Manage course discussions, answer student questions, and publish announcements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="h-8 text-xs font-semibold text-slate-700"
            leftIcon={<Settings className="w-3.5 h-3.5 text-slate-500" />}
          >
            Settings
          </Button>
        </div>
      </div>
    </Card>
  );
};


