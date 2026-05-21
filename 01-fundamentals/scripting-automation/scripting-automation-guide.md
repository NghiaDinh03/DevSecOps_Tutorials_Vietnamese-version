# 📜 Scripting & Automation — Tự Động Hóa Bằng Kịch Bản Bash/Python & Lập Lịch Cron

> **Mục tiêu (Objectives)**: Làm chủ cú pháp kịch bản Bash shell, lập trình tự động hóa Python cơ bản và cơ chế lập lịch tác vụ tự động bằng Cronjob để tự động hóa các hoạt động quản trị hệ thống và kiểm tra an ninh mạng.

---

## 1. Viết kịch bản Shell (Bash Scripting)

Kịch bản Shell (**Shell Script / Bash Script**) là một tệp văn bản chứa một chuỗi các câu lệnh tuần tự mà bạn muốn hệ điều hành Linux thực thi thay vì phải gõ thủ công từng dòng trên Terminal.

### A. Chỉ thị dòng Shebang (`#!/bin/bash`)
Mọi tệp kịch bản chuyên nghiệp luôn bắt đầu bằng chỉ thị **Shebang** (`#!`) nằm ở dòng đầu tiên:
```bash
#!/bin/bash
```
*   *Bản chất:* Khi bạn chạy tệp kịch bản (v.d. `./script.sh`), kernel của Linux sẽ đọc dòng đầu tiên này để xác định chương trình thông dịch (**Interpreter**) nào cần được gọi để biên dịch và chạy các dòng code bên dưới (v.d. `/bin/bash`, `/bin/sh`, hoặc `/usr/bin/python3`).

---

### B. Các thành phần cú pháp lõi của Bash

1.  **Khai báo và Sử dụng Biến (Variables)**:
    *   Khai báo không có khoảng trắng quanh dấu `=`: `BACKUP_DIR="/var/backup"`
    *   Sử dụng biến bằng cách thêm dấu `$`: `echo "Thư mục lưu trữ: $BACKUP_DIR"`
2.  **Tham số truyền vào từ dòng lệnh (Command Line Arguments)**:
    *   `$0`: Tên của chính tệp kịch bản đang chạy.
    *   `$1`, `$2`, `$3`: Tham số thứ nhất, thứ hai, thứ ba truyền vào từ CLI.
    *   `$#`: Tổng số lượng tham số truyền vào.
    *   `$@`: Danh sách tất cả các tham số truyền vào dưới dạng mảng.
3.  **Trạng thái trả về lỗi (Exit Codes)**:
    *   Mỗi câu lệnh sau khi chạy xong luôn trả về một số nguyên từ `0` đến `255` biểu diễn kết quả thực thi (lưu trong biến `$?`).
    *   `0`: Thành công hoàn toàn (**Success**).
    *   Khác `0` (thường là `1`): Gặp lỗi (**Failure**). Bạn có thể tự định nghĩa kết quả trả về bằng chỉ thị `exit 1`.
4.  **Cấu trúc điều kiện rẽ nhánh (Conditional Statements - If/Else)**:
    ```bash
    # Kiểm tra xem thư mục có tồn tại hay không
    if [ -d "$BACKUP_DIR" ]; then
        echo "Thư mục đã tồn tại."
    else
        echo "Thư mục không tồn tại. Tiến hành tạo mới..."
        mkdir -p "$BACKUP_DIR"
    fi
    ```
5.  **Cấu trúc vòng lặp (Loops - For/While)**:
    ```bash
    # Vòng lặp duyệt qua danh sách các file cần quét bảo mật
    for file in $(ls /app/config/); do
        echo "Đang quét an ninh cho tệp tin: $file"
    done
    ```

---

## 2. Viết kịch bản tự động bằng Python (Python Scripting)

### A. Tại sao DevOps cần Python?
Kịch bản Bash cực kỳ mạnh mẽ cho các tác vụ gọi lệnh CLI hệ điều hành nhanh gọn. Tuy nhiên, khi các tác vụ tự động hóa trở nên phức tạp hơn, Bash sẽ trở nên khó đọc, khó gỡ lỗi và chậm chạp.
Chúng ta sử dụng **Python** khi cần:
*   Phân tích cấu trúc dữ liệu phức tạp như JSON, YAML, XML (v.d. phân tích kết quả quét bảo mật).
*   Giao tiếp với các giao diện lập trình ứng dụng REST API của các dịch vụ bên ngoài.
*   Tương tác với các dịch vụ đám mây (AWS, GCP, Azure) thông qua thư viện phần mềm chuyên dụng (Software Development Kits - SDKs như `boto3`).

### B. Các thư viện Python hệ thống cốt lõi trong DevOps
*   `sys`: Quản lý các tham số dòng lệnh và tương tác trực tiếp với trình thông dịch Python.
*   `os`: Tương tác với hệ điều hành máy host (tạo thư mục, đọc biến môi trường, quản lý đường dẫn file).
*   `subprocess`: Gọi và thực thi các câu lệnh shell của Linux ngay bên trong code Python và lấy kết quả trả về.
*   `requests`: Gửi các truy vấn HTTP (GET, POST) để giao tiếp với các Web API hoặc gửi cảnh báo lên Slack/Telegram.

