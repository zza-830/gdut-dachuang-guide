import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Badge, Form, Spinner, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaHistory,
  FaUser,
  FaMoneyBillWave,
  FaFileAlt,
  FaClock,
  FaFilter,
  FaSearch,
  FaSync,
  FaTrashAlt,
  FaExclamationTriangle,
  FaCheckSquare,
  FaRegSquare
} from 'react-icons/fa';
import CommonButton from '../components/CommonButton';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Map backend action → display info (三大分类: file / team / finance)
const ACTION_MAP = {
  create_project:  { label: '创建项目',   type: 'file' },
  upload_file:     { label: '上传文件',   type: 'file' },
  download_file:   { label: '下载文件',   type: 'file' },
  delete_file:     { label: '删除文件',   type: 'file' },
  add_category:    { label: '添加分类',   type: 'file' },
  delete_category: { label: '删除分类',   type: 'file' },
  add_member:      { label: '添加成员',   type: 'team' },
  remove_member:   { label: '移除成员',   type: 'team' },
  update_team:     { label: '修改团队',   type: 'team' },
  update_funding:  { label: '更新经费',   type: 'finance' },
  add_expense:     { label: '添加支出',   type: 'finance' },
  delete_expense:  { label: '删除支出',   type: 'finance' },
};

// Extract a human-readable target string from the details JSON
const getTarget = (action, details) => {
  if (!details) return '';
  try {
    const d = typeof details === 'string' ? JSON.parse(details) : details;
    switch (action) {
      case 'upload_file':
      case 'download_file':
      case 'delete_file':
        return d.filename || '';
      case 'add_member':
        return d.added_members ? d.added_members.join(', ') : '';
      case 'remove_member':
        return d.removed_members ? d.removed_members.join(', ') : '';
      case 'update_funding':
        return d.old_budget != null && d.new_budget != null
          ? `¥${d.old_budget} → ¥${d.new_budget}`
          : '';
      case 'create_project':
        return d.name || '';
      case 'update_team':
        return d.member_count != null ? `成员数: ${d.member_count}` : '';
      case 'add_expense':
      case 'delete_expense':
        return d.item_name ? `${d.item_name} ¥${d.amount || ''}` : '';
      case 'add_category':
      case 'delete_category':
        return d.name || '';
      default:
        return JSON.stringify(d);
    }
  } catch {
    return String(details);
  }
};

