import { certificatesService } from '../../../services/certificates.service';

export interface CertificateFontItem {
  id: string;
  key: string;
  name: string;
  family: string;
  source: 'SYSTEM' | 'ACADEMY';
  user_rights_confirmed?: boolean;
  file_url?: string;
  font_weight_variants: string[];
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

export const SYSTEM_FONTS: CertificateFontItem[] = [
  {
    id: 'f-inter',
    key: 'inter',
    name: 'Inter',
    family: 'Inter',
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
        const fontObj: CertificateFontItem = {
          id: String(item.id),
          key: item.key || item.id,
          name: item.name || item.family || 'Custom Font',
          family: item.family || item.name || 'Custom Font',
          source: item.source || 'ACADEMY',
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

  // Case B: Uploaded Custom Fonts
  const absoluteUrl = resolveFontUrl(font.file_url);
  if (!absoluteUrl) return false;

  const cacheKey = `${font.id || font.key}_${absoluteUrl}`;
  if (loadedFontFaces.has(cacheKey)) {
    return loadedFontFaces.get(cacheKey)!;
  }

  const loadPromise = (async () => {
    try {
      // Validate content type / binary before FontFace registration
      const response = await fetch(absoluteUrl, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} loading font file`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html') || contentType.includes('application/json')) {
        throw new Error('Received non-font binary response');
      }

      const fontArrayBuffer = await response.arrayBuffer();

      if (typeof FontFace !== 'undefined' && document.fonts) {
        const runtimeFamily = font.source === 'ACADEMY' ? `cubix-font-${font.id}` : font.family;
        const fontFace = new FontFace(runtimeFamily, fontArrayBuffer, {
          weight: font.font_weight_variants?.[0] || 'normal',
          style: 'normal',
        });
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);
        await document.fonts.ready;
        return true;
      }
      return false;
    } catch (err) {
      console.warn(`[FontRegistry] Failed to load font ${font.name}:`, err);
      return false;
    }
  })();

  loadedFontFaces.set(cacheKey, loadPromise);
  return loadPromise;
}


