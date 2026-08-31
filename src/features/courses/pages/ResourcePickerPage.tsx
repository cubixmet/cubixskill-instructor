import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Link2,
  AlertCircle,
  Loader2,
  Globe,
  Plus,
  Upload,
  CheckCircle2,
  Layers,
  FileText,
  Check,
} from 'lucide-react';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useCurriculumStore } from '../store/curriculum.store';
import { curriculumService } from '../services/curriculum.service';
import { resourceService } from '../services/resource.service';
import { coursesService } from '../../../services/courses.service';
import { isValidCourseId, isValidModuleUuid } from '../../../utils/courseValidation.utils';
import type { CourseModule, CourseLesson } from '../../../types/curriculum.types';

export const ResourcePickerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const effectiveCourseId = (params.courseId || params.courseUuid || '').trim();

  const rawModuleUuid = searchParams.get('moduleUuid');
  const rawLessonUuid = searchParams.get('lessonUuid');

  // Pre-flight validation checks:
  const isCourseValid = isValidCourseId(effectiveCourseId);
  const isModuleProvided = rawModuleUuid !== null && rawModuleUuid.trim() !== '';
  const isModuleValid = isModuleProvided && isValidModuleUuid(rawModuleUuid!);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allModules, setAllModules] = useState<CourseModule[]>([]);
  const [targetModule, setTargetModule] = useState<CourseModule | null>(null);
  const [isSectionPickerOpen, setIsSectionPickerOpen] = useState(false);

  const [selectedLessonUuid, setSelectedLessonUuid] = useState<string>(rawLessonUuid || '');

  const storeModules = useCurriculumStore((state) => state.modules);
  const storeLessons = useCurriculumStore((state) => state.lessons);

  // Load modules & lessons from backend
  const loadData = async () => {
    if (!isCourseValid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const fetchedModules = await curriculumService.fetchModules(effectiveCourseId);
      const modulesList =
        fetchedModules.length > 0
          ? fetchedModules
          : storeModules.filter((m) => m.courseUuid === effectiveCourseId);
      setAllModules(modulesList);

      if (rawModuleUuid) {
        const foundModule = modulesList.find((m) => m.uuid === rawModuleUuid);
        if (foundModule) {
          setTargetModule(foundModule);
        } else if (modulesList.length > 0) {
          setTargetModule(modulesList[0]);
        }
      } else if (modulesList.length > 0) {
        setTargetModule(modulesList[0]);
      }
    } catch (err) {
      console.error('[ResourcePickerPage] Error loading curriculum data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveCourseId, rawModuleUuid]);

  // Lessons in current selected module
  const currentModuleUuid = targetModule?.uuid || rawModuleUuid || '';
  const sectionLessons = storeLessons
    .filter((l) => l.moduleUuid === currentModuleUuid)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Keep selected lesson synced or pre-select first lesson in section
  useEffect(() => {
    if (rawLessonUuid && sectionLessons.some((l) => l.uuid === rawLessonUuid || l.id === rawLessonUuid)) {
      setSelectedLessonUuid(rawLessonUuid);
    } else if (sectionLessons.length > 0 && !selectedLessonUuid) {
      setSelectedLessonUuid(sectionLessons[0].uuid || sectionLessons[0].id || '');
    }
  }, [sectionLessons, rawLessonUuid]);

  const selectedLesson: CourseLesson | undefined = sectionLessons.find(
    (l) => l.uuid === selectedLessonUuid || l.id === selectedLessonUuid
  );

  // Form State
  const [resourceSource, setResourceSource] = useState<'UPLOAD' | 'URL'>('URL');
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [uploadedFileObj, setUploadedFileObj] = useState<{ name: string; sizeMb: string; url: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);

  // Errors & Loading
  const [titleError, setTitleError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const isValidHttpUrl = (str: string): boolean => {
    if (!str || !str.trim()) return false;
    const clean = str.trim().toLowerCase();
    return clean.startsWith('http://') || clean.startsWith('https://');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUrlError('');
    setIsUploadingFile(true);
    setUploadProgress(20);

    try {
      setUploadProgress(50);
      const media = await coursesService.uploadMedia(file, effectiveCourseId, selectedLessonUuid);
      setUploadProgress(100);
      setUploadedMediaId(media.id);
      setUploadedFileObj({
        name: media.original_filename || file.name,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1),
        url: media.url,
      });
      if (!title.trim()) {
        setTitle(media.original_filename || file.name);
        setTitleError('');
      }
    } catch (err: any) {
      setUrlError(err?.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedMediaId(null);
    setUploadedFileObj(null);
    setUrlError('');
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!selectedLesson) {
      setGeneralError('Please select a lesson to attach this resource to.');
      return false;
    }

    if (!title.trim()) {
      setTitleError('Resource title is required.');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (resourceSource === 'UPLOAD') {
      if (!uploadedMediaId && !uploadedFileObj) {
        setUrlError('Please upload a resource file.');
        isValid = false;
      } else {
        setUrlError('');
      }
    } else {
      if (!url.trim()) {
        setUrlError('Resource URL is required.');
        isValid = false;
      } else if (!isValidHttpUrl(url)) {
        setUrlError('URL must start with http:// or https://');
        isValid = false;
      } else {
        setUrlError('');
      }
    }

    return isValid;
  };

  const handleSwitchSection = (mod: CourseModule) => {
    setTargetModule(mod);
    setIsSectionPickerOpen(false);
    setSelectedLessonUuid('');
    navigate(`/courses/${effectiveCourseId}/curriculum/resources/add?moduleUuid=${mod.uuid}`, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const lessonId = selectedLesson?.uuid || selectedLesson?.id || '';
    if (!lessonId) return;

    setIsSubmitting(true);
    setGeneralError('');

    try {
      await resourceService.create(lessonId, {
        title: title.trim(),
        url: resourceSource === 'URL' ? url.trim() : (uploadedFileObj?.url || ''),
        media_file_id: resourceSource === 'UPLOAD' ? (uploadedMediaId || undefined) : undefined,
        description: description.trim(),
        resource_type: 'document',
        allow_download: allowDownload,
      });

      navigate(`/courses/${effectiveCourseId}/curriculum`);
    } catch (err: any) {
      console.error('Failed to create resource:', err);
      const apiMsg = err?.response?.data?.message || err?.response?.data?.detail || err?.message;
      setGeneralError(typeof apiMsg === 'string' ? apiMsg : 'Unable to save resource. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Invalid Course URL
  if (!isCourseValid) {
    return (
      <FormPageLayout
        title="Add Resource"
        subtitle="Invalid Course Identifier"
        backUrl="/courses"
        breadcrumbs={[{ label: 'Courses', url: '/courses' }, { label: 'Invalid Course' }]}
      >
        <div className="w-full max-w-lg mx-auto py-12 px-4 text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Invalid Course URL</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">The course identifier in the URL is malformed or invalid.</p>
          <Button onClick={() => navigate('/courses')} className="bg-[#2563EB] text-white font-medium">
            Back to Courses
          </Button>
        </div>
      </FormPageLayout>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <FormPageLayout
        title="Add Resource"
        subtitle="Loading Curriculum Setup..."
        backUrl={`/courses/${effectiveCourseId}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
          { label: 'Add Resource' },
        ]}
      >
        <div className="w-full max-w-md mx-auto py-16 text-center space-y-4 font-sans">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading section details...</p>
        </div>
      </FormPageLayout>
    );
  }

  // 3. Missing Module UUID / No Sections
  if (!isModuleProvided || !isModuleValid || !targetModule) {
    return (
      <FormPageLayout
        title="Add Resource"
        subtitle="Choose a Section"
        backUrl={`/courses/${effectiveCourseId}/curriculum`}
        breadcrumbs={[
          { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
          { label: 'Add Resource' },
        ]}
      >
        <div className="w-full max-w-lg mx-auto py-12 px-4 text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Choose a Section</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Select where this resource file belongs in your course curriculum.</p>
          <div className="pt-4 flex items-center justify-center gap-3">
            {allModules.length > 0 ? (
              <Button onClick={() => setIsSectionPickerOpen(true)} className="bg-[#2563EB] text-white font-medium">
                Select Section
              </Button>
            ) : (
              <Button onClick={() => navigate(`/courses/${effectiveCourseId}/curriculum/modules/new`)} className="bg-[#2563EB] text-white font-medium">
                + Create Section
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/courses/${effectiveCourseId}/curriculum`)} className="font-medium">
              Back to Curriculum
            </Button>
          </div>
        </div>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout
      title="Add Resource"
      subtitle={`Section: ${targetModule.title}`}
      backUrl={`/courses/${effectiveCourseId}/curriculum`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${effectiveCourseId}/curriculum` },
        { label: targetModule.title, url: `/courses/${effectiveCourseId}/curriculum` },
        { label: 'Add Resource' },
      ]}
    >
      <div className="w-full max-w-2xl mx-auto px-1 sm:px-4 py-4 sm:py-6 font-sans text-left space-y-5 pb-32">
        {/* Selected Section Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 dark:bg-[#111827] border border-blue-100 dark:border-[#263244] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs w-full min-w-0 shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] block">
                Target Section
              </span>
              <strong className="text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] truncate block font-bold">
                {targetModule.title}
              </strong>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setIsSectionPickerOpen(true)}
            className="h-9 sm:h-8 text-xs px-3 border-blue-200 dark:border-[#334155] text-[#2563EB] dark:text-[#60A5FA] bg-white dark:bg-[#172033] hover:bg-blue-100/60 dark:hover:bg-[#1E293B] font-bold shrink-0 w-full sm:w-auto"
          >
            Change Section
          </Button>
        </div>

        {/* Lesson Selection Section — only show dropdown if lesson was NOT specified in URL */}
        {!rawLessonUuid && sectionLessons.length > 0 && (
          <div className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-2 shadow-2xs">
            <label className="block text-xs font-semibold text-slate-900 dark:text-[#CBD5E1]">
              Attach to Lesson <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
            </label>
            <select
              value={selectedLessonUuid}
              onChange={(e) => setSelectedLessonUuid(e.target.value)}
              className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] cursor-pointer"
            >
              {sectionLessons.map((l, idx) => (
                <option key={l.uuid || l.id} value={l.uuid || l.id} className="dark:bg-[#111827]">
                  Lesson #{idx + 1}: {l.title} ({l.type})
                </option>
              ))}
            </select>
          </div>
        )}

        {rawLessonUuid && selectedLesson && (
          <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#2563EB] dark:text-[#60A5FA] tracking-wider block">
                  Target Lesson
                </span>
                <p className="font-bold text-slate-900 dark:text-white truncate text-xs">
                  {selectedLesson.title} ({selectedLesson.type})
                </p>
              </div>
            </div>
            <Badge variant="primary" size="sm" className="shrink-0 text-[10px]">
              Lesson Locked
            </Badge>
          </div>
        )}

        {/* No lessons empty state */}
        {!sectionLessons.length && (
          <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold text-amber-900 dark:text-amber-200 block">
                No Lessons in this Section
              </strong>
              <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                Resources must be attached to a lesson. Create a lesson in "{targetModule.title}" first to add attachments.
              </p>
            </div>
            <Button
              type="button"
              onClick={() =>
                navigate(`/courses/${effectiveCourseId}/curriculum/lessons/select-type?moduleUuid=${targetModule.uuid}`)
              }
              className="bg-[#2563EB] text-white text-xs font-bold px-4 py-2"
            >
              + Create Lesson in Section
            </Button>
          </div>
        )}

        {/* Main Resource Form */}
        {sectionLessons.length > 0 && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-4 sm:p-6 rounded-2xl shadow-2xs space-y-5">
            <div className="border-b border-slate-200 dark:border-[#263244] pb-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-[rgba(37,99,235,0.10)] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                    Resource File / URL
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal truncate">
                    Add downloadable PDFs, docs, or web links for students.
                  </p>
                </div>
              </div>

              {/* Source Switcher */}
              <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setResourceSource('UPLOAD');
                    setUrlError('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    resourceSource === 'UPLOAD'
                      ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResourceSource('URL');
                    setUrlError('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    resourceSource === 'URL'
                      ? 'bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Use URL</span>
                </button>
              </div>
            </div>

            {generalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Field: Resource Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-[#CBD5E1] mb-1">
                Resource Title <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
              </label>
              <Input
                value={title}
                autoFocus
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) setTitleError('');
                }}
                placeholder="e.g. Lesson Cheat Sheet PDF"
                className="h-11 text-xs sm:text-sm font-medium rounded-xl"
                error={titleError}
              />
            </div>

            {/* Field: File Upload Mode */}
            {resourceSource === 'UPLOAD' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-900 dark:text-[#CBD5E1]">
                  Upload File <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
                </label>
                {!uploadedFileObj ? (
                  <div className="relative border-2 border-dashed border-slate-300 dark:border-[#475569] hover:border-[#3B82F6] dark:hover:border-[#3B82F6] bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100/50 dark:hover:bg-[#172033] rounded-2xl p-6 text-center transition-all">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploadingFile}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center">
                        {isUploadingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">
                          {isUploadingFile ? 'Uploading file to storage...' : 'Click or drag file to upload'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">
                          Supports PDF, DOCX, ZIP, MP4, MP3, PNG (Max 50MB)
                        </p>
                      </div>
                      {isUploadingFile && (
                        <div className="w-full max-w-xs bg-slate-200 dark:bg-[#1E293B] h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-[#2563EB] dark:bg-[#3B82F6] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#334155] rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <strong className="text-xs text-slate-900 dark:text-[#F8FAFC] block truncate font-semibold">
                          {uploadedFileObj.name}
                        </strong>
                        <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                          {uploadedFileObj.sizeMb} MB • Uploaded & Linked
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={handleRemoveUploadedFile}
                      className="text-rose-600 dark:text-[#F87171] font-semibold"
                    >
                      Remove
                    </Button>
                  </div>
                )}
                {urlError && <p className="text-xs font-semibold text-rose-600 dark:text-[#F87171]">{urlError}</p>}
              </div>
            )}

            {/* Field: URL Mode */}
            {resourceSource === 'URL' && (
              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-[#CBD5E1] mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                  <span>Resource URL</span> <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
                </label>
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (isValidHttpUrl(e.target.value)) setUrlError('');
                  }}
                  placeholder="https://docs.example.com/guide.pdf"
                  className="h-11 text-xs sm:text-sm font-medium rounded-xl"
                  error={urlError}
                />
              </div>
            )}

            {/* Field: Allow Download Toggle */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] block">Allow Download</span>
                <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">Permit learners to download this file</span>
              </div>
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded cursor-pointer accent-[#2563EB]"
              />
            </div>

            {/* Field: Description (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-[#CBD5E1] mb-1">
                Description <span className="text-slate-500 dark:text-[#94A3B8] font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief instructions for using this resource..."
                rows={3}
                className="w-full p-3 bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-[#334155] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 dark:focus:border-[#3B82F6] font-normal resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/courses/${effectiveCourseId}/curriculum`)}
                className="h-10 text-xs font-semibold px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingFile}
                className="h-10 text-xs font-semibold px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs rounded-xl cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4 stroke-[3]" /> Add Resource
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* SECTION SWITCHER MODAL */}
        <Modal
          isOpen={isSectionPickerOpen}
          onClose={() => setIsSectionPickerOpen(false)}
          title="Select Target Section"
        >
          <div className="space-y-3 font-sans text-xs text-left p-1">
            <p className="text-slate-500 dark:text-[#94A3B8] text-xs">
              Choose which section this resource will be added to:
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {allModules.map((mod, idx) => {
                const isSelected = mod.uuid === currentModuleUuid;
                return (
                  <button
                    key={`switch-res-mod-${mod.uuid}`}
                    type="button"
                    onClick={() => handleSwitchSection(mod)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-[#2563EB] text-[#2563EB] font-bold shadow-xs'
                        : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] text-slate-800 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8]'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <strong className="text-xs truncate block">{mod.title}</strong>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      </div>
    </FormPageLayout>
  );
};