const AuditLog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [filterType, setFilterType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const pageSize = 20;

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, targetId: null });
  const [deleting, setDeleting] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (page - 1) * pageSize;
      const response = await api.get(`/logs/${id}?limit=${pageSize}&offset=${offset}`);
      if (response.data?.success) {
        setLogs(response.data.data || []);
        setTotalLogs(response.data.total || response.data.data?.length || 0);
      } else {
        setLogs([]);
      }
      setSelectedIds(new Set());
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      console.error('[AuditLog] Failed to fetch logs:', { status, serverMsg, error: err.message });
      if (status === 404) {
        setError('日志接口不存在，请检查后端路由配置');
      } else if (status === 403) {
        setError('无权限查看该项目日志');
      } else if (serverMsg) {
        setError(`获取日志失败: ${serverMsg}`);
      } else {
        setError(`获取日志失败 (${status || '网络错误'}): ${err.message}`);
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    if (id) fetchLogs();
  }, [id, fetchLogs, page]);

  // Transform backend logs to display format
  const displayLogs = logs.map(log => {
    const mapped = ACTION_MAP[log.action] || { label: log.action, type: 'other' };
    return {
      id: log.id,
      operator: log.user_name || '未知用户',
      action: mapped.label,
      target: getTarget(log.action, log.details),
      timestamp: log.created_at ? new Date(log.created_at).toLocaleString('zh-CN') : '',
      type: mapped.type,
    };
  });

  // 筛选日志
  const filteredLogs = displayLogs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch = searchText === '' ||
      log.operator.includes(searchText) ||
      log.action.includes(searchText) ||
      log.target.includes(searchText);
    return matchesType && matchesSearch;
  });

  // Selection helpers
  const toggleSelect = (logId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(logId)) next.delete(logId);
      else next.add(logId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLogs.length && filteredLogs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLogs.map(l => l.id)));
    }
  };

  const allSelected = filteredLogs.length > 0 && selectedIds.size === filteredLogs.length;

  // Delete handlers
  const openDeleteModal = (type, targetId = null) => {
    setDeleteModal({ show: true, type, targetId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, type: null, targetId: null });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const { type, targetId } = deleteModal;
      if (type === 'single') {
        await api.delete(`/logs/${targetId}`);
      } else if (type === 'batch') {
        await api.delete('/logs/batch', { data: { ids: Array.from(selectedIds) } });
      } else if (type === 'clear') {
        await api.delete(`/logs/clear/${id}`);
      }
      closeDeleteModal();
      fetchLogs();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`删除失败: ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  const getDeleteModalContent = () => {
    const { type } = deleteModal;
    if (type === 'single') {
      return { title: '确认删除', body: '确定要删除这条日志记录吗？此操作不可撤销。', danger: false };
    }
    if (type === 'batch') {
      return { title: '批量删除', body: `确定要删除选中的 ${selectedIds.size} 条日志记录吗？此操作不可撤销。`, danger: false };
    }
    if (type === 'clear') {
      return {
        title: '⚠️ 清空全部日志',
        body: '此操作将永久删除该项目下的所有日志记录，且无法恢复！确定要继续吗？',
        danger: true
      };
    }
    return { title: '', body: '', danger: false };
  };

  // 获取操作类型图标
  const getActionIcon = (type) => {
    switch (type) {
      case 'file':
        return <FaFileAlt style={{ color: '#1890ff' }} />;
      case 'finance':
        return <FaMoneyBillWave style={{ color: '#52c41a' }} />;
      case 'team':
        return <FaUser style={{ color: '#faad14' }} />;
      default:
        return <FaHistory style={{ color: '#8c8c8c' }} />;
    }
  };

  // 获取操作类型标签颜色
  const getTypeColor = (type) => {
    switch (type) {
      case 'file':
        return { bg: '#e6f7ff', color: '#0050b3', text: '文件' };
      case 'finance':
        return { bg: '#f6ffed', color: '#389e0d', text: '财务' };
      case 'team':
        return { bg: '#fffbe6', color: '#d48806', text: '团队' };
      default:
        return { bg: '#f5f5f5', color: '#8c8c8c', text: '其他' };
    }
  };

  const modalContent = getDeleteModalContent();

  return (
    <Container fluid className="p-4 page-transition" style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4 animate-fade-in-up">
        <CommonButton
          variant="link"
          onClick={() => navigate(`/project/${id}`)}
          style={{ padding: 0, marginBottom: '16px', color: '#6c757d', textDecoration: 'none' }}
        >
          <FaArrowLeft style={{ marginRight: '8px' }} />
          返回项目详情
        </CommonButton>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
              <FaHistory style={{ marginRight: '12px', color: '#722ed1' }} />
              修改日志
            </h1>
            <p style={{ color: '#8c8c8c', fontSize: '14px', margin: 0 }}>
              查看项目的所有操作记录，追踪团队成员的修改历史
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAdmin && (
              <CommonButton
                variant="outline-danger"
                onClick={() => openDeleteModal('clear')}
                disabled={loading || totalLogs === 0}
                style={{ borderRadius: '10px' }}
              >
                <FaTrashAlt style={{ marginRight: '6px' }} />
                清空日志
              </CommonButton>
            )}
            <CommonButton
              variant="outline-secondary"
              onClick={fetchLogs}
              disabled={loading}
              style={{ borderRadius: '10px' }}
            >
              <FaSync style={{ marginRight: '6px' }} className={loading ? 'fa-spin' : ''} />
              刷新
            </CommonButton>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4 animate-fade-in-up" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Card.Body className="p-4">
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <FaSearch style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8c8c8c'
              }} />
              <Form.Control
                type="text"
                placeholder="搜索操作人、操作内容..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  paddingLeft: '40px',
                  borderRadius: '10px',
                  border: '1px solid #d9d9d9'
                }}
              />
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FaFilter style={{ color: '#8c8c8c' }} />
              {[
                { value: 'all', label: '全部' },
                { value: 'file', label: '文件' },
                { value: 'finance', label: '财务' },
                { value: 'team', label: '团队' }
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => setFilterType(option.value)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: filterType === option.value ? '600' : '400',
                    backgroundColor: filterType === option.value ? '#722ed1' : '#f5f5f5',
                    color: filterType === option.value ? '#fff' : '#666',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Log List */}
      <Card className="animate-fade-in-up" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Card.Body className="p-4">
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Select All checkbox (admin only) */}
              {isAdmin && filteredLogs.length > 0 && (
                <div
                  onClick={toggleSelectAll}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}
                >
                  {allSelected
                    ? <FaCheckSquare style={{ color: '#722ed1', fontSize: '18px' }} />
                    : <FaRegSquare style={{ color: '#bbb', fontSize: '18px' }} />
                  }
                  全选
                </div>
              )}
              <h5 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#333' }}>
                操作记录
              </h5>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Batch delete button */}
              {isAdmin && selectedIds.size > 0 && (
                <CommonButton
                  variant="danger"
                  size="sm"
                  onClick={() => openDeleteModal('batch')}
                  style={{ borderRadius: '8px', fontSize: '13px' }}
                >
                  <FaTrashAlt style={{ marginRight: '4px' }} />
                  删除选中 ({selectedIds.size})
                </CommonButton>
              )}
              <span style={{ fontSize: '13px', color: '#8c8c8c' }}>
                共 {totalLogs} 条记录
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Spinner animation="border" variant="secondary" />
              <div style={{ marginTop: '12px', color: '#8c8c8c' }}>加载中...</div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ff4d4f' }}>
              <div style={{ marginBottom: '8px' }}>{error}</div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
                请检查浏览器控制台获取详细错误信息
              </div>
              <CommonButton variant="link" onClick={fetchLogs}>
                重试
              </CommonButton>
            </div>
          )}

          {/* Timeline List */}
          {!loading && !error && (
            <div style={{ position: 'relative' }}>
              {filteredLogs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#8c8c8c'
                }}>
                  <FaHistory size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <div>{filterType !== 'all' || searchText ? '暂无匹配的操作记录' : '暂无操作记录'}</div>
                </div>
              ) : (
                filteredLogs.map((log, index) => {
                  const typeInfo = getTypeColor(log.type);
                  const isSelected = selectedIds.has(log.id);
                  return (
                    <div
                      key={log.id}
                      className="audit-log-row"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '16px',
                        backgroundColor: isSelected ? '#f0e6ff' : (index % 2 === 0 ? '#fafafa' : '#fff'),
                        borderRadius: '10px',
                        marginBottom: '8px',
                        border: isSelected ? '1px solid #d3adf7' : '1px solid #f0f0f0',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#f0f7ff';
                          e.currentTarget.style.borderColor = '#91d5ff';
                        }
                        // Show delete icon
                        const delBtn = e.currentTarget.querySelector('.row-delete-btn');
                        if (delBtn) delBtn.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafafa' : '#fff';
                          e.currentTarget.style.borderColor = '#f0f0f0';
                        }
                        const delBtn = e.currentTarget.querySelector('.row-delete-btn');
                        if (delBtn) delBtn.style.opacity = '0';
                      }}
                    >
                      {/* Checkbox (admin only) */}
                      {isAdmin && (
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleSelect(log.id); }}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            flexShrink: 0,
                            marginRight: '8px',
                            paddingTop: '4px'
                          }}
                        >
                          {isSelected
                            ? <FaCheckSquare style={{ color: '#722ed1', fontSize: '18px' }} />
                            : <FaRegSquare style={{ color: '#ccc', fontSize: '18px' }} />
                          }
                        </div>
                      )}

                      {/* Icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0,
                        border: '1px solid #f0f0f0',
                        marginRight: '16px'
                      }}>
                        {getActionIcon(log.type)}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
                            {log.operator}
                          </span>
                          <span style={{ color: '#666', fontSize: '14px' }}>
                            {log.action}
                          </span>
                          <Badge
                            bg="none"
                            style={{
                              backgroundColor: typeInfo.bg,
                              color: typeInfo.color,
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '10px'
                            }}
                          >
                            {typeInfo.text}
                          </Badge>
                        </div>
                        {log.target && (
                          <div style={{
                            fontSize: '13px',
                            color: '#1890ff',
                            marginBottom: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {log.target}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: '#8c8c8c', display: 'flex', alignItems: 'center' }}>
                          <FaClock style={{ marginRight: '4px', fontSize: '10px' }} />
                          {log.timestamp}
                        </div>
                      </div>

                      {/* Single delete button on hover (admin only) */}
                      {isAdmin && (
                        <div
                          className="row-delete-btn"
                          onClick={(e) => { e.stopPropagation(); openDeleteModal('single', log.id); }}
                          style={{
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: '#fff1f0',
                            color: '#ff4d4f',
                            flexShrink: 0,
                            marginLeft: '8px',
                            alignSelf: 'center'
                          }}
                          title="删除此条日志"
                        >
                          <FaTrashAlt style={{ fontSize: '14px' }} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Pagination */}
              {totalLogs > pageSize && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                  <span
                    onClick={() => page > 1 && setPage(page - 1)}
                    style={{
                      padding: '6px 16px', borderRadius: '8px', fontSize: '13px', cursor: page > 1 ? 'pointer' : 'not-allowed',
                      backgroundColor: page > 1 ? '#f0f0f0' : '#fafafa', color: page > 1 ? '#333' : '#d9d9d9'
                    }}
                  >
                    上一页
                  </span>
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    {page} / {Math.ceil(totalLogs / pageSize)}
                  </span>
                  <span
                    onClick={() => page < Math.ceil(totalLogs / pageSize) && setPage(page + 1)}
                    style={{
                      padding: '6px 16px', borderRadius: '8px', fontSize: '13px',
                      cursor: page < Math.ceil(totalLogs / pageSize) ? 'pointer' : 'not-allowed',
                      backgroundColor: page < Math.ceil(totalLogs / pageSize) ? '#f0f0f0' : '#fafafa',
                      color: page < Math.ceil(totalLogs / pageSize) ? '#333' : '#d9d9d9'
                    }}
                  >
                    下一页
                  </span>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton style={{ borderBottom: modalContent.danger ? '2px solid #ff4d4f' : undefined }}>
          <Modal.Title style={{ fontSize: '18px', color: modalContent.danger ? '#ff4d4f' : '#333' }}>
            {modalContent.danger && <FaExclamationTriangle style={{ marginRight: '8px' }} />}
            {modalContent.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '14px', color: '#555', padding: '24px' }}>
          {modalContent.danger && (
            <div style={{
              backgroundColor: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaExclamationTriangle style={{ color: '#ff4d4f', flexShrink: 0 }} />
              <span style={{ color: '#cf1322', fontWeight: '600' }}>高风险操作！数据删除后无法恢复。</span>
            </div>
          )}
          {modalContent.body}
        </Modal.Body>
        <Modal.Footer>
          <CommonButton variant="outline-secondary" onClick={closeDeleteModal} disabled={deleting}>
            取消
          </CommonButton>
          <CommonButton variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? <><Spinner size="sm" animation="border" style={{ marginRight: '6px' }} />删除中...</> : '确认删除'}
          </CommonButton>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AuditLog;
