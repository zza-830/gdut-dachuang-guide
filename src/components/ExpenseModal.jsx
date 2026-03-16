import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Spinner, Table } from 'react-bootstrap';
import {
  FaTimes,
  FaPlus,
  FaReceipt,
  FaTrash,
  FaEdit,
  FaFileInvoiceDollar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';
import CommonButton from './CommonButton';
import { showToast } from './Toast';
import api from '../services/api';

const ExpenseModal = ({ show, onHide, projectId, budgetTotal, onExpenseChange }) => {
  const [expenses, setExpenses] = useState([]);
  const [totalUsed, setTotalUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null); // null = add mode, object = edit mode
  const invoiceRef = useRef(null);

  const [formData, setFormData] = useState({
    item_name: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    location: ''
  });
  const [invoiceFile, setInvoiceFile] = useState(null);

  // Fetch expenses when modal opens
  useEffect(() => {
    if (show && projectId) {
      fetchExpenses();
    }
  }, [show, projectId]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/expenses/${projectId}`);
      if (res.data.success) {
        setExpenses(res.data.data.items);
        setTotalUsed(res.data.data.total_used);
        onExpenseChange?.(res.data.data.total_used);
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ item_name: '', amount: '', expense_date: new Date().toISOString().split('T')[0], location: '' });
    setInvoiceFile(null);
    if (invoiceRef.current) invoiceRef.current.value = '';
    setEditingExpense(null);
  };

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      item_name: exp.item_name || '',
      amount: parseFloat(exp.amount) || '',
      expense_date: exp.expense_date ? new Date(exp.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      location: exp.location || ''
    });
    setInvoiceFile(null);
    if (invoiceRef.current) invoiceRef.current.value = '';
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_name.trim() || !formData.amount) {
      showToast('warning', '请填写名称和金额');
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      showToast('warning', '金额必须大于0');
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('item_name', formData.item_name.trim());
      fd.append('amount', formData.amount);
      if (formData.expense_date) {
        fd.append('expense_date', formData.expense_date);
      }
      if (formData.location.trim()) {
        fd.append('location', formData.location.trim());
      }
      if (invoiceFile) {
        fd.append('invoice', invoiceFile);
      }

      let res;
      if (editingExpense) {
        res = await api.put(`/expenses/${editingExpense.id}`, fd);
      } else {
        res = await api.post(`/expenses/${projectId}`, fd);
      }

      if (res.data.success) {
        showToast('success', editingExpense ? '支出记录已更新' : '支出记录已添加');
        resetForm();
        setShowForm(false);
        fetchExpenses();
      }
    } catch (err) {
      console.error(editingExpense ? 'Update expense failed:' : 'Add expense failed:', err);
      showToast('error', (editingExpense ? '更新' : '添加') + '失败：' + (err.response?.data?.message || '未知错误'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (expenseId, itemName) => {
    if (!window.confirm(`确定要删除支出 "${itemName}" 吗？`)) return;
    try {
      const res = await api.delete(`/expenses/${expenseId}`);
      if (res.data.success) {
        showToast('success', '支出记录已删除');
        fetchExpenses();
      }
    } catch (err) {
      console.error('Delete expense failed:', err);
      showToast('error', '删除失败');
    }
  };

  const remaining = budgetTotal - totalUsed;
  const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '';

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton={false} style={{ border: 'none', paddingBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Modal.Title style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaFileInvoiceDollar style={{ color: '#52c41a' }} />
          经费支出管理
        </Modal.Title>
        <div onClick={onHide} style={{ cursor: 'pointer', marginLeft: 'auto' }}>
          <FaTimes size={18} color="#8c8c8c" />
        </div>
      </Modal.Header>

      <Modal.Body style={{ padding: '20px 24px' }}>
        {/* Summary Cards */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '120px', padding: '16px', backgroundColor: '#f6ffed', borderRadius: '12px', textAlign: 'center', border: '1px solid #b7eb8f' }}>
            <div style={{ fontSize: '12px', color: '#52c41a', marginBottom: '4px' }}>总经费</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#52c41a' }}>¥{budgetTotal.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, minWidth: '120px', padding: '16px', backgroundColor: '#fff7e6', borderRadius: '12px', textAlign: 'center', border: '1px solid #ffe58f' }}>
            <div style={{ fontSize: '12px', color: '#d48806', marginBottom: '4px' }}>已使用</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#d48806' }}>¥{totalUsed.toLocaleString()}</div>
          </div>
          <div style={{
            flex: 1, minWidth: '120px', padding: '16px', borderRadius: '12px', textAlign: 'center',
            backgroundColor: remaining < 0 ? '#fff1f0' : '#e6f7ff',
            border: `1px solid ${remaining < 0 ? '#ffa39e' : '#91d5ff'}`
          }}>
            <div style={{ fontSize: '12px', color: remaining < 0 ? '#ff4d4f' : '#1890ff', marginBottom: '4px' }}>
              {remaining < 0 ? '超支' : '剩余'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: remaining < 0 ? '#ff4d4f' : '#1890ff' }}>
              ¥{Math.abs(remaining).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
            <span>使用进度</span>
            <span>{budgetTotal > 0 ? Math.round((totalUsed / budgetTotal) * 100) : 0}%</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${budgetTotal > 0 ? Math.min((totalUsed / budgetTotal) * 100, 100) : 0}%`,
              backgroundColor: totalUsed / budgetTotal > 0.8 ? '#ff4d4f' : totalUsed / budgetTotal > 0.5 ? '#faad14' : '#52c41a',
              borderRadius: '3px',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Add button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>支出记录</span>
          <CommonButton variant={showForm ? 'secondary' : 'primary'} onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
            style={{ fontSize: '13px', padding: '6px 16px', borderRadius: '20px' }}>
            {showForm ? '取消' : <><FaPlus style={{ marginRight: '4px' }} />添加支出</>}
          </CommonButton>
        </div>

        {/* Add Form */}
        {showForm && (
          <Form onSubmit={handleSubmit} style={{
            padding: '16px', backgroundColor: editingExpense ? '#fff8e6' : '#fafafa', borderRadius: '12px',
            border: `1px solid ${editingExpense ? '#ffe58f' : '#f0f0f0'}`, marginBottom: '16px'
          }}>
            {editingExpense && (
              <div style={{ fontSize: '13px', color: '#d48806', marginBottom: '10px', fontWeight: '500' }}>
                ✏️ 正在编辑支出记录：{editingExpense.item_name}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Form.Group>
                <Form.Label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  <FaReceipt style={{ marginRight: '4px' }} />支出名称 *
                </Form.Label>
                <Form.Control size="sm" type="text" placeholder="如：购买服务器"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  style={{ borderRadius: '8px' }} />
              </Form.Group>
              <Form.Group>
                <Form.Label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  ¥ 金额 *
                </Form.Label>
                <Form.Control size="sm" type="number" step="0.01" min="0" placeholder="500.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{ borderRadius: '8px' }} />
              </Form.Group>
              <Form.Group>
                <Form.Label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  <FaCalendarAlt style={{ marginRight: '4px' }} />日期
                </Form.Label>
                <Form.Control size="sm" type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  style={{ borderRadius: '8px' }} />
              </Form.Group>
              <Form.Group>
                <Form.Label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  <FaMapMarkerAlt style={{ marginRight: '4px' }} />地点
                </Form.Label>
                <Form.Control size="sm" type="text" placeholder="如：京东商城"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ borderRadius: '8px' }} />
              </Form.Group>
            </div>
            <Form.Group style={{ marginTop: '12px' }}>
              <Form.Label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                📎 发票附件（PDF/图片）
              </Form.Label>
              <Form.Control ref={invoiceRef} size="sm" type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={(e) => setInvoiceFile(e.target.files[0] || null)}
                style={{ borderRadius: '8px' }} />
            </Form.Group>
            <div style={{ marginTop: '12px', textAlign: 'right' }}>
              <CommonButton type="submit" variant="primary" disabled={submitting}
                style={{ fontSize: '13px', padding: '6px 20px', borderRadius: '20px' }}>
                {submitting ? <Spinner animation="border" size="sm" /> : (editingExpense ? '保存修改' : '提交')}
              </CommonButton>
            </div>
          </Form>
        )}

        {/* Expense List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#8c8c8c' }}>
            <Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />加载中...
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#bfbfbf' }}>
            <FaFileInvoiceDollar size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div style={{ fontSize: '13px' }}>暂无支出记录</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table hover size="sm" style={{ fontSize: '13px', marginBottom: 0 }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa' }}>
                  <th style={{ fontWeight: '600', color: '#666', padding: '10px 12px' }}>日期</th>
                  <th style={{ fontWeight: '600', color: '#666', padding: '10px 12px' }}>名称</th>
                  <th style={{ fontWeight: '600', color: '#666', padding: '10px 12px' }}>地点</th>
                  <th style={{ fontWeight: '600', color: '#666', padding: '10px 12px', textAlign: 'right' }}>金额</th>
                  <th style={{ fontWeight: '600', color: '#666', padding: '10px 12px', textAlign: 'center' }}>发票</th>
                  <th style={{ fontWeight: '600', color: '#666', padding: '10px 12px', textAlign: 'center', width: '80px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td style={{ padding: '10px 12px', color: '#8c8c8c', whiteSpace: 'nowrap' }}>
                      {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('zh-CN') : '-'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#333', fontWeight: '500' }}>{exp.item_name}</td>
                    <td style={{ padding: '10px 12px', color: '#666' }}>{exp.location || '-'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: '#d48806' }}>
                      ¥{parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {exp.invoice_path ? (
                        <a href={`${apiBase}${exp.invoice_path}`} target="_blank" rel="noopener noreferrer"
                          style={{ color: '#1890ff', fontSize: '12px' }}>
                          <FaExternalLinkAlt size={12} /> 查看
                        </a>
                      ) : (
                        <span style={{ color: '#d9d9d9', fontSize: '12px' }}>无</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <FaEdit size={13} style={{ color: '#1890ff', cursor: 'pointer', marginRight: '10px' }}
                        title="编辑"
                        onClick={() => handleEdit(exp)} />
                      <FaTrash size={13} style={{ color: '#ff4d4f', cursor: 'pointer' }}
                        title="删除"
                        onClick={() => handleDelete(exp.id, exp.item_name)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ExpenseModal;
