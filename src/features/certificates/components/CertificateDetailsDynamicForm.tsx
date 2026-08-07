import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Sliders,
  Eye,
  Sparkles,
  QrCode,
  Check,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { useCertificateStore } from '../store/certificate.store';
import { FeatureDisabledBanner } from '../../discussions/components/FeatureDisabledBanner';
import { AutoFitTextContainer } from './AutoFitTextContainer';
import type {
  CertificateTemplate,
  CanvasElement,
  PlaceholderKey,
  CanvasSizeType,
  AutoIssueRule,
} from '../../../types/certificate.types';

interface CourseFeatures {
  courseCertificates?: boolean;
  [key: string]: boolean | undefined;
}

interface CertificateDetailsDynamicFormProps {
  courseUuid: string;
  courseFeatures?: CourseFeatures;
  onSaved?: () => void;
}

const PLACEHOLDER_OPTIONS: { label: string; key: PlaceholderKey }[] = [
  { label: 'Student Name', key: '{{student_name}}' },
  { label: 'Student ID', key: '{{student_id}}' },
  { label: 'Course Name', key: '{{course_name}}' },
  { label: 'Course Category', key: '{{course_category}}' },
  { label: 'Course Level', key: '{{course_level}}' },
  { label: 'Instructor Name', key: '{{instructor_name}}' },
  { label: 'Academy Name', key: '{{academy_name}}' },
  { label: 'Certificate Number', key: '{{certificate_number}}' },
  { label: 'Issue Date', key: '{{issue_date}}' },
  { label: 'Completion Date', key: '{{completion_date}}' },
  { label: 'Duration (Hours)', key: '{{duration}}' },
  { label: 'Credits Earned', key: '{{credits_earned}}' },
  { label: 'Grade / Score', key: '{{grade}}' },
  { label: 'Percentage', key: '{{percentage}}' },
  { label: 'QR Code URL', key: '{{qr_code}}' },
  { label: 'Verification Link', key: '{{verification_url}}' },
  { label: 'Custom Text', key: '{{custom_text}}' },
];

const FONT_FAMILIES = ['Inter', 'Roboto', 'Playfair Display', 'Cinzel', 'Montserrat', 'Space Grotesk'];

