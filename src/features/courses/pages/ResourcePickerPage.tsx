import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Search,
  Globe,
  UploadCloud,
  FileVideo,
  FileAudio,
  FileText,
  Image as ImageIcon,
  FileCode,
  Check,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Coins,
  File,
  X,
} from 'lucide-react';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import {
  usePlatformStore,
  detectMediaType,
} from '../../../store/usePlatformStore';
import { useCurriculumStore } from '../store/curriculum.store';
import {
  validateResourceUrl,
  UrlValidationResult,
} from '../../../utils/urlValidation.util';
import type { LessonResourceAttachment } from '../../../types/curriculum.types';

export const ResourcePickerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{
    courseUuid?: string;
  }>();

  const moduleUuid = searchParams.get('moduleUuid') || '';
  const lessonUuid = searchParams.get('lessonUuid') || '';

  const mediaAssets = usePlatformStore((state) => state.mediaAssets || []);
  const totalCredits = usePlatformStore((state) => state.totalCredits);
  const touchMediaAssetLastUsed = usePlatformStore(
    (state) => state.touchMediaAssetLastUsed
  );
  const uploadMediaAsset = usePlatformStore((state) => state.uploadMediaAsset);

  const allModules = useCurriculumStore((state) => state.modules);
  const allLessons = useCurriculumStore((state) => state.lessons);
  const attachResourceToLesson = useCurriculumStore(
    (state) => state.attachResourceToLesson
  );

  const selectedModule =
    allModules.find((m) => m.uuid === moduleUuid) ||
    allModules.find((m) => m.courseUuid === courseUuid) ||
    allModules[0];
  const selectedLesson = allLessons.find((l) => l.uuid === lessonUuid);

  const contextTitle = selectedLesson
    ? `${selectedLesson.title}`
    : selectedModule
    ? `${selectedModule.title}`
    : 'Curriculum';

  // Navigation Tabs State (3 Primary Options)
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'url'>('search');

  // Option 1: Search Existing State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Option 2: Upload File State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // Option 3: Add by URL State
  const [urlInput, setUrlInput] = useState('');
  const [urlState, setUrlState] = useState<
    'idle' | 'validating' | 'valid' | 'invalid'
  >('idle');
  const [validationResult, setValidationResult] =
    useState<UrlValidationResult | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  // Unsaved confirmation modal state
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const getFormatIcon = (format: string, name: string) => {
    const mType = detectMediaType(format, name);
    if (mType === 'video') return <FileVideo className="w-5 h-5 text-blue-600" />;
    if (mType === 'audio') return <FileAudio className="w-5 h-5 text-indigo-600" />;
    if (mType === 'image') return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    if (mType === 'document') return <FileText className="w-5 h-5 text-amber-600" />;
    return <FileCode className="w-5 h-5 text-slate-600" />;
  };

  const filteredAssets = mediaAssets.filter((asset) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      asset.name.toLowerCase().includes(q) ||
      asset.format.toLowerCase().includes(q) ||
      asset.folder.toLowerCase().includes(q)
    );
  });

  const selectedAsset = mediaAssets.find((a) => a.id === selectedAssetId);

  // Calculate storage credits required for staged file
  const fileCreditsRequired = stagedFile
    ? Math.max(1, Math.ceil(stagedFile.size / (1024 * 1024 * 50)))
    : 0;

  // Check duplicate URL in media library
  const matchingExistingAsset = validationResult?.isValid
    ? mediaAssets.find(
        (a) =>
          a.url.toLowerCase() === validationResult.normalizedUrl.toLowerCase()
      )
    : null;

  const handleValidateUrl = async (rawUrl: string) => {
    if (!rawUrl.trim()) {
      setUrlState('idle');
      setValidationResult(null);
      return;
    }

    setUrlState('validating');
    setSubmitNotice(null);

    const result = await validateResourceUrl(rawUrl);
    setValidationResult(result);
    if (result.isValid) {
      setUrlState('valid');
    } else {
      setUrlState('invalid');
    }
  };

  const handleReturnToParent = () => {
    if (lessonUuid) {
      navigate(`/courses/${courseUuid}/curriculum/lessons/${lessonUuid}/edit`);
    } else {
      navigate(`/courses/${courseUuid}/curriculum`);
    }
  };

  const handleBackClick = () => {
    if (
      (activeTab === 'url' && urlInput.trim() && urlState === 'valid') ||
      (activeTab === 'search' && selectedAssetId) ||
      (activeTab === 'upload' && stagedFile)
    ) {
      setShowDiscardModal(true);
      return;
    }
    handleReturnToParent();
  };

  // Action 1: Add Selected Search Asset
  const handleAddSelectedAsset = () => {
    if (!selectedAsset) return;
    setIsSubmitting(true);
    setSubmitNotice(null);

    touchMediaAssetLastUsed(selectedAsset.id);
    const mType = detectMediaType(selectedAsset.format, selectedAsset.name);

    const attachment: LessonResourceAttachment = {
      id: `att-${Date.now()}`,
      name: selectedAsset.name,
      type: mType === 'video' ? 'video' : mType === 'audio' ? 'audio' : mType === 'image' ? 'image' : 'document',
      url: selectedAsset.url,
      sizeMb: selectedAsset.sizeMb,
      provider: 'Media Library',
      attachedAt: new Date().toISOString(),
      mediaAssetId: selectedAsset.id,
    };

    if (lessonUuid) {
      const isNew = attachResourceToLesson(lessonUuid, attachment);
      if (!isNew) {
        setIsSubmitting(false);
        setSubmitNotice('This resource is already attached to the lesson.');
        return;
      }
    }

    setTimeout(() => {
      handleReturnToParent();
    }, 300);
  };

  // Action 2: Upload File & Add
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStagedFile(file);
    setFileUploadError(null);
    setUploadProgress(0);
  };

  const handleAddUploadedFile = () => {
    if (!stagedFile) return;
    if (fileCreditsRequired > totalCredits) {
      setFileUploadError(
        `Insufficient storage credits. Required: ${fileCreditsRequired}, Available: ${totalCredits}.`
      );
      return;
    }

    setIsUploadingFile(true);
    setIsSubmitting(true);
    setFileUploadError(null);

    // Simulate progress
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setUploadProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        const formatExt = stagedFile.name.split('.').pop()?.toLowerCase() || 'file';
        const sizeMb = Number((stagedFile.size / (1024 * 1024)).toFixed(1)) || 0.1;
        const uploadedAsset = uploadMediaAsset({
          name: stagedFile.name,
          sizeMb,
          format: formatExt,
          folder: 'Lesson Resources',
        });

        const mType = detectMediaType(formatExt, stagedFile.name);
        const attachment: LessonResourceAttachment = {
          id: `att-${Date.now()}`,
          name: uploadedAsset.name,
          type: mType === 'video' ? 'video' : mType === 'audio' ? 'audio' : mType === 'image' ? 'image' : 'document',
          url: uploadedAsset.url,
          sizeMb: uploadedAsset.sizeMb,
          provider: 'Uploaded File',
          attachedAt: new Date().toISOString(),
          mediaAssetId: uploadedAsset.id,
        };

        if (lessonUuid) {
          attachResourceToLesson(lessonUuid, attachment);
        }

        setTimeout(() => {
          setIsUploadingFile(false);
          handleReturnToParent();
        }, 300);
      }
    }, 200);
  };

  // Action 3: Add URL Resource
  const handleAddUrlResource = () => {
    if (!validationResult || !validationResult.isValid) return;
    setIsSubmitting(true);
    setSubmitNotice(null);

    let assetId: string | undefined;
    if (matchingExistingAsset) {
      touchMediaAssetLastUsed(matchingExistingAsset.id);
      assetId = matchingExistingAsset.id;
    } else {
      const createdAsset = uploadMediaAsset({
        name: validationResult.title || 'External Resource',
        sizeMb: 0.1,
        format: validationResult.resourceType,
        folder: 'External Links',
      });
      assetId = createdAsset.id;
    }

    const attachment: LessonResourceAttachment = {
      id: `att-${Date.now()}`,
      name: validationResult.title || 'External Resource',
      type: validationResult.resourceType,
      url: validationResult.normalizedUrl,
      provider: validationResult.provider,
      attachedAt: new Date().toISOString(),
      mediaAssetId: assetId,
    };

    if (lessonUuid) {
      const isNew = attachResourceToLesson(lessonUuid, attachment);
      if (!isNew) {
        setIsSubmitting(false);
        setSubmitNotice('This URL resource is already attached to the lesson.');
        return;
      }
    }

    setTimeout(() => {
      handleReturnToParent();
    }, 300);
  };

  return (
    <FormPageLayout
      title="Add Resource"
      subtitle={`Adding to: ${contextTitle}`}
      backUrl={`/courses/${courseUuid}/curriculum`}
      onBackClick={handleBackClick}
      breadcrumbs={[
        { label: 'Curriculum', url: `/courses/${courseUuid}/curriculum` },
        { label: contextTitle, url: `/courses/${courseUuid}/curriculum` },
        { label: 'Add Resource' },
      ]}
    >
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 font-sans text-left space-y-5">
        {/* Method Segmented Control / Responsive Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'search'
                ? 'bg-white text-[#2563EB] shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Search Existing</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'upload'
                ? 'bg-white text-[#2563EB] shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'url'
                ? 'bg-white text-[#2563EB] shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Add by URL</span>
          </button>
        </div>

        {submitNotice && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{submitNotice}</span>
          </div>
        )}

        {/* OPTION 1: SEARCH EXISTING */}
        {activeTab === 'search' && (
          <div className="space-y-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Search Media Library &amp; Platform Resources
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Results Grid / List */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 no-scrollbar">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const isSelected = selectedAssetId === asset.id;
                  const mType = detectMediaType(asset.format, asset.name);

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-600 ring-1 ring-blue-600/30'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {asset.thumbnailUrl ? (
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            {getFormatIcon(asset.format, asset.name)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {asset.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                            <Badge
                              variant="outline"
                              size="sm"
                              className="capitalize text-[10px] py-0"
                            >
                              {mType}
                            </Badge>
                            <span>{asset.sizeMb} MB</span>
                            <span>• {asset.folder}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 hover:text-blue-600">
                            Select
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-700">
                    No matching resources found
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Could not find resources matching "{searchQuery}". You can upload a new file or add an external URL.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="xs"
                      onClick={() => setActiveTab('upload')}
                      className="bg-blue-600 text-white font-bold"
                    >
                      Upload File
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setActiveTab('url')}
                    >
                      Add by URL
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReturnToParent}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!selectedAssetId || isSubmitting}
                onClick={handleAddSelectedAsset}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold px-5"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                  </span>
                ) : (
                  'Add Selected'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* OPTION 2: UPLOAD FILE */}
        {activeTab === 'upload' && (
          <div className="space-y-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4,.mp3,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />

            {!stagedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center bg-slate-50 hover:bg-blue-50/40 transition-all cursor-pointer space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    Click to choose a file or drag &amp; drop
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports PDF, DOCX, PPTX, XLSX, ZIP, Images, Audio, Video (Up to 500 MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <File className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {stagedFile.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {(stagedFile.size / (1024 * 1024)).toFixed(1)} MB • {stagedFile.type || 'Document'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStagedFile(null);
                      setFileUploadError(null);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Storage Credit Info */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Storage Credits Required: <strong>{fileCreditsRequired} Credit{fileCreditsRequired > 1 ? 's' : ''}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600">
                    Available: <strong>{totalCredits}</strong>
                  </span>
                </div>

                {/* Upload Progress */}
                {isUploadingFile && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                      <span>Uploading resource...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {fileUploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{fileUploadError}</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReturnToParent}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!stagedFile || isSubmitting}
                onClick={handleAddUploadedFile}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold px-5"
              >
                {isUploadingFile ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </span>
                ) : (
                  'Add Resource'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* OPTION 3: ADD BY URL */}
        {activeTab === 'url' && (
          <div className="space-y-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Resource URL <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (urlState !== 'idle') handleValidateUrl(e.target.value);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or https://example.com/document.pdf"
                  className="h-10 text-xs sm:text-sm flex-1"
                  error={
                    urlState === 'invalid' && validationResult?.error
                      ? validationResult.error
                      : undefined
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleValidateUrl(urlInput)}
                  className="h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 shrink-0"
                >
                  {urlState === 'validating' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Check URL'
                  )}
                </Button>
              </div>
            </div>

            {/* Validation State Feedbacks */}
            {urlState === 'validating' && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-semibold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <span>Checking URL format and resource availability...</span>
              </div>
            )}

            {urlState === 'invalid' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationResult?.error || 'Please enter a valid supported URL.'}</span>
              </div>
            )}

            {/* Validated Preview Card */}
            {urlState === 'valid' && validationResult && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <strong className="text-xs font-bold text-slate-900">
                        URL Validated
                      </strong>
                    </div>
                    <Badge variant="neutral" size="sm" className="capitalize">
                      {validationResult.resourceType}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">
                      {validationResult.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono truncate flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{validationResult.normalizedUrl}</span>
                    </p>
                  </div>
                </div>

                {matchingExistingAsset && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Matching asset found in Media Library (<strong>{matchingExistingAsset.name}</strong>). Existing asset will be reused.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReturnToParent}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={urlState !== 'valid' || isSubmitting}
                onClick={handleAddUrlResource}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold px-5"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                  </span>
                ) : (
                  'Add Resource'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Discard Confirmation Modal */}
      <Modal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        title="Discard Unsaved Resource?"
      >
        <div className="space-y-4 text-xs text-left font-sans">
          <p className="text-slate-600">
            You have selected, uploaded, or validated a resource that has not been added yet. Leaving now will discard your changes.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setShowDiscardModal(false)}
            >
              Keep Editing
            </Button>
            <Button
              onClick={handleReturnToParent}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Discard &amp; Exit
            </Button>
          </div>
        </div>
      </Modal>
    </FormPageLayout>
  );
};
