# SAST so với DAST so với SCA: Cách Lựa Chọn Bộ Công Cụ Quét Bảo Mật Tối Ưu

*   **Tên bài viết gốc**: Source Code Analysis Tools (SAST vs DAST vs SCA)
*   **Nguồn**: OWASP Foundation (Tổ chức phi lợi nhuận uy tín và lớn nhất thế giới về an ninh ứng dụng web)
*   **Liên kết gốc**: [OWASP.org - Source Code Analysis Tools](https://owasp.org/www-community/Source_Code_Analysis_Tools)

---

## 1. Giới thiệu

Trong kỷ nguyên phát triển phần mềm hiện đại, việc tích hợp quét bảo mật tự động ngay từ những giai đoạn đầu của vòng đời phát triển phần mềm an toàn (**SSDLC - Secure Software Development Life Cycle**) là bắt buộc đối với mọi doanh nghiệp. Phương pháp này được gọi là **Shift-Left Security** (Đẩy bảo mật về bên trái).

Tuy nhiên, thị trường có rất nhiều loại công cụ khác nhau: **SAST**, **SCA**, **DAST**. Việc hiểu sai bản chất và sử dụng sai mục đích các công cụ này sẽ dẫn đến việc lãng phí tài nguyên, kéo dài thời gian build của pipeline CI/CD một cách không cần thiết, hoặc tạo ra quá nhiều báo động giả (*False Positives*) gây ức chế cho lập trình viên.

Bài viết này cung cấp bản dịch và mổ xẻ so sánh toàn diện 3 phương pháp quét bảo mật cốt lõi theo hướng dẫn chuẩn từ OWASP.

---

## 2. SAST (Static Application Security Testing) - Quét mã nguồn tĩnh

### A. Bản chất kỹ thuật
SAST là phương pháp kiểm thử hộp trắng (**White-box testing**). Công cụ SAST sẽ phân tích mã nguồn thô (*source code*) hoặc mã máy sau khi biên dịch của ứng dụng **khi ứng dụng không chạy** (ở trạng thái tĩnh).

Công cụ SAST sẽ dựng lên một cây cú pháp trừu tượng (AST - Abstract Syntax Tree) của toàn bộ code, sau đó duyệt qua cây này để đối chiếu với các mẫu viết code thiếu an toàn đã biết.

### B. Ưu điểm và Nhược điểm theo OWASP
*   **Ưu điểm**:
    *   Quét 100% dòng code của bạn.
    *   Chỉ ra chính xác vị trí dòng code bị lỗi (file nào, dòng thứ bao nhiêu) và giải thích nguyên nhân kèm cách sửa.
    *   Tốc độ quét nhanh, chạy được ngay ở máy local của dev hoặc khi vừa commit code.
*   **Nhược điểm**:
    *   Tỷ lệ báo động giả (*False Positives*) rất cao. Nhiều đoạn code logic an toàn trong ngữ cảnh cụ thể vẫn bị công cụ đánh dấu là lỗi.
    *   Không thể phát hiện các lỗi liên quan đến cấu hình môi trường runtime (ví dụ: cấu hình TLS yếu, cấu hình container lỏng lẻo).

---

## 3. SCA (Software Composition Analysis) - Quét thư viện bên thứ ba

### A. Bản chất kỹ thuật
Hơn 80% mã nguồn của các ứng dụng hiện đại ngày nay được ghép lại từ các thư viện nguồn mở của bên thứ ba (thông qua `npm`, `maven`, `pip`). Lập trình viên chỉ tự viết khoảng 20% logic nghiệp vụ.

SCA là phương pháp chuyên biệt để quét các tệp định nghĩa thư viện phụ thuộc (như `package-lock.json`, `pom.xml`, `requirements.txt`) để đối chiếu với các cơ sở dữ liệu lỗ hổng bảo mật toàn cầu (như NVD - National Vulnerability Database, CVE) để phát hiện xem bạn có đang dùng các thư viện bị lỗi hay không.

### B. Giá trị thực tiễn
*   Ngăn chặn từ gốc các thảm họa bảo mật chuỗi cung ứng nổi tiếng (tiêu biểu như lỗi **Log4Shell** trong thư viện Log4j của Java hoặc **Heartbleed** trong OpenSSL).
*   Kiểm soát tuân thủ bản quyền giấy phép nguồn mở (License Compliance), tránh việc vô tình sử dụng các thư viện có giấy phép GPL buộc doanh nghiệp phải mở khóa toàn bộ mã nguồn thương mại.

---

## 4. DAST (Dynamic Application Security Testing) - Quét động hộp đen

### A. Bản chất kỹ thuật
DAST là phương pháp kiểm thử hộp đen (**Black-box testing**). Khác hoàn toàn với SAST và SCA, DAST chỉ có thể hoạt động **khi ứng dụng của bạn đang chạy thực tế** ở môi trường Staging, UAT hoặc Production.

Công cụ DAST đóng vai trò như một tin tặc ngoài đời thực, gửi hàng loạt payload độc hại (như SQL Injection, Cross-Site Scripting - XSS) vào các cổng giao tiếp, form nhập liệu, endpoints API để xem phản hồi của ứng dụng và tìm kẽ hở.

### B. Ưu điểm và Nhược điểm theo OWASP
*   **Ưu điểm**:
    *   Tỷ lệ báo động giả cực kỳ thấp. Lỗi nào DAST quét ra là lỗi đó chắc chắn khai thác được ngoài đời thực.
    *   Phát hiện xuất sắc các lỗi liên quan đến môi trường runtime: session hijacking, thiếu header bảo mật (CORS, HSTS), cấu hình SSL/TLS yếu.
*   **Nhược điểm**:
    *   Tốc độ quét rất chậm (thường mất từ vài tiếng đến cả ngày).
    *   Không chỉ ra được dòng code nào bị lỗi, chỉ trả về endpoint hoặc URL bị tấn công.
    *   Bề mặt quét bị giới hạn: DAST chỉ có thể quét các đường dẫn có thể mò ra được từ bên ngoài, không quét được logic ẩn bên dưới.

---

## 5. Bảng So sánh Tổng hợp từ OWASP

| Tiêu chí | SAST | SCA | DAST |
|---|---|---|---|
| **Phương pháp** | Hộp trắng (White-box) | Quét thư viện (Dependencies) | Hộp đen (Black-box) |
| **Trạng thái app** | Không cần chạy (Tĩnh) | Không cần chạy (Tĩnh) | Bắt buộc phải chạy (Động) |
| **Phát hiện tốt nhất** | SQLi, XSS, Hardcoded Secrets | Thư viện CVE lỗi, License | Lỗi Header, Auth session, SSL |
| **Tỷ lệ báo giả** | Cao | Thấp | Rất thấp |
| **Thời gian quét** | Nhanh (vài giây - vài phút) | Siêu nhanh (vài giây) | Rất chậm (vài tiếng) |
| **Vị trí trong CI/CD**| Commit / Pull Request | Commit / Pull Request | Sau khi Deploy lên Staging/UAT|

---

## 6. Kết luận của OWASP

Không có một công cụ nào là vạn năng và có thể thay thế hoàn toàn cho các công cụ còn lại. Một chiến lược DevSecOps chuẩn mực là phải triển khai phòng thủ đa lớp: tích hợp SAST và SCA vào giai đoạn lập trình viên commit code để sửa lỗi nhanh nhất với chi phí rẻ nhất, kết hợp chạy DAST tự động vào ban đêm sau khi deploy lên staging để quét các lỗi runtime phức tạp.
