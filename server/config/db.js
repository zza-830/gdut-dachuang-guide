const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gdut_dachuang',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Please check your .env configuration and ensure MySQL is running.');
    return false;
  }
};

// 执行查询的辅助函数
// 使用 pool.query() 而非 pool.execute()，避免预处理语句在连接池中缓存失效的问题
const query = async (sql, params) => {
  try {
    const [results] = await pool.query(sql, params || []);
    return results;
  } catch (error) {
    console.error('Database query error:', error.message, '\nSQL:', sql);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  query
};
