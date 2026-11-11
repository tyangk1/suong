"""SƯƠNG seal, favicons and OG image, drawn in DesignCraft (headless CLI), then aged in PIL.

usage: python tools/logo.py  -> assets/brand/* + assets/og.jpg

DesignCraft ids are deterministic: a shape frame takes 1 id, a text frame 2 (frame + story),
place.load 1, place.drop 1. The first object on a fresh doc gets id 7.
Font: Noto Serif (installed, OFL, full Vietnamese) - Cormorant is web-only here.
"""
import json
import os
import subprocess

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

D = os.path.expandvars(r'%LOCALAPPDATA%\Programs\DesignCraft\designcraft-cli.exe')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))).replace('\\', '/')
SW = {'Seal': '#A8322A', 'Paper': '#FFFFFF', 'Ink': '#1C1B19', 'Grey': '#8C8880'}
SERIF = ('Noto Serif', 'Bold')
PAPER = (243, 238, 227)


class Doc:
    def __init__(self, w, h):
        self.args = ['run', '--cmd', 'file.new=' + json.dumps({'intent': 'web', 'units': 'pixels', 'width': w, 'height': h, 'pages': 1, 'facingPages': False, 'margins': 0})]
        for n, c in SW.items():
            self.cmd('swatch.create', name=n, color=c)
        self.next = 7

    def cmd(self, cid, **p):
        self.args += ['--cmd', f'{cid}=' + json.dumps(p)]

    def shape(self, rect, fill, radius=0):
        self.cmd('frame.create', rect=rect, shape='rectangle', content='unassigned')
        i = self.next; self.next += 1
        self.cmd('object.fill', swatch=fill, ids=[i])
        self.cmd('object.stroke', swatch=fill, weight=0, ids=[i])
        if radius:
            self.cmd('object.cornerOptions', shape='rounded', size=radius, ids=[i])
        return i

    def text(self, rect, s, size, fill='Ink', align='center', font=SERIF, tracking=0):
        self.cmd('frame.create', rect=rect, content='text', text=s)
        i = self.next; self.next += 2
        self.cmd('text.selectStory', frame=i)
        self.cmd('type.char', attrs={'fontFamily': font[0], 'fontStyle': font[1], 'size': size, 'fill': fill, 'tracking': tracking})
        self.cmd({'center': 'type.alignCenter', 'left': 'type.alignLeft', 'right': 'type.alignRight'}[align])
        return i

    def place(self, path, rect):
        self.cmd('place.load', path=path); self.next += 1
        self.cmd('place.drop', x=rect[0], y=rect[1], rect=rect); self.next += 1

    def export(self, path, scale=None):
        if scale:
            self.args += ['--scale', str(scale)]
        self.args += ['--export', path]
        r = subprocess.run([D] + self.args, capture_output=True, text=True)
        if r.returncode:
            print(r.stdout[-800:], r.stderr[-800:])
            raise SystemExit(1)
        print('wrote', path)


def seal(d, x, y, s):
    """square vermilion seal, white inner rule, SƯƠNG carved out in white"""
    d.shape([x, y, x + s, y + s], 'Seal', radius=s * .04)
    k = s * .07
    d.shape([x + k, y + k, x + s - k, y + s - k], 'Paper', radius=s * .02)
    k2 = k + s * .018
    d.shape([x + k2, y + k2, x + s - k2, y + s - k2], 'Seal', radius=s * .02)
    d.text([x, y + s * .26, x + s, y + s * .62], 'SƯƠNG', s * .165, fill='Paper', tracking=0)
    d.text([x, y + s * .64, x + s, y + s * .82], 'TRÀ SỚM', s * .075, fill='Paper', tracking=300)


