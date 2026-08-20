import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Link2,
  AlertCircle,
  Loader2,
  Globe,
  Plus,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCurriculumStore } from '../store/curriculum.store';
import { curriculumService } from '../services/curriculum.service';
import { resourceService } from '../services/resource.service';
import { coursesService } from '../../../services/courses.service';

export const ResourcePickerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courseUuid } = useParams<{ courseUuid?: string }>();

  const moduleUuid = searchParams.get('moduleUuid') || '';
  const lessonUuid = searchParams.get('lessonUuid') || '';

  // Route guard: Prevent rendering if parameters are missing or invalid
  React.useEffect(() => {
    if (!courseUuid || courseUuid === 'undefined') {
      navigate('/courses', { replace: true });
      return;
    }
    if (!moduleUuid) {
      navigate(`/courses/${courseUuid}/curriculum`, { replace: true });
      return;
    }
  }, [courseUuid, moduleUuid, navigate]);

  const allModules = useCurriculumStore((state) => state.modules);
  const allLessons = useCurriculumStore((state) => state.lessons);

  const selectedModule =
    allModules.find((m) => m.uuid === moduleUuid) ||
    allModules.find((m) => m.courseUuid === courseUuid) ||
    allModules[0];

  // Resolve actual backend lesson object strictly from curriculum store
  const selectedLesson = allLessons.find((l) => l.id === lessonUuid || l.uuid === lessonUuid);

  const contextTitle = selectedLesson
    ? `${selectedLesson.title}`
    : selectedModule
    ? `${selectedModule.title}`
    : 'Curriculum';

  // Resource Source State
  const [resourceSource, setResourceSource] = useState<'UPLOAD' | 'URL'>('URL');

  // File Upload State
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [uploadedFileObj, setUploadedFileObj] = useState<{ name: string; sizeMb: string; url: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<'link' | 'document' | 'code' | 'video' | 'audio' | 'pdf' | 'other'>('link');
  const [allowDownload, setAllowDownload] = useState(false);

  // Field Error States
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
      const media = await coursesService.uploadMedia(file);
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

    // 1. Title validation
    if (!title.trim()) {
      setTitleError('Resource title is required.');
      isValid = false;
    } else {
      setTitleError('');
    }

    // 2. Source validation
    if (resourceSource === 'UPLOAD') {
      if (!uploadedMediaId && !uploadedFileObj) {
        setUrlError('Please upload a file before saving this resource.');
        isValid = false;
      } else {
        setUrlError('');
      }
    } else {
      if (!url.trim()) {
        setUrlError('Resource URL is required.');
        isValid = false;
      } else if (!isValidHttpUrl(url)) {
        setUrlError('Resource URL must start with http:// or https://');
        isValid = false;
      } else {
        setUrlError('');
      }
    }

    if (!isValid) {
      setTimeout(() => {
        const firstErrorEl =
          document.getElementById('resource-title-input') ||
          document.getElementById('resource-url-input');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorEl.focus();
        }
      }, 50);
    }

    return isValid;
  };

  const handleReturnToParent = () => {
    if (lessonUuid) {
      navigate(`/courses/${courseUuid}/curriculum/lessons/${lessonUuid}/edit`);
    } else {
      navigate(`/courses/${courseUuid}/curriculum`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const canonicalLessonId = selectedLesson?.id || selectedLesson?.uuid || lessonUuid;

    if (!canonicalLessonId || !selectedLesson) {
      setGeneralError('A valid saved lesson is required before adding resources.');
      return;
    }

    setIsSubmitting(true);
    setGeneralError('');

    try {
      await resourceService.create(canonicalLessonId, {
        title: title.trim(),
        url: resourceSource === 'URL' ? url.trim() : (uploadedFileObj?.url || ''),
        media_file_id: resourceSource === 'UPLOAD' ? (uploadedMediaId || undefined) : undefined,
        description: description.trim(),
        resource_type: resourceType,
        allow_download: allowDownload,
      });

      handleReturnToParent();
    } catch (err: any) {
      console.error('Failed to create lesson resource:', {
        lessonId: canonicalLessonId,
        uploadedMediaId,
        error: err,
      });
      const apiMsg = err?.response?.data?.error?.message || err?.message;
      setGeneralError(apiMsg && typeof apiMsg === 'string' ? apiMsg : 'Unable to save resource to backend. Please check connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <FormPageLayout
      title="Add Resource Link"
      subtitle={`Adding resource to: ${contextTitle}`}
      backUrl={`/courses/${courseUuid}/curriculum`}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
        { label: contextTitle, url: `/courses/${courseUuid}/curriculum` },
        { label: 'Add Resource' },
      ]}
    >
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 py-6 font-sans text-left space-y-5">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-5 sm:p-6 rounded-2xl shadow-2xs dark:shadow-[0_4px_14px_rgba(37,99,235,0.05)] space-y-5">
          <div className="border-b border-slate-200 dark:border-[#263244] pb-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-[rgba(37,99,235,0.10)] border border-blue-100 dark:border-[rgba(59,130,246,0.18)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                  Resource Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal truncate">
                  Add downloadable materials or external references for learners.
                </p>
              </div>
            </div>

            {/* Resource Source Mode Switcher */}
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
            <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1] mb-1">
              Resource Title <span className="text-rose-500 dark:text-[#F87171]">*</span>
            </label>
            <Input
              id="resource-title-input"
              value={title}
              autoFocus
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError('');
              }}
              placeholder="e.g. Official Documentation / Exercise Starter Repository"
              className="h-11 text-xs sm:text-sm font-medium rounded-xl bg-white dark:bg-[#0F172A] border-slate-300 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:border-[#3B82F6]"
              error={titleError}
            />
          </div>

          {/* Field: UPLOAD FILE MODE */}
          {resourceSource === 'UPLOAD' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                Upload Resource File <span className="text-rose-500 dark:text-[#F87171]">*</span>
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
                        Supports PDF, DOCX, ZIP, MP4, MP3, PNG, JPG (Max 50MB)
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
                        {uploadedFileObj.sizeMb} MB • Uploaded & Linked to Storage
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleRemoveUploadedFile}
                    className="text-rose-600 dark:text-[#F87171] hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                  >
                    Remove
                  </Button>
                </div>
              )}
              {urlError && resourceSource === 'UPLOAD' && (
                <p className="text-xs font-semibold text-rose-600 dark:text-[#F87171]">
                  {urlError}
                </p>
              )}
            </div>
          )}

          {/* Field: Resource URL */}
          {resourceSource === 'URL' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1] mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Resource URL</span> <span className="text-rose-500 dark:text-[#F87171]">*</span>
              </label>
              <Input
                id="resource-url-input"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (isValidHttpUrl(e.target.value)) setUrlError('');
                }}
                placeholder="https://github.com/... or https://docs.example.com/guide.pdf"
                className="h-11 text-xs sm:text-sm font-medium rounded-xl bg-white dark:bg-[#0F172A] border-slate-300 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:border-[#3B82F6]"
                error={urlError}
              />
            </div>
          )}

          {/* Field: Allow Download Toggle */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-900 dark:text-[#F8FAFC] block">Allow Download</span>
              <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">Permit learners to save this resource file</span>
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
            <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1] mb-1">
              Description <span className="text-slate-500 dark:text-[#94A3B8] font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or instructions for using this resource..."
              rows={3}
              className="w-full p-3 bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-[#334155] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 dark:focus:border-[#3B82F6] font-normal resize-y"
            />
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex w-full min-w-0 flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#263244]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReturnToParent}
              className="w-full sm:w-auto min-h-[42px] px-5 text-xs font-medium bg-white dark:bg-[#111827] border-slate-300 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] dark:hover:border-[#475569]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isUploadingFile}
              className="w-full sm:w-auto min-h-[42px] px-5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl cursor-pointer shadow-2xs dark:shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Resource...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4 stroke-[2.5]" /> Add Resource
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </FormPageLayout>
  );
};
