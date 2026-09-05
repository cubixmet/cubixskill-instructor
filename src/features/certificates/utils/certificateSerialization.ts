import type { CanvasElement } from '../pages/CertificateBuilderPage';
import type { CertificateTemplateData } from '../../../services/certificates.service';
import type { CertificateFontItem } from './fontRegistry';

export interface BuilderStageState {
  templateName: string;
  description: string;
  pageSize: 'A4' | 'LETTER' | 'CUSTOM';
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  customWidth?: number;
  customHeight?: number;
  customUnit?: 'MM' | 'CM' | 'INCH';
  backgroundImageUrl: string;
  backgroundAssetId?: string | null;
  elements: CanvasElement[];
  selectedCourseId?: string;
  requiredStudentFields?: string[];
  availableFonts?: CertificateFontItem[];
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

    const fontIdVal = el.font_id ?? el.fontId ?? fontObj?.id ?? null;
    const fontKeyVal = el.font_key ?? el.fontKey ?? fontObj?.key ?? null;

    let runtimeFamily = el.font_family ?? el.fontFamily ?? fontObj?.family ?? 'Inter';
    if (fontObj?.source === 'ACADEMY') {
      runtimeFamily = `cubix-font-${fontObj.id}`;
    }

    const fontVal = el.fontSize ?? el.font_size ?? 16;
    const maxFontVal = el.maxFontSize ?? el.max_font_size ?? fontVal;
    const minFontVal = el.minFontSize ?? el.min_font_size ?? 1;
    const autoFitVal = el.autoFit ?? el.auto_fit ?? true;
    const allowGrowVal = el.allowGrow ?? el.allow_grow ?? false;

    const fontColorVal = el.color ?? el.fontColor ?? '#0F172A';
    const fontWeightVal = el.font_weight ?? el.fontWeight ?? '600';
    const fontStyleVal = el.font_style ?? el.fontStyle ?? 'normal';
    const textAlignVal = el.text_align ?? el.textAlign ?? 'center';

    const letterSpacingVal = el.letter_spacing ?? el.letterSpacing ?? 0;
    const lineHeightVal = el.line_height ?? el.lineHeight ?? 1;
    const paddingVal = el.padding ?? { top: 1, right: 2, bottom: 1, left: 2 };

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

  return {
    name: state.templateName,
    description: state.description ?? '',
    page_size: state.pageSize,
    orientation: state.orientation,
    background_media: state.backgroundAssetId ?? null,
    ...(state.pageSize === 'CUSTOM'
      ? {
          custom_width: state.customWidth,
          custom_height: state.customHeight,
          custom_unit: state.customUnit ?? 'MM',
        }
      : {}),
    template_data: {
      elements: normalizedElements,
      canvas: { width: 1600, height: 1131 },
      background_image_url: validBgUrl,
      background_asset_id: state.backgroundAssetId ?? null,
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

    const fontColorVal = el.color ?? el.fontColor ?? '#0F172A';
    const fontFamVal = el.font_family ?? el.fontFamily ?? 'Inter';

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

      fontId: el.font_id ?? el.fontId ?? null,
      font_id: el.font_id ?? el.fontId ?? null,

      fontKey: el.font_key ?? el.fontKey ?? null,
      font_key: el.font_key ?? el.fontKey ?? null,

      fontFamily: fontFamVal,
      font_family: fontFamVal,

      fontWeight: el.font_weight ?? el.fontWeight ?? '600',
      font_weight: el.font_weight ?? el.fontWeight ?? '600',

      fontStyle: el.font_style ?? el.fontStyle ?? 'normal',
      font_style: el.font_style ?? el.fontStyle ?? 'normal',

      textAlign: el.text_align ?? el.textAlign ?? 'center',
      text_align: el.text_align ?? el.textAlign ?? 'center',

      color: fontColorVal,
      fontColor: fontColorVal,

      letterSpacing: el.letter_spacing ?? el.letterSpacing ?? 0,
      letter_spacing: el.letter_spacing ?? el.letterSpacing ?? 0,

      lineHeight: el.line_height ?? el.lineHeight ?? 1,
      line_height: el.line_height ?? el.lineHeight ?? 1,

      padding: el.padding ?? { top: 1, right: 2, bottom: 1, left: 2 },

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

  return {
    templateName: apiTemplate.name ?? 'Custom Certificate Template',
    description: apiTemplate.description ?? '',
    pageSize: apiTemplate.page_size ?? 'A4',
    orientation: apiTemplate.orientation ?? 'LANDSCAPE',
    customWidth: apiTemplate.custom_width,
    customHeight: apiTemplate.custom_height,
    customUnit: apiTemplate.custom_unit,
    backgroundImageUrl: formattedBg,
    backgroundAssetId: bgAssetId ?? null,
    elements,
    selectedCourseId: templateData.selected_course_id,
    requiredStudentFields: templateData.required_student_fields ?? [],
  };
}
