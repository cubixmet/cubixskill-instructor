import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';

export interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  onConfirmDelete: () => void | Promise<void>;
  isDeleting?: boolean;
}

export const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  onConfirmDelete,
  isDeleting = false,
}) => {
  const [typedTitle, setTypedTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedTitle('');
    }
  }, [isOpen]);

  const isMatched = typedTitle === courseTitle;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched || isDeleting) return;
    onConfirmDelete();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete Course"
      maxWidth="sm"
    >
      <form onSubmit={handleConfirm} className="space-y-4 font-sans text-xs text-left">
        <p className="text-xs text-slate-600 dark:text-[#94A3B8] font-normal leading-relaxed">
          This action cannot be undone.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] block">
            To confirm, type the course title below:
          </label>

          <div className="p-3 bg-slate-100 dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] font-mono text-xs font-bold text-slate-900 dark:text-[#F8FAFC] select-all break-words">
            {courseTitle}
          </div>

          <input
            type="text"
            value={typedTitle}
            onChange={(e) => setTypedTitle(e.target.value)}
            placeholder="Type course title"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-[#263244]">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9.5 px-4 rounded-xl border-slate-300 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] bg-white dark:bg-[#172033]"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={!isMatched || isDeleting}
            variant="danger"
            className={`h-9.5 px-5 font-semibold text-xs rounded-xl min-h-[40px] ${
              isMatched
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-none'
            }`}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            {isDeleting ? 'Deleting...' : 'Delete Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

