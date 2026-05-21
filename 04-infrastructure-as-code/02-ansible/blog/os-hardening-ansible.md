# Gia Cố Bảo Mật Hệ Điều Hành Bằng Ansible: Tự Động Hóa Triển Khai Tiêu Chuẩn Bảo Mật CIS

*   **Tên bài viết gốc**: OS Hardening with Ansible: Implementing CIS Benchmarks Automatically
*   **Nguồn**: Dev-Sec.io (Cộng đồng mã nguồn mở toàn cầu chuyên biệt về tự động hóa bảo mật hạ tầng)
*   **Liên kết gốc**: [Dev-Sec.io - OS Hardening](https://dev-sec.io/)

---

## 1. Giới thiệu

Khi thiết lập một máy chủ Linux mới từ các nhà cung cấp đám mây (như AWS, Google Cloud, DigitalOcean), cấu hình mặc định thường được tối ưu hóa để nhà phát triển dễ dàng tiếp cận và sử dụng nhất. Điều này vô hình trung tạo ra hàng tá lỗ hổng bảo mật: cổng SSH mặc định (22) mở bừa bãi, các thuật toán mã hóa yếu được chấp nhận, phân quyền thư mục hệ thống lỏng lẻo và nhân hệ điều hành (*Kernel*) không được bảo vệ trước các đòn tấn công mạng cơ bản.

**Gia cố bảo mật Hệ điều hành (OS Hardening)** theo các bộ tiêu chuẩn quốc tế (như CIS Benchmarks, DISA STIGs) là yêu cầu bắt buộc của mọi doanh nghiệp. Tuy nhiên, việc thực hiện thủ công trên hàng trăm máy chủ là không khả thi.

Bài viết này giới thiệu phương pháp tự động hóa OS Hardening sử dụng các Ansible Roles được xây dựng sẵn chuẩn quốc tế từ cộng đồng **Dev-Sec.io**.

---

## 2. Quy trình Gia cố Bảo mật 4 Tầng Tự động bằng Ansible

Cộng đồng Dev-Sec.io cung cấp các Ansible Roles độc lập, được kiểm thử liên tục để gia cố tự động hệ điều hành Linux mà không làm gãy đổ dịch vụ.

### 🛡️ Tầng 1: Gia cố dịch vụ SSH (`ssh-hardening`)

Cổng SSH là cửa ngõ chính để quản trị máy chủ, nhưng cũng là mục tiêu tấn công brute-force đầu tiên của tin tặc. Role `ssh-hardening` thực hiện:
*   **Vô hiệu hóa đăng nhập bằng mật khẩu**: Chỉ cho phép xác thực bằng SSH Keys bất đối xứng.
*   **Cấm đăng nhập trực tiếp bằng tài khoản `root`**: Buộc lập trình viên phải đăng nhập bằng user thường và dùng `sudo` khi cần thiết.
*   **Chỉ chấp nhận thuật toán mã hóa mạnh**: Cấu hình SSH daemon chỉ sử dụng các thuật toán trao đổi khóa an toàn (như Curve25519) và cấm các giao thức lỗi thời (như SHA1, MD5, SSHv1).
*   **Tự động ngắt kết nối**: Cấu hình `ClientAliveInterval` tự động kick các phiên làm việc idle (không hoạt động) quá 5 phút.

---

### 🛡️ Tầng 2: Gia cố Nhân hệ điều hành (`sysctl-hardening`)

Nhân Linux (*Kernel*) chứa nhiều thông số cấu hình mạng mặc định có thể bị lợi dụng để tấn công từ chối dịch vụ (DoS). Role này can thiệp trực tiếp vào file `/etc/sysctl.conf` để tối ưu:
*   **Chống tấn công SYN Flood**: Bật tính năng `net.ipv4.tcp_syncookies = 1` giúp máy chủ chống chọi được các đợt flooding gói tin bắt tay TCP cực lớn.
*   **Tắt tính năng chuyển tiếp gói tin (IP Forwarding)**: Ngăn chặn máy chủ bị biến thành một router trung gian chuyển tiếp traffic độc hại.
*   **Chống tấn công IP Spoofing**: Bật tính năng lọc đường dẫn ngược (`rp_filter = 1`) để drop các gói tin có địa chỉ IP giả mạo nguồn.

---

### 🛡️ Tầng 3: Phân quyền hệ thống tập tin an toàn (`file-permissions`)

Nhiều file cấu hình nhạy cảm mặc định có quyền đọc/ghi quá rộng cho mọi user. Role này tự động:
*   **Quét và thu hồi quyền ghi** của nhóm đối tượng *Others* trên toàn bộ các file nhị phân trong `/bin`, `/sbin`, `/usr/bin`.
*   **Bảo vệ các tệp tin hệ thống nhạy cảm**: Giới hạn quyền đọc file `/etc/shadow` (lưu mã băm mật khẩu) và `/etc/passwd` chỉ dành riêng cho tài khoản root.

---

### 🛡️ Tầng 4: Tường lửa tự động và cập nhật bản vá

*   **Cấu hình Firewall (UFW/Firewalld)**: Tự động đóng toàn bộ các cổng mạng, chỉ whitelist (cho phép) đúng các cổng phục vụ ứng dụng web (80, 443).
*   **Tự động cập nhật bảo mật**: Cấu hình dịch vụ `unattended-upgrades` để hệ điều hành tự động tải và cài đặt các bản vá an ninh khẩn cấp hàng ngày mà không cần con người can thiệp.

---

## 3. Cách Triển khai Nhanh trong Ansible Playbook

Để áp dụng các tiêu chuẩn an toàn của Dev-Sec.io vào hạ tầng của bạn, bạn chỉ cần gọi chúng trực tiếp trong playbook:

```yaml
- name: Hardening all production servers
  hosts: all
  become: yes
  roles:
    - devsec.hardening.os_hardening
    - devsec.hardening.ssh_hardening
```

---

## 4. Kết luận

Sử dụng Ansible để tự động hóa OS Hardening giúp doanh nghiệp chuyển đổi tư duy bảo mật từ phản ứng thụ động sang chủ động phòng thủ dưới dạng mã nguồn (**Security as Code**). Hãy tích hợp các chốt chặn hardening này vào quy trình khởi tạo máy chủ để đảm bảo mọi tài nguyên số luôn ở trạng thái an toàn nhất ngay từ giây đầu tiên hoạt động.
