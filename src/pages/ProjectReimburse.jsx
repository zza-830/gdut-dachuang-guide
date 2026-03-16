// Project Reimbursement Page - Visual Roadmap for Reimbursement Process
// 项目报销申请页面 - 可视化流程指南
import React, { useState } from 'react';
import { Container, Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaReceipt,
  FaClipboardList,
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaArrowRight,
  FaUserTie,
  FaUsers,
  FaInfoCircle
} from 'react-icons/fa';
import CommonButton from '../components/CommonButton';
import { showToast } from '../components/Toast';

const ProjectReimburse = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 当前步骤
  const [currentStep, setCurrentStep] = useState(0);
  // 是否是队长
  const [isCaptain, setIsCaptain] = useState(true);
  // 选中的报销类型
  const [selectedType, setSelectedType] = useState(null);

  // 流程步骤配置
  const steps = [
    { id: 1, icon: '🧾', title: '票据准备', color: '#1890ff' },
    { id: 2, icon: '🆔', title: '身份核验', color: '#52c41a' },
    { id: 3, icon: '✍️', title: '线下签字', color: '#faad14' },
    { id: 4, icon: '💰', title: '等待打款', color: '#722ed1' }
  ];

  // 报销类型
  const reimbursementTypes = [
    { icon: FaFileInvoiceDollar, title: '材料费', desc: '硬件、耗材等', color: '#1890ff' },
    { icon: FaReceipt, title: '差旅费', desc: '交通、住宿等', color: '#52c41a' },
    { icon: FaClipboardList, title: '其他费用', desc: '打印、资料等', color: '#faad14' }
  ];

  // 下载模板
  const handleDownload = (name) => {
    showToast('info', `正在下载 ${name}...`);
    setTimeout(() => showToast('success', `${name} 下载完成`), 1000);
  };

  return (
    <Container fluid className="p-4 page-transition" style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <CommonButton
          variant="link"
          onClick={() => navigate(`/project/${id}`)}
          style={{ padding: 0, marginBottom: '16px', color: '#6c757d', textDecoration: 'none' }}
        >
          <FaArrowLeft style={{ marginRight: '8px' }} />
          返回项目详情
        </CommonButton>

        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
          <FaMoneyBillWave style={{ marginRight: '10px', color: '#52c41a' }} />
          申请报销
        </h1>
        <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
          按照流程准备材料，完成报销申请
        </p>
      </div>

      {/* Process Map - Metro Style */}
      <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Card.Body className="p-4">
          <h6 style={{ fontWeight: '600', marginBottom: '20px', color: '#333' }}>📍 报销流程地图</h6>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
            {/* Connection Line */}
            <div style={{
              position: 'absolute', top: '24px', left: '60px', right: '60px', height: '3px',
              background: 'linear-gradient(90deg, #1890ff, #52c41a, #faad14, #722ed1)', borderRadius: '2px', zIndex: 0
            }} />
            {steps.map((step, index) => (
              <div key={step.id} onClick={() => setCurrentStep(index)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', zIndex: 1,
                transform: currentStep === index ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: currentStep === index ? step.color : '#fff',
                  border: `3px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', boxShadow: currentStep === index ? `0 4px 12px ${step.color}40` : '0 2px 8px rgba(0,0,0,0.1)'
                }}>{step.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: currentStep === index ? step.color : '#333', marginTop: '8px' }}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={8}>
          {/* Step 1: 票据准备 */}
          {currentStep === 0 && (
            <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '28px', marginRight: '12px' }}>🧾</span>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: '600' }}>Step 1: 整理票据</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8c8c8c' }}>准备以下材料</p>
                  </div>
                </div>

                {[
                  { name: '正规发票', note: '抬头：广东工业大学', required: true },
                  { name: '出入库单', note: '购买硬件/材料时必须', required: false },
                  { name: '报销明细表', note: '详细列出每项支出', required: true }
                ].map((item, i) => (
                  <div key={i} style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaFileAlt style={{ color: '#1890ff' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</span>
                      <Badge bg={item.required ? 'danger' : 'secondary'} style={{ marginLeft: '8px', fontSize: '10px' }}>{item.required ? '必需' : '视情况'}</Badge>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>{item.note}</p>
                    </div>
                    <FaCheckCircle style={{ color: '#52c41a' }} />
                  </div>
                ))}

                <Alert variant="info" style={{ marginTop: '16px', borderRadius: '10px', border: 'none', backgroundColor: '#e6f7ff', fontSize: '13px' }}>
                  <FaInfoCircle style={{ marginRight: '8px' }} />
                  <strong>发票抬头：</strong>必须为「广东工业大学」
                </Alert>

                <div className="d-flex justify-content-end mt-3">
                  <CommonButton variant="primary" onClick={() => setCurrentStep(1)}>
                    下一步 <FaArrowRight style={{ marginLeft: '8px' }} />
                  </CommonButton>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Step 2: 身份核验 */}
          {currentStep === 1 && (
            <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '28px', marginRight: '12px' }}>🆔</span>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: '600' }}>Step 2: 身份确认</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8c8c8c' }}>确认你的身份</p>
                  </div>
                </div>

                <Alert variant="warning" style={{ borderRadius: '10px', border: '2px solid #faad14', backgroundColor: '#fffbe6', marginBottom: '16px' }}>
                  <FaExclamationTriangle style={{ marginRight: '8px', color: '#faad14' }} />
                  <strong>重要提问：你是队长吗？</strong>
                </Alert>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <div onClick={() => setIsCaptain(true)} style={{
                    flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                    border: isCaptain ? '2px solid #52c41a' : '2px solid #e8e8e8',
                    backgroundColor: isCaptain ? '#f6ffed' : '#fff'
                  }}>
                    <FaUserTie size={28} style={{ color: isCaptain ? '#52c41a' : '#8c8c8c', marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600', color: isCaptain ? '#52c41a' : '#333' }}>我是队长</div>
                  </div>
                  <div onClick={() => setIsCaptain(false)} style={{
                    flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                    border: !isCaptain ? '2px solid #1890ff' : '2px solid #e8e8e8',
                    backgroundColor: !isCaptain ? '#e6f7ff' : '#fff'
                  }}>
                    <FaUsers size={28} style={{ color: !isCaptain ? '#1890ff' : '#8c8c8c', marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600', color: !isCaptain ? '#1890ff' : '#333' }}>我是代办人</div>
                  </div>
                </div>

                {isCaptain ? (
                  <Alert variant="success" style={{ borderRadius: '10px', border: 'none', backgroundColor: '#f6ffed' }}>
                    <FaCheckCircle style={{ marginRight: '8px', color: '#52c41a' }} />
                    <strong>无需额外材料！</strong>
                  </Alert>
                ) : (
                  <Alert variant="danger" style={{ borderRadius: '10px', border: 'none', backgroundColor: '#fff2f0' }}>
                    <FaExclamationTriangle style={{ marginRight: '8px', color: '#ff4d4f' }} />
                    <strong>需要授权书！</strong>（队长签名 + 身份证复印件 + 情况说明）
                  </Alert>
                )}

                <div className="d-flex justify-content-between mt-3">
                  <CommonButton variant="secondary" onClick={() => setCurrentStep(0)}>上一步</CommonButton>
                  <CommonButton variant="primary" onClick={() => setCurrentStep(2)}>下一步 <FaArrowRight style={{ marginLeft: '8px' }} /></CommonButton>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Step 3: 线下签字 */}
          {currentStep === 2 && (
            <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '28px', marginRight: '12px' }}>✍️</span>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: '600' }}>Step 3: 线下签字</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8c8c8c' }}>完成线下审批</p>
                  </div>
                </div>

                {[
                  { step: '3.1', title: '打印材料', desc: '打印所有电子材料', color: '#1890ff' },
                  { step: '3.2', title: '双创学院审核', desc: '前往双创学院初审签字', color: '#faad14' },
                  { step: '3.3', title: '财务处提交', desc: '行政楼4楼财务处提交', color: '#52c41a' }
                ].map((item, i) => (
                  <div key={i} style={{ padding: '16px', backgroundColor: `${item.color}10`, borderRadius: '10px', borderLeft: `4px solid ${item.color}`, marginBottom: '12px' }}>
                    <Badge bg={i === 0 ? 'primary' : i === 1 ? 'warning' : 'success'} style={{ marginRight: '8px' }}>{item.step}</Badge>
                    <strong>{item.title}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>{item.desc}</p>
                  </div>
                ))}

                <div className="d-flex justify-content-between mt-3">
                  <CommonButton variant="secondary" onClick={() => setCurrentStep(1)}>上一步</CommonButton>
                  <CommonButton variant="primary" onClick={() => setCurrentStep(3)}>下一步 <FaArrowRight style={{ marginLeft: '8px' }} /></CommonButton>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Step 4: 等待打款 */}
          {currentStep === 3 && (
            <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '28px', marginRight: '12px' }}>💰</span>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: '600' }}>Step 4: 等待打款</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8c8c8c' }}>等待财务处理</p>
                  </div>
                </div>

                <Alert variant="danger" style={{ borderRadius: '10px', border: '2px solid #ff4d4f', backgroundColor: '#fff2f0' }}>
                  <FaExclamationTriangle size={20} style={{ color: '#ff4d4f', marginRight: '8px' }} />
                  <strong>⚠️ 重要提醒：</strong>款项将打入<strong style={{ color: '#ff4d4f' }}>个人账户</strong>，收到后请<strong style={{ color: '#ff4d4f' }}>及时转回公账</strong>！
                </Alert>

                <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '10px', marginTop: '16px' }}>
                  <h6 style={{ fontWeight: '600', marginBottom: '12px' }}>⏱️ 预计时间</h6>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>• 财务审核：3-5 工作日</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>• 款项到账：5-10 工作日</p>
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <CommonButton variant="secondary" onClick={() => setCurrentStep(2)}>上一步</CommonButton>
                  <CommonButton variant="primary" onClick={() => showToast('success', '流程学习完成！')} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                    <FaCheckCircle style={{ marginRight: '8px' }} /> 完成
                  </CommonButton>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Right Sidebar */}
        <Col lg={4}>
          {/* 报销类型 */}
          <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Card.Body className="p-4">
              <h6 style={{ fontWeight: '600', marginBottom: '12px' }}>📂 报销类型</h6>
              {reimbursementTypes.map((type, i) => {
                const Icon = type.icon;
                return (
                  <div key={i} onClick={() => setSelectedType(type.title)} style={{
                    padding: '10px', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer',
                    backgroundColor: selectedType === type.title ? '#e6f7ff' : '#f8f9fa',
                    border: selectedType === type.title ? '1px solid #1890ff' : '1px solid transparent',
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <Icon style={{ color: type.color }} />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{type.title}</div>
                      <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{type.desc}</div>
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>

          {/* 模板下载 */}
          <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Card.Body className="p-4">
              <h6 style={{ fontWeight: '600', marginBottom: '12px' }}>📥 模板下载</h6>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { name: '出库单模板', href: '/templates/outbound_template.docx' },
                  { name: '入库单模板', href: '/templates/inbound_template.docx' },
                  { name: '报销明细表', href: '/templates/reimbursement_detail.docx' },
                  { name: '授权书模板', href: '/templates/authorization_letter.docx' }
                ].map((tpl, i) => (
                  <a key={i} href={tpl.href} download style={{ textDecoration: 'none' }}>
                    <CommonButton variant="secondary" onClick={() => handleDownload(tpl.name)} style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}>
                      <FaDownload style={{ marginRight: '6px', flexShrink: 0 }} /> {tpl.name}
                    </CommonButton>
                  </a>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* 温馨提示 */}
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Card.Body className="p-4">
              <h6 style={{ fontWeight: '600', marginBottom: '12px' }}>💡 温馨提示</h6>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#666' }}>
                <li style={{ marginBottom: '6px' }}>发票有效期：开票后6个月</li>
                <li style={{ marginBottom: '6px' }}>超500元需明细清单</li>
                <li>保留材料复印件备查</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectReimburse;
