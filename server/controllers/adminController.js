const { query } = require('../config/db');

/**
 * 获取所有用户列表 (仅管理员)
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const users = await query(
      'SELECT id, student_id, username, name, role, email, department, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: '获取用户列表失败' });
  }
};

/**
 * 删除用户 (仅管理员，不能删除自己)
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: '不能删除自己的账户' });
    }
    const result = await query('DELETE FROM users WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({ success: true, message: '用户已删除' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: '删除用户失败' });
  }
};

module.exports = { getUsers, deleteUser };
