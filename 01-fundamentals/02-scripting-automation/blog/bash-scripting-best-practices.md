# Viết Bash Script Chuyên Nghiệp: Best Practices và Các Kỹ Thuật Phòng Tránh Lỗi

*   **Tên bài viết gốc**: Bash Scripting Best Practices
*   **Tác giả**: Aaron Maxwell (Kỹ sư hệ thống cao cấp)
*   **Nguồn dịch**: Tổng hợp từ Aaron Maxwell Blog & Dev.to (Đạt 15k+ views và hàng trăm lượt tương tác từ cộng đồng SRE toàn cầu)
*   **Dịch thuật**: Dịch chuẩn xác, dễ hiểu sang văn phong kỹ sư DevSecOps Việt Nam.

---

## 1. Giới thiệu

Trong kỷ nguyên của Terraform, Ansible và Kubernetes, ngôn ngữ dòng lệnh Bash Shell vẫn giữ một vị trí độc tôn không thể thay thế. Hầu hết các CI/CD Pipelines (GitHub Actions, GitLab CI), các Docker entrypoints và các tác vụ tự động hóa hệ thống ở mức thấp đều được vận hành bằng Bash scripts.

Tuy nhiên, Bash là một ngôn ngữ "lỏng lẻo" và rất dễ sinh ra các lỗi ngầm nguy hiểm nếu lập trình viên không tuân thủ các quy tắc bảo mật. Một lỗi nhỏ trong Bash script có thể dẫn đến việc xóa sạch dữ liệu hệ thống hoặc làm sập toàn bộ luồng CI/CD mà không có cảnh báo.

Bài viết này tổng hợp các thực tiễn tốt nhất (Best Practices) và các kỹ thuật gia cố an toàn giúp bạn viết Bash script chuyên nghiệp như một Senior DevOps Engineer.

---

## 2. Tiêu chuẩn Vàng: Bộ ba Phòng vệ `set -euo pipefail`

Đây là quy tắc số một và quan trọng nhất khi viết bất kỳ Bash script nào. Hãy luôn đặt câu lệnh này ở ngay đầu script, ngay dưới dòng khai báo Shell (`#!/bin/bash`):

```bash
#!/bin/bash
set -euo pipefail
```

### A. Giải thích chi tiết ý nghĩa từng cờ:

#### 1. `set -e` (Exit immediately on error)
*   *Mặc định:* Bash sẽ tiếp tục chạy các dòng lệnh tiếp theo bất chấp các dòng lệnh trước đó bị lỗi (trả về exit code khác 0). Điều này cực kỳ nguy hiểm.
    *   *Tình huống thảm họa:*
        ```bash
        cd /var/dir_that_does_not_exist
        rm -rf *
        ```
        Nếu thư mục `/var/dir_that_does_not_exist` không tồn tại, lệnh `cd` thất bại. Nhưng vì không có `set -e`, Bash vẫn tiếp tục chạy lệnh `rm -rf *` tại thư mục hiện tại của bạn, xóa sạch dữ liệu thư mục đó!
    *   *Giải pháp:* `set -e` sẽ dừng script ngay lập tức khi phát hiện bất kỳ câu lệnh nào thất bại.

#### 2. `set -u` (Treat unset variables as an error)
*   *Mặc định:* Khi bạn tham chiếu đến một biến chưa được định nghĩa hoặc bị gõ sai tên, Bash sẽ âm thầm coi nó là một chuỗi rỗng `""`.
    *   *Tình huống thảm họa:*
        ```bash
        rm -rf "$TMP_DIR/"
        ```
        Nếu biến `TMP_DIR` chưa được định nghĩa (hoặc bị gõ sai thành `TAMP_DIR`), Bash sẽ hiểu là `rm -rf /`, xóa sạch hệ thống tập tin!
    *   *Giải pháp:* `set -u` buộc Bash dừng script và báo lỗi `unbound variable` khi gặp biến chưa định nghĩa.

#### 3. `set -o pipefail` (Pipeline failure detection)
*   *Mặc định:* Trong một chuỗi lệnh đường ống (pipeline, dùng ký tự `|`), Bash chỉ kiểm tra exit code của **câu lệnh cuối cùng** trong chuỗi.
    *   *Ví dụ:* `lệnh_lỗi | grep "test"` -> Nếu `lệnh_lỗi` bị thất bại nhưng lệnh `grep` chạy thành công, exit code tổng vẫn là `0` (thành công) và Bash tiếp tục chạy script.
    *   *Giải pháp:* `set -o pipefail` đảm bảo rằng nếu bất kỳ mắt xích nào trong đường ống dẫn lệnh bị lỗi, toàn bộ pipeline sẽ bị coi là lỗi và dừng script.

---

## 3. Luôn bọc Biến bằng Dấu ngoặc kép (Double Quoting Variables)

