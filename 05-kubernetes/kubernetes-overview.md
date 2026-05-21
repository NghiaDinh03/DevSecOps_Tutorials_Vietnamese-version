# ☸️ MODULE 5 — HỆ SINH THÁI KUBERNETES & BẢO MẬT (K8S ECOSYSTEM)

Chào mừng bạn đến với Module chuyên sâu về Kubernetes. Module này được thiết kế theo lộ trình chuẩn quốc tế, giúp bạn đi từ một nhà phát triển ứng dụng trên Kubernetes, tiến lên nhà quản trị hệ thống, và cuối cùng trở thành chuyên gia gia cố bảo mật chuyên sâu.

---

## 🔍 Phân tích Lộ trình: Sự khác biệt & Liên kết giữa các Chứng chỉ

Để tránh nhầm lẫn trong quá trình học và làm việc thực tế, chúng ta cần làm rõ bản chất của từng cấp độ và cách chúng bổ sung cho nhau:

```mermaid
graph TD
    A["CKAD (Application Developer)<br>Viết code & Đóng gói App"] -->|Deploy lên Cluster| B["CKA (Administrator)<br>Quản trị & Vận hành Cluster"]
    B -->|Bảo mật toàn diện| C["CKS (Security Specialist)<br>Hardening & Runtime Security"]
    style A fill:#4CAF50,stroke:#388E3C,color:#fff
    style B fill:#2196F3,stroke:#1976D2,color:#fff
    style C fill:#F44336,stroke:#D32F2F,color:#fff
```

### 1. CKAD (Certified Kubernetes Application Developer) — Vận hành Cơ bản
*   **Trọng tâm**: Tập trung vào việc **Phát triển và Triển khai** ứng dụng.
*   **Công việc thực tế**: Tạo các tài nguyên cơ bản như Pods, Deployments, Services, ConfigMaps, Secrets, Liveness/Readiness Probes, và đóng gói ứng dụng bằng Helm Charts.
*   **Câu hỏi thường gặp**: *"Làm sao để ứng dụng của tôi chạy ổn định, tự động phục hồi và có thể giao tiếp với database?"*

### 2. CKA (Certified Kubernetes Administrator) — Quản trị Trung cấp
*   **Trọng tâm**: Tập trung vào việc **Quản lý hạ tầng và Vận hành** cụm (Cluster).
*   **Công việc thực tế**: Khởi tạo cluster từ đầu (kubeadm), quản lý lưu trữ persistent (PV/PVC), cấu hình mạng cluster (CNI), backup/restore database ETCD, nâng cấp phiên bản Kubernetes, troubleshoot lỗi node.
*   **Câu hỏi thường gặp**: *"Làm sao để đảm bảo hạ tầng cluster luôn mở rộng tốt, không bị gián đoạn khi nâng cấp, và cấp phát đủ tài nguyên lưu trữ?"*

### 3. CKS (Certified Kubernetes Security Specialist) — Bảo mật Nâng cao
*   **Trọng tâm**: Tập trung vào việc **Gia cố an toàn thông tin (Hardening)** xuyên suốt vòng đời Build, Ship, Run.
*   **Công việc thực tế**: Thiết lập Network Policies (cô lập network), phân quyền tối thiểu với RBAC, cấu hình Pod Security Standards (PSS), tích hợp công cụ quét image vào pipeline, giám sát và cảnh báo runtime security (Falco, Sysdig).
*   **Câu hỏi thường gặp**: *"Nếu hacker kiểm soát được 1 Pod của tôi, làm sao để ngăn chặn họ tấn công lan sang các Pod khác hoặc chiếm quyền điều khiển toàn bộ cluster?"*

---

## 📁 Cấu trúc Module 5

Module này được phân chia thành 3 sub-module tương ứng với 3 cấp độ trên:

```
05-kubernetes/
├── kubernetes-overview.md              # File này (Giới thiệu tổng quan)
│
├── 01-k8s-basics/                      # Sub-module 01: CKAD (Developer)
│   ├── k8s-basics-guide.md             # Hướng dẫn chi tiết CKAD
│   └── labs/                           # Thư mục thực hành (lab-helm-deploy-webapp)
│
├── 02-k8s-administration/               # Sub-module 02: CKA (Administrator)
│   └── k8s-administration-guide.md     # Hướng dẫn chi tiết CKA
│
└── 03-k8s-security/                    # Sub-module 03: CKS (Security Specialist)
    ├── k8s-security-guide.md           # Hướng dẫn chi tiết CKS
    └── labs/
        └── lab-hardening-ai-microservice/ # Lab thực chiến gia cố bảo mật cho App AI (lab-instructions.md)
```

