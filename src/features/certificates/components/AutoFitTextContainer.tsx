import React, { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { calculateAutoFontSize, normalizePadding, PaddingConfig } from '../utils/textFit';

export type PaddingProp = PaddingConfig | Partial<PaddingConfig> | number;

export interface AutoFitTextContainerProps {
  text?: string;
  maxFontSize?: number | null;
  minFontSize?: number | null;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  isUnderline?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  multiline?: boolean;
  opacity?: number;
  padding?: PaddingProp;
  isEditorMode?: boolean;
  onFitCalculated?: (fontSize: number, isOverflowing: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export const AutoFitTextContainer: React.FC<AutoFitTextContainerProps> = ({
  text = '',
  maxFontSize = 32,
  minFontSize = 1,
  fontFamily = 'Inter',
  fontWeight = '600',
  fontStyle = 'normal',
  fontColor = '#0F172A',
  textAlign = 'center',
  isUnderline = false,
  letterSpacing = 0,
  lineHeight = 1.0,
  multiline = false,
  opacity = 1,
  padding,
  isEditorMode = false,
  onFitCalculated,
  className = '',
  style = {},
  onClick,
  onMouseDown,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fittedFontSize, setFittedFontSize] = useState<number>(16);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);

  const pad = normalizePadding(padding);

  const calculateFit = useCallback(() => {
    const container = containerRef.current;
    const textSpan = textRef.current;
    if (!container || !text) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth <= 0 || containerHeight <= 0) return;

    const fitResult = calculateAutoFontSize({
      text,
      width: containerWidth,
      height: containerHeight,
      padding: pad,
      fontFamily,
      fontWeight,
      fontStyle,
      maxFontSize: maxFontSize || 32,
      minFontSize: minFontSize || 1,
      lineHeight,
      letterSpacing,
      multiline,
    });

    let finalFontSize = fitResult.renderedFontSize;
    let overflowDetected = fitResult.isOverflowing;

    if (textSpan) {
      const availableWidth = Math.max(1, containerWidth - (pad.left + pad.right));
      const availableHeight = Math.max(1, containerHeight - (pad.top + pad.bottom));

      textSpan.style.fontSize = `${finalFontSize}px`;
      const domOverflow = textSpan.scrollWidth > availableWidth || textSpan.scrollHeight > availableHeight;

      if (domOverflow && finalFontSize > (minFontSize || 1)) {
        let domSize = finalFontSize;
        const minAllowed = minFontSize || 1;
        while (domSize > minAllowed) {
          domSize -= 0.5;
          textSpan.style.fontSize = `${domSize}px`;
          if (textSpan.scrollWidth <= availableWidth && textSpan.scrollHeight <= availableHeight) {
            break;
          }
        }
        finalFontSize = Math.max(minAllowed, domSize);
        overflowDetected = (textSpan.scrollWidth > availableWidth || textSpan.scrollHeight > availableHeight) && finalFontSize <= minAllowed;
      }
    }

    setFittedFontSize(finalFontSize);
    setIsOverflowing(overflowDetected);

    if (onFitCalculated) {
      onFitCalculated(finalFontSize, overflowDetected);
    }
  }, [
    maxFontSize,
    minFontSize,
    text,
    fontFamily,
    fontWeight,
    fontStyle,
    letterSpacing,
    lineHeight,
    multiline,
    pad.left,
    pad.right,
    pad.top,
    pad.bottom,
    onFitCalculated,
  ]);

  useLayoutEffect(() => {
    calculateFit();
  }, [
    calculateFit,
    text,
    maxFontSize,
    minFontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    letterSpacing,
    lineHeight,
    multiline,
    style?.width,
    style?.height,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      calculateFit();
    });

    observer.observe(container);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        calculateFit();
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [calculateFit, text, maxFontSize, minFontSize]);

  const justifyContent =
    textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';

  const showText = Boolean(text && text.trim().length > 0);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={`relative overflow-hidden flex items-center ${className}`}
      style={{
        justifyContent,
        opacity,
        boxSizing: 'border-box',
        paddingTop: `${pad.top}px`,
        paddingRight: `${pad.right}px`,
        paddingBottom: `${pad.bottom}px`,
        paddingLeft: `${pad.left}px`,
        ...style,
      }}
    >
      {showText && (
        <span
          ref={textRef}
          className={`${multiline ? 'break-words' : 'whitespace-nowrap'} inline-block select-none transition-none leading-none`}
          style={{
            fontSize: `${fittedFontSize}px`,
            fontFamily,
            fontWeight,
            fontStyle,
            color: fontColor,
            textAlign,
            textDecoration: isUnderline ? 'underline' : 'none',
            letterSpacing: `${letterSpacing}px`,
            lineHeight: lineHeight || 1.0,
            maxWidth: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            textOverflow: 'clip',
          }}
        >
          {text}
        </span>
      )}

      {isEditorMode && isOverflowing && (
        <div
          title="Text does not fit at the minimum font size. Increase the container size."
          className="absolute top-0 right-0 text-[8px] font-bold px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap bg-amber-500 text-white z-40 shadow-xs"
        >
          Text does not fit at minimum font size
        </div>
      )}
      {children}
    </div>
  );
};
