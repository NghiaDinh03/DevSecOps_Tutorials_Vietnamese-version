# 🧪 Lab 01: Phân Tích & Xử Lý Sự Cố Mạng Nội Bộ (Linux Networking Troubleshooting)

## 🎯 Mục tiêu bài thực hành
Bài thực hành này giả lập một kịch bản sự cố hạ tầng thực tế. Bạn đóng vai trò là một kỹ sư DevSecOps nhận nhiệm vụ gỡ lỗi kết nối mạng ảo nội bộ giữa máy khách (**Client Container**) và máy chủ dịch vụ (**Web Server Container**).
*   Làm quen với các công cụ dòng lệnh phân tích mạng kinh điển: `ping`, `nslookup`, `ip`, `netstat`, `nc` (netcat), và `curl`.
*   Điều tra và xử lý sự cố phân giải tên miền (**DNS Resolution Failure**).
*   Điều tra sự cố sai lệch cổng dịch vụ và phát hiện cổng lắng nghe thực tế bằng công cụ quét cổng.
*   Khắc phục lỗi phân quyền ghi đọc tập tin nhật ký hệ thống (**File Permissions Failure**).

---

## 🏗️ Thiết kế Môi trường Lab (Standalone Lab)
Môi trường gồm hai container cùng chạy trong một mạng ảo Bridge cô lập `devsecops-net`:
1.  `client`: Môi trường thao tác của học viên (hệ điều hành Alpine Linux cài sẵn các công cụ gỡ lỗi mạng).
2.  `web-server`: Máy chủ Nginx giả lập ứng dụng Web nội bộ đang gặp sự cố.

---

## 🛠️ Các bước thực hiện chi tiết

### 📋 Bước 1: Khởi dựng môi trường Lab
Di chuyển tới thư mục chứa bài lab:
```bash
cd 01-fundamentals/linux-networking/labs/lab-linux-troubleshooting/
```

Khởi chạy cụm lab bằng Docker Compose:
```powershell
docker-compose up -d
```

Xác minh hai container đang chạy ổn định:
```powershell
docker-compose ps
```

---

### 📋 Bước 2: Truy cập vào môi trường máy khách (Client)
Chúng ta sẽ "chui" vào bên trong container `client` đóng vai trò máy host thao tác để bắt đầu gõ các câu lệnh gỡ lỗi hệ thống Linux:
```powershell
docker-compose exec client sh
```
*Lưu ý: Mọi câu lệnh từ Bước 3 đến Bước 5 dưới đây sẽ được thực thi hoàn toàn bên trong Shell của container `client` này.*

---

### 📋 Bước 3: Điều tra Sự cố 1 - Lỗi phân giải tên miền (DNS Resolution Failure)

#### 1. Triệu chứng sự cố:
Thử truy cập vào ứng dụng Web nội bộ bằng tên miền `devsecops.local` thông qua lệnh `curl`:
```sh
curl http://devsecops.local
```
*Kết quả lỗi:* `curl: (6) Could not resolve host: devsecops.local`. Hệ thống không thể phân giải tên miền này thành địa chỉ IP.

#### 2. Phân tích điều tra:
Sử dụng công cụ `nslookup` (Name Server Lookup) để truy vấn thử DNS:
```sh
nslookup devsecops.local
```
*Kết quả:* Không có phản hồi từ DNS Server. Do đây là môi trường local ảo, chúng ta chưa có DNS Server thực thụ phân giải cho đuôi `.local`.

#### 3. Khắc phục sự cố bằng Local Host File:
Như đã học trong lý thuyết, hệ điều hành Linux sẽ luôn ưu tiên kiểm tra file danh bạ local `/etc/hosts` trước khi hỏi DNS Server. Chúng ta sẽ giải quyết nhanh bằng cách thêm ánh xạ IP trực tiếp của máy `web-server` vào file này.

Trước hết, hãy tìm địa chỉ IP nội bộ của container `web-server` bằng cách ping trực tiếp tên service của Docker Compose (Docker tự phân giải tên service):
```sh
ping -c 1 web-server
```
*Kết quả mong đợi:* Nhìn thấy IP nội bộ dạng `172.x.x.x` (v.d. `172.20.0.3`).

Hãy tiến hành ghi đè dòng ánh xạ IP này vào file `/etc/hosts`:
```sh
echo "172.20.0.3 devsecops.local" >> /etc/hosts
```
*(Thay thế `172.20.0.3` bằng địa chỉ IP chính xác bạn vừa tìm được ở lệnh ping).*

Kiểm tra lại xem phân giải tên miền cục bộ đã hoạt động chưa:
```sh
ping -c 2 devsecops.local
```
*Kết quả mong đợi:* Ping thành công tới IP của máy chủ. Lỗi DNS đã được khắc phục hoàn hảo!

