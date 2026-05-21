# 🛡️ Tích Hợp Trivy Và SonarQube Vào CI/CD Pipeline: Chặn Đứng Lỗ Hổng Từ Giai Đoạn Code

*   **Tác giả gốc:** DevSecOps Professional Guild & SonarQube Community
*   **Dịch thuật & Biên soạn:** Đội ngũ DevSecOps Tutorials (Vietnamese version)
*   **Liên kết bài viết gốc:** [SonarSource Blog - DevSecOps and Shift-Left Security](https://www.sonarsource.com/solutions/devsecops/)

---

## 📌 Giới thiệu: Triết Lý Dịch Chuyển Về Bên Trái (Shift-Left Security)

Trong quy trình phát triển phần mềm truyền thống, kiểm tra an ninh mạng (Security Testing) thường là khâu cuối cùng được thực hiện bởi đội ngũ Pentester trước khi ứng dụng được đưa ra thị trường. 

⚠️ **Hậu quả đắt giá:** Việc phát hiện lỗ hổng ở giai đoạn cuối cực kỳ tốn kém thời gian và chi phí để sửa chữa. Đôi khi, việc sửa một lỗi kiến trúc hệ thống buộc đội ngũ phải đập đi xây lại toàn bộ mã nguồn, làm chậm tiến độ bàn giao sản phẩm của doanh nghiệp.

Để giải quyết triệt để rủi ro này, phương pháp **DevSecOps** đưa ra triết lý **Shift-Left Security (Dịch chuyển bảo mật về bên trái)**: Tích hợp các công cụ quét bảo mật tự động ngay từ những giây phút đầu tiên khi lập trình viên viết code và thực hiện commit lên Git, thông qua các chốt chặn tự động trên **CI/CD Pipeline**.

Bài viết này hướng dẫn chi tiết cách tích hợp hai công cụ bảo mật hàng đầu thế giới hiện nay là **SonarQube** (quét mã nguồn tĩnh - SAST) và **Aquasec Trivy** (quét ảnh container & dependencies - SCA) vào quy trình CI/CD tự động.

---

## 🔍 Phân Biệt Hai Chốt Chặn Bảo Mật Cốt Lõi

```
Lập trình viên Commit Code ---> [ SAST: SonarQube ] ---> Build Docker Image ---> [ SCA: Trivy ] ---> Deploy Prod
                                 (Quét lỗi mã nguồn)                              (Quét Layer & CVEs)
```

### 1. SAST (Static Application Security Testing) với SonarQube
*   **Nhiệm vụ:** Phân tích cú pháp mã nguồn tĩnh mà không cần chạy ứng dụng.
*   **Mục tiêu phát hiện:** Các lỗi logic code nguy hiểm (Code Smells), rò rỉ mật khẩu nhúng cứng (hardcoded secrets), và các lỗ hổng bảo mật chuẩn **OWASP Top 10** (như SQL Injection, Cross-Site Scripting - XSS, Path Traversal).

### 2. SCA (Software Composition Analysis) với Trivy
*   **Nhiệm vụ:** Phân tích các thư viện mã nguồn mở bên thứ ba cài thêm (`npm`, `pip`, `maven`) và các Layer bên trong Docker Image.
*   **Mục tiêu phát hiện:** Các lỗ hổng đã được công bố trên cơ sở dữ liệu quốc gia (CVEs - Common Vulnerabilities and Exposures), phát hiện ảnh nền không an toàn hoặc chứa mã độc.

---

## 🛠️ Cấu Hình Tích Hợp Thực Chiến Vào GitHub Actions Pipeline

Dưới đây là một kịch bản pipeline CI/CD hoàn chỉnh bằng **GitHub Actions** tích hợp đồng thời cả hai chốt chặn bảo mật. Nếu phát hiện lỗ hổng ở mức độ Nghiêm trọng (`CRITICAL`), pipeline sẽ **tự động bị hủy (fail)** và chặn đứng việc deploy lên Production.

*Tạo tệp cấu hình pipeline `.github/workflows/devsecops-pipeline.yml`:*
```yaml
name: DevSecOps Secure Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  # ==========================================
  # Giai đoạn 1: Quét An Toàn Mã Nguồn Tĩnh (SAST)
  # ==========================================
  sast-scan:
    name: Quét mã nguồn với SonarQube
    runs-on: ubuntu-latest
    steps:
      - name: Tải mã nguồn từ Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Yêu cầu tải đầy đủ lịch sử commit để SonarQube phân tích chính xác

      - name: Thực thi quét bảo mật SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@v2
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        # Cấu hình tham số phân tích
        with:
          args: >
            -Dsonar.projectKey=my-secure-app
            -Dsonar.sources=.
            -Dsonar.exclusions=**/node_modules/**,**/*.spec.ts
            -Dsonar.qualitygate.wait=true # Chờ máy chủ kiểm tra chất lượng (Quality Gate), nếu thất bại sẽ báo lỗi pipeline

  # ==========================================
  # Giai đoạn 2: Build & Quét Ảnh Container (SCA)
  # ==========================================
  container-security:
    name: Build & Quét Docker Image với Trivy
    needs: sast-scan # Chỉ chạy khi giai đoạn SAST vượt qua an toàn
    runs-on: ubuntu-latest
    steps:
      - name: Tải mã nguồn từ Repository
        uses: actions/checkout@v4

      - name: Thiết lập Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Xây dựng ảnh Docker (Local Build)
        run: |
          docker build -t my-app:${{ github.sha }} .

      - name: Chạy quét bảo mật với Aquasecurity Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'my-app:${{ github.sha }}'
          format: 'table' # Xuất kết quả trực quan dạng bảng trên màn hình console
          exit-code: '1'  # Quan trọng: Trả về exit code 1 (Làm sập pipeline) nếu phát hiện lỗ hổng
          ignore-unfixed: true # Bỏ qua các CVE chưa có bản vá để tránh làm phiền (false positive)
          severity: 'CRITICAL,HIGH' # Chỉ chặn các lỗ hổng mức độ CAO và NGUY HIỂM

      - name: Đẩy ảnh lên Registry an toàn (Chỉ chạy khi Trivy không phát hiện lỗi)
        if: success()
        run: |
          echo "Trivy đã kiểm duyệt an toàn! Tiến hành push image lên Registry..."
          # docker push my-app:${{ github.sha }}
```

---

## 💎 Quy Tắc Thiết Lập Hàng Rào Chất Lượng (Quality Gates)

Một sai lầm phổ biến là tích hợp công cụ quét nhưng chỉ để "xem cho biết" (chỉ ghi log báo cáo và vẫn cho phép pipeline chạy tiếp). Để bảo vệ hệ thống triệt để, bạn cần thực thi quy tắc cứng **Quality Gates**:

1.  **Cấm tuyệt đối lỗ hổng CRITICAL/HIGH:** Nếu phát hiện bất kỳ CVE nào thuộc nhóm nguy hiểm chưa được vá, bắt buộc phải dừng pipeline.
2.  **Khóa cứng rò rỉ Secrets:** Nếu SonarQube phát hiện chuỗi ký tự giống API Key nhúng trong code, lập tức chặn compile.
3.  **Tỷ lệ bao phủ code bằng Unit Test (Code Coverage) tối thiểu:** Định nghĩa tỷ lệ bao phủ test phải > 80% trước khi cho phép deploy.

---

## 📝 Tổng kết

Tích hợp tự động hóa quét bảo mật bằng SonarQube và Trivy giúp doanh nghiệp hiện thực hóa thành công chiến lược **Shift-Left Security**. Việc chặn đứng các rủi ro bảo mật ngay từ những dòng code đầu tiên giúp bạn tự tin vận hành các sản phẩm phần mềm chất lượng cao, an toàn tuyệt đối trước mọi mối đe dọa mạng!