export const CertificateDetailsDynamicForm: React.FC<CertificateDetailsDynamicFormProps> = ({
  courseUuid,
  courseFeatures,
  onSaved,
}) => {
  const templates = useCertificateStore((state) => state.templates);
  const updateTemplate = useCertificateStore((state) => state.updateTemplate);
  const setActiveTemplate = useCertificateStore((state) => state.setActiveTemplate);

  // Filter templates by course or fallback (computed before hooks to use as initializer)
  const courseTemplates = templates.filter((t) => t.courseUuid === courseUuid || !t.courseUuid);
  const activeTemplate = courseTemplates.find((t) => t.status === 'Active') || courseTemplates[0];

  // ALL hooks must be called before any conditional returns
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    activeTemplate?.id || 'cert-tmpl-101'
  );

  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) || activeTemplate || templates[0];

  // Local state for the editable template form
  const [formData, setFormData] = useState<CertificateTemplate | null>(
    () => currentTemplate ? { ...currentTemplate } : null
  );
  const [activeTab, setActiveTab] = useState<'fields' | 'preview' | 'rules'>('fields');
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state if selected template changes externally
  useEffect(() => {
    if (currentTemplate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({ ...currentTemplate });
    }
  }, [selectedTemplateId, currentTemplate]);

  // Check if courseCertificates feature is turned off — AFTER all hooks
  if (courseFeatures && courseFeatures.courseCertificates === false) {
    return (
      <FeatureDisabledBanner
        featureTitle="Certificate Details"
        description="Certificate Details configuration is disabled because the Certificates feature is turned off for this course."
        courseUuid={courseUuid}
      />
    );
  }

  if (!formData) {
    return (
      <Card padding="md" className="bg-white border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No certificate template found for this course.</p>
      </Card>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateField = <K extends keyof CertificateTemplate>(field: K, value: CertificateTemplate[K]) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleElementChange = (elementId: string, updates: Partial<CanvasElement>) => {
    setFormData((prev) => prev ? ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
    }) : prev);
  };

  const handleAddElement = () => {
    const newElId = `el-${crypto.randomUUID()}`;
    const newElement: CanvasElement = {
      id: newElId,
      type: 'placeholder',
      label: 'New Dynamic Field',
      placeholderKey: '{{custom_text}}',
      text: 'Sample Custom Text Value',
      x: 50,
      y: 70,
      width: 60,
      height: 8,
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: '500',
      fontColor: '#0F172A',
      textAlign: 'center',
      opacity: 1,
      isLocked: false,
    };
    setFormData((prev) => prev ? ({
      ...prev,
      elements: [...prev.elements, newElement],
    }) : prev);
    setActiveElementId(newElId);
    showToast('New dynamic field added to certificate template!');
  };

  const handleDeleteElement = (elementId: string) => {
    setFormData((prev) => prev ? ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== elementId),
    }) : prev);
    if (activeElementId === elementId) setActiveElementId(null);
    showToast('Field removed from template.');
  };

  const handleSaveForm = () => {
    updateTemplate(formData.id, formData);
    showToast('Certificate template details updated successfully!');
    if (onSaved) onSaved();
  };

  const handleSetAsActive = () => {
    setActiveTemplate(courseUuid, formData.id);
    handleUpdateField('status', 'Active');
    showToast(`Template "${formData.title}" is now active for this course.`);
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left">
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SECTION HEADER CARD */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Certificate Details &amp; Dynamic Template Form
              </h2>
              <Badge
                variant={formData.status === 'Active' ? 'success' : 'secondary'}
                size="sm"
                className="font-bold"
              >
                {formData.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Configure fields, text placeholders, and auto-issue conditions dynamically mapped from the active Certificate Template.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {formData.status !== 'Active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetAsActive}
                className="h-9 text-xs font-semibold text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
              >
                Set as Active Template
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSaveForm}
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 shadow-xs"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Certificate Details
            </Button>
          </div>
        </div>
      </Card>

      {/* TEMPLATE SELECTOR BANNER */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-slate-700 text-xs">Selected Template:</span>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 px-3 text-xs focus:ring-2 focus:ring-blue-500/20"
          >
            {courseTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.status}) - v{t.version || 1}.0
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm" className="bg-white border border-slate-200 text-slate-600">
            Canvas: {formData.canvasSize.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge variant="neutral" size="sm" className="bg-white border border-slate-200 text-blue-600">
            {formData.elements.length} Dynamic Form Fields
          </Badge>
        </div>
      </div>

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'fields'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Dynamic Form Fields ({formData.elements.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          Live Certificate Preview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Auto-Issue Rules &amp; Metadata
        </button>
      </div>

      {/* TAB 1: DYNAMIC FORM FIELDS */}
      {activeTab === 'fields' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* TEMPLATE DYNAMIC FIELDS FORM (LEFT 7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            <Card padding="md" className="bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Template Generated Form Inputs
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Modify form inputs generated directly from the certificate canvas elements.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddElement}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="h-8 text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Add Custom Field
                </Button>
              </div>

              <div className="space-y-4">
                {formData.elements.map((el, index) => {
                  const isSelected = activeElementId === el.id;

                  return (
                    <div
                      key={el.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                      onClick={() => setActiveElementId(el.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs">
                            {el.label || `Field ${index + 1}`}
                          </span>
                          <Badge variant="neutral" size="sm" className="text-[10px] uppercase font-mono">
                            {el.type}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleElementChange(el.id, { isLocked: !el.isLocked });
                            }}
                            className={`p-1.5 rounded-lg border text-xs ${
                              el.isLocked
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                            }`}
                            title={el.isLocked ? 'Field is locked' : 'Field is editable'}
                          >
                            {el.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteElement(el.id);
                            }}
                            className="p-1.5 rounded-lg border bg-white border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                            title="Delete Field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* FIELD EDITING CONTROLS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                            Field Label
                          </label>
                          <Input
                            value={el.label}
                            onChange={(e) => handleElementChange(el.id, { label: e.target.value })}
                            placeholder="e.g. Student Name"
                            className="h-8 text-xs"
                          />
                        </div>

                        {el.type === 'placeholder' ? (
                          <div>
                            <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                              Placeholder Key
                            </label>
                            <select
                              value={el.placeholderKey || '{{custom_text}}'}
                              onChange={(e) =>
                                handleElementChange(el.id, {
                                  placeholderKey: e.target.value as PlaceholderKey,
                                })
                              }
                              className="w-full h-8 rounded-lg border border-slate-200 px-2 bg-white font-semibold text-slate-900 text-xs"
                            >
                              {PLACEHOLDER_OPTIONS.map((opt) => (
                                <option key={opt.key} value={opt.key}>
                                  {opt.label} ({opt.key})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                              Element Type
                            </label>
                            <select
                              value={el.type}
                              onChange={(e) =>
                                handleElementChange(el.id, { type: e.target.value as CanvasElement['type'] })
                              }
                              className="w-full h-8 rounded-lg border border-slate-200 px-2 bg-white font-semibold text-slate-900 text-xs"
                            >
                              <option value="text">Static Text</option>
                              <option value="placeholder">Dynamic Placeholder</option>
                              <option value="qr_code">QR Code Verification</option>
                              <option value="signature">Signature</option>
                              <option value="logo">Logo / Image</option>
                            </select>
                          </div>
                        )}

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                            Default Display Value / Content Text
                          </label>
                          <Input
                            value={el.text || ''}
                            onChange={(e) => handleElementChange(el.id, { text: e.target.value })}
                            placeholder="Default display text value..."
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* STYLING GRID */}
                        <div>
                          <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                            Font Family
                          </label>
                          <select
                            value={el.fontFamily || 'Inter'}
                            onChange={(e) => handleElementChange(el.id, { fontFamily: e.target.value })}
                            className="w-full h-8 rounded-lg border border-slate-200 px-2 bg-white font-semibold text-slate-900 text-xs"
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option key={font} value={font}>
                                {font}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                              Max Size (px)
                            </label>
                            <Input
                              type="number"
                              min={8}
                              max={120}
                              value={el.fontSize}
                              onChange={(e) =>
                                handleElementChange(el.id, { fontSize: Math.max(8, Number(e.target.value)) })
                              }
                              className="h-8 text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                              Width (%)
                            </label>
                            <Input
                              type="number"
                              min={8}
                              max={100}
                              value={el.width}
                              onChange={(e) =>
                                handleElementChange(el.id, { width: Math.min(100, Math.max(8, Number(e.target.value))) })
                              }
                              className="h-8 text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                              Height (%)
                            </label>
                            <Input
                              type="number"
                              min={5}
                              max={100}
                              value={el.height || 12}
                              onChange={(e) =>
                                handleElementChange(el.id, { height: Math.min(100, Math.max(5, Number(e.target.value))) })
                              }
                              className="h-8 text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                            Color Hex
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={el.fontColor || '#000000'}
                              onChange={(e) =>
                                handleElementChange(el.id, { fontColor: e.target.value })
                              }
                              className="w-8 h-8 p-0.5 rounded border border-slate-200 cursor-pointer"
                            />
                            <Input
                              value={el.fontColor || '#000000'}
                              onChange={(e) =>
                                handleElementChange(el.id, { fontColor: e.target.value })
                              }
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* RIGHT PREVIEW & TEMPLATE CONFIG (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            <Card padding="md" className="bg-white border border-slate-200 space-y-3 sticky top-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" /> Dynamic Live Certificate Preview
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Realtime updates</span>
              </div>

              {/* DYNAMIC CANVAS PREVIEW CONTAINER */}
              <div
                className="relative w-full aspect-[1.414/1] rounded-xl border-2 border-slate-300 shadow-md overflow-hidden p-4 flex flex-col justify-between"
                style={{ backgroundColor: formData.backgroundColor || '#FFFFFF' }}
              >
                {/* DECORATIVE CERTIFICATE BORDER */}
                <div className="absolute inset-2 border-2 border-dashed border-blue-200 pointer-events-none rounded-lg" />
                <div className="absolute inset-4 border border-amber-300 pointer-events-none rounded" />

                {/* RENDERED DYNAMIC CANVAS ELEMENTS (AUTO FONT FIT CONTAINER SAFE) */}
                <div className="relative w-full h-full">
                  {formData.elements.map((el) => (
                    <AutoFitTextContainer
                      key={el.id}
                      text={el.text || el.label || el.placeholderKey || ''}
                      maxFontSize={Math.max(10, el.fontSize * 0.45)}
                      fontFamily={el.fontFamily || 'Inter'}
                      fontWeight={el.fontWeight || '600'}
                      fontColor={el.fontColor || '#0F172A'}
                      textAlign={el.textAlign || 'center'}
                      opacity={el.opacity ?? 1}
                      onClick={() => setActiveElementId(el.id)}
                      style={{
                        position: 'absolute',
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${el.width}%`,
                        height: 'auto',
                        minHeight: '20px',
                      }}
                      className={`${activeElementId === el.id ? 'ring-2 ring-blue-500 rounded px-1' : ''}`}
                    >
                      {el.type === 'qr_code' ? (
                        <div className="flex flex-col items-center justify-center p-1 bg-white border border-slate-300 rounded shadow-2xs">
                          <QrCode className="w-8 h-8 text-slate-900" />
                          <span className="text-[7px] text-slate-500 font-mono">VERIFY QR</span>
                        </div>
                      ) : undefined}
                    </AutoFitTextContainer>
                  ))}
                </div>
              </div>

              {/* QUICK METADATA EDITING */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-slate-900 text-xs">General Template Properties</h4>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    Template Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleUpdateField('title', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleUpdateField('description', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Canvas Size
                    </label>
                    <select
                      value={formData.canvasSize}
                      onChange={(e) => handleUpdateField('canvasSize', e.target.value as CanvasSizeType)}
                      className="w-full h-8 rounded-lg border border-slate-200 px-2 bg-white font-semibold text-slate-900 text-xs"
                    >
                      <option value="a4_landscape">A4 Landscape</option>
                      <option value="a4_portrait">A4 Portrait</option>
                      <option value="letter">Letter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      Background Color
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={formData.backgroundColor || '#FFFFFF'}
                        onChange={(e) => handleUpdateField('backgroundColor', e.target.value)}
                        className="w-8 h-8 p-0.5 rounded border border-slate-200 cursor-pointer"
                      />
                      <Input
                        value={formData.backgroundColor || '#FFFFFF'}
                        onChange={(e) => handleUpdateField('backgroundColor', e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CERTIFICATE PREVIEW FULL VIEW */}
      {activeTab === 'preview' && (
        <Card padding="md" className="bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Full Page Certificate Preview
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing how student certificates will render dynamically when generated for course graduates.
              </p>
            </div>

            <Badge variant="neutral" size="sm" className="border border-blue-200 text-blue-600 font-mono">
              Sample Data: Aarav Patel
            </Badge>
          </div>

          <div
            className="relative w-full max-w-4xl mx-auto aspect-[1.414/1] rounded-2xl border-4 border-slate-900 shadow-2xl overflow-hidden p-8 flex flex-col justify-between my-4"
            style={{ backgroundColor: formData.backgroundColor || '#FFFFFF' }}
          >
            {/* ELEGANT OUTER BORDERS */}
            <div className="absolute inset-4 border-4 border-blue-600/80 pointer-events-none rounded-xl" />
            <div className="absolute inset-7 border-2 border-amber-400 pointer-events-none rounded-lg" />

            <div className="relative w-full h-full">
              {formData.elements.map((el) => (
                <AutoFitTextContainer
                  key={el.id}
                  text={el.text || el.label || el.placeholderKey || ''}
                  maxFontSize={el.fontSize}
                  fontFamily={el.fontFamily || 'Inter'}
                  fontWeight={el.fontWeight || '600'}
                  fontColor={el.fontColor || '#0F172A'}
                  textAlign={el.textAlign || 'center'}
                  opacity={el.opacity ?? 1}
                  style={{
                    position: 'absolute',
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${el.width}%`,
                    height: 'auto',
                    minHeight: '28px',
                  }}
                >
                  {el.type === 'qr_code' ? (
                    <div className="flex flex-col items-center justify-center p-2 bg-white border-2 border-slate-800 rounded-lg shadow-md mx-auto w-24">
                      <QrCode className="w-16 h-16 text-slate-900" />
                      <span className="text-[9px] text-slate-600 font-mono mt-1">VERIFIED CERT</span>
                    </div>
                  ) : undefined}
                </AutoFitTextContainer>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: AUTO-ISSUE RULES & METADATA */}
      {activeTab === 'rules' && (
        <Card padding="md" className="bg-white border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              Auto-Issue Rules &amp; Completion Conditions
            </h3>
            <p className="text-xs text-slate-500">
              Configure mandatory student thresholds for automatic certificate delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Auto-Issue Trigger Rule</label>
              <select
                value={formData.autoIssueRule}
                onChange={(e) => handleUpdateField('autoIssueRule', e.target.value as AutoIssueRule)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white font-bold text-slate-900 text-xs"
              >
                <option value="course_completion">Course Completion (100%)</option>
                <option value="passing_quiz">Passing Final Quiz / Exam</option>
                <option value="assignment_approval">Assignment Approval</option>
                <option value="immediate">Immediate Upon Enrollment</option>
                <option value="manual">Manual Instructor Release Only</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Minimum Quiz Score (%)</label>
              <Input
                type="number"
                value={formData.autoIssueConditions?.minPassingPercentage || 70}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    autoIssueConditions: {
                      ...prev.autoIssueConditions,
                      minPassingPercentage: Number(e.target.value),
                    },
                  }))
                }
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-slate-900 text-xs">Mandatory Completion Checklist</h4>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <span className="font-bold text-slate-900 text-xs">Require 100% Curriculum Lessons Completed</span>
              <input
                type="checkbox"
                checked={formData.autoIssueConditions?.requireCourseCompletion ?? true}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    autoIssueConditions: {
                      ...prev.autoIssueConditions,
                      requireCourseCompletion: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <span className="font-bold text-slate-900 text-xs">Require Passing Grade on Final Assessment</span>
              <input
                type="checkbox"
                checked={formData.autoIssueConditions?.requireQuizPassed ?? false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    autoIssueConditions: {
                      ...prev.autoIssueConditions,
                      requireQuizPassed: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <span className="font-bold text-slate-900 text-xs">Require Manual Approval by Instructor</span>
              <input
                type="checkbox"
                checked={formData.autoIssueConditions?.requireManualApproval ?? false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    autoIssueConditions: {
                      ...prev.autoIssueConditions,
                      requireManualApproval: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>
          </div>
        </Card>
      )}
    </div>
  );
};
