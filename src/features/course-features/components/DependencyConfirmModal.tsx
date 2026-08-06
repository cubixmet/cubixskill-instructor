import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

export interface DependencyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  impactedFeatures: string[];
  actionType: 'enable_parents' | 'disable_dependents' | 'data_warning';
  onConfirm: () => void;
}

export const DependencyConfirmModal: React.FC<DependencyConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  impactedFeatures,
  actionType,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Feature dependency validation notice."
      maxWidth="sm"
    >
      <div className="space-y-4 font-sans text-xs text-left">
        <div className={`p-3.5 rounded-xl border space-y-2 ${
          actionType === 'disable_dependents' || actionType === 'data_warning'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2 font-black text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{description}</span>
          </div>

          {impactedFeatures.length > 0 && (
            <div className="pt-1">
              <span className="font-bold text-[11px] block mb-1">Impacted features:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] font-semibold">
                {impactedFeatures.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`font-extrabold px-5 text-white ${
              actionType === 'disable_dependents' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {actionType === 'enable_parents' ? 'Enable All Required' : 'Proceed & Update'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
