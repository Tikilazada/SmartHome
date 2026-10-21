// backend/src/controllers/actionController.js
const actionService = require('../services/actionService');

const actionController = {
  // GET /api/actions (Cho trang Action History)
  async getActions(req, res, next) {
    try {
      const { deviceId, action, status, timeString, search, page, limit } = req.query;
      const result = await actionService.getActions({
        deviceId,
        action,
        status,
        timeString,
        search,
        page,
        limit
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/actions/recent (Cho Recent Activity card trên Dashboard)
  async getRecentActions(req, res, next) {
    try {
      const { limit } = req.query;
      const data = await actionService.getRecentActions(limit || 5);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/actions/:id
  async getActionById(req, res, next) {
    try {
      const { id } = req.params;
      const action = await actionService.getActionById(id);
      if (!action) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy bản ghi lịch sử có ID #${id}`
        });
      }
      res.status(200).json({
        success: true,
        data: action
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = actionController;
