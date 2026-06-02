const { query } = require('../config/db');

/**
 * 搜索用户 (根据学号或姓名)
 * GET /api/users/search?q=xxx
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, data: [] });
    }
    
    const searchTerm = `%${q.trim()}%`;
    
    const users = await query(
      `SELECT id, name, student_id 
       FROM users 
       WHERE name LIKE ? OR student_id LIKE ? 
       LIMIT 20`,
      [searchTerm, searchTerm]
    );

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: '搜索用户失败' });
  }
};

module.exports = { searchUsers };
