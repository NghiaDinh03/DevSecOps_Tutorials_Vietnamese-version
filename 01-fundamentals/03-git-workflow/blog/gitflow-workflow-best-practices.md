# Quy Trình Làm Việc Gitflow: Thực Tiễn Tốt Nhất Để Làm Việc Nhóm An Toàn

*   **Tên bài viết gốc**: Gitflow Workflow: Comparing Workflows
*   **Nguồn**: Atlassian Git Blog (Cẩm nang chuẩn hóa quy trình phân nhánh cho hàng triệu nhóm phát triển trên thế giới)
*   **Liên kết gốc**: [Atlassian Git Blog - Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

## 1. Giới thiệu

Khi dự án phần mềm tăng trưởng và có sự tham gia của nhiều kỹ sư, việc quản lý mã nguồn mà không có một chiến lược rõ ràng sẽ dẫn đến thảm họa: đè code của nhau, mất lịch sử commit, và đặc biệt là đưa mã nguồn lỗi hoặc chưa kiểm thử lên môi trường Production.

**Gitflow Workflow** là một mô hình thiết kế phân nhánh Git cực kỳ chặt chẽ, được giới thiệu lần đầu bởi Vincent Driessen. Nó cung cấp một khuôn mẫu phân chia vai trò của từng nhánh một cách khoa học, giúp kiểm soát chất lượng phần mềm tốt nhất và tích hợp hoàn hảo với các chốt chặn bảo mật DevSecOps.

---

## 2. Cấu trúc Phân nhánh Chuẩn trong Gitflow

Gitflow phân định rõ ràng các nhánh thành hai nhóm: **Nhánh tồn tại vĩnh viễn** và **Nhánh tạm thời**.

### A. Nhánh tồn tại vĩnh viễn (Historical Branches)

1.  **Nhánh `main` (hoặc `master`)**:
    *   *Vai trò*: Nhánh phản ánh mã nguồn hoàn toàn ổn định đang chạy thực tế trên Production.
    *   *Quy tắc*: Không bao giờ commit hoặc push trực tiếp lên `main`. Mã nguồn vào `main` bắt buộc phải đi qua quy trình kiểm thử và review nghiêm ngặt.
2.  **Nhánh `develop`**:
    *   *Vai trò*: Nhánh tích hợp chính. Toàn bộ các tính năng mới sau khi hoàn thành sẽ được gộp vào đây để chạy thử nghiệm giai đoạn Staging/UAT.

---

### B. Nhánh tạm thời (Supporting Branches)

Các nhánh này được tạo ra để phục vụ một mục đích cụ thể và sẽ bị xóa bỏ sau khi được gộp ngược lại vào các nhánh chính.

1.  **Nhánh tính năng (`feature/*`)**:
    *   *Điểm xuất phát*: Tách ra từ `develop`.
    *   *Điểm đích*: Gộp lại vào `develop`.
    *   *Quy tắc đặt tên*: `feature/ten-tinh-nang` (ví dụ: `feature/login-oauth2`).
    *   *Bảo mật*: Môi trường phát triển độc lập, cho phép lập trình viên tự do thử nghiệm mà không sợ ảnh hưởng đến luồng chính.
2.  **Nhánh chuẩn bị phát hành (`release/*`)**:
    *   *Điểm xuất phát*: Tách ra từ `develop` khi các tính năng của phiên bản mới đã hoàn tất và đạt độ chín.
    *   *Điểm đích*: Gộp song song vào cả `main` và `develop`.
    *   *Vai trò*: Giai đoạn đóng băng tính năng để fix các bug nhỏ cuối cùng, tạo tài liệu hướng dẫn và thực hiện quét bảo mật tổng thể trước khi phát hành.
3.  **Nhánh sửa lỗi khẩn cấp (`hotfix/*`)**:
    *   *Điểm xuất phát*: Tách ra trực tiếp từ `main`.
    *   *Điểm đích*: Gộp song song vào cả `main` và `develop` (hoặc `release` nếu đang có release branch).
    *   *Vai trò*: Nhánh duy nhất được phép bypass luồng tích hợp thường quy để vá các lỗi nghiêm trọng đang xảy ra trên môi trường Production lập tức.

---

## 3. Lồng ghép Bảo mật vào Gitflow (DevSecOps Integration)

Để biến Gitflow thành tấm khiên bảo vệ mã nguồn, doanh nghiệp cần cấu hình **Quy tắc bảo vệ nhánh (Protected Branches)** kết hợp với pipeline CI/CD tự động:

*   **Cấm Push trực tiếp**: Khóa cứng quyền push lên `main` và `develop`. Mọi thay đổi bắt buộc phải thông qua **Pull Request (PR)**.
*   **Bắt buộc Code Review**: Cấu hình PR chỉ được merge khi có tối thiểu 1-2 kỹ sư cao cấp phê duyệt (*Approval*).
*   **Tích hợp Quét Bảo mật Tự động (Shift-Left)**: Pipeline CI/CD phải tự động kích hoạt khi có PR:
    *   Chạy Unit Tests.
    *   Quét mã nguồn tĩnh (SAST) tìm lỗi bảo mật.
    *   Quét thư viện phụ thuộc (SCA) tìm thư viện lỗi.
    *   Chỉ khi tất cả các kiểm tra này vượt qua (trạng thái màu xanh), nút Merge mới được mở khóa.

---

## 4. Kết luận

Gitflow không chỉ là một quy trình kỹ thuật, nó là tư duy làm việc nhóm chuyên nghiệp và có tính kỷ luật cao. Bằng cách áp dụng đúng Gitflow kết hợp với các cổng bảo mật tự động, doanh nghiệp sẽ bảo vệ được tài sản trí tuệ cốt lõi, giảm thiểu tối đa rủi ro đưa mã độc lên Production và tối ưu hóa năng suất của toàn đội ngũ.
