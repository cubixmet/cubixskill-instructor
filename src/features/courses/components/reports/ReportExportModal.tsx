import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';

export interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  activeTab,
}) => {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf' | 'print'>('pdf');

  const handleExport = () => {
    alert(`Exported "${activeTab}" report in ${format.toUpperCase()} format.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export Report - ${activeTab.toUpperCase()}`}
      subtitle="Select your preferred report document output format."
      maxWidth="sm"
    >
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="space-y-2">
          {[
            { id: 'pdf', label: 'PDF Document (.pdf)', desc: 'Full graphical report layout with summary tables' },
            { id: 'excel', label: 'Excel Spreadsheet (.xlsx)', desc: 'Multi-sheet workbook with raw data fields' },
            { id: 'csv', label: 'CSV File (.csv)', desc: 'Comma-separated values data export' },
            { id: 'print', label: 'Print View', desc: 'Direct printable browser layout' },
          ].map((f) => (
            <label
              key={f.id}
              onClick={() => setFormat(f.id as 'pdf' | 'excel' | 'csv' | 'print')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                format === f.id
                  ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-extrabold text-slate-900 block">{f.label}</span>
                <span className="text-[10px] text-slate-500 font-medium">{f.desc}</span>
              </div>
              <input
                type="radio"
                name="export_format"
                checked={format === f.id}
                onChange={() => setFormat(f.id as 'pdf' | 'excel' | 'csv' | 'print')}
                className="text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            className="bg-[#2563EB] text-white font-extrabold px-5"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Report
          </Button>
        </div>
      </div>
    </Modal>
  );
};
