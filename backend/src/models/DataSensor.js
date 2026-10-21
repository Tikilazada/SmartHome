// backend/src/models/DataSensor.js
const { pool } = require('../config/database');

const DataSensor = {
  // Ghi nhận bản ghi dữ liệu cảm biến mới
  async create(sensorId, value, recordedAt = new Date()) {
    const [result] = await pool.query(
      'INSERT INTO `Data_Sensor` (`sensor_id`, `value`, `recorded_at`) VALUES (?, ?, ?)',
      [sensorId, value, recordedAt]
    );
    return result.insertId;
  },

  // Lấy giá trị mới nhất của cả 3 cảm biến (Nhiệt độ, Độ ẩm, Ánh sáng)
  async getLatestMetrics() {
    const query = `
      SELECT ds.data_id, ds.sensor_id, s.sensor_name, s.sensor_type, s.unit, ds.value, ds.recorded_at
      FROM Data_Sensor ds
      INNER JOIN Sensors s ON ds.sensor_id = s.sensor_id
      INNER JOIN (
        SELECT sensor_id, MAX(data_id) as max_data_id
        FROM Data_Sensor
        GROUP BY sensor_id
      ) latest ON ds.data_id = latest.max_data_id
      ORDER BY s.sensor_id ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
  },

  // Lấy dữ liệu biểu đồ theo khoảng thời gian
  async getChartHistory(range = '24h') {
    let intervalLimit = 'INTERVAL 24 HOUR';
    if (range === '1h') intervalLimit = 'INTERVAL 1 HOUR';
    else if (range === '6h') intervalLimit = 'INTERVAL 6 HOUR';
    else if (range === '7d') intervalLimit = 'INTERVAL 7 DAY';

    const query = `
      SELECT ds.data_id, ds.sensor_id, s.sensor_name, s.unit, ds.value, ds.recorded_at
      FROM Data_Sensor ds
      INNER JOIN Sensors s ON ds.sensor_id = s.sensor_id
      WHERE ds.recorded_at >= DATE_SUB(NOW(), ${intervalLimit})
      ORDER BY ds.recorded_at ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
  },

  // Tra cứu dữ liệu cảm biến kèm 3 cách tìm kiếm (Chuỗi thời gian YYYY/MM/DD/HH/mm/ss, Cảm biến, Trạng thái) & phân trang
  async queryHistory({ sensorType, sensorId, search, timeString, status, startDate, endDate, page = 1, limit = 10 }) {
    let whereClauses = [];
    let params = [];

    // 1. Tìm kiếm theo chuỗi thời gian (form năm/tháng/ngày/giờ/phút/giây hoặc substring)
    const targetTime = (timeString || search || '').trim();
    if (targetTime !== '') {
      // Chuẩn hóa chuỗi thời gian tìm kiếm
      const cleanedPattern = `%${targetTime}%`;
      whereClauses.push(`(
        DATE_FORMAT(ds.recorded_at, '%Y/%m/%d/%H/%i/%s') LIKE ?
        OR DATE_FORMAT(ds.recorded_at, '%Y/%m/%d %H:%i:%s') LIKE ?
        OR DATE_FORMAT(ds.recorded_at, '%Y-%m-%d %H:%i:%s') LIKE ?
        OR DATE_FORMAT(ds.recorded_at, '%d/%m/%Y %H:%i:%s') LIKE ?
        OR CAST(ds.recorded_at AS CHAR) LIKE ?
        OR CAST(ds.value AS CHAR) LIKE ?
      )`);
      params.push(cleanedPattern, cleanedPattern, cleanedPattern, cleanedPattern, cleanedPattern, cleanedPattern);
    }

    // 2. Lọc theo cảm biến (Sensor Type / Name)
    if (sensorType && sensorType !== 'ALL') {
      whereClauses.push('(s.sensor_name LIKE ? OR s.sensor_type LIKE ?)');
      params.push(`%${sensorType}%`, `%${sensorType}%`);
    }

    if (sensorId && sensorId.trim() !== '') {
      whereClauses.push('(CAST(ds.sensor_id AS CHAR) LIKE ? OR s.sensor_type LIKE ?)');
      params.push(`%${sensorId}%`, `%${sensorId}%`);
    }

    // 3. Lọc theo trạng thái (NORMAL / WARNING / DANGER)
    if (status && status !== 'ALL') {
      if (status === 'NORMAL') {
        whereClauses.push(`(
          (s.sensor_name LIKE '%Nhiệt độ%' AND ds.value >= 18 AND ds.value <= 32)
          OR (s.sensor_name LIKE '%Độ ẩm%' AND ds.value >= 40 AND ds.value <= 80)
          OR (s.sensor_name LIKE '%Ánh sáng%' AND ds.value >= 100 AND ds.value <= 1000)
        )`);
      } else if (status === 'WARNING') {
        whereClauses.push(`(
          (s.sensor_name LIKE '%Nhiệt độ%' AND ((ds.value >= 15 AND ds.value < 18) OR (ds.value > 32 AND ds.value <= 37)))
          OR (s.sensor_name LIKE '%Độ ẩm%' AND ((ds.value >= 30 AND ds.value < 40) OR (ds.value > 80 AND ds.value <= 90)))
          OR (s.sensor_name LIKE '%Ánh sáng%' AND ((ds.value >= 50 AND ds.value < 100) OR (ds.value > 1000 AND ds.value <= 1500)))
        )`);
      } else if (status === 'DANGER') {
        whereClauses.push(`(
          (s.sensor_name LIKE '%Nhiệt độ%' AND (ds.value < 15 OR ds.value > 37))
          OR (s.sensor_name LIKE '%Độ ẩm%' AND (ds.value < 30 OR ds.value > 90))
          OR (s.sensor_name LIKE '%Ánh sáng%' AND (ds.value < 50 OR ds.value > 1500))
        )`);
      }
    }

    if (startDate) {
      whereClauses.push('ds.recorded_at >= ?');
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      whereClauses.push('ds.recorded_at <= ?');
      params.push(`${endDate} 23:59:59`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Đếm tổng số bản ghi
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM Data_Sensor ds INNER JOIN Sensors s ON ds.sensor_id = s.sensor_id ${whereSql}`,
      params
    );
    const total = countRows[0].total;

    // Lấy dữ liệu trang hiện tại
    const offset = (Number(page) - 1) * Number(limit);
    const query = `
      SELECT ds.data_id, ds.sensor_id, s.sensor_name, s.sensor_type, s.unit, ds.value, ds.recorded_at
      FROM Data_Sensor ds
      INNER JOIN Sensors s ON ds.sensor_id = s.sensor_id
      ${whereSql}
      ORDER BY ds.data_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [...params, Number(limit), Number(offset)]);

    return {
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    };
  }
};

module.exports = DataSensor;
