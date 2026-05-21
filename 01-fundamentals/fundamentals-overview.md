# 🎯 Module 01: Nền Tảng DevOps (DevOps Fundamentals)

> **"Một ngôi nhà cao tầng không thể đứng vững trên một nền móng yếu ớt."** 
> Trước khi bước vào thế giới phức tạp của Containerization, CI/CD, Infrastructure as Code, hay Kubernetes, một kỹ sư DevSecOps bắt buộc phải làm chủ các kỹ năng nền tảng: Sử dụng hệ điều hành Linux, hiểu bản chất mạng máy tính, có khả năng viết mã tự động hóa (scripting), và kiểm soát lịch sử mã nguồn (Git) một cách an toàn.

---

## 📌 Tại sao DevSecOps cần Nền tảng này?

1.  **Hệ điều hành Linux (Linux OS)**: Hơn 90% container chạy trên môi trường Linux. Bạn không thể gia cố bảo mật container nếu không hiểu về phân quyền tập tin (File Permissions), kiến trúc phân cấp thư mục (Filesystem Hierarchy Standard), và cách quản lý tiến trình.
2.  **Mạng máy tính (Networking)**: Mọi cuộc tấn công mạng đều bắt đầu từ luồng traffic. Nắm vững mô hình TCP/IP, DNS, Routing, và các cổng giao thức (Ports) giúp bạn thiết lập tường lửa và cô lập mạng an toàn.
3.  **Tự động hóa (Scripting & Automation)**: Triết lý của DevOps là tự động hóa mọi tác vụ lặp đi lặp lại. Viết mã kịch bản Bash/Python giúp bạn tự động hóa việc quét mã độc, backup dữ liệu và giám sát hệ thống.
4.  **Quản lý mã nguồn (Git Workflow)**: Git là "nguồn gốc của sự thật" (Source of Truth). Toàn bộ hạ tầng và mã nguồn của bạn nằm trên Git. Bảo vệ mã nguồn khỏi rò rỉ khóa bí mật (secrets leaks) và quản lý phân nhánh an toàn là bước đầu tiên của Shift-left Security.

---

## 🗺️ Bản đồ Lộ trình học tập (Roadmap)

```mermaid
graph TD
    A[Bắt đầu: Nền tảng DevOps] --> B(Linux File System & Permissions)
    B --> C(Linux Process Management)
    C --> D(Mạng máy tính: TCP/IP, DNS, Routing)
    D --> E(Viết mã kịch bản Bash & Python)
    E --> F(Tự động hóa Cronjob)
    F --> G(Kiến trúc lưu trữ Git & SSH Keys)
    G --> H(Chiến lược phân nhánh Gitflow bảo mật)
    H --> I[Hoàn thành Module 1: Đủ năng lực lên Module 2]
```

---

## 📂 Danh sách các bài học & Thực hành chi tiết

Bạn sẽ được dẫn dắt qua 3 Sub-module lớn từ lý thuyết sâu đến các bài Lab thực hành local tự thao tác 100%:

