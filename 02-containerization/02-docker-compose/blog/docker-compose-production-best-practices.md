# Docker Compose trong Môi Trường Production: Những Kỹ Thuật Đắc Lực

*   **Tên bài viết gốc**: Docker Compose Best Practices for Development and Production
*   **Nguồn dịch**: [TestDriven.io](https://testdriven.io/) (Nền tảng blog chuyên sâu về phát triển phần mềm, DevOps và kiến trúc hệ thống uy tín hàng đầu)
*   **Dịch thuật**: Dịch chuẩn xác, dễ hiểu sang văn phong chuyên nghiệp của kỹ sư DevSecOps Việt Nam.

---

## 1. Giới thiệu

Docker Compose là công cụ tuyệt vời để định nghĩa và khởi chạy các ứng dụng multi-container (nhiều container cùng lúc) một cách nhanh chóng chỉ bằng một tệp cấu hình YAML duy nhất. Tuy nhiên, hầu hết các tài liệu trên mạng chỉ hướng dẫn bạn viết một tệp `docker-compose.yml` đơn giản dành cho môi trường phát triển (Development).

Khi đưa Docker Compose ra chạy thực tế trên các máy chủ Production hoặc Staging quy mô vừa và nhỏ, bạn cần phải cấu hình chặt chẽ hơn để đảm bảo tính an toàn, bảo mật, khả năng khôi phục sau sự cố, và quản lý tài nguyên hiệu quả.

Bài viết này hệ thống hóa các kỹ thuật đắc lực (Best Practices) khi vận hành Docker Compose trong môi trường Production thực tế.

---

## 2. Chiến lược Tách biệt File Cấu hình (Multi-file Strategy)

Đừng cố gắng nhồi nhét tất cả cấu hình của Development và Production vào một file `docker-compose.yml` duy nhất. 
*   Ở môi trường Development, bạn cần gắn kết mã nguồn trực tiếp (Volume Mount) để code nóng (Hot-reload), mở các cổng debug, và chạy các dịch vụ bổ trợ nhanh chóng.
*   Ở Production, bạn cần đóng gói ứng dụng hoàn toàn vào Image, cấu hình bảo mật nghiêm ngặt, giới hạn tài nguyên, và ẩn toàn bộ các cổng DB ra ngoài thế giới.

### A. Giải pháp sử dụng nhiều file ghi đè:

Chúng ta chia cấu hình thành 3 file:
1.  `docker-compose.yml` (File Base chứa cấu hình khung của dịch vụ).
2.  `docker-compose.override.yml` (File tự động ghi đè mặc định dùng cho **Development**).
3.  `docker-compose.prod.yml` (File ghi đè dùng cho **Production**).

#### 1. File Base `docker-compose.yml` (Khung dịch vụ):
```yaml
version: '3.8'

services:
  web:
    image: company/web-app:latest
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
```

#### 2. File Ghi đè Development `docker-compose.override.yml` (Volume Mount, Dev Ports):
```yaml
version: '3.8'

services:
  web:
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
```

#### 3. File Ghi đè Production `docker-compose.prod.yml` (Bảo mật, Resource Limits):
```yaml
version: '3.8'

services:
  web:
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### B. Cách khởi chạy trên Production:
Khi triển khai lên production, bạn bỏ qua file override mặc định bằng cách chỉ định rõ các file cấu hình cần gộp qua cờ `-f`:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 3. Quản lý Biến Môi trường An toàn (Secrets & Environment Variables)

Tuyệt đối cấm khai báo các thông tin nhạy cảm (như mật khẩu Database, API Keys, JWT Secrets) trực tiếp trong tệp `docker-compose.yml` và đẩy lên GitHub.

### A. Sử dụng file `.env` thông minh:
Docker Compose tự động đọc tệp `.env` nằm cùng thư mục để gán giá trị vào các biến trong file YAML.

1.  *Trong tệp `docker-compose.yml`:*
    ```yaml
    services:
      db:
        image: postgres:15-alpine
        environment:
          POSTGRES_DB: ${DB_NAME}
          POSTGRES_USER: ${DB_USER}
          POSTGRES_PASSWORD: ${DB_PASSWORD}
    ```
2.  *Trong tệp `.env` (Được lưu cục bộ trên máy chủ, KHÔNG push lên git):*
    ```env
    DB_NAME=production_db
    DB_USER=secops_admin
    DB_PASSWORD=SuperSecretComplexPassword123!
    ```

### B. Sử dụng Docker Secrets (Mức độ bảo mật cao hơn):
Để tránh việc biến môi trường bị rò rỉ khi tin tặc chạy lệnh `docker inspect` kiểm tra container, hãy sử dụng cơ chế ghi file tạm thời của Docker Secrets:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

## 4. Cơ chế Kiểm tra Sức khỏe tự động (Healthchecks)

Trên Production, việc một container đang ở trạng thái `Running` không có nghĩa là nó đang phục vụ khách hàng bình thường (ví dụ: ứng dụng NodeJS bị treo Event Loop, hoặc kết nối DB bị đứt khiến API báo lỗi 500 liên tục).

### A. Cấu hình Healthcheck trong Compose:
Hãy thêm cấu hình `healthcheck` để Docker Daemon chủ động kiểm tra trạng thái hoạt động thực tế của container và tự khởi động lại khi phát hiện bất thường:

```yaml
services:
  web:
    image: company/web-app:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

*   `test`: Lệnh kiểm tra hệ thống. Ở đây dùng `curl` gọi vào API `/healthz` của chính nó, nếu trả về HTTP 200 là thành công.
*   `interval`: Tần suất kiểm tra (mỗi 30 giây).
*   `timeout`: Thời gian tối đa chờ phản hồi (10 giây).
*   `retries`: Số lần thử lại tối đa khi thất bại trước khi đánh dấu container là `Unhealthy`.
*   `start_period`: Thời gian đệm ban đầu cho ứng dụng khởi động (10 giây) trước khi bắt đầu kiểm tra sức khỏe.

---

## 5. Giới hạn Tài nguyên Cứng (Resource Limits)

Một container ứng dụng bị lỗi rò rỉ bộ nhớ (memory leak) có thể ngốn sạch dung lượng RAM của máy chủ, khiến hệ điều hành bị treo cứng và làm sập toàn bộ các dịch vụ chạy chung.

Bắt buộc phải giới hạn CPU và RAM tối đa mà mỗi dịch vụ được phép sử dụng:

```yaml
services:
  web:
    image: company/web-app:latest
    deploy:
      resources:
        limits:
          cpus: '0.50'     # Giới hạn tối đa 50% CPU của 1 nhân
          memory: 512M     # Giới hạn tối đa 512MB RAM
        reservations:
          cpus: '0.25'     # Đảm bảo giữ tối thiểu 25% CPU
          memory: 256M     # Đảm bảo giữ tối thiểu 256MB RAM
```

---

## 6. Chính sách Tự phục hồi & Khởi động lại (Restart Policies)

Để ứng dụng tự động khôi phục khi máy chủ bị mất điện đột ngột hoặc Docker service bị khởi động lại:

*   ❌ *Tránh dùng:* `restart: always` đối với các container chạy các tác vụ chạy một lần (batch jobs) vì nó sẽ rơi vào vòng lặp restart vô tận khi job hoàn thành.
*   ✅ *Nên sử dụng:* `restart: unless-stopped`
    *   *Ý nghĩa:* Tự động khởi động lại container trong mọi tình huống (lỗi ứng dụng, sập nguồn máy chủ), **trừ khi** người dùng chủ động chạy lệnh `docker compose stop` để dừng nó lại.

---

## 7. Kết luận

Docker Compose là một công cụ cực kỳ linh hoạt và hoàn toàn có thể vận hành ổn định trong môi trường Production ở các quy mô vừa và nhỏ nếu lập trình viên biết áp dụng các quy chuẩn phòng vệ. Bằng cách thực hiện tách biệt file cấu hình, quản lý secrets an toàn qua `.env`, cấu hình kiểm tra sức khỏe `healthcheck`, giới hạn cứng tài nguyên, và thiết lập restart policy thông minh, bạn đã biến Docker Compose thành một nền tảng vận hành vô cùng tin cậy và vững chắc cho ứng dụng của mình.
