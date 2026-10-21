// backend/src/routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// GET /api/devices - Lấy danh sách và trạng thái 3 đèn
router.get('/', deviceController.getAllDevices);

// GET /api/devices/:id - Lấy thông tin thiết bị
router.get('/:id', deviceController.getDeviceById);

// POST /api/devices/:id/control - Điều khiển Bật/Tắt thiết bị và chờ ACK
router.post('/:id/control', deviceController.controlDevice);

module.exports = router;
