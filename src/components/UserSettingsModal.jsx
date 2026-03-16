import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaUser, FaLock, FaIdCard, FaSave, FaCheckCircle, FaCamera } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CommonButton from './CommonButton';
import { showToast } from './Toast';

const API_BASE = '';

const UserSettingsModal = ({ show, onHide }) => {
  const { user, updateUser, uploadAvatar } = useAuth();
  const fileInputRef = useRef(null);

  // 个人信息
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', department: '', major: '', grade: '' });
  // 修改密码
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  // 头像
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 仅在弹窗打开时初始化表单，避免 user 更新（如头像上传后）导致状态被重置
  const prevShowRef = useRef(false);
  useEffect(() => {
    if (show && !prevShowRef.current && user) {
      // 弹窗刚打开：初始化所有表单状态
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        major: user.major || '',
        grade: user.grade || ''
      });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setAvatarPreview(null);
      setError('');
      setSuccess('');
    }
    prevShowRef.current = show;
  }, [show, user]);

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('图片大小不能超过 2MB');
      return;
    }

    // 本地预览
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // 上传
    setUploadingAvatar(true);
    setError('');
    try {
      const result = await uploadAvatar(file);
      if (result.success) {
        setSuccess('头像已更新');
      } else {
        setError(result.message || '头像上传失败');
        setAvatarPreview(null);
      }
    } catch {
      setError('头像上传失败');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      // 重置 input 以便重复选择同一文件
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profile.name.trim()) {
      setError('姓名不能为空');
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateUser(profile);
      if (result.success) {
        setSuccess('个人信息已更新');
        showToast('success', '个人信息保存成功');
      } else {
        const msg = result.message || '更新失败';
        setError(msg);
        showToast('error', `保存失败：${msg}`);
      }
    } catch {
      setError('网络错误');
      showToast('error', '保存失败：网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwords.oldPassword || !passwords.newPassword) {
      setError('请填写旧密码和新密码');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setError('新密码长度至少为6位');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put('/auth/password', {
        old_password: passwords.oldPassword,
        new_password: passwords.newPassword
      });
      if (res.data.success) {
        setSuccess('密码修改成功');
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(res.data.message || '密码修改失败');
      }
    } catch (err) {
      setError(err.response?.data?.message || '密码修改失败');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { padding: '10px 14px', borderRadius: '10px', fontSize: '14px' };
  const labelStyle = { fontWeight: '500', color: '#333', fontSize: '14px', marginBottom: '4px' };

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
        <Modal.Title style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
          <FaUser style={{ marginRight: '10px', color: '#1890ff' }} />个人设置
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '16px 24px 24px' }}>
        {success && (
          <Alert variant="success" style={{ borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCheckCircle /> {success}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" style={{ borderRadius: '10px', fontSize: '14px' }}>
            {error}
          </Alert>
        )}

        {/* 用户基本信息展示 + 头像上传 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
          backgroundColor: '#f8f9fa', borderRadius: '12px', marginBottom: '20px'
        }}>
          {/* 可点击头像 */}
          <div
            onClick={handleAvatarClick}
            style={{
              width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '22px', fontWeight: 'bold',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
            }}
            title="点击更换头像"
          >
            {uploadingAvatar ? (
              <Spinner animation="border" size="sm" variant="light" />
            ) : avatarPreview || getAvatarUrl(user?.avatar) ? (
              <img
                src={avatarPreview || getAvatarUrl(user?.avatar)}
                alt=""
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              (user?.name || 'U').charAt(0).toUpperCase()
            )}
            {/* 悬浮遮罩 */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '24px', backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FaCamera size={12} color="#fff" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>{user?.name}</div>
            <div style={{ fontSize: '13px', color: '#8c8c8c' }}>
              <FaIdCard style={{ marginRight: '4px' }} />{user?.student_id}
            </div>
            <div style={{ fontSize: '12px', color: '#bbb', marginTop: '2px' }}>
              角色: {user?.role === 'admin' ? '管理员' : '学生'}
            </div>
            <div style={{ fontSize: '11px', color: '#1890ff', marginTop: '2px', cursor: 'pointer' }} onClick={handleAvatarClick}>
              点击头像更换
            </div>
          </div>
        </div>

        <Tabs defaultActiveKey="profile" className="mb-3" fill>
          <Tab eventKey="profile" title="个人信息">
            <Form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Form.Group>
                  <Form.Label style={labelStyle}>姓名 *</Form.Label>
                  <Form.Control name="name" value={profile.name} onChange={handleProfileChange} style={inputStyle} />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={labelStyle}>邮箱</Form.Label>
                  <Form.Control name="email" value={profile.email} onChange={handleProfileChange} placeholder="选填" style={inputStyle} />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={labelStyle}>手机号</Form.Label>
                  <Form.Control name="phone" value={profile.phone} onChange={handleProfileChange} placeholder="选填" style={inputStyle} />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={labelStyle}>院系</Form.Label>
                  <Form.Control name="department" value={profile.department} onChange={handleProfileChange} placeholder="选填" style={inputStyle} />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={labelStyle}>专业</Form.Label>
                  <Form.Control name="major" value={profile.major} onChange={handleProfileChange} placeholder="选填" style={inputStyle} />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={labelStyle}>年级</Form.Label>
                  <Form.Control name="grade" value={profile.grade} onChange={handleProfileChange} placeholder="选填" style={inputStyle} />
                </Form.Group>
              </div>
              <div style={{ marginTop: '20px' }}>
                <CommonButton type="submit" variant="primary" fullWidth disabled={submitting}
                  style={{ padding: '12px', fontSize: '15px', fontWeight: '600', borderRadius: '10px',
                    background: submitting ? '#ccc' : 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', border: 'none' }}>
                  {submitting ? <><Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />保存中...</>
                    : <><FaSave style={{ marginRight: '8px' }} />保存信息</>}
                </CommonButton>
              </div>
            </Form>
          </Tab>

          <Tab eventKey="password" title="修改密码">
            <Form onSubmit={handleChangePassword}>
              <Form.Group className="mb-3">
                <Form.Label style={labelStyle}><FaLock style={{ marginRight: '6px', color: '#722ed1' }} />旧密码</Form.Label>
                <Form.Control type="password" name="oldPassword" value={passwords.oldPassword} onChange={handlePasswordChange} placeholder="请输入当前密码" style={inputStyle} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={labelStyle}><FaLock style={{ marginRight: '6px', color: '#1890ff' }} />新密码</Form.Label>
                <Form.Control type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} placeholder="请输入新密码（至少6位）" style={inputStyle} />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label style={labelStyle}><FaLock style={{ marginRight: '6px', color: '#1890ff' }} />确认新密码</Form.Label>
                <Form.Control type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} placeholder="请再次输入新密码" style={inputStyle} />
              </Form.Group>
              <CommonButton type="submit" variant="primary" fullWidth disabled={submitting}
                style={{ padding: '12px', fontSize: '15px', fontWeight: '600', borderRadius: '10px',
                  background: submitting ? '#ccc' : 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', border: 'none' }}>
                {submitting ? <><Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />修改中...</>
                  : <><FaLock style={{ marginRight: '8px' }} />修改密码</>}
              </CommonButton>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default UserSettingsModal;
