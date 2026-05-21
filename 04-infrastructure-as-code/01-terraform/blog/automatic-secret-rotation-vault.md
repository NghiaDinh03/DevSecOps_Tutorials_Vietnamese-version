# 🔑 Xoay Vòng Khóa Tự Động Cho Hạ Tầng IaC Với HashiCorp Vault

*   **Tác giả gốc:** HashiCorp Enterprise Solutions Architect & Medium DevOps
*   **Dịch thuật & Biên soạn:** Đội ngũ DevSecOps Tutorials (Vietnamese version)
*   **Liên kết bài viết gốc:** [HashiCorp Blog - Dynamic Secrets with Terraform](https://www.hashicorp.com/blog/dynamic-secrets-with-terraform-and-vault)

---

## 📌 Giới thiệu

Khi triển khai hạ tầng dạng mã nguồn (Infrastructure as Code - IaC) bằng **Terraform**, một trong những thách thức an ninh mạng lớn nhất là quản lý thông tin xác thực đám mây (Cloud Credentials). 

⚠️ **Thực tế nguy hiểm:** Rất nhiều doanh nghiệp đang nhúng cứng (hardcode) các khóa truy cập tĩnh như `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` trong mã nguồn IaC hoặc lưu trữ dưới dạng plain-text trong tệp tin `terraform.tfvars`. Nếu các khóa này bị lộ (v.d. vô tình đẩy lên GitHub hoặc server CI/CD bị tấn công), tin tặc sẽ lập tức chiếm quyền kiểm soát toàn bộ hạ tầng đám mây của doanh nghiệp.

Để giải quyết triệt để rủi ro này, bài viết này hướng dẫn chi tiết phương pháp **Xoay vòng khóa tự động (Automatic Secret Rotation)** thông qua việc tích hợp **Terraform** với **HashiCorp Vault** để cấp phát động các khóa ngắn hạn (Dynamic Secrets) tự động thu hồi khi hoàn thành tác vụ.

---

## 💡 Ý Tưởng Cốt Lõi: Từ Khóa Tĩnh Sang Khóa Động

Thay vì cấp cho Terraform một tài khoản IAM User tĩnh có thời hạn vĩnh viễn, chúng ta sẽ cấu hình để:
1.  Terraform gửi truy vấn xác thực tới HashiCorp Vault.
2.  Vault kết nối trực tiếp tới AWS API để tạo nhanh một tài khoản IAM User **tạm thời** với phân quyền tối thiểu cần thiết cho hạ tầng.
3.  Vault trả về cặp Keys tạm thời (thời gian sống - TTL chỉ có 1 giờ) cho Terraform sử dụng để chạy `plan` hoặc `apply`.
4.  Khi hết thời hạn TTL, Vault sẽ **tự động xóa bỏ** tài khoản IAM User tạm thời này trên AWS. Không còn bất kỳ rò rỉ khóa nào ở môi trường tĩnh.

```
+-----------+                    +------------------+                    +---------------+
|           | -- 1. Yêu cầu ---> |                  | -- 2. Tạo User --> |               |
| Terraform |                    | HashiCorp Vault  |                    | AWS Cloud API |
|           | <--- 4. Trả Keys - |                  | <--- 3. Trả Keys - |               |
+-----------+                    +------------------+                    +---------------+
      |                                                                          |
      +------------------------ 5. Chạy IaC Deploy ----------------------------->|
```

---

## 🛠️ Quy Trình 3 Bước Triển Khai Thực Chiến

Để chạy bài lab này, chúng ta cần một cụm **HashiCorp Vault** đang chạy ổn định. Bạn có thể kích hoạt nhanh Vault bằng `docker compose` cục bộ theo hướng dẫn tại Module 7.

---

### Bước 1: Cấu hình AWS Secrets Engine trên HashiCorp Vault
Trước hết, chúng ta cần kích hoạt và cấu hình AWS Secrets Engine trên Vault để nó có quyền tương tác tạo tài khoản IAM tạm thời trên AWS.

Chạy các lệnh CLI của Vault dưới quyền admin:
```bash
# 1. Kích hoạt AWS secrets engine
vault secrets enable aws

# 2. Cấu hình thông tin tài khoản Admin của Vault để kết nối với AWS
# (Khóa này được lưu tuyệt đối an toàn trong Vault và không lộ ra ngoài)
vault write aws/config/root \
    access_key=AKIAIOSFODNN7EXAMPLE \
    secret_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY \
    region=ap-southeast-1

# 3. Tạo một Vault Role định nghĩa quyền hạn mà Terraform sẽ nhận được.
# Ở đây ta cấp quyền tạo EC2 và S3 cho Terraform
vault write aws/roles/terraform-role \
    credential_type=iam_user \
    policy_document=-<<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "s3:*"
      ],
      "Resource": "*"
    }
  ]
}
EOF
```
*Lưu ý:* Mặc định, thời gian sống (Lease TTL) của khóa động tạo ra bởi Role này là 1 giờ (`3600s`). Bạn có thể điều chỉnh qua tham số `default_lease_ttl="1h" max_lease_ttl="2h"`.

---

### Bước 2: Viết mã nguồn Terraform tích hợp Vault Provider
Bây giờ, chúng ta sẽ cấu hình Terraform sử dụng **Vault Provider** để kéo cặp keys tạm thời trước khi gọi **AWS Provider**.

*Tạo tệp tin cấu hình IaC `main.tf`:*
```hcl
# 1. Khai báo các Providers yêu cầu
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 3.0"
    }
  }
}

# 2. Cấu hình kết nối tới HashiCorp Vault
# Địa chỉ và token của Vault sẽ được nạp qua biến môi trường an toàn khi chạy
provider "vault" {
  # Địa chỉ của Vault Server (v.d. http://127.0.0.1:8200)
  # Khuyến nghị chạy qua HTTPS trên môi trường Production
}

# 3. Truy vấn cặp Keys tạm thời từ AWS Secrets Engine của Vault
data "vault_aws_access_credentials" "dynamic_creds" {
  backend = "aws"
  role    = "terraform-role"
}

# 4. Khởi tạo AWS Provider sử dụng cặp Keys tạm thời vừa truy vấn được
provider "aws" {
  region     = "ap-southeast-1"
  access_key = data.vault_aws_access_credentials.dynamic_creds.access_key
  secret_key = data.vault_aws_access_credentials.dynamic_creds.secret_key
  token      = data.vault_aws_access_credentials.dynamic_creds.security_token
}

# 5. Định nghĩa tài nguyên thử nghiệm (Ví dụ tạo một Bucket S3)
resource "aws_s3_bucket" "secure_bucket" {
  bucket = "devsecops-vietnam-dynamic-bucket"
  
  tags = {
    Environment = "Dev"
    CreatedBy   = "Terraform Dynamic Credentials"
  }
}
```

---

### Bước 3: Thực thi quy trình Deploy IaC An Toàn
Để Terraform có thể kết nối tới Vault, kỹ sư hoặc hệ thống CI/CD cần được cấp một tài khoản/token có quyền truy cập vào endpoint `aws/creds/terraform-role`.

Chạy quy trình deploy an toàn bằng các lệnh CLI:
```bash
# 1. Khai báo địa chỉ Vault và Token xác thực tạm thời của bạn
export VAULT_ADDR="http://127.0.0.1:8200"
export VAULT_TOKEN="hvs.CAESIL7..."

# 2. Khởi tạo thư mục làm việc Terraform
terraform init

# 3. Lên phương án triển khai
# Terraform sẽ tự động kết nối Vault để lấy AWS Keys tạm thời và kiểm tra hạ tầng
terraform plan

# 4. Thực thi triển khai hạ tầng đám mây
terraform apply -auto-approve
```

---

## 💎 Lợi Ích Vượt Trội Của Phương Pháp Khóa Động

1.  **Triệt tiêu hoàn toàn Khóa tĩnh (No Static Credentials):** Không còn nỗi lo rò rỉ khóa AWS trên GitHub hay mã nguồn. Khóa chỉ tồn tại trong bộ nhớ RAM tạm thời của Terraform trong quá trình chạy và tự hủy ngay sau đó.
2.  **Khóa tự động hủy (Automatic Revocation):** Ngay cả khi hacker chiếm được file log của CI/CD chứa cặp Keys tạm thời, các khóa này cũng sẽ vô giá trị chỉ sau 1 giờ khi Vault ra lệnh thu hồi trên AWS.
3.  **Giảm tải vận hành (Zero Rotation Overhead):** Đội ngũ Security không cần phải viết script định kỳ hàng tháng để chạy xoay vòng khóa và cập nhật thủ công vào các server nữa. Toàn bộ quy trình diễn ra tự động ở mức độ API.
4.  **Kiểm toán toàn diện (Rich Auditing Log):** Mọi yêu cầu sinh khóa của Terraform đều được Vault ghi nhật ký chi tiết: ai yêu cầu, lúc nào, với IP nào, tạo ra User nào trên AWS. Giúp đội ngũ SOC dễ dàng điều tra khi xảy ra sự cố.

---

## 📝 Tổng kết

Tích hợp HashiCorp Vault để xoay vòng khóa tự động là một trong những chuẩn bảo mật nghiêm ngặt nhất cho quy trình tự động hóa hạ tầng (IaC Hardening). Việc loại bỏ hoàn toàn các cấu hình khóa tĩnh giúp doanh nghiệp của bạn tự tin triển khai hàng ngàn tài nguyên điện toán đám mây một cách an toàn và chuyên nghiệp nhất!
