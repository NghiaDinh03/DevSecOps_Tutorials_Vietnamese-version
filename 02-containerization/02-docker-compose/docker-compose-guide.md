# 🐙 Sub-module 02: Docker Compose — Quản lý & Phối hợp Ứng dụng Đa Container

> **Mục tiêu**: Làm chủ Docker Compose để định nghĩa, chạy và quản lý vòng đời ứng dụng phức tạp gồm nhiều dịch vụ liên kết chặt chẽ (microservices) một cách an toàn và tự động hóa cao.

---

## 1. Định nghĩa Hạ tầng bằng Code (YAML)

Trong thực tế sản xuất, một ứng dụng hiếm khi đứng độc lập. Nó thường bao gồm một tập hợp các dịch vụ như: Giao diện người dùng (Frontend), API xử lý (Backend), Cơ sở dữ liệu (Database), và Bộ nhớ đệm (Cache). 

**Docker Compose** là công cụ giúp bạn định nghĩa toàn bộ hạ tầng đa container này trong một tệp tin duy nhất là `docker-compose.yml`. 
*   **Hạ tầng dạng Code (Infrastructure as Code - IaC)**: Toàn bộ cấu hình mạng, ổ đĩa lưu trữ, tài nguyên CPU/RAM, biến môi trường của hệ thống được viết dưới dạng mã nguồn YAML.
*   **Vận hành nhất quán**: Chỉ bằng một lệnh duy nhất `docker-compose up -d`, toàn bộ hệ sinh thái dịch vụ sẽ được khởi tạo tự động theo đúng thứ tự thiết lập.

---

## 2. Cơ chế mạng ảo trong Docker Compose (Networking)

Khi bạn khởi chạy một tệp tin `docker-compose.yml`, Docker Compose sẽ tự động thực hiện các bước sau:
1.  **Tạo một mạng Bridge cô lập mặc định** dành riêng cho cụm dịch vụ đó (ví dụ: `myapp_default`).
2.  **Đưa tất cả các container** được khai báo trong file vào chung mạng Bridge này.

```
                  +--------------------------------+
                  |    Mạng ảo mặc định (Bridge)   |
                  +--------------------------------+
                       /         |          \
                      /          |           \
         +------------+    +------------+    +------------+
         |  Frontend  |    |  Backend   |    |  Database  |
         | Container  |    | Container  |    | Container  |
         +------------+    +------------+    +------------+
```

### A. Cơ chế Khám phá dịch vụ (Service Discovery)
Mỗi container trong mạng ảo có thể giao tiếp với các container khác bằng cách sử dụng **tên dịch vụ (Service Name)** được khai báo trong file YAML làm tên miền (Hostname), thay vì phải dò tìm địa chỉ IP động của container.
*   *Ví dụ:* Ứng dụng Backend kết nối tới database thông qua chuỗi kết nối: `mongodb://database:27017` (Docker sẽ tự động phân giải tên `database` thành địa chỉ IP chính xác của container database).

### B. Bảo mật Mạng trong Docker Compose
Mặc định, tất cả các container có thể nhìn thấy nhau. Tuy nhiên, để đảm bảo an toàn tối đa theo nguyên lý **Least Privilege (Quyền hạn tối thiểu)**, ta nên phân tách các mạng khác nhau:
*   Mạng công cộng (`frontend-net`): Cho phép Frontend kết nối với Client và Backend.
*   Mạng nội bộ (`backend-net`): Cho phép Backend kết nối với Database. Container Database hoàn toàn bị cô lập khỏi Frontend và Internet bên ngoài.

---

## 3. Cơ chế Lưu trữ Bền vững (Volumes)

Container được thiết kế với cơ chế **Ephemereal (Tạm thời)**. Mọi dữ liệu sinh ra trong quá trình container chạy sẽ biến mất vĩnh viễn khi container bị xóa bỏ. Để lưu trữ dữ liệu bền vững (như dữ liệu PostgreSQL, MongoDB, Logs), chúng ta phải sử dụng **Volumes**.

Có 3 hình thức lưu trữ chính trong Docker:

| Loại lưu trữ | Cách thức hoạt động | Trường hợp sử dụng | Khuyến nghị Bảo mật |
|---|---|---|---|
| **Named Volume** (Ổ đĩa có tên) | Docker tự quản lý một thư mục riêng trên máy host (thường ở `/var/lib/docker/volumes/`). | Lưu trữ dữ liệu cơ sở dữ liệu trên Production (PostgreSQL, MySQL). | **Khuyên dùng**. Dữ liệu được cô lập tốt khỏi các tiến trình hệ thống khác của máy host. |
| **Bind Mount** (Gắn kết thư mục) | Liên kết trực tiếp một thư mục cụ thể từ máy Host vào bên trong Container. | Gắn mã nguồn từ máy host để phát triển (Hot-reload) hoặc ghi log ra ngoài. | **Cẩn thận**. Nếu chạy container dưới quyền `root`, container có thể ghi đè hoặc xóa các tệp hệ thống quan trọng của máy host. |
| **Anonymous Volume** (Ổ đĩa ẩn danh) | Tương tự Named Volume nhưng không có tên cụ thể, tự xóa khi container bị hủy (nếu gọi cờ `-v`). | Tạo vùng đệm tạm thời cho ứng dụng tránh ghi lên đĩa hệ thống. | Tốt cho việc tạo các thư mục ghi tạm thời. |

---

## 4. Kiểm soát Thứ tự Khởi động & Kiểm tra sức khỏe (Healthchecks)

### A. Vấn đề của sự phụ thuộc khởi động
Khi khởi chạy cụm dịch vụ, container Backend sẽ khởi động rất nhanh (trong vài mili-giây) và cố gắng kết nối ngay lập tức tới Database. Tuy nhiên, Database (như PostgreSQL) cần khởi tạo cấu trúc đĩa, nạp dữ liệu nên mất tới 5-10 giây để sẵn sàng lắng nghe. Kết quả là Backend sẽ bị crash ngay lập tức vì lỗi kết nối.

### B. Giải pháp: Sử dụng `depends_on` kết hợp `healthcheck`
Nhiều người lầm tưởng khai báo `depends_on: - database` là đủ. Thực chất, cờ này chỉ đảm bảo container database **được bật trước**, chứ không đảm bảo database **đã sẵn sàng phục vụ**.

Để khắc phục, chúng ta phải định nghĩa `healthcheck` cho database và yêu cầu backend đợi cho tới khi database vượt qua bài kiểm tra sức khỏe thành công (`service_healthy`):

```yaml
services:
  database:
    image: postgres:15-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    image: my-backend-image
    depends_on:
      database:
        condition: service_healthy # Chỉ khởi động backend khi database đã thực sự sẵn sàng nhận kết nối
```

---

## 📖 Câu hỏi tự ôn tập & Kiểm tra kiến thức
1. *Tại sao việc chia nhỏ hệ thống thành các mạng nội bộ ảo trong Docker Compose lại hạn chế được rủi ro khi một container frontend bị tin tặc tấn công kiểm soát?*
2. *Phân biệt sự khác nhau về quyền truy cập file hệ thống giữa Named Volume và Bind Mount. Tại sao Bind Mount lại mang nhiều rủi ro an ninh hơn?*
3. *Nếu container database bị lỗi không thể khởi động được, chuyện gì sẽ xảy ra với container backend cấu hình phụ thuộc `condition: service_healthy`?*
