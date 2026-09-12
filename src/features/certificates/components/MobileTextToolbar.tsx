import React from 'react';
import type { CanvasElement } from '../../../types/certificate.types';
import {
  Type,
  Scaling,
  Palette,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveHorizontal,
  Layers,
  Check,
  Edit3,
} from 'lucide-react';

interface MobileTextToolbarProps {
  selectedElement: CanvasElement;
  onOpenSheet: (sheet: 'editText' | 'font' | 'fontSize' | 'color' | 'spacing' | 'binding') => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleAlignment: () => void;
  onDone: () => void;
}

export const MobileTextToolbar: React.FC<MobileTextToolbarProps> = ({
  selectedElement,
  onOpenSheet,
  onToggleBold,
  onToggleItalic,
  onToggleAlignment,
  onDone,
}) => {
  const isBold = String(selectedElement.font_weight || selectedElement.fontWeight || '400') === '700' || String(selectedElement.font_weight || selectedElement.fontWeight || '400') === 'bold';
  const isItalic = (selectedElement.font_style || selectedElement.fontStyle || 'normal') === 'italic';
  const textAlign = selectedElement.text_align || selectedElement.textAlign || 'center';

  const AlignIcon = textAlign === 'left' ? AlignLeft : textAlign === 'right' ? AlignRight : AlignCenter;

  const isDynamicField = Boolean(selectedElement.binding && selectedElement.binding !== 'static_text');

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-1 shadow-2xl select-none"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0 pr-1">
        {/* Edit Content */}
        <button
          type="button"
          onClick={() => onOpenSheet(isDynamicField ? 'binding' : 'editText')}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-xl hover:bg-slate-900 min-h-[44px] min-w-[44px] shrink-0 cursor-pointer"
        >
          <Edit3 className="w-4.5 h-4.5 text-blue-400" />
          <span className="whitespace-nowrap">{isDynamicField ? 'Binding' : 'Edit'}</span>
        </button>

        {/* Font Family */}
        <button
          type="button"
          onClick={() => onOpenSheet('font')}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-xl hover:bg-slate-900 min-h-[44px] min-w-[44px] shrink-0 cursor-pointer"
        >
          <Type className="w-4.5 h-4.5" />
          <span className="whitespace-nowrap">Font</span>
        </button>

        {/* Font Size */}
        <button
          type="button"
          onClick={() => onOpenSheet('fontSize')}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-xl hover:bg-slate-900 min-h-[44px] min-w-[44px] shrink-0 cursor-pointer"
        >
          <Scaling className="w-4.5 h-4.5" />
          <span className="whitespace-nowrap">Size ({selectedElement.fontSize ?? selectedElement.font_size ?? 16})</span>
        </button>

        {/* Text Color */}
        <button
          type="button"
          onClick={() => onOpenSheet('color')}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-xl hover:bg-slate-900 min-h-[44px] min-w-[44px] shrink-0 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Palette className="w-4.5 h-4.5" />
            <div
              className="absolute -bottom-0.5 w-3 h-1 rounded-full border border-slate-900"
              style={{ backgroundColor: selectedElement.color || '#0F172A' }}
            />
          </div>
          <span className="whitespace-nowrap">Color</span>
        </button>

        {/* Bold */}
        <button
          type="button"
          onClick={onToggleBold}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold px-2 py-1 rounded-xl min-h-[44px] min-w-[44px] shrink-0 cursor-pointer transition-colors ${
            isBold ? 'text-blue-400 bg-slate-900 border border-slate-800 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bold className="w-4.5 h-4.5" />
          <span className="whitespace-nowrap">Bold</span>
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={onToggleItalic}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold px-2 py-1 rounded-xl min-h-[44px] min-w-[44px] shrink-0 cursor-pointer transition-colors ${
            isItalic ? 'text-blue-400 bg-slate-900 border border-slate-800 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Italic className="w-4.5 h-4.5" />
          <span className="whitespace-nowrap">Italic</span>
        </button>

        {/* Alignment */}
        <button
          type="button"
          onClick={onToggleAlignment}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-xl hover:bg-slate-900 min-h-[44px] min-w-[44px] shrink-0 cursor-pointer"
        >
          <AlignIcon className="w-4.5 h-4.5" />
          <span className="whitespace-nowrap capitalize">{textAlign}</span>
        </button>

        {/* Spacing */}
        <button
          type="button"
          onClick={() => onOpenSheet('spacing')}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-xl hover:bg-slate-900 min-h-[44px] min-w-[44px] shrink-0 cursor-pointer"
        >
          <MoveHorizontal className="w-4.5 h-4.5" />
          <span className="whitespace-nowrap">Spacing</span>
        </button>

        {/* Dynamic Field Binding */}
        {isDynamicField && (
          <button
            type="button"
            onClick={() => onOpenSheet('binding')}
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded-xl hover:bg-slate-900 min-h-[44px] min-w-[44px] shrink-0 cursor-pointer"
          >
            <Layers className="w-4.5 h-4.5 text-purple-400" />
            <span className="whitespace-nowrap">Field</span>
          </button>
        )}
      </div>

      {/* Pinned Done Button */}
      <button
        type="button"
        onClick={onDone}
        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0 cursor-pointer min-h-[44px] shadow-lg"
        title="Done Editing"
      >
        <Check className="w-4 h-4 stroke-[3]" />
        <span>Done</span>
      </button>
    </div>
  );
};
