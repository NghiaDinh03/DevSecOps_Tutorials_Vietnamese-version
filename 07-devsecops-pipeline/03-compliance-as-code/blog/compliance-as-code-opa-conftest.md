# 🛡️ Kiểm Soát Tuân Thủ Chính Sách Bảo Mật Hạ Tầng Bằng Open Policy Agent / Conftest

*   **Tác giả gốc:** Styra (OPA Creators) & CNCF Compliance Working Group
*   **Dịch thuật & Biên soạn:** Đội ngũ DevSecOps Tutorials (Vietnamese version)
*   **Liên kết bài viết gốc:** [Styra Blog - Guide to Policy as Code and Conftest](https://www.styra.com/blog/introduction-to-conftest-and-policy-as-code/)

---

## 📌 Giới thiệu: Compliance as Code là gì?

Khi doanh nghiệp mở rộng quy mô, số lượng tệp tin cấu hình hạ tầng dạng mã (IaC) như Dockerfiles, Terraform HCL, Kubernetes Manifests sẽ tăng lên nhanh chóng. Việc thủ công rà soát từng tệp cấu hình để đảm bảo chúng tuân thủ các chính sách bảo mật nội bộ (v.d. không chạy dưới quyền root, luôn cấu hình giới hạn tài nguyên) là điều hoàn toàn bất khả thi.

⚠️ **Hậu quả từ sai lệch cấu hình (Misconfiguration):** Theo các báo cáo bảo mật đám mây, hơn 80% sự cố rò rỉ dữ liệu trên Cloud bắt nguồn từ các sai sót trong cấu hình hệ thống (như mở cổng S3 bucket công khai, gán quyền quản trị bừa bãi).

Để giải quyết triệt để vấn đề này, triết lý **Compliance as Code (Tuân thủ dưới dạng mã)** hay **Policy as Code** ra đời. Bằng cách viết các quy tắc bảo mật thành mã nguồn, chúng ta có thể tự động hóa 100% khâu kiểm thử tuân thủ hạ tầng ngay tại pipeline CI/CD trước khi tài nguyên được khởi tạo.

Bài viết này hướng dẫn chi tiết cách viết luật bảo mật bằng ngôn ngữ **Rego** của **Open Policy Agent (OPA)** và thực thi quét tự động bằng công cụ **Conftest**.

---

## ⚙️ Bộ Công Cụ OPA & Conftest Hoạt Động Như Thế Nào?

*   **Open Policy Agent (OPA):** Là một bộ máy kiểm soát chính sách đa năng mã nguồn mở (thuộc dự án tốt nghiệp CNCF Graduated Project). OPA sử dụng một ngôn ngữ khai báo chuyên dụng mang tên **Rego** để định nghĩa các chính sách bảo mật.
*   **Conftest:** Là một tiện ích dòng lệnh siêu nhẹ được xây dựng dựa trên OPA, giúp người dùng dễ dàng chạy các chính sách Rego để kiểm tra trực tiếp các tệp tin cấu hình có cấu trúc như YAML, JSON, Dockerfile, Terraform HCL, v.v.

---

## 🛠️ Quy Trình 3 Bước Triển Khai Kiểm Soát Tuân Thủ

---

### Bước 1: Viết Luật Tuân Thủ (Rego Policy File)
Chúng ta sẽ viết các quy tắc bảo mật để kiểm tra các file cấu hình.

*Tạo thư mục `policy` và tệp quy tắc `policy/k8s_security.rego`:*
```rego
package main

# Quy tắc 1: Cấm Deployment chạy dưới quyền đặc quyền cao (Privileged Mode)
deny[msg] {
    # 1. Lọc các tài nguyên có định dạng là Deployment
    input.kind == "Deployment"
    
    # 2. Duyệt qua toàn bộ các container trong Pod template
    container := input.spec.template.spec.containers[_]
    
    # 3. Kiểm tra xem cờ privileged có được thiết lập là true hay không
    container.securityContext.privileged == true
    
    # 4. Trả về thông báo lỗi nếu vi phạm chính sách
    msg := sprintf("LỖI TUÂN THỦ: Container '%v' trong Deployment '%v' không được phép chạy ở chế độ Đặc Quyền (Privileged)!", [container.name, input.metadata.name])
}

# Quy tắc 2: Bắt buộc phải cấu hình giới hạn tài nguyên CPU và RAM
deny[msg] {
    input.kind == "Deployment"
    container := input.spec.template.spec.containers[_]
    
    # Kiểm tra xem có bị thiếu khai báo CPU hoặc Memory Limits hay không
    not container.resources.limits.cpu
    msg := sprintf("LỖI TUÂN THỦ: Container '%v' trong Deployment '%v' bắt buộc phải được thiết lập giới hạn tài nguyên CPU (CPU Limit)!", [container.name, input.metadata.name])
}

deny[msg] {
    input.kind == "Deployment"
    container := input.spec.template.spec.containers[_]
    
    not container.resources.limits.memory
    msg := sprintf("LỖI TUÂN THỦ: Container '%v' trong Deployment '%v' bắt buộc phải được thiết lập giới hạn tài nguyên Bộ Nhớ (Memory Limit)!", [container.name, input.metadata.name])
}
```

---

### Bước 2: Chạy kiểm tra tĩnh cục bộ bằng Conftest CLI
Để kiểm tra xem các tệp tin cấu hình của bạn có đạt chuẩn hay không, hãy chạy cài đặt nhanh Conftest CLI và quét thử.

*Ví dụ một tệp cấu hình Deployment vi phạm chính sách `deployment-unsafe.yaml`:*
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vulnerable-web-app
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: web-container
        image: nginx:latest
        securityContext:
          privileged: true # Vi phạm Quy tắc 1!
        resources:
          requests:
            cpu: 100m
          # Thiếu limits! Vi phạm Quy tắc 2!
```

Chạy lệnh quét tuân thủ bằng Conftest:
```bash
conftest test deployment-unsafe.yaml
```

*Kết quả trả về từ CLI lập tức báo lỗi và chặn đứng:*
```bash
FAIL - deployment-unsafe.yaml - main - LỖI TUÂN THỦ: Container 'web-container' trong Deployment 'vulnerable-web-app' không được phép chạy ở chế độ Đặc Quyền (Privileged)!
FAIL - deployment-unsafe.yaml - main - LỖI TUÂN THỦ: Container 'web-container' trong Deployment 'vulnerable-web-app' bắt buộc phải được thiết lập giới hạn tài nguyên CPU (CPU Limit)!
FAIL - deployment-unsafe.yaml - main - LỖI TUÂN THỦ: Container 'web-container' trong Deployment 'vulnerable-web-app' bắt buộc phải được thiết lập giới hạn tài nguyên Bộ Nhớ (Memory Limit)!

3 tests, 0 Passed, 0 Warnings, 3 Failures, 0 Exceptions
```

---

### Bước 3: Tích hợp Conftest vào CI/CD Pipeline
Hãy biến việc kiểm tra tuân thủ thành một bước kiểm thử bắt buộc trong pipeline của bạn để ngăn chặn các cấu hình không an toàn được merge vào nhánh chính.

*Ví dụ tích hợp vào GitLab CI `.gitlab-ci.yml`:*
```yaml
stages:
  - test

compliance-test:
  stage: test
  image: instrumenta/conftest:latest
  script:
    # Quét toàn bộ các tệp manifest trong thư mục k8s/ sử dụng các quy tắc trong policy/
    - conftest test k8s/
```

---

## 💎 Lợi Ích Vượt Trội Của Compliance as Code

1.  **Thực thi chính sách nhất quán (Consistent Enforcement):** Không còn sự phán xét chủ quan của con người. Mọi cấu hình đều được đánh giá qua bộ luật logic rõ ràng, công bằng 100%.
2.  **Phát hiện sớm (Shift-Left Feedback):** Lập trình viên nhận được phản hồi lỗi cấu hình ngay khi họ mở Pull Request, giúp họ chủ động sửa đổi nhanh chóng mà không cần chờ đến lúc audit bảo mật.
3.  **Tự động hóa báo cáo kiểm toán (Automated Auditing):** Bằng cách xuất kết quả quét ra định dạng JSON/JUnit, bạn có thể dễ dàng lưu trữ và cung cấp bằng chứng tuân thủ bảo mật cho các đơn vị kiểm toán bên ngoài (ISO 27001, PCI-DSS, SOC 2).

---

## 📝 Tổng kết

Làm chủ Compliance as Code với OPA và Conftest là bước tiến quan trọng để xây dựng một hạ tầng đám mây trưởng thành, an toàn tuyệt đối. Việc số hóa các chính sách bảo mật thành mã nguồn giúp doanh nghiệp của bạn tự tin mở rộng hệ thống phần mềm mà luôn đảm bảo tính an toàn nghiêm ngặt nhất!
