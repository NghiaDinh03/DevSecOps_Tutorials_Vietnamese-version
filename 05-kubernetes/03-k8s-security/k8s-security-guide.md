# ☸️ Sub-module 03: Bảo mật Kubernetes Nâng cao (CKS Guide)

Sub-module này cung cấp kiến thức chuyên sâu về việc gia cố bảo mật (Hardening) và bảo vệ an toàn cho hệ sinh thái Kubernetes xuyên suốt vòng đời phát triển ứng dụng, bám sát khung chương trình chuẩn của chứng chỉ chuyên gia bảo mật quốc tế **CKS (Certified Kubernetes Security Specialist)**.

---

## 1. Cô lập mạng bằng Network Policies

Mặc định trong Kubernetes, mọi Pod trong cụm có thể tự do giao tiếp mạng với nhau mà không gặp bất kỳ rào cản nào (Flat Network). Đây là một rủi ro bảo mật cực kỳ lớn: nếu hacker kiểm soát được một Pod front-end đơn giản, họ có thể dễ dàng quét cổng và tấn công trực tiếp sang Pod Database chứa thông tin khách hàng nhạy cảm.

```
Mặc định (Không an toàn):
[ Pod Frontend ] <=======> [ Pod Database ] (Giao tiếp không giới hạn)

Thiết lập NetworkPolicy (An toàn):
[ Pod Frontend ] --(Allow Ingress)--> [ Pod Database ]
[ Pod Bất kỳ ]   --(Deny Ingress)--> [ Pod Database ] (Bị chặn hoàn toàn)
```

**NetworkPolicy** cho phép bạn định nghĩa các quy tắc lọc gói tin mạng ở Layer 3 và Layer 4 cho Pods bằng cách sử dụng các bộ chọn nhãn (`podSelector`, `namespaceSelector`):
*   **Ingress (Traffic đi vào)**: Quy định những Pod nào, Namespace nào hoặc dải IP (CIDR) nào được phép kết nối tới cổng dịch vụ của Pod hiện tại.
*   **Egress (Traffic đi ra)**: Giới hạn Pod hiện tại chỉ được phép gọi ra các máy chủ hoặc dịch vụ cụ thể. *Ví dụ: Pod ứng dụng chỉ được phép gọi ra DNS Server và Database Server nội bộ, cấm hoàn toàn gọi ra internet tự do để ngăn chặn rò rỉ dữ liệu (Data Exfiltration).*
*   **Default Deny**: Thực tiễn tốt nhất (Best practice) là thiết lập một chính sách cấm toàn bộ kết nối đi vào và đi ra mặc định trong namespace, sau đó chỉ mở (Allow whitelist) những kết nối thực sự cần thiết.

---

## 2. Phân quyền Tối thiểu với RBAC (Role-Based Access Control)

RBAC kiểm soát ai (chủ thể - Subjects) có quyền thực hiện hành động gì (Verbs) trên các tài nguyên nào (Resources) của Kubernetes.

```mermaid
graph TD
    subgraph Subject (Ai)
        User[User / Group]
        SA[ServiceAccount]
    end
    subgraph Role (Có quyền gì)
        R[Role / ClusterRole]
    end
    subgraph Binding (Liên kết)
        RB[RoleBinding / ClusterRoleBinding]
    end
    Subject --> RB
    R --> RB
```

### 2.1. Các thành phần chính của RBAC
1.  **Subjects (Chủ thể)**: 
    *   **Users & Groups**: Đại diện cho con người (quản trị viên, lập trình viên). K8s không trực tiếp quản lý tài khoản người dùng mà xác thực qua chứng chỉ X.509 hoặc các OpenID Connect bên ngoài.
    *   **ServiceAccounts**: Tài khoản dành cho các phần mềm/ứng dụng chạy bên trong Pods (ví dụ: Jenkins pod, Prometheus pod cần gọi API Server để thu thập dữ liệu).
2.  **Roles & ClusterRoles (Quyền hạn)**:
    *   **Role**: Tập hợp các quyền truy cập tài nguyên trong phạm vi một **Namespace** cụ thể.
    *   **ClusterRole**: Tập hợp các quyền truy cập tài nguyên trên phạm vi toàn bộ **Cluster** (không giới hạn namespace, ví dụ: quyền liệt kê tất cả các Node, quản lý PersistentVolumes).
3.  **RoleBindings & ClusterRoleBindings (Liên kết)**:
    *   **RoleBinding**: Liên kết một Role với một Subject để cấp quyền hạn đó trong một namespace cụ thể.
    *   **ClusterRoleBinding**: Liên kết một ClusterRole với một Subject để cấp quyền trên toàn cụm.

*Nguyên tắc bảo mật vàng*: Luôn áp dụng **Nguyên tắc Đặc quyền Tối thiểu (Principle of Least Privilege)**. Không bao giờ gán quyền quản trị `cluster-admin` cho các ứng dụng thông thường, luôn tạo ServiceAccount riêng biệt và chỉ cấp đúng quyền hạn tối thiểu ứng dụng cần để hoạt động.

---

## 3. Bảo mật Pod Runtime (Pod Security Standards & Security Context)

Hacker có thể khai thác các lỗi bảo mật của ứng dụng để chiếm quyền điều khiển container, từ đó cố gắng phá vỡ ranh giới container (container breakout) để giành quyền kiểm soát node vật lý máy chủ. Để ngăn chặn điều này, chúng ta cần cấu hình **Security Context** chặt chẽ cho Pod và Container:

