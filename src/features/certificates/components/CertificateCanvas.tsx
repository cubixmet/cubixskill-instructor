import React, { useRef, useState, useEffect } from 'react';
import { CanvasElement } from '../../../types/certificate.types';
import { AutoFitTextContainer } from './AutoFitTextContainer';
import { resolveFieldValue } from '../services/certificateFieldResolver';

interface CertificateCanvasProps {
  elements: CanvasElement[];
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateElement?: (id: string, updates: Partial<CanvasElement>) => void;
  onDropBackgroundImage?: (file: File) => void;
  onApplyBackgroundImage?: (url: string) => void;
  onDropField?: (fieldKey: string, label: string, xPercent: number, yPercent: number) => void;
  onDropImageElement?: (url: string, name: string, xPercent: number, yPercent: number) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundUrl?: string;
  backgroundColor?: string;
  bgFit?: 'cover' | 'contain';
  bgPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  bgOpacity?: number;
  isEditorMode?: boolean;
  isPreviewOnly?: boolean;
  sampleOverrides?: Record<string, string>;
  studentPreviewContext?: {
    name?: string;
    studentId?: string;
    email?: string;
    courseName?: string;
    completionDate?: string;
    instructorName?: string;
    overallPercentage?: number;
    grade?: string;
    certificateNumber?: string;
  };
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDropBackgroundImage,
  onApplyBackgroundImage,
  onDropField,
  onDropImageElement,
  canvasWidth = 1123,
  canvasHeight = 794,
  backgroundUrl,
  backgroundColor = 'transparent',
  bgFit = 'cover',
  bgPosition = 'center',
  bgOpacity = 1,
  isEditorMode = true,
  isPreviewOnly = false,
  sampleOverrides,
  studentPreviewContext,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingState, setResizingState] = useState<{ id: string; handle: string; startWidth: number; startHeight: number; startX: number; startY: number; startClientX: number; startClientY: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle Pointer Move for both Dragging (Moving) and Resizing
  useEffect(() => {
    if ((!draggingId && !resizingState) || !isEditorMode || isPreviewOnly) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Case A: Resizing Element
      if (resizingState) {
        const { id, handle, startWidth, startHeight, startX, startY, startClientX, startClientY } = resizingState;
        const deltaXPercent = ((clientX - startClientX) / rect.width) * 100;
        const deltaYPercent = ((clientY - startClientY) / rect.height) * 100;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startX;
        let newY = startY;

        if (handle.includes('e')) {
          newWidth = Math.max(5, Math.min(100 - startX, startWidth + deltaXPercent));
        }
        if (handle.includes('s')) {
          newHeight = Math.max(3, Math.min(100 - startY, startHeight + deltaYPercent));
        }
        if (handle.includes('w')) {
          const possibleWidth = Math.max(5, startWidth - deltaXPercent);
          newX = startX + (startWidth - possibleWidth);
          newWidth = possibleWidth;
        }
        if (handle.includes('n')) {
          const possibleHeight = Math.max(3, startHeight - deltaYPercent);
          newY = startY + (startHeight - possibleHeight);
          newHeight = possibleHeight;
        }

        if (onUpdateElement) {
          onUpdateElement(id, {
            width: Math.round(newWidth * 10) / 10,
            height: Math.round(newHeight * 10) / 10,
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10,
          });
        }
        return;
      }

      // Case B: Moving Element
      if (draggingId) {
        const element = elements.find((el) => el.id === draggingId);
        if (!element || element.isLocked) return;

        let newX = ((clientX - rect.left) / rect.width) * 100 - dragOffset.x;
        let newY = ((clientY - rect.top) / rect.height) * 100 - dragOffset.y;

        newX = Math.max(0, Math.min(100 - element.width, newX));
        newY = Math.max(0, Math.min(100 - element.height, newY));

        if (onUpdateElement) {
          onUpdateElement(draggingId, {
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10,
          });
        }
      }
    };

    const handlePointerUp = () => {
      setDraggingId(null);
      setResizingState(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [draggingId, resizingState, dragOffset, elements, isEditorMode, isPreviewOnly, onUpdateElement]);

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, id: string, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isEditorMode || isPreviewOnly) return;

    const element = elements.find((el) => el.id === id);
    if (!element || element.isLocked) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    setResizingState({
      id,
      handle,
      startWidth: element.width,
      startHeight: element.height,
      startX: element.x,
      startY: element.y,
      startClientX: clientX,
      startClientY: clientY,
    });
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    if (!isEditorMode || isPreviewOnly || resizingState) return;

    const element = elements.find((el) => el.id === id);
    if (!element || element.isLocked) return;

    if (onSelectElement) {
      onSelectElement(id);
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const mouseXPercent = ((clientX - rect.left) / rect.width) * 100;
    const mouseYPercent = ((clientY - rect.top) / rect.height) * 100;

    setDragOffset({
      x: mouseXPercent - element.x,
      y: mouseYPercent - element.y,
    });
    setDraggingId(id);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current && onSelectElement) {
      onSelectElement(null);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditorMode || isPreviewOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isEditorMode || isPreviewOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditorMode || isPreviewOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 1. Check for Image Library Item Drag
    const imgData = e.dataTransfer.getData('application/image-library');
    if (imgData && onDropImageElement) {
      try {
        const { url, name } = JSON.parse(imgData);
        if (canvasRef.current && url) {
          const rect = canvasRef.current.getBoundingClientRect();
          const xPercent = Math.max(5, Math.min(80, ((e.clientX - rect.left) / rect.width) * 100));
          const yPercent = Math.max(5, Math.min(80, ((e.clientY - rect.top) / rect.height) * 100));
          onDropImageElement(url, name, xPercent, yPercent);
          return;
        }
      } catch (_err) {
        // Fallthrough
      }
    }

    // 2. Check for Dragged Background Image from Library
    const bgData = e.dataTransfer.getData('application/bg-library');
    if (bgData && onApplyBackgroundImage) {
      try {
        const { url } = JSON.parse(bgData);
        if (url) {
          onApplyBackgroundImage(url);
          return;
        }
      } catch (_err) {
        // Fallthrough
      }
    }

    // 3. Check for Dynamic Field Drag
    const fieldData = e.dataTransfer.getData('application/json');
    if (fieldData) {
      try {
        const { key, label } = JSON.parse(fieldData);
        if (canvasRef.current && onDropField) {
          const rect = canvasRef.current.getBoundingClientRect();
          const xPercent = Math.max(5, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100));
          const yPercent = Math.max(5, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));
          onDropField(key, label, xPercent, yPercent);
          return;
        }
      } catch (_err) {
        // Fallthrough
      }
    }

    // 4. Check for Direct File Upload Drop
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && onDropBackgroundImage) {
      onDropBackgroundImage(file);
    }
  };

  const isTransparent = !backgroundColor || backgroundColor === 'transparent';
  const checkerboardStyle = isEditorMode && isTransparent
    ? 'bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px] bg-slate-50'
    : '';

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full overflow-hidden font-sans select-none shadow-md transition-all rounded-xl border ${
        isDragOver ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-300'
      } ${checkerboardStyle}`}
      style={{
        aspectRatio: `${canvasWidth} / ${canvasHeight}`,
        backgroundColor: isTransparent ? 'transparent' : backgroundColor,
      }}
    >
      {/* Layer 2: Active Background Image Layer */}
      {backgroundUrl && (
        <div
          className="absolute inset-0 pointer-events-none transition-all"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: bgFit === 'contain' ? 'contain' : 'cover',
            backgroundPosition: bgPosition || 'center',
            backgroundRepeat: 'no-repeat',
            opacity: bgOpacity ?? 1,
          }}
        />
      )}

      {/* Layer 3: Render Dynamic Canvas Elements & Image Elements */}
      {elements.map((el) => {
        const isSelected = isEditorMode && !isPreviewOnly && selectedElementId === el.id;

        // Resolve text for dynamic field
        let displayText = el.text || '';
        if (el.type === 'dynamic_field' || el.placeholderKey) {
          const key = el.fieldKey || el.placeholderKey?.replace(/[{}]/g, '') || '';
          displayText = resolveFieldValue(key, sampleOverrides, studentPreviewContext);
        }

        return (
          <div
            key={el.id}
            onMouseDown={(e) => handlePointerDown(e, el.id)}
            onTouchStart={(e) => handlePointerDown(e, el.id)}
            className={`absolute transition-all group ${
              isEditorMode && !isPreviewOnly ? 'cursor-grab active:cursor-grabbing' : ''
            } ${
              isSelected
                ? 'ring-2 ring-blue-600 ring-offset-1 shadow-md'
                : isEditorMode && !isPreviewOnly
                ? 'hover:ring-1 hover:ring-blue-400/70'
                : ''
            }`}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}%`,
              height: `${el.height}%`,
              opacity: el.opacity ?? 1,
              zIndex: el.zIndex ?? (isSelected ? 30 : 10),
            }}
          >
            {/* Editor Label Badge on Top Left (Editor Only, Hidden in Preview) */}
            {isEditorMode && !isPreviewOnly && (
              <div className="absolute -top-4 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs pointer-events-none whitespace-nowrap bg-blue-600 text-white z-40">
                {el.label}
              </div>
            )}

            {/* Content Rendering: Image vs QR Code vs Dynamic Field */}
            {el.type === 'image' || el.imageUrl ? (
              <img
                src={el.imageUrl}
                alt={el.label}
                className="w-full h-full object-contain pointer-events-none select-none drop-shadow-xs"
              />
            ) : el.type === 'qr_code' ? (
              <div className="w-full h-full bg-white p-1 rounded border border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center text-white text-[9px] font-mono font-bold">
                  [ QR VERIFY ]
                </div>
              </div>
            ) : (
              <AutoFitTextContainer
                text={displayText}
                maxFontSize={el.fontSize ?? el.font_size ?? el.maxFontSize ?? el.max_font_size ?? 56}
                minFontSize={el.minFontSize ?? el.min_font_size ?? 1}
                fontFamily={el.font_family || el.fontFamily || 'Inter'}
                fontWeight={el.font_weight || el.fontWeight || '600'}
                fontColor={el.color || el.fontColor || '#0F172A'}
                textAlign={el.text_align || el.textAlign || 'center'}
                padding={el.padding}
                isEditorMode={isEditorMode && !isPreviewOnly}
                className="w-full h-full"
              />
            )}

            {/* Touch-Friendly Resize Handles when Selected in Editor Mode */}
            {isSelected && (
              <>
                {/* Bottom-Right Handle (SE) */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, el.id, 'se')}
                  onTouchStart={(e) => handleResizeStart(e, el.id, 'se')}
                  className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md z-50 cursor-se-resize touch-none flex items-center justify-center"
                  title="Resize width & height"
                />
                {/* Bottom-Left Handle (SW) */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, el.id, 'sw')}
                  onTouchStart={(e) => handleResizeStart(e, el.id, 'sw')}
                  className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md z-50 cursor-sw-resize touch-none"
                  title="Resize width & height"
                />
                {/* Top-Right Handle (NE) */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, el.id, 'ne')}
                  onTouchStart={(e) => handleResizeStart(e, el.id, 'ne')}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md z-50 cursor-ne-resize touch-none"
                  title="Resize width & height"
                />
                {/* Right Edge Handle (E) */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, el.id, 'e')}
                  onTouchStart={(e) => handleResizeStart(e, el.id, 'e')}
                  className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-5 bg-blue-600 rounded-sm shadow-md z-50 cursor-e-resize touch-none"
                  title="Resize width"
                />
                {/* Bottom Edge Handle (S) */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, el.id, 's')}
                  onTouchStart={(e) => handleResizeStart(e, el.id, 's')}
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-3 bg-blue-600 rounded-sm shadow-md z-50 cursor-s-resize touch-none"
                  title="Resize height"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
