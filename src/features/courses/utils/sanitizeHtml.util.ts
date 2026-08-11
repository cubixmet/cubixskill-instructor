/**
 * HTML Sanitization and Validation Utilities for Rich Text Content
 */

export const sanitizeHtml = (rawHtml: string): string => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    // Remove script, style, and dangerous tags
    const dangerousTags = ['script', 'style', 'object', 'embed', 'form', 'input', 'button'];
    dangerousTags.forEach((tag) => {
      const elements = doc.body.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });

    // Remove event handlers and inline javascript URLs from remaining elements
    const allElements = doc.body.querySelectorAll('*');
    allElements.forEach((el) => {
      // Remove all on* event attributes (onclick, onload, onerror, etc.)
      const attributes = Array.from(el.attributes);
      attributes.forEach((attr) => {
        if (attr.name.toLowerCase().startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });

      // Remove javascript: hrefs
      if (el.tagName === 'A') {
        const href = el.getAttribute('href');
        if (href && href.trim().toLowerCase().startsWith('javascript:')) {
          el.removeAttribute('href');
        }
      }
    });

    return doc.body.innerHTML;
  } catch (_e) {
    // Basic fallback regex cleanup if DOMParser fails
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }
};

/**
 * Checks if HTML content is visually empty (e.g. <p></p>, <p><br></p>, &nbsp;, empty text).
 */
export const isHtmlContentEmpty = (rawHtml: string): boolean => {
  if (!rawHtml || !rawHtml.trim()) return true;

  // Check if there are images, videos, audio, iframe
  if (/<(img|video|audio|iframe)\b/i.test(rawHtml)) {
    return false;
  }

  // Strip all HTML tags
  const text = rawHtml.replace(/<[^>]*>/g, '');

  // Replace &nbsp; and non-breaking spaces with normal spaces
  const cleanText = text.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

  return cleanText.length === 0;
};
