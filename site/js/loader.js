import gsap from 'gsap';
import { RM, session } from './util.js';

/** an ink drop falls, blooms on the paper, and settles into the seal. ≤ 1.8 s, once per session. */
export function initLoader(done) {
  const el = document.getElementById('loader');
  const finish = () => {
    el.remove();
    document.body.classList.remove('is-loading');
    session.set('suong-seen', '1');
    done();
  };
  if (RM || session.get('suong-seen')) { finish(); return; }

  const drop = el.querySelector('.loader__drop');
  const bloom = el.querySelector('.loader__bloom circle');
  const seal = el.querySelector('.loader__seal');
  gsap.timeline({ onComplete: finish })
    .fromTo(drop, { y: -220, scaleY: 1.5, opacity: 1 }, { y: 0, scaleY: 1, duration: 0.45, ease: 'power2.in' })
    .set(drop, { opacity: 0 })
    .fromTo(bloom, { attr: { r: 4 } }, { attr: { r: 120 }, duration: 0.6, ease: 'power2.out' }, '<')
    .fromTo(seal, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }, '-=0.25')
    .to(bloom, { opacity: 0, duration: 0.3 }, '<')
    .to(el, { opacity: 0, duration: 0.35, ease: 'power1.inOut' }, '+=0.15');
}
