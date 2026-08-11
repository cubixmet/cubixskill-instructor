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

    const maxFontSize = el.preferredFontSize || el.fontSize || 36;
    const minFontSize = el.minimumFontSize || 14;

    let fontSize = Math.min(maxFontSize, Math.floor(elH * 0.85));
    ctx.font = `${el.fontWeight || '600'} ${fontSize}px ${el.fontFamily || 'Inter'}, sans-serif`;

    // Scale font size down dynamically if text exceeds container width
    const textWidth = ctx.measureText(text).width;
    if (textWidth > elW && textWidth > 0) {
      fontSize = Math.max(minFontSize, Math.floor(fontSize * (elW / textWidth)));
      ctx.font = `${el.fontWeight || '600'} ${fontSize}px ${el.fontFamily || 'Inter'}, sans-serif`;
    }

    let textX = elX + elW / 2;
    if (el.textAlign === 'left') {
      textX = elX;
      ctx.textAlign = 'left';
    } else if (el.textAlign === 'right') {
      textX = elX + elW;
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'center';
    }

    ctx.fillText(text, textX, elY + elH / 2);
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
