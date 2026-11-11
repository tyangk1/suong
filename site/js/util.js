export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const MOBILE = matchMedia('(max-width: 700px)').matches;
export const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const imgUrl = (name, forceDesktop = false) => `assets/img/${name}${MOBILE && !forceDesktop ? '-m' : ''}.webp`;

/** storage that never throws (private mode, blocked site data) */
const safe = (area) => ({
  get(k) { try { return window[area].getItem(k); } catch { return null; } },
  set(k, v) { try { window[area].setItem(k, v); } catch { /* ignore */ } },
});
export const store = safe('localStorage');
export const session = safe('sessionStorage');

export const vnd = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const SVGNS = 'http://www.w3.org/2000/svg';
export const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};

/** small seeded PRNG so ink blobs land in the same places every visit */
export const rand = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
