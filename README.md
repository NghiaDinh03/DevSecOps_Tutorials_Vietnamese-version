<p align="center">
  <img src="https://img.shields.io/badge/DevSecOps-Tutorials-blue?style=for-the-badge&logo=docker&logoColor=white" alt="DevSecOps Tutorials"/>
  <img src="https://img.shields.io/badge/Ngôn_ngữ-Tiếng_Việt-red?style=for-the-badge" alt="Tiếng Việt"/>
  <img src="https://img.shields.io/badge/AI-Hỗ_trợ_học_tập-green?style=for-the-badge&logo=openai&logoColor=white" alt="AI Assisted"/>
</p>

# 🚀 DevSecOps Tutorials — Phiên bản Tiếng Việt

> Học DevSecOps từ zero đến production-ready, với AI làm công cụ hỗ trợ. Toàn bộ nội dung bằng tiếng Việt, dành cho cộng đồng DevOps Việt Nam.

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Hướng dẫn Cài đặt Docker (Bắt buộc)](docker-setup.md)
- [Tại sao DevSecOps?](#-tại-sao-devsecops)
- [Lộ trình học](#-lộ-trình-học)
- [Dự án thực hành](#-dự-án-thực-hành)
- [Bộ công cụ DevSecOps](#-bộ-công-cụ-devsecops)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Nguồn tài liệu tham khảo](#-nguồn-tài-liệu-tham-khảo)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)

---

## 🎯 Giới thiệu

**DevSecOps Tutorials Vietnamese-version** là dự án mã nguồn mở giúp người Việt Nam tiếp cận DevSecOps một cách hệ thống và thực tế.

### Đặc điểm

- 🇻🇳 **100% tiếng Việt** — Không rào cản ngôn ngữ
- 🤖 **AI hỗ trợ** — Sử dụng AI Agent (Gemini, Claude, GPT) làm trợ lý học tập và coding
- 🐳 **Docker-first** — Mọi bài lab đều chạy bằng `docker-compose` duy nhất ([Hướng dẫn Cài đặt Docker & Compose](docker-setup.md))
- 🔒 **Security-first** — Tích hợp bảo mật ngay từ đầu, không phải afterthought
- 📈 **Từ cơ bản đến nâng cao** — Lộ trình rõ ràng theo roadmap.sh

---

## 🔐 Tại sao DevSecOps?

```
DevOps = Development + Operations
DevSecOps = Development + Security + Operations
```

| Khía cạnh | DevOps truyền thống | DevSecOps |
|-----------|--------------------:|----------:|
| Bảo mật | Kiểm tra cuối pipeline | Tích hợp mọi giai đoạn |
| Phát hiện lỗ hổng | Sau khi deploy | Ngay khi commit code |
| Chi phí sửa lỗi | Cao (phát hiện muộn) | Thấp (shift-left) |
| Trách nhiệm bảo mật | Chỉ team security | Toàn bộ team |
| Tốc độ delivery | Nhanh nhưng rủi ro | Nhanh và an toàn |

> **Shift-left**: Đưa kiểm tra bảo mật về phía trái của pipeline (sớm hơn trong quy trình phát triển), giúp phát hiện và sửa lỗi bảo mật từ giai đoạn code thay vì chờ đến khi triển khai.

---

## 📚 Lộ trình học

Lộ trình được thiết kế một cách khoa học từ nền tảng (Beginner) đến nâng cao (Advanced), giúp bạn dễ dàng tự đánh giá năng lực của mình và chọn điểm xuất phát phù hợp. Hệ thống kiến thức bám sát các chứng chỉ DevOps/Security quốc tế danh tiếng như **CKAD, CKA, CKS, AWS DevOps, HashiCorp Vault, v.v.**

---

### [MODULE 1 — NỀN TẢNG DEVOPS (Beginner)](01-fundamentals/fundamentals-overview.md)
> **Trình độ của bạn:** Mới bắt đầu tiếp cận IT/System.
> **Kiến thức mục tiêu:** Vận hành hệ thống cơ bản, sử dụng CLI thành thạo.

| Sub-module | Nội dung chính | Chứng chỉ liên quan | Trạng thái |
|------------|----------------|---------------------|:----------:|
| [**linux-networking**](01-fundamentals/linux-networking/linux-networking-guide.md) | Linux CLI, Filesystem, Permissions, Network (TCP/IP, DNS, SSH), Firewall | Linux Essentials, CCNA | ✅ |
| [**scripting-automation**](01-fundamentals/scripting-automation/scripting-automation-guide.md) | Viết Bash script và Python automation phục vụ quản trị hệ thống | Automation Essentials | ✅ |
| [**git-workflow**](01-fundamentals/git-workflow/git-workflow-guide.md) | Git Core, Branching Strategy (Gitflow), Git Hooks quét an toàn mã nguồn | Git Certification | ✅ |

---

### [MODULE 2 — CÔNG NGHỆ CONTAINER (Beginner-Intermediate)](02-containerization/containerization-overview.md)
> **Trình độ của bạn:** Đã nắm vững Linux và Scripting, bắt đầu học đóng gói ứng dụng.
> **Kiến thức mục tiêu:** Containerization, tối ưu hóa kích thước và bảo mật Docker Image.

| Sub-module | Nội dung chính | Chứng chỉ liên quan | Trạng thái |
|------------|----------------|---------------------|:----------:|
| [**docker-basics**](02-containerization/docker-basics/docker-basics-guide.md) | Dockerfile, Multi-stage Build, bảo mật Docker Image (chạy non-root) | Docker Certified Associate | ✅ |
| [**docker-compose**](02-containerization/docker-compose/docker-compose-guide.md) | Xây dựng và phối hợp ứng dụng đa container (Multi-container Application) | DCA | ✅ |

---

### [MODULE 3 — TỰ ĐỘNG HÓA CI/CD (Intermediate)](03-cicd-automation/cicd-automation-overview.md)
> **Trình độ của bạn:** Đã biết Docker, muốn tự động hóa quy trình phân phối sản phẩm.
> **Kiến thức mục tiêu:** Thiết lập và quản lý Pipelines tự động.

| Sub-module | Nội dung chính | Chứng chỉ liên quan | Trạng thái |
|------------|----------------|---------------------|:----------:|
| [**github-actions**](03-cicd-automation/github-actions/github-actions-guide.md) | Workflow Automation, Marketplace Actions, Self-hosted Runners | GitHub Actions Cert | ✅ |
| [**jenkins-gitlab-ci**](03-cicd-automation/jenkins-gitlab-ci/jenkins-gitlab-ci-guide.md) | Quản lý Jenkins Server, GitLab Runner, tích hợp CI/CD nâng cao | Jenkins Engineer | ✅ |

---

### [MODULE 4 — HẠ TẦNG DẠNG CODE - IaC (Intermediate)](04-infrastructure-as-code/infrastructure-as-code-overview.md)
> **Trình độ của bạn:** Muốn tự động hóa việc khởi tạo server, mạng và cài đặt phần mềm.
> **Kiến thức mục tiêu:** Quản lý tài nguyên phần cứng thông qua code.

| Sub-module | Nội dung chính | Chứng chỉ liên quan | Trạng thái |
|------------|----------------|---------------------|:----------:|
| [**terraform**](04-infrastructure-as-code/terraform/terraform-guide.md) | Khởi tạo tài nguyên đám mây (Provisioning), State Management | Terraform Associate | ✅ |
| [**ansible**](04-infrastructure-as-code/ansible/ansible-guide.md) | Quản lý cấu hình server tự động (Configuration Management), Playbooks | Red Hat Ansible | ✅ |

---

### [MODULE 5 — HỆ SINH THÁI KUBERNETES & BẢO MẬT (Intermediate-Advanced)](05-kubernetes/kubernetes-overview.md)
> **Trình độ của bạn:** Cần quản lý hàng trăm container ở môi trường production.
> **Kiến thức mục tiêu:** Làm chủ từ phát triển, quản trị đến bảo mật chuyên sâu cụm Kubernetes.
> 
> *Lưu ý: Để tránh nhầm lẫn, Kubernetes (Điều phối) và K8s Security (Bảo mật) được đặt chung trong một Module lớn giúp học viên đi từ việc biết sử dụng, biết vận hành đến biết gia cố an toàn tuyệt đối.*

| Sub-module | Nội dung chính | Chứng chỉ liên quan | Trạng thái |
|------------|----------------|---------------------|:----------:|
| [**01-k8s-basics**](05-kubernetes/01-k8s-basics/k8s-basics-guide.md) | Core Concepts, Pods, Deployments, Services, Helm Charts | **CKAD** (Developer) | ✅ |
| [**02-k8s-administration**](05-kubernetes/02-k8s-administration/k8s-administration-guide.md) | Quản trị Cluster, Storage (PV/PVC), Ingress Controller, Troubleshooting | **CKA** (Administrator) | ✅ |
| [**03-k8s-security**](05-kubernetes/03-k8s-security/k8s-security-guide.md) | Network Policies, RBAC, Pod Security Standards, Falco Runtime Security | **CKS** (Security Specialist)| ✅ |

---

### [MODULE 6 — GIÁM SÁT & TRỰC QUAN HÓA (Intermediate-Advanced)](06-observability/observability-overview.md)
> **Trình độ của bạn:** Cần đảm bảo hệ thống luôn sẵn sàng hoạt động, phát hiện sự cố sớm.
> **Kiến thức mục tiêu:** Observability, Metrics, Centralized Logging.

| Sub-module | Nội dung chính | Chứng chỉ liên quan | Trạng thái |
|------------|----------------|---------------------|:----------:|
| [**prometheus-grafana**](06-observability/prometheus-grafana/prometheus-grafana-guide.md) | Thu thập Metrics, tạo Dashboards trực quan, thiết lập Alerting | Grafana Certified | ✅ |
| [**elk-loki-logging**](06-observability/elk-loki-logging/elk-loki-guide.md) | Thu thập và truy vấn Log tập trung sử dụng ELK Stack hoặc Grafana Loki | Elastic Certified | ✅ |

---

### [MODULE 7 — TÍCH HỢP BẢO MẬT CI/CD - DEVSECOPS PIPELINE (Advanced)](07-devsecops-pipeline/devsecops-pipeline-overview.md)
> **Trình độ của bạn:** Muốn đưa các tiêu chuẩn an toàn thông tin tự động vào Pipeline.
> **Kiến thức mục tiêu:** Shift-left Security, Quét lỗ hổng tự động, Quản lý Secret.

| Sub-module | Nội dung chính | Chứng chỉ liên quan | Trạng thái |
|------------|----------------|---------------------|:----------:|
| [**security-scanning**](07-devsecops-pipeline/security-scanning/security-scanning-guide.md) | Tích hợp tự động SAST (SonarQube), SCA (Trivy) và DAST (OWASP ZAP) | DevSecOps Professional | ✅ |
| [**secret-management**](07-devsecops-pipeline/secret-management/secret-management-guide.md) | Quản lý Secrets an toàn bằng HashiCorp Vault, Secrets Rotation | Vault Associate | ✅ |
| [**compliance-as-code**](07-devsecops-pipeline/compliance-as-code/compliance-as-code-guide.md) | Tự động hóa kiểm tra tuân thủ chính sách bảo mật với Open Policy Agent (OPA) | Certified OPA | ✅ |

---

### [MODULE 8 — VẬN HÀNH & AN NINH PHÒNG THỦ (Advanced)](08-security-operations/security-operations-overview.md)
> **Trình độ của bạn:** Vận hành hệ thống Zero-trust và ứng phó sự cố bảo mật thời gian thực.
> **Kiến thức mục tiêu:** Incident Response, Service Mesh, Threat Intelligence.

| Sub-module | Nội dung chính | Chứng chỉ liên quan | Trạng thái |
|------------|----------------|---------------------|:----------:|
| [**incident-response**](08-security-operations/incident-response/incident-response-guide.md) | Phối hợp, ghi nhận và điều phối ứng phó sự cố an ninh bằng SOAR (TheHive) | SOC Specialist | ✅ |
| [**threat-intelligence**](08-security-operations/threat-intelligence/threat-intelligence-guide.md) | Thu thập, phân tích mối đe dọa an ninh mạng bằng MISP | Threat Intel Cert | ✅ |
| [**service-mesh-zero-trust**](08-security-operations/service-mesh-zero-trust/service-mesh-zero-trust-guide.md) | Quản lý microservices traffic, kích hoạt mTLS, mã hóa với Istio | Istio Expert | ✅ |

> 📝 = Đang xây dựng | ✅ = Hoàn thành | 🚧 = Đang viết

---

## 🛠 Bản đồ Lab Thực Chiến Toàn Diện (1 Sub-module / Tối thiểu 1 Lab)

Dự án áp dụng triết lý học qua thực hành (**Hands-on Learning**). Mỗi sub-module trong lộ trình **bắt buộc có ít nhất 1 bài lab thực tế** hoạt động ổn định và chính xác 100% dựa trên tài liệu kỹ thuật chính thống.

### 💡 Hai mô hình Lab áp dụng:
1.  **Standalone Labs (Lab Độc lập)**: Tự động khởi dựng toàn bộ môi trường và ứng dụng đích giả lập (NodeJS, Python, Go, Postgres, Nginx...) bằng Docker Compose hoặc Kubernetes cục bộ. Hoạt động độc lập và khép kín.
2.  **Non-invasive Labs (Lab Liên kết)**: Sử dụng trực tiếp các dự án mã nguồn mở có sẵn của bạn trong thư mục `/VSC/` (như `gemma-chat`, `nghiadinh-portfolio`, `TheHive`) làm đối tượng để quét bảo mật hoặc deploy, **tuyệt đối không can thiệp hay chỉnh sửa bất kỳ dòng code nào** của các dự án này.

---

### 🗺 Bản đồ phân bổ Lab theo lộ trình:

#### MODULE 1 — NỀN TẢNG DEVOPS
*   **linux-networking**: [`lab-linux-troubleshooting`](01-fundamentals/linux-networking/labs/lab-linux-troubleshooting/lab-instructions.md) — Thực hành khắc phục sự cố DNS, phân quyền tệp tin và sửa cổng dịch vụ.
*   **scripting-automation**: [`lab-auto-backup-script`](01-fundamentals/scripting-automation/labs/lab-auto-backup-script/lab-instructions.md) — Sao lưu cấu hình nén an toàn và lập lịch định kỳ tự động hóa bằng Cronjob.
*   **git-workflow**: [`lab-git-collaboration`](01-fundamentals/git-workflow/labs/lab-git-collaboration/lab-instructions.md) — Giả lập Bare Repository cục bộ và xử lý xung đột mã nguồn khi làm việc nhóm.

#### MODULE 2 — CÔNG NGHỆ CONTAINER
*   **docker-basics**: [`lab-dockerize-ai-app`](02-containerization/docker-basics/labs/lab-dockerize-ai-app/lab-instructions.md) — Dockerize tối ưu và bảo mật ứng dụng AI Chatbot Gemma (`/VSC/gemma-chat`). *(Liên kết ngoài)*
*   **docker-compose**: [`lab-compose-microservices`](02-containerization/docker-compose/labs/lab-compose-microservices/lab-instructions.md) — Dựng cụm Microservices 3 lớp gồm Frontend tĩnh, Backend API và Database PostgreSQL.

#### MODULE 3 — TỰ ĐỘNG HÓA CI/CD
*   **github-actions**: [`lab-github-actions-runner`](03-cicd-automation/github-actions/labs/lab-github-actions-runner/lab-instructions.md) — Tự dựng Containerized Self-hosted Runner cục bộ chạy quét an toàn mã nguồn bằng Trivy (SCA).
*   **jenkins-gitlab-ci**: [`lab-jenkins-sast`](03-cicd-automation/jenkins-gitlab-ci/labs/lab-jenkins-sast/lab-instructions.md) — Khởi dựng cụm phân tán Jenkins-SonarQube quét an toàn tĩnh mã nguồn (SAST) tự động chặn Quality Gate.

#### MODULE 4 — HẠ TẦNG DẠNG CODE (IaC)
*   **terraform**: [`lab-terraform-local`](04-infrastructure-as-code/terraform/labs/lab-terraform-local/lab-instructions.md) — Khởi tạo các tài nguyên hệ thống cục bộ tương tác trực tiếp với Docker Socket.
*   **ansible**: [`lab-ansible-hardening`](04-infrastructure-as-code/ansible/labs/lab-ansible-hardening/lab-instructions.md) — Playbook tự động gia cố bảo mật (hardening) hệ điều hành an toàn.

#### MODULE 5 — HỆ SINH THÁI KUBERNETES
*   **01-k8s-basics**: [`lab-helm-deploy-webapp`](05-kubernetes/01-k8s-basics/labs/lab-helm-deploy-webapp/lab-instructions.md) — Đóng gói ứng dụng dạng Helm Chart và triển khai lên cụm Kubernetes cục bộ (k3d/kind).
*   **02-k8s-administration**: [`lab-k8s-etcd-backup`](05-kubernetes/02-k8s-administration/labs/lab-k8s-etcd-backup/lab-instructions.md) — Thực hiện sao lưu và khôi phục database ETCD của cluster Kubernetes an toàn.
*   **03-k8s-security**: [`lab-hardening-ai-microservice`](05-kubernetes/03-k8s-security/labs/lab-hardening-ai-microservice/lab-instructions.md) — Thiết lập Network Policies, RBAC tối thiểu và Pod Security Context cho chatbot Gemma (`/VSC/gemma-chat`). *(Liên kết ngoài)*

#### MODULE 6 — GIÁM SÁT & TRỰC QUAN HÓA
*   **prometheus-grafana**: [`lab-prometheus-grafana`](06-observability/prometheus-grafana/labs/lab-prometheus-grafana/lab-instructions.md) — Giám sát hiệu năng hệ thống microservices và tự động gửi cảnh báo qua Alertmanager.
*   **elk-loki-logging**: [`lab-elk-loki`](06-observability/elk-loki-logging/labs/lab-elk-loki/lab-instructions.md) — Thu thập, lọc và truy vấn log tập trung từ các containers bằng Grafana Loki & Promtail.

#### MODULE 7 — TÍCH HỢP BẢO MẬT CI/CD (DEVSECOPS PIPELINE)
*   **security-scanning**: [`lab-pipeline-security`](07-devsecops-pipeline/security-scanning/labs/lab-pipeline-security/lab-instructions.md) — Quét an toàn mã nguồn tĩnh (SAST), phân tích thành phần phụ thuộc (SCA) tự động chặn lỗ hổng nghiêm trọng ở pipeline.
*   **secret-management**: [`lab-vault-secrets`](07-devsecops-pipeline/secret-management/labs/lab-vault-secrets/lab-instructions.md) — Lưu trữ và truy xuất dynamic credentials an toàn từ HashiCorp Vault.
*   **compliance-as-code**: [`lab-opa-conftest`](07-devsecops-pipeline/compliance-as-code/labs/lab-opa-conftest/lab-instructions.md) — Kiểm tra và cưỡng chế tuân thủ chính sách bảo mật hạ tầng Docker/Kubernetes bằng Rego (Conftest).

#### MODULE 8 — VẬN HÀNH & AN NINH PHÒNG THỦ
*   **incident-response**: [`lab-incident-response`](08-security-operations/incident-response/labs/lab-incident-response/lab-instructions.md) — Giám sát an ninh Runtime thời gian thực bằng Mini-Falco và cơ chế chia sẻ PID Namespace.
*   **threat-intelligence**: [`lab-misp-intel`](08-security-operations/threat-intelligence/labs/lab-misp-intel/lab-instructions.md) — Triển khai cụm threat sharing MISP mock phục vụ quản lý chỉ số độc hại IOCs và tự động sinh Suricata API Blocklist.
*   **service-mesh-zero-trust**: [`lab-istio-mtls`](08-security-operations/service-mesh-zero-trust/labs/lab-istio-mtls/lab-instructions.md) — Cấu hình Istio Service Mesh, kích hoạt mTLS bắt buộc để bảo vệ traffic nội bộ Zero-trust.

---


## 🧰 Bộ công cụ DevSecOps

Tham khảo chi tiết tại [roadmap.sh/devops/tools](https://roadmap.sh/devops/tools).

*   **Hạ tầng & Đóng gói:** Docker, Docker Compose, Kubernetes, Helm Charts.
*   **CI/CD & Automation:** GitHub Actions, Jenkins, GitLab CI.
*   **Hạ tầng dạng Code (IaC):** Terraform, Ansible.
*   **Giám sát (Observability):** Prometheus, Grafana, ELK Stack, Grafana Loki.
*   **An ninh & Bảo mật:** Trivy, SonarQube, OWASP ZAP, HashiCorp Vault, OPA.
*   **Vận hành & Phòng thủ:** TheHive, Cortex, MISP, Falco, Istio Service Mesh.

---

## 📁 Cấu trúc thư mục

```
DevSecOps_Tutorials_Vietnamese-version/
├── README.md                              # File này
├── .gitignore                             # Ignore rules (loại trừ agent_memory)
│
├── 01-fundamentals/                       # MODULE 1: NỀN TẢNG DEVOPS
│   ├── linux-networking/                  # Hướng dẫn Linux & Mạng
│   ├── scripting-automation/              # Bash & Python automation
│   └── git-workflow/                      # Gitflow an toàn
│
├── 02-containerization/                   # MODULE 2: CÔNG NGHỆ CONTAINER
│   ├── docker-basics/                     # Dockerfile & Tối ưu hóa Image
│   └── docker-compose/                    # Docker Compose đa container
│
├── 03-cicd-automation/                    # MODULE 3: TỰ ĐỘNG HÓA CI/CD
│   ├── github-actions/                    # Pipelines với GitHub Actions
│   └── jenkins-gitlab-ci/                 # Pipelines với Jenkins & GitLab
│
├── 04-infrastructure-as-code/             # MODULE 4: HẠ TẦNG DẠNG CODE - IaC
│   ├── terraform/                         # Terraform Cloud/Local
│   └── ansible/                           # Ansible Automation
│
├── 05-kubernetes/                         # MODULE 5: HỆ SINH THÁI KUBERNETES & BẢO MẬT
│   ├── kubernetes-overview.md             # Tài liệu tổng quan Module 5
│   ├── 01-k8s-basics/                     # Sub-module 01: Core K8s, Deployments & Service (CKAD)
│   │   ├── k8s-basics-guide.md            # Tài liệu hướng dẫn CKAD
│   │   └── labs/                          # Thư mục thực hành
│   ├── 02-k8s-administration/             # Sub-module 02: Storage, Ingress & Cluster Management (CKA)
│   │   └── k8s-administration-guide.md    # Tài liệu hướng dẫn CKA
│   └── 03-k8s-security/                   # Sub-module 03: NetworkPolicies, RBAC, Falco (CKS)
│       ├── k8s-security-guide.md          # Tài liệu hướng dẫn CKS
│       └── labs/                          # Thư mục thực hành
│
├── 06-observability/                      # MODULE 6: GIÁM SÁT & TRỰC QUAN HÓA
│   ├── prometheus-grafana/                # Metrics & Dashboards
│   └── elk-loki-logging/                  # Log tập trung
│
├── 07-devsecops-pipeline/                 # MODULE 7: TÍCH HỢP BẢO MẬT CI/CD
│   ├── security-scanning/                 # SAST, DAST, SCA
│   ├── secret-management/                 # HashiCorp Vault
│   └── compliance-as-code/                # Open Policy Agent (OPA)
│
├── 08-security-operations/                # MODULE 8: VẬN HÀNH & AN NINH PHÒNG THỦ
│   ├── incident-response/                 # TheHive & SOAR
│   ├── threat-intelligence/               # MISP
│   └── service-mesh-zero-trust/           # Istio & mTLS
│
└── agent_memory/                          # [GITIGNORED] AI Agent persistent memory
    ├── MEMORY.md
    ├── STRUCTURE.md
    ├── CODING_GUIDELINES.md
    └── MASTER_PROMPT.md
```

---

## 📖 Nguồn tài liệu tham khảo

### Lộ trình & Roadmap
- 🗺 [DevOps Roadmap 2026](https://roadmap.sh/devops) — Lộ trình học DevOps chuẩn
- 📂 [DevOps Projects](https://roadmap.sh/devops/projects) — 20+ dự án thực hành
- 🔧 [DevOps Tools](https://roadmap.sh/devops/tools) — Danh sách công cụ DevOps

### Kiến thức bổ sung
- 📓 [NotebookLM — DevSecOps Notes](https://notebooklm.google.com/notebook/56450e4e-aad2-41d6-84e2-23b3f3562dde) — Ghi chú kiến thức tổng hợp
- 🐙 [GitHub — DevSecOps Tutorials](https://github.com/NghiaDinh03/DevSecOps_Tutorials_Vietnamese-version) — Repository chính

### Tài liệu DevSecOps
- [OWASP DevSecOps Guideline](https://owasp.org/www-project-devsecops-guideline/)
- [NIST DevSecOps Practices Guide](https://csrc.nist.gov/publications/detail/sp/800-204c/final)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)

---

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng!

### Cách đóng góp

1. **Fork** repository này
2. Tạo **branch** mới: `git checkout -b feature/ten-tinh-nang`
3. **Commit** thay đổi: `git commit -m "feat: mô tả thay đổi"`
4. **Push** lên branch: `git push origin feature/ten-tinh-nang`
5. Tạo **Pull Request**

### Quy ước commit message

```
feat:     Thêm tính năng mới
fix:      Sửa lỗi
docs:     Cập nhật tài liệu
lab:      Thêm/sửa bài lab
refactor: Tái cấu trúc code
```

---

## 📄 Giấy phép

Dự án này được phân phối dưới giấy phép [MIT License](LICENSE).

---

<p align="center">
  <b>Được xây dựng với ❤️ bởi cộng đồng DevOps Việt Nam</b>
  <br/>
  <sub>AI-assisted learning · Open source · Vietnamese first</sub>
</p>