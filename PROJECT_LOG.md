# PROJECT LOG - Comic Management System

## Thông tin dự án

Tên dự án: Comic Management System  
Kiến trúc: Microservices + Event-driven Architecture  
Stack dự kiến: NestJS, MongoDB, Redis, RabbitMQ, Docker Compose  

## Tiến trình thực hiện

### Bước 1: Khởi tạo cấu trúc dự án

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo thư mục gốc `comic-management-system`
- Khởi tạo Git repository
- Tạo các thư mục service:
  - api-gateway
  - auth-service
  - user-service
  - comic-service
  - chapter-service
  - search-service
  - notification-service
- Tạo thư mục `docs`
- Tạo các file tài liệu ban đầu:
  - README.md
  - docker-compose.yml
  - PROJECT_LOG.md
  - docs/architecture.md
  - docs/api-design.md
  - docs/database-design.md

Ghi chú:
- Dự án sẽ được triển khai từng bước.
- Trước mỗi lần làm tiếp, cần đọc lại file PROJECT_LOG.md để nắm tiến trình.

### Bước 2: Setup Docker Compose cho hạ tầng hệ thống

Trạng thái: Hoàn thành

Đã thực hiện:
- Cấu hình Docker Compose
- Chạy thành công MongoDB container
- Chạy thành công Redis container
- Chạy thành công RabbitMQ container
- Kiểm tra bằng lệnh `docker ps`
- Các container đang chạy:
  - comic_mongodb
  - comic_redis
  - comic_rabbitmq

Ghi chú:
- MongoDB: localhost:27017
- Redis: localhost:6379
- RabbitMQ: localhost:5672
- RabbitMQ Dashboard: http://localhost:15672

### Bước 3: Khởi tạo Auth Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài NestJS CLI
- Tạo project NestJS cho `auth-service`
- Chạy thử Auth Service bằng `npm run start:dev`
- Kiểm tra API mặc định tại `http://localhost:3000`

Ghi chú:
- Auth Service hiện đang chạy mặc định ở port 3000
- Các chức năng đăng ký, đăng nhập và JWT sẽ được triển khai ở bước sau

### Bước 4: Kết nối Auth Service với MongoDB

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `@nestjs/mongoose` và `mongoose`
- Cấu hình kết nối MongoDB cho Auth Service
- Kết nối database `comic_auth_db`
- Chạy thử Auth Service thành công

Ghi chú:
- MongoDB đang chạy bằng Docker ở `localhost:27017`
- Auth Service dùng database riêng: `comic_auth_db`

### Bước 5: Tạo User Schema cho Auth Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo thư mục `src/schemas`
- Tạo file `user.schema.ts`
- Khai báo schema User gồm:
  - username
  - email
  - password
  - role
- Đăng ký UserSchema vào AppModule
- Chạy thử Auth Service thành công

Ghi chú:
- User sẽ được lưu trong database `comic_auth_db`
- Trường email được đặt unique để tránh đăng ký trùng tài khoản
- Password sẽ dùng để lưu mật khẩu đã mã hóa ở bước sau

### Bước 6: Xây dựng chức năng đăng ký tài khoản

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `bcrypt` để mã hóa mật khẩu
- Tạo Auth Module
- Tạo Auth Service
- Tạo Auth Controller
- Tạo Register DTO
- Xây dựng API `POST /auth/register`
- Sửa lỗi `UserModel` chưa được import trong `AuthModule`
- Test đăng ký tài khoản thành công bằng Postman
- API trả về `201 Created`

Ghi chú:
- Password đã được mã hóa trước khi lưu MongoDB
- Response không trả về password
- Khi test API bằng Postman cần chọn `Body -> raw -> JSON`

### Bước 7: Xây dựng chức năng đăng nhập bằng JWT

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `@nestjs/jwt`
- Tạo `LoginDto`
- Thêm `JwtModule` vào AuthModule
- Xây dựng API `POST /auth/login`
- Kiểm tra email tồn tại
- So sánh password bằng `bcrypt.compare`
- Tạo JWT access token sau khi đăng nhập thành công
- Test login bằng Postman thành công

Ghi chú:
- JWT hiện dùng secret tạm thời `comic_secret_key`
- Token có thời hạn 1 ngày
- Nếu sai email hoặc password, API trả lỗi `401 Unauthorized`
- `/auth/register` dùng để đăng ký
- `/auth/login` dùng để đăng nhập

### Bước 8: Cấu hình port riêng cho Auth Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Sửa `main.ts`
- Chuyển Auth Service từ port `3000` sang port `3001`
- Test lại API `POST /auth/login` thành công trên port `3001`

Ghi chú:
- Port `3000` sẽ dành cho API Gateway
- Auth Service chạy tại `http://localhost:3001`

### Bước 9: Xây dựng JWT Authentication Guard

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt Passport và JWT Strategy
- Tạo `JwtStrategy`
- Tạo `JwtAuthGuard`
- Tạo API `GET /auth/profile`
- Bảo vệ API bằng JWT
- Test Bearer Token bằng Postman thành công

Ghi chú:
- JWT được gửi qua Authorization Header
- Format:
  Authorization: Bearer TOKEN
- Nếu token không hợp lệ hoặc hết hạn:
  API trả `401 Unauthorized`

  ### Bước 10: Dockerize Auth Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho Auth Service
