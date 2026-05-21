const express = require('express');
const client = require('prom-client');

const app = express();
const port = 3000;

// Kích hoạt thu thập các metrics mặc định của hệ thống (CPU, Memory, GC)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Khởi tạo Counter theo dõi tổng số request HTTP
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Tổng số HTTP request đã gửi tới ứng dụng',
  labelNames: ['method', 'route', 'status']
});

// Khởi tạo Histogram theo dõi độ trễ của các request (Latency)
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Thời gian xử lý HTTP request tính bằng giây',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5] // Các mốc thời gian để phân loại (buckets)
});

// Middleware ghi nhận metrics cho mỗi request đi qua
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9; // Đổi sang giây
    
    // Ghi nhận metrics
    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
    httpRequestDurationMicroseconds.labels(req.method, req.path, res.statusCode).observe(duration);
  });
  next();
});

// Route 1: Phản hồi bình thường
app.get('/hello', (req, res) => {
  res.status(200).send({ message: 'Chào mừng bạn đến với DevSecOps Observability Lab!' });
});

// Route 2: Phản hồi chậm (Giả lập Latency nghẽn mạng)
app.get('/slow', async (req, res) => {
  const delay = Math.random() * 3000; // Giả lập độ trễ ngẫu nhiên từ 0-3 giây
  setTimeout(() => {
    res.status(200).send({ message: `Phản hồi chậm sau ${delay.toFixed(0)}ms` });
  }, delay);
});

// Route 3: Phản hồi lỗi 500 (Giả lập Lỗi hệ thống)
app.get('/error', (req, res) => {
  res.status(500).send({ error: 'Lỗi máy chủ nội bộ (Internal Server Error)!' });
});

// Endpoint expose metrics cho Prometheus kéo
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(port, () => {
  console.log(`Ứng dụng đang chạy trên cổng ${port}. Truy cập /metrics để xem số liệu.`);
});
