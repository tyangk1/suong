import gsap from 'gsap';
import { RM, FINE, MOBILE } from './util.js';

/** three ink layers drifting apart on scroll, mist thinning out, a faint mouse sway */
export function initHero() {
  const hero = document.querySelector('.hero');
  if (RM) return;
  const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 };
  if (!MOBILE) {
    gsap.to('.l-far', { yPercent: 18, ease: 'none', scrollTrigger: st });
    gsap.to('.l-mid', { yPercent: 8, ease: 'none', scrollTrigger: st });
    gsap.to('.l-near', { yPercent: -22, ease: 'none', scrollTrigger: st });
  } else {
    gsap.to('.hero__mobile', { yPercent: 10, ease: 'none', scrollTrigger: st });
  }
  gsap.to('.hero__copy', { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '70% top' } });
  gsap.to('.mist', { opacity: 0, ease: 'none', scrollTrigger: st });

  if (FINE && !MOBILE) {
    const layers = [['.l-far', 4], ['.l-mid', 8], ['.l-near', 14]].map(([s, k]) => [gsap.quickTo(s, 'x', { duration: 1.6, ease: 'power3' }), k]);
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      layers.forEach(([q, k]) => q(-nx * k * 2));
    });
  }
}
