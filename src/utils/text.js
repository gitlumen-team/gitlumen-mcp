export function truncateText(text, max = 4000) {
  if (!text || text.length <= max) return text || '';
  return `${text.slice(0, max)}\n... [truncated ${text.length - max} chars]`;
}

export function safeJson(value) {
  return JSON.stringify(value, null, 2);
}

export function toSlug(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
