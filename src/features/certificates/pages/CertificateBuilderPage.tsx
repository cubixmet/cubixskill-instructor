import React from 'react';
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
  PlusCircle,
  BookOpen,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PersonalFieldsModal } from '../components/PersonalFieldsModal';
import { UploadFontModal } from '../components/UploadFontModal';
import { useCertificateBuilder } from '../hooks/useCertificateBuilder';
import { CertificateInspector } from '../components/CertificateInspector';
import { CertificateCanvasWorkspace } from '../components/CertificateCanvasWorkspace';
import { CERTIFICATE_PAGE_PRESET_OPTIONS } from '../utils/pagePresets';

export const CertificateBuilderPage: React.FC = () => {
  const b = useCertificateBuilder();

  return (
    <div className="space-y-6 font-sans text-left pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Toast Alert */}
      {b.toastState && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
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

      {/* Navigation & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => b.navigate(b.routeCourseId ? `/courses/${b.routeCourseId}/certificates` : '/certificates')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {b.isEditMode ? 'Edit Certificate Template' : 'New Certificate Template'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-[260px]">
                {b.academyName}
              </span>
            </div>
            <input
              type="text"
              value={b.templateName}
              onChange={(e) => b.setTemplateName(e.target.value)}
              placeholder="Template Name..."
              className="text-base sm:text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-600 focus:outline-none px-1 py-0.5 rounded text-slate-900 dark:text-slate-100 w-full max-w-[300px] sm:max-w-[400px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {b.step === 2 && (
            <button
              type="button"
              onClick={() => b.setIsPreview(!b.isPreview)}
              className={`h-10 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border ${
                b.isPreview
                  ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{b.isPreview ? 'Back to Editor' : 'Preview Mode'}</span>
            </button>
          )}
          {b.step === 1 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                if (!b.selectedCourseId) {
                  b.showToast('Please select a course before proceeding.');
                  return;
                }
                b.setStep(2);
              }}
              className="h-10 px-4 text-xs font-semibold flex items-center gap-2"
            >
              <span>Next: Visual Canvas</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="md" onClick={() => b.setStep(1)} className="h-10 px-3 text-xs font-semibold">
                Step 1: Settings
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={b.isSaving}
                onClick={b.handleSaveTemplate}
                className="h-10 px-4 text-xs font-semibold flex items-center gap-2"
              >
                {b.isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Template</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Settings Setup */}
      {b.step === 1 && (
        <div className="space-y-5">
          <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Step 1: Certificate & Course Setup</span>
            </h3>
            {b.isLoadingCoursesQuery || b.isLoadingFields ? (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-8">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading available course fields...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">Target Course</label>
                    <select
                      value={b.selectedCourseId}
                      onChange={(e) => b.setSelectedCourseId(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      {b.queriedCourses.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.title || c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">Page Size</label>
                    <select
                      value={b.pageSize}
                      onChange={(e) => b.setPageSize(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      {CERTIFICATE_PAGE_PRESET_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {b.pageSize === 'CUSTOM' && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Custom Dimensions Settings
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Width
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5000"
                          step="any"
                          value={b.customWidth ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              b.setCustomWidth(undefined);
                            } else {
                              const num = parseFloat(val);
                              if (!isNaN(num) && num > 0) {
                                b.setCustomWidth(num);
                              }
                            }
                          }}
                          placeholder="210"
                          className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Height
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5000"
                          step="any"
                          value={b.customHeight ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              b.setCustomHeight(undefined);
                            } else {
                              const num = parseFloat(val);
                              if (!isNaN(num) && num > 0) {
                                b.setCustomHeight(num);
                              }
                            }
                          }}
                          placeholder="297"
                          className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Unit
                        </label>
                        <select
                          value={b.customUnit ?? 'MM'}
                          onChange={(e) => b.setCustomUnit(e.target.value as any)}
                          className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer font-mono"
                        >
                          <option value="MM">mm</option>
                          <option value="CM">cm</option>
                          <option value="INCH">in</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {/* Step 2: Visual Designer Canvas & Panels */}
      {b.step === 2 && (
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(300px,340px)_minmax(0,1fr)] gap-5 lg:gap-6 items-start">
          <div className="space-y-4 w-full order-2 lg:order-1">
            <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Add Elements</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={b.addStaticTextElement}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Type className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => b.imageFileInputRef.current?.click()}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Image
                </button>
              </div>
            </Card>

            <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Selected Fields</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-900/40">
                  {b.designerSelectedBindings.length}
                </span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {b.designerSelectedBindings.map((binding) => (
                  <button
                    key={binding.key}
                    type="button"
                    onClick={() => b.addElement(binding)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-left flex items-center justify-between text-xs font-medium text-slate-900 dark:text-slate-100 cursor-pointer transition-colors"
                  >
                    <span className="truncate">{binding.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="hidden lg:block bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Properties
                </span>
                {b.selectedElement && (
                  <button type="button" onClick={b.deleteSelectedElement} className="text-rose-600 hover:text-rose-700 p-1 rounded cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </h3>
              <CertificateInspector
                selectedElement={b.selectedElement}
                availableFonts={b.availableFonts}
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
            </Card>
          </div>

          <CertificateCanvasWorkspace
            elements={b.elements}
            selectedElementId={b.selectedElementId}
            setSelectedElementId={b.setSelectedElementId}
            availableFonts={b.availableFonts}
            zoomScale={b.zoomScale}
            setZoomScale={b.setZoomScale}
            isPreview={b.isPreview}
            backgroundImageUrl={b.backgroundImageUrl}
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
        </div>
      )}

      <PersonalFieldsModal isOpen={b.isPersonalModalOpen} onClose={() => b.setIsPersonalModalOpen(false)} onFieldCreated={b.handlePersonalFieldCreated} />
      <input ref={b.bgFileInputRef} type="file" accept="image/*" onChange={b.handleBackgroundUpload} className="hidden" />
      <input ref={b.imageFileInputRef} type="file" accept="image/*" onChange={b.handleImageUpload} className="hidden" />
      <UploadFontModal isOpen={b.isUploadFontModalOpen} onClose={() => b.setIsUploadFontModalOpen(false)} onFontUploaded={(font) => b.handleFontUploaded(font)} />
    </div>
  );
};
