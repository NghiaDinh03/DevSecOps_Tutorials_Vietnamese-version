# 🧪 Lab 2.3: Cấu hình Production Compose với Network Isolation & Resource Limits (Docker Compose Production Lab)

## 📌 Lý do bài thực hành này tồn tại (Why this Lab?)
Trong môi trường Production, việc khởi chạy các container mà không có bất kỳ cấu hình giới hạn tài nguyên nào là vô cùng nguy hiểm. Một container bị lỗi rò rỉ bộ nhớ (Memory Leak) hoặc bị tấn công từ chối dịch vụ (DoS) có thể ngốn sạch tài nguyên RAM và CPU của máy chủ vật lý, làm sập toàn bộ các container khác đang chạy chung host.
Hơn nữa, về mặt an ninh mạng, cơ sở dữ liệu (Database) là nơi lưu trữ thông tin nhạy cảm nhất và tuyệt đối không được phép tiếp xúc trực tiếp với Internet bên ngoài. Chỉ có Web App nội bộ mới được quyền kết nối với Database.
Bài lab này hướng dẫn bạn cách viết tệp **Docker Compose chuẩn Production** áp dụng các kỹ thuật:
1.  **Cô lập mạng nội bộ (Network Isolation)**: DB hoàn toàn tách biệt khỏi internet.
2.  **Giới hạn tài nguyên RAM/CPU (Resource Limits)**: Tránh quá tải cạn kiệt tài nguyên host.
3.  **Quản lý Logging chống tràn đĩa (Log Rotation)**: Giới hạn dung lượng lưu trữ log.

---

## ⚙️ Sơ đồ Cô lập Mạng trong Docker Compose
```
                        [ Internet ]
                             │
                             ▼  (Cổng công khai: 80)
                     ┌───────────────┐
                     │    Web App    │  <--- Mạng: frontend-net
                     └───────────────┘
                             │
                             ▼  (Mạng nội bộ - không lộ ra ngoài)
                     ┌───────────────┐
                     │   Database    │  <--- Mạng: backend-net (internal: true)
                     └───────────────┘
```

---

## 🛠️ Các bước Thực hành Chi tiết

### Bước 1: Thiết lập thư mục Lab và cấu hình Compose
Tạo một thư mục lab trống và tạo tệp cấu hình chuyên nghiệp sau:

Tạo tệp cấu hình `docker-compose.yml`:
```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    deploy:
      resources:
        limits:
          cpus: '0.50'     # Giới hạn tối đa 50% của 1 core CPU
          memory: 256M     # Giới hạn tối đa 256MB RAM
    networks:
      - frontend-net
      - backend-net
    logging:
      driver: "json-file"
      options:
        max-size: "10m"    # Tối đa 10MB cho mỗi file log
        max-file: "3"      # Giữ tối đa 3 file log tránh tràn ổ đĩa

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=secureproductionpwd
    deploy:
      resources:
        limits:
          cpus: '1.0'      # Giới hạn tối đa 1 core CPU
          memory: 512M     # Giới hạn tối đa 512MB RAM
    networks:
      - backend-net        # Cơ sở dữ liệu hoàn toàn cô lập khỏi Internet bên ngoài

networks:
  frontend-net:
  backend-net:
    internal: true         # ĐẶC BIỆT: Mạng nội bộ hoàn toàn khép kín, cấm kết nối ra internet bên ngoài
```

### Bước 2: Khởi chạy cụm dịch vụ
Khởi chạy cụm container với cấu hình Production:
```bash
docker compose up -d
```
*Lưu ý: Môi trường này chỉ chứa 2 container rất nhẹ là Nginx và Postgres Alpine, quá trình khởi động chỉ mất vài giây!*

### Bước 3: Xác minh Giới hạn Tài nguyên (Resource Limits)
Để kiểm tra xem Docker daemon có thực thi giới hạn tài nguyên RAM và CPU hay không, hãy chạy lệnh sau:
```bash
docker stats --no-stream
```
*Hãy quan sát màn hình kết quả. Bạn sẽ thấy cột **LIMIT** của container `web` hiển thị chính xác `256MiB` và container `db` hiển thị chính xác `512MiB` đúng như cấu hình! Điều này giúp bảo vệ máy chủ host an toàn tuyệt đối.*

### Bước 4: Xác minh Cô lập Mạng (Network Isolation)
Bây giờ, chúng ta sẽ thực hiện kiểm tra xem container `db` có bị cô lập hoàn toàn khỏi internet và các mạng bên ngoài hay không:

1. Thử ping ra ngoài internet từ container `web` (ở mạng frontend):
```bash
docker compose exec web ping -c 3 google.com
```
*Kết quả:* Ping thành công (hoặc phân giải DNS được) vì `web` nằm ở mạng `frontend-net` có cổng kết nối ra ngoài.

2. Thử ping ra ngoài internet từ container `db` (ở mạng backend cô lập):
```bash
docker compose exec db ping -c 3 google.com
```
*Kết quả:* Báo lỗi `ping: bad address 'google.com'` hoặc thất bại hoàn toàn! Container `db` hoàn toàn không thể kết nối ra internet nhờ cấu hình `internal: true`.

3. Thử kết nối trực tiếp đến cổng database từ máy host cá nhân của bạn:
```bash
telnet localhost 5432
# hoặc
curl localhost:5432
```
*Kết quả:* Kết nối bị từ chối (Connection Refused) vì cổng `5432` của database không hề được publish ra máy host. Chỉ duy nhất container `web` nằm chung mạng `backend-net` mới có quyền kết nối đến database này.

### Bước 5: Dọn dẹp môi trường
```bash
docker compose down
```

---

## 🎯 Tổng kết Bài học
Qua bài thực hành này, bạn đã:
*   Cấu hình thành công giới hạn tài nguyên CPU/RAM (`limits`) để ngăn chặn tấn công cạn kiệt tài nguyên (DoS).
*   Ứng dụng cơ chế **Log Rotation** (`max-size`, `max-file`) để bảo vệ an toàn dung lượng ổ đĩa cứng của máy chủ host.
*   Hiện thực hóa thiết kế **Mạng Cô lập nội bộ (Network Isolation)**, khóa chặt cơ sở dữ liệu nhạy cảm khỏi thế giới internet bên ngoài theo các nguyên tắc an ninh quốc tế cao nhất.
