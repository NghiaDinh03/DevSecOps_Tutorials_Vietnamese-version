# Chẩn Đoán Sự Cố Mạng Linux: Hướng Dẫn Thực Hành Thực Tế

*   **Tên bài viết gốc**: Linux Networking Troubleshooting: A Practical Guide
*   **Nguồn**: Cộng đồng Viblo.asia (Đạt 12k+ views và 140+ upvotes)
*   **Liên kết gốc**: [Viblo.asia - Linux Networking Troubleshooting](https://viblo.asia/p/linux-networking-troubleshooting-a-practical-guide-ByEZk6nxlQ0)

---

## 1. Giới thiệu

Trong môi trường vận hành thực tế (*Production*), sự cố mạng trên các máy chủ Linux là một trong những vấn đề thường gặp nhất và gây ảnh hưởng trực tiếp đến tính liên tục của dịch vụ. Việc gỡ lỗi mạng đòi hỏi một tư duy logic có hệ thống, đi từ lớp vật lý lên lớp ứng dụng chứ không phải là đoán mò cấu hình.

Bài viết này hệ thống hóa quy trình 5 bước chẩn đoán và khắc phục sự cố mạng trên hệ điều hành Linux sử dụng bộ công cụ dòng lệnh kinh điển có sẵn.

---

## 2. Quy trình Chẩn đoán 5 Bước Thực tế

### 📌 Bước 1: Kiểm tra tầng vật lý và kết nối IP cơ bản (`ping`)

Trước tiên, ta cần xác định xem máy chủ có kết nối vật lý ra ngoài và card mạng có hoạt động hay không.

```bash
ping -c 4 8.8.8.8
```

*   **Cơ chế hoạt động**: Sử dụng giao thức **ICMP (Internet Control Message Protocol)** để gửi các gói tin *Echo Request* đến IP đích và chờ gói *Echo Reply* phản hồi.
*   **Phân tích kết quả**:
    *   Nếu nhận được phản hồi (`0% packet loss`), kết nối IP cơ bản đến internet hoàn toàn bình thường.
    *   Nếu gặp lỗi `Network is unreachable`, card mạng chưa được gán IP hoặc bảng định tuyến (*routing table*) bị thiếu cổng mặc định (*default gateway*). Kiểm tra lại bằng lệnh `ip a` hoặc `ip route`.

---

### 📌 Bước 2: Xác minh đường đi của gói tin (`traceroute` / `mtr`)

Khi ping thất bại hoặc có độ trễ cực cao, ta cần biết gói tin bị nghẽn hay bị drop ở chặng (*hop*) nào trên đường truyền.

```bash
traceroute 8.8.8.8
# Hoặc sử dụng công cụ tương tác thời gian thực:
mtr 8.8.8.8
```

*   **Cơ chế hoạt động**: `traceroute` gửi các gói tin với chỉ số **TTL (Time-To-Live)** tăng dần từ 1. Mỗi router trung gian khi nhận được gói tin có TTL = 0 sẽ hủy gói tin và gửi lại một thông điệp *ICMP Time Exceeded* về cho máy nguồn, giúp ta vẽ lại toàn bộ sơ đồ đường đi.
*   **Ứng dụng thực tế**: Giúp SecOps xác định xem sự cố nghẽn mạng nằm ở mạng nội bộ doanh nghiệp (*LAN*), ở nhà mạng cung cấp dịch vụ (*ISP*), hay ở phía máy chủ đối tác.

---

### 📌 Bước 3: Kiểm tra phân giải tên miền DNS (`nslookup` / `dig`)

Nếu bạn ping được IP ngoại mạng (ví dụ `8.8.8.8`) nhưng không thể truy cập được tên miền (ví dụ `google.com`), lỗi chắc chắn nằm ở tầng phân giải DNS.

```bash
dig google.com
# Hoặc lệnh đơn giản hơn:
nslookup google.com
```

*   **Phân tích tập tin cấu hình**:
    *   Kiểm tra file `/etc/hosts` xem có cấu hình ghi đè IP thủ công gây lỗi hay không.
    *   Kiểm tra file `/etc/resolv.conf` để xem địa chỉ IP của DNS Server có chính xác không (ví dụ: `nameserver 8.8.8.8`).
*   **Giải quyết sự cố**: Sử dụng `dig @8.8.8.8 google.com` để ép buộc truy vấn trực tiếp tới DNS Server của Google để xác định xem DNS Server hiện tại của hệ thống có đang bị treo hay chặn cổng không.

---

### 📌 Bước 4: Kiểm tra các cổng dịch vụ đang nghe (`ss` / `netstat`)

Khi kết nối mạng bên ngoài bình thường nhưng người dùng không thể truy cập vào ứng dụng web của bạn, cần kiểm tra xem ứng dụng có thực sự đang chạy và nghe đúng cổng mạng (*Listening*) hay không.

```bash
ss -tulpn
# Hoặc lệnh netstat cũ:
netstat -tulpn
```

*   **Giải thích tham số**:
    *   `-t`: Giao thức TCP.
    *   `-u`: Giao thức UDP.
    *   `-l`: Chỉ hiển thị các socket đang nghe (*Listening*).
    *   `-p`: Hiển thị ID tiến trình (*PID*) và tên chương trình sở hữu socket.
    *   `-n`: Hiển thị số cổng mạng dạng số thay vì dịch tên dịch vụ.
*   **Tình huống thực tế**: Nếu không thấy tiến trình ứng dụng (ví dụ: `nginx` hay `node`) xuất hiện trong danh sách nghe cổng `80` hoặc `443`, dịch vụ đã bị sập. Cần kiểm tra log hệ thống bằng `journalctl -u nginx`.

---

### 📌 Bước 5: Bắt và phân tích gói tin thô thời gian thực (`tcpdump`)

Khi tất cả các bước trên đều bình thường nhưng logic ứng dụng vẫn bị lỗi giao tiếp mạng, ta phải sử dụng công cụ tối thượng để "soi" trực tiếp cấu hình gói tin đi qua card mạng.

```bash
tcpdump -i eth0 port 80 -n -vvv
```

*   **Giải thích câu lệnh**: Bắt toàn bộ các gói tin đi qua card mạng `eth0` ở cổng mạng `80`, hiển thị chi tiết nội dung gói tin thô dạng văn bản không dịch ngược tên miền (`-n`).
*   **Ứng dụng**: Phân tích quá trình bắt tay 3 bước TCP (*Three-way Handshake*) có bị lỗi hay không, hoặc kiểm tra xem dữ liệu nhạy cảm có đang bị gửi dưới dạng plain-text không mã hóa qua mạng hay không.

---

## 3. Kết luận

Làm chủ 5 công cụ chẩn đoán mạng trên là kỹ năng bắt buộc đối với bất kỳ kỹ sư DevOps/SecOps nào. Hãy luôn tuân thủ nguyên tắc gỡ lỗi có trình tự từ dưới lên trên để cô lập và xử lý sự cố nhanh nhất, giảm thiểu tối đa thời gian gián đoạn hệ thống dịch vụ (*Downtime*).
