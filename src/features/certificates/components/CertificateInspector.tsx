import React, { useState, useRef, useEffect } from 'react';
import type { CanvasElement, BackgroundFit, BackgroundPosition } from '../../../types/certificate.types';
import type { CertificateFontItem } from '../utils/fontRegistry';
import {
  Sliders,
  ArrowUp,
  ArrowDown,
  Trash2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  Search,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

import type { CertificateBinding } from '../../../services/certificates.service';

interface CertificateInspectorProps {
  selectedElement: CanvasElement | undefined;
  availableFonts: CertificateFontItem[];
  availableBindings?: CertificateBinding[];
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
  onChangeBinding?: (newKey: string, newLabel: string) => void;
  bgFit?: BackgroundFit;
  bgPosition?: BackgroundPosition;
  onUpdateBackground?: (updates: { bgFit?: BackgroundFit; bgPosition?: BackgroundPosition }) => void;
  compact?: boolean;
}

export const CertificateInspector: React.FC<CertificateInspectorProps> = ({
  selectedElement,
  availableFonts,
  availableBindings,
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
  onChangeBinding,
  compact = false,
}) => {
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState('');
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setFontDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedElement) {
    return (
      <div className="py-12 px-4 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Sliders className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-300">No Element Selected</p>
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-[200px] mx-auto">
          Click any text, image, or field on the canvas to inspect and edit its properties. Use the left tools rail to add content or configure background settings.
        </p>
      </div>
    );
  }

  const isQrElement = selectedElement.type === 'qr' || selectedElement.binding === 'certificate.verification_url' || selectedElement.id === 'system-verification-qr';
  const isImageElement = selectedElement.type === 'image';

  const currentFontId = selectedElement.fontId || selectedElement.font_id || selectedElement.fontKey || selectedElement.font_key;
  const currentFont = availableFonts.find((f) => String(f.id) === String(currentFontId) || f.key === currentFontId || f.family === selectedElement.font_family || f.family === selectedElement.fontFamily) || availableFonts[0];

  const filteredFonts = availableFonts.filter((f) => {
    const nameStr = (f.display_name || f.name || f.family || '').toLowerCase();
    const keyStr = (f.key || '').toLowerCase();
    const query = fontSearchQuery.toLowerCase();
    return nameStr.includes(query) || keyStr.includes(query);
  });

  const isBold = String(selectedElement.font_weight || selectedElement.fontWeight || '400') === '700' || String(selectedElement.font_weight || selectedElement.fontWeight || '400') === 'bold';
  const isItalic = (selectedElement.font_style || selectedElement.fontStyle || 'normal') === 'italic';

  const handleSelectFont = (f: CertificateFontItem) => {
    const runtimeFamily = f.source === 'ACADEMY' ? `cubix-font-${f.id}` : f.family;
    updateSelectedElement({
      fontKey: runtimeFamily,
      font_family: runtimeFamily,
      fontFamily: runtimeFamily,
      font_id: f.id,
      fontId: f.id,
    });
    handleFontSizeChange(selectedElement.fontSize ?? selectedElement.font_size ?? 16, {
      ...selectedElement,
      fontId: f.id,
      font_id: f.id,
      fontKey: runtimeFamily,
      font_family: runtimeFamily,
      fontFamily: runtimeFamily,
    });
    setFontDropdownOpen(false);
  };

  const handleDecreaseSize = () => {
    const currentNum = parseInt(fontSizeInput, 10) || selectedElement.fontSize || selectedElement.font_size || 16;
    const nextSize = Math.max(1, currentNum - 1);
    setFontSizeInput(String(nextSize));
    handleFontSizeChange(nextSize);
  };

  const handleIncreaseSize = () => {
    const currentNum = parseInt(fontSizeInput, 10) || selectedElement.fontSize || selectedElement.font_size || 16;
    const nextSize = Math.min(150, currentNum + 1);
    setFontSizeInput(String(nextSize));
    handleFontSizeChange(nextSize);
  };

  return (
    <div
      className="space-y-3 text-left"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {!compact && (
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Selected Element</span>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{selectedElement.label || selectedElement.binding}</p>
        </div>
      )}

      {/* Field Binding Selector for Dynamic Fields */}
      {!isImageElement && !isQrElement && selectedElement.type !== 'static_text' && availableBindings && availableBindings.length > 0 && (
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Field Binding
          </label>
          <select
            value={selectedElement.binding || ''}
            onChange={(e) => {
              const matched = availableBindings.find((b) => b.key === e.target.value);
              if (matched) {
                updateSelectedElement({ binding: matched.key, label: matched.label });
                if (onChangeBinding) onChangeBinding(matched.key, matched.label);
              }
            }}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer min-h-[44px]"
          >
            {availableBindings.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label} ({b.key})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedElement.type === 'static_text' && (
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Text Content</label>
          <input
            type="text"
            value={selectedElement.static_text || ''}
            onChange={(e) => handleTextContentChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-medium min-h-[44px]"
          />
        </div>
      )}

      {/* Searchable Font Family Selector */}
      {!isImageElement && !isQrElement && (
        <div className="space-y-1 relative" ref={fontDropdownRef}>
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Font Family</label>
            <button
              type="button"
              onClick={() => setIsUploadFontModalOpen(true)}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              + Upload Custom Font
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between gap-2 focus:outline-none focus:border-blue-600 cursor-pointer min-h-[44px]"
          >
            <span className="truncate">{currentFont?.display_name || currentFont?.family || 'Inter'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {fontDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 flex flex-col">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search fonts..."
                  value={fontSearchQuery}
                  onChange={(e) => setFontSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="overflow-y-auto flex-1 p-1 space-y-0.5 max-h-48">
                {filteredFonts.length === 0 ? (
                  <p className="p-3 text-[11px] text-slate-400 text-center">No matching fonts</p>
                ) : (
                  filteredFonts.map((f) => {
                    const isSelected = String(f.id) === String(currentFont?.id) || f.key === currentFont?.key;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSelectFont(f)}
                        className={`w-full px-3 py-2.5 rounded-lg text-left text-xs font-medium flex items-center justify-between cursor-pointer min-h-[44px] transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{f.display_name || f.name || f.family}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Font Size & Stepper Controls */}
      {!isImageElement && !isQrElement && (
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Font Size (px)</label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDecreaseSize}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-slate-700 font-bold cursor-pointer transition-colors"
              title="Decrease Font Size"
            >
              <Minus className="w-4 h-4" />
            </button>
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
              className="flex-1 min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-bold"
            />
            <button
              type="button"
              onClick={handleIncreaseSize}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-slate-700 font-bold cursor-pointer transition-colors"
              title="Increase Font Size"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bold, Italic, Alignment & Color Controls Grid */}
      {!isImageElement && !isQrElement && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Bold & Italic Toggles */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Style</label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => updateSelectedElement({ font_weight: isBold ? '400' : '700', fontWeight: isBold ? '400' : '700' })}
                className={`min-h-[40px] flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isBold
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateSelectedElement({ font_style: isItalic ? 'normal' : 'italic', fontStyle: isItalic ? 'normal' : 'italic' })}
                className={`min-h-[40px] flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isItalic
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Alignment Toggles */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Alignment</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {([
                { id: 'left', icon: AlignLeft },
                { id: 'center', icon: AlignCenter },
                { id: 'right', icon: AlignRight },
              ] as const).map((item) => {
                const IconComp = item.icon;
                const active = (selectedElement.text_align || selectedElement.textAlign || 'center') === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateSelectedElement({ text_align: item.id, textAlign: item.id })}
                    className={`min-h-[40px] flex items-center justify-center rounded-lg text-xs transition-all cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title={`Align ${item.id}`}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Color */}
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.color || '#0F172A'}
                onChange={(e) => updateSelectedElement({ color: e.target.value, fontColor: e.target.value })}
                className="w-11 h-11 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent min-h-[44px] min-w-[44px]"
              />
              <input
                type="text"
                value={selectedElement.color || '#0F172A'}
                onChange={(e) => updateSelectedElement({ color: e.target.value, fontColor: e.target.value })}
                className="flex-1 min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dimensions & Layer Ordering */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
            className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-semibold"
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
            className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-semibold"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Layer Depth (Z-Index)</label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => moveLayer('down')} className="flex-1 min-h-[44px] text-xs">
            <ArrowDown className="w-3.5 h-3.5 mr-1" />
            Send Back
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => moveLayer('up')} className="flex-1 min-h-[44px] text-xs">
            <ArrowUp className="w-3.5 h-3.5 mr-1" />
            Bring Forward
          </Button>
        </div>
      </div>

      {!isQrElement && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 pb-16">
          <Button type="button" variant="ghost" size="sm" onClick={deleteSelectedElement} className="w-full min-h-[44px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold">
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Element
          </Button>
        </div>
      )}
    </div>
  );
};

