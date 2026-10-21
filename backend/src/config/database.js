// backend/src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iot_home',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Hàm kiểm tra kết nối database
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ [MySQL Database] Kết nối thành công đến cơ sở dữ liệu:', process.env.DB_NAME || 'iot_home');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ [MySQL Database] Lỗi kết nối cơ sở dữ liệu:', error.message);
    console.warn('⚠️ Gợi ý: Hãy đảm bảo MySQL Server đang chạy và đã import file database/schema.sql');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
