const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createProject,
  getProjects,
  getProject,
  updateFunding,
  updateTeam,
  deleteProject,
  renameProject
} = require('../controllers/projectController');

// 获取当前用户的项目列表
router.get('/', authenticate, getProjects);

// 创建项目
router.post('/', authenticate, createProject);

// 获取单个项目详情
router.get('/:id', authenticate, getProject);

// 更新经费
router.patch('/:id/funding', authenticate, updateFunding);

// 更新团队成员
router.patch('/:id/team', authenticate, updateTeam);

// 重命名项目
router.patch('/:id/name', authenticate, renameProject);

// 删除项目
router.delete('/:id', authenticate, deleteProject);

module.exports = router;
