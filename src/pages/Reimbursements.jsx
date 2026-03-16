// Reimbursements Page - Visual Roadmap for Reimbursement Process
// 报销流程可视化指南页面
import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Alert, Badge } from 'react-bootstrap';
import {
  FaReceipt,
  FaIdCard,
  FaSignature,
  FaMoneyBillWave,
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaArrowRight,
  FaUserTie,
  FaUsers,
  FaCloudUploadAlt,
  FaInfoCircle
} from 'react-icons/fa';
import CommonButton from '../components/CommonButton';
import { showToast } from '../components/Toast';

const Reimbursements = () => {
  // 当前步骤
  const [currentStep, setCurrentStep] = useState(0);
  // 是否是队长
  const [isCaptain, setIsCaptain] = useState(true);
  // 报销类型
  const [reimbursementType, setReimbursementType] = useState(null);

  // 流程步骤配置
  const steps = [
    {
      id: 1,
      icon: '🧾',
      title: '票据准备',
      subtitle: 'Bill Preparation',
      color: '#1890ff',
      description: '整理所有报销所需的票据材料'
    },
    {
      id: 2,
      icon: '🆔',
      title: '身份核验',
      subtitle: 'Identity Check',
      color: '#52c41a',
      description: '确认报销人身份及所需材料'
    },
    {
      id: 3,
      icon: '✍️',
      title: '线下跑腿',
      subtitle: 'Offline Approval',
      color: '#faad14',
      description: '打印材料并完成线下签字审批'
    },
    {
      id: 4,
      icon: '💰',
      title: '等待打款',
      subtitle: 'Payment',
      color: '#722ed1',
      description: '等待财务处理并接收款项'
    }
  ];

  // 票据清单
  const billChecklist = [
    {
      name: '正规发票',
      required: true,
      note: '抬头必须为：广东工业大学',
      icon: <FaReceipt />
    },
    {
      name: '出入库单',
      required: false,
      note: '购买硬件/材料时必须提供',
      icon: <FaFileAlt />
    },
    {
      name: '报销明细表',
      required: true,
      note: '详细列出每项支出',
      icon: <FaFileAlt />
    }
  ];

  // 下载模板
  const handleDownloadTemplate = (templateName) => {
    showToast('info', `正在下载 ${templateName}...`);
    // 模拟下载
    setTimeout(() => {
      showToast('success', `${templateName} 下载完成`);
    }, 1000);
  };

  return (
    <Container fluid className="p-4 page-transition" style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      {/* Page Header */}
      <div className="mb-4 animate-fade-in-up">
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
          💰 经费报销指南
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
          按照以下流程准备材料，确保报销顺利进行
        </p>
      </div>

      {/* Process Map - Metro Style */}
      <Card
        className="mb-4 animate-fade-in-up"
        style={{
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        <Card.Body className="p-4">
          <h5 style={{ fontWeight: '600', marginBottom: '24px', color: '#333' }}>
            📍 报销流程地图
          </h5>

          {/* Step Timeline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 20px' }}>
            {/* Connection Line */}
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '80px',
              right: '80px',
              height: '4px',
              background: 'linear-gradient(90deg, #1890ff, #52c41a, #faad14, #722ed1)',
              borderRadius: '2px',
              zIndex: 0
            }} />

            {steps.map((step, index) => (
              <div
                key={step.id}
                onClick={() => setCurrentStep(index)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  zIndex: 1,
                  transition: 'transform 0.2s',
                  transform: currentStep === index ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {/* Step Circle */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: currentStep === index ? step.color : '#fff',
                  border: `3px solid ${step.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: currentStep === index ? `0 4px 12px ${step.color}40` : '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s'
                }}>
                  {step.icon}
                </div>

                {/* Step Info */}
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: currentStep === index ? step.color : '#333'
                  }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                    {step.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Step Content */}
      <Row>
        <Col lg={8}>
          {/* Step 1: 票据准备 */}
          {currentStep === 0 && (
            <Card
              className="mb-4 animate-fade-in-up"
              style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <Card.Body className="p-4">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px', marginRight: '12px' }}>🧾</span>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: '600' }}>Step 1: 整理票据</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8c8c8c' }}>
                      准备以下材料，确保票据合规
                    </p>
                  </div>
                </div>

                {/* Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {billChecklist.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e8e8e8',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#e6f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1890ff'
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</span>
                          {item.required ? (
                            <Badge bg="danger" style={{ fontSize: '10px' }}>必需</Badge>
                          ) : (
                            <Badge bg="secondary" style={{ fontSize: '10px' }}>视情况</Badge>
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                          {item.note}
                        </p>
                      </div>
                      <FaCheckCircle style={{ color: '#52c41a', fontSize: '18px' }} />
                    </div>
                  ))}
                </div>

                {/* Important Notice */}
                <Alert
                  variant="info"
                  style={{
                    marginTop: '20px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#e6f7ff'
                  }}
                >
                  <FaInfoCircle style={{ marginRight: '8px' }} />
                  <strong>发票抬头要求：</strong>必须开具为「广东工业大学」，否则无法报销！
                </Alert>

                <div className="d-flex justify-content-end mt-3">
                  <CommonButton
                    variant="primary"
                    onClick={() => setCurrentStep(1)}
                    style={{ padding: '10px 24px' }}
                  >
                    下一步 <FaArrowRight style={{ marginLeft: '8px' }} />
                  </CommonButton>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Step 2: 身份核验 */}
          {currentStep === 1 && (
            <Card
              className="mb-4 animate-fade-in-up"
              style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <Card.Body className="p-4">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px', marginRight: '12px' }}>🆔</span>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: '600' }}>Step 2: 身份确认</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8c8c8c' }}>
                      确认你的身份以准备相应材料
                    </p>
                  </div>
                </div>

                {/* Captain Check */}
                <Alert
                  variant="warning"
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #faad14',
                    backgroundColor: '#fffbe6',
                    marginBottom: '20px'
                  }}
                >
                  <FaExclamationTriangle style={{ marginRight: '8px', color: '#faad14' }} />
                  <strong>重要提问：你是队长吗？</strong>
                </Alert>

                {/* Role Selection */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div
                    onClick={() => setIsCaptain(true)}
                    style={{
                      flex: 1,
                      padding: '20px',
                      borderRadius: '12px',
                      border: isCaptain ? '2px solid #52c41a' : '2px solid #e8e8e8',
                      backgroundColor: isCaptain ? '#f6ffed' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaUserTie size={32} style={{ color: isCaptain ? '#52c41a' : '#8c8c8c', marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600', color: isCaptain ? '#52c41a' : '#333' }}>
                      我是队长
                    </div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      项目负责人本人
                    </div>
                  </div>

                  <div
                    onClick={() => setIsCaptain(false)}
                    style={{
                      flex: 1,
                      padding: '20px',
                      borderRadius: '12px',
                      border: !isCaptain ? '2px solid #1890ff' : '2px solid #e8e8e8',
                      backgroundColor: !isCaptain ? '#e6f7ff' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaUsers size={32} style={{ color: !isCaptain ? '#1890ff' : '#8c8c8c', marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600', color: !isCaptain ? '#1890ff' : '#333' }}>
                      我是代办人
                    </div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      队员代替队长报销
                    </div>
                  </div>
                </div>

                {/* Conditional Content */}
                {isCaptain ? (
                  <Alert
                    variant="success"
                    style={{
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#f6ffed'
                    }}
                  >
                    <FaCheckCircle style={{ marginRight: '8px', color: '#52c41a' }} />
                    <strong>无需额外材料！</strong>
                    <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
                      作为队长，你只需准备基本的票据材料即可进行报销。
                    </p>
                  </Alert>
                ) : (
                  <div>
                    <Alert
                      variant="danger"
                      style={{
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#fff2f0'
                      }}
                    >
                      <FaExclamationTriangle style={{ marginRight: '8px', color: '#ff4d4f' }} />
                      <strong>需要额外材料！</strong>
                      <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
                        作为代办人，你需要准备以下授权材料：
                      </p>
                    </Alert>

                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '12px',
                      marginTop: '16px'
                    }}>
                      <h6 style={{ fontWeight: '600', marginBottom: '12px' }}>
                        📋 授权书要求
                      </h6>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#666' }}>
                        <li>队长签名的授权委托书</li>
                        <li>队长身份证正反面复印件</li>
                        <li>情况说明（说明为何由代办人报销）</li>
                      </ul>

                      <CommonButton
                        variant="secondary"
                        onClick={() => handleDownloadTemplate('授权书模板')}
                        style={{ marginTop: '12px' }}
                      >
                        <FaDownload style={{ marginRight: '8px' }} />
                        下载授权书模板
                      </CommonButton>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-4">
                  <CommonButton
                    variant="secondary"
                    onClick={() => setCurrentStep(0)}
                  >
                    上一步
                  </CommonButton>
                  <CommonButton
                    variant="primary"
                    onClick={() => setCurrentStep(2)}
                  >
                    下一步 <FaArrowRight style={{ marginLeft: '8px' }} />
                  </CommonButton>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Step 3: 线下跑腿 */}
          {currentStep === 2 && (
            <Card
              className="mb-4 animate-fade-in-up"
              style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <Card.Body className="p-4">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px', marginRight: '12px' }}>✍️</span>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: '600' }}>Step 3: 线下签字</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8c8c8c' }}>
                      完成线下审批流程
                    </p>
                  </div>
                </div>

                {/* Offline Flow */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Step 3.1 */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f0f7ff',
                    borderRadius: '12px',
                    borderLeft: '4px solid #1890ff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Badge bg="primary" style={{ fontSize: '12px' }}>3.1</Badge>
                      <span style={{ fontWeight: '600' }}>打印材料</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      将所有电子材料打印出来，包括报销明细表、发票复印件等
                    </p>
                  </div>

                  <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                    <FaArrowRight style={{ transform: 'rotate(90deg)' }} />
                  </div>

                  {/* Step 3.2 */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#fff7e6',
                    borderRadius: '12px',
                    borderLeft: '4px solid #faad14'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Badge bg="warning" text="dark" style={{ fontSize: '12px' }}>3.2</Badge>
                      <span style={{ fontWeight: '600' }}>双创学院审核</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      携带材料前往<strong>双创学院</strong>进行初审，获得签字确认
                    </p>
                  </div>

                  <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                    <FaArrowRight style={{ transform: 'rotate(90deg)' }} />
                  </div>

                  {/* Step 3.3 */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f6ffed',
                    borderRadius: '12px',
                    borderLeft: '4px solid #52c41a'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Badge bg="success" style={{ fontSize: '12px' }}>3.3</Badge>
                      <span style={{ fontWeight: '600' }}>财务处提交</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      审核通过后，前往<strong>行政楼4楼财务处</strong>提交最终材料
                    </p>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <CommonButton
                    variant="secondary"
                    onClick={() => setCurrentStep(1)}
                  >
                    上一步
                  </CommonButton>
                  <CommonButton
                    variant="primary"
                    onClick={() => setCurrentStep(3)}
                  >
                    下一步 <FaArrowRight style={{ marginLeft: '8px' }} />
                  </CommonButton>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Step 4: 等待打款 */}
          {currentStep === 3 && (
            <Card
              className="mb-4 animate-fade-in-up"
              style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}
            >
              <Card.Body className="p-4">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px', marginRight: '12px' }}>💰</span>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: '600' }}>Step 4: 等待打款</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8c8c8c' }}>
                      材料提交后等待财务处理
                    </p>
                  </div>
                </div>

                {/* Important Warning */}
                <Alert
                  variant="danger"
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #ff4d4f',
                    backgroundColor: '#fff2f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <FaExclamationTriangle size={24} style={{ color: '#ff4d4f', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '16px' }}>⚠️ 重要提醒</strong>
                      <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                        报销款项将打入<strong style={{ color: '#ff4d4f' }}>领用人个人账户</strong>，
                        请收到款项后<strong style={{ color: '#ff4d4f' }}>及时转回项目公账</strong>！
                      </p>
                    </div>
                  </div>
                </Alert>

                {/* Timeline */}
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  marginTop: '20px'
                }}>
                  <h6 style={{ fontWeight: '600', marginBottom: '16px' }}>
                    ⏱️ 预计时间线
                  </h6>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#1890ff'
                      }} />
                      <span style={{ fontSize: '14px' }}>提交材料后 3-5 个工作日：财务审核</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#52c41a'
                      }} />
                      <span style={{ fontSize: '14px' }}>审核通过后 5-10 个工作日：款项到账</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <CommonButton
                    variant="secondary"
                    onClick={() => setCurrentStep(2)}
                  >
                    上一步
                  </CommonButton>
                  <CommonButton
                    variant="primary"
                    onClick={() => showToast('success', '恭喜你完成了报销流程学习！')}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    <FaCheckCircle style={{ marginRight: '8px' }} />
                    完成
                  </CommonButton>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Right Sidebar - Templates & Quick Actions */}
        <Col lg={4}>
          {/* Download Templates */}
          <Card
            className="mb-4 animate-fade-in-up"
            style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              animationDelay: '0.1s'
            }}
          >
            <Card.Body className="p-4">
              <h6 style={{ fontWeight: '600', marginBottom: '16px' }}>
                📥 模板下载
              </h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <CommonButton
                  variant="secondary"
                  onClick={() => handleDownloadTemplate('出入库单模板')}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <FaDownload style={{ marginRight: '8px' }} />
                  出入库单模板
                </CommonButton>
                <CommonButton
                  variant="secondary"
                  onClick={() => handleDownloadTemplate('报销明细表模板')}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <FaDownload style={{ marginRight: '8px' }} />
                  报销明细表模板
                </CommonButton>
                <CommonButton
                  variant="secondary"
                  onClick={() => handleDownloadTemplate('授权书模板')}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <FaDownload style={{ marginRight: '8px' }} />
                  授权书模板
                </CommonButton>
              </div>
            </Card.Body>
          </Card>

          {/* Reimbursement Types */}
          <Card
            className="mb-4 animate-fade-in-up"
            style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              animationDelay: '0.2s'
            }}
          >
            <Card.Body className="p-4">
              <h6 style={{ fontWeight: '600', marginBottom: '16px' }}>
                📂 报销类型
              </h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: '材料费', icon: '🔧', desc: '硬件、耗材等' },
                  { name: '差旅费', icon: '✈️', desc: '交通、住宿等' },
                  { name: '会议费', icon: '🎤', desc: '会议注册费等' },
                  { name: '其他费用', icon: '📦', desc: '其他合规支出' }
                ].map((type, index) => (
                  <div
                    key={index}
                    onClick={() => setReimbursementType(type.name)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: reimbursementType === type.name ? '#e6f7ff' : '#f8f9fa',
                      border: reimbursementType === type.name ? '1px solid #1890ff' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{type.icon}</span>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{type.name}</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{type.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Quick Tips */}
          <Card
            className="animate-fade-in-up"
            style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              animationDelay: '0.3s'
            }}
          >
            <Card.Body className="p-4">
              <h6 style={{ fontWeight: '600', marginBottom: '16px' }}>
                💡 温馨提示
              </h6>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
                <li style={{ marginBottom: '8px' }}>发票必须在有效期内（一般为开票后6个月）</li>
                <li style={{ marginBottom: '8px' }}>单张发票金额超过500元需提供明细清单</li>
                <li style={{ marginBottom: '8px' }}>报销材料请保留复印件备查</li>
                <li>如有疑问请联系双创学院老师</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reimbursements;
