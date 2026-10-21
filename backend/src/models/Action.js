// backend/src/models/Action.js
const { pool } = require('../config/database');

const Action = {
  // Tạo bản ghi lệnh điều khiển mới (trạng thái PENDING)
  async create({ deviceId, userId = 1, action, status = 'PENDING', timeSent = new Date() }) {
    const [result] = await pool.query(
      'INSERT INTO `Action` (`device_id`, `user_id`, `action`, `status`, `time_sent`) VALUES (?, ?, ?, ?, ?)',
      [deviceId, userId, action, status, timeSent]
    );
    return result.insertId;
  },

  // Cập nhật trạng thái phản hồi từ phần cứng
  async updateStatus(actionId, status, responseTime = new Date()) {
    const [result] = await pool.query(
      'UPDATE `Action` SET `status` = ?, `response_time` = ? WHERE `action_id` = ?',
      [status, responseTime, actionId]
    );
    return result.affectedRows > 0;
  },

  // Lấy chi tiết action theo ID
  async getById(actionId) {
    const query = `
      SELECT a.*, d.device_name, d.device_type, u.username, u.full_name
      FROM Action a
      INNER JOIN Devices d ON a.device_id = d.device_id
      INNER JOIN User u ON a.user_id = u.user_id
      WHERE a.action_id = ?
    `;
    const [rows] = await pool.query(query, [actionId]);
    return rows[0] || null;
  },

  // Lấy danh sách hoạt động gần đây (cho Dashboard)
  async getRecent(limit = 5) {
    const query = `
      SELECT a.action_id, a.device_id, d.device_name, d.device_type,
             a.action, a.status, a.time_sent, a.response_time,
             TIMESTAMPDIFF(MILLISECOND, a.time_sent, a.response_time) as duration_ms
      FROM Action a
      INNER JOIN Devices d ON a.device_id = d.device_id
      ORDER BY a.action_id DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(query, [Number(limit)]);
    return rows;
  },

  // Tra cứu toàn bộ lịch sử thao tác có bộ lọc (chuỗi thời gian, device, action, status) và phân trang
  async queryHistory({ deviceId, action, status, timeString, search, page = 1, limit = 10 }) {
    let whereClauses = [];
    let params = [];

    // 1. Tìm theo chuỗi thời gian và từ khóa (ID, Tên thiết bị, Action, Status, Thời gian)
    const targetQuery = (timeString || search || '').trim();
    if (targetQuery !== '') {
      const cleanedPattern = `%${targetQuery}%`;
      whereClauses.push(`(
        DATE_FORMAT(a.time_sent, '%Y/%m/%d %H:%i:%s') LIKE ?
        OR DATE_FORMAT(a.time_sent, '%Y-%m-%d %H:%i:%s') LIKE ?
        OR DATE_FORMAT(a.response_time, '%Y/%m/%d %H:%i:%s') LIKE ?
        OR DATE_FORMAT(a.response_time, '%Y-%m-%d %H:%i:%s') LIKE ?
        OR d.device_name LIKE ?
        OR CAST(a.action_id AS CHAR) LIKE ?
        OR a.action LIKE ?
        OR a.status LIKE ?
      )`);
      params.push(
        cleanedPattern,
        cleanedPattern,
        cleanedPattern,
        cleanedPattern,
        cleanedPattern,
        cleanedPattern,
        cleanedPattern,
        cleanedPattern
      );
    }

    if (deviceId && deviceId !== 'ALL') {
      whereClauses.push('a.device_id = ?');
      params.push(Number(deviceId));
    }

    if (action && action !== 'ALL') {
      whereClauses.push('a.action = ?');
      params.push(action);
    }

    if (status && status !== 'ALL') {
      if (status === 'ON') {
        whereClauses.push('(a.status = "ON" OR (a.status = "SUCCESS" AND a.action = "ON"))');
      } else if (status === 'OFF') {
        whereClauses.push('(a.status = "OFF" OR (a.status = "SUCCESS" AND a.action = "OFF"))');
      } else if (status === 'LOADING') {
        whereClauses.push('(a.status = "LOADING" OR a.status = "PENDING")');
      } else {
        whereClauses.push('a.status = ?');
        params.push(status);
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Đếm tổng số bản ghi
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM Action a INNER JOIN Devices d ON a.device_id = d.device_id ${whereSql}`,
      params
    );
    const total = countRows[0].total;

    const offset = (Number(page) - 1) * Number(limit);
    const query = `
      SELECT a.action_id, a.device_id, d.device_name, d.device_type,
             a.action, a.status, a.time_sent, a.response_time,
             TIMESTAMPDIFF(MILLISECOND, a.time_sent, a.response_time) as duration_ms
      FROM Action a
      INNER JOIN Devices d ON a.device_id = d.device_id
      ${whereSql}
      ORDER BY a.action_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [...params, Number(limit), Number(offset)]);

    // Thống kê tổng quan
    const [statsRows] = await pool.query(`
      SELECT 
        COUNT(*) as total_all,
        SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as total_success,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as total_failed
      FROM Action
    `);

    return {
      data: rows,
      stats: {
        total: statsRows[0].total_all || 0,
        success: statsRows[0].total_success || 0,
        failed: statsRows[0].total_failed || 0
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    };
  }
};

module.exports = Action;
