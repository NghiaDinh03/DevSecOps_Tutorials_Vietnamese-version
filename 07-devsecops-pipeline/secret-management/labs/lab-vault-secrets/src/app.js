const express = require('express');
const axios = require('axios');

const app = express();
const port = 4000;

// Đọc địa chỉ và token kết nối từ biến môi trường
const vaultAddress = process.env.VAULT_ADDR || 'http://vault:8200';
const vaultToken = process.env.VAULT_TOKEN || 'dev-root-token';

let paymentApiKey = 'CHƯA_CÓ';

async function fetchSecretFromVault() {
  const secretPath = '/v1/secret/data/payment-api';
  console.log(`[Vault Client] Đang kết nối tới Vault tại: ${vaultAddress}...`);
  
  try {
    const response = await axios.get(`${vaultAddress}${secretPath}`, {
      headers: {
        'X-Vault-Token': vaultToken
      }
    });

    // Cấu trúc JSON trả về của Vault KV v2: response.data.data.data
    const secrets = response.data.data.data;
    paymentApiKey = secrets.api_key;

    // Masking secret khi in ra console để tránh rò rỉ log
    const maskedKey = paymentApiKey.substring(0, 4) + '****************';
    console.log(`[Vault Client] Kết nối Vault thành công! Đã lấy API Key: [${maskedKey}]`);
  } catch (error) {
    console.error(`[Vault Client] Lỗi kết nối hoặc lấy secret từ Vault:`, error.message);
    if (error.response) {
      console.error(`[Vault Client] Chi tiết lỗi API:`, error.response.data);
    }
    process.exit(1); // Stop app if secret cannot be retrieved
  }
}

app.get('/payment', (req, res) => {
  res.status(200).send({
    status: "success",
    message: "Giao dịch thanh toán hoàn tất!",
    provider: "Stripe Gateway",
    masked_key_used: paymentApiKey.substring(0, 4) + '****************'
  });
});

app.listen(port, async () => {
  console.log(`Ứng dụng Client đang chạy trên cổng ${port}.`);
  // Đợi 2 giây để chắc chắn Vault Server đã khởi chạy hoàn tất rồi mới kéo secret
  setTimeout(async () => {
    await fetchSecretFromVault();
  }, 2000);
});
