const express = require('express');
const router = express.Router();

// 导入子路由
const authRoutes = require('./auth');
const fileRoutes = require('./files');
const logRoutes = require('./logs');
const competitionRoutes = require('./competitions');
const guideCompetitionRoutes = require('./guideCompetitions');
const adminRoutes = require('./admin');
const projectRoutes = require('./projects');
const expenseRoutes = require('./expenses');
const aiRoutes = require('./ai');
const userRoutes = require('./users');

/**
 * API 健康检查
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * API 信息
 * GET /api
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GDUT 大创平台 API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      users: {
        list: 'GET /api/users',
        detail: 'GET /api/users/:id'
      },
      projects: {
        list: 'GET /api/projects',
        create: 'POST /api/projects',
        detail: 'GET /api/projects/:id',
        update: 'PUT /api/projects/:id',
        delete: 'DELETE /api/projects/:id'
      },
      files: {
        upload: 'POST /api/files/upload',
        download: 'GET /api/files/:id/download'
      }
    }
  });
});

// 注册子路由
router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/logs', logRoutes);
router.use('/competitions', competitionRoutes);
router.use('/guide-competitions', guideCompetitionRoutes);
router.use('/admin', adminRoutes);
router.use('/projects', projectRoutes);
router.use('/expenses', expenseRoutes);
router.use('/ai', aiRoutes);
router.use('/users', userRoutes);

module.exports = router;
