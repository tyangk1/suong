// SƯƠNG promo: capture one JPEG sequence per scene on the music grid (fake clock, see lib.mjs).
// usage: node capture.mjs reels|youtube        (always capture the whole cut: scenes depend on page state)
import { open, ensureDir, ease } from './lib.mjs';
import { readFileSync, writeFileSync } from 'node:fs';

const V = process.argv[2] || 'reels';
const TL = JSON.parse(readFileSync(new URL(`./timeline-${V}.json`, import.meta.url)));
const BAR = TL.frames_per_bar;
const R = V === 'reels';
const CFG = R ? { width: 540, height: 960, scale: 2 } : { width: 1920, height: 1080, scale: 1 };
const sc = TL.scenes.reduce((m, [n, a, b]) => ({ ...m, [n]: { start: Math.round(a * BAR), n: Math.round(b * BAR) - Math.round(a * BAR) } }), {});

// ---------- overlay: quiet serif captions + end card ----------
const CSS = `
#cap{position:fixed;inset:0;z-index:999;pointer-events:none}
#cap .c{position:absolute;left:0;right:0;text-align:center;font:italic 400 var(--fs) 'Cormorant Garamond',serif;color:#1C1B19;
  text-shadow:0 0 18px #F3EEE3,0 0 32px #F3EEE3;letter-spacing:.01em}
#cap .end{position:absolute;inset:0;background:url(/assets/img/paper-tile.webp) 0 0/640px,#F3EEE3;background-blend-mode:multiply;display:grid;place-items:center;align-content:center;gap:var(--gap);text-align:center}
#cap .end img{width:var(--sw);height:auto}
#cap .end .w{font:400 var(--ws) 'Cormorant Garamond',serif;letter-spacing:.2em;margin-left:.2em;color:#1C1B19;line-height:1}
#cap .end .t{font:italic 400 var(--ts) 'Cormorant Garamond',serif;color:#4A4843}
#cap .end .d{font:400 var(--ds) 'Be Vietnam Pro',sans-serif;letter-spacing:.14em;color:#1C1B19;border-bottom:1px solid #A8322A;padding-bottom:.3em;margin-top:.4em}
#cap .end .s{font:300 var(--ss) 'Be Vietnam Pro',sans-serif;letter-spacing:.08em;color:#4A4843}
`;
const FS = R ? 34 : 54;
async function overlay(v, html) {
  await v.page.evaluate(([html, css]) => {
    let el = document.getElementById('cap');
    if (!el) { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); el = document.createElement('div'); el.id = 'cap'; document.body.appendChild(el); }
    el.innerHTML = html;
  }, [html, CSS]);
}
/** caption that fades in at frame a and out at frame b (both soft, ~half a bar) */
function caption(f, text, a, b, top) {
  const fade = BAR / 2;
  const o = Math.min(1, Math.max(0, (f - a) / fade)) * Math.min(1, Math.max(0, (b - f) / fade));
  if (o <= 0) return '';
  return `<div class="c" style="--fs:${FS}px;top:${top}%;opacity:${o.toFixed(3)};transform:translateY(${((1 - o) * 10).toFixed(1)}px)">${text}</div>`;
}

const Y = (v, y) => v.page.evaluate((y) => window.__suong.y(y), y);
const elY = (v, sel, off = 0) => v.page.evaluate(([s, o]) => document.querySelector(s).getBoundingClientRect().top + scrollY + o, [sel, off]);
const st = (v, sel) => v.page.evaluate((s) => window.__suong.st(s), sel);
const click = (v, sel) => v.page.evaluate((s) => document.querySelector(s).click(), sel);

async function scene(v, name, fn) {
  if (!sc[name]) return false;
  const dir = `frames/${V}/${name}`;
  await ensureDir(dir);
  await overlay(v, '');
  for (let f = 0; f < sc[name].n; f++) {
    const r = await fn(f, sc[name].n);
    await v.step(r?.dt ?? 1000 / 30);
    await v.shot(`${dir}/${String(f).padStart(4, '0')}.jpg`);
  }
  console.log(name, sc[name].n, 'frames');
  return true;
}

// ---------- go ----------
const v = await open(CFG);
await v.page.waitForFunction(() => document.fonts.status === 'loaded' && [...document.querySelectorAll('.hero img')].filter((i) => i.offsetParent).every((i) => i.complete), null, { timeout: 30000, polling: 100 });
await v.page.evaluate(() => document.fonts.load("italic 400 40px 'Cormorant Garamond'"));
// video framing: the footer fills the screen, so the last shot is only moon, seal and line
await v.page.addStyleTag({ content: '.foot{min-height:100vh;display:flex;flex-direction:column;justify-content:center}' });

