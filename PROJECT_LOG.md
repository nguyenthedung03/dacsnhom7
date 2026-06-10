# PROJECT LOG - Comic Management System

## Thông tin dự án

Tên dự án: Comic Management System  
Kiến trúc: Microservices + Event-driven Architecture  
Stack: NestJS, MongoDB, Redis, RabbitMQ, React + Vite, Docker Compose  

---

## Tiến trình thực hiện

### Bước 1–10: Khởi tạo hạ tầng & Auth Service
Trạng thái: ✅ Hoàn thành

- Tạo cấu trúc dự án, Git repo, Docker Compose
- Khởi chạy MongoDB (27017), Redis (6379), RabbitMQ (5672 / dashboard 15672)
- Auth Service (port 3001): đăng ký, đăng nhập, JWT, bcrypt, Passport, Docker

---

### Bước 11–14: Comic Service
Trạng thái: ✅ Hoàn thành

- Comic Service (port 3002), database `comic_comic_db`
- CRUD đầy đủ: POST / GET / PATCH / DELETE `/comics`
- Upload ảnh bìa bằng Multer, serve static `/uploads`
- Dockerize, kết nối MongoDB qua hostname `mongodb`

---

### Bước 15–17: Chapter Service
Trạng thái: ✅ Hoàn thành

- Chapter Service (port 3003), database `comic_chapter_db`
- API: POST / GET / DELETE `/chapters`
- Upload nhiều ảnh trang bằng Multer
- Distributed Lock Redis tránh race condition trùng chapterNumber

---

### Bước 18–19: API Gateway
Trạng thái: ✅ Hoàn thành

- API Gateway (port 3000), proxy tới tất cả service
- JWT Middleware bảo vệ route Admin tập trung
- Role-based Authorization: chỉ ADMIN được POST/PATCH/DELETE
- Logging middleware ghi timestamp + method + URL

---

### Bước 20–25: Redis Cache & RabbitMQ Event-driven
Trạng thái: ✅ Hoàn thành

- Redis cache `GET /comics` (TTL 60s), tự xóa khi write
- RabbitMQ event `comic.created` → Search Service index
- RabbitMQ event `chapter.created` → Notification Service log
- Search Service (port 3005): tìm theo title / author / genres

---

### Bước 26–36: Frontend & Upload
Trạng thái: ✅ Hoàn thành

- React + Vite + TypeScript (port 5173), Docker
- Trang chủ độc giả: xem truyện, tìm kiếm, đọc chapter
- Đăng nhập / Đăng ký / Đăng xuất, lưu JWT localStorage
- Admin panel: thêm / sửa / xóa truyện, đăng chapter
- Upload ảnh bìa và ảnh chapter từ thiết bị
- Docker Volumes lưu ảnh vĩnh viễn

---

### Bước 37–53: Hoàn thiện UX / DevOps
Trạng thái: ✅ Hoàn thành

- Premium Dark Theme, Glassmorphism, font Outfit + Plus Jakarta Sans
- Hoạt ảnh fadeInUp / scaleIn butter-smooth
- Health check `GET /health` tại API Gateway
- Backup MongoDB bằng mongodump
- WSL2 hostname bypass (`localhost` → `127.0.0.1`)
- Admin UX drill-down: lưới truyện → chi tiết → đăng chương riêng biệt
- Auto-increment số chương, nút xóa chương trực tiếp

---

### Bước 54: Tích hợp Payment & Order Service
Trạng thái: ✅ Hoàn thành

- Payment Service (port 3007), database `comicverse-payment`
- API: POST `/orders` đặt hàng, GET `/orders/user/:userId` lấy đơn
- PATCH `/orders/:id/status` cập nhật trạng thái (PENDING / PAID / DELIVERED / CANCELLED)
- Hỗ trợ thanh toán: COD, MoMo, VNPay, Chuyển khoản
- Frontend: giỏ hàng, checkout form, trang đơn hàng
- Proxy `/api/orders` qua API Gateway

---

### Bước 55: Hệ thống đánh giá sao (Star Review)
Trạng thái: ✅ Hoàn thành

