# 🧪 Lab 01: Đóng gói & Gia cố Bảo mật Ứng dụng AI Chatbot Gemma

## 🎯 Mục tiêu bài thực hành
Sau bài lab này, bạn sẽ tự tay đóng gói ứng dụng **AI Chatbot Gemma** (viết bằng NodeJS) thành một Docker Image đạt chuẩn an toàn sản xuất (Production-ready). 
*   Biết cách thiết lập cấu trúc file loại trừ tài nguyên thừa (`.dockerignore`).
*   Áp dụng kỹ thuật **Multi-stage Build** tối ưu hóa dung lượng image từ ~900MB xuống dưới ~150MB.
*   Gia cố an toàn hệ thống bằng cách chạy container dưới quyền **Non-root User** (UID 10001).
*   Khởi chạy container ở chế độ bảo mật cao: **Read-only Root Filesystem** kết hợp chặn leo thang đặc quyền.

---

## 💼 Bối cảnh & Mô hình thực hành (Non-invasive Lab)
Ứng dụng đích cần đóng gói là **Gemma Chatbot** nằm ở thư mục `E:\VSC\gemma-chat`. 
Để tuân thủ triết lý DevSecOps: **Tuyệt đối không can thiệp hay sửa đổi trực tiếp vào thư mục mã nguồn của ứng dụng**. Tất cả cấu hình Dockerfile và file hướng dẫn sẽ được lưu trữ hoàn chỉnh tại repo này. Chúng ta sẽ điều khiển quá trình build từ bên ngoài bằng cách chỉ định đường dẫn context một cách an toàn.

---

## 🛠️ Các bước thực hiện chi tiết

### 📋 Bước 1: Chuẩn bị môi trường máy Host
Đảm bảo máy tính của bạn đã cài đặt Docker và Docker Daemon đang hoạt động:
```powershell
# Kiểm tra phiên bản Docker
docker --version

# Kiểm tra Docker daemon có phản hồi hay không
docker info
```

---

### 📋 Bước 2: Tạo tệp tin cấu hình bảo vệ `.dockerignore`
Để tránh việc sao chép nhầm các file nhạy cảm (như `.env`), các file log rác, hoặc thư mục `node_modules` cũ từ máy host vào trong image (gây xung đột hệ điều hành), chúng ta cần định nghĩa một file loại trừ.

Hãy kiểm tra file `.dockerignore` mẫu đã được chuẩn bị sẵn tại thư mục: `02-containerization/docker-basics/labs/lab-dockerize-ai-app/configs/.dockerignore`
Nội dung file bao gồm:
```ignore
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
```

---

### 📋 Bước 3: Thiết kế Dockerfile an toàn (`Dockerfile.secure`)
Hãy cùng phân tích tệp cấu hình Dockerfile mẫu đạt chuẩn an ninh cao được đặt tại thư mục: `02-containerization/docker-basics/labs/lab-dockerize-ai-app/configs/Dockerfile.secure`

Các điểm cải tiến bảo mật (Security Hardening) trong Dockerfile này:
1.  **Sử dụng Base Image chính chủ & Tối giản**: `node:20-alpine` giúp loại bỏ các thư viện hệ thống thừa thãi.
2.  **Multi-stage Build**: 
    *   *Stage 1 (builder)*: Cài đặt tất cả devDependencies và đóng gói ứng dụng.
    *   *Stage 2 (production)*: Chỉ sao chép duy nhất các file thực thi và thư mục `node_modules` production sang. Không cài đặt lại `npm` hay giữ lại package manager.
3.  **Tạo tài khoản không đặc quyền (Non-root User)**: 
    *   Tạo group `gemma-group` (GID 10001) và user `gemma-user` (UID 10001).
    *   Chuyển quyền sở hữu thư mục làm việc `/app` sang user này.
    *   Gọi chỉ thị `USER 10001` trước khi chạy tiến trình chính.

---

### 📋 Bước 4: Thực hiện Build Image từ bên ngoài
Mở terminal tại thư mục gốc của repo `DevSecOps_Tutorials_Vietnamese-version` và chạy lệnh build. Ta sẽ trỏ cờ `-f` đến file Dockerfile bảo mật của ta, đồng thời trỏ tham số context cuối cùng sang thư mục của ứng dụng `gemma-chat` ở ngoài:

