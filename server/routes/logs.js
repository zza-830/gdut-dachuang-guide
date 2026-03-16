const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { getProjectLogs, createLog, deleteLog, batchDeleteLogs, clearProjectLogs } = require('../controllers/logController');

// 获取项目日志
router.get('/:projectId', authenticate, getProjectLogs);

// 创建日志
router.post('/', authenticate, createLog);

// 批量删除日志（必须在 /:id 之前，否则 "batch" 会被当作 :id）
router.delete('/batch', authenticate, isAdmin, batchDeleteLogs);

// 清空项目所有日志
router.delete('/clear/:projectId', authenticate, isAdmin, clearProjectLogs);

// 删除单条日志
router.delete('/:id', authenticate, isAdmin, deleteLog);

module.exports = router;
