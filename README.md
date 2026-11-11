# SƯƠNG: trà của sương sớm

Trang chạy tại: **https://suong.yan.io.vn**

Trang giới thiệu một thương hiệu trà tự đặt, theo lối tranh thủy mặc trên giấy dó. Toàn bộ chữ trên trang là tiếng Việt.
- **Mở đầu:** một giọt mực rơi xuống, loang ra trên giấy rồi đọng lại thành con dấu.
- **Đầu trang:** ba lớp núi vẽ mực tách nhau ra khi cuộn trang, có hai dải sương trôi ngang.
- **Bốn chương (Hái → Héo → Sao → Pha):** mỗi bức tranh thấm dần vào giấy khi cuộn. Hiệu ứng dùng mask SVG với feTurbulence và feDisplacementMap.
- **Chọn một chén:** chọn trà nào thì nước rót vào chén mang đúng màu nước trà đó.
- **Pha một ấm:** một nét cọ tự vẽ nối bốn bước pha.
- **Đặt trước:** giá tính theo VND. Trang chưa bán hàng: nút "Đặt trước — sắp mở" chỉ hiện ghi chú, không thu tiền và không gửi dữ liệu đi đâu.

SƯƠNG là thương hiệu tự đặt cho một dự án thiết kế. Tranh và ảnh trên trang được tạo bằng AI.

## Công nghệ
- Trang tĩnh HTML/CSS/JS, nằm trong `site/`.
- Thư viện kèm sẵn trong `site/vendor/`: GSAP 3.12.5 + ScrollTrigger (giấy phép GreenSock Standard) và Lenis 1.1.0 (MIT).
- Font tự host: Cormorant Garamond và Be Vietnam Pro, giấy phép OFL nằm trong `site/assets/fonts/`.
- Trang được phục vụ bằng nginx (`Dockerfile`, `nginx.conf`). Coolify build Dockerfile của repo này và trỏ tên miền vào cổng 80.

## Chạy trên máy
```
docker build -t suong . && docker run --rm -p 8080:80 suong   # http://localhost:8080
```

## Quy trình làm ảnh và video (`tools/`, `video/`)
- **Ảnh:** 26 ảnh tạo tay trong ứng dụng Gemini (`docs-IMAGE-PROMPTS.md`). PhotoCraft xóa dấu ✦ (`tools/clean.ps1`), rồi `tools/prep.py` làm trắng nền tranh, tạo mask và xuất WebP.
- **Logo và con dấu:** vẽ trong DesignCraft bằng `tools/logo.py`.
- **Video quảng bá:** `video/` chụp từng khung hình bằng Playwright với đồng hồ giả, rồi dựng trong EffectCraft. Repo không kèm file nhạc, xem `video/README.md`.
- Ghi chú chi tiết về quy trình: `docs-README.md`.
