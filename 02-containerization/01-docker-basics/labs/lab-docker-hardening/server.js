const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send({
    status: "success",
    message: "🚀 Ứng dụng chạy trên Docker Hardening thành công!",
    user: process.env.USER || "non-root-user",
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Application running on port ${PORT}`);
});
