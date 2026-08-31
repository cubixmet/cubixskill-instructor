export interface PaddingConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_TEXT_PADDING: PaddingConfig = {
  top: 1,
  right: 2,
  bottom: 1,
  left: 2,
};

export interface FitTextOptions {
  text: string;
  width: number; // Container width in px
  height: number; // Container height in px
  padding?: Partial<PaddingConfig> | number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  maxFontSize?: number | null; // Saved font size ceiling
  minFontSize?: number | null; // Minimum auto-fit floor (default 1)
  lineHeight?: number;
  letterSpacing?: number;
  multiline?: boolean;
}

export interface FitTextResult {
  renderedFontSize: number;
  fits: boolean;
  isOverflowing: boolean;
  measuredWidth?: number;
  measuredHeight?: number;
}

let cachedCanvasCtx: CanvasRenderingContext2D | null = null;

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof window === 'undefined') return null;
  if (!cachedCanvasCtx) {
    const canvas = document.createElement('canvas');
    cachedCanvasCtx = canvas.getContext('2d');
  }
  return cachedCanvasCtx;
}

export function normalizePadding(padding?: Partial<PaddingConfig> | number): PaddingConfig {
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding };
  }
  return {
    top: padding?.top ?? DEFAULT_TEXT_PADDING.top,
    right: padding?.right ?? DEFAULT_TEXT_PADDING.right,
    bottom: padding?.bottom ?? DEFAULT_TEXT_PADDING.bottom,
    left: padding?.left ?? DEFAULT_TEXT_PADDING.left,
  };
}

/**
 * Calculates whether text at a specific font size fits inside specified available dimensions.
 */
function checkTextFitAtFontSize(
  ctx: CanvasRenderingContext2D,
  fontSize: number,
  options: {
    text: string;
    availableWidth: number;
    availableHeight: number;
    fontFamily: string;
    fontWeight: string | number;
    fontStyle: string;
    letterSpacing: number;
    lineHeight: number;
    multiline: boolean;
  }
): { fits: boolean; measuredWidth: number; measuredHeight: number } {
  const { text, availableWidth, availableHeight, fontFamily, fontWeight, fontStyle, letterSpacing, lineHeight, multiline } = options;

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;

  if (!multiline) {
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width + (text.length > 1 ? (text.length - 1) * letterSpacing : 0);
    let textHeight = fontSize * lineHeight;
    if (typeof metrics.actualBoundingBoxAscent === 'number' && typeof metrics.actualBoundingBoxDescent === 'number') {
      const bboxHeight = Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);
      if (bboxHeight > 0) {
        textHeight = Math.max(textHeight, bboxHeight);
      }
    }
    const fits = textWidth <= availableWidth && textHeight <= availableHeight;
    return { fits, measuredWidth: textWidth, measuredHeight: textHeight };
  }

  // Multiline wrapping fit check
  const words = text.split(/\s+/);
  let lineCount = 1;
  let currentLineWidth = 0;
  let maxLineWidth = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordMetrics = ctx.measureText(word);
    const wordWidth = wordMetrics.width + (word.length > 1 ? (word.length - 1) * letterSpacing : 0);

    if (wordWidth > availableWidth) {
      return { fits: false, measuredWidth: wordWidth, measuredHeight: fontSize * lineHeight };
    }

    if (currentLineWidth === 0) {
      currentLineWidth = wordWidth;
    } else {
      const spaceWidth = ctx.measureText(' ').width;
      if (currentLineWidth + spaceWidth + wordWidth <= availableWidth) {
        currentLineWidth += spaceWidth + wordWidth;
      } else {
        lineCount++;
        currentLineWidth = wordWidth;
      }
    }
    if (currentLineWidth > maxLineWidth) maxLineWidth = currentLineWidth;
  }

  const totalHeight = lineCount * fontSize * lineHeight;
  const fits = totalHeight <= availableHeight;
  return { fits, measuredWidth: maxLineWidth, measuredHeight: totalHeight };
}

/**
 * Calculates automatic font size based on container Width & Height.
 * Finds LARGEST font size where full text fits inside container bounds down to 1px floor.
 */
export function calculateAutoFontSize(options: FitTextOptions): FitTextResult {
  const {
    text,
    width,
    height,
    padding,
    fontFamily = 'Inter',
    fontWeight = '600',
    fontStyle = 'normal',
    maxFontSize = 32,
    minFontSize = 1,
    lineHeight = 1.0,
    letterSpacing = 0,
    multiline = false,
  } = options;

  const pad = normalizePadding(padding);
  const availableWidth = Math.max(1, width - (pad.left + pad.right));
  const availableHeight = Math.max(1, height - (pad.top + pad.bottom));

  const ceilingMax = maxFontSize && maxFontSize > 0 ? maxFontSize : 32;
  const floorMin = minFontSize && minFontSize > 0 ? minFontSize : 1;

  if (!text || text.trim().length === 0 || availableWidth <= 0 || availableHeight <= 0) {
    return {
      renderedFontSize: ceilingMax,
      fits: true,
      isOverflowing: false,
    };
  }

  const ctx = getCanvasContext();
  if (!ctx) {
    return {
      renderedFontSize: ceilingMax,
      fits: true,
      isOverflowing: false,
    };
  }

  let low = Math.max(1, Math.floor(floorMin * 2)); // Sub-pixel precision (0.5px steps)
  let high = Math.floor(ceilingMax * 2);
  let bestFitHalves = low;
  let lastMeasuredW = 0;
  let lastMeasuredH = 0;

  const fitOptions = {
    text,
    availableWidth,
    availableHeight,
    fontFamily,
    fontWeight,
    fontStyle,
    letterSpacing,
    lineHeight,
    multiline,
  };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidateSize = mid / 2;
    const res = checkTextFitAtFontSize(ctx, candidateSize, fitOptions);
    if (res.fits) {
      bestFitHalves = mid;
      lastMeasuredW = res.measuredWidth;
      lastMeasuredH = res.measuredHeight;
      low = mid + 1; // Try larger font size
    } else {
      high = mid - 1; // Try smaller font size
    }
  }

  const bestFontSize = bestFitHalves / 2;
  const finalCheck = checkTextFitAtFontSize(ctx, bestFontSize, fitOptions);
  const isOverflowing = !finalCheck.fits && bestFontSize <= floorMin;
  const renderedFontSize = Math.min(ceilingMax, Math.max(floorMin, bestFontSize));

  return {
    renderedFontSize,
    fits: finalCheck.fits,
    isOverflowing,
    measuredWidth: lastMeasuredW || finalCheck.measuredWidth,
    measuredHeight: lastMeasuredH || finalCheck.measuredHeight,
  };
}

export function fitTextToFixedContainer(options: FitTextOptions): FitTextResult {
  return calculateAutoFontSize(options);
}
