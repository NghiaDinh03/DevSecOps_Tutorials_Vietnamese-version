from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

PORT = 8082

# Database lưu trữ trong bộ nhớ tạm
misp_events = [
    {
        "id": 1,
        "title": "APT32 Phishing Campaign Targeting Vietnam Banks",
        "threat_level": "High",
        "attributes": [
            {"type": "ip-dst", "value": "198.51.100.45", "comment": "C2 Server IP"},
            {"type": "domain", "value": "secure-ebank-login.com", "comment": "Phishing Domain"},
            {"type": "sha256", "value": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "comment": "Malware Payload Hash"}
        ]
    }
]

class MISPMockHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        
        # Route 1: Giao diện Web UI đơn giản của MISP
        if parsed_path.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            
            # Xây dựng trang HTML trực quan
            html_content = """
            <html>
            <head>
                <title>MISP - Threat Intelligence Platform (Mock)</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
                    .container { max-width: 900px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    h1 { color: #8e24aa; border-bottom: 2px solid #8e24aa; padding-bottom: 10px; }
                    .event-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 4px; background: #fafafa; }
                    .event-title { font-weight: bold; color: #333; font-size: 1.1em; }
                    .badge { background: #d50000; color: #fff; padding: 3px 8px; border-radius: 3px; font-size: 0.8em; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .btn { background: #8e24aa; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
                    .btn:hover { background: #7b1fa2; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🕵️ MISP Threat Intelligence Platform <span style="font-size: 0.5em; color: #666;">(Local Lab Mode)</span></h1>
                    <p>Chào mừng bạn đến với mô phỏng bảng điều khiển quản trị tình báo mối đe dọa của MISP.</p>
                    
                    <h2>Mối đe dọa đã ghi nhận (Recent Events)</h2>
            """
            
            for ev in misp_events:
                html_content += f"""
                <div class="event-card">
                    <span class="badge">Level: {ev['threat_level']}</span>
                    <span class="event-title">{ev['title']}</span>
                    <table>
                        <tr>
                            <th>Loại IOC</th>
                            <th>Giá trị (IOC Value)</th>
                            <th>Chú thích</th>
                        </tr>
                """
                for attr in ev['attributes']:
                    html_content += f"""
                        <tr>
                            <td><code>{attr['type']}</code></td>
                            <td><strong>{attr['value']}</strong></td>
                            <td>{attr['comment']}</td>
                        </tr>
                    """
                html_content += """
                    </table>
                </div>
                """
                
            html_content += """
                    <h2>Tích hợp Tự động hóa (API Integration)</h2>
                    <p>SecOps sử dụng API để tự động xuất (Export) dữ liệu IOC này nạp vào Firewall/IDS nhằm chặn đứng hacker tự động.</p>
                    <a href="/api/export/firewall" class="btn" target="_blank">Xem API Xuất cấu hình Firewall (Suricata/IP list)</a>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html_content.encode("utf-8"))

        # Route 2: API Export IP List cho Firewall
        elif parsed_path.path == "/api/export/firewall":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            
            # Xuất danh sách IP độc hại để Firewall nạp chặn
            output = "# MISP Automated Threat Intel IP Blocklist\n"
            for ev in misp_events:
                for attr in ev['attributes']:
                    if attr['type'] == 'ip-dst':
                        output += f"{attr['value']} # BLOCKED: {ev['title']} ({attr['comment']})\n"
            self.wfile.write(output.encode("utf-8"))
            
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

def run():
    print(f"Khởi chạy máy chủ MISP Mock trên cổng {PORT}...")
    server = HTTPServer(("0.0.0.0", PORT), MISPMockHandler)
    server.serve_forever()

if __name__ == "__main__":
    run()
