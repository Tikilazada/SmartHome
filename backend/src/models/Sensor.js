// backend/src/models/Sensor.js
const { pool } = require('../config/database');

const Sensor = {
  // Lấy danh mục tất cả cảm biến
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM `Sensors` ORDER BY `sensor_id` ASC');
    return rows;
  },

  // Lấy cảm biến theo ID
  async getById(sensorId) {
    const [rows] = await pool.query('SELECT * FROM `Sensors` WHERE `sensor_id` = ?', [sensorId]);
    return rows[0] || null;
  }
};

module.exports = Sensor;
