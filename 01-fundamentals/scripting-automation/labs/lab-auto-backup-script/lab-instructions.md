# 🧪 Lab 02: Viết Script Tự Động Sao Lưu Dữ Liệu & Lập Lịch Định Kỳ Bằng Cronjob

## 🎯 Mục tiêu bài thực hành
Sao lưu dữ liệu (Backup) và xoay vòng tệp tin nén (Rotation) là tác vụ vận hành tối quan trọng để phục hồi hệ thống khi gặp sự cố. Trong bài thực hành này, bạn sẽ tự tay lập trình tự động hóa quy trình này:
*   Viết một kịch bản **Bash Script** hoàn chỉnh để nén và sao lưu các tệp tin cấu hình quan trọng.
*   Cấu hình cơ chế **xoay vòng sao lưu (Retention/Rotation Policy)**: Tự động phát hiện và xóa bỏ các bản sao lưu cũ, chỉ giữ lại tối đa **3 bản sao lưu mới nhất** để bảo vệ dung lượng ổ đĩa.
*   Đăng ký và lập lịch chạy tự động kịch bản này thông qua dịch vụ **Cronjob (crontab)**.
*   Kiểm chứng và theo dõi vết hoạt động thông qua hệ thống log.

---

## 🏗️ Thiết kế Môi trường Lab (Standalone Lab)
Chúng ta sẽ khởi chạy một Container chạy hệ điều hành Alpine Linux có kích hoạt sẵn dịch vụ **Cron Daemon**. 
Container này sẽ thực hiện ánh xạ ổ đĩa ảo (**Volume Mount**) trực tiếp 3 thư mục từ máy host của bạn vào trong container để bạn có thể viết script và xem kết quả nén file ngay trên máy thật của mình:
*   `./data/`: Thư mục chứa các tệp tin cấu hình giả lập cần được sao lưu (Source).
*   `./scripts/`: Thư mục chứa file kịch bản `backup.sh` của bạn.
*   `./backups/`: Thư mục lưu trữ các file nén sản phẩm `.tar.gz` (Destination).

---

## 🛠️ Các bước thực hiện chi tiết

### 📋 Bước 1: Khởi dựng môi trường Lab bằng Docker Compose
Mở Terminal trên máy host và di chuyển đến thư mục bài lab:
```bash
cd 01-fundamentals/scripting-automation/labs/lab-auto-backup-script/
```

Khởi chạy cụm lab:
```powershell
docker-compose up -d
```
*Lưu ý: Docker Compose sẽ tự động tạo lập 3 thư mục cục bộ `./data`, `./scripts`, và `./backups` ngay tại thư mục hiện tại của bạn trên máy thật Windows.*

---

### 📋 Bước 2: Tạo tệp dữ liệu cấu hình giả lập cần sao lưu
Hãy tạo một vài tệp cấu hình mẫu bên trong thư mục `./data` trên máy thật của bạn để giả lập dữ liệu nguồn:
*   Tạo file `./data/app.conf` chứa nội dung: `PORT=8080`
*   Tạo file `./data/db.conf` chứa nội dung: `DB_HOST=localhost`

---

### 📋 Bước 3: Viết kịch bản sao lưu thông minh (`backup.sh`)
Chúng ta sẽ viết file kịch bản shell `backup.sh` đặt tại thư mục `./scripts/backup.sh` trên máy thật của bạn. Bạn hãy sử dụng editor (VS Code, Notepad) mở file và viết nội dung kịch bản dưới đây.

Kịch bản này được thiết kế theo đúng chuẩn sản xuất chuyên nghiệp:
1.  **Dùng đường dẫn tuyệt đối** cho các lệnh (`/bin/mkdir`, `/bin/tar`, `/usr/bin/find`).
2.  **Kiểm tra lỗi nguồn**: Nếu thư mục nguồn trống rỗng, script lập tức dừng lại và báo lỗi (trả về Exit Code `1`).
3.  **Xoay vòng file thông minh (Rotation Policy)**: Dùng lệnh `find` và `sort` để tìm danh sách các bản backup cũ, tiến hành xóa bỏ các bản ghi cũ vượt quá giới hạn 3 file mới nhất.

