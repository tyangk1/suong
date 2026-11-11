// Checks for the final-review findings (run via Playwright MCP browser_run_code_unsafe, site on :4514).
async (page) => {
  const URL = 'http://localhost:4514/';
  const B = page.context().browser();
  const r = {};
  const ctxOf = (o) => B.newContext({ viewport: { width: 1440, height: 900 }, ...o });

  // T1 reduced motion: all four chapters visible, stacked (not on top of each other)
  {
    const ctx = await ctxOf({ reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(URL); await p.waitForTimeout(1500);
    r.T1_rmChaptersVisible = await p.evaluate(() => {
      const tops = [...document.querySelectorAll('.ch')].map((c) => c.getBoundingClientRect().top + scrollY);
      const vis = [...document.querySelectorAll('.ch')].every((c) => getComputedStyle(c).visibility === 'visible' && +getComputedStyle(c).opacity === 1);
      return vis && new Set(tops.map(Math.round)).size === 4;
    });
    // T2 small grey text reaches AA: --ink-3 darkened
    r.T2_ink3 = await p.evaluate(() => getComputedStyle(document.querySelector('.teas__origin')).color);
    // T6 vermilion only on seal + pre-order button
    r.T6_hdrCta = await p.evaluate(() => getComputedStyle(document.querySelector('.hdr__cta')).color);
    await ctx.close();
  }
  // T3 a broken module graph must not leave the loader up
  {
    const ctx = await ctxOf({});
    await ctx.route('**/vendor/gsap/index.js', (rt) => rt.fulfill({ status: 404, body: 'nf' }));
    const p = await ctx.newPage();
    await p.goto(URL); await p.waitForTimeout(5000);
    r.T3_loaderFailsafe = await p.evaluate(() => {
      const l = document.getElementById('loader');
      const up = l && getComputedStyle(l).visibility !== 'hidden' && +getComputedStyle(l).opacity > 0;
      return !up && getComputedStyle(document.body).overflowY !== 'hidden';
    });
    await ctx.close();
  }
  // T4 crossing the 700px breakpoint re-builds the layout; no ritual line on phones
  {
    const ctx = await ctxOf({});
    const p = await ctx.newPage();
    await p.goto(URL); await p.waitForTimeout(2800);
    await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(800);
    r.T4_stackedAfterResize = await p.evaluate(() => document.querySelector('.chapters').classList.contains('is-stacked'));
    r.T4_noRiteLineOnPhone = await p.evaluate(() => getComputedStyle(document.querySelector('.rite__line')).display === 'none');
    await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(800);
    r.T4_pinnedAgain = await p.evaluate(() => document.querySelector('.chapters').classList.contains('is-pinned'));
    await ctx.close();
  }
  // T5 the tea photo: after a switch the back image is the new tea and decoded
  {
    const ctx = await ctxOf({});
    const p = await ctx.newPage();
    await p.goto(URL); await p.waitForTimeout(2800);
    await p.evaluate(() => document.querySelector('.teas').scrollIntoView()); await p.waitForTimeout(1200);
    await p.click('[data-tea="shan"]'); await p.waitForTimeout(2200);
    r.T5_backSwapped = await p.evaluate(() => { const b = document.querySelector('.teas__back'); return b.getAttribute('src').includes('tea-shan') && b.complete && b.alt.includes('Shan'); });
    await ctx.close();
  }
  // T7 no Lenis on touch devices (native scrolling)
  {
    const ctx = await B.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(URL); await p.waitForTimeout(2800);
    r.T7_noLenisOnTouch = await p.evaluate(() => !document.documentElement.classList.contains('lenis'));
    await ctx.close();
  }
  // T8 (2026-11-11) no image is stretched: width/height attributes + a CSS width need img{height:auto}.
  // Live RED before the fix: lotus 121×1117 on phones, ritual paintings 420×900, ink drop 90×240.
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const ctx = await ctxOf({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto(URL); await p.waitForTimeout(2800);
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 600) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(100); }
    await p.waitForTimeout(800);
    r[`T8_stretched_${vp.width}`] = await p.evaluate(() => [...document.images]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width && getComputedStyle(i).objectFit !== 'cover')
      .filter((i) => { const b = i.getBoundingClientRect(); return Math.abs((b.width / b.height) / (i.naturalWidth / i.naturalHeight) - 1) > 0.03; })
      .map((i) => i.className));
    await ctx.close();
  }
  return r;
}
