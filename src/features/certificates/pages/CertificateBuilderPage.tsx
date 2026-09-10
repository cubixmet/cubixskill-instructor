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
    <div className="space-y-4 sm:space-y-6 font-sans text-left pb-32 sm:pb-16 max-w-7xl mx-auto px-3 sm:px-6">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => b.navigate(b.routeCourseId ? `/courses/${b.routeCourseId}/certificates` : '/certificates')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center mt-1 sm:mt-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1 space-y-1.5 w-full">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>{b.isEditMode ? 'Edit Certificate Template' : 'New Certificate Template'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[300px]">
                {b.academyName}
              </span>
            </div>
            <div className="space-y-1 min-w-0 w-full">
              <label htmlFor="certificate-template-name-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Certificate Template Name *
              </label>
              <input
                id="certificate-template-name-input"
                type="text"
                value={b.templateName}
                onChange={(e) => b.setTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="w-full min-w-0 min-h-[44px] px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-[10px] text-base sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all box-border"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
          {b.step === 2 && (
            <button
              type="button"
              onClick={() => b.setIsPreview(!b.isPreview)}
              className={`min-h-[44px] px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border w-full sm:w-auto ${
                b.isPreview
                  ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>{b.isPreview ? 'Back to Editor' : 'Preview Mode'}</span>
            </button>
          )}
          {b.step === 1 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={!b.selectedCourseId}
              onClick={() => {
                if (!b.selectedCourseId) {
                  b.showToast('Please select a valid eligible course before proceeding.');
                  return;
                }
                b.setStep(2);
              }}
              className="w-full sm:w-auto min-h-[44px] px-4 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs"
            >
              <span>Next: Visual Canvas</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => b.setStep(1)}
                className="w-full sm:w-auto min-h-[44px] px-3 text-xs font-semibold"
              >
                Step 1: Settings
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={b.isSaving}
                onClick={b.handleSaveTemplate}
                className="w-full sm:w-auto min-h-[44px] px-4 text-xs font-bold flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs"
              >
                {b.isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 shrink-0" />
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
          <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100">Target Course *</label>
                    {b.isLoadingCoursesQuery || b.isLoadingTemplatesQuery ? (
                      <div className="flex items-center gap-2 min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading eligible courses...</span>
                      </div>
                    ) : b.eligibleCourses.length === 0 && !b.isEditMode ? (
                      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>All your courses already have certificate templates.</span>
                      </div>
                    ) : (
                      <select
                        value={b.selectedCourseId}
                        onChange={(e) => b.setSelectedCourseId(e.target.value)}
                        className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer text-ellipsis overflow-hidden"
                      >
                        <option value="">Select a course...</option>
                        {/* If in edit mode, ensure currently assigned course remains visible */}
                        {b.isEditMode && b.selectedCourseId && !b.eligibleCourses.some((c: any) => String(c.id) === String(b.selectedCourseId)) && (() => {
                          const curr = b.queriedCourses.find((c: any) => String(c.id) === String(b.selectedCourseId));
                          return curr ? (
                            <option value={curr.id}>
                              {curr.title || curr.name}
                            </option>
                          ) : null;
                        })()}
                        {b.eligibleCourses.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.title || c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100">Page Size</label>
                    <select
                      value={b.pageSize}
                      onChange={(e) => b.setPageSize(e.target.value)}
                      className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer text-ellipsis overflow-hidden"
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
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Custom Dimensions Settings
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 min-w-0">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
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
                          className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
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
                          className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Unit
                        </label>
                        <select
                          value={b.customUnit ?? 'MM'}
                          onChange={(e) => b.setCustomUnit(e.target.value as any)}
                          className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer font-mono"
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

            {/* Background Image Settings Card */}
            <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Background Image</span>
                </span>
                {b.backgroundImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      b.setBackgroundImageUrl('');
                      b.setBackgroundAssetId(null);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </h3>

              {/* Upload & Preview */}
              {b.backgroundImageUrl ? (
                <div className="space-y-3">
                  <div className="relative w-full h-24 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <img src={b.backgroundImageUrl} alt="Background Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => b.bgFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          b.setBackgroundImageUrl('');
                          b.setBackgroundAssetId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => b.bgFileInputRef.current?.click()}
                  className="w-full min-h-[44px] p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/40"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Background Image (JPG, PNG, WEBP)</span>
                </button>
              )}

              {/* Controls */}
              <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 min-w-0">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Fit Mode</label>
                    <select
                      value={b.bgFit}
                      onChange={(e) => b.setBgFit(e.target.value as any)}
                      className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="cover">Cover (Fill & Crop)</option>
                      <option value="contain">Contain (Fit Whole)</option>
                      <option value="stretch">Stretch (Exact Fill)</option>
                    </select>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Position</label>
                    <select
                      value={b.bgPosition}
                      onChange={(e) => b.setBgPosition(e.target.value as any)}
                      className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      <span>Opacity</span>
                      <span className="font-mono text-slate-500">{b.bgOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={b.bgOpacity}
                      onChange={(e) => b.setBgOpacity(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={b.bgColor}
                        onChange={(e) => b.setBgColor(e.target.value)}
                        className="w-10 min-h-[44px] p-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={b.bgColor}
                        onChange={(e) => b.setBgColor(e.target.value)}
                        className="flex-1 min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
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

            <Card className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-4">
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
        </div>
      )}

      <PersonalFieldsModal isOpen={b.isPersonalModalOpen} onClose={() => b.setIsPersonalModalOpen(false)} onFieldCreated={b.handlePersonalFieldCreated} />
      <input ref={b.bgFileInputRef} type="file" accept="image/*" onChange={b.handleBackgroundUpload} className="hidden" />
      <input ref={b.imageFileInputRef} type="file" accept="image/*" onChange={b.handleImageUpload} className="hidden" />
      <UploadFontModal isOpen={b.isUploadFontModalOpen} onClose={() => b.setIsUploadFontModalOpen(false)} onFontUploaded={(font) => b.handleFontUploaded(font)} />
    </div>
  );
};
