'use strict';

/**
 * competitionRollover.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 竞赛跨年自动滚动定时任务
 *
 * 执行时机：每天凌晨 02:00（服务器本地时间）
 *
 * 业务逻辑：
 *   1. 扫描所有 end_time + 2 个月 <= 当前时间 的竞赛记录（"冷却期已过"）
 *   2. 将 start_time / end_time 各自 +1 年
 *   3. 将 needs_review 标记为 1，提示管理员人工核对具体日期
 *
 * 滚动后效果：
 *   - 时间变为明年 → 查询接口自动将其计算为"未开始"
 *   - needs_review = 1 → 管理后台可展示"待核对"标记
 * ─────────────────────────────────────────────────────────────────────────────
 */

const cron = require('node-cron');
const { query } = require('../config/db');

// ─── 核心执行函数（也可手动调用用于测试）─────────────────────────────────────
async function runRollover() {
  const startAt = new Date().toISOString();
  console.log(`\n[competitionRollover] ⏰ 开始执行 @ ${startAt}`);

  try {
    // 1. 查找所有"冷却期已过"的记录
    //    条件：end_time 不为空，且 NOW() >= end_time + 2 个月
    const targets = await query(`
      SELECT id, name, start_time, end_time
      FROM competitions
      WHERE end_time IS NOT NULL
        AND NOW() >= DATE_ADD(end_time, INTERVAL 2 MONTH)
    `);

    if (targets.length === 0) {
      console.log('[competitionRollover] ✅ 无需滚动的记录，任务结束。');
      return;
    }

    console.log(`[competitionRollover] 📋 发现 ${targets.length} 条待滚动记录：`);
    targets.forEach(r =>
      console.log(`  · [${r.id}] ${r.name}  end_time=${r.end_time}`)
    );

    // 2. 批量更新：start_time/end_time +1年，needs_review 置为 1
    //    用单条 UPDATE 批量处理，避免逐条执行产生大量 round-trip
    const ids = targets.map(r => r.id);
    const placeholders = ids.map(() => '?').join(',');

    const updateSql = `
      UPDATE competitions
      SET
        start_time   = DATE_ADD(start_time, INTERVAL 1 YEAR),
        end_time     = DATE_ADD(end_time,   INTERVAL 1 YEAR),
        needs_review = 1,
        updated_at   = NOW()
      WHERE id IN (${placeholders})
    `;

    const result = await query(updateSql, ids);
    console.log(
      `[competitionRollover] ✅ 成功滚动 ${result.affectedRows} 条记录，` +
      `needs_review 已标记，管理员需核对具体日期。`
    );
  } catch (err) {
    console.error('[competitionRollover] ❌ 执行出错：', err.message);
  }

  console.log(`[competitionRollover] 🏁 任务完成 @ ${new Date().toISOString()}\n`);
}

// ─── 注册定时任务 ────────────────────────────────────────────────────────────
function registerRolloverJob() {
  // Cron 表达式：秒(可选) 分 时 日 月 周
  // '0 2 * * *' = 每天 02:00:00
  const schedule = process.env.COMPETITION_ROLLOVER_CRON || '0 2 * * *';

  if (!cron.validate(schedule)) {
    console.error(`[competitionRollover] ❌ 无效的 Cron 表达式: "${schedule}"`);
    return;
  }

  cron.schedule(schedule, runRollover, {
    scheduled: true,
    timezone: 'Asia/Shanghai', // 以北京时间为准
  });

  console.log(
    `[competitionRollover] 📅 定时任务已注册，` +
    `将按 "${schedule}" (Asia/Shanghai) 每天执行。`
  );
}

module.exports = { registerRolloverJob, runRollover };
