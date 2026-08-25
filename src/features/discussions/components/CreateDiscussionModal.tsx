import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import {
  AlertTriangle,
  Paperclip,
  Trash2,
  Megaphone,
  Pin,
  MessageSquare,
} from 'lucide-react';
import type { AttachmentItem, DiscussionItem } from '../store/discussion.store';

export interface CourseOption {
  id: string;
  title: string;
}

export interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DiscussionItem> & { course_id?: string | null }) => void;
  editingDiscussion?: DiscussionItem | null;
  isInstructor?: boolean;
  coursesList?: CourseOption[];
  initialCourseId?: string | null;
}

const CATEGORIES = ['General', 'Q&A', 'Feedback', 'Announcements', 'Assignments', 'Technical'] as const;

export const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingDiscussion,
  isInstructor = true,
  coursesList = [],
  initialCourseId = null,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    editingDiscussion?.courseUuid || initialCourseId || null
  );
  const [title, setTitle] = useState(editingDiscussion?.title || '');
  const [shortDescription, setShortDescription] = useState(editingDiscussion?.shortDescription || '');
  const [content, setContent] = useState(editingDiscussion?.content || '');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>(
    editingDiscussion?.category || 'General'
  );
  const [tagsInput, setTagsInput] = useState(editingDiscussion?.tags.join(', ') || '');
  const [visibility, setVisibility] = useState<'all' | 'students' | 'instructors'>(
    editingDiscussion?.visibility || 'all'
  );

  useEffect(() => {
    if (editingDiscussion) {
      setTitle(editingDiscussion.title || '');
      setShortDescription(editingDiscussion.shortDescription || '');
      setContent(editingDiscussion.content || '');
      setCategory(editingDiscussion.category || 'General');
      setTagsInput(editingDiscussion.tags ? editingDiscussion.tags.join(', ') : '');
      setVisibility(editingDiscussion.visibility || 'all');
      setSelectedCourseId(editingDiscussion.courseUuid || null);
    } else {
      setSelectedCourseId(initialCourseId || null);
    }
  }, [editingDiscussion, initialCourseId]);

  // Toggles
  const [isPinned, setIsPinned] = useState(editingDiscussion?.isPinned || false);
  const [isAnnouncement, setIsAnnouncement] = useState(editingDiscussion?.isAnnouncement || false);
  const [allowReplies, setAllowReplies] = useState(editingDiscussion?.allowReplies ?? true);
  const [allowStudentAttachments] = useState(
    editingDiscussion?.allowStudentAttachments ?? true
  );
  const [notifyStudents, setNotifyStudents] = useState(editingDiscussion?.notifyStudents ?? true);

  // Attachments
  const [attachments, setAttachments] = useState<AttachmentItem[]>(
    editingDiscussion?.attachments || []
  );

  const handleAddSampleAttachment = (type: AttachmentItem['type']) => {
    const newAtt: AttachmentItem = {
      id: `att-${Date.now()}`,
      name: `Resource_Attachment_${attachments.length + 1}.${type === 'pdf' ? 'pdf' : type === 'image' ? 'png' : 'zip'}`,
      sizeMb: parseFloat((Math.random() * 4 + 0.5).toFixed(1)),
      type,
      url: '#',
    };
    setAttachments([...attachments, newAtt]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      course_id: selectedCourseId,
      title,
      shortDescription,
      content,
      category,
      tags,
      visibility,
      isPinned,
      isAnnouncement,
      allowReplies,
      allowStudentAttachments,
      notifyStudents,
      attachments,
      author: {
        uuid: 'inst-1',
        name: 'Dr. Vikramaditya Rao',
        role: 'instructor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      },
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDiscussion ? 'Edit Course Discussion' : 'Create New Course Discussion'}
      subtitle="Publish topics, ask questions, or issue announcements for your course community."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmitForm} className="space-y-4 text-xs font-sans text-left">
        {/* Course Selector */}
        {coursesList.length > 0 && (
          <div>
            <label className="block font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
              Select Course
            </label>
            <select
              value={selectedCourseId || ''}
              onChange={(e) => setSelectedCourseId(e.target.value ? e.target.value : null)}
              className="w-full h-9 rounded-lg border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] cursor-pointer"
            >
              <option value="">General Academy (All Courses)</option>
              {coursesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
            Discussion Title <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g., Clarification on React 19 Server Actions & Optimistic UI"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="block font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">Short Summary / Subtitle</label>
          <Input
            placeholder="Brief 1-line overview displayed in the discussion card list..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>

        {/* Category & Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DiscussionItem['category'])}
              className="w-full h-9 rounded-lg border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as DiscussionItem['visibility'])}
              className="w-full h-9 rounded-lg border border-[#CBD5E1] dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">Visible to All Enrolled Students & Instructors</option>
              <option value="students" className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">Students Only</option>
              <option value="instructors" className="bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC]">Instructors & TAs Only</option>
            </select>
          </div>
        </div>

        {/* Detailed Message */}
        <div>
          <label className="block font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
            Detailed Discussion Body <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            placeholder="Provide complete context, code snippets, problem statement or announcement details..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] p-3 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] font-normal focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">Tags (Comma-separated)</label>
          <Input
            placeholder="React 19, Hooks, Next.js, Hydration"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        {/* File Attachments */}
        <div className="space-y-2 border-t border-[#E2E8F0] dark:border-[#263244] pt-3">
          <div className="flex items-center justify-between">
            <label className="block font-medium text-[#475569] dark:text-[#CBD5E1]">Discussion Attachments</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('pdf')}
                className="text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Paperclip className="w-3 h-3" /> + PDF
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('image')}
                className="text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Image
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('zip')}
                className="text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
              >
                + ZIP
              </button>
            </div>
          </div>

          {isInstructor && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-[11px]">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-900 dark:text-amber-200">Storage Credits Notice</strong>
                Uploading attachments consumes storage credits. Storage credits are deducted only after successful file upload.
              </div>
            </div>
          )}

          {attachments.length > 0 ? (
            <div className="space-y-1.5">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">{att.name}</span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal">({att.sizeMb} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-[#F87171] p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#0F172A] rounded-xl text-center text-[#64748B] dark:text-[#94A3B8] text-xs">
              No files attached yet. Click above to attach PDF, images, or ZIP archives.
            </div>
          )}
        </div>

        {/* Feature Toggles */}
        {isInstructor && (
          <div className="space-y-2 border-t border-[#E2E8F0] dark:border-[#263244] pt-3">
            <label className="block font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">Instructor Thread Settings</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#3B82F6]"
                />
                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> Pin Topic to Top
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnnouncement}
                  onChange={(e) => setIsAnnouncement(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#3B82F6]"
                />
                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1">
                  <Megaphone className="w-3.5 h-3.5 text-amber-500" /> Mark as Announcement
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowReplies}
                  onChange={(e) => setAllowReplies(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#3B82F6]"
                />
                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> Allow Student Replies
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyStudents}
                  onChange={(e) => setNotifyStudents(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#3B82F6]"
                />
                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">Notify Enrolled Students</span>
              </label>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
          <Button variant="outline" type="button" onClick={onClose} className="h-9 text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]">
            Cancel
          </Button>
          <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 font-medium h-9 text-xs shadow-[0_4px_12px_rgba(37,99,235,0.12)]">
            {editingDiscussion ? 'Save Changes' : 'Publish Discussion'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
