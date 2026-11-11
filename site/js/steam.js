import { RM, FINE } from './util.js';

/** a few faint wisps of steam rise from the cursor (fine pointers only) */
export function initSteam() {
  if (RM || !FINE) return;
  const c = document.createElement('canvas');
  c.className = 'steam';
  c.setAttribute('aria-hidden', 'true');
  document.body.append(c);
  const ctx = c.getContext('2d');
  const dpr = Math.min(2, devicePixelRatio || 1);
  const fit = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  fit();
  addEventListener('resize', fit);

  const MAX = 40;
  const ps = [];
  let last = 0;
  let raf = 0;
  let px = -1;
  let py = -1;

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    px = e.clientX; py = e.clientY;
    const now = performance.now();
    if (now - last < 45 || ps.length >= MAX) return;
    last = now;
    ps.push({ x: px + (Math.random() - 0.5) * 6, y: py - 6, r: 5 + Math.random() * 4, a: 0.16, vx: (Math.random() - 0.5) * 0.25, ph: Math.random() * 6.28 });
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.ph += 0.05;
      p.x += p.vx + Math.sin(p.ph) * 0.35;
      p.y -= 0.7;
      p.r += 0.28;
      p.a *= 0.972;
      if (p.a < 0.008) { ps.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(140,136,128,${p.a})`);
      g.addColorStop(1, 'rgba(140,136,128,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }
    raf = ps.length && !document.hidden ? requestAnimationFrame(tick) : 0;
    if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
}
