import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaShieldAlt, FaTrash, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CommonButton from '../components/CommonButton';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      } else {
        setError(res.data.message || '获取用户列表失败');
      }
    } catch (err) {
      setError(err.response?.data?.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`确定要删除用户「${name}」吗？此操作不可撤销。`)) return;
    try {
      setDeleting(id);
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert(res.data.message || '删除失败');
      }
    } catch (err) {
      alert(err.response?.data?.message || '删除失败');
    } finally {
      setDeleting(null);
    }
  };

  const roleBadge = (role) => {
    const map = {
      admin: { bg: 'danger', label: '管理员' },
      teacher: { bg: 'warning', label: '教师' },
      student: { bg: 'primary', label: '学生' },
    };
    const r = map[role] || { bg: 'secondary', label: role };
    return <Badge bg={r.bg}>{r.label}</Badge>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">加载中...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: '1100px' }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FaShieldAlt size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>后台管理</h2>
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: '14px' }}>
            <FaUsers style={{ marginRight: '4px' }} />
            共 {users.length} 个注册用户
          </p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div style={{
        backgroundColor: '#fff', borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden'
      }}>
        <Table hover responsive style={{ margin: 0 }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa' }}>
              <th style={{ padding: '14px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>ID</th>
              <th style={{ padding: '14px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>用户名/学号</th>
              <th style={{ padding: '14px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>姓名</th>
              <th style={{ padding: '14px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>角色</th>
              <th style={{ padding: '14px 16px', fontWeight: '600', fontSize: '13px', color: '#666' }}>注册时间</th>
              <th style={{ padding: '14px 16px', fontWeight: '600', fontSize: '13px', color: '#666', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: '#999', fontSize: '13px' }}>{u.id}</td>
                <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                  <div style={{ fontWeight: '500' }}>{u.username || u.student_id || '-'}</div>
                  {u.username && u.student_id && (
                    <div style={{ fontSize: '12px', color: '#999' }}>学号: {u.student_id}</div>
                  )}
                </td>
                <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontWeight: '500' }}>{u.name}</td>
                <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{roleBadge(u.role)}</td>
                <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '13px', color: '#666' }}>{formatDate(u.created_at)}</td>
                <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                  {u.id === user.id ? (
                    <span style={{ fontSize: '12px', color: '#999' }}>当前账户</span>
                  ) : (
                    <CommonButton
                      variant="danger"
                      size="sm"
                      disabled={deleting === u.id}
                      onClick={() => handleDelete(u.id, u.name)}
                      style={{ borderRadius: '6px', fontSize: '12px', padding: '4px 12px' }}
                    >
                      {deleting === u.id ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <><FaTrash style={{ marginRight: '4px' }} />删除</>
                      )}
                    </CommonButton>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">暂无用户数据</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default AdminDashboard;
