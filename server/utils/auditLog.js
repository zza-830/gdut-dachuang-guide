const { query } = require('../config/db');

/**
 * Shared audit-log helper.
 * Resolves user_name from DB if not on req.user, then INSERTs.
 * Wrapped in try/catch so callers never break.
 *
 * @param {object} opts
 * @param {number} opts.userId      - req.user.id
 * @param {string} opts.userName    - req.user.name (may be undefined)
 * @param {string} opts.action      - e.g. 'create_project'
 * @param {string} opts.entityType  - e.g. 'project'
 * @param {number|string} opts.entityId
 * @param {object} opts.details     - will be JSON.stringify'd
 */
async function logAudit({ userId, userName, action, entityType, entityId, details }) {
  try {
    // Resolve user name if missing
    let resolvedName = userName;
    if (!resolvedName && userId) {
      const [user] = await query('SELECT name FROM users WHERE id = ?', [userId]);
      resolvedName = user ? user.name : '未知用户';
    }

    await query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        resolvedName || '未知用户',
        action,
        entityType || null,
        entityId ? parseInt(entityId) : null,
        JSON.stringify(details || {})
      ]
    );
    console.log(`[AuditLog] ${action} logged OK (user=${resolvedName}, entity=${entityType}#${entityId})`);
  } catch (err) {
    console.error('[AuditLog] INSERT FAILED:', err.message, { userId, action, entityType, entityId });
  }
}

module.exports = { logAudit };
