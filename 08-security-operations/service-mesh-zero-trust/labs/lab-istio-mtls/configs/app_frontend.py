import http.server
import socketserver
import urllib.request
import urllib.error
import json

PORT = 3000
PAYMENT_SERVICE_URL = "http://payment-service:8080/pay"

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevSecOps Lab - Istio mTLS & Zero Trust</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(255, 255, 255, 0.03);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-color: #e2e8f0;
            --text-muted: #94a3b8;
            --primary: #3b82f6;
            --success: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            background-image: 
                radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 50%);
        }

        .container {
            width: 100%;
            max-width: 900px;
            background: var(--card-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        header {
            text-align: center;
            margin-bottom: 2.5rem;
        }

        header h1 {
            font-size: 2.2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }

        header p {
            color: var(--text-muted);
            font-size: 1rem;
        }

        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
            margin-bottom: 1rem;
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        @media (min-width: 768px) {
            .grid {
                grid-template-columns: 1fr 1.2fr;
            }
        }

        .control-panel {
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
        }

        .section-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #fff;
            margin-bottom: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn {
            width: 100%;
            padding: 1rem 1.5rem;
            border: none;
            border-radius: 12px;
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.8rem;
            color: white;
            text-align: left;
        }

        .btn-plain {
            background: linear-gradient(135deg, #475569 0%, #334155 100%);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .btn-plain:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
        }

        .btn-mtls {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.3);
        }

        .btn-mtls:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px 0 rgba(37, 99, 235, 0.4);
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .btn-hacker {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
            box-shadow: 0 4px 14px 0 rgba(185, 28, 28, 0.3);
        }

        .btn-hacker:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px 0 rgba(185, 28, 28, 0.4);
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }

        .btn:active {
            transform: translateY(0);
        }

        .console-panel {
            background: #05070c;
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            height: 400px;
        }

        .console-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 0.8rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            margin-bottom: 1rem;
        }

        .console-dots {
            display: flex;
            gap: 6px;
        }

        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        .dot-red { background-color: #ef4444; }
        .dot-yellow { background-color: #f59e0b; }
        .dot-green { background-color: #10b981; }

        .console-title {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-family: monospace;
        }

        .console-output {
            flex-grow: 1;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9rem;
            line-height: 1.5;
            overflow-y: auto;
            white-space: pre-wrap;
            color: #38bdf8;
            padding-right: 0.5rem;
        }

        .console-output::-webkit-scrollbar {
            width: 6px;
        }

        .console-output::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }

        .alert-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        .alert-success {
            background-color: rgba(16, 185, 129, 0.2);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .alert-danger {
            background-color: rgba(239, 68, 68, 0.2);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .alert-warning {
            background-color: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <span class="badge">Module 08: Security Operations</span>
            <h1>Istio mTLS & Zero-Trust Simulation</h1>
            <p>Mô phỏng cơ chế bảo mật biên mạng microservices của Service Mesh Istio</p>
        </header>

        <div class="grid">
            <div class="control-panel">
                <div class="section-title">🔌 Kích hoạt cuộc gọi API</div>
                
                <button class="btn btn-plain" onclick="callApi('/api/pay-plain', 'PLAIN TEXT CHANNEL')">
                    🔓 Gọi Plain-text (Không mTLS)
                </button>

                <button class="btn btn-mtls" onclick="callApi('/api/pay-mtls', 'SECURE mTLS CHANNEL')">
                    🔒 Gọi mTLS (Frontend Service)
                </button>

                <button class="btn btn-hacker" onclick="callApi('/api/pay-invalid-identity', 'UNAUTHORIZED mTLS IDENTITY')">
                    🚨 Giả lập Hacker (Sai Identity)
                </button>
            </div>

            <div class="console-panel">
                <div class="console-header">
                    <div class="console-dots">
                        <div class="dot dot-red"></div>
                        <div class="dot dot-yellow"></div>
                        <div class="dot dot-green"></div>
                    </div>
                    <div class="console-title">envoy-sidecar-proxy.log</div>
                </div>
                <div id="output" class="console-output">Hệ thống sẵn sàng. Nhấn các nút bên trái để mô phỏng gửi yêu cầu thanh toán sang microservice Payment qua Sidecar Proxy...</div>
            </div>
        </div>
    </div>

    <script>
        function callApi(endpoint, channelName) {
            const outputDiv = document.getElementById('output');
            outputDiv.innerHTML = `[CONNECTION] Đang mở kết nối qua kênh: ${channelName}...\\n[HTTP] Sending GET http://payment-service:8080/pay...\\n`;
            
            fetch(endpoint)
                .then(res => {
                    const status = res.status;
                    return res.text().then(text => ({ status, text }));
                })
                .then(({ status, text }) => {
                    let formattedText = text;
                    try {
                        // Thử format JSON cho đẹp nếu có thể
                        const json = JSON.parse(text);
                        formattedText = JSON.stringify(json, null, 2);
                    } catch(e) {}

                    let badgeClass = 'alert-warning';
                    let statusLabel = 'INFO';
                    
                    if (status === 200) {
                        badgeClass = 'alert-success';
                        statusLabel = 'SUCCESS';
                    } else if (status === 403) {
                        badgeClass = 'alert-danger';
                        statusLabel = 'BLOCKED (403 FORBIDDEN)';
                    } else {
                        badgeClass = 'alert-danger';
                        statusLabel = `ERROR (${status})`;
                    }

                    outputDiv.innerHTML += `\\n[RESPONSE STATUS] <span class="alert-badge ${badgeClass}">${statusLabel}</span>\\n\\n[RESPONSE BODY]\\n${formattedText}`;
                })
                .catch(err => {
                    outputDiv.innerHTML += `\\n[RESPONSE STATUS] <span class="alert-badge alert-danger">CONNECTION ERROR</span>\\n\\n[DETAILS]\\n${err.message}`;
                });
        }
    </script>
</body>
</html>
"""

class FrontendHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(HTML_TEMPLATE.encode('utf-8'))
        
        elif self.path == '/api/pay-plain':
            # Gọi API HTTP thông thường, không mTLS (không gắn header)
            self.forward_to_payment({})
            
        elif self.path == '/api/pay-mtls':
            # Gọi API giả lập có mTLS Sidecar của Frontend
            # Sidecar tự động mã hóa và đính kèm danh tính Frontend ServiceAccount
            headers = {
                "X-Istio-Mutual-TLS": "true",
                "X-Istio-Mutual-TLS-Identity": "cluster.local/ns/prod/sa/frontend-service-account"
            }
            self.forward_to_payment(headers)

        elif self.path == '/api/pay-invalid-identity':
            # Gọi API có mTLS nhưng với Identity lạ/không có quyền trong AuthorizationPolicy
            headers = {
                "X-Istio-Mutual-TLS": "true",
                "X-Istio-Mutual-TLS-Identity": "cluster.local/ns/prod/sa/hacker-service-account"
            }
            self.forward_to_payment(headers)
            
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

    def forward_to_payment(self, extra_headers):
        try:
            req = urllib.request.Request(PAYMENT_SERVICE_URL)
            for k, v in extra_headers.items():
                req.add_header(k, v)
            
            with urllib.request.urlopen(req) as response:
                content = response.read()
                self.send_response(response.status)
                self.send_header('Content-Type', response.headers.get('Content-Type', 'text/plain'))
                self.end_headers()
                self.wfile.write(content)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(f"Lỗi kết nối tới Payment Service: {e}".encode('utf-8'))

if __name__ == "__main__":
    with socketserver.TCPServer(("0.0.0.0", PORT), FrontendHandler) as httpd:
        print(f"[Frontend App] Đang chạy tại cổng {PORT}...")
        httpd.serve_forever()
