# 🛡️ Bảo Mật Jenkins Master/Agent và Gia Cố GitLab Runner: Chống Rò Rỉ Tokens

*   **Tác giả gốc:** OWASP CI/CD Security Project & GitLab Security Team
*   **Dịch thuật & Biên soạn:** Đội ngũ DevSecOps Tutorials (Vietnamese version)
*   **Liên kết bài viết gốc:** [OWASP Top 10 CI/CD Security Risks](https://owasp.org/www-project-top-10-cicd-security-risks/)

---

## 📌 Giới thiệu

Hệ thống CI/CD (Continuous Integration/Continuous Deployment) như **Jenkins** và **GitLab CI** là trái tim của mọi quy trình phát triển phần mềm hiện đại. Do nắm giữ toàn bộ mã nguồn ứng dụng và các thông tin nhạy cảm (secrets, API keys, credentials) để deploy lên production, chúng trở thành miếng mồi ngon nhất của tin tặc.

⚠️ **Kịch bản rủi ro:**
*   Một plugin Jenkins dính lỗ hổng bảo mật chưa được cập nhật, hacker khai thác lấy được token quản trị.
*   Một GitLab Runner được cấu hình chạy ở chế độ đặc quyền (`privileged = true`), hacker thực hiện tấn công thoát khỏi container (container breakout) để chiếm đoạt toàn bộ máy host của runner.

Bài viết này chia sẻ các thực tiễn thực chiến để **Gia cố bảo mật Jenkins (Jenkins Hardening)** và **Bảo vệ GitLab Runner an toàn**, giúp triệt tiêu nguy cơ rò rỉ thông tin nhạy cảm.

---

## ⚙️ 5 Chiến Lược Gia Cố Bảo Mật Jenkins Server

```
                  +--------------------------------+
                  |  Hệ thống Jenkins Controller   |
                  |  (Cấm chạy Job trên Controller)|
                  +--------------------------------+
                                  |
               (Kênh giao tiếp mã hóa TLS qua Port 50000)
                                  |
                                  v
                  +--------------------------------+
                  |    Ephemeral Docker Agents     |
                  |   (Tự hủy sau khi chạy xong)   |
                  +--------------------------------+
```

### 1. Áp dụng kiến trúc Controller-Agent (Tuyệt đối cấm chạy Job trên Controller)
Jenkins Controller (Master) là nơi quản lý cấu hình, lưu trữ keys và điều phối. Nếu bạn chạy các job build trực tiếp trên Controller, mã độc từ job có thể dễ dàng đọc trích xuất toàn bộ file cấu hình và keys trong thư mục `$JENKINS_HOME`.

✅ **Giải pháp tối ưu:** Thiết lập cấu hình số lượng Executor trên Controller bằng `0` và chuyển toàn bộ công việc build sang các máy **Agent** riêng biệt (khuyên dùng các Ephemeral Docker Agent tự hủy sau khi hoàn thành task):
*   Cấu hình Jenkins Controller: `Manage Jenkins` -> `Configure System` -> `Number of executors = 0`.

---

### 2. Sử dụng phân quyền nghiêm ngặt với Matrix Authorization Strategy
Mặc định, Jenkins cung cấp chế độ phân quyền khá thô sơ. Kỹ sư phát triển thường được cấp quyền quá rộng so với nhu cầu thực tế.

✅ **Giải pháp tối ưu:** Cài đặt plugin **Matrix Authorization Strategy** để cấu hình phân quyền chi tiết cho từng người dùng/nhóm trên từng Folder dự án:
```groovy
// Ví dụ cấu hình phân quyền Matrix an toàn bằng code (Jenkinsfile/Groovy)
import jenkins.model.*
import hudson.security.*

def jenkins = Jenkins.getInstance()
def strategy = new ProjectMatrixAuthorizationStrategy()

// Cấp quyền đọc cơ bản cho toàn bộ hệ thống
strategy.add(Jenkins.READ, "authenticated")

// Chỉ cấp quyền ghi/chạy Job cho DevOps engineer cụ thể
strategy.add(hudson.model.Item.BUILD, "devops-admin")
strategy.add(hudson.model.Item.CONFIGURE, "devops-admin")

jenkins.setAuthorizationStrategy(strategy)
jenkins.save()
```

---

### 3. Vô hiệu hóa CLI và khóa cổng giao tiếp không sử dụng
Jenkins CLI (Command Line Interface) sử dụng giao thức SSH hoặc HTTP để tương tác cấu hình hệ thống từ xa. Đây là bề mặt tấn công rất lớn và đã từng dính nhiều lỗ hổng RCE nghiêm trọng.

✅ **Giải pháp tối ưu:** Vô hiệu hóa giao thức kết nối CLI không sử dụng và khóa chặt cổng JNLP Agent nếu không chạy Agent bên ngoài:
*   Truy cập `Manage Jenkins` -> `Configure Global Security`.
*   Thiết lập `Agents` -> `TCP port for inbound agents` thành `Disabled` (hoặc cấu hình cổng cố định v.d. `50000` và bảo vệ bằng firewall).

---

## 🚀 4 Phương Pháp Gia Cố GitLab Runner An Toàn

### 1. Tuyệt đối cấm sử dụng Privileged Mode bừa bãi
Để xây dựng Docker Image bên trong GitLab CI, nhiều người dùng thường chọn giải pháp nhanh nhất là cấu hình Docker-in-Docker (DinD) bằng cách bật cờ đặc quyền trong file `config.toml`:

⚠️ **Lỗi phổ biến cấu hình cực kỳ nguy hiểm:**
```toml
# config.toml
[[runners]]
  [runners.kubernetes]
    privileged = true  # Hacker có thể thoát container chiếm máy host dễ dàng!
```

✅ **Giải pháp tối ưu:** Sử dụng các bộ công cụ xây dựng Docker Image không đặc quyền (Rootless Container Builders) như **Kaniko** (của Google). Kaniko có khả năng build và push image trực tiếp lên Registry từ bên trong container mà không cần bất kỳ đặc quyền root nào của máy host:
```yaml
# Ví dụ cấu hình .gitlab-ci.yml an toàn sử dụng Kaniko
build-image:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - mkdir -p /kaniko/.docker
    - echo "{\"auths\":{\"${CI_REGISTRY}\":{\"auth\":\"$(printf "%s:%s" "${CI_REGISTRY_USER}" "${CI_REGISTRY_PASSWORD}" | base64 | tr -d '\n')\"}}}" > /kaniko/.docker/config.json
    - /kaniko/executor
      --context "${CI_PROJECT_DIR}"
      --dockerfile "${CI_PROJECT_DIR}/Dockerfile"
      --destination "${CI_REGISTRY_IMAGE}:${CI_COMMIT_TAG}"
```

---

### 2. Sử dụng Protected Variables cho các nhánh an toàn
Để tránh việc lập trình viên sửa đổi file `.gitlab-ci.yml` trên nhánh thử nghiệm (feature branch) nhằm in ra (echo) mã bảo mật nhạy cảm.

✅ **Giải pháp tối ưu:** Cấu hình các biến nhạy cảm (AWS Keys, Production API Keys) trong GitLab CI/CD dưới dạng **Protected** và **Masked**:
*   **Protected:** Chỉ nạp biến này vào pipeline chạy trên các nhánh được bảo vệ (v.d. `main`, `production`). Nhánh thường sẽ không đọc được.
*   **Masked:** Tự động lọc bỏ (ẩn bằng dấu `[MASKED]`) giá trị của biến nếu nó vô tình bị in ra trong màn hình Console Log của Job.

---

### 3. Cô lập mạng cho GitLab Runner (Network Isolation)
GitLab Runner khi chạy các Job của lập trình viên thực chất đang thực thi mã nguồn lạ. Do đó, cần áp dụng chính sách cô lập mạng nghiêm ngặt:
*   Chỉ cho phép Runner kết nối đi ra (Egress) tới GitLab Server, Internet để tải thư viện.
*   Chặn hoàn toàn kết nối từ Runner đi vào mạng nội bộ của doanh nghiệp (Internal IP ranges) để ngăn ngừa hacker sử dụng Runner làm bàn đạp tấn công leo thang mạng nội bộ (Lateral Movement).

---

## 📝 Bảng So Sánh Jenkins Hardening vs GitLab CI Hardening

| Tiêu chuẩn an toàn | Giải pháp trên Jenkins | Giải pháp trên GitLab CI |
|---|---|---|
| **Đóng gói Môi trường build** | Dùng Ephemeral agents trên Docker | Dùng Kubernetes/Docker Executor |
| **Bảo vệ Secrets** | Tích hợp Credential Helper / Vault | Masked & Protected Variables |
| **Phân quyền chạy** | Plugin Matrix Authorization | Quyền hạn theo User Role trên Repository |
| **Xây dựng Docker Image an toàn** | Dùng kaniko agent | Dùng Kaniko / Podman (Rootless) |

Việc gia cố hệ thống tự động hóa CI/CD là bức tường lửa bảo vệ toàn bộ thành quả công nghệ của doanh nghiệp. Áp dụng nghiêm ngặt các nguyên tắc phân quyền tối thiểu và loại bỏ đặc quyền rootless giúp bạn tự tin vận hành quy trình CI/CD an toàn, tin cậy nhất!
