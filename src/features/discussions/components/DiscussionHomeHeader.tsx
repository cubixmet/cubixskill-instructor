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
    <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Course Discussions</h1>
            <Badge variant="info" size="sm" className="font-bold">
              {totalCount} Active Topics
            </Badge>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Private course forum to communicate, answer questions, moderate student threads, and issue announcements.
          </p>
        </div>

        {/* Action Controls - Only Settings Button Kept */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="h-9 text-xs font-semibold text-slate-700"
            leftIcon={<Settings className="w-4 h-4 text-slate-500" />}
          >
            Settings
          </Button>
        </div>
      </div>
    </Card>
  );
};
