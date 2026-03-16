const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLog');

/**
 * 添加支出记录
 * POST /api/expenses/:projectId
 */
const addExpense = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { item_name, amount, expense_date, location } = req.body;

    if (!item_name || !amount) {
      return res.status(400).json({ success: false, message: '请填写支出名称和金额' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: '金额必须大于0' });
    }

    // Handle uploaded invoice file
    let invoicePath = null;
    if (req.file) {
      invoicePath = `/uploads/invoices/${req.file.filename}`;
    }

    // Default to today if no date provided
    const finalDate = expense_date || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO expenses (project_id, item_name, amount, expense_date, location, invoice_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, item_name, parsedAmount, finalDate, location || null, invoicePath]
    );

    // Fire-and-forget: logAudit has its own try/catch
    logAudit({
      userId: req.user.id,
      action: 'add_expense',
      entityType: 'project',
      entityId: projectId,
      details: { item_name, amount: parsedAmount, expense_date, location: location || null }
    });

    res.status(201).json({
      success: true,
      message: '支出记录已添加',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ success: false, message: '添加支出记录失败' });
  }
};

/**
 * 获取项目支出列表及汇总
 * GET /api/expenses/:projectId
 */
const getExpenses = async (req, res) => {
  try {
    const { projectId } = req.params;

    const items = await query(
      `SELECT id, item_name, amount, expense_date, location, invoice_path, created_at
       FROM expenses
       WHERE project_id = ?
       ORDER BY expense_date DESC, created_at DESC`,
      [projectId]
    );

    const [sumRow] = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total_used FROM expenses WHERE project_id = ?`,
      [projectId]
    );

    res.json({
      success: true,
      data: {
        items,
        total_used: parseFloat(sumRow.total_used) || 0
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ success: false, message: '获取支出记录失败' });
  }
};

/**
 * 更新支出记录
 * PUT /api/expenses/:expenseId
 */
const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { item_name, amount, expense_date, location } = req.body;

    if (!item_name || !amount) {
      return res.status(400).json({ success: false, message: '请填写支出名称和金额' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: '金额必须大于0' });
    }

    const [expense] = await query('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    if (!expense) {
      return res.status(404).json({ success: false, message: '支出记录不存在' });
    }

    // Handle uploaded invoice file (optional update)
    let invoicePath = expense.invoice_path;
    if (req.file) {
      invoicePath = `/uploads/invoices/${req.file.filename}`;
    }

    const finalDate = expense_date || expense.expense_date;

    await query(
      `UPDATE expenses SET item_name = ?, amount = ?, expense_date = ?, location = ?, invoice_path = ? WHERE id = ?`,
      [item_name, parsedAmount, finalDate, location || null, invoicePath, expenseId]
    );

    logAudit({
      userId: req.user.id,
      action: 'update_expense',
      entityType: 'project',
      entityId: expense.project_id,
      details: { expense_id: expenseId, item_name, amount: parsedAmount }
    });

    res.json({ success: true, message: '支出记录已更新' });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ success: false, message: '更新支出记录失败' });
  }
};

/**
 * 删除支出记录
 * DELETE /api/expenses/:expenseId
 */
const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const [expense] = await query('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    if (!expense) {
      return res.status(404).json({ success: false, message: '支出记录不存在' });
    }

    await query('DELETE FROM expenses WHERE id = ?', [expenseId]);

    // Fire-and-forget
    logAudit({
      userId: req.user.id,
      action: 'delete_expense',
      entityType: 'project',
      entityId: expense.project_id,
      details: { item_name: expense.item_name, amount: parseFloat(expense.amount) }
    });

    res.json({ success: true, message: '支出记录已删除' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ success: false, message: '删除支出记录失败' });
  }
};

module.exports = { addExpense, getExpenses, updateExpense, deleteExpense };
