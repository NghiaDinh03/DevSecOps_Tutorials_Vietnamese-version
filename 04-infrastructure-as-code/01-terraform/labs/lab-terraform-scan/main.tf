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
  bucket = "my-company-confidential-data-custom-bucket"
  # LỖI BẢO MẬT: Thiếu cấu hình server_side_encryption_configuration!
}
