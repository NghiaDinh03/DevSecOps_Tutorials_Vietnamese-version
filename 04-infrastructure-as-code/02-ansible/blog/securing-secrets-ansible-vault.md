# 🔑 Quản Lý Biến Nhạy Cảm An Toàn Với Ansible Vault Trong Môi Trường Doanh Nghiệp

*   **Tác giả gốc:** Red Hat Ansible Security Team & Medium Engineering
*   **Dịch thuật & Biên soạn:** Đội ngũ DevSecOps Tutorials (Vietnamese version)
*   **Liên kết bài viết gốc:** [Red Hat - Ansible Vault Guide](https://docs.ansible.com/ansible/latest/vault_guide/index.html)

---

## 📌 Giới thiệu

Trong kỷ nguyên hạ tầng tự động hóa, **Ansible** là một trong những công cụ quản lý cấu hình (Configuration Management) được sử dụng rộng rãi nhất thế giới nhờ kiến trúc phi đại lý (agentless) cực kỳ đơn giản và mạnh mẽ. Tuy nhiên, để tự động hóa cấu hình hệ thống, Ansible Playbooks cần phải sử dụng rất nhiều thông tin nhạy cảm như: mật khẩu cơ sở dữ liệu, SSH keys, API tokens, chứng chỉ SSL.

⚠️ **Lỗi bảo mật kinh điển:** Rất nhiều DevOps engineers lưu trữ trực tiếp các biến nhạy cảm dạng plain-text trong thư mục `group_vars` hoặc `host_vars` và đẩy trực tiếp lên kho Git nội bộ của công ty. Điều này mở ra rủi ro rò rỉ thông tin cực kỳ cao, biến Git thành kho chứa secrets lộ thiên cho hacker khai thác.

Để giải quyết vấn đề này, Ansible cung cấp một bộ công cụ mã hóa tích hợp cực kỳ mạnh mẽ mang tên **Ansible Vault**. Bài viết này hướng dẫn chi tiết cách áp dụng Ansible Vault để mã hóa an toàn các biến nhạy cảm theo chuẩn doanh nghiệp.

---

## 🔒 Ansible Vault Hoạt Động Như Thế Nào?

**Ansible Vault** cho phép bạn mã hóa toàn bộ tệp tin YAML hoặc các chuỗi ký tự đơn lẻ (variables) bằng thuật toán mã hóa đối xứng cực kỳ an toàn **AES-256 (Advanced Encryption Standard)**. 

Chỉ những ai sở hữu mật khẩu Vault (Vault Password) mới có thể giải mã và đọc được các giá trị này tại thời điểm Ansible thực thi (runtime). Khi đẩy mã nguồn lên Git, nội dung file của bạn sẽ hoàn toàn được bảo vệ dưới dạng một chuỗi ký tự mã hóa vô hại.

---

## 🛠️ Quy Trình Sử Dụng Ansible Vault Trong 4 Bước

---

### Bước 1: Mã hóa toàn bộ tệp cấu hình chứa Secrets
Giả sử chúng ta có một tệp chứa các biến cấu hình nhạy cảm cho dịch vụ web mang tên `secrets.yml`.

*Nội dung ban đầu của tệp `secrets.yml` (Plain-text):*
```yaml
db_password: "super_secure_postgres_pass_123"
api_key: "api_prod_key_xyz_987"
```

Để mã hóa tệp này, chúng ta sử dụng lệnh `ansible-vault encrypt`:
```bash
ansible-vault encrypt secrets.yml
```
Hệ thống sẽ yêu cầu bạn nhập mật khẩu mã hóa (Vault Password) hai lần.

*Nội dung tệp `secrets.yml` sau khi chạy mã hóa thành công:*
```yaml
$ANSIBLE_VAULT;1.1;AES256
37326462376662366162393264626139366633633866656230303861613233346538356161343764
3337626330366432323062316462396338613430336639650a316262336339303332306465326561
66613361663032336531393933613038666131343465616531646337376337353934333637386361
6137663266393564630a613562303730333466393939316537333633636263356238613666613531
```
Bây giờ, bạn có thể tự tin đẩy tệp `secrets.yml` này lên GitHub/GitLab mà không sợ bị lộ secrets.

---

### Bước 2: Mã hóa một biến đơn lẻ (Encrypt String)
Nếu bạn không muốn mã hóa toàn bộ tệp tin (làm cho việc đọc cấu hình các biến không nhạy cảm khác gặp khó khăn), Ansible Vault hỗ trợ mã hóa duy nhất một giá trị biến (Variable-level encryption).

Chạy lệnh mã hóa một chuỗi ký tự:
```bash
ansible-vault encrypt_string 'super_secure_postgres_pass_123' --name 'db_password'
```
Nhập mật khẩu Vault, lệnh sẽ trả về cấu hình mã hóa định dạng YAML:

```yaml
db_password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          6365386165646162343233333333333333333333333333333333333333333333
          3861386138613861386138613861386138613861386138613861386138613861
```
Bạn chỉ cần copy đoạn text mã hóa trên dán trực tiếp vào file `group_vars/all.yml` thông thường. Các biến khác như `http_port: 80` vẫn có thể đọc bằng mắt thường một cách tiện lợi.

---

### Bước 3: Cách gọi và sử dụng Secrets trong Playbook
Khi viết Playbook, chúng ta vẫn gọi tên biến như bình thường. Ansible sẽ tự động giải mã biến đó trong bộ nhớ RAM khi chạy.

*Tạo tệp cấu hình Playbook `deploy.yml`:*
```yaml
- name: Triển khai ứng dụng Web an toàn
  hosts: webservers
  vars_files:
    - secrets.yml # Khai báo file chứa biến đã được mã hóa ở Bước 1
  tasks:
    - name: Cài đặt và cấu hình Database Connection String
      template:
        src: app_config.j2
        dest: /app/config.json
        mode: '0600' # Chỉ cho phép quyền đọc ghi tối thiểu
```

---

### Bước 4: Thực thi Playbook kết hợp nạp mật khẩu Vault
Khi chạy Playbook, chúng ta phải cung cấp mật khẩu để Ansible có thể giải mã tệp cấu hình.

*Cách 1: Nhập mật khẩu thủ công qua dòng lệnh (Interactive):*
```bash
ansible-playbook deploy.yml --ask-vault-pass
```

*Cách 2: Nạp mật khẩu tự động qua tệp tin bảo mật (Thích hợp cho CI/CD Automation):*
1.  Lưu mật khẩu Vault vào một tệp tin bảo mật cục bộ (v.d. `.vault_pass`) nằm trên máy chủ chạy CI/CD.
2.  **Tuyệt đối thêm tệp `.vault_pass` vào `.gitignore` để tránh đẩy lên Git.**
3.  Chạy lệnh chỉ định tệp mật khẩu:
```bash
ansible-playbook deploy.yml --vault-password-file .vault_pass
```

---

## 💎 5 Nguyên Tắc Vàng Khi Sử Dụng Ansible Vault Chuẩn Enterprise

1.  **Luôn tách biệt biến nhạy cảm và biến thông thường (Secrets separation):**
    *   Tạo file `vars/vars.yml` cho các cấu hình bình thường (port, hostname, paths).
    *   Tạo file `vars/vault.yml` chứa các thông tin nhạy cảm đã được mã hóa bằng Vault.
2.  **Sử dụng biến môi trường nạp tệp mật khẩu trong CI/CD:**
    *   Thay vì truyền tham số CLI, bạn có thể thiết lập biến môi trường `ANSIBLE_VAULT_PASSWORD_FILE` trỏ tới đường dẫn file password để Ansible tự động nhận diện.
3.  **Áp dụng cơ chế Multi-Vault Passwords cho các môi trường khác nhau:**
    *   Ansible hỗ trợ gán ID cho mật khẩu Vault (`--vault-id`). Nhờ đó bạn có thể dùng mật khẩu khác nhau cho môi trường Staging và Production:
    ```bash
    ansible-playbook deploy.yml --vault-id dev@.vault_pass_dev --vault-id prod@.vault_pass_prod
    ```
4.  **Bảo vệ tệp mật khẩu cục bộ nghiêm ngặt:**
    *   Nếu lưu tệp `.vault_pass` trên server, hãy phân quyền chặt chẽ chỉ cho phép user chạy Ansible đọc được file: `chmod 600 .vault_pass`.
5.  **Không bao giờ in các giá trị giải mã ra log (No Debugging Secrets):**
    *   Tránh sử dụng module `debug` để in nội dung các biến nhạy cảm ra màn hình CLI. Khi chạy template, đảm bảo phân quyền file đích an toàn (`mode: 0600`).

---

## 📝 Tổng kết

Làm chủ Ansible Vault giúp bạn nâng tầm bảo mật quy trình quản lý cấu hình hệ thống lên chuẩn công nghiệp. Tận dụng sức mạnh của thuật toán AES-256 giúp toàn bộ tài nguyên cấu hình của bạn được an toàn tuyệt đối trước nguy cơ rò rỉ mã bảo mật trên các kho lưu trữ công cộng!
