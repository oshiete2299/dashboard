# GiaBaoDashboard

Personal productivity dashboard — single-file React app (chạy thẳng bằng Babel qua CDN, không cần bước build), đóng gói sẵn dưới dạng **PWA** (cài đặt được, chạy offline).

## 📁 Cấu trúc file (phải giữ nguyên khi push)

```
index.html          ← app chính (không sửa logic bên trong)
manifest.json        ← khai báo PWA (tên, icon, theme color)
sw.js                 ← service worker (cache offline)
icons/
  icon-192.png
  icon-512.png
  icon-512-maskable.png
```

⚠️ **Quan trọng**: 4 file/folder này phải nằm cùng cấp thư mục (root của repo), vì `index.html` trỏ đường dẫn tương đối (`manifest.json`, `sw.js`, `icons/...`). Nếu bỏ vào folder con, phải sửa lại đường dẫn tương ứng.

## 🚀 Deploy lên GitHub Pages (làm 1 lần)

1. Tạo repo mới trên GitHub (public), ví dụ tên `giabao-dashboard`.
2. Push toàn bộ các file/folder ở trên lên nhánh `main`.
3. Vào **Settings → Pages** của repo:
   - **Source**: chọn `Deploy from a branch`
   - **Branch**: chọn `main` / `(root)`
   - Bấm **Save**
4. Đợi 1–2 phút, GitHub sẽ cho link dạng:
   `https://<username>.github.io/<ten-repo>/`

## 📤 Lệnh push (từ máy bạn, không phải Claude)

```bash
git init
git add index.html manifest.json sw.js icons
git commit -m "Initial commit: GiaBaoDashboard PWA"
git branch -M main
git remote add origin https://github.com/<username>/<ten-repo>.git
git push -u origin main
```

Nếu chưa cài git, cách nhanh nhất là vào GitHub → **Add file → Upload files**, kéo thả cả `index.html`, `manifest.json`, `sw.js` và folder `icons` (kéo cả 3 file .png trong đó) vào cùng lúc.

## 📱 Cài như app thật trên điện thoại

- **Android (Chrome)**: mở link → menu ⋮ → "Cài đặt ứng dụng" / "Thêm vào màn hình chính" → icon riêng + tên "GiaBao" sẽ hiện ra
- **iOS (Safari)**: mở link → nút Share → "Thêm vào MH chính"

Sau khi mở app lần đầu (có mạng), service worker sẽ tự cache lại toàn bộ app + thư viện CDN (React/Babel/jsmediatags) → **các lần mở sau chạy được cả khi không có mạng.**

## 🔄 Khi cập nhật app sau này

Mỗi lần sửa `index.html`, nhớ **tăng số version trong `sw.js`** (dòng `CACHE_VERSION = "giabao-v1"` → đổi thành `"giabao-v2"`, v.v.), rồi mới push. Nếu không đổi version, trình duyệt của người dùng cũ có thể tiếp tục dùng bản cache cũ một thời gian.

## ⚠️ Lưu ý quan trọng

- **Dữ liệu lưu trong `localStorage`/`IndexedDB` của trình duyệt** — gắn với domain `username.github.io`. Nếu đổi tên repo hoặc domain, dữ liệu cũ sẽ không tự chuyển theo. Nhớ dùng tính năng Export/Import JSON backup có sẵn trong app để backup định kỳ.
- Repo nên để **public** — GitHub Pages miễn phí chỉ hỗ trợ Pages công khai cho repo free/personal (trừ khi bạn có GitHub Pro/Team).
- Icon PWA được tạo tự động từ icon 180×180 nhúng sẵn trong `index.html` (apple-touch-icon) — nếu sau này bạn có logo độ phân giải cao hơn, thay trực tiếp 3 file trong `icons/` là được, không cần sửa gì khác.
