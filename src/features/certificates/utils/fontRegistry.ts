import { certificatesService } from '../../../services/certificates.service';

/**
 * Fetches available certificate fonts from backend API
 */
export async function fetchCertificateFonts(): Promise<CertificateFontItem[]> {
  try {
    const results = await certificatesService.listFonts();
    if (Array.isArray(results) && results.length > 0) {
      return results;
    }
  } catch (_err) {
    // Fallback to static system registry if backend unauthenticated or offline
  }
  return FALLBACK_SYSTEM_FONTS;
}

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

export const FALLBACK_SYSTEM_FONTS: CertificateFontItem[] = [
  {
    id: 'f-inter',
    key: 'inter',
    name: 'Inter',
    family: 'Inter',
    source: 'SYSTEM',
    file_url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3Fwb07KITCgUn8g74g.woff2',
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
    file_url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
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
    file_url: 'https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjB_sA.woff2',
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
    file_url: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXiWtFCc.woff2',
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
    file_url: 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm453WzAwr40suA.woff2',
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
    file_url: 'https://fonts.gstatic.com/s/merriweather/v30/u-440qyqiXiFoYHpQa86YlIz2os.woff2',
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
    file_url: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_RJ3ijvryePtLCAAGWQ.woff2',
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
    file_url: 'https://fonts.gstatic.com/s/cinzel/v19/8vLdf2_mCio6ioHY0955H6Q.woff2',
    font_weight_variants: ['400', '600', '700', '800'],
    is_active: true,
    is_certificate_safe: true,
  },
];

const loadedFontFaces = new Set<string>();

/**
 * Dynamically loads a web font face into the DOM using @font-face injection
 */
export async function loadFontFaceIntoDOM(font: CertificateFontItem): Promise<boolean> {
  if (typeof window === 'undefined' || !font.file_url) return false;

  const fontId = `${font.key}_${font.file_url}`;
  if (loadedFontFaces.has(fontId)) {
    return true;
  }

  try {
    const styleId = `font-face-${font.key}`;
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        @font-face {
          font-family: '${font.family}';
          src: url('${font.file_url}') format('woff2'), url('${font.file_url}') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `;
      document.head.appendChild(styleEl);
    }

    if (document.fonts) {
      await document.fonts.ready;
    }

    loadedFontFaces.add(fontId);
    return true;
  } catch (err) {
    console.warn(`[FontRegistry] Failed to load font face ${font.name}:`, err);
    return false;
  }
}
