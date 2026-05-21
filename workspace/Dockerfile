# Môi trường thực hành Terminal giả lập chuyên nghiệp cho học viên DevSecOps
FROM alpine:3.18

# Cài đặt các công cụ cơ bản, Git, Docker CLI và Ansible
RUN apk update && apk add --no-cache \
    bash \
    git \
    curl \
    wget \
    unzip \
    openssh-client \
    python3 \
    py3-pip \
    docker-cli \
    ansible \
    ca-certificates

# Cài đặt Terraform (Phiên bản ổn định 1.5.7)
RUN wget https://releases.hashicorp.com/terraform/1.5.7/terraform_1.5.7_linux_amd64.zip && \
    unzip terraform_1.5.7_linux_amd64.zip && \
    mv terraform /usr/local/bin/ && \
    rm terraform_1.5.7_linux_amd64.zip

# Cài đặt tfsec (Quét IaC Security)
RUN wget https://github.com/aquasecurity/tfsec/releases/download/v1.28.1/tfsec-linux-amd64 && \
    chmod +x tfsec-linux-amd64 && \
    mv tfsec-linux-amd64 /usr/local/bin/tfsec

# Cài đặt Gitleaks (Chặn rò rỉ secrets)
RUN wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_linux_x64.tar.gz && \
    tar -zxvf gitleaks_8.18.2_linux_x64.tar.gz && \
    mv gitleaks /usr/local/bin/ && \
    rm gitleaks_8.18.2_linux_x64.tar.gz

# Cài đặt Trivy (Quét container image và vulnerabilities)
RUN wget https://github.com/aquasecurity/trivy/releases/download/v0.45.1/trivy_0.45.1_Linux-64bit.tar.gz && \
    tar -zxvf trivy_0.45.1_Linux-64bit.tar.gz trivy && \
    mv trivy /usr/local/bin/ && \
    rm trivy_0.45.1_Linux-64bit.tar.gz

# Thiết lập thư mục làm việc mặc định và shell bash
WORKDIR /workspace
ENV SHELL=/bin/bash
CMD ["/bin/bash"]
