// backend/src/routes/actionRoutes.js
const express = require('express');
const router = express.Router();
const actionController = require('../controllers/actionController');

// GET /api/actions/recent - Lấy danh sách thao tác gần đây cho Dashboard
router.get('/recent', actionController.getRecentActions);

// GET /api/actions - Lấy toàn bộ lịch sử điều khiển (có lọc và phân trang)
router.get('/', actionController.getActions);

// GET /api/actions/:id - Chi tiết 1 bản ghi điều khiển
router.get('/:id', actionController.getActionById);

module.exports = router;
