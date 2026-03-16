import React from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';

const Resources = () => {
  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">资源下载</h2>

      <Card className="card-modern">
        <Card.Body style={{ padding: '40px', textAlign: 'center' }}>
          <FaInfoCircle 
            style={{ 
              fontSize: '64px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }} 
          />
          <h4 style={{ color: '#001F3F', marginBottom: '16px' }}>
            资源下载功能
          </h4>
          <p style={{ color: '#666666', fontSize: '16px', marginBottom: '24px' }}>
            模板文件可在以下页面下载：
          </p>
          
          <Alert variant="info" style={{ textAlign: 'left', marginTop: '20px' }}>
            <strong>📄 申报书模板：</strong>
            <p className="mb-0">请前往 <strong>大创指南 → 申报书填写</strong> 页面下载</p>
          </Alert>

          <Alert variant="info" style={{ textAlign: 'left', marginTop: '20px' }}>
            <strong>💰 报销相关文件：</strong>
            <p className="mb-0">请前往 <strong>经费报销</strong> 页面下载各类表单和附件</p>
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Resources;




