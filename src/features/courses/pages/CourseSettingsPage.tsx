import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

import { useCourseSettingsStore, DEFAULT_COURSE_SETTINGS, type CourseSettingsConfig } from '../store/courseSettings.store';
import { useCourseFeaturesStore, DEFAULT_COURSE_FEATURES } from '../store/courseFeatures.store';

import { CourseSettingsNav, SETTINGS_SECTIONS } from '../components/settings/CourseSettingsNav';
import { CourseSettingsSections } from '../components/settings/CourseSettingsSections';
import { DeleteCourseModal } from '../components/settings/DeleteCourseModal';
import { coursesService } from '../../../services/courses.service';
import { queryClient } from '../../../lib/query-client';
import type { CourseDetail } from '../types/course.types';
import { normalizeCourseId } from '../../../utils/courseValidation.utils';


export const CourseSettingsPage: React.FC = () => {
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const navigate = useNavigate();
  const outletContext = useOutletContext<{ course?: CourseDetail; fetchCourseDetail?: () => Promise<void> }>();

  const parentCourse = outletContext?.course;
  const rawCourseId = params.courseId || params.courseUuid || parentCourse?.id || '';
  const courseUuid = normalizeCourseId(rawCourseId) || rawCourseId;

  const getCourseSettings = useCourseSettingsStore((state) => state.getCourseSettings);
  const updateCourseSettings = useCourseSettingsStore((state) => state.updateCourseSettings);
  const resetCourseSettings = useCourseSettingsStore((state) => state.resetCourseSettings);

  const getCourseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures);
  const courseFeatures = getCourseFeatures ? getCourseFeatures(courseUuid) : DEFAULT_COURSE_FEATURES;

  const initialSettings = useMemo(() => {
    const storeSettings = getCourseSettings(courseUuid);
    if (!parentCourse) return storeSettings;
    return {
      ...storeSettings,
      title: parentCourse.title || storeSettings.title,
      subtitle: parentCourse.subtitle || storeSettings.subtitle,
      shortDescription: parentCourse.short_description || storeSettings.shortDescription,
      fullDescription: parentCourse.description || storeSettings.fullDescription,
      level: parentCourse.level || storeSettings.level,
      language: parentCourse.language || storeSettings.language,
      visibility: parentCourse.visibility || storeSettings.visibility,
      isFree: parentCourse.is_free ?? storeSettings.isFree,
      price: parentCourse.price ?? storeSettings.price,
      allowDataExport: parentCourse.allow_data_export ?? storeSettings.allowDataExport ?? true,
    };
  }, [parentCourse, courseUuid, getCourseSettings]);

  // Local editing state for unsaved dirty tracking
  const [localSettings, setLocalSettings] = useState<CourseSettingsConfig>(() => ({ ...initialSettings }));
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>('basic');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync localSettings when parentCourse or courseUuid loads/updates
  useEffect(() => {
    setLocalSettings({ ...initialSettings });
  }, [initialSettings]);

  // Dirty count
  const unsavedCount = useMemo(() => {
    let count = 0;
    (Object.keys(localSettings) as (keyof CourseSettingsConfig)[]).forEach((key) => {
      if (localSettings[key] !== initialSettings[key]) {
        count++;
      }
    });
    return count;
  }, [localSettings, initialSettings]);

  const handleUpdate = (updates: Partial<CourseSettingsConfig>) => {
    setLocalSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveChanges = async () => {
    if (!courseUuid) return;
    setIsSaving(true);
    try {
      await coursesService.patchCourse(courseUuid, {
        title: localSettings.title,
        subtitle: localSettings.subtitle || "",
        short_description: localSettings.shortDescription || "",
        description: localSettings.fullDescription || "",
        level: (localSettings.level?.toUpperCase() as any) || "BEGINNER",
        language: localSettings.language || "English",
        visibility: (localSettings.visibility?.toUpperCase() as any) || "PUBLIC",
        is_free: localSettings.isFree || false,
        price: localSettings.isFree ? 0 : localSettings.price || 0,
        allow_data_export: localSettings.allowDataExport,
      });

      updateCourseSettings(courseUuid, localSettings);

      // Invalidate queries & refetch parent course details
      queryClient.invalidateQueries({ queryKey: ["course", courseUuid] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      if (outletContext?.fetchCourseDetail) {
        await outletContext.fetchCourseDetail();
      }

      setToastMessage('Course configuration settings saved successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setToastMessage(err?.response?.data?.message || err?.message || 'Failed to update course settings.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    resetCourseSettings(courseUuid);
    setLocalSettings({ ...DEFAULT_COURSE_SETTINGS });
    setToastMessage('Reset course settings to defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteCourse = async () => {
    try {
      await coursesService.deleteCourse(courseUuid);
      navigate('/courses');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete course.');
    }
  };


  return (
    <div className="space-y-6 text-left font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-[var(--surface-secondary)] text-[var(--text-primary)] font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[var(--border)] animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <Card padding="md" className="bg-[var(--surface)] border border-[var(--border)] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Course Settings &amp; Configuration</h1>
              <Badge variant="info" size="sm" className="font-semibold">
                {localSettings.visibility}
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-normal mt-0.5">
              Configure course metadata, enrollment options, pricing, access rules, and SEO settings.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSettings}
              className="h-9 text-xs font-semibold"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Defaults
            </Button>

            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={unsavedCount === 0}
              className="h-9 font-semibold text-xs px-5 shadow-xs transition-all"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes {unsavedCount > 0 ? `(${unsavedCount})` : ''}
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. MAIN LAYOUT: DESKTOP SIDEBAR + FORM vs MOBILE ACCORDION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* DESKTOP LEFT SIDEBAR NAV */}
        <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-2 shrink-0">
          <Card padding="sm" className="bg-[var(--surface)] border border-[var(--border)] sticky top-4">
            <CourseSettingsNav
              activeSection={activeSection}
              onSelectSection={(id) => setActiveSection(id)}
              courseFeatures={courseFeatures}
            />
          </Card>
        </div>

        {/* DESKTOP ACTIVE FORM VIEW */}
        <div className="hidden md:block md:col-span-8 lg:col-span-9">
          <CourseSettingsSections
            sectionId={activeSection}
            settings={localSettings}
            onChange={handleUpdate}
            courseFeatures={courseFeatures}
            courseUuid={courseUuid}
            onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
          />
        </div>

        {/* MOBILE ACCORDION VIEW */}
        <div className="block md:hidden col-span-1 space-y-3 font-sans text-xs">
          {SETTINGS_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isExpanded = mobileExpandedSection === sec.id;
            const isDisabledFeature = sec.featureKey ? (courseFeatures as unknown as Record<string, boolean>)[sec.featureKey] === false : false;

            return (
              <Card key={sec.id} padding="none" className="bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileExpandedSection(isExpanded ? null : sec.id)}
                  className="w-full p-3.5 flex items-center justify-between font-semibold text-[var(--text-primary)] bg-[var(--surface-secondary)] border-b border-[var(--border)]"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                    <span>{sec.label}</span>
                    {isDisabledFeature && (
                      <Badge variant="warning" size="sm">Disabled</Badge>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                </button>

                {isExpanded && (
                  <div className="p-3">
                    <CourseSettingsSections
                      sectionId={sec.id}
                      settings={localSettings}
                      onChange={handleUpdate}
                      courseFeatures={courseFeatures}
                      courseUuid={courseUuid}
                      onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. STICKY SAVE FOOTER */}
      {unsavedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] p-3 shadow-lg flex items-center justify-between font-sans text-xs max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-[var(--text-primary)]">
              You have {unsavedCount} unsaved configuration change(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocalSettings({ ...initialSettings })}
            >
              Discard Changes
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              className="font-semibold px-6"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* DANGER ZONE DELETE MODAL */}
      <DeleteCourseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        courseTitle={localSettings.title}
        onConfirmDelete={handleDeleteCourse}
      />
    </div>
  );
};