def age(src, dst, seed=5):
    """key out white, then make it look stamped: ragged edge + paper-grain speckle"""
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    red = np.array([168, 50, 42], np.float32)
    # alpha: how far from white toward the seal red (white text -> transparent)
    dist_white = np.linalg.norm(255 - a, axis=2)
    alpha = np.clip(dist_white / np.linalg.norm(255 - red), 0, 1)
    h, w = alpha.shape
    rng = np.random.default_rng(seed)
    grain = ndimage.gaussian_filter(rng.random((h, w)), 2.2)
    grain = (grain - grain.min()) / (grain.max() - grain.min())
    blot = ndimage.gaussian_filter(rng.random((h, w)), 18)
    blot = (blot - blot.min()) / (blot.max() - blot.min())
    # speckle: small holes where grain is high, more of them in the lighter blots
    holes = grain > (0.80 - blot * 0.12)
    alpha = alpha * np.where(holes, 0.35, 1.0) * (0.78 + 0.22 * (1 - blot))
    # ragged outer edge
    edge = ndimage.gaussian_filter(rng.random((h, w)), 3)
    solid = ndimage.binary_erosion(alpha > 0.5, iterations=3)
    rim = (alpha > 0.5) & ~solid
    alpha[rim & (edge > 0.5)] *= 0.3
    alpha = ndimage.gaussian_filter(alpha, 0.6)
    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = red
    out[..., 3] = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    im = Image.fromarray(out, 'RGBA')
    im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox())
    im.save(dst)
    return im


def main():
    brand = f'{ROOT}/assets/brand'
    os.makedirs(brand, exist_ok=True)
    os.makedirs(f'{ROOT}/work', exist_ok=True)

    d = Doc(600, 600)
    d.shape([0, 0, 600, 600], 'Paper')
    seal(d, 50, 50, 500)
    d.export(f'{ROOT}/work/seal-raw.png', scale=2)
    s = age(f'{ROOT}/work/seal-raw.png', f'{brand}/seal.png')
    s.resize((240, 240), Image.LANCZOS).save(f'{brand}/seal-240.webp', 'WEBP', quality=86, alpha_quality=90, method=6)
    # icons: the full seal is illegible below ~100 px, so tiny sizes get a one-letter seal "S"
    d = Doc(600, 600)
    d.shape([0, 0, 600, 600], 'Paper')
    d.shape([40, 40, 560, 560], 'Seal', radius=40)
    d.shape([82, 82, 518, 518], 'Paper', radius=18)
    d.shape([92, 92, 508, 508], 'Seal', radius=16)
    d.text([40, 95, 560, 520], 'S', 330, fill='Paper')
    d.export(f'{ROOT}/work/mark-raw.png')
    mk = age(f'{ROOT}/work/mark-raw.png', f'{ROOT}/work/mark.png', seed=9)
    for name, size, src in [('icon-512.png', 512, s), ('icon-180.png', 180, mk), ('icon-32.png', 32, mk)]:
        bg = Image.new('RGBA', (size, size), PAPER + (255,))
        m = src.resize((round(size * .88),) * 2, Image.LANCZOS)
        bg.alpha_composite(m, ((size - m.width) // 2,) * 2)
        bg.convert('RGB').save(f'{brand}/{name}')
    Image.open(f'{brand}/icon-180.png').save(f'{brand}/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])

    # OG 1200x630: white doc (multiplied onto paper later) with hills, wordmark, line
    d = Doc(1200, 630)
    d.shape([0, 0, 1200, 630], 'Paper')
    d.place(f'{ROOT}/work/clean/hill-mid.png', [0, 250, 1200, 760])
    d.text([80, 120, 760, 290], 'SƯƠNG', 132, fill='Ink', align='left', font=('Noto Serif', 'Regular'), tracking=120)
    d.text([86, 300, 760, 360], 'Trà của sương sớm', 40, fill='Grey', align='left', font=('Noto Serif', 'Italic'))
    d.export(f'{ROOT}/work/og-raw.png')
    og = np.asarray(Image.open(f'{ROOT}/work/og-raw.png').convert('RGB').resize((1200, 630))).astype(np.float32) / 255
    paper = np.asarray(Image.open(f'{ROOT}/assets/img/paper-tile.webp').convert('RGB').resize((1200, 1200)).crop((0, 0, 1200, 630))).astype(np.float32) / 255
    base = (1 - (1 - paper) * 0.4) * (np.array(PAPER, np.float32) / 255)
    comp = Image.fromarray((og * base * 255).astype(np.uint8)).convert('RGBA')
    st = s.resize((170, 170), Image.LANCZOS)
    comp.alpha_composite(st, (960, 90))
    comp.convert('RGB').save(f'{ROOT}/assets/og.jpg', quality=88)
    print('brand assets in', brand)


if __name__ == '__main__':
    main()
