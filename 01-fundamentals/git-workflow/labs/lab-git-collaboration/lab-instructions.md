# 🧪 Lab 03: Giả Lập Quy Trình Làm Việc Nhóm & Giải Quyết Xung Đột Mã Nguồn (Git Collaboration & Conflict Resolution)

## 🎯 Mục tiêu bài thực hành
Quy trình làm việc nhóm với Git là kỹ năng sinh tồn của mọi lập trình viên và kỹ sư DevOps. Trong bài thực hành local độc lập này, bạn sẽ tự tay đóng vai hai lập trình viên (**John** và **Alice**) để giả lập quy trình cộng tác mã nguồn thực tế và trực tiếp giải quyết xung đột:
*   Khởi tạo một kho lưu trữ Git trung tâm cục bộ (**Bare Git Repository**) đóng vai trò như GitHub/GitLab cục bộ.
*   Thực hiện nhân bản mã nguồn (**Git Clone**) ra hai không gian làm việc độc lập của John và Alice.
*   Thực hiện phân nhánh tính năng (**Feature Branching Strategy**) theo mô hình Gitflow.
*   Tạo lập và đẩy mã nguồn (**Git Commit & Push**) song song lên máy chủ trung tâm.
*   Đối diện và tự tay giải quyết **Xung đột mã nguồn (Merge Conflict)** khi cả hai cùng chỉnh sửa một dòng tệp tin.

---

## 🏗️ Thiết kế Môi trường Lab (Standalone Lab)
Chúng ta dựng một Container Linux cài sẵn **Git**. Bên trong container, chúng ta khởi tạo:
*   `/app/central.git`: Kho lưu trữ trung tâm ở dạng **Bare Repository** (chỉ chứa cơ sở dữ liệu lịch sử đối tượng, không chứa file code chỉnh sửa trực tiếp, tương tự như GitHub server).
*   `/app/john/`: Thư mục làm việc của nhà phát triển John (sau khi clone).
*   `/app/alice/`: Thư mục làm việc của nhà phát triển Alice (sau khi clone).

Tất cả thư mục này được ánh xạ trực tiếp ra thư mục `./workspace/` trên máy thật của bạn để bạn dễ dàng mở bằng VS Code hoặc Notepad để thao tác trực quan!

---

## 🛠️ Các bước thực hiện chi tiết

### 📋 Bước 1: Khởi dựng môi trường Lab bằng Docker Compose
Mở Terminal trên máy host và di chuyển đến thư mục bài lab:
```bash
cd 01-fundamentals/git-workflow/labs/lab-git-collaboration/
```

Khởi chạy cụm lab:
```powershell
docker-compose up -d
```
*Docker sẽ khởi tạo container và tự động tạo thư mục `./workspace/` trên máy thật của bạn.*

---

### 📋 Bước 2: Khởi tạo mã nguồn ban đầu của dự án
Chúng ta truy cập vào shell của Container `git-lab-container` để đóng vai quản trị viên tạo file khởi đầu cho dự án:
```powershell
docker-compose exec git-lab-container sh
```

*(Mọi lệnh tiếp theo sẽ thực thi trong shell của Container).*

1.  **Thiết lập cấu hình định danh cơ bản toàn cục**:
    ```sh
    git config --global user.name "DevSecOps Admin"
    git config --global user.email "admin@devsecops.local"
    git config --global init.defaultBranch main
    ```
2.  **Tạo bản commit đầu tiên và đẩy lên repo trung tâm**:
    ```sh
    # Tạo thư mục tạm để commit code đầu tiên
    mkdir -p /tmp/init-project && cd /tmp/init-project
    git init
    
    # Tạo file giao diện tĩnh ban đầu
    echo "<h1>Welcome to DevSecOps App</h1>" > index.html
    
    # Thực hiện commit
    git add index.html
    git commit -m "chore: initial commit with index.html"
    
    # Đẩy mã nguồn lên bare repo trung tâm
    git remote add origin /app/central.git
    git push -u origin main
    ```

---

### 📋 Bước 3: Nhân bản dự án về hai không gian làm việc
Bây giờ, hai lập trình viên John và Alice sẽ cùng nhân bản (clone) dự án từ repo trung tâm về thư mục làm việc riêng của mình:

```sh
# John clone mã nguồn
git clone /app/central.git /app/john

# Alice clone mã nguồn
git clone /app/central.git /app/alice
```

---

### 📋 Bước 4: John phát triển tính năng đổi màu nền (Nhánh Feature)
Chúng ta sẽ đóng vai **John** truy cập vào thư mục của John để viết code:
```sh
cd /app/john
# Cấu hình danh tính riêng của John
git config user.name "John"
git config user.email "john@devsecops.local"

# Tạo và chuyển sang nhánh tính năng mới
git checkout -b feature/blue-theme
```

