# Sổ Tay Xử Lý Sự Cố Kubernetes: Quy Trình Từng Bước Khi Pod Không Chạy

*   **Tên bài viết gốc**: A Visual Guide on Troubleshooting Kubernetes Deployments
*   **Nguồn dịch**: [Learnk8s](https://learnk8s.io/) (Nền tảng đào tạo chuyên sâu về Kubernetes uy tín và chất lượng hàng đầu thế giới với các sơ đồ trực quan cực kỳ giá trị)
*   **Dịch thuật**: Dịch chuẩn xác, dễ hiểu sang văn phong chuyên nghiệp của kỹ sư DevSecOps Việt Nam.

---

## 1. Giới thiệu

Khi vận hành ứng dụng trên Kubernetes, một trong những tình huống gây đau đầu nhất cho các kỹ sư DevOps là khi triển khai ứng dụng mới nhưng cụm K8s không thể đưa Pod vào hoạt động bình thường, hoặc Pod liên tục bị sập mà không rõ nguyên nhân. 

Kiến trúc phân tán của Kubernetes với rất nhiều thành phần kết nối logic (Pod, ReplicaSet, Deployment, Service, Ingress) khiến việc tìm ra nguyên nhân gốc rễ (Root Cause) trở nên rất phức tạp nếu bạn chỉ đoán mò.

Bài viết này hệ thống hóa **Quy trình gỡ lỗi K8s từng bước có hệ thống** của Learnk8s giúp bạn nhanh chóng cô lập và xử lý sự cố Pod không chạy.

---

## 2. Quy trình Gỡ lỗi Tổng quan dạng Sơ đồ Tư duy (Mental Model)

Khi phát hiện ứng dụng của bạn gặp lỗi kết nối hoặc không truy cập được, quy trình rà soát logic sẽ đi theo trình tự từ lớp dưới lên lớp trên:

```
[ Ingress ] ➔ [ Service ] ➔ [ Pod (Container) ]
```

1.  **Bước 1:** Kiểm tra xem bản thân **Pod** có thực sự đang chạy ổn định không (`Running`).
2.  **Bước 2:** Nếu Pod chạy tốt, kiểm tra xem **Service** có định tuyến chính xác đến các địa chỉ IP của Pod (`Endpoints`) không.
3.  **Bước 3:** Nếu Service hoạt động bình thường, kiểm tra cấu hình định tuyến bên ngoài của **Ingress**.

---

## 3. Giai đoạn 1: Gỡ lỗi trạng thái Pod không chạy

Chạy câu lệnh kinh điển: `kubectl get pods`. Nếu trạng thái của Pod không phải là `Running 1/1` (hoặc `Ready`), hãy xem xét các lỗi phổ biến sau:

### A. Lỗi 1: `Pending`
*   *Ý nghĩa:* Kubernetes Scheduler đang cố gắng tìm một Node (máy chủ vật lý) phù hợp để đặt Pod lên chạy nhưng thất bại.
*   *Nguyên nhân phổ biến:*
    1.  **Thiếu hụt tài nguyên (Insuficient CPU/Memory):** Tổng tài nguyên yêu cầu (Resources Requests) của Pod vượt quá khả năng trống của tất cả các Node trong cụm.
    2.  **Quy tắc ràng buộc cứng (Node Selector / Affinity / Taints):** Bạn cấu hình Pod chỉ được chạy trên các Node có nhãn đặc biệt (ví dụ: `disk=ssd`), nhưng trong cụm không có Node nào đáp ứng hoặc các Node đang bị đánh dấu chặn quyền chạy (`Taints`).
*   *Cách gỡ lỗi:* Chạy lệnh `kubectl describe pod <tên_pod>` và cuộn xuống mục **Events** ở cuối cùng. Bạn sẽ thấy rõ thông điệp giải thích từ Scheduler (ví dụ: `0/3 nodes are available: 3 Insufficient memory.`).

---

### B. Lỗi 2: `ImagePullBackOff` hoặc `ErrImagePull`
*   *Ý nghĩa:* Kubernetes Kubelet trên Node không thể tải (download) Docker Image của ứng dụng về máy được.
*   *Nguyên nhân phổ biến:*
    1.  **Sai tên hoặc sai Tag Image:** Gõ sai lỗi chính tả tên image hoặc phiên bản tag không tồn tại trên registry.
    2.  **Lỗi chứng thực (Authentication Failure):** Image được lưu trữ trong một Registry riêng tư (Private Registry) nhưng bạn chưa khai báo thông tin đăng nhập trong K8s (thiếu cấu hình `imagePullSecrets`).
*   *Cách gỡ lỗi:* Chạy `kubectl describe pod <tên_pod>` để xem nhật ký tải ảnh thô trong mục Events.

---

### C. Lỗi 3: `CrashLoopBackOff`
*   *Ý nghĩa:* Đây là lỗi phổ biến nhất. Pod khởi chạy thành công (nhân container được tạo ra) nhưng tiến trình chính ứng dụng bên trong container **ngay lập tức bị thoát/sập (exit code khác 0)**. Kubernetes cố gắng tự khởi động lại Pod đó, nhưng nó lại tiếp tục sập, tạo ra một vòng lặp vô hạn và K8s buộc phải tăng dần thời gian chờ khởi động lại tiếp theo (Back-off).
*   *Nguyên nhân phổ biến:*
    1.  **Lỗi logic ứng dụng:** Ứng dụng bị sập do lỗi code, thiếu file cấu hình hoặc biến môi trường bắt buộc chưa truyền vào.
    2.  **Không thể kết nối cơ sở dữ liệu:** Ứng dụng khởi động lên, cố gắng kết nối DB nhưng thất bại (do sai IP/Credentials hoặc DB chưa sẵn sàng) và tự ngắt tiến trình.
    3.  **Liveness Probe cấu hình sai:** K8s gửi request kiểm tra sức khỏe, ứng dụng phản hồi quá chậm hoặc sai cổng khiến K8s nghĩ ứng dụng bị treo và ép buộc kill đi tạo lại.
*   *Cách gỡ lỗi:*
    1.  **Xem log ứng dụng:** `kubectl logs <tên_pod>` (hoặc xem log của phiên chạy lỗi trước đó: `kubectl logs <tên_pod> --previous`). Đây là chìa khóa 90% giải quyết lỗi này.
    2.  Kiểm tra cấu hình biến môi trường và file configmount.

---

## 4. Giai đoạn 2: Gỡ lỗi kết nối Service (Pod Running nhưng không có Traffic)

Nếu Pod hiển thị `Running` bình thường nhưng người dùng bên ngoài không thể kết nối vào web, hoặc các dịch vụ khác báo lỗi kết nối:

### A. Kiểm tra Endpoints của Service:
Service trong K8s sử dụng cơ chế **Selectors** (nhãn) để tự động tìm kiếm các Pod phù hợp và gom địa chỉ IP của chúng vào danh sách **Endpoints**.

1.  *Chạy lệnh kiểm tra:*
    ```bash
    kubectl get endpoints <tên_service>
    ```
2.  *Phân tích kết quả:*
    *   Nếu danh sách Endpoints hiển thị là `<none>` hoặc trống rỗng: Nghĩa là Service cấu hình nhãn selector bị sai, không khớp với nhãn định nghĩa trên Pod.
    *   *Giải pháp:* Kiểm tra trường `spec.selector` trong cấu hình YAML của Service và đối chiếu chính xác từng ký tự với trường `metadata.labels` của Pod.

---

### B. Kiểm tra Cổng Mạng (Port Mapping):
Hãy đảm bảo các cổng được cấu hình khớp nối chính xác:

```yaml
kind: Service
spec:
  ports:
    - port: 80         # Cổng Service nghe ngoài mạng
      targetPort: 3000 # Cổng thực tế ứng dụng trong Pod đang nghe
```

*   `targetPort` bắt buộc phải trùng khớp 100% với cổng mà ứng dụng trong container thực tế đang mở (ví dụ: port listen của server NodeJS). Nếu cấu hình sai targetPort, gói tin gửi đến Service sẽ đi vào "ngõ cụt" và kết nối bị treo.

---

## 5. Kết luận

Gỡ lỗi trên Kubernetes là một nghệ thuật đòi hỏi tư duy logic có hệ thống. Bằng cách rà soát cẩn thận theo quy trình từng bước từ lớp Pod (kiểm tra `describe` events và `logs` ứng dụng), đến lớp Service (xác minh `endpoints` nhãn và `targetPort` kết nối), bạn có thể dễ dàng định vị chính xác vị trí phát sinh sự cố, rút ngắn tối đa thời gian downtime hệ thống và đưa ứng dụng trở lại hoạt động bình thường một cách chuyên nghiệp nhất.
