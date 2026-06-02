const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// 搜索用户
router.get('/search', authenticate, userController.searchUsers);

module.exports = router;
