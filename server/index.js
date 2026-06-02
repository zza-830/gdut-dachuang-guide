const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 导入配置
const { testConnection, query } = require('./config/db');

// 导入定时任务
const { registerRolloverJob } = require('./jobs/competitionRollover');

// 导入路由
const apiRoutes = require('./routes');

// 导入中间件
const { notFound, errorHandler } = require('./middleware/errorHandler');

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// 中间件配置
// =====================================================

// CORS 配置
// Docker 部署时前端与 API 同源（均经 Nginx 反代），CORS 主要用于开发环境
// 生产环境通过 CORS_ORIGIN 白名单 + 反向代理检测双重放行，避免因 IP/域名变更而报错
app.use(cors({
  origin: function (origin, callback) {
    // 无 origin 的请求（如服务器间调用、同源请求）放行
    if (!origin) {
      return callback(null, true);
    }

    // 开发环境：允许 localhost 各端口
    if (process.env.NODE_ENV !== 'production') {
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }

    // 生产环境：允许 CORS_ORIGIN 中配置的域名
    const corsOrigin = process.env.CORS_ORIGIN || '';
    const allowedOrigins = corsOrigin.split(',').map(s => s.trim()).filter(Boolean);

    if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 生产环境兜底：反射请求的 origin
    // Docker 架构下前端与 API 同源（Nginx 反代），CORS 不是安全边界，
    // 真正的安全由 JWT 认证保障。避免因 CORS_ORIGIN 未及时更新导致用户无法使用。
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析 JSON 请求体
app.use(express.json({ limit: '10mb' }));

// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 (用于上传的文件)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 请求日志 (开发环境)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// =====================================================
// 路由配置
// =====================================================

// API 路由
app.use('/api', apiRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GDUT 大创平台后端服务',
    version: '1.0.0',
    documentation: '/api'
  });
});

// =====================================================
// 错误处理
// =====================================================

// 404 处理
app.use(notFound);

// 全局错误处理
app.use(errorHandler);

// =====================================================
// 启动服务器
// =====================================================

// 确保关键数据表存在，并补齐缺失列
const ensureTables = async () => {
  try {
    // 创建 audit_logs 表（如果不存在）
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT DEFAULT NULL,
        user_name VARCHAR(50) DEFAULT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) DEFAULT NULL,
        entity_id INT DEFAULT NULL,
        details TEXT,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent VARCHAR(255) DEFAULT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 补齐 audit_logs 可能缺失的列
    const auditCols = await query(`SHOW COLUMNS FROM audit_logs`);
    const auditColNames = auditCols.map(c => c.Field);
    if (!auditColNames.includes('user_name')) {
      await query(`ALTER TABLE audit_logs ADD COLUMN user_name VARCHAR(50) DEFAULT NULL AFTER user_id`);
      console.log('  ➕ Added missing column: audit_logs.user_name');
    }
    if (!auditColNames.includes('entity_type')) {
      await query(`ALTER TABLE audit_logs ADD COLUMN entity_type VARCHAR(50) DEFAULT NULL`);
      console.log('  ➕ Added missing column: audit_logs.entity_type');
    }
    if (!auditColNames.includes('entity_id')) {
      await query(`ALTER TABLE audit_logs ADD COLUMN entity_id INT DEFAULT NULL`);
      console.log('  ➕ Added missing column: audit_logs.entity_id');
    }
    if (!auditColNames.includes('details')) {
      await query(`ALTER TABLE audit_logs ADD COLUMN details TEXT`);
      console.log('  ➕ Added missing column: audit_logs.details');
    }
    if (!auditColNames.includes('ip_address')) {
      await query(`ALTER TABLE audit_logs ADD COLUMN ip_address VARCHAR(45) DEFAULT NULL`);
      console.log('  ➕ Added missing column: audit_logs.ip_address');
    }
    if (!auditColNames.includes('user_agent')) {
      await query(`ALTER TABLE audit_logs ADD COLUMN user_agent VARCHAR(255) DEFAULT NULL`);
      console.log('  ➕ Added missing column: audit_logs.user_agent');
    }
    if (!auditColNames.includes('timestamp')) {
      await query(`ALTER TABLE audit_logs ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      console.log('  ➕ Added missing column: audit_logs.timestamp');
    }

    // 创建 expenses 表（如果不存在）
    await query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        item_name VARCHAR(200) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        expense_date DATE NOT NULL,
        location VARCHAR(200) DEFAULT NULL,
        invoice_path VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_project_id (project_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 补齐 expenses 可能缺失的列
    const expCols = await query(`SHOW COLUMNS FROM expenses`);
    const expColNames = expCols.map(c => c.Field);
    if (!expColNames.includes('location')) {
      await query(`ALTER TABLE expenses ADD COLUMN location VARCHAR(200) DEFAULT NULL`);
      console.log('  ➕ Added missing column: expenses.location');
    }
    if (!expColNames.includes('invoice_path')) {
      await query(`ALTER TABLE expenses ADD COLUMN invoice_path VARCHAR(500) DEFAULT NULL`);
      console.log('  ➕ Added missing column: expenses.invoice_path');
    }

    // ── competitions 表：补齐动态状态所需的新字段 ──────────────────────────
    const compCols = await query(`SHOW COLUMNS FROM competitions`);
    const compColNames = compCols.map(c => c.Field);

    if (!compColNames.includes('start_time')) {
      await query(`ALTER TABLE competitions ADD COLUMN start_time DATETIME DEFAULT NULL COMMENT '赛事开始时间'`);
      console.log('  ➕ Added missing column: competitions.start_time');
    }
    if (!compColNames.includes('end_time')) {
      await query(`ALTER TABLE competitions ADD COLUMN end_time DATETIME DEFAULT NULL COMMENT '赛事结束时间'`);
      console.log('  ➕ Added missing column: competitions.end_time');
    }
    if (!compColNames.includes('needs_review')) {
      await query(`ALTER TABLE competitions ADD COLUMN needs_review TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否需要管理员核对日期（定时任务自动滚动后置1）'`);
      console.log('  ➕ Added missing column: competitions.needs_review');
    }
    if (!compColNames.includes('updated_at')) {
      await query(`ALTER TABLE competitions ADD COLUMN updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'`);
      console.log('  ➕ Added missing column: competitions.updated_at');
    }

    console.log('✅ Critical tables (audit_logs, expenses, competitions) ensured with all columns.');
  } catch (err) {
    console.error('⚠️  Table auto-creation/migration failed:', err.message);
  }
};

const startServer = async () => {
  try {
    // 测试数据库连接 (可选，如果数据库未配置则跳过)
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.log('⚠️  Database not connected. Running in limited mode.');
      console.log('   Please configure your .env file and ensure MySQL is running.');
    } else {
      // 确保关键表存在并补齐字段
      await ensureTables();

      // 注册竞赛跨年自动滚动定时任务
      registerRolloverJob();
    }

    // 启动 HTTP 服务器
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║       GDUT 大创平台后端服务已启动                      ║');
      console.log('╠════════════════════════════════════════════════════════╣');
      console.log(`║  🚀 Server:     http://localhost:${PORT}                  ║`);
      console.log(`║  📡 API:        http://localhost:${PORT}/api              ║`);
      console.log(`║  💚 Health:     http://localhost:${PORT}/api/health       ║`);
      console.log(`║  🌍 Environment: ${process.env.NODE_ENV || 'development'}                       ║`);
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('🚀 App is running! Open: http://localhost:5173');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// 启动服务器
startServer();

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
