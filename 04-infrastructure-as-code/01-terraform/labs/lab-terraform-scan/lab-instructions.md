# 🧪 Lab 4.2: Quét Lỗ Hổng Cấu Hình Sai IaC Cục Bộ (Trivy IaC & tfsec Scanner Lab)

## 📌 Lý do bài thực hành này tồn tại (Why this Lab?)
Với xu hướng Infrastructure as Code (IaC), hạ tầng đám mây được định nghĩa hoàn toàn bằng phần mềm (mã nguồn Terraform, Ansible, CloudFormation...). Tuy nhiên, nếu một lập trình viên cấu hình sai an ninh (ví dụ: mở cổng quản trị SSH 22 công khai cho toàn thế giới `0.0.0.0/0`, hoặc không bật mã hóa ổ đĩa lưu trữ), khi chạy lệnh `terraform apply`, lỗi cấu hình nghiêm trọng này sẽ lập tức được nhân bản lên Cloud, tạo ra các lỗ hổng chết người để hacker đột nhập.
Bài lab này hướng dẫn bạn cách áp dụng các công cụ quét tĩnh IaC bảo mật hàng đầu thế giới (**Trivy IaC** và **tfsec**) để tự động phân tích và phát hiện các lỗi cấu hình sai trong mã nguồn Terraform ngay trên máy cá nhân trước khi triển khai thực tế.

---

## ⚙️ Sơ đồ Quy trình Quét IaC (Shift-Left IaC Security)
```
[Terraform Code: main.tf] ──► [Chạy quét: trivy config . / tfsec .]
                                         │
                                         ├─► Phát hiện lỗi SG mở 22 / Unencrypted S3?
                                         │   └─► [CẢNH BÁO ĐỎ] Chi tiết dòng code & cách khắc phục
                                         │
                                         └─► Đã sửa đổi an toàn ──► [Cho phép deploy]
```

---

## 🛠️ Các bước Thực hành Chi tiết

### Bước 1: Chuẩn bị mã nguồn Terraform dính lỗi bảo mật cố ý
Tạo một thư mục trống và tạo tệp cấu hình Terraform sau để mô phỏng lỗi cấu hình sai an ninh nghiêm trọng của developer:

Tạo tệp `main.tf`:
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Lỗi 1: Cấu hình Security Group mở cổng SSH 22 công khai cho toàn internet!
resource "aws_security_group" "insecure_sg" {
  name        = "insecure-ssh-sg"
  description = "Security group mo cong SSH cong khai cho ca the gioi"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # LỖI BẢO MẬT: Mở SSH cho mọi địa chỉ IP!
  }
}

# Lỗi 2: Khởi tạo Storage Bucket không bật tính năng mã hóa dữ liệu!
resource "aws_s3_bucket" "unencrypted_bucket" {
  bucket = "my-company-confidential-data-bucket"
  # LỖI BẢO MẬT: Thiếu cấu hình server_side_encryption_configuration!
}
```

### Bước 2: Quét bảo mật hạ tầng bằng Trivy IaC Scanner
Chúng ta sẽ sử dụng công cụ Trivy quen thuộc chạy thông qua Docker để quét trực tiếp mã nguồn Terraform tại chỗ:

```bash
# Thực hiện quét cấu hình IaC trong thư mục hiện tại
docker run --rm -v $(pwd):/apps aquasec/trivy:latest config /apps
```
*Lưu ý: Bạn cũng có thể cài đặt trực tiếp CLI Trivy để chạy cực nhanh không cần qua Docker.*

**Quan sát kết quả quét của Trivy:**
Màn hình sẽ hiển thị các cảnh báo đỏ cực kỳ chi tiết:
- **Lỗi AWS Security Group**: Phân loại **HIGH** (Mức độ nghiêm trọng cao), chỉ rõ tệp `main.tf` dòng 16: *"Security group rule allows ingress from public internet to port 22"*.
- **Lỗi AWS S3 Bucket**: Phân loại **HIGH**, chỉ rõ tệp `main.tf` dòng 28: *"Bucket does not have server-side encryption enabled"*.

### Bước 3: Quét bảo mật hạ tầng bằng tfsec (Công cụ chuyên dụng)
Bên cạnh Trivy, **tfsec** của Aqua Security là công cụ quét chuyên biệt hàng đầu được cộng đồng Terraform vô cùng tin dùng.
Chạy quét bằng Docker tfsec:
```bash
docker run --rm -v $(pwd):/src aquasec/tfsec:latest /src
```

**Quan sát kết quả:**
tfsec in ra báo cáo cực kỳ đẹp mắt và dễ hiểu, cung cấp chi tiết:
- ID của lỗi bảo mật (ví dụ: `aws-vpc-no-public-ingress-sgr`, `aws-s3-enable-bucket-encryption`).
- Dòng code vi phạm thực tế.
- Giải pháp đề xuất để vá lỗi và đường link tài liệu giải thích chi tiết.

### Bước 4: Sửa đổi mã nguồn (Gia cố bảo mật)
Bây giờ, hãy đóng vai trò là kỹ sư DevSecOps tiến hành gia cố lại file cấu hình `main.tf` cho an toàn và tuân thủ quy chuẩn:

Cập nhật lại file `main.tf`:
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Đã gia cố 1: Chỉ cho phép các IP nội bộ công ty truy cập cổng SSH
resource "aws_security_group" "secure_sg" {
  name        = "secure-ssh-sg"
  description = "Security group gioi han truy cap SSH cho IP Noi Bo"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # ĐÃ VÁ: Chỉ cho phép dải mạng nội bộ!
  }
}

# Đã gia cố 2: Bật mã hóa tự động cho S3 Bucket
resource "aws_s3_bucket" "secure_bucket" {
  bucket = "my-company-confidential-data-bucket"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sse" {
  bucket = aws_s3_bucket.secure_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256" # ĐÃ VÁ: Bật mã hóa dữ liệu!
    }
  }
}
```

### Bước 5: Quét lại để xác nhận
Chạy lại lệnh quét của tfsec:
```bash
docker run --rm -v $(pwd):/src aquasec/tfsec:latest /src
```
*Kết quả:* Hệ thống sẽ báo xanh hoàn toàn (**No problems detected!**). Hạ tầng của bạn đã sẵn sàng và tuyệt đối an toàn để triển khai.

---

## 🎯 Tổng kết Bài học
Qua bài thực hành này, bạn đã:
*   Hiểu rõ các lỗi cấu hình sai an ninh IaC phổ biến nhất trên đám mây (AWS Security Group, S3 Bucket).
*   Làm chủ hai công cụ quét tĩnh IaC hàng đầu là **Trivy IaC** và **tfsec**.
*   Thực hiện thành công quy trình **Shift-Left IaC Security** - quét phát hiện và vá lỗi cấu hình sai ngay từ khâu viết code hạ tầng, ngăn chặn triệt để rò rỉ an ninh trước khi deploy.
