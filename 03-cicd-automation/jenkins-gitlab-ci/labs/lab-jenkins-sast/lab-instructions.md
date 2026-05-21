# 🧪 Lab 03.02: Khởi Dựng Cụm Jenkins-SonarQube & Thiết Lập Tự Động Phân Tích Bảo Mật (SAST Scan Pipeline)

## 🎯 Mục tiêu bài Lab (Lab Objectives)
Sau khi hoàn thành bài lab này, học viên sẽ:
*   Tự tay dựng một hệ thống CI/CD phân tán cục bộ hoàn chỉnh gồm **Jenkins Controller**, một **Jenkins Agent** chuyên biệt kết nối qua SSH, và máy chủ phân tích bảo mật tĩnh **SonarQube Server**.
*   Hiểu rõ kiến trúc giao tiếp an toàn giữa Master và Agent.
*   Nắm vững cơ chế cấu hình kết nối tự động giữa Jenkins và SonarQube.
*   Thực hành viết **Declarative Jenkinsfile Pipeline** để quét phát hiện các lỗ hổng bảo mật nhạy cảm (SQL Injection, Hardcoded Secrets, XSS) trong mã nguồn.
*   Thiết lập **Quality Gate** hoạt động như một "trọng tài" tự động chặn đứng pipeline nếu mã nguồn chứa lỗ hổng bảo mật nghiêm trọng vượt ngưỡng cho phép.

---

## 💻 Yêu cầu hệ thống (Prerequisites)
1.  Máy host đã cài đặt sẵn **Docker** và **Docker Compose**.
2.  Cấu hình máy chủ đề xuất: RAM tối thiểu **4GB trống** (SonarQube chạy Elasticsearch bên dưới nên cần tối thiểu 2GB RAM để vận hành mượt mà).

---

## 🛠️ Các bước thực hiện chi tiết (Step-by-Step Instructions)

### Bước 1: Khởi chạy cụm dịch vụ CI/CD bằng Docker Compose
Tiến hành khởi chạy cụm 3 container độc lập liên kết trong mạng ảo cô lập `devsecops-jenkins-network`:

1.  Mở PowerShell (Windows) hoặc Terminal (Linux/macOS) và trỏ tới thư mục bài lab: `03-cicd-automation/jenkins-gitlab-ci/labs/lab-jenkins-sast/`.
2.  Chạy lệnh khởi chạy:
    ```bash
    docker-compose up -d
    ```
3.  Kiểm tra danh sách container đang hoạt động ổn định:
    ```bash
    docker ps
    ```
    *Đảm bảo cả 3 container: `jenkins-controller`, `jenkins-agent` và `sonarqube` đều ở trạng thái Up.*

---

### Bước 2: Thiết lập cấu hình ban đầu cho Jenkins Controller
1.  Truy cập vào giao diện web của Jenkins tại địa chỉ: `http://localhost:8080`
2.  Jenkins sẽ yêu cầu nhập **Administrator password** để mở khóa.
3.  Lấy mật khẩu này bằng cách xem trực tiếp log khởi chạy của container Controller:
    ```bash
    docker logs jenkins-controller
    ```
    *Tìm đoạn text dài nằm giữa 2 hàng sao (Ví dụ: `1a2b3c4d5e...`). Copy chuỗi này và dán vào ô mở khóa.*
4.  Chọn **Install suggested plugins** và chờ vài phút để Jenkins tự động tải và cài đặt các plugin nền tảng cốt lõi.
5.  Tạo tài khoản quản trị đầu tiên (Username/Password) tùy chọn theo ý bạn.

---

### Bước 3: Cấu hình Kết nối và Phân quyền Jenkins Agent
Để Controller có thể đẩy việc cho Agent, bạn cần đăng ký Agent này trên Web UI:

1.  Tại trang chủ Jenkins, chọn **Manage Jenkins** ➔ **Nodes**.
2.  Click vào **New Node**, đặt tên là: `jenkins-agent`, chọn **Permanent Agent** và nhấn **Create**.
3.  Cấu hình chi tiết như sau:
    *   **Description:** `Agent thực thi compile và scan bảo mật`
    *   **Number of executors:** `1`
    *   **Remote root directory:** `/home/jenkins/workspace`
    *   **Labels:** `jenkins-agent`
    *   **Usage:** `Only build jobs with label expressions matching this node`
    *   **Launch method:** Chọn **Launch agents via SSH**
        *   **Host:** `jenkins-agent` (Sử dụng tên dịch vụ Docker Compose nhờ cơ chế Service Discovery)
        *   **Credentials:** Nhấn nút **Add** ➔ chọn **Jenkins**.
            *   **Kind:** Chọn **Username with private key**
            *   **ID:** `jenkins-ssh-key`
            *   **Username:** `jenkins`
            *   **Private Key:** Chọn **Enter directly** ➔ Nhấn **Add** và dán khóa bí mật SSH sau vào (Khóa này khớp với khóa công khai gán trong docker-compose):
                ```text
                -----BEGIN OPENSSH PRIVATE KEY-----
                b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
                QyNTUxOQAAACCH/9mE6JbZ86wD0sF9vT6JtMhQj9aE/U5d76S3u9m9aZAAAACIXR+zNl0f
                szaQAAAAtzc2gtZWQyNTUxOQAAACCH/9mE6JbZ86wD0sF9vT6JtMhQj9aE/U5d76S3u9m9
                aZAAAAEAlM9eA3f7o39Zux+G+V6x+x4S/R4Y3GfR86U7QvV69/34If/2YIT/2YToJbZ86w
                D0sF9vT6JtMhQj9aE/U5d76S3u9m9aZAAAAF2RldnNlY29wcy1sb2NhbC1rZXkBAgMEBQ==
                -----END OPENSSH PRIVATE KEY-----
                ```
            *   Nhấn **Add** để lưu Credentials.
        *   Chọn Credentials vừa tạo trong danh sách thả xuống.
        *   **Host Key Verification Strategy:** Chọn **Non verifying Verification Strategy** (Bỏ qua xác thực vân tay khóa do chạy local).
