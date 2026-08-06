import React, { useState } from 'react';
import {
  FileText,
  Eye,
  Users,
  DollarSign,
  Lock,
  Film,
  FileCheck,
  HelpCircle,
  Award,
  MessageSquare,
  Megaphone,
  Radio,
  Bell,
  Globe,
  Send,
  Download,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Trash2,
  Copy,
  Archive,
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { FeatureDisabledBanner } from '../../../discussions/components/FeatureDisabledBanner';
import type { CourseSettingsConfig } from '../store/courseSettings.store';

export interface CourseSettingsSectionsProps {
  sectionId: string;
  settings: CourseSettingsConfig;
  onChange: (updates: Partial<CourseSettingsConfig>) => void;
  courseFeatures: any;
  courseUuid: string;
  onOpenDeleteModal: () => void;
}

export const CourseSettingsSections: React.FC<CourseSettingsSectionsProps> = ({
  sectionId,
  settings,
  onChange,
  courseFeatures,
  courseUuid,
  onOpenDeleteModal,
}) => {
  const [instructorNoticeOpen, setInstructorNoticeOpen] = useState(false);

  const handleMediaUploadClick = () => {
    setInstructorNoticeOpen(true);
  };

  // 1. Basic Information
  if (sectionId === 'basic') {
    return (
      <Card padding="md" className="bg-white border border-slate-200 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">Basic Course Information</h3>

        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Course Title *</label>
            <Input
              value={settings.title}
              onChange={(e) => onChange({ title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Short Description Preview</label>
            <Input
              value={settings.shortDescription}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Full Course Overview</label>
            <textarea
              rows={4}
              value={settings.fullDescription}
              onChange={(e) => onChange({ fullDescription: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Category *</label>
              <Input
                value={settings.category}
                onChange={(e) => onChange({ category: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-900 mb-1">Level *</label>
              <select
                value={settings.level}
                onChange={(e) => onChange({ level: e.target.value as any })}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white font-bold text-slate-900"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-900 mb-1">Duration (Hours)</label>
              <Input
                type="number"
                value={settings.estimatedDurationHours}
                onChange={(e) => onChange({ estimatedDurationHours: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 2. Access & Visibility
  if (sectionId === 'access') {
    return (
      <Card padding="md" className="bg-white border border-slate-200 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">Access &amp; Visibility</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Visibility Mode</label>
            <select
              value={settings.visibility}
              onChange={(e) => onChange({ visibility: e.target.value as any })}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white font-bold text-slate-900"
            >
              <option value="Public">Public (Listed in catalog)</option>
              <option value="Unlisted">Unlisted (Link only)</option>
              <option value="Private">Private (Invite only)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Access Type</label>
            <select
              value={settings.accessType}
              onChange={(e) => onChange({ accessType: e.target.value as any })}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white font-bold text-slate-900"
            >
              <option value="Paid">Paid Course</option>
              <option value="Free">Free Course</option>
              <option value="Invite Only">Invite Only</option>
              <option value="Internal">Internal Academy</option>
            </select>
          </div>
        </div>
      </Card>
    );
  }

  // 4. Pricing (INR)
  if (sectionId === 'pricing') {
    return (
      <Card padding="md" className="bg-white border border-slate-200 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">Course Pricing Defaults (INR)</h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Currency</label>
            <Input value={settings.currency} disabled className="bg-slate-50" />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Regular Price (₹)</label>
            <Input
              type="number"
              value={settings.price}
              onChange={(e) => onChange({ price: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Discounted Price (₹)</label>
            <Input
              type="number"
              value={settings.discountPrice}
              onChange={(e) => onChange({ discountPrice: Number(e.target.value) })}
            />
          </div>
        </div>
      </Card>
    );
  }

  // 7. Assignment Settings
  if (sectionId === 'assignments') {
    if (!courseFeatures.assignments) {
      return (
        <FeatureDisabledBanner
          featureTitle="Assignments"
          description="Assignment Settings are disabled because the Assignments feature is turned off for this course."
          courseUuid={courseUuid}
        />
      );
    }
    return (
      <Card padding="md" className="bg-white border border-slate-200 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">Assignment Defaults</h3>
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Maximum Attempts</label>
            <Input
              type="number"
              value={settings.maxAssignmentAttempts}
              onChange={(e) => onChange({ maxAssignmentAttempts: Number(e.target.value) })}
            />
          </div>
        </div>
      </Card>
    );
  }

  // 8. Quiz Settings
  if (sectionId === 'quizzes') {
    if (!courseFeatures.quizzes) {
      return (
        <FeatureDisabledBanner
          featureTitle="Quizzes"
          description="Quiz Settings are disabled because the Quizzes feature is turned off for this course."
          courseUuid={courseUuid}
        />
      );
    }
    return (
      <Card padding="md" className="bg-white border border-slate-200 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">Quiz Defaults</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Passing Grade (%)</label>
            <Input
              type="number"
              value={settings.passingGradePercent}
              onChange={(e) => onChange({ passingGradePercent: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-900 mb-1">Maximum Attempts</label>
            <Input
              type="number"
              value={settings.maxQuizAttempts}
              onChange={(e) => onChange({ maxQuizAttempts: Number(e.target.value) })}
            />
          </div>
        </div>
      </Card>
    );
  }

  // 17. Danger Zone
  if (sectionId === 'danger-zone') {
    return (
      <Card padding="md" className="bg-white border border-rose-200 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-extrabold text-rose-900 border-b border-rose-100 pb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" /> Danger Zone Actions
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-extrabold text-slate-900 block">Archive Course</span>
              <span className="text-[10px] text-slate-500 font-medium">Hide course from student directory while preserving all records.</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => alert('Course archived.')}>
              Archive Course
            </Button>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-extrabold text-rose-950 block">Delete Course Permanently</span>
              <span className="text-[10px] text-rose-800 font-medium">Permanently delete course, student submissions, and certificates.</span>
            </div>
            <Button size="sm" onClick={onOpenDeleteModal} className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold">
              Delete Course
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Default Fallback Form
  return (
    <Card padding="md" className="bg-white border border-slate-200 space-y-3 font-sans text-xs text-left">
      <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 capitalize">{sectionId} Settings</h3>
      <p className="text-slate-500">Configure course-specific parameters for {sectionId}.</p>
    </Card>
  );
};
