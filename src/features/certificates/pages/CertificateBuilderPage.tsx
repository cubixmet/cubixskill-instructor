import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Award,
  ArrowLeft,
  Search,
  CheckCircle2,
  Calendar,
  User,
  BookOpen,
  Download,
  Loader2,
  AlertCircle,
  X,
  FileCheck,
  Upload,
  Layers,
  Save,
  Eye,
  Type,
  ImageIcon,
  QrCode,
  Sliders,
  Trash2,
  Copy,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  certificatesService,
  type CertificateTemplateData,
  type CertificateBinding,
} from '../../../services/certificates.service';
import { authStore } from '../../../store/auth.store';

export interface CanvasElement {
  id: string;
  binding: string;
  label: string;
  type: 'text' | 'image' | 'qr';
  x: number; // percentage (0 to 1)
  y: number; // percentage (0 to 1)
  width: number; // percentage (0 to 1)
  height: number; // percentage (0 to 1)
  font_size: number;
  font_weight: 'normal' | 'bold';
  text_align: 'left' | 'center' | 'right';
  color: string;
  prefix?: string;
  suffix?: string;
}

export const CertificateBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();

  const authState = authStore.getState();
  const academyName = authState.academy?.name || (authState.user as any)?.academy_name || 'CubixSkill Academy';

  // Template State
  const [templateName, setTemplateName] = useState<string>('Custom Course Completion Certificate');
  const [description, setDescription] = useState<string>('');
  const [pageSize, setPageSize] = useState<'A4' | 'LETTER'>('A4');
  const [orientation, setOrientation] = useState<'LANDSCAPE' | 'PORTRAIT'>('LANDSCAPE');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');

  // Canvas Elements
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: 'el-student-name',
      binding: 'student.full_name',
      label: 'Student Full Name',
      type: 'text',
      x: 0.5,
      y: 0.42,
      width: 0.6,
      height: 0.08,
      font_size: 28,
      font_weight: 'bold',
      text_align: 'center',
      color: '#0F172A',
    },
    {
      id: 'el-course-title',
      binding: 'course.title',
      label: 'Course Title',
      type: 'text',
      x: 0.5,
      y: 0.58,
      width: 0.7,
      height: 0.06,
      font_size: 20,
      font_weight: 'bold',
      text_align: 'center',
      color: '#2563EB',
    },
    {
      id: 'el-cert-number',
      binding: 'certificate.number',
      label: 'Certificate Number',
      type: 'text',
      x: 0.82,
      y: 0.88,
      width: 0.3,
      height: 0.05,
      font_size: 11,
      font_weight: 'normal',
      text_align: 'right',
      color: '#64748B',
      prefix: 'No: ',
    },
    {
      id: 'el-issue-date',
      binding: 'certificate.issue_date',
      label: 'Issue Date',
      type: 'text',
      x: 0.18,
      y: 0.88,
      width: 0.3,
      height: 0.05,
      font_size: 11,
      font_weight: 'normal',
      text_align: 'left',
      color: '#64748B',
      prefix: 'Date: ',
    },
  ]);

  const [selectedElementId, setSelectedElementId] = useState<string | null>('el-student-name');
  const [bindings, setBindings] = useState<CertificateBinding[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load dynamic bindings
  useEffect(() => {
    certificatesService.getTemplateBindings().then((res) => {
      setBindings(res);
    }).catch(() => {});
  }, []);

  // Load existing template if editing
  useEffect(() => {
    if (templateId) {
      certificatesService.getTemplate(templateId).then((tmpl) => {
        if (tmpl) {
          setTemplateName(tmpl.name);
          setDescription(tmpl.description || '');
          if (tmpl.template_data && Array.isArray(tmpl.template_data.elements)) {
            setElements(tmpl.template_data.elements);
          }
        }
      }).catch(() => {});
    }
  }, [templateId]);

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  const addElement = (binding: CertificateBinding) => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      binding: binding.key,
      label: binding.label,
      type: binding.type,
      x: 0.5,
      y: 0.5,
      width: 0.4,
      height: 0.06,
      font_size: 16,
      font_weight: 'normal',
      text_align: 'center',
      color: '#0F172A',
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
    setIsSaved(false);
  };

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, ...updates } : el))
    );
    setIsSaved(false);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
    setIsSaved(false);
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      const payload: Partial<CertificateTemplateData> = {
        name: templateName,
        description,
        page_size: pageSize,
        orientation,
        template_data: {
          elements,
          canvas: { width: 1600, height: 1131 },
        },
      };

      if (templateId) {
        await certificatesService.updateTemplate(templateId, payload);
        showToast('Certificate template updated.');
      } else {
        const created = await certificatesService.createTemplate(payload);
        showToast('Certificate template created successfully.');
        navigate(`/certificates`);
      }
      setIsSaved(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const sampleValues: Record<string, string> = {
    'student.full_name': 'Muhammed Ashraf',
    'student.first_name': 'Muhammed',
    'student.last_name': 'Ashraf',
    'student.email': 'student@cubixskill.edu',
    'course.title': 'Full Stack Cloud Microservices Architecture',
    'course.code': 'CS-401',
    'academy.name': academyName,
    'certificate.number': 'CUBIX-2026-99218',
    'certificate.issue_date': new Date().toLocaleDateString(),
    'certificate.completion_date': new Date().toLocaleDateString(),
    'certificate.qr_code': '[QR Code Verified]',
  };

  const resolveSampleValue = (el: CanvasElement) => {
    let val = sampleValues[el.binding] || `{${el.label}}`;
    if (el.prefix) val = el.prefix + val;
    if (el.suffix) val = val + el.suffix;
    return val;
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-32 sm:pb-12 max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
          <button type="button" onClick={() => setToastMsg(null)} className="p-0.5 hover:bg-slate-700 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER & TOOLBAR */}
      <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-[16px] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/certificates')}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#263244] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <input
                type="text"
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  setIsSaved(false);
                }}
                className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:border-[#2563EB]"
              />
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-0.5">
                Visual Designer — Drag dynamic fields and configure positioning for automatic issuance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isPreview ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              leftIcon={<Eye className="w-4 h-4" />}
              className="text-xs font-semibold h-9 cursor-pointer"
            >
              {isPreview ? 'Edit Layout' : 'Preview Sample'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={isSaving}
              onClick={handleSaveTemplate}
              leftIcon={<Save className="w-4 h-4 text-white" />}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold h-9 cursor-pointer shadow-xs shadow-[#2563EB]/25"
            >
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </div>

      {/* THREE COLUMN DESIGNER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN — DYNAMIC BINDINGS SIDEBAR */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-4 rounded-[16px] shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] border-b border-slate-100 dark:border-[#263244] pb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span>Add Dynamic Fields</span>
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
              {bindings.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => addElement(b)}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#172033] hover:bg-blue-50 dark:hover:bg-[#1e293b] border border-[#E2E8F0] dark:border-[#263244] rounded-xl text-left flex items-center justify-between text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    {b.type === 'text' && <Type className="w-3.5 h-3.5 text-[#2563EB]" />}
                    {b.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />}
                    {b.type === 'qr' && <QrCode className="w-3.5 h-3.5 text-purple-500" />}
                    <span className="truncate">{b.label}</span>
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal px-1.5 py-0.5 bg-slate-200/60 dark:bg-[#0F172A] rounded">
                    {b.group}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* CENTER COLUMN — CANVAS PREVIEW */}
        <div className="lg:col-span-6">
          <Card className="bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-6 rounded-[16px] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-[#94A3B8] uppercase tracking-wider">
                {isPreview ? 'Live Sample Document Preview' : 'Interactive Layout Canvas'}
              </span>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded-md">
                1600 × 1131 px
              </span>
            </div>

            {/* PRINTABLE CANVAS (CRISP WHITE PAPER LOOK) */}
            <div
              ref={canvasRef}
              className="w-full aspect-[1.414/1] bg-white text-slate-900 border-8 border-[#1E293B] shadow-2xl rounded-lg relative overflow-hidden font-serif select-none"
            >
              {/* Outer Decorative Gold Frame */}
              <div className="absolute inset-2 border-2 border-[#D97706]/40 pointer-events-none" />

              {/* Dynamic Overlay Elements */}
              {elements.map((el) => {
                const isSelected = selectedElementId === el.id;

                return (
                  <div
                    key={el.id}
                    onClick={() => !isPreview && setSelectedElementId(el.id)}
                    style={{
                      position: 'absolute',
                      left: `${el.x * 100}%`,
                      top: `${el.y * 100}%`,
                      width: `${el.width * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${el.font_size}px`,
                      fontWeight: el.font_weight,
                      textAlign: el.text_align,
                      color: el.color,
                      fontFamily: 'serif',
                    }}
                    className={`px-2 py-1 rounded cursor-pointer transition-all ${
                      isSelected && !isPreview
                        ? 'ring-2 ring-[#2563EB] bg-blue-50/50 dark:bg-blue-900/30'
                        : 'hover:bg-slate-100/50'
                    }`}
                  >
                    {resolveSampleValue(el)}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN — ELEMENT INSPECTOR */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-4 rounded-[16px] shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] border-b border-slate-100 dark:border-[#263244] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#2563EB]" />
                <span>Element Properties</span>
              </span>
              {selectedElement && (
                <button
                  type="button"
                  onClick={deleteSelectedElement}
                  title="Delete Element"
                  className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-[#3f1d24] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </h3>

            {selectedElement ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Binding Key</label>
                  <input
                    type="text"
                    value={selectedElement.binding}
                    disabled
                    className="w-full h-8 px-2 bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#263244] rounded text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Position X (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={selectedElement.x}
                      onChange={(e) => updateSelectedElement({ x: parseFloat(e.target.value) || 0.5 })}
                      className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Position Y (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={selectedElement.y}
                      onChange={(e) => updateSelectedElement({ y: parseFloat(e.target.value) || 0.5 })}
                      className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Font Size (px)</label>
                    <input
                      type="number"
                      value={selectedElement.font_size}
                      onChange={(e) => updateSelectedElement({ font_size: parseInt(e.target.value, 10) || 16 })}
                      className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Color</label>
                    <input
                      type="color"
                      value={selectedElement.color}
                      onChange={(e) => updateSelectedElement({ color: e.target.value })}
                      className="w-full h-8 p-0.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Text Alignment</label>
                  <select
                    value={selectedElement.text_align}
                    onChange={(e) => updateSelectedElement({ text_align: e.target.value as any })}
                    className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Prefix Text</label>
                  <input
                    type="text"
                    value={selectedElement.prefix || ''}
                    onChange={(e) => updateSelectedElement({ prefix: e.target.value })}
                    placeholder="e.g. No: "
                    className="w-full h-8 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded text-xs"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] text-center py-6">
                Click an element on the canvas or sidebar to inspect and customize its properties.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
