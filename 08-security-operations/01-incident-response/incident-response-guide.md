# 🚨 Sub-module 01: Giám sát Runtime Security & Ứng phó Sự cố (Falco & Incident Response)

Sub-module này cung cấp kiến thức nền tảng và nâng cao về **Runtime Security** — giám sát và bảo vệ ứng dụng khi đang vận hành thực tế bằng công cụ CNCF hàng đầu **Falco**, kết hợp cơ chế nhân Linux **eBPF**.

---

## 1. Tại sao cần Giám sát Runtime?

Tất cả các chốt chặn tĩnh như SAST, SCA hay quét Container Image chỉ giúp bạn phát hiện những lỗ hổng **đã biết** tại thời điểm build. 
Tuy nhiên, khi ứng dụng chạy trên môi trường thực tế (Runtime), hacker vẫn có thể khai báo tấn công thông qua các lỗ hổng chưa được công bố (**Zero-day Vulnerabilities**). Khi hacker đã chiếm quyền điều khiển container thành công (v.d: Remote Code Execution):
*   Họ sẽ lập tức chạy lệnh `sh` hoặc `bash` để tương tác với OS.
*   Họ sẽ tìm cách đọc các tệp tin nhạy cảm của Linux như `/etc/shadow`, `/etc/passwd`.
*   Họ sẽ tải xuống các đoạn script độc hại và ghi đè vào các thư mục hệ thống như `/bin` hay `/usr/bin`.
Để phát hiện những hành động phá hoại này, ta phải giám sát liên tục các hành vi ở mức **Hệ điều hành / Nhân Kernel (OS/Kernel level)**.

---

## 2. Bản chất Cơ chế hoạt động của Falco qua eBPF

**Falco** (phát triển bởi Sysdig và được CNCF chứng nhận) là bộ máy giám sát hành vi runtime hàng đầu hiện nay.

```mermaid
graph TD
    UserSpace[User Space] -->|1. Gọi hệ thống / Syscalls| Kernel[Linux Kernel]
    Kernel -->|2. Đánh chặn bằng eBPF Probe| Probe[eBPF / Kernel Module]
    Probe -->|3. Đẩy luồng sự kiện dạng Ring Buffer| FalcoEngine[Falco User-space Daemon]
    FalcoEngine -->|4. Đối chiếu Rules HCL| Rules[(Falco Rules)]
    FalcoEngine -->|5. Phát hiện vi phạm| Alert[Output: Logs / Webhook / Slack]
    style Kernel fill:#ffe082,stroke:#ffb300,color:#000
    style Probe fill:#00e676,stroke:#00e676,color:#000
    style FalcoEngine fill:#e3f2fd,stroke:#1e88e5,color:#000
```

### 2.1. eBPF (Extended Berkeley Packet Filter) là gì?
Trước đây, để can thiệp vào nhân Linux, người ta phải viết các Kernel Modules rất nguy hiểm, có thể làm sập (Crash) toàn bộ hệ thống máy chủ nếu có lỗi code.
**eBPF** thay đổi hoàn toàn điều đó. eBPF cho phép chạy các chương trình nhỏ, an toàn trực tiếp **bên trong nhân Linux Kernel** mà không cần sửa đổi mã nguồn kernel hay load thêm module ngoài. Các chương trình eBPF chạy ở chế độ Sandboxed, được xác thực độ an toàn tuyệt đối trước khi chạy bởi eBPF Verifier.

### 2.2. Cách Falco hoạt động
1.  **Đánh chặn Syscalls**: Khi bất kỳ tiến trình nào chạy (như container gọi lệnh `cat /etc/passwd`), nó bắt buộc phải gửi một lệnh gọi hệ thống (**System Call - Syscall** như `openat`, `execve`) xuống Kernel. eBPF probe của Falco sẽ lập tức đánh chặn và bắt giữ sự kiện này.
2.  **Đẩy lên User Space**: Lệnh gọi hệ thống được chuyển cực nhanh qua bộ nhớ đệm (Ring Buffer) lên phần mềm Falco chạy ở User Space.
3.  **So khớp Quy tắc (Rules Engine)**: Falco phân tích cú pháp sự kiện và đối chiếu với các quy tắc bảo mật được định nghĩa sẵn.
4.  **Bắn cảnh báo**: Nếu phát hiện hành vi vi phạm, Falco xuất cảnh báo lập tức (Slack, Webhook, stdout).

---

## 3. Cấu trúc Viết Luật của Falco (Falco Rules)

Falco Rules sử dụng định dạng YAML rất tường minh, gồm 3 thành phần chính:
1.  **List**: Danh sách các từ khóa tái sử dụng.
2.  **Macro**: Các điều kiện lọc logic viết gọn để tái sử dụng.
3.  **Rule**: Quy tắc thực tế định nghĩa điều kiện chặn và thông báo lỗi.

*Ví dụ quy tắc phát hiện container tự ý chạy Bash Shell:*
```yaml
- rule: Spawn Shell in Container
  desc: Phát hiện hành vi mở terminal (bash/sh) inside container
  condition: container.id != host and spawned_process and proc.name in (bash, sh)
  output: "🚨 CẢNH BÁO RUNTIME: Phát hiện mở Shell trong Container (user=%user.name %proc.cmdline container_id=%container.id image=%container.image.repository)"
  priority: WARNING
```

---

## 📚 Tài liệu đọc thêm khuyến nghị

*   **[Falco Rules Reference](https://falco.org/docs/rules/)** — Tài liệu tra cứu toàn bộ các trường dữ liệu và cách viết filter của Falco.
*   **[eBPF Official Website](https://ebpf.io/)** — Tìm hiểu sâu sắc công nghệ thay đổi bộ mặt hệ điều hành eBPF.

---

## 🚀 Bước tiếp theo
Hãy thực hành bài Lab tự chạy một container Falco và viết cấu hình luật để bắt gọn hành vi hacker mở shell và sửa file `/etc` inside container:

👉 **[Bắt đầu bài Lab thực hành: Falco Runtime](./labs/lab-incident-response/lab-instructions.md)**
