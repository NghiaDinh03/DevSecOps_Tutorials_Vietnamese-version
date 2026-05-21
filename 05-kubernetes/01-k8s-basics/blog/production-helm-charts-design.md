# 📦 Thiết Kế Cấu Trúc Helm Chart Đạt Chuẩn Production Cho Ứng Dụng Microservices

*   **Tác giả gốc:** CNCF Kubernetes Special Interest Group & Bitnami Engineering
*   **Dịch thuật & Biên soạn:** Đội ngũ DevSecOps Tutorials (Vietnamese version)
*   **Liên kết bài viết gốc:** [Helm documentation - Best Practices](https://helm.sh/docs/chart_best_practices/)

---

## 📌 Giới thiệu

Khi chuyển dịch ứng dụng lên cụm **Kubernetes**, việc quản lý hàng chục tệp tin cấu hình YAML riêng lẻ (Deployments, Services, Ingresses, ConfigMaps...) cho mỗi dịch vụ sẽ nhanh chóng trở thành cơn ác mộng vận hành. Để chuẩn hóa và tự động hóa quy trình đóng gói ứng dụng, **Helm** - trình quản lý gói của Kubernetes (Kubernetes Package Manager) - đã trở thành bộ công cụ không thể thiếu.

Tuy nhiên, việc thiết kế một **Helm Chart** đạt chuẩn sẵn sàng vận hành thực tế (**Production-Ready**) đòi hỏi nhiều kỹ thuật tối ưu hóa phức tạp: từ cơ chế cấu hình động cho nhiều môi trường (Dev/Staging/Prod), tối ưu hóa tài nguyên phần cứng, cho đến gia cố bảo mật Pod nghiêm ngặt.

Bài viết này chia sẻ các thực tiễn tốt nhất giúp bạn tự thiết kế và cấu trúc Helm Chart chuyên nghiệp theo chuẩn doanh nghiệp.

---

## 📂 Cấu Trúc Thư Mục Helm Chart Chuẩn Doanh Nghiệp

Dưới đây là sơ đồ tổ chức thư mục của một Helm Chart hoàn chỉnh cho ứng dụng microservices:

```
my-app/                   # Thư mục gốc của Helm Chart
├── Chart.yaml            # Khai báo thông tin mô tả (metadata) và phiên bản của Chart
├── values.yaml           # Các tham số cấu hình mặc định (default values)
├── values-staging.yaml   # Cấu hình cụ thể ghi đè cho môi trường Staging
├── values-production.yaml# Cấu hình cụ thể ghi đè cho môi trường Production
├── LICENSE               # Tệp giấy phép sử dụng
├── README.md             # Hướng dẫn chi tiết cách cài đặt và sử dụng
├── templates/            # Thư mục chứa các tệp manifest Kubernetes mẫu
│   ├── _helpers.tpl      # Nơi định nghĩa các hàm dùng chung (named templates)
│   ├── deployment.yaml   # Khai báo Deployment tài nguyên chạy ứng dụng
│   ├── service.yaml      # Khai báo Service định tuyến traffic nội bộ
│   ├── ingress.yaml      # Khai báo Ingress định tuyến traffic từ ngoài vào
│   ├── configmap.yaml    # Khai báo các cấu hình môi trường tĩnh
│   ├── secrets.yaml      # Khai báo các bí mật an toàn (Secrets)
│   └── TESTS/            # Thư mục chứa các script kiểm thử tự động sau deploy
│       └── test-connection.yaml
```

---

## ⚙️ 5 Kỹ Thuật Tối Ưu Hóa Helm Chart Lên Mức Production

---

### 1. Xây dựng cấu trúc `values.yaml` khoa học và phân rã môi trường
Tệp `values.yaml` mặc định chỉ nên chứa các cấu hình chung nhất và an toàn nhất (v.d. chạy 1 replica, cấu hình tài nguyên tối thiểu). 

Đối với các môi trường cụ thể, chúng ta tạo các tệp ghi đè riêng biệt như `values-production.yaml` để nâng cấu hình lên mức tối ưu:
```yaml
# values-production.yaml (Mẫu cấu hình môi trường Production thực tế)
replicaCount: 3

# Kích hoạt tính năng tự động giãn nở số lượng Pods theo tải thực tế
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

# Cấu hình cấu trúc tài nguyên chặt chẽ
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 200m
    memory: 256Mi

# Cấu hình phân tán Pod trên nhiều Node vật lý khác nhau để tránh sập toàn hệ thống
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchExpressions:
        - key: app.kubernetes.io/name
          operator: In
          values:
          - my-app
      topologyKey: "kubernetes.io/hostname"
```
Khi cài đặt lên Production, sử dụng lệnh:
```bash
helm install my-app-release ./my-app -f values.yaml -f values-production.yaml --namespace production
```

---

### 2. Định nghĩa Named Templates tái sử dụng trong `_helpers.tpl`
Để tránh việc lặp đi lặp lại các đoạn mã cấu hình nhãn (labels) hay định dạng tên tài nguyên trong các file manifest, chúng ta định nghĩa các hàm dùng chung trong tệp `_helpers.tpl`.

*Định nghĩa hàm trong `templates/_helpers.tpl`:*
```yaml
{{/*
Định nghĩa tên chuẩn hóa cho các tài nguyên để tránh vượt quá 63 ký tự
*/}}
{{- define "my-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Tạo bộ nhãn (labels) chuẩn hóa bắt buộc theo quy định của Kubernetes
*/}}
{{- define "my-app.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 }}
app.kubernetes.io/name: {{ default .Chart.Name .Values.nameOverride }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
```

*Sử dụng hàm trong `templates/deployment.yaml`:*
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
```

---

### 3. Tích hợp chặt chẽ Probes kiểm tra sức khỏe của ứng dụng
Tuyệt đối không bỏ trống cấu hình kiểm tra trạng thái hoạt động trên môi trường Production. Kubernetes cần biết khi nào ứng dụng đã sẵn sàng nhận traffic (`readinessProbe`) và khi nào ứng dụng bị treo cần khởi động lại (`livenessProbe`).

✅ **Cấu hình chuẩn hóa trong `templates/deployment.yaml`:**
```yaml
spec:
  containers:
    - name: {{ .Chart.Name }}
      image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
      livenessProbe:
        httpGet:
          path: /healthz
          port: http
        initialDelaySeconds: 15
        periodSeconds: 20
      readinessProbe:
        httpGet:
          path: /ready
          port: http
        initialDelaySeconds: 5
        periodSeconds: 10
```

---

### 4. Áp dụng quy chuẩn bảo mật Pod Security Context nghiêm ngặt
Hãy gia cố bảo mật trực tiếp cho container ngay trong cấu trúc Helm templates để ngăn chặn tin tặc leo thang đặc quyền.

✅ **Cấu hình gia cố an toàn bảo mật:**
```yaml
spec:
  securityContext:
    # Chạy toàn bộ các tiến trình với ID người dùng không đặc quyền
    runAsNonRoot: true
    runAsUser: 10001
    runAsGroup: 10001
    fsGroup: 10001
  containers:
    - name: {{ .Chart.Name }}
      securityContext:
        # Khóa chặt hệ thống file, không cho phép ghi mã độc lên container storage
        readOnlyRootFilesystem: true
        # Vô hiệu hóa đặc quyền leo thang đặc quyền root
        allowPrivilegeEscalation: false
        capabilities:
          drop:
            - ALL
```

---

### 5. Quản lý Dependencies (Các gói phụ thuộc đi kèm)
Nếu ứng dụng microservice của bạn cần đi kèm một cơ sở dữ liệu riêng (v.d. PostgreSQL) hoặc hệ thống cache (v.d. Redis), hãy quản lý chúng thông qua khai báo `dependencies` trong tệp `Chart.yaml`:

```yaml
# Chart.yaml
apiVersion: v2
name: my-app
description: "Một ứng dụng microservice hoàn chỉnh đạt chuẩn Production"
type: application
version: 1.0.0
appVersion: "1.5.0"

# Khai báo các Chart phụ thuộc tải từ repo chính thức
dependencies:
  - name: postgresql
    version: "12.5.6"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
```
Khi chạy cài đặt, chỉ cần chạy lệnh sau để Helm tự động tải và tích hợp cụm DB Postgres sạch đi kèm:
```bash
helm dependency update ./my-app
```

---

## 📝 Tổng kết

Thiết kế Helm Chart đạt chuẩn Production không đơn thuần là việc chuyển đổi các tệp YAML tĩnh sang dạng động, mà là việc chuẩn hóa cấu trúc hạ tầng, gia cố bảo mật và tự động hóa vận hành. Việc làm chủ kỹ thuật tổ chức thư mục, viết hàm helper và cấu hình tài nguyên tối ưu giúp bạn tự tin triển khai các hệ thống phần mềm lớn, phân tán an toàn và chuyên nghiệp nhất!
