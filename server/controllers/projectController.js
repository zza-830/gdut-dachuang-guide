const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLog');

const { pool } = require('../config/db');

/**
 * 创建项目 — 插入创建者为 captain，并写入 project_members 表
 * POST /api/projects
 */
const createProject = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { title, duration, description } = req.body;
    if (!title || !title.trim()) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: '项目名称不能为空' });
    }

    const [users] = await connection.query(
      'SELECT name FROM users WHERE id = ?',
      [req.user.id]
    );
    const userName = users.length > 0 ? users[0].name : '未知用户';

    const [result] = await connection.query(
      `INSERT INTO projects (user_id, title, description, status, budget, spent_budget)
       VALUES (?, ?, ?, 'pending', 0, 0)`,
      [req.user.id, title.trim(), description || '']
    );
    const projectId = result.insertId;

    await connection.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'captain')`,
      [projectId, req.user.id]
    );

    await connection.commit();

    logAudit({
      userId: req.user.id,
      userName,
      action: 'create_project',
      entityType: 'project',
      entityId: projectId,
      details: { project_id: projectId, name: title.trim() }
    }).catch(err => console.error('[AuditLog] create_project failed:', err.message));

    res.status(201).json({
      success: true,
      message: '项目创建成功',
      data: {
        id: projectId,
        title: title.trim(),
        status: 'pending',
        role: '队长'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: '创建项目失败' });
  } finally {
    connection.release();
  }
};

/**
 * 获取当前用户的项目列表（包含作为成员参与的项目）
 * GET /api/projects
 */
const getProjects = async (req, res) => {
  try {
    const projects = await query(
      `SELECT p.id, p.title, p.status, p.budget, p.spent_budget, p.created_at, pm.role 
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    const mapped = projects.map(p => {
      const roleMap = { captain: '队长', member: '成员', advisor: '指导老师' };
      const statusMap = { draft: 'pending', pending: 'pending', approved: 'active', in_progress: 'active', midterm: 'active', concluded: 'completed', rejected: 'pending' };
      return {
        id: p.id,
        name: p.title,
        role: roleMap[p.role] || '成员',
        status: statusMap[p.status] || 'active',
        budget: parseFloat(p.budget) || 0,
        spent_budget: parseFloat(p.spent_budget) || 0,
        created_at: p.created_at
      };
    });

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: '获取项目列表失败' });
  }
};

/**
 * 获取单个项目详情及成员
 * GET /api/projects/:id
 */
const getProject = async (req, res) => {
  try {
    const [project] = await query(
      `SELECT p.*, u.name AS owner_name
       FROM projects p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!project) {
      return res.status(404).json({ success: false, message: '项目不存在' });
    }

    // 检查访问权限
    const authCheck = await query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (authCheck.length === 0 && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, message: '无权访问该项目' });
    }

    const teamMembers = await query(
      `SELECT u.id, u.name, u.student_id, u.email, u.phone, u.department, u.major, u.grade, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...project,
        currentUserRole: authCheck.length > 0 ? authCheck[0].role : null,
        team_members: teamMembers.map(m => ({
          id: m.id,
          name: m.name,
          studentId: m.student_id,
          email: m.email,
          phone: m.phone,
          department: m.department,
          major: m.major,
          grade: m.grade,
          role: m.role,
          joinedAt: m.joined_at
        })),
        budget: parseFloat(project.budget) || 0,
        spent_budget: parseFloat(project.spent_budget) || 0
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, message: '获取项目详情失败' });
  }
};

/**
 * 更新项目经费总额
 * PATCH /api/projects/:id/funding
 */
const updateFunding = async (req, res) => {
  try {
    let { budget } = req.body;
    budget = parseFloat(budget);

    if (isNaN(budget)) {
      return res.status(400).json({ success: false, message: '经费金额无效' });
    }
    // Clamp 0 ~ 20000
    if (budget < 0) budget = 0;
    if (budget > 20000) budget = 20000;

    // Fetch previous budget for audit context
    const [prev] = await query('SELECT budget FROM projects WHERE id = ?', [req.params.id]);
    const oldBudget = prev ? parseFloat(prev.budget) || 0 : 0;

    await query('UPDATE projects SET budget = ? WHERE id = ?', [budget, req.params.id]);

    await logAudit({
      userId: req.user.id,
      action: 'update_funding',
      entityType: 'project',
      entityId: req.params.id,
      details: { project_id: parseInt(req.params.id), old_budget: oldBudget, new_budget: budget }
    });

    res.json({ success: true, data: { budget } });
  } catch (error) {
    console.error('Update funding error:', error);
    res.status(500).json({ success: false, message: '更新经费失败' });
  }
};