- API `POST /comics/:id/review` nhận `star` 1–5
- Cập nhật `rating` (trung bình) và `reviewCount` trên Comic
- Frontend: modal đánh giá sao sau khi đặt hàng
- Chống đánh giá trùng bằng `reviewedOrders` (localStorage)
- Hiển thị rating trên card truyện và trang Top 3

---

### Bước 56: Top 3 Truyện Hot
Trạng thái: ✅ Hoàn thành

- API `GET /comics/top` trả top 3 theo `purchaseCount`
- Section "🔥 Top 3 Truyện Được Mua Nhiều Nhất" trên trang chủ
- Hiển thị rank badge, lượt mua, rating, badge HOT

---

### Bước 57: Sửa lỗi thể loại (Genres)
Trạng thái: ✅ Hoàn thành

- Lỗi: genres lưu dạng JSON string `["Kỳ Ảo"]` thay vì array
- Fix backend: parse genres trong `create()` và `update()` của Comic Controller
- Fix frontend: hàm `normalizeGenres()` tự động parse khi nhận data từ API
- Genre filter và genre pills hiển thị đúng

---

### Bước 58: AI Chatbot Service
Trạng thái: ✅ Hoàn thành

Chatbot Service (port 3006), database `comicverse-chatbot`

**Tính năng:**
- 💬 **Chat AI** (Gemini 1.5 Flash): trả lời tự nhiên, biết context truyện + đơn hàng + user
- 📋 **Lịch sử chat**: lưu MongoDB theo `sessionId` + `userId`, xem lại các phiên trước
- 🗑️ Xóa lịch sử chat phiên hiện tại
- Intent detection tự động: greeting, order_status, recommend, search, genre, shipping, return, purchase
- Rule-based fallback khi không có Gemini API key

**API endpoints:**
- `POST /api/chatbot/message` — gửi tin nhắn (kèm comicsContext + ordersContext + userId)
- `GET /api/chatbot/history/:sessionId` — lịch sử phiên
- `GET /api/chatbot/user-history/:userId` — toàn bộ lịch sử theo user
- `DELETE /api/chatbot/history/:sessionId` — xóa phiên
- `POST /api/chatbot/search` — tìm kiếm sản phẩm bằng AI *(đã ẩn khỏi UI)*
- `POST /api/chatbot/suggest` — gợi ý theo sở thích *(đã ẩn khỏi UI)*

**UI Chatbot (2 tab):**
- Tab 💬 Chat: chat với AI, quick-reply suggestions
- Tab 📋 Lịch sử: xem lịch sử chat (yêu cầu đăng nhập)

**Cấu hình:**
- Thêm `GEMINI_API_KEY` vào file `.env`
- Thêm `MONGODB_URI=mongodb://mongodb:27017/comicverse-chatbot` vào docker-compose

---

### Bước 59: Fix API Gateway Proxy (http-proxy-middleware v4)
Trạng thái: ✅ Hoàn thành

- Phát hiện: `http-proxy-middleware` v4 **không tự strip** mount path như v2/v3
- Fix: viết lại gateway dùng **Node.js `http` module thuần** (không phụ thuộc thư viện)
- Logic: strip `/api/<prefix>` → ghép với `basePath` của service → forward đúng URL
- Áp dụng cho tất cả: auth, comics, chapters, search, chatbot, orders

---

## Tài khoản mặc định

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| ADMIN | admin@example.com   | 123456    |

---

## Cổng dịch vụ

| Service           | Port |
|-------------------|------|
| Frontend          | 5173 |
| API Gateway       | 3000 |
| Auth Service      | 3001 |
| Comic Service     | 3002 |
| Chapter Service   | 3003 |
| Notification Svc  | 3004 |
| Search Service    | 3005 |
| Chatbot Service   | 3006 |
| Payment Service   | 3007 |
| MongoDB           | 27017|
| Redis             | 6379 |
| RabbitMQ          | 5672 |
| RabbitMQ Dashboard| 15672|

---

## Khởi động hệ thống

```bash
docker compose up --build
```

Truy cập: http://localhost:5173
