const { query } = require('../config/db');

// GET /api/guide-competitions - list all guide competitions
exports.getGuideCompetitions = async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, name, level, summary_time, description, registration_process, dachuang_relevance, official_link, timeline_details FROM dachuang_guide_competitions ORDER BY id ASC'
    );
    // Parse timeline_details and normalize to array format [{time, event}]
    const parsed = rows.map(row => ({
      ...row,
      timeline_details: normalizeTimeline(row.timeline_details)
    }));
    res.json(parsed);
  } catch (err) {
    console.error('getGuideCompetitions error:', err.message);
    res.status(500).json({ error: '获取指南竞赛列表失败' });
  }
};

// Normalize timeline_details: convert object {"4月":"event"} to array [{time:"4月", event:"event"}]
function normalizeTimeline(raw) {
  if (!raw) return [];
  let data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    return Object.entries(data).map(([time, event]) => ({ time, event }));
  }
  return [];
}

// GET /api/guide-competitions/:id - get single guide competition detail
exports.getGuideCompetitionById = async (req, res) => {
  try {
    const rows = await query('SELECT * FROM dachuang_guide_competitions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '竞赛不存在' });
    }
    const row = rows[0];
    row.timeline_details = normalizeTimeline(row.timeline_details);
    res.json(row);
  } catch (err) {
    console.error('getGuideCompetitionById error:', err.message);
    res.status(500).json({ error: '获取竞赛详情失败' });
  }
};
