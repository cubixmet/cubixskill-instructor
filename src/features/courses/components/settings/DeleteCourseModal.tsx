import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';

export interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  onConfirmDelete: () => void;
}

export const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  onConfirmDelete,
}) => {
  const [typedTitle, setTypedTitle] = useState('');

  const isMatched = typedTitle.trim() === courseTitle.trim();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched) return;
    onConfirmDelete();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚠ Danger Zone: Delete Course Permanently"
      subtitle="This action cannot be undone. All associated data will be removed."
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4 font-sans text-xs text-left">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-950">
          <div className="flex items-center gap-2 font-black text-rose-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Permanent Deletion Warning</span>
          </div>
          <p className="text-rose-800 text-xs leading-relaxed font-medium">
            Deleting this course will permanently remove all enrolled student records, video files, curriculum modules, assignment submissions, quiz attempt logs, and issued certificates.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-bold text-slate-800 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Enrolled Students:</span>
            <span>420 Enrolled</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Curriculum Modules:</span>
            <span>4 Modules (38 Lessons)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assignments &amp; Quizzes:</span>
            <span>3 Assignments • 5 Quizzes</span>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-900 mb-1">
            Type <strong>"{courseTitle}"</strong> to confirm deletion *
          </label>
          <Input
            placeholder={courseTitle}
            value={typedTitle}
            onChange={(e) => setTypedTitle(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isMatched}
            className={`font-extrabold px-5 text-white ${
              isMatched ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Course Permanently
          </Button>
        </div>
      </form>
    </Modal>
  );
};