- Tạo `.dockerignore`
- Build Auth Service bằng Docker
- Thêm Auth Service vào `docker-compose.yml`
- Chạy Auth Service container thành công
- Kết nối Auth Service với MongoDB container bằng hostname `mongodb`
- Test API login thành công qua Docker

Ghi chú:
- Auth Service container tên `comic_auth_service`
- Auth Service chạy ở port `3001`
- Khi chạy trong Docker, không dùng `localhost` để kết nối MongoDB mà dùng tên service `mongodb`

### Bước 11: Khởi tạo Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Xóa `.gitkeep` trong `comic-service`
- Tạo project NestJS cho `comic-service`
- Cài đặt `@nestjs/mongoose` và `mongoose`
- Cấu hình Comic Service chạy ở port `3002`
- Kết nối Comic Service với MongoDB database `comic_comic_db`
- Chạy thử service thành công

Ghi chú:
- Comic Service dùng để quản lý thông tin truyện tranh
- Comic Service chạy tại `http://localhost:3002`
- Database riêng: `comic_comic_db`

### Bước 12: Tạo Comic Schema và API quản lý truyện cơ bản

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo Comic Module
- Tạo Comic Service
- Tạo Comic Controller
- Tạo Comic Schema
- Tạo CreateComicDto
- Xây dựng API `POST /comics`
- Xây dựng API `GET /comics`
- Test thêm truyện và lấy danh sách truyện thành công

Ghi chú:
- Comic Service chạy ở port `3002`
- Dữ liệu truyện được lưu vào database `comic_comic_db`

### Bước 13: Hoàn thiện CRUD cho Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `UpdateComicDto`
- Xây dựng API `GET /comics/:id`
- Xây dựng API `PATCH /comics/:id`
- Xây dựng API `DELETE /comics/:id`
- Thêm xử lý lỗi `404 Not Found`
- Test CRUD thành công bằng Postman

Ghi chú:
- Comic Service hiện đã hỗ trợ CRUD cơ bản đầy đủ
- MongoDB ObjectId được dùng để định danh truyện
- Khi test API cần thay `:id` bằng ObjectId thực tế

### Bước 14: Dockerize Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho Comic Service
- Tạo `.dockerignore`
- Thêm Comic Service vào `docker-compose.yml`
- Build và chạy Comic Service bằng Docker Compose
- Kết nối Comic Service với MongoDB container bằng hostname `mongodb`
- Test API `GET /comics` thành công qua Docker

Ghi chú:
- Comic Service container tên `comic_comic_service`
- Comic Service chạy ở port `3002`
- Comic Service hiện hỗ trợ CRUD đầy đủ
- MongoDB được dùng chung thông qua Docker network

### Bước 15: Khởi tạo Chapter Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Xóa `.gitkeep` trong `chapter-service`
- Tạo project NestJS cho `chapter-service`
- Cài đặt `@nestjs/mongoose` và `mongoose`
- Cấu hình Chapter Service chạy ở port `3003`
- Kết nối Chapter Service với MongoDB database `comic_chapter_db`
- Test local service thành công

Ghi chú:
- Chapter Service dùng để quản lý chương truyện
- Chapter Service chạy tại `http://localhost:3003`
- Database riêng: `comic_chapter_db`

### Bước 16: Tạo Chapter Schema và API quản lý chương truyện

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo Chapter Module
- Tạo Chapter Service
- Tạo Chapter Controller
- Tạo Chapter Schema
- Tạo CreateChapterDto
- Xây dựng API `POST /chapters`
- Xây dựng API `GET /chapters/comic/:comicId`
- Xây dựng API `GET /chapters/:id`
- Test tạo chapter thành công
- Test lấy danh sách chapter theo comicId thành công

Ghi chú:
- Chapter liên kết với Comic thông qua `comicId`
- Dữ liệu chapter được lưu trong database `comic_chapter_db`
- `images` lưu danh sách URL ảnh của chapter

### Bước 17: Dockerize Chapter Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho Chapter Service
- Tạo `.dockerignore`
- Thêm Chapter Service vào `docker-compose.yml`
- Build và chạy Chapter Service bằng Docker Compose
- Kết nối Chapter Service với MongoDB container bằng hostname `mongodb`
- Test API chapter thành công qua Docker

Ghi chú:
- Chapter Service container tên `comic_chapter_service`
- Chapter Service chạy ở port `3003`
- Khi chạy trong Docker, MongoDB được gọi bằng hostname `mongodb`

### Bước 18: Tạo API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo project `api-gateway`
- Cài đặt `http-proxy-middleware`
- Cấu hình Gateway chạy ở port `3000`
- Proxy request:
  - `/api/auth` -> Auth Service
  - `/api/comics` -> Comic Service
  - `/api/chapters` -> Chapter Service
- Test thành công:
  - `GET /api/comics`
  - `GET /api/chapters/comic/:comicId`
  - `POST /api/auth/login`

Ghi chú:
- Auth, Comic, Chapter Service chạy bằng Docker
- API Gateway hiện chạy local bằng `npm run start:dev`
- Client chỉ cần gọi qua `http://localhost:3000/api/...`

