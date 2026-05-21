terraform {
  required_version = ">= 1.0.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# Khởi tạo một Docker Network ảo
resource "docker_network" "private_network" {
  name = "devsecops-tf-network"
}

# Khởi tạo một Docker Image Nginx
resource "docker_image" "nginx_image" {
  name         = "nginx:1.25-alpine"
  keep_locally = false
}

# Khởi tạo một Docker Container chạy Nginx
resource "docker_container" "nginx_container" {
  image = docker_image.nginx_image.image_id
  name  = "devsecops-tf-nginx"

  ports {
    internal = 80
    external = 8080
  }

  networks_advanced {
    name = docker_network.private_network.name
  }

  labels {
    label = "environment"
    value = "production"
  }
}

# Trả về địa chỉ và thông tin truy cập sau khi tạo
output "container_name" {
  value       = docker_container.nginx_container.name
  description = "Tên của Container vừa tạo"
}

output "nginx_url" {
  value       = "http://localhost:8080"
  description = "URL truy cập ứng dụng web Nginx"
}
