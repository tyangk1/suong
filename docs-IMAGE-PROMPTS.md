# SƯƠNG — prompt ảnh Gemini (26 ảnh)

Lưu **đúng tên file** vào Downloads hoặc `landing-lab/builds/suong/inbox/`. Prompt có 📎 thì đính kèm ảnh đó khi tạo.
Thứ tự nên làm: **C1 trước** (C2–C4 cần đính kèm nó), sau đó tuỳ anh.

## Quy tắc chung
- Mỗi prompt bắt đầu bằng một đoạn STYLE. Dán **nguyên văn** đoạn đó, không viết lại, để cả bộ ảnh trông như cùng một tay vẽ, cùng một buổi chụp.
  - Nhóm A, B, D, F (tranh mực) dùng **STYLE-INK**.
  - Nhóm C, E (ảnh chụp) dùng **STYLE-PHOTO**. Riêng F3 cũng là ảnh chụp, nhưng đã tự có prompt đầy đủ.
- Mỗi ảnh nên tạo 2–3 bản rồi chọn bản đẹp nhất.
- Gemini rất hay **tự thêm chữ Hán, thư pháp hoặc con dấu đỏ** vào tranh thuỷ mặc. Gặp thì tạo lại. Nếu bản đó đẹp quá thì cứ gửi, em tẩy bằng PhotoCraft (giống cách tẩy dấu ✦).
- Nền tranh mực phải **trắng tinh**. Em sẽ chồng tranh lên nền giấy dó bằng chế độ hoà trộn, nên nền trắng sẽ "biến mất" và chỉ còn lại nét mực.
- Nếu app không cho tỉ lệ 21:9 thì dùng 16:9.

### STYLE-INK
```
Traditional East Asian ink wash painting (Vietnamese thủy mặc / sumi-e style): black and grey ink with soft gradations, wet bleeding edges and loose expressive brushwork, generous empty negative space. Painted on pure white paper; the background must be completely plain white (#FFFFFF) with no paper texture, no border, no frame. No text, no calligraphy, no Chinese characters, no red seal stamps, no signature, no watermark.
```

### STYLE-PHOTO
```
Photorealistic still-life photo with a quiet Vietnamese tea-house mood: soft diffused daylight from the left, natural materials (handmade paper, bamboo, unglazed clay, linen), muted warm palette of cream, ink black, sage green and clay brown, shallow depth of field, calm editorial minimalism. No text, no logos, no readable labels, no people.
```

## A. Hero — đồi chè (các lớp chồng lên nhau tạo chiều sâu khi cuộn)
**A1 → `hill-far.png`** · STYLE-INK +
```
Distant layered mountain ridges fading into mist, very pale grey washes only. The mountains sit in the upper half of the frame; the lower half is empty white. Ultra-wide panoramic 21:9.
```
**A2 → `hill-mid.png`** · STYLE-INK +
```
Rolling tea hills with neat curved rows of tea bushes following the contours of the slopes, medium grey ink with a faint sage green wash on the tea rows only. The hills fill the lower 60% of the frame; the top is empty white. Ultra-wide panoramic 21:9.
```
**A3 → `hill-near.png`** · STYLE-INK +
```
Foreground element only: a single tea branch with a few large leaves and two small white tea flowers, entering from the bottom-left corner, bold dark ink strokes. The rest of the frame is empty white. Ultra-wide 21:9.
```
**A4 → `hero-mobile.png`** · STYLE-INK +
```
Vertical composition: misty tea hills with curved rows of tea bushes in the lower third, distant mountain ridges fading into mist in the middle, a large empty white sky above, a small tea branch in the bottom-left corner. Faint sage green wash on the tea rows only. Vertical 9:16.
```

## B. Bốn chương "mực loang" (cuộn tới đâu, mực loang hiện cảnh tới đó)
**B1 → `ch-hai.png`** · STYLE-INK +
```
Hands of a tea picker plucking the top two leaves and a bud from a tea bush, the brim of a Vietnamese conical hat (nón lá) just visible at the top edge, no face shown. Landscape 3:2.
```
**B2 → `ch-heo.png`** · STYLE-INK +
```
Fresh tea leaves spread thinly to wither on a large round woven bamboo tray, seen from above at an angle, a second tray partly visible at the edge. Landscape 3:2.
```
**B3 → `ch-sao.png`** · STYLE-INK +
```
Tea leaves being pan-roasted by hand in a large cast-iron wok over a small wood fire, wisps of steam and smoke rising, only hands and forearms visible, no face. Landscape 3:2.
```
**B4 → `ch-pha.png`** · STYLE-INK +
```
A small round clay teapot pouring a thin stream of tea into a tiny cup, steam rising in long curling wisps. Landscape 3:2.
```

