# 🧪 Lab 03.01: Dựng GitHub Self-Hosted Runner An Toàn & Quét Bảo Mật Tự Động (Trivy Scan Pipeline)

## 🎯 Mục tiêu bài Lab (Lab Objectives)
Sau khi hoàn thành bài lab này, học viên sẽ:
*   Hiểu rõ cách cấu hình và đăng ký một **Bộ thực thi cục bộ (Self-hosted Runner)** chạy an toàn bên trong Docker container để kết nối với kho chứa GitHub.
*   Nắm vững cơ chế vận hành của Runner khi nhận và thực thi Job từ xa.
*   Biết cách viết tệp cấu hình **GitHub Actions Workflow** để lập lịch quét an toàn mã nguồn tĩnh và thư viện phụ thuộc bằng **Trivy Scanner (SCA)**.
*   Thực hành tốt nguyên tắc bảo mật: Chạy Runner không đặc quyền và **không mount `/var/run/docker.sock`** để triệt tiêu hoàn toàn nguy cơ chiếm quyền điều khiển máy host (Container Breakout).

---

## 💻 Yêu cầu hệ thống (Prerequisites)
1.  Máy host đã cài đặt sẵn **Docker** và **Docker Compose**.
2.  Một tài khoản cá nhân trên **GitHub** (Miễn phí).
3.  Kết nối internet ổn định.

---

## 🛠️ Các bước thực hiện chi tiết (Step-by-Step Instructions)

### Bước 1: Tạo GitHub Repository & Lấy mã xác thực Runner Token
Để kết nối Runner cục bộ với GitHub, bạn cần tạo một kho lưu trữ và lấy mã token đăng ký duy nhất:

1.  Truy cập GitHub cá nhân, tạo một Repository mới đặt tên là: `devsecops-cicd-lab` (chọn chế độ **Public** hoặc **Private** đều được).
2.  Sau khi tạo xong, truy cập vào menu **Settings** ➔ góc trái chọn mục **Actions** ➔ Click vào **Runners**.
3.  Click vào nút **New self-hosted runner** ở góc phải.
4.  Chọn hệ điều hành là **Linux** và kiến trúc **x64**.
5.  Cuộn xuống phần **Configure**, bạn sẽ nhìn thấy:
    *   URL của repository (Ví dụ: `https://github.com/your-username/devsecops-cicd-lab`)
    *   Mã **Registration Token** (Ví dụ một chuỗi dài: `A7B5C6...`). **Hãy copy mã token này và URL để dùng cho bước tiếp theo.**

---

### Bước 2: Thiết lập cấu hình bảo mật cục bộ (.env)
Quay trở lại thư mục bài lab trên máy của bạn (`03-cicd-automation/github-actions/labs/lab-github-actions-runner/`). Tạo một tệp tin cấu hình môi trường `.env` nằm cùng cấp với tệp `docker-compose.yml` để lưu trữ mã bảo mật:

```bash
# Tạo file .env và điền thông tin của bạn
GITHUB_REPO_URL=https://github.com/your-username/devsecops-cicd-lab
GITHUB_RUNNER_TOKEN=MÃ_REGISTRATION_TOKEN_BẠN_VỪA_COPY
```

> [!IMPORTANT]
> **Quy tắc an toàn:** Tuyệt đối không commit tệp `.env` này lên Git vì nó chứa mã token bảo mật truy cập trực tiếp hệ thống của bạn! Tệp này đã được cấu hình tự động loại trừ trong `.gitignore`.

---

### Bước 3: Khởi chạy Self-Hosted Runner bằng Docker Compose
Tiến hành khởi chạy tiến trình Runner bên trong container độc lập:

1.  Mở PowerShell (Windows) hoặc Terminal (Linux/macOS) và trỏ tới thư mục bài lab.
2.  Chạy lệnh khởi dựng duy nhất:
    ```bash
    docker-compose up -d
    ```
3.  Kiểm tra nhật ký khởi chạy để đảm bảo Runner đã đăng ký thành công với GitHub Server:
    ```bash
    docker logs -f devsecops-github-runner
    ```
    *Nếu bạn nhìn thấy log hiển thị dòng: `√ Settings Saved.` và `Listening for Jobs` nghĩa là Runner đã kết nối thành công và đang túc trực nhận việc.*

---