/**
 * 添加项目成员
 * POST /api/projects/:id/members
 */
const addMember = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId, role } = req.body;
    const projectId = req.params.id;

    if (!userId) {
      connection.release();
      return res.status(400).json({ success: false, message: '必须提供用户ID' });
    }

    await connection.beginTransaction();

    // 检查是否有权限 (必须是 captain)
    const [authCheck] = await connection.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if (authCheck.length === 0 || authCheck[0].role !== 'captain') {
       await connection.rollback();
       connection.release();
       return res.status(403).json({ success: false, message: '只有本项目的队长可以添加成员' });
    }

    // 检查用户是否存在
    const [users] = await connection.query('SELECT name FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
       await connection.rollback();
       connection.release();
       return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 检查是否已经是成员
    const [existing] = await connection.query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
    if (existing.length > 0) {
       await connection.rollback();
       connection.release();
       return res.status(400).json({ success: false, message: '该用户已经是项目成员' });
    }

    await connection.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, role || 'member']
    );

    await connection.commit();

    await logAudit({
      userId: req.user.id,
      action: 'add_member',
      entityType: 'project',
      entityId: parseInt(projectId),
      details: { project_id: parseInt(projectId), added_user_id: userId, added_user_name: users[0].name }
    });

    res.json({ success: true, message: '添加成员成功' });
  } catch (error) {
    await connection.rollback();
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: '添加成员失败' });
  } finally {
    connection.release();
  }
};

/**
 * 移除项目成员
 * DELETE /api/projects/:id/members/:userId
 */
const removeMember = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const projectId = req.params.id;
    const targetUserId = req.params.userId;

    await connection.beginTransaction();

    // 检查权限
    const [authCheck] = await connection.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if ((authCheck.length === 0 || authCheck[0].role !== 'captain') && req.user.id != targetUserId) {
       await connection.rollback();
       connection.release();
       return res.status(403).json({ success: false, message: '无权移除该成员' });
    }

    const [target] = await connection.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, targetUserId]
    );
    if (target.length === 0) {
       await connection.rollback();
       connection.release();
       return res.status(404).json({ success: false, message: '成员不存在' });
    }
    if (target[0].role === 'captain') {
       await connection.rollback();
       connection.release();
       return res.status(400).json({ success: false, message: '不能移除队长，请先转让队长身份' });
    }

    const [users] = await connection.query('SELECT name FROM users WHERE id = ?', [targetUserId]);

    await connection.query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, targetUserId]
    );

    await connection.commit();

    await logAudit({
      userId: req.user.id,
      action: 'remove_member',
      entityType: 'project',
      entityId: parseInt(projectId),
      details: { project_id: parseInt(projectId), removed_user_id: targetUserId, removed_user_name: users.length > 0 ? users[0].name : 'Unknown' }
    });

    res.json({ success: true, message: '移除成员成功' });
  } catch (error) {
    await connection.rollback();
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: '移除成员失败' });
  } finally {
    connection.release();
  }
};

/**
 * 删除项目
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res) => {
  try {
    const result = await query('DELETE FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '项目不存在或无权删除' });
    }
    res.json({ success: true, message: '项目已删除' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: '删除项目失败' });
  }
};

/**
 * 重命名项目
 * PATCH /api/projects/:id/name
 */
const renameProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: '项目名称不能为空' });
    }
    const trimmedName = name.trim();

    // 验证项目归属
    const [prev] = await query(
      'SELECT title FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!prev) {
      return res.status(404).json({ success: false, message: '项目不存在或无权修改' });
    }

    // 名称未变化时直接返回成功，无需写库
    if (prev.title === trimmedName) {
      return res.json({ success: true, data: { id: req.params.id, name: trimmedName } });
    }

    await query(
      'UPDATE projects SET title = ? WHERE id = ? AND user_id = ?',
      [trimmedName, req.params.id, req.user.id]
    );

    logAudit({
      userId: req.user.id,
      action: 'rename_project',
      entityType: 'project',
      entityId: parseInt(req.params.id),
      details: { project_id: parseInt(req.params.id), old_name: prev.title, new_name: trimmedName }
    }).catch(err => console.error('[AuditLog] rename_project failed:', err.message));

    res.json({ success: true, data: { id: req.params.id, name: trimmedName } });
  } catch (error) {
    console.error('Rename project error:', error);
    res.status(500).json({ success: false, message: '重命名项目失败' });
  }
};

module.exports = { createProject, getProjects, getProject, updateFunding, addMember, removeMember, deleteProject, renameProject };
