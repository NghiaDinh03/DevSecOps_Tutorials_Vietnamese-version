const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const Docker = require('dockerode');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const PORT = process.env.PORT || 8000;
const WORKSPACE_DIR = '/workspace';

app.use(express.json());

// Phục vụ Frontend tĩnh trong môi trường Production
app.use(express.static(path.join(__dirname, 'dist')));

// --- HỆ THỐNG DANH SÁCH 24 BÀI LAB ---
const LABS_DATA = [
  // Module 1
  {
    id: "lab-git-flow",
    title: "Lab 1.3: Quy Trình Git Flow An Toàn",
    module: "Module 1: Nền Tảng DevOps",
    level: "EASY",
    path: "01-fundamentals/03-git-workflow/labs/lab-git-flow/lab-instructions.md",
    composePath: "",
    guiPort: null,
    desc: "Thực hành quy trình phân nhánh an toàn, tạo Pull Request và giải quyết xung đột mã nguồn."
  },
  {
    id: "lab-gitleaks-local",
    title: "Lab 1.4: Chặn Rò Rỉ Gitleaks Local",
    module: "Module 1: Nền Tảng DevOps",
    level: "MEDIUM",
    path: "01-fundamentals/03-git-workflow/labs/lab-gitleaks-local/lab-instructions.md",
    composePath: "",
    guiPort: null,
    desc: "Cấu hình Git Hooks (pre-commit) tích hợp Gitleaks quét secrets chủ động tại máy cá nhân."
  },
  {
    id: "lab-gitleaks-pipeline",
    title: "Lab 1.5: Gitleaks Action Pipeline",
    module: "Module 1: Nền Tảng DevOps",
    level: "HARD",
    path: "01-fundamentals/03-git-workflow/labs/lab-gitleaks-pipeline/lab-instructions.md",
    composePath: "",
    guiPort: null,
    desc: "Tích hợp Gitleaks quét toàn bộ lịch sử commit trên GitHub Actions ngăn rò rỉ secrets."
  },
  // Module 2
  {
    id: "lab-dockerize-ai-app",
    title: "Lab 2.1: Dockerize Web App Node.js",
    module: "Module 2: Công Nghệ Container",
    level: "EASY",
    path: "02-containerization/01-docker-basics/labs/lab-dockerize-ai-app/lab-instructions.md",
    composePath: "02-containerization/01-docker-basics/labs/lab-dockerize-ai-app",
    guiPort: 3001,
    desc: "Đóng gói ứng dụng web Node.js Mock AI hoàn chỉnh với cơ chế Dockerfile & Compose."
  },
  {
    id: "lab-docker-hardening",
    title: "Lab 2.2: Multi-stage & Hardening CIS",
    module: "Module 2: Công Nghệ Container",
    level: "MEDIUM",
    path: "02-containerization/01-docker-basics/labs/lab-docker-hardening/lab-instructions.md",
    composePath: "02-containerization/01-docker-basics/labs/lab-docker-hardening",
    guiPort: 3002,
    desc: "Gia cố bảo mật ảnh Docker, tối ưu dung lượng Multi-stage build và thiết lập Non-root user."
  },
  {
    id: "lab-docker-compose-production",
    title: "Lab 2.3: Resource Limits & Isolation",
    module: "Module 2: Công Nghệ Container",
    level: "HARD",
    path: "02-containerization/01-docker-basics/labs/lab-docker-compose-production/lab-instructions.md",
    composePath: "02-containerization/01-docker-basics/labs/lab-docker-compose-production",
    guiPort: null,
    desc: "Giới hạn tài nguyên CPU/RAM, thiết lập mạng cô lập và quản lý logs tập trung."
  },
  // Module 4
  {
    id: "lab-terraform-local",
    title: "Lab 4.1: Terraform & State Local",
    module: "Module 4: Hạ Tầng Dạng Code - IaC",
    level: "EASY",
    path: "04-infrastructure-as-code/01-terraform/labs/lab-terraform-local/lab-instructions.md",
    composePath: "",
    guiPort: null,
    desc: "Khởi tạo tài nguyên cục bộ bằng Terraform và cấu hình bảo mật tệp tin trạng thái State."
  },
  {
    id: "lab-terraform-scan",
    title: "Lab 4.2: Quét Lỗ Hổng IaC Tfsec",
    module: "Module 4: Hạ Tầng Dạng Code - IaC",
    level: "MEDIUM",
    path: "04-infrastructure-as-code/01-terraform/labs/lab-terraform-scan/lab-instructions.md",
    composePath: "",
    guiPort: null,
    desc: "Sử dụng Tfsec quét và phát hiện các lỗi cấu hình sai (misconfigurations) bảo mật trong mã nguồn Terraform."
  },
  {
    id: "lab-terraform-pipeline",
    title: "Lab 4.3: Pipeline IaC tfsec Action",
    module: "Module 4: Hạ Tầng Dạng Code - IaC",
    level: "HARD",
    path: "04-infrastructure-as-code/01-terraform/labs/lab-terraform-pipeline/lab-instructions.md",
    composePath: "",
    guiPort: null,
    desc: "Thiết lập pipeline CI tự động quét bảo mật hạ tầng Terraform mỗi khi có PR đẩy lên Github."
  },
  // Module 7
  {
    id: "lab-vault-secrets",
    title: "Lab 7.1: HashiCorp Vault DEV Setup",
    module: "Module 7: Tích Hợp Bảo Mật CI/CD",
    level: "EASY",
    path: "07-devsecops-pipeline/02-secret-management/labs/lab-vault-secrets/lab-instructions.md",
    composePath: "07-devsecops-pipeline/02-secret-management/labs/lab-vault-secrets",
    guiPort: 8200,
    desc: "Khởi chạy Vault Server cục bộ ở chế độ Dev, làm quen với CLI và giao diện quản lý khóa động."
  }
];

