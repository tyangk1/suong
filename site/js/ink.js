import gsap from 'gsap';
import { svgEl, rand } from './util.js';

let uid = 0;

/**
 * Ink-bleed reveal: an <image> masked by circles that grow from a few "drops".
 * The circles pass through turbulence + displacement + blur + alpha contrast,
 * so the edge reads as ink soaking into wet paper, never a clean circle.
 *
 * inkReveal(host, { src, w, h, seed, blobs, origin }) -> { svg, image, tl, show(), setSrc(src) }
 *   tl is a paused timeline 0..1 (scrub it, or play it).
 */
export function inkReveal(host, { src, w = 1500, h = 1000, seed = 1, blobs = 4, origin = [0.5, 0.5], scale = 120 } = {}) {
  const id = `ink${++uid}`;
  const r = rand(seed * 97 + 13);
  const svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid slice', class: 'ink', 'aria-hidden': 'true' });
  const defs = svgEl('defs');
  const filter = svgEl('filter', { id: `${id}f`, filterUnits: 'userSpaceOnUse', x: 0, y: 0, width: w, height: h, 'color-interpolation-filters': 'sRGB' });
  filter.append(
    svgEl('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.011', numOctaves: '3', seed: String(seed), result: 'n' }),
    svgEl('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: String(scale), xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' }),
    svgEl('feGaussianBlur', { in: 'd', stdDeviation: '7', result: 'b' }),
  );
  const ct = svgEl('feComponentTransfer', { in: 'b' });
  ct.append(svgEl('feFuncA', { type: 'linear', slope: '2.6', intercept: '-0.55' }));
  filter.append(ct);

  const mask = svgEl('mask', { id: `${id}m`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: w, height: h });
  const g = svgEl('g', { filter: `url(#${id}f)` });
  const diag = Math.hypot(w, h);
  const circles = [];
  for (let i = 0; i < blobs; i++) {
    // first drop at the origin, the rest scattered around it
    const cx = i === 0 ? origin[0] * w : (origin[0] + (r() - 0.5) * 0.9) * w;
    const cy = i === 0 ? origin[1] * h : (origin[1] + (r() - 0.5) * 0.9) * h;
    const c = svgEl('circle', { cx, cy, r: 0, fill: '#fff' });
    g.append(c);
    circles.push(c);
  }
  mask.append(g);
  defs.append(filter, mask);
  const image = svgEl('image', { href: src, x: 0, y: 0, width: w, height: h, preserveAspectRatio: 'xMidYMid slice' });
  svg.append(defs, image);
  host.append(svg);

  const masked = (on) => (on ? image.setAttribute('mask', `url(#${id}m)`) : image.removeAttribute('mask'));
  masked(true);

  const tl = gsap.timeline({
    paused: true,
    onUpdate() { masked(this.progress() < 0.999); },
  });
  circles.forEach((c, i) => {
    // ink hits wet paper: a fast bloom that slows as it soaks in
    tl.to(c, { attr: { r: diag * (i === 0 ? 0.75 : 0.45) }, duration: 1, ease: 'power2.out' }, i * 0.18);
  });
  // a last flood guarantees full coverage before the mask is dropped
  tl.to(circles[0], { attr: { r: diag * 1.1 }, duration: 0.35, ease: 'none' });

  return {
    svg, image, tl,
    show() { tl.progress(1); masked(false); },
    setSrc(s) { image.setAttribute('href', s); },
  };
}
