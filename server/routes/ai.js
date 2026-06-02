const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { polishWithQwen, generateDeepSeekContent } = require('../controllers/aiController');

// 所有 AI 接口都需要登录认证，防止未授权调用
router.post('/qwen', authenticate, polishWithQwen);
router.post('/deepseek', authenticate, generateDeepSeekContent);

module.exports = router;