// API: Lấy danh sách toàn bộ các lab
app.get('/api/labs', (req, res) => {
  res.json(LABS_DATA);
});

// API: Lấy nội dung tài liệu hướng dẫn của lab (.md)
app.get('/api/lab-content', (req, res) => {
  const relativePath = req.query.path;
  if (!relativePath) {
    return res.status(400).json({ error: "Thiếu tham số path" });
  }

  const fullPath = path.join(WORKSPACE_DIR, relativePath);
  
  // Bảo vệ chống Directory Traversal
  if (!fullPath.startsWith(WORKSPACE_DIR)) {
    return res.status(403).json({ error: "Truy cập bị từ chối" });
  }

  fs.readFile(fullPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: "Không tìm thấy tệp tài liệu hướng dẫn" });
    }
    res.json({ content: data });
  });
});

// API: Kiểm tra trạng thái các container của một bài lab
app.get('/api/docker/status', async (req, res) => {
  const composePath = req.query.composePath;
  if (!composePath) {
    return res.json({ status: "NOT_CONFIGURED" });
  }

  try {
    const containers = await docker.listContainers({ all: true });
    // Lọc các container thuộc project của composePath đó
    // Khi Docker Compose chạy, nó gán nhãn `com.docker.compose.project.working_dir`
    const projectFolder = path.basename(composePath);
    const active = containers.some(c => {
      const labels = c.Labels || {};
      const composeProjectDir = labels['com.docker.compose.project.working_dir'] || '';
      return composeProjectDir.endsWith(projectFolder) && c.State === 'running';
    });

    res.json({ status: active ? "RUNNING" : "STOPPED" });
  } catch (err) {
    res.status(500).json({ error: "Không thể kết nối tới Docker Socket: " + err.message });
  }
});

// Hàm hỗ trợ thực thi lệnh trong container workspace-terminal
function executeInWorkspace(cmd, dir) {
  return new Promise(async (resolve, reject) => {
    try {
      const container = docker.getContainer('workspace-terminal');
      const exec = await container.exec({
        Cmd: ['bash', '-c', `cd ${dir} && ${cmd}`],
        AttachStdout: true,
        AttachStderr: true
      });

      const stream = await exec.start();
      let output = '';

      stream.on('data', (chunk) => {
        output += chunk.toString();
      });

      stream.on('end', () => {
        resolve(output);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// API: Khởi chạy môi trường lab (Docker Compose Up)
app.post('/api/docker/start', async (req, res) => {
  const { composePath } = req.body;
  if (!composePath) {
    return res.status(400).json({ error: "Thiếu thông tin composePath" });
  }

  const absoluteLabDir = path.join(WORKSPACE_DIR, composePath);
  try {
    // Thực thi docker compose up -d ngầm bên trong container workspace
    await executeInWorkspace("docker compose up -d --build", absoluteLabDir);
    res.json({ success: true, message: "Kích hoạt lab thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Khởi động lab thất bại: " + err.message });
  }
});

// API: Dừng môi trường lab (Docker Compose Down)
app.post('/api/docker/stop', async (req, res) => {
  const { composePath } = req.body;
  if (!composePath) {
    return res.status(400).json({ error: "Thiếu thông tin composePath" });
  }

  const absoluteLabDir = path.join(WORKSPACE_DIR, composePath);
  try {
    await executeInWorkspace("docker compose down", absoluteLabDir);
    res.json({ success: true, message: "Dừng lab thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Dừng lab thất bại: " + err.message });
  }
});

// --- TÍCH HỢP INTERACTIVE TERMINAL QUA WEBSOCKET ---
wss.on('connection', (ws, req) => {
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const activeLabPath = urlParams.get('dir') || '';
  const initDir = activeLabPath ? path.join(WORKSPACE_DIR, activeLabPath) : WORKSPACE_DIR;

  console.log(`🔌 Thiết lập kết nối terminal mới. Thư mục bắt đầu: ${initDir}`);

  // Tìm container workspace-terminal
  const container = docker.getContainer('workspace-terminal');
  
  container.exec({
    Cmd: ['bash', '-c', `cd ${initDir} && exec bash`],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Env: ['TERM=xterm-256color']
  }, (err, exec) => {
    if (err) {
      console.error("❌ Lỗi khởi tạo exec terminal:", err);
      ws.send("\r\n❌ Lỗi kết nối tới Workspace Terminal Container!\r\n");
      ws.close();
      return;
    }

    exec.start({ hijack: true, stdin: true }, (err, stream) => {
      if (err) {
        console.error("❌ Lỗi bắt đầu stream terminal:", err);
        ws.send("\r\n❌ Lỗi kết nối luồng dữ liệu Terminal!\r\n");
        ws.close();
        return;
      }

      // Đẩy dữ liệu từ terminal container về trình duyệt
      stream.on('data', (chunk) => {
        ws.send(chunk.toString());
      });

      // Đẩy dữ liệu gõ từ trình duyệt vào terminal container
      ws.on('message', (message) => {
        stream.write(message);
      });

      ws.on('close', () => {
        console.log("🔌 Ngắt kết nối terminal.");
        stream.end();
      });

      stream.on('end', () => {
        ws.close();
      });
    });
  });
});

// Chuyển mọi request không khớp về trang chính React (Production runtime SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`🚀 DevSecOps Portal chạy tại http://localhost:${PORT}`);
});