### Bước 19: Dockerize API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho API Gateway
- Tạo `.dockerignore`
- Chuyển proxy target sang Docker service hostname
- Thêm API Gateway vào `docker-compose.yml`
- Build và chạy toàn bộ hệ thống bằng Docker Compose
- Test API Gateway thành công:
  - `/api/auth`
  - `/api/comics`
  - `/api/chapters`

Ghi chú:
- API Gateway container tên `comic_api_gateway`
- Gateway chạy ở port `3000`
- Các service giao tiếp nội bộ qua Docker network:
  - `auth-service`
  - `comic-service`
  - `chapter-service`

  ### Bước 20: Thêm Redis Cache cho Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt Redis package cho Comic Service
- Tạo Redis Provider
- Kết nối Comic Service với Redis container
- Cache API `GET /comics`
- Tự động xóa cache khi:
  - tạo truyện
  - cập nhật truyện
  - xóa truyện
- Test Redis Cache thành công

Ghi chú:
- Cache key: `all_comics`
- Cache TTL: 60 giây
- Redis giúp giảm tải MongoDB và tăng tốc phản hồi API

### Bước 21: Publish RabbitMQ event khi tạo truyện

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `amqplib`
- Tạo RabbitMQ Provider cho Comic Service
- Kết nối Comic Service với RabbitMQ container
- Tạo queue `comic.created`
- Publish event `comic.created` sau khi tạo truyện mới
- Test log thành công:
  - RabbitMQ Connected
  - Event published: comic.created

Ghi chú:
- Đây là bước đầu triển khai Event-driven Architecture
- Comic Service không gọi trực tiếp service khác mà gửi event qua RabbitMQ

### Bước 22: Tạo Notification Service consume RabbitMQ event

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo project `notification-service`
- Cài đặt `amqplib`
- Tạo consumer lắng nghe queue `comic.created`
- Thêm Notification Service vào `docker-compose.yml`
- Dockerize Notification Service
- Test nhận event từ RabbitMQ thành công

Ghi chú:
- Notification Service chạy ở port `3004`
- Container tên `comic_notification_service`
- Khi Comic Service tạo truyện mới, Notification Service nhận event và log thông báo

### Bước 23: Publish event khi thêm Chapter mới

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `amqplib` cho Chapter Service
- Tạo RabbitMQ Provider trong Chapter Service
- Publish event `chapter.created` sau khi tạo chapter mới
- Cập nhật Notification Service để consume thêm queue `chapter.created`
- Build lại Chapter Service và Notification Service
- Test nhận event thành công

Ghi chú:
- Chapter Service publish event `chapter.created`
- Notification Service nhận event và log thông báo chương mới
- Hệ thống hiện đã có giao tiếp bất đồng bộ qua RabbitMQ

### Bước 24: Tạo Search Service cơ bản

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `search-service`
- Kết nối MongoDB riêng cho Search Service
- Tạo schema `SearchComic`
- Tạo API tìm kiếm:
  - `GET /search?keyword=...`
- Kết nối RabbitMQ
- Consume event `comic.created`
- Tự động index comic mới vào database search
- Dockerize Search Service
- Test search API thành công

Ghi chú:
- Search Service chạy ở port `3005`
- Container tên `comic_search_service`
- Search hoạt động bằng regex search cơ bản
- Dữ liệu search được đồng bộ qua RabbitMQ event

### Bước 25: Đồng bộ đầy đủ dữ liệu Search Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Publish đầy đủ comic data qua event `comic.created`
- Search Service lưu:
  - title
  - author
  - genres
  - description
  - coverImage
  - status
- Nâng cấp search API:
  - tìm theo title
  - tìm theo author
  - tìm theo genres
- Build lại Comic Service và Search Service
- Test search thành công

Ghi chú:
- Search Service hiện hoạt động như search index database
- Dữ liệu được đồng bộ bất đồng bộ qua RabbitMQ

### Bước 26: Bảo vệ API Admin bằng JWT tại API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `jsonwebtoken`
- Tạo `auth.middleware.ts` trong API Gateway
- Bảo vệ các route admin:
  - `POST /api/comics`
  - `PATCH /api/comics/:id`
  - `DELETE /api/comics/:id`
  - `POST /api/chapters`
- Đồng bộ JWT secret với Auth Service
- Test không token trả `401 Unauthorized`
- Test có token tạo comic thành công

Ghi chú:
- Gateway đóng vai trò kiểm tra xác thực tập trung
- Các request đọc dữ liệu `GET` vẫn được public

### Bước 27: Tạo Frontend cơ bản

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo frontend bằng React + Vite + TypeScript
- Kết nối frontend với API Gateway
- Bật CORS cho API Gateway
- Hiển thị danh sách truyện từ API `GET /api/comics`
- Test frontend thành công tại `http://localhost:5173`

Ghi chú:
- Frontend hiện gọi API Gateway tại `http://localhost:3000/api`
- Một số ảnh không hiển thị vì đang dùng URL mẫu `example.com`

### Bước 28: Thêm Search vào Frontend

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm ô tìm kiếm vào frontend
- Kết nối frontend với Search Service
- Bật CORS cho Search Service
- Tìm kiếm truyện theo:
  - title
  - author
  - genres
- Test search thành công trên giao diện

Ghi chú:
- Frontend gọi Comic Service để lấy danh sách truyện
- Frontend gọi Search Service để tìm kiếm truyện

