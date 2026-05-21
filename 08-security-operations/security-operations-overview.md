# 🛡️ MODULE 8 — VẬN HÀNH AN NINH & PHÒNG THỦ (SECURITY OPERATIONS - SecOps)

Chào mừng bạn đến với Module nâng cao cuối cùng của lộ trình DevSecOps: **Vận hành An ninh & Phòng thủ (Security Operations - SecOps)**. Ở các module trước, bạn đã học cách quét bảo mật trong pipeline (tĩnh). Tuy nhiên, trong thực tế, các cuộc tấn công tinh vi luôn diễn ra ở môi trường **Runtime (khi ứng dụng đang chạy)**. SecOps giúp bạn giám sát liên tục hệ thống, phát hiện các hành vi bất thường của hacker và xây dựng mạng lưới Zero-trust bảo vệ dữ liệu tuyệt đối.

---

## 🔍 Kiến trúc Vận hành An ninh Phòng thủ Chủ động (SecOps Architecture)

Trong Module này, bạn sẽ học cách thiết kế và vận hành hệ thống giám sát và phòng thủ runtime:

```mermaid
graph TD
    Hacker([Hacker tấn công]) -->|Xâm nhập container| App[Ứng dụng Runtime]
    App -->|1. Hành vi Kernel bất thường| Falco[Falco Monitoring - eBPF]
    Falco -->|2. Kích hoạt Cảnh báo| IR[Incident Response / TheHive]
    Intel[Threat Intelligence - MISP] -->|3. Cung cấp chỉ số IOCs độc hại| IR
    Mesh[Istio Service Mesh] -->|4. Mã hóa mTLS & Chặn mạng| App
    style App fill:#ffe082,stroke:#ffb300,color:#000
    style Falco fill:#e8f5e9,stroke:#388e3c,color:#000
    style IR fill:#ffcc80,stroke:#f57c00,color:#000
    style Intel fill:#e1bee7,stroke:#8e24aa,color:#fff
    style Mesh fill:#bbdefb,stroke:#1e88e5,color:#000
```

### 1. Runtime Security & Incident Response — Giám sát Hành vi Kernel
*   **Mục tiêu**: Giám sát sâu các tiến trình chạy inside container thông qua lớp nhân Linux Kernel bằng công nghệ **eBPF**. Phát hiện tức thời các hành vi bất thường (v.d: container tự ý chạy bash shell, ghi đè file cấu hình hệ thống `/etc/shadow`).
*   **Công cụ**: Falco, TheHive.

### 2. Threat Intelligence — Thu thập Mối đe dọa toàn cầu
*   **Mục tiêu**: Thu thập, phân loại và chia sẻ các Chỉ số Lây nhiễm (Indicators of Compromise - IOCs) như danh sách IP của botnet, mã hash của mã độc để chủ động chặn đứng tấn công.
*   **Công cụ**: MISP (Malware Information Sharing Platform).

### 3. Service Mesh & Zero Trust — Không bao giờ tin tưởng, Luôn xác minh
*   **Mục tiêu**: Thiết lập cơ chế **Zero Trust Network**. Mã hóa toàn bộ giao tiếp nội bộ giữa các microservices bằng **mTLS (Mutual TLS)** và cấu hình Authorization Policies chặn đứng các kết nối không hợp lệ.
*   **Công cụ**: Istio Service Mesh.

---

## 📁 Cấu trúc Module 8

Module này được phân chia thành 3 sub-module chuyên sâu:

```
08-security-operations/
├── security-operations-overview.md      # File này (Giới thiệu tổng quan)
│
├── incident-response/                   # Sub-module 01: Giám sát Runtime
│   ├── incident-response-guide.md       # Lý thuyết Falco, eBPF và ứng phó sự cố
│   └── labs/
│       └── lab-incident-response/       # Lab: Giám sát runtime container với Falco
│
├── threat-intelligence/                 # Sub-module 02: Threat Intelligence
│   ├── threat-intelligence-guide.md     # Lý thuyết về IOCs, kiến trúc MISP
│   └── labs/
│       └── lab-misp-intel/              # Lab: Cấu hình và quản trị nguy cơ trên MISP
│
└── service-mesh-zero-trust/             # Sub-module 03: Zero Trust Service Mesh
    ├── service-mesh-zero-trust-guide.md # Lý thuyết Service Mesh, mTLS, Envoy Proxy
    └── labs/
        └── lab-istio-mtls/              # Lab: Mô phỏng mã hóa mTLS và viết AuthorizationPolicy
```

