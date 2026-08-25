import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Save, Check } from 'lucide-react';
import type { CourseDiscussionSettings } from '../store/discussion.store';

export interface DiscussionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CourseDiscussionSettings;
  onSave: (newSettings: Partial<CourseDiscussionSettings>) => void;
}

export const DiscussionSettingsModal: React.FC<DiscussionSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formState, setFormState] = useState<CourseDiscussionSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleToggle = (key: keyof CourseDiscussionSettings) => {
    setFormState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(formState);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const settingItems: { key: keyof CourseDiscussionSettings; label: string; desc: string }[] = [
    {
      key: 'enableDiscussions',
      label: 'Enable Course Discussion Module',
      desc: 'Master toggle to enable or disable the discussion community forum for this course.',
    },
    {
      key: 'enableStudentTopics',
      label: 'Allow Students to Create Discussion Topics',
      desc: 'When enabled, students can start new discussion threads. If disabled, only instructors can start threads.',
    },
    {
      key: 'enableAttachments',
      label: 'Allow File Attachments in Threads & Replies',
      desc: 'Permit students and instructors to attach PDF, image, and code archives to posts.',
    },
    {
      key: 'enableLikes',
      label: 'Enable Upvotes & Likes',
      desc: 'Allow community members to upvote helpful discussions and instructor replies.',
    },
    {
      key: 'enableMentions',
      label: 'Enable User Mentions (@Student, @Instructor)',
      desc: 'Allow typing @ to autocomplete student and instructor names with instant notifications.',
    },
    {
      key: 'enableReports',
      label: 'Enable Community Message Reporting',
      desc: 'Allow students to flag off-topic or inappropriate messages to the instructor moderation queue.',
    },
    {
      key: 'enableInstructorAnnouncements',
      label: 'Enable Instructor Announcements',
      desc: 'Permit pinning official instructor announcements at the top of the course forum.',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Course Discussion Feature Settings"
      subtitle="Configure permissions, student topic creation rights, attachments, and moderation rules."
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="space-y-3">
          {settingItems.map((item) => {
            const isChecked = formState[item.key];
            return (
              <label
                key={item.key}
                className={`flex items-start justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-blue-50/50 dark:bg-[rgba(37,99,235,0.12)] border-blue-200 dark:border-[rgba(59,130,246,0.25)]'
                    : 'bg-slate-50 dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]'
                }`}
              >
                <div className="space-y-0.5 pr-4">
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs block">{item.label}</span>
                  <p className="text-[#64748B] dark:text-[#94A3B8] text-[11px] font-normal leading-relaxed">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(item.key)}
                  className="mt-1 w-4 h-4 rounded text-[#2563EB] focus:ring-[#3B82F6] cursor-pointer"
                />
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
          <Button variant="outline" onClick={onClose} className="h-9 text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium px-6 shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
            leftIcon={isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          >
            {isSaved ? 'Settings Saved!' : 'Save Feature Settings'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