Một trong những lỗi phổ biến nhất của người mới là không bọc các biến trong dấu ngoặc kép khi sử dụng.

### A. Tại sao phải dùng ngoặc kép?
Nếu giá trị của biến có chứa khoảng trắng hoặc ký tự đặc biệt, Bash sẽ thực hiện cơ chế **Word Splitting** (chia từ) và **Globbing** (mở rộng ký tự đại diện), dẫn đến hành vi sai lệch.

*   *Tình huống lỗi:*
    ```bash
    FILE_PATH="my resume.pdf"
    rm $FILE_PATH
    ```
    Bash sẽ biên dịch lệnh thành `rm my resume.pdf`, và cố gắng xóa hai file: `my` và `resume.pdf`.
*   *Cách khắc phục chuẩn:*
    ```bash
    rm "$FILE_PATH"
    ```

---

## 4. Sử dụng cú pháp `$()` thay cho dấu Backticks (``)

Khi bạn muốn gán kết quả thực thi của một lệnh vào một biến (Command Substitution):

*   ❌ *Tránh dùng dấu Backticks cũ:*
    ```bash
    CURRENT_USER=`whoami`
    ```
*   ✅ *Nên sử dụng cú pháp `$()` hiện đại:*
    ```bash
    CURRENT_USER=$(whoami)
    ```

### A. Lý do:
Cú pháp `$()` hỗ trợ việc lồng các câu lệnh vào nhau một cách dễ dàng và trực quan hơn rất nhiều so với backticks (vốn đòi hỏi phải escape các dấu backtick bên trong rất phức tạp).
*   *Ví dụ lồng lệnh:* `DIR_SIZE=$(du -sh "$(dirname "$FILE_PATH")")`

---

## 5. Phòng vệ bằng cấu hình Đường dẫn tuyệt đối và Thư mục làm việc

Đừng bao giờ tin tưởng rằng script của bạn luôn được chạy từ đúng thư mục chứa nó. Người dùng có thể đứng ở bất kỳ đâu trong hệ thống và gọi script của bạn.

### A. Giải pháp xác định thư mục chứa script tự động:

Hãy sử dụng đoạn code kinh điển sau để tự động lấy đường dẫn tuyệt đối của thư mục chứa chính script đó, bất kể nó được gọi từ đâu:

```bash
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$ROOT_DIR"
```

*   `BASH_SOURCE[0]` chứa đường dẫn tương đối khi gọi script.
*   `dirname` lấy phần thư mục của đường dẫn đó.
*   `cd ... && pwd` di chuyển vào thư mục đó và in ra đường dẫn tuyệt đối, sau đó gán vào `ROOT_DIR`.
*   Lúc này bạn có thể tự tin sử dụng các đường dẫn tương đối trong dự án dạng `"$ROOT_DIR/configs/app.conf"`.

---

## 6. Dọn dẹp Tài nguyên bằng Bẫy Tín hiệu `trap`

Khi script tự động hóa của bạn tạo ra các file tạm thời trong quá trình chạy, hoặc mở các kết nối ngầm, bạn cần đảm bảo các tài nguyên này phải được dọn dẹp sạch sẽ kể cả khi script bị lỗi giữa chừng hoặc bị người dùng nhấn `Ctrl + C` ngắt đột ngột.

### A. Giải pháp sử dụng `trap`:

```bash
# Tạo file tạm thời an toàn bằng mktemp
TMP_FILE=$(mktemp /tmp/backup_XXXXXX.sql)

# Định nghĩa hàm dọn dẹp tài nguyên
cleanup() {
    echo "⚡ Đang tiến hành dọn dẹp tài nguyên tạm thời..."
    rm -f "$TMP_FILE"
}

# Đăng ký bẫy tín hiệu: Gọi hàm cleanup khi script thoát (EXIT),
# hoặc khi nhận tín hiệu ngắt (INT - Ctrl+C), tín hiệu dừng hệ thống (TERM).
trap cleanup EXIT INT TERM
```

Nhờ có `trap`, hàm `cleanup` luôn luôn được thực thi ở cuối vòng đời của script bất chấp mọi tình huống lỗi hay dừng khẩn cấp.

---

## 7. Kết luận

Viết Bash script không khó, nhưng viết Bash script **an toàn, chuyên nghiệp và đáng tin cậy** đòi hỏi sự tỉ mỉ và tuân thủ các quy tắc phòng vệ. Bằng cách áp dụng `set -euo pipefail`, bọc biến bằng dấu ngoặc kép, và xử lý tài nguyên thông minh với `trap`, bạn sẽ nâng cao chất lượng code tự động hóa của mình lên chuẩn doanh nghiệp, giảm thiểu tối đa các lỗi ngập tràn rủi ro hệ thống.