## C. Bốn loại trà (ảnh chụp sản phẩm)
**C1 → `tea-luc.png`** · STYLE-PHOTO +
```
A small rectangular tea package wrapped in plain cream handmade paper, tied with natural hemp string, with a blank cream paper label on the front that has nothing printed on it. It stands on a light linen surface with a few loose, twisted, dried dark-green tea leaves scattered in front. Plain warm off-white background (#F3EEE3). The package is centered and fills 55% of the frame height. Portrait 4:5.
```
**C2 → `tea-sen.png`** 📎 `tea-luc.png`
```
Using the attached photo, keep the exact same package shape, angle, lighting, framing and background. Change only two things: the paper wrap is a pale lotus pink-beige, and instead of the loose leaves there is one dried lotus flower with a few golden lotus stamens beside the package. Photorealistic, no text.
```
**C3 → `tea-shan.png`** 📎 `tea-luc.png`
```
Using the attached photo, keep the exact same package shape, angle, lighting, framing and background. Change only two things: the paper wrap is unbleached brown kraft paper, and the scattered leaves are long twisted Shan Tuyet tea leaves covered in silvery-white down. Photorealistic, no text.
```
**C4 → `tea-olong.png`** 📎 `tea-luc.png`
```
Using the attached photo, keep the exact same package shape, angle, lighting, framing and background. Change only two things: the paper wrap is deep ink-black paper with a cream label, and the scattered leaves are tightly rolled dark-green oolong tea pearls. Photorealistic, no text.
```
**C5 → `leaf-luc.png`** · STYLE-PHOTO +
```
Extreme macro photo of a small heap of thin, twisted, dried dark-green Thai Nguyen green tea leaves on a plain warm off-white background (#F3EEE3), ultra sharp leaf texture. Square 1:1.
```
**C6 → `leaf-sen.png`** · STYLE-PHOTO +
```
Extreme macro photo of dried green tea leaves mixed with golden lotus stamens, on a plain warm off-white background (#F3EEE3), ultra sharp texture. Square 1:1.
```
**C7 → `leaf-shan.png`** · STYLE-PHOTO +
```
Extreme macro photo of long twisted Shan Tuyet tea leaves covered in fine silvery-white down, on a plain warm off-white background (#F3EEE3), ultra sharp texture showing the downy hairs. Square 1:1.
```
**C8 → `leaf-olong.png`** · STYLE-PHOTO +
```
Extreme macro photo of tightly rolled dark-green oolong tea pearls, with one pearl half unfurled, on a plain warm off-white background (#F3EEE3), ultra sharp texture. Square 1:1.
```

## D. Bốn bước pha trà (tranh nhỏ)
**D1 → `rite-1.png`** · STYLE-INK +
```
Hot water poured over a small clay teapot that sits in a shallow bowl, to warm it, steam rising. A small centered vignette with lots of white space around it. Square 1:1.
```
**D2 → `rite-2.png`** · STYLE-INK +
```
A bamboo tea scoop tipping dry tea leaves into a small open clay teapot. A small centered vignette with lots of white space around it. Square 1:1.
```
**D3 → `rite-3.png`** · STYLE-INK +
```
A kettle pouring water from high above into a small clay teapot, a thin graceful arc of water. A small centered vignette with lots of white space around it. Square 1:1.
```
**D4 → `rite-4.png`** · STYLE-INK +
```
Tea being poured into a row of three tiny cups on a low wooden tray, gentle steam. A small centered vignette with lots of white space around it. Square 1:1.
```

## E. Bộ ấm chén
**E1 → `set-still.png`** · STYLE-PHOTO +
```
A low wooden tea tray holding a small unglazed brown clay teapot, three tiny white porcelain cups, a bamboo tea scoop and a sprig of fresh tea leaves, arranged off-center to the right so the left 40% of the frame is empty, soft morning light with long gentle shadows, plain warm off-white wall behind. Landscape 16:9.
```

## F. Chi tiết trang trí
**F1 → `brush-strokes.png`** · STYLE-INK +
```
Three separate horizontal black ink brush strokes stacked vertically with large white gaps between them: one long thin stroke, one thick stroke with a dry-brush texture at its end, and one short curved stroke. Nothing else. Landscape 3:2.
```
**F2 → `ink-splash.png`** · STYLE-INK +
```
Six isolated black ink drops and splatters of different sizes, spread far apart with white space between each one. Nothing else. Square 1:1.
```
**F3 → `paper.png`** (ảnh chụp, không dùng STYLE)
```
Flat, evenly lit top-down scan of handmade Vietnamese dó paper, warm cream color, visible long plant fibers and a subtle uneven texture, no shadows, no objects, no edges; the paper fills the entire frame. Square 1:1.
```
**F4 → `lotus.png`** · STYLE-INK +
```
A single lotus flower and one large lotus leaf on long stems, a faint pink wash on the petals only, everything else in black and grey ink. Portrait 4:5.
```
**F5 → `moon-hills.png`** · STYLE-INK +
```
Night scene: a full moon left as an empty white circle surrounded by soft grey wash, with low misty hills along the bottom edge and slightly darker grey washes in the sky. Ultra-wide 21:9.
```

---
Logo SƯƠNG, con dấu đỏ, ảnh OG và favicon: em vẽ bằng DesignCraft, anh không cần tạo.
