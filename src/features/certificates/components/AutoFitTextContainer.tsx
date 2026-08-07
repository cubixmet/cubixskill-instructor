import React, { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';

export interface AutoFitTextContainerProps {
  text?: string;
  maxFontSize: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  isUnderline?: boolean;
  letterSpacing?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

/**
 * Container-Safe Dynamic Field Auto Font Fit Component.
 * Guarantees dynamic text NEVER overflows outside its assigned container boundaries.
 * - Enforces single-line text (no line breaks / no wrapping).
 * - Uses ResizeObserver and font loading triggers for instant pixel-perfect calculation.
 * - Recalculates dynamically in real-time on value or dimension changes.
 */
export const AutoFitTextContainer: React.FC<AutoFitTextContainerProps> = ({
  text = '',
  maxFontSize,
  fontFamily = 'Inter',
  fontWeight = '600',
  fontStyle = 'normal',
  fontColor = '#0F172A',
  textAlign = 'center',
  isUnderline = false,
  letterSpacing = 0,
  opacity = 1,
  className = '',
  style = {},
  onClick,
  onMouseDown,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fittedFontSize, setFittedFontSize] = useState<number>(maxFontSize);

  const calculateFit = useCallback(() => {
    const container = containerRef.current;
    const textSpan = textRef.current;
    if (!container || !textSpan || !text) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth <= 0 || containerHeight <= 0) return;

    // Calculate candidate font size based on container height (85% container height ceiling)
    let size = Math.min(maxFontSize, Math.max(10, Math.floor(containerHeight * 0.85)));
    textSpan.style.fontSize = `${size}px`;

    const scrollWidth = textSpan.scrollWidth;

    // If text exceeds container width, scale font size down proportionally to fit
    if (scrollWidth > containerWidth && scrollWidth > 0) {
      const widthRatio = containerWidth / scrollWidth;
      size = Math.max(8, Math.floor(size * widthRatio));
      textSpan.style.fontSize = `${size}px`;

      // Iterative step down to strictly guarantee zero container overflow
      while (textSpan.scrollWidth > container.clientWidth && size > 8) {
        size -= 1;
        textSpan.style.fontSize = `${size}px`;
      }
    }

    setFittedFontSize(size);
  }, [maxFontSize, text]);

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
      {children}
    </div>
  );
};
