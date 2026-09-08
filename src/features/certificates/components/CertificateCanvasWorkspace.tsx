import React from 'react';
import type { CanvasElement, BackgroundFit, BackgroundPosition } from '../../../types/certificate.types';
import type { CertificateFontItem } from '../utils/fontRegistry';
import { AutoFitTextContainer } from './AutoFitTextContainer';
import { QRCodeSVG } from 'qrcode.react';
import { resolveSampleValue } from '../hooks/useCertificateBuilder';

import { resolvePageDimensions } from '../utils/pagePresets';

const getCssBackgroundSize = (fit?: string): string => {
  switch (fit) {
    case 'contain':
      return 'contain';
    case 'fill':
    case 'stretch':
      return '100% 100%';
    case 'original':
    case 'center':
      return 'auto';
    case 'cover':
    default:
      return 'cover';
  }
};

const getCssBackgroundPosition = (pos?: string): string => {
  switch (pos) {
    case 'top-left':
      return 'top left';
    case 'top-right':
      return 'top right';
    case 'bottom-left':
      return 'bottom left';
    case 'bottom-right':
      return 'bottom right';
    case 'top':
      return 'top center';
    case 'bottom':
      return 'bottom center';
    case 'left':
      return 'left center';
    case 'right':
      return 'right center';
    case 'center':
    default:
      return 'center';
  }
};

interface CertificateCanvasWorkspaceProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  availableFonts: CertificateFontItem[];
  zoomScale: number;
  setZoomScale: React.Dispatch<React.SetStateAction<number>>;
  isPreview: boolean;
  backgroundImageUrl: string;
  bgFit?: BackgroundFit;
  bgPosition?: BackgroundPosition;
  pageSize?: string;
  orientation?: 'LANDSCAPE' | 'PORTRAIT';
  customWidth?: number;
  customHeight?: number;
  customUnit?: string;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  handlePointerDownOnElement: (e: React.PointerEvent, el: CanvasElement, resizeHandle?: string) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
}

