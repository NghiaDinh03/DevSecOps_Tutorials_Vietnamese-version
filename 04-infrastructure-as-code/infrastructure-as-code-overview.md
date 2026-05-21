# 🛠️ MODULE 4 — HẠ TẦNG DẠNG CODE (INFRASTRUCTURE AS CODE - IaC)

Chào mừng bạn đến với Module về **Hạ tầng dạng Code (Infrastructure as Code - IaC)**. Trong kỷ nguyên đám mây và DevSecOps, việc khởi tạo, cấu hình và quản trị tài nguyên phần cứng (Servers, Networks, Firewalls, Load Balancers) thủ công đã hoàn toàn được thay thế bằng mã nguồn. IaC giúp tự động hóa 100%, đảm bảo tính nhất quán (Consistency) và loại bỏ hoàn toàn các lỗi do con người.

---

## 🔍 Phân loại IaC: Provisioning vs Configuration Management

Trong thực tế, hệ sinh thái IaC được phân tách thành hai nhóm công cụ chính có chức năng bổ trợ cho nhau:

```mermaid
graph TD
    A["Terraform<br>Provisioning (Khởi tạo)"] -->|Tạo máy chủ ảo, mạng, firewall| B["Ansible<br>Configuration Management (Cấu hình)"]
    B -->|Cài đặt Node.js, Docker, gia cố bảo mật| C["Ứng dụng Sẵn sàng Vận hành"]
    style A fill:#7B1FA2,stroke:#4A148C,color:#fff
    style B fill:#E65100,stroke:#BF360C,color:#fff
    style C fill:#2E7D32,stroke:#1B5E20,color:#fff
```

### 1. Provisioning (Khởi tạo tài nguyên) — Đại diện: Terraform
*   **Trọng tâm**: Khởi tạo hạ tầng thô (Infrastructure Provisioning).
*   **Cách thức**: Sử dụng mô hình **Khai báo (Declarative)** để định nghĩa cấu trúc tài nguyên mong muốn (như VPC, Subnets, EC2 instances, Security Groups, IAM Policies).
*   **Mục tiêu**: Thiết lập bộ khung phần cứng ảo hóa trên AWS, GCP, Azure, VMware hoặc Localstack.

### 2. Configuration Management (Quản lý cấu hình) — Đại diện: Ansible
*   **Trọng tâm**: Cài đặt phần mềm, cấu hình hệ điều hành và gia cố bảo mật (Hardening) trên hạ tầng đã có sẵn.
*   **Cách thức**: Sử dụng mô hình **Đẩy (Push-based)** và kiến trúc không cài agent (**Agentless**), giao tiếp qua SSH/WinRM để quản trị hệ thống.
*   **Mục tiêu**: Biến một server Linux trắng thành một Web Server bảo mật chạy Docker, cài đặt Node.js, cập nhật bản vá bảo mật và tắt các cổng kết nối nguy hiểm.

---

## 📁 Cấu trúc Module 4

Module này được phân chia thành hai Sub-module lớn thực hành trực tiếp:

```
04-infrastructure-as-code/
├── infrastructure-as-code-overview.md   # File này (Giới thiệu tổng quan)
│
├── terraform/                           # Sub-module 01: Terraform
│   ├── terraform-guide.md               # Hướng dẫn chi tiết Terraform lý thuyết
│   └── labs/
│       └── lab-terraform-local/         # Lab thực hành khởi tạo hạ tầng cục bộ
│
└── ansible/                             # Sub-module 02: Ansible
    ├── ansible-guide.md                 # Hướng dẫn chi tiết Ansible lý thuyết
    └── labs/
        └── lab-ansible-hardening/       # Lab thực hành gia cố bảo mật máy chủ từ xa
```

---

## 🔒 Triết lý Bảo mật trong IaC (Security-as-Code)

Tích hợp an toàn thông tin vào IaC giúp ngăn chặn các lỗi cấu hình nghiêm trọng trước khi hạ tầng được khởi dựng:

1.  **Quản lý Bí mật (Secret Management)**: Tuyệt đối không hardcode API keys, mật khẩu hay SSH keys trong mã nguồn tf/yml. Sử dụng biến môi trường hoặc tích hợp Vault/Ansible Vault.
2.  **Quét lỗi cấu hình tĩnh (Static Analysis)**: Sử dụng các công cụ như `tfsec`, `kics`, `ansible-lint` để tự động phát hiện các lỗ hổng như cổng SSH 22 mở public, thiếu mã hóa ổ đĩa, chạy container dưới quyền root.
3.  **Bảo vệ State File**: Terraform State chứa toàn bộ thông tin hạ tầng bao gồm cả secret dạng plain-text. Bắt buộc phải lưu trữ file này ở backend an toàn (S3, GCS) có mã hóa và bật tính năng State Locking (DynamoDB) để ngăn trùng lặp ghi đè.

---

## 🚀 Lộ trình Học tập

*   👉 **[Bước 1: Bắt đầu tìm hiểu về Terraform](./terraform/terraform-guide.md)** để nắm vững cách khai báo hạ tầng.
*   👉 **[Bước 2: Học về Ansible](./ansible/ansible-guide.md)** để nắm vững cách quản lý cấu hình và gia cố bảo mật máy chủ tự động.
