import { CertificateTemplate } from '../../../types/certificate.types';
import { resolveFieldValue } from '../services/certificateFieldResolver';

/**
 * Helper to asynchronously load an image element for 2D canvas drawing.
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Renders a certificate template into a high-resolution PNG Data URL.
 * Preserves alpha transparency for transparent canvas backgrounds and PNG/WebP image elements.
 */
export const generateCertificateImage = async (
  template: CertificateTemplate,
  studentContext?: {
    name?: string;
    studentId?: string;
    email?: string;
    courseName?: string;
    completionDate?: string;
    instructorName?: string;
    overallPercentage?: number;
    grade?: string;
    certificateNumber?: string;
  }
): Promise<string> => {
  const width = template.canvasWidth || 1123;
  const height = template.canvasHeight || 794;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Fill Base Background Color if explicitly set and not transparent
  const bgColor = template.backgroundColor || 'transparent';
  if (bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Background Image Layer if present
  if (template.backgroundUrl) {
    try {
      const bgImg = await loadImage(template.backgroundUrl);
      ctx.save();
      ctx.globalAlpha = template.bgOpacity ?? 1;
      ctx.drawImage(bgImg, 0, 0, width, height);
      ctx.restore();
    } catch (_err) {
      // Fallback
    }
  }

  // Sort elements by layer order (zIndex)
  const sortedElements = [...template.elements].sort(
    (a, b) => (a.zIndex ?? 10) - (b.zIndex ?? 10)
  );

  // 3. Render Canvas Elements (Images, Dynamic Text, QR Code)
  for (const el of sortedElements) {
    const elX = (el.x / 100) * width;
    const elY = (el.y / 100) * height;
    const elW = (el.width / 100) * width;
    const elH = (el.height / 100) * height;

    // Render Image Assets (Preserves PNG/WebP Alpha Transparency)
    if (el.type === 'image' || el.imageUrl) {
      if (el.imageUrl) {
        try {
          const elementImg = await loadImage(el.imageUrl);
          ctx.save();
          ctx.globalAlpha = el.opacity ?? 1;
          ctx.drawImage(elementImg, elX, elY, elW, elH);
          ctx.restore();
        } catch (_err) {
          // Fallback
        }
      }
      continue;
    }

    if (el.type === 'qr_code') {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(elX, elY, elW, elH);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('QR VERIFY', elX + elW / 2, elY + elH / 2);
      ctx.restore();
      continue;
    }

    // Resolve text
    let text = el.text || '';
    if (el.type === 'dynamic_field' || el.placeholderKey) {
      const key = el.fieldKey || el.placeholderKey?.replace(/[{}]/g, '') || '';
      text = resolveFieldValue(key, undefined, studentContext);
    }

    if (!text) continue;

    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;
    ctx.fillStyle = el.fontColor || '#0F172A';
    ctx.textBaseline = 'middle';

    const pad = el.padding || { top: 6, right: 10, bottom: 6, left: 10 };
    const availW = Math.max(1, elW - (pad.left + pad.right));
    const availH = Math.max(1, elH - (pad.top + pad.bottom));

    const maxFontSize = Math.min(150, Math.max(1, el.fontSize ?? el.font_size ?? el.maxFontSize ?? el.max_font_size ?? el.preferredFontSize ?? 56));
    const minFontSize = Math.min(maxFontSize, Math.max(1, el.minFontSize ?? el.min_font_size ?? el.minimumFontSize ?? 1));

    // Calculate binary search fit
    let low = minFontSize;
    let high = maxFontSize;
    let bestFit = low;

    const fontFamily = el.fontFamily || 'Inter';
    const fontWeight = el.fontWeight || '600';

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      ctx.font = `${fontWeight} ${mid}px "${fontFamily}", sans-serif`;
      const w = ctx.measureText(text).width;
      const h = mid * 1.1;

      if (w <= availW && h <= availH) {
        bestFit = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const fittedFontSize = Math.min(maxFontSize, Math.max(minFontSize, bestFit));

    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;
    ctx.fillStyle = el.fontColor || '#0F172A';
    ctx.textBaseline = 'middle';

    // Hard safety clipping path around inner container box
    ctx.beginPath();
    ctx.rect(elX + pad.left, elY + pad.top, availW, availH);
    ctx.clip();

    ctx.font = `${fontWeight} ${fittedFontSize}px "${fontFamily}", sans-serif`;

    let textX = elX + pad.left + availW / 2;
    if (el.textAlign === 'left') {
      textX = elX + pad.left;
      ctx.textAlign = 'left';
    } else if (el.textAlign === 'right') {
      textX = elX + elW - pad.right;
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'center';
    }

    ctx.fillText(text, textX, elY + pad.top + availH / 2);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
};

/**
 * Downloads a generated certificate image as PNG.
 */
export const downloadCertificateAsImage = async (
  template: CertificateTemplate,
  studentName = 'Certificate',
  studentContext?: {
    name?: string;
    studentId?: string;
    email?: string;
    courseName?: string;
    completionDate?: string;
    instructorName?: string;
    overallPercentage?: number;
    grade?: string;
    certificateNumber?: string;
  }
) => {
  const dataUrl = await generateCertificateImage(template, studentContext);
  const link = document.createElement('a');
  link.download = `${studentName.replace(/\s+/g, '_')}_Certificate.png`;
  link.href = dataUrl;
  link.click();
};
