import React, { useState } from 'react';
import { Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaLightbulb, FaUser, FaIdCard, FaLock, FaSignInAlt, FaUserPlus, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import CommonButton from './CommonButton';

const LoginModal = ({ show, onHide, onLoginSuccess }) => {
  const { login, register } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', name: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const resetForm = () => {
    setFormData({ studentId: '', name: '', password: '', confirmPassword: '' });
    setError('');
    setRegSuccess('');
    setIsRegisterMode(false);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.studentId || !formData.password) {
      setError('请输入学号和密码');
      return;
    }

    if (isRegisterMode) {
      // 注册逻辑
      if (!formData.name) {
        setError('注册时请填写真实姓名');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      if (formData.password.length < 6) {
        setError('密码长度至少为6位');
        return;
      }

      setSubmitting(true);
      try {
        const result = await register({
          studentId: formData.studentId,
          password: formData.password,
          name: formData.name
        });

        if (result.success) {
          setRegSuccess('注册成功！请登录');
          // 保留学号和密码，切换到登录模式
          const savedId = formData.studentId;
          const savedPwd = formData.password;
          setTimeout(() => {
            setIsRegisterMode(false);
            setFormData({ studentId: savedId, name: '', password: savedPwd, confirmPassword: '' });
            setRegSuccess('');
          }, 1500);
        } else {
          setError(result.message || '注册失败');
        }
      } catch {
        setError('网络错误，请确认后端服务已启动');
      } finally {
        setSubmitting(false);
      }
    } else {
      // 登录逻辑
      setSubmitting(true);
      try {
        const result = await login(formData.studentId, formData.password);

        if (result.success) {
          resetForm();
          onHide();
          if (onLoginSuccess) onLoginSuccess();
        } else {
          setError(result.message || '登录失败');
        }
      } catch {
        setError('网络错误，请确认后端服务已启动');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="md" backdrop="static">
      <Modal.Body style={{ padding: '40px 32px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', marginBottom: '16px'
          }}>
            <FaLightbulb size={32} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
            {isRegisterMode ? '注册新账号' : '登录到我的项目'}
          </h2>
          <p style={{ color: '#8c8c8c', fontSize: '14px', margin: 0 }}>
            {isRegisterMode ? '创建新账号以使用项目管理系统' : '请输入您的信息以访问项目管理系统'}
          </p>
        </div>

        {regSuccess && (
          <Alert variant="success" style={{ borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCheckCircle /> {regSuccess}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" style={{ borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </Alert>
        )}

        {!regSuccess && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                <FaIdCard style={{ marginRight: '8px', color: '#1890ff' }} />学号
              </Form.Label>
              <Form.Control
                type="text" name="studentId" value={formData.studentId}
                onChange={handleInputChange} placeholder="请输入学号"
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d9d9d9', fontSize: '14px' }}
              />
            </Form.Group>

            {isRegisterMode && (
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  <FaUser style={{ marginRight: '8px', color: '#52c41a' }} />真实姓名
                </Form.Label>
                <Form.Control
                  type="text" name="name" value={formData.name}
                  onChange={handleInputChange} placeholder="请输入真实姓名"
                  style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d9d9d9', fontSize: '14px' }}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                <FaLock style={{ marginRight: '8px', color: '#722ed1' }} />密码
              </Form.Label>
              <Form.Control
                type="password" name="password" value={formData.password}
                onChange={handleInputChange} placeholder={isRegisterMode ? '请输入密码（至少6位）' : '请输入密码'}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d9d9d9', fontSize: '14px' }}
              />
            </Form.Group>

            {isRegisterMode && (
              <Form.Group className="mb-4">
                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  <FaLock style={{ marginRight: '8px', color: '#722ed1' }} />确认密码
                </Form.Label>
                <Form.Control
                  type="password" name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleInputChange} placeholder="请再次输入密码"
                  style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #d9d9d9', fontSize: '14px' }}
                />
              </Form.Group>
            )}

            <div className="d-flex gap-2">
              <CommonButton
                type="button" variant="secondary" onClick={handleClose}
                style={{ flex: 1, padding: '12px 24px', fontSize: '15px', borderRadius: '10px' }}
              >
                取消
              </CommonButton>
              <CommonButton
                type="submit" variant="primary" disabled={submitting}
                style={{
                  flex: 2, padding: '12px 24px', fontSize: '15px', fontWeight: '600', borderRadius: '10px',
                  background: submitting ? '#ccc' : 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  border: 'none'
                }}
              >
                {submitting ? (
                  <><Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />处理中...</>
                ) : isRegisterMode ? (
                  <><FaUserPlus style={{ marginRight: '8px' }} />注册</>
                ) : (
                  <><FaSignInAlt style={{ marginRight: '8px' }} />登录</>
                )}
              </CommonButton>
            </div>
          </Form>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#8c8c8c' }}>
          {isRegisterMode ? '已有账号？' : '没有账号？'}
          <span
            onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); setRegSuccess(''); }}
            style={{ color: '#1890ff', cursor: 'pointer', marginLeft: '4px', fontWeight: '500' }}
          >
            {isRegisterMode ? '去登录' : '注册新账号'}
          </span>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
