import React, { useState } from 'react';
import { Copy, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { CourseThumbnailImage } from '../../../../components/courses/CourseThumbnailImage';
import type { CourseDetails } from '../../types/course.types';

export interface DuplicateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseDetails | null;
  onConfirmDuplicate: (newTitle: string) => void;
}

export const DuplicateCourseModal: React.FC<DuplicateCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  onConfirmDuplicate,
}) => {
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!course) return null;

  const currentTitle = customTitle !== null ? customTitle : `${course.title} — Copy`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmDuplicate(currentTitle.trim());
      setIsSubmitting(false);
      setCustomTitle(null);
      onClose();
    }, 200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setCustomTitle(null);
        onClose();
      }}
      title="Duplicate Course Structure"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans">
        {/* Source Course Information Header */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
            <CourseThumbnailImage
              src={course.thumbnailUrl || (course as any).thumbnail}
              alt={course.title}
              iconClassName="w-6 h-6"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Source Course
            </span>
            <h4 className="text-xs font-extrabold text-slate-900 truncate">
              {course.title}
            </h4>
            <p className="text-[11px] font-medium text-slate-500 truncate">
              {course.category} &bull; {course.level || 'All Levels'}
            </p>
          </div>
        </div>

        {/* New Course Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1.5">
            New Course Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            required
            placeholder="Enter duplicated course title..."
            className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
          />
        </div>

        {/* Informational Callout */}
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 font-medium">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            The duplicated course will start as a <strong className="font-bold">Draft</strong> with 0 enrolled students and fresh analytics. All curriculum modules and lessons will be cloned into the new course.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCustomTitle(null);
              onClose();
            }}
            disabled={isSubmitting}
            className="h-10 px-4 text-xs font-bold text-slate-700"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={!currentTitle.trim() || isSubmitting}
            className="h-10 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Duplicating...</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Duplicate Course</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
