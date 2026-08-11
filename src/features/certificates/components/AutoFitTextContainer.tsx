import React, { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';

export interface AutoFitTextContainerProps {
  text?: string;
  maxFontSize: number;
  minFontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  isUnderline?: boolean;
  letterSpacing?: number;
  opacity?: number;
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
  maxFontSize,
  minFontSize = 14,
  fontFamily = 'Inter',
  fontWeight = '600',
  fontStyle = 'normal',
  fontColor = '#0F172A',
  textAlign = 'center',
  isUnderline = false,
  letterSpacing = 0,
  opacity = 1,
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
  const [fittedFontSize, setFittedFontSize] = useState<number>(maxFontSize);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);

  const calculateFit = useCallback(() => {
    const container = containerRef.current;
    const textSpan = textRef.current;
    if (!container || !textSpan || !text) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth <= 0 || containerHeight <= 0) return;

    // Start at maxFontSize ceiling or container height ratio
    let size = Math.min(maxFontSize, Math.max(minFontSize, Math.floor(containerHeight * 0.85)));
    textSpan.style.fontSize = `${size}px`;

    const scrollWidth = textSpan.scrollWidth;

    // Scale font size down if text exceeds container width
    if (scrollWidth > containerWidth && scrollWidth > 0) {
      const widthRatio = containerWidth / scrollWidth;
      size = Math.max(minFontSize, Math.floor(size * widthRatio));
      textSpan.style.fontSize = `${size}px`;

      // Iterative step down until text fits or minFontSize floor is reached
      while (textSpan.scrollWidth > container.clientWidth && size > minFontSize) {
        size -= 1;
        textSpan.style.fontSize = `${size}px`;
      }
    }

    const clampedSize = Math.min(maxFontSize, Math.max(minFontSize, size));
    const overflowDetected = textSpan.scrollWidth > container.clientWidth;

    setFittedFontSize(clampedSize);
    setIsOverflowing(overflowDetected);

    if (onFitCalculated) {
      onFitCalculated(clampedSize, overflowDetected);
    }
  }, [maxFontSize, minFontSize, text, onFitCalculated]);

  useLayoutEffect(() => {
    calculateFit();
  }, [
    calculateFit,
    text,
    maxFontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    letterSpacing,
    style?.width,
    style?.height,
  ]);

  // Recalculate dynamically when container resizes or Google fonts finish loading
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
  }, [calculateFit, text, maxFontSize]);

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
        ...style,
      }}
    >
      {showText && (
        <span
          ref={textRef}
          className="whitespace-nowrap inline-block select-none transition-all duration-75"
          style={{
            fontSize: `${fittedFontSize}px`,
            fontFamily,
            fontWeight,
            fontStyle,
            color: fontColor,
            textAlign,
            textDecoration: isUnderline ? 'underline' : 'none',
            letterSpacing: `${letterSpacing}px`,
            lineHeight: 1.1,
            maxWidth: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
          }}
        >
          {text}
        </span>
      )}

      {/* Editor Warning Indicator if text cannot fit even at minFontSize */}
      {isEditorMode && isOverflowing && (
        <div className="absolute -bottom-4 right-0 text-[8px] font-bold px-1 py-0.5 rounded shadow-xs pointer-events-none whitespace-nowrap bg-amber-500 text-white z-40">
          ⚠️ Increase field size to fit
        </div>
      )}
      {children}
    </div>
  );
};
