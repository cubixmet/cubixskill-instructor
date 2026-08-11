import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { StudentDetail } from '../types/student.types';

interface DeleteStudentModalProps {
  isOpen: boolean;
  student: StudentDetail | null;
  onClose: () => void;
  onConfirm: (studentUuid: string) => void;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onConfirm,
}) => {
  const [confirmName, setConfirmName] = useState('');

  if (!isOpen || !student) return null;

  const isMatching = confirmName.trim().toLowerCase() === student.name.trim().toLowerCase();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatching) return;
    onConfirm(student.uuid);
    setConfirmName('');
    onClose();
  };

  const handleClose = () => {
    setConfirmName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <div className="p-5 sm:p-6 space-y-4 font-sans text-left">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">Delete Student Account?</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-[#64748B]">
          <p>
            You are about to permanently delete student account for{' '}
            <strong className="text-[#0F172A] font-semibold">{student.name}</strong> ({student.email}).
            This action cannot be undone and will remove all enrollment records.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-medium leading-relaxed">
            To confirm deletion, please type the student&apos;s full name below:
            <strong className="block text-[#0F172A] mt-1 font-bold select-all">{student.name}</strong>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4 pt-1">
            <div>
              <input
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={`Type "${student.name}" to confirm...`}
                className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <Button type="button" variant="outline" size="sm" onClick={handleClose} className="border-[#E2E8F0]">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!isMatching}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className={`text-white transition-all ${
                  isMatching
                    ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs'
                    : 'bg-rose-300 opacity-60 cursor-not-allowed'
                }`}
              >
                Delete Student
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