4.  Nhấn **Save**. Quay lại danh sách Node, bạn sẽ thấy `jenkins-agent` tự động chuyển sang trạng thái kết nối thành công (mất biểu tượng gạch chéo đỏ).

---

### Bước 4: Tạo tài khoản & Cấp Token trên SonarQube Server
1.  Mở tab mới trên trình duyệt, truy cập SonarQube tại địa chỉ: `http://localhost:9000`
2.  Đăng nhập bằng tài khoản mặc định cực kỳ nguy hiểm (Cần đổi trên production):
    *   **Username:** `admin`
    *   **Password:** `admin`
3.  Hệ thống sẽ yêu cầu bạn đổi mật khẩu mới lập tức. Hãy thực hiện đổi mật khẩu.
4.  Sau khi đăng nhập thành công: Click vào Avatar góc phải chọn **My Account** ➔ **Security**.
5.  Tại mục **Generate Tokens**, đặt tên là `jenkins-token`, chọn loại **User Token** và nhấn **Generate**.
6.  **Hãy sao chép chuỗi mã Token vừa sinh ra.** (Nó có dạng: `sqa_a1b2c3d4...`).

---

### Bước 5: Cấu hình Tích hợp SonarQube vào Jenkins
Chúng ta cần khai báo SonarQube Server và Token bảo mật cho Jenkins:

1.  Quay lại Jenkins ➔ **Manage Jenkins** ➔ **Credentials** ➔ **System** ➔ **Global credentials (unrestricted)**.
2.  Click **Add Credentials**:
    *   **Kind:** Chọn **Secret text**
    *   **ID:** `sonar-token`
    *   **Secret:** Dán mã **SonarQube Token** bạn vừa copy ở Bước 4 vào đây.
    *   Nhấn **Create**.
3.  Quay lại **Manage Jenkins** ➔ **Plugins** ➔ chọn **Available Plugins** ➔ Tìm kiếm và cài đặt plugin tên là: **SonarQube Scanner**. Tích chọn restart Jenkins sau khi cài.
4.  Sau khi khởi động lại, truy cập **Manage Jenkins** ➔ **System**.
5.  Cuộn xuống tìm mục **SonarQube servers**:
    *   Tích chọn **Enable injection of SonarQube server configuration...**
    *   **Name:** Đặt chính xác là: `sonarqube-local-server` (Tên này phải khớp hoàn chỉnh với tên gọi trong tệp Jenkinsfile).
    *   **Server URL:** Điền `http://sonarqube:9000` (Nhờ mạng ảo docker kết nối trực tiếp).
    *   **Server authentication token:** Chọn Credentials `sonar-token` bạn vừa tạo.
    *   Nhấn **Save** để lưu cấu hình.

---

### Bước 6: Tạo Jenkins Pipeline Job & Thực thi quét SAST bảo mật
Bây giờ, chúng ta sẽ chạy pipeline mẫu để quét lỗ hổng bảo mật:

1.  Tại trang chủ Jenkins, chọn **New Item** ➔ Đặt tên là `nodejs-sast-pipeline` ➔ Chọn loại **Pipeline** và nhấn **OK**.
2.  Cuộn xuống phần **Pipeline definition**, chọn **Pipeline script**.
3.  Mở file mẫu [Jenkinsfile](configs/Jenkinsfile) đi kèm bài lab này, copy toàn bộ nội dung và dán vào khung soạn thảo trên Jenkins.
4.  Nhấn **Save** để lưu Job.
5.  Nhấn nút **Build Now** ở góc trái để bắt đầu chạy pipeline!
6.  **Quan sát Console Output**:
    *   Jenkins Controller sẽ phân công Job xuống `jenkins-agent` thực thi.
    *   Agent sẽ tải mã nguồn về, gọi SonarScanner CLI quét và gửi báo cáo phân tích lên SonarQube Server.
    *   Giai đoạn Quality Gate sẽ tự động truy vấn trạng thái phân tích từ SonarQube Server và in ra kết quả.
7.  **Xem báo cáo bảo mật trực quan**: Truy cập giao diện SonarQube `http://localhost:9000` để xem phân tích chi tiết. Bạn sẽ thấy báo cáo hiển thị số lượng lỗi bảo mật (Bugs, Vulnerabilities, Security Hotspots) cực kỳ trực quan kèm giải thích cách sửa code.

---

## 🧹 Dọn dẹp môi trường (Cleanup)
Sau khi hoàn thành bài học, hãy tắt cụm dịch vụ an toàn để giải phóng RAM cho máy host:
```bash
docker-compose down -v
```
*Cờ `-v` sẽ dọn sạch toàn bộ ổ đĩa ảo named volumes tạm thời, giữ cho đĩa máy host luôn sạch sẽ.*