### Bước 29: Frontend Login và lưu JWT

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm form login vào frontend
- Gọi API `POST /api/auth/login`
- Nhận `accessToken` từ Auth Service
- Lưu token vào `localStorage`
- Hiển thị trạng thái đã đăng nhập
- Thêm chức năng logout

Ghi chú:
- Token sẽ được dùng cho các chức năng admin ở bước sau

### Bước 30: Admin thêm truyện từ Frontend

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm admin form trên frontend
- Gửi JWT token trong Authorization header
- Gọi API `POST /api/comics`
- Tạo comic từ giao diện web
- Refresh danh sách truyện sau khi tạo
- Test full flow thành công

Flow hệ thống:
Frontend
-> API Gateway
-> JWT Middleware
-> Comic Service
-> MongoDB
-> Redis Cache Clear
-> RabbitMQ Event
-> Notification Service
-> Search Service
-> Frontend Refresh

Ghi chú:
- Chỉ user đã login mới tạo được truyện
- Search Service tự động index comic mới

### Bước 31: Admin thêm Chapter từ Frontend

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm form tạo chapter trên frontend
- Gửi JWT token khi gọi `POST /api/chapters`
- Tạo chapter thành công từ giao diện web
- Liên kết chapter với comic thông qua `comicId`
- Test event `chapter.created` thành công

Ghi chú:
- Admin cần copy `_id` của comic để tạo chapter
- Chapter Service publish event qua RabbitMQ
- Notification Service nhận event chương mới

### Bước 32: Xem chi tiết truyện và đọc chapter

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm chức năng click vào comic để xem chi tiết
- Gọi API `GET /api/chapters/comic/:comicId`
- Hiển thị danh sách chapter theo comic
- Thêm chức năng click chapter để đọc nội dung
- Hiển thị danh sách ảnh của chapter
- Thêm nút Back để quay lại danh sách truyện

Ghi chú:
- Frontend hiện đã có flow đọc truyện cơ bản
- User có thể xem comic, xem chapter và đọc ảnh chapter

### Bước 33: Dockerize Frontend

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho frontend
- Tạo `.dockerignore` cho frontend
- Thêm frontend vào `docker-compose.yml`
- Build và chạy frontend bằng Docker Compose
- Test frontend tại `http://localhost:5173`

Ghi chú:
- Frontend container tên `comic_frontend`
- Toàn bộ hệ thống hiện đã chạy bằng Docker Compose

### Bước 34: Upload cover image local cho Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tích hợp Multer cho Comic Service
- Upload ảnh cover từ frontend
- Lưu file local trong thư mục uploads
- Serve static file qua `/uploads`
- Frontend preview ảnh trước khi upload
- MongoDB lưu URL ảnh thật

Flow:
Frontend
-> FormData
-> API Gateway
-> Comic Service
-> Multer upload
-> uploads/
-> MongoDB

Ghi chú:
- Cover image hiện đã upload trực tiếp từ thiết bị
- Không còn cần nhập URL ảnh thủ công

### Bước 35: Upload nhiều ảnh chapter từ thiết bị

Trạng thái: Hoàn thành

Đã thực hiện:
- Tích hợp multi-file upload cho Chapter Service
- Upload nhiều ảnh chapter bằng Multer
- Lưu local uploads cho chapter
- Frontend hỗ trợ chọn nhiều file ảnh
- Preview nhiều ảnh trước khi upload
- Reader hiển thị ảnh thật từ local uploads

Flow:
Frontend
-> FormData multi-images
-> API Gateway
-> Chapter Service
-> Multer multi-upload
-> uploads/
-> MongoDB lưu mảng URL
-> Chapter Reader render ảnh

Ghi chú:
- Chapter reader hiện hoạt động như web truyện thực tế
- Ảnh được nối liền nhau theo chiều dọc

### Bước 36: Upload ảnh local cho Comic và Chapter

Trạng thái: Hoàn thành

Đã thực hiện:
- Comic Service hỗ trợ upload cover image từ thiết bị
- Chapter Service hỗ trợ upload nhiều ảnh chapter từ thiết bị
- Sử dụng Multer để xử lý multipart/form-data
- Lưu file ảnh vào thư mục `uploads`
- Serve static file qua `/uploads`
- Frontend hỗ trợ chọn ảnh bìa truyện
- Frontend hỗ trợ chọn nhiều ảnh chapter
- Chapter reader hiển thị ảnh thật và nối liền nhau

Ghi chú:
- Comic cover dùng 1 ảnh
- Chapter dùng mảng nhiều ảnh
- MongoDB lưu URL ảnh sau khi upload

### Bước 37: Thêm Health Check cho API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm endpoint `GET /health`
- API Gateway trả trạng thái hoạt động của service
- Test health check thành công

Ghi chú:
- Health Check dùng để kiểm tra service còn hoạt động hay không
- Có thể dùng cho monitoring, Docker, Kubernetes hoặc load balancer

### Bước 38: Logging Request tại API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo logging middleware cho API Gateway
- Log method và URL của request
- Hiển thị timestamp cho mỗi request
- Test logging bằng Postman thành công

Ví dụ log:
[2026-05-20T10:00:00.000Z] GET /api/comics

Ghi chú:
- Logging hỗ trợ monitoring và debugging hệ thống
- Có thể mở rộng bằng Winston hoặc ELK Stack

