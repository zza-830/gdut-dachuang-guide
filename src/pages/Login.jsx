import React, { useState, useEffect } from 'react';
import { Form, Card, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaStar, FaIdCard, FaLock, FaSignInAlt, FaUserPlus, FaUser, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import CommonButton from '../components/CommonButton';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  // 登录表单
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 注册弹窗
  const [showRegister, setShowRegister] = useState(false);
  const [regData, setRegData] = useState({ studentId: '', name: '', password: '', confirmPassword: '' });
  const [regError, setRegError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');

  // 用户状态变化时跳转（包括登录成功后 user 从 null 变为有值）
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // 加载记住的凭据
  useEffect(() => {
    const saved = localStorage.getItem('remembered_credentials');
    if (saved) {
      try {
        const { studentId, password } = JSON.parse(saved);
        setFormData({ studentId, password });
        setRememberMe(true);
      } catch {
        localStorage.removeItem('remembered_credentials');
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.studentId || !formData.password) {
      setError('请输入学号和密码');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(formData.studentId, formData.password);

      if (result.success) {
        // 记住密码
        if (rememberMe) {
          localStorage.setItem('remembered_credentials', JSON.stringify({
            studentId: formData.studentId,
            password: formData.password
          }));
        } else {
          localStorage.removeItem('remembered_credentials');
        }
        // 不在这里 navigate，由 useEffect 监听 user 变化后自动跳转
      } else {
        setError(result.message || '学号或密码错误，请重试');
      }
    } catch {
      setError('网络错误，请确认后端服务已启动');
    } finally {
      setSubmitting(false);
    }
  };

  // 注册相关
  const handleRegInputChange = (e) => {
    const { name, value } = e.target;
    setRegData(prev => ({ ...prev, [name]: value }));
    if (regError) setRegError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regData.studentId || !regData.password || !regData.name) {
      setRegError('请填写所有必填项');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setRegError('两次输入的密码不一致');
      return;
    }
    if (regData.password.length < 6) {
      setRegError('密码长度至少为6位');
      return;
    }

    setRegSubmitting(true);
    try {
      const result = await register({
        studentId: regData.studentId,
        password: regData.password,
        name: regData.name
      });

      if (result.success) {
        setRegSuccess('注册成功！请使用新账号登录');
        // 自动填充登录表单
        setFormData({ studentId: regData.studentId, password: regData.password });
        // 2秒后关闭弹窗
        setTimeout(() => {
          setShowRegister(false);
          setRegSuccess('');
          setRegData({ studentId: '', name: '', password: '', confirmPassword: '' });
        }, 2000);
      } else {
        setRegError(result.message || '注册失败');
      }
    } catch {
      setRegError('网络错误，请确认后端服务已启动');
    } finally {
      setRegSubmitting(false);
    }
  };

  const openRegisterModal = () => {
    setRegData({ studentId: '', name: '', password: '', confirmPassword: '' });
    setRegError('');
    setRegSuccess('');
    setShowRegister(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f0f4f8' }}>
      {/* Left Panel - Branding */}
      <div
        className="d-none d-lg-flex"
        style={{
          width: '45%',
          background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />

        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(24, 144, 255, 0.3)'
            }}>
              <FaLightbulb size={40} style={{ color: '#fff' }} />
            </div>
            <FaStar size={24} style={{ color: '#FFD700', position: 'absolute', top: '-8px', right: 'calc(50% - 60px)' }} />
          </div>

          <h1 style={{ color: '#fff', fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>GDUT 大创指南</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', marginBottom: '48px', lineHeight: '1.6' }}>创新创业项目管理平台</p>

          <div style={{ textAlign: 'left', maxWidth: '320px' }}>
            {[
              { icon: '🚀', text: 'AI 智能填报，一键生成报告' },
              { icon: '📊', text: '项目全流程管理与追踪' },
              { icon: '👥', text: '团队协作，实时同步' },
              { icon: '📁', text: '资料归档，安全存储' }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex', alignItems: 'center', marginBottom: '16px',
                padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px', backdropFilter: 'blur(10px)'
              }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>{feature.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
          © 2025 广东工业大学 · 创新创业学院
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <Card style={{ width: '100%', maxWidth: '420px', border: 'none', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <Card.Body style={{ padding: '48px 40px' }}>
            {/* Mobile Logo */}
            <div className="d-lg-none" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '60px', height: '60px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', marginBottom: '16px'
              }}>
                <FaLightbulb size={28} style={{ color: '#fff' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>GDUT 大创指南</h2>
            </div>

            {/* Form Header */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>欢迎登录</h2>
              <p style={{ color: '#8c8c8c', fontSize: '14px', margin: 0 }}>请输入您的信息以访问项目管理系统</p>
            </div>

            {error && (
              <Alert variant="danger" style={{ borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleLogin}>
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

              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  <FaLock style={{ marginRight: '8px', color: '#722ed1' }} />密码
                </Form.Label>
                <div style={{ position: 'relative' }}>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleInputChange} placeholder="请输入密码"
                    style={{ padding: '12px 16px', paddingRight: '44px', borderRadius: '10px', border: '1px solid #d9d9d9', fontSize: '14px' }}
                  />
                  <span
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      cursor: 'pointer', color: '#8c8c8c', fontSize: '16px', display: 'flex', alignItems: 'center'
                    }}
                    title={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Form.Group>

              {/* 记住密码 */}
              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  id="rememberMe"
                  label="记住密码"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ fontSize: '14px', color: '#666' }}
                />
              </Form.Group>

              <CommonButton
                type="submit" variant="primary" fullWidth disabled={submitting}
                style={{
                  padding: '14px 24px', fontSize: '16px', fontWeight: '600', borderRadius: '12px',
                  background: submitting ? '#ccc' : 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  border: 'none'
                }}
              >
                {submitting ? (
                  <><Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />登录中...</>
                ) : (
                  <><FaSignInAlt style={{ marginRight: '8px' }} />登录</>
                )}
              </CommonButton>
            </Form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#8c8c8c' }}>
              没有账号？
              <span
                onClick={openRegisterModal}
                style={{ color: '#1890ff', cursor: 'pointer', marginLeft: '4px', fontWeight: '500' }}
              >
                注册新账号
              </span>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* 注册弹窗 */}
      <Modal show={showRegister} onHide={() => !regSubmitting && setShowRegister(false)} centered>
        <Modal.Header closeButton style={{ border: 'none', paddingBottom: '0' }}>
          <Modal.Title style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
            <FaUserPlus style={{ marginRight: '10px', color: '#1890ff' }} />注册新账号
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          {regSuccess && (
            <Alert variant="success" style={{ borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle /> {regSuccess}
            </Alert>
          )}
          {regError && (
            <Alert variant="danger" style={{ borderRadius: '10px', fontSize: '14px' }}>
              {regError}
            </Alert>
          )}

          {!regSuccess && (
            <Form onSubmit={handleRegister}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                  <FaIdCard style={{ marginRight: '8px', color: '#1890ff' }} />
                  学号 <span style={{ color: '#ff4d4f' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text" name="studentId" value={regData.studentId}
                  onChange={handleRegInputChange} placeholder="请输入学号"
                  style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '14px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                  <FaUser style={{ marginRight: '8px', color: '#52c41a' }} />
                  真实姓名 <span style={{ color: '#ff4d4f' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text" name="name" value={regData.name}
                  onChange={handleRegInputChange} placeholder="请输入真实姓名"
                  style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '14px' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                  <FaLock style={{ marginRight: '8px', color: '#722ed1' }} />
                  密码 <span style={{ color: '#ff4d4f' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="password" name="password" value={regData.password}
                  onChange={handleRegInputChange} placeholder="请输入密码（至少6位）"
                  style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '14px' }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                  <FaLock style={{ marginRight: '8px', color: '#722ed1' }} />
                  确认密码 <span style={{ color: '#ff4d4f' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="password" name="confirmPassword" value={regData.confirmPassword}
                  onChange={handleRegInputChange} placeholder="请再次输入密码"
                  style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '14px' }}
                />
              </Form.Group>

              <CommonButton
                type="submit" variant="primary" fullWidth disabled={regSubmitting}
                style={{
                  padding: '12px 24px', fontSize: '15px', fontWeight: '600', borderRadius: '12px',
                  background: regSubmitting ? '#ccc' : 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  border: 'none'
                }}
              >
                {regSubmitting ? (
                  <><Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />注册中...</>
                ) : (
                  <><FaUserPlus style={{ marginRight: '8px' }} />注册</>
                )}
              </CommonButton>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Login;
