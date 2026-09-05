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
  maxFontSize = 150,
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
    if (!text || text.trim().length === 0) {
      setFittedFontSize(16);
      setIsOverflowing(false);
      return;
    }

    const exactEditorFontSize = Math.min(150, Math.max(1, Number(maxFontSize ?? 16)));
    if (isEditorMode) {
      setFittedFontSize(exactEditorFontSize);
      setIsOverflowing(false);
      if (onFitCalculated) {
        onFitCalculated(exactEditorFontSize, false);
      }
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width <= 0 || height <= 0) return;

    const result = calculateAutoFontSize({
      text,
      width,
      height,
      padding: pad,
      fontFamily,
      fontWeight,
      fontStyle,
      maxFontSize: maxFontSize ?? 150,
      minFontSize: minFontSize ?? 1,
      lineHeight,
      letterSpacing,
      multiline,
    });

    setFittedFontSize(result.renderedFontSize);
    setIsOverflowing(result.isOverflowing);

    if (onFitCalculated) {
      onFitCalculated(result.renderedFontSize, result.isOverflowing);
    }
  }, [
    text,
    maxFontSize,
    minFontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    lineHeight,
    letterSpacing,
    multiline,
    pad,
    isEditorMode,
    onFitCalculated,
  ]);

  useLayoutEffect(() => {
    calculateFit();
  }, [calculateFit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      calculateFit();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [calculateFit]);

  const justifyContent =
    textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';

  const showText = Boolean(text && text.trim().length > 0);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={`relative flex items-center ${isEditorMode ? 'overflow-visible' : 'overflow-hidden'} ${className}`}
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
            maxWidth: isEditorMode ? 'none' : '100%',
            maxHeight: isEditorMode ? 'none' : '100%',
            overflow: isEditorMode ? 'visible' : 'hidden',
            textOverflow: 'clip',
          }}
        >
          {text}
        </span>
      )}

      {children}
    </div>
  );
};