### 1. Sub-module 01: [linux-networking](file:///e:/VSC/DevSecOps_Tutorials_Vietnamese-version/01-fundamentals/linux-networking/linux-networking-guide.md) (Hệ điều hành & Mạng máy tính)
*   **Lý thuyết chuyên sâu**: Cấu trúc thư mục Linux, phân quyền nâng cao (Chown, Chmod, SUID/SGID), cơ chế phân giải tên miền (DNS Resolution), quá trình bắt tay 3 bước (TCP Three-way Handshake).
*   🧪 **Thực hành Lab**: [Phân tích & Xử lý sự cố mạng nội bộ (Linux Networking Troubleshooting)](file:///e:/VSC/DevSecOps_Tutorials_Vietnamese-version/01-fundamentals/linux-networking/labs/lab-linux-troubleshooting/lab-instructions.md).

### 2. Sub-module 02: [scripting-automation](file:///e:/VSC/DevSecOps_Tutorials_Vietnamese-version/01-fundamentals/scripting-automation/scripting-automation-guide.md) (Tự động hóa bằng Bash/Python)
*   **Lý thuyết chuyên sâu**: Cú pháp kịch bản Bash (Variables, Loops, Conditions), lập trình tự động hóa Python cơ bản, và cơ chế lập lịch tác vụ tự động (Cron Utility/Crontab).
*   🧪 **Thực hành Lab**: [Viết script tự động sao lưu cấu hình & Lập lịch định kỳ an toàn](file:///e:/VSC/DevSecOps_Tutorials_Vietnamese-version/01-fundamentals/scripting-automation/labs/lab-auto-backup-script/lab-instructions.md).

### 3. Sub-module 03: [git-workflow](file:///e:/VSC/DevSecOps_Tutorials_Vietnamese-version/01-fundamentals/git-workflow/git-workflow-guide.md) (Quản lý mã nguồn & Gitflow bảo mật)
*   **Lý thuyết chuyên sâu**: Cơ chế lưu trữ nội bộ của Git (Git Internals - Blobs, Trees, Commits), xác thực an toàn bằng SSH Keys, chiến lược phân nhánh bảo mật (Gitflow branching strategy) và ký số Commit bằng GPG.
*   🧪 **Thực hành Lab**: [Giả lập quy trình làm việc nhóm & Xử lý xung đột mã nguồn (Git Collaboration & Conflict Resolution)](file:///e:/VSC/DevSecOps_Tutorials_Vietnamese-version/01-fundamentals/git-workflow/labs/lab-git-collaboration/lab-instructions.md).

---

## 📚 Tài nguyên Đọc thêm Chất lượng cao (Recommended Blog Readings)

Để mở rộng thế giới quan và học hỏi kinh nghiệm thực chiến từ các chuyên gia DevOps hàng đầu, dưới đây là các bài blog kinh điển đạt hàng ngàn lượt tương tác và đánh giá cao:

### 1. 🇻🇳 [Git Internals: Dưới Lớp Vỏ Bọc Của Git](https://viblo.asia/p/git-internals-duoi-lop-vo-boc-cua-git-RnB5p7vOlPG)
*   **Nguồn**: Cộng đồng Viblo.asia (Đạt 15k+ views, 200+ upvotes).
*   **Giá trị thực tiễn**: Bài viết đi sâu giải mã cơ chế tổ chức file của Git trong thư mục ẩn `.git/objects`. Tác giả giải thích trực quan cách Git lưu trữ dữ liệu dưới dạng các con trỏ băm SHA-1 thông qua 3 đối tượng cốt lõi: **Blobs** (lưu nội dung file), **Trees** (tổ chức cấu trúc thư mục) và **Commits** (ghi nhận lịch sử phiên bản). Đọc bài này giúp bạn hiểu tại sao Git lại nhanh, an toàn và "không bao giờ thực sự xóa dữ liệu của bạn".

### 2. 🇬🇧 [Linux Performance Analysis in 60 Seconds (Phân tích Hiệu năng Linux trong 60 Giây)](https://netflixtechblog.com/linux-performance-analysis-in-60-seconds-34d0ed0fa688)
*   **Tác giả**: Brendan Gregg (Senior Performance Architect tại Netflix & tác giả sách Systems Performance nổi tiếng).
*   **Bản dịch & Tóm tắt cốt lõi**: Bài viết kinh điển này hướng dẫn 10 câu lệnh Linux cơ bản nhưng cực kỳ mạnh mẽ để chuẩn đoán 90% các sự cố về CPU, RAM, Disk I/O và Network trên server chỉ trong vòng 1 phút đầu tiên:
    1.  `uptime`: Xem tải trọng hệ thống (Load Average) trong 1, 5 và 15 phút.
    2.  `dmesg | tail`: Đọc logs nhân kernel để phát hiện lỗi phần cứng, oom-killer (hệ thống tự động kill process ngốn RAM).
    3.  `vmstat 1`: Giám sát bộ nhớ ảo, số tiến trình chờ chạy (r) và I/O block (b) theo mỗi giây.
    4.  `mpstat -P ALL 1`: Phân tích tải trọng chi tiết trên từng nhân CPU để xem có bị mất cân bằng tải hay không.
    5.  `pidstat 1`: Xác định chính xác tiến trình (PID) nào đang ngốn tài nguyên CPU nhất.
    6.  `iostat -xz 1`: Xem chi tiết tốc độ đọc/ghi (r/w/s) và độ trễ phản hồi của ổ cứng.
    7.  `free -m`: Kiểm tra dung lượng RAM thực tế đang dùng, trống và bộ đệm (buffers/cache).
    8.  `sar -n DEV 1`: Giám sát lưu lượng mạng (gửi/nhận gói tin) trên các card mạng trong thời gian thực.
    9.  `sar -n TCP,ETCP 1`: Phân tích số lượng kết nối TCP mới, kết nối bị lỗi hoặc bị reset.
    10. `top`: Cái nhìn tổng quan thời gian thực về hoạt động của toàn bộ hệ thống.
*   **Tại sao nên đọc?** Giúp rèn luyện tư duy phản ứng nhanh khi máy chủ Linux gặp sự cố, tránh việc gõ lệnh vô định.
