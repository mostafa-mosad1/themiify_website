// Utility functions

/**
 * Decode HTML entities
 */
export const decodeHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
};

/**
 * Strip HTML tags from a string and normalize whitespace
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  const decoded = decodeHtml(html);
  // Remove HTML tags and normalize whitespace
  return decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Clean and format blog content into clean HTML paragraphs without raw tags or SQL error artifacts
 */
export const cleanAndFormatBlogContent = (raw: string): string => {
  if (!raw) return '';

  let text = raw;

  // 1. If it contains SQL error dump, extract the actual content
  if (text.includes('SQLSTATE[') || text.includes('insert into') || text.includes('Connection: mysql')) {
    const match = text.match(/values\s*\([^,]+,\s*(?:&lt;|<|')?([\s\S]+)/i);
    if (match) {
      text = match[1]
        .replace(/\),\s*[\d\-:\s]+[\s\S]*$/i, '')
        .replace(/,\s*(?:&lt;|<).*$/, '');
    } else {
      text = text.replace(/SQLSTATE\[\d+\]:[^;]+;/gi, '');
    }
  }

  // 2. Decode HTML entities repeatedly
  let prev = '';
  let decoded = text;
  while (prev !== decoded) {
    prev = decoded;
    decoded = decodeHtml(decoded);
  }

  // 3. If it contains HTML elements (like <p>, <div>, <img, <h2>, <ul>, etc.), preserve rich HTML!
  const hasHtml = /<(?:p|div|img|h[1-6]|ul|ol|li|blockquote|pre|code|figure|table|span|a|iframe|video)\b[^>]*>/i.test(decoded);

  if (hasHtml) {
    // Clean any broken tag artifacts (e.g., bare "p style=..." without opening bracket)
    let cleaned = decoded
      .replace(/(?:^|\s)p\s+style="[^"]*">\s*/gi, '')
      .replace(/(?:^|\s)div\s+style="[^"]*">\s*/gi, '');

    // Ensure images have responsive styling and don't overflow
    cleaned = cleaned.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
      if (/class=["']/i.test(attrs)) {
        return match.replace(/class=["']([^"']*)["']/i, 'class="$1 max-w-full h-auto rounded-xl my-4 mx-auto block shadow-sm"');
      }
      return `<img ${attrs} class="max-w-full h-auto rounded-xl my-4 mx-auto block shadow-sm" />`;
    });

    return cleaned;
  }

  // 4. If plain text, convert lines into clean paragraph elements
  const paragraphs = decoded
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) {
    return '';
  }

  return paragraphs
    .map(
      (p) =>
        `<p class="text-[var(--text-primary)] text-sm md:text-base leading-relaxed mb-4 text-right">${p}</p>`
    )
    .join('');
};
