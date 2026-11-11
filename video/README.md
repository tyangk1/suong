# SƯƠNG promo video pipeline

Outputs: `out/suong-reels.mp4` (1080×1920, 27.3 s) and `out/suong-youtube.mp4` (1920×1080, 47.8 s), about -13.3 LUFS.

How it differs from the SOLE/LAB and THOCK videos:
- **The pace is slow.** Scenes run 2 to 7 bars, and every cut dissolves through the paper colour, like mist passing. There are no colour blocks, no shake and no stop-motion.
- **Each scene drifts in slowly** (a 3% push over its length). The grade is warm and soft, with fine grain like dó paper.
- **Captions** are italic Cormorant on the paper colour and fade in and out. YouTube shows "Hái lúc sương chưa tan" and "Bốn vị trà, bốn vùng núi"; Reels shows the first one only.
- **The end card** shows the seal, SƯƠNG, "Trà của sương sớm", **suong.yan.io.vn** and "Đặt trước — sắp mở".
- **Audio is music only:** no SFX track.

Music: Pixabay **"Atlas • Vietnam" by Vadim_Makes_Sound (ID 560947)**, with đàn bầu, đàn tranh and sáo trúc. Its page did not show "Content ID Registered" when checked on 2026-11-10.
- It was analysed at 140.79 BPM (about 70 BPM felt), with the downbeat at 0.786 s, which gives 51.139 frames per bar.
- Bars 0–17 are instruments only. The low-end beat comes in at bar 18.
- **Reels** uses bars 0–16, so it has no beat.
- **YouTube** uses bars 0–28: the beat comes in as the ritual brush line starts to draw.
- **Backup** (also no Content ID) in `audio/`: 331music "Morning Mist (Calm Relaxing Ambient)" (ID 583788), if the owner wants no beat at all.
- Music files must not go into a public repo.

Scenes (`timeline-*.json`): s1 loader (ink drop → seal), s2 hero, s3 the four chapters, s4 tea pour, s5 ritual (YouTube), s6 tea set (YouTube), s8 moon footer + end card.

Run (from this folder; the page needs the `?capture=1` hook in `js/main.js`):
```
node capture.mjs reels      # always the whole cut: scenes depend on page state
python edit.py reels        # audio/reels-music.wav + edit-reels.json
"$LOCALAPPDATA/Programs/EffectCraft/effectcraft-cli.exe" run --commands edit-reels.json --empty --save-as reels.ecproj
"$LOCALAPPDATA/Programs/EffectCraft/effectcraft-cli.exe" render --project reels.ecproj --comp reels --out out/suong-reels-raw.mp4 --format h264 --audio on --bitrate 16000
ffmpeg -i out/suong-reels-raw.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.0:LRA=11 -ar 48000 -c:a aac -b:a 192k -movflags +faststart out/suong-reels.mp4
```

Gotchas:
- **The fake clock cannot step backwards.** A scene slows page time by returning `{dt}` from its frame function; s1 uses this to stretch the 1.8 s loader.
- **Chapters looked blank at first.** The ink bloom used to start slowly (`power1.in`), and an eased scroll left the chapters blank for seconds. It is now `power2.out` (ink spreads fast, then soaks in), the chapters overlap their fades, and s3 scrolls almost linearly.
- **Reels captures at 540×960 css**, which gives the phone layout: stacked chapters and `hero-mobile`.
- **During capture the footer is stretched to 100vh,** so the last shot is only the moon, the seal and the line.