### Bước 39: Backup và Restore MongoDB

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo script backup MongoDB bằng mongodump
- Backup toàn bộ MongoDB container ra file archive
- Copy file backup ra máy thật
- Tạo folder backup lưu dữ liệu
- Test backup thành công

Flow:
MongoDB Container
-> mongodump
-> backup.archive
-> docker cp
-> backup/

Ghi chú:
- Backup file lưu tại backup/backup.archive
- Có thể dùng để restore dữ liệu khi hệ thống gặp sự cố

### Bước 40: Role-based Authorization ADMIN / USER

Trạng thái: Hoàn thành

Đã thực hiện:
- Sử dụng role trong User Schema
- JWT payload chứa thông tin role
- API Gateway kiểm tra role trong middleware
- Chặn USER gọi các API quản trị
- Chỉ ADMIN được phép:
  - tạo truyện
  - sửa truyện
  - xóa truyện
  - tạo chapter
- Test thành công:
  - USER token trả `403 Forbidden: Admin only`
  - ADMIN token thực hiện API thành công

Ghi chú:
- Authentication: xác định người dùng là ai
- Authorization: xác định người dùng được phép làm gì
- Role được kiểm tra tập trung tại API Gateway

### Bước 41: Distributed Lock bằng Redis cho Chapter Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tích hợp Redis lock cho tạo chapter
- Tạo lock theo:
  comicId + chapterNumber
- Chặn race condition khi nhiều request tạo cùng chapter
- Tự động release lock bằng finally
- Thêm expiration time tránh deadlock
- Kiểm tra duplicate chapterNumber trong database

Flow:
Request tạo chapter
-> Redis lock
-> kiểm tra chapter tồn tại
-> create MongoDB
-> publish RabbitMQ event
-> release lock

Test:
- Tạo chapter lần đầu thành công
- Tạo lại cùng chapterNumber trả 409 Conflict
- Tạo chapterNumber khác vẫn thành công

Ghi chú:
- Sử dụng Redis Distributed Lock
- Hỗ trợ synchronization trong distributed system
- Tránh race condition và duplicate data

### Bước 42: Khắc phục lỗi treo màn hình trắng bằng cơ chế Defensive Checking ở Frontend

Trạng thái: Hoàn thành

Đã thực hiện:
- Tích hợp kiểm tra kiểu dữ liệu mảng an toàn bằng `Array.isArray()` trong `fetchComics` và `fetchChapters` ở `App.tsx`
- Bổ sung hiển thị chỉ báo đang tải (loading indicators) sinh động khi gọi API
- Thiết lập cơ chế tự động nạp ảnh bìa nghệ thuật chất lượng cao từ thư viện Unsplash nếu ảnh thật chưa được tải lên hoặc gặp lỗi tải tập tin (404)
- Triển khai vi hiệu ứng ẩn các trang chương bị hỏng tự động trong Trình đọc để tăng sự liền mạch

Ghi chú:
- Đảm bảo ứng dụng Frontend không bao giờ bị treo trắng trang kể cả khi dịch vụ Gateway/Backend phản hồi lỗi hoặc trả dữ liệu không mong muốn
- Tối ưu hóa trải nghiệm khách truy cập bằng thiết kế ảnh thay thế (fallback images)

### Bước 43: Nâng cấp toàn diện giao diện người dùng sang Premium Dark Theme và Glassmorphic UI

Trạng thái: Hoàn thành

Đã thực hiện:
- Tích hợp các bộ font chữ thiết kế cao cấp `Outfit` và `Plus Jakarta Sans` trực tiếp từ Google Fonts
- Chuyển đổi toàn bộ nền tảng sang chủ đề tối sang trọng với mã màu `#09090b` và các dải sắc Tím/Hồng Neon gradient nổi bật
- Thiết kế giao diện hiệu ứng kính mờ (Glassmorphism) với đường viền trong suốt và độ nhám mịn màng (`backdrop-filter`) cho các khung Login, Admin và Chi tiết truyện
- Nâng cấp Trình đọc chương (Chapter Reader) dạng cuộn dọc Webtoon vô cực, nền tối tối giản tạo trải nghiệm đọc chuyên nghiệp
- Bổ sung hiệu ứng hover chuyển động tỷ lệ nhẹ nhàng (`scale`) và đổ bóng phát quang khi di chuột vào các thẻ truyện tranh

Ghi chú:
- Đạt tiêu chuẩn thẩm mỹ cao cấp, tăng tính tương tác mạnh mẽ cho giao diện người dùng

### Bước 44: Đồng bộ Docker Volumes lưu trữ các tập tin tải lên vĩnh viễn (Persistent Volumes)

Trạng thái: Hoàn thành

Đã thực hiện:
- Ánh xạ đường dẫn vật lý cục bộ từ máy Windows host vào các thư mục `/app/uploads` trong Docker Compose cho hai container: `comic-service` và `chapter-service`
- Cấu hình lưu trữ tệp tin ảnh tải lên vĩnh viễn (Persistent Volumes) trong file `docker-compose.yml`
- Đồng bộ cơ chế serve static files qua cổng mapped `3002/uploads` và `3003/uploads` ổn định
- Test tải lên ảnh bìa truyện thật từ giao diện và ghi tệp thành công ra thư mục vật lý ở máy thật