// S1: the ink drop falls, blooms, becomes the seal; the loader lifts onto the hero (page time slowed)
{
  const slow = 0.62; // page ms per video ms: the 1.8 s loader stretches over the opening bars
  await scene(v, 's1', async () => ({ dt: 1000 / 30 * slow }));
}
for (let i = 0; i < 90 && await v.page.evaluate(() => !!document.getElementById('loader')); i++) await v.step();

// S2 hero: mist drifts, layers part slowly as the page starts to scroll; desktop gets a mouse sway + steam
{
  const end = R ? 120 : 260;
  await scene(v, 's2', async (f, n) => {
    const p = ease.inOut(Math.max(0, (f - n * 0.45) / (n * 0.55)));
    await Y(v, p * end);
    if (!R) {
      const x = 760 + Math.sin(f / 26) * 260 + f * 2.2;
      const y = 640 + Math.cos(f / 19) * 70;
      await v.page.mouse.move(x, y);
    }
    await overlay(v, caption(f, 'Hái lúc sương chưa tan', BAR * 0.6, n - 4, R ? 62 : 70));
  });
}

// S3 chapters: Hái → Héo → Sao → Pha soak into the paper
{
  if (!R) {
    const s = await st(v, '.chapters');
    await scene(v, 's3', async (f, n) => {
      // near-linear glide (eased only at the very ends) so every chapter gets its share of the scene
      const x = Math.min(1, f / (n - 10));
      const p = x < 0.06 ? ease.inOut(x / 0.12) * 0.06 : x;
      await Y(v, s.start + 60 + (s.end - s.start - 60) * p);
    });
  } else {
    // phones: stacked chapters reveal as they enter; glide past Hái, Héo, Sao
    const a = await elY(v, '.chapters', 0);
    const b = await elY(v, '.ch:nth-child(3) .ch__text', -260);
    await scene(v, 's3', async (f, n) => { await Y(v, a + (b - a) * ease.inOut(Math.min(1, f / (n - 8)))); });
  }
}

// S4 teas: the first cup pours, then Trà Sen and Ô Long (YouTube: all four)
{
  const top = R ? await elY(v, '.teas__tabs', -36) : await elY(v, '.teas', 70);
  const picks = R ? [['sen', 1.15], ['olong', 2.1]] : [['sen', 1.6], ['shan', 3.0], ['olong', 4.4]];
  await scene(v, 's4', async (f) => {
    if (f === 0) await Y(v, top);
    for (const [id, bar] of picks) if (f === Math.round(bar * BAR)) await click(v, `[data-tea="${id}"]`);
    if (!R) await v.page.mouse.move(1150 + Math.sin(f / 30) * 120, 430 + Math.cos(f / 22) * 60);
    if (!R) await overlay(v, caption(f, 'Bốn vị trà, bốn vùng núi', 4, BAR * 1.4, 90)); // reels: the tabs say it
  });
}

// S5 (youtube) ritual: the brush line draws itself down the four steps
{
  if (sc.s5) {
    // glide from step one to step three, each painting centred in turn
    const a = await elY(v, '.rite__step:nth-child(1)', -230);
    const b = await elY(v, '.rite__step:nth-child(3)', -230);
    await scene(v, 's5', async (f, n) => { await Y(v, a + (b - a) * ease.inOut(Math.min(1, f / (n - 6)))); });
  }
}

// S6 (youtube) tea set: slow drift over the still life
{
  if (sc.s6) {
    const a = await elY(v, '.set', -60);
    await scene(v, 's6', async (f, n) => { await Y(v, a + 70 * ease.inOut(f / n)); });
  }
}

// S8 footer: the moon over the hills, then the end card
{
  const endAt = Math.round(BAR * (R ? 1.1 : 1.6));
  await scene(v, 's8', async (f, n) => {
    if (f === 0) await Y(v, await v.page.evaluate(() => document.documentElement.scrollHeight - innerHeight));
    if (f < endAt) { await overlay(v, ''); return; }
    const a = ease.out(Math.min(1, (f - endAt) / (BAR * 0.6)));
    await overlay(v, `<div class="end" style="opacity:${a.toFixed(3)};--gap:${R ? 14 : 18}px;--sw:${R ? 120 : 150}px;--ws:${R ? 64 : 104}px;--ts:${R ? 26 : 38}px;--ds:${R ? 20 : 26}px;--ss:${R ? 13 : 17}px">
      <img src="/assets/brand/seal-240.webp" alt="">
      <div class="w">SƯƠNG</div>
      <div class="t">Trà của sương sớm</div>
      <div class="d">suong.yan.io.vn</div>
      <div class="s">Đặt trước — sắp mở</div></div>`);
  });
}

await ensureDir(`frames/${V}`);
writeFileSync(`frames/${V}/errors.json`, JSON.stringify(v.errors));
console.log('errors', v.errors.length, v.errors.slice(0, 3));
await v.close();