---

## 🚀 Lộ trình Học tập

*   👉 **[Bước 1: Giám sát Runtime với Falco](./incident-response/incident-response-guide.md)**.
*   👉 **[Bước 2: Tìm hiểu Threat Intelligence với MISP](./threat-intelligence/threat-intelligence-guide.md)**.
*   👉 **[Bước 3: Xây dựng mạng Zero Trust với Istio mTLS](./service-mesh-zero-trust/service-mesh-zero-trust-guide.md)**.

---

## 📚 Tài nguyên Đọc thêm Chất lượng cao (Recommended Blog Readings)

Khám phá các bài viết thực tế sâu sắc để nâng tầm tư duy an ninh phòng thủ và vận hành an toàn hệ thống (SecOps):

### 1. 🇻🇳 [Bảo mật Zero-Trust trong Microservices với Service Mesh Istio](https://viblo.asia/p/bao-mat-zero-trust-trong-microservices-voi-service-mesh-istio-RnB5p7vOlPG)
*   **Nguồn**: Cộng đồng Viblo.asia (Đạt 11k+ views, 160+ upvotes).
*   **Giá trị thực tiễn**: Tác giả giải thích cặn kẽ triết lý an ninh tối tân **Zero-Trust**: *"Không bao giờ tin tưởng, luôn luôn xác minh"* (*Never Trust, Always Verify*). Bài viết chỉ rõ các điểm yếu chết người của mô hình bảo mật vành đai truyền thống (chỉ bảo vệ rìa hệ thống bằng Firewall) và cách Istio giải quyết triệt để thông qua cơ chế chèn Sidecar Envoy Proxy:
    *   Tự động mã hóa song phương đầu cuối (*mTLS STRICT*) toàn bộ traffic giao tiếp chéo giữa các Pod để chống nghe trộm dữ liệu.
    *   Thực thi chính sách xác thực thực thể (*PeerAuthentication*) nghiêm ngặt.
    *   Quản lý phân quyền truy cập chi tiết đến từng API Endpoint và Method nhờ chính sách ủy quyền (*AuthorizationPolicy*).
*   **Lý do cần đọc**: Cung cấp kiến thức nền tảng thực tế để thiết kế kiến trúc mạng an toàn tuyệt đối cho các hệ thống microservices phức tạp chạy trên cloud.

### 2. 🇬🇧 [Kubernetes Runtime Security with Falco (Giám Sát An Ninh Runtime Trong Kubernetes Bằng Falco)](https://sysdig.com/blog/kubernetes-runtime-security-falco/)
*   **Nguồn**: Sysdig Engineering Blog / CNCF Blog (Bài viết kinh điển khai mở kỷ nguyên eBPF Runtime Security).
*   **Bản dịch & Tóm tắt cốt lõi**: Khi các biện pháp bảo mật tĩnh (SAST, SCA, Image Scanning) đã hoàn thành lúc build/ship, Falco chính là lớp lá chắn phòng thủ cuối cùng lúc ứng dụng đang chạy (*Runtime*). Bài viết giải mã cơ chế vận hành cấp thấp của Falco:
    1.  **Lắng nghe System Calls**: Falco sử dụng driver kernel hoặc công nghệ **eBPF** siêu nhẹ để bắt và giám sát toàn bộ các lời gọi hệ thống (*system calls*) từ container gửi lên nhân CPU của host.
    2.  **Bộ quy tắc mạnh mẽ (Rules Engine)**: So khớp thời gian thực các system calls đó với bộ quy tắc bảo mật được định nghĩa sẵn.
    3.  **Phát hiện và Cảnh báo tức thì**: Hướng dẫn viết các rule tùy chỉnh để phát hiện các hành vi xâm nhập nguy hại như: Chạy một shell tương tác (*interactive shell*) bên trong container đang chạy production, sửa đổi file cấu hình trong thư mục hệ thống nhạy cảm (`/bin`, `/etc/shadow`), hoặc container thực hiện các kết nối mạng outbound bất thường ra ngoài internet.

