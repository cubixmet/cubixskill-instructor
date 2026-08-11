export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  domain: string;
  provider: string;
  resourceType: 'video' | 'audio' | 'document' | 'image' | 'web_link';
  title?: string;
  error?: string;
}

export const normalizeUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  let clean = rawUrl.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean;
};

export const validateResourceUrl = async (
  rawUrl: string
): Promise<UrlValidationResult> => {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isValid: false,
      normalizedUrl: '',
      domain: '',
      provider: 'Unknown',
      resourceType: 'web_link',
      error: 'Please enter a URL.',
    };
  }

  const clean = rawUrl.trim();

  // Reject unsafe protocols
  if (
    clean.toLowerCase().startsWith('javascript:') ||
    clean.toLowerCase().startsWith('data:') ||
    clean.toLowerCase().startsWith('vbscript:')
  ) {
    return {
      isValid: false,
      normalizedUrl: clean,
      domain: '',
      provider: 'Unsafe Protocol',
      resourceType: 'web_link',
      error: 'Unsafe URL protocol. Please use standard http:// or https:// URLs.',
    };
  }

  const normalized = normalizeUrl(clean);

  // Simulate short network delay for realistic check
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const parsed = new URL(normalized);
    const domain = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname.toLowerCase();

    let provider = 'External Web Resource';
    let resourceType: 'video' | 'audio' | 'document' | 'image' | 'web_link' =
      'web_link';

    // Provider / Type Detection
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      provider = 'YouTube Video';
      resourceType = 'video';
    } else if (domain.includes('vimeo.com')) {
      provider = 'Vimeo Video';
      resourceType = 'video';
    } else if (
      domain.includes('drive.google.com') ||
      domain.includes('docs.google.com')
    ) {
      provider = 'Google Drive / Docs';
      resourceType = 'document';
    } else if (domain.includes('figma.com')) {
      provider = 'Figma Resource';
      resourceType = 'document';
    } else if (
      pathname.endsWith('.pdf') ||
      pathname.endsWith('.docx') ||
      pathname.endsWith('.pptx') ||
      pathname.endsWith('.xlsx')
    ) {
      provider = 'Document File';
      resourceType = 'document';
    } else if (
      pathname.endsWith('.mp4') ||
      pathname.endsWith('.webm') ||
      pathname.endsWith('.mov')
    ) {
      provider = 'Video File';
      resourceType = 'video';
    } else if (
      pathname.endsWith('.mp3') ||
      pathname.endsWith('.wav') ||
      pathname.endsWith('.aac')
    ) {
      provider = 'Audio File';
      resourceType = 'audio';
    } else if (
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.webp') ||
      pathname.endsWith('.svg')
    ) {
      provider = 'Image Asset';
      resourceType = 'image';
    }

    return {
      isValid: true,
      normalizedUrl: normalized,
      domain,
      provider,
      resourceType,
      title: `${provider} — ${domain}`,
    };
  } catch {
    return {
      isValid: false,
      normalizedUrl: normalized,
      domain: '',
      provider: 'Invalid URL',
      resourceType: 'web_link',
      error: 'Please enter a valid supported URL starting with https://',
    };
  }
};
