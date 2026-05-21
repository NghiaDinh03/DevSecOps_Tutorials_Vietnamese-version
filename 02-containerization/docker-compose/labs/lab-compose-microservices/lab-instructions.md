# 🧪 Lab 02: Xây dựng Hệ sinh thái Microservices An toàn bằng Docker Compose

## 🎯 Mục tiêu bài thực hành
Sau bài lab thực tế này, bạn sẽ làm chủ công cụ **Docker Compose** để khởi chạy một cụm microservices 3 lớp (3-tier Architecture) hoàn chỉnh, độc lập và có tính bảo mật cao:
*   Khai báo và liên kết các dịch vụ: **Frontend** (Nginx), **Backend API** (NodeJS), và **Database** (PostgreSQL).
*   Thực thi **phân tách mạng nội bộ** (`frontend-net` và `backend-net`) để ngăn chặn việc xâm nhập trực tiếp từ ngoài vào cơ sở dữ liệu.
*   Cấu hình **Volumes** lưu trữ bền vững cho database, bảo vệ dữ liệu không bị thất thoát.
*   Thiết lập cơ chế kiểm tra sức khỏe tự động (**Healthchecks**) đảm bảo dịch vụ khởi động theo đúng trình tự logic.
*   Giới hạn tài nguyên phần cứng (CPU/RAM) tránh nguy cơ container cạn kiệt tài nguyên máy host.

---

## 🏗️ Kiến trúc cụm dịch vụ Lab
Cụm dịch vụ được phân tách an ninh ở mức độ mạng ảo như sau:

```
                  [ Client / Internet ]
                           |
                     (Port 8080)
                           v
                 +-------------------+
                 |     Frontend      |  <- Chỉ thấy Frontend từ bên ngoài
                 |  (nginx:alpine)   |
                 +-------------------+
                   /               \
       (frontend-net)             (mạng riêng biệt)
                 /                   \
+-------------------+             +-------------------+
|    Backend API    |             |     Database      |  <- Database hoàn toàn bị
|  (node:20-alpine) |             | (postgres:alpine) |     cô lập khỏi Internet
+-------------------+             +-------------------+
                  \                 /
                   (backend-net)
```

---

## 🛠️ Các bước thực hiện chi tiết

### 📋 Bước 1: Khám phá tệp tin cấu hình `docker-compose.yml`
Hãy chuyển tới thư mục của bài lab: `02-containerization/docker-compose/labs/lab-compose-microservices/` và mở file `docker-compose.yml` đã được chuẩn bị sẵn để xem thiết kế.

Các điểm cấu hình bảo mật và tối ưu trong file:
1.  **Phân mạng cô lập**: Định nghĩa 2 mạng riêng biệt:
    *   `frontend-net`: Dành cho Frontend giao tiếp với Backend API.
    *   `backend-net`: Dành cho Backend API giao tiếp với PostgreSQL.
2.  **Khóa cổng Database**: Dịch vụ `database` hoàn toàn không khai báo chỉ thị `ports` mở ra máy host. Nó chỉ mở cổng nội bộ 5432 bên trong mạng `backend-net`.
3.  **Lưu trữ bền vững**: Sử dụng Named Volume `devsecops-db-data` gắn vào thư mục lưu trữ của PostgreSQL.
4.  **Tự động kiểm tra sức khỏe**: Sử dụng lệnh `pg_isready` để kiểm tra PostgreSQL đã sẵn sàng nhận kết nối hay chưa.
5.  **Giới hạn RAM và CPU**: Gán thông số `deploy.resources.limits` cho mỗi service để tránh lỗi cạn kiệt tài nguyên máy chủ.

---

### 📋 Bước 2: Khởi chạy cụm dịch vụ chỉ bằng 1 lệnh duy nhất
Tại terminal của máy host, di chuyển đến thư mục chứa bài lab này:
```bash
cd 02-containerization/docker-compose/labs/lab-compose-microservices/
```

Khởi chạy cụm dịch vụ dưới chế độ chạy ngầm (detached mode):
```powershell
docker-compose up -d
```

Docker Compose sẽ tự động tải các base image cần thiết, tạo các mạng ảo nội bộ, khởi chạy ổ đĩa lưu trữ, và kích hoạt các container theo đúng thứ tự ưu tiên.

---

### 📋 Bước 3: Xác minh trạng thái hoạt động của cụm dịch vụ

Hãy chạy lệnh sau để kiểm tra trạng thái sức khỏe của các container:
```powershell
docker-compose ps
```

*Kết quả mong đợi:*
*   Container `database` hiển thị trạng thái `healthy`.
*   Container `backend` và `frontend` hiển thị trạng thái `running` (hoặc `healthy`).

---

### 📋 Bước 4: Kiểm chứng Khả năng Cô lập Mạng (Network Isolation)
Đây là bài kiểm tra cực kỳ quan trọng để kiểm chứng thiết kế an ninh của bạn.

#### 1. Kiểm tra Backend API kết nối được tới Database:
Backend API nằm cùng mạng `backend-net` với database nên giao tiếp bình thường. Hãy thử ping từ Backend sang Database:
```powershell
docker-compose exec backend ping -c 3 database
```
*Kết quả mong đợi:* Ping thành công, trả về tín hiệu phản hồi.

#### 2. Kiểm tra Frontend có nhìn thấy Database hay không:
Theo thiết kế mạng cô lập, Frontend chỉ nằm trong mạng `frontend-net`, hoàn toàn không có liên kết với `backend-net` chứa Database. Hãy thử ping từ Frontend sang Database:
```powershell
docker-compose exec frontend ping -c 3 database
```
*Kết quả mong đợi:* **Thất bại hoàn toàn** (Lỗi `ping: bad address 'database'`). 
Điều này chứng minh: Nếu tin tặc tấn công kiểm soát được web server frontend, chúng cũng hoàn toàn không có cách nào quét thấy hay truy cập trực tiếp tới database hệ thống!

---

### 📋 Bước 5: Kiểm chứng tính Bền vững dữ liệu (Volume Persistence)

1.  Hãy thử truy cập vào ứng dụng Frontend qua trình duyệt tại địa chỉ: `http://localhost:8080`.
2.  Hệ thống hiển thị giao diện mẫu và cho phép bạn nhập ghi chú lưu vào database. Hãy thử nhập một số bản ghi mẫu (ví dụ: "Học DevSecOps Module 2 thành công!").
3.  Bây giờ, chúng ta sẽ giả lập sự cố máy chủ bằng cách dừng và xóa bỏ hoàn toàn cụm container:
    ```powershell
    docker-compose down
    ```
4.  Khởi động lại cụm container:
    ```powershell
    docker-compose up -d
    ```
5.  F5 làm mới trình duyệt `http://localhost:8080`. Bạn sẽ thấy các ghi chú đã nhập trước đó vẫn tồn tại nguyên vẹn! Đó là nhờ ổ đĩa ảo `devsecops-db-data` đã bảo vệ và lưu giữ dữ liệu an toàn ở ngoài vòng đời container.

---

### 📋 Bước 6: Dọn dẹp sạch sẽ tài nguyên
Sau khi kết thúc học tập, bạn hãy dọn dẹp toàn bộ tài nguyên (bao gồm cả dữ liệu trong volume) để khôi phục máy host sạch sẽ hoàn toàn:
```powershell
docker-compose down -v
```
*Lưu ý: Cờ `-v` (volumes) sẽ xóa sạch các named volume đã khởi tạo cho bài lab này.*
