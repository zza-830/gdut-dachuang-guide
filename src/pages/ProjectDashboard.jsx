// Project Dashboard - Control Room with Timeline, Budget, and Team Members
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaMoneyBillWave,
  FaDownload,
  FaUsers,
  FaUserCircle,
  FaCrown,
  FaGraduationCap,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaTimes,
  FaPlus,
  FaFolderOpen,
  FaUpload,
  FaFilePdf,
  FaFileWord,
  FaImage,
  FaHistory,
  FaHourglassHalf,
  FaPencilAlt
} from 'react-icons/fa';
import CommonButton from '../components/CommonButton';
import ExpenseModal from '../components/ExpenseModal';
import { showToast } from '../components/Toast';
import api from '../services/api';

// FormField must be defined OUTSIDE the main component to avoid remounting on every render
const FormField = ({ icon: Icon, iconColor, label, value, onChange, placeholder, disabled = false }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
    <Icon style={{ color: iconColor, marginRight: '12px', fontSize: '18px', marginTop: '4px' }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>{label}</div>
      {disabled ? (
        <div style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{value || '-'}</div>
      ) : (
        <Form.Control type="text" value={value || ''} onChange={onChange} placeholder={placeholder}
          style={{ fontSize: '14px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d9d9d9' }} />
      )}
    </div>
  </div>
);

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 实时时间
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 项目数据（从后端加载）
  const [project, setProject] = useState({ id: parseInt(id), name: '加载中...', status: '...' });
  const [projectLoading, setProjectLoading] = useState(true);

  // 经费状态
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [budgetSpent, setBudgetSpent] = useState(0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInputValue, setBudgetInputValue] = useState('');
  const [budgetHovered, setBudgetHovered] = useState(false);
  const budgetInputRef = useRef(null);

  // 支出管理弹窗
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [spentCardHovered, setSpentCardHovered] = useState(false);

  // 团队成员（从后端加载）
  const [teamMembers, setTeamMembers] = useState([]);

  // 成员详情弹窗
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // 成员编辑相关
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    className: '',
    studentId: '',
    email: '',
    phone: '',
    lab: ''
  });

  // 添加成员弹窗
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  
  // 搜索用户相关
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const searchTimeoutRef = useRef(null);

  // 添加分类弹窗
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 资料归档状态
  const [activeArchiveTab, setActiveArchiveTab] = useState('全部');
  const [isArchiveEditMode, setIsArchiveEditMode] = useState(false);
  const [archiveFiles, setArchiveFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 重命名状态
  const [renamingFileId, setRenamingFileId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef(null);

  // 审计日志
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // 动态分类标签
  const defaultCategories = ['全部', '专利文件', '申报文档', '其他资料'];
  const [archiveCategories, setArchiveCategories] = useState(() => {
    const saved = localStorage.getItem(`project_${id}_categories`);
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => {
    localStorage.setItem(`project_${id}_categories`, JSON.stringify(archiveCategories));
  }, [archiveCategories, id]);

  // ─── Fetch project detail from backend ───
  const fetchProject = useCallback(async () => {
    try {
      setProjectLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        const p = res.data.data;
        const statusMap = {
          'in_progress': '进行中',
          'pending': '待审核',
          'approved': '已立项',
          'completed': '已结题',
          'rejected': '已驳回'
        };
        setProject({ 
          id: p.id, 
          name: p.title, 
          status: statusMap[p.status] || p.status,
          currentUserRole: p.currentUserRole
        });
        setBudgetTotal(p.budget || 0);
        // Note: budgetSpent is set by fetchExpenseTotal (SUM from expenses table)
        setTeamMembers(Array.isArray(p.team_members) ? p.team_members : []);
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setProjectLoading(false);
    }
  }, [id]);

  // ─── Fetch files from backend ───
  const fetchFiles = useCallback(async () => {
    try {
      setFilesLoading(true);
      const res = await api.get(`/files/${id}`);
      if (res.data.success) {
        const mapped = res.data.data.map(f => ({
          id: f.id,
          name: f.filename,
          type: getFileTypeFromName(f.filename),
          category: f.category || mapFileType(f.file_type),
          date: new Date(f.uploaded_at).toISOString().split('T')[0],
          size: formatFileSize(f.file_size),
          backendId: f.id,
          uploader: f.uploader_name
        }));
        setArchiveFiles(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setArchiveFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [id]);

  // ─── Fetch audit logs from backend ───
  const fetchLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const res = await api.get(`/logs/${id}?limit=5`);
      if (res.data.success) {
        setAuditLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setAuditLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [id]);

  // ─── Fetch expense total from backend ───
  const fetchExpenseTotal = useCallback(async () => {
    try {
      const res = await api.get(`/expenses/${id}`);
      if (res.data.success) {
        setBudgetSpent(res.data.data.total_used);
      }
    } catch (err) {
      console.error('Failed to fetch expense total:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchFiles();
    fetchLogs();
    fetchExpenseTotal();
  }, [fetchProject, fetchFiles, fetchLogs, fetchExpenseTotal]);

  // 时间线数据
  const timeline = [
    { date: '2025-10-15', title: '项目立项申报', description: '提交项目立项申报书' },
    { date: '2025-11-20', title: '立项审批完成', description: '通过学校评审，正式立项' },
    { date: '2026-04-15', title: '中期检查', description: '提交中期检查报告' },
    { date: '2026-10-20', title: '结题填报', description: '完成项目结题材料填报' },
    { date: '2026-12-10', title: '项目结题', description: '项目正式结题' }
  ];

  // ─── Budget handlers (0 ~ 20000 validation + backend persist) ───
  const handleBudgetClick = () => {
    setBudgetInputValue(String(budgetTotal));
    setIsEditingBudget(true);
  };

  useEffect(() => {
    if (isEditingBudget && budgetInputRef.current) {
      budgetInputRef.current.focus();
      budgetInputRef.current.select();
    }
  }, [isEditingBudget]);

  const commitBudgetEdit = async () => {
    let val = parseFloat(budgetInputValue);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 20000) val = 20000;

    setBudgetTotal(val);
    setIsEditingBudget(false);

    try {
      await api.patch(`/projects/${id}/funding`, { budget: val });
      showToast('success', '经费已更新');
      fetchLogs();
    } catch (err) {
      console.error('Update funding failed:', err);
      showToast('error', '经费更新失败');
    }
  };

  const handleBudgetKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitBudgetEdit(); }
    if (e.key === 'Escape') { setIsEditingBudget(false); }
  };

  // ─── Helper functions ───
  const getFileTypeFromName = (fileName) => {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    return 'other';
  };

  const mapFileType = (fileType) => {
    switch (fileType) {
      case 'attachment': return '专利文件';
      case 'application': return '申报文档';
      default: return '其他资料';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredArchiveFiles = activeArchiveTab === '全部'
    ? archiveFiles
    : archiveFiles.filter(file => file.category === activeArchiveTab);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FaFilePdf style={{ color: '#ff4d4f' }} />;
      case 'word': return <FaFileWord style={{ color: '#1890ff' }} />;
      case 'image': return <FaImage style={{ color: '#52c41a' }} />;
      default: return <FaFileAlt style={{ color: '#8c8c8c' }} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case '专利文件': return { bg: '#fff1f0', color: '#cf1322' };
      case '申报文档': return { bg: '#e6f7ff', color: '#0050b3' };
      case '其他资料': return { bg: '#f6ffed', color: '#389e0d' };
      default: return { bg: '#f5f5f5', color: '#8c8c8c' };
    }
  };

  // ─── File operations ───
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const category = activeArchiveTab !== '全部' ? activeArchiveTab : '其他资料';
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      const res = await api.post(`/files/${id}/upload`, formData);
      if (res.data.success) {
        showToast('success', `文件 "${file.name}" 上传成功`);
        await fetchFiles();
        fetchLogs();
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('error', '文件上传失败：' + (err.response?.data?.message || '未知错误'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteArchiveFile = async (fileId, fileName) => {
    if (!window.confirm(`确定要删除文件 "${fileName}" 吗？`)) return;
    try {
      const res = await api.delete(`/files/${fileId}`);
      if (res.data.success) {
        showToast('success', `文件 "${fileName}" 已删除`);
        await fetchFiles();
        fetchLogs();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('error', '删除失败：' + (err.response?.data?.message || '未知错误'));
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const response = await api.get(`/files/download/${file.backendId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('success', `正在下载 "${file.name}"`);
      fetchLogs();
    } catch (err) {
      console.error('Download failed:', err);
      showToast('error', '下载失败');
    }
  };

  // ─── Rename file ───
  const handleStartRename = (file) => {
    // 去掉后缀名，只编辑文件名部分
    const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
    const nameWithoutExt = ext ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
    setRenamingFileId(file.id);
    setRenameValue(nameWithoutExt);
    // 下一帧聚焦输入框
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const handleConfirmRename = async (file) => {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      showToast('warning', '文件名不能为空');
      return;
    }
    // 原始后缀
    const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
    const newFullName = `${trimmed}${ext}`;
    if (newFullName === file.name) {
      // 没有变化，直接退出编辑
      setRenamingFileId(null);
      return;
    }
    try {
      const res = await api.put(`/files/${file.backendId || file.id}/rename`, { filename: trimmed });
      if (res.data.success) {
        showToast('success', `文件已重命名为 "${res.data.data.filename}"`);
        await fetchFiles();
        fetchLogs();
      }
    } catch (err) {
      console.error('Rename failed:', err);
      showToast('error', '重命名失败：' + (err.response?.data?.message || '未知错误'));
    } finally {
      setRenamingFileId(null);
    }
  };

  const handleCancelRename = () => {
    setRenamingFileId(null);
    setRenameValue('');
  };

  const handleAddCategory = () => {
    setNewCategoryName('');
    setShowCategoryModal(true);
  };

  const handleConfirmAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (archiveCategories.includes(trimmed)) { showToast('warning', '该分类已存在'); setShowCategoryModal(false); return; }
    setArchiveCategories([...archiveCategories, trimmed]);
    setActiveArchiveTab(trimmed);
    showToast('success', `分类 "${trimmed}" 已添加`);
    setShowCategoryModal(false);
    try {
      await api.post('/logs', { action: 'add_category', entity_type: 'project', entity_id: parseInt(id), details: { name: trimmed } });
      fetchLogs();
    } catch (err) { console.error('Log add_category failed:', err); }
  };

  // ─── Audit log helpers ───
  const formatLogAction = (log) => {
    const actionMap = {
      'upload_file': '上传了文件',
      'download_file': '下载了',
      'delete_file': '删除了文件',
      'create_project': '创建了项目',
      'update_project': '修改了',
      'update_funding': '更新了经费',
      'update_team': '更新了团队信息',
      'create_reimbursement': '申请了报销',
      'add_member': '添加了成员',
      'remove_member': '移除了成员',
      'add_expense': '添加了支出',
      'delete_expense': '删除了支出',
      'add_category': '添加了分类',
      'delete_category': '删除了分类'
    };
    const action = actionMap[log.action] || log.action;
    let target = '';
    try {
      const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
      if (details?.filename) {
        target = details.filename;
      } else if (details?.name) {
        target = details.name;
      } else if (details?.added_members) {
        target = details.added_members.join('、');
      } else if (details?.removed_members) {
        target = details.removed_members.join('、');
      } else if (details?.new_budget !== undefined) {
        target = `¥${details.old_budget?.toLocaleString() ?? 0} → ¥${details.new_budget.toLocaleString()}`;
      }
    } catch { target = ''; }
    return { action, target };
  };

  const formatLogTime = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}小时前`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return '昨天';
    if (diffDay < 7) return `${diffDay}天前`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // ─── Team member handlers (with REAL database integration) ───
  const fetchProjectMembers = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setTeamMembers(res.data.data.team_members || []);
      }
    } catch (err) {
      console.error('Failed to fetch project members:', err);
    }
  }, [id]);

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setIsEditing(false);
    setShowMemberModal(true);
  };

  const handleStartEdit = () => {
    if (selectedMember) {
      setEditFormData({
        name: selectedMember.name || '',
        role: selectedMember.role || '',
        className: selectedMember.className || '',
        studentId: selectedMember.studentId || '',
        email: selectedMember.email || '',
        phone: selectedMember.phone || '',
        lab: selectedMember.lab || ''
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    // 暂不实现后端更新，直接关闭
    setIsEditing(false);
    showToast('info', '成员信息编辑功能开发中');
  };

  const handleRoleChange = (role) => {
    setEditFormData({ ...editFormData, role });
  };

  const handleDeleteMember = async () => {
    if (selectedMember.role === 'captain') { showToast('warning', '不能移除队长，请先转让队长身份'); return; }
    if (window.confirm(`确定要移除成员 ${selectedMember.name} 吗？`)) {
      try {
        const res = await api.delete(`/projects/${id}/members/${selectedMember.id}`);
        if (res.data.success) {
          showToast('success', '成员已移除');
          setShowMemberModal(false);
          fetchProjectMembers();
          fetchLogs();
        }
      } catch (err) {
        showToast('error', err.response?.data?.message || '移除成员失败');
      }
    }
  };

  const handleSearchUser = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      setIsSearching(true);
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setSearchResults(res.data.data);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('Search user error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedUser(null);
    setNewMemberId('');

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearchUser(value);
    }, 300);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(`${user.name} (${user.student_id})`);
    setNewMemberId(user.id.toString());
    setShowDropdown(false);
  };

  const handleOpenAddModal = () => {
    setNewMemberId('');
    setNewMemberRole('member');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setShowDropdown(false);
    setShowAddModal(true);
  };

  const handleAddMember = async () => {
    if (!newMemberId) { showToast('warning', '请先搜索并选择一个真实用户'); return; }
    
    try {
      const res = await api.post(`/projects/${id}/members`, { 
        userId: parseInt(newMemberId), 
        role: newMemberRole 
      });
      if (res.data.success) {
        showToast('success', '成员添加成功');
        setShowAddModal(false);
        fetchProjectMembers();
        fetchLogs();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || '添加成员失败');
    }
  };

  const budgetBalance = budgetTotal - budgetSpent;

  return (
    <Container fluid className="p-4 page-transition" style={{ backgroundColor: '#F0F4F8', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-4 animate-fade-in-up">
        <CommonButton variant="link" onClick={() => navigate('/my-projects')}
          style={{ padding: 0, marginBottom: '16px', color: '#6c757d', textDecoration: 'none' }}>
          <FaArrowLeft style={{ marginRight: '8px' }} />返回项目列表
        </CommonButton>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
          {projectLoading ? <Spinner animation="border" size="sm" /> : project.name}
        </h1>
        <Badge bg="primary" style={{ fontSize: '12px', padding: '6px 12px' }}>{project.status}</Badge>
      </div>

      <Row className="g-4 dashboard-row">
        {/* Left Panel */}
        <Col lg={8}>
          {/* Timeline */}
          <Card className="animate-fade-in-up" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Card.Body style={{ padding: 'clamp(16px, 2vw, 24px)' }}>
              <h5 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#333' }}>
                <FaClock style={{ marginRight: '10px', color: '#1890ff' }} />项目时间线
              </h5>
              <div style={{ position: 'relative', paddingLeft: '40px' }}>
                <div style={{ position: 'absolute', left: '11px', top: '0', bottom: '0', width: '2px', backgroundColor: '#e8e8e8' }} />
                {(() => {
                  const todayStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;
                  const todayTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
                  const items = timeline.map(t => ({ ...t, isNowMarker: false }));
                  let insertIdx = items.length;
                  for (let i = 0; i < items.length; i++) {
                    if (todayStr < items[i].date) { insertIdx = i; break; }
                  }
                  if (insertIdx < items.length && todayStr === items[insertIdx].date) insertIdx += 1;
                  items.splice(insertIdx, 0, { isNowMarker: true, date: todayStr, time: todayTime });

                  return items.map((item, index) => {
                    if (item.isNowMarker) {
                      return (
                        <div key="now-marker" style={{ position: 'relative', paddingBottom: index === items.length - 1 ? 0 : '32px' }}>
                          <div style={{ position: 'absolute', left: '-40px', top: '4px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ff4d4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', zIndex: 2, boxShadow: '0 0 0 4px rgba(255, 77, 79, 0.2)', animation: 'pulse-now 2s ease-in-out infinite' }}>
                            <FaHourglassHalf size={10} />
                          </div>
                          <div style={{ padding: '12px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #fff1f0 0%, #fff7e6 100%)', border: '1px dashed #ff4d4f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: '#ff4d4f', fontWeight: '600', marginBottom: '2px' }}>📍 当前时间</div>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
                                {todayStr}<span style={{ fontSize: '13px', color: '#8c8c8c', marginLeft: '8px' }}>{todayTime}</span>
                              </div>
                            </div>
                            <Badge bg="danger" style={{ fontSize: '10px', padding: '4px 10px', animation: 'pulse-now 2s ease-in-out infinite' }}>实时</Badge>
                          </div>
                        </div>
                      );
                    }
                    const isPast = item.date < todayStr;
                    const isToday = item.date === todayStr;
                    const dotColor = isPast ? '#52c41a' : isToday ? '#1890ff' : '#d9d9d9';
                    const bgColor = isPast ? '#f6ffed' : isToday ? '#e6f7ff' : '#fafafa';
                    const borderColor = isPast ? '#b7eb8f' : isToday ? '#91d5ff' : '#f0f0f0';
                    return (
                      <div key={index} style={{ position: 'relative', paddingBottom: index === items.length - 1 ? 0 : '32px' }}>
                        <div style={{ position: 'absolute', left: '-40px', top: '4px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: dotColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', zIndex: 1 }}>
                          {isPast ? <FaCheckCircle size={12} /> : <FaClock size={10} />}
                        </div>
                        <div style={{ backgroundColor: bgColor, padding: '16px 20px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>{item.date}</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                            {item.title}
                            {isPast && <Badge bg="success" style={{ marginLeft: '8px', fontSize: '10px' }}>已完成</Badge>}
                            {isToday && <Badge bg="primary" style={{ marginLeft: '8px', fontSize: '10px' }}>今天</Badge>}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6c757d' }}>{item.description}</div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card.Body>
          </Card>

          {/* Project Archives */}
          <Card className="mt-4 animate-fade-in-up" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Card.Body style={{ padding: 'clamp(16px, 2vw, 24px)' }}>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: 0 }}>
                  <FaFolderOpen style={{ marginRight: '10px', color: '#faad14' }} />资料归档
                </h5>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CommonButton variant="outline-primary" onClick={() => setIsArchiveEditMode(!isArchiveEditMode)}
                    style={{ fontSize: '13px', padding: '6px 16px', borderRadius: '20px' }}>
                    {isArchiveEditMode ? '✓ 完成' : '✎ 编辑'}
                  </CommonButton>
                  <CommonButton variant="primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    style={{ fontSize: '13px', padding: '6px 16px', borderRadius: '20px' }}>
                    {uploading ? <Spinner animation="border" size="sm" /> : <><FaUpload style={{ marginRight: '6px' }} />上传文件</>}
                  </CommonButton>
                </div>
              </div>

              {/* Category Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {archiveCategories.map(cat => (
                  <span key={cat} onClick={() => setActiveArchiveTab(cat)}
                    style={{
                      position: 'relative',
                      padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                      backgroundColor: activeArchiveTab === cat ? '#1890ff' : '#f0f0f0',
                      color: activeArchiveTab === cat ? '#fff' : '#666', fontWeight: activeArchiveTab === cat ? '600' : '400',
                      transition: 'all 0.2s',
                      paddingRight: isArchiveEditMode && cat !== '全部' ? '28px' : '16px'
                    }}>
                    {cat}
                    {isArchiveEditMode && cat !== '全部' && (
                      <span
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!window.confirm(`确定要删除分类「${cat}」吗？该分类下的文件不会被删除，仍可在"全部"中查看。`)) return;
                          // Remove category from list
                          setArchiveCategories(prev => prev.filter(c => c !== cat));
                          // If currently viewing this category, switch to "全部"
                          if (activeArchiveTab === cat) setActiveArchiveTab('全部');
                          showToast('success', `分类「${cat}」已删除，文件已保留`);
                          try {
                            await api.post('/logs', { action: 'delete_category', entity_type: 'project', entity_id: parseInt(id), details: { name: cat } });
                            fetchLogs();
                          } catch (err) { console.error('Log delete_category failed:', err); }
                        }}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          backgroundColor: '#ff4d4f', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', lineHeight: '1', fontWeight: 'bold',
                          cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                        }}
                        title={`删除分类「${cat}」`}
                      >
                        ×
                      </span>
                    )}
                  </span>
                ))}
                <span onClick={handleAddCategory}
                  style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', backgroundColor: '#f0f0f0', color: '#1890ff', border: '1px dashed #1890ff' }}>
                  <FaPlus style={{ marginRight: '4px' }} />添加
                </span>
              </div>

              {/* File List */}
              {filesLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                  <Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />加载文件...
                </div>
              ) : filteredArchiveFiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#bfbfbf' }}>
                  <FaFolderOpen size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <div>暂无文件</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredArchiveFiles.map(file => {
                    const catColor = getCategoryColor(file.category);
                    const isRenaming = renamingFileId === file.id;
                    const fileExt = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
                    return (
                      <div key={file.id} style={{
                        display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '10px',
                        backgroundColor: isRenaming ? '#f0f7ff' : '#fafafa', border: isRenaming ? '1px solid #91d5ff' : '1px solid #f0f0f0', gap: '12px', transition: 'all 0.2s'
                      }}
                        onMouseEnter={(e) => { if (!isRenaming) { e.currentTarget.style.backgroundColor = '#f0f7ff'; e.currentTarget.style.borderColor = '#d6e4ff'; } }}
                        onMouseLeave={(e) => { if (!isRenaming) { e.currentTarget.style.backgroundColor = '#fafafa'; e.currentTarget.style.borderColor = '#f0f0f0'; } }}>
                        <div style={{ fontSize: '20px' }}>{getFileIcon(file.type)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {isRenaming ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Form.Control
                                ref={renameInputRef}
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') { e.preventDefault(); handleConfirmRename(file); }
                                  if (e.key === 'Escape') { handleCancelRename(); }
                                }}
                                onBlur={() => handleConfirmRename(file)}
                                style={{ fontSize: '13px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #91d5ff', flex: 1, minWidth: 0 }}
                              />
                              <span style={{ fontSize: '12px', color: '#8c8c8c', flexShrink: 0 }}>{fileExt}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                          )}
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{file.date} · {file.size}</div>
                        </div>
                        <Badge bg="none" style={{ ...catColor, fontSize: '11px', padding: '3px 10px', borderRadius: '10px', backgroundColor: catColor.bg }}>{file.category}</Badge>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <CommonButton variant="link" onClick={() => handleDownloadFile(file)} style={{ padding: '4px 8px', color: '#1890ff' }} title="下载">
                            <FaDownload size={14} />
                          </CommonButton>
                          <CommonButton variant="link" onClick={() => handleStartRename(file)} style={{ padding: '4px 8px', color: '#faad14' }} title="重命名">
                            <FaPencilAlt size={13} />
                          </CommonButton>
                          {isArchiveEditMode && (
                            <CommonButton variant="link" onClick={() => handleDeleteArchiveFile(file.backendId || file.id, file.name)} style={{ padding: '4px 8px', color: '#ff4d4f' }} title="删除">
                              <FaTimes size={14} />
                            </CommonButton>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Panel */}
        <Col lg={4}>
          {/* Budget Card */}
          <Card className="animate-fade-in-up" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Card.Body style={{ padding: 'clamp(16px, 2vw, 24px)' }}>
              <h5 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
                <FaMoneyBillWave style={{ marginRight: '10px', color: '#52c41a' }} />经费概况
              </h5>

              {/* Total Budget - Editable */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '4px' }}>总经费（0 ~ 20,000 元）</div>
                {isEditingBudget ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Form.Control ref={budgetInputRef} type="number" min="0" max="20000" step="100"
                      value={budgetInputValue} onChange={(e) => setBudgetInputValue(e.target.value)}
                      onBlur={commitBudgetEdit} onKeyDown={handleBudgetKeyDown}
                      style={{ fontSize: '24px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px', width: '160px' }} />
                    <span style={{ fontSize: '14px', color: '#8c8c8c' }}>元</span>
                  </div>
                ) : (
                  <div onClick={handleBudgetClick} onMouseEnter={() => setBudgetHovered(true)} onMouseLeave={() => setBudgetHovered(false)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '8px', backgroundColor: budgetHovered ? '#f0f7ff' : 'transparent', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>¥{budgetTotal.toLocaleString()}</span>
                    <FaPencilAlt size={12} style={{ color: budgetHovered ? '#1890ff' : '#d9d9d9', transition: 'color 0.2s' }} />
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8c8c8c', marginBottom: '6px' }}>
                  <span>已使用</span>
                  <span>{budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${budgetTotal > 0 ? Math.min((budgetSpent / budgetTotal) * 100, 100) : 0}%`, backgroundColor: budgetSpent / budgetTotal > 0.8 ? '#ff4d4f' : '#52c41a', borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
              </div>

              <Row className="g-2">
                <Col xs={6}>
                  <div
                    onClick={() => setShowExpenseModal(true)}
                    onMouseEnter={() => setSpentCardHovered(true)}
                    onMouseLeave={() => setSpentCardHovered(false)}
                    style={{
                      padding: '12px', backgroundColor: '#f6ffed', borderRadius: '10px', textAlign: 'center',
                      cursor: 'pointer', transition: 'all 0.25s ease',
                      transform: spentCardHovered ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: spentCardHovered ? '0 4px 12px rgba(82, 196, 26, 0.25)' : 'none',
                      border: spentCardHovered ? '1px solid #b7eb8f' : '1px solid transparent'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#52c41a', marginBottom: '4px' }}>已使用 {spentCardHovered ? '📋' : ''}</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>¥{budgetSpent.toLocaleString()}</div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div style={{ padding: '12px', backgroundColor: budgetBalance < 0 ? '#fff1f0' : '#e6f7ff', borderRadius: '10px', textAlign: 'center', border: '1px solid transparent' }}>
                    <div style={{ fontSize: '11px', color: budgetBalance < 0 ? '#ff4d4f' : '#1890ff', marginBottom: '4px' }}>剩余</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: budgetBalance < 0 ? '#ff4d4f' : '#1890ff' }}>¥{budgetBalance.toLocaleString()}</div>
                  </div>
                </Col>
              </Row>

              {/* Apply for Reimbursement Button */}
              <button
                onClick={() => navigate(`/project/${id}/reimburse`)}
                style={{
                  width: '100%', marginTop: '16px', padding: '10px 0', backgroundColor: '#eff6ff',
                  color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '10px', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
              >
                <FaFileAlt size={14} />
                申请报销
              </button>
            </Card.Body>
          </Card>

          {/* Team Members Card */}
          <Card className="mt-4 animate-fade-in-up" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Card.Body style={{ padding: 'clamp(16px, 2vw, 24px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: 0 }}>
                  <FaUsers style={{ marginRight: '10px', color: '#722ed1' }} />团队成员
                </h5>
                {project.currentUserRole === 'captain' && (
                  <CommonButton variant="outline-primary" onClick={handleOpenAddModal}
                    style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '16px' }}>
                    <FaPlus style={{ marginRight: '4px' }} />添加
                  </CommonButton>
                )}
              </div>

              {teamMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#bfbfbf' }}>
                  <FaUsers size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
                  <div style={{ fontSize: '13px' }}>暂无团队成员</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {teamMembers.map(member => {
                    const roleConfig = member.role === 'captain'
                      ? { label: '队长', bg: '#fff7e6', color: '#d48806', border: '#ffe58f', avatarColor: '#faad14' }
                      : member.role === 'advisor'
                        ? { label: '指导老师', bg: '#f0f5ff', color: '#2f54eb', border: '#adc6ff', avatarColor: '#597ef7' }
                        : { label: '成员', bg: '#f6ffed', color: '#389e0d', border: '#b7eb8f', avatarColor: '#bfbfbf' };
                    return (
                      <div key={member.id} onClick={() => handleMemberClick(member)}
                        style={{
                          display: 'flex', alignItems: 'center', padding: '14px 16px', borderRadius: '12px',
                          backgroundColor: '#ffffff', cursor: 'pointer', transition: 'all 0.25s ease',
                          gap: '14px', border: '1px solid #e8e8e8',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          e.currentTarget.style.borderColor = '#d6d6d6';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                          e.currentTarget.style.borderColor = '#e8e8e8';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: `linear-gradient(135deg, ${roleConfig.avatarColor}22, ${roleConfig.avatarColor}44)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <FaUserCircle size={28} style={{ color: roleConfig.avatarColor }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                              {member.name}
                            </span>
                            {member.role === 'captain' && <FaCrown style={{ color: '#faad14', fontSize: '13px' }} />}
                          </div>
                          <span style={{
                            fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '10px',
                            backgroundColor: roleConfig.bg, color: roleConfig.color, border: `1px solid ${roleConfig.border}`,
                            display: 'inline-block'
                          }}>
                            {roleConfig.label}
                          </span>
                        </div>
                        <FaPencilAlt size={13} style={{ color: '#d0d0d0', flexShrink: 0, transition: 'color 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#1890ff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#d0d0d0'; }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Audit Logs Card */}
          <Card className="mt-4 animate-fade-in-up" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Card.Body style={{ padding: 'clamp(16px, 2vw, 24px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: 0 }}>
                  <FaHistory style={{ marginRight: '10px', color: '#13c2c2' }} />操作日志
                </h5>
                <span onClick={() => navigate(`/project/${id}/logs`)}
                  style={{ fontSize: '13px', color: '#1890ff', cursor: 'pointer' }}>
                  查看全部 →
                </span>
              </div>
              {logsLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                  <Spinner animation="border" size="sm" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#bfbfbf', fontSize: '13px' }}>暂无操作记录</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {auditLogs.map(log => {
                    const { action, target } = formatLogAction(log);
                    return (
                      <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#13c2c2', marginTop: '6px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#333', fontWeight: '500' }}>{log.user_name || '系统'}</span>
                          <span style={{ color: '#666', margin: '0 4px' }}>{action}</span>
                          {target && <span style={{ color: '#1890ff' }}>{target}</span>}
                          <div style={{ fontSize: '11px', color: '#bfbfbf', marginTop: '2px' }}>{formatLogTime(log.created_at)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>

        </Col>
      </Row>

      {/* ─── Member Detail Modal ─── */}
      <Modal show={showMemberModal} onHide={() => setShowMemberModal(false)} centered>
        <Modal.Header closeButton={false} style={{ border: 'none', paddingBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: '600' }}>
            {isEditing ? '编辑成员' : '成员详情'}
          </Modal.Title>
          <div onClick={() => setShowMemberModal(false)} style={{ cursor: 'pointer', marginLeft: 'auto' }}><FaTimes size={18} color="#8c8c8c" /></div>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          {selectedMember && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <FaUserCircle size={56} style={{ color: selectedMember.role === 'captain' ? '#faad14' : '#bfbfbf' }} />
                <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '8px' }}>{selectedMember.name}</div>
              </div>
              <FormField icon={FaUserCircle} iconColor="#1890ff" label="姓名" value={isEditing ? editFormData.name : selectedMember.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} placeholder="姓名" disabled={!isEditing} />
              <FormField icon={FaCrown} iconColor="#faad14" label="角色" value={isEditing ? (editFormData.role === 'captain' ? '队长' : editFormData.role === 'advisor' ? '指导老师' : '成员') : (selectedMember.role === 'captain' ? '队长' : selectedMember.role === 'advisor' ? '指导老师' : '成员')}
                disabled={true} />
              {isEditing && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', paddingLeft: '30px' }}>
                  {['captain', 'member', 'advisor'].map(r => (
                    <span key={r} onClick={() => handleRoleChange(r)}
                      style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', backgroundColor: editFormData.role === r ? '#1890ff' : '#f0f0f0', color: editFormData.role === r ? '#fff' : '#666' }}>
                      {r === 'captain' ? '队长' : r === 'advisor' ? '指导老师' : '成员'}
                    </span>
                  ))}
                </div>
              )}
              <FormField icon={FaGraduationCap} iconColor="#722ed1" label="班级" value={isEditing ? editFormData.className : selectedMember.className}
                onChange={(e) => setEditFormData({ ...editFormData, className: e.target.value })} placeholder="班级" disabled={!isEditing} />
              <FormField icon={FaIdCard} iconColor="#13c2c2" label="学号" value={isEditing ? editFormData.studentId : selectedMember.studentId}
                onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })} placeholder="学号" disabled={!isEditing} />
              <FormField icon={FaEnvelope} iconColor="#eb2f96" label="邮箱" value={isEditing ? editFormData.email : selectedMember.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} placeholder="邮箱" disabled={!isEditing} />
              <FormField icon={FaPhone} iconColor="#52c41a" label="电话" value={isEditing ? editFormData.phone : selectedMember.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} placeholder="电话" disabled={!isEditing} />
              <FormField icon={FaBuilding} iconColor="#faad14" label="实验室" value={isEditing ? editFormData.lab : selectedMember.lab}
                onChange={(e) => setEditFormData({ ...editFormData, lab: e.target.value })} placeholder="实验室" disabled={!isEditing} />
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: 'none', justifyContent: 'space-between' }}>
          {isEditing ? (
            <>
              {project.currentUserRole === 'captain' ? (
                <CommonButton variant="outline-danger" onClick={handleDeleteMember}>删除成员</CommonButton>
              ) : (
                <div />
              )}
              <div style={{ display: 'flex', gap: '8px', marginLeft: project.currentUserRole === 'captain' ? '0' : 'auto' }}>
                <CommonButton variant="secondary" onClick={handleCancelEdit}>取消</CommonButton>
                <CommonButton variant="primary" onClick={handleSaveEdit}>保存</CommonButton>
              </div>
            </>
          ) : (
            <>
              <div />
              <CommonButton variant="primary" onClick={handleStartEdit}><FaPencilAlt style={{ marginRight: '6px' }} />编辑</CommonButton>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* ─── Add Member Modal ─── */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton={false} style={{ border: 'none', paddingBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: '600' }}>添加成员</Modal.Title>
          <div onClick={() => setShowAddModal(false)} style={{ cursor: 'pointer', marginLeft: 'auto' }}><FaTimes size={18} color="#8c8c8c" /></div>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <FaIdCard style={{ color: '#1890ff', marginRight: '12px', fontSize: '18px', marginTop: '4px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>搜索用户 (学号/姓名) *</div>
                <Form.Control 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange} 
                  onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                  placeholder="请输入学号或姓名搜索" 
                  style={{ fontSize: '14px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d9d9d9' }} 
                />
                
                {isSearching && (
                  <div style={{ position: 'absolute', right: '12px', top: '32px' }}>
                    <Spinner animation="border" size="sm" style={{ color: '#1890ff' }} />
                  </div>
                )}
                
                {showDropdown && searchResults.length > 0 && (
                  <div style={{ 
                    position: 'absolute', top: '100%', left: '30px', right: 0, zIndex: 1000,
                    marginTop: '4px', backgroundColor: '#fff', borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #f0f0f0',
                    maxHeight: '200px', overflowY: 'auto'
                  }}>
                    {searchResults.map(user => (
                      <div 
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        style={{ 
                          padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <span style={{ fontWeight: '500', color: '#333' }}>{user.name}</span>
                        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>学号: {user.student_id}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {showDropdown && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
                  <div style={{ 
                    position: 'absolute', top: '100%', left: '30px', right: 0, zIndex: 1000,
                    marginTop: '4px', backgroundColor: '#fff', borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #f0f0f0',
                    padding: '12px', textAlign: 'center', color: '#8c8c8c', fontSize: '13px'
                  }}>
                    未找到匹配的用户
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px', paddingLeft: '30px' }}>
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '6px' }}>角色</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['member', 'advisor'].map(r => (
                <span key={r} onClick={() => setNewMemberRole(r)}
                  style={{ padding: '6px 16px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', backgroundColor: newMemberRole === r ? '#1890ff' : '#f0f0f0', color: newMemberRole === r ? '#fff' : '#666' }}>
                  {r === 'advisor' ? '指导老师' : '成员'}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px' }}>
              注：添加成员现在会直接关联系统中的真实用户账号。添加后，该成员登录系统即可在“我的项目”中看到此项目。
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <CommonButton variant="secondary" onClick={() => setShowAddModal(false)}>取消</CommonButton>
          <CommonButton variant="primary" onClick={handleAddMember} disabled={!newMemberId}>添加绑定</CommonButton>
        </Modal.Footer>
      </Modal>

      {/* ─── Expense Modal ─── */}
      <ExpenseModal
        show={showExpenseModal}
        onHide={() => { setShowExpenseModal(false); fetchExpenseTotal(); fetchLogs(); }}
        projectId={id}
        budgetTotal={budgetTotal}
        onExpenseChange={(newTotal) => setBudgetSpent(newTotal)}
      />

      {/* ─── Add Category Modal ─── */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered size="sm">
        <Modal.Header closeButton={false} style={{ border: 'none', paddingBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: '600' }}>新建分类</Modal.Title>
          <div onClick={() => setShowCategoryModal(false)} style={{ cursor: 'pointer', marginLeft: 'auto' }}><FaTimes size={18} color="#8c8c8c" /></div>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          <Form.Control
            autoFocus
            type="text"
            placeholder="请输入分类名称"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAddCategory(); }}
            style={{ fontSize: '14px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d9d9d9' }}
          />
        </Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <CommonButton variant="secondary" onClick={() => setShowCategoryModal(false)}>取消</CommonButton>
          <CommonButton variant="primary" onClick={handleConfirmAddCategory} disabled={!newCategoryName.trim()}>确认</CommonButton>
        </Modal.Footer>
      </Modal>

      <style>{`
        @keyframes pulse-now {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </Container>
  );
};

export default ProjectDashboard;