### Bước 4: Xác minh trạng thái trên giao diện GitHub
1.  Quay lại trang trình duyệt Web của GitHub tại mục: **Settings** ➔ **Actions** ➔ **Runners**.
2.  F5 tải lại trang, bạn sẽ thấy xuất hiện một dòng runner mới:
    *   **Name:** `devsecops-local-runner`
    *   **Status:** `Idle` (Màu xanh lá - Sẵn sàng)
    *   **Labels:** `self-hosted`, `local-trivy`

---

### Bước 5: Viết Workflow tự động quét bảo mật mã nguồn
Bây giờ, chúng ta sẽ cấu hình quy trình quét an toàn mã nguồn.

1.  Clone repository `devsecops-cicd-lab` bạn vừa tạo về máy tính cá nhân.
2.  Tạo cấu trúc thư mục đặc biệt của GitHub Actions: `.github/workflows/`
3.  Tạo mới một tệp tin cấu hình YAML đặt tên là `trivy-scan.yml` bên trong thư mục đó:

```yaml
name: DevSecOps Security Scan Pipeline

# Kích hoạt pipeline mỗi khi có commit đẩy lên branch main
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  trivy-scan:
    name: Quét lỗ hổng bảo mật bằng Trivy
    # Chỉ định chạy Job này TRÊN runner cục bộ của bạn
    runs-on: [self-hosted, local-trivy]

    steps:
      # Bước 1: Kéo mã nguồn về thư mục làm việc của Runner
      - name: Checkout Code
        uses: actions/checkout@v4

      # Bước 2: Quét lỗ hổng thư viện phụ thuộc (SCA) & File cấu hình
      - name: Run Trivy vulnerability scanner (Filesystem Scan)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'table'
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'
          exit-code: '1' # Ép buộc pipeline thất bại nếu phát hiện lỗ hổng nghiêm trọng
```

---

### Bước 6: Commit code & Quan sát cơ chế hoạt động thực tế
Hãy giả lập một dự án Node.js chứa thư viện cũ bị lỗi bảo mật để kiểm tra sức mạnh của Trivy:

1.  Tạo một tệp tin `package.json` đơn giản chứa thư viện cũ `express: 4.16.0` (phiên bản này chứa nhiều lỗ hổng bảo mật nghiêm trọng):
    ```json
    {
      "name": "vulnerable-app",
      "version": "1.0.0",
      "dependencies": {
        "express": "4.16.0"
      }
    }
    ```
2.  Commit và đẩy toàn bộ mã nguồn lên GitHub:
    ```bash
    git add .
    git commit -m "feat: bổ sung mã nguồn và pipeline quét Trivy"
    git push origin main
    ```
3.  **Quan sát Terminal cục bộ của bạn** (nơi lệnh `docker logs -f devsecops-github-runner` đang chạy). Bạn sẽ thấy log nhấp nháy liên tục:
    *   Runner nhận job: `Running job: Quét lỗ hổng bảo mật bằng Trivy`
    *   Nó tự động tải Trivy DB về đĩa cứng cục bộ.
    *   Thực hiện phân tích tệp `package.json` và in ra một bảng danh sách các lỗi bảo mật nghiêm trọng của express 4.16.0 ngay tại terminal cục bộ của bạn!
4.  **Quan sát giao diện GitHub**: Truy cập tab **Actions** trên repository GitHub của bạn, bạn sẽ thấy pipeline chuyển sang màu đỏ 🔴 (Thất bại) do chúng ta cấu hình `exit-code: '1'`. Điều này đã bảo vệ dự án thành công bằng cách ngăn chặn code lỗi được đi tiếp!

---

## 📖 Câu hỏi tự ôn tập & Gỡ lỗi (Review & Troubleshooting)
1.  *Tại sao trong tệp `trivy-scan.yml` chúng ta chỉ định `scan-type: 'fs'` (quét thư mục) mà không build Docker Image để quét? Việc này giúp loại bỏ nguy cơ an ninh nào cho Runner?*
2.  *Nếu kẻ tấn công gửi một Pull Request sửa đổi nội dung tệp `trivy-scan.yml` của bạn để thêm câu lệnh độc hại (`rm -rf /`), cơ chế phòng thủ nào của GitHub Actions mặc định sẽ ngăn cản lệnh này chạy tự động trên Self-hosted Runner của bạn?*
3.  *Làm thế nào để dọn dẹp sạch sẽ môi trường lab sau khi học xong?*
    *   *Trả lời:* Gõ lệnh `docker-compose down -v` tại thư mục lab để xóa container và mạng ảo an toàn. Truy cập GitHub Settings -> Runners để xóa runner đã offline.
