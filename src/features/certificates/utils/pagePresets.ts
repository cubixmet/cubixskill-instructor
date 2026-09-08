export type CertificatePresetKey =
  | 'CERTIFICATE_LANDSCAPE'
  | 'CERTIFICATE_PORTRAIT'
  | 'A4_LANDSCAPE'
  | 'A4_PORTRAIT'
  | 'SQUARE_CERTIFICATE'
  | 'CUSTOM';

export interface CertificatePagePreset {
  key: CertificatePresetKey;
  label: string;
  width: number;
  height: number;
  unit: 'in' | 'mm' | 'cm';
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  backendPageSize: 'A4' | 'LETTER' | 'CUSTOM';
}

export const CERTIFICATE_PAGE_PRESETS: Record<Exclude<CertificatePresetKey, 'CUSTOM'>, CertificatePagePreset> = {
  CERTIFICATE_LANDSCAPE: {
    key: 'CERTIFICATE_LANDSCAPE',
    label: 'Certificate Landscape — 11 × 8.5 in',
    width: 11,
    height: 8.5,
    unit: 'in',
    orientation: 'LANDSCAPE',
    backendPageSize: 'LETTER',
  },
  CERTIFICATE_PORTRAIT: {
    key: 'CERTIFICATE_PORTRAIT',
    label: 'Certificate Portrait — 8.5 × 11 in',
    width: 8.5,
    height: 11,
    unit: 'in',
    orientation: 'PORTRAIT',
    backendPageSize: 'LETTER',
  },
  A4_LANDSCAPE: {
    key: 'A4_LANDSCAPE',
    label: 'A4 Landscape — 297 × 210 mm',
    width: 297,
    height: 210,
    unit: 'mm',
    orientation: 'LANDSCAPE',
    backendPageSize: 'A4',
  },
  A4_PORTRAIT: {
    key: 'A4_PORTRAIT',
    label: 'A4 Portrait — 210 × 297 mm',
    width: 210,
    height: 297,
    unit: 'mm',
    orientation: 'PORTRAIT',
    backendPageSize: 'A4',
  },
  SQUARE_CERTIFICATE: {
    key: 'SQUARE_CERTIFICATE',
    label: 'Square Certificate — 10 × 10 in',
    width: 10,
    height: 10,
    unit: 'in',
    orientation: 'LANDSCAPE',
    backendPageSize: 'CUSTOM',
  },
};

export const CERTIFICATE_PAGE_PRESET_OPTIONS: { key: CertificatePresetKey; label: string }[] = [
  { key: 'CERTIFICATE_LANDSCAPE', label: 'Certificate Landscape — 11 × 8.5 in' },
  { key: 'CERTIFICATE_PORTRAIT', label: 'Certificate Portrait — 8.5 × 11 in' },
  { key: 'A4_LANDSCAPE', label: 'A4 Landscape — 297 × 210 mm' },
  { key: 'A4_PORTRAIT', label: 'A4 Portrait — 210 × 297 mm' },
  { key: 'SQUARE_CERTIFICATE', label: 'Square Certificate — 10 × 10 in' },
  { key: 'CUSTOM', label: 'Custom Dimensions' },
];

export interface ResolvedPageDimensions {
  presetKey: CertificatePresetKey;
  width: number;
  height: number;
  unit: string;
  aspectRatio: number;
  canvasWidthPx: number;
  canvasHeightPx: number;
}

/**
 * Converts physical dimensions (mm, cm, in, px) to inches.
 */
export function convertToInches(val: number, unit: string): number {
  const u = (unit || 'mm').toLowerCase();
  if (u === 'in' || u === 'inch') return val;
  if (u === 'mm') return val / 25.4;
  if (u === 'cm') return val / 2.54;
  if (u === 'px') return val / 96; // 96 DPI CSS standard
  return val / 25.4;
}

/**
 * Resolves the display dimensions and aspect ratio for a given page size selection.
 */
export function resolvePageDimensions(
  pageSize: string,
  orientation: 'LANDSCAPE' | 'PORTRAIT' = 'LANDSCAPE',
  customWidth?: number,
  customHeight?: number,
  customUnit: string = 'MM'
): ResolvedPageDimensions {
  let width = 11;
  let height = 8.5;
  let unit = 'in';
  let presetKey: CertificatePresetKey = 'CERTIFICATE_LANDSCAPE';

  // 1. Preset Match
  if (pageSize in CERTIFICATE_PAGE_PRESETS) {
    presetKey = pageSize as keyof typeof CERTIFICATE_PAGE_PRESETS;
    const preset = CERTIFICATE_PAGE_PRESETS[presetKey];
    width = preset.width;
    height = preset.height;
    unit = preset.unit;
  } else if (pageSize === 'LETTER') {
    if (orientation === 'PORTRAIT') {
      presetKey = 'CERTIFICATE_PORTRAIT';
      width = 8.5;
      height = 11;
    } else {
      presetKey = 'CERTIFICATE_LANDSCAPE';
      width = 11;
      height = 8.5;
    }
    unit = 'in';
  } else if (pageSize === 'A4') {
    if (orientation === 'PORTRAIT') {
      presetKey = 'A4_PORTRAIT';
      width = 210;
      height = 297;
    } else {
      presetKey = 'A4_LANDSCAPE';
      width = 297;
      height = 210;
    }
    unit = 'mm';
  } else if (pageSize === 'CUSTOM') {
    presetKey = 'CUSTOM';
    width = Number(customWidth) > 0 ? Number(customWidth) : 11;
    height = Number(customHeight) > 0 ? Number(customHeight) : 8.5;
    unit = (customUnit || 'MM').toLowerCase();
  }

  // 2. Adjust orientation if explicitly set differently
  let effW = width;
  let effH = height;
  if (presetKey === 'CUSTOM') {
    if (orientation === 'PORTRAIT' && effW > effH) {
      const temp = effW;
      effW = effH;
      effH = temp;
    } else if (orientation === 'LANDSCAPE' && effH > effW) {
      const temp = effW;
      effW = effH;
      effH = temp;
    }
  }

  const aspectRatio = effW / effH;
  const baseCanvasWidth = 1600;
  const canvasWidthPx = baseCanvasWidth;
  const canvasHeightPx = Math.round(baseCanvasWidth / aspectRatio);

  return {
    presetKey,
    width: effW,
    height: effH,
    unit,
    aspectRatio,
    canvasWidthPx,
    canvasHeightPx,
  };
}
