# 🧪 Lab 2.2: Multi-stage Build & Docker Hardening Chuẩn CIS (Docker Hardening Lab)

## 📌 Lý do bài thực hành này tồn tại (Why this Lab?)
Theo các báo cáo bảo mật, hơn 80% container image công khai trên Docker Hub chứa các lỗ hổng bảo mật nghiêm trọng ở mức hệ điều hành (OS packages). Ngoài ra, hành vi chạy container mặc định bằng quyền **root** là một rủi ro cực lớn: nếu hacker khai thác được một lỗ hổng thực thi mã từ xa (RCE) trong app, chúng sẽ chiếm quyền root của container và dễ dàng tấn công leo thang (escape container) chiếm quyền điều khiển toàn bộ máy chủ vật lý.
Bài lab này hướng dẫn bạn cách áp dụng **Multi-stage Build** để giảm thiểu tối đa dung lượng ảnh (loại bỏ các công cụ build dư thừa) và sử dụng **Distroless Base Image chạy quyền user non-root** nhằm đáp ứng các tiêu chuẩn an ninh nghiêm ngặt nhất của CIS Benchmarks.

---

## ⚙️ Sơ đồ Quy trình Multi-stage Build
```
[Giai đoạn 1: Build Image]
FROM node:18-alpine AS builder
-> Sao chép code, cài package dependencies (npm install)
-> Thực hiện build sản phẩm

        │  (Chỉ sao chép file kết quả cuối cùng sang)
        ▼
[Giai đoạn 2: Runtime Image]
FROM gcr.io/distroless/nodejs18-debian11
-> Không có Shell (bash/sh), không có công cụ phát triển dư thừa
-> Chạy dưới quyền user: nodejs (UID 1000 - non-root)
```

---

## 🛠️ Các bước Thực hành Chi tiết

### Bước 1: Thiết lập thư mục Lab và Mã nguồn mẫu
Tạo một thư mục lab trống và tạo các file cấu hình tại chỗ:

1. Tạo file định nghĩa package `package.json`:
```json
{
  "name": "docker-hardening-demo",
  "version": "1.0.0",
  "description": "Lab thực hành Docker Hardening chuyên nghiệp",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

2. Tạo file mã nguồn web app đơn giản `server.js`:
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send({
    status: "success",
    message: "🚀 Ứng dụng chạy trên Docker Hardening thành công!",
    user: process.env.USER || "non-root-user",
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Application running on port ${PORT}`);
});
```

### Bước 2: Viết Dockerfile dính lỗi bảo mật (Chưa gia cố)
Trước tiên, hãy viết một `Dockerfile.insecure` theo thói quen thông thường của lập trình viên:
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
# Lỗi bảo mật: Chạy mặc định dưới quyền ROOT và chứa đầy đủ shell (sh, bash) và trình biên dịch dư thừa!
CMD ["node", "server.js"]
```

Build ảnh chưa gia cố:
```bash
docker build -f Dockerfile.insecure -t my-insecure-app:latest .
```
*Hãy kiểm tra dung lượng của ảnh vừa build bằng lệnh:* `docker images | grep my-insecure-app`. Bạn sẽ thấy dung lượng ảnh lên tới **hơn 900MB**!

### Bước 3: Viết Dockerfile tối ưu Multi-stage & Distroless (Đã gia cố)
Bây giờ, hãy tạo tệp `Dockerfile.secure` áp dụng các kỹ thuật gia cố bảo mật cao cấp:
```dockerfile
# Giai đoạn 1: Build & Cài đặt thư viện dependencies
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
# Cài đặt tối giản các dependencies cho Production (bỏ devDependencies)
RUN npm ci --only=production
COPY . .

# Giai đoạn 2: Môi trường chạy Runtime siêu sạch, siêu nhẹ
# Sử dụng Distroless Image của Google - chỉ chứa duy nhất Node.js runtime, không chứa Shell (sh/bash) hay OS Package Manager!
FROM gcr.io/distroless/nodejs18-debian11
WORKDIR /app

# Sao chép các tệp kết quả từ Giai đoạn 1 sang
COPY --from=builder /usr/src/app /app

# Khai báo chạy dưới quyền User Non-root mặc định của Distroless Node.js (UID 1000)
USER 1000

EXPOSE 3000
CMD ["server.js"]
```

Build ảnh đã được hardening:
```bash
docker build -f Dockerfile.secure -t my-secure-app:latest .
```

### Bước 4: So sánh Xác minh kết quả

1. **So sánh Dung lượng Image:**
```bash
docker images | grep my-app
```
*Kết quả:* Ảnh `my-secure-app` chỉ có dung lượng **dưới 170MB** (giảm hơn 80% so với ảnh cũ), giúp tiết kiệm băng thông và giảm thiểu bề mặt tấn công của hệ điều hành.

2. **Kiểm tra quyền chạy (Non-root Check):**
Chạy container từ ảnh bảo mật:
```bash
docker run -d --name test-secure -p 3000:3000 my-secure-app:latest
```
Kiểm tra xem container đang chạy dưới quyền user nào:
```bash
docker exec -it test-secure whoami
```
*Kết quả:* Hệ thống sẽ báo lỗi hoặc in ra UID `1000` thay vì `root`.
Thực tế, do distroless **không chứa shell**, khi bạn cố tình exec vào container:
```bash
docker exec -it test-secure /bin/sh
```
Bạn sẽ nhận ngay lỗi lập tức: `OCI runtime exec failed: exec failed: unable to start container process: exec: "/bin/sh": stat /bin/sh: no such file or directory`.
*Đây là tính năng bảo mật tuyệt vời! Hacker nếu có khai thác được app cũng không thể mở shell để điều khiển container.*

### Bước 5: Dọn dẹp môi trường
```bash
docker rm -f test-secure
```

---

## 🎯 Tổng kết Bài học
Qua bài thực hành này, bạn đã:
*   Sử dụng thành thạo kỹ thuật **Multi-stage Build** để tối ưu hóa Dockerfile.
*   Ứng dụng thành công **Google Distroless Image** để loại bỏ hoàn toàn Shell và các package dư thừa.
*   Thiết lập chạy dưới quyền **User non-root (UID 1000)** giúp cô lập an toàn container, ngăn chặn triệt để tấn công leo thang đặc quyền.
*   Đáp ứng 100% các tiêu chuẩn an ninh container nghiêm ngặt nhất.
