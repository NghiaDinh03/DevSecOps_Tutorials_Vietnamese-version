# Bảo Mật GitHub Actions: Cách Tránh 10 Rủi Ro Bảo Mật CI/CD Hàng Đầu Theo OWASP

*   **Tên bài viết gốc**: Securing GitHub Actions: How to Avoid OWASP Top 10 CI/CD Security Risks
*   **Nguồn**: Cider Security / Dev.to (Đơn vị nghiên cứu hàng đầu thế giới về an ninh chuỗi cung ứng phần mềm và CI/CD)
*   **Liên kết gốc**: [Dev.to - Securing GitHub Actions](https://dev.to/cidersecurity/securing-github-actions-how-to-avoid-owasp-top-10-cicd-security-risks-2b8)

---

## 1. Giới thiệu

Hệ thống **Tích hợp liên tục và Triển khai liên tục (CI/CD)** đã trở thành mục tiêu tấn công hàng đầu của tin tặc trong những năm gần đây (tiêu biểu như vụ tấn công chuỗi cung ứng nổi tiếng SolarWinds). 

CI/CD đóng vai trò là "chìa khóa vạn năng" nắm giữ toàn bộ mã nguồn, các thông tin nhạy cảm (*Secrets* như AWS keys, Kubernetes tokens) và có quyền đẩy code trực tiếp lên môi trường sản xuất. Do đó, một lỗ hổng nhỏ trong cấu hình pipeline có thể dẫn đến việc rò rỉ toàn bộ cơ sở hạ tầng đám mây của doanh nghiệp.

Bài viết này mổ xẻ các vector tấn công hàng đầu nhắm vào hệ sinh thái GitHub Actions theo danh mục **OWASP Top 10 CI/CD Security Risks** và đưa ra các giải pháp gia cố phòng thủ hiệu quả từ Cider Security.

---

## 2. Các Mối Đe Dọa Bảo Mật Hàng Đầu

### ⚠️ A. Tấn công đầu độc thực thi Pipeline (Pipeline Poisoning Execution - PPE)

*   **Bản chất**: Xảy ra khi một dự án có mã nguồn mở (Public Repository) cho phép các Pull Request (PR) từ tài khoản lạ bên ngoài tự động kích hoạt pipeline chạy trên hệ thống của mình.
*   **Vector khai thác**: Kẻ tấn công Fork repository của bạn, chỉnh sửa file định nghĩa workflow YAML (ví dụ `.github/workflows/ci.yml`) để thêm vào các lệnh độc hại (như khai thác tiền mã hóa, gửi các biến môi trường nhạy cảm sang server của tin tặc). Sau đó họ mở PR. Nếu hệ thống tự động chạy PR này trên Self-hosted runner của bạn, mã độc sẽ thực thi ngay trong mạng nội bộ.
*   **Giải pháp phòng thủ**: 
    *   Yêu cầu phê duyệt thủ công (*Approval*) trước khi chạy workflow cho tất cả các PR từ các contributor mới hoặc fork bên ngoài.
    *   Cô lập hoàn toàn mạng của runner để không thể quét các dải IP nội bộ doanh nghiệp.

---

### ⚠️ B. Quyền hạn mã xác thực quá lớn (Excessive GITHUB_TOKEN permissions)

*   **Bản chất**: Mỗi khi job chạy, GitHub tự động tạo ra một biến môi trường bí mật tạm thời mang tên `GITHUB_TOKEN`.
*   **Mối đe dọa**: Theo mặc định cũ hoặc cấu hình cẩu thả, token này được cấp quyền **Đọc và Ghi (Read/Write)** trên toàn bộ repository. Nếu pipeline bị chèn mã độc, tin tặc có thể dùng token này để commit mã độc trực tiếp lên branch `main` hoặc xóa lịch sử Git.
*   **Giải pháp phòng thủ**: Khai báo rõ ràng cấu hình đặc quyền tối thiểu (*Least Privilege*) ở đầu file YAML:
    ```yaml
    permissions:
      contents: read    # Chỉ cho phép đọc mã nguồn
      security-events: write # Cho phép đẩy báo cáo lỗi
    ```

---

### ⚠️ C. Sử dụng các Actions không đáng tin cậy (Untrusted Third-Party Actions)

*   **Bản chất**: GitHub Marketplace chứa hàng ngàn Actions do cộng đồng viết sẵn. Nhiều lập trình viên sử dụng chúng mà không hề kiểm tra mã nguồn bên dưới.
*   **Mối đe dọa**: Tác giả của Action đó có thể bị hack tài khoản, hoặc Action bị cài backdoor ở phiên bản mới. Sử dụng cú pháp tag động như `uses: actions/checkout@v3` có thể dẫn đến việc vô tình tải phiên bản bị chỉnh sửa độc hại.
*   **Giải pháp phòng thủ**: Bắt buộc sử dụng mã băm SHA-1 cố định (*Commit SHA*) thay cho tag phiên bản để đảm bảo tính bất biến của code:
    ```yaml
    # Thay vì dùng: uses: actions/checkout@v3
    # Hãy dùng:
    uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea1860f # v3.8.0
    ```

---

## 3. Các thực tiễn phòng thủ nâng cao

1.  **Vô hiệu hóa khóa tĩnh (Use OIDC)**: Không lưu trữ AWS Access Key hay GCP JSON trong Secrets. Sử dụng **OpenID Connect (OIDC)** để tạo kết nối xác thực liên thông ngắn hạn (chỉ có hiệu lực trong vài phút).
2.  **Gia cố Self-hosted Runner**:
    *   Tuyệt đối cấm chạy tiến trình runner bằng quyền `root`.
    *   Hủy hoàn toàn môi trường runner và dựng lại từ đầu sau mỗi Job (*Ephemeral Runners*) để tránh rác cache và mã độc nằm lại trên đĩa cứng.
    *   **CẤM gắn socket Docker** `/var/run/docker.sock` vào trong container của runner để ngăn chặn tấn công thoát container (*Container Breakout*).

---

## 4. Kết luận

Bảo mật CI/CD không phải là một tùy chọn thêm, nó là xương sống quyết định sự sống còn của doanh nghiệp trong kỷ nguyên chuyển đổi số. Hãy áp dụng triệt để nguyên tắc Đặc quyền tối thiểu (*Least Privilege*) và phòng thủ chiều sâu để đảm bảo chuỗi cung ứng phần mềm luôn an toàn trước mọi đợt tấn công từ tin tặc.
