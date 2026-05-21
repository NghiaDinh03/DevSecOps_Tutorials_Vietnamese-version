const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Sử dụng thư mục public để phục vụ các file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint giả lập phản hồi của Gemma AI
app.get('/api/chat', (req, res) => {
    const userMessage = req.query.message || '';
    let aiResponse = 'Xin chào! Tôi là mô hình Gemma AI được đóng gói an toàn. Bạn muốn thảo luận gì về DevSecOps hôm nay?';
    
    if (userMessage.toLowerCase().includes('security') || userMessage.toLowerCase().includes('bảo mật')) {
        aiResponse = 'Bảo mật là ưu tiên hàng đầu! Chúng tôi đã gia cố container này bằng cơ chế Read-only Filesystem, chạy với Non-root user và chặn leo thang đặc quyền.';
    }
    
    res.json({ response: aiResponse });
});

app.listen(PORT, () => {
    console.log(`[OK] Server đang chạy tại cổng ${PORT}`);
    console.log(`[INFO] Chạy dưới quyền User ID: ${process.getuid ? process.getuid() : 'N/A'}`);
});
