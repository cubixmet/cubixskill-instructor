import { certificatesService } from '../../../services/certificates.service';

export interface CertificateFontItem {
  id: string;
  key: string;
  name: string;
  family: string;
  display_name?: string;
  runtime_family?: string;
  storage_key?: string;
  format?: string;
  weight?: string;
  style?: string;
  size_bytes?: number;
  source: 'SYSTEM' | 'ACADEMY';
  user_rights_confirmed?: boolean;
  file_url?: string;
  font_weight_variants: string[];
  outline_type?: string;
  pdf_compatible?: boolean;
  is_active: boolean;
  is_certificate_safe: boolean;
}

const BACKEND_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export function resolveFontUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
}

export function getRuntimeFontFamily(fontOrId: string | { id?: string; fontId?: string; font_id?: string; source?: 'SYSTEM' | 'ACADEMY'; family?: string }): string {
  if (typeof fontOrId === 'string') {
    if (!fontOrId) return 'Inter';
    if (fontOrId.startsWith('f-') || fontOrId.startsWith('cubix-font-')) {
      return fontOrId.startsWith('cubix-font-') ? fontOrId : fontOrId.replace(/^f-/, '');
    }
    return `cubix-font-${fontOrId}`;
  }

  const fontId = fontOrId.id || fontOrId.fontId || fontOrId.font_id;
  if (fontOrId.source === 'SYSTEM') {
    return fontOrId.family || 'Inter';
  }
  if (fontId) {
    return `cubix-font-${fontId}`;
  }
  return fontOrId.family || 'Inter';
}

export const SYSTEM_FONTS: CertificateFontItem[] = [
  {
    id: 'f-inter',
    key: 'inter',
    name: 'Inter',
    family: 'Inter',
    display_name: 'Inter',
    runtime_family: 'Inter',
    source: 'SYSTEM',
    file_url: 'google_font:Inter:400,500,600,700,800',
    font_weight_variants: ['400', '500', '600', '700', '800'],
    is_active: true,
    is_certificate_safe: true,
  },
  {
    id: 'f-roboto',
    key: 'roboto',
    name: 'Roboto',
    family: 'Roboto',
    display_name: 'Roboto',
    runtime_family: 'Roboto',
    source: 'SYSTEM',
    file_url: 'google_font:Roboto:300,400,500,700',
    font_weight_variants: ['300', '400', '500', '700'],
    is_active: true,
    is_certificate_safe: true,
  },
  {
    id: 'f-open-sans',
    key: 'open_sans',
    name: 'Open Sans',
    family: 'Open Sans',
    display_name: 'Open Sans',
    runtime_family: 'Open Sans',
    source: 'SYSTEM',
    file_url: 'google_font:Open+Sans:400,600,700',
    font_weight_variants: ['400', '600', '700'],
    is_active: true,
    is_certificate_safe: true,
  },
  {
    id: 'f-lato',
    key: 'lato',
    name: 'Lato',
    family: 'Lato',
    display_name: 'Lato',
    runtime_family: 'Lato',
    source: 'SYSTEM',
    file_url: 'google_font:Lato:300,400,700',
    font_weight_variants: ['300', '400', '700'],
    is_active: true,
    is_certificate_safe: true,
  },
  {
    id: 'f-montserrat',
    key: 'montserrat',
    name: 'Montserrat',
    family: 'Montserrat',
    display_name: 'Montserrat',
    runtime_family: 'Montserrat',
    source: 'SYSTEM',
    file_url: 'google_font:Montserrat:400,500,600,700,800',
    font_weight_variants: ['400', '500', '600', '700', '800'],
    is_active: true,
    is_certificate_safe: true,
  },
  {
    id: 'f-merriweather',
    key: 'merriweather',
    name: 'Merriweather',
    family: 'Merriweather',
    display_name: 'Merriweather',
    runtime_family: 'Merriweather',
    source: 'SYSTEM',
    file_url: 'google_font:Merriweather:300,400,700',
    font_weight_variants: ['300', '400', '700'],
    is_active: true,
    is_certificate_safe: true,
  },
  {
    id: 'f-playfair-display',
    key: 'playfair_display',
    name: 'Playfair Display',
    family: 'Playfair Display',
    display_name: 'Playfair Display',
    runtime_family: 'Playfair Display',
    source: 'SYSTEM',
    file_url: 'google_font:Playfair+Display:400,600,700,800',
    font_weight_variants: ['400', '600', '700', '800'],
    is_active: true,
    is_certificate_safe: true,
  },
  {
    id: 'f-cinzel',
    key: 'cinzel',
    name: 'Cinzel',
    family: 'Cinzel',
    display_name: 'Cinzel',
    runtime_family: 'Cinzel',
    source: 'SYSTEM',
    file_url: 'google_font:Cinzel:400,600,700,800',
    font_weight_variants: ['400', '600', '700', '800'],
    is_active: true,
    is_certificate_safe: true,
  },
];