Ghi chú:
- Giải quyết hoàn toàn sự cố mất mát hình ảnh khi container bị xóa, rebuild hoặc khởi động lại
- Tất cả ảnh mới đăng tải đều được bảo toàn trọn vẹn và an toàn

### Bước 45: Nhất quán kiến trúc Microservices qua việc tích hợp Search Service vào API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Bổ sung cấu hình proxy chuyển tiếp `/api/search` tới dịch vụ `http://search-service:3005/search` trong `main.ts` của `api-gateway`
- Cập nhật hàm `fetchComics` ở `App.tsx` phía Frontend để chuyển truy vấn từ cổng `3005` trực tiếp sang cổng API Gateway tập trung `3000/api/search`
- Build và kiểm thử thành công: Luồng dữ liệu tìm kiếm đi qua cổng Gateway duy nhất hoạt động cực kỳ mượt mà

Ghi chú:
- Chuẩn hóa toàn diện kiến trúc cổng API Gateway, loại bỏ hoàn toàn việc Frontend phải kết nối trực tiếp với nhiều cổng dịch vụ khác nhau
- Thuận tiện tối đa cho việc cấu hình bảo mật, tường lửa và triển khai môi trường Production thực tế

### Bước 46: Nâng cấp trải nghiệm quản trị (Admin UX) bằng bộ chọn danh sách truyện tự động

Trạng thái: Hoàn thành

Đã thực hiện:
- Thay thế hoàn toàn ô nhập liệu thô "Mã truyện (Comic ID)" bằng thẻ chọn lựa chọn thả xuống `<select>` tự động được nạp từ danh sách `comics` ở Frontend
- Tự động gán lựa chọn mặc định vào bộ chọn là bộ truyện đầu tiên có trong danh sách ngay khi tải trang
- Hiển thị song song tiêu đề truyện và rút ngắn mã ID (`title (id...)`) giúp Admin dễ dàng nhận diện tác phẩm khi thêm chương mới

Ghi chú:
- Loại bỏ hoàn toàn thao tác thủ công sao chép-dán mã định dạng hexadecimal (24 kí tự) dễ gây nhầm lẫn của MongoDB
- Giúp quy trình đăng tải chương mới trở nên trực quan, nhanh chóng và chuyên nghiệp hơn rất nhiều

### Bước 47: Cấu hình và Cập nhật Tài khoản Quản trị Admin mặc định trong Database

Trạng thái: Hoàn thành

Đã thực hiện:
- Phát hiện tài khoản thử nghiệm `admin@example.com` mặc định có phân quyền (`role`) là `USER`, dẫn đến lỗi `403 Forbidden` khi thao tác trên trang Admin ở Frontend
- Thực thi truy vấn MongoDB cập nhật phân quyền của tài khoản `admin@example.com` thành `ADMIN`
- Cấu hình mật khẩu mặc định được băm mã hóa bằng bcrypt thành công: `admin123`
- Đăng nhập thử nghiệm thành công ở giao diện Web, mở khóa toàn bộ bảng quản trị thêm truyện và thêm chương mượt mà

Ghi chú:
- Thông tin đăng nhập Admin chính thức của hệ thống:
  - **Email**: `admin@example.com`
  - **Password**: `admin123`
- Phục vụ quá trình nghiệm thu, kiểm thử khép kín (End-to-End) toàn bộ các dịch vụ mà không cần cấu hình thủ công ở cơ sở dữ liệu

### Bước 48: Phân tách giao diện và thiết lập bộ định tuyến màn hình riêng biệt (View-based Routing System)

Trạng thái: Hoàn thành

Đã thực hiện:
- Xây dựng bộ định tuyến trạng thái màn hình (`view` state) gồm 3 phân vùng độc lập: `'public'` (độc giả), `'login'` (đăng nhập chuyên biệt) và `'admin'` (quản trị nội dung) trong `App.tsx`
- Thiết kế thanh điều hướng nổi cố định phía trên (Fixed Top Navigation Header) mang phong cách hiện đại với các liên kết tương tác linh hoạt dựa trên trạng thái xác thực
- Tạo dựng trang Đăng nhập chuyên biệt (`login-container` & `login-card`) dạng kính mờ căn giữa toàn màn hình kèm hiệu ứng chuyển động mượt mà
- Thiết kế không gian làm việc chuyên dụng cho Quản trị viên (`admin-container` & `admin-grid`), gom cụm 2 khung tạo truyện và chapter cạnh nhau giúp tránh xáo trộn và trùng lặp với trang chủ độc giả
- Tích hợp tính năng tự động chuyển hướng màn hình thông minh (ví dụ: tự chuyển sang bảng Admin ngay khi đăng nhập thành công, và tự quay lại Trang chủ khi đăng xuất)

Ghi chú:
- Giải quyết triệt để vấn đề bố cục lộn xộn cũ khi bảng Admin hiển thị đè lên danh sách truyện ở trang chủ
- Tăng tính bảo mật giao diện và mang lại trải nghiệm chuyên nghiệp chuẩn SPA (Single Page Application) cho nền tảng đọc truyện

### Bước 49: Khắc phục triệt để lỗi không đăng nhập được và không load được danh sách truyện (WSL2 Hostname Bypassing)