---

## 💡 Thiết kế Lab Thực Chiến Nâng cao: Hardening AI Microservice

Để áp dụng các kiến thức bảo mật Kubernetes cao cấp nhất (CKS), chúng ta sẽ thực hành trực tiếp trên ứng dụng đích là **App AI Chat Gemma** sẵn có trong thư mục `/VSC/gemma-chat`.

> [!IMPORTANT]
> **Cam kết an toàn**: Chúng ta KHÔNG tạo bất kỳ file nào hay thay đổi mã nguồn của `/VSC/gemma-chat`. Toàn bộ tài liệu lab và manifests cấu hình sẽ được lưu trữ cục bộ trong thư mục:
> `05-kubernetes/03-k8s-security/labs/lab-hardening-ai-microservice/`

### Kịch bản Lab thực tế:
Bạn đóng vai trò là một DevSecOps Engineer được giao nhiệm vụ triển khai và gia cố an toàn cho Microservice AI Chatbot. Ứng dụng này giao tiếp trực tiếp với mô hình ngôn ngữ lớn (LLM) và chứa các thông tin API keys nhạy cảm. Bạn cần thiết lập bảo mật 4 lớp:

1.  **Lớp 1: Network Hardening (Network Policies)**
    *   Mặc định Kubernetes cho phép tất cả các Pod giao tiếp tự do. Bạn sẽ viết NetworkPolicy thiết lập chính sách **Default Deny** (cấm toàn bộ kết nối).
    *   Chỉ mở cổng (Allow Ingress) từ duy nhất Ingress Controller/API Gateway đi vào Pod `gemma-chat`.
    *   Giới hạn cổng (Allow Egress) từ Pod `gemma-chat` chỉ được phép kết nối ra DNS Server (`kube-dns`) và API Server của Ollama/Gemma, cấm hoàn toàn kết nối internet tự do để ngăn chặn rò rỉ dữ liệu (Data Exfiltration).

2.  **Lớp 2: Phân quyền Tối thiểu (RBAC)**
    *   Tạo một `ServiceAccount` riêng cho ứng dụng `gemma-chat` thay vì dùng account `default` của namespace.
    *   Thiết lập `Role` và `RoleBinding` để giới hạn tài khoản này không được phép truy cập hay đọc thông tin các tài nguyên khác của cluster.

3.  **Lớp 3: Bảo mật Pod Runtime (Pod Security Standards)**
    *   Cấu hình Security Context cho Pod để bắt buộc:
        *   `runAsNonRoot: true` — Ứng dụng tuyệt đối không được chạy dưới quyền root inside container.
        *   `allowPrivilegeEscalation: false` — Ngăn chặn container leo thang đặc quyền để kiểm soát node vật lý.
        *   `readOnlyRootFilesystem: true` — Khóa toàn bộ filesystem của container ở chế độ Read-Only để hacker không thể cài đặt mã độc hay backdoor.

4.  **Lớp 4: Quản lý Bí mật (Secret Hardening)**
    *   Sử dụng Kubernetes `Secret` được mã hóa để truyền API token an toàn thay vì lưu trực tiếp trong biến môi trường (Environment Variable) dạng plain-text.

---

## 🚀 Điểm xuất phát của bạn là gì?

*   **Nếu bạn chưa bao giờ dùng Kubernetes**: Hãy bắt đầu từ [01-k8s-basics](./01-k8s-basics/k8s-basics-guide.md) để học cách viết các file YAML deploy ứng dụng đơn giản trước.
*   **Nếu bạn đã biết deploy app nhưng chưa biết setup hệ thống**: Hãy bắt đầu từ [02-k8s-administration](./02-k8s-administration/k8s-administration-guide.md) để hiểu sâu về cách vận hành một cụm cluster thực tế.
*   **Nếu bạn đã thành thạo vận hành và muốn gia cố an toàn theo chuẩn bảo mật**: Hãy tiến thẳng tới [03-k8s-security](./03-k8s-security/k8s-security-guide.md) để làm quen với các công nghệ an ninh phòng thủ cao cấp nhất.
