import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TEAS, byId } from './data.js';
import { inkReveal } from './ink.js';
import { RM, imgUrl, vnd } from './util.js';

const EMPTY = 250; // liquid y when the cup is empty (svg units)
const FULL = 150;  // liquid y when full

/** choose a tea: it pours into the cup in its own liquor colour; the package bleeds in like ink */
export function initTeas() {
  const root = document.querySelector('.teas');
  const tabs = [...root.querySelectorAll('[data-tea]')];
  const back = root.querySelector('.teas__back');
  const front = inkReveal(root.querySelector('.teas__front'), { src: imgUrl(TEAS[0].img), w: 800, h: 1000, seed: 21, blobs: 4, scale: 90 });
  const leaf = root.querySelector('.teas__leaf img');
  const liquid = root.querySelector('#liquid');
  const surface = root.querySelector('#surface');
  const stream = root.querySelector('#stream');
  const len = stream.getTotalLength();
  const level = { y: EMPTY };
  const drawLevel = () => {
    liquid.setAttribute('y', level.y);
    // the bowl narrows toward the bottom: surface ellipse follows its width
    const t = Math.max(0, Math.min(1, (level.y - 120) / 130));
    const rx = 108 * Math.sqrt(Math.max(0, 1 - t * t));
    surface.setAttribute('cy', level.y);
    surface.setAttribute('rx', rx);
    surface.setAttribute('ry', Math.max(0, rx * 0.16));
  };
  gsap.set(stream, { strokeDasharray: len, strokeDashoffset: len });
  drawLevel();

  let current = null;
  let pour = null;
  let swap = null;
  let target = TEAS[0].img;

  const fill = (tea) => {
    root.querySelectorAll('[data-k]').forEach((el) => {
      const k = el.dataset.k;
      el.textContent = k === 'price' ? `${vnd(tea.price50)} / 50 g` : k === 'temp' ? `${tea.temp}°C` : k === 'grams' ? `${tea.grams} g` : tea[k];
    });
    root.dataset.tea = tea.id;
  };

  const pourInto = (tea, animate) => {
    pour?.kill();
    liquid.setAttribute('fill', tea.liquor);
    surface.setAttribute('fill', tea.liquor);
    stream.setAttribute('stroke', tea.liquor);
    if (!animate) {
      level.y = FULL; drawLevel();
      gsap.set(stream, { strokeDashoffset: len });
      return;
    }
    pour = gsap.timeline({ onUpdate: drawLevel })
      .to(level, { y: EMPTY, duration: level.y < EMPTY ? 0.3 : 0, ease: 'power1.in' })
      .fromTo(stream, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.35, ease: 'power1.in' })
      .to(level, { y: FULL, duration: 1.2, ease: 'power1.out' }, '-=0.05')
      .to(stream, { strokeDashoffset: -len, duration: 0.35, ease: 'power1.out' }, '-=0.2');
  };

  const swapPhoto = (tea, animate) => {
    // finish any running swap first so the back image is never stale
    if (swap) { swap.kill(); back.src = imgUrl(target); }
    target = tea.img;
    if (!animate) { back.src = imgUrl(target); front.tl.progress(0); return; }
    front.setSrc(imgUrl(target));
    front.tl.progress(0);
    swap = gsap.to(front.tl, {
      progress: 1, duration: 1.1, ease: 'power1.inOut',
      onComplete() {
        const t = target;
        back.src = imgUrl(t);
        // keep the ink layer up until the new photo is decoded, so the old tea never flashes
        back.decode().catch(() => {}).then(() => { if (target === t) front.tl.progress(0); });
        swap = null;
      },
    });
    gsap.fromTo(leaf, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out', delay: 0.15 });
  };

  const choose = (id, animate = !RM) => {
    const tea = byId(id);
    if (current === tea.id && animate) return;
    current = tea.id;
    tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tea === tea.id)));
    leaf.src = imgUrl(tea.leaf);
    leaf.alt = `Cận cảnh lá ${tea.name}`;
    back.alt = `Gói ${tea.name} SƯƠNG bọc giấy dó, buộc dây gai`;
    fill(tea);
    swapPhoto(tea, animate);
    pourInto(tea, animate);
    window.dispatchEvent(new CustomEvent('suong:tea', { detail: tea }));
  };

  tabs.forEach((b) => b.addEventListener('click', () => choose(b.dataset.tea)));
  root.querySelector('.teas__tabs').addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const i = tabs.findIndex((b) => b.dataset.tea === current);
    const next = tabs[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    choose(next.dataset.tea);
  });
  root.querySelector('.teas__pick').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('suong:pick', { detail: current }));
  });

  // warm the cache so the first switches never reveal an image that is still loading
  addEventListener('load', () => TEAS.forEach((t) => { new Image().src = imgUrl(t.img); new Image().src = imgUrl(t.leaf); }), { once: true });

  // first tea: photo in place, the cup pours the first time the section is seen
  choose(TEAS[0].id, false);
  level.y = EMPTY; drawLevel();
  if (RM) { level.y = FULL; drawLevel(); return; }
  ScrollTrigger.create({ trigger: root, start: 'top 55%', once: true, onEnter: () => pourInto(byId(current), true) });
}
