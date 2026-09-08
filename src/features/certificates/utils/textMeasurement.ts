export interface PaddingConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_PADDING: PaddingConfig = {
  top: 2,
  right: 4,
  bottom: 2,
  left: 4,
};

let cachedCanvasCtx: CanvasRenderingContext2D | null = null;

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof window === 'undefined') return null;
  if (!cachedCanvasCtx) {
    const canvas = document.createElement('canvas');
    cachedCanvasCtx = canvas.getContext('2d');
  }
  return cachedCanvasCtx;
}

export interface TextMeasureOptions {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  letterSpacing?: number;
  lineHeight?: number;
  padding?: PaddingConfig;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface InitialSizeResult {
  widthPx: number;
  heightPx: number;
  widthPercent: number; // 0 - 100 relative to canvas width
  heightPercent: number; // 0 - 100 relative to canvas height
  padding: PaddingConfig;
}

export function getSampleTextForField(keyOrLabel: string, defaultText?: string): string {
  const lower = (keyOrLabel || '').toLowerCase();

  if (lower.includes('student') && (lower.includes('name') || lower.includes('full'))) return 'Muhammed Ashraf Al Farooqi';
  if (lower.includes('student') && (lower.includes('id') || lower.includes('code'))) return 'STU-2026-9041';
  if (lower.includes('student') && lower.includes('email')) return 'student.ashraf@cubixskill.edu';
  if (lower.includes('student') && lower.includes('phone')) return '+1 (555) 234-5678';

  if (lower.includes('course') && (lower.includes('name') || lower.includes('title'))) return 'React 19 & Fullstack Architecture Masterclass';
  if (lower.includes('course') && lower.includes('code')) return 'CS-ADV-101';

  if (lower.includes('academy') || lower.includes('organization')) return 'CubixSkill Academy of Technology';
  if (lower.includes('instructor')) return 'Dr. Sarah Jenkins';

  if (lower.includes('number') || lower.includes('cert')) return 'CS-2026-8841';
  if (lower.includes('date') || lower.includes('issue') || lower.includes('completion')) return 'August 27, 2026';

  if (lower.includes('progress') || lower.includes('percent')) return '100% Completion';
  if (lower.includes('score') || lower.includes('assessment')) return '98.5 / 100';

  if (defaultText && defaultText.trim().length > 0 && defaultText !== keyOrLabel) return defaultText;

  return keyOrLabel.replace(/[{}]/g, '').replace(/[._-]/g, ' ').trim() || 'Sample Certificate Field';
}

/**
 * Asynchronously measures real text using loaded font metrics and computes initial tight container size
 */
export async function measureTextAsync(options: TextMeasureOptions): Promise<InitialSizeResult> {
  const {
    text,
    fontSize = 16,
    fontFamily = 'Inter',
    fontWeight = '600',
    fontStyle = 'normal',
    letterSpacing = 0,
    lineHeight = 1.0,
    padding = DEFAULT_PADDING,
    canvasWidth = 1600,
    canvasHeight = 1131,
  } = options;

  const sampleString = text && text.trim().length > 0 ? text : 'Sample Certificate Field';

  // 1. Wait for font to load in browser font face set if available
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      const fontSpec = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
      await document.fonts.load(fontSpec, sampleString);
      await document.fonts.ready;
    } catch (_e) {
      // Continue
    }
  }

  // 2. Measure text width & height on 2D canvas context
  const ctx = getCanvasContext();
  let textWidthPx = 0;
  let textHeightPx = 0;

  let glyphHeightPx = 0;
  if (ctx) {
    try {
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
      const metrics = ctx.measureText(sampleString);
      if (metrics && metrics.width > 0) {
        textWidthPx = metrics.width + (sampleString.length > 1 ? (sampleString.length - 1) * letterSpacing : 0);
        if (typeof metrics.actualBoundingBoxAscent === 'number' && typeof metrics.actualBoundingBoxDescent === 'number') {
          const ascent = Math.abs(metrics.actualBoundingBoxAscent);
          const descent = Math.abs(metrics.actualBoundingBoxDescent);
          if (ascent + descent > 0) {
            glyphHeightPx = ascent + descent;
          }
        }
      }
    } catch (_e) {
      // Fallback used
    }
  }

  if (textWidthPx <= 0) {
    textWidthPx = sampleString.length * (fontSize * 0.62);
  }

  const nominalHeight = fontSize * lineHeight;
  textHeightPx = Math.max(nominalHeight, glyphHeightPx);

  const totalWidthPx = textWidthPx + padding.left + padding.right;
  const totalHeightPx = textHeightPx + padding.top + padding.bottom;

  const finalWidthPx = Math.max(1, Math.ceil(totalWidthPx));
  const finalHeightPx = Math.max(1, Math.ceil(totalHeightPx));

  const widthPercent = parseFloat(((finalWidthPx / canvasWidth) * 100).toFixed(4));
  const heightPercent = parseFloat(((finalHeightPx / canvasHeight) * 100).toFixed(4));

  return {
    widthPx: finalWidthPx,
    heightPx: finalHeightPx,
    widthPercent,
    heightPercent,
    padding,
  };
}

/**
 * Synchronous initial size helper
 */
export function calculateTextInitialSize(options: TextMeasureOptions): InitialSizeResult {
  const {
    text,
    fontSize = 16,
    fontFamily = 'Inter',
    fontWeight = '600',
    fontStyle = 'normal',
    letterSpacing = 0,
    lineHeight = 1.0,
    padding = DEFAULT_PADDING,
    canvasWidth = 1600,
    canvasHeight = 1131,
  } = options;

  const sampleString = text && text.trim().length > 0 ? text : 'Sample Certificate Field';
  const ctx = getCanvasContext();
  let textWidthPx = 0;
  let textHeightPx = 0;

  if (ctx) {
    try {
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
      const metrics = ctx.measureText(sampleString);
      if (metrics && metrics.width > 0) {
        textWidthPx = metrics.width + (sampleString.length > 1 ? (sampleString.length - 1) * letterSpacing : 0);
        if (typeof metrics.actualBoundingBoxAscent === 'number' && typeof metrics.actualBoundingBoxDescent === 'number') {
          const ascent = Math.abs(metrics.actualBoundingBoxAscent);
          const descent = Math.abs(metrics.actualBoundingBoxDescent);
          if (ascent + descent > 0) {
            textHeightPx = ascent + descent;
          }
        }
      }
    } catch (_e) {
      // Fallback used
    }
  }

  if (textWidthPx <= 0) {
    textWidthPx = sampleString.length * (fontSize * 0.62);
  }
  if (textHeightPx <= 0) {
    textHeightPx = fontSize * lineHeight;
  }

  const totalWidthPx = textWidthPx + padding.left + padding.right;
  const totalHeightPx = textHeightPx + padding.top + padding.bottom;

  const finalWidthPx = Math.max(1, Math.ceil(totalWidthPx));
  const finalHeightPx = Math.max(1, Math.ceil(totalHeightPx));

  const widthPercent = parseFloat(((finalWidthPx / canvasWidth) * 100).toFixed(4));
  const heightPercent = parseFloat(((finalHeightPx / canvasHeight) * 100).toFixed(4));

  return {
    widthPx: finalWidthPx,
    heightPx: finalHeightPx,
    widthPercent,
    heightPercent,
    padding,
  };
}
