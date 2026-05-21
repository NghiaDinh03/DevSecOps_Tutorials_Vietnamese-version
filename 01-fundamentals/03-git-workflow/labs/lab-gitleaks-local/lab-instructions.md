# 🧪 Lab 1.4: Chặn Rò Rỉ Secrets Cục Bộ Bằng Gitleaks & Git Hooks (Gitleaks Local Hardening Lab)

## 📌 Lý do bài thực hành này tồn tại (Why this Lab?)
Việc rò rỉ các chuỗi nhạy cảm như API Keys, AWS Tokens, SSH Keys hay mật khẩu cơ sở dữ liệu lên các kho lưu trữ công khai như GitHub là thảm họa bảo mật hàng đầu hiện nay. Khi mã nguồn đã được đẩy lên (push) server, dù bạn có xóa key đi thì lịch sử Git (Git History) vẫn ghi lại vĩnh viễn khóa đó.
Giải pháp tối ưu là **chặn đứng rò rỉ ngay tại máy cá nhân của Developer** trước khi mã được đưa vào commit (Shift-Left Security). Bài lab này hướng dẫn bạn cách thiết lập **Gitleaks** tích hợp vào **Git pre-commit Hook** để tự động kiểm duyệt mã nguồn mỗi khi gõ lệnh `git commit`.

---

## ⚙️ Sơ đồ Hoạt động của Git Hook
```
[Developer gõ git commit] ──────► [Git Hook kích hoạt pre-commit]
                                              │
                                              ├─► Gitleaks phát hiện Secret? ─► [CHẶN COMMIT] Báo lỗi đỏ
                                              │
                                              └─► An toàn sạch sẽ ────────────► [COMMIT THÀNH CÔNG]
```

---

## 🛠️ Các bước Thực hành Chi tiết

### Bước 1: Cài đặt Gitleaks trên máy cá nhân
Hãy tải phiên bản Gitleaks phù hợp với hệ điều hành của bạn:
*   **Trên macOS (sử dụng Homebrew):**
    ```bash
    brew install gitleaks
    ```
*   **Trên Windows (sử dụng Chocolatey hoặc WinGet):**
    ```powershell
    choco install gitleaks -y
    # hoặc
    winget install gitleaks
    ```
*   **Trên Linux:**
    ```bash
    wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_linux_x64.tar.gz
    tar -zxvf gitleaks_8.18.2_linux_x64.tar.gz
    sudo mv gitleaks /usr/local/bin/
    ```
*Kiểm tra cài đặt thành công:* `gitleaks version`

### Bước 2: Thiết lập dự án Git thử nghiệm
```bash
# Khởi tạo repo Git mới
git init lab-sec-scanning && cd lab-sec-scanning

# Tạo file README
echo "# Lab Gitleaks" > README.md
git add README.md
git commit -m "initial commit"
```

### Bước 3: Cấu hình Git Hook `pre-commit`
Git Hooks là các script tự động chạy khi xảy ra các sự kiện Git cụ thể. Tập tin script `pre-commit` nằm trong thư mục ẩn `.git/hooks/` sẽ chạy ngay khi bạn gõ lệnh `git commit`.

1. Hãy tạo hoặc sửa đổi file `.git/hooks/pre-commit` (trên Linux/macOS) hoặc tạo file script tương đương.
2. Sao chép nội dung script kiểm tra bảo mật dưới đây vào tệp tin `.git/hooks/pre-commit`:
```bash
#!/bin/sh
# Chạy gitleaks quét các thay đổi trước khi commit (chỉ quét phần staged)
echo "🔒 Đang quét an toàn dữ liệu commit bằng Gitleaks..."

gitleaks protect --staged --verbose

if [ $? -ne 0 ]; then
  echo "❌ CẢNH BÁO: Phát hiện Secrets/API Key nhạy cảm trong code của bạn!"
  echo "❌ Commit đã bị chặn để bảo vệ an toàn. Vui lòng gỡ bỏ Secrets trước khi commit lại."
  exit 1
fi
```

3. **Cấp quyền thực thi** cho file hook (Bắt buộc trên Linux/macOS):
```bash
chmod +x .git/hooks/pre-commit
```

### Bước 4: Kiểm thử tính năng chặn rò rỉ
Bây giờ, hãy đóng vai một lập trình viên sơ ý, cố tình hardcode một **AWS API Access Key** nhạy cảm vào code:

```bash
# Tạo file config chứa khóa bảo mật
echo "AWS_ACCESS_KEY = \"AKIAIOSFODNN7EXAMPLE\"" > credentials.env

# Đưa file vào Staging area để chuẩn bị commit
git add credentials.env

# Cố gắng thực hiện commit
git commit -m "feat: add aws credentials config"
```

### Bước 5: Quan sát kết quả
Màn hình console sẽ lập tức hiển thị cảnh báo đỏ cực lớn từ Gitleaks:
```text
🔒 Đang quét an toàn dữ liệu commit bằng Gitleaks...
regex: AKIAIOSFODNN7EXAMPLE
file: credentials.env
line: 1

❌ CẢNH BÁO: Phát hiện Secrets/API Key nhạy cảm trong code của bạn!
❌ Commit đã bị chặn để bảo vệ an toàn. Vui lòng gỡ bỏ Secrets trước khi commit lại.
```
*Lệnh commit bị hủy bỏ lập tức. Tập tin `credentials.env` vẫn nằm ngoài lịch sử Git, bảo vệ an toàn tối đa cho hệ thống.*

---

## 🎯 Tổng kết Bài học
Qua bài thực hành này, bạn đã:
*   Cài đặt và hiểu nguyên lý hoạt động của **Gitleaks**.
*   Lập trình thành công **Git pre-commit Hook** để chặn rò rỉ mã nguồn chủ động.
*   Ứng dụng tư duy **Shift-Left Security** - phát hiện và xử lý lỗ hổng bảo mật ngay từ điểm đầu của quy trình phát triển phần mềm (máy trạm của developer).
