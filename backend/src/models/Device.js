// backend/src/models/Device.js
const { pool } = require('../config/database');

const Device = {
  // Lấy toàn bộ danh sách thiết bị
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM `Devices` ORDER BY `device_id` ASC');
    return rows;
  },

  // Lấy thông tin thiết bị theo ID
  async getById(deviceId) {
    const [rows] = await pool.query('SELECT * FROM `Devices` WHERE `device_id` = ?', [deviceId]);
    return rows[0] || null;
  },

  // Cập nhật trạng thái ON/OFF của thiết bị
  async updateStatus(deviceId, status) {
    const [result] = await pool.query(
      'UPDATE `Devices` SET `status` = ?, `updated_at` = CURRENT_TIMESTAMP WHERE `device_id` = ?',
      [status, deviceId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Device;
