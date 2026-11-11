"""SƯƠNG promo edit for EffectCraft. usage: python edit.py reels|youtube -> edit-<v>.json
Look: quiet. Cuts dissolve through the paper colour (like mist passing), every scene drifts in
slowly (a 3% push over its length), warm soft grade with fine paper grain.
Audio: the music cut only (fade-out on the tail)."""
import glob
import json
import os
import subprocess
import sys

V = sys.argv[1]
ROOT = os.path.dirname(os.path.abspath(__file__)).replace('\\', '/')
FPS = 30
TL = json.load(open(f'{ROOT}/timeline-{V}.json'))
BAR = TL['frames_per_bar']
W, H = (1080, 1920) if V == 'reels' else (1920, 1080)
PAPER = '#F3EEE3'

# music: video frame 0 = downbeat of track_start_bar; soft fade-in, long fade-out
bar_s = BAR / FPS
start_s = TL['downbeat_s'] + TL['track_start_bar'] * bar_s
dur_s = round(TL['bars'] * BAR) / FPS
fade = TL['fade_out_bars'] * bar_s
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start_s:.4f}', '-t', f'{dur_s:.4f}', '-i', f"{ROOT}/{TL['track']}",
                '-af', f'afade=t=in:d=0.6,afade=t=out:st={dur_s - fade:.3f}:d={fade:.3f}', '-ar', '48000', '-ac', '2',
                f'{ROOT}/audio/{V}-music.wav'], check=True)

cmds = []
def c(cmd, **p): cmds.append({'command': cmd, 'params': p})
def key(layer, path, f, val): c('prop.addKey', layer=layer, path=path, time=round(f / FPS, 5), timeBase='comp', value=val)

scenes, t = [], 0
for name, a, b in TL['scenes']:
    n = len(glob.glob(f'{ROOT}/frames/{V}/{name}/*.jpg'))
    scenes.append((name, t, n)); t += n
TOTAL = t
c('comp.new', name=V, width=W, height=H, frameRate=FPS, duration=round(TOTAL / FPS, 4), background=PAPER, open=True)
item = 2
for name, s, n in scenes:
    c('file.import', paths=[f'{ROOT}/frames/{V}/{name}/0000.jpg'], sequence=True, frameRate=FPS)
    c('project.rename', item=item, name=name); item += 1
c('file.import', paths=[f'{ROOT}/audio/{V}-music.wav'])
c('project.rename', item=item, name='music'); item += 1

for name, s, n in scenes:
    c('layer.addItem', item=name, time=round(s / FPS, 5))
    if name != 's8':  # the end card stays still
        key(name, 'transform/scale', s, [100, 100])
        key(name, 'transform/scale', s + n - 1, [103, 103])

# mist dissolve through paper at every cut except loader → hero (that one is continuous on the page)
for i, (name, s, n) in enumerate(scenes[1:]):
    if name == 's2':
        continue
    m = f'mist{i}'
    c('layer.newSolid', name=m, color=PAPER, width=W, height=H)
    key(m, 'transform/opacity', 0, 0)
    key(m, 'transform/opacity', s - 9, 0)
    key(m, 'transform/opacity', s, 92)
    key(m, 'transform/opacity', s + 12, 0)

# grade: warm and soft, fine grain like dó paper
c('layer.newAdjustment', name='grade')
c('effect.apply', effect='Lumetri Color', layers=['grade'])
c('prop.set', layer='grade', path='effects/#1/basicCorrection/tone/contrast', value=-4)
c('prop.set', layer='grade', path='effects/#1/creative/adjustments/vibrance', value=-6)
c('effect.apply', effect='Add Grain', layers=['grade'])
c('prop.set', layer='grade', path='effects/#2/tweaking/intensity', value=0.06)

c('layer.addItem', item='music', time=0)
json.dump(cmds, open(f'{ROOT}/edit-{V}.json', 'w'), indent=1)
print(f'edit-{V}.json', len(cmds), 'commands', TOTAL, 'frames', f'{TOTAL / FPS:.2f}s', 'cuts', [s for _, s, _ in scenes])
