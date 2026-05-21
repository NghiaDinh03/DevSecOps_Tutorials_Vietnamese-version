# 🔑 Sub-module 02: Quản lý Bí mật An toàn với HashiCorp Vault (Secret Management)

Sub-module này cung cấp kiến thức nền tảng và nâng cao về **Secret Management** — kỹ thuật quản trị tập trung toàn bộ các thông tin nhạy cảm của doanh nghiệp bằng công cụ bảo mật hàng đầu **HashiCorp Vault**.

---

## 1. Rủi ro của phương pháp lưu trữ Secret truyền thống

Trong quá trình phát triển ứng dụng, lập trình viên thường lưu trữ thông tin credentials (như DB Password, API Keys) theo hai cách truyền thống:
1.  **Hardcode trong code**: Đây là thảm họa bảo mật lớn nhất vì mã nguồn thường được push lên Git. Chỉ cần Git repo bị lộ hoặc vô tình để ở chế độ Public, toàn bộ credentials sẽ thuộc về hacker.
2.  **Lưu trong biến môi trường (Environment Variables) hoặc file `.env`**: Khá khẩm hơn cách 1, tuy nhiên biến môi trường trong Linux hoặc container rất dễ bị rò rỉ khi:
    *   Hacker khai báo lệnh `env` hoặc `printenv` thông qua lỗi Remote Code Execution.
    *   Ứng dụng gặp crash và in toàn bộ biến môi trường ra file log thô gửi về hệ thống Logging tập trung không được phân quyền tốt.

---

## 2. Giải pháp HashiCorp Vault là gì?

**HashiCorp Vault** là công cụ chuyên dụng để lưu trữ và kiểm soát truy cập an toàn đối với các thông tin nhạy cảm (secrets). Toàn bộ dữ liệu lưu trữ trong Vault bắt buộc phải được mã hóa khi ghi xuống đĩa (Encryption at Rest) và truyền tải qua đường truyền TLS.

```mermaid
graph TD
    App[Ứng dụng Client] -->|1. Đăng nhập bằng Token / AppRole| Vault[HashiCorp Vault Engine]
    Vault -->|2. Xác thực & Check Policy| Auth[Auth Methods]
    Vault -->|3. Đọc dữ liệu đã mã hóa| Storage[(Encrypted Storage)]
    Vault -->>App|4. Trả về Secret dạng Plaintext cực kỳ an toàn|
    style Vault fill:#000,stroke:#666,color:#fff
    style Storage fill:#1b5e20,stroke:#1b5e20,color:#fff
```

### 2.1. Cơ chế mở khóa Shamir's Secret Sharing (Unsealing Vault)
Khi Vault Server khởi động lại, mặc định nó sẽ ở trạng thái **Sealed (Khóa)**. Ở trạng thái này, Vault không thể đọc hay giải mã bất kỳ dữ liệu nào trong storage.
*   **Giải pháp an toàn**: Vault sử dụng thuật toán **Shamir's Secret Sharing** để chia nhỏ chiếc khóa giải mã Master Key thành $N$ chiếc chìa khóa phụ (Key Shares).
*   **Quy trình mở khóa (Unsealing)**: Bạn cần tập hợp tối thiểu một số lượng chìa khóa phụ nhất định gọi là **Threshold** (ví dụ: cần 3 trong tổng số 5 chìa khóa phụ của 3 người quản trị khác nhau) nạp vào hệ thống để tái tạo lại Master Key mở khóa Vault. Điều này ngăn chặn hoàn toàn việc một quản trị viên đơn lẻ tự ý đánh cắp toàn bộ bí mật của công ty.

---

## 3. Các tính năng cao cấp của Vault

*   **Key-Value (KV) Secrets Engine**: Lưu trữ dữ liệu tĩnh dạng key-value đơn giản (ví dụ: `db_password = my-secure-pass`). Hỗ trợ Versioning (quay ngược phiên bản secret cũ).
*   **Dynamic Secrets (Bí mật Động)**: Tính năng cực kỳ mạnh mẽ của Vault. Thay vì trả về một mật khẩu Database tĩnh dùng chung suốt nhiều năm, ứng dụng sẽ gửi yêu cầu tới Vault. Vault sẽ kết nối trực tiếp sang Database sinh ra một **tài khoản và mật khẩu hoàn toàn mới, dùng riêng cho ứng dụng đó và tự động hết hạn (TTL)** sau 1 giờ. Nếu hacker đánh cắp được credentials này, nó cũng tự động vô hiệu hóa sau 1 giờ!
*   **Transit Secrets Engine (Mã hóa dưới dạng dịch vụ - EaaS)**: Ứng dụng gửi dữ liệu thô sang Vault, Vault thực hiện mã hóa dữ liệu rồi trả về chuỗi mã hóa để lưu vào DB. Ứng dụng không bao giờ cần biết khóa mã hóa là gì, Vault quản lý hoàn toàn vòng đời của khóa (Key Rotation).

---

## 4. Quản lý Truy cập: Policies & Authentication

Để lấy được secret từ Vault, Client/Ứng dụng phải đi qua 2 lớp chốt chặn bảo vệ nghiêm ngặt:

1.  **Authentication (Xác thực)**: Trả lời câu hỏi: *"Bạn là ai?"*. Vault hỗ trợ rất nhiều phương thức xác thực:
    *   Lập trình viên: Đăng nhập bằng tài khoản Github, Username/Password, Token.
    *   Ứng dụng: Xác thực tự động không dùng mật khẩu qua Kubernetes ServiceAccount, AWS IAM, hoặc AppRole.
2.  **Policies (Chính sách phân quyền)**: Trả lời câu hỏi: *"Bạn được quyền làm gì?"*. Viết bằng ngôn ngữ HCL để phân quyền tối thiểu (Least Privilege).
    *   *Ví dụ một Policy đơn giản chỉ cho phép đọc:*
        ```hcl
        path "secret/data/nodejs-app" {
          capabilities = ["read"]
        }
        ```

---

## 📚 Tài liệu đọc thêm khuyến nghị

*   **[HashiCorp Vault - Getting Started](https://developer.hashicorp.com/vault/tutorials/getting-started)** — Hướng dẫn học Vault chính thức cực kỳ sinh động từ HashiCorp.
*   **[Vault Policies Guide](https://developer.hashicorp.com/vault/docs/concepts/policies)** — Cách viết và cấu hình phân quyền chi tiết cho Vault.

---

## 🚀 Bước tiếp theo
Hãy thực hành bài Lab tự dựng một máy chủ Vault ở chế độ Development cục bộ bằng Docker, cấu hình nạp Secret KV và viết một ứng dụng Client bằng Node.js tự động xác thực và lấy API Key an toàn từ Vault API:

👉 **[Bắt đầu bài Lab thực hành: Vault Secrets](./labs/lab-vault-secrets/lab-instructions.md)**
