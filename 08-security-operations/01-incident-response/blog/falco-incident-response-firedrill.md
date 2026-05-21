# 🚨 Ứng Phó Sự Cố Thời Gian Thực Với Falco: Phát Hiện Và Cô Lập Container Bị Hack

*   **Tác giả gốc:** Sysdig Engineering & CNCF Security Working Group
*   **Dịch thuật & Biên soạn:** Đội ngũ DevSecOps Tutorials (Vietnamese version)
*   **Liên kết bài viết gốc:** [Sysdig Blog - Container Incident Response with Falco](https://sysdig.com/blog/container-incident-response-falco/)

---

## 📌 Giới thiệu

Trong mô hình bảo mật truyền thống, chúng ta thường tập trung nhiều vào các chốt chặn tĩnh ở giai đoạn CI/CD như quét mã nguồn (SAST) hay quét ảnh container (SCA). Tuy nhiên, trên thực tế, hacker vẫn có thể khai thác các lỗ hổng chưa được công bố (Zero-Day vulnerabilities) hoặc lỗ hổng logic ứng dụng để vượt qua các chốt chặn này và đột nhập thành công vào container đang chạy ở môi trường Production.

Lúc này, một câu hỏi sống còn đặt ra cho đội ngũ DevSecOps: **Làm thế nào để phát hiện và ngăn chặn cuộc tấn công TRONG THỜI GIAN THỰC (Runtime Security) trước khi hacker kịp leo thang đặc quyền hoặc đánh cắp database?**

Bài viết này hướng dẫn chi tiết quy trình **Diễn tập ứng phó sự cố (SecOps Firedrill)** sử dụng công cụ giám sát runtime an ninh đám mây danh tiếng **CNCF Falco** kết hợp **Falcosidekick** để tự động phát hiện, gửi cảnh báo và cô lập ngay lập tức container bị xâm hại.

---

## ⚙️ Tổng Quan Kiến Trúc Hệ Thống Diễn Tập (Firedrill Architecture)

Hệ thống diễn tập được thiết kế khép kín bằng Docker-first để đảm bảo an toàn tuyệt đối:
1.  **Falco Container:** Chạy trực tiếp trên nhân Linux của máy host, sử dụng công nghệ **eBPF (Extended Berkeley Packet Filter)** để giám sát toàn bộ các cuộc gọi hệ thống (system calls) từ tất cả các container.
2.  **Target Container:** Một ứng dụng web giả lập dính lỗ hổng bảo mật.
3.  **Hacker Activity:** Kẻ tấn công khai thác lỗi và cố tình chạy lệnh mở Terminal (`/bin/bash` hoặc `/bin/sh`) trong Target Container để phá hoại.
4.  **Falco Detection:** Falco lập tức bắt được sự kiện gọi lệnh hệ thống mở terminal trái phép, sinh cảnh báo và gửi về **Falcosidekick**.
5.  **Active Response (Phản ứng chủ động):** Falcosidekick kích hoạt một Webhook tự động chạy kịch bản cô lập (Quarantine) hoặc xóa sổ (Kill) container bị hack ngay lập tức trong vòng 1 giây.

```
+--------------------+                 +---------------+                 +-----------------+
|  Hacker mở Shell  | --(Syscall)-->  | CNCF Falco   | --(Alert)-----> | Falcosidekick   |
|  ở Target Container|                 | (eBPF Kernel) |                 |                 |
+--------------------+                 +---------------+                 +-----------------+
          ^                                                                       |
          |                                                                   (Webhook)
          |                                                                       v
          +--------------- Tiêu diệt / Cô lập Container <----------------- Script Phản Ứng
```

---

## 🛠️ Quy Trình Triển Khai Thực Chiến 4 Bước

---

### Bước 1: Viết Luật Falco Tùy Biến Phát Hiện Mở Terminal Trong Container
Falco hoạt động dựa trên các bộ quy tắc (rules) định nghĩa bằng cú pháp YAML cực kỳ trực quan. Chúng ta sẽ viết một luật để phát hiện hành vi mở shell Terminal bên trong container ở môi trường production.

*Tạo tệp cấu hình quy tắc tùy biến `falco_rules.local.yaml`:*
```yaml
- rule: Terminal Spawned in Production Container
  desc: Phát hiện hành vi mở shell tương tác trái phép bên trong container production
  condition: >
    spawned_process 
    and container.id != host 
    and proc.name in (bash, sh, zsh, ksh, ash) 
    and container.image.repository != "nicolaka/netshoot"
  output: >
    CẢNH BÁO BẢO MẬT: Phát hiện hành vi mở terminal tương tác trong container! 
    (user=%user.name user_uuid=%user.uid command=%proc.cmdline container_id=%container.id image=%container.image.repository)
  priority: CRITICAL
  tags: [security, runtime, shell, firedrill]
```
*Giải thích điều kiện lọc (`condition`):*
*   `spawned_process`: Có một tiến trình mới được sinh ra trong hệ thống.
*   `container.id != host`: Tiến trình này chạy bên trong một container chứ không phải trên máy host.
*   `proc.name in (bash, sh...)`: Tên tiến trình là một trong các trình dịch lệnh Terminal phổ biến.
*   `container.image.repository != ...`: Bỏ qua ảnh netshoot (đây là ảnh chứa các công cụ debug mà SRE thường chủ động dùng để gỡ lỗi).

---

### Bước 2: Khởi Dựng Môi Trường Lab Bằng Docker Compose
Chúng ta sẽ dựng toàn bộ hệ thống gồm Falco, Falcosidekick và ứng dụng target dính lỗ hổng.

*Tạo tệp tin cấu hình `docker-compose.yml`:*
```yaml
version: '3.8'

services:
  # 1. Dịch vụ Falco chạy dưới quyền ưu tiên cao để đọc syscall từ kernel máy host
  falco:
    image: falcosecurity/falco:0.37.0
    container_name: falco
    privileged: true
    user: root
    # Chia sẻ các kernel socket và filesystem từ máy host để giám sát
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /dev:/host/dev
      - /proc:/host/proc:ro
      - /boot:/host/boot:ro
      - /lib/modules:/host/lib/modules:ro
      - /usr:/host/usr:ro
      - /etc:/host/etc:ro
      - ./falco_rules.local.yaml:/etc/falco/rules.d/falco_rules.local.yaml:ro
      - ./falco.yaml:/etc/falco/falco.yaml:ro
    environment:
      - FALCO_BPF_PROBE="" # Sử dụng chế độ eBPF
    restart: always

  # 2. Falcosidekick chịu trách nhiệm nhận cảnh báo từ Falco và phân phối webhook
  falcosidekick:
    image: falcosecurity/falcosidekick:2.28.0
    container_name: falcosidekick
    ports:
      - "2801:2801"
    environment:
      - WEBHOOK_ADDRESS=http://active-responder:5000/respond
    depends_on:
      - falco
    restart: always

  # 3. Target Container giả lập ứng dụng Web dính lỗ hổng
  target-app:
    image: nginx:alpine
    container_name: vulnerable-target-app
    ports:
      - "8080:80"
    restart: always

  # 4. Active-Responder: Script tự động nhận webhook và tiêu diệt container bị tấn công
  active-responder:
    image: python:3.11-slim
    container_name: active-responder
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock # Cho phép script tương tác trực tiếp với Docker socket để kill container
    entrypoint: >
      python3 -c "
      from flask import Flask, request;
      import subprocess;
      app = Flask(__name__);
      @app.route('/respond', methods=['POST'])
      def respond():
          data = request.json;
          container_id = data.get('output_fields', {}).get('container.id');
          image = data.get('output_fields', {}).get('container.image.repository');
          if container_id and image == 'nginx':
              print(f'MỐI ĐE DỌA PHÁT HIỆN! Tiến hành tiêu diệt container nhiễm độc: {container_id}');
              subprocess.run(['docker', 'rm', '-f', container_id]);
          return 'OK', 200;
      if __name__ == '__main__':
          app.run(host='0.0.0.0', port=5000)
      "
    depends_on:
      - falcosidekick
```

---

### Bước 3: Cấu Hình Output Cho Falco
Chúng ta cần cấu hình để Falco gửi log cảnh báo dạng JSON về cổng API của Falcosidekick.

*Tạo tệp cấu hình cấu hình `falco.yaml` tối giản:*
```yaml
rules_file:
  - /etc/falco/falco_rules.yaml
  - /etc/falco/rules.d/falco_rules.local.yaml

# Bật cơ chế xuất log ra Falcosidekick qua giao thức HTTP POST
json_output: true
http_output:
  enabled: true
  url: "http://falcosidekick:2801/"
```

---

### Bước 4: Thực Hành Diễn Tập Tấn Công Và Chứng Kiến Cơ Chế Tự Vệ

1.  **Khởi động phòng lab:**
    ```bash
    docker compose up -d
    ```
2.  **Mô phỏng Hacker đột nhập thành công và mở shell terminal tương tác:**
    ```bash
    # Hacker thực thi lệnh truy cập trái phép vào container
    docker exec -it vulnerable-target-app /bin/sh
    ```
3.  **Điều gì xảy ra ở phía hậu trường?**
    *   **Giây thứ 0.1:** `Falco` phát hiện lệnh gọi hệ thống `/bin/sh` bên trong container `vulnerable-target-app` có ID cụ thể.
    *   **Giây thứ 0.3:** `Falco` sinh log JSON gửi tới `Falcosidekick`.
    *   **Giây thứ 0.5:** `Falcosidekick` kích hoạt Webhook gọi tới `active-responder`.
    *   **Giây thứ 0.8:** `Active-responder` nhận ID container và ra lệnh trực tiếp cho Docker daemon: `docker rm -f <container_id>`.
    *   **Kết quả:** Hacker lập tức bị ngắt kết nối Terminal đột ngột. Container bị tiêu diệt hoàn toàn. Một container mới sẽ được hệ thống tự động sinh lại tự động (self-healing) hoàn toàn sạch sẽ.

---

## 💎 Ý Nghĩa Và Tầm Quan Trọng Của Diễn Tập An Ninh Runtime

1.  **Chuyển đổi từ Phòng thủ Thụ động sang Chủ động (Active Defense):** Thay vì chỉ thu thập log và ngồi chờ kiểm toán sau khi vụ tấn công đã xảy ra và dữ liệu đã mất, hệ thống chủ động hành động cô lập mối đe dọa ngay trong tích tắc (dưới 1 giây).
2.  **Tự động hóa tuyệt đối (Zero Human Intervention Required):** Trong đêm tối, khi các kỹ sư bảo mật đang ngủ, hệ thống tự động hoạt động như một "Bạch cầu số" tiêu diệt các tế bào nhiễm độc ngay khi phát hiện.
3.  **Học từ thực tế (Hands-on Firedrill):** Việc cho các kỹ sư thực hành diễn tập gieo rắc lỗi và chứng kiến hệ thống tự phản ứng giúp họ nắm lòng quy trình xử lý sự cố thực tế một cách sâu sắc nhất.

---

## 📝 Tổng kết

Ứng phó sự cố thời gian thực bằng Falco là đỉnh cao của kiến trúc DevSecOps hiện đại. Bằng cách làm chủ kỹ thuật eBPF, viết luật tùy biến thông minh và xây dựng các script phản ứng chủ động, bạn đã thiết lập một lá chắn an ninh mạng vững chắc nhất bảo vệ hệ thống production của doanh nghiệp trước mọi cuộc tấn công bất ngờ!
