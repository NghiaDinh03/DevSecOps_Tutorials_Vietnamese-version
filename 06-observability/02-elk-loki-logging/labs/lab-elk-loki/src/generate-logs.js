const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');
const logFile = path.join(logDirectory, 'app.log');

// Tạo thư mục logs nếu chưa tồn tại
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const levels = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
const routes = ['/api/v1/users', '/api/v1/auth/login', '/api/v1/payments', '/api/v1/products'];
const users = ['user_102', 'user_405', 'user_881', 'user_990'];

function generateRandomLog() {
  const level = levels[Math.floor(Math.random() * levels.length)];
  const route = routes[Math.floor(Math.random() * routes.length)];
  const user = users[Math.floor(Math.random() * users.length)];
  const timestamp = new Date().toISOString();
  
  let message = '';
  if (level === 'INFO') {
    message = `User [${user}] successfully accessed ${route} - Status 200`;
  } else if (level === 'DEBUG') {
    message = `Database connection active. Query latency: ${(Math.random() * 50).toFixed(2)}ms`;
  } else if (level === 'WARN') {
    message = `Rate limit warning for IP 192.168.1.15 accessing ${route}`;
  } else if (level === 'ERROR') {
    message = `Database connection failed for user [${user}]! Connection timeout to PostgreSQL at port 5432.`;
  }

  const logLine = `[${timestamp}] [${level}] ${message}\n`;

  // Ghi log vào file (Append mode)
  fs.appendFileSync(logFile, logLine, 'utf8');
  console.log(`Generated log: ${logLine.trim()}`);
}

console.log('Bắt đầu sinh logs giả lập vào file /logs/app.log...');
setInterval(generateRandomLog, 1500); // Sinh log mỗi 1.5 giây
