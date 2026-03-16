// AI Smart Filling Selection Page - 3 Report Types
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft,
  FaRobot,
  FaFileAlt,
  FaClipboardCheck,
  FaFlagCheckered,
  FaChevronRight
} from 'react-icons/fa';
import CommonButton from '../components/CommonButton';

const ProjectEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 三个报告类型
  const reportTypes = [
    {
      key: 'application',
      title: '申报书',
      subtitle: '项目申报材料',
      description: '填写项目基本信息、研究内容、技术路线、预期成果等申报材料',
      icon: FaFileAlt,
      color: '#1890ff',
      bgColor: '#e6f7ff',
      borderColor: '#91d5ff',
      status: '可填写'
    },
    {
      key: 'midterm',
      title: '中期检查报告',
      subtitle: '项目中期汇报',
      description: '汇报项目进展、已取得成果、经费使用情况、存在问题及解决方案',
      icon: FaClipboardCheck,
      color: '#52c41a',
      bgColor: '#f6ffed',
      borderColor: '#b7eb8f',
      status: '可填写'
    },
    {
      key: 'conclusion',
      title: '结题填报',
      subtitle: '项目结题材料',
      description: '总结项目成果、完成情况、经费决算、成果展示及后续计划',
      icon: FaFlagCheckered,
      color: '#722ed1',
      bgColor: '#f9f0ff',
      borderColor: '#d3adf7',
      status: '可填写'
    }
  ];

  // 点击进入具体报告填写页面
  const handleSelectReport = (reportKey) => {
    navigate(`/project/${id}/edit/${reportKey}`);
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <CommonButton
          variant="link"
          onClick={() => navigate(`/project/${id}`)}
          style={{ padding: 0, marginBottom: '12px', color: '#6c757d', textDecoration: 'none' }}
        >
          <FaArrowLeft style={{ marginRight: '8px' }} />
          返回项目详情
        </CommonButton>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
          <FaRobot style={{ marginRight: '10px', color: '#722ed1' }} />
          AI 智能填报
        </h1>
        <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
          选择需要填写的报告类型，AI将辅助您完成填报
        </p>
      </div>

      {/* 3 Report Type Cards - Vertical Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card 
              key={report.key}
              onClick={() => handleSelectReport(report.key)}
              style={{ 
                border: `2px solid ${report.borderColor}`,
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = report.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = report.borderColor;
              }}
            >
              <Card.Body className="p-0">
                <Row className="g-0 align-items-center">
                  {/* Left: Icon */}
                  <Col xs="auto">
                    <div style={{
                      width: '100px',
                      height: '120px',
                      backgroundColor: report.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComponent size={40} style={{ color: report.color }} />
                    </div>
                  </Col>
                  
                  {/* Middle: Content */}
                  <Col style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        color: '#333', 
                        margin: 0,
                        marginRight: '12px'
                      }}>
                        {report.title}
                      </h4>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 10px',
                        borderRadius: '10px',
                        backgroundColor: report.bgColor,
                        color: report.color,
                        fontWeight: '500'
                      }}>
                        {report.status}
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#8c8c8c', 
                      marginBottom: '8px'
                    }}>
                      {report.subtitle}
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666', 
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {report.description}
                    </p>
                  </Col>
                  
                  {/* Right: Arrow */}
                  <Col xs="auto" style={{ paddingRight: '24px' }}>
                    <FaChevronRight size={20} style={{ color: '#bfbfbf' }} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="mt-4" style={{ 
        border: 'none', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        maxWidth: '800px'
      }}>
        <Card.Body className="p-4">
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
            <FaRobot style={{ marginRight: '8px', color: '#722ed1' }} />
            AI 智能填报说明
          </h5>
          <ul style={{ fontSize: '14px', color: '#6c757d', paddingLeft: '20px', margin: 0 }}>
            <li style={{ marginBottom: '6px' }}>每个填写区域都配有独立的 AI 润色按钮</li>
            <li style={{ marginBottom: '6px' }}>AI 会根据您输入的内容进行优化和补充</li>
            <li style={{ marginBottom: '6px' }}>填写完成后可随时保存，支持多次编辑</li>
            <li>建议先填写基本内容，再使用 AI 润色功能</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProjectEdit;
