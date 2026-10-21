// backend/src/services/actionService.js
const Action = require('../models/Action');

const actionService = {
  // Lấy lịch sử điều khiển kèm bộ lọc & phân trang
  async getActions(queryParams) {
    return await Action.queryHistory(queryParams);
  },

  // Lấy chi tiết action theo ID
  async getActionById(actionId) {
    return await Action.getById(actionId);
  },

  // Lấy danh sách hoạt động gần đây cho Dashboard
  async getRecentActions(limit = 5) {
    return await Action.getRecent(limit);
  }
};

module.exports = actionService;
