// Human-friendly value formatters shared across UI panels.

export function formatDepth(depthFt: number): string {
  return `${depthFt.toFixed(2)} ft`;
}

export function formatProbability(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
