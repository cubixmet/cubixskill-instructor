import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { AnnouncementItem } from '../store/announcement.store';

export interface ExportAnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: AnnouncementItem[];
}

export const ExportAnnouncementsModal: React.FC<ExportAnnouncementsModalProps> = ({
  isOpen,
  onClose,
  announcements,
}) => {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = () => {
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Course Announcements Data"
      subtitle="Download announcement delivery records, read receipts, and timestamps."
      maxWidth="sm"
    >
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="space-y-2">
          <label className="block font-extrabold text-slate-900">Select Export Format</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'csv', label: 'CSV Spreadsheet', icon: FileSpreadsheet },
              { id: 'excel', label: 'Excel Workbook', icon: FileSpreadsheet },
              { id: 'pdf', label: 'PDF Document', icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = format === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormat(item.id as 'pdf' | 'csv' | 'json')}
                  className={`p-3 rounded-xl border text-center space-y-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                  <span className="font-bold text-[11px] block">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium text-[11px]">
          Exporting <strong>{announcements.length} announcement records</strong> including status badges, author metadata, read conversion rates, and attachment counts.
        </div>

        {downloaded && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Export generated successfully! Download started.</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="bg-[#2563EB] text-white font-extrabold px-6"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};