Trạng thái: Hoàn thành

Đã thực hiện:
- Phát hiện lỗi kết nối `ERR_CONNECTION_RESET` thường xảy ra trên hệ thống Windows WSL2 khi cố gắng truy cập qua cổng `localhost:3000` (API Gateway) từ giao diện Web, gây ra hiện tượng không đăng nhập được và danh sách truyện tải vô tận (loading mãi không hiện).
- Triển khai cơ chế phân giải hostname thông minh và tự động tại `App.tsx` của Frontend: nếu người dùng truy cập trang web bằng tên miền `localhost`, ứng dụng sẽ tự động chuyển hướng các cuộc gọi API dưới dạng ngầm tới địa chỉ IP loopback vật lý `127.0.0.1` (`apiHost = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname`).
- Thực hiện build lại toàn bộ các container Docker bằng lệnh `docker-compose up -d --build` để đồng bộ các thay đổi mới và đảm bảo Vite compiler cập nhật bản build mới nhất của Frontend.
- Kiểm thử và xác minh trực tiếp luồng API thông qua PowerShell (`Invoke-RestMethod`):
  - Dữ liệu truyện tranh đã tải lên trước đó ("Sự tích hoa mào" và "sự tích cây bút thần") được xác nhận là vẫn tồn tại an toàn, trọn vẹn trong MongoDB và hiển thị chính xác.
  - API đăng nhập của Auth Service qua API Gateway tại địa chỉ `127.0.0.1:3000/api/auth/login` hoạt động mượt mà, xác thực tài khoản `admin@example.com` với mật khẩu `admin123` và trả về JWT Access Token thành công.
  - Danh sách truyện được Gateway fetch từ Comic Service và trả về chính xác cho Frontend, chấm dứt hoàn toàn hiện tượng treo trang.

Ghi chú:
- Đảm bảo tính ổn định tối đa của hệ thống trong mọi môi trường phát triển (bao gồm cả WSL2 trên Windows).
- Giúp người dùng trải nghiệm mượt mà bằng cách truy cập `http://127.0.0.1:5173` hoặc `http://localhost:5173`.

### Bước 50: Nâng cấp toàn diện giao diện Quản trị (Admin UX Overhaul) và tích hợp API Xóa Chapter

Trạng thái: Hoàn thành

Đã thực hiện:
- **Backend - Thêm API Xóa Chapter (`DELETE /chapters/:id`):** 
  - Thêm phương thức `remove` trong `ChapterService` (`chapter-service`) kết nối MongoDB thông qua `findByIdAndDelete` để xóa chương sạch sẽ.
  - Khai báo endpoint `@Delete(':id')` trong `ChapterController` để tiếp nhận yêu cầu xóa.
  - Tích hợp bảo mật phân quyền `ADMIN` tập trung tại API Gateway JWT Middleware để chặn các request trái phép.
- **Frontend - Cải tiến toàn diện trải nghiệm Quản trị (Admin UX Overhaul):**
  - **Trang lưới truyện mặc định:** Thiết kế lưới card truyện kính mờ hiển thị ngay khi Admin đăng nhập, đi kèm nút bấm nổi bật `➕ Thêm truyện mới` ở phía trên.
  - **Phân tách form tạo tác phẩm:** Chuyển form tạo truyện mới thành một chế độ xem phụ có nút `← Quay lại` rõ ràng để tránh gây lộn xộn.
  - **Màn hình chi tiết chương (Drill-down):** Khi Admin click chọn một bộ truyện, hệ thống chuyển sang màn hình quản lý chương chuyên biệt. Hiển thị metadata truyện, danh sách chương và form thêm chương mới.
  - **Đăng tải chương thông minh:** Form đăng chương tự động gán mã truyện đang chọn (loại bỏ thao tác copy-paste ID thủ công) và tự động tăng số chương tiếp theo.
  - **Nút xóa chương màu đỏ neon:** Tích hợp nút `🗑️ Xóa` bên cạnh mỗi chương, gọi trực tiếp API DELETE qua Gateway và tự động làm mới danh sách chương.
- **Docker Compose Rebuild:** Thực hiện build và chạy lại dịch vụ `chapter-service` và `frontend` thành công.
- **Kiểm thử E2E:** 
  - Kiểm thử trực tiếp xóa chapter thử nghiệm có ID `6a0e80af09f1791b05df38dc` qua cổng Gateway thành công rực rỡ ("Chapter deleted successfully"). Dữ liệu được xóa sạch khỏi MongoDB.

- Giao diện Admin chuyên nghiệp, tối giản, và trực quan chuẩn kiến trúc ứng dụng hiện đại.
- Cải thiện tối đa hiệu suất thao tác đăng truyện và đăng chương của Quản trị viên.

### Bước 51: Sửa lỗi va chạm bố cục nút Quay Lại (Fixed Back Button Layout Collision)

Trạng thái: Hoàn thành

