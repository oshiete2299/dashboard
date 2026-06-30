// Service worker tối giản - chỉ để app không báo lỗi thiếu file.
// Không cache gì cả, mọi request đi thẳng ra mạng như bình thường.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
