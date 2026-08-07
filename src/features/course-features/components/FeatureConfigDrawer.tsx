import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { CourseFeatureDefinition } from '../config/course-features';

export interface FeatureConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  feature: CourseFeatureDefinition | null;
  onSaveSettings: (featureId: string, settings: any) => void;
}

export const FeatureConfigDrawer: React.FC<FeatureConfigDrawerProps> = ({
  isOpen,
  onClose,
  feature,
  onSaveSettings,
}) => {
  const [minWatchPercent, setMinWatchPercent] = useState(80);
  const [passingGrade, setPassingGrade] = useState(75);
  const [manualApproval, setManualApproval] = useState(true);

  if (!feature) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(feature.id, {
      minWatchPercent,
      passingGrade,
      manualApproval,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure ${feature.name}`}
      subtitle="Adjust course-level behavior parameters and completion thresholds."
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4 font-sans text-xs text-left">
        {feature.id === 'videoCompletionRequirement' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Minimum Required Video Watch (%) *</label>
              <Input
                type="number"
                value={minWatchPercent}
                onChange={(e) => setMinWatchPercent(Number(e.target.value))}
                required
              />
              <span className="text-[10px] text-slate-500 font-medium">
                Students must watch at least {minWatchPercent}% of the video stream before the lesson is marked complete.
              </span>
            </div>
          </div>
        )}

        {feature.id === 'quizzes' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Default Quiz Passing Grade (%)</label>
              <Input
                type="number"
                value={passingGrade}
                onChange={(e) => setPassingGrade(Number(e.target.value))}
                required
              />
            </div>
          </div>
        )}

        {feature.id === 'assignments' && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer">
              <input
                type="checkbox"
                checked={manualApproval}
                onChange={(e) => setManualApproval(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Require Instructor Manual Grade Approval
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#2563EB] text-white font-extrabold px-6">
            Save Feature Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
};
