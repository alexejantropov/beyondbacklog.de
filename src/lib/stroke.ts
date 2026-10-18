// Hand-drawn pen stroke under a word or phrase (the brand element, decided 17.10.2026 in the
// design canvas): one single stroke, thin on the left, slowly thicker, short taper at the end,
// slightly curved. Rendered as a CSS background so it wraps per line (box-decoration-break: clone).

const STROKE_COLOR = '#9747ff'; // --color-accent

// viewBox 0 0 200 12. Top edge left→right, then bottom edge back.
const STROKE_PATH =
  'M2,8.7 C30,7.8 90,4.6 120,3.3 C135,2.7 150,2.5 160,2.55 C172,2.6 180,3.0 185,3.8 C190,4.6 195,5.6 198,6.1 ' +
  'L198,6.7 C195,6.9 190,7.0 185,7.0 C178,7.05 168,7.05 160,7.05 C140,7.2 100,7.9 60,8.5 C40,8.8 20,9.1 2,9.3 Z';

function strokeSvg(color: string): string {
  const stops = [
    [0, 0.55],
    [0.55, 0.95],
    [0.9, 0.9],
    [1, 0.5],
  ]
    .map(([o, a]) => `<stop offset='${o}' stop-color='${color}' stop-opacity='${a}'/>`)
    .join('');
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 12' preserveAspectRatio='none'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='0'>${stops}</linearGradient></defs><path d='${STROKE_PATH}' fill='url(%23g)'/></svg>`;
}

/** Inline style for the highlighted span (class "stroke" in global.css sets size and position). */
export function strokeStyle(): string {
  const svg = strokeSvg(STROKE_COLOR);
  return `background-image:url("data:image/svg+xml,${encodeURIComponent(svg).replace(/%2523/g, '%23')}")`;
}
