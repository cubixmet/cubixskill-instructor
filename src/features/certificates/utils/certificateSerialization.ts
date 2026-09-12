import type { CanvasElement } from '../../../types/certificate.types';
import type { CertificateTemplateData } from '../../../services/certificates.service';
import type { CertificateFontItem } from './fontRegistry';

export interface BuilderStageState {
  templateName: string;
  description: string;
  pageSize: string;
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  customWidth?: number;
  customHeight?: number;
  customUnit?: 'MM' | 'CM' | 'INCH';
  backgroundImageUrl: string;
  backgroundAssetId?: string | null;
  bgFit?: any;
  bgPosition?: any;
  bgOpacity?: number;
  bgColor?: string;
  elements: CanvasElement[];
  selectedCourseId?: string;
  requiredStudentFields?: string[];
  availableFonts?: CertificateFontItem[];
  isEditMode?: boolean;
  existingTemplateDetail?: any;
}

/**
 * Serializes current builder stage state into canonical API payload without recalculating layout.
 */
export function serializeCertificateTemplate(
  state: BuilderStageState
): Partial<CertificateTemplateData> {
  const normalizedElements = state.elements.map((el) => {
    const fontObj = state.availableFonts?.find(
      (f) =>
        f.id === el.fontId ||
        f.id === el.font_id ||
        f.key === el.fontKey ||
        f.key === el.font_key ||
        f.family === el.fontFamily ||
        f.family === el.font_family
    );

    const fontIdVal = el.fontId ?? el.font_id ?? fontObj?.id ?? null;
    const fontKeyVal = el.fontKey ?? el.font_key ?? fontObj?.key ?? (fontIdVal ? `cubix-font-${fontIdVal}` : null);

    let runtimeFamily = el.fontFamily ?? el.font_family ?? fontObj?.family ?? 'Inter';
    if (fontObj?.source === 'ACADEMY' || fontIdVal) {
      runtimeFamily = `cubix-font-${fontIdVal}`;
    }

    const fontVal = el.fontSize ?? el.font_size ?? 16;
    const maxFontVal = el.maxFontSize ?? el.max_font_size ?? fontVal;
    const minFontVal = el.minFontSize ?? el.min_font_size ?? 1;
    const autoFitVal = el.autoFit ?? el.auto_fit ?? true;
    const allowGrowVal = el.allowGrow ?? el.allow_grow ?? false;

    const fontColorVal = el.color ?? el.fontColor ?? '#0F172A';
    const fontWeightVal = el.fontWeight ?? el.font_weight ?? '400';
    const fontStyleVal = el.fontStyle ?? el.font_style ?? 'normal';
    const textAlignVal = el.textAlign ?? el.text_align ?? 'center';

    const letterSpacingVal = el.letterSpacing ?? el.letter_spacing ?? 0;
    const lineHeightVal = el.lineHeight ?? el.line_height ?? 1;
    const paddingVal = el.padding ?? { top: 3, right: 4, bottom: 3, left: 4 };

    const rotationVal = el.rotation ?? 0;
    const opacityVal = el.opacity ?? 1;
    const zIndexVal = el.z_index ?? 1;
    const isLockedVal = el.is_locked ?? false;
    const isVisibleVal = el.is_visible ?? true;

    return {
      id: el.id,
      type: el.type,
      binding: el.binding,
      label: el.label,

      x: el.x ?? 0.5,
      y: el.y ?? 0.5,
      width: el.width ?? 0.2,
      height: el.height ?? 0.05,

      fontSize: fontVal,
      font_size: fontVal,

      maxFontSize: maxFontVal,
      max_font_size: maxFontVal,

      minFontSize: minFontVal,
      min_font_size: minFontVal,

      autoFit: autoFitVal,
      auto_fit: autoFitVal,

      allowGrow: allowGrowVal,
      allow_grow: allowGrowVal,

      fontId: fontIdVal,
      font_id: fontIdVal,

      fontKey: fontKeyVal,
      font_key: fontKeyVal,

      fontFamily: runtimeFamily,
      font_family: runtimeFamily,

      fontWeight: fontWeightVal,
      font_weight: fontWeightVal,

      fontStyle: fontStyleVal,
      font_style: fontStyleVal,

      textAlign: textAlignVal,
      text_align: textAlignVal,

      fontColor: fontColorVal,
      color: fontColorVal,

      letterSpacing: letterSpacingVal,
      letter_spacing: letterSpacingVal,

      lineHeight: lineHeightVal,
      line_height: lineHeightVal,

      padding: paddingVal,

      rotation: rotationVal,
      opacity: opacityVal,
      z_index: zIndexVal,

      is_locked: isLockedVal,
      is_visible: isVisibleVal,

      static_text: el.static_text ?? undefined,
      image_url: el.image_url && !/^(data:|blob:)/i.test(el.image_url) ? el.image_url : undefined,
      asset_id: el.asset_id ?? (el as any).assetId ?? null,
      fit: el.fit ?? 'contain',
      prefix: el.prefix ?? undefined,
      suffix: el.suffix ?? undefined,
      multiline: el.multiline ?? false,
    };
  });

  const validBgUrl =
    state.backgroundImageUrl && !/^(data:|blob:)/i.test(state.backgroundImageUrl)
      ? state.backgroundImageUrl
      : '';

  let apiPageSize: 'A4' | 'LETTER' | 'CUSTOM' = 'LETTER';
  let customW = state.customWidth;
  let customH = state.customHeight;
  let customU = state.customUnit ?? 'MM';

  if (state.pageSize === 'A4_LANDSCAPE' || state.pageSize === 'A4_PORTRAIT' || state.pageSize === 'A4') {
    apiPageSize = 'A4';
  } else if (state.pageSize === 'SQUARE_CERTIFICATE' || state.pageSize === 'CUSTOM') {
    apiPageSize = 'CUSTOM';
    if (state.pageSize === 'SQUARE_CERTIFICATE') {
      customW = 10;
      customH = 10;
      customU = 'INCH';
    }
  } else if (state.pageSize === 'LETTER') {
    apiPageSize = 'LETTER';
  } else {
    apiPageSize = 'LETTER';
  }

  const bgFitVal = state.bgFit || 'cover';
  const bgPosVal = state.bgPosition || 'center';
  const bgOpacityVal = typeof state.bgOpacity === 'number' ? state.bgOpacity : 100;
  const bgColorVal = state.bgColor || '#ffffff';

  return {
    name: state.templateName,
    description: state.description ?? '',
    course_id: state.selectedCourseId ?? null,
    page_size: apiPageSize,
    orientation: state.orientation,
    background_media: state.backgroundAssetId ?? null,
    ...(apiPageSize === 'CUSTOM'
      ? {
        custom_width: customW,
        custom_height: customH,
        custom_unit: customU,
      }
      : {}),
    template_data: {
      elements: normalizedElements,
      canvas: { width: 1600, height: 1131 },
      background_image_url: validBgUrl,
      background_asset_id: state.backgroundAssetId ?? null,
      bg_fit: bgFitVal,
      bgFit: bgFitVal,
      bg_position: bgPosVal,
      bgPosition: bgPosVal,
      bg_opacity: bgOpacityVal,
      bgOpacity: bgOpacityVal,
      bg_color: bgColorVal,
      bgColor: bgColorVal,
      background: {
        fit: bgFitVal,
        position: bgPosVal,
        opacity: bgOpacityVal,
        color: bgColorVal,
        url: validBgUrl,
        mediaId: state.backgroundAssetId ?? null,
      },
      required_student_fields: state.requiredStudentFields ?? [],
      selected_course_id: state.selectedCourseId ?? null,
    },
  };
}

