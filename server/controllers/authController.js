/**
 * 认证控制器
 * 处理用户注册、登录、获取用户信息等功能
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');

/**
 * 用户注册
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { student_id, password, name, email, phone, department, major, grade } = req.body;

    // 验证必填字段
    if (!student_id || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '学号、密码和姓名为必填项'
      });
    }

    // 检查学号是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE student_id = ?',
      [student_id]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: '该学号已被注册'
      });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 插入新用户
    const result = await query(
      `INSERT INTO users (student_id, password, name, email, phone, department, major, grade, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'student')`,
      [student_id, hashedPassword, name, email || null, phone || null, department || null, major || null, grade || null]
    );

    // 生成 JWT
    const token = jwt.sign(
      { id: result.insertId, student_id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: result.insertId,
          student_id,
          name,
          role: 'student'
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
};

/**
 * 用户登录
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { student_id, password } = req.body;

    // 验证必填字段
    if (!student_id || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入学号/用户名和密码'
      });
    }

    // 查找用户 - 同时支持学号和自定义用户名登录
    const users = await query(
      'SELECT * FROM users WHERE student_id = ? OR username = ?',
      [student_id, student_id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '学号/用户名或密码错误'
      });
    }

    const user = users[0];

    // 检查账户是否激活
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用，请联系管理员'
      });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '学号/用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, student_id: user.student_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
};

/**
 * 获取当前用户信息
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await query(
      'SELECT id, student_id, name, email, phone, role, avatar, department, major, grade, is_active, last_login, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

/**
 * 更新用户信息
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, department, major, grade } = req.body;

    await query(
      `UPDATE users SET name = COALESCE(?, name), email = ?, phone = ?, department = ?, major = ?, grade = ? WHERE id = ?`,
      [name, email || null, phone || null, department || null, major || null, grade || null, userId]
    );

    // 获取更新后的用户信息
    const users = await query(
      'SELECT id, student_id, name, email, phone, role, avatar, department, major, grade, is_active, last_login, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: '更新成功',
      data: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
};

/**
 * 修改密码
 * PUT /api/auth/password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    // 兼容 camelCase 和 snake_case
    const oldPassword = req.body.oldPassword || req.body.old_password;
    const newPassword = req.body.newPassword || req.body.new_password;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请输入旧密码和新密码'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密码长度至少为6位'
      });
    }

    // 获取当前密码
    const users = await query('SELECT password FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, users[0].password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '旧密码错误'
      });
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败'
    });
  }
};

/**
 * 上传头像
 * POST /api/auth/avatar
 */
const uploadAvatar = async (req, res) => {
  try {
    // 运行时确保头像目录存在（防止 Docker 容器重建后目录丢失）
    const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择头像文件' });
    }

    const userId = req.user.id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, userId]);

    // 返回更新后的用户信息
    const users = await query(
      'SELECT id, student_id, name, email, phone, role, avatar, department, major, grade, is_active, last_login, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ success: true, message: '头像上传成功', data: users[0] });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: '头像上传失败' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar
};
