import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Check, Trash2, UserX } from 'lucide-react';
import type { DiscussionReport } from '../store/discussion.store';

export interface ModerationQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: DiscussionReport[];
  onAction: (reportId: string, action: 'approved' | 'removed' | 'warned') => void;
}

export const ModerationQueueModal: React.FC<ModerationQueueModalProps> = ({
  isOpen,
  onClose,
  reports,
  onAction,
}) => {
  const pendingReports = reports.filter((r) => r.status === 'pending');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Discussion Moderation Queue & Flagged Content"
      subtitle="Review community reported messages, spam flags, and user warning requests."
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans text-xs text-left max-h-[75vh] overflow-y-auto">
        {pendingReports.length > 0 ? (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      Reason: {report.reason}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      Reported by: <strong>{report.reportedBy}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium italic">
                  "{report.snippet}"
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(report.id, 'approved')}
                    className="h-8 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Dismiss Report
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(report.id, 'warned')}
                    className="h-8 text-[11px] font-semibold text-amber-700 hover:bg-amber-50"
                    leftIcon={<UserX className="w-3.5 h-3.5" />}
                  >
                    Warn User
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onAction(report.id, 'removed')}
                    className="h-8 text-[11px] bg-red-600 text-white font-bold hover:bg-red-700"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remove Content
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Moderation Queue Clear!</h3>
            <p className="text-slate-500 text-xs">
              There are currently no reported or flagged messages pending review.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
