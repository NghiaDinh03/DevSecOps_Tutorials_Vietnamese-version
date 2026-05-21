<p align="center">
  <img src="https://img.shields.io/badge/DevSecOps-Tutorials-blue?style=for-the-badge&logo=docker&logoColor=white" alt="DevSecOps Tutorials"/>
  <img src="https://img.shields.io/badge/Ngôn_ngữ-Tiếng_Việt-red?style=for-the-badge" alt="Tiếng Việt"/>
  <img src="https://img.shields.io/badge/Hạ_tầng-Cloud_Native-orange?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Cloud Native"/>
  <img src="https://img.shields.io/badge/Bảo_mật-Shift_Left-green?style=for-the-badge&logo=springsecurity&logoColor=white" alt="Shift Left Security"/>
</p>

# 🚀 DevSecOps Tutorials — Phiên bản Tiếng Việt

> Học DevSecOps bài bản từ con số 0 đến sẵn sàng cho môi trường Production thông qua các bài thực hành thực tế. Toàn bộ nội dung bằng tiếng Việt, thiết kế chuẩn hóa và xuyên suốt dành riêng cho cộng đồng kỹ sư hệ thống và bảo mật Việt Nam.

---

## 📋 Mục lục

*   [Giới thiệu](#-giới-thiệu)
*   [Lời nói đầu (Preface)](#-lời-nói-đầu-preface)
*   [Hướng dẫn Cài đặt Môi trường (Bắt buộc)](./docker-setup.md)
*   [Tại sao lại là DevSecOps?](#-tại-sao-lại-là-devsecops)
*   [Lộ trình học tập chi tiết (Roadmap)](#-lộ-trình-học-tập-chi-tiết-roadmap)
*   [Bản đồ Lab Thực Chiến Toàn Diện](#-bản-đồ-lab-thực-chiến-toàn-diện)
*   [Bộ công cụ công nghệ thống nhất (Technology Stack)](#-bộ-công-cụ-công-nghệ-thống-nhất-technology-stack)
*   [Cấu trúc thư mục dự án](#-cấu-trúc-thư-mục-dự-án)
*   [Nguồn tài liệu tham khảo chính thống](#-nguồn-tài-liệu-tham-khảo-chính-thống)
*   [Đóng góp phát triển cộng đồng](#-đóng-góp-phát-triển-cộng-đồng)
*   [Giấy phép (License)](#-giấy-phép-license)

---

## 🖥️ DevSecOps Interactive Lab Portal (Web UI All-in-One)

> [!TIP]
> **Trải nghiệm học tập thế hệ mới!** Dự án tích hợp sẵn một **Giao diện Web Tương tác All-in-One** cực kỳ cao cấp. Bạn có thể vừa đọc tài liệu hướng dẫn trực quan, vừa bật/tắt các container của bài lab (qua Docker Socket) và thực hành gõ lệnh bảo mật trực tiếp trên trình duyệt (qua Terminal Emulator kết nối trực tiếp vào Container Workspace).

Chỉ với đúng một câu lệnh duy nhất từ thư mục gốc của dự án:
```bash
docker compose up -d --build
```
Sau đó, mở trình duyệt truy cập: **`http://localhost:8000`** để bắt đầu hành trình chinh phục DevSecOps!

---

## 🎯 Giới thiệu

**DevSecOps Tutorials (Vietnamese version)** là dự án mã nguồn mở được xây dựng nhằm cung cấp một hệ thống tài liệu và phòng thí nghiệm (Labs) thực hành DevSecOps hoàn chỉnh, trực quan và dễ tiếp cận nhất cho kỹ sư Việt Nam.

### Điểm nổi bật của dự án:
*   🇻🇳 **100% Tiếng Việt** — Biên soạn và dịch thuật chuyên ngành tự nhiên, dễ hiểu.
*   🐳 **Docker-First Architecture** — Mọi bài lab, hệ thống kiểm thử đều khởi chạy gọn gàng bằng một câu lệnh Docker Compose duy nhất ([Xem Hướng dẫn cài đặt nhanh](./docker-setup.md)).
*   🛡️ **Security-First Mindset** — Bảo mật không phải là phần bổ sung sau cùng (afterthought), mà là xương sống được tích hợp xuyên suốt từng bài học.
*   📈 **Lộ trình thực tế** — Giáo trình được thiết kế đi từ nền tảng cơ bản lên các kỹ thuật phòng thủ nâng cao trong hạ tầng doanh nghiệp Cloud Native.

---

## ✍️ Lời nói đầu (Preface)

Giáo trình **DevSecOps Tutorials** được thiết kế nhằm thu hẹp khoảng cách giữa lý thuyết an toàn thông tin khô khan và thực tế vận hành phức tạp tại doanh nghiệp. Chúng tôi hiểu rằng làm DevSecOps không chỉ đơn thuần là cài đặt các công cụ quét mã, mà là xây dựng một văn hóa cộng tác tự động hóa và an toàn.

Để mang lại hiệu quả học tập cao nhất, dự án áp dụng **Bộ công cụ công nghệ thống nhất (Unified Technology Stack)** xuyên suốt tất cả các Module:
1.  **Hạt nhân Đóng gói (Docker & Docker Compose)**: Mọi môi trường lab từ cơ bản (Linux, Git) đến nâng cao (Jenkins, ELK Stack, Vault, MISP) đều được đóng gói **Docker-first**. Học viên chỉ mất vài giây để kích hoạt (`docker compose up -d`) trên máy cá nhân mà không sợ gây xung đột hệ điều hành.
2.  **Quản trị Cloud Native (Kubernetes, Helm, Terraform, Ansible)**: Học viên sẽ tiếp cận cách định nghĩa hạ tầng dưới dạng mã (IaC) và vận hành các cụm container phân tán theo chuẩn an toàn quốc tế.
3.  **Tích hợp Shift-Left Security**: Trực tiếp nhúng các công cụ quét bảo mật tự động hàng đầu như **Trivy** (quét lỗ hổng image), **SonarQube** (phân tích mã nguồn tĩnh - SAST), **Gitleaks** (chặn rò rỉ secrets) và **Open Policy Agent / Conftest** (cưỡng chế chính sách hạ tầng) vào luồng CI/CD.
4.  **Giám sát & Vận hành Runtime**: Triển khai giám sát tập trung bằng **Prometheus/Grafana/Loki**, phát hiện xâm nhập hệ thống thời gian thực với **Falco** và thiết lập mạng bảo mật Zero-Trust with **Istio Service Mesh**.

---

## 🔐 Tại sao lại là DevSecOps?

```
DevOps    = Development + Operations (Tập trung Tốc độ & Tính sẵn sàng)
DevSecOps = Development + Security + Operations (Tốc độ và An toàn tuyệt đối)
```

| Khía cạnh | DevOps truyền thống | DevSecOps (Shift-Left) |
| :--- | :--- | :--- |
| **Kiểm tra bảo mật** | Thực hiện thủ công ở giai đoạn cuối trước khi Release | Tự động hóa tích hợp trong mọi giai đoạn của Pipeline |
| **Phát hiện lỗ hổng** | Sau khi deploy lên môi trường Staging/Production | Ngay khi lập trình viên thực hiện commit code lên Git |
| **Chi phí sửa lỗi** | **Rất cao** (Phát hiện muộn khi đã vận hành) | **Thực sự thấp** (Khắc phục ngay khi đang viết code) |
| **Trách nhiệm bảo mật** | Phụ thuộc hoàn toàn vào đội ngũ Security riêng biệt | Trách nhiệm chung của toàn bộ team Dev, Ops và Sec |
| **Tốc độ Delivery** | Nhanh nhưng tiềm ẩn nhiều rủi ro an ninh mạng | Nhanh, tin cậy và được bảo vệ nhiều lớp |

---

## 📚 Lộ trình học tập chi tiết (Roadmap)

Giáo trình được chia làm 8 Module chính từ cơ bản (Beginner) lên nâng cao (Advanced), bám sát các tiêu chuẩn kỹ thuật trong các chứng chỉ quốc tế uy tín như **CKAD, CKA, CKS, AWS Certified DevOps, HashiCorp Certified Vault...**

---

### [MODULE 1 — NỀN TẢNG DEVOPS (Beginner)](./01-fundamentals/fundamentals-overview.md)
*   **Đối tượng:** Người mới bắt đầu tiếp cận quản trị hệ thống Linux và hạ tầng CNTT.
*   **Mục tiêu:** Sử dụng thành thạo dòng lệnh Linux CLI, viết script tự động hóa và quản lý phiên bản Git an toàn.

| Thư mục bài học | Tài liệu hướng dẫn | Bài thực hành (Lab) | Blog kỹ thuật đọc thêm | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `01-linux-networking` | 📖 [Linux & Mạng cơ bản](./01-fundamentals/01-linux-networking/linux-networking-guide.md) | 🧪 [Lab Chẩn đoán mạng](./01-fundamentals/01-linux-networking/labs/lab-linux-troubleshooting/lab-instructions.md) | 📄 [Troubleshooting mạng Linux](./01-fundamentals/01-linux-networking/blog/linux-networking-troubleshooting.md) | ✅ |
| `02-scripting-automation` | 📖 [Bash & Python Automation](./01-fundamentals/02-scripting-automation/scripting-automation-guide.md) | 🧪 [Lab Auto-Backup Script](./01-fundamentals/02-scripting-automation/labs/lab-auto-backup-script/lab-instructions.md) | 📄 [Viết Bash Script chuyên nghiệp](./01-fundamentals/02-scripting-automation/blog/bash-scripting-best-practices.md) | ✅ |
| `03-git-workflow` | 📖 [Git Core & Phân nhánh an toàn](./01-fundamentals/03-git-workflow/git-workflow-guide.md) | 🧪 [Lab Git Collaboration](./01-fundamentals/03-git-workflow/labs/lab-git-collaboration/lab-instructions.md) | 📄 [Mô hình Git Flow kinh điển](./01-fundamentals/03-git-workflow/blog/git-flow-branching-model.md) | ✅ |

---

### [MODULE 2 — CÔNG NGHỆ CONTAINER (Beginner-Intermediate)](./02-containerization/containerization-overview.md)
*   **Đối tượng:** Đã nắm vững Linux CLI, bắt đầu học về đóng gói và vận hành cô lập ứng dụng.
*   **Mục tiêu:** Làm chủ Dockerfile, tối ưu kích thước ảnh container và thiết lập hệ đa container.

| Thư mục bài học | Tài liệu hướng dẫn | Bài thực hành (Lab) | Blog kỹ thuật đọc thêm | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `01-docker-basics` | 📖 [Sổ tay Docker CLI từ Zero](./02-containerization/01-docker-basics/docker-basics-guide.md) | 🧪 [Lab Dockerize Ứng dụng AI](./02-containerization/01-docker-basics/labs/lab-dockerize-ai-app/lab-instructions.md) | 📄 [Tối ưu Docker Image](./02-containerization/01-docker-basics/blog/docker-image-optimization.md) <br> 📄 [Hardening Dockerfile CIS](./02-containerization/01-docker-basics/blog/dockerfile-hardening-cis-benchmarks.md) | ✅ |
| `02-docker-compose` | 📖 [Điều phối Đa Container](./02-containerization/02-docker-compose/docker-compose-guide.md) | 🧪 [Lab Cụm Microservices](./02-containerization/02-docker-compose/labs/lab-compose-microservices/lab-instructions.md) | 📄 [Docker Compose Production](./02-containerization/02-docker-compose/blog/docker-compose-production-best-practices.md) | ✅ |

---

### [MODULE 3 — TỰ ĐỘNG HÓA CI/CD (Intermediate)](./03-cicd-automation/cicd-automation-overview.md)
*   **Đối tượng:** Đã làm chủ Docker, muốn xây dựng các luồng phát hành phần mềm tự động hóa.
*   **Mục tiêu:** Quản trị, cấu hình và vận hành hệ thống Jenkins, GitLab CI/CD và GitHub Actions tự động.

| Thư mục bài học | Tài liệu hướng dẫn | Bài thực hành (Lab) | Blog kỹ thuật đọc thêm | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `01-github-actions` | 📖 [Tự động hóa với GitHub Actions](./03-cicd-automation/01-github-actions/github-actions-guide.md) | 🧪 [Lab Self-hosted Runner](./03-cicd-automation/01-github-actions/labs/lab-github-actions-runner/lab-instructions.md) | 📄 [Gia cố an toàn GitHub Actions](./03-cicd-automation/01-github-actions/blog/github-actions-security-hardening.md) <br> 📄 [Bảo mật GitOps & ArgoCD](./03-cicd-automation/01-github-actions/blog/securing-gitops-argocd.md) | ✅ |
| `02-jenkins-gitlab-ci` | 📖 [Pipelines với Jenkins & GitLab](./03-cicd-automation/02-jenkins-gitlab-ci/jenkins-gitlab-ci-guide.md) | 🧪 [Lab Quét mã nguồn SAST](./03-cicd-automation/02-jenkins-gitlab-ci/labs/lab-jenkins-sast/lab-instructions.md) | 📄 [Bảo mật Jenkins & Runners](./03-cicd-automation/02-jenkins-gitlab-ci/blog/securing-jenkins-gitlab-runners.md) | ✅ |

---

### [MODULE 4 — HẠ TẦNG DẠNG CODE - IaC (Intermediate)](./04-infrastructure-as-code/infrastructure-as-code-overview.md)
*   **Đối tượng:** Muốn tự động hóa hoàn toàn khâu khởi tạo server, cấu hình và thiết lập mạng bằng mã nguồn.
*   **Mục tiêu:** Quản lý vòng đời hạ tầng đám mây với Terraform, tự động hóa cấu hình hệ thống với Ansible Playbook.

| Thư mục bài học | Tài liệu hướng dẫn | Bài thực hành (Lab) | Blog kỹ thuật đọc thêm | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `01-terraform` | 📖 [Khởi tạo Hạ tầng dạng Code](./04-infrastructure-as-code/01-terraform/terraform-guide.md) | 🧪 [Lab Terraform Local](./04-infrastructure-as-code/01-terraform/labs/lab-terraform-local/lab-instructions.md) | 📄 [Xoay vòng khóa tự động Vault](./04-infrastructure-as-code/01-terraform/blog/automatic-secret-rotation-vault.md) <br> 📄 [Quản lý Terraform State an toàn](./04-infrastructure-as-code/01-terraform/blog/terraform-state-deep-dive.md) | ✅ |
| `02-ansible` | 📖 [Tự động hóa Cấu hình Server](./04-infrastructure-as-code/02-ansible/ansible-guide.md) | 🧪 [Lab Ansible OS Hardening](./04-infrastructure-as-code/02-ansible/labs/lab-ansible-hardening/lab-instructions.md) | 📄 [Bảo mật với Ansible Vault](./04-infrastructure-as-code/02-ansible/blog/securing-secrets-ansible-vault.md) <br> 📄 [Hardening OS bằng Ansible](./04-infrastructure-as-code/02-ansible/blog/os-hardening-ansible.md) | ✅ |

---

### [MODULE 5 — HỆ SINH THÁI KUBERNETES & BẢO MẬT (Intermediate-Advanced)](./05-kubernetes/kubernetes-overview.md)
*   **Đối tượng:** Cần quản trị và bảo vệ hàng trăm container microservices ở quy mô Production.
*   **Mục tiêu:** Nắm vững từ kiến trúc phát triển ứng dụng (CKAD), quản trị vận hành cluster (CKA) tới gia cố an ninh đa lớp (CKS).

| Thư mục bài học | Tài liệu hướng dẫn | Bài thực hành (Lab) | Blog kỹ thuật đọc thêm | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `01-k8s-basics` | 📖 [Core K8s & Helm Charts (CKAD)](./05-kubernetes/01-k8s-basics/k8s-basics-guide.md) | 🧪 [Lab Helm Deploy Webapp](./05-kubernetes/01-k8s-basics/labs/lab-helm-deploy-webapp/lab-instructions.md) | 📄 [Thiết kế Helm Chart chuyên nghiệp](./05-kubernetes/01-k8s-basics/blog/production-helm-charts-design.md) | ✅ |
| `02-k8s-administration` | 📖 [Quản trị Cluster & Storage (CKA)](./05-kubernetes/02-k8s-administration/k8s-administration-guide.md) | 🧪 [Lab Sao lưu ETCD Cluster](./05-kubernetes/02-k8s-administration/labs/lab-k8s-etcd-backup/lab-instructions.md) | 📄 [Sơ đồ gỡ lỗi Deployments K8s](./05-kubernetes/02-k8s-administration/blog/troubleshooting-kubernetes-deployments.md) | ✅ |
| `03-k8s-security` | 📖 [Gia cố An ninh Kubernetes (CKS)](./05-kubernetes/03-k8s-security/k8s-security-guide.md) | 🧪 [Lab Hardening Microservice](./05-kubernetes/03-k8s-security/labs/lab-hardening-ai-microservice/lab-instructions.md) | 📄 [10 Quy tắc Network Policies](./05-kubernetes/03-k8s-security/blog/k8s-network-policies-best-practices.md) <br> 📄 [Cấu hình Security Context Datadog](./05-kubernetes/03-k8s-security/blog/k8s-security-context-datadog.md) | ✅ |

---

### [MODULE 6 — GIÁM SÁT & TRỰC QUAN HÓA (Intermediate-Advanced)](./06-observability/observability-overview.md)
*   **Đối tượng:** Cần bảo đảm hệ thống luôn trong trạng thái sẵn sàng hoạt động cao và phản ứng sự cố nhanh.
*   **Mục tiêu:** Thiết lập các hệ thống thu thập metrics, lưu trữ log tập trung và cảnh báo thông minh.

| Thư mục bài học | Tài liệu hướng dẫn | Bài thực hành (Lab) | Blog kỹ thuật đọc thêm | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `01-prometheus-grafana` | 📖 [Cấu hình Prometheus & Grafana](./06-observability/01-prometheus-grafana/prometheus-grafana-guide.md) | 🧪 [Lab Monitor & Alerting](./06-observability/01-prometheus-grafana/labs/lab-prometheus-grafana/lab-instructions.md) | 📄 [Chống Alert Fatigue Prometheus](./06-observability/01-prometheus-grafana/blog/preventing-alert-fatigue-prometheus.md) <br> 📄 [Thiết kế Dashboard Grafana](./06-observability/01-prometheus-grafana/blog/designing-perfect-grafana-dashboard.md) | ✅ |
| `02-elk-loki-logging` | 📖 [Thu thập Log tập trung](./06-observability/02-elk-loki-logging/elk-loki-guide.md) | 🧪 [Lab Grafana Loki Logs](./06-observability/02-elk-loki-logging/labs/lab-elk-loki/lab-instructions.md) | 📄 [So sánh ELK Stack vs Grafana Loki](./06-observability/02-elk-loki-logging/blog/elk-vs-loki-comparison.md) | ✅ |

---

### [MODULE 7 — TÍCH HỢP BẢO MẬT CI/CD - DEVSECOPS PIPELINE (Advanced)](./07-devsecops-pipeline/devsecops-pipeline-overview.md)
*   **Đối tượng:** Tự động hóa hoàn toàn khâu kiểm tra tuân thủ bảo mật và mã hóa bí mật ở cấp độ Pipeline.
*   **Mục tiêu:** Hiện thực hóa mô hình Shift-left Security chuyên nghiệp bằng cách chèn tự động các công cụ bảo mật.

| Thư mục bài học | Tài liệu hướng dẫn | Bài thực hành (Lab) | Blog kỹ thuật đọc thêm | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `01-security-scanning` | 📖 [Quét bảo mật SAST, DAST, SCA](./07-devsecops-pipeline/01-security-scanning/security-scanning-guide.md) | 🧪 [Lab Pipeline Security Quét Lỗ Hổng](./07-devsecops-pipeline/01-security-scanning/labs/lab-pipeline-security/lab-instructions.md) | 📄 [Tích hợp Trivy & SonarQube](./07-devsecops-pipeline/01-security-scanning/blog/integrating-trivy-sonarqube-cicd.md) <br> 📄 [So sánh SAST vs DAST vs SCA](./07-devsecops-pipeline/01-security-scanning/blog/sast-vs-dast-vs-sca.md) | ✅ |
| `02-secret-management` | 📖 [Quản lý Secrets với Vault](./07-devsecops-pipeline/02-secret-management/secret-management-guide.md) | 🧪 [Lab Vault Secrets Engine](./07-devsecops-pipeline/02-secret-management/labs/lab-vault-secrets/lab-instructions.md) | 📄 [Tích hợp Vault vào CI/CD Pipeline](./07-devsecops-pipeline/02-secret-management/blog/vault-ci-cd-integration.md) | ✅ |
| `03-compliance-as-code` | 📖 [Tuân thủ chính sách OPA Conftest](./07-devsecops-pipeline/03-compliance-as-code/compliance-as-code-guide.md) | 🧪 [Lab OPA Policy Enforcement](./07-devsecops-pipeline/03-compliance-as-code/labs/lab-opa-conftest/lab-instructions.md) | 📄 [Kiểm soát Tuân thủ OPA/Conftest](./07-devsecops-pipeline/03-compliance-as-code/blog/compliance-as-code-opa-conftest.md) | ✅ |

---

### [MODULE 8 — VẬN HÀNH & AN NINH PHÒNG THỦ (Advanced)](./08-security-operations/security-operations-overview.md)
*   **Đối tượng:** Vận hành các hệ thống cô lập Zero-trust, giám sát hành vi bất thường thời gian thực và xử lý đe dọa.
*   **Mục tiêu:** Xây dựng hệ thống giám sát runtime an toàn, tự động hóa tình báo đe dọa và mã hóa mTLS microservices.

| Thư mục bài học | Tài liệu hướng dẫn | Bài thực hành (Lab) | Blog kỹ thuật đọc thêm | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `01-incident-response` | 📖 [Giám sát & Ứng phó sự cố](./08-security-operations/01-incident-response/incident-response-guide.md) | 🧪 [Lab Runtime Security Falco](./08-security-operations/01-incident-response/labs/lab-incident-response/lab-instructions.md) | 📄 [Ứng phó Sự cố Thực tế với Falco](./08-security-operations/01-incident-response/blog/falco-incident-response-firedrill.md) | ✅ |
| `02-threat-intelligence` | 📖 [Tự động hóa Threat Intel MISP](./08-security-operations/02-threat-intelligence/threat-intelligence-guide.md) | 🧪 [Lab Quản lý IOCs với MISP](./08-security-operations/02-threat-intelligence/labs/lab-misp-intel/lab-instructions.md) | 📄 [Threat Intel Tự động hóa với MISP](./08-security-operations/02-threat-intelligence/blog/misp-threat-intelligence-automation.md) | ✅ |
| `03-service-mesh-zero-trust` | 📖 [Istio Service Mesh & mTLS](./08-security-operations/03-service-mesh-zero-trust/service-mesh-zero-trust-guide.md) | 🧪 [Lab Istio Zero-Trust Network](./08-security-operations/03-service-mesh-zero-trust/labs/lab-istio-mtls/lab-instructions.md) | 📄 [Mô hình Zero-Trust với Istio Mesh](./08-security-operations/03-service-mesh-zero-trust/blog/zero-trust-kubernetes-istio-mesh.md) <br> 📄 [Cơ chế hoạt động mTLS chi tiết](./08-security-operations/03-service-mesh-zero-trust/blog/mtls-service-mesh.md) | ✅ |

---

## 🧪 Hệ Thống Lab Thực Chiến Đa Cấp Độ (Easy - Medium - Hard)

Dự án áp dụng triết lý học qua hành (**Hands-on Learning**). Để đáp ứng năng lực của mọi học viên, chúng tôi thiết kế và đóng gói **24 bài thực hành thực tế** bám sát 100% các công nghệ tiêu chuẩn của ngành, được phân rã một cách khoa học trực tiếp bên trong từng thư mục bài học tương ứng dưới dạng các tệp tin hướng dẫn modular độc lập.

Học viên có thể linh hoạt lựa chọn tùy chọn Lab phù hợp với trình độ của mình và nhấp trực tiếp vào liên kết bên dưới để bắt đầu thực hành ngay lập tức:

| Nhóm Chủ Đề | 🟢 Cấp độ: EASY (Nhập môn) | 🟡 Cấp độ: MEDIUM (Thực chiến) | 🔴 Cấp độ: HARD (Production/Expert) |
| :--- | :--- | :--- | :--- |
| **1. Git Security & Secrets** <br> (Module 1) | [Lab 1.3: Quy Trình Git Flow An Toàn](./01-fundamentals/03-git-workflow/labs/lab-git-flow/lab-instructions.md) | [Lab 1.4: Chặn Rò Rỉ Gitleaks Local](./01-fundamentals/03-git-workflow/labs/lab-gitleaks-local/lab-instructions.md) | [Lab 1.5: Gitleaks Action Pipeline](./01-fundamentals/03-git-workflow/labs/lab-gitleaks-pipeline/lab-instructions.md) |
| **2. Container & Hardening** <br> (Module 2) | [Lab 2.1: Dockerize Web App Node.js](./02-containerization/01-docker-basics/labs/lab-dockerize-ai-app/lab-instructions.md) | [Lab 2.2: Multi-stage & Hardening CIS](./02-containerization/01-docker-basics/labs/lab-docker-hardening/lab-instructions.md) | [Lab 2.3: Resource Limits & Isolation](./02-containerization/01-docker-basics/labs/lab-docker-compose-production/lab-instructions.md) |
| **3. CI/CD Pipeline Security** <br> (Module 3) | [Lab 3.1: GitHub Actions CI Pipeline](./03-cicd-automation/01-github-actions/labs/lab-github-actions-runner/lab-instructions.md) (Self-hosted) | [Lab 3.2: Tích hợp SAST & SCA Pipeline](./07-devsecops-pipeline/01-security-scanning/labs/lab-pipeline-security/lab-instructions.md) (Trivy) | [Lab 3.3: Jenkins SAST SonarQube](./03-cicd-automation/02-jenkins-gitlab-ci/labs/lab-jenkins-sast/lab-instructions.md) |
| **4. Infrastructure as Code** <br> (Module 4) | [Lab 4.1: Terraform & State Local](./04-infrastructure-as-code/01-terraform/labs/lab-terraform-local/lab-instructions.md) | [Lab 4.2: Quét Lỗ Hổng IaC Tfsec](./04-infrastructure-as-code/01-terraform/labs/lab-terraform-scan/lab-instructions.md) | [Lab 4.3: Pipeline IaC tfsec Action](./04-infrastructure-as-code/01-terraform/labs/lab-terraform-pipeline/lab-instructions.md) |
| **5. Kubernetes & Hardening** <br> (Module 5) | [Lab 5.1: Deploy Webapp Helm Chart](./05-kubernetes/01-k8s-basics/labs/lab-helm-deploy-webapp/lab-instructions.md) | [Lab 5.2: NetworkPolicies & RBAC K8s](./05-kubernetes/03-k8s-security/labs/lab-hardening-ai-microservice/lab-instructions.md) | [Lab 5.3: Falco Runtime & Kube-bench](./08-security-operations/01-incident-response/labs/lab-incident-response/lab-instructions.md) |
| **6. Observability & Chaos** <br> (Module 6) | [Lab 6.1: Prometheus Grafana Monitor](./06-observability/01-prometheus-grafana/labs/lab-prometheus-grafana/lab-instructions.md) | [Lab 6.2: Grafana Loki & Alerting](./06-observability/02-elk-loki-logging/labs/lab-elk-loki/lab-instructions.md) | [Lab 6.3: Chaos Engineering Alert Test](./06-observability/01-prometheus-grafana/labs/lab-prometheus-grafana/lab-instructions.md) |
| **7. Secrets & Compliance** <br> (Module 7) | [Lab 7.1: HashiCorp Vault DEV Setup](./07-devsecops-pipeline/02-secret-management/labs/lab-vault-secrets/lab-instructions.md) | [Lab 7.2: OPA Conftest Policy Code](./07-devsecops-pipeline/03-compliance-as-code/labs/lab-opa-conftest/lab-instructions.md) | [Lab 7.3: Dynamic Secrets & Cosign Sign](./07-devsecops-pipeline/01-security-scanning/labs/lab-pipeline-security/lab-instructions.md) |
| **8. Zero-Trust & Intel** <br> (Module 8) | [Lab 8.1: Istio Service Mesh & Kiali](./08-security-operations/03-service-mesh-zero-trust/labs/lab-istio-mtls/lab-instructions.md) | [Lab 8.2: MISP Threat Intel Cục Bộ](./08-security-operations/02-threat-intelligence/labs/lab-misp-intel/lab-instructions.md) | [Lab 8.3: mTLS STRICT & Auth Policy](./08-security-operations/03-service-mesh-zero-trust/labs/lab-istio-mtls/lab-instructions.md) |

---

## 🧰 Bộ công cụ công nghệ thống nhất (Technology Stack)

Tài liệu sử dụng các công cụ phổ biến và tiêu chuẩn của thị trường (Tham khảo: [Lộ trình DevOps chuẩn tại roadmap.sh](https://roadmap.sh/devops)):

*   **Hạ tầng & Đóng gói:** Docker, Docker Compose, Kubernetes, Helm Charts.
*   **CI/CD & Tự động hóa:** GitHub Actions, Jenkins, GitLab CI.
*   **Hạ tầng dạng Code (IaC):** Terraform, Ansible.
*   **Giám sát & Log (Observability):** Prometheus, Grafana, ELK Stack, Grafana Loki.
*   **Bảo mật & Quét lỗi:** Trivy, SonarQube, OWASP ZAP, HashiCorp Vault, Conftest (OPA).
*   **Vận hành & Phòng thủ:** TheHive, Falco, MISP, Istio Service Mesh.

---

## 📁 Cấu trúc thư mục dự án

```
DevSecOps_Tutorials_Vietnamese-version/
├── README.md                              # File hướng dẫn chính này
├── .gitignore                             # Loại trừ các file rác và bộ nhớ tạm
├── docker-setup.md                        # Hướng dẫn cài đặt Docker đa nền tảng
│
├── 01-fundamentals/                       # MODULE 1: NỀN TẢNG DEVOPS
│   ├── 01-linux-networking/               # Linux & Mạng căn bản
│   ├── 02-scripting-automation/           # Scripting tự động hóa với Bash & Python
│   └── 03-git-workflow/                   # Quản lý mã nguồn với Git an toàn
│
├── 02-containerization/                   # MODULE 2: CÔNG NGHỆ CONTAINER
│   ├── 01-docker-basics/                  # Docker CLI, Dockerfile & Hardening
│   └── 02-docker-compose/                 # Compose phối hợp đa dịch vụ
│
├── 03-cicd-automation/                    # MODULE 3: TỰ ĐỘNG HÓA CI/CD
│   ├── 01-github-actions/                 # GitHub Actions Pipelines
│   └── 02-jenkins-gitlab-ci/              # Jenkins Server & GitLab Runner
│
├── 04-infrastructure-as-code/             # MODULE 4: HẠ TẦNG DẠNG CODE - IaC
│   ├── 01-terraform/                      # Terraform Provisioning
│   └── 02-ansible/                        # Ansible Configuration Management
│
├── 05-kubernetes/                         # MODULE 5: HỆ SINH THÁI KUBERNETES & BẢO MẬT
│   ├── 01-k8s-basics/                     # Core K8s, Deployments & Helm (CKAD)
│   ├── 02-k8s-administration/             # Storage, Ingress & Troubleshooting (CKA)
│   └── 03-k8s-security/                   # Network Policies, RBAC, Falco (CKS)
│
├── 06-observability/                      # MODULE 6: GIÁM SÁT & TRỰC QUAN HÓA
│   ├── 01-prometheus-grafana/             # Prometheus Metrics & Alertmanager
│   └── 02-elk-loki-logging/               # Log tập trung Grafana Loki / ELK
│
├── 07-devsecops-pipeline/                 # MODULE 7: TÍCH HỢP BẢO MẬT CI/CD
│   ├── 01-security-scanning/              # Quét lỗ hổng SAST, DAST, SCA
│   ├── 02-secret-management/              # Quản lý an toàn secrets qua Vault
│   └── 03-compliance-as-code/             # Cưỡng chế chính sách an ninh OPA
│
└── 08-security-operations/                # MODULE 8: VẬN HÀNH & AN NINH PHÒNG THỦ
    ├── 01-incident-response/              # Phân tích giám sát Runtime Falco
    ├── 02-threat-intelligence/            # Threat sharing MISP
    └── 03-service-mesh-zero-trust/        # Istio Service Mesh Zero-trust mTLS
```

---

## 📖 Nguồn tài liệu tham khảo chính thống

### Tiêu chuẩn & Lộ trình
*   🗺️ [DevOps Roadmap 2026](https://roadmap.sh/devops) — Lộ trình học DevOps tiêu chuẩn toàn cầu.
*   🔧 [DevOps Tools](https://roadmap.sh/devops/tools) — Sổ tay phân loại công cụ.
*   🛡️ [OWASP DevSecOps Guideline](https://owasp.org/www-project-devsecops-guideline/) — Tài liệu hướng dẫn DevSecOps của OWASP.
*   📄 [NIST DevSecOps Practices Guide](https://csrc.nist.gov/publications/detail/sp/800-204c/final) — Tiêu chuẩn bảo mật hạ tầng Cloud Native của NIST.
*   🔒 [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks) — Quy tắc gia cố hệ thống an toàn tiêu chuẩn quốc tế.

---

## 🤝 Đóng góp phát triển cộng đồng

Chúng tôi cực kỳ hoan nghênh và trân trọng mọi đóng góp từ cộng đồng kỹ sư Việt Nam!

### Quy trình tham gia đóng góp:
1.  **Fork** repository này về tài khoản của bạn.
2.  Tạo **branch** mới để triển khai tính năng: `git checkout -b feature/ten-tinh-nang`
3.  Thực hiện **Commit** thay đổi theo chuẩn thông điệp sạch sẽ: `git commit -m "feat: mô tả chi tiết thay đổi"`
4.  **Push** lên branch của bạn: `git push origin feature/ten-tinh-nang`
5.  Tạo **Pull Request (PR)** trên repository gốc.

### Quy ước tiền tố Commit Message:
*   `feat:` — Bổ sung thêm tính năng hoặc nội dung bài học mới.
*   `fix:` — Sửa lỗi chính tả, lỗi cấu trúc hoặc sửa mã nguồn lab.
*   `docs:` — Cập nhật tài liệu, file readme hoặc bổ sung ghi chú.
*   `lab:` — Cập nhật cấu hình môi trường hoặc hướng dẫn lab.
*   `refactor:` — Tối ưu hóa cấu trúc mã nguồn mà không thay đổi tính năng.

---

## 📄 Giấy phép (License)

Dự án này được phân phối dưới giấy phép **[MIT License](LICENSE)**.

---

<p align="center">
  <b>Được xây dựng với ❤️ bởi cộng đồng kỹ sư DevOps & DevSecOps Việt Nam</b>
  <br/>
  <sub>Hands-on learning · Open source · Vietnamese first</sub>
</p>