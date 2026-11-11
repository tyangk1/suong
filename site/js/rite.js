import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RM } from './util.js';

/** four steps joined by one brush line that draws itself; numbers follow the chosen tea */
export function initRite() {
  const root = document.querySelector('.rite');
  const steps = [...root.querySelectorAll('.rite__step')];
  const svg = root.querySelector('.rite__line');
  const path = svg.querySelector('path');

  window.addEventListener('suong:tea', (e) => {
    const t = e.detail;
    root.querySelectorAll('[data-r]').forEach((el) => {
      const k = el.dataset.r;
      el.textContent = k === 'temp' ? `${t.temp}°C` : k === 'grams' ? `${t.grams} g` : k === 'name' ? t.name : t[k];
    });
  });

  const layout = () => {
    if (getComputedStyle(svg).display === 'none') return 0; // phones: CSS hides the line
    const box = root.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    // the line meanders down the gap between painting and text, never across a painting
    const mid = box.width / 2;
    const pts = steps.map((s, i) => {
      const r = s.querySelector('.rite__img').getBoundingClientRect();
      const sway = 14 * (i % 2 ? -1 : 1);
      return [mid + sway, r.top - box.top + r.height / 2];
    });
    const first = steps[0].querySelector('.rite__img').getBoundingClientRect();
    pts.unshift([mid, first.top - box.top - 40]);
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const my = (y0 + y1) / 2;
      d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`;
    }
    path.setAttribute('d', d);
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    return len;
  };

  if (RM) {
    const draw = () => { layout(); path.style.strokeDashoffset = 0; };
    draw();
    document.fonts.ready.then(draw);
    addEventListener('resize', draw);
    return;
  }

  steps.forEach((s) => {
    gsap.from(s.children, { opacity: 0, y: 30, duration: 0.9, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: s, start: 'top 80%', once: true } });
  });
  let len = layout();
  path.style.strokeDashoffset = len;
  return ScrollTrigger.create({
    trigger: root, start: 'top 70%', end: 'bottom 70%', scrub: 0.5,
    onUpdate: (self) => { path.style.strokeDashoffset = len * (1 - self.progress); },
    onRefresh: (self) => { len = layout(); path.style.strokeDashoffset = len * (1 - self.progress); },
  });
}
