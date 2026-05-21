# 📜 Sub-module 03: Kiểm duyệt tuân thủ tự động (Compliance-as-Code với OPA/Conftest)

Sub-module này cung cấp kiến thức nền tảng và thực tiễn nâng cao về **Compliance-as-Code** — phương pháp viết các quy tắc tuân thủ an toàn thông tin dưới dạng mã nguồn bằng công cụ **Open Policy Agent (OPA)** và **Conftest**.

---

## 1. Khái niệm Compliance-as-Code

Trong quy trình vận hành truyền thống, việc kiểm duyệt an toàn hệ thống (Audit) được thực hiện định kỳ bằng cách mời các chuyên gia an ninh bên ngoài vào kiểm tra hàng ngàn trang tài liệu PDF hướng dẫn bảo mật (như chuẩn CIS Benchmarks, ISO 27001). Quy trình này rất chậm, tốn kém và dễ sai sót.
**Compliance-as-Code (Tuân thủ dạng Code)** giải quyết triệt để vấn đề này. Toàn bộ các quy tắc bảo mật (như *"Không được chạy container quyền root"*, *"Không được mở cổng SSH ra ngoài internet"*) sẽ được viết thành mã nguồn. Quy trình kiểm duyệt sẽ diễn ra tự động 100% trên Pipeline CI/CD đối với mọi tệp tin cấu hình trước khi chúng được đưa vào vận hành.

---

## 2. Tìm hiểu Open Policy Agent (OPA) & Conftest

Để tách biệt logic ra quyết định chính sách (Policy Decision) khỏi logic thực thi chính sách (Policy Enforcement), tổ chức CNCF đã phát triển **Open Policy Agent (OPA)**.

```mermaid
graph TD
    Config["Tệp Cấu hình<br>(Dockerfile / YAML / JSON)"] -->|1. Nạp đầu vào| Conftest[Conftest CLI]
    Rego["Chính sách Bảo mật<br>(Mã Rego)"] -->|2. Nạp chính sách| Conftest
    Conftest -->|3. Biên dịch & Đánh giá| OPA[OPA Policy Engine]
    Conftest -->>Result["Kết quả Kiểm duyệt<br>(PASS / WARN / FAIL)"]
    style Conftest fill:#00e676,stroke:#00e676,color:#000
    style Rego fill:#e040fb,stroke:#e040fb,color:#fff
```

### 2.1. OPA (Open Policy Agent) là gì?
OPA là một bộ máy ra quyết định chính sách đa năng, gọn nhẹ. Bạn nạp vào OPA dữ liệu đầu vào dạng JSON (v.d: cấu hình một Pod Kubernetes) và các tệp chính sách viết bằng ngôn ngữ **Rego**. OPA sẽ đánh giá và trả về câu trả lời duy nhất: *Được phép (Allow) hay Bị từ chối (Deny)*.

### 2.2. Conftest là gì?
Mặc dù OPA rất mạnh, tuy nhiên cú pháp chạy OPA thô khá phức tạp. Do đó, công cụ **Conftest** ra đời. Conftest là một tiện ích dòng lệnh (CLI) cực kỳ gọn nhẹ được xây dựng dựa trên lõi OPA, chuyên dùng để viết các kiểm thử kiểm duyệt (Tests) đối với các file cấu hình tĩnh như **Dockerfiles, Kubernetes Manifests, Terraform code, Serverless configs**.

---

## 3. Ngôn ngữ chính sách Rego

OPA sử dụng ngôn ngữ khai báo **Rego**. Rego được thiết kế đặc biệt để dễ dàng duyệt qua các cấu trúc dữ liệu JSON/YAML phức tạp và đưa ra kết luận logic.

### 3.1. Cú pháp Rego cơ bản
Một tệp tin chính sách Rego thường gồm:
*   `package`: Khai báo không gian tên nhóm chính sách.
*   `deny`: Quy tắc định nghĩa khi nào thì từ chối hành động. Nếu nội dung bên trong khối `deny` là đúng (True), quy tắc kiểm duyệt sẽ thất bại (FAIL) và trả về thông báo lỗi tương ứng.

*Ví dụ một quy tắc chặn chạy container dưới quyền Root:*
```rego
package main

# Quy tắc cấm chạy user root
deny[msg] {
    # Lấy dòng khai báo USER trong Dockerfile
    input[i].Cmd == "user"
    val := input[i].Value
    # Nếu giá trị USER là root hoặc uid 0
    val[_] == "root"
    msg := "⚠️ BẢO MẬT: Phát hiện lỗi cấu hình Dockerfile! CẤM chạy container bằng tài khoản root."
}
```

---

## 4. Tầm quan trọng của Compliance-as-Code trong SecOps

Tích hợp Compliance-as-Code giúp tổ chức đạt được **Gia cố bảo mật chủ động (Proactive Hardening)**:
1.  **Chốt chặn cổng kiểm duyệt (Quality Gate)**: Tự động chặn đứng các lập trình viên lười biếng viết Dockerfile cẩu thả không khai báo User non-root hoặc quên cấu hình Healthcheck.
2.  **Chuẩn hóa toàn diện**: Đảm bảo toàn bộ tài nguyên trên đám mây (Kubernetes, AWS VPC) của doanh nghiệp tuân thủ chính xác 100% theo tiêu chuẩn an ninh thông tin của công ty.

---

## 📚 Tài liệu đọc thêm khuyến nghị

### 🇻🇳 [Triển Khai Compliance-as-Code Kiểm Soát Tuân Thủ Tự Động Với OPA & Conftest](./blog/compliance-as-code-opa-conftest.md)
*   **Chi tiết**: Bản dịch thuật & hiệu đính chuyên sâu 100% tiếng Việt từ Styra (nhà sáng lập dự án OPA) về thực tế kiểm soát tuân thủ an toàn thông tin.
*   **Giá trị thực tiễn**: Khám phá kiến trúc OPA Policy Engine, hướng dẫn chi tiết cách viết các quy tắc Rego thực chiến kiểm duyệt Dockerfile/K8s Manifest, và quy trình tích hợp Conftest vào Git Commit Hook nhằm ngăn ngừa lỗ hổng bảo mật sớm nhất từ máy lập trình viên.
*   **Liên kết nguồn gốc**: [Styra Blog - Compliance-as-Code using Open Policy Agent](https://www.styra.com/blog/)

### 🇬🇧 Tài liệu chính thống (Official Docs)
*   **[Open Policy Agent - Rego Policy Language](https://www.openpolicyagent.org/docs/latest/policy-language/)** — Hướng dẫn chi tiết cú pháp viết mã Rego từ CNCF.
*   **[Conftest Documentation](https://www.conftest.dev/)** — Hướng dẫn viết test và chạy Conftest trong CI/CD.

---

## 🚀 Bước tiếp theo
Hãy thực hành bài Lab tự động kiểm duyệt an toàn Dockerfile: sử dụng **Conftest** viết chính sách kiểm duyệt bằng **Rego** để phát hiện và chặn đứng Dockerfile nếu chứa đặc quyền root hoặc thiếu khai báo Healthcheck:

👉 **[Bắt đầu bài Lab thực hành: OPA Conftest](./labs/lab-opa-conftest/lab-instructions.md)**
