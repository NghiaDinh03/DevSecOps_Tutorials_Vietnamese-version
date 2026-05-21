# 🕸️ Sub-module 03: Mạng An toàn Zero-Trust với Service Mesh Istio (Zero Trust & mTLS)

Sub-module này cung cấp kiến thức nền tảng và nâng cao về **Zero-Trust Network** — chiến lược bảo mật không tin tưởng tuyệt đối, triển khai trên hạ tầng Kubernetes thông qua công nghệ **Service Mesh Istio** và cơ chế mã hóa giao tiếp **mTLS**.

---

## 1. Triết lý Zero-Trust: Lâu đài & Hào nước vs Zero Trust

Trong bảo mật truyền thống, người ta sử dụng mô hình **Bảo vệ Chu vi (Perimeter Security)** hay còn gọi là mô hình *"Lâu đài và Hào nước (Castle and Moat)"*:
*   **Cách thức**: Xây dựng tường lửa (Firewall) thật vững chắc xung quanh hệ thống. Ai ở ngoài firewall là xấu, ai đã đi qua được firewall vào mạng nội bộ là tốt và được tin tưởng hoàn toàn.
*   **Điểm yếu**: Nếu hacker xâm nhập thành công vào duy nhất 1 máy chủ bên trong (v.d: qua phishing email), chúng sẽ thoải mái di chuyển ngang (**Lateral Movement**) để tấn công toàn bộ các máy chủ khác mà không gặp bất kỳ chốt chặn nào.

**Zero-Trust Network (Mạng Không tin tưởng)** thay đổi hoàn toàn điều đó bằng nguyên tắc cốt lõi:
> **"Không bao giờ tin tưởng, Luôn luôn xác minh" (Never Trust, Always Verify)**

Dù tiến trình nằm bên trong cùng một mạng nội bộ hay cùng một Node Kubernetes, mỗi yêu cầu giao tiếp giữa các Microservice đều bắt buộc phải được:
1.  **Xác thực nguồn gốc (Authentication)** thông qua mật mã hóa.
2.  **Mã hóa đường truyền (Encryption)** đầu-cuối.
3.  **Kiểm soát quyền truy cập tối thiểu (Authorization)** chi tiết.

---

## 2. Service Mesh & Kiến trúc Istio

Để triển khai Zero-Trust cho hàng trăm Microservice mà không bắt buộc lập trình viên phải sửa đổi mã nguồn ứng dụng (viết code SSL/TLS), người ta sử dụng **Service Mesh (Lưới dịch vụ)**, tiêu biểu nhất là **Istio**.

```mermaid
graph TD
    subgraph Control Plane [Bộ Điều khiển - Control Plane]
        Istiod[Istiod<br>Quản lý Key/Cert & Cấu hình]
    </td>
    
    subgraph PodA [Service A Pod]
        AppA[Mã nguồn App A] <-->|localhost| EnvoyA[Envoy Proxy Sidecar]
    end
    
    subgraph PodB [Service B Pod]
        AppB[Mã nguồn App B] <-->|localhost| EnvoyB[Envoy Proxy Sidecar]
    end
    
    EnvoyA -->|Mã hóa mTLS an toàn| EnvoyB
    Istiod -->|Cấu hình & Phân phối Certs| EnvoyA
    Istiod -->|Cấu hình & Phân phối Certs| EnvoyB
    style Istiod fill:#000,stroke:#666,color:#fff
    style EnvoyA fill:#2196f3,stroke:#1565c0,color:#fff
    style EnvoyB fill:#2196f3,stroke:#1565c0,color:#fff
```

### 2.1. Kiến trúc Sidecar Proxy (Envoy)
Istio chia kiến trúc làm hai phần chính:
*   **Data Plane (Mặt phẳng Dữ liệu)**: Sử dụng các proxy siêu nhẹ tên là **Envoy** chạy kèm bên trong cùng một Pod với container ứng dụng (gọi là cơ chế **Sidecar**). Mọi lưu lượng mạng đi vào/đi ra của ứng dụng đều bị Envoy bắt giữ và điều phối.
*   **Control Plane (Mặt phẳng Điều khiển - Istiod)**: Đảm nhận việc quản lý trung tâm, tự động sinh khóa, cấp phát và xoay vòng chứng chỉ số (Certificate Rotation) cung cấp cho các Envoy Proxies dưới dạng gRPC an toàn.

---

## 3. Mã hóa giao tiếp song phương mTLS (Mutual TLS)

