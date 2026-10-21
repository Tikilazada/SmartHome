// backend/src/server.js
require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const { connectMQTT } = require('./config/mqtt');
const mqttService = require('./services/mqttService');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  console.log('================================================================');
  console.log('🚀 ĐANG KHỞI ĐỘNG HỆ THỐNG BACKEND SERVER (SMART HOME IoT)...');
  console.log('================================================================');

  // 1. Kiểm tra kết nối MySQL Database
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.warn('⚠️ Cảnh báo: MySQL chưa sẵn sàng. Một số API có thể trả về lỗi nếu không có Database.');
  }

  // 2. Khởi tạo kết nối MQTT Broker (nếu không chạy MOCK)
  const mqttClient = connectMQTT();
  if (mqttClient) {
    mqttService.initMQTTListeners(mqttClient);
  }

  // 3. Khởi động bộ sinh dữ liệu cảm biến giả lập nếu MOCK_MODE=true
  if (process.env.MOCK_MODE === 'true') {
    mqttService.startMockSensorDataGenerator(8000);
  }

  // 4. Lắng nghe HTTP Server
  app.listen(PORT, () => {
    console.log(`🌐 [HTTP REST API Server] Đang lắng nghe tại cổng: http://localhost:${PORT}`);
    console.log(`📌 Chế độ hoạt động: MOCK_MODE = ${process.env.MOCK_MODE || 'false'}`);
    console.log(`📚 Danh sách các Endpoint API chính:`);
    console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   - GET  http://localhost:${PORT}/api/sensors/latest`);
    console.log(`   - GET  http://localhost:${PORT}/api/sensors/history?range=24h`);
    console.log(`   - GET  http://localhost:${PORT}/api/sensors`);
    console.log(`   - GET  http://localhost:${PORT}/api/devices`);
    console.log(`   - POST http://localhost:${PORT}/api/devices/:id/control`);
    console.log(`   - GET  http://localhost:${PORT}/api/actions/recent`);
    console.log(`   - GET  http://localhost:${PORT}/api/actions`);
    console.log(`   - GET  http://localhost:${PORT}/api/profile`);
    console.log('================================================================\n');
  });
}

bootstrap().catch((err) => {
  console.error('❌ Lỗi khởi động Server:', err);
  process.exit(1);
});
