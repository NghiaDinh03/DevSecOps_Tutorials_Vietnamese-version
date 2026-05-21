import http.server
import socketserver
import urllib.request
import urllib.error
import re
import os
import json

PORT = 8080
TARGET_URL = "http://127.0.0.1:8081"

PEER_AUTH_PATH = "/manifests/peer-authentication.yaml"
AUTH_POLICY_PATH = "/manifests/authorization-policy.yaml"

def parse_simple_yaml(filepath):
    """
    Parser YAML cực kỳ đơn giản để đọc cấu hình mà không cần thư viện PyYAML.
    Hỗ trợ đọc các trường key-value cơ bản.
    """
    config = {}
    if not os.path.exists(filepath):
        return config
    
    current_key = None
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                # Bỏ qua dòng trống hoặc comment
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                
                # Regex phân tích key-value đơn giản
                match = re.match(r'^([a-zA-Z0-9_\-]+):\s*(.*)$', line)
                if match:
                    key = match.group(1)
                    val = match.group(2).strip()
                    # Bỏ dấu ngoặc kép nếu có
                    val = val.strip('"\'-[]')
                    config[key] = val
                    current_key = key
                elif line.startswith('-') and current_key:
                    # Hỗ trợ list đơn giản
                    val = line.lstrip('- ').strip('"\'-')
                    if current_key not in config or not isinstance(config[current_key], list):
                        config[current_key] = []
                    config[current_key].append(val)
    except Exception as e:
        print(f"[Sidecar Error] Lỗi đọc file cấu hình {filepath}: {e}")
    return config

def get_peer_authentication_mode():
    config = parse_simple_yaml(PEER_AUTH_PATH)
    # Trả về mode: STRICT hoặc PERMISSIVE. Mặc định là PERMISSIVE nếu không tìm thấy cấu hình.
    return config.get('mode', 'PERMISSIVE').upper()