John sửa đổi file `index.html` (thay đổi màu nền thành màu xanh). Hãy gõ lệnh ghi đè nội dung file:
```sh
echo "<h1 style='color: blue;'>Welcome to DevSecOps App - Blue Theme</h1>" > index.html
```

John thực hiện commit và đẩy code lên máy chủ:
```sh
git add index.html
git commit -m "feat: change main header to blue theme"
git push origin feature/blue-theme
```
*Tính năng của John đã được đẩy lên server an toàn.*

---

### 📋 Bước 5: Alice cũng sửa đổi song song (Gặp lỗi Xung đột)
Bây giờ, ta chuyển sang đóng vai **Alice** truy cập vào thư mục của Alice để làm việc:
```sh
cd /app/alice
# Cấu hình danh tính riêng của Alice
git config user.name "Alice"
git config user.email "alice@devsecops.local"

# Tạo và chuyển sang nhánh tính năng của Alice
git checkout -b feature/green-theme
```

Alice không biết John đang làm màu xanh, Alice muốn đổi tiêu đề thành màu xanh lá cây (Green). Hãy gõ lệnh ghi đè file:
```sh
echo "<h1 style='color: green;'>Welcome to DevSecOps App - Green Theme</h1>" > index.html
```

Alice thực hiện commit:
```sh
git add index.html
git commit -m "feat: change main header to green theme"
```

Trước khi merge vào nhánh chính, Alice được yêu cầu chuyển về nhánh `main`, cập nhật code mới nhất từ máy chủ về (nơi John đã đẩy code lên trước đó) và thực hiện gộp nhánh.
```sh
# Alice chuyển về main và kéo code mới nhất
git checkout main
git pull origin main

# Lỗi giả lập: Do bare repo chưa merge nhánh của John vào main, 
# để tạo ra xung đột trực tiếp trên nhánh local, Alice sẽ thực hiện gộp trực tiếp 
# nhánh feature/blue-theme của John vào nhánh feature/green-theme của mình để kiểm tra:
git checkout feature/green-theme
git pull origin feature/blue-theme
```

*Kết quả:* Hệ thống Git lập tức báo động đỏ **Merge Conflict (Xung đột gộp nhánh)**:
```
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

---

### 📋 Bước 6: Tự tay giải quyết xung đột mã nguồn (Conflict Resolution)
Khi xảy ra xung đột, Git sẽ tạm dừng quy trình gộp nhánh và đánh dấu trực tiếp các điểm tranh chấp vào trong file nguồn bằng các ký hiệu đặc biệt.

Hãy xem nội dung file `index.html` của Alice lúc này bằng lệnh `cat`:
```sh
cat index.html
```

*Nội dung file hiển thị:*
```html
<<<<<<< HEAD
<h1 style='color: green;'>Welcome to DevSecOps App - Green Theme</h1>
=======
<h1 style='color: blue;'>Welcome to DevSecOps App - Blue Theme</h1>
>>>>>>> 9a3e2f...
```

> **Cách đọc ký hiệu xung đột Git**:
> *   `<<<<<<< HEAD`: Bắt đầu phần thay đổi của nhánh hiện tại bạn đang đứng (`feature/green-theme` của Alice).
> *   `=======`: Ranh giới phân cách giữa hai bên tranh chấp.
> *   `>>>>>>>`: Kết thúc phần thay đổi của nhánh gộp vào (`feature/blue-theme` của John).

#### Giải quyết xung đột:
Hai lập trình viên thảo luận và quyết định gộp hai ý tưởng: Sử dụng màu xanh biển (Blue) nhưng giữ lại chữ Green Theme để kết hợp. 
Bạn hãy ghi đè nội dung file `index.html` để xóa bỏ hoàn toàn các ký hiệu rác của Git và lưu lại phương án gộp thống nhất cuối cùng:

```sh
echo "<h1 style='color: blue;'>Welcome to DevSecOps App - Combined Theme</h1>" > index.html
```

Đánh dấu tệp tin đã được giải quyết xung đột bằng lệnh `git add` và thực hiện commit hoàn tất quy trình gộp:
```sh
git add index.html
git commit -m "merge: resolve conflict between green and blue themes by combining"
```

Kiểm tra lịch sử commit để thấy sơ đồ gộp nhánh thành công:
```sh
git log --oneline --graph
```

Alice đẩy nhánh đã được giải quyết xung đột lên máy chủ trung tâm an toàn:
```sh
git push origin feature/green-theme
```

---

### 📋 Bước 7: Dọn dẹp môi trường Lab
Gõ `exit` để thoát shell container và chạy lệnh dọn dẹp sạch sẽ máy host của bạn:
```powershell
docker-compose down -v
```
*(Thư mục workspace chứa code John/Alice và bare repo đã được xóa sạch hoàn hảo).*
