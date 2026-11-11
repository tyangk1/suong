import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { RM, FINE, imgUrl } from './util.js';
import { initLoader } from './loader.js';
import { initHero } from './hero.js';
import { initChapters } from './chapters.js';
import { initTeas } from './teas.js';
import { initRite } from './rite.js';
import { initOrder } from './order.js';
import { initSteam } from './steam.js';

gsap.registerPlugin(ScrollTrigger);

// ---------- images ----------
document.querySelectorAll('img[data-src]').forEach((img) => {
  img.loading = img.closest('.hero') ? 'eager' : 'lazy';
  img.decoding = 'async';
  img.src = imgUrl(img.dataset.src, img.hasAttribute('data-desktop'));
  img.removeAttribute('data-src');
});

// ---------- smooth scroll (slow, soft) ----------
let lenis = null;
// smooth scroll only for mouse/trackpad: on touch, Lenis' non-passive listeners would hold native scrolling
if (!RM && FINE) {
  lenis = new Lenis({ lerp: 0.08, smoothWheel: true, prevent: () => false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const scrollTo = (el) => {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
};
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href').length < 2) return;
  e.preventDefault();
  scrollTo(document.querySelector(a.getAttribute('href')));
});

// ---------- modules ----------
// one broken module must never leave the page behind the loader
const safely = (name, fn) => { try { fn(); } catch (e) { console.error(`[suong] ${name}`, e); } };
safely('hero', initHero);
safely('chapters', initChapters);
safely('teas', initTeas);
safely('rite', initRite);
safely('order', () => initOrder(scrollTo));
safely('steam', initSteam);
window.__suongReady = true;
initLoader(() => {
  lenis?.start();
  ScrollTrigger.refresh();
});
addEventListener('load', () => ScrollTrigger.refresh());

// header: hide while scrolling down, show on the way up
const hdr = document.querySelector('.hdr');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  hdr.classList.toggle('is-hidden', y > 200 && y > lastY);
  hdr.classList.toggle('is-solid', y > 80);
  lastY = y;
}, { passive: true });

// promo-video capture hook (video/capture.mjs drives the page under a fake clock)
if (new URLSearchParams(location.search).has('capture')) {
  window.__suong = {
    y(y) { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); ScrollTrigger.update(); },
    st: (sel) => {
      const all = ScrollTrigger.getAll().filter((s) => s.trigger && s.trigger.matches(sel));
      const s = all.find((x) => x.pin) || all[0];
      return s ? { start: s.start, end: s.end } : null;
    },
  };
}
