// My Projects Page - Large Card Dashboard with Edit Mode & Create Modal
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FaProjectDiagram,
  FaChevronRight,
  FaPlus,
  FaRocket,
  FaLightbulb,
  FaCode,
  FaMobileAlt,
  FaDatabase,
  FaCloud,
  FaBrain,
  FaRobot,
  FaChartLine,
  FaShoppingCart,
  FaGraduationCap,
  FaHeartbeat,
  FaLeaf,
  FaCar,
  FaGamepad,
  FaTimes,
  FaPen
} from 'react-icons/fa';
import CommonButton from '../components/CommonButton';
import { showToast } from '../components/Toast';
import api from '../services/api';

const MyProjects = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 编辑模式下各项目的临时名称 { [id]: string }
  const [editingNames, setEditingNames] = useState({});
  // 正在保存重命名的项目 id 集合
  const [renamingSaving, setRenamingSaving] = useState(new Set());
  // 点击「完成」时 blur 会先于 click 触发，用此 ref 跳过不必要的 blur 请求
  const completingRef = useRef(false);

  // 创建项目弹窗状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    duration: '',
    description: '',
    leader: '',
    phone: ''
  });

  // 图标列表
  const iconList = [
    FaRocket, FaLightbulb, FaCode, FaMobileAlt, FaDatabase, 
    FaCloud, FaBrain, FaRobot, FaChartLine, FaShoppingCart,
    FaGraduationCap, FaHeartbeat, FaLeaf, FaCar, FaGamepad
  ];

  // 颜色列表
  const colorList = [
    '#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96',
    '#13c2c2', '#fa541c', '#2f54eb', '#a0d911', '#f5222d'
  ];

  // 从后端加载项目列表
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      // Fallback to localStorage for offline/demo
      const saved = localStorage.getItem('myProjects');
      if (saved) setProjects(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getProjectIcon = (index) => iconList[index % iconList.length];
  const getProjectColor = (index) => colorList[index % colorList.length];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return { backgroundColor: '#e6f7ff', color: '#1890ff' };
      case 'completed': return { backgroundColor: '#f6ffed', color: '#52c41a' };
      case 'pending': return { backgroundColor: '#fffbe6', color: '#faad14' };
      default: return { backgroundColor: '#f5f5f5', color: '#8c8c8c' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '进行中';
      case 'completed': return '已结题';
      case 'pending': return '待审核';
      default: return '未知';
    }
  };

  // ─── 重命名逻辑 ────────────────────────────────────────────────

  /**
   * 实际发出重命名请求，成功后更新本地 projects 状态
   */
  const doRename = useCallback(async (id, newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed) return;
    const original = projects.find(p => p.id === id)?.name;
    if (trimmed === original) return; // 名称未变化，跳过网络请求

    setRenamingSaving(prev => { const s = new Set(prev); s.add(id); return s; });
    try {
      const res = await api.patch(`/projects/${id}/name`, { name: trimmed });
      if (res.data.success) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, name: trimmed } : p));
        showToast('success', '项目名称已更新');
      }
    } catch (err) {
      console.error('Rename project failed:', err);
      showToast('error', '重命名失败：' + (err.response?.data?.message || '未知错误'));
      // 还原 editingNames 为旧名称
      setEditingNames(prev => ({ ...prev, [id]: original || '' }));
    } finally {
      setRenamingSaving(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [projects]);

  /**
   * 输入框 onChange
   */
  const handleNameChange = (id, value) => {
    setEditingNames(prev => ({ ...prev, [id]: value }));
  };

  /**
   * 输入框 onBlur — 失焦时自动保存
   * 若正在点击「完成」按钮则跳过（completingRef.current 为 true），避免重复请求
   */
  const handleNameBlur = (id) => {
    if (completingRef.current) return;
    doRename(id, editingNames[id]);
  };

  /**
   * 输入框 onKeyDown — 按 Enter 保存，按 Esc 还原
   */
  const handleNameKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur(); // 触发 blur → handleNameBlur → doRename
    } else if (e.key === 'Escape') {
      const original = projects.find(p => p.id === id)?.name || '';
      setEditingNames(prev => ({ ...prev, [id]: original }));
      e.target.blur();
    }
  };

  /**
   * 切换编辑模式，点击「完成」时批量提交仍未保存的改名
   */
  const handleToggleEditMode = async () => {
    if (isEditMode) {
      completingRef.current = true;

      // 找出名称有变化且非空的项目，批量 PATCH
      const pending = projects.filter(p => {
        const draft = editingNames[p.id];
        return draft !== undefined && draft.trim() && draft.trim() !== p.name;
      });

      if (pending.length > 0) {
        await Promise.allSettled(pending.map(p => doRename(p.id, editingNames[p.id])));
      }

      completingRef.current = false;
      setIsEditMode(false);
      setEditingNames({});
    } else {
      // 进入编辑模式：初始化临时名称
      const names = {};
      projects.forEach(p => { names[p.id] = p.name; });
      setEditingNames(names);
      setIsEditMode(true);
    }
  };

  // ─── 创建项目 ──────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setNewProject({ name: '', duration: '', description: '', leader: '', phone: '' });
    setShowCreateModal(true);
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim() || !newProject.duration.trim()) return;
    try {
      setCreating(true);
      const res = await api.post('/projects', {
        title: newProject.name.trim(),
        duration: newProject.duration,
        description: newProject.description
      });
      if (res.data.success) {
        showToast('success', '项目创建成功');
        setShowCreateModal(false);
        await fetchProjects();
      }
    } catch (err) {
      console.error('Create project failed:', err);
      showToast('error', '创建项目失败：' + (err.response?.data?.message || '未知错误'));
    } finally {
      setCreating(false);
    }
  };

  // ─── 删除项目 ──────────────────────────────────────────────────

  const handleDeleteProject = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除此项目吗？')) return;
    try {
      const res = await api.delete(`/projects/${id}`);
      if (res.data.success) {
        showToast('success', '项目已删除');
        fetchProjects();
      }
    } catch (err) {
      console.error('Delete project failed:', err);
      showToast('error', '删除失败：' + (err.response?.data?.message || '未知错误'));
    }
  };

  const canSubmit = newProject.name.trim() && newProject.duration.trim() && !creating;

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      {/* Page Header with Edit Button */}
      <div className="mb-4 d-flex justify-content-between align-items-start">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
            <FaProjectDiagram style={{ marginRight: '10px', color: '#1890ff' }} />
            我的项目
          </h1>
          <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
            管理您的大创项目，追踪进度，智能填报
          </p>
        </div>
        
        <CommonButton
          variant="primary"
          onClick={handleToggleEditMode}
          style={{ 
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: isEditMode ? '#52c41a' : '#1890ff',
            boxShadow: isEditMode ? '0 2px 8px rgba(82, 196, 26, 0.3)' : '0 2px 8px rgba(24, 144, 255, 0.3)'
          }}
        >
          {isEditMode ? (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '6px', fontSize: '16px' }}>✓</span>
              完成
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '6px', fontSize: '14px' }}>✎</span>
              编辑
            </span>
          )}
        </CommonButton>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8c8c8c' }}>
          <Spinner animation="border" style={{ marginBottom: '16px' }} />
          <div>加载项目列表...</div>
        </div>
      ) : (
        <Row className="g-4">
          {projects && projects.length > 0 && projects.map((project, index) => {
            if (!project) return null;
            const IconComponent = getProjectIcon(index);
            const iconColor = getProjectColor(index);
            const isSaving = renamingSaving.has(project.id);
            
            return (
              <Col key={project.id} xs={12} sm={6} lg={4}>
                <Card 
                  style={{ 
                    border: '1px solid #e8e8e8', 
                    borderRadius: '16px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: isEditMode ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#FFFFFF',
                    height: '260px',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                  onMouseEnter={(e) => {
                    if (!isEditMode) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                  onClick={() => !isEditMode && navigate(`/project/${project.id}`)}
                >
                  {/* 删除按钮 */}
                  {isEditMode && (
                    <div
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        width: '24px', height: '24px', borderRadius: '50%',
                        backgroundColor: '#ff4d4f', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(255, 77, 79, 0.4)',
                        zIndex: 10, transition: 'all 0.2s ease',
                        color: '#fff', fontWeight: 'bold', fontSize: '12px', lineHeight: '1'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.backgroundColor = '#ff1f1f'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = '#ff4d4f'; }}
                    >
                      ✕
                    </div>
                  )}

                  <Card.Body className="p-4 d-flex flex-column align-items-center text-center" style={{ height: '100%' }}>
                    {/* 项目图标 */}
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '18px',
                      backgroundColor: `${iconColor}15`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                      flexShrink: 0
                    }}>
                      <IconComponent size={32} style={{ color: iconColor }} />
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                      {/* 项目名称：编辑模式切换为 input，普通模式为纯文本 */}
                      {isEditMode ? (
                        <div style={{ position: 'relative', marginBottom: '8px' }}>
                          <input
                            type="text"
                            value={editingNames[project.id] ?? project.name}
                            onChange={(e) => handleNameChange(project.id, e.target.value)}
                            onBlur={() => handleNameBlur(project.id)}
                            onKeyDown={(e) => handleNameKeyDown(e, project.id)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isSaving}
                            style={{
                              width: '100%',
                              fontSize: '15px',
                              fontWeight: 'bold',
                              color: '#333',
                              border: '1.5px solid #1890ff',
                              borderRadius: '8px',
                              padding: '5px 30px 5px 10px',
                              outline: 'none',
                              textAlign: 'center',
                              backgroundColor: isSaving ? '#f5f5f5' : '#fff',
                              boxShadow: '0 0 0 2px rgba(24,144,255,0.15)',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#096dd9'; }}
                            onBlurCapture={(e) => { e.target.style.borderColor = '#1890ff'; }}
                          />
                          {/* 编辑铅笔图标 */}
                          <FaPen
                            size={11}
                            style={{
                              position: 'absolute', right: '10px', top: '50%',
                              transform: 'translateY(-50%)',
                              color: isSaving ? '#bbb' : '#1890ff',
                              pointerEvents: 'none'
                            }}
                          />
                          {/* 保存中 spinner */}
                          {isSaving && (
                            <div style={{
                              position: 'absolute', right: '8px', top: '50%',
                              transform: 'translateY(-50%)'
                            }}>
                              <Spinner animation="border" size="sm" style={{ width: '12px', height: '12px', color: '#1890ff' }} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '8px', lineHeight: '1.3' }}>
                          {project.name}
                        </h4>
                      )}

                      <p style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                        角色：{project.role}
                      </p>
                      <Badge bg="none" style={{ ...getStatusStyle(project.status), fontSize: '12px', padding: '4px 12px', borderRadius: '12px', alignSelf: 'center' }}>
                        {getStatusText(project.status)}
                      </Badge>
                    </div>

                    <CommonButton
                      variant="primary" fullWidth
                      onClick={(e) => { e.stopPropagation(); if (!isEditMode) navigate(`/project/${project.id}`); }}
                      disabled={isEditMode}
                      style={{
                        backgroundColor: isEditMode ? '#d9d9d9' : '#1890ff',
                        borderColor: isEditMode ? '#d9d9d9' : '#1890ff',
                        padding: '10px 16px', fontSize: '14px', fontWeight: '600', marginTop: '12px'
                      }}
                    >
                      进入项目 <FaChevronRight style={{ marginLeft: '6px' }} />
                    </CommonButton>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}

          {/* New Project Card */}
          {!isEditMode && (
            <Col xs={12} sm={6} lg={4}>
              <Card 
                style={{ 
                  border: '3px dashed #1890ff', borderRadius: '16px', 
                  backgroundColor: 'transparent', cursor: 'pointer',
                  transition: 'all 0.2s ease', height: '260px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(24, 144, 255, 0.06)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                onClick={handleOpenCreateModal}
              >
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
                  }}>
                    <FaPlus size={32} style={{ color: '#1890ff' }} />
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#1890ff' }}>新建项目</span>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* Create Project Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="md">
        <Modal.Header style={{ border: 'none', paddingBottom: '8px' }}>
          <Modal.Title style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
            <FaPlus style={{ marginRight: '10px', color: '#1890ff' }} />
            创建新项目
          </Modal.Title>
          <div onClick={() => setShowCreateModal(false)} style={{ cursor: 'pointer', padding: '4px' }}>
            <FaTimes size={20} color="#8c8c8c" />
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500', color: '#333' }}>
                项目名称 <span style={{ color: '#ff4d4f' }}>*</span>
              </Form.Label>
              <Form.Control type="text" placeholder="请输入项目名称" value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                style={{ borderRadius: '8px', padding: '10px 12px' }} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500', color: '#333' }}>
                项目时间 <span style={{ color: '#ff4d4f' }}>*</span>
              </Form.Label>
              <Form.Control type="text" placeholder="例如：2024-2025" value={newProject.duration}
                onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                style={{ borderRadius: '8px', padding: '10px 12px' }} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500', color: '#333' }}>主要内容</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="请简要描述项目内容（可选）" value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                style={{ borderRadius: '8px', padding: '10px 12px', resize: 'none' }} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500', color: '#333' }}>项目负责人</Form.Label>
              <Form.Control type="text" placeholder="请输入负责人姓名（可选）" value={newProject.leader}
                onChange={(e) => setNewProject({ ...newProject, leader: e.target.value })}
                style={{ borderRadius: '8px', padding: '10px 12px' }} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500', color: '#333' }}>联系电话</Form.Label>
              <Form.Control type="text" placeholder="请输入联系电话（可选）" value={newProject.phone}
                onChange={(e) => setNewProject({ ...newProject, phone: e.target.value })}
                style={{ borderRadius: '8px', padding: '10px 12px' }} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ border: 'none', padding: '16px 24px' }}>
          <CommonButton variant="secondary" onClick={() => setShowCreateModal(false)} style={{ marginRight: '12px' }}>
            取消
          </CommonButton>
          <CommonButton variant="primary" onClick={handleCreateProject} disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
            {creating ? <><Spinner animation="border" size="sm" style={{ marginRight: '6px' }} />创建中...</> : '创建项目'}
          </CommonButton>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyProjects;
