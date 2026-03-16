'use strict';
/**
 * seedCompetitionTimes.js — 一次性测试数据填充脚本
 * 运行：node server/scripts/seedCompetitionTimes.js
 *
 * 将 competitions 表里的现有记录按 id % 3 分三组，
 * 分别赋予覆盖"已结束 / 进行中 / 未开始"三种动态状态的时间区间。
 *
 * 以当前基准时间 2026-03-06 为锚点：
 *   已结束：start=2025-11-01  end=2026-01-31  (end_time < NOW < end+2月 ✅)
 *   进行中：start=2026-02-01  end=2026-04-30  (start <= NOW <= end    ✅)
 *   未开始：start=2026-05-01  end=2026-07-31  (NOW < start_time       ✅)
 */

const mysql = require('mysql2/promise');

const DB = {
  host    : 'localhost',
  port    : 3307,
  user    : 'root',
  password: 'root',
  database: 'gdut_dachuang',
};

// 三种时间区间（字符串，直接写入 DATETIME 列）
const SLOTS = [
  { label: '已结束', start_time: '2025-11-01 00:00:00', end_time: '2026-01-31 23:59:59' },
  { label: '进行中', start_time: '2026-02-01 00:00:00', end_time: '2026-04-30 23:59:59' },
  { label: '未开始', start_time: '2026-05-01 00:00:00', end_time: '2026-07-31 23:59:59' },
];

(async () => {
  let conn;
  try {
    conn = await mysql.createConnection(DB);
    console.log('✅ 数据库连接成功');

    // 查出所有竞赛 id（按 id 排序，方便分组可预测）
    const [rows] = await conn.query('SELECT id, name FROM competitions ORDER BY id');
    if (rows.length === 0) {
      console.log('⚠️  competitions 表中没有数据，请先确认数据已导入。');
      return;
    }
    console.log(`📋 共发现 ${rows.length} 条竞赛记录，开始按三组分配时间区间...\n`);

    for (const row of rows) {
      const slot = SLOTS[row.id % 3];           // 按 id 取模分组
      await conn.query(
        `UPDATE competitions
            SET start_time = ?, end_time = ?, needs_review = 0
          WHERE id = ?`,
        [slot.start_time, slot.end_time, row.id]
      );
      console.log(`  [${String(row.id).padStart(3)}] ${row.name.substring(0, 30).padEnd(30)} → ${slot.label}  (${slot.start_time.slice(0,10)} ~ ${slot.end_time.slice(0,10)})`);
    }

    console.log('\n✅ 所有记录更新完毕！');
    console.log('   分组规则：id % 3 == 0 → 已结束 | id % 3 == 1 → 进行中 | id % 3 == 2 → 未开始');
    console.log('   现在刷新前端页面，三种状态均可看到。\n');

    // 快速验证：查出各状态数量
    const [stats] = await conn.query(`
      SELECT
        SUM(CASE WHEN NOW() BETWEEN start_time AND end_time           THEN 1 ELSE 0 END) AS 进行中,
        SUM(CASE WHEN NOW() < start_time                              THEN 1 ELSE 0 END) AS 未开始,
        SUM(CASE WHEN NOW() > end_time
                  AND NOW() < DATE_ADD(end_time, INTERVAL 2 MONTH)   THEN 1 ELSE 0 END) AS 已结束
      FROM competitions
      WHERE start_time IS NOT NULL
    `);
    console.log('📊 验证统计：', stats[0]);

  } catch (err) {
    console.error('❌ 执行出错：', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
