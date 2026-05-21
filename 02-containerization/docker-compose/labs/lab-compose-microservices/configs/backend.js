const http = require('http');
const { Client } = require('pg');

// Cấu hình kết nối PostgreSQL từ biến môi trường
const client = new Client({
  host: process.env.DB_HOST || 'database',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'devsecops_pass',
  database: process.env.DB_NAME || 'devsecops_db',
});

// Thử thách kết nối và khởi tạo bảng dữ liệu
async function initDatabase() {
  let retries = 5;
  while (retries) {
    try {
      await client.connect();
      console.log('Connected to PostgreSQL successfully!');
      
      // Tạo bảng lưu trữ ghi chú nếu chưa tồn tại
      await client.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Database schema initialized.');
      break;
    } catch (err) {
      console.error(`Database connection failed. Retrying... (${retries} left)`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 3000));
    }
  }
}

initDatabase();

// Khởi tạo máy chủ HTTP API
const server = http.createServer(async (req, res) => {
  // Thiết lập Headers cho CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API lấy danh sách ghi chú
  if (req.url === '/api/notes' && req.method === 'GET') {
    try {
      const result = await client.query('SELECT * FROM notes ORDER BY id DESC');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  } 
  // API thêm ghi chú mới
  else if (req.url === '/api/notes' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.content) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Content is required' }));
          return;
        }
        await client.query('INSERT INTO notes (content) VALUES ($1)', [data.content]);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Note created successfully!' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } 
  // API kiểm tra sức khỏe (Healthcheck Endpoint)
  else if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', database: 'connected' }));
  } 
  // Đường dẫn không xác định
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Backend API is running on port ${PORT}`);
});
