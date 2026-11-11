"""SƯƠNG: work/clean (+ work/raw) -> assets/img/*.webp

- ink paintings: white point 240 -> pure white so multiply on paper leaves only the ink
- set-still: bottom 200 px cropped (content-aware fill invented a tray leg)
- paper: luminance-only fibre texture, made tileable (periodic cross-fade)
- mist: periodic low-pass noise, white with soft alpha, tiles horizontally
- edge-mask: ragged feathered rectangle (alpha) for the photo ink-edge CSS mask
- ink-splash / brush-strokes: split into single drops / strokes with alpha
"""
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEAN = os.path.join(ROOT, 'work', 'clean')
RAW = os.path.join(ROOT, 'work', 'raw')
OUT = os.path.join(ROOT, 'assets', 'img')
os.makedirs(OUT, exist_ok=True)
INK = (28, 27, 25)
rng = np.random.default_rng(7)
rep = []


def save(im, name, width, q=80):
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, name + '.webp')
    if im.mode == 'RGBA':
        im.save(p, 'WEBP', quality=q, alpha_quality=85, method=6)
    else:
        im.convert('RGB').save(p, 'WEBP', quality=q, method=6)
    rep.append((name, os.path.getsize(p)))


def both(im, name, dw, mw, q=80):
    save(im, name, dw, q)
    save(im, name + '-m', mw, q)


def load(n, d=CLEAN):
    return Image.open(os.path.join(d, n + '.png')).convert('RGB')


def whiten(im, wp=240):
    a = np.asarray(im).astype(np.float32)
    a = np.clip(a * (255.0 / wp), 0, 255)
    return Image.fromarray(a.astype(np.uint8))


def lowpass_noise(h, w, cutoff, seed):
    """periodic (tileable) smooth noise in 0..1"""
    r = np.random.default_rng(seed).standard_normal((h, w))
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    f = np.exp(-((fx * w / cutoff[1]) ** 2 + (fy * h / cutoff[0]) ** 2))
    n = np.real(np.fft.ifft2(np.fft.fft2(r) * f))
    return (n - n.min()) / (n.max() - n.min())


def alpha_from_ink(im):
    """white-background ink -> RGBA in the brand ink colour, alpha = darkness"""
    L = np.asarray(im.convert('L')).astype(np.float32)
    a = np.clip((255 - L) * 1.15, 0, 255).astype(np.uint8)
    rgba = np.zeros(L.shape + (4,), np.uint8)
    rgba[..., :3] = INK
    rgba[..., 3] = a
    return Image.fromarray(rgba, 'RGBA')


def split(im, n_keep, prefix, width):
    L = np.asarray(im.convert('L'))
    m = ndimage.binary_dilation(L < 200, iterations=25)
    lab, n = ndimage.label(m)
    objs = ndimage.find_objects(lab)
    sizes = sorted(((int((lab[s] == i + 1).sum()), i, s) for i, s in enumerate(objs)), reverse=True)[:n_keep]
    # order top-to-bottom, left-to-right
    sizes.sort(key=lambda t: (t[2][0].start // 300, t[2][1].start))
    for k, (_, i, s) in enumerate(sizes, 1):
        crop = im.crop((s[1].start, s[0].start, s[1].stop, s[0].stop))
        save(alpha_from_ink(crop), f'{prefix}-{k}', width, 82)


# ---------- ink paintings ----------
ink = {
    'hill-far': (2400, 1100), 'hill-mid': (2400, 1100), 'hill-near': (2400, 1100),
    'hero-mobile': (None, 900), 'moon-hills': (2000, 1000),
    'ch-hai': (1500, 800), 'ch-heo': (1500, 800), 'ch-sao': (1500, 800), 'ch-pha': (1500, 800),
    'rite-1': (900, 600), 'rite-2': (900, 600), 'rite-3': (900, 600), 'rite-4': (900, 600),
    'lotus': (900, 600),
}
for n, (dw, mw) in ink.items():
    im = whiten(load(n))
    if n == 'hero-mobile':
        save(im, n, 1000, 78)
    else:
        both(im, n, dw, mw, 78)

# ---------- photos ----------
for n in ['tea-luc', 'tea-sen', 'tea-shan', 'tea-olong']:
    both(load(n), n, 900, 620, 80)
for n in ['leaf-luc', 'leaf-sen', 'leaf-shan', 'leaf-olong']:
    both(load(n), n, 760, 520, 78)
ss = load('set-still', RAW)
both(ss.crop((0, 0, ss.width, ss.height - 200)), 'set-still', 1900, 960, 78)

# ---------- paper texture (tileable, luminance only) ----------
p = np.asarray(load('paper').convert('L').resize((1024, 1024), Image.LANCZOS)).astype(np.float32)
p = p - ndimage.gaussian_filter(p, 60)  # remove lighting, keep fibres
rolled = np.roll(np.roll(p, 512, 0), 512, 1)
y, x = np.mgrid[0:1024, 0:1024]
w = np.minimum(np.minimum(x, 1023 - x), np.minimum(y, 1023 - y)) / 512.0
w = np.clip(w * 2.2, 0, 1)
t = p * w + rolled * (1 - w)
tex = np.clip(255 + t * 1.6, 0, 255)  # 255 = no change under multiply
tex = np.minimum(tex, 255)
save(Image.fromarray(tex.astype(np.uint8)).convert('RGB'), 'paper-tile', None, 72)

# ---------- mist ----------
n = lowpass_noise(600, 2400, (3.0, 9.0), 3) * 0.7 + lowpass_noise(600, 2400, (6.0, 20.0), 4) * 0.3
yy = np.linspace(-1, 1, 600)[:, None]
fall = np.exp(-(yy / 0.55) ** 2)
a = np.clip((n - 0.35) * 1.8, 0, 1) * fall
rgba = np.zeros((600, 2400, 4), np.uint8)
rgba[..., :3] = (250, 248, 243)
rgba[..., 3] = (a * 235).astype(np.uint8)
save(Image.fromarray(rgba, 'RGBA').resize((1200, 300), Image.LANCZOS), 'mist', None, 60)

# ---------- ragged edge mask for photos ----------
H, W = 1250, 1000
yy, xx = np.mgrid[0:H, 0:W]
d = np.minimum(np.minimum(xx, W - 1 - xx), np.minimum(yy, H - 1 - yy)).astype(np.float32)
nz = lowpass_noise(H, W, (14.0, 14.0), 11) * 0.6 + lowpass_noise(H, W, (60.0, 60.0), 12) * 0.4
field = d + (nz - 0.5) * 70
m = np.clip((field - 40) / 30.0, 0, 1)
m = ndimage.gaussian_filter(m, 2)
mask = np.zeros((H, W, 4), np.uint8)
mask[..., 3] = (m * 255).astype(np.uint8)
save(Image.fromarray(mask, 'RGBA').resize((600, 750), Image.LANCZOS), 'edge-mask', None, 80)

# ---------- drops + strokes ----------
split(whiten(load('ink-splash')), 6, 'drop', 360)
split(whiten(load('brush-strokes')), 3, 'stroke', 600)

tot = sum(s for _, s in rep)
for nme, s in rep:
    print(f'{nme:20s} {s / 1024:7.0f} KB')
print(f'TOTAL {tot / 1048576:.2f} MB, {len(rep)} files')
