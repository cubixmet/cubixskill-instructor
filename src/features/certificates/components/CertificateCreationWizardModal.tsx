import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useCourseStore } from '../../courses/store/course.store';
import {
  AutoIssueRule,
  PlaceholderKey,
  CanvasElement,
} from '../../../types/certificate.types';
import {
  useCertificateImageTemplateStore,
  validateAndReadImageFile,
} from '../store/certificate-image-template.store';

export interface DynamicFieldSetting {
  id: string;
  key: PlaceholderKey;
  label: string;
  required: boolean;
  editableByStudent: boolean;
  autoFill: boolean;
  defaultValue?: string;
}

const AVAILABLE_PLACEHOLDERS: { key: PlaceholderKey; label: string; defaultAutoFill: boolean; type: CanvasElement['type'] }[] = [
  { key: '{{student_name}}', label: 'Student Full Name', defaultAutoFill: true, type: 'placeholder' },
  { key: '{{course_name}}', label: 'Course Name', defaultAutoFill: true, type: 'placeholder' },
  { key: '{{instructor_name}}', label: 'Instructor Name', defaultAutoFill: true, type: 'placeholder' },
  { key: '{{academy_name}}', label: 'Academy Name', defaultAutoFill: true, type: 'placeholder' },
  { key: '{{certificate_number}}', label: 'Certificate Number', defaultAutoFill: true, type: 'placeholder' },
  { key: '{{issue_date}}', label: 'Issue Date', defaultAutoFill: true, type: 'placeholder' },
  { key: '{{completion_date}}', label: 'Completion Date', defaultAutoFill: true, type: 'placeholder' },
  { key: '{{student_id}}', label: 'Student ID', defaultAutoFill: false, type: 'placeholder' },
  { key: '{{grade}}', label: 'Grade / Score', defaultAutoFill: false, type: 'placeholder' },
  { key: '{{qr_code}}', label: 'Verification QR Code', defaultAutoFill: true, type: 'qr_code' },
];

interface CertificateCreationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDesigner: (config: {
    creationMethod: 'custom_builder' | 'uploaded_template';
    courseUuid: string;
    templateName: string;
    autoIssueRule: AutoIssueRule;
    selectedFields: DynamicFieldSetting[];
    uploadedBackgroundUrl?: string;
  }) => void;
  initialCourseUuid?: string;
}

