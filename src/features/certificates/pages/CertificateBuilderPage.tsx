import React, { useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Layers,
  Save,
  Eye,
  Type,
  ImageIcon,
  Sliders,
  Trash2,
  BookOpen,
  Loader2,
  AlertCircle,
  Upload,
  Undo,
  Redo,
  Copy,
  Lock,
  Unlock,
  EyeOff,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  BookCheck,
  Check,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PersonalFieldsModal } from '../components/PersonalFieldsModal';
import { UploadFontModal } from '../components/UploadFontModal';
import { useCertificateBuilder } from '../hooks/useCertificateBuilder';
import { CertificateInspector } from '../components/CertificateInspector';
import { CertificateCanvasWorkspace } from '../components/CertificateCanvasWorkspace';
import { CERTIFICATE_PAGE_PRESET_OPTIONS } from '../utils/pagePresets';
import { certificatesService } from '../../../services/certificates.service';
import { serializeCertificateTemplate } from '../utils/certificateSerialization';

export const CertificateBuilderPage: React.FC = () => {
  const b = useCertificateBuilder();
  const location = useLocation();
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();

  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'bg' | 'fields' | 'layers' | 'settings'>('text');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [createDraftError, setCreateDraftError] = useState<string>('');
  const [existingDraftId, setExistingDraftId] = useState<string | null>(null);

  const isCanvasRoute = location.pathname.endsWith('/canvas') || (!location.pathname.endsWith('/fields') && !location.pathname.endsWith('/setup') && Boolean(templateId));
  const isFieldsRoute = location.pathname.endsWith('/fields');
  const isSetupRoute = location.pathname === '/certificates/new' || location.pathname.endsWith('/setup');

  const currentStepNum = isCanvasRoute ? 3 : isFieldsRoute ? 2 : 1;

  // Step 1: Handle course selection submit / draft creation
  const handleContinueFromSetup = async () => {
    if (isCreatingDraft) return;
    if (!b.selectedCourseId) {
      b.showToast('Please select a course to continue.');
      return;
    }
    setCreateDraftError('');
    setExistingDraftId(null);

    const draftPayload = serializeCertificateTemplate({
      templateName: b.templateName || 'Course Completion Certificate',
      description: b.description || '',
      selectedCourseId: b.selectedCourseId,
      pageSize: b.pageSize,
      orientation: b.orientation,
      customWidth: b.customWidth,
      customHeight: b.customHeight,
      customUnit: b.customUnit,
      elements: b.elements,
      backgroundImageUrl: b.backgroundImageUrl,
      backgroundAssetId: b.backgroundAssetId,
      bgFit: b.bgFit,
      bgPosition: b.bgPosition,
      bgOpacity: b.bgOpacity,
      bgColor: b.bgColor,
      isEditMode: b.isEditMode,
      existingTemplateDetail: b.templateDetail,
    });

    if (templateId) {
      // Already existing template draft -> Update course and proceed to Step 2 (Fields)
      try {
        setIsCreatingDraft(true);
        await certificatesService.updateTemplate(templateId, draftPayload);
        navigate(`/certificates/${templateId}/fields`);
      } catch (err: any) {
        const data = err?.response?.data;
        const msg = (typeof data === 'object' && data?.detail) || (typeof data === 'string' && data) || err?.message || 'Failed to save course setup.';
        if (data?.existing_template_id) {
          setExistingDraftId(String(data.existing_template_id));
        }
        setCreateDraftError(msg);
        b.showToast(msg, 'error');
      } finally {
        setIsCreatingDraft(false);
      }
    } else {
      // Brand new template -> Create backend draft and navigate to /certificates/{id}/fields
      try {
        setIsCreatingDraft(true);
        const created = await certificatesService.createTemplate(draftPayload);
        if (!created?.id) throw new Error('Backend failed to return template ID.');
        b.showToast('Certificate draft initialized.', 'success');
        navigate(`/certificates/${created.id}/fields`);
      } catch (err: any) {
        const data = err?.response?.data;
        const msg = (typeof data === 'object' && data?.detail) || (typeof data === 'string' && data) || (Array.isArray(data) ? data[0] : null) || err?.message || 'Failed to initialize certificate draft.';
        if (data?.existing_template_id) {
          setExistingDraftId(String(data.existing_template_id));
        }
        setCreateDraftError(msg);
        b.showToast(msg, 'error');
      } finally {
        setIsCreatingDraft(false);
      }
    }
  };

  // STEP INDICATOR HEADER (Rendered on Step 1 & Step 2 within DashboardLayout)
  const StepIndicatorHeader = () => {
    const stepTitle = currentStepNum === 1 ? 'Course' : currentStepNum === 2 ? 'Fields' : 'Canvas';

    return (
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#263244] px-3.5 sm:px-4 py-3 mb-4 sm:mb-6 shadow-2xs">
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Header Row: Back button + Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/certificates')}
              className="p-2 sm:p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center cursor-pointer shrink-0"
              title="Back to Certificates List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                {templateId ? 'Edit Certificate Template' : 'Create Certificate Template'}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentStepNum === 1 ? 'Course Selection' : currentStepNum === 2 ? 'Dynamic Field Configuration' : 'Visual Canvas Editor'}
              </p>
            </div>
          </div>

          {/* Step Indicator Row Below Title */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-[#263244]/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            {/* Mobile View (< sm): Compact "Step X of 3 — StepName" + Segmented Bar */}
            <div className="flex sm:hidden flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Step {currentStepNum} of 3 — <strong className="text-blue-600 dark:text-blue-400">{stepTitle}</strong></span>
                <span className="text-[11px] font-mono text-slate-400">{Math.round((currentStepNum / 3) * 100)}%</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`h-full rounded-full transition-all ${
                      num <= currentStepNum
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop View (>= sm): Horizontal Stepper Badges */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto py-0.5 max-w-full">
              {[
                { num: 1, label: 'Course', route: templateId ? `/certificates/${templateId}/setup` : '/certificates/new' },
                { num: 2, label: 'Fields', route: templateId ? `/certificates/${templateId}/fields` : null },
                { num: 3, label: 'Canvas', route: templateId ? `/certificates/${templateId}/canvas` : null },
              ].map((s, idx) => {
                const isCurrent = currentStepNum === s.num;
                const isCompleted = currentStepNum > s.num;
                return (
                  <React.Fragment key={s.num}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}
                    {s.route && isCompleted ? (
                      <Link
                        to={s.route}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800 shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{s.label}</span>
                      </Link>
                    ) : (
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                          {s.num}
                        </span>
                        <span>{s.label}</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // PAGE 1: Course Selection (/certificates/new or /certificates/{id}/setup)
  if (isSetupRoute) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 pb-28 sm:pb-12">
        <StepIndicatorHeader />

        <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
          <Card className="p-3.5 sm:p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-xs space-y-4 sm:space-y-6 box-border w-full min-w-0">
            <div className="space-y-1.5 pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-[#263244]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold border border-blue-100 dark:border-blue-900/40">
                <BookCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Certificate Assignment</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Select Course
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose a course without a certificate template.
              </p>
            </div>

            <div className="space-y-4 w-full min-w-0">
              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Template Title *
                </label>
                <input
                  type="text"
                  value={b.templateName}
                  onChange={(e) => b.setTemplateName(e.target.value)}
                  placeholder="e.g. Course Completion Certificate"
                  className="w-full min-h-[44px] h-11 px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 min-w-0 box-border"
                />
              </div>

              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Select Course *
                </label>
                <select
                  value={b.selectedCourseId}
                  onChange={(e) => b.setSelectedCourseId(e.target.value)}
                  className="w-full min-h-[44px] h-11 px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer min-w-0 box-border"
                >
                  <option value="">Choose an eligible course...</option>
                  {b.isEditMode && b.selectedCourseId && !b.eligibleCourses.some((c: any) => String(c.id) === String(b.selectedCourseId)) && (() => {
                    const curr = b.queriedCourses.find((c: any) => String(c.id) === String(b.selectedCourseId));
                    return curr ? <option value={curr.id}>{curr.title || curr.name} (Current Selection)</option> : null;
                  })()}
                  {b.eligibleCourses.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.title || c.name}
                    </option>
                  ))}
                </select>
                {b.eligibleCourses.length === 0 && !b.selectedCourseId && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium leading-normal">
                    All available courses in your academy already have an assigned certificate template.
                  </p>
                )}
                {createDraftError && (
                  <div className="mt-2.5 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{createDraftError}</span>
                    </div>
                    {existingDraftId && (
                      <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <span className="text-slate-600 dark:text-slate-400">An active draft already exists for this course.</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/certificates/${existingDraftId}/fields`)}
                          className="w-full sm:w-auto min-h-[44px] sm:min-h-0 text-xs font-bold text-blue-600 border-blue-300 hover:bg-blue-50 cursor-pointer justify-center"
                        >
                          Resume Existing Draft
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Description / Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={b.description}
                  onChange={(e) => b.setDescription(e.target.value)}
                  placeholder="Optional notes or template version details..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 min-w-0 box-border"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-[#263244] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/certificates')}
                className="w-full sm:w-auto h-11 sm:h-10 min-h-[44px] px-5 text-xs font-semibold cursor-pointer justify-center"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!b.selectedCourseId || isCreatingDraft}
                onClick={handleContinueFromSetup}
                className="w-full sm:w-auto h-11 sm:h-10 min-h-[44px] px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isCreatingDraft ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initializing Draft...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Field Setup</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const [isSavingFields, setIsSavingFields] = useState(false);
  const [saveFieldsError, setSaveFieldsError] = useState<string>('');

  const handleSaveFieldsAndContinue = async () => {
    if (isSavingFields) return;
    if (!templateId) {
      b.showToast('Invalid template ID.', 'error');
      return;
    }
    setIsSavingFields(true);
    setSaveFieldsError('');

    try {
      const payload = serializeCertificateTemplate({
        templateName: b.templateName || 'Course Completion Certificate',
        description: b.description || '',
        selectedCourseId: b.selectedCourseId,
        pageSize: b.pageSize,
        orientation: b.orientation,
        customWidth: b.customWidth,
        customHeight: b.customHeight,
        customUnit: b.customUnit,
        elements: b.elements,
        backgroundImageUrl: b.backgroundImageUrl,
        backgroundAssetId: b.backgroundAssetId,
        bgFit: b.bgFit,
        bgPosition: b.bgPosition,
        bgOpacity: b.bgOpacity,
        bgColor: b.bgColor,
        requiredStudentFields: b.requiredStudentFields,
        isEditMode: true,
        existingTemplateDetail: b.templateDetail,
      });

      await certificatesService.updateTemplate(templateId, payload);
      b.showToast('Field settings persisted successfully.', 'success');
      navigate(`/certificates/${templateId}/canvas`);
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        (typeof data === 'object' && (data?.detail || data?.message)) ||
        (typeof data === 'string' && data) ||
        err?.message ||
        'Failed to save dynamic field settings.';
      setSaveFieldsError(msg);
      b.showToast(msg, 'error');
    } finally {
      setIsSavingFields(false);
    }
  };

  // PAGE 2: Dynamic Field Configuration (/certificates/{templateId}/fields)
  if (isFieldsRoute) {
    if (b.isLoadingTemplate) {
      return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 pb-28 sm:pb-12">
          <StepIndicatorHeader />
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-12 text-center">
            <Card className="p-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading certificate template and field definitions...</p>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 pb-28 sm:pb-12">
        <StepIndicatorHeader />

        <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
          <Card className="p-3.5 sm:p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-xs space-y-4 sm:space-y-6 box-border w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#263244] pb-3.5 sm:pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Configure Dynamic Fields
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select dynamic variables and student fields available on canvas.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => b.setIsPersonalModalOpen(true)}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-0 text-xs font-bold text-blue-600 border-blue-200 dark:border-blue-900/60 cursor-pointer justify-center"
              >
                + Create Custom Student Field
              </Button>
            </div>

            <div className="space-y-4 w-full min-w-0">
              <div className="flex items-center gap-2 w-full min-w-0">
                <input
                  type="text"
                  value={b.fieldSearch}
                  onChange={(e) => b.setFieldSearch(e.target.value)}
                  placeholder="Search available fields..."
                  className="w-full min-h-[44px] h-11 px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 min-w-0 box-border"
                />
              </div>

              {saveFieldsError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{saveFieldsError}</span>
                </div>
              )}

              {b.isLoadingFields ? (
                <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Loading dynamic fields for selected course...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[60vh] sm:max-h-[440px] overflow-y-auto pr-1">
                  {(b.availableBindings.length > 0 ? b.availableBindings : b.designerSelectedBindings)
                    .filter(
                      (f) =>
                        f.label.toLowerCase().includes(b.fieldSearch.toLowerCase()) ||
                        f.key.toLowerCase().includes(b.fieldSearch.toLowerCase())
                    )
                    .map((binding) => {
                      const isSelected = b.elements.some((item) => item.binding === binding.key);
                      const isCustom = binding.key.includes('custom');
                      const isRequired = b.requiredStudentFields.includes(binding.key);

                      return (
                        <div
                          key={binding.key}
                          className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold truncate">{binding.label}</div>
                              <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{binding.key}</div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                                isCustom
                                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {isCustom ? 'Custom' : 'Auto'}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                            {isCustom || binding.key.startsWith('student.') ? (
                              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isRequired}
                                  onChange={() => b.toggleRequiredStudentField(binding.key)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span>Required</span>
                              </label>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Automatic System Field</span>
                            )}

                            <Button
                              type="button"
                              variant={isSelected ? "ghost" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (!isSelected) {
                                  b.addElement(binding);
                                }
                              }}
                              className={`h-7 px-2.5 text-[11px] font-bold min-h-0 ${
                                isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              {isSelected ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3 h-3" /> On Canvas
                                </span>
                              ) : (
                                '+ Add to Canvas'
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-[#263244] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/certificates/${templateId}/setup`)}
                className="w-full sm:w-auto h-11 sm:h-10 min-h-[44px] px-5 text-xs font-semibold cursor-pointer justify-center"
              >
                Back to Course Setup
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isSavingFields}
                onClick={handleSaveFieldsAndContinue}
                className="w-full sm:w-auto h-11 sm:h-10 min-h-[44px] px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isSavingFields ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Persisting Settings...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Canvas Editor</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        <PersonalFieldsModal
          isOpen={b.isPersonalModalOpen}
          onClose={() => b.setIsPersonalModalOpen(false)}
          onFieldCreated={b.handlePersonalFieldCreated}
        />
      </div>
    );
  }

  // PAGE 3: Visual Canvas Editor (/certificates/{templateId}/canvas)
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans select-none">
      {/* Toast Alert */}
      {b.toastState && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            b.toastState.type === 'success'
              ? 'bg-emerald-950 border border-emerald-800 text-emerald-200'
              : b.toastState.type === 'info'
              ? 'bg-blue-950 border border-blue-800 text-blue-200'
              : 'bg-rose-950 border border-rose-800 text-rose-200'
          }`}
        >
          {b.toastState.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : b.toastState.type === 'info' ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{b.toastState.message}</span>
        </div>
      )}

      {/* Canva Top Toolbar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate(templateId ? `/certificates/${templateId}/fields` : '/certificates')}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Back to Fields Setup"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-[260px] sm:max-w-[420px]">
            <input
              type="text"
              value={b.templateName}
              onChange={(e) => b.setTemplateName(e.target.value)}
              placeholder="Template Name..."
              className="text-xs sm:text-sm font-semibold bg-transparent hover:bg-slate-800/80 focus:bg-slate-900 border border-transparent hover:border-slate-700 focus:border-blue-600 focus:outline-none px-2.5 py-1 rounded-lg text-slate-100 truncate w-full transition-all"
            />
          </div>

          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center gap-1 border-l border-slate-800 pl-3 shrink-0">
            <button
              type="button"
              disabled={!b.canUndo}
              onClick={b.undo}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!b.canRedo}
              onClick={b.redo}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800 cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => b.setIsPreview(!b.isPreview)}
            className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border ${
              b.isPreview
                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{b.isPreview ? 'Edit Mode' : 'Preview'}</span>
          </button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={b.isSaving}
            onClick={b.handleSaveTemplate}
            className="h-9 px-4 text-xs font-bold flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl shadow-xs cursor-pointer"
          >
            {b.isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar Dock (Desktop) */}
        <aside className="hidden md:flex flex-col w-16 bg-slate-950 border-r border-slate-800 items-center py-4 gap-4 shrink-0 z-20">
          {[
            { id: 'text', label: 'Text', icon: Type },
            { id: 'image', label: 'Images', icon: ImageIcon },
            { id: 'bg', label: 'Background', icon: ImageIcon },
            { id: 'fields', label: 'Fields', icon: Layers },
            { id: 'layers', label: 'Layers', icon: Layers },
            { id: 'settings', label: 'Setup', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (activeTab === tab.id) {
                    setActiveTab(null as any);
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Left Secondary Tools Panel (Desktop - Collapsible) */}
        {activeTab && (
          <aside className="hidden md:block w-72 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto shrink-0 z-10">
            {activeTab === 'text' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                  Text Elements
                </h3>
                <button
                  type="button"
                  onClick={b.addStaticTextElement}
                  className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Type className="w-4 h-4 text-blue-400" />
                  <span>+ Add Text Box</span>
                </button>
              </div>
            )}

            {activeTab === 'image' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                  Image Elements
                </h3>
                <button
                  type="button"
                  onClick={() => b.imageFileInputRef.current?.click()}
                  className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Upload Image Element</span>
                </button>
              </div>
            )}

            {activeTab === 'bg' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                  Background Settings
                </h3>
                {b.backgroundImageUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-28 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                      <img src={b.backgroundImageUrl} alt="Background Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          b.setBackgroundImageUrl('');
                          b.setBackgroundAssetId(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => b.bgFileInputRef.current?.click()}
                      className="w-full h-9 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl cursor-pointer"
                    >
                      Replace Image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => b.bgFileInputRef.current?.click()}
                    className="w-full p-3 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-400 hover:text-blue-400 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Background</span>
                  </button>
                )}

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Fit Mode</label>
                    <select
                      value={b.bgFit}
                      onChange={(e) => b.setBgFit(e.target.value as any)}
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-600"
                    >
                      <option value="cover">Cover (Fill &amp; Crop)</option>
                      <option value="contain">Contain (Fit Whole)</option>
                      <option value="stretch">Stretch (Exact Fill)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Position</label>
                    <select
                      value={b.bgPosition}
                      onChange={(e) => b.setBgPosition(e.target.value as any)}
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-600"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                      <span>Opacity</span>
                      <span>{b.bgOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={b.bgOpacity}
                      onChange={(e) => b.setBgOpacity(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={b.bgColor}
                        onChange={(e) => b.setBgColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-800 bg-slate-950 p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={b.bgColor}
                        onChange={(e) => b.setBgColor(e.target.value)}
                        className="flex-1 h-8 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fields' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dynamic Fields ({b.availableBindings.length || b.designerSelectedBindings.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => b.setIsPersonalModalOpen(true)}
                    className="text-[11px] font-bold text-blue-400 hover:underline cursor-pointer"
                  >
                    + Custom Field
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={b.fieldSearch}
                    onChange={(e) => b.setFieldSearch(e.target.value)}
                    placeholder="Search available fields..."
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {b.isLoadingFields ? (
                  <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Loading course fields...</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {(() => {
                      const allFields = b.availableBindings.length > 0 ? b.availableBindings : b.designerSelectedBindings;
                      const filtered = allFields.filter(
                        (f) =>
                          f.label.toLowerCase().includes(b.fieldSearch.toLowerCase()) ||
                          f.key.toLowerCase().includes(b.fieldSearch.toLowerCase())
                      );

                      if (filtered.length === 0) {
                        return (
                          <div className="py-6 text-center text-xs text-slate-500">
                            No fields match your search.
                          </div>
                        );
                      }

                      const autoFields = filtered.filter((f) => !f.key.includes('custom'));
                      const customFields = filtered.filter((f) => f.key.includes('custom'));

                      return (
                        <>
                          {autoFields.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                Automatic / System Fields
                              </span>
                              {autoFields.map((binding) => (
                                <button
                                  key={binding.key}
                                  type="button"
                                  onClick={() => b.addElement(binding)}
                                  className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-left cursor-pointer transition-colors group"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                                      {binding.label}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                                      Auto
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400 block truncate mt-0.5">
                                    {binding.key}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {customFields.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                                Student-Provided Custom Fields
                              </span>
                              {customFields.map((binding) => (
                                <button
                                  key={binding.key}
                                  type="button"
                                  onClick={() => b.addElement(binding)}
                                  className="w-full p-2.5 bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/50 rounded-xl text-left cursor-pointer transition-colors group"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-100 group-hover:text-purple-300 transition-colors truncate">
                                      {binding.label}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-200 font-mono">
                                      Custom
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400 block truncate mt-0.5">
                                    {binding.key}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'layers' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                  Document Layers ({b.elements.length})
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {b.elements.map((el) => {
                    const isSelected = b.selectedElementId === el.id;
                    return (
                      <div
                        key={el.id}
                        onClick={() => b.setSelectedElementId(el.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium cursor-pointer ${
                          isSelected ? 'bg-blue-900/50 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate">{el.label || el.binding}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              b.toggleLockElement(el.id);
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {el.is_locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              b.toggleVisibilityElement(el.id);
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {el.is_visible === false ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                  Course &amp; Page Setup
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Course *</label>
                    <select
                      value={b.selectedCourseId}
                      onChange={(e) => b.setSelectedCourseId(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-600"
                    >
                      <option value="">Select a course...</option>
                      {b.isEditMode && b.selectedCourseId && !b.eligibleCourses.some((c: any) => String(c.id) === String(b.selectedCourseId)) && (() => {
                        const curr = b.queriedCourses.find((c: any) => String(c.id) === String(b.selectedCourseId));
                        return curr ? <option value={curr.id}>{curr.title || curr.name}</option> : null;
                      })()}
                      {b.eligibleCourses.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.title || c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Page Size</label>
                    <select
                      value={b.pageSize}
                      onChange={(e) => b.setPageSize(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-600"
                    >
                      {CERTIFICATE_PAGE_PRESET_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Center Canvas Workspace */}
        <main className="flex-1 bg-slate-950 overflow-hidden flex flex-col relative min-h-0 min-w-0">
          <CertificateCanvasWorkspace
            elements={b.elements}
            selectedElementId={b.selectedElementId}
            setSelectedElementId={b.setSelectedElementId}
            availableFonts={b.availableFonts}
            zoomScale={b.zoomScale}
            setZoomScale={b.setZoomScale}
            isPreview={b.isPreview}
            backgroundImageUrl={b.backgroundImageUrl}
            bgFit={b.bgFit}
            bgPosition={b.bgPosition}
            bgOpacity={b.bgOpacity}
            bgColor={b.bgColor}
            pageSize={b.pageSize}
            orientation={b.orientation}
            customWidth={b.customWidth}
            customHeight={b.customHeight}
            customUnit={b.customUnit}
            workspaceRef={b.workspaceRef}
            canvasRef={b.canvasRef}
            handlePointerDownOnElement={b.handlePointerDownOnElement}
            handlePointerMove={b.handlePointerMove}
            handlePointerUp={b.handlePointerUp}
          />
        </main>

        {/* Right Inspector Properties Panel (Desktop - visible when element selected) */}
        {b.selectedElement && (
          <aside className="hidden lg:block w-80 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto shrink-0 z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Inspector</span>
              </h3>
              <div className="flex items-center gap-1">
                <button type="button" onClick={b.duplicateElement} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer" title="Duplicate">
                  <Copy className="w-4 h-4" />
                </button>
                <button type="button" onClick={b.deleteSelectedElement} className="p-1.5 text-rose-500 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <CertificateInspector
              selectedElement={b.selectedElement}
              availableFonts={b.availableFonts}
              availableBindings={b.availableBindings.length > 0 ? b.availableBindings : b.designerSelectedBindings}
              widthInput={b.widthInput}
              setWidthInput={b.setWidthInput}
              heightInput={b.heightInput}
              setHeightInput={b.setHeightInput}
              fontSizeInput={b.fontSizeInput}
              setFontSizeInput={b.setFontSizeInput}
              updateSelectedElement={b.updateSelectedElement}
              deleteSelectedElement={b.deleteSelectedElement}
              moveLayer={b.moveLayer}
              handleFontSizeChange={b.handleFontSizeChange}
              handleTextContentChange={b.handleTextContentChange}
              setIsUploadFontModalOpen={b.setIsUploadFontModalOpen}
            />
          </aside>
        )}
      </div>

        {/* Mobile Selected Element Text Properties Panel (In layout flow, directly above bottom dock) */}
        {b.selectedElement && !mobileDrawerOpen && (
          <div className={`lg:hidden bg-slate-900 border-t border-slate-800 transition-all ${isPanelCollapsed ? 'h-auto' : 'max-h-[42dvh] h-[42dvh]'} flex flex-col shrink-0 z-20 shadow-2xl overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-800 px-3.5 py-2 shrink-0 bg-slate-950">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-400 shrink-0" />
                  <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider">
                    Text Properties
                  </h4>
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {b.selectedElement.label || b.selectedElement.binding}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={b.duplicateElement}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={b.deleteSelectedElement}
                  className="p-1.5 text-rose-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                  title={isPanelCollapsed ? "Expand Panel" : "Collapse Panel"}
                >
                  {isPanelCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => b.setSelectedElementId(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                  title="Deselect Element"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isPanelCollapsed && (
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5">
                <CertificateInspector
                  selectedElement={b.selectedElement}
                  availableFonts={b.availableFonts}
                  availableBindings={b.availableBindings.length > 0 ? b.availableBindings : b.designerSelectedBindings}
                  widthInput={b.widthInput}
                  setWidthInput={b.setWidthInput}
                  heightInput={b.heightInput}
                  setHeightInput={b.setHeightInput}
                  fontSizeInput={b.fontSizeInput}
                  setFontSizeInput={b.setFontSizeInput}
                  updateSelectedElement={b.updateSelectedElement}
                  deleteSelectedElement={b.deleteSelectedElement}
                  moveLayer={b.moveLayer}
                  handleFontSizeChange={b.handleFontSizeChange}
                  handleTextContentChange={b.handleTextContentChange}
                  setIsUploadFontModalOpen={b.setIsUploadFontModalOpen}
                  compact={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Mobile Tools Inline Panel (In layout flow, directly above bottom dock) */}
        {mobileDrawerOpen && (
          <div className={`md:hidden bg-slate-900 border-t border-slate-800 transition-all ${isPanelCollapsed ? 'h-auto' : 'max-h-[40dvh] h-[40dvh]'} flex flex-col shrink-0 z-20 shadow-2xl overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 shrink-0 bg-slate-950">
              <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider capitalize">
                {activeTab === 'bg' ? 'Background' : activeTab} Options
              </h4>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  title={isPanelCollapsed ? "Expand Panel" : "Collapse Panel"}
                >
                  {isPanelCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  title="Close Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isPanelCollapsed && (
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 pb-16">
                {activeTab === 'text' && (
                  <button
                    type="button"
                    onClick={async () => {
                      const newId = await b.addStaticTextElement();
                      if (newId) b.setSelectedElementId(newId);
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Type className="w-4 h-4" />
                    <span>+ Add Text Box</span>
                  </button>
                )}

                {activeTab === 'image' && (
                  <button
                    type="button"
                    onClick={() => {
                      b.imageFileInputRef.current?.click();
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image Element</span>
                  </button>
                )}

                {activeTab === 'bg' && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        b.bgFileInputRef.current?.click();
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full py-3 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Background Image</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Fit Mode</label>
                        <select
                          value={b.bgFit}
                          onChange={(e) => b.setBgFit(e.target.value as any)}
                          className="w-full h-9 px-2 bg-slate-950 border border-slate-800 rounded-lg text-base sm:text-xs font-semibold text-slate-100 min-h-[44px]"
                        >
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="stretch">Stretch</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Position</label>
                        <select
                          value={b.bgPosition}
                          onChange={(e) => b.setBgPosition(e.target.value as any)}
                          className="w-full h-9 px-2 bg-slate-950 border border-slate-800 rounded-lg text-base sm:text-xs font-semibold text-slate-100 min-h-[44px]"
                        >
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'fields' && (
                  <div className="space-y-3">
                    {b.isLoadingFields ? (
                      <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Loading available fields...</span>
                      </div>
                    ) : (() => {
                      const allFields = b.availableBindings.length > 0 ? b.availableBindings : b.designerSelectedBindings;
                      if (allFields.length === 0) {
                        return (
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3">
                            <p className="text-xs font-semibold text-slate-400">No fields configured</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setMobileDrawerOpen(false);
                                navigate(templateId ? `/certificates/${templateId}/fields` : '/certificates');
                              }}
                              className="w-full min-h-[44px] text-xs font-bold text-blue-400 border-blue-900/60 justify-center"
                            >
                              Open Field Settings
                            </Button>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={b.fieldSearch}
                            onChange={(e) => b.setFieldSearch(e.target.value)}
                            placeholder="Search available fields..."
                            className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-xs font-medium text-slate-100 focus:outline-none focus:border-blue-600 min-h-[44px]"
                          />
                          <div className="space-y-2 pt-1">
                            {allFields
                              .filter(
                                (f) =>
                                  f.label.toLowerCase().includes(b.fieldSearch.toLowerCase()) ||
                                  f.key.toLowerCase().includes(b.fieldSearch.toLowerCase())
                              )
                              .map((binding) => (
                                <button
                                  key={binding.key}
                                  type="button"
                                  onClick={async () => {
                                    const newId = await b.addElement(binding);
                                    if (newId) b.setSelectedElementId(newId);
                                    setMobileDrawerOpen(false);
                                  }}
                                  className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-left cursor-pointer transition-colors min-h-[44px] space-y-1"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-100 truncate break-all">
                                      {binding.label}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono shrink-0">
                                      {binding.key.includes('custom') ? 'Custom' : 'Auto'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400 block truncate break-all">
                                    {binding.key}
                                  </span>
                                </button>
                              ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeTab === 'layers' && (
                  <div className="space-y-2">
                    {b.elements.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-500">No elements on canvas.</p>
                    ) : (
                      b.elements.map((el) => (
                        <div
                          key={el.id}
                          onClick={() => {
                            b.setSelectedElementId(el.id);
                            setMobileDrawerOpen(false);
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium cursor-pointer min-h-[44px] ${
                            b.selectedElementId === el.id ? 'bg-blue-900/50 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="truncate break-all">{el.label || el.binding}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Course *</label>
                      <select
                        value={b.selectedCourseId}
                        onChange={(e) => b.setSelectedCourseId(e.target.value)}
                        className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-xs font-semibold text-slate-100 min-h-[44px]"
                      >
                        <option value="">Select a course...</option>
                        {b.eligibleCourses.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.title || c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Bottom Navigation Dock (Single Horizontal Row) */}
        <div className="md:hidden bg-slate-950 border-t border-slate-800 shrink-0 z-30 px-1 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between gap-1 w-full min-w-max">
            {[
              { id: 'text', label: 'Text', icon: Type },
              { id: 'image', label: 'Images', icon: ImageIcon },
              { id: 'bg', label: 'BG', icon: ImageIcon },
              { id: 'fields', label: 'Fields', icon: Layers },
              { id: 'layers', label: 'Layers', icon: Layers },
              { id: 'settings', label: 'Setup', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && mobileDrawerOpen;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (activeTab === tab.id && mobileDrawerOpen) {
                      setMobileDrawerOpen(false);
                    } else {
                      setActiveTab(tab.id as any);
                      setMobileDrawerOpen(true);
                      setIsPanelCollapsed(false);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] flex-1 ${
                    isActive ? 'text-blue-400 bg-slate-900 border border-slate-800 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      <PersonalFieldsModal isOpen={b.isPersonalModalOpen} onClose={() => b.setIsPersonalModalOpen(false)} onFieldCreated={b.handlePersonalFieldCreated} />
      <input ref={b.bgFileInputRef} type="file" accept="image/*" onChange={b.handleBackgroundUpload} className="hidden" />
      <input ref={b.imageFileInputRef} type="file" accept="image/*" onChange={b.handleImageUpload} className="hidden" />
      <UploadFontModal isOpen={b.isUploadFontModalOpen} onClose={() => b.setIsUploadFontModalOpen(false)} onFontUploaded={(font) => b.handleFontUploaded(font)} />
    </div>
  );
};

export default CertificateBuilderPage;
