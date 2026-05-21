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

## 5. Lab Thực Chiến: Tự Dựng Trợ Lý Học Tập AI Cục Bộ (Ollama & Open WebUI)

Để hiểu rõ cách phối hợp đa container, quản lý biến môi trường, và lưu trữ dữ liệu bền vững (Volumes) trong Docker Compose, chúng ta sẽ cùng triển khai một **Hệ thống Trợ lý AI Cục bộ (Local AI Assistant)**. Hệ thống này chạy hoàn toàn trên máy tính cá nhân của bạn, không gửi dữ liệu ra ngoài Internet, đảm bảo an toàn thông tin 100%.

### A. Kiến trúc Hệ thống
Hệ thống gồm 2 dịch vụ phối hợp:
1. **Ollama (Backend AI Engine)**: Chạy mô hình ngôn ngữ lớn (ví dụ: `gemma:2b` hoặc `llama3:8b`). Nó cung cấp API để xử lý prompt. Dữ liệu mô hình được lưu bền vững qua Volume để tránh tải lại mỗi lần khởi động.
2. **Open WebUI (Frontend UI)**: Cung cấp giao diện trò chuyện Web đẹp mắt, trực quan giống ChatGPT, kết nối trực tiếp đến Ollama API.

```
                           [ Người dùng (Trình duyệt Web) ]
                                          |
                                    (Cổng 3000)
                                          v
                                +-------------------+
                                |    Open WebUI     |
                                |    (Container)    |
                                +-------------------+
                                          |
                                    (Cổng 11434)
                                          v
                                +-------------------+
                                |      Ollama       | <---> [ Volume: ollama-data ]
                                |  (Backend Engine) |       (Lưu trữ LLM Models)
                                +-------------------+
```

### B. Tệp tin `docker-compose.yml` Hoàn chỉnh
Hãy tạo một thư mục mới mang tên `lab-local-ai`, tạo tệp tin `docker-compose.yml` với nội dung dưới đây:

```yaml
version: '3.8'

services:
  # Dịch vụ 1: Ollama AI Engine
  ollama:
    image: ollama/ollama:latest
    container_name: local-ollama-engine
    volumes:
      # Lưu trữ bền vững các mô hình LLM tải về máy
      - ollama-data:/root/.ollama
    ports:
      - "11434:11434"
    # Giới hạn tài nguyên để tránh treo đơ máy host khi mô hình hoạt động
    deploy:
      resources:
        limits:
          memory: 4096M
    restart: unless-stopped

  # Dịch vụ 2: Open WebUI Frontend
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: local-ai-webui
    ports:
      - "3000:3000"
    volumes:
      - webui-data:/app/backend/data
    environment:
      # Kết nối trực tiếp tới container Ollama bằng tên dịch vụ (Service Discovery)
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
    restart: unless-stopped

# Khai báo các Named Volume để lưu trữ bền vững dữ liệu
volumes:
  ollama-data:
    name: local_ollama_data
  webui-data:
    name: local_webui_data
```

### C. Hướng dẫn Từng Bước Vận Hành Lab
1. **Khởi chạy cụm dịch vụ:**
   Chạy lệnh sau tại thư mục chứa file `docker-compose.yml`:
   ```bash
   docker compose up -d
   ```
2. **Kiểm tra trạng thái các container:**
   ```bash
   docker compose ps
   ```
3. **Tải mô hình AI (Gemma 2B của Google) chạy thử nghiệm:**
   Chúng ta sẽ truy cập vào bên trong container Ollama để ra lệnh tải mô hình siêu gọn nhẹ `gemma:2b` (~1.4GB):
   ```bash
   docker exec -it local-ollama-engine ollama run gemma:2b
   ```
   *Lưu ý:* Sau khi tải xong, bạn có thể gõ trò chuyện trực tiếp trong Terminal. Gõ `/bye` để thoát khỏi phiên Terminal của Ollama.
4. **Trải nghiệm giao diện Web:**
   * Mở trình duyệt và truy cập: `http://localhost:3000`
   * Đăng ký một tài khoản Admin cục bộ đầu tiên (đây là tài khoản lưu trên máy cá nhân của bạn).
   * Tại thanh chọn Mô hình ở trên cùng, chọn mô hình `gemma:2b` vừa tải về.
   * Bắt đầu trò chuyện và đặt câu hỏi về lập trình hoặc DevOps để trải nghiệm tốc độ xử lý native cực đỉnh!

---

## 6. Câu hỏi tự ôn tập & Kiểm tra kiến thức
1. *Tại sao việc chia nhỏ hệ thống thành các mạng nội bộ ảo trong Docker Compose lại hạn chế được rủi ro khi một container frontend bị tin tặc tấn công kiểm soát?*
2. *Phân biệt sự khác nhau về quyền truy cập file hệ thống giữa Named Volume và Bind Mount. Tại sao Bind Mount lại mang nhiều rủi ro an ninh hơn?*
3. *Nếu container database bị lỗi không thể khởi động được, chuyện gì sẽ xảy ra với container backend cấu hình phụ thuộc `condition: service_healthy`?*
4. *Trong Lab tự dựng Trợ lý AI cục bộ ở trên, giải thích cơ chế Service Discovery giúp container `open-webui` kết nối được tới `ollama` thông qua biến môi trường `OLLAMA_BASE_URL`.*

---

## 7. Tài nguyên Đọc thêm Chất lượng cao (Recommended Blog Readings)

### 🇻🇳 [Cấu Hình Docker Compose Đạt Chuẩn Production Trong Thực Tế (Docker Compose Production Best Practices)](./blog/docker-compose-production-best-practices.md)
*   **Chi tiết**: Bài viết dịch thuật và hiệu đính chi tiết từ các kỹ sư DevOps lâu năm về cách tối ưu hóa Docker Compose cho môi trường vận hành lớn.
*   **Giá trị thực tiễn**: Nắm vững kỹ thuật chia nhỏ file qua extends, quản lý secret an toàn, giám sát hiệu năng container và thiết lập giới hạn CPU/RAM chặt chẽ.
*   **Liên kết nguồn gốc**: [Docker Documentation - Compose in Production](https://docs.docker.com/compose/production/)