Đã thực hiện:
- **Phát hiện lỗi va chạm layout:** Nút "Quay lại danh sách truyện" sử dụng class `.back-button` có thuộc tính `position: absolute` khiến nó bị đè trực tiếp lên góc trái trên của ảnh bìa truyện (`.admin-detail-cover`), che khuất hình ảnh.
- **Tách biệt kiểu dáng nút Admin (`.admin-back-btn`):** Thay thế class của các nút quay lại của Admin trong `App.tsx` bằng `.admin-back-btn`.
- **Định nghĩa CSS tĩnh tự nhiên (`App.css`):**
  - Loại bỏ định vị tuyệt đối `position: absolute` cho nút Admin.
  - Sử dụng dòng chảy tĩnh tự nhiên (`display: inline-flex` và `position: relative / static`) giúp nút tự động nằm ở trên cùng của trang chi tiết, đẩy toàn bộ ảnh bìa và metadata truyện xuống phía dưới một cách ngăn nắp.
  - Bổ sung hiệu ứng vi hiệu ứng hover sáng neon tím tím mờ và chuyển động dịch chuyển nhẹ sang trái (`transform: translateX(-3px)`) nhằm nâng cao tính thẩm mỹ và cảm giác tương tác mượt mà.
- **Docker Rebuild:** Khởi động lại container `frontend` và biên dịch thành công mã nguồn CSS/JSX mới.

- Giải quyết triệt để lỗi hiển thị đè ảnh bìa truyện, đảm bảo giao diện đẹp mắt, sạch sẽ và hoàn chỉnh 100%.

### Bước 52: Tích hợp hoạt ảnh chuyển tiếp Butter-Smooth tối ưu đồ họa phần cứng (Hardware-Accelerated Transitions)

Trạng thái: Hoàn thành

Đã thực hiện:
- **Định nghĩa các Keyframes hoạt ảnh chuyên nghiệp ở `App.css`:**
  - `fadeInUp`: Đẩy nhẹ nội dung từ dưới lên (`translateY(16px)` về `0`) kết hợp mờ dần (opacity) trong `0.45s` tạo cảm giác chuyển động mượt mà.
  - `scaleIn`: Thu phóng chiều sâu nhẹ nhàng (`scale(0.97)` lên `1`) trong `0.4s` tạo hiệu ứng êm ái cho các form kính mờ và box chi tiết.
  - Kích hoạt tăng tốc phần cứng GPU bằng thuộc tính `will-change: transform, opacity` và hàm điều hướng gia tốc nâng cao `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Đồng bộ hóa hoạt ảnh vào các luồng chuyển trang trong `App.tsx`:**
  - Áp dụng `.animate-fade-in-up` cho trang chủ Độc giả, trang Đăng nhập và Bảng điều khiển Admin chính.
  - Áp dụng `.animate-scale-in` cho các form thêm truyện mới, form thêm chapter riêng biệt và hộp chi tiết truyện.
  - Tích hợp hiệu ứng trượt nhẹ nâng lên cho danh sách chapter khi được nạp.
- **Docker Compose Build & Test:** Khởi động lại container `frontend` và biên dịch thành công bản build tối ưu mới nhất.

Ghi chú:
- Mang lại trải nghiệm chuyển trang Butter-Smooth sang trọng, tinh tế chuẩn ứng dụng SaaS/SPA cao cấp bậc nhất.
- Hỗ trợ cuộn lướt và tương tác thị giác tuyệt vời cho người dùng ở cả máy tính lẫn thiết bị di động.

### Bước 53: Phân tách giao diện Đăng Chương mới thành màn hình riêng biệt (Dedicated Add Chapter View)

Trạng thái: Hoàn thành

Đã thực hiện:
- **Ẩn form Đăng Chapter khỏi Trang Chi tiết (Drill-down):** 
  - Loại bỏ hoàn toàn khối nhập liệu "Thêm Chapter" ở cột phải trang chi tiết truyện của Admin, mở rộng tối đa không gian hiển thị danh sách mục lục chương giúp Admin dễ theo dõi.
  - Tích hợp nút bấm hành động lớn nổi bật: **`➕ Đăng chapter mới`** ngay cạnh tiêu đề mục lục.
- **Xây dựng Trang Đăng Chương riêng biệt (Dedicated Workspace):**
  - Khai báo state quản lý điều phối `showAddChapterForm` dạng boolean trong `App.tsx`.
  - Thiết kế màn hình kính mờ toàn khung độc lập dành riêng cho đăng chương, tự động hiển thị tên tác phẩm đang được chọn để tăng tính trực quan.
  - **Tự động điền số chương tiếp theo (Auto-increment):** Tích hợp giải thuật tự động quét qua mảng `chapters` của truyện để tìm số chương lớn nhất và tự điền trước `chapterNumber + 1` vào ô nhập liệu, giúp Admin tiết kiệm tối đa thời gian thao tác.
  - Cung cấp nút **`← Quay lại mục lục`** để hủy thao tác ngầm và làm sạch form.
  - **Chuyển hướng thông minh:** Khi tạo chương thành công, hệ thống hiển thị thông báo, tự động đóng màn hình thêm chương và chuyển hướng Admin trở lại danh sách chương để thấy ngay chương mới nạp vào.
- **Docker Compose Rebuild:** Chạy lại dịch vụ `frontend` và biên dịch mã nguồn React mới nhất thành công.

Ghi chú:
- Phân luồng công việc đăng chương vô cùng sạch sẽ, tập trung hoàn toàn vào tác vụ đang xử lý của quản trị viên.
- Giải quyết hoàn toàn sự bất tiện khi phải chọn thủ công ID truyện trong danh sách thả xuống.