export const CertificateCanvasWorkspace: React.FC<CertificateCanvasWorkspaceProps> = ({
  elements,
  selectedElementId,
  setSelectedElementId,
  availableFonts,
  zoomScale,
  setZoomScale,
  isPreview,
  backgroundImageUrl,
  bgFit = 'cover',
  bgPosition = 'center',
  pageSize = 'CERTIFICATE_LANDSCAPE',
  orientation = 'LANDSCAPE',
  customWidth,
  customHeight,
  customUnit = 'MM',
  workspaceRef,
  canvasRef,
  handlePointerDownOnElement,
  handlePointerMove,
  handlePointerUp,
}) => {
  const resolved = resolvePageDimensions(pageSize, orientation, customWidth, customHeight, customUnit);
  const canvasWidth = resolved.canvasWidthPx;
  const canvasHeight = resolved.canvasHeightPx;
  return (
    <div className="w-full order-1 lg:order-2 space-y-3">
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {isPreview ? 'Live Sample Preview' : 'Interactive Canvas'}
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono rounded-md border border-slate-200 dark:border-slate-700">
              {resolved.width} × {resolved.height} {resolved.unit} ({canvasWidth} × {canvasHeight} px)
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(0.35, parseFloat((prev - 0.1).toFixed(2))))}
              className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-mono font-semibold px-1 text-slate-700 dark:text-slate-300 min-w-[42px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(2.0, parseFloat((prev + 0.1).toFixed(2))))}
              className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm cursor-pointer"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(0.65)}
              className="h-8 px-2.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg cursor-pointer"
            >
              Fit
            </button>
          </div>
        </div>

        <div
          ref={workspaceRef}
          className="w-full min-h-[55vh] sm:min-h-[600px] overflow-auto overscroll-contain bg-slate-200/70 dark:bg-slate-950 rounded-xl p-3 sm:p-6 flex items-center justify-center border border-slate-300/60 dark:border-slate-800 touch-pan-x touch-pan-y"
        >
          <div
            style={{
              width: `${canvasWidth * zoomScale}px`,
              height: `${canvasHeight * zoomScale}px`,
              minWidth: `${canvasWidth * zoomScale}px`,
              minHeight: `${canvasHeight * zoomScale}px`,
              transition: 'width 0.15s ease-out, height 0.15s ease-out',
            }}
            className="relative shrink-0 shadow-2xl rounded-xl"
          >
            <div
              ref={canvasRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onClick={(e) => {
                if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-backdrop')) {
                  setSelectedElementId(null);
                }
              }}
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top left',
                backgroundImage: backgroundImageUrl
                  ? `url(${backgroundImageUrl})`
                  : `radial-gradient(#CBD5E1 1px, transparent 1px), radial-gradient(#CBD5E1 1px, #FFFFFF 1px)`,
                backgroundSize: backgroundImageUrl ? getCssBackgroundSize(bgFit) : '20px 20px',
                backgroundPosition: backgroundImageUrl ? getCssBackgroundPosition(bgPosition) : '0 0, 10px 10px',
                backgroundRepeat: 'no-repeat',
              }}
              className="canvas-backdrop bg-white text-slate-900 border-8 border-slate-800 shadow-2xl rounded-xl absolute top-0 left-0 overflow-hidden font-sans select-none touch-none"
            >
              <div className="absolute inset-2 border-2 border-amber-500/40 pointer-events-none" />
              {elements.map((el) => {
                const isSelected = selectedElementId === el.id;
                const safeWidth = el.type === 'image' ? Math.max(20 / canvasWidth, el.width || 0.15) : Math.max(1 / canvasWidth, el.width || 1 / canvasWidth);
                const safeHeight = el.type === 'image' ? Math.max(20 / canvasHeight, el.height || 0.15) : Math.max(1 / canvasHeight, el.height || 1 / canvasHeight);
                return (
                  <div
                    key={el.id}
                    onPointerDown={(e) => !isPreview && handlePointerDownOnElement(e, el)}
                    style={{
                      position: 'absolute',
                      left: `${el.x * 100}%`,
                      top: `${el.y * 100}%`,
                      width: `${safeWidth * 100}%`,
                      height: `${safeHeight * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      fontWeight: el.font_weight || el.fontWeight || 'normal',
                      textAlign: el.text_align || el.textAlign || 'center',
                      color: el.color || '#0F172A',
                      fontFamily: el.font_family || el.fontFamily || availableFonts[0]?.family || 'Inter',
                      zIndex: el.z_index || 1,
                    }}
                    className={`rounded cursor-move transition-all flex items-center justify-center relative overflow-visible box-border touch-none ${
                      isSelected && !isPreview
                        ? 'ring-4 ring-blue-600 bg-blue-50/70 dark:bg-blue-900/30 shadow-lg'
                        : 'hover:ring-2 hover:ring-blue-300 hover:bg-slate-100/40'
                    }`}
                  >
                    {el.type === 'image' ? (
                      <img src={el.image_url || 'https://via.placeholder.com/150'} alt={el.label} className="w-full h-full object-contain pointer-events-none" />
                    ) : el.type === 'qr' || el.binding === 'certificate.verification_url' || el.id === 'system-verification-qr' ? (
                      <div className="w-full h-full flex items-center justify-center bg-white p-[5%] pointer-events-none select-none">
                        <QRCodeSVG value="http://localhost:5174/verify/certificate/PREVIEW-DEMO" size={256} bgColor="#FFFFFF" fgColor="#000000" level="M" style={{ width: '100%', height: '100%' }} />
                      </div>
                    ) : (
                      <div className="w-full h-full overflow-hidden pointer-events-none">
                        <AutoFitTextContainer
                          text={resolveSampleValue(el)}
                          maxFontSize={el.fontSize ?? el.font_size ?? el.maxFontSize ?? el.max_font_size ?? 16}
                          minFontSize={Math.max(1, el.min_font_size ?? el.minFontSize ?? 1)}
                          fontFamily={el.font_family || el.fontFamily || availableFonts[0]?.family || 'Inter'}
                          fontWeight={el.font_weight || el.fontWeight || 'normal'}
                          fontColor={el.color || '#0F172A'}
                          textAlign={el.text_align || el.textAlign || 'center'}
                          padding={el.padding || { top: 3, right: 4, bottom: 3, left: 4 }}
                          isEditorMode={!isPreview}
                          className="w-full h-full pointer-events-none"
                        />
                      </div>
                    )}
                    {isSelected && !isPreview && (
                      <>
                        <div onPointerDown={(e) => handlePointerDownOnElement(e, el, 'lt')} className="w-7 h-7 bg-white border-2 border-blue-600 rounded-full absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize shadow-md z-50 hover:scale-125 transition-transform pointer-events-auto flex items-center justify-center touch-none"><div className="w-2.5 h-2.5 bg-blue-600 rounded-full" /></div>
                        <div onPointerDown={(e) => handlePointerDownOnElement(e, el, 'rt')} className="w-7 h-7 bg-white border-2 border-blue-600 rounded-full absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize shadow-md z-50 hover:scale-125 transition-transform pointer-events-auto flex items-center justify-center touch-none"><div className="w-2.5 h-2.5 bg-blue-600 rounded-full" /></div>
                        <div onPointerDown={(e) => handlePointerDownOnElement(e, el, 'lb')} className="w-7 h-7 bg-white border-2 border-blue-600 rounded-full absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize shadow-md z-50 hover:scale-125 transition-transform pointer-events-auto flex items-center justify-center touch-none"><div className="w-2.5 h-2.5 bg-blue-600 rounded-full" /></div>
                        <div onPointerDown={(e) => handlePointerDownOnElement(e, el, 'rb')} className="w-7 h-7 bg-blue-600 border-2 border-white rounded-full absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize shadow-md z-50 hover:scale-125 transition-transform pointer-events-auto flex items-center justify-center touch-none"><div className="w-2.5 h-2.5 bg-white rounded-full" /></div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
