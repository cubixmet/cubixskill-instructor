import React, { useState } from 'react';
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import type { CourseSettingsConfig } from '../../store/courseSettings.store';
import { coursesService } from '../../../../services/courses.service';

export interface CourseSettingsSectionsProps {
  sectionId: string;
  settings: CourseSettingsConfig;
  onChange: (updates: Partial<CourseSettingsConfig>) => void;
  courseFeatures: Record<string, boolean | undefined>;
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
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // 1. Basic Information
  if (sectionId === 'basic') {
    return (
      <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Basic Course Information</h3>

        <div className="space-y-3">
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Course Title *</label>
            <Input
              value={settings.title}
              onChange={(e) => onChange({ title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Short Description Preview</label>
            <Input
              value={settings.shortDescription}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Full Course Overview</label>
            <textarea
              rows={4}
              value={settings.fullDescription}
              onChange={(e) => onChange({ fullDescription: e.target.value })}
              className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--surface)] p-3 text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Category *</label>
              <Input
                value={settings.category}
                onChange={(e) => onChange({ category: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Level *</label>
              <select
                value={settings.level}
                onChange={(e) => onChange({ level: e.target.value as CourseSettingsConfig['level'] })}
                className="w-full h-9 rounded-lg border border-[var(--input-border)] px-3 bg-[var(--surface)] font-semibold text-[var(--text-primary)]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Duration (Hours)</label>
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
      <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Access &amp; Visibility</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Visibility Mode</label>
            <select
              value={settings.visibility}
              onChange={(e) => onChange({ visibility: e.target.value as CourseSettingsConfig['visibility'] })}
              className="w-full h-9 rounded-lg border border-[var(--input-border)] px-3 bg-[var(--surface)] font-semibold text-[var(--text-primary)]"
            >
              <option value="Public">Public (Listed in catalog)</option>
              <option value="Unlisted">Unlisted (Link only)</option>
              <option value="Private">Private (Invite only)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Access Type</label>
            <select
              value={settings.accessType}
              onChange={(e) => onChange({ accessType: e.target.value as CourseSettingsConfig['accessType'] })}
              className="w-full h-9 rounded-lg border border-[var(--input-border)] px-3 bg-[var(--surface)] font-semibold text-[var(--text-primary)]"
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
      <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Course Pricing Defaults (INR)</h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Currency</label>
            <Input value={settings.currency} disabled className="bg-[var(--surface-secondary)]" />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Regular Price (₹)</label>
            <Input
              type="number"
              value={settings.price}
              onChange={(e) => onChange({ price: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Discounted Price (₹)</label>
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

  // 10. Data & Export Settings
  if (sectionId === 'data-export') {
    const isExportEnabled = settings.allowDataExport !== false;

    const handleExport = async () => {
      if (!isExportEnabled) return;
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(false);

      try {
        const blob = await coursesService.exportCourseData(courseUuid);
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = (settings.title || 'course').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `${safeTitle}-students-${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to export course data.';
        setExportError(msg);
      } finally {
        setIsExporting(false);
      }
    };

    return (
      <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-5 font-sans text-xs text-left">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
            <Download className="w-4 h-4 text-[#2563EB]" /> data-export Settings
          </h3>
          <p className="text-[var(--text-secondary)] mt-1">Configure course-specific parameters for data-export.</p>
        </div>

        {/* Toggle Switch Card */}
        <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <label className="font-bold text-[var(--text-primary)] text-xs block">Allow Student &amp; Enrollment Data Export</label>
            <p className="text-[11px] text-[var(--text-secondary)] font-normal">
              When enabled, authorized instructors and academy administrators can download CSV exports of course student enrollments and progress.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isExportEnabled}
              onChange={(e) => onChange({ allowDataExport: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
          </label>
        </div>

        {/* Export Action Card */}
        <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-[#2563EB] shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[var(--text-primary)] block text-xs">Course Students &amp; Enrollment Data (CSV)</span>
                <span className="text-[11px] text-[var(--text-secondary)]">Includes Student Name, Email, Status, Access Type, Enrolled Date, and Progress %.</span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleExport}
              disabled={!isExportEnabled || isExporting}
              className={`shrink-0 font-semibold h-9 px-4 text-xs transition-all ${
                !isExportEnabled ? 'opacity-50 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-xs'
              }`}
              leftIcon={isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            >
              {isExporting ? 'Exporting...' : 'Export Course Data'}
            </Button>
          </div>

          {!isExportEnabled && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Data export is currently OFF for this course. Enable the setting above and save changes to perform exports.</span>
            </div>
          )}

          {exportSuccess && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Course data file generated and downloaded successfully!</span>
            </div>
          )}

          {exportError && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-lg text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{exportError}</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // 17. Danger Zone
  if (sectionId === 'danger-zone') {
    return (
      <Card padding="md" className="bg-[var(--surface)] border border-rose-200 dark:border-rose-900/50 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 border-b border-rose-100 dark:border-rose-900/30 pb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Danger Zone Actions
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--text-primary)] block">Archive Course</span>
              <span className="text-[10px] text-[var(--text-secondary)] font-normal">Hide course from student directory while preserving all records.</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => alert('Course archived.')}>
              Archive Course
            </Button>
          </div>

          <div className="p-3 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-rose-600 dark:text-rose-400 block">Delete Course Permanently</span>
              <span className="text-[10px] text-rose-500/80 font-normal">Permanently delete course, student submissions, and certificates.</span>
            </div>
            <Button size="sm" onClick={onOpenDeleteModal} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Delete Course
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Default Fallback Form
  return (
    <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] space-y-3 font-sans text-xs text-left">
      <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 capitalize">{sectionId} Settings</h3>
      <p className="text-[var(--text-secondary)]">Configure course-specific parameters for {sectionId}.</p>
    </Card>
  );
};
