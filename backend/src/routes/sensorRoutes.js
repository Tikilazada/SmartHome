// backend/src/routes/sensorRoutes.js
const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// GET /api/sensors/latest - Lấy 3 thông số cảm biến mới nhất
router.get('/latest', sensorController.getLatestSensors);

// GET /api/sensors/history - Dữ liệu biểu đồ thời gian thực (1h, 6h, 24h, 7d)
router.get('/history', sensorController.getChartHistory);

// GET /api/sensors - Tra cứu dữ liệu cảm biến (lọc theo loại, ID, ngày, keyword, phân trang)
router.get('/', sensorController.getSensorHistory);

// GET /api/sensors/:id - Chi tiết cảm biến
router.get('/:id', sensorController.getSensorById);

module.exports = router;