Trong giao tiếp HTTPS thông thường, chỉ có Client xác thực Server (v.d: bạn truy cập e-banking và trình duyệt xác thực certificate của ngân hàng).
Với **mTLS (Mutual TLS - TLS song phương)** của Istio:
1.  **Xác thực hai chiều**: Cả hai bên (Service A và Service B) đều phải trình Certificate của mình ra cho đối phương kiểm tra để chứng minh danh tính mật mã (được đại diện bởi **SPIFFE ID** cấp phát bởi Istiod).
2.  **Mã hóa đầu-cuối**: Toàn bộ dữ liệu truyền tải giữa các Pods trên mạng ảo Kubernetes đều được mã hóa bằng thuật toán TLS, hacker cắm sniffer mạng ảo cũng không thể đọc trộm thông tin thô.
3.  **Hoàn toàn tự động**: Lập trình viên viết code HTTP plain-text (`http://service-b`), Envoy Proxy Sidecar của Service A sẽ tự động đánh chặn và nâng cấp lên HTTPS mTLS trước khi gửi đi, Envoy của Service B nhận gói tin, giải mã và trả lại HTTP plain-text cho App B. **Lập trình viên không cần sửa 1 dòng code nào!**

---

## 4. Chính sách bảo mật Istio: PeerAuthentication & AuthorizationPolicy

Istio cung cấp các tài nguyên YAML (Kubernetes Custom Resources) để cấu hình Zero-Trust:

*   **PeerAuthentication**: Thiết lập chế độ mã hóa mạng.
    *   *Chế độ `STRICT`*: Bắt buộc 100% kết nối đi vào Service phải dùng mTLS. Mọi kết nối plain-text thô không mã hóa đều bị chặn đứng ở mức hạ tầng Envoy.
*   **AuthorizationPolicy**: Định nghĩa chi tiết ai được quyền gọi ai.
    *   *Ví dụ một Policy chỉ cho phép duy nhất Service Frontend gọi Service Payment qua phương thức GET ở đường dẫn `/pay`:*
        ```yaml
        apiVersion: security.istio.io/v1beta1
        kind: AuthorizationPolicy
        metadata:
          name: allow-payment-from-frontend
          namespace: prod
        spec:
          selector:
            matchLabels:
              app: payment-service
          action: ALLOW
          rules:
          - from:
            - source:
                principals: ["cluster.local/ns/prod/sa/frontend-service-account"]
            to:
            - operation:
                methods: ["GET"]
                paths: ["/pay"]
        ```

---

## 📚 Tài nguyên Đọc thêm Chất lượng cao (Recommended Blog Readings)

### 🇬🇧 [mTLS in Service Mesh: Under the Hood of Mutual TLS (Giải Mã Cơ Chế mTLS Trong Service Mesh: Khám Phá Chi Tiết Dưới Lớp Vỏ Mutual TLS)](./blog/mtls-service-mesh.md)
*   **Chi tiết**: Bản dịch thuật chuyên sâu 100% tiếng Việt của bài blog uy tín về mTLS từ cộng đồng Istio/Envoy được lưu trữ cục bộ.
*   **Giá trị thực tiễn**: Hiểu rõ sự khác biệt giữa TLS một chiều và mTLS, cơ chế định danh SPIFFE ID, quy trình cấp phát và xoay vòng chứng chỉ qua Istiod (CA) & SDS, và cách iptables đánh chặn lưu lượng mạng.
*   **Liên kết nguồn gốc**: [Istio Blog - Mutual TLS Deep Dive](https://istio.io/latest/docs/concepts/security/)

### 🛡️ [Hiện Thực Hóa Mô Hình Bảo Mật Zero-Trust Trong Kubernetes Bằng Istio Service Mesh](./blog/zero-trust-kubernetes-istio-mesh.md)
*   **Chi tiết**: Hướng dẫn thực tiễn từng bước thiết lập mô hình Zero-Trust cho hệ thống microservices nội bộ bằng Istio Service Mesh trong Kubernetes.
*   **Giá trị thực tiễn**: Hiểu rõ thách thức bảo mật East-West traffic, cách thức kích hoạt mTLS STRICT bắt buộc mã hóa kết nối mạng nội bộ, tạo Service Account để phân tách danh tính, và cấu hình Authorization Policy để cưỡng chế chính sách quyền truy cập tối giản.
*   **Liên kết nguồn gốc**: [Istio.io - Security in Service Mesh](https://istio.io/latest/docs/concepts/security/)

---

## 🚀 Bước tiếp theo
Hãy thực hành bài Lab tự mô phỏng cấu hình Zero-Trust: viết các tệp Manifest định nghĩa chính sách **PeerAuthentication** cấu hình STRICT mTLS và thiết lập chính sách **AuthorizationPolicy** giới hạn quyền gọi API giữa các microservices:

👉 **[Bắt đầu bài Lab thực hành: Istio mTLS](./labs/lab-istio-mtls/lab-instructions.md)**
