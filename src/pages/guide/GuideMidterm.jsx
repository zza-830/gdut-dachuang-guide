// Enhanced for full process flow - Midterm Page (中期填报)
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const GuideMidterm = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [progressReport, setProgressReport] = useState('');
  const [fundingDetails, setFundingDetails] = useState('');
  const [checklist, setChecklist] = useState({
    midtermReport: false,
    proof: false,
    funding: false,
    photos: false
  });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleChecklistChange = (key) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const handleSubmit = () => {
    const allChecked = Object.values(checklist).every(v => v);
    if (!allChecked) {
      alert('请完成所有检查项后再提交！');
      return;
    }
    alert('中期报告提交成功！\n（练习模式）');
    navigate('/guide/conclusion');
  };

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
          中期填报
        </h2>
        <p style={{ fontSize: '16px', color: '#6c757d' }}>
          提交项目中期检查报告和相关材料
        </p>
      </div>

      <Row className="g-4">
        {/* Upload Section */}
        <Col md={6}>
          <Card className="card-modern">
            <Card.Body>
              <h4 className="mb-4" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                证明材料上传
              </h4>
              <Form.Label style={{ fontWeight: '500' }}>上传文件</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <Form.Text className="text-muted">
                可上传多个文件（PDF, DOC, DOCX, JPG, PNG）
              </Form.Text>
              {files.length > 0 && (
                <Alert variant="info" className="mt-3">
                  已选择 {files.length} 个文件
                  <ul className="mb-0 mt-2">
                    {files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Progress Report */}
        <Col md={6}>
          <Card className="card-modern">
            <Card.Body>
              <h4 className="mb-4" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                进度报告
              </h4>
              <Form.Label style={{ fontWeight: '500' }}>项目进展情况 *</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                placeholder="详细描述项目目前的进展情况、已完成的工作、遇到的问题和解决方案..."
                value={progressReport}
                onChange={(e) => setProgressReport(e.target.value)}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Funding Details */}
        <Col md={6}>
          <Card className="card-modern">
            <Card.Body>
              <h4 className="mb-4" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                经费使用情况
              </h4>
              <Form.Label style={{ fontWeight: '500' }}>经费使用报告 *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="填写经费使用情况、支出明细和剩余经费..."
                value={fundingDetails}
                onChange={(e) => setFundingDetails(e.target.value)}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Checklist */}
        <Col md={6}>
          <Card className="card-modern">
            <Card.Body>
              <h4 className="mb-4" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                检查清单
              </h4>
              <div className="d-flex flex-column gap-3">
                <Form.Check
                  type="checkbox"
                  label="中期报告已填写"
                  checked={checklist.midtermReport}
                  onChange={() => handleChecklistChange('midtermReport')}
                  style={{ fontSize: '16px' }}
                />
                <Form.Check
                  type="checkbox"
                  label="证明材料已上传"
                  checked={checklist.proof}
                  onChange={() => handleChecklistChange('proof')}
                  style={{ fontSize: '16px' }}
                />
                <Form.Check
                  type="checkbox"
                  label="经费使用报告已填写"
                  checked={checklist.funding}
                  onChange={() => handleChecklistChange('funding')}
                  style={{ fontSize: '16px' }}
                />
                <Form.Check
                  type="checkbox"
                  label="项目照片已上传"
                  checked={checklist.photos}
                  onChange={() => handleChecklistChange('photos')}
                  style={{ fontSize: '16px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/guide/application')}
          className="btn-modern"
        >
          ← 返回申报
        </Button>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="btn-modern"
            disabled={!Object.values(checklist).every(v => v) || !progressReport || !fundingDetails}
          >
            提交中期报告
          </Button>
          <Button
            variant="success"
            onClick={() => navigate('/guide/conclusion')}
            className="btn-modern"
          >
            下一步：结题填报 →
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default GuideMidterm;











