import React from 'react';
import type { CanvasElement, BackgroundFit, BackgroundPosition } from '../../../types/certificate.types';
import type { CertificateFontItem } from '../utils/fontRegistry';
import { Sliders, ArrowUp, ArrowDown, Trash2, Image } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface CertificateInspectorProps {
  selectedElement: CanvasElement | undefined;
  availableFonts: CertificateFontItem[];
  widthInput: string;
  setWidthInput: (v: string) => void;
  heightInput: string;
  setHeightInput: (v: string) => void;
  fontSizeInput: string;
  setFontSizeInput: (v: string) => void;
  updateSelectedElement: (updates: Partial<CanvasElement>) => void;
  deleteSelectedElement: () => void;
  moveLayer: (direction: 'up' | 'down') => void;
  handleFontSizeChange: (targetFontSize: number, targetElement?: CanvasElement) => void;
  handleTextContentChange: (value: string) => void;
  setIsUploadFontModalOpen: (v: boolean) => void;
  bgFit?: BackgroundFit;
  bgPosition?: BackgroundPosition;
  onUpdateBackground?: (updates: { bgFit?: BackgroundFit; bgPosition?: BackgroundPosition }) => void;
}

export const CertificateInspector: React.FC<CertificateInspectorProps> = ({
  selectedElement,
  availableFonts,
  widthInput,
  setWidthInput,
  heightInput,
  setHeightInput,
  fontSizeInput,
  setFontSizeInput,
  updateSelectedElement,
  deleteSelectedElement,
  moveLayer,
  handleFontSizeChange,
  handleTextContentChange,
  setIsUploadFontModalOpen,
  bgFit = 'cover',
  bgPosition = 'center',
  onUpdateBackground,
}) => {
  if (!selectedElement) {
    return (
      <div className="space-y-5 text-left">
        <div className="text-center py-3 space-y-1 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Sliders className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Canvas &amp; Background Settings</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[220px] mx-auto">
            Select an element to edit text/fonts, or configure background properties below.
          </p>
        </div>

        {/* Background Image Fit */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Background Image Fit
          </label>
          <select
            value={bgFit}
            onChange={(e) => onUpdateBackground?.({ bgFit: e.target.value as BackgroundFit })}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="cover">Cover (Preserve Aspect, Fill Page)</option>
            <option value="contain">Contain (Preserve Aspect, Show Entire Image)</option>
            <option value="fill">Fill (Stretch to Fill Canvas)</option>
            <option value="original">Original / Actual Size</option>
            <option value="center">Center (Actual Size Centered)</option>
            <option value="stretch">Stretch (Force Full Canvas Dimensions)</option>
          </select>
        </div>

        {/* Background Position */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Background Position
          </label>
          <select
            value={bgPosition}
            onChange={(e) => onUpdateBackground?.({ bgPosition: e.target.value as BackgroundPosition })}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
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
    );
  }

  const isQrElement = selectedElement.type === 'qr' || selectedElement.binding === 'certificate.verification_url' || selectedElement.id === 'system-verification-qr';
  const isImageElement = selectedElement.type === 'image';

  return (
    <div className="space-y-4 text-left">
      <div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Label / Binding</span>
        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{selectedElement.label || selectedElement.binding}</p>
      </div>

      {selectedElement.type === 'static_text' && (
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Text Content</label>
          <input
            type="text"
            value={selectedElement.static_text || ''}
            onChange={(e) => handleTextContentChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      )}

      {/* Font Family Selector */}
      {!isImageElement && !isQrElement && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Typography Font</label>
            <button
              type="button"
              onClick={() => setIsUploadFontModalOpen(true)}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              + Upload Custom Font
            </button>
          </div>
          <select
            value={selectedElement.fontId || selectedElement.font_id || selectedElement.fontKey || selectedElement.font_key || availableFonts[0]?.id}
            onChange={(e) => {
              const selectedId = e.target.value;
              const matched = availableFonts.find((f) => String(f.id) === selectedId || f.key === selectedId);
              if (matched) {
                const runtimeFamily = matched.source === 'ACADEMY' ? `cubix-font-${matched.id}` : matched.family;
                updateSelectedElement({
                  fontKey: runtimeFamily,
                  font_family: runtimeFamily,
                  fontFamily: runtimeFamily,
                  font_id: matched.id,
                  fontId: matched.id,
                });
                handleFontSizeChange(selectedElement.fontSize ?? selectedElement.font_size ?? 16, {
                  ...selectedElement,
                  fontId: matched.id,
                  font_id: matched.id,
                  fontKey: runtimeFamily,
                  font_family: runtimeFamily,
                  fontFamily: runtimeFamily,
                });
              }
            }}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            {availableFonts.map((f) => (
              <option key={f.id} value={f.id}>
                {f.displayName || f.family} {f.source === 'ACADEMY' ? '(Academy Font)' : '(System)'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Font Size & Weight Controls */}
      {!isImageElement && !isQrElement && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Font Size (px)</label>
            <input
              type="number"
              min={1}
              max={150}
              value={fontSizeInput}
              onChange={(e) => setFontSizeInput(e.target.value)}
              onBlur={() => {
                const num = parseInt(fontSizeInput, 10);
                if (!isNaN(num) && num > 0) {
                  handleFontSizeChange(num);
                } else {
                  setFontSizeInput(String(selectedElement.fontSize ?? selectedElement.font_size ?? 16));
                }
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Font Weight</label>
            <select
              value={selectedElement.font_weight || selectedElement.fontWeight || '600'}
              onChange={(e) => updateSelectedElement({ font_weight: e.target.value, fontWeight: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">SemiBold (600)</option>
              <option value="700">Bold (700)</option>
            </select>
          </div>
        </div>
      )}

      {/* Alignment & Color */}
      {!isImageElement && !isQrElement && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Text Alignment</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => updateSelectedElement({ text_align: align, textAlign: align })}
                  className={`py-1 text-[11px] font-bold capitalize rounded transition-colors cursor-pointer ${
                    (selectedElement.text_align || selectedElement.textAlign || 'center') === align
                      ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.color || '#0F172A'}
                onChange={(e) => updateSelectedElement({ color: e.target.value, fontColor: e.target.value })}
                className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
              />
              <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 uppercase">{selectedElement.color || '#0F172A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Dimensions & Layer Ordering */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Width (px)</label>
          <input
            type="number"
            value={widthInput}
            onChange={(e) => setWidthInput(e.target.value)}
            onBlur={() => {
              const num = parseInt(widthInput, 10);
              if (!isNaN(num) && num > 0) {
                updateSelectedElement({ width: parseFloat((num / 1600).toFixed(4)) });
              } else {
                setWidthInput(String(Math.round((selectedElement.width || 0.2) * 1600)));
              }
            }}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-semibold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Height (px)</label>
          <input
            type="number"
            value={heightInput}
            onChange={(e) => setHeightInput(e.target.value)}
            onBlur={() => {
              const num = parseInt(heightInput, 10);
              if (!isNaN(num) && num > 0) {
                updateSelectedElement({ height: parseFloat((num / 1131).toFixed(4)) });
              } else {
                setHeightInput(String(Math.round((selectedElement.height || 0.05) * 1131)));
              }
            }}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-semibold"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Layer Depth (Z-Index)</label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => moveLayer('down')} className="flex-1 text-xs">
            <ArrowDown className="w-3.5 h-3.5 mr-1" />
            Send Back
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => moveLayer('up')} className="flex-1 text-xs">
            <ArrowUp className="w-3.5 h-3.5 mr-1" />
            Bring Forward
          </Button>
        </div>
      </div>

      {!isQrElement && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={deleteSelectedElement} className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold">
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Element
          </Button>
        </div>
      )}
    </div>
  );
};
