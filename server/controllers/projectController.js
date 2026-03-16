const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLog');

/**
 * 创建项目 — 只插入创建者为 Leader，不插入任何 mock 成员
 * POST /api/projects
 */
const createProject = async (req, res) => {
  try {
    const { title, duration, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: '项目名称不能为空' });
    }

    // JWT only has {id, student_id, role} — fetch full user info from DB
    const [userInfo] = await query(
      'SELECT name, email, phone FROM users WHERE id = ?',
      [req.user.id]
    );
    const userName = userInfo ? userInfo.name : '未知用户';

    // team_members JSON: only the creator as leader
    const teamMembers = JSON.stringify([
      {
        id: req.user.id,
        name: userName,
        role: 'captain',
        studentId: req.user.student_id || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        className: '',
        lab: ''
      }
    ]);

    const result = await query(
      `INSERT INTO projects (user_id, title, description, team_members, status, budget, spent_budget)
       VALUES (?, ?, ?, ?, 'pending', 0, 0)`,
      [req.user.id, title.trim(), description || '', teamMembers]
    );

    // Audit log — fire and forget, don't block the response
    logAudit({
      userId: req.user.id,
      userName,
      action: 'create_project',
      entityType: 'project',
      entityId: result.insertId,
      details: { project_id: result.insertId, name: title.trim() }
    }).catch(err => console.error('[AuditLog] create_project failed:', err.message));

    res.status(201).json({
      success: true,
      message: '项目创建成功',
      data: {
        id: result.insertId,
        title: title.trim(),
        status: 'pending',
        role: '队长'
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: '创建项目失败' });
  }
};

/**
 * 获取当前用户的项目列表
 * GET /api/projects
 */
const getProjects = async (req, res) => {
  try {
    const projects = await query(
      `SELECT id, title, status, budget, spent_budget, team_members, created_at
       FROM projects
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const mapped = projects.map(p => {
      let role = '队长';
      try {
        const members = typeof p.team_members === 'string' ? JSON.parse(p.team_members) : p.team_members;
        const me = members?.find(m => m.id === req.user.id);
        role = me?.role === 'captain' ? '队长' : '成员';
      } catch { /* ignore */ }

      const statusMap = { draft: 'pending', pending: 'pending', approved: 'active', in_progress: 'active', midterm: 'active', concluded: 'completed', rejected: 'pending' };
      return {
        id: p.id,
        name: p.title,
        role,
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
 * 获取单个项目详情
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

    let teamMembers = [];
    try {
      teamMembers = typeof project.team_members === 'string'
        ? JSON.parse(project.team_members)
        : (project.team_members || []);
    } catch { teamMembers = []; }

    // 动态刷新成员姓名：从 users 表获取最新名字
    if (teamMembers.length > 0) {
      const memberIds = teamMembers.map(m => m.id).filter(id => id != null);
      if (memberIds.length > 0) {
        const placeholders = memberIds.map(() => '?').join(',');
        const latestUsers = await query(
          `SELECT id, name, email, phone FROM users WHERE id IN (${placeholders})`,
          memberIds
        );
        const userMap = {};
        latestUsers.forEach(u => { userMap[u.id] = u; });
        teamMembers = teamMembers.map(m => {
          const latest = userMap[m.id];
          if (latest) {
            return { ...m, name: latest.name, email: latest.email || m.email, phone: latest.phone || m.phone };
          }
          return m;
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...project,
        team_members: teamMembers,
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
 * 更新项目团队成员
 * PATCH /api/projects/:id/team
 */
const updateTeam = async (req, res) => {
  try {
    const { team_members } = req.body;
    if (!Array.isArray(team_members)) {
      return res.status(400).json({ success: false, message: '团队成员数据无效' });
    }

    // Fetch old team for diff
    const [proj] = await query('SELECT team_members FROM projects WHERE id = ?', [req.params.id]);
    let oldTeam = [];
    try {
      oldTeam = proj ? (typeof proj.team_members === 'string' ? JSON.parse(proj.team_members) : (proj.team_members || [])) : [];
    } catch { oldTeam = []; }

    await query('UPDATE projects SET team_members = ? WHERE id = ?', [JSON.stringify(team_members), req.params.id]);

    // Compute diff: added / removed members
    const oldIds = new Set(oldTeam.map(m => m.id));
    const newIds = new Set(team_members.map(m => m.id));
    const added = team_members.filter(m => !oldIds.has(m.id)).map(m => m.name);
    const removed = oldTeam.filter(m => !newIds.has(m.id)).map(m => m.name);

    const pid = parseInt(req.params.id);

    if (added.length > 0) {
      await logAudit({
        userId: req.user.id,
        action: 'add_member',
        entityType: 'project',
        entityId: pid,
        details: { project_id: pid, added_members: added }
      });
    }
    if (removed.length > 0) {
      await logAudit({
        userId: req.user.id,
        action: 'remove_member',
        entityType: 'project',
        entityId: pid,
        details: { project_id: pid, removed_members: removed }
      });
    }
    // If roles changed but no add/remove, log a generic update
    if (added.length === 0 && removed.length === 0 && JSON.stringify(oldTeam) !== JSON.stringify(team_members)) {
      await logAudit({
        userId: req.user.id,
        action: 'update_team',
        entityType: 'project',
        entityId: pid,
        details: { project_id: pid, member_count: team_members.length }
      });
    }

    res.json({ success: true, data: { team_members } });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ success: false, message: '更新团队失败' });
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

module.exports = { createProject, getProjects, getProject, updateFunding, updateTeam, deleteProject, renameProject };
