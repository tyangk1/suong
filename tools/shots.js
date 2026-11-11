// SƯƠNG checks — run with the Playwright MCP `browser_run_code_unsafe` (filename: this file),
// with the site served on http://localhost:4514. Returns a JSON report; every field should read true / [].
async (page) => {
  const URL = 'http://localhost:4514/';
  const B = page.context().browser();
  const report = {};

  // 1) four modes: 0 errors, 0 failed requests, no horizontal overflow, steam only on desktop
  const modes = {
    desktop: { viewport: { width: 1440, height: 900 } },
    mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    desktopRM: { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
    mobileRM: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' },
  };
  for (const [name, opts] of Object.entries(modes)) {
    const ctx = await B.newContext(opts);
    const p = await ctx.newPage();
    const errs = []; const failed = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('requestfailed', (r) => failed.push(r.url()));
    await p.goto(URL);
    await p.waitForTimeout(3500);
    const kb = await p.evaluate(() => Math.round(performance.getEntriesByType('resource').reduce((a, x) => a + x.decodedBodySize, 0) / 1024));
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // jump to the end
    await p.waitForTimeout(2000);
    report[name] = await p.evaluate(() => ({
      noOverflow: document.documentElement.scrollWidth <= innerWidth,
      steam: !!document.querySelector('.steam'),
      chaptersUnmasked: [...document.querySelectorAll('.ch image')].every((i) => !i.hasAttribute('mask')),
      cupFull: document.getElementById('liquid').getAttribute('y') === '150',
    }));
    Object.assign(report[name], { firstLoadKB: kb, errs, failed });
    await ctx.close();
  }

  // 2) interactions with storage blocked
  const ctx = await B.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    const deny = { get() { throw new DOMException('blocked', 'SecurityError'); } };
    Object.defineProperty(window, 'localStorage', deny);
    Object.defineProperty(window, 'sessionStorage', deny);
  });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(URL);
  await p.waitForTimeout(2600);
  await p.evaluate(() => document.querySelector('.teas').scrollIntoView());
  await p.waitForTimeout(1500);
  await p.click('[data-tea="shan"]');
  await p.click('[data-tea="olong"]');
  await p.waitForTimeout(2500);
  const liq = () => p.evaluate(() => document.getElementById('liquid').getAttribute('fill'));
  report.rapidEndsOnLast = (await liq()) === '#B87A3A';
  const want = { luc: '#C9C77E', sen: '#D9C98A', shan: '#D4A55A', olong: '#B87A3A' };
  report.liquorColours = true;
  for (const [id, c] of Object.entries(want)) {
    await p.click(`[data-tea="${id}"]`);
    await p.waitForTimeout(1900);
    if ((await liq()) !== c) report.liquorColours = false;
  }
  await p.click('[data-tea="shan"]');
  await p.click('.teas__pick');
  await p.waitForTimeout(1800);
  await p.click('label:has(input[name=size][value="100"])');
  await p.click('[data-step="1"]');
  report.shan100x2 = (await p.textContent('[data-total]')) === '960.000đ';
  await p.click('.btn-seal');
  report.preorderNote = await p.evaluate(() => !document.getElementById('orderNote').hidden);
  report.storageBlockedErrors = errs;
  await ctx.close();
  return report;
}