```powershell
docker build -f 02-containerization/docker-basics/labs/lab-dockerize-ai-app/configs/Dockerfile.secure -t devsecops-gemma-app ../gemma-chat
```

> **Giải thích câu lệnh**:
> *   `-f 02-containerization/.../Dockerfile.secure`: Chỉ định rõ file công thức Dockerfile cần build.
> *   `-t devsecops-gemma-app`: Đặt tên nhãn (tag) cho Image sản phẩm.
> *   `../gemma-chat`: Chỉ định đường dẫn tương đối trỏ sang thư mục ứng dụng đích ngoài repo làm bối cảnh build (Build Context).

Sau khi build hoàn tất, hãy kiểm tra kích thước image sản phẩm so với image node cơ bản:
```powershell
docker images | findstr devsecops-gemma-app
```

---

### 📋 Bước 5: Khởi chạy Container với Cơ chế Gia cố An ninh tối đa
Để kiểm nghiệm khả năng phòng thủ của container trước các cuộc tấn công khai thác ghi file hoặc leo thang đặc quyền, ta khởi chạy ứng dụng với các cờ an ninh cực kỳ khắt khe:

```powershell
docker run -d `
  --name gemma-chatbot-secure `
  -p 3000:3000 `
  --read-only `
  --tmpfs /tmp `
  --security-opt=no-new-privileges:true `
  --memory="512m" `
  --cpus="1.0" `
  devsecops-gemma-app
```

> **Giải thích các cờ gia cố (Hardening Flags)**:
> *   `--read-only`: Gắn toàn bộ hệ thống file ảo của Container ở chế độ Chỉ đọc (Read-only). Kẻ tấn công đột nhập vào sẽ không thể ghi đè mã độc hay chỉnh sửa file cấu hình.
> *   `--tmpfs /tmp`: Tạo một đĩa RAM ảo tạm thời tại thư mục `/tmp` để ứng dụng Node.js ghi các file đệm/logs tạm mà không bị lỗi crash do filesystem bị khóa read-only.
> *   `--security-opt=no-new-privileges:true`: Ngăn chặn tuyệt đối các tiến trình con bên trong container tự động nâng cao đặc quyền của chúng (qua cơ chế SUID hoặc SGID).
> *   `--memory="512m"` & `--cpus="1.0"`: Sử dụng cgroups giới hạn tài nguyên, chống tấn công DoS làm treo máy host.

---

### 📋 Bước 6: Kiểm tra và Xác minh Hệ thống (Verification)

#### 1. Kiểm tra ứng dụng hoạt động:
Mở trình duyệt truy cập địa chỉ: `http://localhost:3000`. Hệ giao diện chat của ứng dụng Gemma Chatbot phải hiển thị và hoạt động bình thường.

#### 2. Kiểm tra tài khoản tiến trình đang chạy (whoami):
Hãy "chui" vào bên trong container đang chạy và xác thực xem tiến trình có thực sự chạy bằng tài khoản thường (Non-root user 10001) hay không:
```powershell
docker exec -it gemma-chatbot-secure whoami
```
*Kết quả mong đợi:* Hệ thống trả về `10001` hoặc tên user thường của ta, thay vì trả về `root`.

#### 3. Thử nghiệm ghi đè file hệ thống (Kiểm thử Read-Only Filesystem):
Hãy thử tạo một file mới vào trong thư mục root của ứng dụng để kiểm chứng xem hệ thống file có được bảo vệ chống ghi hay không:
```powershell
docker exec -it gemma-chatbot-secure touch /app/hack.js
```
*Kết quả mong đợi:* Bạn sẽ nhận ngay lỗi từ chối ghi: `touch: /app/hack.js: Read-only file system`. Cơ chế bảo vệ đã hoạt động xuất sắc!

---

### 📋 Bước 7: Dọn dẹp tài nguyên sau thực hành
Sau khi hoàn tất việc tự kiểm chứng, bạn hãy xóa bỏ container thực hành để hoàn trả tài nguyên sạch sẽ cho máy host local:
```powershell
docker rm -f gemma-chatbot-secure
```