Hãy tạo tệp tin `./scripts/backup.sh` với nội dung sau:
```bash
#!/bin/sh

# ==============================================================================
# Kịch bản sao lưu cấu hình tự động & Xoay vòng file nén
# ==============================================================================

# Định nghĩa các thư mục làm việc bằng đường dẫn tuyệt đối
SRC_DIR="/app/data"
DEST_DIR="/app/backups"
MAX_BACKUPS=3

echo "=== BẮT ĐẦU QUY TRÌNH SAO LƯU [$(date '+%Y-%m-%d %H:%M:%S')] ==="

# 1. Kiểm tra thư mục nguồn có dữ liệu hay không
if [ ! -d "$SRC_DIR" ] || [ -z "$(ls -A $SRC_DIR)" ]; then
    echo "LỖI: Thư mục nguồn $SRC_DIR trống rỗng hoặc không tồn tại!"
    echo "=== SAO LƯU THẤT BẠI ==="
    exit 1
fi

# 2. Tạo thư mục đích nếu chưa có
/bin/mkdir -p "$DEST_DIR"

# 3. Tạo tên file nén theo định dạng ngày_giờ
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="$DEST_DIR/backup_$TIMESTAMP.tar.gz"

echo "Đang nén dữ liệu từ $SRC_DIR..."
/bin/tar -czf "$BACKUP_FILE" -C "$SRC_DIR" .

if [ $? -eq 0 ]; then
    echo "SUCCESS: Đã tạo file sao lưu thành công tại: $BACKUP_FILE"
else
    echo "LỖI: Quá trình nén file tar.gz thất bại!"
    echo "=== SAO LƯU THẤT BẠI ==="
    exit 1
fi

# 4. Thực thi cơ chế xoay vòng dữ liệu (Retention / Rotation Policy)
# Tìm tất cả các file backup dạng .tar.gz trong thư mục đích, xếp theo thời gian mới nhất lên đầu
echo "Đang kiểm tra xoay vòng lưu trữ (Chỉ giữ lại tối đa $MAX_BACKUPS file mới nhất)..."
BACKUP_COUNT=$(/usr/bin/find "$DEST_DIR" -name "backup_*.tar.gz" | wc -l)

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    LIMIT_DELETE=$(expr $BACKUP_COUNT - $MAX_BACKUPS)
    echo "Phát hiện $BACKUP_COUNT file. Tiến hành xóa bỏ $LIMIT_DELETE bản sao lưu cũ nhất..."
    
    # Liệt kê từ cũ nhất đến mới nhất, chọn ra số lượng file dư thừa để xóa
    /usr/bin/find "$DEST_DIR" -name "backup_*.tar.gz" -type f -printf '%T@ %p\n' | \
    sort -n | \
    head -n "$LIMIT_DELETE" | \
    awk '{print $2}' | \
    while read -r old_file; do
        echo "Đang xóa bản sao lưu cũ dư thừa: $old_file"
        rm -f "$old_file"
    done
fi

echo "=== QUY TRÌNH SAO LƯU HOÀN THÀNH THÀNH CÔNG ==="
exit 0
```

---

### 📋 Bước 4: Phân quyền thực thi cho kịch bản
Mặc định, file script mới tạo chỉ có quyền đọc/ghi mà không chạy được. Chúng ta cần cấp quyền thực thi (**Execute Permission**).
Hãy truy cập vào shell của Container `cron-container` để gán quyền và test thử script trực tiếp:
```powershell
docker-compose exec cron-container sh
```

Cấp quyền thực thi bằng lệnh `chmod`:
```sh
chmod +x /app/scripts/backup.sh
```

Chạy thử nghiệm thủ công script để kiểm tra logic:
```sh
/app/scripts/backup.sh
```
*Kết quả mong đợi:* Bạn sẽ thấy log in ra màn hình thông báo sao lưu thành công. Hãy kiểm tra thư mục `./backups/` trên máy thật của bạn, một file nén `backup_*.tar.gz` đã xuất hiện sinh động!

---

### 📋 Bước 5: Đăng ký lập lịch tự động bằng Cronjob
Bây giờ, chúng ta sẽ cấu hình để hệ thống tự động gọi script này **mỗi 1 phút** một lần (trong thực tế sẽ cấu hình mỗi ngày/mỗi tuần, nhưng ta cấu hình 1 phút để thấy ngay kết quả lab nhanh chóng).

Vẫn ở bên trong shell của container, hãy gõ lệnh mở bảng lập lịch crontab:
```sh
crontab -e
```

Trình soạn thảo văn bản (thường là vi) sẽ mở ra. Bạn hãy nhấn phím `i` (để chuyển sang chế độ Insert chỉnh sửa) và gõ vào dòng cấu hình sau:
```cron
* * * * * /app/scripts/backup.sh >> /var/log/cron-backup.log 2>&1
```
*Giải thích dòng lệnh:*
*   `* * * * *`: Chu kỳ chạy lặp lại sau mỗi 1 phút (mọi phút, mọi giờ, mọi ngày).
*   `/app/scripts/backup.sh`: Đường dẫn tuyệt đối trỏ tới file script cần chạy.
*   `>> /var/log/cron-backup.log 2>&1`: Ghi đè toàn bộ nhật ký thành công (stdout) và nhật ký lỗi (stderr) của script ra file log hệ thống để tiện gỡ lỗi.

Sau khi gõ xong, bạn nhấn nút `Esc`, sau đó gõ `:wq` và ấn `Enter` để lưu lại cấu hình và thoát ra.

Xác nhận cấu hình cron đã được lưu thành công:
```sh
crontab -l
```

---

### 📋 Bước 6: Theo dõi & Kiểm chứng kết quả (Verification)
Hãy gõ `exit` để thoát khỏi shell container quay về máy host thật của bạn.

#### 1. Theo dõi tiến trình nén file:
Mở thư mục `./backups/` trên máy thật của bạn. Cứ sau mỗi 1 phút, một file nén mới lại tự động sinh ra!

#### 2. Kiểm chứng tính năng Xoay vòng file (Retention Policy):
Hãy đợi từ 4 đến 5 phút. Nếu cơ chế xoay vòng của kịch bản hoạt động đúng đắn, số lượng file nén trong thư mục `./backups/` sẽ **không bao giờ vượt quá 3 file**. Các file cũ nhất sẽ tự động bị phát hiện và xóa sạch sẽ để trả lại dung lượng đĩa đệm!

#### 3. Theo dõi Log hoạt động của Cron:
Bạn có thể "chui" lại vào container và xem file log ghi nhận hoạt động chi tiết của cron:
```powershell
docker-compose exec cron-container cat /var/log/cron-backup.log
```

---

### 📋 Bước 7: Dọn dẹp môi trường Lab
Khôi phục sạch sẽ tài nguyên cho máy host của bạn:
```powershell
docker-compose down -v
```
*(Thư mục backups và các file cấu hình tạm thời sẽ được dọn sạch).*