```yaml
# Ví dụ cấu hình Pod Security Context an toàn
spec:
  securityContext:
    runAsNonRoot: true         # 1. Cấm tuyệt đối chạy container bằng quyền root
    runAsUser: 10001           # Chỉ định ID người dùng không đặc quyền
    fsGroup: 10001
  containers:
  - name: secure-app
    image: my-app:v1.0.0
    securityContext:
      allowPrivilegeEscalation: false  # 2. Cấm tiến trình con leo thang đặc quyền
      readOnlyRootFilesystem: true    # 3. Khóa cứng ổ đĩa container ở chế độ chỉ đọc
      capabilities:
        drop:
        - ALL                  # 4. Hủy bỏ toàn bộ quyền hạn Linux kernel không cần thiết
```

*   **runAsNonRoot**: Bắt buộc container phải chạy dưới tài khoản thường. Nếu docker image cấu hình USER là root (uid 0), Kubernetes sẽ từ chối khởi chạy container này.
*   **allowPrivilegeEscalation**: Ngăn chặn các tiến trình con bên trong container giành được nhiều quyền hạn hơn tiến trình cha của chúng (chống tấn công leo thang đặc quyền).
*   **readOnlyRootFilesystem**: Chuyển toàn bộ phân vùng ổ đĩa hệ thống của container sang chế độ Read-Only. Hacker sẽ không thể tải xuống mã độc, cài đặt backdoor hay sửa đổi các file nhị phân của hệ thống.
*   **Capabilities Drop**: Loại bỏ toàn bộ các quyền hệ thống Linux Kernel mặc định (như quyền can thiệp cấu hình mạng, can thiệp cấu hình thời gian hệ thống) mà ứng dụng web thông thường không bao giờ dùng tới.

---

## 4. Quản lý Bí mật Nâng cao (Secret Management)

Như đã đề cập ở Sub-module 01, mặc định K8s Secrets chỉ được mã hóa Base64 và lưu trữ dạng plain-text trong database etcd. Để đảm bảo an toàn cấp độ doanh nghiệp:

1.  **Encryption at Rest**: Cấu hình Kubernetes API Server tự động mã hóa dữ liệu etcd khi ghi xuống đĩa cứng bằng các thuật toán mạnh như AES-GCM hoặc qua nhà cung cấp KMS (Key Management Service) của AWS/GCP.
2.  **Cấm tiêm Secrets dạng Biến môi trường**: Khi tiêm secret vào container dưới dạng biến môi trường (`env`), các tiến trình chạy trong container hoặc các dashboard giám sát hệ thống có thể dễ dàng đọc được mã nguồn trần. Thay vào đó, **hãy mount Secret dưới dạng File Volume**. K8s sẽ mount chúng vào vùng nhớ ảo tạm thời (tmpfs) cực kỳ an toàn, chỉ tiến trình được chỉ định mới đọc được và file sẽ biến mất ngay khi container dừng hoạt động.

---

## 5. Giám sát An toàn Runtime với Falco

Cho dù bạn đã cấu hình tĩnh rất tốt, các cuộc tấn công thời gian thực vẫn có thể xảy ra. **Falco** là công cụ giám sát an ninh runtime tiêu chuẩn dành cho Kubernetes (do tổ chức CNCF bảo trợ):

*   Falco hoạt động bằng cách can thiệp sâu xuống kernel thông qua công nghệ **eBPF** (hoặc kernel module) để giám sát toàn bộ các lời gọi hệ thống (System Calls) thời gian thực của toàn bộ cụm.
*   Falco đối chiếu các cuộc gọi hệ thống với các bộ luật (Rules) bảo mật định nghĩa trước để phát hiện các hành vi đáng nghi ngay lập tức:
    *   *Phát hiện container khởi chạy tiến trình lạ (ví dụ: tự nhiên chạy `sh` hoặc `bash` bên trong Pod PostgreSQL production).*
    *   *Phát hiện nỗ lực sửa đổi các file hệ thống nhạy cảm như `/etc/shadow` hay `/etc/passwd`.*
    *   *Phát hiện nỗ lực ghi đè file nhị phân trong các thư mục `/bin` hoặc `/sbin`.*
*   Falco lập tức phát đi cảnh báo (Alert) đến các hệ thống quản lý tập trung (Slack, Telegram, Elasticsearch, TheHive) để team SecOps ứng phó sự cố kịp thời.

---

## 📚 Tài nguyên Đọc thêm Chất lượng cao (Recommended Blog Readings)

### 🇬🇧 [A Complete Guide to Kubernetes Security Context (Hướng Dẫn Toàn Diện Về Kubernetes Security Context)](./blog/k8s-security-context-datadog.md)
*   **Chi tiết**: Bản dịch thuật & tóm tắt chuyên sâu 100% tiếng Việt của bài blog vô cùng nổi tiếng từ đội ngũ kỹ sư Datadog được lưu trữ cục bộ.
*   **Giá trị thực tiễn**: Đi sâu mổ xẻ từng trường cấu hình trong `securityContext` ở cả cấp độ Pod và Container như `runAsNonRoot`, `allowPrivilegeEscalation`, `readOnlyRootFilesystem` và `capabilities` để gia cố an toàn tối đa cho container.
*   **Liên kết nguồn gốc**: [Datadog Blog - A Complete Guide to Kubernetes Security Context](https://www.datadog.com/blog/kubernetes-security-context/)

---

## 🚀 Bước tiếp theo của bạn
Hãy tiến hành bài thực hành Lab 03: **Triển khai ứng dụng AI Chatbot Gemma và thực hiện gia cố bảo mật 4 lớp** (RBAC, Network Policy, Pod Security Context, Secrets) để trải nghiệm thực tế công việc của một chuyên gia DevSecOps CKS.

👉 **[Bắt đầu bài thực hành Lab 03: Hardening AI Microservice](./labs/lab-hardening-ai-microservice/lab-instructions.md)**
