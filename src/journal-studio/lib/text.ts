/** Strip TipTap HTML down to plain text (for search, excerpts, counts). */
export function htmlToText(html: string): string {
  if (!html) return '';
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, ' ');
  const el = document.createElement('div');
  // Block-level tags become spaces so words from adjacent paragraphs don't merge.
  el.innerHTML = html.replace(/<\/(p|h\d|li|blockquote|div)>/gi, ' </$1>').replace(/<br\s*\/?>/gi, ' ');
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function excerpt(html: string, max = 140): string {
  const t = htmlToText(html);
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
}

export function isEmptyHtml(html: string): boolean {
  return htmlToText(html).length === 0;
}

const longDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

export const formatLongDate = (iso: string) => longDate.format(new Date(iso));
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso));
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));

/**
 * Minimal HTML sanitiser for rendering stored rich text. TipTap output is already
 * safe, but stored data can be edited by hand (or, after integration, come from a
 * server), so never inject it unchecked.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return html.replace(/<[^>]*>/g, '');
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const BLOCK = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SVG', 'MATH']);
  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (BLOCK.has(child.tagName.toUpperCase())) { child.remove(); continue; }
      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        if (name.startsWith('on') || (['href', 'src', 'xlink:href'].includes(name) && /^(javascript|data|vbscript):/.test(value))) {
          child.removeAttribute(attr.name);
        }
      }
      walk(child);
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
}
