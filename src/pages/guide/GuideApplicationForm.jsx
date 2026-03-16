// 申报书填写页面
import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';

const GuideApplicationForm = () => {
  const handleDownloadTemplate = () => {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = '/files/templates/application-form-template.docx';
    link.download = '申报书模板.docx';
    // 如果文件不存在，尝试 .doc 格式
    link.onerror = () => {
      link.href = '/files/templates/application-form-template.doc';
      link.download = '申报书模板.doc';
      link.click();
    };
    link.click();
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#F0F4F8', minHeight: 'calc(100vh - 60px)' }}>
      <Row className="g-4 justify-content-center">
        {/* Main Content */}
        <Col xs={12} md={10} lg={8}>
          <Card className="card-modern mb-4">
            <Card.Body style={{ padding: '30px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#001F3F', 
                marginBottom: '16px',
                fontFamily: 'sans-serif'
              }}>
                申报书填写
              </h2>
              <p style={{ 
                fontSize: '16px', 
                color: '#666666',
                marginBottom: '16px',
                lineHeight: '1.5',
                fontFamily: 'sans-serif'
              }}>
                使用模板填写基本情况等。
              </p>

              <div className="mb-4">
                <h5 style={{ color: '#001F3F', fontWeight: '600', marginBottom: '12px' }}>填写内容：</h5>
                <ul style={{ 
                  fontSize: '16px', 
                  color: '#666666',
                  lineHeight: '1.8',
                  fontFamily: 'sans-serif',
                  paddingLeft: '20px'
                }}>
                  <li>基本情况：项目名称、负责人、团队成员信息</li>
                  <li>立项依据：项目背景、研究意义、创新点</li>
                  <li>研究内容：研究目标、研究内容、技术路线</li>
                  <li>预期成果：预期达到的目标、成果形式</li>
                  <li>经费预算：各项费用预算明细</li>
                  <li>时间安排：项目进度计划</li>
                </ul>
              </div>

              <div className="mb-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDownloadTemplate}
                  style={{ backgroundColor: '#00BFFF', borderColor: '#00BFFF' }}
                >
                  <FaDownload className="me-2" />下载模板
                </Button>
              </div>

              <Alert variant="warning" style={{ borderLeft: '4px solid #FF9800' }}>
                <strong>注意事项：</strong>
                <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                  <li>请仔细阅读模板说明，按要求填写各项内容</li>
                  <li>确保信息真实准确，不得虚假填报</li>
                  <li>提交前请检查格式和内容完整性</li>
                  <li>建议提前准备相关材料，避免临时填写</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GuideApplicationForm;


