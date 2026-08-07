import React, { useState } from 'react';
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

export interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DiscussionItem>) => void;
  editingDiscussion?: DiscussionItem | null;
  isInstructor?: boolean;
}

const CATEGORIES = ['General', 'Q&A', 'Feedback', 'Announcements', 'Assignments', 'Technical'] as const;

export const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingDiscussion,
  isInstructor = true,
}) => {
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
        {/* Title */}
        <div>
          <label className="block font-bold text-slate-900 mb-1">
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
          <label className="block font-bold text-slate-900 mb-1">Short Summary / Subtitle</label>
          <Input
            placeholder="Brief 1-line overview displayed in the discussion card list..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>

        {/* Category & Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DiscussionItem['category'])}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as DiscussionItem['visibility'])}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Visible to All Enrolled Students & Instructors</option>
              <option value="students">Students Only</option>
              <option value="instructors">Instructors & TAs Only</option>
            </select>
          </div>
        </div>

        {/* Detailed Message */}
        <div>
          <label className="block font-bold text-slate-900 mb-1">
            Detailed Discussion Body <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            placeholder="Provide complete context, code snippets, problem statement or announcement details..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block font-bold text-slate-900 mb-1">Tags (Comma-separated)</label>
          <Input
            placeholder="React 19, Hooks, Next.js, Hydration"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        {/* File Attachments with Storage Warning for Instructors */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-slate-900">Discussion Attachments</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('pdf')}
                className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Paperclip className="w-3 h-3" /> + PDF
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('image')}
                className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Image
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('zip')}
                className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                + ZIP
              </button>
            </div>
          </div>

          {/* Warning Banner (Shown ONLY to Instructors) */}
          {isInstructor && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-[11px]">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-amber-900">Storage Credits Notice</strong>
                Uploading attachments consumes storage credits. Storage credits are deducted only after successful file upload.
              </div>
            </div>
          )}

          {/* Attachment list */}
          {attachments.length > 0 ? (
            <div className="space-y-1.5">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{att.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">({att.sizeMb} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              No files attached yet. Click above to attach PDF, images, or ZIP archives.
            </div>
          )}
        </div>

        {/* Feature Toggles */}
        {isInstructor && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="block font-bold text-slate-900 mb-1">Instructor Thread Settings</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-indigo-600" /> Pin Topic to Top
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnnouncement}
                  onChange={(e) => setIsAnnouncement(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Megaphone className="w-3.5 h-3.5 text-amber-600" /> Mark as Announcement
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowReplies}
                  onChange={(e) => setAllowReplies(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Allow Student Replies
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyStudents}
                  onChange={(e) => setNotifyStudents(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">Notify Enrolled Students</span>
              </label>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#2563EB] text-white px-6 font-bold">
            {editingDiscussion ? 'Save Changes' : 'Publish Discussion'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
