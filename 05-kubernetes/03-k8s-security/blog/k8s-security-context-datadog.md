# Hướng Dẫn Toàn Diện Về Kubernetes Security Context (A Complete Guide to Kubernetes Security Context)

*   **Tên bài viết gốc**: A Complete Guide to Kubernetes Security Context
*   **Tác giả**: Đội ngũ kỹ sư Datadog
*   **Nguồn**: Datadog Blog
*   **Liên kết gốc**: [Datadog Blog - Kubernetes Security Context](https://www.datadog.com/blog/kubernetes-security-context/)

---

## 1. Giới thiệu

Khi bạn triển khai ứng dụng lên Kubernetes, các container mặc định sẽ thừa hưởng nhiều đặc quyền không cần thiết từ hệ điều hành máy host. Nếu một container bị tin tặc xâm nhập, chúng có thể tận dụng các đặc quyền này để thực hiện tấn công thoát container (*Container Breakout*) và kiểm soát toàn bộ node máy chủ.

Để giải quyết vấn đề này, Kubernetes cung cấp một tính năng mạnh mẽ gọi là **Security Context (Ngữ cảnh bảo mật)**. Security Context cho phép bạn định nghĩa các thiết lập đặc quyền và kiểm soát truy cập cho Pod hoặc từng Container cụ thể.

Bài viết này dịch thuật và giải thích chi tiết toàn bộ các trường cấu hình trong Security Context theo hướng dẫn chuẩn từ Datadog Blog.

---

## 2. Cấu hình Security Context ở cấp độ Pod so với Container

Kubernetes cho phép bạn cấu hình Security Context ở hai cấp độ khác nhau trong file manifest YAML:

1.  **Cấp độ Pod (`spec.securityContext`)**: Áp dụng các thiết lập bảo mật cho toàn bộ các container chạy bên trong Pod đó, bao gồm cả các init containers. Các trường cấu hình ở đây chủ yếu liên quan đến phân quyền hệ thống tệp tin và ID của người dùng.
2.  **Cấp độ Container (`spec.containers[].securityContext`)**: Chỉ áp dụng cho một container cụ thể. Các thiết lập ở đây có thể ghi đè (*override*) cấu hình cấp độ Pod và cho phép bạn tinh chỉnh sâu hơn các quyền hạn nhân kernel (như Capabilities, readOnlyRootFilesystem).

---

## 3. Các trường cấu hình cốt lõi & Hướng dẫn dịch nghĩa chi tiết

### 🛡️ 1. runAsUser, runAsGroup và fsGroup (Kiểm soát ID người dùng và nhóm)

Theo mặc định, các tiến trình bên trong container thường chạy dưới quyền root (UID 0). Datadog khuyến nghị bạn bắt buộc phải chuyển sang chạy bằng user thường.

*   **`runAsUser`**: Xác định ID người dùng (UID) mà tiến trình chính trong container sẽ chạy.
*   **`runAsGroup`**: Xác định ID nhóm (GID) cho tiến trình chính.
*   **`fsGroup`**: Định nghĩa một ID nhóm đặc biệt. Khi Kubernetes mount một volume vào Pod, hệ thống sẽ tự động thay đổi quyền sở hữu của toàn bộ tệp tin trong volume đó thuộc về GID khai báo trong `fsGroup`. Điều này giúp ứng dụng có quyền đọc/ghi volume mà không cần chạy dưới quyền root.

```yaml
spec:
  securityContext:
    runAsUser: 10001
    runAsGroup: 10001
    fsGroup: 10001
```

---

### 🛡️ 2. runAsNonRoot (Cấm chạy dưới quyền root từ gốc)

Trường này hoạt động như một chốt chặn kiểm tra tự động trước khi container được khởi chạy.

*   **`runAsNonRoot: true`**: Khi được thiết lập, kubelet sẽ kiểm tra Docker Image của container. Nếu image được build để chạy mặc định bằng root (UID 0) và không có cấu hình ghi đè UID thường, Kubernetes sẽ từ chối khởi chạy Pod này và báo lỗi ngay lập tức.

---

### 🛡️ 3. allowPrivilegeEscalation (Ngăn chặn leo thang đặc quyền)

Đây là một trong những chốt chặn bảo mật quan trọng nhất để chống lại các cuộc tấn công khai thác lỗi hệ thống.

*   **`allowPrivilegeEscalation: false`**: Ngăn chặn một tiến trình con (*child process*) giành được nhiều quyền hạn hơn tiến trình cha (*parent process*). Thiết lập này kiểm soát trực tiếp cơ chế gọi hệ thống `no_new_privs` của nhân Linux kernel. Nó vô hiệu hóa hoàn toàn tác dụng của các tệp tin mang thuộc tính SUID (như lệnh `sudo` hoặc `passwd`), khiến hacker không thể lợi dụng chúng để leo thang lên quyền root.

---

### 🛡️ 4. readOnlyRootFilesystem (Khóa cứng hệ thống tệp tin chỉ đọc)

Mặc định, các container có quyền ghi dữ liệu lên toàn bộ phân vùng đĩa của nó.

*   **`readOnlyRootFilesystem: true`**: Chuyển toàn bộ hệ thống tệp tin gốc của container sang chế độ Chỉ đọc (Read-Only). Điều này cực kỳ hiệu quả vì nếu hacker xâm nhập thành công, chúng không thể ghi đè các file nhị phân của hệ thống, không thể tải mã độc về đĩa cứng, và không thể cài đặt các công cụ tấn công khác.
*   *Lưu ý*: Nếu ứng dụng của bạn cần ghi các tệp tin tạm thời (như log, cache), hãy mount một volume tạm thời dạng đĩa RAM ảo (`emptyDir`) vào thư mục đó (ví dụ `/tmp`).

---

### 🛡️ 5. Capabilities (Kiểm soát chi tiết quyền hạn của nhân Kernel)

Nhân Linux kernel phân chia các quyền của tài khoản root tối cao thành nhiều quyền hạn nhỏ gọi là **Capabilities** (ví dụ: quyền thay đổi đồng hồ hệ thống, quyền cấu hình card mạng). Theo mặc định, container chạy bằng root sẽ thừa hưởng rất nhiều capabilities nguy hiểm.

Kubernetes cho phép bạn chủ động loại bỏ (*Drop*) hoặc cấp thêm (*Add*) các quyền này:

```yaml
securityContext:
  capabilities:
    drop:
    - ALL         # 1. Hủy bỏ toàn bộ quyền mặc định của kernel
    add:
    - NET_BIND_SERVICE # 2. Chỉ cấp duy nhất quyền bind cổng mạng dưới 1024
```

*   **Khuyến nghị của Datadog**: Luôn thực hiện `drop: - ALL` đầu tiên để tước đoạt toàn bộ quyền, sau đó chỉ gán thêm những quyền cực kỳ cụ thể mà ứng dụng thực sự cần để chạy.

---

### 🛡️ 6. Privileged Mode (Chế độ Đặc quyền tối cao)

*   **`privileged: true`**: Cho phép container truy cập trực tiếp vào toàn bộ phần cứng và nhân kernel của máy host vật lý. Container chạy ở chế độ này hoàn toàn không có ranh giới bảo mật, tương đương với một tiến trình chạy root trực tiếp trên node.
*   **Cảnh báo cực nguy hiểm**: Tuyệt đối **CẤM** sử dụng cấu hình này cho bất kỳ ứng dụng nghiệp vụ thông thường nào.

---

## 4. Kết luận từ Datadog

Security Context là công cụ phòng thủ mạnh mẽ nhất có sẵn trong Kubernetes để bảo vệ container khỏi các cuộc tấn công chiếm quyền điều khiển node. Bằng cách áp dụng triệt để các cấu hình `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true` và hủy bỏ các capabilities dư thừa, bạn đã dựng lên một bức tường bảo mật vô cùng vững chắc cho hạ tầng container của mình.
