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

  // 3. Remove any broken tag snippets like 'p style="text-align: right;">'
  decoded = decoded.replace(/(?:^|\s)p\s+style="[^"]*">\s*/gi, '');
  decoded = decoded.replace(/(?:^|\s)div\s+style="[^"]*">\s*/gi, '');

  // 4. Convert block tags to line breaks and strip all HTML tags cleanly
  const paragraphText = decoded
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/style="[^"]*"/gi, '')
    .replace(/[<>]/g, '');

  // Split into clean paragraphs
  const paragraphs = paragraphText
    .split(/\n+/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
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