export const CertificateCreationWizardModal: React.FC<CertificateCreationWizardModalProps> = ({
  isOpen,
  onClose,
  onLaunchDesigner,
  initialCourseUuid = '550e8400-e29b-41d4-a716-446655440000',
}) => {
  const navigate = useNavigate();
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid) || {};
  const coursesList = Object.values(coursesByUuid);

  const [step, setStep] = useState<1 | 2>(1);
  const [creationMethod, setCreationMethod] = useState<'custom_builder' | 'uploaded_template'>('custom_builder');

  // Step 2 Configuration Fields
  const [courseUuid, setCourseUuid] = useState(initialCourseUuid);
  const [templateName, setTemplateName] = useState('Python & Web Architecture Certification');
  const [autoIssueRule, setAutoIssueRule] = useState<AutoIssueRule>('course_completion');
  const [uploadedBackgroundUrl, setUploadedBackgroundUrl] = useState<string | null>(null);

  // Dynamic Fields Config
  const [fieldSettings, setFieldSettings] = useState<DynamicFieldSetting[]>([
    { id: 'f-1', key: '{{student_name}}', label: 'Student Full Name', required: true, editableByStudent: false, autoFill: true },
    { id: 'f-2', key: '{{course_name}}', label: 'Course Name', required: true, editableByStudent: false, autoFill: true },
    { id: 'f-3', key: '{{certificate_number}}', label: 'Certificate Number', required: true, editableByStudent: false, autoFill: true },
    { id: 'f-4', key: '{{issue_date}}', label: 'Issue Date', required: true, editableByStudent: false, autoFill: true },
    { id: 'f-5', key: '{{qr_code}}', label: 'Verification QR Code', required: true, editableByStudent: false, autoFill: true },
  ]);

  const handleAddField = (placeholderKey: PlaceholderKey) => {
    const found = AVAILABLE_PLACEHOLDERS.find((p) => p.key === placeholderKey);
    if (!found) return;
    if (fieldSettings.some((f) => f.key === placeholderKey)) return;

    setFieldSettings([
      ...fieldSettings,
      {
        id: `f-${crypto.randomUUID()}`,
        key: placeholderKey,
        label: found.label,
        required: true,
        editableByStudent: !found.defaultAutoFill,
        autoFill: found.defaultAutoFill,
      },
    ]);
  };

  const handleRemoveField = (id: string) => {
    setFieldSettings(fieldSettings.filter((f) => f.id !== id));
  };

  const handleToggleFieldProp = (id: string, prop: 'required' | 'editableByStudent' | 'autoFill') => {
    setFieldSettings(
      fieldSettings.map((f) => {
        if (f.id !== id) return f;
        return { ...f, [prop]: !f[prop] };
      })
    );
  };

  const setUploadedDesign = useCertificateImageTemplateStore((state) => state.setUploadedDesign);

  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    fileName: string;
    fileType: string;
    fileSize: number;
    width: number;
    height: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const res = await validateAndReadImageFile(file);

    if (!res.valid) {
      setUploadError(res.error || 'Failed to validate uploaded file.');
      return;
    }

    if (res.dataUrl) {
      setUploadedBackgroundUrl(res.dataUrl);
      setUploadedFileMeta({
        fileName: file.name,
        fileType: file.type || 'image/png',
        fileSize: file.size,
        width: res.width || 1920,
        height: res.height || 1080,
      });
    }
  };

  const handleProceedToDesigner = () => {
    if (!templateName.trim()) {
      alert('Please enter a valid Certificate Template Name.');
      return;
    }
    if (creationMethod === 'uploaded_template' && !uploadedBackgroundUrl) {
      alert('Please upload a high-resolution certificate background image before proceeding.');
      return;
    }

    if (creationMethod === 'custom_builder') {
      onClose();
      navigate('/certificate-builder/custom');
      return;
    }

    if (creationMethod === 'uploaded_template') {
      const selectedFieldsConfig = fieldSettings.map((f) => {
        const found = AVAILABLE_PLACEHOLDERS.find((p) => p.key === f.key);
        return {
          id: f.id,
          key: f.key,
          label: f.label,
          sampleValue:
            f.key === '{{student_name}}'
              ? 'Aarav Patel'
              : f.key === '{{course_name}}'
              ? 'Python & Web Architecture'
              : f.key === '{{certificate_number}}'
              ? 'CERT-2026-8841'
              : f.key === '{{issue_date}}'
              ? 'August 5, 2026'
              : f.label,
          category: found?.type === 'qr_code' ? 'Verification' : 'Dynamic Field',
        };
      });

      const designData = {
        templateUuid: `tmpl-${Date.now()}`,
        courseUuid,
        templateName,
        autoIssueRule,
        fileName: uploadedFileMeta?.fileName || 'certificate-design.png',
        fileType: uploadedFileMeta?.fileType || 'image/png',
        fileSize: uploadedFileMeta?.fileSize || 1024,
        width: uploadedFileMeta?.width || 1920,
        height: uploadedFileMeta?.height || 1080,
        previewDataUrl: uploadedBackgroundUrl || '',
        selectedFields: selectedFieldsConfig,
        placedFields: [
          {
            id: 'f-1',
            key: '{{student_name}}' as PlaceholderKey,
            label: 'Student Full Name',
            sampleValue: 'Aarav Patel',
            xPercent: 50,
            yPercent: 42,
            widthPercent: 60,
            fontFamily: 'Inter',
            fontSize: 28,
            fontColor: '#0F172A',
            isBold: true,
            isItalic: false,
            isUnderline: false,
            textAlign: 'center' as const,
            letterSpacing: 0,
            lineHeight: 1.2,
            opacity: 1,
            rotation: 0,
            zIndex: 10,
          },
          {
            id: 'f-2',
            key: '{{course_name}}' as PlaceholderKey,
            label: 'Course Name',
            sampleValue: 'React 19 & Cloud Architecture',
            xPercent: 50,
            yPercent: 56,
            widthPercent: 70,
            fontFamily: 'Inter',
            fontSize: 20,
            fontColor: '#2563EB',
            isBold: true,
            isItalic: false,
            isUnderline: false,
            textAlign: 'center' as const,
            letterSpacing: 0,
            lineHeight: 1.2,
            opacity: 1,
            rotation: 0,
            zIndex: 10,
          },
          {
            id: 'f-3',
            key: '{{certificate_number}}' as PlaceholderKey,
            label: 'Certificate Number',
            sampleValue: 'CERT-2026-8841',
            xPercent: 20,
            yPercent: 82,
            widthPercent: 30,
            fontFamily: 'Inter',
            fontSize: 12,
            fontColor: '#64748B',
            isBold: false,
            isItalic: false,
            isUnderline: false,
            textAlign: 'left' as const,
            letterSpacing: 0.5,
            lineHeight: 1.2,
            opacity: 1,
            rotation: 0,
            zIndex: 10,
          },
        ],
      };

      setUploadedDesign(designData);
      onClose();
      navigate('/certificate-builder/image-template');
      return;
    }

    onLaunchDesigner({
      creationMethod,
      courseUuid,
      templateName,
      autoIssueRule,
      selectedFields: fieldSettings,
      uploadedBackgroundUrl: uploadedBackgroundUrl || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enterprise Certificate Creation Studio">
      <div className="space-y-6 font-sans text-xs text-slate-900 text-left">
        {/* STEP PROGRESS BAR */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
              1
            </span>
            <span className="font-extrabold text-slate-900 text-xs">Method</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              2
            </span>
            <span className="font-extrabold text-slate-900 text-xs">Configuration &amp; Fields</span>
          </div>
        </div>

        {/* STEP 1: CHOOSE CREATION METHOD */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-slate-900">Choose Certificate Creation Method</h2>
              <p className="text-xs text-slate-500">Select how you want to build this academy certificate template.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* METHOD 1 CARD */}
              <div
                onClick={() => setCreationMethod('custom_builder')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                  creationMethod === 'custom_builder'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900">Custom Certificate Builder</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Design certificates inside CubixSkill using our drag &amp; drop canvas, shapes, logo, and placeholder engine.
                  </p>
                </div>
                <Button size="sm" variant={creationMethod === 'custom_builder' ? 'primary' : 'outline'} className="w-full font-semibold min-h-[40px]">
                  {creationMethod === 'custom_builder' ? '✓ Selected Method 1' : 'Select Method 1'}
                </Button>
              </div>

              {/* METHOD 2 CARD */}
              <div
                onClick={() => setCreationMethod('uploaded_template')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                  creationMethod === 'uploaded_template'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900">Upload Existing Design</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload a high-resolution design from Photoshop, Canva, Illustrator, or CorelDRAW, then overlay dynamic fields.
                  </p>
                </div>
                <Button size="sm" variant={creationMethod === 'uploaded_template' ? 'primary' : 'outline'} className="w-full font-semibold min-h-[40px]">
                  {creationMethod === 'uploaded_template' ? '✓ Selected Method 2' : 'Select Method 2'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button size="md" onClick={() => setStep(2)} className="bg-blue-600 text-white font-bold px-6 min-h-[44px]" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Step 2
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: MANDATORY CONFIGURATION & DYNAMIC FIELDS */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* COURSE SELECTION */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Target Course</label>
                <select
                  value={courseUuid}
                  onChange={(e) => setCourseUuid(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
                >
                  {(coursesList.length > 0 ? coursesList : [{ uuid: '550e8400-e29b-41d4-a716-446655440000', title: 'Full-Stack Software Architecture' }]).map((c) => (
                    <option key={c.uuid} value={c.uuid}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* TEMPLATE NAME */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Certificate Template Name</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 text-xs font-semibold h-11"
                  placeholder="e.g. Python Masterclass Certificate"
                />
              </div>
            </div>

            {/* AUTO ISSUE RULE */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Auto Issue Rule</label>
              <select
                value={autoIssueRule}
                onChange={(e) => setAutoIssueRule(e.target.value as AutoIssueRule)}
                className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
              >
                <option value="course_completion">Automatically on Course Completion</option>
                <option value="passing_quiz">Automatically after Passing Final Quiz</option>
                <option value="assignment_approval">Automatically after Assignment Approval</option>
                <option value="manual">Manual Approval Only</option>
              </select>
            </div>

            {/* UPLOAD ARTWORK BACKGROUND IF METHOD 2 */}
            {creationMethod === 'uploaded_template' && (
              <div className="space-y-2 p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50">
                <label className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block font-bold">
                  Upload High-Res Certificate Artwork (PNG / JPG / WEBP / PDF)
                </label>
                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
                {uploadedBackgroundUrl ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <img src={uploadedBackgroundUrl} alt="Background" className="w-12 h-8 object-cover rounded-lg border border-slate-200" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Custom Design Loaded</span>
                        {uploadedFileMeta && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {uploadedFileMeta.fileName} ({uploadedFileMeta.width}x{uploadedFileMeta.height}px)
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setUploadedBackgroundUrl(null)} className="text-rose-600 border-rose-200">
                      Change
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-500">
                    <span className="text-xs font-semibold text-slate-700">Click to upload Photoshop/Canva/Illustrator exported file</span>
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf" onChange={handleFileUpload} className="hidden" />
                    <Upload className="w-5 h-5 text-emerald-600" />
                  </label>
                )}
              </div>
            )}

            {/* DYNAMIC FIELD MANAGER */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Dynamic Field Manager</span>
                <span className="text-[11px] text-slate-500 font-mono">{fieldSettings.length} Fields Configured</span>
              </div>

              {/* AVAILABLE PLACEHOLDER PILLS */}
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Add:</span>
                {AVAILABLE_PLACEHOLDERS.map((ph) => {
                  const isAdded = fieldSettings.some((f) => f.key === ph.key);
                  return (
                    <button
                      key={ph.key}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddField(ph.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isAdded ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-500'
                      }`}
                    >
                      <Plus className="w-3 h-3" /> {ph.label}
                    </button>
                  );
                })}
              </div>

              {/* CONFIGURED FIELDS LIST */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {fieldSettings.map((f) => (
                  <div key={f.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">{f.label}</span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">{f.key}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleFieldProp(f.id, 'autoFill')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          f.autoFill ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        Auto Fill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFieldProp(f.id, 'editableByStudent')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          f.editableByStudent ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        Student Editable
                      </button>
                      <button type="button" onClick={() => handleRemoveField(f.id)} className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button size="md" variant="outline" onClick={() => setStep(1)} className="text-slate-700 border-slate-200 min-h-[44px]">
                Back to Method
              </Button>
              <Button size="md" onClick={handleProceedToDesigner} className="bg-emerald-600 text-white font-bold px-6 min-h-[44px]" rightIcon={<Sparkles className="w-4 h-4" />}>
                Launch Designer
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
