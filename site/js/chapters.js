import gsap from 'gsap';
import { inkReveal } from './ink.js';
import { imgUrl } from './util.js';

/** Hái → Héo → Sao → Pha: each painting soaks into the paper as you scroll.
 *  gsap.matchMedia re-builds the layout when the window crosses a breakpoint (rotation, resize). */
export function initChapters() {
  const section = document.querySelector('.chapters');
  const chs = [...section.querySelectorAll('.ch')];
  const origins = [[0.62, 0.55], [0.4, 0.45], [0.5, 0.65], [0.6, 0.5]];
  const inks = chs.map((ch, i) => inkReveal(ch.querySelector('.ch__art'), {
    src: imgUrl(ch.dataset.img), w: 1500, h: 1000, seed: i + 3, blobs: 5, origin: origins[i],
  }));
  const underline = (ch) => ch.querySelector('.ch__line');
  const text = (ch) => ch.querySelectorAll('.ch__no, h3, p');
  const mode = (m) => {
    section.classList.toggle('is-stacked', m === 'stacked');
    section.classList.toggle('is-pinned', m === 'pinned');
  };

  const mm = gsap.matchMedia();
  mm.add({
    pin: '(min-width: 701px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)',
    stack: '(max-width: 700px) and (prefers-reduced-motion: no-preference), (max-height: 559px) and (prefers-reduced-motion: no-preference)',
    still: '(prefers-reduced-motion: reduce)',
  }, (ctx) => {
    const { pin, stack } = ctx.conditions;
    if (!pin && !stack) { // reduced motion: everything stacked, still and shown
      mode('stacked');
      inks.forEach((k) => k.show());
      return () => inks.forEach((k) => k.tl.progress(0));
    }
    if (stack) {
      mode('stacked');
      chs.forEach((ch, i) => {
        gsap.set(text(ch), { opacity: 0, y: 24 });
        gsap.set(underline(ch), { clipPath: 'inset(0 100% 0 0)' });
        gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 75%', once: true } })
          .to(inks[i].tl, { progress: 1, duration: 1.8, ease: 'none' })
          .to(text(ch), { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out' }, 0.3)
          .to(underline(ch), { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power2.inOut' }, 0.6);
      });
      return () => inks.forEach((k) => k.tl.progress(0));
    }
    mode('pinned');
    chs.forEach((ch, i) => {
      gsap.set(text(ch), { opacity: 0, y: 30 });
      gsap.set(underline(ch), { clipPath: 'inset(0 100% 0 0)' });
      if (i) gsap.set(ch, { autoAlpha: 0 });
    });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top top', end: `+=${chs.length * 110}%`, pin: '.chapters__pin', scrub: 0.8 },
    });
    chs.forEach((ch, i) => {
      const at = i * 1.4;
      if (i) tl.set(ch, { autoAlpha: 1 }, at);
      tl.to(inks[i].tl, { progress: 1, duration: 1 }, at)
        .to(text(ch), { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power1.out' }, at + 0.25)
        .to(underline(ch), { clipPath: 'inset(0 0% 0 0)', duration: 0.35 }, at + 0.45);
      if (i < chs.length - 1) tl.to(ch, { autoAlpha: 0, duration: 0.3 }, at + 1.3); // overlaps the next bloom: never a blank page
    });
    tl.to({}, { duration: 0.3 }); // hold the last chapter a moment before unpinning
    return () => inks.forEach((k) => k.tl.progress(0));
  });
}