def check_authorization_policy(identity, method, path):
    """
    Kiểm tra chính sách AuthorizationPolicy.
    Trả về True nếu được phép, False nếu bị chặn.
    """
    if not os.path.exists(AUTH_POLICY_PATH):
        return True # Nếu không cấu hình policy, mặc định cho phép truy cập (Istio Default Allow)

    # Đọc nhanh nội dung file policy
    try:
        with open(AUTH_POLICY_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[Sidecar Error] Lỗi đọc policy: {e}")
        return True

    # Tìm action (ALLOW hoặc DENY)
    action = "ALLOW"
    action_match = re.search(r'action:\s*(\w+)', content)
    if action_match:
        action = action_match.group(1).upper()

    # Tìm principals được cho phép
    principals = re.findall(r'principals:\s*\[?([^\]\n]+)\]?', content)
    allowed_principals = []
    if principals:
        # Tách danh sách nếu khai báo dạng chuỗi hoặc list
        parts = re.split(r'[\s,\'"]+', principals[0])
        allowed_principals = [p.strip('"\'-') for p in parts if p.strip('"\'-')]
    else:
        # Tìm các dòng chứa principal dạng list (-)
        principals_lines = re.findall(r'-\s*source:\s*\n\s*principals:\s*\n\s*-\s*([^\n]+)', content)
        if not principals_lines:
            principals_lines = re.findall(r'-\s*([a-zA-Z0-9\.\-/]+)', content)
        allowed_principals = [p.strip('"\'-') for p in principals_lines if "cluster.local" in p]

    # Tìm methods và paths
    methods = re.findall(r'methods:\s*\[?([^\]\n]+)\]?', content)
    allowed_methods = []
    if methods:
        parts = re.split(r'[\s,\'"]+', methods[0])
        allowed_methods = [m.upper() for m in parts if m]
    
    paths = re.findall(r'paths:\s*\[?([^\]\n]+)\]?', content)
    allowed_paths = []
    if paths:
        parts = re.split(r'[\s,\'"]+', paths[0])
        allowed_paths = [p for p in parts if p]

    print(f"[Sidecar Policy Engine] Đang đánh giá: Identity='{identity}', Method='{method}', Path='{path}'")
    print(f"[Sidecar Policy Engine] Chính sách: Action={action}, AllowedPrincipals={allowed_principals}, AllowedMethods={allowed_methods}, AllowedPaths={allowed_paths}")

    # Thực hiện kiểm tra
    # Nếu không có principals nào được chỉ định, mặc định chặn tất cả nếu Action là ALLOW
    if action == "ALLOW":
        principal_ok = False
        for p in allowed_principals:
            if p == "*" or p == identity:
                principal_ok = True
                break
        
        method_ok = False
        if not allowed_methods:
            method_ok = True
        else:
            for m in allowed_methods:
                if m == "*" or m == method:
                    method_ok = True
                    break
        
        path_ok = False
        if not allowed_paths:
            path_ok = True
        else:
            for p in allowed_paths:
                if p == "*" or p == path:
                    path_ok = True
                    break

        if principal_ok and method_ok and path_ok:
            return True
        else:
            return False
    
    elif action == "DENY":
        # logic DENY (Chặn nếu trùng khớp)
        principal_match = False
        for p in allowed_principals:
            if p == "*" or p == identity:
                principal_match = True
                break
        
        if principal_match:
            return False
        return True

    return True

class SidecarProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        # 1. Đọc chế độ mTLS của PeerAuthentication
        mtls_mode = get_peer_authentication_mode()
        
        # Lấy thông tin xác thực từ request headers
        has_mtls = self.headers.get('X-Istio-Mutual-TLS', 'false').lower() == 'true'
        caller_identity = self.headers.get('X-Istio-Mutual-TLS-Identity', 'anonymous')

        print(f"\n[Sidecar Proxy] Nhận request: {self.command} {self.path} từ Client (mTLS: {has_mtls}, Identity: '{caller_identity}')")
        print(f"[Sidecar Proxy] Chế độ mTLS hiện tại: {mtls_mode}")

        # 2. Kiểm tra PeerAuthentication (mTLS)
        if mtls_mode == "STRICT" and not has_mtls:
            print("[Sidecar Proxy] 🚨 Bị chặn bởi PeerAuthentication! Yêu cầu kết nối STRICT mTLS nhưng nhận kết nối plain-text.")
            self.send_response(403)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b"upstream connect error or disconnect/reset before headers. reset reason: connection termination (mTLS STRICT mode enforced by Istio)\n")
            return

        # 3. Kiểm tra AuthorizationPolicy (Phân quyền chi tiết)
        # Đối với mTLS Permissive hoặc Strict, nếu có identity thì kiểm tra, nếu không có identity (plain-text) thì coi như anonymous
        if not check_authorization_policy(caller_identity, self.command, self.path):
            print(f"[Sidecar Proxy] 🚨 Bị chặn bởi AuthorizationPolicy! Quyền truy cập bị từ chối cho '{caller_identity}'")
            self.send_response(403)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b"RBAC: access denied\n")
            return

        # 4. Chuyển tiếp request sang App thực tế (localhost:8081)
        print("[Sidecar Proxy] ✅ Request hợp lệ. Đang chuyển tiếp sang App Payment...")
        try:
            req = urllib.request.Request(f"{TARGET_URL}{self.path}")
            # Sao chép các header cần thiết
            for key, val in self.headers.items():
                if key.lower() not in ['host', 'connection']:
                    req.add_header(key, val)

            with urllib.request.urlopen(req) as response:
                content = response.read()
                self.send_response(response.status)
                for k, v in response.headers.items():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(content)
                print("[Sidecar Proxy] Chuyển tiếp thành công!")
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for k, v in e.headers.items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(e.read())
            print(f"[Sidecar Proxy] App Payment trả về lỗi: {e.code}")
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(f"Lỗi Sidecar Proxy khi chuyển tiếp: {e}".encode('utf-8'))
            print(f"[Sidecar Proxy] Lỗi chuyển tiếp: {e}")

if __name__ == "__main__":
    # Lắng nghe tại mọi card mạng 0.0.0.0 để container khác có thể gọi tới
    with socketserver.TCPServer(("0.0.0.0", PORT), SidecarProxyHandler) as httpd:
        print(f"[Sidecar Proxy] Envoy Mock Sidecar đang chạy tại cổng {PORT}...")
        httpd.serve_forever()
