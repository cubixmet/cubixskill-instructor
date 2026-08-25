import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Plus,
  X,
  QrCode,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { AutoFitTextContainer } from './AutoFitTextContainer';
import { Badge } from '../../../components/ui/Badge';
import { useCertificateStore } from '../store/certificate.store';
import {
  CertificateTemplate,
  CanvasElement,
  PlaceholderKey,
  AutoIssueRule,
  CanvasSizeType,
  DEFAULT_AUTO_ISSUE_CONDITIONS,
  mapAutoIssueConditions,
} from '../../../types/certificate.types';

interface CardFlowCertificateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: CertificateTemplate) => void;
  initialTemplate?: CertificateTemplate | null;
  courseUuid?: string;
}

const DYNAMIC_PLACEHOLDERS: { key: PlaceholderKey; label: string; sample: string; type: CanvasElement['type'] }[] = [
  { key: '{{student_name}}', label: 'Student Name', sample: 'Aarav Patel', type: 'placeholder' },
  { key: '{{course_name}}', label: 'Course Name', sample: 'React 19 & Fullstack Masterclass', type: 'placeholder' },
  { key: '{{issue_date}}', label: 'Issue Date', sample: 'August 5, 2026', type: 'placeholder' },
  { key: '{{instructor_name}}', label: 'Instructor Name', sample: 'John Instructor', type: 'placeholder' },
  { key: '{{academy_name}}', label: 'Academy Name', sample: 'CubixSkill Academy', type: 'placeholder' },
  { key: '{{certificate_number}}', label: 'Certificate #', sample: 'CERT-2026-8841', type: 'placeholder' },
  { key: '{{qr_code}}', label: 'QR Code Verification', sample: 'https://cubixskill.com/verify/CERT-2026-8841', type: 'qr_code' },
  { key: '{{instructor_signature}}', label: 'Instructor Signature', sample: 'Signature Image', type: 'signature' },
  { key: '{{academy_logo}}', label: 'Academy Logo', sample: 'Logo Image', type: 'logo' },
];

