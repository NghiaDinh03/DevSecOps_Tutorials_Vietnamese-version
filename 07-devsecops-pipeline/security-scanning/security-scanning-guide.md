# 🔍 Sub-module 01: Quét bảo mật tự động (SAST, SCA, DAST & Container Scanning)

Sub-module này cung cấp kiến thức nền tảng và chuyên sâu về các phương pháp quét bảo mật tự động trong vòng đời phát triển phần mềm an toàn (SSDLC), giúp bạn làm chủ các chốt chặn an ninh tối quan trọng.

---

## 1. Phân loại 4 Phương pháp Quét Bảo mật Cốt lõi

Để bảo vệ ứng dụng toàn diện, DevSecOps chia quy trình quét thành 4 phương pháp chính:

```mermaid
graph TD
    A["Mã nguồn tĩnh (Code / Config)"] -->|SAST / SCA Scan| B["Build Image"]
    B -->|Container Scanning| C["Deploy lên Staging / UAT"]
    C -->|DAST Scan (Dynamic Attack)| D["Sản phẩm chạy Production"]
    style A fill:#e3f2fd,stroke:#1e88e5,color:#000
    style B fill:#fff9c4,stroke:#fbc02d,color:#000
    style C fill:#e8f5e9,stroke:#388e3c,color:#000
    style D fill:#ffe0b2,stroke:#f57c00,color:#000
```

### 1.1. SAST (Static Application Security Testing) — Quét mã nguồn tĩnh
*   **Đặc điểm**: Phân tích mã nguồn "bên trong" (White-box testing) mà **không cần chạy ứng dụng**. Công cụ sẽ duyệt qua cây cú pháp trừu tượng (AST) của code để tìm các mẫu viết code thiếu an toàn.
*   **Phát hiện**: Lỗi SQL Injection, Cross-Site Scripting (XSS), sử dụng thuật toán mã hóa yếu (MD5, SHA1), hardcode credentials.
*   **Thời điểm chạy**: Ngay khi Developer tạo Pull Request (PR) hoặc Commit code.

### 1.2. SCA (Software Composition Analysis) — Quét thư viện bên thứ ba
*   **Đặc điểm**: Phân tích các thư viện phụ thuộc (Dependencies) khai báo trong các file quản lý gói (như `package.json`, `pom.xml`, `requirements.txt`) để đối chiếu với cơ sở dữ liệu lỗ hổng bảo mật toàn cầu (NVD, CVE).
*   **Phát hiện**: Sử dụng thư viện lỗi thời, thư viện chứa lỗ hổng bảo mật nghiêm trọng (như lỗ hổng **Log4Shell** huyền thoại), vi phạm bản quyền giấy phép (License Compliance).
*   **Thời điểm chạy**: Cùng lúc với SAST.

### 1.3. Container Scanning — Quét lỗ hổng Image
*   **Đặc điểm**: Quét các lớp (Layers) của Docker Image sau khi được build thành công để tìm các lỗ hổng bảo mật của hệ điều hành nền (Base OS Packages như OpenSSL, curl, systemd) và mã độc.
*   **Phát hiện**: Docker Image chứa phiên bản OpenSSL bị dính lỗi rò rỉ bộ nhớ (Heartbleed).
*   **Thời điểm chạy**: Ngay sau bước Build Image, trước khi đẩy lên Registry (Docker Hub, Harbor).

### 1.4. DAST (Dynamic Application Security Testing) — Quét hộp đen động
*   **Đặc điểm**: Đóng vai trò là một hacker tấn công từ bên ngoài vào ứng dụng **khi ứng dụng đang chạy** (Black-box testing). Công cụ sẽ gửi các payload độc hại (SQL injection, XSS) vào các endpoint, form input để xem phản hồi của ứng dụng.
*   **Phát hiện**: Lỗi cấu hình Header bảo mật yếu, rò rỉ thông tin qua thông báo lỗi (Error handling), các API endpoint không được xác thực.
*   **Thời điểm chạy**: Sau khi deploy ứng dụng lên môi trường Staging/Testing.

---

## 2. So sánh và Lựa chọn Công cụ Tiêu biểu

| Phương pháp | Công cụ phổ biến | Đặc điểm DevSecOps |
|---|---|---|
| **SAST** | **SonarQube**, Semgrep, Veracode | **SonarQube** rất mạnh cho đa ngôn ngữ, tích hợp thang đo Quality Gate để chặn deploy nếu code rò rỉ hoặc thiếu an toàn. |
| **SCA & Container** | **Trivy**, Snyk, Grype | **Trivy** (phát triển bởi Aqua Security) là công cụ vô địch về tốc độ, siêu nhẹ, quét được cả Git repository, File system, Docker Image và cả cấu hình Kubernetes. |
| **DAST** | **OWASP ZAP**, Burp Suite | **OWASP ZAP** hỗ trợ chế độ tự động hóa (ZAP CLI/Daemon) cực tốt để tích hợp chạy ngầm trong pipeline. |

---

## 3. Chiến lược tích hợp quét bảo mật hiệu quả (Security Hardening for Pipelines)

Nếu bạn cấu hình quét bảo mật không khéo, nó có thể làm chậm tốc độ release của doanh nghiệp, dẫn đến việc lập trình viên tìm cách bypass (bỏ qua) chốt chặn:

1.  **Cơ chế Cache cơ sở dữ liệu**: Các công cụ như Trivy cần tải database lỗ hổng (Vulnerability DB) nặng hàng trăm MB từ internet. Bắt buộc phải cấu hình cache thư mục này (`/root/.cache/trivy`) trong CI/CD Runner để tránh việc tải lại mỗi lần chạy, rút ngắn thời gian quét từ 5 phút xuống còn 5 giây!
2.  **Thiết lập Ngưỡng cảnh báo (Severity Threshold)**: Chỉ cấu hình chặn đứng (Fail/Block) pipeline đối với các lỗ hổng mức độ **CRITICAL (Nghiêm trọng)** và **HIGH (Cao)**. Các lỗ hổng mức độ MEDIUM hoặc LOW chỉ nên hiển thị cảnh báo để tránh ngắt quãng công việc của lập trình viên một cách không cần thiết.
3.  **Tự động bỏ qua lỗi giả (Vulnerability Exception)**: Sử dụng các tệp tin cấu hình ngoại lệ (ví dụ: `.trivyignore`) để khai báo bỏ qua các lỗ hổng đã được xác nhận là an toàn hoặc không thể khai thác trong ngữ cảnh ứng dụng của bạn, tránh báo động giả (False Positive).

---

## 📚 Tài liệu đọc thêm khuyến nghị

*   **[Trivy Documentation - Official](https://aquasecurity.github.io/trivy/latest/)** — Hướng dẫn chi tiết các chế độ quét (fs, image, k8s, config) của Trivy.
*   **[OWASP ZAP Automation Framework](https://www.zaproxy.org/docs/automate/)** — Cách tự động hóa quét bảo mật động DAST trong CI/CD.

---

## 🚀 Bước tiếp theo
Hãy thực hành bài Lab tự động hóa quét bảo mật cục bộ: sử dụng **Trivy** thực hiện quét tĩnh mã nguồn (SCA) và quét Docker Image, sau đó sử dụng **OWASP ZAP** giả lập tấn công động (DAST) kiểm thử bảo mật cho ứng dụng web:

👉 **[Bắt đầu bài Lab thực hành: Pipeline Security](./labs/lab-pipeline-security/lab-instructions.md)**
