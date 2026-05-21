# 🧪 Lab 08: Giám sát An ninh Runtime và Phát hiện Xâm nhập với Falco (Falco Runtime Lab)

## 📌 Lý do bài thực hành này tồn tại (Why this Lab?)
Trong môi trường thực tế, kể cả khi bạn quét sạch sẽ mọi lỗi ở pipeline, hacker vẫn có thể tìm ra lỗ hổng Zero-day để thâm nhập vào container đang chạy (Runtime). Khi đã chui vào trong, hành động đầu tiên của chúng thường là mở Terminal (`sh`, `bash`) và sửa đổi/đánh cắp các tệp cấu hình nhạy cảm.
Bài lab này hướng dẫn bạn cách vận hành **Runtime Security Agent (Mini-Falco)**. Bằng cách áp dụng kỹ thuật cao cấp **Chia sẻ không gian tên tiến trình (Shared PID Namespace)** giữa các container, Mini-Falco Agent sẽ trực tiếp theo dõi bảng tiến trình `/proc` và sự thay đổi file nhạy cảm của Web App thời gian thực, lập tức bắn cảnh báo đỏ khi phát hiện hành vi xâm nhập trái phép!

---

## ⚙️ Sơ đồ Kịch bản Xâm nhập & Đánh chặn

```mermaid
graph TD
    Hacker([Hacker / Học viên]) -->|1. Tấn công giả lập: docker exec sh| App[devsecops-runtime-web Container]
    App -->|2. Tạo tiến trình shell mới| PID[/proc Process Table]
    Hacker -->|3. Ghi đè file| Conf[sensitive_config.json]
    Agent[devsecops-mini-falco Agent] -->|4. Quét định kỳ PID & File mtime| PID
    Agent -->|4. Quét định kỳ PID & File mtime| Conf
    Agent -->>|5. Bắn Cảnh báo Đỏ thời gian thực| Alert[Logs: 🚨 ALERT Spawn Shell / File Modified]
```

---

## 🛠️ Các bước Thực hành Chi tiết

### Bước 1: Khởi chạy cụm Lab
Hãy di chuyển vào thư mục bài lab và khởi chạy các container:
```bash
docker-compose up -d
```
*Lưu ý: Docker sẽ dựng một Web App chạy Alpine và một Python Agent đóng vai trò Mini-Falco chia sẻ PID Namespace của Web App.*

### Bước 2: Theo dõi luồng logs của Mini-Falco Agent
Mở một cửa sổ Terminal mới (Terminal A) và chạy lệnh sau để quan sát luồng logs giám sát liên tục của Agent:
```bash
docker logs -f devsecops-mini-falco
```
*Bạn sẽ thấy thông báo khởi động thành công của Mini-Falco và thông báo đang tích cực quét hệ thống.*

### Bước 3: Giả lập Hacker xâm nhập mở Shell (Shell Spawning Attack)
Mở thêm một cửa sổ Terminal khác (Terminal B) và chạy lệnh "chui" vào container Web App giả lập hành vi hacker exploit thành công và mở shell tương tác:
```bash
docker exec -it devsecops-runtime-web sh
```
*Hãy lập tức quay lại nhìn màn hình logs của **Terminal A (Mini-Falco)**. Bạn sẽ thấy dòng cảnh báo đỏ rực xuất hiện ngay tức khắc:*
```
🚨 ALERT [WARNING] Spawn Shell in Container Detected: PID=... CMD='sh'
```
*Mini-Falco đã bắt trọn hành vi mở shell bất thường inside container!*

### Bước 4: Giả lập Hacker chỉnh sửa tệp tin cấu hình nhạy cảm (Data Tampering)
Quay lại **Terminal B** (bên trong shell của container Web App), gõ câu lệnh sau để chỉnh sửa phá hoại tệp tin cấu hình nhạy cảm `/workspace/app/sensitive_config.json` (chứa db password và api key):
```bash
echo 'hacked' >> /workspace/app/sensitive_config.json
```
*Hãy nhìn lại màn hình **Terminal A (Mini-Falco)**. Ngay khi bạn nhấn Enter bên Terminal B, cảnh báo cấp độ nguy hiểm CRITICAL lập tức nổ ra:*
```
🚨 ALERT [CRITICAL] Sensitive File Written/Modified: File=/workspace/app/sensitive_config.json
```
*Mọi hành vi ghi/sửa tệp tin mật đều đã bị ghi nhận và cảnh báo tức thời!*

### Bước 5: Dọn dẹp môi trường
Gõ `exit` ở Terminal B để thoát ra khỏi container Web App, sau đó tắt cụm container dọn dẹp RAM:
```bash
docker-compose down
```

---

## 🎯 Tổng kết Bài học
Qua bài thực hành này, bạn đã:
*   Hiểu bản chất của giám sát an ninh **Runtime Security** so với quét tĩnh pipeline.
*   Làm quen với kỹ thuật nâng cao **Shared PID Namespace** để liên kết giám sát tiến trình giữa các container.
*   Mô phỏng thành công quy trình đánh chặn của Falco: phát hiện tức thời hành vi mở terminal trái phép và phá hoại cấu hình mật của hacker tại thời điểm chạy.