*Ví dụ kịch bản Python kiểm tra trạng thái dịch vụ (Health Check):*
```python
#!/usr/bin/env python3
import requests
import sys

def check_site_status(url):
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"SUCCESS: {url} hoạt động bình thường! (Status: 200)")
            sys.exit(0) # Trả về exit code 0 thành công
        else:
            print(f"WARNING: {url} trả về mã lỗi (Status: {response.status_code})")
            sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Không thể kết nối tới {url}. Lỗi: {e}")
        sys.exit(2)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Cú pháp: python3 health.py <URL>")
        sys.exit(1)
    check_site_status(sys.argv[1])
```

---

## 3. Lập lịch tác vụ tự động bằng Cronjob (Cron Utility)

**Cron** là một chương trình dịch vụ chạy ngầm (**Cron Daemon - crond**) liên tục trong Linux, chịu trách nhiệm tự động thực thi các tác vụ hoặc script vào những khoảng thời gian được định nghĩa sẵn bởi người dùng.

### A. Cấu trúc 5 trường thời gian của Crontab (Cron Syntax)
Bạn thiết lập thời gian chạy cho script bằng cách khai báo một dòng lệnh trong bảng cấu hình `crontab` với cú pháp 5 ngôi sao chuẩn:

```
*     *     *     *     *      /path/to/script.sh
-     -     -     -     -
|     |     |     |     |
|     |     |     |     +----- Ngày trong tuần (Day of week: 0 - 6, 0 là Chủ Nhật)
|     |     |     +----------- Tháng (Month: 1 - 12)
|     |     +----------------- Ngày trong tháng (Day of month: 1 - 31)
|     +----------------------- Giờ (Hour: 0 - 23)
+----------------------------- Phút (Minute: 0 - 59)
```

Các ký tự đặc biệt hỗ trợ:
*   `*` (Dấu sao): Đại diện cho mọi giá trị có thể (v.d. dấu sao ở vị trí Phút nghĩa là chạy mỗi phút).
*   `,` (Dấu phẩy): Khai báo danh sách các mốc thời gian cụ thể (v.d. `0 9,17 * * *` nghĩa là chạy vào lúc 9 giờ sáng và 5 giờ chiều hàng ngày).
*   `-` (Dấu gạch ngang): Khai báo khoảng thời gian liên tục (v.d. `0 9-17 * * *` nghĩa là chạy mỗi tiếng trong khung từ 9h đến 17h).
*   `*/n` (Dấu xuyệt): Khai báo chu kỳ lặp lại sau mỗi `n` khoảng thời gian (v.d. `*/5 * * * *` nghĩa là chạy lặp lại sau mỗi 5 phút).

---

### B. Thực tiễn Bảo mật khi cấu hình Cronjob (Cron Security Best Practices)
1.  **Tuyệt đối cấm chạy Cron dưới quyền `root` nếu không cần thiết**:
    *   Nếu script sao lưu hay quét hệ thống bị dính mã độc hoặc bị hacker chỉnh sửa file nguồn, khi cron daemon chạy script dưới quyền `root`, máy chủ sẽ bị chiếm đoạt toàn bộ quyền hạn. Hãy chạy cron dưới quyền của user thường.
2.  **Định nghĩa rõ ràng biến môi trường `PATH`**:
    *   Môi trường chạy cron daemon rất tối giản và không tự động tải toàn bộ biến môi trường của user login (`.bashrc`). Do đó, bạn nên sử dụng **đường dẫn tuyệt đối (absolute path)** cho mọi câu lệnh và tệp tin trong script (v.d. dùng `/usr/bin/tar` thay vì chỉ dùng `tar`).
3.  **Khóa quyền đọc của file cấu hình Cron**:
    *   Đảm bảo các file script chạy định kỳ được phân quyền chặt chẽ (`chmod 700` hoặc `755`) để ngăn chặn việc người dùng thường ghi đè mã độc vào nội dung script.

---

## 📖 Câu hỏi tự ôn tập & Kiểm tra kiến thức
1. *Tại sao khi viết script chạy bằng Cronjob, nếu ta viết đường dẫn tương đối (v.d. `tar -czf backup.tar.gz ./data`) thì script thường bị lỗi crash không tìm thấy file?*
2. *Làm thế nào để viết một biểu thức Cron chạy một kịch bản sao lưu dữ liệu vào đúng 12 giờ đêm (00:00) ngày Chủ Nhật hàng tuần?*
3. *Sự khác biệt cốt lõi giữa Exit Code `0` và `1` trong kịch bản Bash là gì? Làm thế nào để CI/CD Pipeline nhận biết script của bạn chạy thành công hay thất bại?*
