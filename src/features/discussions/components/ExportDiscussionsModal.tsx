import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Download, FileSpreadsheet, FileText, Check } from 'lucide-react';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';
import type { DiscussionItem, DiscussionReply } from '../store/discussion.store';

export interface ExportDiscussionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussions: DiscussionItem[];
  replies: DiscussionReply[];
}

export const ExportDiscussionsModal: React.FC<ExportDiscussionsModalProps> = ({
  isOpen,
  onClose,
  discussions,
  replies,
}) => {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [includeReplies, setIncludeReplies] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRunExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (format === 'csv' || format === 'excel') {
        const rows = discussions.map((d) => ({
          'Discussion ID': d.id,
          Title: d.title,
          Category: d.category,
          Author: d.author.name,
          Role: d.author.role,
          'Created Date': new Date(d.createdAt).toLocaleString(),
          Replies: d.repliesCount,
          Views: d.views,
          Likes: d.likes,
          Pinned: d.isPinned ? 'Yes' : 'No',
          Locked: d.isLocked ? 'Yes' : 'No',
          Resolved: d.isResolved ? 'Yes' : 'No',
        }));

        const columns: CsvColumn<Record<string, unknown>>[] = [
          { header: 'Discussion ID', value: (r) => r['Discussion ID'] },
          { header: 'Title', value: (r) => r['Title'] },
          { header: 'Category', value: (r) => r['Category'] },
          { header: 'Author', value: (r) => r['Author'] },
          { header: 'Role', value: (r) => r['Role'] },
          { header: 'Created Date', value: (r) => r['Created Date'] },
          { header: 'Replies', value: (r) => r['Replies'] },
          { header: 'Views', value: (r) => r['Views'] },
          { header: 'Likes', value: (r) => r['Likes'] },
          { header: 'Pinned', value: (r) => r['Pinned'] },
          { header: 'Locked', value: (r) => r['Locked'] },
          { header: 'Resolved', value: (r) => r['Resolved'] },
        ];

        exportToCsv(`Course_Discussions_Export_${crypto.randomUUID().slice(0, 8)}`, rows, columns);
      }

      setIsExporting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Course Discussions & Community Data"
      subtitle="Download complete discussion history, student replies, authors, timestamps, and resolution metrics."
      maxWidth="sm"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Export Complete!</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Your discussions report has been generated successfully.</p>
        </div>
      ) : (
        <div className="space-y-4 font-sans text-xs text-left">
          {/* Format selection */}
          <div className="space-y-2">
            <label className="block font-medium text-[#475569] dark:text-[#CBD5E1]">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'csv', label: 'CSV File', icon: FileSpreadsheet },
                { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                { id: 'pdf', label: 'PDF Document', icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id as 'csv' | 'excel' | 'pdf')}
                    className={`p-3 rounded-xl border text-center font-medium text-xs cursor-pointer flex flex-col items-center gap-1.5 transition-all ${
                      format === item.id
                        ? 'bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-[#60A5FA]'
                        : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263244]">
            <label className="block font-medium text-[#475569] dark:text-[#CBD5E1]">Include Options</label>
            <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={includeReplies}
                onChange={(e) => setIncludeReplies(e.target.checked)}
                className="rounded text-[#2563EB] focus:ring-[#3B82F6]"
              />
              <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                Include full reply threads ({replies.length} replies)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
            <Button variant="outline" onClick={onClose} className="h-9 text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]">
              Cancel
            </Button>
            <Button
              onClick={handleRunExport}
              disabled={isExporting}
              className="h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium px-5 shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              {isExporting ? 'Generating...' : `Export ${format.toUpperCase()}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
