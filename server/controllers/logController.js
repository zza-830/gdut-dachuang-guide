const { query } = require('../config/db');

/**
 * 获取项目审计日志
 * GET /api/logs/:projectId
 */
const getProjectLogs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const pid = parseInt(projectId);
    console.log('[AuditLog] Fetching logs for project:', pid, 'limit:', limit, 'offset:', offset);

    // All audit logs now use entity_type='project' + entity_id=projectId consistently
    // Note: mysql2 execute() (prepared statements) can have issues with LIMIT/OFFSET params,
    // so we interpolate the already-sanitized integer values directly.
    const logs = await query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id, al.details,
              al.timestamp AS created_at,
              COALESCE(al.user_name, u.name, '未知用户') AS user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = 'project' AND al.entity_id = ?
       ORDER BY al.timestamp DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [pid]
    );

    // Get total count for pagination
    const countRows = await query(
      `SELECT COUNT(*) AS total FROM audit_logs WHERE entity_type = 'project' AND entity_id = ?`,
      [pid]
    );
    const countResult = countRows[0];
    const total = countResult ? countResult.total : 0;

    console.log('[AuditLog] Logs fetched for project', pid, ':', logs.length, 'rows, total:', total);
    res.json({ success: true, data: logs, total });
  } catch (error) {
    console.error('Get project logs error:', error);
    res.status(500).json({ success: false, message: '获取日志失败' });
  }
};

/**
 * 创建审计日志
 * POST /api/logs
 */
const createLog = async (req, res) => {
  try {
    const { action, entity_type, entity_id, details } = req.body;

    // Resolve user name
    let userName = req.user.name;
    if (!userName) {
      const [user] = await query('SELECT name FROM users WHERE id = ?', [req.user.id]);
      userName = user ? user.name : '未知用户';
    }

    const result = await query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, userName, action, entity_type || null, entity_id || null, JSON.stringify(details || {})]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ success: false, message: '创建日志失败' });
  }
};

/**
 * 删除单条审计日志
 * DELETE /api/logs/:id
 */
const deleteLog = async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    if (isNaN(logId)) {
      return res.status(400).json({ success: false, message: '无效的日志ID' });
    }
    const result = await query('DELETE FROM audit_logs WHERE id = ?', [logId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '日志不存在' });
    }
    res.json({ success: true, message: '日志已删除' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ success: false, message: '删除日志失败' });
  }
};

/**
 * 批量删除审计日志
 * DELETE /api/logs/batch
 * Body: { ids: [1, 2, 3] }
 */
const batchDeleteLogs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '请提供要删除的日志ID列表' });
    }
    const safeIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    if (safeIds.length === 0) {
      return res.status(400).json({ success: false, message: '无有效的日志ID' });
    }
    const placeholders = safeIds.map(() => '?').join(',');
    const result = await query(`DELETE FROM audit_logs WHERE id IN (${placeholders})`, safeIds);
    res.json({ success: true, message: `已删除 ${result.affectedRows} 条日志` });
  } catch (error) {
    console.error('Batch delete logs error:', error);
    res.status(500).json({ success: false, message: '批量删除日志失败' });
  }
};

/**
 * 清空项目所有审计日志
 * DELETE /api/logs/clear/:projectId
 */
const clearProjectLogs = async (req, res) => {
  try {
    const pid = parseInt(req.params.projectId);
    if (isNaN(pid)) {
      return res.status(400).json({ success: false, message: '无效的项目ID' });
    }
    const result = await query(
      "DELETE FROM audit_logs WHERE entity_type = 'project' AND entity_id = ?",
      [pid]
    );
    res.json({ success: true, message: `已清空 ${result.affectedRows} 条日志` });
  } catch (error) {
    console.error('Clear project logs error:', error);
    res.status(500).json({ success: false, message: '清空日志失败' });
  }
};

module.exports = { getProjectLogs, createLog, deleteLog, batchDeleteLogs, clearProjectLogs };
