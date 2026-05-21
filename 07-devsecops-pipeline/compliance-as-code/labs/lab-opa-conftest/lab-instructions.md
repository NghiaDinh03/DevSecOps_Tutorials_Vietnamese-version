# 🧪 Lab 07: Kiểm duyệt Tuân thủ Cấu hình Dockerfile tự động với Conftest (Conftest Rego Lab)

## 📌 Lý do bài thực hành này tồn tại (Why this Lab?)
Trong DevSecOps, **Compliance-as-Code (Tuân thủ dưới dạng Code)** là chốt chặn tự động tối cao để đảm bảo toàn bộ tệp cấu hình của dự án (như Dockerfile) tuân thủ 100% các tiêu chuẩn an toàn thông tin trước khi đóng gói ứng dụng.
Bài lab này hướng dẫn bạn cách sử dụng **Conftest** (một công cụ siêu nhẹ dựa trên OPA) viết các chính sách kiểm duyệt bằng ngôn ngữ **Rego** để:
1.  **Chặn đứng (FAIL)** nếu Dockerfile chạy dưới quyền user Root hoặc thiếu khai báo User non-root.
2.  **Cảnh báo (WARN)** nếu Dockerfile thiếu dòng kiểm tra sức khỏe `HEALTHCHECK`.

---

## ⚙️ Sơ đồ Luồng Hoạt động trong Lab

```mermaid
graph TD
    User([Học viên]) -->|1. Khởi chạy container| Compose[docker-compose up]
    User -->|2. Chạy test Dockerfile.insecure| Runner[Container: conftest-runner]
    Runner -->|3. Đối chiếu policy/docker.rego| Rego{Rego Policy Engine}
    Rego -->>|4. Kết quả: 2 FAIL, 1 WARN| User
    User -->|5. Chạy test Dockerfile.secure| Runner
    Rego -->>|6. Kết quả: PASS hoàn toàn!| User
```

---

## 🛠️ Các bước Thực hành Chi tiết

### Bước 1: Khởi động Conftest Runner
Hãy di chuyển vào thư mục bài lab và chạy lệnh sau để khởi động môi trường:
```bash
docker-compose up -d
```
*Lưu ý: Môi trường này chỉ sử dụng một container Conftest siêu nhẹ (~15MB), khởi động hoàn tất chỉ trong 3 giây!*

### Bước 2: Kiểm duyệt Dockerfile kém an toàn (Dockerfile.insecure)
Chúng ta sẽ chạy kiểm thử tệp tin Dockerfile kém an toàn `src/Dockerfile.insecure` (tệp này chạy mặc định quyền root, không có dòng USER khai báo, không cấu hình HEALTHCHECK):
```bash
docker exec -it devsecops-conftest-runner conftest test src/Dockerfile.insecure
```
*Hãy quan sát kỹ màn hình kết quả quét. Conftest sẽ hiển thị:*
```
FAIL - src/Dockerfile.insecure - main - ❌ BẢO MẬT: Dockerfile thiếu khai báo USER! Bắt buộc phải cấu hình tài khoản non-root (ví dụ: USER 10001).
WARN - src/Dockerfile.insecure - main - ⚠️ CẢNH BÁO: Dockerfile thiếu khai báo HEALTHCHECK! Khuyến nghị bổ sung để theo dõi sức khỏe container.

2 tests, 0 passed, 1 warning, 1 failure, 0 exceptions
```
*Lưu ý: Lệnh này trả về Exit Code = 1, khiến chốt chặn CI/CD tự động kích hoạt hủy Job build ngay lập tức để bảo vệ hệ thống.*

### Bước 3: Kiểm duyệt Dockerfile an toàn (Dockerfile.secure)
Bây giờ, hãy thử chạy kiểm duyệt tệp tin Dockerfile đã được gia cố bảo mật `src/Dockerfile.secure` (tệp này khai báo chạy dưới quyền `USER 10001` non-root, cấu hình `HEALTHCHECK` đầy đủ):
```bash
docker exec -it devsecops-conftest-runner conftest test src/Dockerfile.secure
```
*Quan sát màn hình kết quả:*
```
3 tests, 3 passed, 0 warnings, 0 failures, 0 exceptions
```
*Kết quả trả về màu xanh **PASS hoàn toàn!** Không có lỗi, không có cảnh báo. Exit Code trả về bằng 0, chốt chặn CI/CD phê duyệt cho phép đóng gói ứng dụng an toàn.*

### Bước 4: Khám phá cách hoạt động của mã Rego
Hãy mở file `policy/docker.rego` lên. Bạn sẽ thấy cú pháp Rego rất tường minh:
*   Khối `deny[msg]` đầu tiên bắt lệnh `input[i].Cmd == "user"` và so sánh giá trị xem có bằng `"root"` không.
*   Khối `deny[msg]` thứ hai đếm số lượng câu lệnh `user` trong Dockerfile. Nếu bằng `0`, nó sẽ báo lỗi.
*   Khối `warn[msg]` đếm số lượng câu lệnh `healthcheck`. Nếu bằng `0`, nó báo cảnh báo.

### Bước 5: Dọn dẹp môi trường
Tắt container sau khi hoàn thành thực hành:
```bash
docker-compose down
```

---

## 🎯 Tổng kết Bài học
Qua bài thực hành này, bạn đã:
*   Hiểu bản chất của triết lý **Compliance-as-Code (Tuân thủ dạng Code)**.
*   Lập trình thành công các chính sách kiểm duyệt hạ tầng an toàn bằng ngôn ngữ **Rego**.
*   Sử dụng **Conftest** tự động kiểm thử, phân tích cú pháp Dockerfile để phát hiện các lỗi cấu hình nghiêm trọng (Root user, missing Healthcheck) chỉ trong 1 mili-giây!