export const FALLBACK_SYSTEM_FONTS = SYSTEM_FONTS;

/**
 * Fetches available certificate fonts from backend API and deduplicates by id/key
 */
export async function fetchCertificateFonts(): Promise<CertificateFontItem[]> {
  const fontMap = new Map<string, CertificateFontItem>();

  // Always seed system fonts
  SYSTEM_FONTS.forEach((f) => fontMap.set(f.id, f));

  try {
    const results = await certificatesService.listFonts();
    if (Array.isArray(results)) {
      results.forEach((item: any) => {
        if (!item || !item.id) return;
        const fontIdStr = String(item.id);
        const sourceVal = item.source || 'ACADEMY';
        const runtimeFam = sourceVal === 'ACADEMY' ? `cubix-font-${fontIdStr}` : (item.family || item.name || 'Custom Font');

        const fontObj: CertificateFontItem = {
          id: fontIdStr,
          key: item.key || `cubix-font-${fontIdStr}`,
          name: item.name || item.display_name || item.family || 'Custom Font',
          family: runtimeFam,
          display_name: item.display_name || item.name || item.family || 'Custom Font',
          runtime_family: runtimeFam,
          storage_key: item.storage_key,
          format: item.format,
          weight: item.weight || '400',
          style: item.style || 'normal',
          size_bytes: item.size_bytes,
          source: sourceVal,
          user_rights_confirmed: item.user_rights_confirmed,
          file_url: item.file_url,
          font_weight_variants: item.font_weight_variants || ['400', '700'],
          is_active: item.is_active ?? true,
          is_certificate_safe: item.is_certificate_safe ?? true,
        };

        // For system fonts from backend, normalize file_url if stale
        if (fontObj.source === 'SYSTEM') {
          const matched = SYSTEM_FONTS.find((sf) => sf.key === fontObj.key || sf.family.toLowerCase() === fontObj.family.toLowerCase());
          if (matched) {
            fontObj.file_url = matched.file_url;
            fontMap.set(matched.id, fontObj);
            return;
          }
        }
        fontMap.set(fontObj.id, fontObj);
      });
    }
  } catch (_err) {
    // Fallback to static system fonts if API call fails
  }

  return Array.from(fontMap.values());
}

const loadedFontFaces = new Map<string, Promise<boolean>>();
const loadedGoogleFonts = new Set<string>();

/**
 * Dynamically loads a web font face into the DOM using FontFace API or Google Fonts API
 */
export async function loadFontFaceIntoDOM(font: CertificateFontItem): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Case A: Google Fonts / System Fonts
  if (font.file_url?.startsWith('google_font:') || font.source === 'SYSTEM') {
    const familyName = font.family || font.name;
    if (loadedGoogleFonts.has(familyName)) return true;

    try {
      const linkId = `google-font-${font.key || familyName.toLowerCase().replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const encodedFamily = encodeURIComponent(familyName);
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@300;400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
      }
      if (document.fonts) {
        await document.fonts.ready;
      }
      loadedGoogleFonts.add(familyName);
      return true;
    } catch (_e) {
      return false;
    }
  }

  // Case B: Uploaded Custom Fonts - MUST use canonical runtimeFamily `cubix-font-${font.id}`
  const absoluteUrl = resolveFontUrl(font.file_url);
  if (!absoluteUrl) return false;

  const runtimeFamily = `cubix-font-${font.id}`;
  const cacheKey = font.id || runtimeFamily;

  if (loadedFontFaces.has(cacheKey)) {
    return loadedFontFaces.get(cacheKey)!;
  }

  const loadPromise = (async () => {
    try {
      const fontFace = new FontFace(
        runtimeFamily,
        `url("${absoluteUrl}")`,
        {
          weight: font.weight || '400',
          style: font.style || 'normal',
        }
      );
      const loadedFace = await fontFace.load();
      (document.fonts as any).add(loadedFace);
      await document.fonts.ready;
      return true;
    } catch (err) {
      console.warn(`[FontRegistry] Failed to load font ${runtimeFamily}:`, err);
      return false;
    }
  })();

  loadedFontFaces.set(cacheKey, loadPromise);
  return loadPromise;
}


