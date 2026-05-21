# 🐳 Hướng dẫn Cài đặt Docker & Docker Compose Toàn diện (Windows, macOS, Linux)

Tất cả các bài thực hành (Labs) trong giáo trình **DevSecOps Tutorials** đều được thiết kế chạy trên nền tảng **Docker và Docker Compose** theo triết lý "Docker-first". Bạn chỉ cần cài đặt thành công Docker là có thể vận hành 100% môi trường lab mà không cần cài đặt thêm các công cụ cồng kềnh khác lên máy cá nhân.

Tài liệu này cung cấp hướng dẫn cài đặt chuẩn xác, tối ưu hiệu năng và an toàn cho cả 3 hệ điều hành phổ biến: **Windows, macOS và Linux**.

---

## 📋 Mục lục
1. [Cài đặt trên Windows (WSL 2 Backend)](#1-cài-đặt-trên-windows-wsl-2-backend)
2. [Cài đặt trên macOS (Apple Silicon & Intel)](#2-cài-đặt-trên-macos-apple-silicon--intel)
3. [Cài đặt trên Linux (Ubuntu/Debian)](#3-cài-đặt-trên-linux-ubuntudebian)
4. [Kiểm tra cài đặt thành công](#4-kiểm-tra-cài-đặt-thành-công)
5. [Các lỗi thường gặp & Cách khắc phục (Troubleshooting)](#5-các-lỗi-thường-gặp--cách-khắc-phục-troubleshooting)

---

## 1. Cài đặt trên Windows (WSL 2 Backend)

Để Docker chạy mượt mà và đạt hiệu năng tiệm cận Linux trên Windows, việc sử dụng **WSL 2 (Windows Subsystem for Linux 2)** làm backend là bắt buộc.

### Bước 1: Kích hoạt WSL 2 và Virtualization
1. Mở **PowerShell** dưới quyền Administrator và chạy lệnh sau để tự động cài đặt WSL cùng nhân Ubuntu mới nhất:
   ```powershell
   wsl --install
   ```
2. Khởi động lại máy tính (Restart) theo yêu cầu của Windows.
3. Sau khi khởi động lại, một cửa sổ Ubuntu Terminal sẽ hiện ra, hãy nhập **Username** và **Password** mới cho môi trường Linux của bạn.
4. Đảm bảo tính năng **Virtualization (Ảo hóa)** đã được bật trong BIOS/UEFI của bạn (Kiểm tra trong *Task Manager* -> *Performance* -> *CPU* -> *Virtualization: Enabled*).

### Bước 2: Tải và Cài đặt Docker Desktop
1. Tải bộ cài đặt chính thức: [Docker Desktop for Windows](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe).
2. Chạy tệp tin `.exe` vừa tải về.
3. **Quan trọng**: Tại màn hình cấu hình, hãy đảm bảo chọn tích vào mục **"Use WSL 2 instead of Hyper-V (recommended)"**.
4. Chờ quá trình cài đặt hoàn tất và nhấn **Close and restart** để áp dụng.

### Bước 3: Cấu hình WSL Integration
1. Mở phần mềm **Docker Desktop** vừa cài đặt từ màn hình Desktop.
2. Truy cập vào **Settings** (biểu tượng bánh răng ở góc trên bên phải) -> **Resources** -> **WSL integration**.
3. Tích chọn **Enable integration with my default WSL distro** và chọn bản phân phối Ubuntu của bạn.
4. Nhấn **Apply & restart**.

---

## 2. Cài đặt trên macOS (Apple Silicon & Intel)

macOS hỗ trợ Docker Desktop thông qua môi trường ảo hóa gọn nhẹ. Bạn cần tải đúng phiên bản tương thích với chip CPU máy mình đang dùng.

### Bước 1: Xác định loại Chip CPU trên Mac của bạn
1. Click vào biểu tượng quả táo ở góc trái màn hình -> Chọn **About This Mac** (Giới thiệu về máy Mac này).
2. Kiểm tra dòng **Chip** hoặc **Processor**:
   * Nếu hiển thị **Apple M1, M2, M3, M4...** -> Máy của bạn dùng chip **Apple Silicon (ARM64)**.
   * Nếu hiển thị **Intel Core i5, i7...** -> Máy của bạn dùng chip **Intel (x86_64)**.

### Bước 2: Tải và cài đặt phiên bản phù hợp
1. Truy cập trang tải Docker chính thức cho Mac:
   * Bản cho [Apple Silicon Chip (M1/M2/M3/M4)](https://desktop.docker.com/mac/main/arm64/Docker.dmg) — *Tối ưu hiệu năng vượt trội*.
   * Bản cho [Intel Chip](https://desktop.docker.com/mac/main/amd64/Docker.dmg).
2. Mở tệp `.dmg` vừa tải về, kéo biểu tượng **Docker.app** thả vào thư mục **Applications** (Ứng dụng).
3. Mở **Docker** từ Launchpad/Applications để khởi chạy dịch vụ lần đầu và chấp nhận các điều khoản sử dụng.

---

## 3. Cài đặt trên Linux (Ubuntu/Debian)

Trên môi trường Linux, chúng ta khuyên dùng **Docker Engine (Docker CE)** thay vì Docker Desktop để đạt hiệu năng tối đa (Native Performance), không hao phí tài nguyên cho giao diện đồ họa.

### Bước 1: Gỡ bỏ phiên bản cũ (nếu có)
```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

### Bước 2: Thiết lập Repository chính thống của Docker
```bash
# Cập nhật hệ thống
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Thêm khóa GPG chính thức của Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Thiết lập apt repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Bước 3: Cài đặt Docker Engine & Docker Compose Plugin
```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Bước 4: Cấu hình chạy Docker không cần quyền Root (Post-Installation)
Mặc định dịch vụ Docker yêu cầu quyền `sudo`. Để cấu hình an toàn và thuận tiện khi chạy lab:
1. Tạo group `docker`:
   ```bash
   sudo groupadd docker
   ```
2. Thêm User hiện tại của bạn vào group `docker`:
   ```bash
   sudo usermod -aG docker $USER
   ```
3. Áp dụng thay đổi quyền ngay lập tức mà không cần log out:
   ```bash
   newgrp docker
   ```

---

## 4. Kiểm tra cài đặt thành công

Mở Terminal (trên macOS/Linux) hoặc PowerShell (trên Windows) và thực thi các câu lệnh kiểm thử sau:

### 1. Kiểm tra phiên bản Docker & Docker Compose
```bash
# Phiên bản Docker Client & Engine
docker --version

# Phiên bản Docker Compose (Khuyên dùng v2.x trở lên)
docker compose version
```
*Lưu ý: v2 sử dụng cú pháp `docker compose` (không có dấu gạch ngang), thay thế cho cú pháp cũ `docker-compose` v1 đã bị khai tử.*

### 2. Chạy Container thử nghiệm
```bash
docker run hello-world
```
Nếu màn hình Terminal xuất hiện dòng chữ **"Hello from Docker! This message shows that your installation appears to be working correctly."** thì xin chúc mừng, bạn đã cài đặt thành công hệ thống Docker!

### 3. Thực hành ngay: Tự dựng Trợ lý học tập AI cục bộ (Ollama & WebUI)
Để trải nghiệm ngay sức mạnh của Docker Compose sau khi cài đặt thành công, hãy di chuyển tới bài lab [Tự Dựng Trợ Lý AI Cục Bộ](./02-containerization/02-docker-compose/docker-compose-guide.md#5-lab-thực-chiến-tự-dựng-trợ-lý-học-tập-ai-cục-bộ-ollama--open-webui). Bạn sẽ được tự tay triển khai mô hình ngôn ngữ lớn (LLM) và giao diện Web trò chuyện chạy 100% offline trên chính máy tính của mình vô cùng dễ dàng!

---

## 5. Các lỗi thường gặp & Cách khắc phục (Troubleshooting)

### 🚨 Lỗi 01: "Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?"
*   **Nguyên nhân**: Dịch vụ Docker Engine chưa được khởi động trên máy của bạn.
*   **Cách khắc phục**:
    *   *Windows/macOS*: Hãy chắc chắn ứng dụng **Docker Desktop** đã được mở và biểu tượng cá voi ở thanh Taskbar/Menu Bar hiển thị màu xanh lá cây (Running).
    *   *Linux*: Khởi chạy dịch vụ bằng lệnh:
        ```bash
        sudo systemctl start docker
        # Tự khởi động cùng hệ thống
        sudo systemctl enable docker
        ```

### 🚨 Lỗi 02: Lỗi phân quyền Socket "Permission denied" khi chạy Docker trên Linux/macOS
*   **Nguyên nhân**: User hiện tại chưa được cấp quyền giao tiếp với file socket của Docker daemon.
*   **Cách khắc phục**: Hãy thực hiện chính xác các bước ở **Mục 3 - Bước 4** để thêm user hiện tại vào group `docker`. Tránh lạm dụng lệnh `sudo docker` vì nó sẽ tạo ra các tệp tin thuộc quyền `root` inside máy của bạn, gây ra nhiều lỗi phân quyền sau này.

### 🚨 Lỗi 03: "Virtualization must be enabled in the BIOS" trên Windows WSL 2
*   **Nguyên nhân**: Tính năng ảo hóa phần cứng (Intel VT-x hoặc AMD-V) bị tắt trong BIOS/UEFI của bo mạch chủ (Mainboard).
*   **Cách khắc phục**: 
    1. Khởi động lại máy tính, nhấn phím truy cập BIOS (F2, F12, Del tùy dòng máy).
    2. Tìm kiếm mục **Virtualization Technology**, **Intel Virtual Technology**, hoặc **SVM Mode** -> Chuyển sang trạng thái **Enabled**.
    3. Lưu lại và khởi động lại vào Windows.
