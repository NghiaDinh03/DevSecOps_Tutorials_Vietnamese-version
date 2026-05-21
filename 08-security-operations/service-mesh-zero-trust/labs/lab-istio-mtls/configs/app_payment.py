import http.server
import socketserver
import json

PORT = 8081

class PaymentHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/pay':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                "status": "success",
                "message": "Giao dịch thanh toán trị giá 100$ thành công!",
                "transaction_id": "TX-99887766",
                "secure_channel": "Verified via Istio Envoy Sidecar"
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {"error": "Endpoint không tồn tại"}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

if __name__ == "__main__":
    # Lắng nghe tại localhost để chỉ Sidecar cùng container/host có thể chuyển tiếp sang
    with socketserver.TCPServer(("127.0.0.1", PORT), PaymentHandler) as httpd:
        print(f"[Payment App] Đang chạy tại cổng 127.0.0.1:{PORT}...")
        httpd.serve_forever()
