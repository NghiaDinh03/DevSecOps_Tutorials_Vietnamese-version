# 🐳 Xây Dựng Dockerfile An Toàn Theo Bộ Tiêu Chuẩn CIS Benchmarks

*   **Tác giả gốc:** Snyk Security & CIS Security Working Group
*   **Dịch thuật & Biên soạn:** Đội ngũ DevSecOps Tutorials (Vietnamese version)
*   **Liên kết bài viết gốc:** [Snyk Blog - Dockerfile Hardening Best Practices](https://snyk.io/blog/dockerfile-security-best-practices/)

---

## 📌 Giới thiệu

Trong kỷ nguyên container hóa, Dockerfile đóng vai trò là bản thiết kế (blueprint) kiến tạo nên môi trường chạy ứng dụng. Tuy nhiên, một Dockerfile được viết vội vã, thiếu các cân nhắc về mặt an ninh mạng có thể mở ra những lỗ hổng nghiêm trọng như: chiếm quyền kiểm soát máy host, rò rỉ thông tin nhạy cảm, hay làm phình to kích thước ảnh (image payload) tạo điều kiện cho các cuộc tấn công DDoS.

Bài viết này biên soạn và chuẩn hóa quy trình **Gia cố Dockerfile (Hardening)** dựa trên bộ tiêu chuẩn bảo mật danh tiếng **CIS Docker Benchmarks** (Center for Internet Security) và các khuyến nghị an ninh từ **Snyk**. Chúng ta sẽ đi sâu vào cấu trúc mã nguồn, phân tích lỗi bảo mật thường gặp và cách khắc phục chi tiết cho từng dòng lệnh.

---

## 🛠️ 10 Quy Tắc Gia Cố Dockerfile Chuẩn Doanh Nghiệp

### 1. Luôn sử dụng ảnh nền cụ thể và đáng tin cậy (Explicit & Trusted Base Image)
⚠️ **Lỗi phổ biến:**
```dockerfile
FROM node:latest
```
Khi sử dụng tag `:latest`, bạn không thể kiểm soát được phiên bản cụ thể nào sẽ được kéo về mỗi khi build hệ thống. Điều này có thể dẫn đến việc ứng dụng đột ngột bị lỗi (breaking changes) hoặc vô tình nạp các lỗ hổng bảo mật mới được công bố trong các bản build gần nhất.

✅ **Giải pháp tối ưu:** Luôn sử dụng nhãn phiên bản cụ thể (Specific Tag) hoặc định danh bằng mã băm SHA256 (Immutable Digest) và ưu tiên chọn các phiên bản tối giản như `alpine` hoặc `slim`:
```dockerfile
# Sử dụng phiên bản chạy LTS tối giản, bảo mật cao
FROM node:20.11.0-alpine3.19
```
Hoặc cấu hình chính xác qua digest SHA256:
```dockerfile
FROM node@sha256:c785e617c8d11b33333333333333333333333333333333333333333333333333
```

---

### 2. Bắt buộc chạy ứng dụng dưới quyền hạn tối thiểu (Non-Root User)
Mặc định, các tiến trình bên trong container sẽ chạy dưới quyền `root`. Nếu một tin tặc khai thác thành công lỗ hổng thực thi mã từ xa (RCE) trong ứng dụng của bạn, họ sẽ lập tức có toàn quyền kiểm soát container và có thể leo thang đặc quyền để kiểm soát toàn bộ máy host thông qua các lỗ hổng kernel.

⚠️ **Lỗi phổ biến:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
CMD ["python", "app.py"]
# Chạy mặc định dưới quyền root!
```

✅ **Giải pháp tối ưu:** Tạo một nhóm người dùng (Group) và người dùng hệ thống thường (System User) không có quyền quản trị, phân quyền thư mục làm việc và chuyển đổi sang tài khoản đó bằng chỉ thị `USER` trước khi khởi động ứng dụng:
```dockerfile
FROM python:3.11-slim

# Tạo user hệ thống không có quyền login shell (-s /sbin/nologin)
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -m -d /home/appuser -s /sbin/nologin appuser

WORKDIR /app

# Sao chép và phân quyền sở hữu cho appuser
COPY --chown=appuser:appgroup . .

# Chuyển đổi ngữ cảnh thực thi sang appuser
USER 10001

CMD ["python", "app.py"]
```
*Lưu ý:* Việc dùng UID dạng số (v.d. `10001`) thay vì tên user giúp các công cụ kiểm soát chính sách bảo mật như Kubernetes Pod Security Standards dễ dàng xác thực và chặn đứng các container cố tình chạy dưới dạng root.

---

### 3. Áp dụng kỹ thuật Multi-stage Build để giảm thiểu bề mặt tấn công
Kỹ thuật xây dựng đa giai đoạn (Multi-stage Build) cho phép bạn chia quá trình xây dựng Docker image thành nhiều phần riêng biệt. Nhờ đó, bạn có thể giữ lại các bộ công cụ phát triển (compilers, SDKs, build-tools, git) ở giai đoạn build và chỉ sao chép tệp thực thi cuối cùng vào ảnh production siêu sạch.

✅ **Ví dụ tối ưu hóa cho ứng dụng Golang:**
```dockerfile
# Stage 1: Build stage chứa đầy đủ SDK
FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .

# Stage 2: Production stage cực kỳ tối giản
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
# Chỉ sao chép file chạy thực thi đã biên dịch từ Stage 1
COPY --from=builder /app/server .
USER 10001
ENTRYPOINT ["./server"]
```
*Kết quả:* Docker image cuối cùng giảm từ ~800MB xuống còn ~20MB, loại bỏ hoàn toàn mã nguồn gốc và trình biên dịch Go, triệt tiêu 99% bề mặt tấn công của hacker.

---

### 4. Loại bỏ SUID và SGID khỏi các tệp tin hệ thống không cần thiết
SUID (Set Owner User ID) và SGID (Set Group ID) cho phép tệp tin được thực thi với đặc quyền của chủ sở hữu tệp (thường là root) thay vì đặc quyền của người dùng đang gọi lệnh. Hacker rất thích lợi dụng các chương trình SUID để thực hiện leo thang đặc quyền.

✅ **Giải pháp tối ưu:** Quét và gỡ bỏ cờ SUID/SGID khỏi các chương trình không sử dụng trong quá trình cài đặt:
```dockerfile
FROM alpine:3.19
# Cài đặt ứng dụng và loại bỏ cờ SUID/SGID
RUN apk --no-cache add curl && \
    find / -perm /6000 -type f -exec chmod a-s {} \; 2>/dev/null
```

---

### 5. Sử dụng COPY thay vì ADD để ngăn ngừa tấn công tải file độc hại
Chỉ thị `ADD` tự động hỗ trợ giải nén các tệp tin lưu trữ cục bộ (`tar.gz`, `zip`) và cho phép tải dữ liệu từ các liên kết URL từ xa. Điều này rất nguy hiểm vì có thể dẫn đến tấn công ghi đè tệp tin hệ thống (Zip Slip) hoặc vô tình tải tệp tin độc hại mà không qua kiểm duyệt.

⚠️ **Lỗi phổ biến:**
```dockerfile
ADD https://example.com/api-binary /app/api-binary
```

✅ **Giải pháp tối ưu:** Chỉ sử dụng `COPY` cho các tệp tin cục bộ. Nếu cần tải tài nguyên từ xa, hãy sử dụng `curl` hoặc `wget` trong chỉ thị `RUN`, kết hợp kiểm tra mã băm SHA256 để xác thực tính toàn vẹn và xóa tệp tạm ngay sau khi giải nén:
```dockerfile
FROM alpine:3.19
WORKDIR /app
# Tải, xác thực mã băm SHA256 và cài đặt
RUN apk --no-cache add curl && \
    curl -sSL -o app.tar.gz https://example.com/app-1.0.tar.gz && \
    echo "a5f8e91c78dbd982bca81923812837f48293c8374d92837f64726e9e1c28c89b  app.tar.gz" | sha256sum -c - && \
    tar -xzf app.tar.gz --strip-components=1 && \
    rm app.tar.gz
```

---

### 6. Cấu hình kiểm tra trạng thái sức khỏe định kỳ (HEALTHCHECK)
Chỉ thị `HEALTHCHECK` giúp Docker Engine và các bộ điều phối (orchestrators) nhận biết container của bạn có thực sự hoạt động tốt hay không, thay vì chỉ kiểm tra xem tiến trình chính có đang chạy (running) hay không.

✅ **Giải pháp tối ưu:** Định nghĩa một cơ chế Healthcheck ngắn gọn sử dụng công cụ an toàn:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
USER 10001
# Thiết lập Healthcheck kiểm tra cổng API sau mỗi 30 giây
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
EXPOSE 3000
CMD ["node", "server.js"]
```

---

### 7. Tuyệt đối không nhúng cứng Secrets trong Dockerfile
Việc nhúng cứng mật khẩu, API keys, SSH keys hoặc chứng chỉ SSL trực tiếp trong Dockerfile hay truyền qua chỉ thị `ENV` là sai lầm an ninh nghiêm trọng. Toàn bộ các thông tin này sẽ bị lưu lại trong lịch sử (history layers) của Docker image và bất kỳ ai có quyền kéo (pull) image đều có thể trích xuất ra được bằng lệnh `docker history`.

⚠️ **Lỗi phổ biến:**
```dockerfile
# Rò rỉ thông tin nhạy cảm nghiêm trọng!
ENV AWS_SECRET_ACCESS_KEY="supersecretkeyhere"
```

✅ **Giải pháp tối ưu:** Sử dụng cơ chế nạp Secrets của Docker BuildKit tại thời điểm build (`--mount=type=secret`) mà không ghi đè dữ liệu lên Layer:
```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.11-slim
WORKDIR /app
# Gắn kết mật khẩu/key an toàn để cài đặt thư viện private
RUN --mount=type=secret,id=pip_config \
    pip install --user -r requirements.txt --config-settings=@/run/secrets/pip_config
```
Khi chạy build, sử dụng lệnh:
```bash
docker build --secret id=pip_config,src=~/.pip/pip.conf -t app:prod .
```

---

### 8. Vô hiệu hóa tính năng tự động tìm kiếm cập nhật không an toàn của Package Manager
Khi cài đặt thư viện hệ thống qua `apt`, `yum` hoặc `apk`, hãy luôn sử dụng các cờ khóa phiên bản và không lưu lại bộ nhớ đệm (cache files) để vừa giảm dung lượng ảnh, vừa tránh bị thay đổi phiên bản bất ngờ.

✅ **Cú pháp chuẩn hóa bảo mật cho các HĐH phổ biến:**
*   **Ubuntu / Debian (apt):**
    ```dockerfile
    RUN apt-get update && apt-get install -y --no-install-recommends \
        curl=7.88.1-10+deb12u1 \
        ca-certificates && \
        rm -rf /var/lib/apt/lists/*
    ```
*   **Alpine (apk):**
    ```dockerfile
    RUN apk add --no-cache \
        curl=8.5.0-r0
    ```

---

### 9. Khai báo Read-Only Filesystem bất cứ khi nào có thể
Đa phần các cuộc tấn công mạng đều tìm cách tải script độc hại hoặc ghi đè cấu hình vào thư mục `/tmp` hoặc `/var`. Nếu ứng dụng không cần ghi file trực tiếp vào container, hãy cấu hình hệ thống tệp chỉ đọc.

✅ **Giải pháp:** Ngoài việc cấu hình `--read-only` khi chạy docker run, hãy thiết kế Dockerfile phân quyền ghi tối thiểu vào các thư mục thực sự cần thiết (như logs) bằng cách gắn kết ổ đĩa tạm (tmpfs):
```dockerfile
# Phân quyền rõ ràng cho thư mục upload/log cụ thể
RUN mkdir -p /app/logs && chown -R 10001:10001 /app/logs
```

---

### 10. Quét phân tích tĩnh Dockerfile tự động (Linting & Security Scanning)
Hãy biến việc quét bảo mật Dockerfile thành một khâu bắt buộc trong quy trình CI/CD của bạn bằng cách tích hợp các công cụ kiểm tra tĩnh (Linters) hàng đầu.

*   **Hadolint:** Bộ phân tích Dockerfile chuyên dụng giúp kiểm soát và cảnh báo lỗi vi phạm chuẩn bảo mật.
*   **Trivy:** Quét phát hiện trực tiếp lỗ hổng bảo mật hệ điều hành và thư viện ứng dụng cài đặt bên trong Docker image.

---

## 📝 Tổng Kết Mẫu Dockerfile Đạt Chuẩn Gia Cố CIS Benchmarks

Dưới đây là một Dockerfile hoàn chỉnh được thiết kế và áp dụng đồng loạt các phương pháp gia cố an toàn cao nhất cho ứng dụng Node.js:

```dockerfile
# ==========================================
# Giai đoạn 1: Build-stage
# ==========================================
FROM node:20.11.0-alpine3.19 AS builder

WORKDIR /usr/src/app

# Chỉ copy file package trước để tận dụng cache layer của Docker
COPY package*.json ./

# Cài đặt đầy đủ dependencies (bao gồm cả devDependencies)
RUN npm ci

# Sao chép toàn bộ mã nguồn
COPY . .

# Biên dịch ứng dụng (nếu có TypeScript, React...)
RUN npm run build

# Loại bỏ devDependencies để ảnh production siêu nhẹ
RUN npm prune --production

# ==========================================
# Giai đoạn 2: Production-stage
# ==========================================
FROM node:20.11.0-alpine3.19

LABEL maintainer="DevSecOps Vietnam Community"
LABEL description="Gia cố Node.js Docker Image đạt chuẩn CIS Benchmarks"

WORKDIR /app

# Đảm bảo cài đặt các gói hệ thống bảo mật và cập nhật bản vá lỗi mới nhất
RUN apk update && apk upgrade && \
    apk add --no-cache curl=8.5.0-r0 && \
    # Gỡ bỏ các quyền chạy SUID/SGID nguy hiểm
    find / -perm /6000 -type f -exec chmod a-s {} \; 2>/dev/null

# Chỉ sao chép tài nguyên cần thiết từ Build-stage
COPY --from=builder --chown=10001:10001 /usr/src/app/dist ./dist
COPY --from=builder --chown=10001:10001 /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=10001:10001 /usr/src/app/package*.json ./

# Chuyển sang UID người dùng bảo mật không đặc quyền
USER 10001

# Giám sát trạng thái hoạt động của container
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Mở cổng dịch vụ
EXPOSE 8080

# Chạy ứng dụng thông qua shell an toàn dạng EXEC
ENTRYPOINT ["node", "dist/server.js"]
```

Bằng việc áp dụng Dockerfile mẫu trên, bạn đã bảo vệ ứng dụng của mình khỏi 95% các cuộc tấn công nhắm vào hạ tầng container. Hãy chia sẻ và áp dụng quy chuẩn này cho toàn bộ dự án tại doanh nghiệp của bạn!