/**
 * Deserializes API template data into internal editor stage state.
 */
export function deserializeCertificateTemplate(apiTemplate: CertificateTemplateData): {
  templateName: string;
  description: string;
  pageSize: 'A4' | 'LETTER' | 'CUSTOM';
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  customWidth?: number;
  customHeight?: number;
  customUnit?: 'MM' | 'CM' | 'INCH';
  backgroundImageUrl: string;
  backgroundAssetId?: string | null;
  bgFit?: any;
  bgPosition?: any;
  bgOpacity?: number;
  bgColor?: string;
  elements: CanvasElement[];
  selectedCourseId?: string;
  requiredStudentFields?: string[];
} {
  const templateData = apiTemplate.template_data ?? {};
  const rawElements = Array.isArray(templateData.elements) ? templateData.elements : [];

  const elements: CanvasElement[] = rawElements.map((el: any) => {
    const fontVal = el.fontSize ?? el.font_size ?? el.maxFontSize ?? el.max_font_size ?? 16;
    const maxFontVal = el.maxFontSize ?? el.max_font_size ?? fontVal;
    const minFontVal = el.minFontSize ?? el.min_font_size ?? 1;
    const autoFitVal = el.autoFit ?? el.auto_fit ?? true;
    const allowGrowVal = el.allowGrow ?? el.allow_grow ?? false;

    const fontIdVal = el.fontId ?? el.font_id ?? null;
    let fontFamVal = el.fontFamily ?? el.font_family ?? 'Inter';
    if (fontIdVal && (fontIdVal.length > 20 || fontFamVal.startsWith('cubix-font-'))) {
      fontFamVal = `cubix-font-${fontIdVal}`;
    }

    const fontColorVal = el.color ?? el.fontColor ?? '#0F172A';
    const imageUrlVal = el.image_url && !/^(data:|blob:)/i.test(el.image_url) ? el.image_url : undefined;

    return {
      id: String(el.id || `el-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
      type: el.type || 'text',
      binding: el.binding || '',
      label: el.label || 'Field',

      x: el.x ?? 0.5,
      y: el.y ?? 0.5,
      width: el.width ?? 0.2,
      height: el.height ?? 0.05,

      fontSize: fontVal,
      font_size: fontVal,

      maxFontSize: maxFontVal,
      max_font_size: maxFontVal,

      minFontSize: minFontVal,
      min_font_size: minFontVal,

      autoFit: autoFitVal,
      auto_fit: autoFitVal,

      allowGrow: allowGrowVal,
      allow_grow: allowGrowVal,

      fontId: fontIdVal,
      font_id: fontIdVal,

      fontKey: el.fontKey ?? el.font_key ?? (fontIdVal ? `cubix-font-${fontIdVal}` : undefined),
      font_key: el.fontKey ?? el.font_key ?? (fontIdVal ? `cubix-font-${fontIdVal}` : undefined),

      fontFamily: fontFamVal,
      font_family: fontFamVal,

      fontWeight: el.fontWeight ?? el.font_weight ?? '400',
      font_weight: el.fontWeight ?? el.font_weight ?? '400',

      fontStyle: el.fontStyle ?? el.font_style ?? 'normal',
      font_style: el.fontStyle ?? el.font_style ?? 'normal',

      textAlign: el.textAlign ?? el.text_align ?? 'center',
      text_align: el.textAlign ?? el.text_align ?? 'center',

      color: fontColorVal,
      fontColor: fontColorVal,

      letterSpacing: el.letterSpacing ?? el.letter_spacing ?? 0,
      letter_spacing: el.letterSpacing ?? el.letter_spacing ?? 0,

      lineHeight: el.lineHeight ?? el.line_height ?? 1,
      line_height: el.lineHeight ?? el.line_height ?? 1,

      padding: el.padding ?? { top: 3, right: 4, bottom: 3, left: 4 },

      rotation: el.rotation ?? 0,
      opacity: el.opacity ?? 1,
      z_index: el.z_index ?? 1,

      is_locked: el.is_locked ?? false,
      is_visible: el.is_visible ?? true,

      static_text: el.static_text,
      image_url: imageUrlVal,
      asset_id: el.asset_id ?? el.assetId ?? null,
      assetId: el.asset_id ?? el.assetId ?? null,
      fit: el.fit ?? 'contain',
      prefix: el.prefix,
      suffix: el.suffix,
      multiline: el.multiline ?? false,
    };
  });

  const SYSTEM_QR_ELEMENT: CanvasElement = {
    id: 'system-verification-qr',
    type: 'qr_code',
    binding: 'certificate.verification_url',
    label: 'Verification QR Code',
    x: 0.85,
    y: 0.82,
    width: 0.12,
    height: 0.12,
    is_locked: true,
    is_visible: true,
  };

  const hasQr = elements.some(
    (el) =>
      el.binding === 'certificate.verification_url' ||
      el.type === 'qr_code' ||
      el.id === 'system-verification-qr'
  );

  const finalElements = hasQr ? elements : [...elements, SYSTEM_QR_ELEMENT];

  const rawBg =
    templateData.background_image_url ??
    apiTemplate.background_media_url ??
    (typeof apiTemplate.background_media === 'object'
      ? apiTemplate.background_media?.url ||
      apiTemplate.background_media?.file_url ||
      apiTemplate.background_media?.relative_path ||
      apiTemplate.background_media?.stored_filename
      : null) ??
    '';

  let formattedBg = '';
  if (rawBg && !/^(data:|blob:)/i.test(rawBg)) {
    formattedBg = rawBg.startsWith('/media/') || rawBg.startsWith('http')
      ? rawBg
      : `/media/${rawBg.replace(/^\/+/, '')}`;
  }

  const bgAssetId =
    templateData.background_asset_id ??
    (typeof apiTemplate.background_media === 'object'
      ? apiTemplate.background_media?.id
      : typeof apiTemplate.background_media === 'string'
        ? apiTemplate.background_media
        : null);

  const bgFitVal = templateData.background?.fit ?? templateData.bgFit ?? templateData.bg_fit ?? 'cover';
  const bgPosVal = templateData.background?.position ?? templateData.bgPosition ?? templateData.bg_position ?? 'center';
  const bgOpacityVal = templateData.background?.opacity ?? templateData.bgOpacity ?? templateData.bg_opacity ?? 100;
  const bgColorVal = templateData.background?.color ?? templateData.bgColor ?? templateData.bg_color ?? '#ffffff';

  let resolvedPageSize: 'A4' | 'LETTER' | 'CUSTOM' = 'LETTER';
  const rawOrientation = apiTemplate.orientation ?? 'LANDSCAPE';

  if (apiTemplate.page_size === 'LETTER') {
    resolvedPageSize = 'LETTER';
  } else if (apiTemplate.page_size === 'A4') {
    resolvedPageSize = 'A4';
  } else if (apiTemplate.page_size === 'CUSTOM') {
    resolvedPageSize = 'CUSTOM';
  }

  return {
    templateName: apiTemplate.name ?? 'Custom Certificate Template',
    description: apiTemplate.description ?? '',
    pageSize: resolvedPageSize,
    orientation: rawOrientation,
    customWidth: apiTemplate.custom_width,
    customHeight: apiTemplate.custom_height,
    customUnit: apiTemplate.custom_unit as any,
    backgroundImageUrl: formattedBg,
    backgroundAssetId: bgAssetId ?? null,
    bgFit: bgFitVal,
    bgPosition: bgPosVal,
    bgOpacity: bgOpacityVal,
    bgColor: bgColorVal,
    elements: finalElements,
    selectedCourseId: templateData.selected_course_id,
    requiredStudentFields: templateData.required_student_fields ?? [],
  };
}
