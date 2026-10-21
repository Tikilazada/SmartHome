// backend/src/models/User.js
const { pool } = require('../config/database');

const User = {
  // Tìm user theo username
  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM `User` WHERE `username` = ?', [username]);
    return rows[0] || null;
  },

  // Tìm user theo user_id
  async findById(userId) {
    const [rows] = await pool.query(
      'SELECT `user_id`, `username`, `full_name`, `created_at` FROM `User` WHERE `user_id` = ?',
      [userId]
    );
    return rows[0] || null;
  }
};

module.exports = User;