export const CardFlowCertificateBuilderModal: React.FC<CardFlowCertificateBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTemplate,
  courseUuid = '',
}) => {
  const addTemplate = useCertificateStore((state) => state.addTemplate);
  const updateTemplate = useCertificateStore((state) => state.updateTemplate);

  const [title, setTitle] = useState(initialTemplate?.title || 'Official Certificate of Achievement');
  const description = initialTemplate?.description ?? 'Automated completion certificate';
  const [autoIssueRule, setAutoIssueRule] = useState<AutoIssueRule>(initialTemplate?.autoIssueRule || 'course_completion');
  const canvasSize: CanvasSizeType = initialTemplate?.canvasSize ?? 'a4_landscape';
  const backgroundColor = initialTemplate?.backgroundColor ?? '#FFFFFF';
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const [elements, setElements] = useState<CanvasElement[]>(
    initialTemplate?.elements || [
      {
        id: 'el-1',
        type: 'placeholder',
        label: 'Academy Name',
        placeholderKey: '{{academy_name}}',
        text: 'CUBIXSKILL ACADEMY OF TECHNOLOGY',
        x: 50,
        y: 15,
        width: 80,
        height: 10,
        fontFamily: 'Inter',
        fontSize: 22,
        fontWeight: '800',
        fontColor: '#2563EB',
        textAlign: 'center',
        opacity: 1,
        isLocked: true,
      },
      {
        id: 'el-2',
        type: 'text',
        label: 'Title Banner',
        text: 'CERTIFICATE OF COMPLETION',
        x: 50,
        y: 26,
        width: 80,
        height: 10,
        fontFamily: 'Inter',
        fontSize: 30,
        fontWeight: '800',
        fontColor: '#0F172A',
        textAlign: 'center',
        opacity: 1,
        isLocked: true,
      },
      {
        id: 'el-3',
        type: 'placeholder',
        label: 'Student Name',
        placeholderKey: '{{student_name}}',
        text: 'Aarav Patel',
        x: 50,
        y: 48,
        width: 80,
        height: 12,
        fontFamily: 'Inter',
        fontSize: 34,
        fontWeight: '800',
        fontColor: '#2563EB',
        textAlign: 'center',
        opacity: 1,
        isLocked: false,
      },
      {
        id: 'el-4',
        type: 'placeholder',
        label: 'Course Name',
        placeholderKey: '{{course_name}}',
        text: 'React 19 & Fullstack Architecture Masterclass',
        x: 50,
        y: 64,
        width: 85,
        height: 10,
        fontFamily: 'Inter',
        fontSize: 18,
        fontWeight: '600',
        fontColor: '#0F172A',
        textAlign: 'center',
        opacity: 1,
        isLocked: false,
      },
      {
        id: 'el-5',
        type: 'qr_code',
        label: 'QR Code',
        placeholderKey: '{{qr_code}}',
        text: 'QR Code',
        x: 85,
        y: 80,
        width: 12,
        height: 12,
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: '400',
        fontColor: '#0F172A',
        textAlign: 'center',
        opacity: 1,
        isLocked: false,
      },
    ]
  );

  const [selectedElementId, setSelectedElementId] = useState<string | null>(elements[2]?.id || null);
  const selectedElement = elements.find((el) => el.id === selectedElementId);

  if (!isOpen) return null;

  const handleAddPlaceholder = (placeholder: typeof DYNAMIC_PLACEHOLDERS[0]) => {
    const newEl: CanvasElement = {
      id: `el-${crypto.randomUUID()}`,
      type: placeholder.type,
      label: placeholder.label,
      placeholderKey: placeholder.key,
      text: placeholder.sample,
      x: 50,
      y: 50,
      width: 60,
      height: 10,
      fontFamily: 'Inter',
      fontSize: 18,
      fontWeight: '600',
      fontColor: '#0F172A',
      textAlign: 'center',
      opacity: 1,
      isLocked: false,
    };
    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleSave = () => {
    const templateData = {
      courseUuid,
      title,
      description,
      type: 'custom_builder' as CertificateTemplate['type'],
      status: 'Active' as CertificateTemplate['status'],
      autoIssueRule,
      autoIssueConditions: initialTemplate?.autoIssueConditions
        ? mapAutoIssueConditions(initialTemplate.autoIssueConditions)
        : DEFAULT_AUTO_ISSUE_CONDITIONS,
      canvasSize,
      backgroundColor,
      elements,
    };

    let saved: CertificateTemplate;
    if (initialTemplate) {
      updateTemplate(initialTemplate.id, templateData);
      saved = { ...initialTemplate, ...templateData };
    } else {
      saved = addTemplate(templateData);
    }

    onSave(saved);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 font-sans text-left overflow-hidden bg-[#0F172A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full h-[100dvh] bg-[#F8FAFC] flex flex-col overflow-hidden"
        >
          {/* TOP CARDFLOW TOOLBAR */}
          <div className="bg-[#0F172A] text-white px-6 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                    CardFlow Certificate Builder
                    <Badge variant="info" size="sm" className="border-blue-400 text-blue-300 text-[10px]">
                      CardFlow v2.4
                    </Badge>
                  </h2>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-300 focus:outline-none focus:text-white font-medium p-0"
                  />
                </div>
              </div>
            </div>

            {/* STORAGE CREDIT NOTICE (Instructor Only) */}
            <div className="hidden lg:flex items-center gap-2 bg-blue-950/80 border border-blue-800 px-3 py-1.5 rounded-xl text-[11px] text-blue-300">
              <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                <strong>Storage Credit Notice:</strong> 1 Credit per PDF Certificate generated upon issuance.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={autoIssueRule}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAutoIssueRule(e.target.value as AutoIssueRule)}
                className="h-9 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
              >
                <option value="course_completion">Issue on Course Completion</option>
                <option value="passing_quiz">Issue on Passing Quiz</option>
                <option value="manual">Manual Instructor Issue</option>
              </select>

              <Button
                type="button"
                onClick={handleSave}
                className="h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-5 rounded-xl shadow-xs"
              >
                Save &amp; Activate
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN THREE-COLUMN CARDFLOW WORKSPACE */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT PANEL: ELEMENTS & DYNAMIC PLACEHOLDERS */}
            <div className="w-64 sm:w-72 bg-white border-r border-[#E2E8F0] p-4 flex flex-col space-y-4 shrink-0 overflow-y-auto no-scrollbar text-xs">
              <div>
                <h3 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider mb-2">
                  Dynamic Placeholders
                </h3>
                <p className="text-[11px] text-[#64748B] mb-3">
                  Click or drag placeholders to add them to your CardFlow certificate canvas.
                </p>

                <div className="space-y-1.5">
                  {DYNAMIC_PLACEHOLDERS.map((ph) => (
                    <button
                      key={ph.key}
                      type="button"
                      onClick={() => handleAddPlaceholder(ph)}
                      className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-left hover:bg-blue-50 hover:border-[#2563EB] transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <strong className="text-xs font-medium text-[#0F172A] block group-hover:text-[#2563EB] truncate">
                          {ph.label}
                        </strong>
                        <span className="text-[10px] text-[#64748B] font-mono block truncate">{ph.key}</span>
                      </div>
                      <Plus className="w-4 h-4 text-[#64748B] group-hover:text-[#2563EB] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER PANEL: LIVE CARDFLOW INTERACTIVE CANVAS */}
            <div className="flex-1 bg-slate-900 p-6 flex flex-col items-center justify-center relative overflow-auto no-scrollbar">
              {/* Canvas Controls */}
              <div className="absolute top-4 left-6 flex items-center gap-2 bg-slate-800/90 border border-slate-700 p-1.5 rounded-xl text-xs text-white z-20">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
                  className="p-1 hover:bg-slate-700 rounded-lg"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] px-1">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
                  className="p-1 hover:bg-slate-700 rounded-lg"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* CardFlow Certificate Canvas Frame */}
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  backgroundColor,
                }}
                className="w-[840px] h-[580px] rounded-2xl shadow-2xl relative border-8 border-slate-200 overflow-hidden shrink-0 transition-transform origin-center"
              >
                {/* Decorative Certificate Border Lines */}
                <div className="absolute inset-4 border-2 border-dashed border-blue-300 pointer-events-none rounded-xl" />
                <div className="absolute inset-6 border border-slate-200 pointer-events-none rounded-lg" />

                {/* Elements Rendered on Canvas */}
                {elements.map((el) => {
                  const isSelected = selectedElementId === el.id;

                  return (
                    <AutoFitTextContainer
                      key={el.id}
                      text={el.text || el.placeholderKey || ''}
                      maxFontSize={el.fontSize}
                      fontFamily={el.fontFamily}
                      fontWeight={el.fontWeight}
                      fontColor={el.fontColor}
                      textAlign={el.textAlign}
                      opacity={el.opacity}
                      onClick={() => setSelectedElementId(el.id)}
                      style={{
                        position: 'absolute',
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${el.width}%`,
                        height: 'auto',
                        minHeight: '28px',
                      }}
                      className={`cursor-pointer select-none transition-all p-2 rounded-lg ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50/40 shadow-xs' : 'hover:ring-1 hover:ring-blue-300'
                      }`}
                    >
                      {el.type === 'qr_code' ? (
                        <div className="w-16 h-16 bg-white border-2 border-slate-900 p-1 rounded-lg mx-auto flex items-center justify-center">
                          <QrCode className="w-12 h-12 text-slate-900" />
                        </div>
                      ) : undefined}
                    </AutoFitTextContainer>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL: PROPERTIES INSPECTOR */}
            <div className="w-64 sm:w-72 bg-white border-l border-[#E2E8F0] p-4 flex flex-col space-y-4 shrink-0 overflow-y-auto no-scrollbar text-xs">
              <h3 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider border-b pb-2">
                Properties Inspector
              </h3>

              {selectedElement ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Element Label</label>
                    <input
                      type="text"
                      value={selectedElement.label}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { label: e.target.value })}
                      className="w-full h-9 px-3 border rounded-xl font-semibold text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Font Family</label>
                    <select
                      value={selectedElement.fontFamily}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                      className="w-full h-9 px-3 border rounded-xl font-medium"
                    >
                      <option value="Inter">Inter (Modern Sans)</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Playfair Display">Playfair Display (Serif)</option>
                      <option value="Outfit">Outfit</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Font Size (px)</label>
                      <input
                        type="number"
                        value={selectedElement.fontSize}
                        onChange={(e) => handleUpdateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                        className="w-full h-9 px-3 border rounded-xl font-bold text-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedElement.fontColor}
                        onChange={(e) => handleUpdateElement(selectedElement.id, { fontColor: e.target.value })}
                        className="w-full h-9 p-1 border rounded-xl cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Position X (%)</label>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => handleUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                        className="w-full h-9 px-3 border rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Position Y (%)</label>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => handleUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                        className="w-full h-9 px-3 border rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteElement(selectedElement.id)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 h-8 text-[11px]"
                    >
                      Delete Element
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-[#64748B] bg-slate-50 border rounded-xl">
                  Select an element on canvas to inspect properties.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