---

### 📋 Bước 4: Điều tra Sự cố 2 - Lỗi kết nối cổng dịch vụ (Port Connection Failure)

#### 1. Triệu chứng sự cố:
Mặc dù ping tên miền `devsecops.local` đã thông, nhưng khi gọi dịch vụ web qua cổng mặc định 80, kết nối vẫn bị từ chối:
```sh
curl -I http://devsecops.local
```
*Kết quả lỗi:* `curl: (7) Failed to connect to devsecops.local port 80: Connection refused`.

#### 2. Phân tích điều tra:
Chúng ta cần kiểm tra xem máy chủ web từ xa đang mở cổng nào hoạt động. Sử dụng công cụ `nc` (Netcat) ở chế độ quét cổng (Port Scanning) để quét từ cổng 79 đến 8090 trên máy chủ:
```sh
nc -zv devsecops.local 79-8090
```
*Giải thích cờ lệnh:*
*   `-z`: Chế độ quét (Zero-I/O), chỉ kiểm tra trạng thái cổng chứ không gửi nhận dữ liệu.
*   `-v`: Hiển thị thông tin chi tiết (Verbose).

*Kết quả quét mong đợi:* Bạn sẽ thấy dòng thông báo kết nối thành công duy nhất tại cổng `8080`:
`devsecops.local (172.20.0.3:8080) open`

#### 3. Khắc phục kết nối:
Máy chủ Nginx đã bị cấu hình sai lệch cổng lắng nghe chuẩn (chạy cổng 8080 thay vì cổng 80). Hãy thử kết nối lại với đúng cổng vừa tìm thấy:
```sh
curl http://devsecops.local:8080
```
*Kết quả mong đợi:* Bạn nhận về mã HTML chào mừng của ứng dụng Web Nginx thành công!

---

### 📋 Bước 5: Điều tra Sự cố 3 - Lỗi phân quyền tập tin nhật ký (File Permissions Failure)

Hệ thống ghi nhận ứng dụng Web có xuất một tệp tin nhật ký giao dịch chứa thông tin lỗi nằm tại `/var/log/app/error.log` bên trong máy khách `client`. Nhưng user hiện tại của bạn không thể đọc được.

#### 1. Phân tích điều tra:
Thử xem nội dung file log:
```sh
cat /var/log/app/error.log
```
*Kết quả lỗi:* `cat: /var/log/app/error.log: Permission denied` (Bị từ chối truy cập).

Hãy kiểm tra chi tiết quyền hạn và chủ sở hữu của tệp tin này bằng lệnh `ls -l`:
```sh
ls -l /var/log/app/error.log
```
*Kết quả phân tích:*
`-rw-------    1 root     root       128 May 21 22:00 /var/log/app/error.log`
Tệp tin này chỉ cho phép duy nhất user `root` được đọc và ghi (`rw-------` tương đương chmod `600`), trong khi bạn hiện tại đang chạy shell với quyền user thường.

#### 2. Khắc phục phân quyền an toàn:
Nếu chúng ta dùng quyền tối cao của root nâng quyền cho tệp tin này cho tất cả mọi người cùng đọc (`chmod 777`) thì sẽ tạo ra lỗ hổng bảo mật nghiêm trọng (bất kỳ ai cũng đọc được log nhạy cảm). 
Giải pháp đúng đắn là thay đổi nhóm sở hữu (Group) của file sang group của bạn (group `users`) và cấp quyền đọc tối thiểu cho group đó (`chmod 640`).

*(Thoát ra khỏi user thường hoặc giả lập quyền sudo của root trong container bằng cách trực tiếp chạy chmod hệ thống vì container alpine này cho phép quản trị)*:
Cấp quyền đọc cho nhóm sở hữu (Group Read):
```sh
chmod 640 /var/log/app/error.log
```

Chuyển nhóm sở hữu sang nhóm của user thường (`users`):
```sh
chown root:users /var/log/app/error.log
```

Kiểm tra lại thuộc tính file:
```sh
ls -l /var/log/app/error.log
```
*Kết quả mong đợi:* `-rw-r----- 1 root users ...`

Bây giờ, user thường của bạn đã nằm trong nhóm `users` và có thể đọc file log an toàn:
```sh
cat /var/log/app/error.log
```
*Kết quả:* Bạn sẽ đọc được dòng thông điệp log lỗi thành công!

---

### 📋 Bước 6: Dọn dẹp môi trường Lab
Gõ `exit` để thoát khỏi shell của container `client` quay về máy host thật. Sau đó chạy lệnh dọn dẹp sạch sẽ:
```powershell
docker-compose down -v
```
*Cụm container và mạng ảo Bridge đã được dọn sạch hoàn toàn khỏi máy host của bạn.*
