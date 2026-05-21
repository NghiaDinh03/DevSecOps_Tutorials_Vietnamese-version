package main

# 1. Quy tắc cấm chạy container dưới quyền Root
deny[msg] {
    # Tìm lệnh USER trong Dockerfile
    input[i].Cmd == "user"
    val := input[i].Value
    # Nếu dòng USER chứa chữ root hoặc không có dòng USER nào (mặc định là root)
    val[_] == "root"
    msg := "❌ BẢO MẬT: Phát hiện lỗi cấu hình Dockerfile! CẤM chạy container bằng tài khoản root."
}

# 2. Quy tắc bắt buộc Dockerfile phải có dòng USER khai báo (Tránh bỏ sót user, mặc định sẽ là root)
deny[msg] {
    # Đếm số lượng lệnh USER khai báo trong Dockerfile
    users := [user | input[i].Cmd == "user"; user := input[i].Value]
    count(users) == 0
    msg := "❌ BẢO MẬT: Dockerfile thiếu khai báo USER! Bắt buộc phải cấu hình tài khoản non-root (ví dụ: USER 10001)."
}

# 3. Quy tắc cảnh báo nếu thiếu lệnh HEALTHCHECK (Giảm độ tin cậy vận hành)
warn[msg] {
    # Đếm số lượng lệnh HEALTHCHECK
    healthchecks := [hc | input[i].Cmd == "healthcheck"; hc := input[i].Value]
    count(healthchecks) == 0
    msg := "⚠️ CẢNH BÁO: Dockerfile thiếu khai báo HEALTHCHECK! Khuyến nghị bổ sung để theo dõi sức khỏe container."
}
