const { query } = require('../config/db');

// ─────────────────────────────────────────────
//  动态状态计算表达式（SQL CASE）
//  规则：
//    未开始 : NOW() < start_time
//    进行中 : start_time <= NOW() <= end_time
//    已结束 : end_time < NOW() < end_time + 2 个月
//    (超过2月后由定时任务滚入下一年度，仍显示"未开始")
// ─────────────────────────────────────────────
const DYNAMIC_STATUS_EXPR = `
  CASE
    WHEN start_time IS NULL OR end_time IS NULL THEN status
    WHEN NOW() < start_time                              THEN '未开始'
    WHEN NOW() BETWEEN start_time AND end_time           THEN '进行中'
    WHEN NOW() > end_time
         AND NOW() < DATE_ADD(end_time, INTERVAL 2 MONTH) THEN '已结束'
    ELSE status
  END
`.trim();

// GET /api/competitions - 获取竞赛列表（动态状态）
exports.getCompetitions = async (req, res) => {
  try {
    const { category, level, status, search } = req.query;

    // 主查询：用子查询包裹，让外层可以直接 WHERE computed_status
    let innerSql = `
      SELECT
        id, name, category, level, organizer, timeline, deadline,
        participants, start_time, end_time, needs_review,
        (${DYNAMIC_STATUS_EXPR}) AS computed_status
      FROM competitions
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      innerSql += ' AND category = ?';
      params.push(category);
    }
    if (level) {
      innerSql += ' AND level = ?';
      params.push(level);
    }
    if (search) {
      innerSql += ' AND (name LIKE ? OR organizer LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 包裹为子查询，在外层按动态状态过滤并排序
    let sql = `SELECT * FROM (${innerSql}) AS t WHERE 1=1`;

    if (status) {
      sql += ' AND computed_status = ?';
      params.push(status);
    }

    sql += ` ORDER BY
      FIELD(level, '特级', '一级', '二级', '三A级', '三B级', '三级'),
      name`;

    const rows = await query(sql, params);

    // 将计算出的状态以 "status" 键返回，保持前端兼容
    const result = rows.map(r => ({
      ...r,
      status: r.computed_status,
    }));

    res.json(result);
  } catch (err) {
    console.error('getCompetitions error:', err.message);
    res.status(500).json({ error: '获取竞赛列表失败' });
  }
};

// GET /api/competitions/review - 获取待审核竞赛列表（needs_review = 1）
exports.getReviewList = async (req, res) => {
  try {
    const sql = `
      SELECT id, name, organizer, level, category,
             start_time, end_time, deadline, needs_review,
             (${DYNAMIC_STATUS_EXPR}) AS computed_status
      FROM competitions
      WHERE needs_review = 1
      ORDER BY name
    `;
    const rows = await query(sql);
    const result = rows.map(r => ({ ...r, status: r.computed_status }));
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('getReviewList error:', err.message);
    res.status(500).json({ success: false, error: '获取审核列表失败' });
  }
};

// PUT /api/competitions/:id/review - 提交核对后的起止时间，清除 needs_review 标记
exports.submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({ success: false, error: '起止时间不能为空' });
    }
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({ success: false, error: '开始时间必须早于结束时间' });
    }

    const sql = `
      UPDATE competitions
      SET start_time = ?, end_time = ?, needs_review = 0
      WHERE id = ?
    `;
    const result = await query(sql, [start_time, end_time, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: '竞赛不存在' });
    }
    res.json({ success: true, message: '审核完成，时间已更新' });
  } catch (err) {
    console.error('submitReview error:', err.message);
    res.status(500).json({ success: false, error: '提交审核失败' });
  }
};

// GET /api/competitions/:id - 获取竞赛详情（动态状态）
exports.getCompetitionById = async (req, res) => {
  try {
    const sql = `
      SELECT
        *,
        (${DYNAMIC_STATUS_EXPR}) AS computed_status
      FROM competitions
      WHERE id = ?
    `;
    const rows = await query(sql, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '竞赛不存在' });
    }
    const row = rows[0];
    res.json({ ...row, status: row.computed_status });
  } catch (err) {
    console.error('getCompetitionById error:', err.message);
    res.status(500).json({ error: '获取竞赛详情失败' });
  }
};
